from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.validators import RegexValidator
import uuid


class User(AbstractUser):
    USER_TYPE_CHOICES = [
        ('empresa', 'Empresa'),
        ('candidato', 'Candidato'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user_type = models.CharField(max_length=10, choices=USER_TYPE_CHOICES)
    foto_perfil = models.ImageField(upload_to='perfis/', null=True, blank=True)
    cpf = models.CharField(
        max_length=14,
        unique=True,
        null=True,
        blank=True,
        validators=[RegexValidator(regex=r'^\d{3}\.\d{3}\.\d{3}-\d{2}$', message='CPF deve estar no formato XXX.XXX.XXX-XX')]
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.username} ({self.user_type})"


class Empresa(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="empresa")
    nome = models.CharField(max_length=200)
    email = models.EmailField()
    cnpj = models.CharField(max_length=18, unique=True, null=True, blank=True)
    descricao = models.TextField(blank=True)
    website = models.URLField(blank=True)
    telefone = models.CharField(max_length=20, blank=True)
    endereco = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Empresa'
        verbose_name_plural = 'Empresas'

    def __str__(self):
        return self.nome


class AreaAtuacao(models.Model):
    nome = models.CharField(max_length=100, unique=True)
    descricao = models.TextField(blank=True)
    ativo = models.BooleanField(default=True)

    class Meta:
        verbose_name = 'Área de Atuação'
        verbose_name_plural = 'Áreas de Atuação'
        ordering = ['nome']

    def __str__(self):
        return self.nome


class Vaga(models.Model):
    STATUS_CHOICES = [
        ('aberta', 'Aberta'),
        ('fechada', 'Fechada'),
        ('pausada', 'Pausada'),
    ]

    MODALIDADE_CHOICES = [
        ('presencial', 'Presencial'),
        ('remoto', 'Remoto'),
        ('hibrido', 'Híbrido'),
    ]

    TIPO_CONTRATO_CHOICES = [
        ('clt', 'CLT'),
        ('pj', 'PJ'),
        ('estagio', 'Estágio'),
        ('temporario', 'Temporário'),
        ('freelancer', 'Freelancer'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    empresa = models.ForeignKey(Empresa, on_delete=models.CASCADE, related_name='vagas')
    area_atuacao = models.ForeignKey(AreaAtuacao, on_delete=models.SET_NULL, null=True)

    # Informações básicas
    titulo = models.CharField(max_length=200)
    descricao = models.TextField()
    requisitos = models.TextField()
    foto_vaga = models.ImageField(upload_to='vagas/', null=True, blank=True)

    # Detalhes da vaga
    modalidade = models.CharField(max_length=20, choices=MODALIDADE_CHOICES, default='presencial')
    tipo_contrato = models.CharField(max_length=20, choices=TIPO_CONTRATO_CHOICES, default='clt')
    localizacao = models.CharField(max_length=200, blank=True)

    # Salário
    salario_min = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    salario_max = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    salario_a_combinar = models.BooleanField(default=False)

    # Pergunta personalizada
    pergunta_personalizada = models.TextField(blank=True)

    # Status e datas
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='aberta')
    data_limite = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Vaga'
        verbose_name_plural = 'Vagas'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.titulo} - {self.empresa.nome}"

    @property
    def total_candidaturas(self):
        return self.candidaturas.count()

    @property
    def candidaturas_pendentes(self):
        return self.candidaturas.filter(status='aguardando').count()


class Candidato(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="candidato")
    nome_completo = models.CharField(max_length=200)
    email = models.EmailField()
    telefone = models.CharField(max_length=20, blank=True)
    data_nascimento = models.DateField(null=True, blank=True)
    endereco = models.TextField(blank=True)
    resumo_profissional = models.TextField(blank=True)
    curriculum = models.FileField(upload_to='curriculos/', null=True, blank=True)
    areas_interesse = models.ManyToManyField(AreaAtuacao, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Candidato'
        verbose_name_plural = 'Candidatos'

    def __str__(self):
        return self.nome_completo


class Candidatura(models.Model):
    STATUS_CHOICES = [
        ('aguardando', 'Aguardando'),
        ('em_analise', 'Em Análise'),
        ('selecionado', 'Selecionado'),
        ('rejeitado', 'Rejeitado'),
        ('contratado', 'Contratado'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    vaga = models.ForeignKey(Vaga, on_delete=models.CASCADE, related_name='candidaturas')
    candidato = models.ForeignKey(Candidato, on_delete=models.CASCADE, related_name='candidaturas')

    # Resposta à pergunta personalizada
    resposta_pergunta = models.TextField(blank=True)

    # Documentos específicos para esta candidatura
    curriculum_especifico = models.FileField(upload_to='candidaturas/curriculos/', null=True, blank=True)
    carta_apresentacao = models.FileField(upload_to='candidaturas/cartas/', null=True, blank=True)

    # Status e observações
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='aguardando')
    observacoes_empresa = models.TextField(blank=True)

    # Datas
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Candidatura'
        verbose_name_plural = 'Candidaturas'
        unique_together = ['vaga', 'candidato']
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.candidato.nome_completo} - {self.vaga.titulo}"
