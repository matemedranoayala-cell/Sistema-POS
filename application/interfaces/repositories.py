from abc import ABC, abstractmethod
from datetime import date
from core.entities.membresia import Membresia
from core.entities.usuario import Usuario
from core.entities.producto import Producto

class IMembresiaRepository(ABC):
    @abstractmethod
    def obtener_activa_por_cliente(self, ci_cliente: str) -> Membresia | None:
        pass

class IAsistenciaRepository(ABC):
    @abstractmethod
    def contar_asistencias_semana(self, ci_cliente: str, fecha_actual: date) -> int:
        pass

    @abstractmethod
    def registrar_ingreso(self, ci_cliente: str, fecha_actual: date) -> None:
        pass

class IUsuarioRepository(ABC):
    @abstractmethod
    def obtener_por_credenciales(self, username: str, password_plana: str) -> Usuario | None:
        pass

class IProductoRepository(ABC):
    @abstractmethod
    def obtener_catalogo_disponible(self) -> list[Producto]:
        pass
    