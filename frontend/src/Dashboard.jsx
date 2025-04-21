import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import InvoiceCharts from './InvoiceCharts';
import ChatBot from './ChatBot';

const Dashboard = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [file, setFile] = useState(null);
  const [uploadMessage, setUploadMessage] = useState('');
  const [extractedText, setExtractedText] = useState('');

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
        console.log(data);
        navigate('/');
      } else {
        console.log(data.error);
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
    setExtractedText(''); // Clear previous extracted text
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
        console.log(data);
        // setExtractedText(JSON.stringify(data.extracted_text || ''));
        window.location.reload();
        setFile(null);
      } else {
        setError(data.error || 'Upload failed');
        setExtractedText(''); // Clear any potentially old text
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError('Something went wrong during upload.');
      setExtractedText(''); // Clear any potentially old text
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen p-6 flex flex-col">
      <header className="bg-white shadow-md p-4 mb-6 rounded-lg flex justify-between items-center">
        <h1 className="text-xl font-semibold text-gray-800">
          Invoice Management Dashboard
        </h1>
        <button
          onClick={logout}
          className="bg-red-500 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Logout
        </button>
      </header>

      <main className="flex-grow bg-white shadow-md rounded-lg p-6">
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Upload Invoice
          </h2>
          <div className="flex items-center space-x-4">
            <div className="flex-grow">
              <label
                htmlFor="file-upload"
                className="cursor-pointer bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-4 rounded focus:outline-none focus:shadow-outline block"
              >
                <svg
                  className="w-5 h-5 inline-block mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                  ></path>
                </svg>
                Choose File
              </label>
              <input
                id="file-upload"
                type="file"
                accept=".png,.jpeg,.jpg,.pdf"
                onChange={handleFileChange}
                className="hidden"
              />
              {file && <span className="text-gray-500 italic text-sm ml-2">{file.name}</span>}
            </div>
            <button
              onClick={handleSubmit}
              className="bg-green-500 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Upload
            </button>
          </div>
          {uploadMessage && (
            <p className="text-green-600 mt-2">{uploadMessage}</p>
          )}
          {error && <p className="text-red-600 mt-2">{error}</p>}
        </section>

        {extractedText && (
          <section className="mt-8 border rounded-lg p-6 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">
              Extracted Text
            </h2>
            <div className="overflow-auto rounded-md bg-white p-4 shadow-sm">
              <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
                {extractedText}
              </pre>
            </div>
          </section>
        )}

        <section className="mt-8">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Invoice Analytics
          </h2>
          <div className="bg-white shadow-md rounded-lg p-6">
            <InvoiceCharts />
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Chatbot Assistant
          </h2>
          <div className="bg-white shadow-md rounded-lg p-6">
            <ChatBot />
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;