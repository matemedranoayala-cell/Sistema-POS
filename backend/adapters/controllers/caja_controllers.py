from rest_framework.response import Response
from rest_framework import status
from adapters.controllers.base_controller import BaseCleanController
from infrastructure.django_apps.core_db.models import (
    Producto,
    Venta,
    DetalleVenta,
    CierreCaja,
    Bitacora,
)


class ProductoController(BaseCleanController):
    model = Producto


class VentaController(BaseCleanController):
    model = Venta


class DetalleVentaController(BaseCleanController):
    model = DetalleVenta


class CierreCajaController(BaseCleanController):
    model = CierreCaja

    def post(self, request):
        tot = request.data.get('total_ingresos', 0)
        obs = request.data.get('observaciones', '')
        usr = request.data.get('usuario', 'recepcion')

        nuevo = CierreCaja.objects.create(
            total_ingresos=tot,
            observaciones=obs,
            estado='Auditoria Pendiente'
        )

        Bitacora.objects.create(
            usuario=usr,
            operacion='Arqueo y Cierre (RECEPCION)',
            modulo='Caja',
            detalle=f"Total: Bs {tot} - {obs}",
            estado='Registrado',
            color='blue'
        )

        return Response(self.serializar(nuevo), status=status.HTTP_201_CREATED)