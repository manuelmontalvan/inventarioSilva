import io
import pandas as pd
from fastapi.responses import StreamingResponse
from cachetools import TTLCache
import hashlib
import json

# Cache para archivos Excel en memoria: max 100 items, 1 hora de TTL
excel_cache = TTLCache(maxsize=100, ttl=3600)

def make_cache_key_excel(forecast: list[dict], alert_restock: bool) -> str:
    """
    Genera una clave hash para el forecast + alerta
    """
    raw_data = {
        "forecast": forecast,
        "alert_restock": alert_restock,
    }
    json_str = json.dumps(raw_data, sort_keys=True)
    return hashlib.sha256(json_str.encode()).hexdigest()

def create_forecast_excel_multi(models: dict, product: str, brand: str, unit: str, days: int):
    from openpyxl import Workbook
    from openpyxl.utils.dataframe import dataframe_to_rows
    from openpyxl.chart import LineChart, Reference

    wb = Workbook()
    wb.remove(wb.active)  # Elimina hoja vacía inicial

    resumen_sheet = wb.create_sheet("Resumen General")
    resumen_sheet.append(["Producto", product])
    resumen_sheet.append(["Marca", brand])
    resumen_sheet.append(["Unidad", unit])
    resumen_sheet.append(["Días de proyección", days])
    resumen_sheet.append([])

    resumen_sheet.append([
        "Modelo",
        "Tendencia",
        "¿Reponer?",
        "Stock Actual",
        "Proyección Total",
        "Variación (%)",
        "MAE",
        "RMSE"
    ])

    for model_name, model_data in models.items():
        forecast = model_data["forecast"]
        df = pd.DataFrame(forecast)
        df.rename(columns={"ds": "Fecha", "yhat": "Cantidad Estimada"}, inplace=True)

        sheet = wb.create_sheet(title=model_name.capitalize())
        for row in dataframe_to_rows(df, index=False, header=True):
            sheet.append(row)

        # Gráfico
        chart = LineChart()
        chart.title = f"Tendencia {model_name}"
        chart.y_axis.title = "Cantidad Estimada"
        chart.x_axis.title = "Fecha"
        data = Reference(sheet, min_col=2, min_row=1, max_row=len(df) + 1)
        cats = Reference(sheet, min_col=1, min_row=2, max_row=len(df) + 1)
        chart.add_data(data, titles_from_data=True)
        chart.set_categories(cats)
        sheet.add_chart(chart, "D10")

        # Resumen fila
        resumen_sheet.append([
            model_name,
            model_data.get("tendency", ""),
            "Sí" if model_data.get("alert_restock") else "No",
            model_data.get("current_quality", ""),
            round(model_data.get("projected_sales", 0), 2),
            f"{model_data.get('percent_change', 0):.2f}%",
            round(model_data["metrics"]["MAE"], 2) if model_data.get("metrics") else "",
            round(model_data["metrics"]["RMSE"], 2) if model_data.get("metrics") else ""
        ])

    output = io.BytesIO()
    wb.save(output)
    output.seek(0)
    return output
