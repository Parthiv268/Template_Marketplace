import razorpay
import hmac
import hashlib
import uuid
from decimal import Decimal
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from resources.models import Resource, NFTToken, NFTSale


client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))


def _mint_nft_token(resource, buyer):
    """
    Mint a new NFT token for a primary sale.
    Returns (token, sale) or raises ValueError if supply is exhausted.
    """
    if resource.tokens_minted >= resource.max_supply:
        raise ValueError(f"All {resource.max_supply} tokens for this resource have been minted.")

    # Sequential token number (1-based, unique per resource)
    token_number = resource.tokens_minted + 1

    # Simulated IPFS metadata hash: deterministic but unique per token
    raw = f"resource:{resource.id}|token:{token_number}|creator:{resource.owner.id}|{uuid.uuid4()}"
    metadata_hash = hashlib.sha256(raw.encode()).hexdigest()

    token = NFTToken.objects.create(
        resource=resource,
        owner=buyer,
        token_number=token_number,
        metadata_hash=metadata_hash,
    )

    # Primary sale: creator earns 100%, royalty = 0
    sale = NFTSale.objects.create(
        token=token,
        buyer=buyer,
        seller=resource.owner,          # creator sells directly
        original_creator=resource.owner,
        sale_type='primary',
        sale_price=resource.price,
        royalty_amount=Decimal('0'),
        seller_earnings=resource.price,  # seller == creator on primary
        creator_earnings=resource.price,
    )

    return token, sale


class CreateOrderView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        resource_id = request.data.get('resource_id')
        try:
            resource = Resource.objects.get(id=resource_id, status='listed')
        except Resource.DoesNotExist:
            return Response({'error': 'Resource not found'}, status=status.HTTP_404_NOT_FOUND)

        # MERGE: check NFTToken ownership instead of Acquisition
        # Blocks re-purchase only if user currently holds a token for this resource
        if NFTToken.objects.filter(owner=request.user, resource=resource).exists():
            return Response({'error': 'You already hold a token for this resource'}, status=status.HTTP_400_BAD_REQUEST)

        # Check NFT supply before creating an order
        if resource.tokens_minted >= resource.max_supply:
            return Response(
                {
                    'error': 'All tokens for this resource have been minted. '
                             'You can buy from the secondary market.',
                    'tokens_remaining': 0,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        if resource.is_selling_paused:
            return Response(
                {'error': 'Token selling has been temporarily paused by the creator.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        amount_paise = int(float(resource.price) * 100)

        order = client.order.create({
            'amount': amount_paise,
            'currency': 'INR',
            'payment_capture': 1
        })
        print(settings.RAZORPAY_KEY_ID)
        return Response({
            'order_id': order['id'],
            'amount': amount_paise,
            'currency': 'INR',
            'key': settings.RAZORPAY_KEY_ID,
            'resource_id': resource_id,
            'resource_title': resource.title,
            'next_token_number': resource.tokens_minted + 1,
            'max_supply': resource.max_supply,
            'tokens_remaining': resource.tokens_remaining,
        })


class VerifyPaymentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        razorpay_order_id = request.data.get('razorpay_order_id')
        razorpay_payment_id = request.data.get('razorpay_payment_id')
        razorpay_signature = request.data.get('razorpay_signature')
        resource_id = request.data.get('resource_id')

        # build the message string exactly as Razorpay specifies
        message = f"{razorpay_order_id}|{razorpay_payment_id}"

        # generate signature using your secret key
        generated_signature = hmac.new(
            key=settings.RAZORPAY_KEY_SECRET.encode('utf-8'),
            msg=message.encode('utf-8'),
            digestmod=hashlib.sha256
        ).hexdigest()

        # log both for debugging
        print(f"Generated: {generated_signature}")
        print(f"Received:  {razorpay_signature}")

        if generated_signature != razorpay_signature:
            return Response(
                {'error': 'Payment verification failed. Signatures do not match.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            resource = Resource.objects.get(id=resource_id)

            # MERGE: mint the NFT token — this IS the acquisition.
            # No separate Acquisition record is created.
            nft_token = None
            nft_sale = None
            nft_error = None
            try:
                nft_token, nft_sale = _mint_nft_token(resource, request.user)
                # Store what the buyer paid directly on the token
                nft_token.paid_amount = resource.price
                nft_token.save(update_fields=['paid_amount'])
            except ValueError as e:
                # Supply exhausted after payment (edge case: two simultaneous buyers at last token)
                nft_error = str(e)

            response_data = {
                'success': True,
                'message': 'Payment verified. Token minted and added to your collection.',
            }

            if nft_token:
                response_data['nft'] = {
                    'token_id': nft_token.id,
                    'token_number': nft_token.token_number,
                    'max_supply': resource.max_supply,
                    'metadata_hash': nft_token.metadata_hash,
                    'royalty_percent': resource.royalty_percent,
                    'is_primary_sold_out': resource.tokens_minted >= resource.max_supply,
                    'creator_earned': str(nft_sale.creator_earnings),
                }
            elif nft_error:
                response_data['nft_warning'] = nft_error

            return Response(response_data)

        except Resource.DoesNotExist:
            return Response(
                {'error': 'Resource not found'},
                status=status.HTTP_404_NOT_FOUND
            )