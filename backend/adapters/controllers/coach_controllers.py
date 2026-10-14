from rest_framework.response import Response
from rest_framework import status
from adapters.controllers.base_controller import BaseCleanController
from infrastructure.django_apps.core_db.models import (
    ReporteEquipo,
    RegistroClase,
    Bitacora,
)


class ReporteEquipoController(BaseCleanController):
    model = ReporteEquipo

    def post(self, request):
        eq = request.data.get('equipo', 'Equipo')
        est = request.data.get('estado_danio', 'Reportado')
        desc = request.data.get('descripcion', '')
        usr = request.data.get('usuario', 'coach')
        rol_raw = str(request.data.get('rol', 'COACH')).upper()
        rol = rol_raw.replace('SUPERADMIN', 'ADMIN')

        nuevo = ReporteEquipo.objects.create(
            equipo=eq,
            estado_danio=est,
            descripcion=desc
        )

        Bitacora.objects.create(
            usuario=usr,
            operacion=f"Reporte de Dano ({rol})",
            modulo='Mantenimiento',
            detalle=f"{eq} ({est}): {desc}",
            estado='Pendiente',
            color='orange'
        )

        return Response(self.serializar(nuevo), status=status.HTTP_201_CREATED)


class RegistroClaseController(BaseCleanController):
    model = RegistroClase

    def post(self, request):
        coach = request.data.get('coach', 'coach')
        clase = request.data.get('clase_impartida', '')
        total = int(request.data.get('total_asistentes', 0))

        nuevo = RegistroClase.objects.create(
            coach=coach,
            clase_impartida=clase,
            total_asistentes=total
        )

        Bitacora.objects.create(
            usuario=coach,
            operacion='Firma de Clase (COACH)',
            modulo='Tatami',
            detalle=f"Clase: {clase} ({total} alumnos)",
            estado='Registrado',
            color='green'
        )

        return Response(self.serializar(nuevo), status=status.HTTP_201_CREATED)