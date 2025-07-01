import pandas as pd
from prophet import Prophet
import psycopg2
from psycopg2.extras import RealDictCursor
from collections import defaultdict


# Configuración base de datos PostgreSQL
DB_PARAMS = {
    "host": "localhost",
    "database": "inventarioSilva",
    "user": "postgres",
    "password": "eros2021",
    "port": 5433,
}

def fetch_sales_data():
    conn = psycopg2.connect(**DB_PARAMS, cursor_factory=RealDictCursor)
    cursor = conn.cursor()
    cursor.execute("""
        SELECT
            product_name,
            COALESCE(brand_name, 'Sin marca') AS brand,
            COALESCE(unit_of_measure_name, 'Sin unidad') AS unit,
            sale_date::date AS date,
            quantity
        FROM product_sales
        WHERE sale_date IS NOT NULL AND quantity IS NOT NULL
        ORDER BY sale_date;
    """)
    rows = cursor.fetchall()
    cursor.close()
    conn.close()
    return rows

def train_models_from_db():
    sales_data = fetch_sales_data()

    if not sales_data:
        print("⚠️  No se encontraron ventas en la base de datos.")
        return {}

    grouped = defaultdict(list)
    for row in sales_data:
        key = (row['product_name'], row['brand'], row['unit'])
        grouped[key].append({'ds': row['date'], 'y': row['quantity']})

    models = {}
    for key, records in grouped.items():
        df = pd.DataFrame(records)
        df = df.groupby("ds").sum().reset_index()

        if df.shape[0] < 2:
            print(f"⏭️  Skip: No hay suficientes datos para entrenar '{key[0]}' ({df.shape[0]} fila)")
            continue

        model = Prophet()
        model.fit(df)
        models[key] = model
        print(f"✅ Modelo entrenado para: {key}")

    return models
