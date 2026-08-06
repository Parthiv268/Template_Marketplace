from django.contrib import admin
from .models import Resource, Category, Review, Wishlist, NFTToken, NFTSale

# Register your models here.
@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['id', 'name']

@admin.register(Resource)
class ResourceAdmin(admin.ModelAdmin):
    list_display = ['id', 'title', 'owner', 'category', 'price', 'status', 'max_supply', 'royalty_percent', 'created_at']
    list_filter = ['status', 'category']

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ['user', 'resource', 'rating', 'created_at']

@admin.register(Wishlist)
class WishlistAdmin(admin.ModelAdmin):
    list_display = ['user', 'resource', 'added_at']

# MERGE: Acquisition removed — NFTToken is now the ownership + download record
@admin.register(NFTToken)
class NFTTokenAdmin(admin.ModelAdmin):
    list_display = ['id', 'resource', 'owner', 'token_number', 'paid_amount', 'minted_at', 'is_listed_for_resale', 'resale_price']
    list_filter = ['is_listed_for_resale', 'resource']
    search_fields = ['resource__title', 'owner__username', 'metadata_hash']

@admin.register(NFTSale)
class NFTSaleAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'token', 'sale_type', 'buyer', 'seller',
        'sale_price', 'royalty_amount', 'creator_earnings', 'sold_at'
    ]
    list_filter = ['sale_type']
    search_fields = ['token__resource__title', 'buyer__username', 'seller__username']