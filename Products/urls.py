from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ProductViewSet,
    ReviewViewSet,
    BrandViewSet,
    CategoryViewSet,
    remove_from_cart,
)

router = DefaultRouter()
router.register(r'products', ProductViewSet, basename='products')
router.register(r'brands', BrandViewSet, basename='brands')
router.register(r'categories', CategoryViewSet, basename='categories')

urlpatterns = [
    path('', include(router.urls)),
    path('products/<int:product_pk>/reviews/',ReviewViewSet.as_view({'get':'list','post':'create'}),
         name='product-reviews'),

    path('api/cart/<int:product_id>/remove/', remove_from_cart),
]
