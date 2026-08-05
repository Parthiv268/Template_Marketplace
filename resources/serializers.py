from rest_framework import serializers
from django.db.models import Sum, Count
from .models import Resource, Category, Acquisition, Wishlist, Review, NFTToken, NFTSale


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'description']


class ResourceSerializer(serializers.ModelSerializer):
    owner_username = serializers.CharField(
        source='owner.username',
        read_only=True
    )
    category_name = serializers.CharField(
        source='category.name',
        read_only=True
    )
    tokens_minted = serializers.IntegerField(read_only=True)
    tokens_remaining = serializers.IntegerField(read_only=True)
    # here source helps them fetch data from the foreign key

    class Meta:
        model = Resource
        fields = [
            'id', 'title', 'description',
            'category', 'category_name',
            'thumbnail', 'file',
            'price', 'owner', 'owner_username',
            'status', 'max_supply', 'royalty_percent',
            'token_id', 'ipfs_hash', 'created_at',
            'tokens_minted', 'tokens_remaining',
        ]
        read_only_fields = [
            'owner', 'status',
            'token_id', 'ipfs_hash', 'created_at',
            'tokens_minted', 'tokens_remaining',
        ]


class ReviewSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Review
        fields = ['id', 'username', 'rating', 'comment', 'created_at']
        read_only_fields = ['created_at']

    def validate_rating(self, value):
        # this is called on serializer.is_valid()
        if value < 1 or value > 5:
            raise serializers.ValidationError("Rating must be between 1 and 5.")
        return value


class WishlistSerializer(serializers.ModelSerializer):
    resource_title = serializers.CharField(source='resource.title', read_only=True)
    resource_price = serializers.DecimalField(source='resource.price', max_digits=8, decimal_places=2, read_only=True)
    thumbnail = serializers.ImageField(source='resource.thumbnail', read_only=True)

    class Meta:
        model = Wishlist
        fields = ['id', 'resource', 'resource_title', 'resource_price', 'thumbnail', 'added_at']
        read_only_fields = ['added_at']


class AcquisitionSerializer(serializers.ModelSerializer):
    resource_title = serializers.CharField(source='resource.title', read_only=True)
    resource_price = serializers.DecimalField(source='resource.price', max_digits=8, decimal_places=2, read_only=True)
    thumbnail = serializers.ImageField(source='resource.thumbnail', read_only=True)
    file = serializers.FileField(source='resource.file', read_only=True)

    class Meta:
        model = Acquisition
        fields = ['id', 'resource', 'resource_title', 'resource_price', 'thumbnail', 'file', 'acquired_at']
        read_only_fields = ['acquired_at']


# ─── NFT Serializers ────────────────────────────────────────────────────────────

class NFTTokenSerializer(serializers.ModelSerializer):
    resource_title = serializers.CharField(source='resource.title', read_only=True)
    resource_thumbnail = serializers.ImageField(source='resource.thumbnail', read_only=True)
    owner_username = serializers.CharField(source='owner.username', read_only=True)
    max_supply = serializers.IntegerField(source='resource.max_supply', read_only=True)
    royalty_percent = serializers.IntegerField(source='resource.royalty_percent', read_only=True)
    is_primary_sold_out = serializers.SerializerMethodField()

    class Meta:
        model = NFTToken
        fields = [
            'id', 'resource', 'resource_title', 'resource_thumbnail',
            'owner', 'owner_username',
            'token_number', 'max_supply', 'royalty_percent',
            'minted_at', 'metadata_hash',
            'is_listed_for_resale', 'resale_price',
            'is_primary_sold_out',
        ]
        read_only_fields = ['token_number', 'minted_at', 'metadata_hash']

    def get_is_primary_sold_out(self, obj):
        return obj.resource.tokens_minted >= obj.resource.max_supply


class NFTSaleSerializer(serializers.ModelSerializer):
    token_number = serializers.IntegerField(source='token.token_number', read_only=True)
    resource_title = serializers.CharField(source='token.resource.title', read_only=True)
    resource_id = serializers.IntegerField(source='token.resource.id', read_only=True)
    buyer_username = serializers.CharField(source='buyer.username', read_only=True)
    seller_username = serializers.CharField(source='seller.username', read_only=True)
    creator_username = serializers.CharField(source='original_creator.username', read_only=True)

    class Meta:
        model = NFTSale
        fields = [
            'id', 'token', 'token_number', 'resource_title', 'resource_id',
            'buyer_username', 'seller_username', 'creator_username',
            'sale_type', 'sale_price',
            'royalty_amount', 'seller_earnings', 'creator_earnings',
            'sold_at',
        ]


class NFTDashboardSerializer(serializers.Serializer):
    """
    Computed analytics payload for the creator NFT dashboard.
    Not backed by a single model — assembled in the view.
    """
    # Top-level aggregate stats
    total_tokens_minted = serializers.IntegerField()
    total_primary_earnings = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_royalty_earned = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_combined_earnings = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_resources = serializers.IntegerField()

    # Per-resource breakdown for the table
    resources_breakdown = serializers.ListField(child=serializers.DictField())

    # Time-series for charts: list of {date, primary_sales, secondary_sales,
    #                                    primary_revenue, royalty_revenue}
    sales_over_time = serializers.ListField(child=serializers.DictField())

    # Recent sales feed (last 20)
    recent_sales = NFTSaleSerializer(many=True)

    # Tokens owned by this creator (their NFT collection)
    my_tokens = NFTTokenSerializer(many=True)