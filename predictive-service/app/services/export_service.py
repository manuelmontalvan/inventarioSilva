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

def create_forecast_excel(forecast: list[dict], alert_restock: bool):
    key = make_cache_key_excel(forecast, alert_restock)
    if key in excel_cache:
        # Retorna el archivo cachedado directamente
        return excel_cache[key]
    
    df = pd.DataFrame(forecast)
    df.rename(columns={"ds": "Fecha", "yhat": "Cantidad Estimada"}, inplace=True)
    
    output = io.BytesIO()
    with pd.ExcelWriter(output, engine="openpyxl") as writer:
        df.to_excel(writer, index=False, sheet_name="Predicción")
        alert_df = pd.DataFrame([{"Alerta de Reposición": alert_restock}])
        alert_df.to_excel(writer, index=False, sheet_name="Resumen")
    
    output.seek(0)
    excel_cache[key] = output  # Guardar en cache
    
    return output
