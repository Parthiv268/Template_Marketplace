from django.shortcuts import render
from rest_framework import generics
from rest_framework.permissions  import AllowAny,IsAuthenticated
from .serializers import RegisterSerializer
from .serializers import ProfileSerializer
# Create your views here.
class RegisterView(generics.CreateAPIView):
    serializer_class=RegisterSerializer
    permission_classes=[AllowAny]

class MeView(generics.RetrieveAPIView):
    serializer_class=ProfileSerializer
    permission_classes=[IsAuthenticated]
    
    def get_object(self):
        return self.request.user.profile
    
    
