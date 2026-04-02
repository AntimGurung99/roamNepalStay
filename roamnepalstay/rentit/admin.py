from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.html import format_html
from django.urls import reverse

from .models import User, HostApplication, Listing, ListingImage, Booking, Review
from .forms import CustomUserCreationForm, CustomUserChangeForm
from .models import PlatformSetting


# Customize User Admin (EMAIL LOGIN)
class UserAdmin(BaseUserAdmin):
    add_form = CustomUserCreationForm
    form = CustomUserChangeForm
    model = User

    list_display = (
        "email",
        "first_name",
        "last_name",
        "is_host",
        "host_application_status",
        "is_staff",
        "is_active",
        "delete_user_button",
    )

    list_filter = (
        "is_staff",
        "is_superuser",
        "is_active",
        "groups",
        "is_host",
        "host_application_status",
    )

    search_fields = ("email", "first_name", "last_name")
    ordering = ("email",)

    # Enable editing directly from the list view
    list_editable = ("is_staff", "is_active", "is_host", "host_application_status")

    fieldsets = (
        (None, {"fields": ("email", "password")}),
        (
            "Personal info",
            {
                "fields": (
                    "first_name",
                    "last_name",
                    "phone_number",
                    # "address",
                    "city",
                    "country",
                    "date_of_birth",
                    "profile_image",
                    "accepted_terms",
                )
            },
        ),
        ("Host Status", {"fields": ("is_host", "host_application_status")}),
        (
            "Permissions",
            {
                "fields": (
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    "groups",
                    "user_permissions",
                )
            },
        ),
        ("Important dates", {"fields": ("last_login", "date_joined")}),
    )

    # Fields for the add user page
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": (
                    "email",
                    "first_name",
                    "last_name",
                    "password1",
                    "password2",
                    "phone_number",
                    "city",
                    "country",
                    "date_of_birth",
                    "profile_image",
                    "accepted_terms",
                    # host/admin flags
                    "is_host",
                    "host_application_status",
                    "is_staff",
                    "is_active",
                ),
            },
        ),
    )

    def delete_user_button(self, obj):
        return format_html(
            '<a class="button" style="background-color: #dc3545; color: white; padding: 5px 10px; border-radius: 4px; text-decoration: none;" href="{}">Delete</a>',
            reverse("admin:rentit_user_delete", args=[obj.pk]),
        )

    delete_user_button.short_description = "Actions"
    delete_user_button.allow_tags = True


# Host Application Admin
@admin.register(HostApplication)
class HostApplicationAdmin(admin.ModelAdmin):
    list_display = ("user", "status", "applied_at", "reviewed_by")
    list_filter = ("status", "applied_at")
    search_fields = ("user__email", "business_name")
    readonly_fields = ("applied_at", "updated_at")
    list_editable = ("status",)


# Listing Image Inline to show inside Listing
class ListingImageInline(admin.TabularInline):
    model = ListingImage
    extra = 1


# Listing Admin
@admin.register(Listing)
class ListingAdmin(admin.ModelAdmin):
    list_display = ("title", "host", "city", "price_per_night", "status", "created_at")
    list_filter = ("status", "property_type", "city", "created_at")
    search_fields = ("title", "description", "city", "host__email")
    inlines = [ListingImageInline]
    actions = ["approve_listings", "suspend_listings"]
    list_editable = ("status",)

    def approve_listings(self, request, queryset):
        queryset.update(status="published")

    approve_listings.short_description = "Mark selected listings as Published"

    def suspend_listings(self, request, queryset):
        queryset.update(status="suspended")

    suspend_listings.short_description = "Suspend selected listings"


# Booking Admin
@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "get_listing_title",
        "get_guest_name",
        "check_in",
        "check_out",
        "payment_status",
        "total_amount",
        "status",
        "created_at",
    )
    list_filter = ("status", "check_in", "check_out")
    search_fields = ("listing__title", "guest__email", "id")
    date_hierarchy = "check_in"
    list_editable = ("status",)

    def get_listing_title(self, obj):
        return obj.listing.title

    get_listing_title.short_description = "Listing"

    def get_guest_name(self, obj):
        return f"{obj.guest.first_name} {obj.guest.last_name}"

    get_guest_name.short_description = "Guest"


# Review Admin
@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ("listing", "reviewer", "rating", "is_approved", "created_at")
    list_filter = ("rating", "is_approved", "created_at")
    search_fields = ("listing__title", "reviewer__email", "comment")
    list_editable = ("is_approved",)


# Register our custom User admin
admin.site.register(User, UserAdmin)


@admin.register(PlatformSetting)
class PlatformSettingAdmin(admin.ModelAdmin):
    list_display = ("site_name", "service_fee_percent", "updated_at")

    def has_add_permission(self, request):
        return not PlatformSetting.objects.exists()

    def has_delete_permission(self, request, obj=None):
        return False
