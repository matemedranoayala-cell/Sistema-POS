from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from application.use_cases.superadmin import (
    listar_cierres,
    listar_cuentas,
    restablecer_contrasena,
    resumen_panel,
    revisar_cierre,
    serializar_cierre,
)


class _SuperadminView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []


class ResumenSuperadminController(_SuperadminView):
    def get(self, request):
        return Response(resumen_panel(), status=status.HTTP_200_OK)


class CuentasSuperadminController(_SuperadminView):
    def get(self, request):
        return Response(listar_cuentas(), status=status.HTTP_200_OK)


class RestablecerContrasenaController(_SuperadminView):
    def post(self, request):
        try:
            resultado = restablecer_contrasena(
                username=request.data.get("username"),
                nueva_contrasena=request.data.get("nueva_contrasena"),
                operador=request.data.get("usuario"),
            )
        except ValueError as error:
            return Response({"error": str(error)}, status=status.HTTP_400_BAD_REQUEST)
        if resultado is None:
            return Response({"error": "Usuario no encontrado"}, status=status.HTTP_404_NOT_FOUND)
        return Response(resultado, status=status.HTTP_200_OK)


class ArqueosSuperadminController(_SuperadminView):
    def get(self, request):
        return Response(listar_cierres(), status=status.HTTP_200_OK)


class RevisarArqueoController(_SuperadminView):
    def post(self, request, pk):
        try:
            cierre = revisar_cierre(
                cierre_id=pk,
                decision=request.data.get("decision"),
                nota=request.data.get("nota"),
                operador=request.data.get("usuario"),
            )
        except ValueError as error:
            return Response({"error": str(error)}, status=status.HTTP_400_BAD_REQUEST)
        if cierre is None:
            return Response({"error": "Arqueo no encontrado"}, status=status.HTTP_404_NOT_FOUND)
        return Response(serializar_cierre(cierre), status=status.HTTP_200_OK)
