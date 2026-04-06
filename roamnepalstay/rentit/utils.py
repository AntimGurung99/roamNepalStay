import random
from datetime import timedelta

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.utils import timezone

from .models import Notification


def generate_otp():
    return str(random.randint(100000, 999999))


def send_otp_email(user):
    otp = generate_otp()
    user.email_otp = otp
    user.otp_created_at = timezone.now()
    user.save(update_fields=["email_otp", "otp_created_at"])

    send_mail(
        subject="RoamNepalStay - Verify your email",
        message=f"Your OTP code is: {otp}\n This code expires in 10 minutes.",
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user.email],
        fail_silently=False,
    )


def send_booking_confirmation_emails(booking):
    try:
        listing = booking.listing
        host = listing.host
        guest = booking.guest

        pm = str(booking.payment_method or "Not Specified").replace("_", " ").title()

        send_mail(
            subject=f"RoamNepalStay - New Booking for {listing.title}",
            message=(
                f"Hi {host.first_name},\n\n"
                f"You have a new confirmed booking for your property: {listing.title}.\n"
                f"- Guest: {guest.first_name} {guest.last_name}\n"
                f"- Dates: {booking.check_in} to {booking.check_out}\n"
                f"- Payment Method: {pm}\n"
                f"- Total Amount: Rs. {booking.total_amount}\n\n"
                f"Regards,\nRoamNepalStay"
            ),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[host.email],
            fail_silently=True,
        )

        send_mail(
            subject=f"RoamNepalStay - Booking Confirmed for {listing.title}",
            message=(
                f"Hi {guest.first_name},\n\n"
                f"Your booking for {listing.title} has been confirmed successfully.\n"
                f"- Dates: {booking.check_in} to {booking.check_out}\n"
                f"- Payment Method: {pm}\n"
                f"- Total Amount: Rs. {booking.total_amount}\n\n"
                f"Thank you for choosing RoamNepalStay!\n\n"
                f"Regards,\nRoamNepalStay"
            ),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[guest.email],
            fail_silently=True,
        )
    except Exception as e:
        print(f"Error sending booking confirmation emails: {e}")


User = get_user_model()


ADMIN_NOTIFICATION_TYPES = {
    Notification.Type.ADMIN_NEW_HOST_APPLICATION,
    Notification.Type.ADMIN_HOST_APPLICATION_RESUBMITTED,
    Notification.Type.ADMIN_NEW_LISTING_PENDING,
    Notification.Type.ADMIN_PAYMENT_FAILED,
}


HOST_NOTIFICATION_TYPES = {
    Notification.Type.LISTING_SUBMITTED,
    Notification.Type.LISTING_APPROVED,
    Notification.Type.LISTING_REJECTED,
    Notification.Type.LISTING_SUSPENDED,
    Notification.Type.REVIEW_RECEIVED,
}


BOOKING_NOTIFICATION_TYPES = {
    Notification.Type.BOOKING_CREATED,
    Notification.Type.BOOKING_CONFIRMED,
    Notification.Type.BOOKING_PAID,
    Notification.Type.BOOKING_PAYMENT_FAILED,
    Notification.Type.BOOKING_CANCELLED,
    Notification.Type.CASH_IN_HAND_SELECTED,
}


def resolve_notification_scope(notification_type, data=None):
    data = data or {}

    explicit_scope = data.get("scope")
    if explicit_scope in {"guest", "host", "admin"}:
        return explicit_scope

    url = str(data.get("url") or "").lower()

    if notification_type in ADMIN_NOTIFICATION_TYPES or url.startswith("/admin"):
        return "admin"

    if (
        notification_type in HOST_NOTIFICATION_TYPES
        or url.startswith("/host")
        or url.startswith("/my-properties")
    ):
        return "host"

    return "guest"


def get_notification_expiry_days(notification_type, data=None):
    payload = data or {}
    scope = resolve_notification_scope(notification_type, payload)

    if scope == "admin":
        return 30

    if notification_type in BOOKING_NOTIFICATION_TYPES:
        return 7

    if scope == "host":
        return 7

    return 7


def create_notification(
    *,
    recipient,
    type,
    title,
    message,
    actor=None,
    priority=Notification.Priority.MEDIUM,
    data=None,
    expires_in_days=None,
):
    payload = dict(data or {})
    payload.setdefault("scope", resolve_notification_scope(type, payload))

    if expires_in_days is None:
        expires_in_days = get_notification_expiry_days(type, payload)

    expires_at = None
    if expires_in_days is not None:
        expires_at = timezone.now() + timedelta(days=expires_in_days)

    return Notification.objects.create(
        recipient=recipient,
        actor=actor,
        type=type,
        title=title,
        message=message,
        priority=priority,
        data=payload,
        expires_at=expires_at,
    )


def notify_admins(
    *,
    type,
    title,
    message,
    actor=None,
    priority=Notification.Priority.HIGH,
    data=None,
    expires_in_days=None,
):
    admins = User.objects.filter(is_staff=True, is_active=True)
    notifications = []

    payload = dict(data or {})
    payload["scope"] = "admin"

    if expires_in_days is None:
        expires_in_days = 30

    expires_at = None
    if expires_in_days is not None:
        expires_at = timezone.now() + timedelta(days=expires_in_days)

    for admin in admins:
        notifications.append(
            Notification(
                recipient=admin,
                actor=actor,
                type=type,
                title=title,
                message=message,
                priority=priority,
                data=payload,
                expires_at=expires_at,
            )
        )

    if notifications:
        Notification.objects.bulk_create(notifications)


def cleanup_expired_read_notifications():
    return Notification.objects.filter(
        is_read=True,
        expires_at__isnull=False,
        expires_at__lte=timezone.now(),
    ).delete()
