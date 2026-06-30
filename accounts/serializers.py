from rest_framework import serializers
from django.contrib.auth.models import User

class RegisterSerializer(serializers.ModelSerializer):
    password=serializers.CharField(write_only=True)
    # means password is accepted but will never go out
    class Meta:
        model=User
        fields=['username','email','password']
    def create(self,validated_data):
        user=User.objects.create_user(
                username=validated_data['username'],
                email=validated_data.get('email',''),
                # it basically searches for email and if not provided inserts an empty string.
                password=validated_data['password'] 
                )
        return user