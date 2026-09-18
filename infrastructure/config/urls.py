from django.contrib import admin
from django.urls import path
from django.views.decorators.csrf import csrf_exempt
from adapters.controllers.api_controllers import KombatManagerControllers
from adapters.repositories.django_repositories import (
    UsuarioRepositoryDjango,
    ProductoRepositoryDjango,
)
from application.use_cases.autenticar_usuario import AutenticarUsuarioUseCase
from application.use_cases.listar_inventario import ListarInventarioUseCase

usuario_repo = UsuarioRepositoryDjango()
login_use_case = AutenticarUsuarioUseCase(usuario_repo)
producto_repo = ProductoRepositoryDjango()
inventario_use_case = ListarInventarioUseCase(producto_repo)
api = KombatManagerControllers()

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/login/', csrf_exempt(lambda request: api.login(request, auth_use_case=login_use_case))),
    path('api/dashboard/', api.dashboard),
    path('api/asistencia/', csrf_exempt(lambda request: api.registrar_asistencia(request, asistencia_use_case=None))),
    path('api/alumnos/', api.listar_alumnos),
    path('api/inventario/', lambda request: api.listar_inventario(request, inventario_use_case=inventario_use_case)),
]