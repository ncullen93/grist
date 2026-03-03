from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils import timezone

from .models import ActivationCode, Application, User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ("email", "first_name", "is_staff", "date_joined")
    list_filter = ("is_staff", "is_active")
    search_fields = ("email", "first_name")
    ordering = ("-date_joined",)
    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Personal info", {"fields": ("first_name",)}),
        (
            "Permissions",
            {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")},
        ),
    )
    add_fieldsets = (
        (
            None,
            {"classes": ("wide",), "fields": ("email", "first_name", "password1", "password2")},
        ),
    )


@admin.register(ActivationCode)
class ActivationCodeAdmin(admin.ModelAdmin):
    list_display = ("code", "is_used", "used_by", "created_at")
    list_filter = ("is_used",)
    search_fields = ("code",)


@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    list_display = ("full_name", "email", "status", "created_at")
    list_filter = ("status",)
    search_fields = ("full_name", "email")
    actions = ["approve_applications"]

    @admin.action(description="Approve selected applications")
    def approve_applications(self, request, queryset):
        queryset.filter(status="pending").update(status="approved", reviewed_at=timezone.now())
