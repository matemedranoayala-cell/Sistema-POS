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
def vender_carrito(
    items,
    metodo_pago="Efectivo",
    usuario="recepcion",
    cliente_nombre="",
    cliente_telefono="",
    rol_cliente="",
):
    """Registra UNA venta (un ticket) con varios productos.

    Es atomica: si algun producto no existe o no tiene stock suficiente,
    no se descuenta nada ni se crea ninguna venta.
    """
    if not items:
        raise ValueError("El carrito esta vacio")

    modalidades_pago = {
        "Efectivo",
        "QR / Transferencia",
        "Por cobrar al finalizar entreno",
    }
    if not isinstance(metodo_pago, str) or metodo_pago not in modalidades_pago:
        raise ValueError("La modalidad de pago no es valida")
    cliente_nombre = str(cliente_nombre or "").strip()
    cliente_telefono = str(cliente_telefono or "").strip()
    rol_cliente = str(rol_cliente or "").strip()
    if not cliente_nombre:
        raise ValueError("El nombre del cliente es obligatorio")
    if len(cliente_nombre) > 150 or len(cliente_telefono) > 30 or len(rol_cliente) > 50:
        raise ValueError("Los datos del cliente exceden el tamaño permitido")

    # Si el mismo producto llega repetido, se suman las cantidades.
    cantidades = {}
    for item in items:
        producto_id = int(item["producto_id"])
        cantidad = int(item["cantidad"])
        if cantidad <= 0:
            raise ValueError("La cantidad debe ser mayor que cero")
        cantidades[producto_id] = cantidades.get(producto_id, 0) + cantidad

    # Se bloquean las filas en orden de id para evitar bloqueos cruzados
    # entre dos ventas simultaneas.
    productos = {
        p.pk: p
        for p in Producto.objects.select_for_update()
        .filter(pk__in=cantidades.keys())
        .order_by("pk")
    }

    for producto_id, cantidad in cantidades.items():
        producto = productos.get(producto_id)
        if producto is None:
            raise ProductoNoEncontradoError(f"Producto {producto_id} no encontrado")
        if producto.stock < cantidad:
            raise StockInsuficienteError(
                f"Stock insuficiente de {producto.nombre} (quedan {producto.stock})"
            )

    total = sum(productos[pid].precio * cant for pid, cant in cantidades.items())
    estado_pago = (
        "PENDIENTE"
        if metodo_pago == "Por cobrar al finalizar entreno"
        else "PAGADO"
    )
    venta = Venta.objects.create(
        total=total,
        metodo_pago=metodo_pago,
        cliente_nombre=cliente_nombre,
        cliente_telefono=cliente_telefono,
        rol_cliente=rol_cliente,
        vendedor=str(usuario or "").strip(),
        estado_pago=estado_pago,
    )

    lineas = []
    for producto_id, cantidad in cantidades.items():
        producto = productos[producto_id]
        subtotal = producto.precio * cantidad

        producto.stock -= cantidad
        producto.save(update_fields=["stock"])
        DetalleVenta.objects.create(
            venta=venta, producto=producto, cantidad=cantidad, subtotal=subtotal
        )
        lineas.append(
            {
                "producto_id": producto.pk,
                "producto": producto.nombre,
                "cantidad": cantidad,
                "subtotal": float(subtotal),
                "stock_restante": producto.stock,
            }
        )

    resumen = ", ".join(f"{l['producto']} x{l['cantidad']}" for l in lineas)
    Bitacora.objects.create(
        usuario=usuario,
        operacion="Venta de Productos (TIENDA)",
        modulo="Tienda",
        detalle=(
            f"{resumen} - Bs {total} - Cliente: {venta.cliente_nombre} "
            f"- Pago: {metodo_pago} ({estado_pago})"
        ),
        estado="Registrado",
        color="orange" if estado_pago == "PENDIENTE" else "green",
    )

    return {
        "venta_id": venta.id,
        "total": float(total),
        "metodo_pago": metodo_pago,
        "estado_pago": estado_pago,
        "cliente_nombre": venta.cliente_nombre,
        "cliente_telefono": venta.cliente_telefono,
        "rol_cliente": venta.rol_cliente,
        "vendedor": venta.vendedor,
        "items": lineas,
    }
