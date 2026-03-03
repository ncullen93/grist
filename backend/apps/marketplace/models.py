from django.conf import settings
from django.db import models


class ListingTag(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class Listing(models.Model):
    CATEGORY_CHOICES = [
        ("for-sale", "For Sale"),
        ("wanted", "Wanted"),
        ("free", "Free"),
    ]
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="listings"
    )
    category = models.CharField(max_length=10, choices=CATEGORY_CHOICES)
    title = models.CharField(max_length=300)
    description = models.TextField()
    price = models.CharField(max_length=50, blank=True)
    image = models.CharField(max_length=500, blank=True)
    condition = models.CharField(max_length=50, blank=True)
    tags = models.ManyToManyField(ListingTag, blank=True, related_name="listings")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title


class ListingReply(models.Model):
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name="replies")
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="listing_replies"
    )
    body = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]
        verbose_name_plural = "Listing replies"

    def __str__(self):
        return f"Reply by {self.author} on {self.listing}"


class ListingLike(models.Model):
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name="likes")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("listing", "user")
