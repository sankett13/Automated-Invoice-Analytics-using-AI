from django.urls import path
from .import views

urlpatterns = [
    path('login/', views.CookieLoginView.as_view(),name='CookieLoginView'),
    path('logout/', views.CookieLogoutView.as_view(),name='CookieLogoutView'),
    path('auth/check/', views.ProtectedView.as_view(), name='auth-check'),
    path('upload/', views.FileUploadView.as_view(), name='uploadFile'),

]
