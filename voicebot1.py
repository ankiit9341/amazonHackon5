import os
import time
import json
import random
import threading
import re
import datetime

import speech_recognition as sr
import pyttsx3
from dotenv import load_dotenv
from groq import Groq
from pymongo import MongoClient

# ─── CONFIG & CLIENT SETUP ─────────────────────────────────────────────────────
load_dotenv()
API_KEY = os.getenv("GROQ_API_KEY")
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
if not API_KEY:
    print("❌ Please set GROQ_API_KEY in your .env")
    exit(1)

groq = Groq(api_key=API_KEY)
# MongoDB setup
db_client = MongoClient(MONGO_URI)
db = db_client["grocery_bot"]
orders_col = db["orders"]

# ─── TTS & STT SETUP ────────────────────────────────────────────────────────────
engine = pyttsx3.init()
engine.setProperty("rate", 150)

# Try to find Indian English voice
indian_voice = None
for voice in engine.getProperty('voices'):
    if 'india' in voice.id.lower() or 'indian' in voice.id.lower():
        indian_voice = voice.id
        break

if indian_voice:
    engine.setProperty('voice', indian_voice)
    print("Using Indian English voice")
else:
    print("Indian voice not found. Using default voice.")

tts_lock = threading.Lock()
history = [{
    "role": "system",
    "content": "You are a helpful grocery ordering assistant for Indian customers. "
               "Be concise and handle multiple items in single commands. "
               "For ambiguous items, suggest alternatives from the catalog. "
               "Always confirm added items and current total. "
               "Use ₹ for prices and include Hindi translations for items."
}]  # chat history with system context

cart = []
cart_total = 0
current_order_id = None
order_in_progress = False

# Create a new order document at start
def init_order():
    global current_order_id, cart, cart_total, order_in_progress
    order = {
        "items": [],
        "total": 0,
        "status": "open",
        "created_at": datetime.datetime.now().isoformat()
    }
    res = orders_col.insert_one(order)
    current_order_id = str(res.inserted_id)
    cart = []
    cart_total = 0
    order_in_progress = True
    return current_order_id

# ─── SPEECH FUNCTIONS ──────────────────────────────────────────────────────────
def speak(text: str):
    """Improved text-to-speech with Indian pronunciation"""
    # Preprocess text for better pronunciation
    text = re.sub(r'₹(\d+(\.\d+)?)', r'\1 rupees', text)
    text = re.sub(r'#(\d+)', r'number \1', text)
    text = text.replace("UPI-", "U P I ")
    
    with tts_lock:
        print(f"Assistant: {text}")
        history.append({"role": "assistant", "content": text})
        engine.say(text)
        engine.runAndWait()

def listen() -> str:
    """Enhanced voice recognition with Indian English support"""
    r = sr.Recognizer()
    with sr.Microphone() as mic:
        print("\n🎤 Listening...")
        try:
            r.adjust_for_ambient_noise(mic, duration=0.2)
            audio = r.listen(mic, timeout=5, phrase_time_limit=5)
        except sr.WaitTimeoutError:
            return ""
    
    try:
        # Use Indian English language model
        cmd = r.recognize_google(audio, language="en-IN").lower()
        print("User:", cmd)
        history.append({"role": "user", "content": cmd})
        return cmd
    except sr.UnknownValueError:
        return ""
    except Exception as e:
        print(f"Recognition error: {e}")
        return ""

# ─── DATA & UTILITIES ─────────────────────────────────────────────────────────
catalog = {
    "dairy": {"milk": 60, "cheese": 90, "yogurt": 40, "butter": 55, "eggs": 120},
    "fruits": {"apple": 80, "banana": 40, "orange": 60, "grapes": 100, "mango": 120},
    "bakery": {"bread": 45, "croissant": 25, "bagel": 30, "cake": 200},
    "vegetables": {"carrot": 30, "tomato": 40, "potato": 25, "spinach": 35},
    "staples": {"rice": 120, "pasta": 65, "flour": 90, "sugar": 50},
    "beverages": {"juice": 120, "coffee": 250, "tea": 150, "soda": 60}
}

# Hindi names for items
hindi_map = {
    "milk": "doodh", "cheese": "cheese", "yogurt": "dahi", 
    "butter": "makhan", "eggs": "ande", "apple": "seb",
    "banana": "kela", "orange": "santara", "grapes": "angoor",
    "mango": "aam", "bread": "double roti", "croissant": "croissant",
    "bagel": "bagel", "cake": "cake", "carrot": "gajar",
    "tomato": "tamatar", "potato": "aaloo", "spinach": "palak",
    "rice": "chawal", "pasta": "pasta", "flour": "maida",
    "sugar": "cheeni", "juice": "ras", "coffee": "coffee",
    "tea": "chai", "soda": "soda"
}

