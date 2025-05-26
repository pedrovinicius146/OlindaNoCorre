# core/views.py

# ==============================================================================
# IMPORTAÇÕES GERAIS
# ==============================================================================

from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django_filters.rest_framework import DjangoFilterBackend
from django.contrib.auth import authenticate
from django.db.models import Q, Count
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string

from .models import User, Empresa, Candidato, Vaga, Candidatura, AreaAtuacao
from .serializers import *
from django.db import IntegrityError, transaction
from django.contrib.auth.hashers import make_password
import logging

# ==============================================================================
# PERMISSÕES CUSTOMIZADAS
# ==============================================================================

class IsEmpresa(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.user_type == 'empresa'


class IsCandidato(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.user_type == 'candidato'


# ==============================================================================
# AUTENTICAÇÃO
# ==============================================================================

from django.db import IntegrityError, transaction

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    import logging
    logger = logging.getLogger(__name__)
    
    # Registrar os dados recebidos para debug
    logger.info(f"Tentativa de registro com dados: {request.data}")
    
    # Primeiro, verificar se o usuário já existe antes de tentar criar
    email = request.data.get('email')
    username = request.data.get('username')
    
    # Verificar email existente
    if email and User.objects.filter(email=email).exists():
        return Response({
            'detail': 'Um usuário com este email já está registrado.',
            'field_errors': {'email': ['Este email já está em uso.']}
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Verificar username existente
    if username and User.objects.filter(username=username).exists():
        return Response({
            'detail': 'Um usuário com este nome de usuário já está registrado.',
            'field_errors': {'username': ['Este nome de usuário já está em uso.']}
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Trabalhar diretamente com request.data em vez de fazer cópia
    # (evita problemas com arquivos que não podem ser copiados)
    registration_data = request.data
    
    # Garantir que campos obrigatórios estejam presentes
    user_type = registration_data.get('user_type')
    if not user_type:
        return Response({
            'detail': 'Tipo de usuário é obrigatório.',
            'field_errors': {'user_type': ['Este campo é obrigatório.']}
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Validar campos obrigatórios básicos
    required_fields = ['email', 'username', 'password']
    missing_fields = []
    for field in required_fields:
        if not registration_data.get(field):
            missing_fields.append(field)
    
    if missing_fields:
        field_errors = {field: ['Este campo é obrigatório.'] for field in missing_fields}
        return Response({
            'detail': 'Campos obrigatórios não preenchidos.',
            'field_errors': field_errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Preparar dados para o serializer (sem modificar o request.data original)
    user_data = {
        'username': registration_data.get('username'),
        'email': registration_data.get('email'),
        'password': registration_data.get('password'),
        'user_type': registration_data.get('user_type'),
    }
    
    # Adicionar outros campos se fornecidos
    if registration_data.get('first_name'):
        user_data['first_name'] = registration_data.get('first_name')
    if registration_data.get('last_name'):
        user_data['last_name'] = registration_data.get('last_name')
    
    serializer = UserSerializer(data=user_data)
    if serializer.is_valid():
        try:
            with transaction.atomic():
                user = serializer.save()
                logger.info(f"Usuário criado com sucesso: {user.id}")
                
                # Criar perfil baseado no tipo de usuário
                if user.user_type == 'empresa':
                    # Usar 'nome' se 'nome_empresa' não for fornecido
                    nome_empresa = (request.data.get('nome_empresa') or 
                                  request.data.get('nome') or 
                                  request.data.get('nomeCompleto') or '')
                    
                    if not nome_empresa:
                        raise ValueError("Nome da empresa é obrigatório")
                    
                    empresa = Empresa.objects.create(
                        user=user,
                        nome=nome_empresa,
                        email=user.email
                    )
                    logger.info(f"Perfil de empresa criado: {empresa.id}")
                    
                elif user.user_type == 'candidato':
                    # Usar diferentes variações do nome que podem vir do frontend
                    nome_completo = (request.data.get('nome_completo') or 
                                   request.data.get('nomeCompleto') or
                                   request.data.get('nome') or '')
                    
                    if not nome_completo:
                        raise ValueError("Nome completo é obrigatório")
                    
                    # Criar candidato sem CPF por enquanto (verificar se o modelo aceita)
                    candidato_data = {
                        'user': user,
                        'nome_completo': nome_completo,
                        'email': user.email,
                    }
                    
                    # Só adicionar CPF se o modelo tiver esse campo
                    cpf = request.data.get('cpf', '')
                    if cpf:
                        candidato_data['cpf'] = cpf
                    
                    try:
                        candidato = Candidato.objects.create(**candidato_data)
                        logger.info(f"Perfil de candidato criado: {candidato.id}")
                    except TypeError as e:
                        # Se der erro de campo não esperado, criar sem CPF
                        logger.warning(f"Erro ao criar candidato com CPF: {e}")
                        candidato = Candidato.objects.create(
                            user=user,
                            nome_completo=nome_completo,
                            email=user.email
                        )
                        logger.info(f"Perfil de candidato criado sem CPF: {candidato.id}")
                
                # Gerar tokens
                refresh = RefreshToken.for_user(user)
                return Response({
                    'user': UserSerializer(user).data,
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                    'message': 'Usuário criado com sucesso!'
                }, status=status.HTTP_201_CREATED)

        except ValueError as e:
            logger.error(f"Erro de validação durante registro: {str(e)}")
            return Response({
                'detail': f'Erro de validação: {str(e)}',
            }, status=status.HTTP_400_BAD_REQUEST)
            
        except IntegrityError as e:
            logger.error(f"Erro de integridade durante registro: {str(e)}")
            # Tratar erros de integridade restantes
            error_message = str(e).lower()
            if 'email' in error_message:
                return Response({
                    'detail': 'Este email já está registrado no sistema.',
                    'field_errors': {'email': ['Este email já está em uso.']}
                }, status=status.HTTP_400_BAD_REQUEST)
            elif 'username' in error_message:
                return Response({
                    'detail': 'Este nome de usuário já está registrado no sistema.',
                    'field_errors': {'username': ['Este nome de usuário já está em uso.']}
                }, status=status.HTTP_400_BAD_REQUEST)
            elif 'cpf' in error_message:
                return Response({
                    'detail': 'Este CPF já está registrado no sistema.',
                    'field_errors': {'cpf': ['Este CPF já está em uso.']}
                }, status=status.HTTP_400_BAD_REQUEST)
            else:
                return Response({
                    'detail': f'Erro de banco de dados: {str(e)}',
                }, status=status.HTTP_400_BAD_REQUEST)
        
        except Exception as e:
            logger.error(f"Erro inesperado durante registro: {str(e)}")
            # Tratar qualquer outro erro inesperado
            return Response({
                'detail': f'Erro interno do servidor: {str(e)}',
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # Registrar erros de validação para debug
    logger.error(f"Erros de validação: {serializer.errors}")
    
    # Retornar erros de validação do serializer
    return Response({
        'detail': 'Dados inválidos fornecidos.',
        'field_errors': serializer.errors,
        'debug_info': f'Dados recebidos: {list(request.data.keys())}'
    }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        })
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile(request):
    user = request.user
    if user.user_type == 'empresa':
        try:
            return Response(EmpresaSerializer(user.empresa).data)
        except Empresa.DoesNotExist:
            return Response({'error': 'Perfil de empresa não encontrado'}, status=404)
    elif user.user_type == 'candidato':
        try:
            return Response(CandidatoSerializer(user.candidato).data)
        except Candidato.DoesNotExist:
            return Response({'error': 'Perfil de candidato não encontrado'}, status=404)
    return Response(UserSerializer(user).data)


# ==============================================================================
# VIEWSETS PRINCIPAIS
# ==============================================================================

class AreaAtuacaoViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AreaAtuacao.objects.filter(ativo=True)
    serializer_class = AreaAtuacaoSerializer
    permission_classes = [AllowAny]


class VagaViewSet(viewsets.ModelViewSet):
    queryset = Vaga.objects.filter(status='aberta')
    serializer_class = VagaSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['area_atuacao', 'modalidade', 'tipo_contrato', 'empresa']
    search_fields = ['titulo', 'descricao', 'requisitos', 'empresa__nome']
    ordering_fields = ['created_at', 'titulo', 'salario_min']
    ordering = ['-created_at']

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsEmpresa()]
        return [AllowAny()]

    def get_serializer_class(self):
        if self.action == 'create':
            return VagaCreateSerializer
        return VagaSerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated and user.user_type == 'empresa' and self.action == 'minhas_vagas':
            return Vaga.objects.filter(empresa=user.empresa)
        return Vaga.objects.filter(status='aberta')

    @action(detail=False, methods=['get'], permission_classes=[IsEmpresa])
    def minhas_vagas(self, request):
        empresa = request.user.empresa
        vagas = Vaga.objects.filter(empresa=empresa)
        page = self.paginate_queryset(vagas)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        return Response(self.get_serializer(vagas, many=True).data)

    @action(detail=True, methods=['get'])
    def candidaturas(self, request, pk=None):
        vaga = self.get_object()
        if request.user.user_type != 'empresa' or vaga.empresa != request.user.empresa:
            return Response({'error': 'Sem permissão'}, status=403)
        return Response(CandidaturaSerializer(vaga.candidaturas.all(), many=True).data)


class CandidaturaViewSet(viewsets.ModelViewSet):
    serializer_class = CandidaturaSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [IsCandidato()]
        return [IsAuthenticated()]

    def get_serializer_class(self):
        if self.action == 'create':
            return CandidaturaCreateSerializer
        return CandidaturaSerializer

    def get_queryset(self):
        user = self.request.user
        if user.user_type == 'candidato':
            return Candidatura.objects.filter(candidato=user.candidato)
        elif user.user_type == 'empresa':
            return Candidatura.objects.filter(vaga__empresa=user.empresa)
        return Candidatura.objects.none()

    @action(detail=False, methods=['get'], permission_classes=[IsCandidato])
    def minhas_candidaturas(self, request):
        candidaturas = Candidatura.objects.filter(candidato=request.user.candidato)
        page = self.paginate_queryset(candidaturas)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        return Response(self.get_serializer(candidaturas, many=True).data)

    @action(detail=True, methods=['patch'], permission_classes=[IsEmpresa])
    def atualizar_status(self, request, pk=None):
        candidatura = self.get_object()
        if candidatura.vaga.empresa != request.user.empresa:
            return Response({'error': 'Sem permissão'}, status=403)
        novo_status = request.data.get('status')
        observacoes = request.data.get('observacoes_empresa', '')
        if novo_status not in dict(Candidatura.STATUS_CHOICES):
            return Response({'error': 'Status inválido'}, status=400)
        candidatura.status = novo_status
        candidatura.observacoes_empresa = observacoes
        candidatura.save()
        return Response(self.get_serializer(candidatura).data)


class EmpresaViewSet(viewsets.ModelViewSet):
    queryset = Empresa.objects.all()
    serializer_class = EmpresaSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.user_type == 'empresa':
            return Empresa.objects.filter(user=user)
        return Empresa.objects.all()


class CandidatoViewSet(viewsets.ModelViewSet):
    queryset = Candidato.objects.all()
    serializer_class = CandidatoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.user_type == 'candidato':
            return Candidato.objects.filter(user=user)
        elif user.user_type == 'empresa':
            return Candidato.objects.filter(candidaturas__vaga__empresa=user.empresa).distinct()
        return Candidato.objects.none()


# ==============================================================================
# VIEWS ADICIONAIS (Reset de senha e estatísticas)
# ==============================================================================

@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset_request(request):
    email = request.data.get('email')
    if not email:
        return Response({'error': 'Email é obrigatório'}, status=400)
    try:
        user = User.objects.get(email=email)
        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        reset_url = f"http://localhost:4200/reset-password/{uid}/{token}/"
        print(f"Reset URL para {email}: {reset_url}")
        return Response({'message': 'Email de recuperação enviado', 'reset_url': reset_url})
    except User.DoesNotExist:
        return Response({'message': 'Se o email existir, você receberá instruções de recuperação'})


@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset_confirm(request):
    uid = request.data.get('uid')
    token = request.data.get('token')
    new_password = request.data.get('new_password')
    if not all([uid, token, new_password]):
        return Response({'error': 'Todos os campos são obrigatórios'}, status=400)
    try:
        user_id = force_str(urlsafe_base64_decode(uid))
        user = User.objects.get(pk=user_id)
        if default_token_generator.check_token(user, token):
            user.set_password(new_password)
            user.save()
            return Response({'message': 'Senha alterada com sucesso'})
        return Response({'error': 'Token inválido ou expirado'}, status=400)
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        return Response({'error': 'Link inválido'}, status=400)


@api_view(['GET'])
@permission_classes([AllowAny])
def dashboard_stats(request):
    stats = {
        'total_vagas': Vaga.objects.filter(status='aberta').count(),
        'total_empresas': Empresa.objects.count(),
        'total_candidatos': Candidato.objects.count(),
        'total_candidaturas': Candidatura.objects.count(),
        'vagas_por_area': list(
            AreaAtuacao.objects.annotate(
                total=Count('vaga', filter=Q(vaga__status='aberta'))
            ).values('nome', 'total').order_by('-total')[:5]
        )
    }
    return Response(stats)
