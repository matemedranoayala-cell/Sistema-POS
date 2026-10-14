from abc import ABC, abstractmethod
from core.entities.usuario import Usuario
from typing import List

class IUsuarioRepository(ABC):
    @abstractmethod
    def autenticar(self, identificador: str, password: str) -> Usuario | None:
        pass

    @abstractmethod
    def listar_personal(self) -> List[Usuario]:
        pass

    @abstractmethod
    def crear_personal(self, email: str, password: str, rol: str) -> Usuario | None:
        pass