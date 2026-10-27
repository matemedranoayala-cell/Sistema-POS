from django.db import transaction

from core.exceptions.producto_exceptions import (
    ProductoNoEncontradoError,
    StockInsuficienteError,
)
from infrastructure.django_apps.core_db.models import (
    Bitacora,
    DetalleVenta,
    Producto,
    Venta,
)


@transaction.atomic
def vender_producto(producto_id, cantidad=1, metodo_pago="Efectivo", usuario="recepcion"):
    if cantidad <= 0:
        raise ValueError("La cantidad debe ser mayor que cero")

    producto = Producto.objects.select_for_update().filter(pk=producto_id).first()
    if not producto:
        raise ProductoNoEncontradoError("Producto no encontrado")

    if producto.stock < cantidad:
        raise StockInsuficienteError(
            f"Stock insuficiente de {producto.nombre} (quedan {producto.stock})"
        )

    producto.stock -= cantidad
    producto.save(update_fields=["stock"])

    subtotal = producto.precio * cantidad
    venta = Venta.objects.create(total=subtotal, metodo_pago=metodo_pago)
    DetalleVenta.objects.create(
        venta=venta, producto=producto, cantidad=cantidad, subtotal=subtotal
    )

    Bitacora.objects.create(
        usuario=usuario,
        operacion="Venta de Producto (TIENDA)",
        modulo="Tienda",
        detalle=f"{producto.nombre} x{cantidad} - Bs {subtotal}",
        estado="Registrado",
        color="green",
    )

    return {
        "venta_id": venta.id,
        "producto": producto.nombre,
        "cantidad": cantidad,
        "total": float(subtotal),
        "stock_restante": producto.stock,
    }