from app.models.prophet_models import models, metrics
from app.services.inventory_service import get_current_stock_general
from cachetools import TTLCache
from datetime import datetime, timedelta
import hashlib
from .nest_client import guardar_prediccion_en_nest
from .sales_service import get_last_month_sales
from math import sqrt
from .sales_service import get_sales_history
import pandas as pd


# 1. Cache configurado con un TTL de 1 hora
prediction_cache = TTLCache(maxsize=1000, ttl=3600)  # 1000 entradas, 1 hora de duración

def make_cache_key(product_name: str, brand: str, unit: str, days: int) -> str:
    """
    Crea una llave hash única para cada combinación de parámetros.
    """
    raw_key = f"{product_name}:{brand}:{unit}:{days}"
    return hashlib.sha256(raw_key.encode()).hexdigest()

def seleccionar_mejor_modelo(key):
    modelos = metrics.get(key)
    if not modelos:
        return "prophet"
    return min(modelos.items(), key=lambda x: x[1]["RMSE"])[0]


def get_forecast(product_name: str, brand: str, unit: str, days: int):
    cache_key = make_cache_key(product_name, brand, unit, days)

    # 2. Verificar si la predicción ya está en caché
    if cache_key in prediction_cache:
        return prediction_cache[cache_key]

    # 3. Obtener modelo
    key = (product_name, brand, unit)
    modelo_seleccionado = seleccionar_mejor_modelo(key)
    model = models.get(key, {}).get(modelo_seleccionado)

    if not model:
        return None, None
    # Intentar recuperar cap del historial del modelo (si fue entrenado con logistic)
    if hasattr(model, "history") and "cap" in model.history:
        cap_value = model.history["cap"].max()
    else:
        cap_value = 100  # fallback si no existe 'cap'
        print(f"⚠️ Cap no encontrado para {key}, usando fallback = {cap_value}")
    
    # Generar predicción según modelo
    if modelo_seleccionado == "prophet":
        cap_value = model.history['cap'].max() if "cap" in model.history else 100
        future = model.make_future_dataframe(periods=days)
        future['cap'] = cap_value
        future['floor'] = 0
        forecast = model.predict(future)
        result_df = forecast[['ds', 'yhat']].tail(days)

    elif modelo_seleccionado == "linear":
        last_date = datetime.today()
        dates = [last_date + timedelta(days=i) for i in range(1, days + 1)]
        timestamps = [[d.toordinal()] for d in dates]
        yhat = model.predict(timestamps)
        result_df = pd.DataFrame({
            "ds": [d.strftime("%Y-%m-%d") for d in dates],
            "yhat": yhat
        })

    elif modelo_seleccionado == "arima":
        forecast = model.predict(n_periods=days)
        last_date = datetime.today()
        dates = [last_date + timedelta(days=i) for i in range(1, days + 1)]
        result_df = pd.DataFrame({
            "ds": [d.strftime("%Y-%m-%d") for d in dates],
            "yhat": forecast
        })

    else:
        print(f"⚠️ Tipo de modelo desconocido: {modelo_seleccionado}")
        return None, None


    # ⚠️ Conversión de Timestamp → string (para evitar error de serialización)
    # Después del bloque de predicción según modelo...

    if modelo_seleccionado == "prophet":
        result_df = forecast[["ds", "yhat"]].tail(days)
        result_df["yhat"] = result_df["yhat"].apply(lambda x: max(0, x))
        result_df["ds"] = result_df["ds"].dt.strftime("%Y-%m-%d")
        result = result_df.to_dict(orient="records")
    else:
        result_df["yhat"] = result_df["yhat"].apply(lambda x: max(0, x))
        result = result_df.to_dict(orient="records")


    current_stock = get_current_stock_general(product_name, brand, unit)
    total_predicted = sum(item["yhat"] for item in result)
    alert_restock = total_predicted > current_stock

    # 5. Guardar en caché y retornar
    prediction_cache[cache_key] = (result, alert_restock, modelo_seleccionado)
    return result, alert_restock, modelo_seleccionado


   
