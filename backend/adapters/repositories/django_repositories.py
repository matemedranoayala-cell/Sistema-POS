import uuid
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password
from django.db.models import Case, CharField, Func, IntegerField, Max, Q, Value, When
from django.db import transaction
from application.interfaces.repositories import IAlumnoRepository, IInscripcionRepository
from core.entities.alumno import Alumno as AlumnoEntidad
from infrastructure.django_apps.core_db.models import Usuario, Empleado, Bitacora
from infrastructure.django_apps.core_db.models import Alumno as AlumnoModelo
from infrastructure.django_apps.core_db.models import Asistencia, Pago, Venta


class DjangoUsuarioRepository:
    def rol_django(self, usuario):
        if usuario.is_superuser:
            return 'SUPERADMIN'
        if usuario.first_name:
            return self.normalizar_rol(usuario.first_name)
        if usuario.is_staff:
            return 'ADMIN'
        return 'COACH' if '@' in usuario.username else 'RECEPCION'

    def normalizar_rol(self, rol_bruto):
        rol_str = str(rol_bruto or 'RECEPCION').upper().strip()
        rol_compacto = rol_str.replace(' ', '').replace('_', '').replace('-', '')
        if 'SUPERADMIN' in rol_compacto:
            return 'SUPERADMIN'
        if 'ADMIN' in rol_compacto or 'ENCARGADOGENERAL' in rol_compacto:
            return 'ADMIN'
        if 'TIENDA' in rol_str or 'KIOSKO' in rol_str:
            return 'TIENDA'
        if 'COACH' in rol_str or 'ENTRENADOR' in rol_str or 'TATAMI' in rol_str:
            return 'COACH'
        return 'RECEPCION'

    def obtener_area(self, rol_limpio):
        if rol_limpio == 'SUPERADMIN':
            return 'Administración del sistema'
        if rol_limpio == 'ADMIN':
            return 'Administración'
        if rol_limpio == 'TIENDA':
            return 'Tienda'
        if rol_limpio == 'COACH':
            return 'Área de Tatami'
        return 'Recepción / Caja'

    def listar_todos(self):
        resultados = []
        vistos = set()

        try:
            usuarios_custom = Usuario.objects.all().order_by('id_usuario')
            for u in usuarios_custom:
                uname = str(u.username or '').strip()
                if not uname or uname.lower() in vistos:
                    continue
                vistos.add(uname.lower())
                rol_str = self.normalizar_rol(u.rol)
                resultados.append({
                    'id': u.id_usuario,
                    'username': uname,
                    'rol': rol_str,
                    'activo': bool(u.activo),
                    'area': self.obtener_area(rol_str)
                })
        except Exception:
            pass

        try:
            usuarios_django = User.objects.all().order_by('id')
            for u in usuarios_django:
                uname = str(u.username or '').strip()
                if not uname or uname.lower() in vistos:
                    continue
                vistos.add(uname.lower())
                rol_str = self.rol_django(u)
                resultados.append({
                    'id': u.id,
                    'username': uname,
                    'rol': rol_str,
                    'activo': bool(u.is_active),
                    'area': self.obtener_area(rol_str)
                })
        except Exception:
            pass

        return resultados

    def obtener_por_id(self, user_id):
        for u in self.listar_todos():
            if str(u['id']) == str(user_id):
                return u
        return None

    def crear_usuario(self, username, password, rol):
        uname = str(username or '').strip()
        pwd = str(password or 'kombat123').strip()
        rol_limpio = self.normalizar_rol(rol)
        creado_id = None

        if not uname:
            return {'success': False, 'error': 'El nombre de usuario es obligatorio'}

        for ex in self.listar_todos():
            if ex['username'].lower() == uname.lower():
                return {'success': False, 'error': 'El usuario ya existe'}

        try:
            nuevo_dj = User.objects.create_user(
                username=uname,
                email=uname if '@' in uname else f"{uname}@kombat.com",
                password=pwd,
                first_name=rol_limpio,
                is_staff=(rol_limpio == 'ADMIN'),
                is_active=True
            )
            creado_id = nuevo_dj.id
        except Exception:
            pass

        try:
            ci_gen = str(creado_id or uuid.uuid4().hex[:8])
            emp, _ = Empleado.objects.get_or_create(
                ci_empleado=ci_gen,
                defaults={'nombre': uname, 'apellido': rol_limpio}
            )
            nuevo_custom = Usuario.objects.create(
                ci_empleado=emp,
                username=uname,
                password_hash=make_password(pwd),
                rol=rol_limpio,
                activo=True
            )
            creado_id = nuevo_custom.id_usuario
        except Exception:
            pass

        if creado_id is not None:
            Bitacora.objects.create(
                usuario='admin',
                operacion='CREACION USUARIO (ADMIN)',
                modulo='Personal',
                detalle=f"Nuevo personal registrado: {uname} con rol {rol_limpio}",
                estado='Registrado',
                color='green'
            )
            return {
                'success': True,
                'id': creado_id,
                'username': uname,
                'rol': rol_limpio,
                'activo': True,
                'area': self.obtener_area(rol_limpio)
            }

        return {'success': False, 'error': 'Error al guardar en base de datos'}

    def actualizar_usuario(self, user_id, datos):
        actualizado = False
        uname_target = datos.get('username_original') or datos.get('username')
        nuevo_uname = datos.get('username')
        rol_limpio = self.normalizar_rol(datos['rol']) if 'rol' in datos else None

        try:
            u_custom = Usuario.objects.filter(id_usuario=user_id).first()
            if not u_custom and uname_target:
                u_custom = Usuario.objects.filter(username__iexact=uname_target).first()
            if u_custom:
                if nuevo_uname:
                    u_custom.username = nuevo_uname.strip()
                if rol_limpio:
                    u_custom.rol = rol_limpio
                if 'activo' in datos:
                    u_custom.activo = bool(datos['activo'])
                u_custom.save()
                actualizado = True
        except Exception:
            pass

        try:
            u_django = User.objects.filter(id=user_id).first()
            if not u_django and uname_target:
                u_django = User.objects.filter(username__iexact=uname_target).first()
            if u_django:
                if nuevo_uname:
                    u_django.username = nuevo_uname.strip()
                if rol_limpio:
                    u_django.first_name = rol_limpio
                if 'activo' in datos:
                    u_django.is_active = bool(datos['activo'])
                u_django.save()
                actualizado = True
        except Exception:
            pass

        if actualizado:
            Bitacora.objects.create(
                usuario='admin',
                operacion='ACTUALIZACION USUARIO (ADMIN)',
                modulo='Personal',
                detalle=f"Usuario ID {user_id} actualizado: {datos}",
                estado='Registrado',
                color='blue'
            )
            return {'success': True}

        return {'success': False, 'error': 'No se encontro el usuario'}

