from flask import Flask, request, jsonify
from flask_cors import CORS
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
import pandas as pd
import numpy as np
import mysql.connector
import os   
import datetime
from email.message import EmailMessage
import ssl
import smtplib
import uuid
import time
from pymongo import MongoClient
from flask_cors import CORS
from bson import ObjectId
from dotenv import load_dotenv
from openai import OpenAI
import threading
from voicebot import run_voice_assistant, stop_voice_assistant, assistant_state

email_sender = os.getenv("EMAIL_SENDER")
email_password = os.getenv("EMAIL_PASSWORD")

load_dotenv()  # ✅ Loads .env
import os
api_key = os.environ.get("GROQ_API_KEY")
print("🧪 API Key:", api_key)  # Temporary print to test


groq_client = OpenAI(
    api_key=api_key,
    base_url="https://api.groq.com/openai/v1"  # ✅ Groq base URL
)


load_dotenv()
uri = os.getenv("MONGO_URI")


mongo = MongoClient(uri)
db = mongo["powercardDB"]
users_collection = db["users"]
requests_collection = db["requests"]
escrow_collection = db["escrow"]
transactions_collection = db["transactions"]
budget_collection = db["budget"]

x = datetime.datetime.now()

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}})

PRODUCTS = [
    {
        'id': 1,
        'name': 'Travel BagPack',
        'price': 59,
        'category': 'Luggage'
    },
    {
        'id': 2,
        'name': 'Apple AirPods',
        'price': 299,
        'category': 'Electronics'
    },
    {
        'id': 3,
        'name': 'iPhone 15 Pro Max',
        'price': 1499,
        'category': 'Electronics'
    },
    {
        'id': 4,
        'name': 'MacBook M1 Air',
        'price': 1099,
        'category': 'Electronics'
    },
    {
        'id': 5,
        'name': 'Microwave Oven',
        'price': 299,
        'category': 'Electronics'
    },
    {
        'id': 6,
        'name': 'Sony PlayStation 5',
        'price': 599,
        'category': 'Electronics'
    },
    {
        'id': 7,
        'name': 'Nike Shoes',
        'price': 199,
        'category': 'Fashion'
    },
    {
        'id': 8,
        'name': 'Watch',
        'price': 399,
        'category': 'Fashion'
    }
]

@app.route('/budgetLimit', methods=['POST'])
def set_budget_limit():
    data = request.get_json()
    user_id = data.get('user_id')
    amount = float(data.get('amount'))
    valid_till = data.get('valid_till')

    existing = budget_collection.find_one({"user_id": user_id})
    if existing:
        budget_collection.update_one(
            {"user_id": user_id},
            {"$set": {"amount": amount, "valid_till": valid_till}}
        )
    else:
        budget_collection.insert_one({
            "user_id": user_id,
            "amount": amount,
            "valid_till": valid_till,
            "spend_amount": 0  # default
        })

    return jsonify({"message": "Budget set/updated successfully"}), 200

@app.route('/getBudgetLimit', methods=['POST'])
def get_budget_limit():
    data = request.get_json()
    user_id = data.get('user_id')

    result = budget_collection.find_one({"user_id": user_id})
    if result:
        return jsonify({
            "budget_limit": result.get("amount", 0),
            "spend_amount": result.get("spend_amount", 0)
        })
    else:
        return jsonify({"budget_limit": 0, "spend_amount": 0})

@app.route('/resetBudget', methods=['POST'])
def reset_budget():
    data = request.get_json()
    user_id = data.get('user_id')

    budget_collection.delete_one({"user_id": user_id})

    return jsonify({"message": "Budget reset successfully"})

powercard_requests = {}

def check_budget_limit(user_id):
    budget = budget_collection.find_one({"user_id": user_id})
    if not budget:
        return

    amount = budget.get("amount", 0)
    spent = budget.get("spend_amount", 0)

    if amount <= 0:
        return

    percent_used = (spent / amount) * 100
    notifications = []

    if percent_used >= 100:
        notifications.append(f"🚨 Budget Alert: 100% of your ₹{amount} budget has been used.")
    elif percent_used >= 90:
        notifications.append(f"⚠️ Budget Warning: 90% used. Remaining: ₹{amount - spent:.2f}")
    elif percent_used >= 50:
        notifications.append(f"📢 Notice: 50% of your budget has been used. Remaining: ₹{amount - spent:.2f}")

    if notifications:
        send_email_notifications(user_id, notifications)

def send_email_notifications(user_id, notifications):
    user = users_collection.find_one({"userId": user_id})
    if not user or "email" not in user:
        print(f"❌ No email found for user {user_id}")
        return

    email_sender = "amazon.hackon.s5@gmail.com"
    email_password = "tkub qryc rnxe pqrd"  # Consider using app password
    email_receiver = user["email"]

    subject = "🔔 Budget Notification"
    body = "\n".join(notifications)

    em = EmailMessage()
    em["From"] = email_sender
    em["To"] = email_receiver
    em["Subject"] = subject
    em.set_content(body)

    context = ssl.create_default_context()
    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465, context=context) as smtp:
            smtp.login(email_sender, email_password)
            smtp.sendmail(email_sender, email_receiver, em.as_string())
        print(f"✅ Email sent to {email_receiver}")
    except Exception as e:
        print("❌ Failed to send email:", e)

