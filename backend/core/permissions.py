from rest_framework.permissions import BasePermission


class IsOwnerOrReadOnly(BasePermission):
    """Allow owners to edit, everyone else read-only."""

    def has_object_permission(self, request, view, obj):
        if request.method in ("GET", "HEAD", "OPTIONS"):
            return True
        return obj.author == request.user


class IsAdminUser(BasePermission):
    """Only allow users with is_staff=True."""

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_staff)
