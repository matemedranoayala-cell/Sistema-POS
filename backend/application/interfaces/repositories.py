from abc import ABC, abstractmethod
from core.entities.usuario import Usuario
from core.entities.alumno import Alumno as AlumnoEntidad
from typing import List
from datetime import date

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

class IAlumnoRepository(ABC):
    @abstractmethod
    def buscar_por_ci(self, ci: str, limite: int) -> List[AlumnoEntidad]:
        """Alumnos cuyo CI contiene el texto; las coincidencias exactas primero."""
        pass

    @abstractmethod
    def buscar_por_nombre(self, palabras: List[str], limite: int) -> List[AlumnoEntidad]:
        """Alumnos cuyo nombre o apellidos contienen todas las palabras."""
        pass


class IInscripcionRepository(ABC):
    @abstractmethod
    def existe_alumno_con_ci(self, ci: str) -> bool:
        pass

    @abstractmethod
    def inscribir_con_pago(
        self,
        datos_alumno: dict,
        monto: float,
        metodo_pago: str,
        proximo_vencimiento: date,
        usuario: str,
    ) -> dict:
        """Crea el alumno y su primer pago en una sola operación atómica."""
        pass
