from rest_framework.response import Response
from rest_framework.views import APIView

from apps.blog.models import BlogPost
from apps.blog.serializers import BlogPostListSerializer
from apps.events.models import Event
from apps.events.serializers import EventListSerializer
from apps.forum.models import ForumPost
from apps.forum.serializers import ForumPostListSerializer
from apps.members.models import MemberProfile
from apps.members.serializers import MemberProfileListSerializer


class HomeFeedView(APIView):
    """Aggregated home feed for /m dashboard."""

    def get(self, request):
        blog_posts = (
            BlogPost.objects.select_related("author__profile")
            .prefetch_related("comments", "likes")
            .order_by("-created_at")[:10]
        )
        upcoming_events = Event.objects.filter(status="upcoming").prefetch_related("rsvps")[:5]
        popular_forum = (
            ForumPost.objects.select_related("author__profile", "channel")
            .prefetch_related("replies", "likes", "topics")
            .order_by("-created_at")[:5]
        )
        recent_members = MemberProfile.objects.order_by("-created_at")[:3]

        audience = request.query_params.get("audience", "all")
        if audience == "following":
            following_ids = request.user.following.values_list("following_id", flat=True)
            blog_posts = blog_posts.filter(author_id__in=following_ids)
            popular_forum = popular_forum.filter(author_id__in=following_ids)

        return Response(
            {
                "stats": {
                    "member_count": MemberProfile.objects.count(),
                    "forum_post_count": ForumPost.objects.count(),
                    "upcoming_event_count": Event.objects.filter(status="upcoming").count(),
                },
                "blog_posts": BlogPostListSerializer(
                    blog_posts, many=True, context={"request": request}
                ).data,
                "upcoming_events": EventListSerializer(
                    upcoming_events, many=True, context={"request": request}
                ).data,
                "popular_forum_posts": ForumPostListSerializer(
                    popular_forum, many=True, context={"request": request}
                ).data,
                "recent_members": MemberProfileListSerializer(recent_members, many=True).data,
            }
        )
