from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.utils import timezone


class BaseCleanController(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []
    model = None

    def serializar(self, obj):
        data = {}
        for f in obj._meta.fields:
            val = getattr(obj, f.name)
            tipo = f.get_internal_type()
            if tipo in ['DateTimeField', 'DateField']:
                if val:
                    if isinstance(val, str):
                        data[f.name] = val
                        if 'fecha' not in data:
                            data['fecha'] = val[:10]
                    else:
                        es_tz = hasattr(val, 'astimezone')
                        loc = timezone.localtime(val) if es_tz else val
                        if hasattr(loc, 'isoformat'):
                            data[f.name] = loc.isoformat()
                        else:
                            data[f.name] = str(loc)
                        if hasattr(loc, 'strftime'):
                            if tipo == 'DateTimeField':
                                data['fecha'] = loc.strftime('%Y-%m-%d')
                                data['hora'] = loc.strftime('%I:%M %p')
                            elif 'fecha' not in data:
                                data['fecha'] = loc.strftime('%Y-%m-%d')
                else:
                    data[f.name] = None
            elif tipo == 'ForeignKey':
                data[f.name] = getattr(obj, f.attname)
            elif tipo == 'DecimalField':
                data[f.name] = float(val) if val is not None else 0.0
            else:
                data[f.name] = val
        return data

    def get(self, request, pk=None):
        if pk:
            obj = self.model.objects.filter(pk=pk).first()
            if not obj:
                return Response(
                    {'error': 'No encontrado'},
                    status=status.HTTP_404_NOT_FOUND
                )
            return Response(self.serializar(obj), status=status.HTTP_200_OK)
        qs = self.model.objects.all().order_by('-pk')
        return Response([self.serializar(o) for o in qs], status=status.HTTP_200_OK)

    def post(self, request):
        datos = {}
        for f in self.model._meta.fields:
            if f.primary_key or getattr(f, 'auto_now_add', False):
                continue
            if f.get_internal_type() == 'ForeignKey':
                v = request.data.get(f.name, request.data.get(f.attname))
                if v is not None:
                    datos[f.attname] = int(v) if str(v).isdigit() else v
            elif f.name in request.data:
                datos[f.name] = request.data.get(f.name)
        nuevo = self.model.objects.create(**datos)
        return Response(self.serializar(nuevo), status=status.HTTP_201_CREATED)