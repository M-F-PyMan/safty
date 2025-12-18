from rest_framework import viewsets, permissions
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Product, Review, Brand, Category
from .serializers import (
    ProductSerializer,
    ReviewSerializer,
    BrandSerializer,
    CategorySerializer,
)

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer


class BrandViewSet(viewsets.ModelViewSet):
    queryset = Brand.objects.all()
    serializer_class = BrandSerializer


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer


class ReviewViewSet(viewsets.ModelViewSet):
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Review.objects.filter(product_id=self.kwargs["product_pk"])

    def perform_create(self, serializer):
        serializer.save(user=self.request.user, product_id=self.kwargs["product_pk"])

@api_view(['DELETE'])
def remove_from_cart(request, product_id):
    size = request.query_params.get('size')
    cart = request.session.get('cart', [])

    cart = [item for item in cart if not (item['id'] == product_id and item.get('size') == size)]
    request.session['cart'] = cart

    return Response({"cart": cart}, status=status.HTTP_200_OK)
