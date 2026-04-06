from datetime import timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone

from rentit.models import Notification


class Command(BaseCommand):
    help = "Delete expired notifications and hard-delete very old notifications"

    def handle(self, *args, **options):
        now = timezone.now()

        expired_deleted, _ = Notification.objects.filter(
            expires_at__isnull=False,
            expires_at__lte=now,
        ).delete()

        hard_deleted, _ = Notification.objects.filter(
            created_at__lte=now - timedelta(days=60)
        ).delete()

        total_deleted = expired_deleted + hard_deleted

        self.stdout.write(
            self.style.SUCCESS(
                f"Deleted {expired_deleted} expired notifications, "
                f"{hard_deleted} hard-old notifications. "
                f"Total deleted: {total_deleted}."
            )
        )
