class ListarPersonalUseCase:
    def __init__(self, repositorio):
        self.repositorio = repositorio

    def ejecutar(self):
        return self.repositorio.listar_todos()

class CrearPersonalUseCase:
    def __init__(self, repositorio):
        self.repositorio = repositorio

    def ejecutar(self, username, password, rol, rol_creador='ADMIN'):
        if not username or not password:
            return {"success": False, "error": "Ingresa el usuario y la contraseña"}

        rol_str = str(rol or 'COACH').upper()
        if 'RECEPCION' in rol_str:
            rol_final = 'RECEPCION'
        elif 'ADMIN' in rol_str:
            rol_final = 'ADMIN'
        else:
            rol_final = 'COACH'

        return self.repositorio.crear_usuario(username.strip(), password.strip(), rol_final)

class ActualizarPersonalUseCase:
    def __init__(self, repositorio):
        self.repositorio = repositorio

    def ejecutar(self, user_id, datos, rol_operador='ADMIN'):
        usuario_actual = self.repositorio.obtener_por_id(user_id)
        if not usuario_actual:
            return {"success": False, "error": "Usuario no encontrado"}

        if str(usuario_actual.get('rol', '')).upper() == 'ADMIN':
            return {"success": False, "error": "No se puede editar ni inhabilitar a un Administrador"}

        return self.repositorio.actualizar_usuario(user_id, datos)