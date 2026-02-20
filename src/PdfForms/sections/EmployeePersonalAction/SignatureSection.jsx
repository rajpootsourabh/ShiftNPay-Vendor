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
      <h3 className="text-lg font-semibold mb-4">Signature & Review</h3>
      
      {/* Signature Section */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">Employee/Authorized Signature</label>
        
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

        {/* Date Field */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
          <input
            type="date"
            value={formatDateForInput(formData["signature_date"])}
            onChange={(e) => onInputChange("signature_date", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Additional Information */}
      <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
        <h4 className="text-md font-medium text-gray-700 mb-2">Additional Information</h4>
        
        <div className="grid grid-cols-2 gap-4 mb-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={formatDateForInput(formData["Date"])}
              onChange={(e) => onInputChange("Date", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Received by Payroll Date</label>
            <input
              type="date"
              value={formatDateForInput(formData["payrolldate"])}
              onChange={(e) => onInputChange("payrolldate", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData["checkbox_ReceivedbyPayroll"]}
              onChange={(e) => onInputChange("checkbox_ReceivedbyPayroll", e.target.checked)}
              className="h-4 w-4 text-blue-600 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Received by Payroll</span>
          </label>
        </div>
      </div>

      {/* Footer Note */}
      <div className="mt-6 p-3 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          ©Mastercare, Inc. All Rights Reserved
        </p>
      </div>
    </div>
  );
};

export default SignatureSection;