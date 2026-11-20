from datetime import date

from application.interfaces.repositories import IAlumnoRepository

CRITERIOS_VALIDOS = ("ci", "nombre")
LIMITE_RESULTADOS = 10
LARGO_MINIMO_NOMBRE = 2


class BuscarAlumnosUseCase:
    """Busca alumnos para el control de acceso, por CI o por nombre."""

    def __init__(self, alumno_repo: IAlumnoRepository):
        self.alumno_repo = alumno_repo

    def ejecutar(self, criterio: str, termino: str, fecha_actual: date) -> list[dict]:
        criterio = str(criterio or "").strip().lower()
        termino = " ".join(str(termino or "").split())

        if criterio not in CRITERIOS_VALIDOS:
            raise ValueError("El criterio de búsqueda debe ser 'ci' o 'nombre'")
        if not termino:
            raise ValueError("Escribe un CI o un nombre para buscar")

        if criterio == "ci":
            alumnos = self.alumno_repo.buscar_por_ci(termino, LIMITE_RESULTADOS)
        else:
            if len(termino) < LARGO_MINIMO_NOMBRE:
                raise ValueError(
                    f"Escribe al menos {LARGO_MINIMO_NOMBRE} letras del nombre"
                )
            alumnos = self.alumno_repo.buscar_por_nombre(
                termino.split(" "), LIMITE_RESULTADOS
            )

        return [
            {
                "id": a.id,
                "nombre": a.nombre_completo.upper(),
                "dni": a.dni,
                "plan_id": a.plan_id,
                "academia": a.academia,
                "estado": a.estado,
                "vencimiento_membresia": (
                    a.vencimiento_membresia.isoformat() if a.vencimiento_membresia else None
                ),
                "membresia_vigente": a.membresia_vigente(fecha_actual),
            }
            for a in alumnos
        ]
