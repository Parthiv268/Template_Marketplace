from django.shortcuts import render
from rest_framework import generics, filters
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.parsers import MultiPartParser, FormParser
from .models import Resource, Category
from .serializers import ResourceSerializer, CategorySerializer


class CategoryListView(generics.ListAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]


class ResourceListView(generics.ListAPIView):
    serializer_class = ResourceSerializer
    permission_classes = [AllowAny]
    filter_backends = [filters.SearchFilter]
    search_fields = ['title','^description','category__name']
    # ^ is used to get the accurate result and not just the word being used anywhere

    def get_queryset(self):
        queryset = Resource.objects.filter(
            status='listed'
        ).order_by('-created_at')

        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(title__icontains=search)

        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category__id=category)

        return queryset


class ResourceDetailView(generics.RetrieveAPIView):
    queryset = Resource.objects.all()
    serializer_class = ResourceSerializer
    permission_classes = [AllowAny]


class ResourceUploadView(generics.CreateAPIView):
    serializer_class = ResourceSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def perform_create(self, serializer):
        resource = serializer.save(owner=self.request.user)

        profile = self.request.user.profile
        if profile.status != 'creator':
            profile.status = 'creator'
            profile.save()