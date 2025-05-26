from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Empresa, Candidato, Vaga, Candidatura, AreaAtuacao

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('username', 'email', 'user_type', 'is_active', 'date_joined')
    list_filter = ('user_type', 'is_active', 'is_staff')
    search_fields = ('username', 'email', 'cpf')
    
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Informações Adicionais', {
            'fields': ('user_type', 'foto_perfil', 'cpf')
        }),
    )

@admin.register(AreaAtuacao)
class AreaAtuacaoAdmin(admin.ModelAdmin):
    list_display = ('nome', 'ativo')
    list_filter = ('ativo',)
    search_fields = ('nome',)

@admin.register(Empresa)
class EmpresaAdmin(admin.ModelAdmin):
    list_display = ('nome', 'email', 'cnpj', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('nome', 'email', 'cnpj')
    readonly_fields = ('created_at', 'updated_at')

@admin.register(Candidato)
class CandidatoAdmin(admin.ModelAdmin):
    list_display = ('nome_completo', 'email', 'telefone', 'created_at')
    list_filter = ('created_at', 'areas_interesse')
    search_fields = ('nome_completo', 'email', 'user__cpf')
    readonly_fields = ('created_at', 'updated_at')

@admin.register(Vaga)
class VagaAdmin(admin.ModelAdmin):
    list_display = ('titulo', 'empresa', 'area_atuacao', 'status', 'total_candidaturas', 'created_at')
    list_filter = ('status', 'modalidade', 'tipo_contrato', 'area_atuacao', 'created_at')
    search_fields = ('titulo', 'empresa__nome', 'descricao')
    readonly_fields = ('created_at', 'updated_at', 'total_candidaturas')
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('empresa', 'area_atuacao')

@admin.register(Candidatura)
class CandidaturaAdmin(admin.ModelAdmin):
    list_display = ('candidato', 'vaga', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('candidato__nome_completo', 'vaga__titulo', 'vaga__empresa__nome')
    readonly_fields = ('created_at', 'updated_at')
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('candidato', 'vaga', 'vaga__empresa')

