# import os
# import time
# import json
# import random
# import threading
# import re
# import datetime
# import traceback
# import queue
# import uuid
# import logging

# import speech_recognition as sr
# import pyttsx3
# from dotenv import load_dotenv
# from groq import Groq
# from pymongo import MongoClient

# # Configure logging
# logging.basicConfig(
#     level=logging.INFO,
#     format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
#     handlers=[
#         logging.FileHandler("voice_assistant.log"),
#         logging.StreamHandler()
#     ]
# )
# logger = logging.getLogger("VoiceAssistant")

# # Global state management
# class VoiceAssistantState:
#     def __init__(self):
#         self.groq = None
#         self.db_client = None
#         self.orders_col = None
#         self.history = []
#         self.cart = []
#         self.cart_total = 0
#         self.current_order_id = None
#         self.order_in_progress = False
#         self.is_running = False
#         self.indian_voice_id = None
#         self.tts_lock = threading.Lock()
#         self.speech_queue = queue.Queue()
#         self.speech_thread = None
#         self.session_id = str(uuid.uuid4())
#         self.user_name = None
#         self.last_interaction = datetime.datetime.now()
        
#         # Hindi names for items
#         self.hindi_map = {
#             "milk": "doodh", "cheese": "cheese", "yogurt": "dahi", 
#             "butter": "makhan", "eggs": "ande", "apple": "seb",
#             "banana": "kela", "orange": "santara", "grapes": "angoor",
#             "mango": "aam", "bread": "double roti", "tomato": "tamatar",
#             "potato": "aaloo", "sugar": "cheeni"
#         }
        
#         # Updated catalog with only the specified products
#         # Prices converted to rupees (approx 1 USD = 75 INR)
#         self.catalog = {
#             "dairy": {
#                 "milk": 262,       # $3.49 → ₹262
#                 "cheese": 374,      # $4.99 → ₹374
#                 "yogurt": 224,      # $2.99 → ₹224
#                 "butter": 284,      # $3.79 → ₹284
#                 "eggs": 187         # $2.49 → ₹187
#             },
#             "fruits": {
#                 "apple": 97,        # $1.29 → ₹97
#                 "banana": 37,       # $0.49 → ₹37
#                 "orange": 89,       # $1.19 → ₹89
#                 "grapes": 224,      # $2.99 → ₹224
#                 "mango": 142        # $1.89 → ₹142
#             },
#             "bakery": {
#                 "bread": 224        # $2.99 → ₹224
#             },
#             "vegetables": {
#                 "tomato": 134,      # $1.79 → ₹134
#                 "potato": 74         # $0.99 → ₹74
#             },
#             "staples": {
#                 "sugar": 337        # $4.49 → ₹337
#             }
#         }
        
#         # Initialize TTS engine once
#         self.initialize_tts_engine()
        
#         # Start speech processing thread
#         self.start_speech_thread()

#     def initialize_tts_engine(self):
#         """Initialize TTS engine once"""
#         try:
#             self.engine = pyttsx3.init()
#             self.engine.setProperty("rate", 150)
            
#             # Find Indian voice once
#             for voice in self.engine.getProperty('voices'):
#                 if 'india' in voice.id.lower() or 'indian' in voice.id.lower():
#                     self.indian_voice_id = voice.id
#                     self.engine.setProperty('voice', self.indian_voice_id)
#                     logger.info("Indian voice found")
#                     break
#         except Exception as e:
#             logger.error(f"Error initializing TTS engine: {e}")
#             self.engine = None

#     def start_speech_thread(self):
#         """Start background thread for speech processing"""
#         self.speech_thread = threading.Thread(target=self.process_speech_queue, daemon=True)
#         self.speech_thread.start()

#     def process_speech_queue(self):
#         """Process speech messages from queue"""
#         while True:
#             text = self.speech_queue.get()
#             if text is None:  # Sentinel value to stop thread
#                 break
                
