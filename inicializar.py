#!/usr/bin/env python
"""
Script de inicialización: crea el superusuario admin y datos de ejemplo.
Ejecutar: python inicializar.py
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth.models import User
from api.models import Categoria, Producto, PerfilCliente

# ─── Superusuario admin ───────────────────────────────────────────────────────
if not User.objects.filter(username='admin').exists():
    admin = User.objects.create_superuser(
        username='admin',
        password='admin123',
        email='admin@distribuidora.com',
        first_name='Administrador'
    )
    print("✅ Usuario admin creado — usuario: admin / contraseña: admin123")
else:
    print("ℹ️  El usuario admin ya existe.")

# ─── Categorías de ejemplo ────────────────────────────────────────────────────
categorias_data = ['Bebidas', 'Lácteos', 'Almacén', 'Limpieza', 'Snacks']
categorias = {}
for nombre in categorias_data:
    cat, created = Categoria.objects.get_or_create(nombre=nombre)
    categorias[nombre] = cat
    if created:
        print(f"✅ Categoría creada: {nombre}")

# ─── Productos de ejemplo ─────────────────────────────────────────────────────
productos_data = [
    {'nombre': 'Coca Cola 2.25L', 'precio': 1850, 'stock': 50, 'categoria': 'Bebidas', 'descripcion': 'Gaseosa Coca Cola botella 2.25 litros'},
    {'nombre': 'Sprite 1.5L', 'precio': 1200, 'stock': 40, 'categoria': 'Bebidas', 'descripcion': 'Gaseosa Sprite limón botella 1.5 litros'},
    {'nombre': 'Agua Villavicencio 500ml', 'precio': 650, 'stock': 100, 'categoria': 'Bebidas', 'descripcion': 'Agua mineral sin gas'},
    {'nombre': 'Leche La Serenísima 1L', 'precio': 980, 'stock': 60, 'categoria': 'Lácteos', 'descripcion': 'Leche entera larga vida 1 litro'},
    {'nombre': 'Yogur Danone 190g', 'precio': 750, 'stock': 30, 'categoria': 'Lácteos', 'descripcion': 'Yogur natural sin azúcar'},
    {'nombre': 'Arroz Gallo Oro 1kg', 'precio': 1100, 'stock': 80, 'categoria': 'Almacén', 'descripcion': 'Arroz largo fino 1 kilo'},
    {'nombre': 'Fideos Lucchetti 500g', 'precio': 890, 'stock': 70, 'categoria': 'Almacén', 'descripcion': 'Fideos spaghetti 500 gramos'},
    {'nombre': 'Aceite Natura 1.5L', 'precio': 2300, 'stock': 45, 'categoria': 'Almacén', 'descripcion': 'Aceite de girasol 1.5 litros'},
    {'nombre': 'Detergente Magistral 500ml', 'precio': 870, 'stock': 35, 'categoria': 'Limpieza', 'descripcion': 'Lavavajillas líquido'},
    {'nombre': 'Lavandina Ayudín 1L', 'precio': 620, 'stock': 55, 'categoria': 'Limpieza', 'descripcion': 'Lavandina concentrada 1 litro'},
    {'nombre': 'Papas Fritas Lays 150g', 'precio': 1450, 'stock': 25, 'categoria': 'Snacks', 'descripcion': 'Papas fritas clásicas'},
    {'nombre': 'Galletitas Oreo 117g', 'precio': 980, 'stock': 40, 'categoria': 'Snacks', 'descripcion': 'Galletitas chocolate y crema'},
]

for p in productos_data:
    if not Producto.objects.filter(nombre=p['nombre']).exists():
        Producto.objects.create(
            nombre=p['nombre'],
            precio=p['precio'],
            stock=p['stock'],
            categoria=categorias[p['categoria']],
            descripcion=p['descripcion']
        )
        print(f"✅ Producto creado: {p['nombre']}")

print("\n🎉 Inicialización completa!")
print("📌 Accedé al panel admin Django en: http://localhost:8000/admin/")
print("📌 La API corre en: http://localhost:8000/api/")
print("📌 Login admin → usuario: admin | contraseña: admin123")
