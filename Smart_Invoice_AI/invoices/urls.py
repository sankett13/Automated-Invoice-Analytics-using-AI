from django.urls import path
from .views import InvoiceView, ChatBotView, AnalyticsView

urlpatterns = [
    path('invoices/', InvoiceView.as_view(), name='invoices'),
    path('chat/', ChatBotView.as_view(), name='chat'),
    path('analytics/', AnalyticsView.as_view(), name='analytics'),
]