#             try:
#                 with self.tts_lock:
#                     logger.info(f"Speaking: {text}")
#                     self.engine.say(text)
#                     self.engine.runAndWait()
#             except RuntimeError as e:
#                 if "run loop already started" in str(e):
#                     logger.warning("TTS engine busy, retrying after delay")
#                     time.sleep(0.5)
#                     try:
#                         with self.tts_lock:
#                             self.engine.say(text)
#                             self.engine.runAndWait()
#                     except Exception as e:
#                         logger.error(f"TTS retry failed: {e}")
#                 else:
#                     logger.error(f"TTS error: {e}")
#             except Exception as e:
#                 logger.error(f"TTS error: {e}")
#             finally:
#                 self.speech_queue.task_done()

#     def add_to_speech_queue(self, text):
#         """Add text to speech queue"""
#         if text and self.engine:
#             self.speech_queue.put(text)
            
#     def stop_speech_thread(self):
#         """Stop the speech processing thread"""
#         self.speech_queue.put(None)
#         self.speech_thread.join()

# # Create a single instance
# assistant_state = VoiceAssistantState()

# # ─── INITIALIZATION ────────────────────────────────────────────────────────────
# def initialize_services():
#     """Initialize all required services and connections"""
#     load_dotenv()
#     API_KEY = os.getenv("GROQ_API_KEY")
#     MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
    
#     if not API_KEY:
#         raise ValueError("❌ Please set GROQ_API_KEY in your .env")
    
#     # Initialize Groq client
#     assistant_state.groq = Groq(api_key=API_KEY)
    
#     # Initialize MongoDB
#     assistant_state.db_client = MongoClient(MONGO_URI)
#     db = assistant_state.db_client["grocery_bot"]
#     assistant_state.orders_col = db["orders"]
    
#     # Initialize history
#     assistant_state.history = [{
#         "role": "system",
#         "content": "You are a helpful grocery ordering assistant for Indian customers. "
#                    "Be concise and handle multiple items in single commands. "
#                    "For ambiguous items, suggest alternatives from the catalog. "
#                    "Always confirm added items and current total. "
#                    "Use ₹ for prices and include Hindi translations for items. "
#                    "Available products: Milk, Cheese, Yogurt, Butter, Eggs, Apple, "
#                    "Banana, Orange, Grapes, Mango, Bread, Tomato, Potato, Sugar. "
#                    "You can greet the user by name if they provide it. "
#                    "After completing an order, thank the user and exit gracefully."
#     }]

# # ─── SPEECH FUNCTIONS ──────────────────────────────────────────────────────────
# def speak(text: str):
#     """Improved text-to-speech with Indian pronunciation"""
#     if not text or not assistant_state.engine:
#         return
        
#     # Preprocess text for better pronunciation
#     text = re.sub(r'₹(\d+(\.\d+)?)', r'\1 rupees', text)
#     text = re.sub(r'#(\d+)', r'number \1', text)
#     text = text.replace("UPI-", "U P I ")
    
#     logger.info(f"Assistant: {text}")
#     assistant_state.history.append({"role": "assistant", "content": text})
    
#     # Add to speech queue
#     assistant_state.add_to_speech_queue(text)

# def listen() -> str:
#     """Enhanced voice recognition with Indian English support"""
#     r = sr.Recognizer()
#     with sr.Microphone() as mic:
#         logger.info("\n🎤 Listening...")
#         try:
#             r.adjust_for_ambient_noise(mic, duration=0.2)
#             audio = r.listen(mic, timeout=8, phrase_time_limit=7)
#         except sr.WaitTimeoutError:
#             return ""
    
#     try:
#         # Use Indian English language model
#         cmd = r.recognize_google(audio, language="en-IN").lower()
#         logger.info(f"User: {cmd}")
#         assistant_state.history.append({"role": "user", "content": cmd})
#         assistant_state.last_interaction = datetime.datetime.now()
#         return cmd
#     except sr.UnknownValueError:
#         return ""
#     except Exception as e:
#         logger.error(f"Recognition error: {e}")
#         return ""

