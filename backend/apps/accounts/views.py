from django.contrib.auth import authenticate, login, logout
from django.utils import timezone
from rest_framework import generics, status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import ActivationCode, User
from .serializers import (
    ApplicationSerializer,
    LoginSerializer,
    SignupSerializer,
    UserSerializer,
    ValidateCodeSerializer,
)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = authenticate(
            request,
            email=serializer.validated_data["email"],
            password=serializer.validated_data["password"],
        )
        if user is None:
            return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)
        login(request, user)
        return Response(UserSerializer(user).data)


class LogoutView(APIView):
    def post(self, request):
        logout(request)
        return Response({"status": "ok"})


class SignupView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = SignupSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        code_str = serializer.validated_data.get("activation_code", "")
        if not code_str:
            return Response(
                {"error": "Activation code required"}, status=status.HTTP_400_BAD_REQUEST
            )

        try:
            code = ActivationCode.objects.get(code=code_str, is_used=False)
        except ActivationCode.DoesNotExist:
            return Response(
                {"error": "Invalid or used activation code"}, status=status.HTTP_400_BAD_REQUEST
            )

        if User.objects.filter(email=serializer.validated_data["email"]).exists():
            return Response(
                {"error": "Email already registered"}, status=status.HTTP_400_BAD_REQUEST
            )

        user = User.objects.create_user(
            email=serializer.validated_data["email"],
            first_name=serializer.validated_data["first_name"],
            password=serializer.validated_data["password"],
        )

        code.is_used = True
        code.used_by = user
        code.used_at = timezone.now()
        code.save()

        from apps.members.models import MemberProfile, MemberSettings

        MemberProfile.objects.create(user=user, name=user.first_name)
        MemberSettings.objects.create(user=user)

        from apps.notifications.models import Notification

        Notification.objects.create(
            recipient=user,
            type="welcome",
            title="Welcome to Grist Club!",
            body="Start by exploring the forum, connecting with members, and RSVPing to events.",
            href="/m/home",
        )

        login(request, user)
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)


class ValidateCodeView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ValidateCodeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        exists = ActivationCode.objects.filter(
            code=serializer.validated_data["code"], is_used=False
        ).exists()
        return Response({"valid": exists})


class ApplicationCreateView(generics.CreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = ApplicationSerializer


class MeView(APIView):
    def get(self, request):
        return Response(UserSerializer(request.user).data)
