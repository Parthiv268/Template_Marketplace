from django.shortcuts import render
from rest_framework import generics, filters,status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.parsers import MultiPartParser, FormParser
from .models import Resource, Category,Wishlist,Review,Acquisition
from .serializers import (ResourceSerializer, CategorySerializer,ReviewSerializer,WishlistSerializer,AcquisitionSerializer)
from rest_framework.response import Response

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
class ReviewListCreateView(generics.ListCreateAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        resource_id = self.kwargs['resource_id']
        # kwargs store all the important info that has been extracted during a GET request from the frontend/
        return Review.objects.filter(resource_id=resource_id).order_by('-created_at')
# perfomr_create runs after the whole erializer has completed its work
    def perform_create(self, serializer):
        resource_id = self.kwargs['resource_id']
        resource = Resource.objects.get(id=resource_id)
        serializer.save(user=self.request.user, resource=resource)

class WishlistView(generics.ListCreateAPIView):
    serializer_class = WishlistSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Wishlist.objects.filter(user=self.request.user).order_by('-added_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def delete(self, request, *args, **kwargs):
        resource_id = request.data.get('resource')
        try:
            item = Wishlist.objects.get(user=request.user, resource_id=resource_id)
            item.delete()
            return Response({'message': 'Removed from wishlist'}, status=status.HTTP_200_OK)
        except Wishlist.DoesNotExist:
            return Response({'error': 'Not in wishlist'}, status=status.HTTP_404_NOT_FOUND)
class AcquisitionListView(generics.ListAPIView):
    serializer_class = AcquisitionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Acquisition.objects.filter(user=self.request.user).order_by('-acquired_at')

class AcquisitionCreateView(generics.CreateAPIView):
    serializer_class = AcquisitionSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)