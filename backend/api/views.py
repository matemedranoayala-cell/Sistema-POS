from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from .models import Alumno, Pago, Asistencia, Producto, Venta, DetalleVenta, ReporteEquipo, CierreCaja
from .serializers import AlumnoSerializer, PagoSerializer, AsistenciaSerializer, ProductoSerializer, VentaSerializer, DetalleVentaSerializer, ReporteEquipoSerializer, CierreCajaSerializer

class BaseViewSet(viewsets.ModelViewSet):
    permission_classes = [AllowAny]
    authentication_classes = []

class AlumnoViewSet(BaseViewSet):
    queryset = Alumno.objects.all(); serializer_class = AlumnoSerializer

class PagoViewSet(BaseViewSet):
    queryset = Pago.objects.all(); serializer_class = PagoSerializer

class AsistenciaViewSet(BaseViewSet):
    queryset = Asistencia.objects.all(); serializer_class = AsistenciaSerializer

class ProductoViewSet(BaseViewSet):
    queryset = Producto.objects.all(); serializer_class = ProductoSerializer

class VentaViewSet(BaseViewSet):
    queryset = Venta.objects.all(); serializer_class = VentaSerializer

class DetalleVentaViewSet(BaseViewSet):
    queryset = DetalleVenta.objects.all(); serializer_class = DetalleVentaSerializer

class ReporteEquipoViewSet(BaseViewSet):
    queryset = ReporteEquipo.objects.all(); serializer_class = ReporteEquipoSerializer

class CierreCajaViewSet(BaseViewSet):
    queryset = CierreCaja.objects.all(); serializer_class = CierreCajaSerializer

class LoginView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        print(" DATOS RECIBIDOS DESDE ANGULAR:", request.data)
        usuario_recibido = request.data.get('username') or request.data.get('email') or request.data.get('usuario')
        contrasena_recibida = request.data.get('password') or request.data.get('contrasena')

        user = authenticate(username=usuario_recibido, password=contrasena_recibida)

        if user is None:
            try:

                user_obj = User.objects.get(email=usuario_recibido)
                user = authenticate(username=user_obj.username, password=contrasena_recibida)
            except User.DoesNotExist:
                pass
        # 5. RESPUESTA FINAL
        if user is not None:
            return Response({
                "status": "ok",          # <--- LA LLAVE EXACTA QUE PIDE ANGULAR
                "success": True,
                "rol": user.username,    # Tu Angular espera un rol para guardarlo en el localStorage
                "mensaje": "Login exitoso",
                "usuario": user.username
            }, status=status.HTTP_200_OK)