# # ─── ORDER FUNCTIONS ───────────────────────────────────────────────────────────
# def init_order():
#     """Create a new order in the database"""
#     order = {
#         "items": [],
#         "total": 0,
#         "status": "open",
#         "created_at": datetime.datetime.now().isoformat(),
#         "session_id": assistant_state.session_id,
#         "user_name": assistant_state.user_name
#     }
#     res = assistant_state.orders_col.insert_one(order)
#     assistant_state.current_order_id = str(res.inserted_id)
#     assistant_state.cart = []
#     assistant_state.cart_total = 0
#     assistant_state.order_in_progress = True
#     return assistant_state.current_order_id

# def add_items_to_order(items: dict):
#     """Add items to current order"""
#     added = []
#     missing = []
    
#     for name, qty in items.items():
#         itm, price = get_item(name)
#         if itm and price:
#             subtotal = price * qty
#             assistant_state.cart.append({"item": itm, "qty": qty, "subtotal": subtotal})
#             assistant_state.cart_total += subtotal
            
#             assistant_state.orders_col.update_one(
#                 {"_id": assistant_state.current_order_id},
#                 {"$push": {"items": {"item": itm, "qty": qty, "price": price}}}
#             )
#             assistant_state.orders_col.update_one(
#                 {"_id": assistant_state.current_order_id},
#                 {"$inc": {"total": subtotal}}
#             )
#             # Include Hindi name in response
#             hindi_name = assistant_state.hindi_map.get(itm, itm)
#             added.append(f"{qty} {itm} ({hindi_name})")
#         else:
#             missing.append(name)
    
#     return added, missing

# def confirm_order():
#     """Finalize and pay for current order"""
#     if not assistant_state.cart:
#         speak("Your cart is empty. Please add items first.")
#         return False
    
#     speak("Order confirmed. Please wait for payment processing.")
    
#     txn_id = process_upi_payment(assistant_state.cart_total)
    
#     if txn_id:
#         assistant_state.orders_col.update_one(
#             {"_id": assistant_state.current_order_id},
#             {"$set": {"status": "paid", "txn": txn_id}}
#         )
#         speak(f"Order placed successfully! Transaction ID: {txn_id}")
        
#         # Personalize thank you message
#         if assistant_state.user_name:
#             speak(f"Dhanyavaad {assistant_state.user_name}! Thank you for using Grocery Assistant. Your order will be delivered soon.")
#         else:
#             speak("Dhanyavaad! Thank you for using Grocery Assistant. Your order will be delivered soon.")
        
#         # Stop the assistant after successful payment
#         return True
#     else:
#         assistant_state.orders_col.update_one(
#             {"_id": assistant_state.current_order_id},
#             {"$set": {"status": "payment_failed"}}
#         )
#         speak("Payment failed. Please try again.")
#         return False

# def cancel_order():
#     """Cancel current order"""
#     assistant_state.orders_col.update_one(
#         {"_id": assistant_state.current_order_id},
#         {"$set": {"status": "cancelled"}}
#     )
#     speak("Order cancelled.")
#     assistant_state.order_in_progress = False
#     return True

# def list_cart():
#     """List items in the cart"""
#     if not assistant_state.cart:
#         speak("Your cart is empty.")
#         return
    
#     items = []
#     for item in assistant_state.cart:
#         hindi_name = assistant_state.hindi_map.get(item["item"], item["item"])
#         items.append(f"{item['qty']} {item['item']} ({hindi_name})")
    
#     speak("Here's what's in your cart:")
#     speak(", ".join(items))
#     speak(f"Total amount: ₹{assistant_state.cart_total}")

# # ─── AI UTILITIES ─────────────────────────────────────────────────────────────
# def ai_match_item(name: str) -> tuple:
#     """Use AI to match items with fuzzy logic and context awareness"""
#     context = "\n".join([f"{i['role']}: {i['content']}" for i in assistant_state.history[-3:]])
#     prompt = f"""
# You are an item matching assistant for a grocery store. 
# Available items: {list(assistant_state.catalog.keys())}

# Recent conversation:
# {context}

# User requested: "{name}"

