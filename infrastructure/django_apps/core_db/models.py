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