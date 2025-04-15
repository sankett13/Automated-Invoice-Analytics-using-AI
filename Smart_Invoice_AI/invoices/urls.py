from django.urls import path
from . import views

urlpatterns = [
    path('', views.InvoiceView.as_view(), name='InvoiceView'),
    path('chatbot/', views.ChatBotView.as_view(), name='ChatBotView'),
]