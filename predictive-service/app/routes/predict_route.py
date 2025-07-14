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
            "model_used": prediction_data.pop("model_type", "desconocido"),  # mostrar modelo
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

    resumen = []
    for key, model_metrics in metrics.items():
        best = min(model_metrics.items(), key=lambda x: x[1]["RMSE"])
        resumen.append({
            "product_name": key[0],
            "brand": key[1],
            "unit": key[2],
            "best_model": best[0],
            "MAE": round(best[1]["MAE"], 2),
            "RMSE": round(best[1]["RMSE"], 2),
        })

    logger.info(f"{len(resumen)} métricas resumidas devueltas correctamente.")
    return {
        "success": True,
        "summary": resumen,
        "raw": metrics  # opcional, para mantener las métricas completas
    }

@router.get("/predict/all-models")
def predict_all_models(
    product_name: str = Query(..., min_length=1),
    brand: str = Query("Sin marca", min_length=1),
    unit: str = Query("Sin unidad", min_length=1),
    days: int = Query(7, ge=1, le=60)
):
    from datetime import datetime, timedelta
    import pandas as pd

    key = (product_name, brand, unit)

    if key not in models:
        raise HTTPException(status_code=404, detail="No hay modelos entrenados para este producto.")

    try:
        base_dates = [(datetime.today() + timedelta(days=i)).strftime("%Y-%m-%d") for i in range(1, days + 1)]
        forecasts = {}

        for model_name, model in models[key].items():
            try:
                if model_name == "prophet":
                    cap = model.history['cap'].max() if 'cap' in model.history else 100
                    future = model.make_future_dataframe(periods=days)
                    future['cap'] = cap
                    future['floor'] = 0
                    forecast = model.predict(future).tail(days)
                    yhat = forecast['yhat'].clip(lower=0).tolist()

                elif model_name == "linear":
                    timestamps = [[(datetime.today() + timedelta(days=i)).toordinal()] for i in range(1, days + 1)]
                    yhat = model.predict(timestamps).tolist()

                elif model_name == "arima":
                    yhat = model.predict(n_periods=days).tolist()

                else:
                    continue

                # Construir forecast con fechas
                forecast_list = [
                    {"ds": base_dates[i], "yhat": round(max(0, float(yhat[i])), 2)}
                    for i in range(min(len(base_dates), len(yhat)))
                ]

                # Cálculos adicionales por modelo
                from app.services.sales_service import get_last_month_sales
                from app.services.sales_service import get_sales_history
                from math import sqrt

                sales_dict = {
                    item["ds"]: item["y"] for item in get_sales_history(product_name, brand, unit)
                }

                errors = [
                    float(sales_dict.get(p["ds"], 0)) - p["yhat"]
                    for p in forecast_list if p["ds"] in sales_dict
                ]

                mae = round(sum(abs(e) for e in errors) / len(errors), 2) if errors else 0.0
                rmse = round(sqrt(sum(e**2 for e in errors) / len(errors)), 2) if errors else 0.0
                total_predicted = sum(p["yhat"] for p in forecast_list)
                last_month_sales = float(get_last_month_sales(product_name, brand, unit) or 0.0)
                percent_change = round(((total_predicted - last_month_sales) / last_month_sales) * 100, 2) if last_month_sales > 0 else None

                # Tendencia
                diffs = [forecast_list[i]["yhat"] - forecast_list[i-1]["yhat"] for i in range(1, len(forecast_list))]
                avg_diff = sum(diffs) / len(diffs) if diffs else 0
                tendency = "creciente" if avg_diff > 0.1 else "decreciente" if avg_diff < -0.1 else "estable"

                # Stock actual y alerta
                from app.services.inventory_service import get_current_stock_general
                stock = get_current_stock_general(product_name, brand, unit)
                alert_restock = total_predicted > stock

                forecasts[model_name] = {
                    "forecast": forecast_list,
                    "metrics": {"MAE": mae, "RMSE": rmse},
                    "tendency": tendency,
                    "alert_restock": alert_restock,
                    "sales_last_month": last_month_sales,
                    "projected_sales": total_predicted,
                    "percent_change": percent_change,
                     "current_quality": stock,
                }

            except Exception as model_error:
                logger.warning(f"❌ Error procesando modelo {model_name} para {key}: {model_error}")
                continue

        return {
            "success": True,
            "product": product_name,
            "brand": brand,
            "unit": unit,
            "days": days,
            "forecasts": forecasts
        }

    except Exception as e:
        logger.exception(f"Error al generar múltiples predicciones: {e}")
        raise HTTPException(status_code=500, detail="Error al generar predicciones para múltiples modelos.")
