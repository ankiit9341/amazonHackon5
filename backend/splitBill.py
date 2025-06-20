# splitBill.py

from flask import Blueprint, request, jsonify
from bson import ObjectId
from pymongo import MongoClient
from dotenv import load_dotenv
from datetime import datetime
import os

load_dotenv()
MONGO_URI = os.getenv("MONGO_URI")

split_bp = Blueprint('split', __name__)
client = MongoClient(MONGO_URI)
db = client["powercardDB"]

users = db["users"]
expenses = db["split_expenses"]
requests = db["split_requests"]

def str_id(obj):
    obj["_id"] = str(obj["_id"])
    return obj

# ------------------ ROUTES ------------------ #

# ✅ Create user
@split_bp.route('/users', methods=['POST'])
def create_user():
    data = request.json
    user_id = data.get("userId")
    name = data.get("name")
    email = data.get("email")
    contact = data.get("contact")
    balance = data.get("balance", 0)
    cards = data.get("cards", [])

    if not all([user_id, name, email]):
        return jsonify({"error": "Missing required user fields"}), 400

    if users.find_one({"userId": user_id}):
        return jsonify({"error": "User already exists"}), 400

    result = users.insert_one({
        "userId": user_id,
        "name": name,
        "email": email,
        "contact": contact,
        "balance": balance,
        "cards": cards
    })

    return jsonify({"id": str(result.inserted_id)}), 201

# ✅ Submit full split bill
@split_bp.route('/expenses', methods=['POST'])
def create_expense_and_requests():
    data = request.json
    title = data.get("title")
    description = data.get("description")
    amount = data.get("amount")
    payer_id = data.get("payer_id")
    members = data.get("members", [])

    if not all([title, description, amount, payer_id, members]):
        return jsonify({"error": "Missing required fields"}), 400

    # Deduct full amount from payer
    payer = users.find_one({"userId": payer_id})
    if not payer or payer.get("balance", 0) < amount:
        return jsonify({"error": "Insufficient balance for payer"}), 400

    users.update_one({"userId": payer_id}, {"$inc": {"balance": -amount}})

    expense = {
        "title": title,
        "description": description,
        "amount": amount,
        "payer_id": payer_id,
        "members": members,
        "created_at": datetime.utcnow()
    }

    result = expenses.insert_one(expense)
    expense_id = result.inserted_id

    for member in members:
        if member["status"] == "unpaid":
            requests.insert_one({
                "expense_id": str(expense_id),
                "payer_id": payer_id,
                "receiver_id": member["user_id"],
                "amount": member["share_amount"],
                "message": f"{title} - {description}",
                "status": "pending",
                "timestamp": datetime.utcnow()
            })

    return jsonify({"expense_id": str(expense_id)}), 201

# ✅ Get all requests for a user
@split_bp.route('/requests/<user_id>', methods=['GET'])
def get_requests(user_id):
    all_reqs = list(requests.find({
        "$or": [
            {"receiver_id": user_id},
            {"payer_id": user_id}
        ]
    }).sort("timestamp", -1))

    return jsonify([{
        **str_id(req),
        "timestamp": req["timestamp"].isoformat()
    } for req in all_reqs])

# ✅ Settle payment
@split_bp.route('/pay', methods=['POST'])
def settle_payment():
    data = request.json
    request_id = data.get("request_id")

    pay_req = requests.find_one({"_id": ObjectId(request_id)})
    if not pay_req:
        return jsonify({"error": "Request not found"}), 404

    if pay_req["status"] == "paid":
        return jsonify({"message": "Already paid"}), 200

    payer_id = pay_req["payer_id"]
    receiver_id = pay_req["receiver_id"]
    amount = pay_req["amount"]

    receiver = users.find_one({"userId": receiver_id})
    if not receiver or receiver.get("balance", 0) < amount:
        return jsonify({"error": "Insufficient balance or user not found"}), 400

    # Deduct from receiver (paying user)
    users.update_one(
        {"userId": receiver_id},
        {"$inc": {"balance": -amount}}
    )

    # Credit the original payer
    users.update_one(
        {"userId": payer_id},
        {"$inc": {"balance": amount}}
    )

    # Mark request as paid
    requests.update_one(
        {"_id": ObjectId(request_id)},
        {
            "$set": {
                "status": "paid",
                "paid_at": datetime.utcnow()
            }
        }
    )

    # Update expense member status
    expenses.update_one(
        {
            "_id": ObjectId(pay_req["expense_id"]),
            "members.user_id": receiver_id
        },
        {
            "$set": {"members.$.status": "paid"}
        }
    )

    return jsonify({"message": "Payment settled and balances updated"}), 200

# ✅ Get history where user is payer or participant
@split_bp.route('/history/<user_id>', methods=['GET'])
def get_history(user_id):
    user_expenses = expenses.find({
        "$or": [
            {"payer_id": user_id},
            {"members.user_id": user_id}
        ]
    }).sort("created_at", -1)

    return jsonify([{
        **str_id(exp),
        "created_at": exp["created_at"].isoformat()
    } for exp in user_expenses])
