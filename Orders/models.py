from django.db import models
from django.contrib.auth.models import User
from Products.models import Product

class CartItem(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="cart_items")
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)

    @property
    def total_price(self):
        return self.product.price * self.quantity

class Order(models.Model):
    STATUS_CHOICES = [
        ('success', 'موفق'),
        ('pending', 'در حال انجام'),
        ('canceled', 'لغو شده'),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    date = models.DateTimeField(auto_now_add=True)
    total = models.DecimalField(max_digits=12, decimal_places=2)
    items = models.PositiveIntegerField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
