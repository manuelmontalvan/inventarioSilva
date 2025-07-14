from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.routes.predict_route import router as predict_router
from app.routes.compare_route import router as compare_router
from app.models.prophet_models import train_models_from_db, models
from app.scheduler import scheduler, retrain_models_job
from contextlib import asynccontextmanager
from app.middleware.api_key import APIKeyMiddleware


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        train_models_from_db()
        print("✅ Modelos Prophet entrenados correctamente")
    except Exception as e:
        print(f"❌ Error entrenando modelos Prophet: {e}")

    scheduler.start()
    retrain_models_job()
    print(f"Modelos cargados: {list(models.keys())[:5]}")  # Mostrar solo algunos keys para no saturar logs

    yield
    print("🛑 Apagando scheduler...")
    scheduler.shutdown()

app = FastAPI(lifespan=lifespan)
app.add_middleware(APIKeyMiddleware)
# 🔐 Middlewares
app.add_middleware(
    CORSMiddleware,
     allow_origins=[
        "https://inventario-silva.vercel.app",
        "http://localhost:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 📦 Rutas
app.include_router(predict_router)
app.include_router(compare_router)

# 🏠 Ruta raíz
@app.get("/")
def root():
    return {"message": "API de predicción funcionando"}
