"""Casos de uso exclusivos del panel de Superadmin."""
import math
from datetime import datetime, time, timedelta
from zoneinfo import ZoneInfo

from django.contrib.auth.hashers import make_password
from django.contrib.auth.models import User
from django.db import transaction
from django.db.models import Sum
from django.utils import timezone

from infrastructure.django_apps.core_db.models import (
    Alumno,
    Asistencia,
    Bitacora,
    CierreCaja,
    DetalleVenta,
    Pago,
    Producto,
    Usuario,
    Venta,
)

ZONA_LOCAL = ZoneInfo("America/La_Paz")
LARGO_MINIMO_CONTRASENA = 8
DECISIONES_ARQUEO = {"Verificado", "Observado"}

# Franjas del mapa de calor: (etiqueta, hora_inicio, hora_fin)
FRANJAS_HORARIAS = [
    ("06:00", 6, 9),
    ("09:00", 9, 12),
    ("12:00", 12, 16),
    ("16:00", 16, 19),
    ("19:00", 19, 21),
    ("21:00", 21, 24),
]
DIAS_SEMANA = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]
SEMANAS_MAPA_CALOR = 8
DIAS_RITMO_VENTAS = 14
DIAS_COBERTURA_COMPRA = 14


# ---------------------------------------------------------------- cuentas

def _rol_django(u):
    if u.is_superuser:
        return "SUPERADMIN"
    if u.first_name:
        return u.first_name.upper()
    if u.is_staff:
        return "ADMIN"
    return "COACH" if "@" in u.username else "RECEPCION"


def listar_cuentas():
    """Todas las cuentas que pueden iniciar sesion, unificadas por username.

    El login revisa primero la tabla Usuario y despues User de Django, asi
    que el rol mostrado sigue ese mismo orden.
    """
    cuentas = {}
    for u in Usuario.objects.all().order_by("username"):
        clave = u.username.strip().lower()
        cuentas[clave] = {
            "username": u.username.strip(),
            "rol": str(u.rol or "RECEPCION").upper(),
            "activo": bool(u.activo),
        }
    for u in User.objects.all().order_by("username"):
        clave = u.username.strip().lower()
        if clave in cuentas:
            continue
        cuentas[clave] = {
            "username": u.username.strip(),
            "rol": _rol_django(u),
            "activo": bool(u.is_active),
        }
    return sorted(cuentas.values(), key=lambda c: c["username"].lower())


@transaction.atomic
def restablecer_contrasena(username, nueva_contrasena, operador):
    username = str(username or "").strip()
    nueva = str(nueva_contrasena or "").strip()
    operador = str(operador or "superadmin").strip()

    if not username:
        raise ValueError("Indica el usuario")
    if len(nueva) < LARGO_MINIMO_CONTRASENA:
        raise ValueError(
            f"La contraseña debe tener al menos {LARGO_MINIMO_CONTRASENA} caracteres"
        )

    # Se actualizan ambas tablas: el login acepta cualquiera de las dos.
    actualizadas = 0
    for u in Usuario.objects.select_for_update().filter(username__iexact=username):
        u.password_hash = make_password(nueva)
        u.save(update_fields=["password_hash"])
        actualizadas += 1
    for u in User.objects.select_for_update().filter(username__iexact=username):
        u.set_password(nueva)
        u.save(update_fields=["password"])
        actualizadas += 1

    if actualizadas == 0:
        return None

    Bitacora.objects.create(
        usuario=operador,
        operacion="Restablecer Contraseña (SUPERADMIN)",
        modulo="Seguridad",
        detalle=f"Contraseña restablecida para el usuario {username}",
        estado="Registrado",
        color="orange",
    )
    return {"username": username}


# ---------------------------------------------------------------- arqueos

def _estado_arqueo(estado):
    # Hay registros con y sin tilde ("Auditoría" / "Auditoria").
    texto = str(estado or "").strip()
    return "Pendiente" if texto.lower().startswith("auditor") or not texto else texto


