from dataclasses import dataclass

DURACION_MENSUALIDAD_DIAS = 30


@dataclass(frozen=True)
class PlanMensual:
    id: int
    nombre: str
    precio: float


# Mismos planes y precios que ofrece recepción al inscribir y renovar.
CATALOGO_PLANES = {
    1: PlanMensual(id=1, nombre="Plan Básico", precio=250.0),
    2: PlanMensual(id=2, nombre="Plan Ilimitado", precio=350.0),
}

METODOS_PAGO = ("Efectivo", "QR / Transferencia")


def obtener_plan(plan_id) -> PlanMensual | None:
    try:
        return CATALOGO_PLANES.get(int(plan_id))
    except (TypeError, ValueError):
        return None
