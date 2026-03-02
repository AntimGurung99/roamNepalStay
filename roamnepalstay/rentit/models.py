from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from django.db.models import UniqueConstraint
from django.db.models.functions import Lower
from django.db.models import Q
from django.utils import timezone


class UserManager(BaseUserManager):
    use_in_migrations = True

    def _create_user(self, email, password, **extra_fields):
        if not email:
            raise ValueError("The Email must be set")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", False)
        extra_fields.setdefault("is_superuser", False)
        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_active", True)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff= True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")
        return self._create_user(email, password, **extra_fields)


# user haru sabai ko lagi infromation
class User(AbstractUser):
    username = None  # username field lai hatauna
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=15, blank=False)
    last_name = models.CharField(max_length=15, blank=False)
    # email = models.EmailField(unique=True)

    # host banna chaahnay user ko lagii
    is_host = models.BooleanField(default=False)
    host_application_status = models.CharField(
        max_length=20,
        choices=[
            ("none", "No Application"),
            ("pending", "Pending Review"),
            ("approved", "Approved"),
            ("rejected", "Rejected"),
        ],
        default="none",
    )
    phone_number = models.CharField(max_length=10, blank=True, null=True)

    # address = models.TextField(blank=True, null=True)
    profile_image = models.ImageField(
        upload_to="profile_images/", blank=True, null=True
    )
    created_at = models.DateTimeField(auto_now_add=True, null=True)
    last_login_at = models.DateTimeField(blank=True, null=True)
    date_of_birth = models.DateField(blank=True, null=True)
    city = models.CharField(max_length=30)
    country = models.CharField(max_length=60, default="Nepal")
    accepted_terms = models.BooleanField(default=False)
    accepted_terms_at = models.DateTimeField(null=True, blank=True)

    # class Meta:
    #     email = models.EmailField(unique=True)
    # constraints = [
    #     models.CheckConstraint(
    #         condition=~Q(first_name="") & ~Q(last_name=""),
    #         name="first_last_not_empty",
    #     ),
    #     UniqueConstraint(
    #         Lower("first_name"),
    #         Lower("last_name"),
    #         name="uniq_first_last_case_insensitive",
    #     ),
    # ]
    # Email verification (OTP)
    is_email_verified = models.BooleanField(default=False)
    email_otp = models.CharField(max_length=6, blank=True, null=True)
    otp_created_at = models.DateTimeField(blank=True, null=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["first_name", "last_name"]

    objects = UserManager()

    def __str__(self):
        return self.email


# host banna chaahnay user haru ko lagi detials store garna
class HostApplication(models.Model):
    user = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name="host_application"
    )

    # Personal Information
    citizenship_number = models.CharField(max_length=20)
    citizenship_image = models.ImageField(upload_to="citizenship_images/")

    # Business Information
    business_name = models.CharField(max_length=200, blank=True)
    business_registration = models.CharField(max_length=50, blank=True)
    tax_number = models.CharField(max_length=20, blank=True)

    # Bank Details
    bank_name = models.CharField(max_length=100)
    account_number = models.CharField(max_length=30)
    account_holder_name = models.CharField(max_length=200)

    # Application Status
    status = models.CharField(
        max_length=20,
        choices=[
            ("pending", "Pending Review"),
            ("approved", "Approved"),
            ("rejected", "Rejected"),
        ],
        default="pending",
    )

    # Admin review details
    reviewed_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="reviewed_applications",
    )
    review_notes = models.TextField(blank=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)

    # Timestamps
    applied_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Host Application - {self.user.first_name} {self.user.last_name}"


# admin side ko lagi
from django.conf import settings
from django.db import models


# all property details store garna
class Listing(models.Model):
    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        PUBLISHED = "published", "Published"
        PENDING = "pending", "Pending Review"
        SUSPENDED = "suspended", "Suspended"
        REJECTED = "rejected", "Rejected"

    class PropertyType(models.TextChoices):
        ROOM = "room", "Room"
        APARTMENT = "apartment", "Apartment"
        HOUSE = "house", "House"
        VILLA = "villa", "Villa"
        SHARED_ROOM = "shared_room", "Shared Room"

    host = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="listings",
    )

    # Basic Information
    title = models.CharField(max_length=255)
    description = models.TextField()
    property_type = models.CharField(
        max_length=20, choices=PropertyType.choices, default=PropertyType.ROOM
    )
    highlight = models.CharField(max_length=255, blank=True, null=True)
    highlight_details = models.TextField(blank=True, null=True)

    # Location Details
    city = models.CharField(max_length=120)
    district = models.CharField(max_length=120, default="Unknown")
    address = models.TextField(default="Address not provided")
    apt_suite = models.CharField(max_length=255, blank=True, null=True)
    province = models.CharField(max_length=120, blank=True, null=True)
    region = models.CharField(max_length=120, blank=True, null=True)
    country = models.CharField(max_length=120, default="Nepal")
    latitude = models.DecimalField(
        max_digits=10, decimal_places=8, null=True, blank=True
    )
    longitude = models.DecimalField(
        max_digits=11, decimal_places=8, null=True, blank=True
    )

    # Property Details
    category = models.CharField(max_length=100, default="All")
    bedrooms = models.PositiveIntegerField(default=1)
    beds = models.PositiveIntegerField(default=1)
    bathrooms = models.PositiveIntegerField(default=1)
    max_guests = models.PositiveIntegerField(default=2)

    # Pricing
    price_per_night = models.DecimalField(max_digits=10, decimal_places=2)
    cleaning_fee = models.DecimalField(max_digits=8, decimal_places=2, default=0)

    # Amenities
    wifi = models.BooleanField(default=False)
    parking = models.BooleanField(default=False)
    kitchen = models.BooleanField(default=False)
    air_conditioning = models.BooleanField(default=False)
    heating = models.BooleanField(default=False)
    bath_tub = models.BooleanField(default=False)
    personal_care = models.BooleanField(default=False)
    outdoor_shower = models.BooleanField(default=False)
    washer = models.BooleanField(default=False)
    dryer = models.BooleanField(default=False)
    hangers = models.BooleanField(default=False)
    iron = models.BooleanField(default=False)
    tv = models.BooleanField(default=False)
    dedicated_workspace = models.BooleanField(default=False)
    security_cameras = models.BooleanField(default=False)
    fire_extinguisher = models.BooleanField(default=False)
    first_aid = models.BooleanField(default=False)
    cooking_set = models.BooleanField(default=False)
    refrigerator = models.BooleanField(default=False)
    microwave = models.BooleanField(default=False)
    stove = models.BooleanField(default=False)
    barbecue_grill = models.BooleanField(default=False)
    outdoor_dining_area = models.BooleanField(default=False)
    private_patio_or_balcony = models.BooleanField(default=False)
    camp_fire = models.BooleanField(default=False)
    garden = models.BooleanField(default=False)
    free_parking = models.BooleanField(default=False)
    self_check_in = models.BooleanField(default=False)
    pet_allowed = models.BooleanField(default=False)

    # Status and Moderation
    status = models.CharField(
        max_length=12,
        choices=Status.choices,
        default=Status.DRAFT,
    )

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Moderation fields for admin action
    moderated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="moderated_listings",
    )
    moderation_reason = models.TextField(blank=True, default="")
    moderated_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.title} ({self.city})"

    class Meta:
        ordering = ["-created_at"]


# photo store garnu ko lagi property haru kp
class ListingImage(models.Model):
    listing = models.ForeignKey(
        Listing,
        on_delete=models.CASCADE,
        related_name="images",
    )
    image = models.ImageField(upload_to="listing_images/")
    is_primary = models.BooleanField(default=False)  # Main photo identify गर्न
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Image for {self.listing.title}"

    class Meta:
        ordering = ["-is_primary", "uploaded_at"]


# sabai booking details haru store garna hunxa
class Booking(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        CONFIRMED = "confirmed", "Confirmed"
        CANCELLED = "cancelled", "Cancelled"
        COMPLETED = "completed", "Completed"

    # Booking parties
    guest = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="bookings"
    )
    listing = models.ForeignKey(
        Listing, on_delete=models.CASCADE, related_name="bookings"
    )

    # Booking details
    check_in = models.DateField()
    check_out = models.DateField()
    guests_count = models.PositiveIntegerField()

    # Pricing
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    cleaning_fee = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    service_fee = models.DecimalField(max_digits=8, decimal_places=2, default=0)

    # Status
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.PENDING
    )

    # Special requests
    special_requests = models.TextField(blank=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Booking {self.id} - {self.listing.title}"

    class Meta:
        ordering = ["-created_at"]


# guest lay diyako hosts raw properties ko review haru store garna
class Review(models.Model):

    booking = models.OneToOneField(
        Booking, on_delete=models.CASCADE, related_name="review"
    )
    reviewer = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="reviews_given"
    )
    listing = models.ForeignKey(
        Listing, on_delete=models.CASCADE, related_name="reviews"
    )

    # Rating (1-5 stars)
    rating = models.PositiveIntegerField(choices=[(i, i) for i in range(1, 6)])

    # Review content
    comment = models.TextField()

    # Admin moderation
    is_approved = models.BooleanField(default=True)
    moderated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="moderated_reviews",
    )

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Review by {self.reviewer.first_name} for {self.listing.title}"

    class Meta:
        ordering = ["-created_at"]


class Wishlist(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="wishlist"
    )
    listing = models.ForeignKey(
        Listing, on_delete=models.CASCADE, related_name="wishlisted_by"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["user", "listing"], name="unique_wishlist")
        ]
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user.email} - {self.listing.title}"