def serializar_cierre(c):
    fecha = timezone.localtime(c.fecha_cierre, ZONA_LOCAL) if c.fecha_cierre else None
    return {
        "id": c.id,
        "fecha": fecha.date().isoformat() if fecha else None,
        "hora": fecha.strftime("%I:%M %p") if fecha else "",
        "total_ingresos": float(c.total_ingresos or 0),
        "observaciones": c.observaciones or "",
        "estado": _estado_arqueo(c.estado),
    }


def listar_cierres():
    return [serializar_cierre(c) for c in CierreCaja.objects.order_by("-fecha_cierre", "-id")]


@transaction.atomic
def revisar_cierre(cierre_id, decision, nota, operador):
    if decision not in DECISIONES_ARQUEO:
        raise ValueError("La decisión debe ser 'Verificado' u 'Observado'")
    nota = str(nota or "").strip()
    operador = str(operador or "superadmin").strip()
    if decision == "Observado" and not nota:
        raise ValueError("Escribe una nota explicando la observación")

    cierre = CierreCaja.objects.select_for_update().filter(pk=cierre_id).first()
    if cierre is None:
        return None
    if _estado_arqueo(cierre.estado) != "Pendiente":
        raise ValueError("Este arqueo ya fue revisado")

    cierre.estado = decision
    if nota:
        base = (cierre.observaciones or "").rstrip()
        cierre.observaciones = f"{base}\n[Revisión de {operador}] {nota}".strip()
    cierre.save(update_fields=["estado", "observaciones"])

    Bitacora.objects.create(
        usuario=operador,
        operacion="Revisión de Arqueo (SUPERADMIN)",
        modulo="Caja",
        detalle=f"Arqueo #{cierre.pk} marcado como {decision}" + (f": {nota}" if nota else ""),
        estado="Registrado",
        color="green" if decision == "Verificado" else "red",
    )
    return cierre


# ---------------------------------------------------------------- metricas

def _inicio_dia_local(fecha):
    return datetime.combine(fecha, time.min, tzinfo=ZONA_LOCAL)


def _suma(qs, campo):
    return float(qs.aggregate(t=Sum(campo))["t"] or 0)


def _ingresos_tienda_sin_duplicar(desde, hasta):
    # Solo ventas de tienda (con productos). Cada pago de membresia tambien
    # crea una Venta sin detalle, que ya se cuenta en Pago.
    ids = (
        Venta.objects.filter(
            estado_pago="PAGADO",
            fecha_pago__gte=desde,
            fecha_pago__lt=hasta,
            detalles__isnull=False,
        )
        .values_list("id", flat=True)
        .distinct()
    )
    return _suma(Venta.objects.filter(id__in=list(ids)), "total")


def _metricas_ingresos(hoy):
    inicio_hoy = _inicio_dia_local(hoy)
    manana = inicio_hoy + timedelta(days=1)
    inicio_mes = _inicio_dia_local(hoy.replace(day=1))

    def bloque(desde, hasta):
        membresias = _suma(
            Pago.objects.filter(fecha_pago__gte=desde, fecha_pago__lt=hasta), "monto"
        )
        tienda = _ingresos_tienda_sin_duplicar(desde, hasta)
        return {
            "membresias": round(membresias, 2),
            "tienda": round(tienda, 2),
            "total": round(membresias + tienda, 2),
        }

    return {"hoy": bloque(inicio_hoy, manana), "mes": bloque(inicio_mes, manana)}