@app.route('/api/powercard/request', methods=['POST'])
def create_power_request():
    data = request.json
    user_id = data.get("userA")

    userA_data = users_collection.find_one({"userId": user_id})
    if not userA_data:
        return jsonify({"error": "User A not found"}), 404

    request_id = str(uuid.uuid4())

    request_doc = {
        "id": request_id,
        "userA": {
            "userId": userA_data["userId"],
            "name": userA_data["name"],
            "email": userA_data["email"]
        },
        "card": data.get("card"),
        "productPrice": float(data.get("productPrice")),     # 💰 Store full product price
        "discount": float(data.get("discount")),          # 💸 Discount amount
        "commission": float(data.get("commission")),         # 🎁 Commission for PowerPartner
        "serviceFee": float(data.get("serviceFee")),         # 🧾 Platform fee
        "total": float(data.get("productPrice")) - float(data.get("discount")),  # 👀 What PowerPartner sees
        "fullEscrow": data.get("fullEscrow"),    # 💵 What User A pays to escrow
        "status": "open",
        "created_at": time.time()
    }


    db.requests.insert_one(request_doc)

    return jsonify({"message": "Request created", "request_id": request_id}), 201



@app.route('/api/powercard/accept/<request_id>', methods=['POST'])
def accept_request(request_id):
    data = request.json
    user_id = data.get("userB")

    userB_data = users_collection.find_one({"userId": user_id})
    if not userB_data:
        return jsonify({"error": "User B not found"}), 404

    request_doc = db.requests.find_one({"id": request_id})
    if not request_doc or request_doc.get("status") != "open":
        return jsonify({"error": "Request not available"}), 400

    # Update the request with User B details
    db.requests.update_one(
        {"id": request_id},
        {"$set": {
            "status": "accepted",
            "userB": {
                "userId": userB_data["userId"],
                "name": userB_data["name"],
                "email": userB_data["email"]
            },
            "accepted_at": time.time()
        }}
    )

    return jsonify({"message": "Request accepted successfully"}), 200



@app.route('/api/powercard/pay-escrow/<request_id>', methods=['POST'])
def escrow_payment(request_id):
    request_doc = db.requests.find_one({"id": request_id})
    if not request_doc or request_doc.get("status") != "accepted":
        return jsonify({"error": "Escrow payment not allowed"}), 400

    userA_id = request_doc["userA"]["userId"]
    total_amount = request_doc["fullEscrow"]

    userA = db.users.find_one({"userId": userA_id})
    if not userA or userA["balance"] < total_amount:
        return jsonify({"error": "Insufficient balance for User A"}), 400

    # 💸 Deduct from User A
    db.users.update_one(
        {"userId": userA_id},
        {"$inc": {"balance": -total_amount}}
    )

    # 💰 Add to Escrow Fund
    db.escrow.update_one({}, {"$inc": {"fund": total_amount}})

    # 📝 Update request as paid
    db.requests.update_one(
        {"id": request_id},
        {"$set": {"escrow_paid": True}}
    )

    # 🧾 Save transaction
    db.transactions.insert_one({
        "type": "escrow_payment",
        "from": userA_id,
        "amount": total_amount,
        "request_id": request_id,
        "timestamp": time.time()
    })
    budget_collection.update_one(
        {"user_id": userA_id},
        {
            "$inc": {"spend_amount": total_amount},
            "$setOnInsert": {"amount": 0, "valid_till": None}
        },
        upsert=True
    )
    check_budget_limit(userA_id)


    return jsonify({"message": "Escrow payment successful"}), 200


@app.route('/api/powercard/pay-merchant/<request_id>', methods=['POST'])
def merchant_payment(request_id):
    request_doc = db.requests.find_one({"id": request_id})
    if not request_doc or not request_doc.get("escrow_paid"):
        return jsonify({"error": "Cannot proceed. Escrow not paid."}), 400

    total = request_doc["total"]
    commission = request_doc["commission"]
    userB_id = request_doc["userB"]["userId"]

    # 💰 Subtract from Escrow
    db.escrow.update_one({}, {"$inc": {"fund": -total}})

    # 💸 Add commission to User B
    db.users.update_one(
        {"userId": userB_id},
        {"$inc": {"balance": commission}}
    )

    # ✅ Mark request as completed
    db.requests.update_one(
        {"id": request_id},
        {"$set": {"merchant_paid": True, "status": "completed"}}
    )
    
    # 🛒 Place Order for User A
    order_doc = {
        "userId": request_doc["userA"]["userId"],
        "card": request_doc["card"],
        "productPrice": request_doc["productPrice"],
        "discount": request_doc["discount"],
        "finalPaid": request_doc["fullEscrow"],
        "status": "Order Placed",
        "placed_at": time.time(),
        "requestId": request_id
    }
    db.orders.insert_one(order_doc)


    # 🧾 Save transaction
    db.transactions.insert_one({
        "type": "merchant_payment",
        "to": userB_id,
        "amount": commission,
        "request_id": request_id,
        "timestamp": time.time()
    })

    # 🧹 Remove ObjectId before returning
    if "_id" in request_doc:
        request_doc["_id"] = str(request_doc["_id"])

    return jsonify({
        "message": "Merchant paid. Commission released to User B. Product ships to User A.",
        "final_status": request_doc
    }), 200


@app.route('/api/escrow/transactions', methods=['GET'])
def get_escrow_transactions():
    transactions = list(db.escrowTransactions.find({}, {"_id": 0}))
    return jsonify(transactions), 200

escrow_data = db.escrow.find_one()
if not escrow_data:
    db.escrow.insert_one({ "fund": 0 })  # one-time init

@app.route('/api/powercard/all', methods=['GET'])
def get_all_requests():
    requests = list(db.requests.find({}, {"_id": 0}))
    return jsonify(requests)

@app.route('/api/powercard/escrow', methods=['GET'])
def get_escrow():
    escrow = db.escrow.find_one()
    return jsonify(escrow), 200

@app.route('/api/powercard/transactions', methods=['GET'])
def all_transactions():
    txns = list(db.transactions.find({}, {"_id": 0}))
    return jsonify(txns), 200


@app.route('/api/powercard/eligible/<user_id>', methods=['GET'])
def get_eligible_requests(user_id):
    user = users_collection.find_one({"userId": user_id})
    if not user:
        return jsonify({"error": "User not found"}), 404

    # Normalize the user's card names
    user_cards_normalized = [c.lower().replace(" card", "").strip() for c in user.get("cards", [])]

    all_requests = db.requests.find({
        "status": "open",
        "userA.userId": {"$ne": user_id}
    })

    eligible_requests = []
    for req in all_requests:
        req_card_normalized = req.get("card", "").lower().replace(" card", "").strip()
        if req_card_normalized in user_cards_normalized:
            req["_id"] = str(req["_id"])  # Convert ObjectId to string
            eligible_requests.append(req)

    return jsonify(eligible_requests), 200


@app.route("/api/users", methods=["GET"])
def get_all_users():
    users = list(db.users.find({}, {"_id": 0}))  # exclude MongoDB _id field
    return jsonify(users)

@app.route("/api/users", methods=["GET"])
def get_users():
    users = list(db.users.find({}, {"_id": 0}))  # exclude MongoDB's _id
    return jsonify(users), 200

@app.route("/api/powercard/myrequests/<user_id>", methods=["GET"])
def get_my_requests(user_id):
    user_requests = list(db.requests.find({"userA.userId": user_id}))
    for r in user_requests:
        r["_id"] = str(r["_id"])  # MongoDB ObjectId is not JSON serializable
    return jsonify(user_requests), 200

@app.route('/api/powercard/my-orders/<user_id>', methods=['GET'])
def get_my_orders(user_id):
    orders = list(db.requests.find({
        "userA.userId": user_id,
        "status": "completed"
    }))

    for order in orders:
        order["_id"] = str(order["_id"])  # Make ObjectId JSON serializable

    return jsonify(orders), 200
@app.route('/api/voice-assistant/start', methods=['POST'])
def start_voice_assistant():
    """Start the voice assistant in a separate thread"""
    try:
        # Stop if already running
        if assistant_state.is_running:
            stop_voice_assistant()
            time.sleep(1)
            
        thread = threading.Thread(target=run_voice_assistant)
        thread.daemon = True
        thread.start()
        
        return jsonify({
            "status": "success",
            "message": "🧠 Voice Assistant started!",
            "is_running": True
        })
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e),
            "is_running": False
        }), 500

@app.route('/api/voice-assistant/stop', methods=['POST'])
def stop_assistant():
    """Stop the running voice assistant"""
    try:
        if stop_voice_assistant():
            return jsonify({
                "status": "success",
                "message": "🛑 Voice Assistant stopped",
                "is_running": False
            })
        return jsonify({
            "status": "error",
            "message": "Assistant not running",
            "is_running": False
        }), 400
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e),
            "is_running": assistant_state.is_running
        }), 500

@app.route('/api/voice-assistant/confirm', methods=['POST'])
def confirm_order():
    """Trigger order confirmation"""
    try:
        # This would be handled by the voice assistant thread
        return jsonify({
            "status": "success",
            "message": "Order confirmation requested",
            "is_running": assistant_state.is_running
        })
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e),
            "is_running": assistant_state.is_running
        }), 500

@app.route('/api/voice-assistant/status', methods=['GET'])
def assistant_status():
    """Check if assistant is running"""
    return jsonify({
        "is_running": assistant_state.is_running,
        "order_in_progress": assistant_state.order_in_progress,
        "cart_items": len(assistant_state.cart),
        "cart_total": assistant_state.cart_total,
        "user_name": assistant_state.user_name
    })
    
if __name__ == '__main__':
	app.run(host = '0.0.0.0',debug=True)
