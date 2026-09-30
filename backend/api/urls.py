from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    AlumnoViewSet, PagoViewSet, AsistenciaViewSet, ProductoViewSet,
    VentaViewSet, DetalleVentaViewSet, ReporteEquipoViewSet, CierreCajaViewSet,
    LoginView
)

router = DefaultRouter()
router.register(r'alumnos', AlumnoViewSet)
router.register(r'pagos', PagoViewSet)
router.register(r'asistencias', AsistenciaViewSet)
router.register(r'productos', ProductoViewSet)
router.register(r'ventas', VentaViewSet)
router.register(r'detalle-ventas', DetalleVentaViewSet)
router.register(r'reportes-equipo', ReporteEquipoViewSet)
router.register(r'cierre-caja', CierreCajaViewSet)

urlpatterns = [
    path('login/', LoginView.as_view(), name='login'),
    path('', include(router.urls)),
]