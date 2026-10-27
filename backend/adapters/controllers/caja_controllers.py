from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from application.use_cases.ajustar_stock import ajustar_stock
from application.use_cases.vender_carrito import vender_carrito
from application.use_cases.vender_producto import vender_producto
from core.exceptions.producto_exceptions import (
    ProductoNoEncontradoError,
    StockInsuficienteError,
)
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
            detalle=f"Total: Bs {tot}\n{obs}",
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
class VenderProductoController(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        try:
            resultado = vender_producto(
                producto_id=int(request.data.get("producto_id")),
                cantidad=int(request.data.get("cantidad", 1)),
                metodo_pago=request.data.get("metodo_pago", "Efectivo"),
                usuario=request.data.get("usuario", "recepcion"),
            )
        except (TypeError, ValueError):
            return Response(
                {"error": "Datos de venta invalidos."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except ProductoNoEncontradoError as e:
            return Response({"error": str(e)}, status=status.HTTP_404_NOT_FOUND)
        except StockInsuficienteError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(resultado, status=status.HTTP_201_CREATED)


class VenderCarritoController(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        try:
            resultado = vender_carrito(
                items=request.data.get("items") or [],
                metodo_pago=request.data.get("metodo_pago", "Efectivo"),
                usuario=request.data.get("usuario", "tienda"),
            )
        except (TypeError, ValueError, KeyError):
            return Response(
                {"error": "Datos de venta invalidos."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except ProductoNoEncontradoError as e:
            return Response({"error": str(e)}, status=status.HTTP_404_NOT_FOUND)
        except StockInsuficienteError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(resultado, status=status.HTTP_201_CREATED)


class AjustarStockController(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request, pk):
        try:
            stock = request.data.get("stock")
            incremento = request.data.get("incremento")
            resultado = ajustar_stock(
                producto_id=pk,
                stock=int(stock) if stock is not None else None,
                incremento=int(incremento) if incremento is not None else None,
                usuario=request.data.get("usuario", "tienda"),
            )
        except (TypeError, ValueError):
            return Response(
                {"error": "Datos de ajuste invalidos."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except ProductoNoEncontradoError as e:
            return Response({"error": str(e)}, status=status.HTTP_404_NOT_FOUND)

        return Response(resultado, status=status.HTTP_200_OK)
