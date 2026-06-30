from django.urls import path
from .views import RegisterView
urlpatterns = [
    path('register/',RegisterView.as_view(),name='register'),
]
# .asas_view() convert the class into a function that can be called.
