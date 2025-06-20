from pymongo import MongoClient

uri = "mongodb+srv://chaitanya:humptydumpty@hackon.g4rihvd.mongodb.net/?retryWrites=true&w=majority&tls=true"

client = MongoClient(uri)

try:
    print("✅ Databases:", client.list_database_names())
except Exception as e:
    print("❌ Failed to connect:", e)
