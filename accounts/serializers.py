from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password 
from .models import Profile
class RegisterSerializer(serializers.ModelSerializer):
    password=serializers.CharField(write_only=True,validators=[validate_password])
    # means password is accepted but will never go out

    email=serializers.EmailField(required=True)
    #email field cant be empty and is in format


    #for unique email id of every login user
    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value
    
    #for unique username and check it should be atleast of three characters
    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("This username is already taken.")
        if len(value) < 3:
            raise serializers.ValidationError("Username must be at least 3 characters.")
        return value
    

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
class ProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)
    is_staff = serializers.BooleanField(source='user.is_staff', read_only=True)

    class Meta:
        model = Profile
        fields = ['username', 'email', 'status', 'bio', 'profile_picture', 'is_staff']
        read_only_fields = ['status', 'is_staff']
    