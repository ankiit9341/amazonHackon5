# Optional: train an anomaly model on historical amounts
import pickle
from sklearn.ensemble import IsolationForest
import pandas as pd
from .utils import get_expenses_collection

def train_model():
    df = pd.DataFrame(
        list(get_expenses_collection().find({}, {"amount":1, "_id":0}))
    )
    X = df[["amount"]].values
    model = IsolationForest(contamination=0.01, random_state=42)
    model.fit(X)
    with open("fraudForSplit/fraud_model.pkl", "wb") as f:
        pickle.dump(model, f)
    print("Anomaly model trained.")
    
if __name__ == "__main__":
    train_model()
