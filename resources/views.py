from django.shortcuts import render
from rest_framework import generics, filters, status
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Sum, Count, Q
from django.db.models.functions import TruncDate
from decimal import Decimal
import datetime

from .models import Resource, Category, Wishlist, Review, NFTToken, NFTSale, ResourceImage, Payout, Report
from .serializers import (
    ResourceSerializer, CategorySerializer, ReviewSerializer,
    WishlistSerializer,
    NFTTokenSerializer, NFTSaleSerializer, NFTDashboardSerializer,
    PayoutSerializer, ReportSerializer,
)
from django.contrib.auth.models import User


class CategoryListView(generics.ListAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]


class ResourceListView(generics.ListAPIView):
    serializer_class = ResourceSerializer
    permission_classes = [AllowAny]
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', '^description', 'category__name']
    # ^ is used to get the accurate result and not just the word being used anywhere

    def get_queryset(self):
        # Performance: select_related pulls owner + category in the same SQL JOIN
        # prefetch_related fetches all images in one extra query instead of N
        queryset = Resource.objects.filter(
            status='listed'
        ).select_related('owner', 'category').prefetch_related('images').order_by('-created_at')

        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(title__icontains=search)

        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category__id=category)

        return queryset


class ResourceDetailView(generics.RetrieveAPIView):
    # Performance: pull owner + category + images in 2 queries instead of N
    queryset = Resource.objects.select_related('owner', 'category').prefetch_related('images')
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
        # Performance: select_related fetches resource (+ its owner) in 1 JOIN
        return Wishlist.objects.filter(
            user=self.request.user
        ).select_related('resource', 'resource__owner').order_by('-added_at')

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


# MERGE: AcquisitionListView and AcquisitionCreateView removed.
# Library page now uses MyNFTTokensView (GET /api/resources/nft/my-tokens/)
# which returns NFTToken records including resource_file for download.


# ─── NFT Views ─────────────────────────────────────────────────────────────────

class NFTStatusView(APIView):
    """
    GET /api/resources/nft/status/<resource_id>/
    Public. Returns supply info + all sales for a single resource.
    """
    permission_classes = [AllowAny]

    def get(self, request, resource_id):
        try:
            resource = Resource.objects.get(id=resource_id)
        except Resource.DoesNotExist:
            return Response({'error': 'Resource not found'}, status=status.HTTP_404_NOT_FOUND)

        tokens = NFTToken.objects.filter(resource=resource).select_related('owner')
        sales = NFTSale.objects.filter(token__resource=resource).select_related(
            'buyer', 'seller', 'original_creator', 'token'
        )

        # Aggregate earnings for this resource
        primary_total = sales.filter(sale_type='primary').aggregate(
            total=Sum('creator_earnings')
        )['total'] or Decimal('0')
        royalty_total = sales.filter(sale_type='secondary').aggregate(
            total=Sum('royalty_amount')
        )['total'] or Decimal('0')

        return Response({
            'resource_id': resource.id,
            'resource_title': resource.title,
            'max_supply': resource.max_supply,
            'tokens_minted': resource.tokens_minted,
            'tokens_remaining': resource.tokens_remaining,
            'royalty_percent': resource.royalty_percent,
            'price': str(resource.price),
            'primary_fully_sold': resource.tokens_minted >= resource.max_supply,
            'primary_earnings_total': str(primary_total),
            'royalty_earned_total': str(royalty_total),
            'tokens': NFTTokenSerializer(tokens, many=True, context={'request': request}).data,
            'sales': NFTSaleSerializer(sales, many=True).data,
        })


class NFTResaleListView(APIView):
    """
    GET /api/resources/nft/resale/
    Returns all tokens currently listed for resale (secondary market).
    """
    permission_classes = [AllowAny]

    def get(self, request):
        tokens = NFTToken.objects.filter(
            is_listed_for_resale=True
        ).select_related('resource', 'owner')
        return Response(NFTTokenSerializer(tokens, many=True, context={'request': request}).data)


