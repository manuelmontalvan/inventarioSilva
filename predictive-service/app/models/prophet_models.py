import pandas as pd
from prophet import Prophet
from collections import defaultdict
from app.db.connection import get_connection
import numpy as np

models = {}    # Almacena modelos entrenados
metrics = {}   # Almacena métricas MAE y RMSE por modelo

def train_models_from_db():
    conn = get_connection()
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

    grouped = defaultdict(list)
    for row in rows:
        key = (row['product_name'], row['brand'], row['unit'])
        grouped[key].append({'ds': row['date'], 'y': float(row['quantity'])})

    models.clear()
    metrics.clear()

    for key, records in grouped.items():
        df = pd.DataFrame(records).groupby("ds").sum().reset_index()

        if df.shape[0] < 2:
            print(f"⏭️ Skip {key} por pocos datos ({df.shape[0]})")
            continue

        # 🔍 Eliminar outliers extremos usando IQR
        q1 = df['y'].quantile(0.25)
        q3 = df['y'].quantile(0.75)
        iqr = q3 - q1
        lower_bound = q1 - 1.5 * iqr
        upper_bound = q3 + 1.5 * iqr
        df = df[(df['y'] >= lower_bound) & (df['y'] <= upper_bound)]

        if df.shape[0] < 2:
            print(f"⚠️ Skip {key} después de limpieza por pocos datos")
            continue

        # 📊 División en train/test 80/20
        train_size = int(len(df) * 0.8)
        train_df = df.iloc[:train_size]
        test_df = df.iloc[train_size:]

        # 🧠 Entrenar Prophet con crecimiento plano
        model = Prophet(
            growth="flat",  # ❗ importante: evita crecimiento exagerado
            yearly_seasonality=True,
            weekly_seasonality=True,
            daily_seasonality=False
        )
        model.fit(train_df)

        # 📅 Generar predicciones para el test set
        future = model.make_future_dataframe(periods=len(test_df), freq='D')
        forecast = model.predict(future)
        pred = forecast[['ds', 'yhat']].tail(len(test_df)).reset_index(drop=True)
        true = test_df[['ds', 'y']].reset_index(drop=True)

        # 📈 Calcular métricas
        mae = np.mean(np.abs(true['y'] - pred['yhat']))
        rmse = np.sqrt(np.mean((true['y'] - pred['yhat']) ** 2))

        metrics[key] = {'MAE': mae, 'RMSE': rmse}
        models[key] = model

        print(f"✅ Modelo entrenado para: {key} | MAE: {mae:.2f} | RMSE: {rmse:.2f}")

    return models, metrics
