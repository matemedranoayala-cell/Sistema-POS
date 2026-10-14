from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from adapters.repositories.django_repositories import DjangoUsuarioRepository
from application.use_cases.gestion_personal import (
    ListarPersonalUseCase,
    CrearPersonalUseCase,
    ActualizarPersonalUseCase,
)


class PersonalController(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request, pk=None):
        repo = DjangoUsuarioRepository()
        caso = ListarPersonalUseCase(repo)
        return Response(caso.ejecutar(), status=status.HTTP_200_OK)

    def post(self, request):
        username = (
                request.data.get('username')
                or request.data.get('email')
                or request.data.get('usuario')
                or request.data.get('nombre')
                or ''
        )
        password = (
                request.data.get('password')
                or request.data.get('clave')
                or 'kombat123'
        )
        rol = request.data.get('rol', 'COACH')

        repo = DjangoUsuarioRepository()
        caso = CrearPersonalUseCase(repo)
        res = caso.ejecutar(username, password, rol)

        if res.get('success'):
            return Response(res, status=status.HTTP_201_CREATED)
        return Response(res, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, pk=None):
        uid = pk or request.data.get('id')
        repo = DjangoUsuarioRepository()
        caso = ActualizarPersonalUseCase(repo)
        res = caso.ejecutar(uid, request.data)

        if res.get('success'):
            return Response(res, status=status.HTTP_200_OK)
        return Response(res, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, pk=None):
        return self.patch(request, pk)