from rest_framework import permissions

class IsOwnerOrReadOnly(permissions.BasePermission):
    """Permissão customizada para permitir apenas ao proprietário editar"""
    
    def has_object_permission(self, request, view, obj):
        # Permissões de leitura para qualquer request
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Permissões de escrita apenas para o proprietário
        if hasattr(obj, 'user'):
            return obj.user == request.user
        elif hasattr(obj, 'empresa'):
            return hasattr(request.user, 'empresa') and obj.empresa == request.user.empresa
        elif hasattr(obj, 'candidato'):
            return hasattr(request.user, 'candidato') and obj.candidato == request.user.candidato
        
        return False

class IsEmpresaOwner(permissions.BasePermission):
    """Permissão para empresa proprietária"""
    
    def has_object_permission(self, request, view, obj):
        if not request.user.is_authenticated or request.user.user_type != 'empresa':
            return False
        
        try:
            empresa = request.user.empresa
            if hasattr(obj, 'empresa'):
                return obj.empresa == empresa
            elif hasattr(obj, 'vaga'):
                return obj.vaga.empresa == empresa
        except:
            pass
        
        return False
