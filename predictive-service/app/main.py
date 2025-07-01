from fastapi import FastAPI, Query
from train import train_models_from_db

app = FastAPI()

models = train_models_from_db()

@app.get("/predict")
def predict(
    product_name: str,
    brand: str = "Sin marca",
    unit: str = "Sin unidad",
    days: int = 7,
):
    key = (product_name, brand, unit)
    model = models.get(key)

    if not model:
        return {"error": f"No model trained for: {key}"}

    future = model.make_future_dataframe(periods=days)
    forecast = model.predict(future)
    result = forecast[["ds", "yhat"]].tail(days).to_dict(orient="records")
    return result
