from application.interfaces.repositories import IUsuarioRepository
from core.entities.usuario import Usuario as EntidadUsuario, RolUsuario
from infrastructure.django_apps.core_db.models import Usuario as ModeloUsuario

class UsuarioRepositoryDjango(IUsuarioRepository):
    def obtener_por_credenciales(self, username: str, password_plana: str) -> EntidadUsuario | None:
        try:
            usuario_db = ModeloUsuario.objects.select_related('ci_empleado').get(
                username=username,
                password_hash=password_plana
            )

            return EntidadUsuario(
                id=usuario_db.id_usuario,
                nombre_completo=f"{usuario_db.ci_empleado.nombre} {usuario_db.ci_empleado.apellido}",
                correo="correo_no_mapeado@ejemplo.com",
                password_hash=usuario_db.password_hash,
                rol=RolUsuario(usuario_db.rol),
                activo=usuario_db.activo
            )
        except ModeloUsuario.DoesNotExist:
            return None