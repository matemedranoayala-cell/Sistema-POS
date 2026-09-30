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
    ci_empleado = models.ForeignKey(Empleado, models.DO_NOTHING, db_column='ci_empleado')
    username = models.CharField(max_length=50, unique=True)
    password_hash = models.CharField(max_length=255)
    rol = models.CharField(max_length=50)
    activo = models.BooleanField(default=True)

    class Meta:
        managed = False
        db_table = 'usuario'
        app_label = 'core_db'

class Producto(models.Model):
    cod_producto = models.CharField(primary_key=True, max_length=50)
    tipo = models.CharField(max_length=50)

    class Meta:
        managed = False
        db_table = 'producto'
        app_label = 'core_db'

class InventarioProductoAlmacenar(models.Model):
    num_suplementos = models.IntegerField(primary_key=True)
    cod_producto = models.CharField(max_length=50)
    cantidad_almacenada = models.IntegerField(null=True, blank=True)

    class Meta:
        managed = False
        db_table = 'inventario_producto_almacenar'
        app_label = 'core_db'

class Cliente(models.Model):
    ci_cliente = models.CharField(primary_key=True, max_length=20)
    id_cliente = models.IntegerField(unique=True, blank=True, null=True)
    nombres = models.CharField(max_length=100)
    apellido_paterno = models.CharField(max_length=50, blank=True, null=True)
    apellido_materno = models.CharField(max_length=50, blank=True, null=True)
    fecha_nacimiento = models.DateField(blank=True, null=True)
    direccion_zona = models.CharField(max_length=100, blank=True, null=True)
    direccion_calle = models.CharField(max_length=100, blank=True, null=True)
    direccion_numero = models.CharField(max_length=20, blank=True, null=True)
    ci_distribuidor = models.CharField(max_length=20, db_column='ci_distribuidor', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'cliente'
        app_label = 'core_db'

class PlanMembresia(models.Model):
    id_plan = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=100)
    precio = models.DecimalField(max_digits=10, decimal_places=2)
    limite_clases_semana = models.IntegerField()

    class Meta:
        managed = False
        db_table = 'plan_membresia'
        app_label = 'core_db'

class Membresia(models.Model):
    id_membresia = models.AutoField(primary_key=True)
    ci_cliente = models.ForeignKey(Cliente, models.DO_NOTHING, db_column='ci_cliente')
    id_plan = models.ForeignKey(PlanMembresia, models.DO_NOTHING, db_column='id_plan')
    fecha_inicio = models.DateField()
    fecha_vencimiento = models.DateField()
    estado = models.TextField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'membresia'
        app_label = 'core_db'

class Asistencia(models.Model):
    id_asistencia = models.AutoField(primary_key=True)
    ci_cliente = models.ForeignKey(Cliente, models.DO_NOTHING, db_column='ci_cliente')
    fecha_hora = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'asistencia'
        app_label = 'core_db'

class Area(models.Model):
    id_area = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=100)
    capacidad_maxima = models.IntegerField()

    class Meta:
        db_table = 'area'
        app_label = 'core_db'

class Ticket(models.Model):
    id_ticket = models.AutoField(primary_key=True)
    reportado_por = models.ForeignKey(Empleado, on_delete=models.CASCADE, db_column='ci_empleado')
    titulo = models.CharField(max_length=150)
    descripcion = models.TextField()
    estado = models.CharField(max_length=50, default='PENDIENTE')
    fecha_hora = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'ticket'
        app_label = 'core_db'