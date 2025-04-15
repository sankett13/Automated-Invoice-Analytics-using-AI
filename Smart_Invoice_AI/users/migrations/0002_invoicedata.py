# Generated by Django 5.2 on 2025-04-13 04:53

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='InvoiceData',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('invoice_number', models.CharField(blank=True, max_length=255, null=True)),
                ('invoice_date', models.CharField(blank=True, max_length=255, null=True)),
                ('supplier_name', models.CharField(blank=True, max_length=255, null=True)),
                ('supplier_gst_number', models.CharField(blank=True, max_length=255, null=True)),
                ('buyer_gst_number', models.CharField(blank=True, max_length=255, null=True)),
                ('items', models.JSONField(blank=True, null=True)),
                ('cgst', models.DecimalField(blank=True, decimal_places=2, max_digits=10, null=True)),
                ('sgst', models.DecimalField(blank=True, decimal_places=2, max_digits=10, null=True)),
                ('total_tax', models.DecimalField(blank=True, decimal_places=2, max_digits=10, null=True)),
                ('total_amount', models.DecimalField(blank=True, decimal_places=2, max_digits=15, null=True)),
                ('raw_extracted_data', models.JSONField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='users.customuser')),
            ],
        ),
    ]
