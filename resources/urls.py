from django.urls import path
from .views import (
    CategoryListView,
    ResourceListView,
    ResourceDetailView,
    ResourceUploadView,
)

urlpatterns = [
    path('', ResourceListView.as_view(), name='resource-list'),
    path('<int:pk>/', ResourceDetailView.as_view(), name='resource-detail'),
    path('upload/', ResourceUploadView.as_view(), name='resource-upload'),
    path('categories/', CategoryListView.as_view(), name='category-list'),
]