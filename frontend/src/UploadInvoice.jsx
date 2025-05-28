import React, { useState } from "react";
import { motion } from "framer-motion";

const UploadInvoice = () => {
  const [file, setFile] = useState(null);
  const [uploadMessage, setUploadMessage] = useState("");
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setUploadMessage("");
    setError(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (
      droppedFile &&
      (droppedFile.type === "application/pdf" ||
        droppedFile.type.startsWith("image/"))
    ) {
      setFile(droppedFile);
      setUploadMessage("");
      setError(null);
    } else {
      setError("Please upload a PDF or image file");
    }
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
      } else {
        setError(data.error || "Upload failed");
      }
    } catch (err) {
      console.error("Upload error:", err);
      setError("Something went wrong during upload.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm p-8"
      >
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            Upload Invoice
          </h2>
          <p className="text-gray-500">
            Upload your invoice in PDF or image format for automatic data
            extraction
          </p>
        </div>

        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center ${
            isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="space-y-4">
            <div className="text-6xl mb-4">📄</div>
            <p className="text-gray-600">
              Drag and drop your invoice here, or{" "}
              <label
                htmlFor="file-upload"
                className="text-blue-600 hover:text-blue-700 cursor-pointer font-medium"
              >
                browse
              </label>
            </p>
            <input
              id="file-upload"
              type="file"
              accept=".png,.jpeg,.jpg,.pdf"
              onChange={handleFileChange}
              className="hidden"
            />
            <p className="text-sm text-gray-500">
              Supported formats: PDF, PNG, JPEG, JPG
            </p>
          </div>
        </div>

        {file && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 bg-gray-50 rounded-lg p-4 flex items-center justify-between"
          >
            <div className="flex items-center space-x-4">
              <span className="text-2xl">📄</span>
              <div>
                <p className="font-medium text-gray-800">{file.name}</p>
                <p className="text-sm text-gray-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <button
              onClick={() => setFile(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </motion.div>
        )}

        {uploadMessage && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 bg-green-50 text-green-700 rounded-lg p-4"
          >
            {uploadMessage}
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 bg-red-50 text-red-700 rounded-lg p-4"
          >
            {error}
          </motion.div>
        )}

        <div className="mt-8 flex justify-end">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmit}
            disabled={!file}
            className={`px-6 py-3 rounded-lg font-medium ${
              file
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            Upload Invoice
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default UploadInvoice;