_CON_TILDE = "áéíóúü"
_SIN_TILDE = "aeiouu"


class _SinTildes(Func):
    """LOWER + quita tildes en PostgreSQL, para comparar 'López' con 'lopez'."""
    template = f"TRANSLATE(LOWER(COALESCE(%(expressions)s, '')), '{_CON_TILDE}', '{_SIN_TILDE}')"
    output_field = CharField()


def _quitar_tildes(texto: str) -> str:
    return texto.lower().translate(str.maketrans(_CON_TILDE, _SIN_TILDE))


class DjangoAlumnoRepository(IAlumnoRepository):
    def _base(self):
        return AlumnoModelo.objects.annotate(
            vencimiento=Max("pago__proximo_vencimiento")
        )

    def _a_entidad(self, a) -> AlumnoEntidad:
        return AlumnoEntidad(
            id=a.id,
            nombre=str(a.nombre or "").strip(),
            apellidos=str(a.apellidos or "").strip(),
            dni=str(a.dni or "").strip(),
            plan_id=a.plan_id,
            academia=a.academia_origen or "Kombat",
            estado=a.estado or "Activo",
            vencimiento_membresia=a.vencimiento,
        )

    def buscar_por_ci(self, ci, limite):
        qs = (
            self._base()
            .filter(dni__icontains=ci)
            .annotate(
                exacto=Case(
                    When(dni__iexact=ci, then=Value(0)),
                    default=Value(1),
                    output_field=IntegerField(),
                )
            )
            .order_by("exacto", "dni")[:limite]
        )
        return [self._a_entidad(a) for a in qs]

    def buscar_por_nombre(self, palabras, limite):
        filtro = Q()
        for palabra in palabras:
            limpia = _quitar_tildes(palabra)
            filtro &= Q(nombre_sin_tildes__contains=limpia) | Q(apellidos_sin_tildes__contains=limpia)
        qs = (
            self._base()
            .annotate(
                nombre_sin_tildes=_SinTildes("nombre"),
                apellidos_sin_tildes=_SinTildes("apellidos"),
            )
            .filter(filtro)
            .order_by("nombre", "apellidos")[:limite]
        )
        return [self._a_entidad(a) for a in qs]


class DjangoInscripcionRepository(IInscripcionRepository):
    def existe_alumno_con_ci(self, ci):
        return AlumnoModelo.objects.filter(dni__iexact=ci.strip()).exists()

    @transaction.atomic
    def inscribir_con_pago(self, datos_alumno, monto, metodo_pago, proximo_vencimiento, usuario):
        alumno = AlumnoModelo.objects.create(estado="Activo", **datos_alumno)
        pago = Pago.objects.create(
            alumno=alumno,
            monto=monto,
            metodo_pago=metodo_pago,
            proximo_vencimiento=proximo_vencimiento,
        )
        # Igual que en las renovaciones: el cobro aparece en Caja y Ventas.
        Venta.objects.create(total=monto, metodo_pago=metodo_pago)
        # La inscripción cuenta como primer ingreso del día (comportamiento previo).
        Asistencia.objects.create(alumno=alumno, estado_acceso="Permitido")

        nombre = f"{alumno.nombre} {alumno.apellidos or ''}".strip()
        Bitacora.objects.create(
            usuario=usuario,
            operacion="Pago de Inscripcion (RECEPCION)",
            modulo="Caja / Recepcion",
            detalle=(
                f"Inscripción de {nombre} (CI: {alumno.dni}) Bs {monto} - "
                f"{metodo_pago} - vence {proximo_vencimiento.isoformat()}"
            ),
            estado="Registrado",
            color="green",
        )
        return {
            "id": alumno.id,
            "nombre": nombre,
            "dni": alumno.dni,
            "plan_id": alumno.plan_id,
            "monto": float(monto),
            "metodo_pago": metodo_pago,
            "proximo_vencimiento": pago.proximo_vencimiento.isoformat(),
        }