def _metricas_alumnos(hoy):
    inicio_hoy = _inicio_dia_local(hoy)
    # Membresia vigente = el alumno tiene algun pago que vence hoy o despues.
    vigentes = (
        Pago.objects.filter(proximo_vencimiento__gte=hoy)
        .values("alumno_id")
        .distinct()
        .count()
    )
    visitas_hoy = Asistencia.objects.filter(
        fecha_hora__gte=inicio_hoy,
        fecha_hora__lt=inicio_hoy + timedelta(days=1),
        estado_acceso="Permitido",
    ).count()
    return {
        "alumnos_registrados": Alumno.objects.count(),
        "membresias_vigentes": vigentes,
        "visitas_hoy": visitas_hoy,
    }


def _prediccion_inventario(ahora):
    desde = ahora - timedelta(days=DIAS_RITMO_VENTAS)
    vendidos = {
        fila["producto_id"]: int(fila["total"] or 0)
        for fila in DetalleVenta.objects.filter(venta__fecha__gte=desde)
        .values("producto_id")
        .annotate(total=Sum("cantidad"))
    }

    predicciones = []
    for p in Producto.objects.filter(pk__in=vendidos.keys()):
        cantidad = vendidos[p.pk]
        ritmo = cantidad / DIAS_RITMO_VENTAS  # unidades por dia
        if ritmo <= 0:
            continue
        dias = p.stock / ritmo if p.stock > 0 else 0
        agota = timezone.localtime(ahora, ZONA_LOCAL) + timedelta(days=dias)
        comprar = max(0, math.ceil(ritmo * DIAS_COBERTURA_COMPRA - p.stock))
        predicciones.append({
            "producto_id": p.pk,
            "producto": p.nombre,
            "stock": p.stock,
            "vendidos_periodo": cantidad,
            "ritmo_diario": round(ritmo, 2),
            "dias_restantes": round(dias, 1),
            "agota_en": agota.date().isoformat(),
            "sugerencia_compra": comprar,
            "color": "red" if dias <= 3 else ("orange" if dias <= 7 else "green"),
        })

    predicciones.sort(key=lambda x: x["dias_restantes"])
    return {"dias_analizados": DIAS_RITMO_VENTAS, "productos": predicciones[:5]}


def _mapa_calor(ahora):
    desde = ahora - timedelta(weeks=SEMANAS_MAPA_CALOR)
    conteo = [[0] * len(FRANJAS_HORARIAS) for _ in DIAS_SEMANA]

    for fecha_hora in Asistencia.objects.filter(
        fecha_hora__gte=desde, estado_acceso="Permitido"
    ).values_list("fecha_hora", flat=True):
        local = timezone.localtime(fecha_hora, ZONA_LOCAL)
        for i, (_, inicio, fin) in enumerate(FRANJAS_HORARIAS):
            if inicio <= local.hour < fin:
                conteo[local.weekday()][i] += 1
                break

    maximo = max((v for fila in conteo for v in fila), default=0)

    def nivel(valor):
        if valor == 0 or maximo == 0:
            return "low"
        ratio = valor / maximo
        if ratio <= 0.4:
            return "med"
        if ratio <= 0.8:
            return "high"
        return "max"

    return {
        "semanas_analizadas": SEMANAS_MAPA_CALOR,
        "horas": [f[0] for f in FRANJAS_HORARIAS],
        "dias": [
            {
                "dia": DIAS_SEMANA[d],
                "conteos": conteo[d],
                "valores": [nivel(v) for v in conteo[d]],
            }
            for d in range(len(DIAS_SEMANA))
        ],
        "total_asistencias": sum(sum(f) for f in conteo),
    }


def resumen_panel():
    ahora = timezone.now()
    hoy = timezone.localtime(ahora, ZONA_LOCAL).date()
    return {
        "fecha": hoy.isoformat(),
        "ingresos": _metricas_ingresos(hoy),
        "alumnos": _metricas_alumnos(hoy),
        "inventario": _prediccion_inventario(ahora),
        "mapa_calor": _mapa_calor(ahora),
        "arqueos_pendientes": sum(
            1 for c in CierreCaja.objects.only("estado") if _estado_arqueo(c.estado) == "Pendiente"
        ),
    }
