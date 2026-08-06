from django.urls import path
from .views import (
    CategoryListView, ResourceListView, ResourceDetailView, ResourceUploadView,
    ReviewListCreateView, WishlistView, AcquisitionListView, AcquisitionCreateView,
    NFTStatusView, NFTResaleListView, NFTListForResaleView, NFTCancelResaleView,
    NFTBuyResaleView, MyNFTTokensView, CreatorNFTDashboardView,
    PayoutCreateListView, AdminPayoutListView, AdminPayoutActionView,
    ReportCreateView, AdminReportListView, AdminReportActionView,
    UserStatsView, AdminStatsView,
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
    # Cancel your resale listing
    path('nft/cancel-resale/<int:token_id>/', NFTCancelResaleView.as_view(), name='nft-cancel-resale'),
    # Buy a secondary token
    path('nft/buy-resale/<int:token_id>/', NFTBuyResaleView.as_view(), name='nft-buy-resale'),
    # All NFT tokens owned by the logged-in user
    path('nft/my-tokens/', MyNFTTokensView.as_view(), name='nft-my-tokens'),

    path('payouts/', PayoutCreateListView.as_view(), name='payout-list-create'),
    path('admin/payouts/', AdminPayoutListView.as_view(), name='admin-payout-list'),
    path('admin/payouts/<int:pk>/', AdminPayoutActionView.as_view(), name='admin-payout-action'),

    path('reports/', ReportCreateView.as_view(), name='report-create'),
    path('admin/reports/', AdminReportListView.as_view(), name='admin-report-list'),
    path('admin/reports/<int:pk>/', AdminReportActionView.as_view(), name='admin-report-action'),

    path('stats/user/', UserStatsView.as_view(), name='user-stats'),
    path('stats/admin/', AdminStatsView.as_view(), name='admin-stats'),
]