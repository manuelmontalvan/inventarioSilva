import psycopg2
from psycopg2.extras import RealDictCursor
from app.core.config import DB_PARAMS

def get_connection():
    print("Connecting to DB with params:", DB_PARAMS)
    return psycopg2.connect(**DB_PARAMS, cursor_factory=RealDictCursor)
