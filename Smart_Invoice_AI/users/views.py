from rest_framework.response import Response
from rest_framework.views import APIView
from django.http import JsonResponse
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import CustomUser, InvoiceData
from rest_framework.parsers import FormParser, MultiPartParser
import os
from django.conf import settings
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
import google.generativeai as genai
from google.generativeai import types
import mimetypes
import json
from decimal import Decimal
from django.contrib.auth import authenticate



#Genai Configuration
genai.configure(api_key="AIzaSyBC8yV7_4RO3paTUgLPQf6WLYIZ7lnqzgw")
gemini_flash = genai.GenerativeModel("gemini-1.5-flash")



##################################################### Functions ###############################################################

def extract_text_from_file(file_path):
    try:
        print(file_path)
        mime_type = mimetypes.guess_type(file_path)[0]
        if mime_type is None:
            print("Unknown file type")
            return None
        with open(file_path, 'rb') as file:
            invoice_bytes = file.read()

        prompt = """
You are an expert at extracting specific details from invoices. Please carefully read the following invoice text and identify the following fields:

- Invoice Number: The unique identification number of the invoice.
- Invoice Date: The date the invoice was issued.
- Supplier Name: The name of the seller or the company issuing the invoice.
- Supplier GST Number: The Goods and Services Tax Identification Number (GSTIN) of the supplier, if present.
- Buyer GST Number: The Goods and Services Tax Identification Number (GSTIN) of the buyer, if present somewhere under details of the recipient/receiver.
- Items: A list of all items listed in the invoice. For each item, extract:
    - Name: The description or name of the item.
    - Quantity: The quantity of the item purchased, if available.
    - Price: The price per unit of the item.
    - Total: The total price for that specific item line.
- CGST: The total amount of Central Goods and Services Tax, if mentioned. If multiple CGST entries exist, sum them. If not found, output 0.
- SGST: The total amount of State Goods and Services Tax, if mentioned. If multiple SGST entries exist, sum them. If not found, output 0.
- Total Tax: The total combined amount of all taxes (including CGST, SGST, IGST, etc.) mentioned on the invoice. If individual tax components are listed, sum them up. If no taxes are found, output 0.
- Total Amount: The final, grand total amount due on the invoice, usually found at the very end or clearly labeled as "Total", "Grand Total", "Amount Due", etc.
-Category: categorize the invoice as 'Travel', 'Food', 'Electronics', 'Clothing', 'Hardware', or 'Other' based on the items listed.

Format your response as a valid structured JSON object without any extra characters. The JSON object should have the following structure with the keys: "invoice_number", "invoice_date", "supplier_name", "supplier_gst_number", "buyer_gst_number", "items", "cgst", "sgst", "total_tax", "total_amount", and "category". For the "items", provide a list of dictionaries, where each dictionary has "name", "quantity", "price", and "total" keys. If a field is not found on the invoice, its value in the JSON should be null (e.g., "supplier_gst_number": null) do not include ',' in the all intger but correctly include '.'.

Here is the invoice text:"""
        contents =[
            {
                'role': 'user',
                "parts":[
                    {"text": prompt},
                    {"mime_type": mime_type, "data": invoice_bytes}
                ]
            }
        ]

        response = gemini_flash.generate_content(contents)
        
        if response.text:
            # print(f"Text content extracted from the document: {response.text}")
            return response.text
        else:
            print("No text content found in the document")
            return None
    except FileNotFoundError:
        print("File not found")
        return None
    except Exception as e:
        print(f"An error occurred: {e}")
        return None


class CookieLoginView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        data = request.data
        email = data.get('email')
        password = data.get('password')
        print(email, password)

        user = authenticate(email=email, password=password)
        print(user)
        if user is not None:
            print(user.email)
            request.session['user_id'] = user.id
            refresh = RefreshToken.for_user(user)
            response = JsonResponse({"message": "Login successful"})
            response.set_cookie(key="refresh_token", value=str(refresh), httponly=True)
            response.set_cookie(key="access_token", value=str(refresh.access_token), httponly=True)
            print("response returned")
            return response

        return Response({"message": "Invalid credentials"}, status=401)
    
class RegistrerView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        data = request.data
        email = data.get('email')
        password = data.get('password')
        username = data.get('username')
        print(email, password)
        if CustomUser.objects.filter(email=email).exists():
            return Response({"message": "User already exists"}, status=400)

        user = CustomUser.objects.create_user(email=email, username=username, password=password)
        user.save()
        print(user.email, user.id)
        response = JsonResponse({"message": "Registration successful"})
        return response

class ProtectedView(APIView):
    
    permission_classes = [IsAuthenticated]

    def get(self, request):
        print("Protected route accessed successfully")
        return Response({"message": "Protected route accessed successfully", 'ok': True, "status": 200})

class CookieLogoutView(APIView):
    def post(self, request):
        response = JsonResponse({"message": "Logout successful", 'ok': True, "status": 200})
        response.delete_cookie('access_token')
        response.delete_cookie('refresh_token')
        return response


class FileUploadView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):

        file = request.FILES.get('file')
        if not file:
            return Response({"error": "No file provided"}, status=400)
        if file:
            save_path = os.path.join('upload', file.name)
            path = default_storage.save(save_path, ContentFile(file.read()))
            file_url = os.path.join(settings.MEDIA_URL, path)
            local_file_path = os.path.join(settings.MEDIA_ROOT, path)
            print(local_file_path)
            extrcated_text = extract_text_from_file(local_file_path)
            extrcated_text = extrcated_text[7:-4].strip()
            print(extrcated_text)
            try:
                extrcated_text_json = json.loads(extrcated_text)
                # print(extrcated_text_json.get('total_amount'))
                user_id = request.user.id
                C_user = CustomUser.objects.get(id=user_id)
                invoice_data = InvoiceData.objects.create(
                    user=C_user,
                    invoice_number=extrcated_text_json.get('invoice_number'),
                    invoice_date=extrcated_text_json.get('invoice_date'),
                    supplier_name=extrcated_text_json.get('supplier_name'),
                    supplier_gst_number=extrcated_text_json.get('supplier_gst_number'),
                    buyer_gst_number=extrcated_text_json.get('buyer_gst_number'),
                    items=extrcated_text_json.get('items'),
                    cgst=extrcated_text_json.get('cgst'),
                    sgst=extrcated_text_json.get('sgst'),
                    total_tax=extrcated_text_json.get('total_tax'), 
                    total_amount=Decimal(extrcated_text_json.get('total_amount')),
                    category=extrcated_text_json.get('category'),
                    raw_extracted_data=extrcated_text,
                )
            except json.JSONDecodeError:
                return JsonResponse({"message": "File uploaded successfully", 'ok': True, "status": 200})

            return JsonResponse({"message": "File uploaded successfully", 'ok': True, "status": 200})
        return Response({"error": "No file provided"}, status=400)

    