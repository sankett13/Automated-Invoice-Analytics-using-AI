from django.db import models
from django.db.models import JSONField

# Create your models here.
class CustomUser(models.Model):

    email = models.EmailField(unique=True)
    password = models.CharField(max_length=128)

    def __str__(self):
        return self.email
    
class InvoiceData(models.Model):
    category_choices = [
        ('Travel', 'Travel'),
        ('Food', 'Food'),
        ('Electronics', 'Electronics'),
        ('Clothing', 'Clothing'),
        ('Hardware', 'Hardware'),
        ('Other', 'Other'),
    ]

    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    invoice_number = models.CharField(max_length=255, blank=True, null=True)
    invoice_date = models.CharField(max_length=255, blank=True, null=True)
    supplier_name = models.CharField(max_length=255, blank=True, null=True)
    supplier_gst_number = models.CharField(max_length=255, blank=True, null=True)
    buyer_gst_number = models.CharField(max_length=255, blank=True, null=True)
    items = models.JSONField(blank=True, null=True)
    cgst = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    sgst = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    total_tax = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    total_amount = models.DecimalField(max_digits=15, decimal_places=2, blank=True, null=True)
    category = models.CharField(max_length=100, blank=True, null=True, choices=category_choices)
    raw_extracted_data = models.JSONField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Invoice #{self.invoice_number} of {self.user.email}, Total Amount: {self.total_amount}"