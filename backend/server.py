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
from bson import ObjectId      #         python server.py
from dotenv import load_dotenv
from splitBill import split_bp

load_dotenv()
uri = os.getenv("MONGO_URI")

from pymongo import MongoClient

client = MongoClient(uri)

try:
    client.admin.command('ping')
    print("✅ Connected to MongoDB!")
except Exception as e:
    print("❌ Connection failed:", e)


mongo = MongoClient(uri)
db = mongo["powercardDB"]
users_collection = db["users"]
requests_collection = db["requests"]
escrow_collection = db["escrow"]
transactions_collection = db["transactions"]

x = datetime.datetime.now()

app = Flask(__name__)
# CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173"}})
#changes to available for all routes
CORS(app, origins=["http://localhost:5173"], supports_credentials=True)





__amt = None
__transactionsdf=None
__offersdf=None
__pmdf=None
__model1=None
__model2=None
__le=None

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


def load_model():

    df_col=['user_id', 'transaction_amount', 'payment_method',  'date','success/failure']
    offers_df_col=['payment_method', 'start_date', 'end_date',  'cashbacks', 'charges']

    mydb=mysql.connector.connect(
        host="localhost",
        user="root",
        password="password",
        database="hackonamazon",
    )

    mycursor=mydb.cursor()
    mycursor.execute("SELECT * FROM transaction")
    myresult=mycursor.fetchall()

    df = pd.DataFrame(columns=df_col)

    for x in myresult:
        new_data = pd.DataFrame([x],columns=df_col)
        df = pd.concat([df, new_data], ignore_index=True)

    mydb=mysql.connector.connect(
        host="localhost",
        user="root",
        password="password",
        database="hackonamazon",
    )

    mycursor=mydb.cursor()
    mycursor.execute("SELECT * FROM offers")
    myresult=mycursor.fetchall()

    offers_df = pd.DataFrame(columns=offers_df_col)

    for x in myresult:
        new_data = pd.DataFrame([x],columns=offers_df_col)
        offers_df = pd.concat([offers_df, new_data],    ignore_index=True)


    payment_method_counts = df.groupby(['user_id',  'payment_method']).size().reset_index(name='count')


    most_frequent_payment_method = payment_method_counts.loc    [payment_method_counts.groupby('user_id')['count'].idxmax()]


    user_payment_map = most_frequent_payment_method.set_index   ('user_id')['payment_method'].to_dict()

    df['frequently_used_payment_method'] = df['user_id'].map    (user_payment_map)
    transaction_df=df

    transaction_df['date'] = pd.to_datetime(transaction_df['date'])

    global __transactionsdf
    __transactionsdf=transaction_df

    offers_df['start_date'] = pd.to_datetime(offers_df['start_date'])
    offers_df['end_date'] = pd.to_datetime(offers_df['end_date'])
    
    global __offersdf
    __offersdf=offers_df


    merged_df = transaction_df.merge(offers_df, on='payment_method')
    merged_df = merged_df[(merged_df['date'] >= merged_df   ['start_date']) & (merged_df['date'] <= merged_df['end_date'])]
    merged_df=merged_df.drop(columns=['start_date','end_date'])


    le = LabelEncoder()
    global __le
    __le=le
    merged_df['net_benefit'] = merged_df['cashbacks'] - merged_df   ['charges']
    merged_df['success/failure']=le.fit_transform(merged_df['success/failure'])
    merged_df['success_rate'] = merged_df.groupby(['payment_method'])   ['success/failure'].transform(lambda x: x.sum() / x.count())


    merged_df['payment_method_encoded'] = le.fit_transform(merged_df    ['payment_method'])
    merged_df['frequently_used_payment_method_encoded'] = le.   fit_transform(merged_df['frequently_used_payment_method'])


    pm_df=merged_df[['payment_method','payment_method_encoded', 'net_benefit','success_rate']]
    pm_df.drop_duplicates(inplace=True)
    
    global __pmdf
    __pmdf=pm_df


    features = ['transaction_amount', 'net_benefit', 'success_rate',    'frequently_used_payment_method_encoded']
    X = merged_df[features]
    y = merged_df['payment_method_encoded']


    X_train, X_test, y_train, y_test = train_test_split(X, y,   test_size=0.2, random_state=42)


    global __model1
    __model1 = RandomForestClassifier(n_estimators=100,     random_state=42)
    __model1.fit(X_train, y_train)


    features2 = ['transaction_amount', 'net_benefit', 'success_rate']
    X2 = merged_df[features2]
    y2 = merged_df['payment_method_encoded']

    X_train, X_test, y_train, y_test = train_test_split(X2, y2,  test_size=0.2, random_state=42)


    global __model2
    __model2 = RandomForestClassifier(n_estimators=100,   random_state=42)
    __model2.fit(X_train, y_train)

def get_frequently_used_payment_method(user_id, transaction_df):
    user_transactions = transaction_df[transaction_df['user_id'] == user_id]
    user_transactions=user_transactions.sort_values(by=list(user_transactions.columns), ascending=[False] * len(user_transactions.columns))
    if not user_transactions.empty:
        return user_transactions['frequently_used_payment_method'].mode()[0]
    else:
        return None

def prediction_fun(transaction):
    
    load_model()
    
    transaction_df=__transactionsdf
    offers_df=__offersdf
    model1=__model1
    model2=__model2
    pm_df=__pmdf
    
    user_id = transaction['user_id']
    frequently_used_payment_method = get_frequently_used_payment_method(user_id, transaction_df)
    
    transaction = pd.DataFrame([transaction])
    transaction['date'] = pd.to_datetime(transaction['date'])
    transaction['success/failure'] = np.where(transaction['success/failure'] == 'success', 1, 0)

    if frequently_used_payment_method!=None:
        transaction['frequently_used_payment_method'] = frequently_used_payment_method
    
    current_offers = offers_df[(offers_df['start_date'] <= transaction['date'].values[0]) & (offers_df['end_date'] >= transaction['date'].values[0])]

    le = __le
    
    if frequently_used_payment_method:
        transaction['frequently_used_payment_method_encoded'] = le.transform([transaction['frequently_used_payment_method'].values[0]])

    repeated_row = pd.concat([transaction] * len(current_offers), ignore_index=True)
    transaction = pd.concat([current_offers, repeated_row], axis=1)
    
    transaction['net_benefit'] = transaction['cashbacks'] - transaction['charges']
    
    transaction['success_rate'] = transaction.groupby(['payment_method'])['success/failure'].transform(lambda x: x.sum() / x.count())

    if frequently_used_payment_method==None:
        features = ['transaction_amount', 'net_benefit', 'success_rate']
    else:
        features= ['transaction_amount', 'net_benefit', 'success_rate', 'frequently_used_payment_method_encoded']
    feature_values = transaction[features].values

    if frequently_used_payment_method!=None:
        predicted_payment_method_encoded = model1.predict(feature_values)
    else:
        predicted_payment_method_encoded = model2.predict(feature_values)
 
    filtered_df = pm_df[pm_df['payment_method_encoded'].isin(predicted_payment_method_encoded)]

    sorted_filtered_df = filtered_df.set_index('payment_method_encoded').loc[predicted_payment_method_encoded].reset_index()
    pred_df=sorted_filtered_df
    
    payment_method_counts = pred_df['payment_method'].value_counts()
    
    max_frequency = payment_method_counts.max()
    
    most_frequent_methods = payment_method_counts[payment_method_counts == max_frequency].index.tolist()

    filtered_df = pred_df[pred_df['payment_method'].isin(most_frequent_methods)]

    highest_success_rate = filtered_df['success_rate'].max()
    highest_success_methods = filtered_df[filtered_df['success_rate'] == highest_success_rate]

    if highest_success_methods.shape[0] > 1:
        highest_net_benefit = highest_success_methods['net_benefit'].max()
        final_method = highest_success_methods[highest_success_methods['net_benefit'] == highest_net_benefit]['payment_method'].iloc[0]
    else:
        final_method = highest_success_methods['payment_method'].iloc[0]

    return final_method

def send_email_notifications(notifications):
    email_sender = 'amazonhackon@gmail.com'
    email_receiver = 'hackonamazon04@gmail.com'
    email_password = 'samplepassword' # Add password here
    subject = 'Budget Notification'
    body = "\n".join(notifications)

    em = EmailMessage()
    em['From'] = email_sender
    em['To'] = email_receiver
    em['Subject'] = subject
    em.set_content(body)

    context = ssl.create_default_context()
    with smtplib.SMTP_SSL('smtp.gmail.com', 465, context=context) as smtp:
        smtp.login(email_sender, email_password)
        smtp.sendmail(email_sender, email_receiver, em.as_string())

# Function to check budget limit
def check_budget_limit(user_id):
    mydb = mysql.connector.connect(
        host="localhost",
        user="root",
        password="password",
        database="hackonamazon"
    )
    mycursor = mydb.cursor()

    mycursor.execute("SELECT amount, spend_amount FROM budget WHERE user_id = %s", (user_id,))
    budget_info = mycursor.fetchone()

    if budget_info:
        amount = budget_info[0]
        spend_amount = budget_info[1]

        if amount > 0:
            spend_percent = (spend_amount / amount) * 100

            notifications = []

            if spend_percent >= 100:
                notifications.append("100% of the budget limit has been used. No remaining budget.")
            if spend_percent < 100 and spend_percent > 90:
                notifications.append(f"90% of the budget limit has been used. Remaining budget: ${amount - spend_amount:.2f}")
            if spend_amount < 90 and spend_percent > 50:
                notifications.append(f"50% of the budget limit has been used. Remaining budget: ${amount - spend_amount:.2f}")

            if notifications:
                send_email_notifications(notifications)

    mycursor.close()
    mydb.close()

# Route to accept the total amount in the cart
@app.route('/api/data', methods=["POST","GET"])
def get_data():
    if( request.method == 'POST'):
        data = request.get_json()
        price = request.json['totalPrice']
        global __amt
        __amt = price
        return jsonify({'message' : 'data recieved'})
    else:
        return jsonify({'message' : 'data not recieved'})

