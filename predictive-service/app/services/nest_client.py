import os
import requests
import logging

logger = logging.getLogger("nest_client")

def guardar_prediccion_en_nest(prediction_data, api_key=None):
    
    print("Intentando guardar predicción en NestJS...")
    url = os.getenv("NEST_API_URL")
    print(f"URL destino: {url}")
    headers = {"Content-Type": "application/json"}
    if api_key:
        headers["Authorization"] = f"Bearer {api_key}"

    try:
        response = requests.post(url, json=prediction_data, headers=headers)
        if response.status_code in (200, 201):
            logger.info("✅ Predicción guardada exitosamente en NestJS.")
        else:
            logger.error(f"❌ Error al guardar: {response.status_code} {response.text}")
    except Exception as e:
        logger.exception(f"❌ Excepción al guardar predicción: {e}")
