from django.urls import path
from .views import (
    CategoryListView,
    ResourceListView,
    ResourceDetailView,
    ResourceUploadView,
    ReviewListCreateView,
    WishlistView,
    AcquisitionListView,
    AcquisitionCreateView,
)

urlpatterns = [
    path('', ResourceListView.as_view(), name='resource-list'),
    path('upload/', ResourceUploadView.as_view(), name='resource-upload'),
    path('categories/', CategoryListView.as_view(), name='category-list'),
    path('wishlist/', WishlistView.as_view(), name='wishlist'),
    path('library/', AcquisitionListView.as_view(), name='library'),
    path('acquire/', AcquisitionCreateView.as_view(), name='acquire'),
    path('<int:resource_id>/reviews/', ReviewListCreateView.as_view(), name='review-list-create'),
    path('<int:pk>/', ResourceDetailView.as_view(), name='resource-detail'),
]