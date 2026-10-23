from django.db import transaction

from core.exceptions.producto_exceptions import ProductoNoEncontradoError
from infrastructure.django_apps.core_db.models import Bitacora, Producto


@transaction.atomic
def ajustar_stock(producto_id, stock=None, incremento=None, usuario="tienda"):
    """Corrige el stock de un producto.

    - stock:      fija el stock a ese valor (conteo fisico).
    - incremento: suma (o resta si es negativo) unidades (reposicion).
    Se debe enviar exactamente uno de los dos.
    """
    if (stock is None) == (incremento is None):
        raise ValueError("Indica 'stock' o 'incremento', pero no ambos")

    producto = Producto.objects.select_for_update().filter(pk=producto_id).first()
    if not producto:
        raise ProductoNoEncontradoError("Producto no encontrado")

    anterior = producto.stock
    nuevo = stock if stock is not None else anterior + incremento
    if nuevo < 0:
        raise ValueError("El stock no puede quedar negativo")

    producto.stock = nuevo
    producto.save(update_fields=["stock"])

    Bitacora.objects.create(
        usuario=usuario,
        operacion="Ajuste de Stock (TIENDA)",
        modulo="Tienda",
        detalle=f"{producto.nombre}: {anterior} -> {nuevo} unidades",
        estado="Registrado",
        color="orange",
    )

    return {
        "producto_id": producto.pk,
        "producto": producto.nombre,
        "stock_anterior": anterior,
        "stock_actual": nuevo,
    }
