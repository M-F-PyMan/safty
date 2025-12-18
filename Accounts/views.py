# accounts/views.py
from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.hashers import make_password
from .models import PasswordResetToken
from .serializers import RegisterSerializer, UserSerializer,ForgotPasswordSerializer
from django.contrib.auth.models import User
from django.core.mail import send_mail
from django.utils.crypto import get_random_string
from rest_framework import status


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username = request.data.get("username")
        email = request.data.get("email")
        password = request.data.get("password")

        # احراز هویت با username یا email
        user = authenticate(request, username=username, password=password)
        if not user:
            # اگر با username نشد، با email امتحان کن
            try:
                from django.contrib.auth.models import User
                user_obj = User.objects.get(email=email)
                user = authenticate(request, username=user_obj.username, password=password)
            except User.DoesNotExist:
                return Response({"message": "نام کاربری یا رمز عبور اشتباه است"}, status=400)

        refresh = RefreshToken.for_user(user)
        return Response({
            "token": str(refresh.access_token),
            "user": UserSerializer(user).data
        })

class LogoutView(APIView):
    permission_classes = [permissions.AllowAny]
    def post(self, request):
        refresh = RefreshToken.for_user(request.user)
        return Response({})
    def delete(self, request):
        refresh = RefreshToken.for_user(request.user)
        return Response({})
    def put(self, request):
        refresh = RefreshToken.for_user(request.user)
        return Response({})
    def patch(self, request):
        refresh = RefreshToken.for_user(request.user)
        return Response({})



# یک مدل ساده برای ذخیره توکن‌ها (اختیاری)


class ForgotPasswordView(APIView):
    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"detail": "کاربری با این ایمیل پیدا نشد."},
                            status=status.HTTP_404_NOT_FOUND)

        # تولید توکن بازیابی
        token = get_random_string(48)
        PasswordResetToken.objects.create(user=user, token=token)

        # لینک بازیابی (مثلاً /reset-password/?token=...)
        reset_link = f"{request.build_absolute_uri('/reset-password/')}?token={token}"

        # ارسال ایمیل
        send_mail(
            subject="بازیابی رمز عبور",
            message=f"برای تغییر رمز عبور روی لینک زیر کلیک کنید:\n{reset_link}",
            from_email="no-reply@example.com",
            recipient_list=[email],
            fail_silently=False,
        )

        return Response({"detail": "لینک بازیابی رمز عبور به ایمیل شما ارسال شد."},
                        status=status.HTTP_200_OK)



class ResetPasswordView(APIView):
    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        token = serializer.validated_data['token']
        new_password = serializer.validated_data['new_password']

        try:
            reset_token = PasswordResetToken.objects.get(token=token)
        except PasswordResetToken.DoesNotExist:
            return Response({"detail": "توکن معتبر نیست یا منقضی شده."},
                            status=status.HTTP_400_BAD_REQUEST)

        user = reset_token.user
        user.password = make_password(new_password)
        user.save()

        # بعد از استفاده، توکن حذف می‌شود
        reset_token.delete()

        return Response({"detail": "رمز عبور با موفقیت تغییر یافت."},
                        status=status.HTTP_200_OK)

