from django.db.models import Q
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly

from .models import Category, Post
from .permissions import IsAdminOrReadOnly, IsOwnerOrReadOnly
from .serializers import CategorySerializer, PostListSerializer, PostSerializer


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAdminOrReadOnly]
    pagination_class = None


class PostViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ["title"]
    ordering_fields = ["published_at", "created_at", "title"]

    def get_queryset(self):
        qs = Post.objects.select_related("author", "category")
        user = self.request.user

        if self.action == "list":
            qs = qs.filter(is_published=True)
            category = self.request.query_params.get("category")
            if category:
                qs = qs.filter(category__slug=category)
        elif user.is_authenticated:
            qs = qs.filter(Q(is_published=True) | Q(author=user))
        else:
            qs = qs.filter(is_published=True)
        return qs

    def get_serializer_class(self):
        if self.action in ("list", "mine"):
            return PostListSerializer
        return PostSerializer

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    @action(detail=False, methods=["get"], permission_classes=[IsAuthenticated])
    def mine(self, request):
        qs = self.filter_queryset(
            Post.objects.filter(author=request.user).select_related("author", "category")
        )
        page = self.paginate_queryset(qs)
        serializer = PostListSerializer(page, many=True, context={"request": request})
        return self.get_paginated_response(serializer.data)