import React from 'react';
import SignatureCanvas from 'react-signature-canvas';

const SignatureSection = ({ 
  formData, 
  signatureType, 
  signatureDataUrl, 
  onInputChange, 
  onSignatureTypeChange, 
  onSignatureEnd, 
  onClearSignature, 
  sigCanvasRef 
}) => {
  
  // Handle date change for both Date_2 and Date_3 fields
  const handleDateChange = (dateValue) => {
    // Update both date fields with the same value
    onInputChange("Date_2", dateValue);
    onInputChange("Date_3", dateValue);
  };

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-4">Signature</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Signature Date</label>
          <input
            type="date"
            value={formData["Date_2"]}
            onChange={(e) => handleDateChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            This date will be used for both signature fields in the document
          </p>
        </div>
      </div>

      {/* Signature Type Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Signature Type</label>
        <div className="flex gap-6">
          <label className="flex items-center">
            <input
              type="radio"
              name="signatureType"
              value="text"
              checked={signatureType === 'text'}
              onChange={() => {
                onSignatureTypeChange('text');
                onClearSignature();
              }}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 mr-2"
            />
            Text Signature
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="signatureType"
              value="draw"
              checked={signatureType === 'draw'}
              onChange={() => onSignatureTypeChange('draw')}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 mr-2"
            />
            Draw Signature
          </label>
        </div>
      </div>

      {signatureType === 'text' ? (
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Applicant Signature</label>
          <input
            type="text"
            value={formData["Signature1_es_:signer:signature"]}
            onChange={(e) => {
              // Update both signature fields with the same value
              onInputChange("Signature1_es_:signer:signature", e.target.value);
              onInputChange("Signature2_es_:signer:signature", e.target.value);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Type your full name as signature"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            This signature will appear in both signature fields in the document
          </p>
        </div>
      ) : (
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Draw Your Signature</label>
          <div className="border-2 border-gray-300 rounded-md bg-white mb-2">
            <SignatureCanvas
              ref={sigCanvasRef}
              penColor="black"
              onEnd={onSignatureEnd}
              canvasProps={{
                width: 500,
                height: 200,
                className: 'w-full h-48 bg-white rounded-md'
              }}
            />
          </div>
          <div className="flex gap-2 items-center">
            <button
              type="button"
              onClick={onClearSignature}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
            >
              Clear Signature
            </button>
            <div className="flex items-center text-green-600 text-sm">
              {signatureDataUrl && "✓ Signature captured - Draw again to change"}
              {!signatureDataUrl && "⬆️ Click and drag to draw your signature"}
            </div>
          </div>
          
          {/* Signature Preview */}
          {signatureDataUrl && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Signature Preview:</label>
              <img
                src={signatureDataUrl}
                alt="Signature preview"
                className="border border-gray-300 rounded-md max-w-xs bg-white"
              />
              <p className="text-xs text-green-600 mt-1">
                ✓ Drawn signature will be placed in both signature fields
              </p>
            </div>
          )}
        </div>
      )}

      {/* Display both date values for verification */}
      <div className="mt-4 p-3 bg-gray-50 rounded-md">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Date Fields Verification:</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
          <div>
            <span className="font-medium">Date Field 1 (Date_2):</span> 
            <span className="ml-2 text-blue-600">{formData["Date_2"] || "Not set"}</span>
          </div>
          <div>
            <span className="font-medium">Date Field 2 (Date_3):</span> 
            <span className="ml-2 text-blue-600">{formData["Date_3"] || "Not set"}</span>
          </div>
        </div>
        {formData["Date_2"] && formData["Date_3"] && formData["Date_2"] === formData["Date_3"] && (
          <p className="text-xs text-green-600 mt-2">✓ Both date fields are synchronized</p>
        )}
      </div>
    </div>
  );
};

export default SignatureSection;