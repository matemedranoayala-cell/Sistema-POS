from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.decorators import api_view, permission_classes
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from .models import Alumno, Pago, Asistencia, Producto, Venta, DetalleVenta, ReporteEquipo, CierreCaja
from .serializers import AlumnoSerializer, PagoSerializer, AsistenciaSerializer, ProductoSerializer, VentaSerializer, DetalleVentaSerializer, ReporteEquipoSerializer, CierreCajaSerializer
from .models import RegistroClase, Bitacora
from .serializers import RegistroClaseSerializer, BitacoraSerializer
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

class RegistroClaseViewSet(BaseViewSet):
    queryset = RegistroClase.objects.all()
    serializer_class = RegistroClaseSerializer

class BitacoraViewSet(BaseViewSet):
    queryset = Bitacora.objects.all().order_by('-fecha_hora') # El más reciente primero
    serializer_class = BitacoraSerializer

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
                "status": "ok",
                "success": True,
                "rol": user.username,
                "mensaje": "Login exitoso",
                "usuario": user.username
            }, status=status.HTTP_200_OK)
        else:
            # Restauré esta parte para que Angular sepa si la contraseña es incorrecta
            return Response({
                "success": False,
                "error": "Credenciales incorrectas"
            }, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['POST'])
@permission_classes([AllowAny])
def crear_coach(request):
    email = request.data.get('email')
    password = request.data.get('password', 'admin123') # Contraseña por defecto

    if not email:
        return Response({"error": "El correo es obligatorio"}, status=400)

    if User.objects.filter(username=email).exists():
        return Response({"error": "Este coach ya está registrado"}, status=400)

    User.objects.create_user(username=email, password=password)
    return Response({"success": True, "mensaje": f"Coach {email} creado exitosamente"})