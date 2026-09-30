from dataclasses import dataclass


@dataclass
class Producto:
    cod_producto: str
    tipo: str
    cantidad_almacenada: int = 0

    def tiene_stock(self) -> bool:
        return self.cantidad_almacenada > 0