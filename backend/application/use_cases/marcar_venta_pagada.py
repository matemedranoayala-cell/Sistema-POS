from django.db import transaction

from infrastructure.django_apps.core_db.models import Bitacora, Venta


@transaction.atomic
def marcar_venta_pagada(venta_id, metodo_pago, usuario):
    modalidades_pago = {"Efectivo", "QR / Transferencia"}
    if not isinstance(metodo_pago, str) or metodo_pago not in modalidades_pago:
        raise ValueError("La modalidad de pago no es valida")
    usuario = str(usuario or "tienda").strip()

    venta = Venta.objects.select_for_update().filter(pk=venta_id).first()
    if venta is None:
        return None
    if venta.estado_pago != "PENDIENTE":
        raise ValueError("La venta no tiene un pago pendiente")

    venta.metodo_pago = metodo_pago
    venta.estado_pago = "PAGADO"
    venta.save(update_fields=["metodo_pago", "estado_pago"])

    Bitacora.objects.create(
        usuario=usuario,
        operacion="Pago de Venta (TIENDA)",
        modulo="Tienda",
        detalle=f"Venta TKT-{venta.pk:03d} pagada por {metodo_pago}",
        estado="Registrado",
        color="green",
    )

    return venta
