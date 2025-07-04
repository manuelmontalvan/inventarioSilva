from app.db.connection import get_connection

def get_current_stock_general(product_name: str, brand: str, unit: str) -> float:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT current_quantity
        FROM products
        WHERE name = %s 
          AND "brandId" = (SELECT id FROM brands WHERE name = %s)
          AND "unitOfMeasureId" = (SELECT id FROM units_of_measure WHERE name = %s)
        LIMIT 1
    """, (product_name, brand, unit))
    result = cursor.fetchone()
    print("DEBUG result type:", type(result), "value:", result)
    cursor.close()
    conn.close()
    
    if result is None:
        return 0
    # Si es dict o similar, accede con key
    if isinstance(result, dict):
        return result.get('current_quantity', 0)
    # Si es tupla/lista
    if isinstance(result, (tuple, list)):
        return result[0]

    # Caso por defecto
    return 0
