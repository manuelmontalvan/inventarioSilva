import logging
from logging.handlers import RotatingFileHandler
import os

# Asegúrate que exista el directorio de logs
LOG_DIR = "logs"
os.makedirs(LOG_DIR, exist_ok=True)

# Configura el logger principal
logger = logging.getLogger("prediction_logger")
logger.setLevel(logging.INFO)

# Formato de log
formatter = logging.Formatter(
    "%(asctime)s - %(levelname)s - %(name)s - %(message)s"
)

# Console handler
console_handler = logging.StreamHandler()
console_handler.setFormatter(formatter)

# File handler con rotación: 5MB por archivo, hasta 5 archivos
file_handler = RotatingFileHandler(
    os.path.join(LOG_DIR, "predictions.log"),
    maxBytes=5 * 1024 * 1024,  # 5MB
    backupCount=5,
    encoding="utf-8"
)
file_handler.setFormatter(formatter)

# Evita duplicados si ya se ha configurado
if not logger.handlers:
    logger.addHandler(console_handler)
    logger.addHandler(file_handler)
