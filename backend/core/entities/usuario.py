from dataclasses import dataclass

@dataclass
class Usuario:
    username: str
    rol: str
    activo: bool = True