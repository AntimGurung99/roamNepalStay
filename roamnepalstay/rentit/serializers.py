from django.contrib.auth import get_user_model, authenticate
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers
from .models import Listing, ListingImage, HostApplication, Booking, Review, Wishlist

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ("first_name", "last_name", "email", "password", "confirm_password")
        extra_kwargs = {"password": {"write_only": True}}

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

        if User.objects.filter(
            first_name__iexact=first_name, last_name__iexact=last_name
        ).exists():
            raise serializers.ValidationError({"name": ["Same name already exists."]})

        if User.objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError({"email": ["Email already exists."]})

        attrs["first_name"] = first_name
        attrs["last_name"] = last_name
        attrs["email"] = email
        return attrs

    def create(self, validated_data):
        validated_data.pop("confirm_password")

        user = User(
            username=validated_data["email"],
            email=validated_data["email"],
            first_name=validated_data["first_name"],
            last_name=validated_data["last_name"],
        )
        user.set_password(validated_data["password"])
        user.save()
        return user


class RegisterResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "first_name", "last_name", "email", "is_host", "host_application_status")


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = (attrs.get("email") or "").strip().lower()
        password = attrs.get("password")

        try:
            user_obj = User.objects.get(email__iexact=email)
        except User.DoesNotExist:

            raise serializers.ValidationError({"detail": "Invalid email or password."})

        user = authenticate(username=user_obj.username, password=password)
        if not user:

            raise serializers.ValidationError({"detail": "Invalid email or password."})

        attrs["user"] = user
        return attrs


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
            "username",
            "email",
            "first_name",
            "last_name",
            "full_name",
            "phone_number",
            "address",
            "profile_image",
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
class HostApplicationSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()
    user_email = serializers.SerializerMethodField()

    class Meta:
        model = HostApplication
        fields = [
            "id",
            "user",
            "user_name",
            "user_email",
            "citizenship_number",
            "citizenship_image",
            "business_name",
            "business_registration",
            "tax_number",
            "bank_name",
            "account_number",
            "account_holder_name",
            "status",
            "reviewed_by",
            "review_notes",
            "reviewed_at",
            "applied_at",
            "updated_at",
        ]
        read_only_fields = ["user", "status", "reviewed_by", "reviewed_at", "review_notes"]

    def get_user_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}"

    def get_user_email(self, obj):
        return obj.user.email


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
class ListingDetailSerializer(serializers.ModelSerializer):
    host_name = serializers.SerializerMethodField()
    images = ListingImageSerializer(many=True, read_only=True)
    moderated_by_name = serializers.SerializerMethodField()
    amenities = serializers.SerializerMethodField()
    is_wishlisted = serializers.SerializerMethodField()

    class Meta:
        model = Listing
        fields = [
            "id",
            "title",
            "description",
            "highlight",
            "highlight_details",
            "property_type",
            "city",
            "district",
            "address",
            "latitude",
            "longitude",
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
            "status",
            "host",
            "host_name",
            "images",
            "moderated_by",
            "moderated_by_name",
            "moderation_reason",
            "moderated_at",
            "created_at",
            "updated_at",
            "amenities",
            "is_wishlisted",
        ]

    def get_is_wishlisted(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            return Wishlist.objects.filter(user=request.user, listing=obj).exists()
        return False

    def get_host_name(self, obj):
        return f"{obj.host.first_name} {obj.host.last_name}"

    def get_moderated_by_name(self, obj):
        if obj.moderated_by:
            return f"{obj.moderated_by.first_name} {obj.moderated_by.last_name}"
        return None

    def get_amenities(self, obj):
        """Return list of enabled amenities"""
        amenity_fields = [
            'wifi', 'parking', 'kitchen', 'air_conditioning', 'heating',
            'bath_tub', 'personal_care', 'outdoor_shower', 'washer', 'dryer',
            'hangers', 'iron', 'tv', 'dedicated_workspace', 'security_cameras',
            'fire_extinguisher', 'first_aid', 'cooking_set', 'refrigerator',
            'microwave', 'stove', 'barbecue_grill', 'outdoor_dining_area',
            'private_patio_or_balcony', 'camp_fire', 'garden', 'free_parking',
            'self_check_in', 'pet_allowed'
        ]
        return [field for field in amenity_fields if getattr(obj, field, False)]


# booking ko list dekhauna ko lagi
class BookingListSerializer(serializers.ModelSerializer):
    guest_name = serializers.SerializerMethodField()
    listing_title = serializers.SerializerMethodField()
    host_name = serializers.SerializerMethodField()

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
class ReviewListSerializer(serializers.ModelSerializer):
    reviewer_name = serializers.SerializerMethodField()
    listing_title = serializers.SerializerMethodField()
    moderated_by_name = serializers.SerializerMethodField()

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
    recent_reviews = ReviewListSerializer(many=True)





class ListingCreateSerializer(serializers.ModelSerializer):
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
        ]

    def create(self, validated_data):
        return Listing.objects.create(**validated_data)


class WishlistSerializer(serializers.ModelSerializer):
    listing_details = serializers.SerializerMethodField()

    class Meta:
        model = Wishlist
        fields = ["id", "listing", "listing_details", "created_at"]

    def get_listing_details(self, obj):
        return ListingListSerializer(obj.listing, context=self.context).data
