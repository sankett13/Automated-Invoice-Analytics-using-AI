from rest_framework.response import Response
from rest_framework.views import APIView
from django.http import JsonResponse
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import CustomUser
from rest_framework.parsers import FormParser, MultiPartParser
import os
from django.conf import settings
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
import google.generativeai as genai
from google.generativeai import types
import pathlib
import mimetypes
import json

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
- Buyer GST Number: The Goods and Services Tax Identification Number (GSTIN) of the buyer, if present.
- Items: A list of all items listed in the invoice. For each item, extract:
    - Name: The description or name of the item.
    - Quantity: The quantity of the item purchased, if available.
    - Price: The price per unit of the item.
    - Total: The total price for that specific item line.
- CGST: The total amount of Central Goods and Services Tax, if mentioned. If multiple CGST entries exist, sum them. If not found, output 0.
- SGST: The total amount of State Goods and Services Tax, if mentioned. If multiple SGST entries exist, sum them. If not found, output 0.
- Total Tax: The total combined amount of all taxes (including CGST, SGST, IGST, etc.) mentioned on the invoice. If individual tax components are listed, sum them up. If no taxes are found, output 0.
- Total Amount: The final, grand total amount due on the invoice, usually found at the very end or clearly labeled as "Total", "Grand Total", "Amount Due", etc.

Format your response as a valid JSON object with the keys: "invoice_number", "invoice_date", "supplier_name", "supplier_gst_number", "buyer_gst_number", "items", "cgst", "sgst", "total_tax", and "total_amount". For the "items", provide a list of dictionaries, where each dictionary has "name", "quantity", "price", and "total" keys. If a field is not found on the invoice, its value in the JSON should be null (e.g., "supplier_gst_number": null).

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
        print('request')
        print(request)
        data = request.data
        print(data)
        email = data.get('email')
        password = data.get('password')
        print(email, password)

        user = CustomUser.objects.filter(email=email).first()
        if user is not None:
            refresh = RefreshToken.for_user(user)
            response = JsonResponse({"message": "Login successful"})
            response.set_cookie(key="refresh_token", value=str(refresh), httponly=True)
            response.set_cookie(key="access_token", value=str(refresh.access_token), httponly=True)
            return response

        return Response({"message": "Invalid credentials"}, status=401)

class ProtectedView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
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
            extrcated_text = extrcated_text[7:-3].strip()
            print(extrcated_text)
            try:
                extrcated_text_json = json.loads(extrcated_text)
                print(extrcated_text_json.get('total_amount'))
            except json.JSONDecodeError:
                return JsonResponse({"message": "File uploaded successfully", "extracted_text": extrcated_text, 'ok': True, "status": 200})

            return JsonResponse({"message": "File uploaded successfully", "extracted_text": extrcated_text, 'ok': True, "status": 200})
        return Response({"error": "No file provided"}, status=400)