import React from 'react';
import SignatureCanvas from 'react-signature-canvas';

const SignatureSection = ({ formData, onInputChange, signatureDataUrl, onSignatureEnd, onClearSignature, sigCanvasRef }) => {
  // Format date for input
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return dateString;
    
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
    
    return dateString;
  };

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-4">Signature & Employee Information</h3>
      
      {/* Summary Section */}
      <div className="mb-6 p-4 border border-gray-300 rounded bg-gray-50">
        <h4 className="text-md font-semibold text-gray-800 mb-2">Orientation Completion Summary:</h4>
        <p className="text-sm text-gray-700">
          By signing below, you acknowledge completion of all required orientation topics and videos as indicated in the previous sections.
        </p>
      </div>

      {/* Employee Information */}
      <div className="mb-6">
        <h4 className="text-md font-semibold text-gray-800 mb-3">Employee Information</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Print Name
            </label>
            <input
              type="text"
              value={formData["Print Name"]}
              onChange={(e) => onInputChange("Print Name", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Your full name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Position with Company
            </label>
            <input
              type="text"
              value={formData["Position with Company"]}
              onChange={(e) => onInputChange("Position with Company", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Care Associate, CNA"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={formatDateForInput(formData["Start Date"])}
              onChange={(e) => onInputChange("Start Date", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Signature Date
            </label>
            <input
              type="date"
              value={formatDateForInput(formData["Date"])}
              onChange={(e) => onInputChange("Date", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>
      </div>

      {/* Signature Section */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">Employee Signature</label>
        
        {/* Digital Signature Canvas */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Draw your signature below:</span>
            <button
              type="button"
              onClick={onClearSignature}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Clear Signature
            </button>
          </div>
          <div className="border border-gray-300 rounded-md overflow-hidden bg-white">
            <SignatureCanvas
              ref={sigCanvasRef}
              canvasProps={{
                className: "w-full h-40 bg-white",
                style: { cursor: 'crosshair' }
              }}
              onEnd={onSignatureEnd}
            />
          </div>
          {signatureDataUrl && (
            <div className="mt-2">
              <p className="text-xs text-green-600">
                ✓ Signature captured. You can re-draw if needed.
              </p>
            </div>
          )}
        </div>

        {/* Signature Preview */}
        {signatureDataUrl && (
          <div className="mb-4 p-3 border border-gray-200 rounded bg-white">
            <p className="text-sm font-medium text-gray-700 mb-2">Signature Preview:</p>
            <div className="border border-gray-300 rounded p-2 bg-white">
              <img 
                src={signatureDataUrl} 
                alt="Signature preview" 
                className="h-16 max-w-full object-contain"
              />
            </div>
          </div>
        )}
      </div>

      {/* Verification Section */}
      <div className="mt-6 p-4 border border-blue-200 rounded-lg bg-blue-50">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h4 className="text-sm font-medium text-blue-800">Ready to Sign</h4>
            <p className="mt-1 text-sm text-blue-700">
              By signing this document, you acknowledge that you have completed all required orientation training as indicated in the previous sections.
            </p>
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <div className="mt-6 p-3 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          1203MC-Rev.0323-TX ©Mastercare, Inc. All Rights Reserved
        </p>
      </div>
    </div>
  );
};

export default SignatureSection;