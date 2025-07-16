import pandas as pd

def prepare_data_for_prophet(
    records: list,
    min_records: int = 10,
    outlier_iqr_multiplier: float = 1.5,
    log_skip: bool = True,
):
    """
    Prepara los datos para entrenamiento de Prophet.
    
    Args:
        records (list): Lista de dicts con keys 'ds' (fecha) y 'y' (valor).
        min_records (int): Mínimo de registros tras limpieza para entrenar.
        outlier_iqr_multiplier (float): Multiplicador para regla IQR en outliers.
        log_skip (bool): Si True imprime por qué se salta un grupo.
    
    Returns:
        train_df, test_df, holidays_df (pd.DataFrame, pd.DataFrame, pd.DataFrame)
        O None, None, None si no cumple condiciones.
    """
    df = pd.DataFrame(records)
    if df.empty:
        if log_skip: print("⏭️ DataFrame vacío.")
        return None, None, None

    # Agrupar por fecha y sumar valores (en caso de múltiples registros diarios)
    df = df.groupby("ds").sum().reset_index()
    df = df.sort_values(by='ds').reset_index(drop=True)

    if df.shape[0] < min_records:
        if log_skip: print(f"⏭️ Skip por pocos datos ({df.shape[0]} registros).")
        return None, None, None

    # Detectar outliers usando IQR
    q1 = df['y'].quantile(0.25)
    q3 = df['y'].quantile(0.75)
    iqr = q3 - q1
    lower_bound = q1 - outlier_iqr_multiplier * iqr
    upper_bound = q3 + outlier_iqr_multiplier * iqr

    # Guardar outliers para posibles holidays/events
    outliers = df[(df['y'] < lower_bound) | (df['y'] > upper_bound)].copy()
    normal_data = df[(df['y'] >= lower_bound) & (df['y'] <= upper_bound)].copy()

    if normal_data.shape[0] < min_records:
        if log_skip: print(f"⚠️ Skip tras limpieza por pocos datos ({normal_data.shape[0]}).")
        return None, None, None

    # Crear holidays DataFrame para outliers positivos (picos)
    if not outliers.empty:
        holidays_df = pd.DataFrame({
            'holiday': 'outlier',
            'ds': outliers['ds'],
            'lower_window': 0,
            'upper_window': 1,
        })
    else:
        holidays_df = pd.DataFrame(columns=['holiday','ds','lower_window','upper_window'])

    # Añadir columnas para Prophet growth logistic
    cap_value = normal_data['y'].max() * 1.2
    normal_data['cap'] = cap_value
    normal_data['floor'] = 0

    # Split train/test
    train_size = int(len(normal_data) * 0.8)
    train_df = normal_data.iloc[:train_size].reset_index(drop=True)
    test_df = normal_data.iloc[train_size:].reset_index(drop=True)

    if train_df.empty or test_df.empty:
        if log_skip: print("⚠️ Split train/test dejó datasets vacíos.")
        return None, None, None

    return train_df, test_df, holidays_df
