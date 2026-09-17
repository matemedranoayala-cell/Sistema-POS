from django.contrib import admin
from django.urls import path
from django.views.decorators.csrf import csrf_exempt
from adapters.controllers.api_controllers import KombatManagerControllers
from adapters.repositories.django_repositories import UsuarioRepositoryDjango
from application.use_cases.autenticar_usuario import AutenticarUsuarioUseCase

usuario_repo = UsuarioRepositoryDjango()
login_use_case = AutenticarUsuarioUseCase(usuario_repo)
api = KombatManagerControllers()

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/login/', csrf_exempt(lambda request: api.login(request, auth_use_case=login_use_case))),
    path('api/dashboard/', api.dashboard),
    path('api/asistencia/', csrf_exempt(lambda request: api.registrar_asistencia(request, asistencia_use_case=None))),
    path('api/alumnos/', api.listar_alumnos),
    path('api/inventario/', api.listar_inventario),
]