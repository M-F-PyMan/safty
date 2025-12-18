# orders/serializers.py
from rest_framework import serializers
from .models import CartItem,Order
from django.contrib.auth.models import User
from Products.serializers import ProductSerializer

class CartItemSerializer(serializers.ModelSerializer):
    product_title = serializers.CharField(source="product.title", read_only=True)
    product_image = serializers.ImageField(source="product.image", read_only=True)
    total_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = CartItem
        fields = ["id", "product", "product_title", "product_image", "quantity", "total_price"]


class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'email']

class OrderSerializer(serializers.ModelSerializer):
    customer = CustomerSerializer(source='user', read_only=True)
    products = ProductSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = [
            'id',
            'date',
            'total',
            'items',
            'status',
            'customer',
            'products'
        ]
