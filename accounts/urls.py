from django.urls import path
from .views import RegisterView,MeView
urlpatterns = [
    path('register/',RegisterView.as_view(),name='register'),
    path('me/',MeView.as_view(),name='me')
]
# .asas_view() convert the class into a function that can be called.
