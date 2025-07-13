import os
import requests
import logging
from decimal import Decimal

logger = logging.getLogger("nest_client")

# 🔁 Función para convertir Decimals a floats
def convert_decimals(obj):
    if isinstance(obj, list):
        return [convert_decimals(item) for item in obj]
    elif isinstance(obj, dict):
        return {key: convert_decimals(value) for key, value in obj.items()}
    elif isinstance(obj, Decimal):
        return float(obj)
    else:
        return obj

def guardar_prediccion_en_nest(prediction_data, api_key=None):
    print("Intentando guardar predicción en NestJS...")
    url = os.getenv("NEST_API_URL")
    print(f"URL destino: {url}")

    headers = {"Content-Type": "application/json"}
    if api_key:
        headers["Authorization"] = f"Bearer {api_key}"

    # ✅ Convertir Decimals antes de enviar
    safe_data = convert_decimals(prediction_data)

    try:
        response = requests.post(url, json=safe_data, headers=headers)
        if response.status_code in (200, 201):
            logger.info("✅ Predicción guardada exitosamente en NestJS.")
        else:
            logger.error(f"❌ Error al guardar: {response.status_code} {response.text}")
    except requests.exceptions.Timeout:
        print("❌ Timeout al guardar predicción en NestJS.")
    
    except Exception as e:
        logger.exception(f"❌ Excepción al guardar predicción: {e}")
