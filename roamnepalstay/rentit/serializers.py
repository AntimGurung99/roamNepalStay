from django.contrib.auth import get_user_model, authenticate
from django.core.validators import validate_email
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers
import re
from .models import Listing, ListingImage, HostApplication, Booking, Review, Wishlist
from django.utils import timezone
from django.db.models import Avg
from .models import PlatformSetting, Booking
from .geocoding import geocode_listing_address

User = get_user_model()


#     return user
class RegisterSerializer(serializers.Serializer):
    first_name = serializers.CharField()
    last_name = serializers.CharField()
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)
    phone_number = serializers.CharField(
        required=False, allow_blank=True, allow_null=True
    )
    profile_image = serializers.ImageField(required=False, allow_null=True)
    date_of_birth = serializers.DateField(required=False, allow_null=True)
    city = serializers.CharField()
    country = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    accepted_terms = serializers.BooleanField()

    def validate(self, attrs):
        first_name = (attrs.get("first_name") or "").strip()
        last_name = (attrs.get("last_name") or "").strip()
        email = (attrs.get("email") or "").strip().lower()
        password = attrs.get("password")
        confirm_password = attrs.get("confirm_password")

        if not first_name:
            raise serializers.ValidationError(
                {"first_name": ["First name is required."]}
            )
        if not last_name:
            raise serializers.ValidationError({"last_name": ["Last name is required."]})
        if not email:
            raise serializers.ValidationError({"email": ["Email is required."]})
        if not confirm_password:
            raise serializers.ValidationError(
                {"confirm_password": ["Confirm password is required."]}
            )

        if password != confirm_password:
            raise serializers.ValidationError(
                {"confirm_password": ["Passwords do not match."]}
            )

        try:
            validate_password(password)
        except DjangoValidationError as e:
            raise serializers.ValidationError({"password": e.messages})

        try:
            validate_email(email)
        except DjangoValidationError:
            raise serializers.ValidationError(
                {"email": ["Enter a valid email address."]}
            )

        email_regex = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
        if not re.match(email_regex, email):
            raise serializers.ValidationError({"email": ["Invalid email format."]})

        if User.objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError({"email": ["Email already exists."]})

        if attrs.get("accepted_terms") is not True:
            raise serializers.ValidationError(
                {"accepted_terms": ["You must accept terms and conditions."]}
            )

        attrs["first_name"] = first_name
        attrs["last_name"] = last_name
        attrs["email"] = email
        return attrs


class VerifyOTPSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    otp = serializers.CharField(required=True, max_length=6, min_length=6)


class ResendOTPSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)


class RegisterResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            "id",
            "first_name",
            "last_name",
            "email",
            "city",
            "country",
            "is_host",
            "host_application_status",
        )

    read_only_fields = (
        "id",
        "first_name",
        "last_name",
        "email",
        "city",
        "country",
        "is_host",
        "host_application_status",
    )


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = (attrs.get("email") or "").strip().lower()
        password = attrs.get("password")
        user = authenticate(
            request=self.context.get("request"), email=email, password=password
        )
        if not user:

            raise serializers.ValidationError({"detail": "Invalid email or password."})

        # Admin users skip email verification
        if not (user.is_staff or user.is_superuser):
            if not user.is_email_verified:
                raise serializers.ValidationError(
                    {"detail": "Please verify your email first"}
                )

        attrs["user"] = user
        return attrs


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "first_name",
            "last_name",
            "email",
            "phone_number",
            "profile_image",
            "date_of_birth",
            "city",
            "country",
            "is_host",
            "is_staff",
            "host_application_status",
        ]
        read_only_fields = [
            "id",
            "email",
            "is_host",
            "is_staff",
            "host_application_status",
        ]

    def validate_phone_number(self, value):
        if value and not value.isdigit():
            raise serializers.ValidationError("Phone number must contain only digits.")
        if value and len(value) != 10:
            raise serializers.ValidationError("Phone number must be 10 digits.")
        return value

    def validate_first_name(self, value):
        if not value.strip():
            raise serializers.ValidationError("First name cannot be empty.")
        return value.strip()

    def validate_last_name(self, value):
        if not value.strip():
            raise serializers.ValidationError("Last name cannot be empty.")
        return value.strip()


