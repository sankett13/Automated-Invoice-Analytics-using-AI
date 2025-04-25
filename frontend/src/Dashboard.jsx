import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import InvoiceCharts from "./InvoiceCharts";
import ChatBot from "./ChatBot";
import InvoiceTable from "./InvoiceTable";

const Dashboard = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [file, setFile] = useState(null);
  const [uploadMessage, setUploadMessage] = useState("");
  const [extractedText, setExtractedText] = useState("");
  const [activeTab, setActiveTab] = useState("upload");
  const [invoices, setInvoices] = useState([]); // State to hold invoice data
  const [fetchInvoicesError, setFetchInvoicesError] = useState(null);

  useEffect(() => {
    const fetchInvoices = async () => {
      if (activeTab === "table") {
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
      }
    };

    fetchInvoices();
  }, [activeTab]);

  const logout = async () => {
    try {
      const res = await fetch("/api/users/logout/", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      if (res.ok) navigate("/");
      else setError(data.error || "Logout failed");
    } catch (err) {
      console.error("Logout error:", err);
      setError("Something went wrong. Try again.");
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setUploadMessage("");
    setError(null);
    setExtractedText("");
  };

  const handleSubmit = async () => {
    if (!file) {
      setError("Please select a file first");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/users/upload/", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setUploadMessage("File uploaded successfully!");
        setFile(null);
        // Optionally, you might want to refresh the invoice list here if a new upload should reflect immediately
        // if (activeTab === "table") {
        //   fetchInvoices();
        // }
      } else {
        setError(data.error || "Upload failed");
      }
    } catch (err) {
      console.error("Upload error:", err);
      setError("Something went wrong during upload.");
    }
  };

  const analyticsData = {
    totalTax: 2540,
    highestCategory: "Office Supplies",
    highestAmount: 11000,
    totalAmount: 32500,
    invoiceCount: 14,
  };

  return (
    <div className="flex min-h-screen bg-[#dff7f6] text-[#484c4d] font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-xl p-6 flex flex-col justify-between">
        <div>
          <h2 className="text-3xl font-extrabold mb-8 text-center">
            Dashboard
          </h2>
          <nav className="space-y-3">
            {["upload", "analytics", "table"].map((tab) => (
              <button
                key={tab}
                className={`w-full text-left px-5 py-3 rounded-lg text-md transition duration-200 ${
                  activeTab === tab
                    ? "bg-[#01b8b1] text-white shadow-md"
                    : "hover:bg-[#f0fdfa] text-[#484c4d]"
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === "upload"
                  ? "📤 Upload Invoice"
                  : tab === "analytics"
                  ? "📊 Analytics"
                  : "📋 Invoice Table"}
              </button>
            ))}
          </nav>
        </div>
        <button
          onClick={logout}
          className="bg-[#e6c065] hover:bg-[#e6c065]/90 text-white font-bold py-2 px-4 mt-10 rounded shadow-md"
        >
          Logout
        </button>
      </aside>

      {/* Main */}
      <main className="flex-grow p-8">
        {activeTab === "upload" && (
          <section>
            <h1 className="text-3xl font-semibold mb-6">Upload Invoice</h1>
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-4 sm:space-y-0">
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer bg-[#01b8b1] text-white px-5 py-2 rounded-md hover:shadow-lg transition"
                >
                  Choose File
                </label>
                <input
                  id="file-upload"
                  type="file"
                  accept=".png,.jpeg,.jpg,.pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                {file && (
                  <span className="text-sm font-medium text-[#484c4d]">
                    {file.name}
                  </span>
                )}
                <button
                  onClick={handleSubmit}
                  className="bg-[#01b8b1] text-white font-bold py-2 px-4 rounded hover:shadow-md transition"
                >
                  Upload
                </button>
              </div>
              {uploadMessage && (
                <p className="text-green-600 mt-4 font-medium">
                  {uploadMessage}
                </p>
              )}
              {error && <p className="text-red-500 mt-4">{error}</p>}
            </div>
          </section>
        )}

        {activeTab === "analytics" && (
          <section>
            <h1 className="text-3xl font-semibold mb-6">Analytics</h1>
            <div className="bg-white p-6 mb-6 rounded-xl shadow-lg">
              <InvoiceCharts />
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h2 className="text-xl font-semibold mb-3">
                Chat with Analytics Bot 🤖
              </h2>
              <ChatBot analyticsData={analyticsData} />
            </div>
          </section>
        )}

        {activeTab === "table" && (
          <section>
            <h1 className="text-3xl font-semibold mb-6">Invoice Table</h1>
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <InvoiceTable invoices={invoices} />
            </div>
            {fetchInvoicesError && (
              <p className="text-red-500 mt-4">{fetchInvoicesError}</p>
            )}
            {invoices.length === 0 && !fetchInvoicesError && activeTab === "table" && (
              <p className="text-[#484c4d] italic mt-4">No invoice data available.</p>
            )}
          </section>
        )}
      </main>
    </div>
  );
};

export default Dashboard;