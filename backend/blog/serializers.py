from django.utils.text import Truncator
from rest_framework import serializers

from .models import Category, Post


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ("id", "name", "slug")
        read_only_fields = ("slug",)


class PostListSerializer(serializers.ModelSerializer):
    author = serializers.PrimaryKeyRelatedField(read_only=True)
    author_username = serializers.CharField(source="author.username", read_only=True)
    category_name = serializers.SerializerMethodField()
    excerpt = serializers.SerializerMethodField()
    is_owner = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = (
            "id", "title", "excerpt", "author", "author_username",
            "category", "category_name", "is_published",
            "published_at", "created_at", "is_owner",
        )

    def get_category_name(self, obj):
        return obj.category.name if obj.category else None

    def get_excerpt(self, obj):
        return Truncator(obj.content).chars(150)

    def get_is_owner(self, obj):
        request = self.context.get("request")
        return bool(
            request and request.user.is_authenticated and obj.author_id == request.user.id
        )


class PostSerializer(PostListSerializer):
    category = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), allow_null=True, required=False
    )

    class Meta(PostListSerializer.Meta):
        fields = (
            "id", "title", "content", "author", "author_username",
            "category", "category_name", "is_published",
            "published_at", "created_at", "updated_at", "is_owner",
        )
        read_only_fields = ("published_at", "created_at", "updated_at")