class NFTListForResaleView(APIView):
    """
    POST /api/resources/nft/list-resale/<token_id>/
    Token owner lists their token for resale at a specified price.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, token_id):
        try:
            token = NFTToken.objects.get(id=token_id, owner=request.user)
        except NFTToken.DoesNotExist:
            return Response(
                {'error': 'Token not found or you are not the owner'},
                status=status.HTTP_404_NOT_FOUND
            )

        resale_price = request.data.get('resale_price')
        if not resale_price:
            return Response({'error': 'resale_price is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            resale_price = Decimal(str(resale_price))
            if resale_price <= 0:
                raise ValueError
        except (ValueError, Exception):
            return Response({'error': 'Invalid resale price'}, status=status.HTTP_400_BAD_REQUEST)

        token.is_listed_for_resale = True
        token.resale_price = resale_price
        token.save()

        return Response({
            'success': True,
            'message': f'Token #{token.token_number} is now listed for ₹{resale_price}',
            'token': NFTTokenSerializer(token, context={'request': request}).data,
        })


class NFTCancelResaleView(APIView):
    """
    POST /api/resources/nft/cancel-resale/<token_id>/
    Token owner cancels their resale listing, taking the token off the market.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, token_id):
        try:
            token = NFTToken.objects.get(id=token_id, owner=request.user)
        except NFTToken.DoesNotExist:
            return Response(
                {'error': 'Token not found or you are not the owner'},
                status=status.HTTP_404_NOT_FOUND
            )

        if not token.is_listed_for_resale:
            return Response({'error': 'Token is not listed for resale'}, status=status.HTTP_400_BAD_REQUEST)

        token.is_listed_for_resale = False
        token.resale_price = None
        token.save()

        return Response({
            'success': True,
            'message': f'Token #{token.token_number} has been de-listed from the resale market.',
        })


class MyNFTTokensView(APIView):
    """
    GET /api/resources/nft/my-tokens/
    Returns all NFT tokens owned by the currently logged-in user.
    Used by the Library page to show a user's NFT collection.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        tokens = NFTToken.objects.filter(
            owner=request.user
        ).select_related('resource', 'resource__owner')
        return Response(NFTTokenSerializer(tokens, many=True, context={'request': request}).data)


class NFTBuyResaleView(APIView):
    """
    POST /api/resources/nft/buy-resale/<token_id>/
    Buy a token from the secondary market.
    Royalty is automatically routed to the original creator.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, token_id):
        try:
            token = NFTToken.objects.get(id=token_id, is_listed_for_resale=True)
        except NFTToken.DoesNotExist:
            return Response(
                {'error': 'Token not available for resale'},
                status=status.HTTP_404_NOT_FOUND
            )

        if token.owner == request.user:
            return Response({'error': 'You already own this token'}, status=status.HTTP_400_BAD_REQUEST)

        resource = token.resource
        resale_price = token.resale_price
        royalty_percent = Decimal(str(resource.royalty_percent))

        # Calculate royalty — goes to original creator
        royalty_amount = (resale_price * royalty_percent / Decimal('100')).quantize(Decimal('0.01'))
        seller_earnings = (resale_price - royalty_amount).quantize(Decimal('0.01'))

        # Record the secondary sale
        sale = NFTSale.objects.create(
            token=token,
            buyer=request.user,
            seller=token.owner,           # the reseller
            original_creator=resource.owner,  # always the original creator
            sale_type='secondary',
            sale_price=resale_price,
            royalty_amount=royalty_amount,
            seller_earnings=seller_earnings,
            creator_earnings=royalty_amount,  # creator earns royalty on resale
        )

        # Transfer ownership
        previous_owner = token.owner
        token.owner = request.user
        token.is_listed_for_resale = False
        token.resale_price = None
        token.save()

        return Response({
            'success': True,
            'message': f'You now own Token #{token.token_number} of "{resource.title}"',
            'token_number': token.token_number,
            'royalty_paid_to_creator': str(royalty_amount),
            'seller_received': str(seller_earnings),
            'sale_id': sale.id,
        })


