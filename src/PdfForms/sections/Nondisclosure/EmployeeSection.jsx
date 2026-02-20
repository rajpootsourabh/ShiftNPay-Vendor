import React from 'react';
import SignatureCanvas from 'react-signature-canvas';

const EmployeeSection = ({ 
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
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-4">Employee Information & Signature</h3>
      
      {/* Important Notice */}
      <div className="mb-6 p-4 border border-yellow-300 rounded bg-yellow-50">
        <h4 className="text-md font-semibold text-yellow-800 mb-2">Important Notice:</h4>
        <p className="text-sm text-yellow-700 mb-3">
          This Nondisclosure and Noncompete Agreement contains important restrictions on your ability to:
        </p>
        <ul className="text-sm text-yellow-700 list-disc pl-5 space-y-1">
          <li>Disclose confidential information during or after employment</li>
          <li>Work for competing businesses for 1 year after employment ends</li>
          <li>Contact or do business with Company clients after employment ends</li>
        </ul>
        <p className="text-sm text-yellow-700 mt-3">
          Please read the full document carefully before signing.
        </p>
      </div>

      {/* Employee Information Fields */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Employee Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Employee Name (Full Legal Name) *
            </label>
            <input
              type="text"
              value={formData["Employee"] || ""}
              onChange={(e) => onInputChange("Employee", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              placeholder="Enter your full name"
            />
          </div>

          {/* Employee Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Employee Address *
            </label>
            <input
              type="text"
              value={formData["Employee Address"] || ""}
              onChange={(e) => onInputChange("Employee Address", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              placeholder="Enter your address"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Effective Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Effective Date of Agreement *
            </label>
            <input
              type="date"
              value={formatDateForInput(formData["Effective Date"])}
              onChange={(e) => onInputChange("Effective Date", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Date (Signature Date) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date of Signature *
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

      {/* Employee Signature Section */}
      <div className="mt-8">
        <h4 className="text-md font-semibold text-gray-800 mb-4">Employee Signature (Signature146)</h4>
        
        {/* Signature Status */}
        <div className="mb-4 p-3 bg-gray-100 rounded-md">
          <div className="flex items-center">
            <span className={`w-4 h-4 rounded-full mr-2 ${signatureDataUrl ? 'bg-green-500' : 'bg-gray-400'}`}></span>
            <span className="text-sm font-medium">
              {signatureDataUrl ? 'Signature captured ✓' : 'Please sign below'}
            </span>
          </div>
          <p className="text-xs text-gray-600 mt-1 ml-6">
            This is your official signature as the Employee. You must sign this section.
          </p>
        </div>
        
        {/* Digital Signature Canvas */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">Draw your signature below:</label>
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
              <p className="text-xs text-green-600">
                ✓ Employee signature captured. You can re-draw if needed by clicking "Clear This Signature".
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeSection;