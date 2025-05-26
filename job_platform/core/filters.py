import django_filters
from .models import Vaga, Candidatura

class VagaFilter(django_filters.FilterSet):
    titulo = django_filters.CharFilter(lookup_expr='icontains')
    salario_min = django_filters.NumberFilter(field_name='salario_min', lookup_expr='gte')
    salario_max = django_filters.NumberFilter(field_name='salario_max', lookup_expr='lte')
    created_after = django_filters.DateTimeFilter(field_name='created_at', lookup_expr='gte')
    created_before = django_filters.DateTimeFilter(field_name='created_at', lookup_expr='lte')
    
    class Meta:
        model = Vaga
        fields = ['area_atuacao', 'modalidade', 'tipo_contrato', 'status']

class CandidaturaFilter(django_filters.FilterSet):
    created_after = django_filters.DateTimeFilter(field_name='created_at', lookup_expr='gte')
    created_before = django_filters.DateTimeFilter(field_name='created_at', lookup_expr='lte')
    
    class Meta:
        model = Candidatura
        fields = ['status', 'vaga', 'candidato']

