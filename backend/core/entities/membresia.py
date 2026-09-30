from dataclasses import dataclass
from datetime import date
from enum import Enum

class EstadoMembresia(Enum):
    ACTIVA = "ACTIVA"
    VENCIDA = "VENCIDA"
    CANCELADA = "CANCELADA"

@dataclass
class PlanMembresia:
    id_plan: int
    nombre: str
    limite_clases_semana: int

@dataclass
class Membresia:
    id_membresia: int
    ci_cliente: str
    plan: PlanMembresia
    fecha_inicio: date
    fecha_vencimiento: date
    estado: EstadoMembresia

    def esta_vigente(self, fecha_actual: date) -> bool:
        if self.estado != EstadoMembresia.ACTIVA:
            return False
        return self.fecha_inicio <= fecha_actual <= self.fecha_vencimiento

    def puede_ingresar(self, asistencias_semana_actual: int, fecha_actual: date) -> tuple[bool, str]:
        if not self.esta_vigente(fecha_actual):
            return False, "Membresía inactiva o fuera de fecha."

        if asistencias_semana_actual >= self.plan.limite_clases_semana:
            return False, f"Atención: Límite de {self.plan.limite_clases_semana} clases por semana alcanzado."

        return True, "Ingreso permitido. ¡Al tatami!"