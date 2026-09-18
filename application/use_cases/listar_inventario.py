from application.interfaces.repositories import IProductoRepository


class ListarInventarioUseCase:
    def __init__(self, producto_repo: IProductoRepository):
        self.producto_repo = producto_repo

    def ejecutar(self) -> list[dict]:
        productos = self.producto_repo.obtener_catalogo_disponible()
        return [
            {
                "cod_producto": p.cod_producto,
                "tipo": p.tipo,
                "cantidad_almacenada": p.cantidad_almacenada,
            }
            for p in productos
        ]