# Admin Panel Serializers


# admin panel mah user ko list dekhauna ko lagi
class UserListSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    total_listings = serializers.SerializerMethodField()
    total_bookings = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "full_name",
            "email",
            "is_host",
            "host_application_status",
            "is_active",
            "is_staff",
            "created_at",
            "last_login_at",
            "total_listings",
            "total_bookings",
            "is_superuser",
        ]

    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}"

    def get_total_listings(self, obj):
        return obj.listings.count()

    def get_total_bookings(self, obj):
        return obj.bookings.count()


# user ko detail dekhauna ko lagi
class UserDetailSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "first_name",
            "last_name",
            "full_name",
            "phone_number",
            "profile_image",
            "city",
            "country",
            "is_host",
            "host_application_status",
            "is_active",
            "is_staff",
            "is_superuser",
            "created_at",
            "last_login_at",
        ]

    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}"


# host application ko dekhauna ko lagi
# class HostApplicationSerializer(serializers.ModelSerializer):
#     user_name = serializers.SerializerMethodField()
#     user_email = serializers.SerializerMethodField()

#     class Meta:
#         model = HostApplication
#         fields = [
#             "id",
#             "user",
#             "user_name",
#             "user_email",
#             "citizenship_number",
#             "citizenship_image",
#             "business_name",
#             "business_registration",
#             "tax_number",
#             "bank_name",
#             "account_number",
#             "account_holder_name",
#             "status",
#             "reviewed_by",
#             "review_notes",
#             "reviewed_at",
#             "applied_at",
#             "updated_at",
#         ]
#         read_only_fields = [
#             "user",
#             "status",
#             "reviewed_by",
#             "reviewed_at",
#             "review_notes",
#         ]

#     def get_user_name(self, obj):
#         return f"{obj.user.first_name} {obj.user.last_name}"

#     def get_user_email(self, obj):
#         return obj.user.email

from rest_framework import serializers
from .models import HostApplication


class HostApplicationSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()
    user_email = serializers.SerializerMethodField()
    user_phone = serializers.SerializerMethodField()

    class Meta:
        model = HostApplication
        fields = [
            "id",
            "user",
            "user_name",
            "user_email",
            "user_phone",
            "citizenship_number",
            "citizenship_front_image",
            "selfie_with_id",
            "permanent_address",
            "property_address",
            "ownership_document",
            "bank_name",
            "account_number",
            "account_holder_name",
            "business_name",
            "pan_card_image",
            "agreed_to_terms",
            "status",
            "reviewed_by",
            "review_notes",
            "reviewed_at",
            "phone_verified_check",
            "identity_verified_check",
            "property_verified_check",
            "bank_verified_check",
            "applied_at",
            "updated_at",
        ]
        read_only_fields = [
            "user",
            "status",
            "reviewed_by",
            "review_notes",
            "reviewed_at",
            "phone_verified_check",
            "identity_verified_check",
            "property_verified_check",
            "bank_verified_check",
            "applied_at",
            "updated_at",
        ]

    def get_user_name(self, obj):
        full_name = f"{obj.user.first_name} {obj.user.last_name}".strip()
        return full_name if full_name else obj.user.username

    def get_user_email(self, obj):
        return obj.user.email

    def get_user_phone(self, obj):
        # returns phone if exists, else None
        return getattr(obj.user, "phone_number", None)

    def validate_account_number(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Account number is required.")
        return value

    def validate(self, attrs):
        if not attrs.get("ownership_document"):
            raise serializers.ValidationError(
                {"ownership_document": "Ownership document is required."}
            )

        if not attrs.get("agreed_to_terms"):
            raise serializers.ValidationError(
                {"agreed_to_terms": "You must agree to the terms and conditions."}
            )

        business_name = attrs.get("business_name")
        pan_card_image = attrs.get("pan_card_image")

        if pan_card_image and not business_name:
            raise serializers.ValidationError(
                {
                    "business_name": "Business name is required if PAN card image is uploaded."
                }
            )

        return attrs

    # def create(self, validated_data):
    #     user = self.context["request"].user
    #     return HostApplication.objects.create(user=user, **validated_data)
    def create(self, validated_data):
        user = self.context["request"].user
        validated_data.pop("user", None)
        return HostApplication.objects.create(user=user, **validated_data)

    def update(self, instance, validated_data):
        validated_data.pop("user", None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.status = "pending"
        instance.reviewed_by = None
        instance.review_notes = ""
        instance.reviewed_at = None
        instance.phone_verified_check = False
        instance.identity_verified_check = False
        instance.property_verified_check = False
        instance.bank_verified_check = False
        instance.save()
        return instance


# listing image ko lagi serializer
class ListingImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ListingImage
        fields = ["id", "image", "is_primary", "uploaded_at"]


# listing ko list dekhauna ko lagi
class ListingListSerializer(serializers.ModelSerializer):
    host_name = serializers.SerializerMethodField()
    primary_image = serializers.SerializerMethodField()
    all_images = serializers.SerializerMethodField()
    total_bookings = serializers.SerializerMethodField()
    average_rating = serializers.SerializerMethodField()

    is_wishlisted = serializers.SerializerMethodField()

    class Meta:
        model = Listing
        fields = [
            "id",
            "title",
            "property_type",
            "city",
            "district",
            "price_per_night",
            "status",
            "host_name",
            "primary_image",
            "all_images",
            "total_bookings",
            "average_rating",
            "category",
            "province",
            "region",
            "country",
            "is_wishlisted",
            "created_at",
            "updated_at",
        ]

    def get_is_wishlisted(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            return Wishlist.objects.filter(user=request.user, listing=obj).exists()
        return False

    def get_host_name(self, obj):
        return f"{obj.host.first_name} {obj.host.last_name}"

    def get_primary_image(self, obj):
        primary_image = obj.images.filter(is_primary=True).first()
        if not primary_image:
            primary_image = obj.images.first()
        if primary_image:
            return primary_image.image.url
        return None

    def get_all_images(self, obj):
        return [img.image.url for img in obj.images.all()]

    def get_total_bookings(self, obj):
        return obj.bookings.count()

    def get_average_rating(self, obj):
        reviews = obj.reviews.filter(is_approved=True)
        if reviews.exists():
            return round(sum(review.rating for review in reviews) / reviews.count(), 1)
        return 0


# listing ko detail dekhauna ko lagi
# class ListingDetailSerializer(serializers.ModelSerializer):
#     host_name = serializers.SerializerMethodField()
#     images = ListingImageSerializer(many=True, read_only=True)
#     moderated_by_name = serializers.SerializerMethodField()
#     amenities = serializers.SerializerMethodField()
#     is_wishlisted = serializers.SerializerMethodField()

#     class Meta:
#         model = Listing
#         fields = [
#             "id",
#             "title",
#             "description",
#             "highlight",
#             "highlight_details",
#             "property_type",
#             "city",
#             "district",
#             "address",
#             "latitude",
#             "longitude",
#             "bedrooms",
#             "bathrooms",
#             "max_guests",
#             "price_per_night",
#             "cleaning_fee",
#             "wifi",
#             "parking",
#             "kitchen",
#             "air_conditioning",
#             "heating",
#             "bath_tub",
#             "personal_care",
#             "outdoor_shower",
#             "washer",
#             "dryer",
#             "hangers",
#             "iron",
#             "tv",
#             "dedicated_workspace",
#             "security_cameras",
#             "fire_extinguisher",
#             "first_aid",
#             "cooking_set",
#             "refrigerator",
#             "microwave",
#             "stove",
#             "barbecue_grill",
#             "outdoor_dining_area",
#             "private_patio_or_balcony",
#             "camp_fire",
#             "garden",
#             "free_parking",
#             "self_check_in",
#             "pet_allowed",
#             "category",
#             "beds",
#             "apt_suite",
#             "province",
#             "region",
#             "country",
#             "status",
#             "host",
#             "host_name",
#             "images",
#             "moderated_by",
#             "moderated_by_name",
#             "moderation_reason",
#             "moderated_at",
#             "created_at",
#             "updated_at",
#             "amenities",
#             "is_wishlisted",
#         ]

#     def get_is_wishlisted(self, obj):
#         request = self.context.get("request")
#         if request and request.user.is_authenticated:
#             return Wishlist.objects.filter(user=request.user, listing=obj).exists()
#         return False

#     def get_host_name(self, obj):
#         return f"{obj.host.first_name} {obj.host.last_name}"

#     def get_moderated_by_name(self, obj):
#         if obj.moderated_by:
#             return f"{obj.moderated_by.first_name} {obj.moderated_by.last_name}"
#         return None


#     def get_amenities(self, obj):
#         """Return list of enabled amenities"""
#         amenity_fields = [
#             "wifi",
#             "parking",
#             "kitchen",
#             "air_conditioning",
#             "heating",
#             "bath_tub",
#             "personal_care",
#             "outdoor_shower",
#             "washer",
#             "dryer",
#             "hangers",
#             "iron",
#             "tv",
#             "dedicated_workspace",
#             "security_cameras",
#             "fire_extinguisher",
#             "first_aid",
#             "cooking_set",
#             "refrigerator",
#             "microwave",
#             "stove",
#             "barbecue_grill",
#             "outdoor_dining_area",
#             "private_patio_or_balcony",
#             "camp_fire",
#             "garden",
#             "free_parking",
#             "self_check_in",
#             "pet_allowed",
#         ]
#         return [field for field in amenity_fields if getattr(obj, field, False)]
class ListingDetailSerializer(serializers.ModelSerializer):
    host_name = serializers.SerializerMethodField()
    host_phone = serializers.CharField(source="host.phone_number", read_only=True)
    host_email = serializers.EmailField(source="host.email", read_only=True)
    images = serializers.SerializerMethodField()
    average_rating = serializers.SerializerMethodField()
    total_reviews = serializers.SerializerMethodField()
    approved_reviews = serializers.SerializerMethodField()
    is_wishlisted = serializers.SerializerMethodField()
    amenities = serializers.SerializerMethodField()

    class Meta:
        model = Listing
        fields = [
            "id",
            "title",
            "description",
            "category",
            "property_type",
            "province",
            "district",
            "region",
            "city",
            "address",
            "latitude",
            "longitude",
            "price_per_night",
            "bedrooms",
            "beds",
            "bathrooms",
            "max_guests",
            "amenities",
            "highlight",
            "status",
            "created_at",
            "updated_at",
            "host_name",
            "host_phone",
            "host_email",
            "images",
            "average_rating",
            "total_reviews",
            "approved_reviews",
            "is_wishlisted",
        ]

    def get_host_name(self, obj):
        full_name = f"{obj.host.first_name} {obj.host.last_name}".strip()
        return full_name if full_name else obj.host.email

    def get_images(self, obj):
        request = self.context.get("request")
        images = obj.images.all().order_by("-is_primary", "id")
        image_urls = []

        for image in images:
            if request:
                image_urls.append(request.build_absolute_uri(image.image.url))
            else:
                image_urls.append(image.image.url)

        return image_urls

    def get_average_rating(self, obj):
        approved_reviews = obj.reviews.filter(is_approved=True)
        if not approved_reviews.exists():
            return 0
        avg = approved_reviews.aggregate(avg=Avg("rating"))["avg"] or 0
        return round(avg, 1)

    def get_total_reviews(self, obj):
        return obj.reviews.filter(is_approved=True).count()

    def get_approved_reviews(self, obj):
        reviews = (
            obj.reviews.filter(is_approved=True)
            .select_related("reviewer")
            .order_by("-created_at")
        )
        return PublicReviewSerializer(reviews, many=True, context=self.context).data

    def get_is_wishlisted(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            return Wishlist.objects.filter(user=request.user, listing=obj).exists()
        return False

    def get_amenities(self, obj):
        """Return list of enabled amenities"""
        amenity_fields = [
            "wifi",
            "parking",
            "kitchen",
            "air_conditioning",
            "heating",
            "bath_tub",
            "personal_care",
            "outdoor_shower",
            "washer",
            "dryer",
            "hangers",
            "iron",
            "tv",
            "dedicated_workspace",
            "security_cameras",
            "fire_extinguisher",
            "first_aid",
            "cooking_set",
            "refrigerator",
            "microwave",
            "stove",
            "barbecue_grill",
            "outdoor_dining_area",
            "private_patio_or_balcony",
            "camp_fire",
            "garden",
            "free_parking",
            "self_check_in",
            "pet_allowed",
        ]
        return [field for field in amenity_fields if getattr(obj, field, False)]


# booking ko list dekhauna ko lagi
class BookingListSerializer(serializers.ModelSerializer):
    guest_name = serializers.SerializerMethodField()
    listing_title = serializers.SerializerMethodField()
    host_name = serializers.SerializerMethodField()
    listing_image = serializers.SerializerMethodField()

    class Meta:
        model = Booking
        fields = [
            "id",
            "guest_name",
            "listing_title",
            "host_name",
            "check_in",
            "check_out",
            "guests_count",
            "total_amount",
            "status",
            "listing_image",
            "created_at",
            "updated_at",
            "payment_method",
        ]

    def get_listing_image(self, obj):
        primary_image = obj.listing.images.filter(is_primary=True).first()
        if primary_image:
            return primary_image.image.url
        return None

    def get_guest_name(self, obj):
        return f"{obj.guest.first_name} {obj.guest.last_name}"

    def get_listing_title(self, obj):
        return obj.listing.title

    def get_host_name(self, obj):
        return f"{obj.listing.host.first_name} {obj.listing.host.last_name}"


# admin panel mah review ko list dekhauna ko lagi
class AdminReviewListSerializer(serializers.ModelSerializer):
    reviewer_name = serializers.SerializerMethodField()
    listing_title = serializers.SerializerMethodField()
    moderated_by_name = serializers.SerializerMethodField()
    reviewer_image = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = [
            "id",
            "reviewer_name",
            "listing_title",
            "rating",
            "comment",
            "is_approved",
            "moderated_by_name",
            "reviewer_image",
            "created_at",
            "updated_at",
        ]

    def get_reviewer_image(self, obj):
        if obj.reviewer.profile_image:
            return obj.reviewer.profile_image.url
        return None

    def get_reviewer_name(self, obj):
        return f"{obj.reviewer.first_name} {obj.reviewer.last_name}"

    def get_listing_title(self, obj):
        return obj.listing.title

    def get_moderated_by_name(self, obj):
        if obj.moderated_by:
            return f"{obj.moderated_by.first_name} {obj.moderated_by.last_name}"
        return None


# admin dashboard ko stats dekhauna ko lagi
class AdminStatsSerializer(serializers.Serializer):
    total_users = serializers.IntegerField()
    total_hosts = serializers.IntegerField()
    total_listings = serializers.IntegerField()
    total_bookings = serializers.IntegerField()
    pending_host_applications = serializers.IntegerField()
    pending_listings = serializers.IntegerField()
    total_revenue = serializers.DecimalField(max_digits=12, decimal_places=2)
    recent_bookings = BookingListSerializer(many=True)
    recent_reviews = AdminReviewListSerializer(many=True)
    monthly_bookings = serializers.JSONField()
    monthly_revenue = serializers.JSONField()
    listings_by_type = serializers.JSONField()
    host_application_status = serializers.JSONField()


# class ListingCreateSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Listing
#         fields = [
#             "title",
#             "description",
#             "highlight",
#             "highlight_details",
#             "property_type",
#             "city",
#             "district",
#             "address",
#             "bedrooms",
#             "bathrooms",
#             "max_guests",
#             "price_per_night",
#             "cleaning_fee",
#             "wifi",
#             "parking",
#             "kitchen",
#             "air_conditioning",
#             "heating",
#             "bath_tub",
#             "personal_care",
#             "outdoor_shower",
#             "washer",
#             "dryer",
#             "hangers",
#             "iron",
#             "tv",
#             "dedicated_workspace",
#             "security_cameras",
#             "fire_extinguisher",
#             "first_aid",
#             "cooking_set",
#             "refrigerator",
#             "microwave",
#             "stove",
#             "barbecue_grill",
#             "outdoor_dining_area",
#             "private_patio_or_balcony",
#             "camp_fire",
#             "garden",
#             "free_parking",
#             "self_check_in",
#             "pet_allowed",
#             "category",
#             "beds",
#             "apt_suite",
#             "province",
#             "region",
#             "country",
#         ]

#     def create(self, validated_data):
#         return Listing.objects.create(**validated_data)


class ListingCreateSerializer(serializers.ModelSerializer):
    latitude = serializers.DecimalField(
        max_digits=10, decimal_places=8, required=False, allow_null=True
    )
    longitude = serializers.DecimalField(
        max_digits=11, decimal_places=8, required=False, allow_null=True
    )

    class Meta:
        model = Listing
        fields = [
            "title",
            "description",
            "highlight",
            "highlight_details",
            "property_type",
            "city",
            "district",
            "address",
            "bedrooms",
            "bathrooms",
            "max_guests",
            "price_per_night",
            "cleaning_fee",
            "wifi",
            "parking",
            "kitchen",
            "air_conditioning",
            "heating",
            "bath_tub",
            "personal_care",
            "outdoor_shower",
            "washer",
            "dryer",
            "hangers",
            "iron",
            "tv",
            "dedicated_workspace",
            "security_cameras",
            "fire_extinguisher",
            "first_aid",
            "cooking_set",
            "refrigerator",
            "microwave",
            "stove",
            "barbecue_grill",
            "outdoor_dining_area",
            "private_patio_or_balcony",
            "camp_fire",
            "garden",
            "free_parking",
            "self_check_in",
            "pet_allowed",
            "category",
            "beds",
            "apt_suite",
            "province",
            "region",
            "country",
            "latitude",
            "longitude",
        ]

    def _resolve_coordinates(self, validated_data, instance=None):
        lat = validated_data.get(
            "latitude", getattr(instance, "latitude", None) if instance else None
        )
        lon = validated_data.get(
            "longitude", getattr(instance, "longitude", None) if instance else None
        )

        if lat is not None and lon is not None:
            return lat, lon

        address = validated_data.get(
            "address", getattr(instance, "address", "") if instance else ""
        )
        city = validated_data.get(
            "city", getattr(instance, "city", "") if instance else ""
        )
        province = validated_data.get(
            "province", getattr(instance, "province", "") if instance else ""
        )
        region = validated_data.get(
            "region", getattr(instance, "region", "") if instance else ""
        )
        district = validated_data.get(
            "district", getattr(instance, "district", "") if instance else ""
        )
        country = validated_data.get(
            "country", getattr(instance, "country", "Nepal") if instance else "Nepal"
        )

        geo_lat, geo_lon = geocode_listing_address(
            address=address,
            city=city,
            province=province,
            region=region,
            district=district,
            country=country,
        )
        return geo_lat, geo_lon

    def create(self, validated_data):
        lat, lon = self._resolve_coordinates(validated_data)
        validated_data["latitude"] = lat
        validated_data["longitude"] = lon
        return Listing.objects.create(**validated_data)

    def update(self, instance, validated_data):
        lat, lon = self._resolve_coordinates(validated_data, instance=instance)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.latitude = lat
        instance.longitude = lon
        instance.save()
        return instance


class WishlistSerializer(serializers.ModelSerializer):
    listing_details = serializers.SerializerMethodField()

    class Meta:
        model = Wishlist
        fields = ["id", "listing", "listing_details", "created_at"]

    def get_listing_details(self, obj):
        return ListingListSerializer(obj.listing, context=self.context).data


# class BookingCreateSerializer(serializers.ModelSerializer):
#     total_nights = serializers.ReadOnlyField()

#     class Meta:
#         model = Booking
#         fields = [
#             "id",
#             "listing",
#             "check_in",
#             "check_out",
#             "guests_count",
#             "special_requests",
#             "total_amount",
#             "cleaning_fee",
#             "service_fee",
#             "total_nights",
#             "status",
#             "payment_status",
#             "payment_method",
#             "created_at",
#         ]

#         read_only_fields = [
#             "id",
#             "total_amount",
#             "cleaning_fee",
#             "service_fee",
#             "status",
#             "payment_status",
#             "payment_method",
#             "created_at",
#         ]

#     def validate(self, attrs):
#         check_in = attrs.get("check_in")
#         check_out = attrs.get("check_out")
#         guests_count = attrs.get("guests_count")
#         listing = attrs.get("listing")

#         # check in chai future mah huna parcha
#         from django.utils.timezone import now

#         if check_in < now().date():
#             raise serializers.ValidationError(
#                 {"check_in": "check-in date cannot be in the past."}
#             )
#         # check out must be after check in
#         if check_out <= check_in:
#             raise serializers.ValidationError(
#                 {"check_out": "Check-out must be after check-in date."}
#             )

#         # guests must not exceed listing max
#         if guests_count > listing.max_guests:
#             raise serializers.ValidationError(
#                 {"guests_count": f"Max guests allowed is {listing.max_guests}."}
#             )
#         # check if listing is available(no overlapping confirmed/paid bookings)
#         overlapping = Booking.objects.filter(
#             listing=listing,
#             status__in=["pending", "confirmed", "paid"],
#             check_in__lt=check_out,
#             check_out__gt=check_in,
#         ).exists()


#         if overlapping:
#             raise serializers.ValidationError(
#                 {"check_in": "This listing is already booked for the selected dates."}
#             )
#         return attrs
class BookingCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = [
            "listing",
            "check_in",
            "check_out",
            "guests_count",
            "special_requests",
        ]

        extra_kwargs = {
            "special_requests": {"required": False},
        }

    def validate(self, attrs):
        check_in = attrs.get("check_in")
        check_out = attrs.get("check_out")
        guests_count = attrs.get("guests_count")
        listing = attrs.get("listing")

        from django.utils.timezone import now

        if check_in < now().date():
            raise serializers.ValidationError(
                {"check_in": "check-in date cannot be in the past."}
            )

        if check_out <= check_in:
            raise serializers.ValidationError(
                {"check_out": "Check-out must be after check-in date."}
            )

        if guests_count > listing.max_guests:
            raise serializers.ValidationError(
                {"guests_count": f"Max guests allowed is {listing.max_guests}."}
            )

        overlapping = Booking.objects.filter(
            listing=listing,
            status__in=["pending", "confirmed", "paid"],
            check_in__lt=check_out,
            check_out__gt=check_in,
        ).exists()

        if overlapping:
            raise serializers.ValidationError(
                {"check_in": "This listing is already booked for the selected dates."}
            )

        return attrs


class BookingDetailSerializer(serializers.ModelSerializer):
    listing_title = serializers.CharField(source="listing.title", read_only=True)
    listing_image = serializers.SerializerMethodField()
    listing_city = serializers.CharField(source="listing.city", read_only=True)
    guest_name = serializers.SerializerMethodField()
    host_name = serializers.SerializerMethodField()
    host_id = serializers.IntegerField(source="listing.host.id", read_only=True)
    total_nights = serializers.ReadOnlyField()
    can_review = serializers.SerializerMethodField()
    has_review = serializers.SerializerMethodField()
    review_id = serializers.SerializerMethodField()

    class Meta:
        model = Booking
        fields = [
            "id",
            "listing",
            "listing_title",
            "listing_image",
            "listing_city",
            "guest_name",
            "host_name",
            "host_id",
            "check_in",
            "check_out",
            "guests_count",
            "special_requests",
            "total_amount",
            "cleaning_fee",
            "service_fee",
            "total_nights",
            "status",
            "payment_status",
            "payment_method",
            "khalti_transaction_id",
            "esewa_transaction_uuid",
            "esewa_ref_id",
            "paid_at",
            "host_responded_at",
            "host_rejection_reasons",
            "created_at",
            "updated_at",
            "can_review",
            "has_review",
            "review_id",
            "room_subtotal",
            "cleaning_fee",
            "service_fee",
            "total_amount",
            "host_payout",
            "superadmin_revenue",
        ]

    def get_listing_image(self, obj):
        primary = obj.listing.images.filter(is_primary=True).first()
        if not primary:
            primary = obj.listing.images.first()
        if primary:
            request = self.context.get("request")
            if request:
                return request.build_absolute_uri(primary.image.url)
            return primary.image.url
        return None

    def get_guest_name(self, obj):
        return f"{obj.guest.first_name} {obj.guest.last_name}"

    def get_host_name(self, obj):
        return f"{obj.listing.host.first_name} {obj.listing.host.last_name}"

    def get_has_review(self, obj):
        return hasattr(obj, "review")

    def get_review_id(self, obj):

        if hasattr(obj, "review"):
            return obj.review.id
        return None

    def get_can_review(self, obj):
        today = timezone.now().date()

        if obj.check_out >= today:
            return False

        if hasattr(obj, "review"):
            return False

        if obj.status not in ["confirmed", "paid", "completed"]:
            return False

        return True


class ReviewCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ["id", "booking", "rating", "comment"]

    def validate(self, attrs):
        request = self.context.get("request")
        booking = attrs.get("booking")

        if booking.guest != request.user:
            raise serializers.ValidationError("You can only review your own booking.")

        if booking.check_out >= timezone.now().date():
            raise serializers.ValidationError("You can review only after checkout.")

        if hasattr(booking, "review"):
            raise serializers.ValidationError("You already reviewed this booking.")

        if booking.status not in ["confirmed", "paid", "completed"]:
            raise serializers.ValidationError(
                "This booking is not eligible for review."
            )

        return attrs

    def create(self, validated_data):
        booking = validated_data["booking"]
        request = self.context.get("request")

        review = Review.objects.create(
            booking=booking,
            reviewer=request.user,
            listing=booking.listing,
            rating=validated_data["rating"],
            comment=validated_data["comment"],
        )
        return review


class PublicReviewSerializer(serializers.ModelSerializer):
    reviewer_name = serializers.SerializerMethodField()
    reviewer_avatar = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = [
            "id",
            "rating",
            "comment",
            "created_at",
            "reviewer_name",
            "reviewer_avatar",
        ]

    def get_reviewer_name(self, obj):
        full_name = f"{obj.reviewer.first_name} {obj.reviewer.last_name}".strip()
        return full_name if full_name else obj.reviewer.email

    def get_reviewer_avatar(self, obj):
        if hasattr(obj.reviewer, "profile_image") and obj.reviewer.profile_image:
            request = self.context.get("request")
            if request:
                return request.build_absolute_uri(obj.reviewer.profile_image.url)
            return obj.reviewer.profile_image.url
        return None


class PlatformSettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlatformSetting
        fields = ["site_name", "service_fee_percent", "updated_at"]


class ListingMapSerializer(serializers.ModelSerializer):
    primary_image = serializers.SerializerMethodField()

    class Meta:
        model = Listing
        fields = [
            "id",
            "title",
            "city",
            "district",
            "region",
            "province",
            "address",
            "price_per_night",
            "latitude",
            "longitude",
            "primary_image",
            "category",
            "property_type",
        ]

    def get_primary_image(self, obj):
        request = self.context.get("request")
        primary_image = obj.images.filter(is_primary=True).first()
        if not primary_image:
            primary_image = obj.images.first()

        if primary_image:
            if request:
                return request.build_absolute_uri(primary_image.image.url)
            return primary_image.image.url
        return None
