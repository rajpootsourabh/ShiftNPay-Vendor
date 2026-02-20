// components/forms/sections/OrientationAcknowledgements/SignatureSection.jsx
import React, { useRef } from 'react';
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
      <h3 className="text-lg font-semibold mb-4">Signature & Information</h3>
      
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
                className: "w-full h-32 bg-white",
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
                className="h-14 max-w-full object-contain"
              />
            </div>
          </div>
        )}
      </div>

      {/* Employee Information */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-700 mb-3">Employee Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Printed Name</label>
            <input
              type="text"
              value={formData["Printed Name"]}
              onChange={(e) => onInputChange("Printed Name", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Type your full name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Position with Company</label>
            <input
              type="text"
              value={formData["Position with Company"]}
              onChange={(e) => onInputChange("Position with Company", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Your position/title"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Today's Date</label>
            <input
              type="date"
              value={formatDateForInput(formData["Todays Date"])}
              onChange={(e) => onInputChange("Todays Date", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date (if known)</label>
            <input
              type="date"
              value={formatDateForInput(formData["Start Date"])}
              onChange={(e) => onInputChange("Start Date", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* All topics are now shown in ContentInitialsSection, so we don't need the duplicate section here */}
      <div className="mt-4 p-3 border border-gray-200 rounded-lg bg-blue-50">
        <p className="text-sm text-blue-700">
          <strong>Note:</strong> All 23 orientation topics and their corresponding initials are shown in the "Content & Initials" section above. 
          Please make sure to provide initials for all topics before proceeding.
        </p>
      </div>

      {/* Footer Note */}
      <div className="mt-6 p-3 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          1202/MC-Rev.0118 ©Mastercare, Inc. All Rights Reserved
        </p>
      </div>
    </div>
  );
};

export default SignatureSection;