import json
from django.http import JsonResponse

class KombatManagerControllers:
    def login(self, request, auth_use_case):
        print("\n" + "="*30)
        print("--- NUEVO INTENTO DE LOGIN ---")
        if request.method != 'POST':
            return JsonResponse({"error": "Método no permitido"}, status=405)

        try:
            data = json.loads(request.body)
            print("1. JSON recibido desde Angular:", data)

            # Intentamos atrapar los datos sin importar cómo los llame Angular
            username = data.get('username', data.get('usuario', data.get('id')))
            password = data.get('password', data.get('pass', data.get('clave')))

            print(f"2. Variables extraídas -> User: '{username}' | Pass: '{password}'")

            exito, mensaje, usuario = auth_use_case.ejecutar(username, password)
            print(f"3. Resultado del Caso de Uso -> Éxito: {exito} | Mensaje: {mensaje}")

            if exito:
                # Extraemos el valor del rol de forma segura
                rol_str = usuario.rol.value if hasattr(usuario.rol, 'value') else str(usuario.rol)
                print(f"4. Login Aceptado. Redirigiendo como: {rol_str}")
                print("="*30 + "\n")
                return JsonResponse({
                    "status": "ok",
                    "mensaje": mensaje,
                    "rol": rol_str
                })
            else:
                print("4. Login Rechazado por credenciales o inactividad.")
                print("="*30 + "\n")
                return JsonResponse({"status": "error", "mensaje": mensaje}, status=401)

        except Exception as e:
            print(f"ERROR CRÍTICO EN LOGIN: {str(e)}")
            import traceback
            traceback.print_exc()
            return JsonResponse({"status": "error", "mensaje": "Error interno"}, status=500)

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

    def listar_inventario(self, request, inventario_use_case):
        if request.method != 'GET':
            return JsonResponse({"error": "Método no permitido"}, status=405)

        try:
            productos = inventario_use_case.ejecutar()
            return JsonResponse({"status": "ok", "data": productos})
        except Exception as e:
            return JsonResponse({"status": "error", "mensaje": str(e)}, status=500)

    def registrar_inscripcion(self, request):
        if request.method != 'POST':
            return JsonResponse({"status": "error", "mensaje": "Método no permitido"}, status=405)
        try:
            data = json.loads(request.body)
            action = data.get('action', 'inscribir_demo')
            return JsonResponse({
                "status": "ok",
                "mensaje": "Inscripción registrada con éxito en el sistema (Simulación)",
                "action_recibido": action
            })
        except Exception as e:
            return JsonResponse({"status": "error", "mensaje": str(e)}, status=400)

    def registrar_renovacion(self, request):
        if request.method != 'POST':
            return JsonResponse({"status": "error", "mensaje": "Método no permitido"}, status=405)
        try:
            data = json.loads(request.body)
            action = data.get('action', 'renovar_demo')
            return JsonResponse({
                "status": "ok",
                "mensaje": "Renovación registrada con éxito (Simulación)",
                "action_recibido": action
            })
        except Exception as e:
            return JsonResponse({"status": "error", "mensaje": str(e)}, status=400)

    def registrar_venta(self, request):
        if request.method != 'POST':
            return JsonResponse({"status": "error", "mensaje": "Método no permitido"}, status=405)
        try:
            data = json.loads(request.body)
            action = data.get('action', 'venta_demo')
            return JsonResponse({
                "status": "ok",
                "mensaje": "Venta registrada con éxito (Simulación)",
                "action_recibido": action
            })
        except Exception as e:
            return JsonResponse({"status": "error", "mensaje": str(e)}, status=400)

    def registrar_cierre_caja(self, request):
        if request.method != 'POST':
            return JsonResponse({"status": "error", "mensaje": "Método no permitido"}, status=405)
        try:
            data = json.loads(request.body)
            action = data.get('action', 'cierre_demo')
            return JsonResponse({
                "status": "ok",
                "mensaje": "Cierre de caja registrado con éxito (Simulación)",
                "action_recibido": action
            })
        except Exception as e:
            return JsonResponse({"status": "error", "mensaje": str(e)}, status=400)
