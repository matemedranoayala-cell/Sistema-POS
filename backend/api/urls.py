from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    AlumnoViewSet, PagoViewSet, AsistenciaViewSet, ProductoViewSet,
    VentaViewSet, DetalleVentaViewSet, ReporteEquipoViewSet, CierreCajaViewSet,
    RegistroClaseViewSet, BitacoraViewSet,
    LoginView, crear_coach
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
router.register(r'registro-clases', RegistroClaseViewSet)
router.register(r'bitacora', BitacoraViewSet)

urlpatterns = [
    path('login/', LoginView.as_view(), name='login'),
    path('crear-coach/', crear_coach, name='crear_coach'),
    path('', include(router.urls)),
]