# Perform these steps:
# 1. Identify possible item matches from catalog
# 2. If ambiguous, suggest top 3 similar items
# 3. Return JSON with format: 
# {{"match": "item_name", "alternatives": ["item1", "item2"]}}
# If no match, return {{"match": null}}
# """
#     try:
#         response = assistant_state.groq.chat.completions.create(
#             model="llama3-8b-8192",
#             messages=[{"role": "user", "content": prompt}],
#             temperature=0.3,
#             max_tokens=128,
#             response_format={"type": "json_object"}
#         )
#         result = json.loads(response.choices[0].message.content)
#         return result.get("match"), result.get("alternatives", [])
#     except Exception as e:
#         logger.error(f"AI matching error: {e}")
#         return None, []

# def get_item(name: str):
#     """Get item with AI-enhanced matching"""
#     # First try direct match
#     name = name.lower().strip()
#     for cat, items in assistant_state.catalog.items():
#         if name in items:
#             return name, items[name]
    
#     # Try AI matching
#     matched, alternatives = ai_match_item(name)
#     if matched:
#         matched = matched.lower()
#         for cat, items in assistant_state.catalog.items():
#             if matched in items:
#                 return matched, items[matched]
    
#     return None, None

# def ai_parse_intent(cmd: str) -> dict:
#     """Use AI to parse complex commands with multiple intents"""
#     context = "\n".join([f"{i['role']}: {i['content']}" for i in assistant_state.history[-4:]])
#     prompt = f"""
# You are an intent parser for a grocery ordering assistant. 
# Current order status: {"active" if assistant_state.order_in_progress else "inactive"}
# Cart items: {[item['item'] for item in assistant_state.cart] if assistant_state.cart else "empty"}
# User name: {assistant_state.user_name or "Not provided"}

# Available intents:
# - add: Add items to cart
# - confirm: Complete order
# - cancel: Cancel order
# - payment: Process payment
# - query: Ask about products
# - help: Get assistance
# - list: List cart contents
# - name: Capture user name

# Recent conversation:
# {context}

# User command: "{cmd}"

# Perform these steps:
# 1. Identify primary intent
# 2. Extract all items with quantities (default 1)
# 3. Handle multiple operations in single command
# 4. Return JSON format:
# {{
#   "intent": "add|confirm|cancel|payment|query|help|list|name",
#   "items": {{"item1": quantity, "item2": quantity}},
#   "response": "Immediate response if needed",
#   "user_name": "Extracted name if present"
# }}
# """
#     try:
#         response = assistant_state.groq.chat.completions.create(
#             model="llama3-8b-8192",
#             messages=[{"role": "user", "content": prompt}],
#             temperature=0.4,
#             max_tokens=256,
#             response_format={"type": "json_object"}
#         )
#         return json.loads(response.choices[0].message.content)
#     except Exception as e:
#         logger.error(f"AI parsing error: {e}")
#         return {"intent": "other", "items": {}, "response": ""}

# # ─── PAYMENT PROCESSING ───────────────────────────────────────────────────────
# def process_upi_payment(amount: int) -> str:
#     """Process UPI payment with voice PIN entry"""
#     speak(f"Please say your 4-digit UPI PIN for payment of ₹{amount}")
    
#     for attempt in range(3):
#         pin_cmd = listen()
#         if not pin_cmd:
#             if attempt < 2:
#                 speak("I didn't hear your PIN. Please try again.")
#             continue
        
#         digits = re.findall(r'\d', pin_cmd)
#         pin = ''.join(digits[:4]) if digits else ""
        
#         if len(pin) == 4 and pin.isdigit():
#             speak("Processing payment...")
#             time.sleep(1)
#             return f"UPI-{random.randint(100000, 999999)}"
#         else:
#             number_words = {
#                 "zero": "0", "one": "1", "two": "2", "three": "3", "four": "4",
#                 "five": "5", "six": "6", "seven": "7", "eight": "8", "nine": "9",
#                 "ek": "1", "do": "2", "teen": "3", "char": "4", "panch": "5",
#                 "che": "6", "saat": "7", "aath": "8", "nau": "9", "das": "10"
#             }
#             words = pin_cmd.split()
#             digits = [number_words[word] for word in words if word in number_words]
#             pin = ''.join(digits[:4]) if digits else ""
            
