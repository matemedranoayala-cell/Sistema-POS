from dataclasses import dataclass
from datetime import date


@dataclass
class Alumno:
    id: int
    nombre: str
    apellidos: str
    dni: str
    plan_id: int | None
    academia: str
    estado: str
    vencimiento_membresia: date | None = None

    @property
    def nombre_completo(self) -> str:
        return f"{self.nombre} {self.apellidos}".strip()

    def membresia_vigente(self, fecha_actual: date) -> bool:
        return (
            self.vencimiento_membresia is not None
            and self.vencimiento_membresia >= fecha_actual
        )
