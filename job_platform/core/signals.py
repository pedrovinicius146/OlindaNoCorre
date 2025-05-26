from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from .models import Empresa, Candidato

User = get_user_model()

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    """Criar perfil automaticamente quando usuário é criado"""
    if created:
        if instance.user_type == 'empresa' and not hasattr(instance, 'empresa'):
            Empresa.objects.create(
                user=instance,
                nome=instance.get_full_name() or instance.username,
                email=instance.email
            )
        elif instance.user_type == 'candidato' and not hasattr(instance, 'candidato'):
            Candidato.objects.create(
                user=instance,
                nome_completo=instance.get_full_name() or instance.username,
                email=instance.email
            )

