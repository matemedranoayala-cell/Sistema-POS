from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core_db', '0001_initial'),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            database_operations=[
                migrations.RunSQL(
                    sql=[
                        "ALTER TABLE api_venta ADD COLUMN IF NOT EXISTS cliente_nombre varchar(150) NOT NULL DEFAULT '';",
                        "ALTER TABLE api_venta ADD COLUMN IF NOT EXISTS cliente_telefono varchar(30) NOT NULL DEFAULT '';",
                        "ALTER TABLE api_venta ADD COLUMN IF NOT EXISTS rol_cliente varchar(50) NOT NULL DEFAULT '';",
                        "ALTER TABLE api_venta ADD COLUMN IF NOT EXISTS vendedor varchar(150) NOT NULL DEFAULT '';",
                        "ALTER TABLE api_venta ADD COLUMN IF NOT EXISTS estado_pago varchar(20) NOT NULL DEFAULT 'PAGADO';",
                    ],
                    reverse_sql=[
                        "ALTER TABLE api_venta DROP COLUMN IF EXISTS estado_pago;",
                        "ALTER TABLE api_venta DROP COLUMN IF EXISTS vendedor;",
                        "ALTER TABLE api_venta DROP COLUMN IF EXISTS rol_cliente;",
                        "ALTER TABLE api_venta DROP COLUMN IF EXISTS cliente_telefono;",
                        "ALTER TABLE api_venta DROP COLUMN IF EXISTS cliente_nombre;",
                    ],
                ),
            ],
            state_operations=[
                migrations.CreateModel(
                    name='Venta',
                    fields=[
                        ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                        ('fecha', models.DateTimeField(auto_now_add=True)),
                        ('total', models.DecimalField(decimal_places=2, max_digits=10)),
                        ('metodo_pago', models.CharField(max_length=50)),
                        ('cliente_nombre', models.CharField(blank=True, default='', max_length=150)),
                        ('cliente_telefono', models.CharField(blank=True, default='', max_length=30)),
                        ('rol_cliente', models.CharField(blank=True, default='', max_length=50)),
                        ('vendedor', models.CharField(blank=True, default='', max_length=150)),
                        ('estado_pago', models.CharField(default='PAGADO', max_length=20)),
                    ],
                    options={
                        'db_table': 'api_venta',
                    },
                ),
            ],
        ),
    ]
