from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.viewsets import GenericViewSet
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.db.models import Count, Sum, Q, Avg
from django.contrib.auth import get_user_model
from .serializers import (
    RegisterSerializer,
    RegisterResponseSerializer,
    LoginSerializer,
    # Admin site ko serializers
    UserListSerializer,
    UserDetailSerializer,
    HostApplicationSerializer,
    ListingListSerializer,
    ListingDetailSerializer,
    BookingListSerializer,
    ReviewListSerializer,
    AdminStatsSerializer,
    ListingCreateSerializer,
    WishlistSerializer,
)
from .models import Listing, ListingImage, HostApplication, Booking, Review, Wishlist
from rest_framework import viewsets, permissions
from .permissions import IsAdminUserRole
from .utils import send_otp_email
from .serializers import VerifyOTPSerializer, ResendOTPSerializer


User = get_user_model()


class RegisterAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.save()
        try:
            send_otp_email(user)
            otp_sent = True
        except Exception:
            otp_sent = False
        user_data = RegisterResponseSerializer(user).data

        return Response(
            {
                "detail": (
                    "Registered successfully. OTP sent to your email. Please verify."
                    if otp_sent
                    else "Registered successfully, but OTP could not be sent. Please try resend OTP."
                ),
                "user": user_data,
            },
            status=status.HTTP_201_CREATED,
        )


class VerifyOTPAPIView(APIView):
    def post(self, request):
        serializer = VerifyOTPSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data["email"].strip().lower()
        otp = serializer.validated_data["otp"].strip()

        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            return Response(
                {"details": "User not found."}, status=status.HTTP_404_NOT_FOUND
            )
        if user.is_email_verified:
            return Response(
                {"details": "Email already verified."}, status=status.HTTP_200_OK
            )
        if not user.email_otp or user.email_otp != otp:
            return Response(
                {"details": "Invalid OTP."}, status=status.HTTP_400_BAD_REQUEST
            )
        # OPT EXPIRY TIME 10 MINUTES
        if (
            user.otp_created_at
            and (timezone.now() - user.otp_created_at).total_seconds() > 600
        ):
            return Response(
                {"detials": "OTP exired. Please request a new one."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        user.is_email_verified = True
        user.email_otp = None
        user.save(update_fields=["is_email_verified", "email_otp"])

        return Response(
            {"details": "Email verified successfully."}, status=status.HTTP_200_OK
        )


class ResendOTPAPIView(APIView):
    def post(self, request):
        serializer = ResendOTPSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data["email"].strip().lower()

        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            return Response(
                {"details": "User not found."}, status=status.HTTP_404_NOT_FOUND
            )
        if user.is_email_verified:
            return Response(
                {"details": "Email already verified."}, status=status.HTTP_200_OK
            )
        send_otp_email(user)
        return Response(
            {"details": "OTP resent successfully."}, status=status.HTTP_200_OK
        )


# yeslay current user ko profile data return garcha raw host status refresh garna ko lagii admin le approve garepachi
class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response(
            {
                "id": user.id,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "email": user.email,
                "is_staff": user.is_staff,
                "is_superuser": user.is_superuser,
                "is_host": user.is_host,
                "host_application_status": user.host_application_status,
                "wishlist_count": user.wishlist.count(),
            }
        )


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

        # user detials sanga tokens return garne
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
                    "host_application_status": user.host_application_status,
                },
            },
            status=status.HTTP_200_OK,
        )


# admin dashboard overview ko lagii


class AdminDashboardViewSet(GenericViewSet):
    permission_classes = [
        IsAuthenticated,
        IsAdminUserRole,
    ]  # koslay paunay admin dashboard overviews herna

    @action(detail=False, methods=["get"])
    def stats(self, request):  # Shows main dashboard statistics

        total_users = User.objects.count()
        total_hosts = User.objects.filter(is_host=True).count()
        total_listings = Listing.objects.count()
        total_bookings = Booking.objects.count()

        pending_host_applications = HostApplication.objects.filter(
            status="pending"
        ).count()
        pending_listings = Listing.objects.filter(status="pending").count()

        total_revenue = (
            Booking.objects.filter(status__in=["confirmed", "completed"]).aggregate(
                total=Sum("total_amount")
            )["total"]
            or 0
        )

        recent_bookings = Booking.objects.select_related(
            "guest", "listing", "listing__host"
        ).order_by("-created_at")[:5]

        recent_reviews = Review.objects.select_related("reviewer", "listing").order_by(
            "-created_at"
        )[:5]

        # serializer prayog garey ko data sajilo sanga handle garna ko lagii, data dictionary ma store garey
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
        }

        serializer = AdminStatsSerializer(stats_data)
        return Response(serializer.data)  # JSON format mah pathako frotend mah


