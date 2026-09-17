from datetime import date
from application.interfaces.repositories import IMembresiaRepository, IAsistenciaRepository

class RegistrarAsistenciaUseCase:
    def __init__(self, membresia_repo: IMembresiaRepository, asistencia_repo: IAsistenciaRepository):
        self.membresia_repo = membresia_repo
        self.asistencia_repo = asistencia_repo

    def ejecutar(self, ci_cliente: str, fecha_actual: date) -> tuple[bool, str]:
        membresia = self.membresia_repo.obtener_activa_por_cliente(ci_cliente)

        if not membresia:
            return False, "El estudiante no tiene una membresía registrada o activa."

        asistencias_semana = self.asistencia_repo.contar_asistencias_semana(ci_cliente, fecha_actual)

        puede_entrar, mensaje = membresia.puede_ingresar(asistencias_semana, fecha_actual)

        if puede_entrar:
            self.asistencia_repo.registrar_ingreso(ci_cliente, fecha_actual)

        return puede_entrar, mensaje