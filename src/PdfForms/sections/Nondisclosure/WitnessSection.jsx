import React from 'react';
import SignatureCanvas from 'react-signature-canvas';

const WitnessSection = ({ 
  formData, 
  onInputChange, 
  signatureDataUrl, 
  onSignatureEnd, 
  onClearSignature, 
  sigCanvasRef 
}) => {
  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-4">Witness Signature (Signature145)</h3>
      
      {/* Instructions */}
      <div className="mb-6 p-4 border border-purple-300 rounded bg-purple-50">
        <h4 className="text-md font-semibold text-purple-800 mb-2">Instructions:</h4>
        <p className="text-sm text-purple-700">
          This section is for a Witness to the agreement. A witness observes the signing and adds credibility to the document.
        </p>
      </div>

      {/* Witness Information */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Witness Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Witness Name
            </label>
            <input
              type="text"
              value={formData["Print Name"] || ""}
              onChange={(e) => onInputChange("Print Name", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Witness full name"
            />
          </div>

          {/* Witness Title (Print Name and Title_2) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Witness Title
            </label>
            <input
              type="text"
              value={formData["Print Name and Title_2"] || ""}
              onChange={(e) => onInputChange("Print Name and Title_2", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Print name and title"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Witness Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Witness Address
            </label>
            <input
              type="text"
              value={formData["Address"] || ""}
              onChange={(e) => onInputChange("Address", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Street address"
            />
          </div>

          {/* Witness City */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City
            </label>
            <input
              type="text"
              value={formData["City"] || ""}
              onChange={(e) => onInputChange("City", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="City"
            />
          </div>

          {/* Witness State */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              State
            </label>
            <input
              type="text"
              value={formData["State"] || ""}
              onChange={(e) => onInputChange("State", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="State"
            />
          </div>
        </div>

        {/* Witness Telephone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Witness Telephone
          </label>
          <input
            type="tel"
            value={formData["Telephone"] || ""}
            onChange={(e) => onInputChange("Telephone", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="(xxx) xxx-xxxx"
          />
        </div>
      </div>

      {/* Witness Signature Section */}
      <div className="mt-8">
        <h4 className="text-md font-semibold text-gray-800 mb-4">Witness Signature</h4>
        
        {/* Signature Status */}
        <div className="mb-4 p-3 bg-purple-50 rounded-md border border-purple-200">
          <div className="flex items-center">
            <span className={`w-4 h-4 rounded-full mr-2 ${signatureDataUrl ? 'bg-purple-500' : 'bg-purple-200'}`}></span>
            <span className="text-sm font-medium text-purple-800">
              {signatureDataUrl ? 'Witness signature captured ✓' : 'Optional - Witness may sign below'}
            </span>
          </div>
          <p className="text-xs text-purple-700 mt-1 ml-6">
            This signature is optional. A witness may sign here if desired.
          </p>
        </div>
        
        {/* Digital Signature Canvas */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">Draw witness signature below:</label>
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
              <p className="text-xs text-purple-600">
                ✓ Witness signature captured. You can re-draw if needed by clicking "Clear This Signature".
              </p>
            </div>
          )}
        </div>
        
        {/* Note about other signatures */}
        <div className="mt-4 p-3 bg-gray-100 rounded-md">
          <p className="text-xs text-gray-600">
            <span className="font-medium">Note:</span> The Employee and Company signatures in other sections will remain unchanged. 
            Each signature is independent and clearing one will not affect the others.
          </p>
        </div>
      </div>
    </div>
  );
};

export default WitnessSection;