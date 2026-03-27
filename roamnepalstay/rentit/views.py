from decimal import Decimal
import requests
from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.db import transaction
from django.db.models import Avg, Count, Q, Sum
from django.utils import timezone
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import GenericViewSet
from rest_framework_simplejwt.tokens import RefreshToken

from .models import (
    Booking,
    HostApplication,
    Listing,
    ListingImage,
    PendingRegistration,
    Review,
    Wishlist,
)
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
    ReviewListSerializer,
    UserDetailSerializer,
    UserListSerializer,
    VerifyOTPSerializer,
    WishlistSerializer,
)
from .utils import generate_otp, send_otp_email

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

        pending_host_applications = HostApplication.objects.filter(status="pending").count()
        pending_listings = Listing.objects.filter(status="pending").count()

        total_revenue = (
            Booking.objects.filter(status__in=["confirmed", "paid", "completed"]).aggregate(
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
        return Response(serializer.data)


class AdminUserViewSet(GenericViewSet):
    permission_classes = [IsAuthenticated, IsAdminUserRole]
    queryset = User.objects.all()

    def list(self, request):
        users = (
            User.objects.annotate(
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

    def retrieve(self, request, pk=None):
        try:
            user = User.objects.get(pk=pk)
            serializer = UserDetailSerializer(user)
            return Response(serializer.data)
        except User.DoesNotExist:
            return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)

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
            return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)

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
            return Response({"detail": "User made staff successfully.", "is_staff": user.is_staff})
        except User.DoesNotExist:
            return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)

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
                {"detail": "User staff status removed successfully.", "is_staff": user.is_staff}
            )
        except User.DoesNotExist:
            return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)


class AdminHostApplicationViewSet(GenericViewSet):
    permission_classes = [IsAuthenticated, IsAdminUserRole]
    queryset = HostApplication.objects.all()

    def list(self, request):
        applications = HostApplication.objects.select_related("user").order_by("-applied_at")
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
                {"detail": "Application not found."}, status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=["post"])
    def approve(self, request, pk=None):
        try:
            application = HostApplication.objects.get(pk=pk)
            application.status = "approved"
            application.reviewed_by = request.user
            application.reviewed_at = timezone.now()
            application.review_notes = request.data.get("notes", "")
            application.save()

            user = application.user
            user.is_host = True
            user.host_application_status = "approved"
            user.save()
            return Response({"detail": "Host application approved successfully."})
        except HostApplication.DoesNotExist:
            return Response(
                {"detail": "Application not found."}, status=status.HTTP_404_NOT_FOUND
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

            user = application.user
            user.host_application_status = "rejected"
            user.save()
            return Response({"detail": "Host application rejected successfully."})
        except HostApplication.DoesNotExist:
            return Response(
                {"detail": "Application not found."}, status=status.HTTP_404_NOT_FOUND
            )


class AdminListingViewSet(GenericViewSet):
    permission_classes = [IsAuthenticated, IsAdminUserRole]
    queryset = Listing.objects.all()

    def list(self, request):
        listings = (
            Listing.objects.select_related("host")
            .prefetch_related("images", "bookings", "reviews")
            .annotate(total_bookings=Count("bookings"), average_rating=Avg("reviews__rating"))
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
            listing = Listing.objects.select_related("host", "moderated_by").prefetch_related("images").get(pk=pk)
            serializer = ListingDetailSerializer(listing, context={"request": request})
            return Response(serializer.data)
        except Listing.DoesNotExist:
            return Response({"detail": "Listing not found."}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=["post"])
    def approve(self, request, pk=None):
        try:
            listing = Listing.objects.get(pk=pk)
            listing.status = "published"
            listing.moderated_by = request.user
            listing.moderated_at = timezone.now()
            listing.moderation_reason = request.data.get("reason", "Approved by admin")
            listing.save()
            return Response({"detail": "Listing approved successfully."})
        except Listing.DoesNotExist:
            return Response({"detail": "Listing not found."}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=["post"])
    def reject(self, request, pk=None):
        try:
            listing = Listing.objects.get(pk=pk)
            listing.status = "rejected"
            listing.moderated_by = request.user
            listing.moderated_at = timezone.now()
            listing.moderation_reason = request.data.get("reason", "Rejected by admin")
            listing.save()
            return Response({"detail": "Listing rejected successfully."})
        except Listing.DoesNotExist:
            return Response({"detail": "Listing not found."}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=["post"])
    def suspend(self, request, pk=None):
        try:
            listing = Listing.objects.get(pk=pk)
            listing.status = "suspended"
            listing.moderated_by = request.user
            listing.moderated_at = timezone.now()
            listing.moderation_reason = request.data.get("reason", "Suspended by admin")
            listing.save()
            return Response({"detail": "Listing suspended successfully."})
        except Listing.DoesNotExist:
            return Response({"detail": "Listing not found."}, status=status.HTTP_404_NOT_FOUND)


class AdminBookingViewSet(GenericViewSet):
    permission_classes = [IsAuthenticated, IsAdminUserRole]
    queryset = Booking.objects.all()

    def list(self, request):
        bookings = Booking.objects.select_related("guest", "listing", "listing__host").order_by("-created_at")
        status_filter = request.query_params.get("status", "")
        if status_filter:
            bookings = bookings.filter(status=status_filter)
        serializer = BookingDetailSerializer(bookings, many=True, context={"request": request})
        return Response(serializer.data)


class AdminReviewViewSet(GenericViewSet):
    permission_classes = [IsAuthenticated, IsAdminUserRole]
    queryset = Review.objects.all()

    def list(self, request):
        reviews = Review.objects.select_related("reviewer", "listing", "moderated_by").order_by("-created_at")
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
                    "detail": f'Review {"approved" if review.is_approved else "disapproved"} successfully',
                    "is_approved": review.is_approved,
                }
            )
        except Review.DoesNotExist:
            return Response({"detail": "Review not found."}, status=status.HTTP_404_NOT_FOUND)


class HostApplicationCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if HostApplication.objects.filter(user=request.user).exists():
            return Response(
                {"detail": "You have already submitted an application."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        serializer = HostApplicationSerializer(data=request.data)
        if serializer.is_valid():
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
        listings = Listing.objects.filter(status="published").order_by("-created_at")
        serializer = ListingListSerializer(listings, many=True, context={"request": request})
        return Response(serializer.data)

    def retrieve(self, request, pk=None):
        try:
            listing = Listing.objects.get(pk=pk)
            serializer = ListingDetailSerializer(listing, context={"request": request})
            return Response(serializer.data)
        except Listing.DoesNotExist:
            return Response({"detail": "Listing not found."}, status=status.HTTP_404_NOT_FOUND)

    def create(self, request):
        if not request.user.is_host:
            return Response(
                {"detail": "You must be a host to create a listing."}, status=status.HTTP_403_FORBIDDEN
            )
        serializer = ListingCreateSerializer(data=request.data)
        if serializer.is_valid():
            listing = serializer.save(host=request.user, status="pending")
            images = request.FILES.getlist("images")
            for i, image_file in enumerate(images):
                ListingImage.objects.create(listing=listing, image=image_file, is_primary=(i == 0))
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, pk=None):
        try:
            listing = Listing.objects.get(pk=pk, host=request.user)
            serializer = ListingCreateSerializer(listing, data=request.data, partial=True)
            if serializer.is_valid():
                listing = serializer.save(status="pending")
                if "images" in request.FILES:
                    images = request.FILES.getlist("images")
                    for image_file in images:
                        ListingImage.objects.create(listing=listing, image=image_file, is_primary=False)
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Listing.DoesNotExist:
            return Response({"detail": "Listing not found."}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=["post"])
    def delete_image(self, request, pk=None):
        image_id = request.data.get("image_id")
        try:
            image = ListingImage.objects.get(id=image_id, listing_id=pk, listing__host=request.user)
            image.delete()
            return Response({"detail": "Image deleted successfully."})
        except ListingImage.DoesNotExist:
            return Response({"detail": "Image not found."}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated])
    def toggle_wishlist(self, request, pk=None):
        listing = self.get_object()
        wishlist_item = Wishlist.objects.filter(user=request.user, listing=listing)
        if wishlist_item.exists():
            wishlist_item.delete()
            return Response({"is_wishlisted": False, "detail": "Removed from wishlist."})
        else:
            Wishlist.objects.create(user=request.user, listing=listing)
            return Response({"is_wishlisted": True, "detail": "Added to wishlist."})

    @action(detail=False, methods=["get"])
    def my_listings(self, request):
        listings = Listing.objects.filter(host=request.user).order_by("-created_at")
        serializer = ListingListSerializer(listings, many=True, context={"request": request})
        return Response(serializer.data)


class WishlistViewSet(viewsets.ModelViewSet):
    serializer_class = WishlistSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Wishlist.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class BookingCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = BookingCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        listing = serializer.validated_data["listing"]
        check_in = serializer.validated_data["check_in"]
        check_out = serializer.validated_data["check_out"]

        nights = Decimal((check_out - check_in).days)
        price_per_night = Decimal(listing.price_per_night)
        cleaning_fee = Decimal(listing.cleaning_fee or 0)
        service_fee = (price_per_night * nights * Decimal("0.05")).quantize(Decimal("0.01"))
        total_amount = (price_per_night * nights + cleaning_fee + service_fee).quantize(Decimal("0.01"))

        booking = serializer.save(
            guest=request.user,
            total_amount=total_amount,
            cleaning_fee=cleaning_fee,
            service_fee=service_fee,
            status="pending",
            payment_status="unpaid",
        )

        try:
            host = listing.host
            send_mail(
                subject=f"RoamNepalStay - New Booking for {listing.title}",
                message=f"Hi {host.first_name},\n\nYou have a new booking for your property: {listing.title}.\n- Guest: {request.user.first_name} {request.user.last_name}\n- Dates: {check_in} to {check_out}\n- Total Amount: Rs. {total_amount}\n\nRegards,\nRoamNepalStay",
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[host.email],
                fail_silently=True,
            )
            send_mail(
                subject=f"RoamNepalStay - Booking Created for {listing.title}",
                message=f"Hi {request.user.first_name},\n\nYour booking for {listing.title} has been created successfully!\n- Dates: {check_in} to {check_out}\n- Total Amount: Rs. {total_amount}\n\nPlease proceed to payment.\n\nRegards,\nRoamNepalStay",
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[request.user.email],
                fail_silently=True,
            )
        except Exception as e:
            print(f"Error sending emails: {e}")

        return Response(BookingDetailSerializer(booking, context={"request": request}).data, status=status.HTTP_201_CREATED)


class BookingListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        bookings = Booking.objects.filter(guest=request.user).order_by("-created_at")
        serializer = BookingDetailSerializer(bookings, many=True, context={"request": request})
        return Response(serializer.data)


class BookingsDetailsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            booking = Booking.objects.get(pk=pk, guest=request.user)
            serializer = BookingDetailSerializer(booking, context={"request": request})
            return Response(serializer.data)
        except Booking.DoesNotExist:
            return Response({"detail": "Booking not found."}, status=status.HTTP_404_NOT_FOUND)


class HostBookingViewSet(GenericViewSet):
    permission_classes = [IsAuthenticated]

    def list(self, request):
        bookings = Booking.objects.filter(listing__host=request.user).order_by("-created_at")
        status_filter = request.query_params.get("status", "")
        if status_filter:
            bookings = bookings.filter(status=status_filter)
        serializer = BookingDetailSerializer(bookings, many=True, context={"request": request})
        return Response(serializer.data)


class KhaltiInitiateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, booking_id):
        try:
            booking = Booking.objects.get(pk=booking_id, guest=request.user)
        except Booking.DoesNotExist:
            return Response({"detail": "Booking not found."}, status=status.HTTP_404_NOT_FOUND)

        if booking.payment_status == "paid":
            return Response({"detail": "This booking is already paid."}, status=status.HTTP_400_BAD_REQUEST)

        if booking.status in ["cancelled", "completed"]:
            return Response({"detail": f"Cannot pay for a booking that is {booking.status}."}, status=status.HTTP_400_BAD_REQUEST)

        amount_in_paisa = int(float(booking.total_amount) * 100)
        payload = {
            "return_url": "http://localhost:5173/booking/payment-success/",
            "website_url": "http://localhost:5173",
            "amount": amount_in_paisa,
            "purchase_order_id": str(booking.id),
            "purchase_order_name": f"Booking for {booking.listing.title}",
            "customer_info": {
                "name": f"{request.user.first_name} {request.user.last_name}",
                "email": request.user.email,
                "phone": request.user.phone_number or "9800000000",
            },
        }
        headers = {
            "Authorization": f"Key {settings.KHALTI_SECRET_KEY}",
            "Content-Type": "application/json",
        }
        try:
            response = requests.post(settings.KHALTI_INITIATE_URL, json=payload, headers=headers)
            khalti_data = response.json()
            if response.status_code == 200:
                booking.khalti_token = khalti_data.get("pidx")
                booking.save()
                return Response({"payment_url": khalti_data.get("payment_url"), "pidx": khalti_data.get("pidx"), "booking_id": booking.id})
            return Response({"detail": "Failed to initiate payment.", "khalti_details": khalti_data}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"detail": f"Payment error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class KhaltiVerifyView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        pidx = request.data.get("pidx")
        booking_id = request.data.get("booking_id")
        if not pidx or not booking_id:
            return Response({"detail": "pidx and booking_id are required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            booking = Booking.objects.get(pk=booking_id, guest=request.user)
        except Booking.DoesNotExist:
            return Response({"detail": "Booking not found."}, status=status.HTTP_404_NOT_FOUND)

        headers = {
            "Authorization": f"Key {settings.KHALTI_SECRET_KEY}",
            "Content-Type": "application/json",
        }
        try:
            response = requests.post(settings.KHALTI_VERIFY_URL, json={"pidx": pidx}, headers=headers)
            khalti_data = response.json()
            if response.status_code == 200 and khalti_data.get("status") == "Completed":
                booking.payment_status = "paid"
                booking.status = "paid"
                booking.khalti_transaction_id = khalti_data.get("transaction_id")
                booking.paid_at = timezone.now()
                booking.save()

                # Notify host
                host = booking.listing.host
                send_mail(
                    subject=f"New Paid Booking - {booking.listing.title}",
                    message=f"Hi {host.first_name},\n\nYou have a new paid booking!\nProperty: {booking.listing.title}\nDates: {booking.check_in} to {booking.check_out}\n\nRegards,\nRoamNepalStay",
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[host.email],
                    fail_silently=True,
                )
                return Response({"detail": "Payment verified! Booking confirmed.", "booking": BookingDetailSerializer(booking, context={"request": request}).data})
            booking.payment_status = "failed"
            booking.save()
            return Response({"detail": "Payment verification failed.", "khalti_details": khalti_data}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"detail": f"Verification error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
