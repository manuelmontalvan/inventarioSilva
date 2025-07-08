from datetime import datetime, timedelta
from app.db.connection import get_connection
import psycopg2.extras

def get_last_month_sales(product_name: str, brand: str, unit: str) -> float:
    conn = get_connection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    today = datetime.today()
    first_day_this_month = today.replace(day=1)
    last_day_last_month = first_day_this_month - timedelta(days=1)
    first_day_last_month = last_day_last_month.replace(day=1)

    query = """
        SELECT COALESCE(SUM(quantity), 0) AS total
        FROM product_sales
        WHERE product_name = %s
          AND COALESCE(brand_name, 'Sin marca') = %s
          AND COALESCE(unit_of_measure_name, 'Sin unidad') = %s
          AND sale_date >= %s
          AND sale_date <= %s
    """

    cursor.execute(query, (
        product_name,
        brand,
        unit,
        first_day_last_month,
        last_day_last_month
    ))
    result = cursor.fetchone()
    cursor.close()
    conn.close()

    return result["total"]
def get_sales_history(product_name: str, brand: str, unit: str) -> list[dict]:
    conn = get_connection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    query = """
        SELECT sale_date::date AS ds, SUM(quantity) AS y
        FROM product_sales
        WHERE product_name = %s
          AND COALESCE(brand_name, 'Sin marca') = %s
          AND COALESCE(unit_of_measure_name, 'Sin unidad') = %s
        GROUP BY sale_date::date
        ORDER BY ds
    """

    cursor.execute(query, (product_name, brand, unit))
    results = cursor.fetchall()
    cursor.close()
    conn.close()

    # Formato compatible con cálculo de métricas
    return [{"ds": row["ds"].strftime("%Y-%m-%d"), "y": row["y"]} for row in results]
