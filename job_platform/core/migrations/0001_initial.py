# Generated by Django 5.2.1 on 2025-05-26 13:17

import django.contrib.auth.models
import django.contrib.auth.validators
import django.core.validators
import django.db.models.deletion
import django.utils.timezone
import uuid
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('auth', '0012_alter_user_first_name_max_length'),
    ]

    operations = [
        migrations.CreateModel(
            name='AreaAtuacao',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nome', models.CharField(max_length=100, unique=True)),
                ('descricao', models.TextField(blank=True)),
                ('ativo', models.BooleanField(default=True)),
            ],
            options={
                'verbose_name': 'Área de Atuação',
                'verbose_name_plural': 'Áreas de Atuação',
                'ordering': ['nome'],
            },
        ),
        migrations.CreateModel(
            name='User',
            fields=[
                ('password', models.CharField(max_length=128, verbose_name='password')),
                ('last_login', models.DateTimeField(blank=True, null=True, verbose_name='last login')),
                ('is_superuser', models.BooleanField(default=False, help_text='Designates that this user has all permissions without explicitly assigning them.', verbose_name='superuser status')),
                ('username', models.CharField(error_messages={'unique': 'A user with that username already exists.'}, help_text='Required. 150 characters or fewer. Letters, digits and @/./+/-/_ only.', max_length=150, unique=True, validators=[django.contrib.auth.validators.UnicodeUsernameValidator()], verbose_name='username')),
                ('first_name', models.CharField(blank=True, max_length=150, verbose_name='first name')),
                ('last_name', models.CharField(blank=True, max_length=150, verbose_name='last name')),
                ('email', models.EmailField(blank=True, max_length=254, verbose_name='email address')),
                ('is_staff', models.BooleanField(default=False, help_text='Designates whether the user can log into this admin site.', verbose_name='staff status')),
                ('is_active', models.BooleanField(default=True, help_text='Designates whether this user should be treated as active. Unselect this instead of deleting accounts.', verbose_name='active')),
                ('date_joined', models.DateTimeField(default=django.utils.timezone.now, verbose_name='date joined')),
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('user_type', models.CharField(choices=[('empresa', 'Empresa'), ('candidato', 'Candidato')], max_length=10)),
                ('foto_perfil', models.ImageField(blank=True, null=True, upload_to='perfis/')),
                ('cpf', models.CharField(blank=True, max_length=14, null=True, unique=True, validators=[django.core.validators.RegexValidator(message='CPF deve estar no formato XXX.XXX.XXX-XX', regex='^\\d{3}\\.\\d{3}\\.\\d{3}-\\d{2}$')])),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('groups', models.ManyToManyField(blank=True, help_text='The groups this user belongs to. A user will get all permissions granted to each of their groups.', related_name='user_set', related_query_name='user', to='auth.group', verbose_name='groups')),
                ('user_permissions', models.ManyToManyField(blank=True, help_text='Specific permissions for this user.', related_name='user_set', related_query_name='user', to='auth.permission', verbose_name='user permissions')),
            ],
            options={
                'verbose_name': 'user',
                'verbose_name_plural': 'users',
                'abstract': False,
            },
            managers=[
                ('objects', django.contrib.auth.models.UserManager()),
            ],
        ),
        migrations.CreateModel(
            name='Candidato',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nome_completo', models.CharField(max_length=200)),
                ('email', models.EmailField(max_length=254)),
                ('telefone', models.CharField(blank=True, max_length=20)),
                ('data_nascimento', models.DateField(blank=True, null=True)),
                ('endereco', models.TextField(blank=True)),
                ('resumo_profissional', models.TextField(blank=True)),
                ('curriculum', models.FileField(blank=True, null=True, upload_to='curriculos/')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('areas_interesse', models.ManyToManyField(blank=True, to='core.areaatuacao')),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='candidato', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'Candidato',
                'verbose_name_plural': 'Candidatos',
            },
        ),
        migrations.CreateModel(
            name='Empresa',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nome', models.CharField(max_length=200)),
                ('email', models.EmailField(max_length=254)),
                ('cnpj', models.CharField(blank=True, max_length=18, null=True, unique=True)),
                ('descricao', models.TextField(blank=True)),
                ('website', models.URLField(blank=True)),
                ('telefone', models.CharField(blank=True, max_length=20)),
                ('endereco', models.TextField(blank=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='empresa', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'Empresa',
                'verbose_name_plural': 'Empresas',
            },
        ),
        migrations.CreateModel(
            name='Vaga',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('titulo', models.CharField(max_length=200)),
                ('descricao', models.TextField()),
                ('requisitos', models.TextField()),
                ('foto_vaga', models.ImageField(blank=True, null=True, upload_to='vagas/')),
                ('modalidade', models.CharField(choices=[('presencial', 'Presencial'), ('remoto', 'Remoto'), ('hibrido', 'Híbrido')], default='presencial', max_length=20)),
                ('tipo_contrato', models.CharField(choices=[('clt', 'CLT'), ('pj', 'PJ'), ('estagio', 'Estágio'), ('temporario', 'Temporário'), ('freelancer', 'Freelancer')], default='clt', max_length=20)),
                ('localizacao', models.CharField(blank=True, max_length=200)),
                ('salario_min', models.DecimalField(blank=True, decimal_places=2, max_digits=10, null=True)),
                ('salario_max', models.DecimalField(blank=True, decimal_places=2, max_digits=10, null=True)),
                ('salario_a_combinar', models.BooleanField(default=False)),
                ('pergunta_personalizada', models.TextField(blank=True)),
                ('status', models.CharField(choices=[('aberta', 'Aberta'), ('fechada', 'Fechada'), ('pausada', 'Pausada')], default='aberta', max_length=10)),
                ('data_limite', models.DateTimeField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('area_atuacao', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='core.areaatuacao')),
                ('empresa', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='vagas', to='core.empresa')),
            ],
            options={
                'verbose_name': 'Vaga',
                'verbose_name_plural': 'Vagas',
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='Candidatura',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('resposta_pergunta', models.TextField(blank=True)),
                ('curriculum_especifico', models.FileField(blank=True, null=True, upload_to='candidaturas/curriculos/')),
                ('carta_apresentacao', models.FileField(blank=True, null=True, upload_to='candidaturas/cartas/')),
                ('status', models.CharField(choices=[('aguardando', 'Aguardando'), ('em_analise', 'Em Análise'), ('selecionado', 'Selecionado'), ('rejeitado', 'Rejeitado'), ('contratado', 'Contratado')], default='aguardando', max_length=20)),
                ('observacoes_empresa', models.TextField(blank=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('candidato', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='candidaturas', to='core.candidato')),
                ('vaga', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='candidaturas', to='core.vaga')),
            ],
            options={
                'verbose_name': 'Candidatura',
                'verbose_name_plural': 'Candidaturas',
                'ordering': ['-created_at'],
                'unique_together': {('vaga', 'candidato')},
            },
        ),
    ]