#             if len(pin) == 4 and pin.isdigit():
#                 speak("Processing payment...")
#                 time.sleep(1)
#                 return f"UPI-{random.randint(100000, 999999)}"
            
#             if attempt < 2:
#                 speak("Invalid PIN format. Please say 4 digits like '1 2 3 4' or 'ek do teen char'")
    
#     return None

# # ─── COMMAND HANDLER ───────────────────────────────────────────────────────────
# def handle_command(cmd: str):
#     """Process user command using AI parsing"""
#     # Use AI for complex command parsing
#     parsed = ai_parse_intent(cmd)
#     logger.info(f"AI Parsed: {json.dumps(parsed, indent=2)}")
    
#     intent = parsed.get("intent", "other")
#     items = parsed.get("items", {})
#     user_name = parsed.get("user_name", "")
    
#     # Capture user name
#     if user_name and not assistant_state.user_name:
#         assistant_state.user_name = user_name
#         speak(f"Nice to meet you, {user_name}! How can I help you today?")
    
#     # Handle immediate responses from AI
#     if parsed.get("response"):
#         speak(parsed["response"])
    
#     # Handle name capture
#     if intent == "name":
#         if user_name:
#             assistant_state.user_name = user_name
#             speak(f"Nice to meet you, {user_name}! How can I help you today?")
#         else:
#             speak("I didn't catch your name. Could you please tell me your name?")
    
#     # Handle order initiation
#     elif intent == "add" or ("order" in cmd and not assistant_state.order_in_progress):
#         if not assistant_state.order_in_progress:
#             assistant_state.current_order_id = init_order()
        
#         if items:
#             added, missing = add_items_to_order(items)
#             if added:
#                 speak(f"Added {', '.join(added)}.")
#             if missing:
#                 speak(f"Couldn't find: {', '.join(missing)}")
            
#             speak(f"Current total: ₹{assistant_state.cart_total}. Say 'confirm order' when ready to pay.")
    
#     elif intent == "confirm":
#         if not assistant_state.order_in_progress:
#             speak("No active order. Say 'I want to order' to start.")
#             return
        
#         if confirm_order():
#             # Order completed successfully
#             assistant_state.is_running = False
    
#     elif intent == "cancel":
#         if not assistant_state.order_in_progress:
#             speak("No active order to cancel.")
#             return
#         cancel_order()
    
#     elif intent == "payment":
#         if not assistant_state.order_in_progress:
#             speak("No active order. Start an order first.")
#             return
#         txn_id = process_upi_payment(assistant_state.cart_total)
#         if txn_id:
#             assistant_state.orders_col.update_one(
#                 {"_id": assistant_state.current_order_id},
#                 {"$set": {"status": "paid", "txn": txn_id}}
#             )
#             speak(f"Payment successful! Transaction ID: {txn_id}")
#             assistant_state.order_in_progress = False
    
#     elif intent == "help":
#         speak("Here's what I can help with:\n"
#              "- Add items: 'Add milk and bread', 'I want eggs', 'Mujhe doodh chahiye'\n"
#              "- Complete order: 'Confirm order', 'Proceed to payment', 'Order karo'\n"
#              "- Cancel: 'Cancel order', 'Order band karo'\n"
#              "- List cart: 'What's in my cart?', 'Show my items'\n"
#              "- Product info: 'What fruits do you have?', 'Price of milk', 'Seb ka daam kya hai?'\n"
#              "- Personalize: 'My name is [Your Name]'")
    
#     elif intent == "list":
#         list_cart()
    
#     elif intent == "query":
#         # Handle product queries
#         if "price" in cmd or "cost" in cmd:
#             for item_name in items:
#                 itm, price = get_item(item_name)
#                 if itm and price:
#                     hindi_name = assistant_state.hindi_map.get(itm, itm)
#                     speak(f"The price of {itm} ({hindi_name}) is ₹{price}.")
#         elif "have" in cmd or "available" in cmd:
#             speak("We have: milk, cheese, yogurt, butter, eggs, apple, banana, orange, grapes, mango, bread, tomato, potato, sugar.")
#         else:
#             speak("I can tell you about product prices and availability. What would you like to know?")

