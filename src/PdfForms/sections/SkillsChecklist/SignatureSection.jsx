import React from 'react';
import SignatureCanvas from 'react-signature-canvas';

const SignatureSection = ({ 
  formData, 
  onInputChange, 
  signatureDataUrl, 
  onSignatureEnd, 
  onClearSignature, 
  sigCanvasRef 
}) => {
  
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
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-4">Signature & Date</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
          <input
            type="date"
            value={formatDateForInput(formData["Date"])}
            onChange={(e) => onInputChange("Date", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Print Name</label>
          <input
            type="text"
            value={formData["Print Name"]}
            onChange={(e) => onInputChange("Print Name", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Type your full name"
            required
          />
        </div>
      </div>

      {/* Drawn Signature Only */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Employee Signature</label>
        
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
              className: "w-full h-48 bg-white",
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

      {/* Confirmation Section */}
      <div className="mt-6 p-3 bg-gray-50 rounded-md text-sm">
        <p className="text-gray-700 mb-2">
          <strong>Confirmation:</strong> By signing, I confirm that the information I have checked and provided is correct.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="font-medium">Print Name:</span> 
            <span className="ml-2 text-blue-600">{formData["Print Name"] || "Not set"}</span>
          </div>
          <div>
            <span className="font-medium">Date:</span> 
            <span className="ml-2 text-blue-600">{formData["Date"] || "Not set"}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignatureSection;