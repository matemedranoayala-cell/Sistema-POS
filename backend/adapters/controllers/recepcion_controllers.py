from django.db.models import Q
from rest_framework.response import Response
from rest_framework import status
from adapters.controllers.base_controller import BaseCleanController
from infrastructure.django_apps.core_db.models import (
    Alumno,
    Pago,
    Asistencia,
    Venta,
    Bitacora,
)

CLASES_POR_PLAN = {1: 8, 2: 12, 3: 16, 4: 999, 5: 1, 6: 999}

class AlumnoController(BaseCleanController):
    model = Alumno

    def post(self, request):
        datos = request.data.copy() if hasattr(request.data, 'copy') else dict(request.data)
        plan_id_val = int(datos.get('plan_id')) if datos.get('plan_id') and str(datos.get('plan_id')).isdigit() else 1
        datos['clases_restantes'] = CLASES_POR_PLAN.get(plan_id_val, 8)
        request._full_data = datos

        res = super().post(request)
        if res.status_code == status.HTTP_201_CREATED and res.data.get('id'):
            Asistencia.objects.create(
                alumno_id=res.data['id'],
                estado_acceso='Permitido'
            )
        return res

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
        plan_id_val = int(plan_id) if plan_id and str(plan_id).isdigit() else (alumno_obj.plan_id or 1)
        alumno_obj.plan_id = plan_id_val
        alumno_obj.clases_restantes = CLASES_POR_PLAN.get(plan_id_val, 8)
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
                item['clases_restantes'] = a.alumno.clases_restantes
                item['telefono'] = a.alumno.telefono or ''
            item['estado'] = a.estado_acceso
            res.append(item)
        return Response(res, status=status.HTTP_200_OK)

    def post(self, request):
        aid = request.data.get('alumno') or request.data.get('alumno_id')
        dni = str(request.data.get('dni', '')).strip()
        nombre = str(request.data.get('nombre', '')).strip()

        alumno_obj = None
        if aid and str(aid).isdigit():
            alumno_obj = Alumno.objects.filter(pk=int(aid)).first()
        if not alumno_obj and dni:
            alumno_obj = (
                    Alumno.objects.filter(dni__iexact=dni).first()
                    or Alumno.objects.filter(dni__icontains=dni).first()
            )
        if not alumno_obj and nombre:
            alumno_obj = Alumno.objects.filter(
                Q(nombre__icontains=nombre) | Q(apellidos__icontains=nombre)
            ).first()

        if not alumno_obj:
            return Response(
                {'error': 'Alumno no encontrado'},
                status=status.HTTP_404_NOT_FOUND
            )

        if alumno_obj.clases_restantes > 0:
            est = 'Permitido'
            alumno_obj.clases_restantes -= 1
            alumno_obj.save()
        else:
            est = 'Denegado - Sin clases'

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
        item['clases_restantes'] = alumno_obj.clases_restantes
        item['telefono'] = alumno_obj.telefono or ''
        item['estado'] = nuevo.estado_acceso
        return Response(item, status=status.HTTP_201_CREATED)