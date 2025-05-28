import React, { useState, useEffect } from "react";
import InvoiceTable from "./InvoiceTable";

const InvoiceTablePage = () => {
  const [invoices, setInvoices] = useState([]);
  const [fetchInvoicesError, setFetchInvoicesError] = useState(null);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const res = await fetch("/api/invoices/", {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = await res.json();
        if (res.ok) {
          setInvoices(data.invoices || []);
          setFetchInvoicesError(null);
        } else {
          setFetchInvoicesError(data.error || "Failed to fetch invoices");
          setInvoices([]);
        }
      } catch (err) {
        console.error("Error fetching invoices:", err);
        setFetchInvoicesError("Something went wrong while fetching invoices.");
        setInvoices([]);
      }
    };

    fetchInvoices();
  }, []);

  return (
    <div className="flex min-h-screen bg-[#dff7f6] text-[#484c4d] font-sans p-8">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full">
        <h1 className="text-3xl font-semibold mb-6">Invoice Table</h1>
        {fetchInvoicesError ? (
          <p className="text-red-500">{fetchInvoicesError}</p>
        ) : (
          <InvoiceTable invoices={invoices} />
        )}
      </div>
    </div>
  );
};

export default InvoiceTablePage;