# AI-enhanced item matching
def ai_match_item(name: str) -> tuple:
    """Use AI to match items with fuzzy logic and context awareness"""
    context = "\n".join([f"{i['role']}: {i['content']}" for i in history[-3:]])
    prompt = f"""
You are an item matching assistant for a grocery store. 
Available items: {list(catalog.keys())}

Recent conversation:
{context}

User requested: "{name}"

Perform these steps:
1. Identify possible item matches from catalog
2. If ambiguous, suggest top 3 similar items
3. Return JSON with format: 
{{"match": "item_name", "alternatives": ["item1", "item2"]}}
If no match, return {{"match": null}}
"""
    try:
        response = groq.chat.completions.create(
            model="llama3-8b-8192",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=128,
            response_format={"type": "json_object"}
        )
        result = json.loads(response.choices[0].message.content)
        return result.get("match"), result.get("alternatives", [])
    except Exception as e:
        print(f"AI matching error: {e}")
        return None, []

def get_item(name: str):
    """Get item with AI-enhanced matching"""
    # First try direct match
    for cat, items in catalog.items():
        if name in items:
            return name, items[name]
    
    # Try AI matching
    matched, alternatives = ai_match_item(name)
    if matched:
        for cat, items in catalog.items():
            if matched in items:
                return matched, items[matched]
    
    return None, None

# ─── AI-ENHANCED INTENT PARSING ────────────────────────────────────────────────
def ai_parse_intent(cmd: str) -> dict:
    """Use AI to parse complex commands with multiple intents"""
    context = "\n".join([f"{i['role']}: {i['content']}" for i in history[-4:]])
    prompt = f"""
You are an intent parser for a grocery ordering assistant. 
Current order status: {"active" if order_in_progress else "inactive"}
Cart items: {[item['item'] for item in cart] if cart else "empty"}

Available intents:
- add: Add items to cart
- confirm: Complete order
- cancel: Cancel order
- payment: Process payment
- query: Ask about products
- help: Get assistance

Recent conversation:
{context}

User command: "{cmd}"

Perform these steps:
1. Identify primary intent
2. Extract all items with quantities (default 1)
3. Handle multiple operations in single command
4. Return JSON format:
{{
  "intent": "add|confirm|cancel|payment|query|help",
  "items": {{"item1": quantity, "item2": quantity}},
  "response": "Immediate response if needed"
}}
"""
    try:
        response = groq.chat.completions.create(
            model="llama3-8b-8192",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.4,
            max_tokens=256,
            response_format={"type": "json_object"}
        )
        return json.loads(response.choices[0].message.content)
    except Exception as e:
        print(f"AI parsing error: {e}")
        return {"intent": "other", "items": {}, "response": ""}

# ─── ORDER MANAGEMENT ─────────────────────────────────────────────────────────
def add_items_to_order(items: dict):
    global cart, cart_total, current_order_id
    
    added = []
    missing = []
    
    for name, qty in items.items():
        itm, price = get_item(name)
        if itm and price:
            subtotal = price * qty
            cart.append({"item": itm, "qty": qty, "subtotal": subtotal})
            cart_total += subtotal
            
            orders_col.update_one(
                {"_id": current_order_id},
                {"$push": {"items": {"item": itm, "qty": qty, "price": price}}}
            )
            orders_col.update_one(
                {"_id": current_order_id},
                {"$inc": {"total": subtotal}}
            )
            # Include Hindi name in response
            hindi_name = hindi_map.get(itm, itm)
            added.append(f"{qty} {itm} ({hindi_name})")
        else:
            missing.append(name)
    
    return added, missing

def confirm_order():
    global order_in_progress
    
    if not cart:
        speak("Your cart is empty. Please add items first.")
        return False
    
    txn_id = process_upi_payment(cart_total)
    
    if txn_id:
        orders_col.update_one(
            {"_id": current_order_id},
            {"$set": {"status": "paid", "txn": txn_id}}
        )
        speak(f"Order placed successfully! Transaction ID: {txn_id}")
        order_in_progress = False
        return True
    else:
        orders_col.update_one(
            {"_id": current_order_id},
            {"$set": {"status": "payment_failed"}}
        )
        speak("Payment failed. Please try again.")
        return False

