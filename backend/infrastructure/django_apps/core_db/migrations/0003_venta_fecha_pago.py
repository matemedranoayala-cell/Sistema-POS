from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core_db', '0002_venta_tienda_metadata'),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            database_operations=[
                migrations.RunSQL(
                    sql=[
                        "ALTER TABLE api_venta ADD COLUMN IF NOT EXISTS fecha_pago timestamp with time zone NULL;",
                        # Las ventas ya pagadas se consideran cobradas en su fecha de venta.
                        "UPDATE api_venta SET fecha_pago = fecha WHERE fecha_pago IS NULL AND estado_pago = 'PAGADO';",
                    ],
                    reverse_sql=[
                        "ALTER TABLE api_venta DROP COLUMN IF EXISTS fecha_pago;",
                    ],
                ),
            ],
            state_operations=[
                migrations.AddField(
                    model_name='venta',
                    name='fecha_pago',
                    field=models.DateTimeField(blank=True, null=True),
                ),
            ],
        ),
    ]
