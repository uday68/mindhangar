import React, { useState } from 'react';
import { Icons } from '../Icons';

interface AddContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddVideo: () => void;
  onAddDocument: (file: File) => void;
}

export const AddContentModal: React.FC<AddContentModalProps> = ({
  isOpen,
  onClose,
  onAddVideo,
  onAddDocument
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadType, setUploadType] = useState<'video' | 'document' | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = () => {
    if (uploadType === 'video') {
      onAddVideo();
    } else if (uploadType === 'document' && selectedFile) {
      onAddDocument(selectedFile);
    }
    handleClose();
  };

  const handleClose = () => {
    setSelectedFile(null);
    setUploadType(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Add Content</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Icons.X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!uploadType ? (
            <div className="space-y-4">
              <p className="text-gray-600 mb-6">
                Choose what type of content you'd like to add to this module:
              </p>

              {/* Video Option */}
              <button
                onClick={() => setUploadType('video')}
                className="w-full p-6 border-2 border-gray-200 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition-all text-left group"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-600 transition-colors">
                    <Icons.Video size={24} className="text-blue-600 group-hover:text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-900 mb-1">Add Video</h3>
                    <p className="text-sm text-gray-600">
                      Search and add YouTube videos to your module
                    </p>
                  </div>
                  <Icons.ChevronRight size={20} className="text-gray-400 group-hover:text-blue-600" />
                </div>
              </button>

              {/* Document Option */}
              <button
                onClick={() => setUploadType('document')}
                className="w-full p-6 border-2 border-gray-200 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition-all text-left group"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-600 transition-colors">
                    <Icons.FileText size={24} className="text-green-600 group-hover:text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-900 mb-1">Add Document</h3>
                    <p className="text-sm text-gray-600">
                      Upload PDF, DOCX, or other document files
                    </p>
                  </div>
                  <Icons.ChevronRight size={20} className="text-gray-400 group-hover:text-green-600" />
                </div>
              </button>
            </div>
          ) : uploadType === 'document' ? (
            <div className="space-y-4">
              <button
                onClick={() => setUploadType(null)}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
              >
                <Icons.ChevronLeft size={16} />
                Back
              </button>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-600 transition-colors">
                <input
                  type="file"
                  id="file-upload"
                  accept=".pdf,.doc,.docx,.txt,.ppt,.pptx"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <div className="p-4 bg-gray-100 rounded-full mb-4">
                    <Icons.Upload size={32} className="text-gray-600" />
                  </div>
                  <p className="text-sm font-medium text-gray-900 mb-1">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">
                    PDF, DOC, DOCX, TXT, PPT, PPTX (max 10MB)
                  </p>
                </label>
              </div>

              {selectedFile && (
                <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <Icons.FileText size={20} className="text-green-600" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="p-1 hover:bg-green-100 rounded"
                  >
                    <Icons.X size={16} className="text-gray-600" />
                  </button>
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Footer */}
        {uploadType && (
          <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
            <button
              onClick={handleClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={uploadType === 'document' && !selectedFile}
              className="px-6 py-2 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploadType === 'video' ? 'Search Videos' : 'Upload Document'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
