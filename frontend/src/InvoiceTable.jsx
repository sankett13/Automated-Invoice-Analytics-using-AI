import React from "react";
import * as XLSX from 'xlsx';

const InvoiceTable = ({ invoices }) => {
  if (!invoices || invoices.length === 0) {
    return null;
  }

  const downloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(invoices.map(invoice => ({
      'Invoice No': invoice.invoice_number,
      'Date': invoice.invoice_date,
      'Supplier': invoice.supplier_name,
      'Category': invoice.category,
      'Amount': invoice.total_amount,
      'Tax': invoice.total_tax,
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Invoices');
    XLSX.writeFile(workbook, 'Invoices_data.xlsx');
  };

  return (
    <div>
      <div className="overflow-x-auto bg-white rounded-lg shadow-lg mb-4">
        <table className="min-w-full border-collapse">
          <thead>
            <tr>
              <th className="px-4 py-3 bg-[#01b8b1] text-white text-left font-medium">
                #
              </th>
              <th className="px-4 py-3 bg-[#01b8b1] text-white text-left font-medium">
                Invoice No
              </th>
              <th className="px-4 py-3 bg-[#01b8b1] text-white text-left font-medium">
                Date
              </th>
              <th className="px-4 py-3 bg-[#01b8b1] text-white text-left font-medium">
                Supplier
              </th>
              <th className="px-4 py-3 bg-[#01b8b1] text-white text-left font-medium">
                Category
              </th>
              <th className="px-4 py-3 bg-[#01b8b1] text-white text-left font-medium">
                Amount
              </th>
              <th className="px-4 py-3 bg-[#01b8b1] text-white text-left font-medium">
                Tax
              </th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice, idx) => (
              <tr
                key={invoice.id ?? idx}
                className="hover:bg-[#dff7f6] transition-colors"
              >
                <td className="p-2 border-b border-gray-200 text-[#484c4d] whitespace-nowrap">
                  {idx + 1}
                </td>
                <td className="p-2 border-b border-gray-200 text-[#484c4d] whitespace-nowrap">
                  {invoice.invoice_number || "-"}
                </td>
                <td className="p-2 border-b border-gray-200 text-[#484c4d] whitespace-nowrap">
                  {invoice.invoice_date || "-"}
                </td>
                <td className="p-2 border-b border-gray-200 text-[#484c4d] whitespace-nowrap">
                  {invoice.supplier_name || "-"}
                </td>
                <td className="p-2 border-b border-gray-200 text-[#484c4d] whitespace-nowrap">
                  {invoice.category || "-"}
                </td>
                <td className="p-2 border-b border-gray-200 text-[#484c4d] whitespace-nowrap">
                  ₹{(invoice.total_amount ?? 0).toFixed(2)}
                </td>
                <td className="p-2 border-b border-gray-200 text-[#484c4d] whitespace-nowrap">
                  ₹{(invoice.total_tax ?? 0).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button
        onClick={downloadExcel}
        className="bg-[#e6c065] hover:bg-[#e6c065]/90 text-white font-bold py-2 px-4 rounded shadow-md transition"
      >
        Download as Excel
      </button>
    </div>
  );
};

export default InvoiceTable;