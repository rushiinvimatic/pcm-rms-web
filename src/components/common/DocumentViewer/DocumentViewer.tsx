import React, { useState } from 'react';
import { Button } from '../../ui/button';

interface DocumentViewerProps {
  documentUrl: string;
  documentName: string;
  documentType: 'pdf' | 'image';
  onClose: () => void;
  onDownload?: () => void;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  documentUrl,
  documentName,
  documentType,
  onClose,
  onDownload,
}) => {
  const [loading, setLoading] = useState(true);
  const [scale, setScale] = useState(1);

  const handleLoad = () => {
    setLoading(false);
  };

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.2, 3));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.2, 0.5));
  };

  const handleResetZoom = () => {
    setScale(1);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-6xl mx-4 h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold truncate">{documentName}</h2>
          <div className="flex items-center gap-2">
            {/* Zoom Controls */}
            <div className="flex items-center gap-1 mr-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomOut}
                disabled={scale <= 0.5}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </Button>
              <span className="text-sm px-2 min-w-[60px] text-center">
                {Math.round(scale * 100)}%
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomIn}
                disabled={scale >= 3}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetZoom}
              >
                Reset
              </Button>
            </div>

            {/* Download Button */}
            {onDownload && (
              <Button
                variant="outline"
                size="sm"
                onClick={onDownload}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download
              </Button>
            )}

            {/* Close Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Button>
          </div>
        </div>

        {/* Document Content */}
        <div className="flex-1 overflow-auto bg-gray-100 relative">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}

          <div className="p-4 flex justify-center">
            {documentType === 'pdf' ? (
              <div 
                className="bg-white shadow-lg"
                style={{ transform: `scale(${scale})`, transformOrigin: 'top center' }}
              >
                <iframe
                  src={`${documentUrl}#view=FitH`}
                  width="800"
                  height="1000"
                  onLoad={handleLoad}
                  className="border-0"
                  title={documentName}
                />
              </div>
            ) : (
              <img
                src={documentUrl}
                alt={documentName}
                onLoad={handleLoad}
                style={{ transform: `scale(${scale})`, transformOrigin: 'top center' }}
                className="max-w-full h-auto shadow-lg"
              />
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Document: {documentName} | Type: {documentType.toUpperCase()}
            </div>
            <div className="text-sm text-gray-500">
              Use scroll to navigate • Click zoom buttons to adjust size
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};