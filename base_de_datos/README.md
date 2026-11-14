# Respaldo de prueba

`backup_2026_10_30.dump` es un respaldo PostgreSQL en formato custom. Incluye
el esquema y los datos de prueba, pero omite los registros de usuarios,
permisos de usuario, sesiones y auditoría del admin para no distribuir hashes
de contraseñas ni sesiones.

Para restaurarlo en una base local vacía:

```bash
createdb -U postgres kombat_manager_web
pg_restore --no-owner --no-acl \
  --dbname=kombat_manager_web \
  base_de_datos/backup_2026_10_30.dump
```

Configura las variables `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`,
`POSTGRES_HOST` y `POSTGRES_PORT` en el `.env` local. El `.env` no se incluye
en Git. Después, crea una cuenta superusuario local para poder iniciar sesión:

```bash
cd backend
python manage.py createsuperuser
```
