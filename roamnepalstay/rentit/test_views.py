from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny


# backend test garna ko lagii working xa ki nai bhanera
class TestAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return Response(
            {
                "message": "Backend is working perfectly!",
                "status": "success",
                "data": {
                    "server": "Django REST Framework",
                    "version": "6.0",
                    "endpoints": [
                        "/api/test/ - Test endpoint",
                        "/api/auth/register/ - User registration",
                        "/api/auth/login/ - User login",
                    ],
                },
            },
            status=status.HTTP_200_OK,
        )
