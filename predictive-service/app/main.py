from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from train import train_models_from_db

app = FastAPI()

# Habilitar CORS para permitir peticiones desde el frontend (Next.js)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # ⚠️ En producción cambia esto a ["https://tu-frontend.com"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Entrenar modelos Prophet al iniciar la aplicación
try:
    models = train_models_from_db()
    print("✅ Modelos Prophet entrenados correctamente")
except Exception as e:
    print(f"❌ Error entrenando modelos Prophet: {e}")
    models = {}

# Ruta de predicción
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
        return JSONResponse(
            status_code=404,
            content={"error": f"No model trained for: {key}"}
        )

    future = model.make_future_dataframe(periods=days)
    forecast = model.predict(future)
    result = forecast[["ds", "yhat"]].tail(days).to_dict(orient="records")
    return result
