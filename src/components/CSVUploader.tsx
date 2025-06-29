import React, { useCallback, useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, X } from 'lucide-react';
import { parseCSV } from '../utils/csvParser';
import { CSVRow, UploadState } from '../types';

interface CSVUploaderProps {
  onDataLoaded: (data: CSVRow[]) => void;
}

export const CSVUploader: React.FC<CSVUploaderProps> = ({ onDataLoaded }) => {
  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    isUploaded: false,
    error: null,
    fileName: null,
  });
  
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFile = useCallback(async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      setUploadState(prev => ({
        ...prev,
        error: 'Please upload a CSV file',
        isUploaded: false,
      }));
      return;
    }

    setUploadState({
      isUploading: true,
      isUploaded: false,
      error: null,
      fileName: file.name,
    });

    try {
      const data = await parseCSV(file);
      setUploadState({
        isUploading: false,
        isUploaded: true,
        error: null,
        fileName: file.name,
      });
      onDataLoaded(data);
    } catch (error) {
      setUploadState({
        isUploading: false,
        isUploaded: false,
        error: error instanceof Error ? error.message : 'Failed to parse CSV',
        fileName: null,
      });
    }
  }, [onDataLoaded]);

  const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
    
    const file = event.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
  }, []);

  const resetUpload = () => {
    setUploadState({
      isUploading: false,
      isUploaded: false,
      error: null,
      fileName: null,
    });
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        className={`
          relative border-2 border-dashed rounded-xl p-8 transition-all duration-300 ease-in-out
          ${isDragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300 bg-gray-50'}
          ${uploadState.isUploaded ? 'border-green-400 bg-green-50' : ''}
          ${uploadState.error ? 'border-red-400 bg-red-50' : ''}
          hover:border-blue-400 hover:bg-blue-50 cursor-pointer
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          type="file"
          accept=".csv"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={uploadState.isUploading}
        />

        <div className="text-center">
          {uploadState.isUploading ? (
            <div className="space-y-4">
              <div className="w-12 h-12 mx-auto border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <p className="text-blue-600 font-medium">Processing CSV file...</p>
            </div>
          ) : uploadState.isUploaded ? (
            <div className="space-y-4">
              <CheckCircle className="w-12 h-12 mx-auto text-green-600" />
              <div>
                <p className="text-green-600 font-medium">CSV uploaded successfully!</p>
                <p className="text-sm text-gray-600 mt-1">{uploadState.fileName}</p>
              </div>
              <button
                onClick={resetUpload}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
                Upload Different File
              </button>
            </div>
          ) : uploadState.error ? (
            <div className="space-y-4">
              <AlertCircle className="w-12 h-12 mx-auto text-red-600" />
              <div>
                <p className="text-red-600 font-medium">Upload failed</p>
                <p className="text-sm text-red-500 mt-1">{uploadState.error}</p>
              </div>
              <button
                onClick={resetUpload}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <Upload className="w-12 h-12 mx-auto text-gray-400" />
              <div>
                <p className="text-lg font-medium text-gray-700">Upload your CSV file</p>
                <p className="text-sm text-gray-500 mt-1">
                  Drag and drop or click to select
                </p>
              </div>
              <div className="text-xs text-gray-400 space-y-1">
                <p>Required columns: Task, Description, Actions, Objects</p>
                <p>File format: .csv</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};