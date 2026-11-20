from datetime import date, timedelta

from application.interfaces.repositories import IInscripcionRepository
from core.entities.plan import DURACION_MENSUALIDAD_DIAS, METODOS_PAGO, obtener_plan


class InscribirAlumnoUseCase:
    """Inscribe a un alumno y registra el pago de su primera mensualidad.

    La mensualidad empieza a correr desde el día de la inscripción.
    """

    def __init__(self, repositorio: IInscripcionRepository):
        self.repositorio = repositorio

    def ejecutar(self, datos: dict, metodo_pago: str, usuario: str, fecha_actual: date) -> dict:
        nombre = str(datos.get("nombre") or "").strip()
        dni = str(datos.get("dni") or "").strip()
        if not nombre or not dni:
            raise ValueError("El nombre y el CI del alumno son obligatorios")

        plan = obtener_plan(datos.get("plan_id"))
        if plan is None:
            raise ValueError("Selecciona un plan válido")

        metodo_pago = str(metodo_pago or "").strip()
        if metodo_pago not in METODOS_PAGO:
            raise ValueError("Selecciona un método de pago válido")

        if self.repositorio.existe_alumno_con_ci(dni):
            raise ValueError(f"Ya existe un alumno registrado con el CI {dni}")

        vencimiento = fecha_actual + timedelta(days=DURACION_MENSUALIDAD_DIAS)
        datos_alumno = {
            "nombre": nombre,
            "apellidos": str(datos.get("apellidos") or "").strip(),
            "dni": dni,
            "telefono": str(datos.get("telefono") or "").strip(),
            "email": str(datos.get("email") or "").strip() or None,
            "plan_id": plan.id,
            "disciplina_id": str(datos.get("disciplina_id") or "").strip() or None,
            "es_competidor": bool(datos.get("es_competidor")),
            "academia_origen": str(datos.get("academia_origen") or "").strip() or "Kombat",
            "asociacion": str(datos.get("asociacion") or "").strip() or None,
        }

        resultado = self.repositorio.inscribir_con_pago(
            datos_alumno=datos_alumno,
            monto=plan.precio,
            metodo_pago=metodo_pago,
            proximo_vencimiento=vencimiento,
            usuario=str(usuario or "recepcion").strip(),
        )
        resultado["plan"] = plan.nombre
        return resultado
