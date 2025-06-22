import os
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()
MONGO_URI = os.getenv("MONGO_URI")
DB_NAME  = os.getenv("DB_NAME", "powercardDB")

client = MongoClient(MONGO_URI)
db     = client[DB_NAME]

def get_expenses_collection():
    return db["split_expenses"]
