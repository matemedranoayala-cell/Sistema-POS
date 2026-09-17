import json
from django.http import JsonResponse

class KombatManagerControllers:
    def login(self, request, auth_use_case):
        if request.method != 'POST':
            return JsonResponse({"error": "Método no permitido"}, status=405)

        data = json.loads(request.body)
        username = data.get('username')
        password = data.get('password')

        exito, mensaje, usuario = auth_use_case.ejecutar(username, password)

        if exito:
            return JsonResponse({
                "status": "ok",
                "mensaje": mensaje,
                "rol": usuario.rol.value
            })
        return JsonResponse({"status": "error", "mensaje": mensaje}, status=401)

    def dashboard(self, request):
        metricas_mock = {
            "alumnos_activos": 120,
            "caja_diaria": 850.50,
            "mensualidades_por_vencer": 5
        }
        return JsonResponse({"status": "ok", "data": metricas_mock})

    def registrar_asistencia(self, request, asistencia_use_case):
        if request.method == 'POST':
            data = json.loads(request.body)
            ci_cliente = data.get('ci_cliente')
            fecha_actual = data.get('fecha_actual')

            puede_entrar, mensaje = asistencia_use_case.ejecutar(ci_cliente, fecha_actual)

            if puede_entrar:
                return JsonResponse({"status": "ok", "mensaje": mensaje})
            return JsonResponse({"status": "rechazado", "mensaje": mensaje}, status=403)

    def listar_alumnos(self, request):
        return JsonResponse({"status": "ok", "data": []})

    def listar_inventario(self, request):
        return JsonResponse({"status": "ok", "data": []})