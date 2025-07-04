from fastapi import APIRouter, Query, HTTPException
from fastapi.responses import StreamingResponse
from app.models.prophet_models import models
from app.services.prediction_service import get_forecast, generar_prediccion  # ← se incluye generar_prediccion
from app.services.export_service import create_forecast_excel
from app.models.prophet_models import metrics
from app.utils.logging_config import logger  # ← nuevo import

router = APIRouter()


def get_tendency(forecast: list[dict]) -> str:
    if len(forecast) < 2:
        return "desconocida"
    
    first = forecast[0]["yhat"]
    last = forecast[-1]["yhat"]

    if last > first * 1.1:
        return "creciente"
    elif last < first * 0.9:
        return "decreciente"
    else:
        return "estable"


def validate_input_params(product_name: str, brand: str, unit: str):
    if not product_name.strip():
        logger.warning("Parámetro vacío: product_name")
        raise HTTPException(status_code=400, detail="El nombre del producto no puede estar vacío.")
    if not brand.strip():
        logger.warning("Parámetro vacío: brand")
        raise HTTPException(status_code=400, detail="La marca no puede estar vacía.")
    if not unit.strip():
        logger.warning("Parámetro vacío: unit")
        raise HTTPException(status_code=400, detail="La unidad de medida no puede estar vacía.")


@router.get("/predict")
def predict(
    product_name: str = Query(..., min_length=1),
    brand: str = Query("Sin marca", min_length=1),
    unit: str = Query("Sin unidad", min_length=1),
    days: int = Query(7, ge=1, le=60)
):
    try:
        validate_input_params(product_name, brand, unit)

        # Ahora usamos la función completa que incluye guardado automático
        prediction_data = generar_prediccion(product_name, brand, unit, days)

        if prediction_data is None:
            logger.error(f"Modelo no encontrado: {product_name} - {brand} - {unit}")
            raise HTTPException(status_code=404, detail="No se encontró un modelo entrenado para este producto.")

        logger.info(f"Predicción exitosa para {product_name} - {brand} - {unit}")

        return {
            "success": True,
            **prediction_data
        }
    
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.exception(f"Error inesperado durante la predicción: {e}")
        raise HTTPException(status_code=500, detail="Ocurrió un error interno al generar la predicción.")


@router.get("/predict/models")
def list_available_models():
    return {
        "success": True,
        "models": [
            {
                "product_name": product,
                "brand": brand,
                "unit": unit,
            }
            for (product, brand, unit) in models.keys()
        ]
    }


@router.get("/predict/export")
def export_forecast_excel(
    product_name: str = Query(..., min_length=1),
    brand: str = Query("Sin marca", min_length=1),
    unit: str = Query("Sin unidad", min_length=1),
    days: int = Query(7, ge=1, le=60),
):
    try:
        validate_input_params(product_name, brand, unit)

        forecast, alert_restock = get_forecast(product_name, brand, unit, days)

        if not forecast:
            logger.error(f"Exportación fallida: modelo no encontrado para {product_name} - {brand} - {unit}")
            raise HTTPException(status_code=404, detail="Modelo no encontrado o sin datos.")

        excel_file = create_forecast_excel(forecast, alert_restock)
        filename = f"forecast_{product_name}_{brand}_{unit}.xlsx"

        logger.info(f"Exportación de Excel completada: {filename}")

        return StreamingResponse(
            excel_file,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": f"attachment; filename={filename}"},
        )
    except Exception as e:
        logger.exception(f"Error inesperado al exportar predicción: {e}")
        raise HTTPException(status_code=500, detail="Ocurrió un error al exportar el archivo.")


@router.get("/metrics")
def get_metrics():
    if not metrics:
        logger.warning("Métricas vacías. Se requiere entrenamiento previo.")
        return {
            "success": False,
            "message": "No hay métricas disponibles. Entrena los modelos primero."
        }

    logger.info(f"{len(metrics)} métricas devueltas correctamente.")
    return {
        "success": True,
        "metrics": metrics
    }
