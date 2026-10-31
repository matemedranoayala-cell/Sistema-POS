from django.db import models

class Empleado(models.Model):
    ci_empleado = models.CharField(primary_key=True, max_length=20)
    nombre = models.CharField(max_length=100)
    apellido = models.CharField(max_length=100)

    class Meta:
        managed = False
        db_table = 'empleado'
        app_label = 'core_db'

class Usuario(models.Model):
    id_usuario = models.AutoField(primary_key=True)
    ci_empleado = models.ForeignKey(Empleado, models.DO_NOTHING, db_column='ci_empleado', blank=True, null=True)
    username = models.CharField(max_length=50, unique=True)
    password_hash = models.CharField(max_length=255)
    rol = models.CharField(max_length=50)
    activo = models.BooleanField(default=True)

    class Meta:
        managed = False
        db_table = 'usuario'
        app_label = 'core_db'

class Alumno(models.Model):
    nombre = models.CharField(max_length=100)
    apellidos = models.CharField(max_length=150, blank=True, null=True)
    dni = models.CharField(max_length=20, blank=True, null=True)
    telefono = models.CharField(max_length=20, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    plan_id = models.IntegerField(blank=True, null=True)
    disciplina_id = models.CharField(max_length=100, blank=True, null=True)
    es_competidor = models.BooleanField(default=False)
    academia_origen = models.CharField(max_length=150, default='Kombat')
    asociacion = models.CharField(max_length=150, blank=True, null=True)
    fecha_inscripcion = models.DateTimeField(auto_now_add=True)
    estado = models.CharField(max_length=20, default='Activo')

    class Meta:
        db_table = 'api_alumno'
        app_label = 'core_db'

class Pago(models.Model):
    alumno = models.ForeignKey(Alumno, on_delete=models.CASCADE)
    monto = models.DecimalField(max_digits=10, decimal_places=2)
    fecha_pago = models.DateTimeField(auto_now_add=True)
    proximo_vencimiento = models.DateField()
    metodo_pago = models.CharField(max_length=50)

    class Meta:
        db_table = 'api_pago'
        app_label = 'core_db'

class Asistencia(models.Model):
    alumno = models.ForeignKey(Alumno, on_delete=models.CASCADE)
    fecha_hora = models.DateTimeField(auto_now_add=True)
    estado_acceso = models.CharField(max_length=20, default='Permitido')

    class Meta:
        db_table = 'api_asistencia'
        app_label = 'core_db'

class Producto(models.Model):
    nombre = models.CharField(max_length=150)
    sku = models.CharField(max_length=50, unique=True)
    precio = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.IntegerField(default=0)
    categoria = models.CharField(max_length=100)

    class Meta:
        db_table = 'api_producto'
        app_label = 'core_db'

class Venta(models.Model):
    fecha = models.DateTimeField(auto_now_add=True)
    total = models.DecimalField(max_digits=10, decimal_places=2)
    metodo_pago = models.CharField(max_length=50)
    cliente_nombre = models.CharField(max_length=150, blank=True, default='')
    cliente_telefono = models.CharField(max_length=30, blank=True, default='')
    rol_cliente = models.CharField(max_length=50, blank=True, default='')
    vendedor = models.CharField(max_length=150, blank=True, default='')
    estado_pago = models.CharField(max_length=20, default='PAGADO')

    class Meta:
        db_table = 'api_venta'
        app_label = 'core_db'

class DetalleVenta(models.Model):
    venta = models.ForeignKey(Venta, related_name='detalles', on_delete=models.CASCADE)
    producto = models.ForeignKey(Producto, on_delete=models.PROTECT)
    cantidad = models.IntegerField()
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        db_table = 'api_detalleventa'
        app_label = 'core_db'

class ReporteEquipo(models.Model):
    equipo = models.CharField(max_length=100)
    estado_danio = models.CharField(max_length=50)
    descripcion = models.TextField()
    fecha_reporte = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'api_reporteequipo'
        app_label = 'core_db'

class CierreCaja(models.Model):
    fecha_cierre = models.DateTimeField(auto_now_add=True)
    total_ingresos = models.DecimalField(max_digits=10, decimal_places=2)
    observaciones = models.TextField(blank=True, null=True)
    estado = models.CharField(max_length=50, default='Auditoría Pendiente')

    class Meta:
        db_table = 'api_cierrecaja'
        app_label = 'core_db'

class RegistroClase(models.Model):
    coach = models.CharField(max_length=150)
    clase_impartida = models.CharField(max_length=150)
    total_asistentes = models.IntegerField()
    fecha_registro = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'api_registroclase'
        app_label = 'core_db'

class Bitacora(models.Model):
    fecha_hora = models.DateTimeField(auto_now_add=True)
    usuario = models.CharField(max_length=150)
    operacion = models.CharField(max_length=150)
    modulo = models.CharField(max_length=100)
    detalle = models.TextField(blank=True, null=True)
    estado = models.CharField(max_length=50, default='Registrado')
    color = models.CharField(max_length=20, default='blue')

    class Meta:
        db_table = 'api_bitacora'
        app_label = 'core_db'