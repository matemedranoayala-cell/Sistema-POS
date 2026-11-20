from zoneinfo import ZoneInfo

from django.utils import timezone
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework import status
from adapters.controllers.base_controller import BaseCleanController
from adapters.repositories.django_repositories import DjangoAlumnoRepository, DjangoInscripcionRepository
from application.use_cases.buscar_alumnos import BuscarAlumnosUseCase
from application.use_cases.inscribir_alumno import InscribirAlumnoUseCase
from infrastructure.django_apps.core_db.models import (
    Alumno,
    Pago,
    Asistencia,
    Venta,
    Bitacora,
)


class AlumnoController(BaseCleanController):
    model = Alumno

    def post(self, request):
        hoy = timezone.localtime(timezone.now(), ZoneInfo("America/La_Paz")).date()
        caso = InscribirAlumnoUseCase(DjangoInscripcionRepository())
        try:
            resultado = caso.ejecutar(
                datos=request.data,
                metodo_pago=request.data.get("metodo_pago"),
                usuario=request.data.get("usuario"),
                fecha_actual=hoy,
            )
        except ValueError as error:
            return Response({"error": str(error)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(resultado, status=status.HTTP_201_CREATED)


class PagoController(BaseCleanController):
    model = Pago

    def post(self, request):
        aid = request.data.get('alumno') or request.data.get('alumno_id')
        dni = str(request.data.get('dni', '')).strip()
        plan_id = request.data.get('plan_id')
        monto = float(request.data.get('monto', 250))
        metodo = request.data.get('metodo_pago', 'Efectivo')
        venc = request.data.get('proximo_vencimiento')
        usr = request.data.get('usuario', 'recepcion')

        alumno_obj = None
        if aid and str(aid).isdigit():
            alumno_obj = Alumno.objects.filter(pk=int(aid)).first()
        if not alumno_obj and dni:
            alumno_obj = (
                    Alumno.objects.filter(dni__iexact=dni).first()
                    or Alumno.objects.filter(dni__icontains=dni).first()
            )

        if not alumno_obj:
            return Response(
                {'error': 'Alumno no encontrado'},
                status=status.HTTP_404_NOT_FOUND
            )

        alumno_obj.estado = 'Activo'
        if plan_id and str(plan_id).isdigit():
            alumno_obj.plan_id = int(plan_id)
        alumno_obj.save()

        nuevo_pago = Pago.objects.create(
            alumno_id=alumno_obj.id,
            monto=monto,
            metodo_pago=metodo,
            proximo_vencimiento=venc
        )

        Venta.objects.create(total=monto, metodo_pago=metodo)

        nom = f"{alumno_obj.nombre} {alumno_obj.apellidos or ''}".strip()
        Bitacora.objects.create(
            usuario=usr,
            operacion='Renovacion Membresia (RECEPCION)',
            modulo='Caja / Recepcion',
            detalle=f"Renovacion de {nom} (CI: {alumno_obj.dni}) Bs {monto}",
            estado='Registrado',
            color='green'
        )

        return Response(
            self.serializar(nuevo_pago),
            status=status.HTTP_201_CREATED
        )


class AsistenciaController(BaseCleanController):
    model = Asistencia

    def get(self, request, pk=None):
        qs = Asistencia.objects.select_related('alumno').order_by('-fecha_hora')
        res = []
        for a in qs:
            item = self.serializar(a)
            if a.alumno:
                nom = f"{a.alumno.nombre} {a.alumno.apellidos or ''}"
                item['nombre'] = nom.strip().upper()
                item['dni'] = a.alumno.dni or ''
                item['plan'] = a.alumno.plan_id or 1
                item['academia'] = a.alumno.academia_origen or 'Kombat'
            item['estado'] = a.estado_acceso
            res.append(item)
        return Response(res, status=status.HTTP_200_OK)

    def post(self, request):
        aid = request.data.get('alumno') or request.data.get('alumno_id')
        dni = str(request.data.get('dni', '')).strip()
        est = request.data.get('estado_acceso', 'Permitido')

        alumno_obj = None
        if aid and str(aid).isdigit():
            alumno_obj = Alumno.objects.filter(pk=int(aid)).first()
        if not alumno_obj and dni:
            alumno_obj = (
                    Alumno.objects.filter(dni__iexact=dni).first()
                    or Alumno.objects.filter(dni__icontains=dni).first()
            )

        if not alumno_obj:
            return Response(
                {'error': 'Alumno no encontrado'},
                status=status.HTTP_404_NOT_FOUND
            )

        nuevo = Asistencia.objects.create(
            alumno_id=alumno_obj.id,
            estado_acceso=est
        )
        item = self.serializar(nuevo)
        nom = f"{alumno_obj.nombre} {alumno_obj.apellidos or ''}"
        item['nombre'] = nom.strip().upper()
        item['dni'] = alumno_obj.dni or ''
        item['plan'] = alumno_obj.plan_id or 1
        item['academia'] = alumno_obj.academia_origen or 'Kombat'
        item['estado'] = nuevo.estado_acceso
        return Response(item, status=status.HTTP_201_CREATED)

class BuscarAlumnosController(APIView):
    """GET /api/alumnos/buscar/?criterio=ci|nombre&q=texto"""
    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request):
        hoy = timezone.localtime(timezone.now(), ZoneInfo("America/La_Paz")).date()
        caso = BuscarAlumnosUseCase(DjangoAlumnoRepository())
        try:
            resultados = caso.ejecutar(
                criterio=request.query_params.get("criterio"),
                termino=request.query_params.get("q"),
                fecha_actual=hoy,
            )
        except ValueError as error:
            return Response({"error": str(error)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(resultados, status=status.HTTP_200_OK)
