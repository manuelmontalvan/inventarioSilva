from app.models.prophet_models import models
from app.services.inventory_service import get_current_stock_general
from cachetools import TTLCache
from datetime import datetime
import hashlib

# 1. Cache configurado con un TTL de 1 hora
prediction_cache = TTLCache(maxsize=1000, ttl=3600)  # 1000 entradas, 1 hora de duración

def make_cache_key(product_name: str, brand: str, unit: str, days: int) -> str:
    """
    Crea una llave hash única para cada combinación de parámetros.
    """
    raw_key = f"{product_name}:{brand}:{unit}:{days}"
    return hashlib.sha256(raw_key.encode()).hexdigest()


def get_forecast(product_name: str, brand: str, unit: str, days: int):
    cache_key = make_cache_key(product_name, brand, unit, days)

    # 2. Verificar si la predicción ya está en caché
    if cache_key in prediction_cache:
        return prediction_cache[cache_key]

    # 3. Obtener modelo
    key = (product_name, brand, unit)
    model = models.get(key)

    if not model:
        return None, None

    # 4. Predecir y construir respuesta
    future = model.make_future_dataframe(periods=days)
    forecast = model.predict(future)
    result = forecast[["ds", "yhat"]].tail(days).to_dict(orient="records")

    current_stock = get_current_stock_general(product_name, brand, unit)
    total_predicted = sum(item["yhat"] for item in result)
    alert_restock = total_predicted > current_stock

    # 5. Guardar en caché y retornar
    prediction_cache[cache_key] = (result, alert_restock)
    return result, alert_restock
