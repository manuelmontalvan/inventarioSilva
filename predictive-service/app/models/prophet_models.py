import pandas as pd
from prophet import Prophet
from collections import defaultdict
from app.db.connection import get_connection
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error
from pmdarima import auto_arima
from app.services.prepare_data_prophet import prepare_data_for_prophet

models = {}    # Almacena modelos entrenados por tipo
metrics = {}   # Almacena métricas MAE y RMSE por tipo

def train_linear_regression(df):
    df = df.copy()
    df['ds'] = pd.to_datetime(df['ds'])
    df = df.sort_values('ds')
    df['timestamp'] = df['ds'].map(pd.Timestamp.toordinal)

    train_size = int(len(df) * 0.8)
    X_train = df['timestamp'][:train_size].values.reshape(-1, 1)
    y_train = df['y'][:train_size]
    X_test = df['timestamp'][train_size:].values.reshape(-1, 1)
    y_test = df['y'][train_size:]

    model = LinearRegression()
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)

    mae = mean_absolute_error(y_test, y_pred)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))

    return model, mae, rmse

def train_arima(df):
    df = df.copy()
    df = df.set_index('ds')
    df = df.asfreq('D').fillna(0)

    train_size = int(len(df) * 0.8)
    train = df.iloc[:train_size]
    test = df.iloc[train_size:]

    try:
        model = auto_arima(train['y'], seasonal=True, m=7, suppress_warnings=True)
        forecast = model.predict(n_periods=len(test))

        mae = mean_absolute_error(test['y'], forecast)
        rmse = np.sqrt(mean_squared_error(test['y'], forecast))
        return model, mae, rmse
    except Exception as e:
        print(f"❌ ARIMA fallo en {df.index[0]}: {e}")
        return None, None, None

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

    for key, records in grouped.items():  # <-- corregido indentación aquí
        train_df, test_df, holidays_df = prepare_data_for_prophet(records)
        
        if train_df is None or test_df is None:
            print(f"⏭️ Skip {key} por datos insuficientes después de preparación")
            continue

        cap_value = train_df['cap'].iloc[0]

        models[key] = {}
        metrics[key] = {}

        # Prophet
        prophet_model = Prophet(
            growth="logistic",
            seasonality_mode="multiplicative",  
            yearly_seasonality=False,
            weekly_seasonality=True,            
            changepoint_prior_scale=0.15,
            holidays=holidays_df
        )
        prophet_model.add_seasonality(name='monthly', period=30.5, fourier_order=4)
        prophet_model.fit(train_df)

        future = prophet_model.make_future_dataframe(periods=len(test_df), freq='D')
        future['cap'] = cap_value
        future['floor'] = 0

        forecast = prophet_model.predict(future)

        pred = forecast[['ds', 'yhat']].tail(len(test_df)).reset_index(drop=True)
        true = test_df[['ds', 'y']].reset_index(drop=True)
        pred['yhat'] = pred['yhat'].clip(lower=0, upper=cap_value)

        prophet_mae = mean_absolute_error(true['y'], pred['yhat'])
        prophet_rmse = np.sqrt(mean_squared_error(true['y'], pred['yhat']))

        models[key]['prophet'] = prophet_model
        metrics[key]['prophet'] = {'MAE': prophet_mae, 'RMSE': prophet_rmse}
        print(f"✅ Prophet entrenado para {key} | MAE: {prophet_mae:.2f} | RMSE: {prophet_rmse:.2f}")

        # Linear Regression
        full_df = pd.concat([train_df, test_df]).reset_index(drop=True)
        lin_model, lin_mae, lin_rmse = train_linear_regression(full_df)
        models[key]['linear'] = lin_model
        metrics[key]['linear'] = {'MAE': lin_mae, 'RMSE': lin_rmse}
        print(f"📐 Linear entrenado para {key} | MAE: {lin_mae:.2f} | RMSE: {lin_rmse:.2f}")

        # ARIMA
        arima_model, arima_mae, arima_rmse = train_arima(full_df)
        if arima_model:
            models[key]['arima'] = arima_model
            metrics[key]['arima'] = {'MAE': arima_mae, 'RMSE': arima_rmse}
            print(f"📊 ARIMA entrenado para {key} | MAE: {arima_mae:.2f} | RMSE: {arima_rmse:.2f}")

    return models, metrics
