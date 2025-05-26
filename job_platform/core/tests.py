from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status
from .models import Empresa, Candidato, Vaga, Candidatura, AreaAtuacao

User = get_user_model()

class UserModelTest(TestCase):
    def test_create_empresa_user(self):
        user = User.objects.create_user(
            username='empresa_test',
            email='empresa@test.com',
            password='testpass123',
            user_type='empresa'
        )
        self.assertEqual(user.user_type, 'empresa')
        self.assertTrue(hasattr(user, 'empresa'))

    def test_create_candidato_user(self):
        user = User.objects.create_user(
            username='candidato_test',
            email='candidato@test.com',
            password='testpass123',
            user_type='candidato',
            cpf='123.456.789-00'
        )
        self.assertEqual(user.user_type, 'candidato')
        self.assertEqual(user.cpf, '123.456.789-00')

class AuthAPITest(APITestCase):
    def test_register_empresa(self):
        data = {
            'username': 'empresa_test',
            'email': 'empresa@test.com',
            'password': 'testpass123',
            'user_type': 'empresa',
            'first_name': 'Empresa',
            'last_name': 'Teste'
        }
        response = self.client.post('/api/auth/register/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('access', response.data)
        self.assertIn('user', response.data)

    def test_login(self):
        # Criar usuário
        user = User.objects.create_user(
            username='test_user',
            password='testpass123',
            user_type='candidato'
        )
        
        # Fazer login
        data = {'username': 'test_user', 'password': 'testpass123'}
        response = self.client.post('/api/auth/login/', data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)

class VagaAPITest(APITestCase):
    def setUp(self):
        # Criar empresa
        self.empresa_user = User.objects.create_user(
            username='empresa',
            password='testpass123',
            user_type='empresa'
        )
        self.empresa = Empresa.objects.create(
            user=self.empresa_user,
            nome='Empresa Teste',
            email='empresa@test.com'
        )
        
        # Criar área de atuação
        self.area = AreaAtuacao.objects.create(nome='Tecnologia')

    def test_create_vaga_as_empresa(self):
        self.client.force_authenticate(user=self.empresa_user)
        
        data = {
            'titulo': 'Desenvolvedor Python',
            'descricao': 'Vaga para desenvolvedor Python',
            'requisitos': 'Python, Django, REST API',
            'area_atuacao': self.area.id,
            'salario_min': 5000.00,
            'salario_max': 8000.00
        }
        
        response = self.client.post('/api/vagas/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['titulo'], 'Desenvolvedor Python')

    def test_list_vagas_public(self):
        # Criar vaga
        vaga = Vaga.objects.create(
            empresa=self.empresa,
            titulo='Vaga Teste',
            descricao='Descrição da vaga',
            requisitos='Requisitos da vaga',
            area_atuacao=self.area
        )
        
        response = self.client.get('/api/vagas/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)

