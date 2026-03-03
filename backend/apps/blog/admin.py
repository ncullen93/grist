from django.contrib import admin

from .models import BlogComment, BlogPost, BlogPostLike


@admin.register(BlogPost)
class BlogPostAdmin(admin.ModelAdmin):
    list_display = ("title", "author", "created_at")
    search_fields = ("title", "content")


@admin.register(BlogComment)
class BlogCommentAdmin(admin.ModelAdmin):
    list_display = ("post", "author", "created_at")


@admin.register(BlogPostLike)
class BlogPostLikeAdmin(admin.ModelAdmin):
    list_display = ("post", "user", "created_at")
