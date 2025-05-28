from rest_framework.views import APIView
from rest_framework.response import Response
from users.models import CustomUser, InvoiceData
import google.generativeai as genai
from google.generativeai import types
from django.db.models import Sum, Avg, Count
from django.db.models.functions import TruncMonth, Cast
from django.db.models import DateField
from datetime import datetime, timedelta
from decimal import Decimal
from collections import defaultdict


genai.configure(api_key="AIzaSyBC8yV7_4RO3paTUgLPQf6WLYIZ7lnqzgw")
gemini_flash = genai.GenerativeModel("gemini-1.5-flash")


class InvoiceView(APIView):
    def get(self, request, format=None):
        print("here")
        try:
            user_id = request.session.get('user_id')
            # print(user_id)
            C_user = CustomUser.objects.get(id=user_id)
            # print(C_user)
            invoices = InvoiceData.objects.filter(user=C_user)
            # print(invoices)
            invoice_list = []
            for invoice in invoices:
                invoice_list.append({
                    "invoice_number": invoice.invoice_number,
                    "invoice_date": invoice.invoice_date,
                    "supplier_name": invoice.supplier_name,
                    "supplier_gst_number": invoice.supplier_gst_number,
                    "buyer_gst_number": invoice.buyer_gst_number,
                    "items": invoice.items,
                    "cgst": invoice.cgst,
                    "sgst": invoice.sgst,
                    "total_tax": invoice.total_tax,
                    "total_amount": invoice.total_amount,
                    "category": invoice.category
                })
            
            return Response({"invoices": invoice_list})
        except Exception as e:
            print(e)
            return Response({"error": "error"})\
            

class ChatBotView(APIView):

    def post(self, request, format=None):
        SYSTEM_INSTRUCTIONS = """
You are a knowledgeable and helpful financial assistant specializing in Indian invoices and taxation.

Your primary goal is to provide concise and professional information related to invoices, GST (Goods and Services Tax), CGST (Central GST), SGST (State GST), and other taxes applicable in India.

When answering questions:

- Prioritize direct and accurate answers based on your understanding of Indian financial regulations and general knowledge.
- If the question pertains to specific invoice details (e.g., a particular invoice number or transaction), and you do not have access to that specific data, clearly state that you lack that specific information.
- For general queries about GST, CGST, SGST, and other Indian taxes, provide accurate and up-to-date information regarding their definitions, applicability, and basic principles.
- Avoid making up information or speculating. If unsure, explicitly say, "I do not have the specific information."
- Maintain a professional and helpful tone throughout the conversation.
-Always verify the accuracy of the information you provide and suggest corrections if needed under Note: section.

provide the information in the structured manner with necessary breaks and spaces use next line for each point like invoide number then next line, do not use * any where in the response.
"""
        print("here")
        user_id = request.session.get('user_id')
        C_user = CustomUser.objects.get(id=user_id)
        invoices = InvoiceData.objects.filter(user=C_user)
        invoice_data = []
        for i in invoices:
            invoice_data.append({
                "raw_text" :i.raw_extracted_data,
            })
        print(invoice_data)
        prompt = request.data.get('message')
        # print(prompt)
        prompt_sys_ins = f"{SYSTEM_INSTRUCTIONS} \n\nuse the following invoice data for the user invoice information: {invoice_data}\n\nUser: {prompt}"
        response = gemini_flash.generate_content(
            contents=[{"role":"user","parts":prompt_sys_ins}],
            generation_config={
                "max_output_tokens": 1024
            }
        )
        print(response.text)

        return Response({"response": response.text})

class AnalyticsView(APIView):
    def get(self, request, format=None):
        try:
            print("Analytics request received")
            user_id = request.session.get('user_id')
            print(f"User ID from session: {user_id}")
            
            if not user_id:
                print("No user ID in session")
                return Response({
                    'error': 'User not authenticated',
                    'message': 'Please log in to view analytics'
                }, status=401)

            user = CustomUser.objects.get(id=user_id)
            print(f"Found user: {user.email}")
            
            invoices = InvoiceData.objects.filter(user=user)
            print(f"Found {invoices.count()} invoices for user")

            # Basic metrics
            total_invoices = invoices.count()
            total_amount = invoices.aggregate(total=Sum('total_amount'))['total'] or Decimal('0.00')
            average_amount = invoices.aggregate(avg=Avg('total_amount'))['avg'] or Decimal('0.00')
            # print(f"Basic metrics - Total: {total_invoices}, Amount: {total_amount}, Avg: {average_amount}")

            # Top vendors by amount
            top_vendors = invoices.values('supplier_name').annotate(
                amount=Sum('total_amount')
            ).order_by('-amount')[:5]
            # print(f"Top vendors query result: {list(top_vendors)}")

            top_vendors_list = [
                {
                    'name': vendor['supplier_name'] or 'Unknown',
                    'amount': float(vendor['amount'] or 0)
                }
                for vendor in top_vendors
            ]

            monthly_totals = defaultdict(float)
            current_month = datetime.now().month
            current_year = datetime.now().year
            for invoice in invoices:
                try:
                    dt = datetime.strptime(invoice.invoice_date, '%d/%m/%Y')
                    if dt.month == current_month and dt.year == current_year:
                        month_str = dt.strftime('%d %B')  # Example: 'May 2025'
                        monthly_totals[month_str] += float(invoice.total_amount or 0)
                except Exception as e:
                    continue  # skip if date is invalid

            monthly_trends_list = [
                {'month': month, 'amount': amount}
                for month, amount in sorted(monthly_totals.items())
            ]   
            
            # Category distribution
            category_distribution = invoices.values('category').annotate(
                amount=Sum('total_amount')
            ).order_by('-amount')
            # print(f"Category distribution query result: {list(category_distribution)}")

            category_distribution_list = [
                {
                    'category': dist['category'] or 'Uncategorized',
                    'amount': float(dist['amount'] or 0)
                }
                for dist in category_distribution
            ]

            # Tax distribution
            tax_distribution = invoices.values(
                'invoice_number',
                'cgst',
                'sgst',
                'total_tax'
            ).order_by('-total_tax')[:10]
            # print(f"Tax distribution query result: {list(tax_distribution)}")

            tax_distribution_list = [
                {
                    'invoice_number': tax['invoice_number'],
                    'cgst': float(tax['cgst'] or 0),
                    'sgst': float(tax['sgst'] or 0),
                    'total_tax': float(tax['total_tax'] or 0)
                }
                for tax in tax_distribution
            ]

            # print([i.invoice_date for i in invoices[:5]])

            response_data = {
                'totalInvoices': total_invoices,
                'totalAmount': float(total_amount),
                'averageAmount': float(average_amount),
                'topVendors': top_vendors_list,
                'monthlyTrends': monthly_trends_list,
                'categoryDistribution': category_distribution_list,
                'taxDistribution': tax_distribution_list
            }
            print(f"Sending response: {response_data}")
            return Response(response_data)

        except CustomUser.DoesNotExist:
            print(f"User not found for ID: {user_id}")
            return Response({
                'error': 'User not found',
                'message': 'User account not found'
            }, status=404)
        except Exception as e:
            print(f"Analytics Error: {str(e)}")
            return Response({
                'error': str(e),
                'message': 'Failed to fetch analytics data'
            }, status=500)