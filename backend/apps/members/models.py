from django.conf import settings
from django.db import models
from django.utils.text import slugify


class MemberProfile(models.Model):
    VISIBILITY_CHOICES = [
        ("everyone", "Everyone"),
        ("members", "Members only"),
        ("private", "Private"),
    ]

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="profile"
    )
    slug = models.SlugField(max_length=100, unique=True, db_index=True, blank=True)
    name = models.CharField(max_length=200)
    location = models.CharField(max_length=200, blank=True)
    state = models.CharField(max_length=2, blank=True)
    home_style = models.CharField(max_length=100, blank=True)
    home_year = models.PositiveIntegerField(null=True, blank=True)
    home_name = models.CharField(max_length=200, blank=True)
    bio = models.TextField(blank=True)
    photo = models.URLField(max_length=500, blank=True)
    tags = models.JSONField(default=list, blank=True)
    member_since = models.CharField(max_length=10, blank=True)
    registry = models.CharField(max_length=200, blank=True)
    story = models.JSONField(default=list, blank=True)
    profile_visibility = models.CharField(
        max_length=10, choices=VISIBILITY_CHOICES, default="members"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            base = slugify(self.name) or "member"
            self.slug = base
            counter = 1
            while MemberProfile.objects.filter(slug=self.slug).exclude(pk=self.pk).exists():
                self.slug = f"{base}-{counter}"
                counter += 1
        super().save(*args, **kwargs)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class MemberSettings(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="member_settings"
    )
    email_notifications = models.BooleanField(default=True)
    event_reminders = models.BooleanField(default=True)
    forum_digest = models.BooleanField(default=False)
    direct_messages = models.BooleanField(default=True)

    class Meta:
        verbose_name_plural = "Member settings"

    def __str__(self):
        return f"Settings for {self.user.email}"


class Follow(models.Model):
    follower = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="following"
    )
    following = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="followers"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("follower", "following")

    def __str__(self):
        return f"{self.follower} follows {self.following}"
