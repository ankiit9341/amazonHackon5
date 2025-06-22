from datetime import datetime, timedelta
from fuzzywuzzy import fuzz
from .utils import get_expenses_collection
import os

# Helper to compare members
def members_equal(m1, m2):
    if len(m1) != len(m2):
        return False
    ids1 = sorted([m["user_id"] for m in m1])
    ids2 = sorted([m["user_id"] for m in m2])
    return ids1 == ids2

# 1) Duplicate if same payer, similar title+desc, similar amount, same members within 24h
def is_duplicate(title, desc, payer_id, amount, members, hours=24):
    cutoff = datetime.utcnow() - timedelta(hours=hours)
    recent = get_expenses_collection().find({
        "payer_id": payer_id,
        "created_at": {"$gte": cutoff}
    })

    for e in recent:
        if (fuzz.token_set_ratio(e["title"], title) > 80 and
            fuzz.token_set_ratio(e["description"], desc) > 80 and
            abs(e["amount"] - amount) < 1 and
            members_equal(e.get("members", []), members)):
            return True
    return False

# 2) High value rule
HIGH_VALUE = float(os.getenv("HIGH_VALUE_THRESHOLD", 10000))

def is_high_value(amount):
    return amount >= HIGH_VALUE

# Master function
def detect_fraud(title, desc, payer_id, amount, members):
    return {
        "duplicate":   is_duplicate(title, desc, payer_id, amount, members),
        "high_value":  is_high_value(amount)
    }
