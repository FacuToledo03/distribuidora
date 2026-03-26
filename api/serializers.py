from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Categoria, Producto, Pedido, DetallePedido, PerfilCliente


class PerfilClienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = PerfilCliente
        fields = ['telefono', 'direccion']


class UserSerializer(serializers.ModelSerializer):
    perfil = PerfilClienteSerializer(required=False)
    es_admin = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email', 'is_staff', 'es_admin', 'perfil']

    def get_es_admin(self, obj):
        return obj.is_staff or obj.is_superuser


class CrearUsuarioSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=4)
    telefono = serializers.CharField(required=False, allow_blank=True)
    direccion = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ['username', 'password', 'first_name', 'last_name', 'email', 'telefono', 'direccion']

    def create(self, validated_data):
        telefono = validated_data.pop('telefono', '')
        direccion = validated_data.pop('direccion', '')
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        PerfilCliente.objects.create(usuario=user, telefono=telefono, direccion=direccion)
        return user


class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = ['id', 'nombre']


class ProductoSerializer(serializers.ModelSerializer):
    categoria_nombre = serializers.CharField(source='categoria.nombre', read_only=True)
    imagen_url = serializers.SerializerMethodField()

    class Meta:
        model = Producto
        fields = ['id', 'nombre', 'descripcion', 'precio', 'stock', 'categoria', 'categoria_nombre', 'imagen', 'imagen_url', 'activo', 'creado_en']

    def get_imagen_url(self, obj):
        request = self.context.get('request')
        if obj.imagen and request:
            url = request.build_absolute_uri(obj.imagen.url)
            return url.replace('http://', 'https://')
        return None


class DetallePedidoSerializer(serializers.ModelSerializer):
    producto_nombre = serializers.CharField(source='producto.nombre', read_only=True)
    subtotal = serializers.SerializerMethodField()

    class Meta:
        model = DetallePedido
        fields = ['id', 'producto', 'producto_nombre', 'cantidad', 'precio_unitario', 'subtotal']

    def get_subtotal(self, obj):
        return obj.subtotal()


class PedidoSerializer(serializers.ModelSerializer):
    detalles = DetallePedidoSerializer(many=True, read_only=True)
    cliente_nombre = serializers.CharField(source='cliente.username', read_only=True)

    class Meta:
        model = Pedido
        fields = ['id', 'cliente', 'cliente_nombre', 'estado', 'creado_en', 'actualizado_en', 'notas', 'total', 'detalles']
        read_only_fields = ['cliente', 'total', 'creado_en', 'actualizado_en']


class CrearPedidoSerializer(serializers.Serializer):
    items = serializers.ListField(
        child=serializers.DictField()
    )
    notas = serializers.CharField(required=False, allow_blank=True)

    def validate_items(self, items):
        if not items:
            raise serializers.ValidationError("El pedido debe tener al menos un producto.")
        for item in items:
            if 'producto_id' not in item or 'cantidad' not in item:
                raise serializers.ValidationError("Cada item debe tener producto_id y cantidad.")
            try:
                producto = Producto.objects.get(id=item['producto_id'], activo=True)
                cantidad = int(item['cantidad'])
                if cantidad <= 0:
                    raise serializers.ValidationError(f"La cantidad debe ser mayor a 0.")
                if producto.stock < cantidad:
                    raise serializers.ValidationError(f"Stock insuficiente para '{producto.nombre}'. Stock disponible: {producto.stock}.")
            except Producto.DoesNotExist:
                raise serializers.ValidationError(f"Producto con id {item['producto_id']} no existe o no está activo.")
        return items
