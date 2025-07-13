from app.db.connection import get_connection

def get_current_stock_general(product_name: str, brand: str, unit: str) -> float:
    conn = get_connection()
    cursor = conn.cursor()
    print("🔍 Buscando stock para:", product_name, brand, unit)
    cursor.execute("""
        SELECT current_quantity
        FROM products
        WHERE name = %s 
          AND "brandId" = (SELECT id FROM brands WHERE name = %s)
          AND "unitOfMeasureId" = (SELECT id FROM units_of_measure WHERE name = %s)
        LIMIT 1
    """, (product_name, brand, unit))
    result = cursor.fetchone()
    print("🧪 Resultado crudo de DB:", result, " | Tipo:", type(result))
    cursor.close()
    conn.close()
    
    if result is None:
        print("⚠️ No se encontró el producto, devolviendo 0")
        return 0
    # Si es dict o similar, accede con key
    if isinstance(result, dict):
        print("✅ Acceso por clave: current_quantity =", result.get('current_quantity', 0))
        return result.get('current_quantity', 0)
    # Si es tupla/lista
    if isinstance(result, (tuple, list)):
        print("✅ Acceso por índice: current_quantity =", result[0])
        return result[0]
    print("⚠️ Formato inesperado, devolviendo 0")
    # Caso por defecto
    return 0
