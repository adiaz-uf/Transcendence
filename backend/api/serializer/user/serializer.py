from rest_framework import serializers
from api.models import UserProfile

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = [ 
            "id",
            "email", 
            "username", 
            "given_name", 
            "surname",
            "last_active",
            "password",
            "is_42user",
            "is_2fa_enabled",
            "totp_secret"]
        extra_kwargs = {"password": {"write_only": True}}       #Write only means this field wont be returned and cant be read be users
        
    def create(self, validated_data):                       
        user = UserProfile.objects.create_user(
            username=validated_data["username"],
            password=validated_data["password"],
            email=validated_data.get("email", ""),
            given_name=validated_data.get("given_name", ""),
            surname=validated_data.get("surname", ""),
            is_42user=validated_data.get("is_42user", False)
        )       #This data is then stored in a user and returned, this def is created in CustomUserManager
        return user

# Secondary Representation of UserProfile
class UserProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ["email", "username", "given_name", "surname", "password"]
        extra_kwargs = {
            "password": {"write_only": True, "required": False},  # Password shouldn't be readable
            "email": {"required": False},
            "username": {"required": False},
        }

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        """Update user profile details safely."""
        
        # Update fields if provided
        if "email" in validated_data:
            instance.email = validated_data["email"]

        if "username" in validated_data:
            instance.username = validated_data["username"]

        if "password" in validated_data:
            instance.set_password(password)
        
        instance.save()  # Save the updated instance
        return instance