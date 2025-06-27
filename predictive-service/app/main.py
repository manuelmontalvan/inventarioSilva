from fastapi import FastAPI
from app.train import train_model_from_csv

app = FastAPI()

model = train_model_from_csv("app/dummy_data.csv")

@app.get("/predict")
def predict(days: int = 7):
    future = model.make_future_dataframe(periods=days)
    forecast = model.predict(future)
    # Solo retornamos fechas y predicciones estimadas para los últimos días
    return forecast[['ds', 'yhat']].tail(days).to_dict(orient="records")
