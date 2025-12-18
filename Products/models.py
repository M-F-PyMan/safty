from django.db import models
from django.utils.text import slugify


class Brand(models.Model):
    name = models.CharField(max_length=100)
    logo = models.ImageField(upload_to="brands/")
    description = models.TextField(blank=True)

class Product(models.Model):
    title = models.CharField(max_length=200)
    category = models.CharField(max_length=100)
    brand = models.CharField(max_length=100, blank=True)
    price = models.DecimalField(max_digits=12, decimal_places=2)
    discountPercentage = models.FloatField(default=0)
    stock = models.PositiveIntegerField(default=0)
    description = models.TextField(blank=True)
    createdAt = models.DateTimeField(auto_now_add=True)


class Review(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="reviews")
    user = models.ForeignKey("auth.User", on_delete=models.CASCADE)
    text = models.TextField()
    rating = models.PositiveIntegerField(default=5)
    created_at = models.DateTimeField(auto_now_add=True)

class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=120, unique=True, blank=True)
    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super(Category, self).save(*args, **kwargs)

    class Meta:
        verbose_name_plural = "Categories"
        ordering = ['-name']
        unique_together = (('name',),)
        index_together = (('name',),)

        