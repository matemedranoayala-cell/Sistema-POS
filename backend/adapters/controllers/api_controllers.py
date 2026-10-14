from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.contrib.auth.hashers import check_password
from infrastructure.django_apps.core_db.models import Usuario, Bitacora

class LoginController(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        username = request.data.get('username', '').strip()
        password = request.data.get('password', '').strip()

        rol_detectado = None
        usuario_valido = False

        try:
            u_custom = Usuario.objects.filter(username=username).first()
            if u_custom:
                if not u_custom.activo:
                    return Response({"status": "error", "message": "Usuario inhabilitado"}, status=status.HTTP_403_FORBIDDEN)
                if u_custom.password_hash == password or check_password(password, u_custom.password_hash):
                    usuario_valido = True
                    rol_detectado = str(u_custom.rol or 'RECEPCION').upper()
        except Exception:
            pass

        if not usuario_valido:
            user_dj = authenticate(username=username, password=password)
            if not user_dj:
                u_obj = User.objects.filter(username=username).first() or User.objects.filter(email=username).first()
                if u_obj and u_obj.check_password(password):
                    if not u_obj.is_active:
                        return Response({"status": "error", "message": "Usuario inhabilitado"}, status=status.HTTP_403_FORBIDDEN)
                    user_dj = u_obj

            if user_dj:
                usuario_valido = True
                if user_dj.is_superuser:
                    rol_detectado = 'SUPERADMIN'
                elif user_dj.is_staff and not user_dj.first_name:
                    rol_detectado = 'ADMIN'
                elif user_dj.first_name:
                    rol_detectado = user_dj.first_name.upper()
                else:
                    rol_detectado = 'COACH' if '@' in username or 'coach' in username.lower() else 'RECEPCION'

        if usuario_valido:
            Bitacora.objects.create(
                usuario=username,
                operacion=f"LOGIN ({rol_detectado})",
                modulo="Autenticación",
                detalle=f"Inicio de sesión exitoso con rol {rol_detectado}",
                estado="Activo",
                color="green"
            )
            return Response({
                "status": "ok",
                "username": username,
                "rol": rol_detectado.lower()
            }, status=status.HTTP_200_OK)

        return Response({"status": "error", "message": "Credenciales inválidas"}, status=status.HTTP_401_UNAUTHORIZED)

class LogoutController(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        username = request.data.get('username', 'operador')
        rol = str(request.data.get('rol', 'ADMIN')).upper()
        Bitacora.objects.create(
            usuario=username,
            operacion=f"LOGOUT ({rol})",
            modulo="Autenticación",
            detalle="Cierre de sesión de operador",
            estado="Finalizado",
            color="gray"
        )
        return Response({"status": "ok"}, status=status.HTTP_200_OK)