from rest_framework import serializers
from .models import Alumno, Pago, Asistencia, Producto, Venta, DetalleVenta, ReporteEquipo, CierreCaja

class AlumnoSerializer(serializers.ModelSerializer):
    class Meta: model = Alumno; fields = '__all__'

class PagoSerializer(serializers.ModelSerializer):
    class Meta: model = Pago; fields = '__all__'

class AsistenciaSerializer(serializers.ModelSerializer):
    class Meta: model = Asistencia; fields = '__all__'

class ProductoSerializer(serializers.ModelSerializer):
    class Meta: model = Producto; fields = '__all__'

class DetalleVentaSerializer(serializers.ModelSerializer):
    class Meta: model = DetalleVenta; fields = '__all__'

class VentaSerializer(serializers.ModelSerializer):
    detalles = DetalleVentaSerializer(many=True, read_only=True)
    class Meta: model = Venta; fields = '__all__'

class ReporteEquipoSerializer(serializers.ModelSerializer):
    class Meta: model = ReporteEquipo; fields = '__all__'

class CierreCajaSerializer(serializers.ModelSerializer):
    class Meta: model = CierreCaja; fields = '__all__'