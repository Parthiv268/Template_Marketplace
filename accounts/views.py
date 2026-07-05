from django.shortcuts import render
from rest_framework import generics
from rest_framework.permissions  import AllowAny,IsAuthenticated
from .serializers import RegisterSerializer
from .serializers import ProfileSerializer
from rest_framework.parsers import MultiPartParser,FormParser


# Create your views here.
class RegisterView(generics.CreateAPIView):
    serializer_class=RegisterSerializer
    permission_classes=[AllowAny]

#RetrieveUpdateAPIview is a generice view allows you to do get(fetch profile) andput,patch(update profile) single handedly
class MeView(generics.RetrieveUpdateAPIView):
    serializer_class=ProfileSerializer
    permission_classes=[IsAuthenticated]

    #parsers tells the DRF also to accept multipart/form-data(generally used for other file(jpeg uploads))
    #cause DRF by default only accepts json data
    parser_classes = [MultiPartParser, FormParser]

    def get_object(self):
        return self.request.user.profile
    
