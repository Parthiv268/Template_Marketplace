import razorpay
import hmac
import hashlib
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from resources.models import Resource, Acquisition

client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))


class CreateOrderView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        resource_id = request.data.get('resource_id')
        try:
            resource = Resource.objects.get(id=resource_id, status='listed')
        except Resource.DoesNotExist:
            return Response({'error': 'Resource not found'}, status=status.HTTP_404_NOT_FOUND)

        if Acquisition.objects.filter(user=request.user, resource=resource).exists():
            return Response({'error': 'You already own this resource'}, status=status.HTTP_400_BAD_REQUEST)

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
            acquisition, created = Acquisition.objects.get_or_create(
                user=request.user,
                resource=resource
            )
            return Response({
                'success': True,
                'message': 'Payment verified. Resource added to your library.',
                'acquisition_id': acquisition.id,
                'created': created
            })
        except Resource.DoesNotExist:
            return Response(
                {'error': 'Resource not found'},
                status=status.HTTP_404_NOT_FOUND
            )