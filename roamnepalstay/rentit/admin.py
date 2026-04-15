from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.html import format_html
from django.urls import reverse

from .models import User, HostApplication, Listing, ListingImage, Booking, Review
from .forms import CustomUserCreationForm, CustomUserChangeForm
from .models import PlatformSetting
from django.utils import timezone


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
# @admin.register(HostApplication)
# class HostApplicationAdmin(admin.ModelAdmin):
#     list_display = ("user", "status", "applied_at", "reviewed_by")
#     list_filter = ("status", "applied_at")
#     search_fields = ("user__email", "business_name")
#     readonly_fields = ("applied_at", "updated_at")
#     list_editable = ("status",)
@admin.register(HostApplication)
class HostApplicationAdmin(admin.ModelAdmin):
    list_display = (
        "user",
        "status",
        "user_phone",
        "phone_verified_check",
        "identity_verified_check",
        "property_verified_check",
        "bank_verified_check",
        "applied_at",
        "reviewed_by",
    )

    list_filter = (
        "status",
        "phone_verified_check",
        "identity_verified_check",
        "property_verified_check",
        "bank_verified_check",
        "applied_at",
        "reviewed_at",
    )

    search_fields = (
        "user__email",
        "user__first_name",
        "user__last_name",
        "user__phone_number",
        "citizenship_number",
        "property_address",
        "bank_name",
        "account_holder_name",
        "business_name",
    )

    readonly_fields = (
        "applied_at",
        "updated_at",
        "reviewed_at",
        "user_email",
        "user_phone",
    )

    fieldsets = (
        (
            "Applicant",
            {
                "fields": (
                    "user",
                    "user_email",
                    "user_phone",
                    "status",
                    "applied_at",
                    "updated_at",
                )
            },
        ),
        (
            "Identity Verification",
            {
                "fields": (
                    "citizenship_number",
                    "citizenship_front_image",
                    "selfie_with_id",
                    "permanent_address",
                )
            },
        ),
        (
            "Property Verification",
            {
                "fields": (
                    "property_address",
                    "ownership_document",
                )
            },
        ),
        (
            "Bank Information",
            {
                "fields": (
                    "bank_name",
                    "account_number",
                    "account_holder_name",
                )
            },
        ),
        (
            "Optional Business Information",
            {
                "fields": (
                    "business_name",
                    "pan_card_image",
                )
            },
        ),
        (
            "Agreement",
            {"fields": ("agreed_to_terms",)},
        ),
        (
            "Verification Checklist",
            {
                "fields": (
                    "phone_verified_check",
                    "identity_verified_check",
                    "property_verified_check",
                    "bank_verified_check",
                )
            },
        ),
        (
            "Admin Review",
            {
                "fields": (
                    "reviewed_by",
                    "review_notes",
                    "reviewed_at",
                )
            },
        ),
    )

    actions = [
        "mark_needs_more_info",
        "approve_selected_applications",
        "reject_selected_applications",
    ]

    def user_email(self, obj):
        return obj.user.email

    user_email.short_description = "User Email"

    def user_phone(self, obj):
        return obj.user.phone_number or "-"

    user_phone.short_description = "User Phone"

    def approve_selected_applications(self, request, queryset):
        updated_count = 0

        for application in queryset.select_related("user"):
            all_checks_passed = all(
                [
                    application.phone_verified_check,
                    application.identity_verified_check,
                    application.property_verified_check,
                    application.bank_verified_check,
                ]
            )

            if not all_checks_passed:
                continue

            application.status = "approved"
            application.reviewed_by = request.user
            application.reviewed_at = timezone.now()
            application.save()

            user = application.user
            user.is_host = True
            user.host_application_status = "approved"
            user.save(update_fields=["is_host", "host_application_status"])

            updated_count += 1

        self.message_user(
            request, f"{updated_count} host application(s) approved successfully."
        )

    approve_selected_applications.short_description = "Approve selected applications"

    def reject_selected_applications(self, request, queryset):
        updated_count = 0

        for application in queryset.select_related("user"):
            application.status = "rejected"
            application.reviewed_by = request.user
            application.reviewed_at = timezone.now()
            application.save()

            user = application.user
            user.is_host = False
            user.host_application_status = "rejected"
            user.save(update_fields=["is_host", "host_application_status"])

            updated_count += 1

        self.message_user(
            request, f"{updated_count} host application(s) rejected successfully."
        )

    reject_selected_applications.short_description = "Reject selected applications"

    def mark_needs_more_info(self, request, queryset):
        updated_count = 0

        for application in queryset.select_related("user"):
            application.status = "needs_more_info"
            application.reviewed_by = request.user
            application.reviewed_at = timezone.now()
            application.save()

            user = application.user
            user.is_host = False
            user.host_application_status = "needs_more_info"
            user.save(update_fields=["is_host", "host_application_status"])

            updated_count += 1

        self.message_user(
            request, f"{updated_count} application(s) marked as needs more info."
        )

    mark_needs_more_info.short_description = "Mark selected as needs more info"


def save_model(self, request, obj, form, change):
    obj.reviewed_by = obj.reviewed_by or request.user

    if (
        obj.status in ["approved", "rejected", "needs_more_info"]
        and not obj.reviewed_at
    ):
        obj.reviewed_at = timezone.now()

    super().save_model(request, obj, form, change)

    user = obj.user

    if obj.status == "approved":
        user.is_host = True
        user.host_application_status = "approved"

    elif obj.status == "rejected":
        user.is_host = False
        user.host_application_status = "rejected"

    elif obj.status == "needs_more_info":
        user.is_host = False
        user.host_application_status = "needs_more_info"

    else:
        user.is_host = False
        user.host_application_status = "pending"

    user.save(update_fields=["is_host", "host_application_status"])


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
    list_display = (
        "site_name",
        "fee_0_to_2000_percent",
        "fee_2001_to_6000_percent",
        "fee_6001_and_above_percent",
        "updated_at",
    )

    def has_add_permission(self, request):
        return not PlatformSetting.objects.exists()

    def has_delete_permission(self, request, obj=None):
        return False
