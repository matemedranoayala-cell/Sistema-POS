from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from adapters.controllers.base_controller import BaseCleanController
from application.use_cases.productos_bajo_stock import obtener_productos_bajo_stock
from infrastructure.django_apps.core_db.models import (
    Bitacora,
    CierreCaja,
    DetalleVenta,
    Producto,
    Venta,
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


class ProductosBajoStockController(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request):
        limite = request.query_params.get("limite", "5")

        try:
            limite = int(limite)
            if limite < 0:
                raise ValueError
        except ValueError:
            return Response(
                {"error": "El límite debe ser un número igual o mayor que cero."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        productos = obtener_productos_bajo_stock(limite)
        return Response(productos, status=status.HTTP_200_OK)