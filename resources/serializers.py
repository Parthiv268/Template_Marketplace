from rest_framework import serializers
from .models import Resource, Category,Acquisition,Wishlist,Review


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
    # here source helps them fetch data from the foreign key

    class Meta:
        model = Resource
        fields = [
            'id', 'title', 'description',
            'category', 'category_name',
            'thumbnail', 'file',
            'price', 'owner', 'owner_username',
            'status', 'max_supply', 'royalty_percent',
            'token_id', 'ipfs_hash', 'created_at'
        ]
        read_only_fields = [
            'owner', 'status',
            'token_id', 'ipfs_hash', 'created_at'
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