from rest_framework import serializers

from .models import Application, User


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()


class SignupSerializer(serializers.Serializer):
    first_name = serializers.CharField(max_length=100)
    email = serializers.EmailField()
    password = serializers.CharField(min_length=8)
    activation_code = serializers.CharField(required=False, allow_blank=True)


class ValidateCodeSerializer(serializers.Serializer):
    code = serializers.CharField()


class ApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Application
        fields = ["id", "full_name", "email", "address", "status", "created_at"]
        read_only_fields = ["id", "status", "created_at"]


class UserSerializer(serializers.ModelSerializer):
    profile_uid = serializers.CharField(source="profile.uid", read_only=True)

    class Meta:
        model = User
        fields = ["id", "email", "first_name", "date_joined", "profile_uid", "is_staff"]
        read_only_fields = ["id", "date_joined", "profile_uid", "is_staff"]
