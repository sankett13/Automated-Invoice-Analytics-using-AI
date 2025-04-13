import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

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
        setExtractedText(JSON.stringify(data.extracted_text || '')); // Set the extracted text
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
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Welcome to the Dashboard</h1>

      <div className="mb-4">
        <input
          type="file"
          accept=".png,.jpeg,.jpg,.pdf"
          onChange={handleFileChange}
          className="mb-2"
        />
        <button
          onClick={handleSubmit}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Upload File
        </button>
      </div>

      {uploadMessage && <p className="text-green-600">{uploadMessage}</p>}
      {error && <p className="text-red-600">{error}</p>}

      {extractedText && (
        <div className="mt-6 p-4 border rounded">
          <h2 className="text-lg font-semibold mb-2">Extracted Text:</h2>
          <pre className="whitespace-pre-wrap">{extractedText}</pre>
        </div>
      )}

      <hr className="my-6" />

      <button
        onClick={logout}
        className="bg-red-600 text-white px-4 py-2 rounded"
      >
        Logout
      </button>
    </div>
  );
};

export default Dashboard;