from rest_framework import serializers
from django.db.models import Sum, Count
from .models import Resource, Category, Wishlist, Review, NFTToken, NFTSale, ResourceImage, Payout, Report


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'description']

class ResourceImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResourceImage
        fields = ['id', 'image', 'order']


class ResourceSerializer(serializers.ModelSerializer):
    owner_username = serializers.CharField(source='owner.username', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    tokens_minted = serializers.IntegerField(read_only=True)
    tokens_remaining = serializers.IntegerField(read_only=True)
    images = ResourceImageSerializer(many=True, read_only=True)   # ← new

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
            'images',   # ← new
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

# MERGE: AcquisitionSerializer removed — NFTTokenSerializer now serves the Library page

# ─── NFT Serializers ────────────────────────────────────────────────────────────

class NFTTokenSerializer(serializers.ModelSerializer):
    resource_title = serializers.CharField(source='resource.title', read_only=True)
    resource_thumbnail = serializers.ImageField(source='resource.thumbnail', read_only=True)
    # MERGE: expose the download file URL so Library page can show a Download button
    resource_file = serializers.FileField(source='resource.file', read_only=True)
    owner_username = serializers.CharField(source='owner.username', read_only=True)
    max_supply = serializers.IntegerField(source='resource.max_supply', read_only=True)
    royalty_percent = serializers.IntegerField(source='resource.royalty_percent', read_only=True)
    is_primary_sold_out = serializers.SerializerMethodField()

    class Meta:
        model = NFTToken
        fields = [
            'id', 'resource', 'resource_title', 'resource_thumbnail', 'resource_file',
            'owner', 'owner_username',
            'token_number', 'max_supply', 'royalty_percent',
            'minted_at', 'metadata_hash', 'paid_amount',
            'is_listed_for_resale', 'resale_price',
            'is_primary_sold_out',
        ]
        read_only_fields = ['token_number', 'minted_at', 'metadata_hash', 'paid_amount']

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


class PayoutSerializer(serializers.ModelSerializer):
    creator_username = serializers.CharField(source='creator.username', read_only=True)

    class Meta:
        model = Payout
        fields = ['id', 'creator', 'creator_username', 'amount', 'status', 'requested_at', 'paid_at', 'notes']
        read_only_fields = ['creator', 'status', 'requested_at', 'paid_at', 'notes']


class ReportSerializer(serializers.ModelSerializer):
    reporter_username = serializers.CharField(source='reporter.username', read_only=True)
    resource_title = serializers.CharField(source='resource.title', read_only=True, default=None)
    reported_username = serializers.CharField(source='reported_user.username', read_only=True, default=None)

    class Meta:
        model = Report
        fields = ['id', 'reporter', 'reporter_username', 'target_type', 'resource', 'resource_title', 'reported_user', 'reported_username', 'reason', 'status', 'created_at']
        read_only_fields = ['reporter', 'status', 'created_at']