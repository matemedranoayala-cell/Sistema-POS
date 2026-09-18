from application.interfaces.repositories import IUsuarioRepository, IProductoRepository
from core.entities.usuario import Usuario as EntidadUsuario, RolUsuario
from core.entities.producto import Producto as EntidadProducto
from infrastructure.django_apps.core_db.models import (
    Usuario as ModeloUsuario,
    Producto as ModeloProducto,
    InventarioProductoAlmacenar as ModeloInventarioProducto,
)

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



class ProductoRepositoryDjango(IProductoRepository):
    def obtener_catalogo_disponible(self) -> list[EntidadProducto]:
        filas = ModeloInventarioProducto.objects.filter(
            cantidad_almacenada__gt=0
        ).values('cod_producto', 'cantidad_almacenada')

        resultado = []
        for fila in filas:
            try:
                prod = ModeloProducto.objects.get(cod_producto=fila['cod_producto'])
                resultado.append(
                    EntidadProducto(
                        cod_producto=prod.cod_producto,
                        tipo=prod.tipo,
                        cantidad_almacenada=fila['cantidad_almacenada'] or 0,
                    )
                )
            except ModeloProducto.DoesNotExist:
                continue

        return resultado