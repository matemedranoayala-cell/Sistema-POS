import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core_db', '0003_venta_fecha_pago'),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            database_operations=[],
            state_operations=[
                migrations.CreateModel(
                    name='Alumno',
                    fields=[
                        ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                        ('nombre', models.CharField(max_length=100)),
                        ('apellidos', models.CharField(blank=True, max_length=150, null=True)),
                        ('dni', models.CharField(blank=True, max_length=20, null=True)),
                        ('telefono', models.CharField(blank=True, max_length=20, null=True)),
                        ('email', models.EmailField(blank=True, max_length=254, null=True)),
                        ('plan_id', models.IntegerField(blank=True, null=True)),
                        ('disciplina_id', models.CharField(blank=True, max_length=100, null=True)),
                        ('es_competidor', models.BooleanField(default=False)),
                        ('academia_origen', models.CharField(default='Kombat', max_length=150)),
                        ('asociacion', models.CharField(blank=True, max_length=150, null=True)),
                        ('fecha_inscripcion', models.DateTimeField(auto_now_add=True)),
                        ('estado', models.CharField(default='Activo', max_length=20)),
                    ],
                    options={'db_table': 'api_alumno'},
                ),
                migrations.CreateModel(
                    name='Bitacora',
                    fields=[
                        ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                        ('fecha_hora', models.DateTimeField(auto_now_add=True)),
                        ('usuario', models.CharField(max_length=150)),
                        ('operacion', models.CharField(max_length=150)),
                        ('modulo', models.CharField(max_length=100)),
                        ('detalle', models.TextField(blank=True, null=True)),
                        ('estado', models.CharField(default='Registrado', max_length=50)),
                        ('color', models.CharField(default='blue', max_length=20)),
                    ],
                    options={'db_table': 'api_bitacora'},
                ),
                migrations.CreateModel(
                    name='CierreCaja',
                    fields=[
                        ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                        ('fecha_cierre', models.DateTimeField(auto_now_add=True)),
                        ('total_ingresos', models.DecimalField(decimal_places=2, max_digits=10)),
                        ('observaciones', models.TextField(blank=True, null=True)),
                        ('estado', models.CharField(default='Auditoría Pendiente', max_length=50)),
                    ],
                    options={'db_table': 'api_cierrecaja'},
                ),
                migrations.CreateModel(
                    name='DetalleVenta',
                    fields=[
                        ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                        ('cantidad', models.IntegerField()),
                        ('subtotal', models.DecimalField(decimal_places=2, max_digits=10)),
                    ],
                    options={'db_table': 'api_detalleventa'},
                ),
                migrations.CreateModel(
                    name='Pago',
                    fields=[
                        ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                        ('monto', models.DecimalField(decimal_places=2, max_digits=10)),
                        ('fecha_pago', models.DateTimeField(auto_now_add=True)),
                        ('proximo_vencimiento', models.DateField()),
                        ('metodo_pago', models.CharField(max_length=50)),
                        ('alumno', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='core_db.alumno')),
                    ],
                    options={'db_table': 'api_pago'},
                ),
                migrations.CreateModel(
                    name='RegistroClase',
                    fields=[
                        ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                        ('coach', models.CharField(max_length=150)),
                        ('clase_impartida', models.CharField(max_length=150)),
                        ('total_asistentes', models.IntegerField()),
                        ('fecha_registro', models.DateTimeField(auto_now_add=True)),
                    ],
                    options={'db_table': 'api_registroclase'},
                ),
                migrations.CreateModel(
                    name='ReporteEquipo',
                    fields=[
                        ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                        ('equipo', models.CharField(max_length=100)),
                        ('estado_danio', models.CharField(max_length=50)),
                        ('descripcion', models.TextField()),
                        ('fecha_reporte', models.DateTimeField(auto_now_add=True)),
                    ],
                    options={'db_table': 'api_reporteequipo'},
                ),
            ],
        ),
        migrations.SeparateDatabaseAndState(
            database_operations=[],
            state_operations=[
                migrations.DeleteModel(name='Area'),
                migrations.RemoveField(model_name='ticket', name='reportado_por'),
                migrations.DeleteModel(name='Cliente'),
                migrations.DeleteModel(name='InventarioProductoAlmacenar'),
                migrations.DeleteModel(name='Membresia'),
                migrations.DeleteModel(name='PlanMembresia'),
                migrations.DeleteModel(name='Ticket'),
            ],
        ),
        migrations.SeparateDatabaseAndState(
            database_operations=[],
            state_operations=[
                migrations.AlterModelOptions(name='asistencia', options={}),
                migrations.AlterModelOptions(name='producto', options={}),
                migrations.AlterModelTable(name='asistencia', table='api_asistencia'),
                migrations.AlterModelTable(name='producto', table='api_producto'),
                migrations.RemoveField(model_name='asistencia', name='id_asistencia'),
                migrations.AddField(
                    model_name='asistencia',
                    name='id',
                    field=models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID'),
                ),
                migrations.AddField(
                    model_name='asistencia',
                    name='alumno',
                    field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='core_db.alumno'),
                ),
                migrations.AddField(
                    model_name='asistencia',
                    name='estado_acceso',
                    field=models.CharField(default='Permitido', max_length=20),
                ),
                migrations.AlterField(
                    model_name='asistencia',
                    name='fecha_hora',
                    field=models.DateTimeField(auto_now_add=True),
                ),
                migrations.RemoveField(model_name='producto', name='cod_producto'),
                migrations.RemoveField(model_name='producto', name='tipo'),
                migrations.AddField(
                    model_name='producto',
                    name='id',
                    field=models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID'),
                ),
                migrations.AddField(model_name='producto', name='nombre', field=models.CharField(max_length=150)),
                migrations.AddField(model_name='producto', name='sku', field=models.CharField(max_length=50, unique=True)),
                migrations.AddField(model_name='producto', name='precio', field=models.DecimalField(decimal_places=2, max_digits=10)),
                migrations.AddField(model_name='producto', name='stock', field=models.IntegerField(default=0)),
                migrations.AddField(model_name='producto', name='categoria', field=models.CharField(max_length=100)),
                migrations.AddField(
                    model_name='detalleventa',
                    name='producto',
                    field=models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='core_db.producto'),
                ),
                migrations.AddField(
                    model_name='detalleventa',
                    name='venta',
                    field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='detalles', to='core_db.venta'),
                ),
            ],
        ),
    ]
