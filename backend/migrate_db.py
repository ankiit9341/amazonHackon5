from pymongo import MongoClient

# Local Mongo
local = MongoClient("mongodb://localhost:27017")["powercardDB"]

# Remote Mongo (Atlas)
remote = MongoClient("mongodb+srv://chaitanya:humptydumpty@hackon.g4rihvd.mongodb.net/powercardDB")["powercardDB"]

# Collections to migrate
collections = ["users", "requests", "escrow", "transactions"]

for coll_name in collections:
    local_coll = local[coll_name]
    remote_coll = remote[coll_name]
    
    data = list(local_coll.find())
    if data:
        remote_coll.insert_many(data)

print("✅ Migration complete.")