def cancel_order():
    global order_in_progress
    orders_col.update_one(
        {"_id": current_order_id},
        {"$set": {"status": "cancelled"}}
    )
    speak("Order cancelled.")
    order_in_progress = False
    return True

# ─── UPI PAYMENT ───────────────────────────────────────────────────────────────
def process_upi_payment(amount: int) -> str:
    speak(f"Please say your 4-digit UPI PIN for payment of ₹{amount}")
    
    for attempt in range(3):
        pin_cmd = listen()
        if not pin_cmd:
            if attempt < 2:
                speak("I didn't hear your PIN. Please try again.")
            continue
        
        digits = re.findall(r'\d', pin_cmd)
        pin = ''.join(digits[:4]) if digits else ""
        
        if len(pin) == 4 and pin.isdigit():
            speak("Processing payment...")
            time.sleep(1)
            return f"UPI-{random.randint(100000, 999999)}"
        else:
            number_words = {
                "zero": "0", "one": "1", "two": "2", "three": "3", "four": "4",
                "five": "5", "six": "6", "seven": "7", "eight": "8", "nine": "9",
                "ek": "1", "do": "2", "teen": "3", "char": "4", "panch": "5",
                "che": "6", "saat": "7", "aath": "8", "nau": "9", "das": "10"
            }
            words = pin_cmd.split()
            digits = [number_words[word] for word in words if word in number_words]
            pin = ''.join(digits[:4]) if digits else ""
            
            if len(pin) == 4 and pin.isdigit():
                speak("Processing payment...")
                time.sleep(1)
                return f"UPI-{random.randint(100000, 999999)}"
            
            if attempt < 2:
                speak("Invalid PIN format. Please say 4 digits like '1 2 3 4' or 'ek do teen char'")

# ─── MAIN HANDLER ─────────────────────────────────────────────────────────────
def handle_command(cmd: str):
    global order_in_progress, current_order_id
    
    # Use AI for complex command parsing
    parsed = ai_parse_intent(cmd)
    print("AI Parsed:", parsed)
    
    intent = parsed.get("intent", "other")
    items = parsed.get("items", {})
    
    # Handle immediate responses from AI
    if parsed.get("response"):
        speak(parsed["response"])
    
    # Handle order initiation
    if intent == "add" or ("order" in cmd and not order_in_progress):
        if not order_in_progress:
            current_order_id = init_order()
        
        if items:
            added, missing = add_items_to_order(items)
            if added:
                speak(f"Added {', '.join(added)}.")
            if missing:
                speak(f"Couldn't find: {', '.join(missing)}")
            
            speak(f"Current total: ₹{cart_total}. Say 'confirm order' when ready to pay.")
    
    elif intent == "confirm":
        if not order_in_progress:
            speak("No active order. Say 'I want to order' to start.")
            return
        confirm_order()
    
    elif intent == "cancel":
        if not order_in_progress:
            speak("No active order to cancel.")
            return
        cancel_order()
    
    elif intent == "payment":
        if not order_in_progress:
            speak("No active order. Start an order first.")
            return
        txn_id = process_upi_payment(cart_total)
        if txn_id:
            orders_col.update_one(
                {"_id": current_order_id},
                {"$set": {"status": "paid", "txn": txn_id}}
            )
            speak(f"Payment successful! Transaction ID: {txn_id}")
            order_in_progress = False
    
    elif intent == "help":
        speak("Here's what I can help with:\n"
             "- Add items: 'Add milk and bread', 'I want eggs', 'Mujhe doodh chahiye'\n"
             "- Complete order: 'Confirm order', 'Proceed to payment', 'Order karo'\n"
             "- Cancel: 'Cancel order', 'Order band karo'\n"
             "- Product info: 'What fruits do you have?', 'Price of milk', 'Seb ka daam kya hai?'")
    
    # Handle queries using AI directly
    elif intent == "query":
        # Response already handled by AI parser
        pass

# ─── MAIN LOOP ────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    speak("Namaste! Welcome to Grocery Assistant. Say 'I want to order' or 'Mujhe saman chahiye' to start.")
    
    while True:
        cmd = listen()
        if not cmd:
            continue
        
        # Handle exit commands
        if any(k in cmd for k in ("exit", "quit", "band karo", "stop", "goodbye", "alvida")):
            if order_in_progress:
                orders_col.update_one(
                    {"_id": current_order_id},
                    {"$set": {"status": "cancelled"}}
                )
            speak("Dhanyavaad! Thank you for using Grocery Assistant. Goodbye!")
            break
        
        handle_command(cmd)