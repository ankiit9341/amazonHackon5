import speech_recognition as sr
import pyttsx3
import random
import json
import time

# Initialize text-to-speech engine
engine = pyttsx3.init()
engine.setProperty('rate', 150)  # Speed percent

# Simulated database of grocery items
grocery_db = {
    "milk": {"price": 60, "stock": 20, "category": "dairy"},
    "eggs": {"price": 100, "stock": 50, "category": "dairy"},
    "bread": {"price": 45, "stock": 30, "category": "bakery"},
    "apple": {"price": 80, "stock": 40, "category": "fruits"},
    "banana": {"price": 40, "stock": 60, "category": "fruits"},
    "rice": {"price": 120, "stock": 25, "category": "staples"},
}

# Simulated UPI payment function
def process_upi_payment(amount):
    """Simulate UPI payment processing"""
    print(f"\n[DEBUG] Initiating Hello UPI payment for ₹{amount}")
    time.sleep(1.5)
    transaction_id = "HELLO" + ''.join(random.choices('0123456789', k=12))
    print(f"[DEBUG] Payment successful! Transaction ID: {transaction_id}")
    return transaction_id

def speak(text):
    """Convert text to speech"""
    print(f"Assistant: {text}")
    engine.say(text)
    engine.runAndWait()

def listen_command():
    """Capture voice input from user"""
    r = sr.Recognizer()
    with sr.Microphone() as source:
        print("\nListening for command...")
        r.adjust_for_ambient_noise(source)
        audio = r.listen(source, timeout=8)
        
    try:
        command = r.recognize_google(audio).lower()
        print(f"User: {command}")
        return command
    except sr.UnknownValueError:
        return ""
    except sr.RequestError:
        speak("Sorry, I'm having trouble connecting to the internet")
        return ""
    except sr.WaitTimeoutError:
        speak("I didn't hear anything. Please try again.")
        return ""

def process_order(command):
    """Process voice command and place order"""
    # Find items from command
    order_items = []
    for item in grocery_db:
        if item in command:
            order_items.append(item)
    
    if not order_items:
        speak("I couldn't find any grocery items in your request")
        return
    
    # Calculate total amount
    total = sum(grocery_db[item]["price"] for item in order_items)
    
    # Confirm order
    item_list = ", ".join(order_items)
    speak(f"I found {len(order_items)} items: {item_list}. Total is ₹{total}. Should I place the order?")
    
    # Get confirmation
    confirmation = listen_command()
    if any(keyword in confirmation for keyword in ["yes", "confirm", "proceed"]):
        # Process payment
        transaction_id = process_upi_payment(total)
        speak(f"Order placed successfully! Hello UPI transaction ID: {transaction_id}")
        
        # Generate receipt
        receipt = {
            "order_id": random.randint(1000, 9999),
            "items": order_items,
            "total": total,
            "transaction_id": transaction_id,
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
        }
        print("\n--- ORDER RECEIPT ---")
        print(json.dumps(receipt, indent=2))
    else:
        speak("Order cancelled")

if __name__ == "__main__":
    speak("Welcome to Grocery Assistant! You can order items like milk, eggs, bread, apple, banana, or rice")
    
    while True:
        try:
            command = listen_command()
            
            if "exit" in command or "quit" in command:
                speak("Goodbye!")
                break
                
            if "order" in command or "buy" in command:
                process_order(command)
                
            elif command:
                speak("I can help you order groceries. Say something like 'I want to buy milk and eggs'")
                
        except KeyboardInterrupt:
            print("\nExiting...")
            break