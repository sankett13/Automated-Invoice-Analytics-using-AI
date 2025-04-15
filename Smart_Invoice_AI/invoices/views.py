from rest_framework.views import APIView
from rest_framework.response import Response
from users.models import CustomUser, InvoiceData
import google.generativeai as genai
from google.generativeai import types


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
                })
            # print("response returned")
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

provide the information in the structured manner with necessary breaks and spaces
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