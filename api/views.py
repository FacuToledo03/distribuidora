from rest_framework import viewsets, status, permissions
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.db import transaction
from django.conf import settings
import urllib.request
import urllib.parse
import threading
from .models import Categoria, Producto, Pedido, DetallePedido, PerfilCliente
from .serializers import (
    UserSerializer, CrearUsuarioSerializer, CategoriaSerializer,
    ProductoSerializer, PedidoSerializer, CrearPedidoSerializer
)


def notificar_whatsapp(pedido_id):
    try:
        pedido = Pedido.objects.prefetch_related('detalles__producto').select_related('cliente').get(id=pedido_id)
        numero = getattr(settings, 'WHATSAPP_ADMIN_NUMERO', '')
        api_key = getattr(settings, 'WHATSAPP_CALLMEBOT_KEY', '')
        if not numero or not api_key:
            return
        items_texto = ', '.join([
            f"{d.cantidad}x {d.producto.nombre}"
            for d in pedido.detalles.all()
        ])
        mensaje = (
            f"Nuevo pedido #{pedido.id} - "
            f"Cliente: {pedido.cliente.username} - "
            f"Productos: {items_texto} - "
            f"Total: ${pedido.total:,.0f}"
        )
        url = f"https://api.callmebot.com/whatsapp.php?phone={numero}&text={urllib.parse.quote(mensaje)}&apikey={api_key}"
        urllib.request.urlopen(url, timeout=8)
    except Exception:
        pass


class EsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and (request.user.is_staff or request.user.is_superuser)


# ─── AUTH ────────────────────────────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login_view(request):
    username = request.data.get('username')
    password = request.data.get('password')
    user = authenticate(username=username, password=password)
    if user:
        token, _ = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user': UserSerializer(user).data
        })
    return Response({'error': 'Usuario o contraseña incorrectos.'}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def logout_view(request):
    request.user.auth_token.delete()
    return Response({'mensaje': 'Sesión cerrada.'})


@api_view(['GET'])
def perfil_view(request):
    return Response(UserSerializer(request.user).data)


# ─── USUARIOS (solo admin) ───────────────────────────────────────────────────

@api_view(['GET', 'POST'])
@permission_classes([EsAdmin])
def usuarios_list(request):
    if request.method == 'GET':
        usuarios = User.objects.filter(is_superuser=False).order_by('-date_joined')
        return Response(UserSerializer(usuarios, many=True).data)

    serializer = CrearUsuarioSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([EsAdmin])
def usuario_detail(request, pk):
    try:
        user = User.objects.get(pk=pk, is_superuser=False)
    except User.DoesNotExist:
        return Response({'error': 'Usuario no encontrado.'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        return Response(UserSerializer(user).data)

    if request.method == 'PUT':
        data = request.data
        user.first_name = data.get('first_name', user.first_name)
        user.last_name = data.get('last_name', user.last_name)
        user.email = data.get('email', user.email)
        user.is_staff = data.get('es_admin', user.is_staff)
        if data.get('password'):
            user.set_password(data['password'])
        user.save()
        perfil, _ = PerfilCliente.objects.get_or_create(usuario=user)
        perfil.telefono = data.get('telefono', perfil.telefono)
        perfil.direccion = data.get('direccion', perfil.direccion)
        perfil.save()
        return Response(UserSerializer(user).data)

    if request.method == 'DELETE':
        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# ─── CATEGORÍAS ──────────────────────────────────────────────────────────────

class CategoriaViewSet(viewsets.ModelViewSet):
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.IsAuthenticated()]
        return [EsAdmin()]


# ─── PRODUCTOS ───────────────────────────────────────────────────────────────

class ProductoViewSet(viewsets.ModelViewSet):
    serializer_class = ProductoSerializer

    def get_queryset(self):
        qs = Producto.objects.all()
        if not (self.request.user.is_staff or self.request.user.is_superuser):
            qs = qs.filter(activo=True)
        categoria = self.request.query_params.get('categoria')
        busqueda = self.request.query_params.get('busqueda')
        if categoria:
            qs = qs.filter(categoria_id=categoria)
        if busqueda:
            qs = qs.filter(nombre__icontains=busqueda)
        return qs.order_by('nombre')

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.IsAuthenticated()]
        return [EsAdmin()]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context


# ─── PEDIDOS ─────────────────────────────────────────────────────────────────

@api_view(['GET', 'POST'])
def pedidos_list(request):
    if request.method == 'GET':
        if request.user.is_staff or request.user.is_superuser:
            pedidos = Pedido.objects.all().select_related('cliente').prefetch_related('detalles__producto')
        else:
            pedidos = Pedido.objects.filter(cliente=request.user).prefetch_related('detalles__producto')
        return Response(PedidoSerializer(pedidos, many=True).data)

    serializer = CrearPedidoSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    items = serializer.validated_data['items']
    notas = serializer.validated_data.get('notas', '')

    with transaction.atomic():
        pedido = Pedido.objects.create(cliente=request.user, notas=notas)
        total = 0
        for item in items:
            producto = Producto.objects.select_for_update().get(id=item['producto_id'])
            cantidad = int(item['cantidad'])
            precio = producto.precio
            DetallePedido.objects.create(
                pedido=pedido,
                producto=producto,
                cantidad=cantidad,
                precio_unitario=precio
            )
            producto.stock -= cantidad
            producto.save()
            total += precio * cantidad
        pedido.total = total
        pedido.save()

    # Notificar al admin por WhatsApp en segundo plano
    threading.Thread(target=notificar_whatsapp, args=(pedido.id,), daemon=True).start()

    return Response(PedidoSerializer(pedido).data, status=status.HTTP_201_CREATED)


@api_view(['GET', 'PUT'])
def pedido_detail(request, pk):
    try:
        if request.user.is_staff or request.user.is_superuser:
            pedido = Pedido.objects.get(pk=pk)
        else:
            pedido = Pedido.objects.get(pk=pk, cliente=request.user)
    except Pedido.DoesNotExist:
        return Response({'error': 'Pedido no encontrado.'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        return Response(PedidoSerializer(pedido).data)

    if not (request.user.is_staff or request.user.is_superuser):
        return Response({'error': 'Sin permisos.'}, status=status.HTTP_403_FORBIDDEN)

    nuevo_estado = request.data.get('estado')
    if nuevo_estado not in dict(Pedido.ESTADO_CHOICES):
        return Response({'error': 'Estado inválido.'}, status=status.HTTP_400_BAD_REQUEST)

    pedido.estado = nuevo_estado
    pedido.save()
    return Response(PedidoSerializer(pedido).data)


# ─── DASHBOARD ADMIN ─────────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([EsAdmin])
def dashboard_stats(request):
    from django.db.models import Sum
    total_productos = Producto.objects.filter(activo=True).count()
    total_clientes = User.objects.filter(is_superuser=False, is_staff=False).count()
    total_pedidos = Pedido.objects.count()
    pedidos_pendientes = Pedido.objects.filter(estado='pendiente').count()
    ventas_totales = Pedido.objects.exclude(estado='cancelado').aggregate(total=Sum('total'))['total'] or 0
    stock_bajo = Producto.objects.filter(activo=True, stock__lte=5).values('id', 'nombre', 'stock')

    return Response({
        'total_productos': total_productos,
        'total_clientes': total_clientes,
        'total_pedidos': total_pedidos,
        'pedidos_pendientes': pedidos_pendientes,
        'ventas_totales': float(ventas_totales),
        'stock_bajo': list(stock_bajo),
    })