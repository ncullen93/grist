from django.contrib import admin

from .models import Listing, ListingLike, ListingReply, ListingTag


@admin.register(ListingTag)
class ListingTagAdmin(admin.ModelAdmin):
    list_display = ("name", "slug")
    prepopulated_fields = {"slug": ("name",)}


@admin.register(Listing)
class ListingAdmin(admin.ModelAdmin):
    list_display = ("title", "author", "category", "price", "created_at")
    list_filter = ("category",)
    search_fields = ("title", "description")


@admin.register(ListingReply)
class ListingReplyAdmin(admin.ModelAdmin):
    list_display = ("listing", "author", "created_at")


@admin.register(ListingLike)
class ListingLikeAdmin(admin.ModelAdmin):
    list_display = ("listing", "user", "created_at")