class CreatorNFTDashboardView(APIView):
    """
    GET /api/resources/nft/dashboard/
    Authenticated creator only.
    Returns full analytics payload for the NFT dashboard.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        # Performance: evaluate resources once, cache in a list for reuse
        my_resources = list(Resource.objects.filter(owner=user))
        resource_ids = [r.id for r in my_resources]

        # All NFT sales where this user is the original creator
        all_sales = NFTSale.objects.filter(original_creator=user).select_related(
            'token', 'token__resource', 'buyer', 'seller'
        )

        # Aggregate totals — single DB query each, no Python loops
        agg = all_sales.aggregate(
            total_primary=Sum('creator_earnings', filter=Q(sale_type='primary')),
            total_royalty=Sum('royalty_amount', filter=Q(sale_type='secondary')),
        )
        total_primary_earnings = agg['total_primary'] or Decimal('0')
        total_royalty_earned   = agg['total_royalty']  or Decimal('0')

        total_tokens_minted = NFTToken.objects.filter(resource__owner=user).count()

        # Performance: compute per-resource breakdown with ONE annotated query
        # instead of 4 DB hits per resource inside a loop
        from django.db.models import DecimalField
        resource_agg = NFTSale.objects.filter(
            original_creator=user,
            token__resource_id__in=resource_ids,
        ).values('token__resource_id', 'sale_type').annotate(
            total_earnings=Sum('creator_earnings'),
            total_royalty=Sum('royalty_amount'),
            sale_count=Count('id'),
        )
        # Index the aggregates by (resource_id, sale_type)
        agg_index = {}
        for row in resource_agg:
            key = (row['token__resource_id'], row['sale_type'])
            agg_index[key] = row

        resources_breakdown = []
        for r in my_resources:
            pri = agg_index.get((r.id, 'primary'), {})
            sec = agg_index.get((r.id, 'secondary'), {})
            resources_breakdown.append({
                'resource_id': r.id,
                'title': r.title,
                'thumbnail': request.build_absolute_uri(r.thumbnail.url) if r.thumbnail else None,
                'max_supply': r.max_supply,
                'tokens_minted': r.tokens_minted,
                'tokens_remaining': r.tokens_remaining,
                'royalty_percent': r.royalty_percent,
                'price': str(r.price),
                'primary_sales_count': pri.get('sale_count', 0),
                'secondary_sales_count': sec.get('sale_count', 0),
                'primary_revenue': str(pri.get('total_earnings') or Decimal('0')),
                'royalty_revenue': str(sec.get('total_royalty') or Decimal('0')),
                'supply_percent': round(r.tokens_minted / r.max_supply * 100, 1) if r.max_supply else 0,
            })

        # Time-series: group sales by date (last 90 days)
        since = datetime.date.today() - datetime.timedelta(days=89)
        sales_by_date_qs = all_sales.filter(
            sold_at__date__gte=since
        ).annotate(
            date=TruncDate('sold_at')
        ).values('date', 'sale_type').annotate(
            count=Count('id'),
            revenue=Sum('creator_earnings'),
            royalty=Sum('royalty_amount'),
        ).order_by('date')

        # Build a dict keyed by date for easy merging
        time_series_map = {}
        for row in sales_by_date_qs:
            d = str(row['date'])
            if d not in time_series_map:
                time_series_map[d] = {
                    'date': d,
                    'primary_count': 0,
                    'secondary_count': 0,
                    'primary_revenue': 0.0,
                    'royalty_revenue': 0.0,
                }
            if row['sale_type'] == 'primary':
                time_series_map[d]['primary_count'] = row['count']
                time_series_map[d]['primary_revenue'] = float(row['revenue'] or 0)
            else:
                time_series_map[d]['secondary_count'] = row['count']
                time_series_map[d]['royalty_revenue'] = float(row['royalty'] or 0)

        sales_over_time = sorted(time_series_map.values(), key=lambda x: x['date'])

        # Cumulative revenue for the area chart
        running_primary = 0.0
        running_royalty = 0.0
        for entry in sales_over_time:
            running_primary += entry['primary_revenue']
            running_royalty += entry['royalty_revenue']
            entry['cumulative_primary'] = round(running_primary, 2)
            entry['cumulative_royalty'] = round(running_royalty, 2)
            entry['cumulative_total'] = round(running_primary + running_royalty, 2)

        # Tokens owned by the creator themselves (their own NFT collection)
        my_tokens = NFTToken.objects.filter(owner=user).select_related('resource')

        # Recent sales
        recent_sales = all_sales[:20]

        data = {
            'total_tokens_minted': total_tokens_minted,
            'total_primary_earnings': total_primary_earnings,
            'total_royalty_earned': total_royalty_earned,
            'total_combined_earnings': total_primary_earnings + total_royalty_earned,
            'total_resources': len(my_resources),
            'resources_breakdown': resources_breakdown,
            'sales_over_time': sales_over_time,
            'recent_sales': recent_sales,
            'my_tokens': my_tokens,
        }

        serializer = NFTDashboardSerializer(data)
        return Response(serializer.data)


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

        # ── new: handle extra carousel images ──
        extra_images = self.request.FILES.getlist('images')
        for index, img_file in enumerate(extra_images):
            ResourceImage.objects.create(resource=resource, image=img_file, order=index)


# ── Payouts ──
class PayoutCreateListView(generics.ListCreateAPIView):
    serializer_class = PayoutSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Payout.objects.filter(creator=self.request.user).order_by('-requested_at')

    def perform_create(self, serializer):
        serializer.save(creator=self.request.user)


class AdminPayoutListView(generics.ListAPIView):
    serializer_class = PayoutSerializer
    permission_classes = [IsAdminUser]

    def get_queryset(self):
        qs = Payout.objects.all().order_by('-requested_at')
        status_param = self.request.query_params.get('status')
        if status_param:
            qs = qs.filter(status=status_param)
        return qs


class AdminPayoutActionView(generics.UpdateAPIView):
    queryset = Payout.objects.all()
    serializer_class = PayoutSerializer
    permission_classes = [IsAdminUser]


# ── Reports ──
class ReportCreateView(generics.CreateAPIView):
    serializer_class = ReportSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(reporter=self.request.user)


class AdminReportListView(generics.ListAPIView):
    serializer_class = ReportSerializer
    permission_classes = [IsAdminUser]

    def get_queryset(self):
        qs = Report.objects.all().order_by('-created_at')
        status_param = self.request.query_params.get('status')
        if status_param:
            qs = qs.filter(status=status_param)
        return qs


class AdminReportActionView(generics.UpdateAPIView):
    queryset = Report.objects.all()
    serializer_class = ReportSerializer
    permission_classes = [IsAdminUser]


# ── Dashboard stats ──
class UserStatsView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        # MERGE: query NFTToken instead of Acquisition
        # items_owned = tokens currently held; total_spent = sum of paid_amount on those tokens
        agg = NFTToken.objects.filter(owner=user).aggregate(
            items_owned=Count('id'),
            total_spent=Sum('paid_amount'),
        )
        data = {
            'items_owned': agg['items_owned'] or 0,
            'total_spent': agg['total_spent'] or 0,
            'wishlist_count': Wishlist.objects.filter(user=user).count(),
        }
        return Response(data)


class AdminStatsView(generics.GenericAPIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        # MERGE: total_revenue now sourced from NFTSale.creator_earnings (primary sales)
        # This is the canonical revenue figure — what creators actually earned
        from django.db.models import DecimalField
        revenue_agg = NFTSale.objects.filter(sale_type='primary').aggregate(
            total=Sum('creator_earnings')
        )
        data = {
            'total_users': User.objects.count(),
            'total_creators': User.objects.filter(profile__status='creator').count(),
            'total_resources': Resource.objects.count(),
            'total_revenue': revenue_agg['total'] or 0,
            'total_tokens_minted': NFTToken.objects.count(),
            'open_reports': Report.objects.filter(status='open').count(),
            'pending_payouts': Payout.objects.filter(status='requested').count(),
        }
        return Response(data)