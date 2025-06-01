# core/serializers.py

from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User, Empresa, Candidato, Vaga, Candidatura, AreaAtuacao


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'user_type', 'foto_perfil', 'cpf', 'first_name', 'last_name']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class EmpresaSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    total_vagas = serializers.SerializerMethodField()
    
    class Meta:
        model = Empresa
        fields = '__all__'

    def get_total_vagas(self, obj):
        return obj.vagas.count()


class CandidatoSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    areas_interesse = serializers.StringRelatedField(many=True, read_only=True)
    areas_interesse_ids = serializers.PrimaryKeyRelatedField(
        many=True,
        write_only=True,
        queryset=AreaAtuacao.objects.all(),
        source='areas_interesse'
    )
    total_candidaturas = serializers.SerializerMethodField()
    
    class Meta:
        model = Candidato
        fields = '__all__'

    def get_total_candidaturas(self, obj):
        return obj.candidaturas.count()


class AreaAtuacaoSerializer(serializers.ModelSerializer):
    total_vagas = serializers.SerializerMethodField()
    
    class Meta:
        model = AreaAtuacao
        fields = '__all__'

    def get_total_vagas(self, obj):
        # Conta apenas vagas abertas nessa área
        return obj.vaga_set.filter(status='aberta').count()


class VagaSerializer(serializers.ModelSerializer):
    empresa_nome = serializers.CharField(source='empresa.nome', read_only=True)
    area_atuacao_nome = serializers.CharField(source='area_atuacao.nome', read_only=True)
    total_candidaturas = serializers.ReadOnlyField()
    candidaturas_pendentes = serializers.ReadOnlyField()
    ja_candidatou = serializers.SerializerMethodField()
    
    class Meta:
        model = Vaga
        fields = '__all__'

    def get_ja_candidatou(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated and request.user.user_type == 'candidato':
            try:
                candidato = request.user.candidato
                return obj.candidaturas.filter(candidato=candidato).exists()
            except:
                pass
        return False


class VagaCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vaga
        fields = [
            'titulo',
            'descricao',
            'requisitos',
            'foto_vaga',
            'area_atuacao',
            'modalidade',
            'tipo_contrato',
            'localizacao',
            'salario_min',
            'salario_max',
            'salario_a_combinar',
            'pergunta_personalizada',
            'data_limite'
        ]

    def create(self, validated_data):
        user = self.context['request'].user
        try:
            empresa = user.empresa
        except:
            raise serializers.ValidationError("Usuário não possui perfil de empresa")
        
        validated_data['empresa'] = empresa
        return super().create(validated_data)


class CandidaturaSerializer(serializers.ModelSerializer):
    vaga_titulo = serializers.CharField(source='vaga.titulo', read_only=True)
    vaga_empresa = serializers.CharField(source='vaga.empresa.nome', read_only=True)
    candidato_nome = serializers.CharField(source='candidato.nome_completo', read_only=True)
    candidato_email = serializers.CharField(source='candidato.email', read_only=True)
    
    class Meta:
        model = Candidatura
        fields = '__all__'


class CandidaturaCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Candidatura
        fields = ['vaga', 'resposta_pergunta', 'curriculum_especifico', 'carta_apresentacao']

    def create(self, validated_data):
        user = self.context['request'].user
        try:
            candidato = user.candidato
        except:
            raise serializers.ValidationError("Usuário não possui perfil de candidato")
        
        # Verifica se já se candidatou
        vaga = validated_data['vaga']
        if Candidatura.objects.filter(vaga=vaga, candidato=candidato).exists():
            raise serializers.ValidationError("Você já se candidatou a esta vaga")
        
        validated_data['candidato'] = candidato
        return super().create(validated_data)


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()

    def validate(self, data):
        username = data.get('username')
        password = data.get('password')

        if username and password:
            user = authenticate(username=username, password=password)
            if user:
                if user.is_active:
                    data['user'] = user
                else:
                    raise serializers.ValidationError("Conta desativada")
            else:
                raise serializers.ValidationError("Credenciais inválidas")
        else:
            raise serializers.ValidationError("Username e password são obrigatórios")
        
        return data
