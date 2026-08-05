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
    # NFT views
    NFTStatusView,
    NFTResaleListView,
    NFTListForResaleView,
    NFTBuyResaleView,
    CreatorNFTDashboardView,
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

    # ── NFT Endpoints ──────────────────────────────────────────────────────────
    # Creator dashboard — full analytics
    path('nft/dashboard/', CreatorNFTDashboardView.as_view(), name='nft-dashboard'),
    # Supply + sales info for a specific resource
    path('nft/status/<int:resource_id>/', NFTStatusView.as_view(), name='nft-status'),
    # Secondary market — all tokens listed for resale
    path('nft/resale/', NFTResaleListView.as_view(), name='nft-resale-list'),
    # List your token for resale
    path('nft/list-resale/<int:token_id>/', NFTListForResaleView.as_view(), name='nft-list-resale'),
    # Buy a secondary token
    path('nft/buy-resale/<int:token_id>/', NFTBuyResaleView.as_view(), name='nft-buy-resale'),
]