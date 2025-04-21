import React from 'react';

const InvoiceTable = ({ invoices }) => {
  if (!invoices || invoices.length === 0) {
    return <p className="text-gray-500 italic">No invoice data available.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
        <thead>
          <tr className="bg-gray-100 text-gray-700 text-left">
            <th className="px-4 py-2 border-b">#</th>
            <th className="px-4 py-2 border-b">Invoice No</th>
            <th className="px-4 py-2 border-b">Date</th>
            <th className="px-4 py-2 border-b">Supplier</th>
            <th className="px-4 py-2 border-b">Category</th>
            <th className="px-4 py-2 border-b">Amount</th>
            <th className="px-4 py-2 border-b">Tax</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((invoice, index) => (
            <tr key={invoice.id || index} className="hover:bg-gray-50">
              <td className="px-4 py-2 border-b">{index + 1}</td>
              <td className="px-4 py-2 border-b">{invoice.invoice_no || '-'}</td>
              <td className="px-4 py-2 border-b">{invoice.date || '-'}</td>
              <td className="px-4 py-2 border-b">{invoice.vendor || '-'}</td>
              <td className="px-4 py-2 border-b">{invoice.category || '-'}</td>
              <td className="px-4 py-2 border-b">₹{invoice.amount?.toFixed(2) || '0.00'}</td>
              <td className="px-4 py-2 border-b">₹{invoice.tax?.toFixed(2) || '0.00'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default InvoiceTable;
