from django.db import models

# --- MÓDULO RECEPCIÓN ---
class Alumno(models.Model):
    nombre = models.CharField(max_length=100)
    # Hacemos que el resto de los campos sean opcionales por ahora para que no choquen con tu Angular
    apellidos = models.CharField(max_length=150, blank=True, null=True)
    dni = models.CharField(max_length=20, blank=True, null=True)
    telefono = models.CharField(max_length=20, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    plan_id = models.IntegerField(blank=True, null=True)
    disciplina_id = models.IntegerField(blank=True, null=True)
    fecha_inscripcion = models.DateTimeField(auto_now_add=True)
    estado = models.CharField(max_length=20, default='Activo')

    def __str__(self):
        return f"{self.nombre} {self.apellidos}"

class Pago(models.Model):
    alumno = models.ForeignKey(Alumno, on_delete=models.CASCADE)
    monto = models.DecimalField(max_digits=10, decimal_places=2)
    fecha_pago = models.DateTimeField(auto_now_add=True)
    proximo_vencimiento = models.DateField()
    metodo_pago = models.CharField(max_length=50)

class Asistencia(models.Model):
    alumno = models.ForeignKey(Alumno, on_delete=models.CASCADE)
    fecha_hora = models.DateTimeField(auto_now_add=True)
    estado_acceso = models.CharField(max_length=20, default='Permitido') # Permitido, Advertencia, Vencido

# --- MÓDULO TIENDA / POS ---
class Producto(models.Model):
    nombre = models.CharField(max_length=150)
    sku = models.CharField(max_length=50, unique=True)
    precio = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.IntegerField(default=0)
    categoria = models.CharField(max_length=100)

class Venta(models.Model):
    fecha = models.DateTimeField(auto_now_add=True)
    total = models.DecimalField(max_digits=10, decimal_places=2)
    metodo_pago = models.CharField(max_length=50)

class DetalleVenta(models.Model):
    venta = models.ForeignKey(Venta, related_name='detalles', on_delete=models.CASCADE)
    producto = models.ForeignKey(Producto, on_delete=models.PROTECT)
    cantidad = models.IntegerField()
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)

# --- MÓDULO COACH Y ADMIN ---
class ReporteEquipo(models.Model):
    equipo = models.CharField(max_length=100)
    estado_danio = models.CharField(max_length=50)
    descripcion = models.TextField()
    fecha_reporte = models.DateTimeField(auto_now_add=True)

class CierreCaja(models.Model):
    fecha_cierre = models.DateTimeField(auto_now_add=True)
    total_ingresos = models.DecimalField(max_digits=10, decimal_places=2)
    observaciones = models.TextField(blank=True, null=True)