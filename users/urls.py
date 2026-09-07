from django.urls import path
from .views import CurrentUserView, RegisterView, VerifyEmailView, AdminUserListView, UpdateProfileView, ChangePasswordView, DeleteAccountView, RegisterPushTokenView

urlpatterns = [
    path('me/', CurrentUserView.as_view(), name='current-user'),
    path('register/', RegisterView.as_view(), name='register'),
    path('verify-email/', VerifyEmailView.as_view(), name='verify-email'),
    path('admin/users/', AdminUserListView.as_view(), name='admin-users'),
    path('admin/users/<int:pk>/', AdminUserListView.as_view(), name='admin-user-detail'),
    path('me/update/', UpdateProfileView.as_view(), name='update-profile'),
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('me/delete/', DeleteAccountView.as_view(), name='delete-account'),
    path('push-token/', RegisterPushTokenView.as_view(), name='push-token'),
]
