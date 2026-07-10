from django.contrib import admin
from .models import Resource,Category
# Register your models here.
@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['id', 'name']

@admin.register(Resource)
class ResourceAdmin(admin.ModelAdmin):
    list_display = ['id', 'title', 'owner', 'category', 'price', 'status', 'created_at']
    list_filter = ['status', 'category']