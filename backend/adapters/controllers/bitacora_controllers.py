from rest_framework.response import Response
from rest_framework import status
from adapters.controllers.base_controller import BaseCleanController
from infrastructure.django_apps.core_db.models import Bitacora


class BitacoraController(BaseCleanController):
    model = Bitacora

    def get(self, request, pk=None):
        qs = Bitacora.objects.all().order_by('-fecha_hora')
        res = []
        for b in qs:
            item = self.serializar(b)
            op_clean = str(b.operacion).replace('SUPERADMIN', 'ADMIN')
            det_clean = str(b.detalle or '').replace('SUPERADMIN', 'ADMIN')
            item['operacion'] = op_clean
            item['detalle'] = det_clean
            op_up = op_clean.upper()
            usr = str(b.usuario).lower()
            if 'COACH' in op_up or 'FIRMA' in op_up or '@' in usr or 'coach' in usr:
                item['rol'] = 'COACH'
            elif 'RECEPCION' in op_up or 'recepcion' in usr or 'caja' in usr:
                item['rol'] = 'RECEPCION'
            else:
                item['rol'] = 'ADMIN'
            res.append(item)
        return Response(res, status=status.HTTP_200_OK)