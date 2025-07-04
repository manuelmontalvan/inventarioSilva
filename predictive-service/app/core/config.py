import os
from dotenv import load_dotenv

load_dotenv()  # carga desde .env si existe

DB_PARAMS = {
    "host": os.getenv("DB_HOST", "localhost"),
    "database": os.getenv("DB_NAME", "inventarioSilva"),
    "user": os.getenv("DB_USER", "postgres"),
    "password": os.getenv("DB_PASSWORD", "eros2021"),
    "port": int(os.getenv("DB_PORT", 5433)),
}