def get_forecast_all_models(product_name: str, brand: str, unit: str, days: int):
    from app.models.prophet_models import models
    from datetime import datetime, timedelta
    import pandas as pd

    key = (product_name, brand, unit)
    result_all = {}
    modelos = ["prophet", "linear", "arima"]

    for modelo in modelos:
        model = models.get(key, {}).get(modelo)
        if not model:
            continue

        try:
            if modelo == "prophet":
                future = model.make_future_dataframe(periods=days)
                future["cap"] = 100
                future["floor"] = 0
                forecast = model.predict(future)
                df = forecast[["ds", "yhat"]].tail(days)
                df["yhat"] = df["yhat"].apply(lambda x: max(0, x))
                df["ds"] = df["ds"].dt.strftime("%Y-%m-%d")

            elif modelo == "linear":
                last_date = datetime.today()
                dates = [last_date + timedelta(days=i) for i in range(1, days + 1)]
                timestamps = [[d.toordinal()] for d in dates]
                yhat = model.predict(timestamps)
                df = pd.DataFrame({
                    "ds": [d.strftime("%Y-%m-%d") for d in dates],
                    "yhat": yhat
                })
                df["yhat"] = df["yhat"].apply(lambda x: max(0, x))

            elif modelo == "arima":
                forecast = model.predict(n_periods=days)
                last_date = datetime.today()
                dates = [last_date + timedelta(days=i) for i in range(1, days + 1)]
                df = pd.DataFrame({
                    "ds": [d.strftime("%Y-%m-%d") for d in dates],
                    "yhat": forecast
                })
                df["yhat"] = df["yhat"].apply(lambda x: max(0, x))

            forecast_data = df.to_dict(orient="records")

            tendency = calcular_tendencia(forecast_data)
            metrics_calc = calcular_metricas_reales(product_name, brand, unit, forecast_data)

            from .sales_service import get_last_month_sales
            last_month_sales = get_last_month_sales(product_name, brand, unit)
            try:
                last_month_sales_float = float(last_month_sales)
            except (TypeError, ValueError):
                last_month_sales_float = 0.0

            projected_sales = sum(item["yhat"] for item in forecast_data)

            if last_month_sales_float > 0:
                percent_change = round(((projected_sales - last_month_sales_float) / last_month_sales_float) * 100, 2)
            else:
                percent_change = None

            from app.services.inventory_service import get_current_stock_general
            current_stock = get_current_stock_general(product_name, brand, unit)
            alert_restock = projected_sales > current_stock

            result_all[modelo] = {
                "forecast": forecast_data,
                "metrics": metrics_calc,
                "tendency": tendency,
                "alert_restock": alert_restock,
                "sales_last_month": last_month_sales_float,
                "projected_sales": projected_sales,
                "percent_change": percent_change,
                "current_quality": current_stock,

            }

        except Exception as e:
            print(f"❌ Error en modelo {modelo}: {e}")

    return {
        "product": product_name,
        "brand": brand,
        "unit": unit,
        "days": days,
        "forecasts": result_all
    }

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

def calcular_metricas_reales(product_name, brand, unit, forecast):
    sales_history = get_sales_history(product_name, brand, unit)
    sales_dict = {item["ds"]: item["y"] for item in sales_history}

    errors = []
    for pred in forecast:
        real = sales_dict.get(pred["ds"])
        if real is None:
            continue
        # Convertimos 'real' de Decimal a float para evitar error al restar con float
        error = float(real) - pred["yhat"]
        errors.append(error)

    if not errors:
        return {"MAE": 0.0, "RMSE": 0.0}

    mae = sum(abs(e) for e in errors) / len(errors)
    rmse = sqrt(sum(e**2 for e in errors) / len(errors))

    return {"MAE": round(mae, 2), "RMSE": round(rmse, 2)}

def generar_prediccion(product_name, brand, unit, days):
    # Obtener la predicción real
    result, alert_restock, model_type = get_forecast(product_name, brand, unit, days)
    if result is None:
        print("No hay modelo para el producto especificado.")
        return None

    # Calcular tendencia
    tendency = calcular_tendencia(result)

    # Calcular métricas
    metrics = calcular_metricas_reales(product_name, brand, unit, result)

    # Ventas del mes pasado
    last_month_sales = get_last_month_sales(product_name, brand, unit)
    try:
        last_month_sales_float = float(last_month_sales)
    except (TypeError, ValueError):
        last_month_sales_float = 0.0
    
    # Proyección total de ventas en los próximos días
    projected_sales = sum(item["yhat"] for item in result)  

    current_stock = get_current_stock_general(product_name, brand, unit)


    # Calcular variación porcentual (manejar caso 0)
    if last_month_sales > 0:
        
          percent_change = round(((projected_sales - last_month_sales_float) / last_month_sales_float) * 100, 2)
    else:
        percent_change = None  # o podrías usar 100.0 si quieres asumir una subida total

    print(f"Ventas mes anterior: {last_month_sales}")
    print(f"Proyección próxima: {projected_sales}")
    print(f"Variación: {percent_change}%")

    prediction_data = {
        "product": product_name,
        "brand": brand,
        "unit": unit,
        "days": days,
        "tendency": tendency,
        "alert_restock": alert_restock,
        "forecast": result,
        "metrics": metrics,
        "sales_last_month": last_month_sales,
        "projected_sales": projected_sales,
        "percent_change": percent_change, 
        "model_type": model_type,
         "current_quality": current_stock,
    }

    # Guardar la predicción en NestJS
    guardar_prediccion_en_nest(prediction_data)

    return prediction_data
