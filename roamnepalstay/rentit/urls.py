from django.urls import path, include

from .views import RegisterAPIView, LoginAPIView
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
    UserProfileView,
    VerifyOTPAPIView,
    ResendOTPAPIView,
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


urlpatterns = [
    # Test endpoint
    path("test/", TestAPIView.as_view(), name="test"),
    # Authentication routes
    path("auth/register/", RegisterAPIView.as_view(), name="register"),
    path("auth/login/", LoginAPIView.as_view(), name="login"),
    path("auth/profile/", UserProfileView.as_view(), name="profile"),
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
]
