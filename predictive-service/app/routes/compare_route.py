# app/routes/compare_route.py
from fastapi import APIRouter, Query
from app.services.prediction_service import get_forecast

router = APIRouter()

@router.get("/compare")
def compare_forecasts(
    products: list[str] = Query(..., description="Lista de nombres de productos"),
    brand: str = Query("Sin marca"),
    unit: str = Query("Sin unidad"),
    days: int = Query(7, ge=1, le=60),
):
    results = []

    for product_name in products:
        forecast = get_forecast(product_name, brand, unit, days)
        if not forecast:
            continue

        total = sum(item["yhat"] for item in forecast)
        results.append({
            "product": product_name,
            "brand": brand,
            "unit": unit,
            "total_forecast": total,
            "forecast": forecast
        })

    # Ordenar por mayor predicción
    results.sort(key=lambda x: x["total_forecast"], reverse=True)

    return {
        "success": True,
        "comparison": results
    }
