import React from 'react';
import SignatureCanvas from 'react-signature-canvas';

const CompanySection = ({ 
  formData, 
  onInputChange, 
  signatureDataUrl, 
  onSignatureEnd, 
  onClearSignature, 
  sigCanvasRef 
}) => {
  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-4">Company Authorized Signature (Signature144)</h3>
      
      {/* Instructions */}
      <div className="mb-6 p-4 border border-blue-300 rounded bg-blue-50">
        <h4 className="text-md font-semibold text-blue-800 mb-2">Instructions:</h4>
        <p className="text-sm text-blue-700 mb-2">
          This section is for the Company's authorized representative to sign on behalf of Mastercare Homecare, Inc.
        </p>
        <p className="text-sm text-blue-700">
          The Company representative should fill in their information and sign below.
        </p>
      </div>

      {/* Company Representative Information */}
      <div className="space-y-6">
        {/* Authorized Signature */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Authorized Signature (Print Name and Title)
          </label>
          <input
            type="text"
            value={formData["Print Name and Title"] || ""}
            onChange={(e) => onInputChange("Print Name and Title", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Print name and title (e.g., John Doe, HR Manager)"
          />
          <p className="text-xs text-gray-500 mt-1">
            Enter the full name and title of the company representative
          </p>
        </div>
      </div>

      {/* Company Signature Section */}
      <div className="mt-8">
        <h4 className="text-md font-semibold text-gray-800 mb-4">Company Authorized Signature</h4>
        
        {/* Signature Status */}
        <div className="mb-4 p-3 bg-blue-50 rounded-md border border-blue-200">
          <div className="flex items-center">
            <span className={`w-4 h-4 rounded-full mr-2 ${signatureDataUrl ? 'bg-blue-500' : 'bg-blue-200'}`}></span>
            <span className="text-sm font-medium text-blue-800">
              {signatureDataUrl ? 'Company signature captured ✓' : 'Optional - Company may sign below'}
            </span>
          </div>
          <p className="text-xs text-blue-700 mt-1 ml-6">
            This signature is optional. The Company representative may sign here if desired.
          </p>
        </div>
        
        {/* Digital Signature Canvas */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">Draw company signature below:</label>
            <button
              type="button"
              onClick={onClearSignature}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Clear This Signature
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
              <p className="text-xs text-blue-600">
                ✓ Company signature captured. You can re-draw if needed by clicking "Clear This Signature".
              </p>
            </div>
          )}
        </div>
        
        {/* Note about Employee signature */}
        <div className="mt-4 p-3 bg-gray-100 rounded-md">
          <p className="text-xs text-gray-600">
            <span className="font-medium">Note:</span> The Employee has already signed in their section (Signature146). 
            This Company signature is separate and will not affect the Employee's signature.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CompanySection;