# admin dashboard me user manage garnih kasari vanda name, email, role lay search gaari
class AdminUserViewSet(GenericViewSet):
    permission_classes = [IsAuthenticated, IsAdminUserRole]
    queryset = User.objects.all()

    def list(self, request):  # sabai users ko list dekhaucha
        users = (
            User.objects.select_related()
            .annotate(
                total_listings=Count("listings", distinct=True),
                total_bookings=Count("bookings", distinct=True),
            )
            .order_by("-created_at")
        )

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

        serializer = UserListSerializer(users, many=True)
        return Response(serializer.data)

    def retrieve(self, request, pk=None):  # single user full details dekhaucha
        try:
            user = User.objects.get(pk=pk)
            serializer = UserDetailSerializer(user)
            return Response(serializer.data)
        except User.DoesNotExist:
            return Response(
                {"error": "User not found"}, status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=["post"])  # user active/inactive status
    def toggle_active(self, request, pk=None):
        try:
            user = User.objects.get(pk=pk)
            user.is_active = not user.is_active
            user.save()

            return Response(
                {
                    "message": f'User {"activated" if user.is_active else "deactivated"} successfully',
                    "is_active": user.is_active,
                }
            )
        except User.DoesNotExist:
            return Response(
                {"error": "User not found"}, status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=["post"])
    def make_staff(self, request, pk=None):
        try:
            if not request.user.is_superuser:
                return Response(
                    {"error": "Only super admins can manage staff roles."},
                    status=status.HTTP_403_FORBIDDEN,
                )
            user = User.objects.get(pk=pk)
            user.is_staff = True
            user.save()

            return Response(
                {"message": "User made staff successfully", "is_staff": user.is_staff}
            )
        except User.DoesNotExist:
            return Response(
                {"error": "User not found"}, status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=["post"])
    def remove_staff(self, request, pk=None):
        try:
            if not request.user.is_superuser:
                return Response(
                    {"error": "Only super admins can manage staff roles."},
                    status=status.HTTP_403_FORBIDDEN,
                )
            user = User.objects.get(pk=pk)
            user.is_staff = False
            user.save()

            return Response(
                {
                    "message": "User staff status removed successfully",
                    "is_staff": user.is_staff,
                }
            )
        except User.DoesNotExist:
            return Response(
                {"error": "User not found"}, status=status.HTTP_404_NOT_FOUND
            )


# For managing host applications
class AdminHostApplicationViewSet(GenericViewSet):
    permission_classes = [IsAuthenticated, IsAdminUserRole]
    queryset = HostApplication.objects.all()

    def list(self, request):
        applications = HostApplication.objects.select_related("user").order_by(
            "-applied_at"
        )

        status_filter = request.query_params.get("status", "")
        if status_filter:
            applications = applications.filter(status=status_filter)

        serializer = HostApplicationSerializer(applications, many=True)
        return Response(serializer.data)

    def retrieve(self, request, pk=None):
        try:
            application = HostApplication.objects.select_related("user").get(pk=pk)
            serializer = HostApplicationSerializer(application)
            return Response(serializer.data)
        except HostApplication.DoesNotExist:
            return Response(
                {"error": "Application not found"}, status=status.HTTP_404_NOT_FOUND
            )

    # To approve or reject host applications
    @action(detail=True, methods=["post"])
    def approve(self, request, pk=None):
        try:
            application = HostApplication.objects.get(pk=pk)
            application.status = "approved"
            application.reviewed_by = request.user
            application.reviewed_at = timezone.now()
            application.review_notes = request.data.get("notes", "")
            application.save()

            # UPDATE USER STATUS
            user = application.user
            user.is_host = True
            user.host_application_status = "approved"
            user.save()

            return Response({"message": "Host application approved successfully"})
        except HostApplication.DoesNotExist:
            return Response(
                {"error": "Application not found"}, status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=["post"])
    def reject(self, request, pk=None):
        try:
            application = HostApplication.objects.get(pk=pk)
            application.status = "rejected"
            application.reviewed_by = request.user
            application.reviewed_at = timezone.now()
            application.review_notes = request.data.get("notes", "Application rejected")
            application.save()

            # Update user status
            user = application.user
            user.host_application_status = "rejected"
            user.save()

            return Response({"message": "Host application rejected successfully"})
        except HostApplication.DoesNotExist:
            return Response(
                {"error": "Application not found"}, status=status.HTTP_404_NOT_FOUND
            )


