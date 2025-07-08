# app/routes/compare_route.py

from fastapi import APIRouter, Query
from app.services.prediction_service import get_forecast
from app.models.prophet_models import models  # Aquí viven los modelos entrenados

router = APIRouter()

@router.get("/compare")
def compare_forecasts(
    brand: str = Query("Sin marca"),
    unit: str = Query("Sin unidad"),
    days: int = Query(7, ge=1, le=60),
):
    results = []

    # Obtener todos los productos entrenados como tuplas (product_name, brand, unit)
    unique_keys = list(models.keys())

    for product_name, brand_name, unit_name in unique_keys:
        # Si se filtró por brand o unit, saltar si no coinciden
        if brand != "Sin marca" and brand_name != brand:
            continue
        if unit != "Sin unidad" and unit_name != unit:
            continue

        forecast, _ = get_forecast(product_name, brand_name, unit_name, days)

        if not forecast:
            continue

        total = sum(item["yhat"] for item in forecast)

        results.append({
            "product": product_name,
            "brand": brand_name,
            "unit": unit_name,
            "total_forecast": total,
            "forecast": forecast
        })

    results.sort(key=lambda x: x["total_forecast"], reverse=True)

    return {
        "success": True,
        "comparison": results
    }
