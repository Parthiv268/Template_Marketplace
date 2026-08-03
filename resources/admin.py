from django.contrib import admin
from .models import Resource,Category,Review,Wishlist,Acquisition
# Register your models here.
@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['id', 'name']

@admin.register(Resource)
class ResourceAdmin(admin.ModelAdmin):
    list_display = ['id', 'title', 'owner', 'category', 'price', 'status', 'created_at']
    list_filter = ['status', 'category']
@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ['user', 'resource', 'rating', 'created_at']

@admin.register(Wishlist)
class WishlistAdmin(admin.ModelAdmin):
    list_display = ['user', 'resource', 'added_at']

@admin.register(Acquisition)
class AcquisitionAdmin(admin.ModelAdmin):
    list_display = ['user', 'resource', 'acquired_at']