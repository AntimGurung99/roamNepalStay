from django.urls import path, include

from .views import ProfileAPIView, RegisterAPIView, LoginAPIView
from .test_views import TestAPIView
from .views import (
    HostApplicationCreateView,
    AdminDashboardViewSet,
    AdminUserViewSet,
    AdminHostApplicationViewSet,
    AdminListingViewSet,
    AdminBookingViewSet,
    AdminReviewViewSet,
    ListingViewSet,
    WishlistViewSet,
    # UserProfileView,
    VerifyOTPAPIView,
    ResendOTPAPIView,
    # for booking
    BookingsDetailsView,
    HostBookingViewSet,
    BookingCreateView,
    BookingListView,
    # payment verify
    KhaltiInitiateView,
    KhaltiVerifyView,
    # HostNotificationCountView,
)
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r"listings", ListingViewSet, basename="listings")
router.register(r"wishlist", WishlistViewSet, basename="wishlist")
router.register(r"admin/dashboard", AdminDashboardViewSet, basename="admin-dashboard")
router.register(r"admin/users", AdminUserViewSet, basename="admin-users")
router.register(
    r"admin/host-applications",
    AdminHostApplicationViewSet,
    basename="admin-host-applications",
)
router.register(r"admin/listings", AdminListingViewSet, basename="admin-listings")
router.register(r"admin/bookings", AdminBookingViewSet, basename="admin-bookings")
router.register(r"admin/reviews", AdminReviewViewSet, basename="admin-reviews")
router.register(r"host/bookings", HostBookingViewSet, basename="host-bookings")

urlpatterns = [
    # Test endpoint
    path("test/", TestAPIView.as_view(), name="test"),
    # Authentication routes
    path("auth/register/", RegisterAPIView.as_view(), name="register"),
    path("auth/login/", LoginAPIView.as_view(), name="login"),
    path("auth/profile/", ProfileAPIView.as_view(), name="profile"),
    # Host Application
    path(
        "host-applications/",
        HostApplicationCreateView.as_view(),
        name="host-application-create",
    ),
    # OPTVERIFY AND RESEND
    path("auth/verify-otp/", VerifyOTPAPIView.as_view(), name="verify-otp"),
    path("auth/resend-otp/", ResendOTPAPIView.as_view(), name="resend-otp"),
    # Admin routes router bata
    path("", include(router.urls)),
    # bookings urls
    path("bookings/", BookingCreateView.as_view(), name="booking-create"),
    path("bookings/my/", BookingListView.as_view(), name="booking-list"),
    path("bookings/<int:pk>/", BookingsDetailsView.as_view(), name="booking-list"),
    # payments
    path(
        "bookings/<int:booking_id>/initiate-payment/",
        KhaltiInitiateView.as_view(),
        name="khalti-initiate",
    ),
    path(
        "bookings/verify-payment/",
        KhaltiVerifyView.as_view(),
        name="khalti-verify",
    ),
    # path(
    #     "host/notifications/count/",
    #     HostNotificationCountView.as_view(),
    #     name="host-notification-count",
    # ),
]
