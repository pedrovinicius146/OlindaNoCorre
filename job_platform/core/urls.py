from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

router = DefaultRouter()
router.register(r'vagas', views.VagaViewSet)
router.register(r'candidaturas', views.CandidaturaViewSet, basename='candidatura')
router.register(r'empresas', views.EmpresaViewSet)
router.register(r'candidatos', views.CandidatoViewSet)
router.register(r'areas-atuacao', views.AreaAtuacaoViewSet)

urlpatterns = [
    # Autenticação
    path('auth/register/', views.register, name='register'),
    path('auth/login/', views.login, name='login'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/profile/', views.profile_update, name='profile'),
    path('auth/password-reset/', views.password_reset_request, name='password_reset'),
    path('auth/password-reset-confirm/', views.password_reset_confirm, name='password_reset_confirm'),
    path('auth/user/', views.get_authenticated_user, name='get_authenticated_user'),
   
    # APIs do router
    path('', include(router.urls)),
    path('api', include(router.urls)),
]
