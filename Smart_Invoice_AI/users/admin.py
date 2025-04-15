from django.contrib import admin
from .models import CustomUser, InvoiceData
# Register your models here.

admin.site.register(CustomUser)
admin.site.register(InvoiceData)
