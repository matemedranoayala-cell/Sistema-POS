from application.interfaces.repositories import IUsuarioRepository
from typing import Dict, Any

class AutenticarUsuarioUseCase:
    def __init__(self, repositorio: IUsuarioRepository):
        self.repositorio = repositorio

    def ejecutar(self, identificador: str, password: str) -> Dict[str, Any]:
        if not identificador or not password:
            return {"success": False, "error": "Faltan credenciales"}
        usuario = self.repositorio.autenticar(identificador, password)

        if usuario:
            return {
                "success": True,
                "status": "ok",
                "rol": usuario.rol,
                "usuario": usuario.username
            }
        else:
            return {
                "success": False,
                "error": "Credenciales incorrectas"
            }