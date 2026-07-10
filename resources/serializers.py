from rest_framework import serializers
from .models import Resource, Category


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