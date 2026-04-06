from decimal import Decimal, ROUND_HALF_UP
import base64
import hashlib
import hmac
import uuid
import requests

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.db import transaction
from django.db.models import Avg, Count, Q, Sum
from django.utils import timezone
from django.utils.http import urlencode
from .permissions import IsAdminUserRole
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import GenericViewSet
from rest_framework_simplejwt.tokens import RefreshToken
from django.db.models.functions import TruncMonth


# for pdf
import os
import io
import qrcode

from django.conf import settings
from django.http import HttpResponse
from django.utils import timezone

from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.lib.utils import simpleSplit, ImageReader

from .models import (
    Booking,
    HostApplication,
    Listing,
    ListingImage,
    PendingRegistration,
    Review,
    Wishlist,
    PlatformSetting,
    Notification,
)

from decimal import Decimal, ROUND_HALF_UP
from .permissions import IsAdminUserRole
from .serializers import (
    AdminStatsSerializer,
    BookingCreateSerializer,
    BookingDetailSerializer,
    BookingListSerializer,
    HostApplicationSerializer,
    ListingCreateSerializer,
    ListingDetailSerializer,
    ListingListSerializer,
    LoginSerializer,
    ProfileSerializer,
    RegisterResponseSerializer,
    RegisterSerializer,
    ResendOTPSerializer,
    UserDetailSerializer,
    UserListSerializer,
    VerifyOTPSerializer,
    WishlistSerializer,
    ReviewCreateSerializer,
    AdminReviewListSerializer,
    PublicReviewSerializer,
    PlatformSettingSerializer,
    ListingMapSerializer,
    NotificationSerializer,
)
from .utils import (
    generate_otp,
    send_otp_email,
    send_booking_confirmation_emails,
    create_notification,
    notify_admins,
    resolve_notification_scope,
)

User = get_user_model()


class RegisterAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data
        email = data["email"].lower()

        if User.objects.filter(email__iexact=email).exists():
            return Response(
                {"detail": "Email already exists."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if PendingRegistration.objects.filter(email__iexact=email).exists():
            PendingRegistration.objects.filter(email__iexact=email).delete()

        otp = generate_otp()

        pending_user = PendingRegistration.objects.create(
            first_name=data["first_name"],
            last_name=data["last_name"],
            email=data["email"],
            password=data["password"],
            phone_number=data.get("phone_number"),
            profile_image=data.get("profile_image"),
            date_of_birth=data.get("date_of_birth"),
            city=data.get("city"),
            country=data.get("country"),
            accepted_terms=data.get("accepted_terms"),
            email_otp=otp,
            otp_created_at=timezone.now(),
        )

        send_mail(
            subject="RoamNepalStay - Verify your email",
            message=f"Your OTP code is: {otp}\nThis code expires in 10 minutes.",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[pending_user.email],
            fail_silently=False,
        )

        return Response(
            {"detail": "OTP sent to your email. Please verify."},
            status=status.HTTP_200_OK,
        )


class VerifyOTPAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = VerifyOTPSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data["email"].strip().lower()
        otp = serializer.validated_data["otp"].strip()

        try:
            pending_user = PendingRegistration.objects.get(email__iexact=email)
        except PendingRegistration.DoesNotExist:
            return Response(
                {"detail": "No pending registration found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if not pending_user.email_otp or pending_user.email_otp != otp:
            return Response(
                {"detail": "Invalid OTP."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if (
            pending_user.otp_created_at
            and (timezone.now() - pending_user.otp_created_at).total_seconds() > 600
        ):
            return Response(
                {"detail": "OTP expired. Please request a new one."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if User.objects.filter(email__iexact=email).exists():
            pending_user.delete()
            return Response(
                {"detail": "User already exists."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = User.objects.create_user(
            email=pending_user.email,
            password=pending_user.password,
            first_name=pending_user.first_name,
            last_name=pending_user.last_name,
            phone_number=pending_user.phone_number,
            profile_image=pending_user.profile_image,
            date_of_birth=pending_user.date_of_birth,
            city=pending_user.city,
            country=pending_user.country,
            accepted_terms=pending_user.accepted_terms,
            is_email_verified=True,
        )

        pending_user.delete()

        return Response(
            {"detail": "Email verified and account created successfully."},
            status=status.HTTP_201_CREATED,
        )


class ResendOTPAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ResendOTPSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data["email"].strip().lower()

        try:
            pending_user = PendingRegistration.objects.get(email__iexact=email)
        except PendingRegistration.DoesNotExist:
            return Response(
                {"detail": "No pending registration found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        send_otp_email(pending_user)

        return Response(
            {"detail": "OTP resent successfully."},
            status=status.HTTP_200_OK,
        )


class ProfileAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = ProfileSerializer(request.user, context={"request": request})
        return Response(serializer.data)

    def patch(self, request):
        serializer = ProfileSerializer(
            request.user, data=request.data, partial=True, context={"request": request}
        )

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.validated_data["user"]  # email & password validated

        if not user.is_active:
            return Response(
                {"detail": "Account is disabled."},
                status=status.HTTP_403_FORBIDDEN,
            )

        # Superuser or staff can login without email verification
        if not (user.is_staff or user.is_superuser or user.is_email_verified):
            return Response(
                {"detail": "Email not verified. Please verify your email."},
                status=status.HTTP_403_FORBIDDEN,
            )

        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)

        return Response(
            {
                "message": "Login successful",
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": {
                    "id": user.id,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "email": user.email,
                    "is_staff": user.is_staff,
                    "is_superuser": user.is_superuser,
                    "is_host": user.is_host,
                    "is_email_verified": user.is_email_verified,
                    "host_application_status": user.host_application_status,
                },
            },
            status=status.HTTP_200_OK,
        )


class AdminDashboardViewSet(GenericViewSet):
    permission_classes = [IsAuthenticated, IsAdminUserRole]

    @action(detail=False, methods=["get"])
    def stats(self, request):
        total_users = User.objects.count()
        total_hosts = User.objects.filter(is_host=True).count()
        total_listings = Listing.objects.count()
        total_bookings = Booking.objects.count()

        pending_host_applications = HostApplication.objects.filter(
            status="pending"
        ).count()
        pending_listings = Listing.objects.filter(status="pending").count()

        # total_revenue = (
        #     Booking.objects.filter(
        #         status__in=["confirmed", "paid", "completed"]
        #     ).aggregate(total=Sum("total_amount"))["total"]
        #     or 0
        # )
        total_revenue = (
            Booking.objects.filter(
                status__in=["confirmed", "paid", "completed"]
            ).aggregate(total=Sum("superadmin_revenue"))["total"]
            or 0
        )

        recent_bookings = Booking.objects.select_related(
            "guest", "listing", "listing__host"
        ).order_by("-created_at")[:5]

        recent_reviews = Review.objects.select_related("reviewer", "listing").order_by(
            "-created_at"
        )[:5]

        # 1. Monthly bookings
        monthly_bookings_qs = (
            Booking.objects.annotate(month=TruncMonth("created_at"))
            .values("month")
            .annotate(count=Count("id"))
            .order_by("month")
        )

        monthly_bookings = [
            {
                "month": item["month"].strftime("%b"),
                "bookings": item["count"],
            }
            for item in monthly_bookings_qs
            if item["month"]
        ]

        # 2. Monthly revenue
        # monthly_revenue_qs = (
        #     Booking.objects.filter(status__in=["confirmed", "paid", "completed"])
        #     .annotate(month=TruncMonth("created_at"))
        #     .values("month")
        #     .annotate(revenue=Sum("total_amount"))
        #     .order_by("month")
        # )

        monthly_revenue_qs = (
            Booking.objects.filter(status__in=["confirmed", "paid", "completed"])
            .annotate(month=TruncMonth("created_at"))
            .values("month")
            .annotate(revenue=Sum("superadmin_revenue"))
            .order_by("month")
        )

        monthly_revenue = [
            {
                "month": item["month"].strftime("%b"),
                "revenue": float(item["revenue"] or 0),
            }
            for item in monthly_revenue_qs
            if item["month"]
        ]

        # 3. Listings by property type
        listings_by_type_qs = (
            Listing.objects.values("property_type")
            .annotate(count=Count("id"))
            .order_by("-count")
        )

        listings_by_type = [
            {
                "name": item["property_type"].replace("_", " ").title(),
                "value": item["count"],
            }
            for item in listings_by_type_qs
        ]

        # 4. Host application status
        host_application_status_qs = (
            HostApplication.objects.values("status")
            .annotate(count=Count("id"))
            .order_by("-count")
        )

        host_application_status = [
            {
                "name": item["status"].title(),
                "value": item["count"],
            }
            for item in host_application_status_qs
        ]

        stats_data = {
            "total_users": total_users,
            "total_hosts": total_hosts,
            "total_listings": total_listings,
            "total_bookings": total_bookings,
            "pending_host_applications": pending_host_applications,
            "pending_listings": pending_listings,
            "total_revenue": total_revenue,
            "recent_bookings": recent_bookings,
            "recent_reviews": recent_reviews,
            "monthly_bookings": monthly_bookings,
            "monthly_revenue": monthly_revenue,
            "listings_by_type": listings_by_type,
            "host_application_status": host_application_status,
        }

        serializer = AdminStatsSerializer(stats_data)
        return Response(serializer.data)


class AdminUserViewSet(GenericViewSet):
    permission_classes = [IsAuthenticated, IsAdminUserRole]
    queryset = User.objects.all()

    def list(self, request):
        users = User.objects.annotate(
            total_listings=Count("listings", distinct=True),
            total_bookings=Count("bookings", distinct=True),
        ).order_by("-created_at")

        search = request.query_params.get("search", "")
        if search:
            users = users.filter(
                Q(first_name__icontains=search)
                | Q(last_name__icontains=search)
                | Q(email__icontains=search)
            )

        user_type = request.query_params.get("type", "")
        if user_type == "hosts":
            users = users.filter(is_host=True)
        elif user_type == "guests":
            users = users.filter(is_host=False)

        page = self.paginate_queryset(users)
        if page is not None:
            serializer = UserListSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = UserListSerializer(users, many=True)
        return Response(serializer.data)

    def retrieve(self, request, pk=None):
        try:
            user = User.objects.get(pk=pk)
            serializer = UserDetailSerializer(user)
            return Response(serializer.data)
        except User.DoesNotExist:
            return Response(
                {"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=["post"])
    def toggle_active(self, request, pk=None):
        try:
            user = User.objects.get(pk=pk)
            user.is_active = not user.is_active
            user.save()
            return Response(
                {
                    "detail": f'User {"activated" if user.is_active else "deactivated"} successfully',
                    "is_active": user.is_active,
                }
            )
        except User.DoesNotExist:
            return Response(
                {"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=["post"])
    def make_staff(self, request, pk=None):
        try:
            if not request.user.is_superuser:
                return Response(
                    {"detail": "Only super admins can manage staff roles."},
                    status=status.HTTP_403_FORBIDDEN,
                )
            user = User.objects.get(pk=pk)
            user.is_staff = True
            user.save()
            return Response(
                {"detail": "User made staff successfully.", "is_staff": user.is_staff}
            )
        except User.DoesNotExist:
            return Response(
                {"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=["post"])
    def remove_staff(self, request, pk=None):
        try:
            if not request.user.is_superuser:
                return Response(
                    {"detail": "Only super admins can manage staff roles."},
                    status=status.HTTP_403_FORBIDDEN,
                )
            user = User.objects.get(pk=pk)
            user.is_staff = False
            user.save()
            return Response(
                {
                    "detail": "User staff status removed successfully.",
                    "is_staff": user.is_staff,
                }
            )
        except User.DoesNotExist:
            return Response(
                {"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND
            )


# class AdminHostApplicationViewSet(GenericViewSet):
#     permission_classes = [IsAuthenticated, IsAdminUserRole]
#     queryset = HostApplication.objects.all()

#     def list(self, request):
#         applications = HostApplication.objects.select_related("user").order_by(
#             "-applied_at"
#         )
#         status_filter = request.query_params.get("status", "")
#         if status_filter:
#             applications = applications.filter(status=status_filter)
#         page = self.paginate_queryset(applications)
#         if page is not None:
#             serializer = HostApplicationSerializer(page, many=True)
#             return self.get_paginated_response(serializer.data)

#         serializer = HostApplicationSerializer(applications, many=True)
#         return Response(serializer.data)

#     def retrieve(self, request, pk=None):
#         try:
#             application = HostApplication.objects.select_related("user").get(pk=pk)
#             serializer = HostApplicationSerializer(application)
#             return Response(serializer.data)
#         except HostApplication.DoesNotExist:
#             return Response(
#                 {"detail": "Application not found."}, status=status.HTTP_404_NOT_FOUND
#             )

#     @action(detail=True, methods=["post"])
#     def approve(self, request, pk=None):
#         try:
#             application = HostApplication.objects.get(pk=pk)
#             application.status = "approved"
#             application.reviewed_by = request.user
#             application.reviewed_at = timezone.now()
#             application.review_notes = request.data.get("notes", "")
#             application.save()

#             user = application.user
#             user.is_host = True
#             user.host_application_status = "approved"
#             user.save()
#             return Response({"detail": "Host application approved successfully."})
#         except HostApplication.DoesNotExist:
#             return Response(
#                 {"detail": "Application not found."}, status=status.HTTP_404_NOT_FOUND
#             )

#     @action(detail=True, methods=["post"])
#     def reject(self, request, pk=None):
#         try:
#             application = HostApplication.objects.get(pk=pk)
#             application.status = "rejected"
#             application.reviewed_by = request.user
#             application.reviewed_at = timezone.now()
#             application.review_notes = request.data.get("notes", "Application rejected")
#             application.save()


#             user = application.user
#             user.host_application_status = "rejected"
#             user.save()
#             return Response({"detail": "Host application rejected successfully."})
#         except HostApplication.DoesNotExist:
#             return Response(
#                 {"detail": "Application not found."}, status=status.HTTP_404_NOT_FOUND
#             )
class AdminHostApplicationViewSet(GenericViewSet):
    permission_classes = [IsAuthenticated, IsAdminUserRole]
    queryset = HostApplication.objects.select_related("user").all()

    def list(self, request):
        applications = HostApplication.objects.select_related("user").order_by(
            "-applied_at"
        )

        status_filter = request.query_params.get("status", "").strip()
        if status_filter:
            applications = applications.filter(status=status_filter)

        page = self.paginate_queryset(applications)
        if page is not None:
            serializer = HostApplicationSerializer(
                page, many=True, context={"request": request}
            )
            return self.get_paginated_response(serializer.data)

        serializer = HostApplicationSerializer(
            applications, many=True, context={"request": request}
        )
        return Response(serializer.data)

    def retrieve(self, request, pk=None):
        try:
            application = HostApplication.objects.select_related("user").get(pk=pk)
        except HostApplication.DoesNotExist:
            return Response(
                {"detail": "Application not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = HostApplicationSerializer(
            application, context={"request": request}
        )
        return Response(serializer.data)

    @action(detail=True, methods=["post"])
    def approve(self, request, pk=None):
        try:
            application = HostApplication.objects.select_related("user").get(pk=pk)
        except HostApplication.DoesNotExist:
            return Response(
                {"detail": "Application not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        required_checks = [
            application.phone_verified_check,
            application.identity_verified_check,
            application.property_verified_check,
            application.bank_verified_check,
        ]

        if not all(required_checks):
            return Response(
                {"detail": "Complete all verification checks before approval."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        application.status = "approved"
        application.reviewed_by = request.user
        application.reviewed_at = timezone.now()
        application.review_notes = request.data.get("notes", "")
        application.save()

        user = application.user
        user.is_host = True
        user.host_application_status = "approved"
        user.save(update_fields=["is_host", "host_application_status"])

        create_notification(
            recipient=user,
            type=Notification.Type.HOST_APPLICATION_APPROVED,
            title="Host application approved",
            message="Congratulations! Your host application has been approved. You can now add listings.",
            actor=request.user,
            priority=Notification.Priority.HIGH,
            data={
                "application_id": application.id,
                "url": "/profile",
            },
            expires_in_days=30,
        )

        return Response({"detail": "Host application approved successfully."})

    @action(detail=True, methods=["post"])
    def reject(self, request, pk=None):
        try:
            application = HostApplication.objects.select_related("user").get(pk=pk)
        except HostApplication.DoesNotExist:
            return Response(
                {"detail": "Application not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        application.status = "rejected"
        application.reviewed_by = request.user
        application.reviewed_at = timezone.now()
        application.review_notes = request.data.get("notes", "Application rejected")
        application.save()

        user = application.user
        user.is_host = False
        user.host_application_status = "rejected"
        user.save(update_fields=["is_host", "host_application_status"])

        create_notification(
            recipient=user,
            type=Notification.Type.HOST_APPLICATION_REJECTED,
            title="Host application rejected",
            message=application.review_notes or "Your host application was rejected.",
            actor=request.user,
            priority=Notification.Priority.HIGH,
            data={
                "application_id": application.id,
                "url": "/profile",
            },
            expires_in_days=30,
        )

        return Response({"detail": "Host application rejected successfully."})

    @action(detail=True, methods=["post"])
    def needs_more_info(self, request, pk=None):
        try:
            application = HostApplication.objects.select_related("user").get(pk=pk)
        except HostApplication.DoesNotExist:
            return Response(
                {"detail": "Application not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        application.status = "needs_more_info"
        application.reviewed_by = request.user
        application.reviewed_at = timezone.now()
        application.review_notes = request.data.get(
            "notes",
            "Please provide more information or clearer documents.",
        )
        application.save()

        user = application.user
        user.is_host = False
        user.host_application_status = "needs_more_info"
        user.save(update_fields=["is_host", "host_application_status"])

        create_notification(
            recipient=user,
            type=Notification.Type.HOST_APPLICATION_NEEDS_INFO,
            title="More information required",
            message=application.review_notes
            or "Please provide more information for your host application.",
            actor=request.user,
            priority=Notification.Priority.HIGH,
            data={
                "application_id": application.id,
                "url": "/profile",
            },
            expires_in_days=30,
        )

        return Response(
            {"detail": "Application marked as needs more info successfully."}
        )

    @action(detail=True, methods=["patch"])
    def update_review(self, request, pk=None):
        try:
            application = HostApplication.objects.select_related("user").get(pk=pk)
        except HostApplication.DoesNotExist:
            return Response(
                {"detail": "Application not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        allowed_fields = [
            "phone_verified_check",
            "identity_verified_check",
            "property_verified_check",
            "bank_verified_check",
            "review_notes",
        ]

        updated = False

        for field in allowed_fields:
            if field in request.data:
                setattr(application, field, request.data.get(field))
                updated = True

        if updated:
            application.reviewed_by = request.user
            application.reviewed_at = timezone.now()
            application.save()

        serializer = HostApplicationSerializer(
            application, context={"request": request}
        )
        return Response(serializer.data, status=status.HTTP_200_OK)


class AdminListingViewSet(GenericViewSet):
    permission_classes = [IsAuthenticated, IsAdminUserRole]
    queryset = Listing.objects.all()

    def list(self, request):
        listings = (
            Listing.objects.select_related("host")
            .prefetch_related("images", "bookings", "reviews")
            .annotate(
                total_bookings=Count("bookings"), average_rating=Avg("reviews__rating")
            )
            .order_by("-created_at")
        )
        search = request.query_params.get("search", "")
        if search:
            listings = listings.filter(
                Q(title__icontains=search)
                | Q(city__icontains=search)
                | Q(district__icontains=search)
            )
        status_filter = request.query_params.get("status", "")
        if status_filter:
            listings = listings.filter(status=status_filter)
        page = self.paginate_queryset(listings)
        if page is not None:
            serializer = ListingListSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = ListingListSerializer(listings, many=True)
        return Response(serializer.data)

    def retrieve(self, request, pk=None):
        try:
            listing = (
                Listing.objects.select_related("host", "moderated_by")
                .prefetch_related("images")
                .get(pk=pk)
            )
            serializer = ListingDetailSerializer(listing, context={"request": request})
            return Response(serializer.data)
        except Listing.DoesNotExist:
            return Response(
                {"detail": "Listing not found."}, status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=["post"])
    def approve(self, request, pk=None):
        try:
            listing = Listing.objects.get(pk=pk)
            listing.status = "published"
            listing.moderated_by = request.user
            listing.moderated_at = timezone.now()
            listing.moderation_reason = request.data.get("reason", "Approved by admin")
            listing.save()
            create_notification(
                recipient=listing.host,
                type=Notification.Type.LISTING_APPROVED,
                title="Listing approved",
                message=f"Your listing '{listing.title}' has been approved and published.",
                actor=request.user,
                priority=Notification.Priority.HIGH,
                data={
                    "listing_id": listing.id,
                    "url": "/my-properties",
                },
                expires_in_days=30,
            )
            return Response({"detail": "Listing approved successfully."})
        except Listing.DoesNotExist:
            return Response(
                {"detail": "Listing not found."}, status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=["post"])
    def reject(self, request, pk=None):
        try:
            listing = Listing.objects.get(pk=pk)
            listing.status = "rejected"
            listing.moderated_by = request.user
            listing.moderated_at = timezone.now()
            listing.moderation_reason = request.data.get("reason", "Rejected by admin")
            listing.save()
            create_notification(
                recipient=listing.host,
                type=Notification.Type.LISTING_REJECTED,
                title="Listing rejected",
                message=listing.moderation_reason
                or f"Your listing '{listing.title}' was rejected.",
                actor=request.user,
                priority=Notification.Priority.HIGH,
                data={
                    "listing_id": listing.id,
                    "url": "/my-properties",
                },
                expires_in_days=30,
            )
            return Response({"detail": "Listing rejected successfully."})
        except Listing.DoesNotExist:
            return Response(
                {"detail": "Listing not found."}, status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=["post"])
    def suspend(self, request, pk=None):
        try:
            listing = Listing.objects.get(pk=pk)
            listing.status = "suspended"
            listing.moderated_by = request.user
            listing.moderated_at = timezone.now()
            listing.moderation_reason = request.data.get("reason", "Suspended by admin")
            listing.save()
            create_notification(
                recipient=listing.host,
                type=Notification.Type.LISTING_SUSPENDED,
                title="Listing suspended",
                message=listing.moderation_reason
                or f"Your listing '{listing.title}' was suspended.",
                actor=request.user,
                priority=Notification.Priority.HIGH,
                data={
                    "listing_id": listing.id,
                    "url": "/my-properties",
                },
                expires_in_days=30,
            )
            return Response({"detail": "Listing suspended successfully."})
        except Listing.DoesNotExist:
            return Response(
                {"detail": "Listing not found."}, status=status.HTTP_404_NOT_FOUND
            )


class AdminBookingViewSet(GenericViewSet):
    permission_classes = [IsAuthenticated, IsAdminUserRole]
    queryset = Booking.objects.all()

    def list(self, request):
        bookings = (
            Booking.objects.select_related("guest", "listing", "listing__host")
            .exclude(status=Booking.Status.DRAFT)
            .order_by("-created_at")
        )
        status_filter = request.query_params.get("status", "")
        if status_filter:
            bookings = bookings.filter(status=status_filter)
        page = self.paginate_queryset(bookings)
        if page is not None:
            serializer = BookingDetailSerializer(
                page, many=True, context={"request": request}
            )
            return self.get_paginated_response(serializer.data)

        serializer = BookingDetailSerializer(
            bookings, many=True, context={"request": request}
        )
        return Response(serializer.data)


class AdminReviewViewSet(GenericViewSet):
    permission_classes = [IsAuthenticated, IsAdminUserRole]
    queryset = Review.objects.all()

    def list(self, request):
        reviews = Review.objects.select_related(
            "reviewer", "listing", "moderated_by"
        ).order_by("-created_at")
        approved = request.query_params.get("approved", "")
        if approved == "true":
            reviews = reviews.filter(is_approved=True)
        elif approved == "false":
            reviews = reviews.filter(is_approved=False)
        page = self.paginate_queryset(reviews)
        if page is not None:
            serializer = AdminReviewListSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = AdminReviewListSerializer(reviews, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["post"])
    def toggle_approval(self, request, pk=None):
        try:
            review = Review.objects.get(pk=pk)
            review.is_approved = not review.is_approved
            review.moderated_by = request.user
            review.save()
            return Response(
                {
                    "detail": f'Review {"approved" if review.is_approved else "disapproved"} successfully',
                    "is_approved": review.is_approved,
                }
            )
        except Review.DoesNotExist:
            return Response(
                {"detail": "Review not found."}, status=status.HTTP_404_NOT_FOUND
            )


class HostApplicationCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            application = HostApplication.objects.get(user=request.user)
            serializer = HostApplicationSerializer(
                application, context={"request": request}
            )
            return Response(serializer.data)
        except HostApplication.DoesNotExist:
            return Response(
                {"detail": "Host application not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

    def post(self, request):
        if request.user.host_application_status in ["pending", "approved"]:
            return Response(
                {"detail": "You already have an active application."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            application = HostApplication.objects.get(user=request.user)
            serializer = HostApplicationSerializer(
                application,
                data=request.data,
                partial=True,
                context={"request": request},
            )
            is_update = True
        except HostApplication.DoesNotExist:
            serializer = HostApplicationSerializer(
                data=request.data,
                context={"request": request},
            )
            is_update = False

        if serializer.is_valid():
            serializer.save()

            request.user.host_application_status = "pending"
            request.user.save(update_fields=["host_application_status"])

            application = HostApplication.objects.get(user=request.user)

            if is_update:
                notify_admins(
                    type=Notification.Type.ADMIN_HOST_APPLICATION_RESUBMITTED,
                    title="Host application updated",
                    message=f"{request.user.first_name} {request.user.last_name} updated their host application.",
                    actor=request.user,
                    priority=Notification.Priority.HIGH,
                    data={
                        "application_id": application.id,
                        "url": "/admin",
                    },
                    expires_in_days=30,
                )
            else:
                create_notification(
                    recipient=request.user,
                    type=Notification.Type.HOST_APPLICATION_SUBMITTED,
                    title="Application submitted",
                    message="Your host application has been submitted and is now under review.",
                    actor=request.user,
                    priority=Notification.Priority.MEDIUM,
                    data={
                        "application_id": application.id,
                        "url": "/profile",
                    },
                    expires_in_days=7,
                )

                notify_admins(
                    type=Notification.Type.ADMIN_NEW_HOST_APPLICATION,
                    title="New host application",
                    message=f"{request.user.first_name} {request.user.last_name} submitted a new host application.",
                    actor=request.user,
                    priority=Notification.Priority.HIGH,
                    data={
                        "application_id": application.id,
                        "url": "/admin",
                    },
                    expires_in_days=30,
                )

                return Response(
                    serializer.data,
                    status=status.HTTP_200_OK if is_update else status.HTTP_201_CREATED,
                )

            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ListingViewSet(GenericViewSet):
    queryset = Listing.objects.all()

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [AllowAny()]
        return [IsAuthenticated()]

    def list(self, request):
        listings = Listing.objects.filter(status="published").order_by("-created_at")

        search = request.query_params.get("search", "").strip()
        if search:
            listings = listings.filter(
                Q(title__icontains=search)
                | Q(city__icontains=search)
                | Q(district__icontains=search)
                | Q(region__icontains=search)
                | Q(province__icontains=search)
                | Q(category__icontains=search)
                | Q(property_type__icontains=search)
                | Q(description__icontains=search)
            )

        serializer = ListingListSerializer(
            listings, many=True, context={"request": request}
        )
        return Response(serializer.data)

    def retrieve(self, request, pk=None):
        try:
            listing = Listing.objects.get(pk=pk)
            serializer = ListingDetailSerializer(listing, context={"request": request})
            return Response(serializer.data)
        except Listing.DoesNotExist:
            return Response(
                {"detail": "Listing not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

    def create(self, request):
        if not request.user.is_host:
            return Response(
                {"detail": "You must be a host to create a listing."},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = ListingCreateSerializer(data=request.data)
        if serializer.is_valid():
            listing = serializer.save(host=request.user, status="pending")
            images = request.FILES.getlist("images")

            for i, image_file in enumerate(images):
                ListingImage.objects.create(
                    listing=listing,
                    image=image_file,
                    is_primary=(i == 0),
                )

            create_notification(
                recipient=request.user,
                type=Notification.Type.LISTING_SUBMITTED,
                title="Listing submitted",
                message=f"Your listing '{listing.title}' has been submitted for admin review.",
                actor=request.user,
                priority=Notification.Priority.MEDIUM,
                data={
                    "listing_id": listing.id,
                    "url": "/my-properties",
                },
                expires_in_days=7,
            )

            notify_admins(
                type=Notification.Type.ADMIN_NEW_LISTING_PENDING,
                title="New listing pending review",
                message=f"A new listing '{listing.title}' was submitted by {request.user.first_name} {request.user.last_name}.",
                actor=request.user,
                priority=Notification.Priority.HIGH,
                data={
                    "listing_id": listing.id,
                    "url": "/admin",
                },
                expires_in_days=30,
            )

            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, pk=None):
        try:
            listing = Listing.objects.get(pk=pk, host=request.user)
            serializer = ListingCreateSerializer(
                listing, data=request.data, partial=True
            )

            if serializer.is_valid():
                listing = serializer.save(status="pending")

                create_notification(
                    recipient=request.user,
                    type=Notification.Type.LISTING_SUBMITTED,
                    title="Listing submitted",
                    message=f"Your listing '{listing.title}' has been submitted for admin review.",
                    actor=request.user,
                    priority=Notification.Priority.MEDIUM,
                    data={
                        "listing_id": listing.id,
                        "url": "/my-properties",
                    },
                    expires_in_days=7,
                )

                notify_admins(
                    type=Notification.Type.ADMIN_NEW_LISTING_PENDING,
                    title="New listing pending review",
                    message=f"A new listing '{listing.title}' was submitted by {request.user.first_name} {request.user.last_name}.",
                    actor=request.user,
                    priority=Notification.Priority.HIGH,
                    data={
                        "listing_id": listing.id,
                        "url": "/admin",
                    },
                    expires_in_days=30,
                )

                if "images" in request.FILES:
                    images = request.FILES.getlist("images")
                    for image_file in images:
                        ListingImage.objects.create(
                            listing=listing,
                            image=image_file,
                            is_primary=False,
                        )

                return Response(serializer.data)

            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Listing.DoesNotExist:
            return Response(
                {"detail": "Listing not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

    @action(detail=True, methods=["post"])
    def delete_image(self, request, pk=None):
        image_id = request.data.get("image_id")
        try:
            image = ListingImage.objects.get(
                id=image_id,
                listing_id=pk,
                listing__host=request.user,
            )
            image.delete()
            return Response({"detail": "Image deleted successfully."})
        except ListingImage.DoesNotExist:
            return Response(
                {"detail": "Image not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated])
    def toggle_wishlist(self, request, pk=None):
        listing = self.get_object()
        wishlist_item = Wishlist.objects.filter(user=request.user, listing=listing)

        if wishlist_item.exists():
            wishlist_item.delete()
            return Response(
                {"is_wishlisted": False, "detail": "Removed from wishlist."}
            )
        else:
            Wishlist.objects.create(user=request.user, listing=listing)
            return Response({"is_wishlisted": True, "detail": "Added to wishlist."})

    @action(detail=True, methods=["get"])
    def booked_dates(self, request, pk=None):
        listing = self.get_object()
        bookings = Booking.objects.filter(
            listing=listing,
            status__in=["confirmed", "paid", "completed"],
        ).values("check_in", "check_out")
        return Response(list(bookings))

    @action(detail=False, methods=["get"])
    def my_listings(self, request):
        listings = Listing.objects.filter(host=request.user).order_by("-created_at")
        serializer = ListingListSerializer(
            listings, many=True, context={"request": request}
        )
        return Response(serializer.data)


class ListingMapAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        listings = (
            Listing.objects.filter(status="published")
            .exclude(latitude__isnull=True)
            .exclude(longitude__isnull=True)
            .order_by("-created_at")
        )

        search = request.query_params.get("search", "").strip()
        min_price = request.query_params.get("min_price")
        max_price = request.query_params.get("max_price")

        north = request.query_params.get("north")
        south = request.query_params.get("south")
        east = request.query_params.get("east")
        west = request.query_params.get("west")

        if search:
            listings = listings.filter(
                Q(title__icontains=search)
                | Q(address__icontains=search)
                | Q(city__icontains=search)
                | Q(district__icontains=search)
                | Q(province__icontains=search)
                | Q(region__icontains=search)
                | Q(property_type__icontains=search)
                | Q(category__icontains=search)
            )

        if min_price:
            listings = listings.filter(price_per_night__gte=min_price)

        if max_price:
            listings = listings.filter(price_per_night__lte=max_price)

        if north and south and east and west and not search:
            listings = listings.filter(
                latitude__lte=float(north),
                latitude__gte=float(south),
                longitude__lte=float(east),
                longitude__gte=float(west),
            )

        serializer = ListingMapSerializer(
            listings[:300], many=True, context={"request": request}
        )
        return Response(serializer.data)


class WishlistViewSet(viewsets.ModelViewSet):
    serializer_class = WishlistSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Wishlist.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


def generate_esewa_signature(total_amount, transaction_uuid, product_code):
    message = f"total_amount={total_amount},transaction_uuid={transaction_uuid},product_code={product_code}"
    secret = settings.ESEWA_SECRET_KEY.encode("utf-8")
    digest = hmac.new(secret, message.encode("utf-8"), hashlib.sha256).digest()
    signature = base64.b64encode(digest).decode("utf-8")
    return signature


from decimal import Decimal, ROUND_HALF_UP
from django.conf import settings
from django.core.mail import send_mail
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import PlatformSetting
from .serializers import BookingCreateSerializer, BookingDetailSerializer


# class BookingCreateView(APIView):
#     permission_classes = [IsAuthenticated]

#     def post(self, request):
#         serializer = BookingCreateSerializer(data=request.data)
#         serializer.is_valid(raise_exception=True)

#         listing = serializer.validated_data["listing"]
#         check_in = serializer.validated_data["check_in"]
#         check_out = serializer.validated_data["check_out"]

#         if check_out <= check_in:
#             return Response(
#                 {"detail": "Check-out date must be after check-in date."},
#                 status=status.HTTP_400_BAD_REQUEST,
#             )

#         nights = Decimal((check_out - check_in).days)

#         if nights <= 0:
#             return Response(
#                 {"detail": "Booking must be at least 1 night."},
#                 status=status.HTTP_400_BAD_REQUEST,
#             )

#         # Optional extra protection: stop host booking own property
#         if listing.host == request.user:
#             return Response(
#                 {"detail": "You cannot book your own property."},
#                 status=status.HTTP_400_BAD_REQUEST,
#             )

#         # Optional extra protection: allow only published listings
#         if getattr(listing, "status", None) != "published":
#             return Response(
#                 {"detail": "This property is not available for booking."},
#                 status=status.HTTP_400_BAD_REQUEST,
#             )

#         # Optional extra protection: prevent overlapping bookings
#         overlapping_booking_exists = listing.bookings.filter(
#             check_in__lt=check_out,
#             check_out__gt=check_in,
#             status__in=["pending", "confirmed", "paid", "completed"],
#         ).exists()

#         if overlapping_booking_exists:
#             return Response(
#                 {"detail": "Selected dates are already booked."},
#                 status=status.HTTP_400_BAD_REQUEST,
#             )

#         platform_settings = PlatformSetting.get_settings()

#         price_per_night = Decimal(listing.price_per_night).quantize(
#             Decimal("0.01"), rounding=ROUND_HALF_UP
#         )

#         room_subtotal = (price_per_night * nights).quantize(
#             Decimal("0.01"), rounding=ROUND_HALF_UP
#         )

#         cleaning_fee = Decimal(listing.cleaning_fee or 0).quantize(
#             Decimal("0.01"), rounding=ROUND_HALF_UP
#         )

#         service_fee_percent = Decimal(
#             platform_settings.service_fee_percent or 0
#         ).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

#         service_fee = ((room_subtotal * service_fee_percent) / Decimal("100")).quantize(
#             Decimal("0.01"), rounding=ROUND_HALF_UP
#         )

#         total_amount = (room_subtotal + cleaning_fee + service_fee).quantize(
#             Decimal("0.01"), rounding=ROUND_HALF_UP
#         )

#         host_payout = (room_subtotal + cleaning_fee).quantize(
#             Decimal("0.01"), rounding=ROUND_HALF_UP
#         )

#         superadmin_revenue = service_fee

#         booking = serializer.save(
#             guest=request.user,
#             room_subtotal=room_subtotal,
#             cleaning_fee=cleaning_fee,
#             service_fee=service_fee,
#             total_amount=total_amount,
#             host_payout=host_payout,
#             superadmin_revenue=superadmin_revenue,
#             status=Booking.Status.DRAFT,
#             payment_status=Booking.PaymentStatus.UNPAID,
#         )
#         create_notification(
#             recipient=request.user,
#             type=Notification.Type.BOOKING_CREATED,
#             title="Booking created",
#             message=f"Your booking for '{listing.title}' has been created. Please complete payment to confirm it.",
#             actor=request.user,
#             priority=Notification.Priority.MEDIUM,
#             data={
#                 "booking_id": booking.id,
#                 "listing_id": listing.id,
#                 "url": "/my-bookings",
#             },
#             expires_in_days=3,
#         )


#         create_notification(
#             recipient=listing.host,
#             type=Notification.Type.BOOKING_CREATED,
#             title="New booking created",
#             message=f"{request.user.first_name} {request.user.last_name} created a booking for '{listing.title}'.",
#             actor=request.user,
#             priority=Notification.Priority.HIGH,
#             data={
#                 "booking_id": booking.id,
#                 "listing_id": listing.id,
#                 "url": "/host/dashboard",
#             },
#             expires_in_days=7,
#         )
#         return Response(
#             BookingDetailSerializer(booking, context={"request": request}).data,
#             status=status.HTTP_201_CREATED,
#         )
class BookingCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = BookingCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        listing = serializer.validated_data["listing"]
        check_in = serializer.validated_data["check_in"]
        check_out = serializer.validated_data["check_out"]

        if check_out <= check_in:
            return Response(
                {"detail": "Check-out date must be after check-in date."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        nights = Decimal((check_out - check_in).days)

        if nights <= 0:
            return Response(
                {"detail": "Booking must be at least 1 night."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if listing.host == request.user:
            return Response(
                {"detail": "You cannot book your own property."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if getattr(listing, "status", None) != "published":
            return Response(
                {"detail": "This property is not available for booking."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        overlapping_booking_exists = listing.bookings.filter(
            check_in__lt=check_out,
            check_out__gt=check_in,
            status__in=["confirmed", "paid", "completed"],
        ).exists()

        if overlapping_booking_exists:
            return Response(
                {"detail": "Selected dates are already booked."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        platform_settings = PlatformSetting.get_settings()

        price_per_night = Decimal(listing.price_per_night).quantize(
            Decimal("0.01"), rounding=ROUND_HALF_UP
        )

        room_subtotal = (price_per_night * nights).quantize(
            Decimal("0.01"), rounding=ROUND_HALF_UP
        )

        cleaning_fee = Decimal(listing.cleaning_fee or 0).quantize(
            Decimal("0.01"), rounding=ROUND_HALF_UP
        )

        service_fee_percent = Decimal(
            platform_settings.service_fee_percent or 0
        ).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

        service_fee = ((room_subtotal * service_fee_percent) / Decimal("100")).quantize(
            Decimal("0.01"), rounding=ROUND_HALF_UP
        )

        total_amount = (room_subtotal + cleaning_fee + service_fee).quantize(
            Decimal("0.01"), rounding=ROUND_HALF_UP
        )

        host_payout = (room_subtotal + cleaning_fee).quantize(
            Decimal("0.01"), rounding=ROUND_HALF_UP
        )

        superadmin_revenue = service_fee

        booking = serializer.save(
            guest=request.user,
            room_subtotal=room_subtotal,
            cleaning_fee=cleaning_fee,
            service_fee=service_fee,
            total_amount=total_amount,
            host_payout=host_payout,
            superadmin_revenue=superadmin_revenue,
            status=Booking.Status.DRAFT,
            payment_status=Booking.PaymentStatus.UNPAID,
        )

        # create_notification(
        #     recipient=request.user,
        #     type=Notification.Type.BOOKING_CREATED,
        #     title="Booking created",
        #     message=f"Your booking for '{listing.title}' has been created. Please complete payment to confirm it.",
        #     actor=request.user,
        #     priority=Notification.Priority.MEDIUM,
        #     data={
        #         "booking_id": booking.id,
        #         "listing_id": listing.id,
        #         "url": "/my-bookings",
        #     },
        #     expires_in_days=3,
        # )

        # create_notification(
        #     recipient=listing.host,
        #     type=Notification.Type.BOOKING_CREATED,
        #     title="New booking created",
        #     message=f"{request.user.first_name} {request.user.last_name} created a booking for '{listing.title}'.",
        #     actor=request.user,
        #     priority=Notification.Priority.HIGH,
        #     data={
        #         "booking_id": booking.id,
        #         "listing_id": listing.id,
        #         "url": "/host/dashboard",
        #     },
        #     expires_in_days=7,
        # )

        return Response(
            BookingDetailSerializer(booking, context={"request": request}).data,
            status=status.HTTP_201_CREATED,
        )


# class BookingListView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         bookings = Booking.objects.filter(guest=request.user).order_by("-created_at")
#         serializer = BookingDetailSerializer(
#             bookings, many=True, context={"request": request}
#         )
#         return Response(serializer.data)


class BookingListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        Booking.objects.filter(
            guest=request.user,
            check_out__lt=timezone.now().date(),
            status__in=["confirmed", "paid"],
        ).update(status="completed")

        bookings = Booking.objects.filter(guest=request.user).exclude(
            status=Booking.Status.DRAFT
        )
        serializer = BookingDetailSerializer(
            bookings, many=True, context={"request": request}
        )
        return Response(serializer.data)


class BookingsDetailsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            booking = Booking.objects.get(pk=pk, guest=request.user)
            serializer = BookingDetailSerializer(booking, context={"request": request})
            return Response(serializer.data)
        except Booking.DoesNotExist:
            return Response(
                {"detail": "Booking not found."}, status=status.HTTP_404_NOT_FOUND
            )


class BookingReviewCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, booking_id):
        try:
            booking = Booking.objects.get(pk=booking_id, guest=request.user)
        except Booking.DoesNotExist:
            return Response(
                {"detail": "Booking not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        data = request.data.copy()
        data["booking"] = booking.id

        serializer = ReviewCreateSerializer(
            data=data,
            context={"request": request},
        )

        if serializer.is_valid():
            review = serializer.save()
            create_notification(
                recipient=booking.listing.host,
                type=Notification.Type.REVIEW_RECEIVED,
                title="New review received",
                message=f"You received a new review for '{booking.listing.title}'.",
                actor=request.user,
                priority=Notification.Priority.MEDIUM,
                data={
                    "booking_id": booking.id,
                    "listing_id": booking.listing.id,
                    "url": "/host/dashboard",
                },
                expires_in_days=14,
            )
            return Response(
                {
                    "detail": "Review submitted successfully.",
                    "review": PublicReviewSerializer(
                        review, context={"request": request}
                    ).data,
                },
                status=status.HTTP_201_CREATED,
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class HostBookingViewSet(GenericViewSet):
    permission_classes = [IsAuthenticated]

    def list(self, request):
        bookings = (
            Booking.objects.filter(listing__host=request.user)
            .exclude(status=Booking.Status.DRAFT)
            .order_by("-created_at")
        )
        status_filter = request.query_params.get("status", "")
        if status_filter:
            bookings = bookings.filter(status=status_filter)
        serializer = BookingDetailSerializer(
            bookings, many=True, context={"request": request}
        )
        return Response(serializer.data)


class CashInHandBookingView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, booking_id):
        try:
            booking = Booking.objects.get(pk=booking_id, guest=request.user)
        except Booking.DoesNotExist:
            return Response(
                {"detail": "Booking not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if booking.payment_status == "paid":
            return Response(
                {"detail": "This booking is already paid."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if booking.status in ["cancelled", "completed"]:
            return Response(
                {"detail": f"Cannot update payment for a {booking.status} booking."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        booking.payment_method = Booking.PaymentMethod.CASH_IN_HAND
        booking.payment_status = Booking.PaymentStatus.UNPAID
        booking.status = Booking.Status.CONFIRMED
        booking.save()
        create_notification(
            recipient=booking.guest,
            type=Notification.Type.CASH_IN_HAND_SELECTED,
            title="Cash in hand selected",
            message=f"Your booking for '{booking.listing.title}' is confirmed with cash in hand payment.",
            actor=request.user,
            priority=Notification.Priority.MEDIUM,
            data={
                "booking_id": booking.id,
                "url": "/my-bookings",
            },
            expires_in_days=7,
        )

        create_notification(
            recipient=booking.listing.host,
            type=Notification.Type.CASH_IN_HAND_SELECTED,
            title="Cash payment booking confirmed",
            message=f"A guest selected cash in hand for booking '{booking.listing.title}'.",
            actor=request.user,
            priority=Notification.Priority.HIGH,
            data={
                "booking_id": booking.id,
                "url": "/host/dashboard",
            },
            expires_in_days=30,
        )

        create_notification(
            recipient=booking.guest,
            type=Notification.Type.BOOKING_CONFIRMED,
            title="Booking confirmed",
            message=f"Your booking for '{booking.listing.title}' is confirmed.",
            actor=request.user,
            priority=Notification.Priority.HIGH,
            data={
                "booking_id": booking.id,
                "url": "/my-bookings",
            },
            expires_in_days=30,
        )

        send_booking_confirmation_emails(booking)

        return Response(
            {
                "detail": "Cash in hand selected successfully.",
                "booking": BookingDetailSerializer(
                    booking, context={"request": request}
                ).data,
            },
            status=status.HTTP_200_OK,
        )


# class KhaltiInitiateView(APIView):
#     permission_classes = [IsAuthenticated]

#     def post(self, request, booking_id):
#         try:
#             booking = Booking.objects.get(pk=booking_id, guest=request.user)
#         except Booking.DoesNotExist:
#             return Response(
#                 {"detail": "Booking not found."},
#                 status=status.HTTP_404_NOT_FOUND,
#             )

#         if booking.payment_status == "paid":
#             return Response(
#                 {"detail": "This booking is already paid."},
#                 status=status.HTTP_400_BAD_REQUEST,
#             )

#         if booking.status in ["cancelled", "completed"]:
#             return Response(
#                 {"detail": f"Cannot pay for a booking that is {booking.status}."},
#                 status=status.HTTP_400_BAD_REQUEST,
#             )

#         amount_in_paisa = int(float(booking.total_amount) * 100)

#         payload = {
#             "return_url": f"{settings.FRONTEND_URL}/booking/payment-success/?provider=khalti",
#             "website_url": settings.FRONTEND_URL,
#             "amount": amount_in_paisa,
#             "purchase_order_id": str(booking.id),
#             "purchase_order_name": f"Booking for {booking.listing.title}",
#             "customer_info": {
#                 "name": f"{request.user.first_name} {request.user.last_name}",
#                 "email": request.user.email,
#                 "phone": request.user.phone_number or "9800000000",
#             },
#         }

#         headers = {
#             "Authorization": f"Key {settings.KHALTI_SECRET_KEY}",
#             "Content-Type": "application/json",
#         }

#         try:
#             response = requests.post(
#                 settings.KHALTI_INITIATE_URL,
#                 json=payload,
#                 headers=headers,
#                 timeout=30,
#             )
#             khalti_data = response.json()

#             if response.status_code == 200:
#                 booking.khalti_token = khalti_data.get("pidx")
#                 booking.payment_method = Booking.PaymentMethod.KHALTI
#                 booking.save()

#                 return Response(
#                     {
#                         "payment_url": khalti_data.get("payment_url"),
#                         "pidx": khalti_data.get("pidx"),
#                         "booking_id": booking.id,
#                     }
#                 )

#             return Response(
#                 {
#                     "detail": "Failed to initiate Khalti payment.",
#                     "khalti_details": khalti_data,
#                 },
#                 status=status.HTTP_400_BAD_REQUEST,
#             )

#         except Exception as e:
#             return Response(
#                 {"detail": f"Khalti payment error: {str(e)}"},
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR,
#             )


class KhaltiInitiateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, booking_id):
        try:
            booking = Booking.objects.get(pk=booking_id, guest=request.user)
        except Booking.DoesNotExist:
            return Response(
                {"detail": "Booking not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if booking.payment_status == Booking.PaymentStatus.PAID:
            return Response(
                {"detail": "This booking is already paid."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if booking.status in [Booking.Status.CANCELLED, Booking.Status.COMPLETED]:
            return Response(
                {"detail": f"Cannot pay for a booking that is {booking.status}."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        amount_in_paisa = int(
            (Decimal(booking.total_amount).quantize(Decimal("0.01")) * 100)
        )

        payload = {
            "return_url": f"{settings.FRONTEND_URL}/booking/payment-success/?provider=khalti&booking_id={booking.id}",
            "website_url": settings.FRONTEND_URL,
            "amount": amount_in_paisa,
            "purchase_order_id": str(booking.id),
            "purchase_order_name": f"Booking #{booking.id} - {booking.listing.title}",
            "customer_info": {
                "name": f"{request.user.first_name} {request.user.last_name}".strip(),
                "email": request.user.email,
                "phone": request.user.phone_number or "9800000000",
            },
        }

        headers = {
            "Authorization": f"Key {settings.KHALTI_SECRET_KEY}",
            "Content-Type": "application/json",
        }

        try:
            response = requests.post(
                settings.KHALTI_INITIATE_URL,
                json=payload,
                headers=headers,
                timeout=30,
            )

            khalti_data = response.json()

            if response.status_code == 200 and khalti_data.get("pidx"):
                booking.khalti_token = khalti_data.get("pidx")
                booking.payment_method = Booking.PaymentMethod.KHALTI
                booking.payment_status = Booking.PaymentStatus.UNPAID
                booking.save(
                    update_fields=[
                        "khalti_token",
                        "payment_method",
                        "payment_status",
                        "updated_at",
                    ]
                )

                return Response(
                    {
                        "payment_url": khalti_data.get("payment_url"),
                        "pidx": khalti_data.get("pidx"),
                        "booking_id": booking.id,
                    },
                    status=status.HTTP_200_OK,
                )

            return Response(
                {
                    "detail": "Failed to initiate Khalti payment.",
                    "khalti_details": khalti_data,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        except requests.RequestException as e:
            return Response(
                {"detail": f"Khalti payment error: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class KhaltiVerifyView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        pidx = request.data.get("pidx")
        booking_id = request.data.get("booking_id")

        if not pidx or not booking_id:
            return Response(
                {"detail": "pidx and booking_id are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            booking = Booking.objects.get(pk=booking_id, guest=request.user)
        except Booking.DoesNotExist:
            return Response(
                {"detail": "Booking not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if booking.khalti_token and booking.khalti_token != pidx:
            return Response(
                {"detail": "Invalid payment reference for this booking."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Prevent duplicate verification and duplicate notifications
        if (
            booking.payment_status == Booking.PaymentStatus.PAID
            and booking.status == Booking.Status.CONFIRMED
        ):
            return Response(
                {
                    "detail": "Payment already verified.",
                    "booking": BookingDetailSerializer(
                        booking, context={"request": request}
                    ).data,
                },
                status=status.HTTP_200_OK,
            )

        headers = {
            "Authorization": f"Key {settings.KHALTI_SECRET_KEY}",
            "Content-Type": "application/json",
        }

        try:
            response = requests.post(
                settings.KHALTI_VERIFY_URL,
                json={"pidx": pidx},
                headers=headers,
                timeout=30,
            )

            khalti_data = response.json()

            expected_amount = int(
                (Decimal(booking.total_amount).quantize(Decimal("0.01")) * 100)
            )
            khalti_amount = int(khalti_data.get("total_amount") or 0)

            if (
                response.status_code == 200
                and khalti_data.get("status") == "Completed"
                and khalti_amount == expected_amount
            ):
                booking.payment_status = Booking.PaymentStatus.PAID
                booking.status = Booking.Status.CONFIRMED
                booking.payment_method = Booking.PaymentMethod.KHALTI
                booking.khalti_token = pidx
                booking.khalti_transaction_id = (
                    khalti_data.get("transaction_id")
                    or khalti_data.get("txnId")
                    or khalti_data.get("tidx")
                )
                booking.paid_at = timezone.now()
                booking.save()

                create_notification(
                    recipient=booking.guest,
                    type=Notification.Type.BOOKING_PAID,
                    title="Payment successful",
                    message=f"Your payment for '{booking.listing.title}' was successful and your booking is confirmed.",
                    actor=request.user,
                    priority=Notification.Priority.HIGH,
                    data={
                        "booking_id": booking.id,
                        "url": "/my-bookings",
                    },
                    expires_in_days=7,
                )

                create_notification(
                    recipient=booking.listing.host,
                    type=Notification.Type.BOOKING_PAID,
                    title="Guest payment received",
                    message=f"Payment has been completed for booking '{booking.listing.title}'.",
                    actor=booking.guest,
                    priority=Notification.Priority.HIGH,
                    data={
                        "booking_id": booking.id,
                        "url": "/host/dashboard",
                    },
                    expires_in_days=7,
                )

                notify_admins(
                    type=Notification.Type.BOOKING_CONFIRMED,
                    title="Booking payment completed",
                    message=f"Payment and confirmation completed for '{booking.listing.title}'.",
                    actor=booking.guest,
                    priority=Notification.Priority.HIGH,
                    data={
                        "booking_id": booking.id,
                        "listing_id": booking.listing.id,
                        "url": "/admin/dashboard",
                    },
                    expires_in_days=30,
                )

                send_booking_confirmation_emails(booking)

                return Response(
                    {
                        "detail": "Khalti payment verified successfully.",
                        "booking": BookingDetailSerializer(
                            booking, context={"request": request}
                        ).data,
                    },
                    status=status.HTTP_200_OK,
                )

            booking.payment_status = Booking.PaymentStatus.FAILED
            booking.save(update_fields=["payment_status", "updated_at"])

            create_notification(
                recipient=booking.guest,
                type=Notification.Type.BOOKING_PAYMENT_FAILED,
                title="Payment failed",
                message=f"Your Khalti payment for '{booking.listing.title}' could not be verified.",
                actor=request.user,
                priority=Notification.Priority.HIGH,
                data={
                    "booking_id": booking.id,
                    "url": "/my-bookings",
                },
                expires_in_days=7,
            )

            notify_admins(
                type=Notification.Type.ADMIN_PAYMENT_FAILED,
                title="Payment verification failed",
                message=f"Khalti verification failed for booking #{booking.id}.",
                actor=request.user,
                priority=Notification.Priority.HIGH,
                data={
                    "booking_id": booking.id,
                    "url": "/admin",
                },
                expires_in_days=30,
            )

            return Response(
                {
                    "detail": "Khalti payment verification failed.",
                    "khalti_details": khalti_data,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        except requests.RequestException as e:
            return Response(
                {"detail": f"Khalti verification error: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class EsewaInitiateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, booking_id):
        try:
            booking = Booking.objects.get(pk=booking_id, guest=request.user)
        except Booking.DoesNotExist:
            return Response(
                {"detail": "Booking not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if booking.payment_status == "paid":
            return Response(
                {"detail": "This booking is already paid."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if booking.status in ["cancelled", "completed"]:
            return Response(
                {"detail": f"Cannot pay for a booking that is {booking.status}."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        transaction_uuid = str(uuid.uuid4())

        # very important: use clean 2-decimal total_amount consistently
        total_amount = str(
            Decimal(booking.total_amount).quantize(
                Decimal("0.01"), rounding=ROUND_HALF_UP
            )
        )

        product_code = settings.ESEWA_PRODUCT_CODE.strip()

        signature = generate_esewa_signature(
            total_amount=total_amount,
            transaction_uuid=transaction_uuid,
            product_code=product_code,
        )

        booking.payment_method = Booking.PaymentMethod.ESEWA
        booking.esewa_transaction_uuid = transaction_uuid
        booking.save()

        success_url = (
            f"{settings.FRONTEND_URL}/booking/payment-success/esewa/{booking.id}/"
        )
        failure_url = (
            f"{settings.FRONTEND_URL}/booking/payment-failed/esewa/{booking.id}/"
        )

        fields = {
            "amount": total_amount,
            "tax_amount": "0",
            "total_amount": total_amount,
            "transaction_uuid": transaction_uuid,
            "product_code": product_code,
            "product_service_charge": "0",
            "product_delivery_charge": "0",
            "success_url": success_url,
            "failure_url": failure_url,
            "signed_field_names": "total_amount,transaction_uuid,product_code",
            "signature": signature,
        }

        return Response(
            {
                "form_url": settings.ESEWA_FORM_URL,
                "fields": fields,
                "debug": {
                    "message_used_for_signature": f"total_amount={total_amount},transaction_uuid={transaction_uuid},product_code={product_code}",
                    "signature": signature,
                },
            },
            status=status.HTTP_200_OK,
        )


from decimal import Decimal, ROUND_HALF_UP


# class EsewaVerifyView(APIView):
#     permission_classes = [IsAuthenticated]

#     def post(self, request):
#         booking_id = request.data.get("booking_id")

#         if not booking_id:
#             return Response(
#                 {"detail": "booking_id is required."},
#                 status=status.HTTP_400_BAD_REQUEST,
#             )

#         try:
#             booking = Booking.objects.get(pk=booking_id, guest=request.user)
#         except Booking.DoesNotExist:
#             return Response(
#                 {"detail": "Booking not found."},
#                 status=status.HTTP_404_NOT_FOUND,
#             )

#         if not booking.esewa_transaction_uuid:
#             return Response(
#                 {"detail": "eSewa transaction UUID not found for this booking."},
#                 status=status.HTTP_400_BAD_REQUEST,
#             )

#         total_amount = str(
#             Decimal(booking.total_amount).quantize(
#                 Decimal("0.01"), rounding=ROUND_HALF_UP
#             )
#         )

#         params = {
#             "product_code": settings.ESEWA_PRODUCT_CODE.strip(),
#             "total_amount": total_amount,
#             "transaction_uuid": booking.esewa_transaction_uuid,
#         }

#         try:
#             response = requests.get(
#                 settings.ESEWA_STATUS_CHECK_URL,
#                 params=params,
#                 timeout=30,
#             )
#             esewa_data = response.json()

#             if response.status_code == 200 and esewa_data.get("status") == "COMPLETE":
#                 booking.payment_status = Booking.PaymentStatus.PAID
#                 booking.status = Booking.Status.CONFIRMED
#                 booking.payment_method = Booking.PaymentMethod.ESEWA
#                 booking.esewa_ref_id = esewa_data.get("ref_id") or esewa_data.get(
#                     "transaction_code"
#                 )
#                 booking.paid_at = timezone.now()
#                 booking.save()
#                 create_notification(
#                     recipient=booking.guest,
#                     type=Notification.Type.BOOKING_PAID,
#                     title="Payment successful",
#                     message=f"Your Khalti payment for '{booking.listing.title}' was successful.",
#                     actor=request.user,
#                     priority=Notification.Priority.HIGH,
#                     data={
#                         "booking_id": booking.id,
#                         "url": "/my-bookings",
#                     },
#                     expires_in_days=30,
#                 )

#                 create_notification(
#                     recipient=booking.listing.host,
#                     type=Notification.Type.BOOKING_PAID,
#                     title="Guest payment received",
#                     message=f"Payment has been completed for booking '{booking.listing.title}'.",
#                     actor=booking.guest,
#                     priority=Notification.Priority.HIGH,
#                     data={
#                         "booking_id": booking.id,
#                         "url": "/host/dashboard",
#                     },
#                     expires_in_days=30,
#                 )

#                 create_notification(
#                     recipient=booking.guest,
#                     type=Notification.Type.BOOKING_CONFIRMED,
#                     title="Booking confirmed",
#                     message=f"Your booking for '{booking.listing.title}' is confirmed.",
#                     actor=request.user,
#                     priority=Notification.Priority.HIGH,
#                     data={
#                         "booking_id": booking.id,
#                         "url": "/my-bookings",
#                     },
#                     expires_in_days=30,
#                 )

#                 send_booking_confirmation_emails(booking)

#                 return Response(
#                     {
#                         "detail": "eSewa payment verified successfully.",
#                         "booking": BookingDetailSerializer(
#                             booking, context={"request": request}
#                         ).data,
#                     }
#                 )

#             booking.payment_status = Booking.PaymentStatus.FAILED
#             booking.save()
#             create_notification(
#                 recipient=booking.guest,
#                 type=Notification.Type.BOOKING_PAYMENT_FAILED,
#                 title="Payment failed",
#                 message=f"Your Esewa payment for '{booking.listing.title}' could not be verified.",
#                 actor=request.user,
#                 priority=Notification.Priority.HIGH,
#                 data={
#                     "booking_id": booking.id,
#                     "url": "/my-bookings",
#                 },
#                 expires_in_days=7,
#             )

#             notify_admins(
#                 type=Notification.Type.ADMIN_PAYMENT_FAILED,
#                 title="Payment verification failed",
#                 message=f"Esewa verification failed for booking #{booking.id}.",
#                 actor=request.user,
#                 priority=Notification.Priority.HIGH,
#                 data={
#                     "booking_id": booking.id,
#                     "url": "/admin",
#                 },
#                 expires_in_days=30,
#             )

#             return Response(
#                 {
#                     "detail": "eSewa payment verification failed.",
#                     "esewa_details": esewa_data,
#                 },
#                 status=status.HTTP_400_BAD_REQUEST,
#             )

#         except Exception as e:
#             return Response(
#                 {"detail": f"eSewa verification error: {str(e)}"},
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR,
#             )


class CancelBookingView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, booking_id):
        try:
            booking = Booking.objects.get(pk=booking_id, guest=request.user)
        except Booking.DoesNotExist:
            return Response(
                {"detail": "Booking not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if booking.status == Booking.Status.CANCELLED:
            return Response(
                {"detail": "Booking is already cancelled."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if booking.status == Booking.Status.COMPLETED:
            return Response(
                {"detail": "Completed booking cannot be cancelled."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        booking.status = Booking.Status.CANCELLED

        if booking.payment_status == Booking.PaymentStatus.PAID:
            booking.payment_status = Booking.PaymentStatus.PAID
        else:
            booking.payment_status = Booking.PaymentStatus.FAILED

        booking.save()
        create_notification(
            recipient=booking.guest,
            type=Notification.Type.BOOKING_CANCELLED,
            title="Booking cancelled",
            message=f"Your booking for '{booking.listing.title}' was cancelled successfully.",
            actor=request.user,
            priority=Notification.Priority.HIGH,
            data={
                "booking_id": booking.id,
                "url": "/my-bookings",
            },
            expires_in_days=30,
        )

        create_notification(
            recipient=booking.listing.host,
            type=Notification.Type.BOOKING_CANCELLED,
            title="Booking cancelled by guest",
            message=f"A guest cancelled booking for '{booking.listing.title}'.",
            actor=request.user,
            priority=Notification.Priority.HIGH,
            data={
                "booking_id": booking.id,
                "url": "/host/dashboard",
            },
            expires_in_days=30,
        )

        return Response(
            {
                "detail": "Booking cancelled successfully.",
                "booking": BookingDetailSerializer(
                    booking, context={"request": request}
                ).data,
            },
            status=status.HTTP_200_OK,
        )


class EsewaVerifyView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        booking_id = request.data.get("booking_id")

        if not booking_id:
            return Response(
                {"detail": "booking_id is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            booking = Booking.objects.get(pk=booking_id, guest=request.user)
        except Booking.DoesNotExist:
            return Response(
                {"detail": "Booking not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if not booking.esewa_transaction_uuid:
            return Response(
                {"detail": "eSewa transaction UUID not found for this booking."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Prevent duplicate verification and duplicate notifications
        if (
            booking.payment_status == Booking.PaymentStatus.PAID
            and booking.status == Booking.Status.CONFIRMED
        ):
            return Response(
                {
                    "detail": "Payment already verified.",
                    "booking": BookingDetailSerializer(
                        booking, context={"request": request}
                    ).data,
                },
                status=status.HTTP_200_OK,
            )

        total_amount = str(
            Decimal(booking.total_amount).quantize(
                Decimal("0.01"), rounding=ROUND_HALF_UP
            )
        )

        params = {
            "product_code": settings.ESEWA_PRODUCT_CODE.strip(),
            "total_amount": total_amount,
            "transaction_uuid": booking.esewa_transaction_uuid,
        }

        try:
            response = requests.get(
                settings.ESEWA_STATUS_CHECK_URL,
                params=params,
                timeout=30,
            )
            esewa_data = response.json()

            if response.status_code == 200 and esewa_data.get("status") == "COMPLETE":
                booking.payment_status = Booking.PaymentStatus.PAID
                booking.status = Booking.Status.CONFIRMED
                booking.payment_method = Booking.PaymentMethod.ESEWA
                booking.esewa_ref_id = esewa_data.get("ref_id") or esewa_data.get(
                    "transaction_code"
                )
                booking.paid_at = timezone.now()
                booking.save()

                create_notification(
                    recipient=booking.guest,
                    type=Notification.Type.BOOKING_PAID,
                    title="Payment successful",
                    message=f"Your eSewa payment for '{booking.listing.title}' was successful.",
                    actor=request.user,
                    priority=Notification.Priority.HIGH,
                    data={
                        "booking_id": booking.id,
                        "url": "/my-bookings",
                    },
                    expires_in_days=30,
                )

                create_notification(
                    recipient=booking.listing.host,
                    type=Notification.Type.BOOKING_PAID,
                    title="Guest payment received",
                    message=f"Payment has been completed for booking '{booking.listing.title}'.",
                    actor=booking.guest,
                    priority=Notification.Priority.HIGH,
                    data={
                        "booking_id": booking.id,
                        "url": "/host/dashboard",
                    },
                    expires_in_days=30,
                )

                create_notification(
                    recipient=booking.guest,
                    type=Notification.Type.BOOKING_CONFIRMED,
                    title="Booking confirmed",
                    message=f"Your booking for '{booking.listing.title}' is confirmed.",
                    actor=request.user,
                    priority=Notification.Priority.HIGH,
                    data={
                        "booking_id": booking.id,
                        "url": "/my-bookings",
                    },
                    expires_in_days=30,
                )

                notify_admins(
                    type=Notification.Type.BOOKING_CONFIRMED,
                    title="Booking payment completed",
                    message=f"Payment and confirmation completed for '{booking.listing.title}'.",
                    actor=booking.guest,
                    priority=Notification.Priority.HIGH,
                    data={
                        "booking_id": booking.id,
                        "listing_id": booking.listing.id,
                        "url": "/admin/dashboard",
                    },
                    expires_in_days=30,
                )

                send_booking_confirmation_emails(booking)

                return Response(
                    {
                        "detail": "eSewa payment verified successfully.",
                        "booking": BookingDetailSerializer(
                            booking, context={"request": request}
                        ).data,
                    },
                    status=status.HTTP_200_OK,
                )

            booking.payment_status = Booking.PaymentStatus.FAILED
            booking.save(update_fields=["payment_status", "updated_at"])

            create_notification(
                recipient=booking.guest,
                type=Notification.Type.BOOKING_PAYMENT_FAILED,
                title="Payment failed",
                message=f"Your eSewa payment for '{booking.listing.title}' could not be verified.",
                actor=request.user,
                priority=Notification.Priority.HIGH,
                data={
                    "booking_id": booking.id,
                    "url": "/my-bookings",
                },
                expires_in_days=7,
            )

            notify_admins(
                type=Notification.Type.ADMIN_PAYMENT_FAILED,
                title="Payment verification failed",
                message=f"Esewa verification failed for booking #{booking.id}.",
                actor=request.user,
                priority=Notification.Priority.HIGH,
                data={
                    "booking_id": booking.id,
                    "url": "/admin",
                },
                expires_in_days=30,
            )

            return Response(
                {
                    "detail": "eSewa payment verification failed.",
                    "esewa_details": esewa_data,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        except Exception as e:
            return Response(
                {"detail": f"eSewa verification error: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class BookingReceiptPDFView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, booking_id):
        try:
            booking = Booking.objects.get(pk=booking_id, guest=request.user)
        except Booking.DoesNotExist:
            return Response(
                {"detail": "Booking not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        response = HttpResponse(content_type="application/pdf")
        response["Content-Disposition"] = (
            f'attachment; filename="booking_receipt_{booking.id}.pdf"'
        )

        p = canvas.Canvas(response, pagesize=A4)
        width, height = A4

        # ---------- helper functions ----------
        def draw_text(x, y, text, font="Helvetica", size=11, color=colors.black):
            p.setFillColor(color)
            p.setFont(font, size)
            p.drawString(x, y, str(text))

        def draw_right_text(x, y, text, font="Helvetica", size=11, color=colors.black):
            p.setFillColor(color)
            p.setFont(font, size)
            p.drawRightString(x, y, str(text))

        def draw_line(y, color=colors.HexColor("#D9E2EC")):
            p.setStrokeColor(color)
            p.setLineWidth(1)
            p.line(50, y, width - 50, y)

        def draw_box(x, y, w, h, fill=colors.white, stroke=colors.HexColor("#D9E2EC")):
            p.setFillColor(fill)
            p.setStrokeColor(stroke)
            p.roundRect(x, y, w, h, 8, fill=1, stroke=1)

        def ensure_space(current_y, needed_height, bottom_limit=85):
            """
            If remaining space is too small, create a new page.
            Returns a safe y position.
            """
            if current_y - needed_height < bottom_limit:
                p.showPage()
                return height - 60
            return current_y

        # ---------- colors ----------
        primary = colors.HexColor("#1F6F8B")
        dark = colors.HexColor("#102A43")
        light_bg = colors.HexColor("#F7FAFC")
        muted = colors.HexColor("#486581")
        success = colors.HexColor("#2F855A")
        border = colors.HexColor("#D9E2EC")

        created_year = (
            booking.created_at.year if booking.created_at else timezone.now().year
        )
        invoice_number = f"RNS-{created_year}-{booking.id:04d}"

        # ---------- header / logo ----------
        logo_x = 50
        logo_y = height - 95
        logo_w = 70
        logo_h = 50

        logo_path = os.path.join(settings.BASE_DIR, "media", "mainlogo.png")
        if not os.path.exists(logo_path):
            logo_path = os.path.join(settings.BASE_DIR, "media", "mainlogo.jpg")

        if os.path.exists(logo_path):
            try:
                logo = ImageReader(logo_path)
                p.drawImage(
                    logo,
                    logo_x,
                    logo_y,
                    width=logo_w,
                    height=logo_h,
                    preserveAspectRatio=True,
                    mask="auto",
                )
            except Exception:
                draw_box(logo_x, logo_y, logo_w, logo_h, fill=colors.white)
                draw_text(logo_x + 14, logo_y + 18, "LOGO", "Helvetica-Bold", 12, muted)
        else:
            draw_box(logo_x, logo_y, logo_w, logo_h, fill=colors.white)
            draw_text(logo_x + 14, logo_y + 18, "LOGO", "Helvetica-Bold", 12, muted)

        draw_text(135, height - 55, "RoamNepalStay", "Helvetica-Bold", 24, primary)
        draw_text(135, height - 78, "Booking Receipt", "Helvetica", 13, muted)

        draw_right_text(
            width - 50, height - 50, invoice_number, "Helvetica-Bold", 16, dark
        )
        draw_right_text(
            width - 50,
            height - 72,
            f"Generated: {timezone.now().strftime('%Y-%m-%d %H:%M')}",
            "Helvetica",
            11,
            muted,
        )

        draw_line(height - 108)

        # ---------- summary box ----------
        summary_y = height - 205
        draw_box(50, summary_y, width - 100, 78, fill=light_bg)

        draw_text(65, summary_y + 50, "Property", "Helvetica-Bold", 11, muted)
        draw_text(65, summary_y + 28, booking.listing.title, "Helvetica-Bold", 14, dark)

        draw_text(320, summary_y + 50, "Location", "Helvetica-Bold", 11, muted)
        draw_text(
            320,
            summary_y + 28,
            f"{booking.listing.city}, {booking.listing.country}",
            "Helvetica",
            12,
            dark,
        )

        y = summary_y - 35

        # ---------- guest info ----------
        draw_text(50, y, "Guest Information", "Helvetica-Bold", 15, primary)
        draw_line(y - 8)

        y -= 34
        label_x = 55
        value_x = 185
        row_gap = 20

        guest_name = f"{booking.guest.first_name} {booking.guest.last_name}".strip()
        if not guest_name:
            guest_name = booking.guest.username

        guest_info = [
            ("Guest Name", guest_name),
            ("Email", booking.guest.email),
            ("Check-in", booking.check_in),
            ("Check-out", booking.check_out),
            ("Guests", booking.guests_count),
            ("Booking Status", booking.status.title()),
            ("Payment Status", booking.payment_status.title()),
            (
                "Payment Method",
                (
                    booking.payment_method.replace("_", " ").title()
                    if booking.payment_method
                    else "Not selected"
                ),
            ),
        ]

        for label, value in guest_info:
            draw_text(label_x, y, f"{label}:", "Helvetica-Bold", 11, dark)
            draw_text(value_x, y, value, "Helvetica", 11, muted)
            y -= row_gap

        # ---------- host info ----------
        y -= 8
        draw_text(50, y, "Host Information", "Helvetica-Bold", 15, primary)
        draw_line(y - 8)

        y -= 34

        host = booking.listing.host
        host_name = f"{host.first_name} {host.last_name}".strip()
        if not host_name:
            host_name = host.username

        host_phone = getattr(host, "phone_number", "") or "Not available"

        host_info = [
            ("Host Name", host_name),
            ("Host Email", host.email),
            ("Host Contact", host_phone),
        ]

        for label, value in host_info:
            draw_text(label_x, y, f"{label}:", "Helvetica-Bold", 11, dark)
            draw_text(value_x, y, value, "Helvetica", 11, muted)
            y -= row_gap

        # ---------- payment details ----------
        y -= 8
        draw_text(50, y, "Payment Details", "Helvetica-Bold", 15, primary)
        draw_line(y - 8)

        y -= 36

        table_x = 55
        table_w = width - 110
        row_h = 28

        p.setFillColor(primary)
        p.roundRect(table_x, y, table_w, row_h, 6, fill=1, stroke=0)
        draw_text(
            table_x + 12, y + 9, "Description", "Helvetica-Bold", 11, colors.white
        )
        draw_right_text(
            table_x + table_w - 12,
            y + 9,
            "Amount (Rs.)",
            "Helvetica-Bold",
            11,
            colors.white,
        )

        y -= row_h

        room_charge = booking.total_amount - booking.cleaning_fee - booking.service_fee

        items = [
            ("Room Charge", f"{room_charge:.2f}"),
            ("Cleaning Fee", f"{booking.cleaning_fee:.2f}"),
            ("Service Fee", f"{booking.service_fee:.2f}"),
        ]

        for index, (desc, amount) in enumerate(items):
            fill_color = colors.white if index % 2 == 0 else light_bg
            p.setFillColor(fill_color)
            p.setStrokeColor(border)
            p.rect(table_x, y, table_w, row_h, fill=1, stroke=1)

            draw_text(table_x + 12, y + 9, desc, "Helvetica", 11, dark)
            draw_right_text(
                table_x + table_w - 12, y + 9, amount, "Helvetica", 11, dark
            )

            y -= row_h

        p.setFillColor(colors.HexColor("#E6FFFA"))
        p.setStrokeColor(colors.HexColor("#B2F5EA"))
        p.rect(table_x, y, table_w, row_h + 4, fill=1, stroke=1)

        draw_text(table_x + 12, y + 11, "Total Amount", "Helvetica-Bold", 12, success)
        draw_right_text(
            table_x + table_w - 12,
            y + 11,
            f"{booking.total_amount:.2f}",
            "Helvetica-Bold",
            12,
            success,
        )

        y -= 46

        paid_text = (
            booking.paid_at.strftime("%Y-%m-%d %H:%M")
            if booking.paid_at
            else "Not paid yet"
        )
        draw_text(50, y, "Payment Time:", "Helvetica-Bold", 11, dark)
        draw_text(150, y, paid_text, "Helvetica", 11, muted)

        # ---------- special requests + QR block ----------
        y -= 38
        y = ensure_space(y, 180)

        draw_text(50, y, "Special Requests", "Helvetica-Bold", 15, primary)
        draw_line(y - 8)

        y -= 28

        special_requests = (
            booking.special_requests
            if booking.special_requests
            else "No special requests provided."
        )

        # LEFT BOX WIDTH and QR WIDTH
        qr_size = 90
        qr_gap = 24
        left_box_x = 50
        left_box_w = width - 100 - qr_size - qr_gap - 20

        wrapped_lines = simpleSplit(special_requests, "Helvetica", 11, left_box_w - 24)
        req_box_height = max(70, 24 + len(wrapped_lines) * 16)

        req_box_y = y - req_box_height + 10
        draw_box(left_box_x, req_box_y, left_box_w, req_box_height, fill=light_bg)

        text_y = y - 8
        for line in wrapped_lines:
            draw_text(left_box_x + 12, text_y, line, "Helvetica", 11, muted)
            text_y -= 16

        # QR on right side, aligned with requests box
        qr_data = (
            f"RoamNepalStay Receipt\n"
            f"Invoice: {invoice_number}\n"
            f"Booking ID: {booking.id}\n"
            f"Guest: {guest_name}\n"
            f"Property: {booking.listing.title}\n"
            f"Amount: Rs. {booking.total_amount:.2f}\n"
            f"Status: {booking.payment_status.title()}\n"
        )

        qr = qrcode.QRCode(version=1, box_size=4, border=1)
        qr.add_data(qr_data)
        qr.make(fit=True)

        qr_img = qr.make_image(fill_color="black", back_color="white")
        qr_buffer = io.BytesIO()
        qr_img.save(qr_buffer, format="PNG")
        qr_buffer.seek(0)
        qr_reader = ImageReader(qr_buffer)

        qr_x = left_box_x + left_box_w + qr_gap
        qr_y = req_box_y + max(0, (req_box_height - qr_size) / 2)

        p.drawImage(
            qr_reader,
            qr_x,
            qr_y,
            width=qr_size,
            height=qr_size,
            mask="auto",
        )

        draw_text(qr_x, qr_y - 14, "Scan receipt QR", "Helvetica", 10, muted)

        # ---------- footer ----------
        footer_y = 48
        draw_line(footer_y + 26, color=colors.HexColor("#BCCCDC"))
        draw_text(
            50,
            footer_y + 8,
            "Thank you for booking with RoamNepalStay.",
            "Helvetica-Bold",
            11,
            primary,
        )
        draw_right_text(
            width - 50,
            footer_y + 8,
            "This is a system-generated receipt.",
            "Helvetica",
            10,
            muted,
        )

        p.showPage()
        p.save()
        return response


class PlatformSettingAPIView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUserRole]

    def get(self, request):
        settings_obj = PlatformSetting.get_settings()
        serializer = PlatformSettingSerializer(settings_obj)
        return Response(serializer.data)

    def patch(self, request):
        if not request.user.is_superuser:
            return Response(
                {"detail": "Only superadmin can update platform settings."},
                status=status.HTTP_403_FORBIDDEN,
            )

        settings_obj = PlatformSetting.get_settings()
        serializer = PlatformSettingSerializer(
            settings_obj, data=request.data, partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


# net number to host direcly
class HostAnalyticsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        bookings = Booking.objects.filter(listing__host=request.user)

        total_bookings = bookings.count()
        paid_bookings = bookings.filter(payment_status="paid").count()
        unpaid_bookings = bookings.exclude(payment_status="paid").count()

        gross_guest_total = bookings.filter(payment_status="paid").aggregate(
            total=Sum("total_amount")
        )["total"] or Decimal("0.00")

        total_host_payout = bookings.filter(payment_status="paid").aggregate(
            total=Sum("host_payout")
        )["total"] or Decimal("0.00")

        total_platform_fee = bookings.filter(payment_status="paid").aggregate(
            total=Sum("superadmin_revenue")
        )["total"] or Decimal("0.00")

        property_counts = (
            bookings.values("listing__title")
            .annotate(count=Count("id"))
            .order_by("-count")
        )

        if property_counts:
            most_booked_property = property_counts[0]["listing__title"]
        else:
            most_booked_property = "No bookings yet"

        return Response(
            {
                "total_bookings": total_bookings,
                "paid_bookings": paid_bookings,
                "unpaid_bookings": unpaid_bookings,
                "gross_guest_total": gross_guest_total,
                "host_net_revenue": total_host_payout,
                "platform_revenue": total_platform_fee,
                "most_booked_property": most_booked_property,
            }
        )


# check out page lay dynamically handke garnu


class PublicPlatformFeeAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        settings_obj = PlatformSetting.get_settings()
        return Response({"service_fee_percent": settings_obj.service_fee_percent})


class AIHomeChatAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        message = (request.data.get("message") or "").strip().lower()

        if not message:
            return Response(
                {
                    "reply": "Tell me what kind of trip you want, and I’ll suggest a place in Nepal.",
                    "suggested_place": "",
                    "button_text": "",
                }
            )

        # Peaceful / romantic / lake / mountain
        if any(
            word in message
            for word in [
                "peaceful",
                "calm",
                "quiet",
                "romantic",
                "couple",
                "lake",
                "mountain",
                "view",
                "relax",
                "sunrise",
            ]
        ):
            return Response(
                {
                    "reply": "Pokhara is a great choice for a peaceful trip with lake views, mountain scenery, and relaxing stays.",
                    "suggested_place": "Pokhara",
                    "button_text": "Explore Pokhara",
                }
            )

        # Jungle / wildlife / safari / nature
        if any(
            word in message
            for word in ["jungle", "wildlife", "safari", "forest", "nature", "animal"]
        ):
            return Response(
                {
                    "reply": "Chitwan is perfect for jungle stays, wildlife experiences, and nature-focused travel.",
                    "suggested_place": "Chitwan",
                    "button_text": "Explore Chitwan",
                }
            )

        # Trekking / hiking / hills / adventure
        if any(
            word in message
            for word in ["trek", "trekking", "hike", "hiking", "adventure", "trail"]
        ):
            return Response(
                {
                    "reply": "Kori Hill is a beautiful option for a scenic trekking experience with mountain views and peaceful trails.",
                    "suggested_place": "Kori Hill",
                    "button_text": "Explore Kori Hill",
                }
            )

        # Culture / heritage / temples
        if any(
            word in message
            for word in [
                "culture",
                "heritage",
                "temple",
                "history",
                "old city",
                "traditional",
            ]
        ):
            return Response(
                {
                    "reply": "Bhaktapur is a wonderful destination for culture, heritage, temples, and traditional local experience.",
                    "suggested_place": "Bhaktapur",
                    "button_text": "Explore Bhaktapur",
                }
            )

        # Short trip / weekend / near kathmandu
        if any(
            word in message
            for word in [
                "weekend",
                "short trip",
                "near kathmandu",
                "close",
                "1 day",
                "2 day",
            ]
        ):
            return Response(
                {
                    "reply": "Nagarkot is a lovely option for a short and peaceful getaway with hill views and sunrise spots.",
                    "suggested_place": "Nagarkot",
                    "button_text": "Explore Nagarkot",
                }
            )

        # Budget trip
        if any(
            word in message
            for word in ["cheap", "budget", "low cost", "affordable", "save money"]
        ):
            return Response(
                {
                    "reply": "Pokhara is a strong budget-friendly option with many affordable stays and beautiful scenery.",
                    "suggested_place": "Pokhara",
                    "button_text": "Explore Pokhara",
                }
            )

        # Family trip
        if any(word in message for word in ["family", "kids", "children", "parents"]):
            return Response(
                {
                    "reply": "Pokhara is a family-friendly destination with relaxing stays, sightseeing, and easy travel options.",
                    "suggested_place": "Pokhara",
                    "button_text": "Explore Pokhara",
                }
            )

        # Default fallback
        return Response(
            {
                "reply": "Pokhara is a great all-round destination with beautiful scenery, relaxing stays, and something for most travelers.",
                "suggested_place": "Pokhara",
                "button_text": "Explore Pokhara",
            }
        )


class NotificationListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        now = timezone.now()

        notifications_qs = Notification.objects.filter(recipient=request.user).filter(
            Q(expires_at__isnull=True) | Q(expires_at__gt=now)
        )

        scope = request.query_params.get("scope", "").strip().lower()
        unread_only = request.query_params.get("unread_only", "").strip().lower()
        limit = request.query_params.get("limit")

        if scope in {"guest", "host", "admin"}:
            notifications_qs = notifications_qs.filter(data__scope=scope)

        if unread_only == "true":
            notifications_qs = notifications_qs.filter(is_read=False)

        unread_count_qs = Notification.objects.filter(
            recipient=request.user,
            is_read=False,
        ).filter(Q(expires_at__isnull=True) | Q(expires_at__gt=now))

        if scope in {"guest", "host", "admin"}:
            unread_count_qs = unread_count_qs.filter(data__scope=scope)

        unread_count = unread_count_qs.count()

        notifications_qs = notifications_qs.order_by("-created_at")

        if limit:
            try:
                limit = int(limit)
                if limit > 0:
                    notifications_qs = notifications_qs[:limit]
            except (ValueError, TypeError):
                pass

        serializer = NotificationSerializer(notifications_qs, many=True)

        return Response(
            {
                "count": len(serializer.data),
                "unread_count": unread_count,
                "results": serializer.data,
            },
            status=status.HTTP_200_OK,
        )


class NotificationMarkReadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, notification_id):
        try:
            notification = Notification.objects.get(
                id=notification_id,
                recipient=request.user,
            )
        except Notification.DoesNotExist:
            return Response(
                {"detail": "Notification not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if not notification.is_read:
            notification.is_read = True
            notification.read_at = timezone.now()
            notification.save(update_fields=["is_read", "read_at"])

        return Response({"detail": "Notification marked as read."})


class NotificationMarkAllReadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        scope = request.query_params.get("scope", "").strip().lower()

        notifications = Notification.objects.filter(
            recipient=request.user,
            is_read=False,
        )

        if scope in {"guest", "host", "admin"}:
            notification_ids = [
                notification.id
                for notification in notifications
                if resolve_notification_scope(notification.type, notification.data)
                == scope
            ]

            if notification_ids:
                Notification.objects.filter(id__in=notification_ids).update(
                    is_read=True,
                    read_at=timezone.now(),
                )
        else:
            notifications.update(is_read=True, read_at=timezone.now())

        return Response({"detail": "All notifications marked as read."})


class NotificationDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, notification_id):
        try:
            notification = Notification.objects.get(
                id=notification_id,
                recipient=request.user,
            )
        except Notification.DoesNotExist:
            return Response(
                {"detail": "Notification not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        notification.delete()
        return Response({"detail": "Notification deleted successfully."})
