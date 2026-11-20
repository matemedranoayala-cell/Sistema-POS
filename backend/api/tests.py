from types import SimpleNamespace

from django.test import SimpleTestCase

from adapters.repositories.django_repositories import DjangoUsuarioRepository


class NormalizarRolPersonalTests(SimpleTestCase):
    def setUp(self):
        self.repositorio = DjangoUsuarioRepository()

    def test_superadmin_se_mantiene_distinto_de_admin(self):
        self.assertEqual(self.repositorio.normalizar_rol("SUPERADMIN"), "SUPERADMIN")
        self.assertEqual(self.repositorio.normalizar_rol("SUPER_ADMIN"), "SUPERADMIN")
        self.assertEqual(self.repositorio.normalizar_rol("ADMIN"), "ADMIN")

    def test_area_superadmin_es_distinta(self):
        self.assertEqual(
            self.repositorio.obtener_area("SUPERADMIN"),
            "Administración del sistema",
        )

    def test_usuario_django_superusuario_se_distingue_de_staff(self):
        superadmin = SimpleNamespace(
            username="root", is_superuser=True, is_staff=True, first_name=""
        )
        admin = SimpleNamespace(
            username="manager", is_superuser=False, is_staff=True, first_name=""
        )
        self.assertEqual(self.repositorio.rol_django(superadmin), "SUPERADMIN")
        self.assertEqual(self.repositorio.rol_django(admin), "ADMIN")