# For managing listings
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
                {"error": "Listing not found"}, status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            import traceback

            print(f"DEBUG: Error in AdminListingViewSet.retrieve: {str(e)}")
            traceback.print_exc()
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
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

            return Response({"message": "Listing approved successfully"})
        except Listing.DoesNotExist:
            return Response(
                {"error": "Listing not found"}, status=status.HTTP_404_NOT_FOUND
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

            return Response({"message": "Listing rejected successfully"})
        except Listing.DoesNotExist:
            return Response(
                {"error": "Listing not found"}, status=status.HTTP_404_NOT_FOUND
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

            return Response({"message": "Listing suspended successfully"})
        except Listing.DoesNotExist:
            return Response(
                {"error": "Listing not found"}, status=status.HTTP_404_NOT_FOUND
            )


# For managing bookings
class AdminBookingViewSet(GenericViewSet):
    permission_classes = [IsAuthenticated, IsAdminUserRole]
    queryset = Booking.objects.all()

    def list(self, request):
        bookings = Booking.objects.select_related(
            "guest", "listing", "listing__host"
        ).order_by("-created_at")

        # Filter by status
        status_filter = request.query_params.get("status", "")
        if status_filter:
            bookings = bookings.filter(status=status_filter)

        serializer = BookingListSerializer(bookings, many=True)
        return Response(serializer.data)


# For managing reviews
class AdminReviewViewSet(GenericViewSet):
    permission_classes = [IsAuthenticated, IsAdminUserRole]
    queryset = Review.objects.all()

    # Displays list of all reviews
    def list(self, request):

        reviews = Review.objects.select_related(
            "reviewer", "listing", "moderated_by"
        ).order_by("-created_at")

        # Filter by approval status
        approved = request.query_params.get("approved", "")
        if approved == "true":
            reviews = reviews.filter(is_approved=True)
        elif approved == "false":
            reviews = reviews.filter(is_approved=False)

        serializer = ReviewListSerializer(reviews, many=True)
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
                    "message": f'Review {"approved" if review.is_approved else "disapproved"} successfully',
                    "is_approved": review.is_approved,
                }
            )
        except Review.DoesNotExist:
            return Response(
                {"error": "Review not found"}, status=status.HTTP_404_NOT_FOUND
            )


# User Host Application View
class HostApplicationCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # check if already applied
        if HostApplication.objects.filter(user=request.user).exists():
            return Response(
                {"detail": "You have already submitted an application."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = HostApplicationSerializer(data=request.data)
        if serializer.is_valid():
            # Save application and update user status
            serializer.save(user=request.user)
            request.user.host_application_status = "pending"
            request.user.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ListingViewSet(GenericViewSet):
    queryset = Listing.objects.all()

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [AllowAny()]
        return [IsAuthenticated()]

    def list(self, request):
        # published listings matra dekhaucha
        listings = Listing.objects.filter(status="published").order_by("-created_at")
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
                {"error": "Listing not found"}, status=status.HTTP_404_NOT_FOUND
            )

    def create(self, request):
        # host lay matra create garnu pauxa listing
        if not request.user.is_host:
            return Response(
                {"detail": "You must be a host to create a listing."},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = ListingCreateSerializer(data=request.data)
        if serializer.is_valid():
            # suru mah pending ani approval pachi published huncha
            listing = serializer.save(host=request.user, status="pending")

            images = request.FILES.getlist("images")
            for i, image_file in enumerate(images):
                ListingImage.objects.create(
                    listing=listing,
                    image=image_file,
                    is_primary=(i == 0),
                )

            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def partial_update(self, request, pk=None):
        return self.update(request, pk)

    def update(self, request, pk=None):
        try:
            listing = Listing.objects.get(pk=pk, host=request.user)
            serializer = ListingCreateSerializer(
                listing, data=request.data, partial=True
            )
            if serializer.is_valid():
                # Any edit resets the status to pending for admin review
                listing = serializer.save(status="pending")

                # Handle new images if provided
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
                {"error": "Listing not found or you don't have permission"},
                status=status.HTTP_404_NOT_FOUND,
            )

    @action(detail=True, methods=["post"])
    def delete_image(self, request, pk=None):
        image_id = request.data.get("image_id")
        try:
            image = ListingImage.objects.get(
                id=image_id, listing_id=pk, listing__host=request.user
            )
            image.delete()
            return Response({"status": "image deleted"})
        except ListingImage.DoesNotExist:
            return Response(
                {"error": "Image not found or you don't have permission"},
                status=status.HTTP_404_NOT_FOUND,
            )

    @action(
        detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated]
    )
    def toggle_wishlist(self, request, pk=None):
        listing = self.get_object()
        wishlist_item = Wishlist.objects.filter(user=request.user, listing=listing)

        if wishlist_item.exists():
            wishlist_item.delete()
            return Response(
                {"is_wishlisted": False, "message": "Removed from wishlist"}
            )
        else:
            Wishlist.objects.create(user=request.user, listing=listing)
            return Response({"is_wishlisted": True, "message": "Added to wishlist"})

    @action(detail=False, methods=["get"])
    def my_listings(self, request):
        # List of listings owned by the current host
        listings = Listing.objects.filter(host=request.user).order_by("-created_at")
        serializer = ListingListSerializer(listings, many=True)
        return Response(serializer.data)


class WishlistViewSet(viewsets.ModelViewSet):
    serializer_class = WishlistSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Wishlist.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
