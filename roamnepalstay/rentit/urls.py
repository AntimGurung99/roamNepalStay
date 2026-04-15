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
    ForgotPasswordAPIView,
    ResetPasswordAPIView,
    # for booking
    BookingsDetailsView,
    HostBookingViewSet,
    BookingCreateView,
    BookingListView,
    # payment verify
    KhaltiInitiateView,
    KhaltiVerifyView,
    EsewaInitiateView,
    EsewaVerifyView,
    CashInHandBookingView,
    # HostNotificationCountView,
    CancelBookingView,
    BookingReceiptPDFView,
    # for view
    BookingReviewCreateView,
    # split revenue
    PlatformSettingAPIView,
    HostAnalyticsView,
    PublicPlatformFeeAPIView,
    ListingMapAPIView,
    # AI chat
    AIHomeChatAPIView,
    # notification
    NotificationListView,
    NotificationMarkReadView,
    NotificationMarkAllReadView,
    NotificationDeleteView,
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
    path(
        "auth/forgot-password/", ForgotPasswordAPIView.as_view(), name="forgot-password"
    ),
    path("auth/reset-password/", ResetPasswordAPIView.as_view(), name="reset-password"),
    path("auth/profile/", ProfileAPIView.as_view(), name="profile"),
    # Host Application
    path(
        "host-applications/",
        HostApplicationCreateView.as_view(),
        name="host-application-create",
    ),
    path(
        "host-applications/me/",
        HostApplicationCreateView.as_view(),
        name="host-application-me",
    ),
    # OPTVERIFY AND RESEND
    path("auth/verify-otp/", VerifyOTPAPIView.as_view(), name="verify-otp"),
    path("auth/resend-otp/", ResendOTPAPIView.as_view(), name="resend-otp"),
    path("listings/map/", ListingMapAPIView.as_view(), name="listings-map"),
    # Admin routes router bata
    path("", include(router.urls)),
    # bookings urls
    path("bookings/", BookingCreateView.as_view(), name="booking-create"),
    path("bookings/my/", BookingListView.as_view(), name="booking-list"),
    path("bookings/<int:pk>/", BookingsDetailsView.as_view(), name="booking-list"),
    path(
        "bookings/<int:booking_id>/review/",
        BookingReviewCreateView.as_view(),
        name="booking-review-create",
    ),
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
    path(
        "bookings/<int:booking_id>/cash-in-hand/",
        CashInHandBookingView.as_view(),
        name="cash-in-hand",
    ),
    path(
        "bookings/<int:booking_id>/initiate-esewa/",
        EsewaInitiateView.as_view(),
        name="esewa-initiate",
    ),
    path(
        "bookings/verify-esewa-payment/",
        EsewaVerifyView.as_view(),
        name="esewa-verify",
    ),
    # cancel and pdf
    path(
        "bookings/<int:booking_id>/cancel/",
        CancelBookingView.as_view(),
        name="cancel-booking",
    ),
    path(
        "bookings/<int:booking_id>/receipt/",
        BookingReceiptPDFView.as_view(),
        name="booking-receipt-pdf",
    ),
    # split income host and super admin
    path(
        "platform-settings/", PlatformSettingAPIView.as_view(), name="platform-settings"
    ),
    path("host/analytics/", HostAnalyticsView.as_view(), name="host-analytics"),
    path(
        "public/platform-fee/",
        PublicPlatformFeeAPIView.as_view(),
        name="public-platform-fee",
    ),
    path("ai/home-chat/", AIHomeChatAPIView.as_view(), name="ai-home-chat"),
    path("notifications/", NotificationListView.as_view(), name="notifications-list"),
    path(
        "notifications/<int:notification_id>/read/",
        NotificationMarkReadView.as_view(),
        name="notification-mark-read",
    ),
    path(
        "notifications/mark-all-read/",
        NotificationMarkAllReadView.as_view(),
        name="notification-mark-all-read",
    ),
    path(
        "notifications/<int:notification_id>/",
        NotificationDeleteView.as_view(),
        name="notification-delete",
    ),
]
