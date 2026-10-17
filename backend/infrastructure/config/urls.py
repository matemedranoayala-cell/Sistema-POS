from django.urls import path
from adapters.controllers.api_controllers import LoginController, LogoutController
from adapters.controllers.personal_controllers import PersonalController
from adapters.controllers.caja_controllers import (
    ProductosBajoStockController,
    VenderProductoController,
)
from adapters.controllers.operaciones_controllers import (
    AlumnoController, PagoController, AsistenciaController, ProductoController,
    VentaController, DetalleVentaController, ReporteEquipoController,
    CierreCajaController, RegistroClaseController, BitacoraController
)

urlpatterns = [
    path('api/login/', LoginController.as_view(), name='login'),
    path(
        "api/productos/stock-bajo/",
        ProductosBajoStockController.as_view(),
        name="productos-bajo-stock",
    ),
    path('api/logout/', LogoutController.as_view(), name='logout'),
    path('api/personal/', PersonalController.as_view(), name='gestion_personal'),
    path('api/personal/<int:pk>/', PersonalController.as_view(), name='detalle_personal'),
    path('api/alumnos/', AlumnoController.as_view(), name='alumnos'),
    path('api/pagos/', PagoController.as_view(), name='pagos'),
    path('api/asistencias/', AsistenciaController.as_view(), name='asistencias'),
    path('api/productos/', ProductoController.as_view(), name='productos'),
    path('api/ventas/', VentaController.as_view(), name='ventas'),
    path('api/detalle-ventas/', DetalleVentaController.as_view(), name='detalle_ventas'),
    path('api/reportes-equipo/', ReporteEquipoController.as_view(), name='reportes_equipo'),
    path('api/cierre-caja/', CierreCajaController.as_view(), name='cierre_caja'),
    path('api/registro-clases/', RegistroClaseController.as_view(), name='registro_clases'),
    path('api/bitacora/', BitacoraController.as_view(), name='bitacora'),
    path('api/ventas/producto/', VenderProductoController.as_view(), name='vender_producto'),
]