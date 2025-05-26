from django.core.management.base import BaseCommand
from core.models import AreaAtuacao

class Command(BaseCommand):
    help = 'Criar dados iniciais da plataforma'

    def handle(self, *args, **options):
        # Criar áreas de atuação padrão
        areas = [
            'Tecnologia',
            'Administração',
            'Saúde',
            'Educação',
            'Marketing',
            'Vendas',
            'Engenharia',
            'Design',
            'Recursos Humanos',
            'Finanças',
            'Jurídico',
            'Logística',
            'Atendimento ao Cliente',
            'Produção',
            'Qualidade',
        ]
        
        for area_nome in areas:
            area, created = AreaAtuacao.objects.get_or_create(
                nome=area_nome,
                defaults={'descricao': f'Área de {area_nome}'}
            )
            if created:
                self.stdout.write(
                    self.style.SUCCESS(f'Área "{area_nome}" criada com sucesso')
                )
            else:
                self.stdout.write(f'Área "{area_nome}" já existe')
        
        self.stdout.write(
            self.style.SUCCESS('Dados iniciais configurados com sucesso!')
        )
