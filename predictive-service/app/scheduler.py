# app/scheduler.py
from apscheduler.schedulers.background import BackgroundScheduler
from app.models.prophet_models import train_models_from_db
import logging

scheduler = BackgroundScheduler()
models = {}  # ⬅️ Aquí se almacenan los modelos entrenados
metrics = {}
def retrain_models_job():
    global models
    try:
        print("🔁 Iniciando reentrenamiento semanal de modelos Prophet...")
        models = train_models_from_db()
        print("✅ Modelos reentrenados con éxito")
    except Exception as e:
        logging.error(f"❌ Error en reentrenamiento automático: {e}")

# Ejecutar todos los lunes a las 3 AM
scheduler.add_job(retrain_models_job, 'cron', day_of_week='mon', hour=3, minute=0)
