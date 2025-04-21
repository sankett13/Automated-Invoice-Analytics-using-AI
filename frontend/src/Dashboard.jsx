import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import InvoiceCharts from './InvoiceCharts';
import ChatBot from './ChatBot';
import InvoiceTable from './InvoiceTable';

const Dashboard = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [file, setFile] = useState(null);
  const [uploadMessage, setUploadMessage] = useState('');
  const [extractedText, setExtractedText] = useState('');
  const [activeTab, setActiveTab] = useState('upload');

  const logout = async () => {
    try {
      const res = await fetch('/api/users/logout/', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await res.json();

      if (res.ok) {
        navigate('/');
      } else {
        setError(data.error || 'Logout failed');
      }
    } catch (err) {
      console.error('Logout error:', err);
      setError('Something went wrong. Try again.');
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setUploadMessage('');
    setError(null);
    setExtractedText('');
  };

  const handleSubmit = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/users/upload/', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setUploadMessage('File uploaded successfully!');
        setFile(null);
        window.location.reload();
      } else {
        setError(data.error || 'Upload failed');
        setExtractedText('');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError('Something went wrong during upload.');
      setExtractedText('');
    }
  };

  // Sample analytics data to pass to the chatbot
  const analyticsData = {
    totalTax: 2540,
    highestCategory: 'Office Supplies',
    highestAmount: 11000,
    totalAmount: 32500,
    invoiceCount: 14,
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg p-6 flex flex-col justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-8">Dashboard</h2>
          <nav className="space-y-4">
            <button
              className={`w-full text-left px-4 py-2 rounded-lg hover:bg-gray-200 ${activeTab === 'upload' ? 'bg-gray-200' : ''}`}
              onClick={() => setActiveTab('upload')}
            >
              Upload Invoice
            </button>
            <button
              className={`w-full text-left px-4 py-2 rounded-lg hover:bg-gray-200 ${activeTab === 'analytics' ? 'bg-gray-200' : ''}`}
              onClick={() => setActiveTab('analytics')}
            >
              Analytics
            </button>
            <button
              className={`w-full text-left px-4 py-2 rounded-lg hover:bg-gray-200 ${activeTab === 'table' ? 'bg-gray-200' : ''}`}
              onClick={() => setActiveTab('table')}
            >
              Invoice Data Table
            </button>
          </nav>
        </div>
        <button
          onClick={logout}
          className="bg-red-500 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded"
        >
          Logout
        </button>
      </aside>

      {/* Main content */}
      <main className="flex-grow p-8">
        {activeTab === 'upload' && (
          <>
            <h1 className="text-2xl font-semibold mb-6 text-gray-800">Upload Invoice</h1>
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
              <div className="flex items-center space-x-4">
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-4 rounded"
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
                  <span className="text-gray-500 italic text-sm">{file.name}</span>
                )}
                <button
                  onClick={handleSubmit}
                  className="bg-green-500 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded"
                >
                  Upload
                </button>
              </div>
              {uploadMessage && <p className="text-green-600 mt-2">{uploadMessage}</p>}
              {error && <p className="text-red-600 mt-2">{error}</p>}
            </div>
          </>
        )}

        {activeTab === 'analytics' && (
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Analytics</h2>
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
              <InvoiceCharts />
            </div>
            <h3 className="text-xl font-medium text-gray-700 mb-4">Ask Analytics Bot</h3>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <ChatBot analyticsData={analyticsData} />
            </div>
          </section>
        )}

        {activeTab === 'table' && (
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Invoice Data Table</h2>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <InvoiceTable/>
              <p className="text-gray-600">Table data goes here...</p>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
