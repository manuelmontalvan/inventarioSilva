import os
from dotenv import load_dotenv
from urllib.parse import urlparse
load_dotenv()  # carga desde .env si existe

database_url = os.getenv("DATABASE_URL")
if database_url:
    result = urlparse(database_url)
    DB_PARAMS = {
        "host": result.hostname,
        "port": result.port,
        "dbname": result.path[1:],
        "user": result.username,
        "password": result.password,
    }
else:
    DB_PARAMS = {
    "host": os.getenv("DB_HOST"),
    "database": os.getenv("DB_NAME"),
    "user": os.getenv("DB_USER"),
    "password": os.getenv("DB_PASSWORD"),
    "port": int(os.getenv("DB_PORT")),
}
