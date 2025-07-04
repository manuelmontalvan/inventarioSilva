from app.models.prophet_models import models
from app.services.inventory_service import get_current_stock_general
from cachetools import TTLCache
from datetime import datetime
import hashlib
from .nest_client import guardar_prediccion_en_nest
from .sales_service import get_last_month_sales

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

    # ⚠️ Conversión de Timestamp → string (para evitar error de serialización)
    result_df = forecast[["ds", "yhat"]].tail(days)
    result_df["ds"] = result_df["ds"].dt.strftime("%Y-%m-%d")
    result = result_df.to_dict(orient="records")

    current_stock = get_current_stock_general(product_name, brand, unit)
    total_predicted = sum(item["yhat"] for item in result)
    alert_restock = total_predicted > current_stock

    # 5. Guardar en caché y retornar
    prediction_cache[cache_key] = (result, alert_restock)
    return result, alert_restock


def calcular_tendencia(result):
    """
    Ejemplo simple para calcular tendencia basada en la pendiente de los últimos días.
    """
    if not result or len(result) < 2:
        return "estable"

    diffs = [result[i]["yhat"] - result[i-1]["yhat"] for i in range(1, len(result))]
    avg_diff = sum(diffs) / len(diffs)

    if avg_diff > 0.1:
        return "creciente"
    elif avg_diff < -0.1:
        return "decreciente"
    else:
        return "estable"


def calcular_metricas():
    """
    Aquí deberías calcular las métricas reales de error, por ahora ejemplo fijo.
    """
    return {"MAE": 10.0, "RMSE": 12.5}


def generar_prediccion(product_name, brand, unit, days):
    # Obtener la predicción real
    result, alert_restock = get_forecast(product_name, brand, unit, days)

    if result is None:
        print("No hay modelo para el producto especificado.")
        return None

    # Calcular tendencia
    tendency = calcular_tendencia(result)

    
    # Calcular métricas (ajustar según tus datos)
    metrics = calcular_metricas()
    last_month_sales = get_last_month_sales(product_name, brand, unit) 
    print(f"Ventas mes anterior: {last_month_sales}")
    prediction_data = {
        "product": product_name,
        "brand": brand,
        "unit": unit,
        "days": days,
        "tendency": tendency,
        "alert_restock": alert_restock,
        "forecast": result,
        "metrics": metrics
    }

    # Guardar la predicción en NestJS
    guardar_prediccion_en_nest(prediction_data)

    return prediction_data
