from django.contrib import admin

from .models import Channel, ForumPost, ForumPostLike, ForumReply, Topic


@admin.register(Channel)
class ChannelAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "sort_order")
    prepopulated_fields = {"slug": ("name",)}


@admin.register(Topic)
class TopicAdmin(admin.ModelAdmin):
    list_display = ("name", "slug")
    prepopulated_fields = {"slug": ("name",)}


@admin.register(ForumPost)
class ForumPostAdmin(admin.ModelAdmin):
    list_display = ("title", "author", "channel", "pinned", "created_at")
    list_filter = ("channel", "pinned")
    search_fields = ("title", "body")


@admin.register(ForumReply)
class ForumReplyAdmin(admin.ModelAdmin):
    list_display = ("post", "author", "created_at")


@admin.register(ForumPostLike)
class ForumPostLikeAdmin(admin.ModelAdmin):
    list_display = ("post", "user", "created_at")
