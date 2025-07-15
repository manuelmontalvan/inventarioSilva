# app/routes/compare_route.py

from fastapi import APIRouter, Query
from app.models.prophet_models import models, metrics
from app.services.prediction_service import get_forecast_all_models
from typing import Dict
from datetime import datetime, timedelta
from app.services.inventory_service import get_current_stock_general
router = APIRouter()


@router.get("/compare")
def compare_forecasts(
    brand: str = Query("Sin marca"),
    unit: str = Query("Sin unidad"),
    days: int = Query(7, ge=1, le=60),
):
    results = []
    unique_keys = list(models.keys())
    print("🔍 Keys en modelos:", unique_keys)

    for product_name, brand_name, unit_name in unique_keys:
        if brand != "Sin marca" and brand_name != brand:
            continue
        if unit != "Sin unidad" and unit_name != unit:
            continue

        try:
            all_forecasts = get_forecast_all_models(product_name, brand_name, unit_name, days)
            
            if not all_forecasts or "forecasts" not in all_forecasts:
                continue

            model_forecasts = {}
            alert_restock = False
            current_quality = get_current_stock_general(product_name, brand_name, unit_name)

            for model_name, data in all_forecasts["forecasts"].items():
                forecast = data.get("forecast", [])
                total = sum(item["yhat"] for item in forecast)
                model_forecasts[model_name] = {
                    "total_forecast": round(total, 2),
                    "forecast": forecast,
                    "metrics": data.get("metrics"),
                }

                # Si algún modelo pronostica más que el stock actual, activa alerta
                if total > current_quality:
                    alert_restock = True

            # Calcular cantidad necesaria para reponer (máximo total_forecast menos stock)
            max_total_forecast = max(f["total_forecast"] for f in model_forecasts.values()) if model_forecasts else 0
            needed_stock = max(0, round(max_total_forecast - current_quality, 2))

            results.append({
                "product": product_name,
                "brand": brand_name,
                "unit": unit_name,
                "forecasts": model_forecasts,
                "current_quality": current_quality,
                "alert_restock": alert_restock,
                "needed_stock": needed_stock,
            })

        except Exception as e:
            print(f"Error procesando {product_name} ({brand_name}/{unit_name}): {e}")
            continue

    return {
        "success": True,
        "comparison": results
    }
