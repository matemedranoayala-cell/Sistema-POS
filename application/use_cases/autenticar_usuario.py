from application.interfaces.repositories import IUsuarioRepository
from core.entities.usuario import Usuario

class AutenticarUsuarioUseCase:
    def __init__(self, usuario_repo: IUsuarioRepository):
        self.usuario_repo = usuario_repo

    def ejecutar(self, username: str, password_plana: str) -> tuple[bool, str, Usuario | None]:
        usuario = self.usuario_repo.obtener_por_credenciales(username, password_plana)

        if not usuario:
            return False, "Credenciales incorrectas o el usuario no existe.", None

        if not usuario.activo:
            return False, "Cuenta desactivada. Comuníquese con la administración.", None

        return True, "Autenticación exitosa.", usuario