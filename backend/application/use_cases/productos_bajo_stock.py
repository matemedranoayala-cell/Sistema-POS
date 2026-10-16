from infrastructure.django_apps.core_db.models import Producto


def obtener_productos_bajo_stock(limite=5):
    return list(
        Producto.objects
        .filter(stock__lte=limite)
        .values("nombre", "sku", "stock")
        .order_by("stock", "nombre")
    )