#Route to send Payment Method Recommendation
@app.route('/predict', methods=['POST','GET'])
def predict_payment_method():
    today = datetime.date.today()
    transaction = {
        'user_id': 4,
        'transaction_amount': __amt,
        'date': today.strftime("%Y-%m-%d"),
        'success/failure': 'success'
    }
    recommended_method = prediction_fun(transaction)
    return jsonify({'recommended_payment_method': recommended_method})

# Route to fetch budget limit
@app.route('/getBudgetLimit', methods=['POST'])
def get_budget_limit():
    if request.method == 'POST':
        data = request.get_json()
        user_id = data.get('user_id')

        mydb = mysql.connector.connect(
            host="localhost",
            user="root",
            password="password",
            database="hackonamazon"
        )
        
        mycursor = mydb.cursor()
        mycursor.execute("SELECT amount, spend_amount FROM budget WHERE user_id = %s", (user_id,))
        budget_info = mycursor.fetchone()

        mycursor.close()
        mydb.close()

        if budget_info:
            budget_limit = budget_info[0]
            spend_amount = budget_info[1]
            return jsonify({'budget_limit': budget_limit, 'spend_amount': spend_amount})
        else:
            return jsonify({'error': 'Budget limit not found'})
    else:
        return jsonify({'error': 'Method not allowed'})

#Route to set/update budget limit
@app.route('/budgetLimit', methods=['POST'])
def setBudgetLimit():
    if request.method == 'POST':
        mydb = mysql.connector.connect(
            host="localhost",
            user="root",
            password="password",
            database="hackonamazon"
        )
        data = request.get_json()
        user_id = data.get('user_id')
        amount = data.get('amount')
        valid_till = data.get('valid_till')

        mycursor = mydb.cursor()
        mycursor.execute("SELECT * FROM budget WHERE user_id = %s", (user_id,))
        existing_budget = mycursor.fetchone()

        if existing_budget:
            mycursor.execute("UPDATE budget SET amount = %s, valid_till = %s WHERE user_id = %s",
                             (amount, valid_till, user_id))
        else:
            mycursor.execute("INSERT INTO budget (user_id, amount, valid_till) VALUES (%s, %s, %s)",
                             (user_id, amount, valid_till))

        mydb.commit()
        mycursor.close()

        return jsonify({'message': 'success'})

@app.route('/resetBudget', methods=['POST'])
def reset_budget():
    if request.method == 'POST':
        data = request.get_json()
        user_id = data.get('user_id')

        mydb = mysql.connector.connect(
            host="localhost",
            user="root",
            password="password",
            database="hackonamazon"
        )
        
        mycursor = mydb.cursor()
        mycursor.execute("DELETE FROM budget WHERE user_id = %s", (user_id,))
        mydb.commit()

        mycursor.close()
        mydb.close()

        return jsonify({'message': 'success'})

@app.route('/checkout', methods = ['POST','GET'])
def checkout():
    if request.method == 'POST':
        items = request.json['cartItems']
        paymentMethod = request.json['paymentMethod']
        print(items)
        # print(request)
        print(paymentMethod)

        mydb=mysql.connector.connect(
            host="localhost",
            user="root",
            password="password",
            database="hackonamazon",
        )

        mycursor=mydb.cursor()
        mycursor.execute("SELECT MAX(`Order ID`) FROM orders")
        myresult = mycursor.fetchone()
        last_order_id = myresult[0]
        mydb.close()

        mydb=mysql.connector.connect(
            host="localhost",
            user="root",
            password="password",
            database="hackonamazon",
        )

        mycursor=mydb.cursor()
        totalAmt = 0
        for i in range(1,9):
            if items[str(i)] == 0:
                continue
            current_date = datetime.datetime.now()
            formatted_date = str(current_date.strftime("%Y-%m-%d %H:%M:%S"))
            
            sql = "INSERT INTO orders VALUES (%s, %s, %s, %s, %s, %s, NULL, %s, NULL, NULL)"
            values = (str(last_order_id+1), PRODUCTS[i-1]['name'], PRODUCTS[i-1]['category'], formatted_date, str(PRODUCTS[i-1]['price']*items[str(i)]), str(items[str(i)]), str(10))
            totalAmt += PRODUCTS[i-1]['price']*items[str(i)]
            for i in values:
                print(i)
            mycursor.execute(sql,values)
            mydb.commit()
            last_order_id += 1
        current_date = datetime.datetime.now()
        formatted_date = str(current_date.strftime("%Y-%m-%d"))
        mycursor.execute("UPDATE Budget SET spend_amount = spend_amount + %s WHERE user_id = 1 AND valid_till >= %s",(totalAmt,formatted_date))
        mydb.commit()
        check_budget_limit(1)
        mydb.close()
        
        return jsonify({'message' : 'checkout successful'})
    else:
        return jsonify({'message' : 'data not recieved'})

powercard_requests = {}

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

# split register
app.register_blueprint(split_bp, url_prefix='/api/split')

if __name__ == '__main__':
	app.run(host = '0.0.0.0',debug=True)
