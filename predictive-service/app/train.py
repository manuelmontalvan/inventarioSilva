from prophet import Prophet
import pandas as pd

def train_model_from_csv(path: str):
    df = pd.read_csv(path)
    model = Prophet()
    model.fit(df)
    return model
