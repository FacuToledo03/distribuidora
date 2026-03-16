from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'categorias', views.CategoriaViewSet, basename='categoria')
router.register(r'productos', views.ProductoViewSet, basename='producto')

urlpatterns = [
    # Auth
    path('auth/login/', views.login_view, name='login'),
    path('auth/logout/', views.logout_view, name='logout'),
    path('auth/perfil/', views.perfil_view, name='perfil'),

    # Usuarios (admin)
    path('usuarios/', views.usuarios_list, name='usuarios-list'),
    path('usuarios/<int:pk>/', views.usuario_detail, name='usuario-detail'),

    # Pedidos
    path('pedidos/', views.pedidos_list, name='pedidos-list'),
    path('pedidos/<int:pk>/', views.pedido_detail, name='pedido-detail'),

    # Dashboard
    path('dashboard/', views.dashboard_stats, name='dashboard'),

    # Router (productos, categorías)
    path('', include(router.urls)),
]
