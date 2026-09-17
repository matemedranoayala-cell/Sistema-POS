from dataclasses import dataclass
from enum import Enum

class RolUsuario(Enum):
    SUPERADMIN = "SUPERADMIN"
    RECEPCIONISTA = "RECEPCIONISTA"
    ENCARGADO_TIENDA = "ENCARGADO_TIENDA"

@dataclass
class Usuario:
    id: int
    nombre_completo: str
    correo: str
    password_hash: str
    rol: RolUsuario
    activo: bool = True