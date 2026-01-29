from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken


from .serializers import (
    RegisterSerializer,
    RegisterResponseSerializer,
    LoginSerializer,
)


class RegisterAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.save()
        data = RegisterResponseSerializer(user).data

        return Response(data, status=status.HTTP_201_CREATED)


# class LoginAPIView(APIView):
#     permission_classes = [AllowAny]

#     def post(self, request):
#         serializer = LoginSerializer(data=request.data)
#         serializer.is_valid(raise_exception=True)

#         user = serializer.validated_data["user"]

#         if not user.is_active:
#             return Response(
#                 {"detail": "Account is disabled."},
#                 status=status.HTTP_403_FORBIDDEN,
#             )

#         refresh = RefreshToken.for_user(user)


#         return Response(
#             {
#                 "message": "Login successful",
#                 "access": str(refresh.access_token),
#                 "refresh": str(refresh),
#                 "user": {
#                     "id": user.id,
#                     "first_name": user.first_name,
#                     "last_name": user.last_name,
#                     "email": user.email,
#                 },
#             },
#             status=status.HTTP_200_OK,
#         )
class LoginAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.validated_data["user"]

        if not user.is_active:
            return Response(
                {"detail": "Account is disabled."},
                status=status.HTTP_403_FORBIDDEN,
            )

        # Create JWT tokens
        refresh = RefreshToken.for_user(user)

        # Returning user details along with tokens
        return Response(
            {
                "message": "Login successful",
                "access": str(refresh.access_token),  # Access token
                "refresh": str(refresh),  # Refresh token
                "user": {
                    "id": user.id,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "email": user.email,
                },
            },
            status=status.HTTP_200_OK,
        )