# # ─── MAIN VOICE ASSISTANT FUNCTION ─────────────────────────────────────────────
# def run_voice_assistant():
#     """Main function to run the voice assistant"""
#     try:
#         # Initialize if not already done
#         if assistant_state.groq is None:
#             initialize_services()
        
#         # Reset state for new session
#         assistant_state.session_id = str(uuid.uuid4())
#         assistant_state.history = [{
#             "role": "system",
#             "content": "You are a helpful grocery ordering assistant for Indian customers. "
#                        "Be concise and handle multiple items in single commands. "
#                        "For ambiguous items, suggest alternatives from the catalog. "
#                        "Always confirm added items and current total. "
#                        "Use ₹ for prices and include Hindi translations for items. "
#                        "Available products: Milk, Cheese, Yogurt, Butter, Eggs, Apple, "
#                        "Banana, Orange, Grapes, Mango, Bread, Tomato, Potato, Sugar. "
#                        "You can greet the user by name if they provide it. "
#                        "After completing an order, thank the user and exit gracefully."
#         }]
#         assistant_state.cart = []
#         assistant_state.cart_total = 0
#         assistant_state.current_order_id = None
#         assistant_state.order_in_progress = False
#         assistant_state.user_name = None
#         assistant_state.last_interaction = datetime.datetime.now()
        
#         assistant_state.is_running = True
        
#         # Personalized greeting
#         greeting = "Namaste! Welcome to Grocery Assistant."
#         if assistant_state.user_name:
#             greeting = f"Namaste {assistant_state.user_name}! Welcome back to Grocery Assistant."
        
#         speak(f"{greeting} Say 'I want to order' or 'Mujhe saman chahiye' to start.")
        
#         # Inactivity timer
#         inactivity_timer = threading.Timer(120, handle_inactivity)
#         inactivity_timer.start()
        
#         while assistant_state.is_running:
#             cmd = listen()
#             if not cmd:
#                 # Reset inactivity timer
#                 inactivity_timer.cancel()
#                 inactivity_timer = threading.Timer(120, handle_inactivity)
#                 inactivity_timer.start()
#                 continue
            
#             # Reset inactivity timer
#             inactivity_timer.cancel()
#             inactivity_timer = threading.Timer(120, handle_inactivity)
#             inactivity_timer.start()
            
#             # Handle exit commands
#             if any(k in cmd for k in ("exit", "quit", "band karo", "stop", "goodbye", "alvida")):
#                 if assistant_state.order_in_progress:
#                     assistant_state.orders_col.update_one(
#                         {"_id": assistant_state.current_order_id},
#                         {"$set": {"status": "cancelled"}}
#                     )
#                 speak("Dhanyavaad! Thank you for using Grocery Assistant. Goodbye!")
#                 break
            
#             handle_command(cmd)
            
#     except KeyboardInterrupt:
#         speak("Assistant shutting down. Goodbye!")
#     except Exception as e:
#         logger.error(f"Assistant error: {traceback.format_exc()}")
#         speak("I encountered an error. Restarting the assistant.")
#     finally:
#         assistant_state.is_running = False
#         # Clean up resources
#         if assistant_state.db_client:
#             assistant_state.db_client.close()
#         logger.info("Voice assistant session ended")

# def handle_inactivity():
#     """Handle user inactivity"""
#     if assistant_state.is_running:
#         speak("I haven't heard from you in a while. Are you still there?")
#         time.sleep(5)
#         response = listen()
#         if not response:
#             speak("It seems you're away. I'll close the assistant now. Say 'hello' when you're back!")
#             assistant_state.is_running = False
#         elif "yes" in response or "haan" in response:
#             speak("Great! How can I help you?")
#         else:
#             speak("Sorry, I didn't understand. How can I assist you?")

# def stop_voice_assistant():
#     """Stop the voice assistant gracefully"""
#     assistant_state.is_running = False
#     speak("Assistant is shutting down. Goodbye!")
#     time.sleep(1)  # Allow final message to finish
#     return True

# # ─── STANDALONE EXECUTION ─────────────────────────────────────────────────────
# if __name__ == "__main__":
#     run_voice_assistant()