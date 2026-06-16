from django.contrib import admin
from .models import Marca, Categoria, Producto, Pedido, DetallePedido, PerfilCliente


@admin.register(Marca)
class MarcaAdmin(admin.ModelAdmin):
    list_display = ['nombre', 'id']
    search_fields = ['nombre']


@admin.register(Categoria)
class CategoriaAdmin(admin.ModelAdmin):
    list_display = ['nombre', 'marca', 'id']
    list_filter = ['marca']
    search_fields = ['nombre', 'marca__nombre']


@admin.register(Producto)
class ProductoAdmin(admin.ModelAdmin):
    list_display = ['nombre', 'marca', 'categoria', 'precio', 'stock', 'activo', 'es_nuevo']
    list_filter = ['marca', 'categoria', 'activo', 'es_nuevo']
    search_fields = ['nombre', 'descripcion']


admin.site.register(Pedido)
admin.site.register(DetallePedido)
admin.site.register(PerfilCliente)
