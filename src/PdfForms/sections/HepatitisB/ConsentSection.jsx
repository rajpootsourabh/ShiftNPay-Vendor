import React from 'react';
import SignatureCanvas from 'react-signature-canvas';

const ConsentSection = ({ 
  formData, 
  onInputChange, 
  onCheckboxChange, 
  signatureDataUrl, 
  onSignatureEnd, 
  onClearSignature, 
  sigCanvasRef,
  consentChoice 
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
      <h3 className="text-lg font-semibold mb-4">Hepatitis B Vaccine Consent</h3>
      
      {/* Information */}
      <div className="mb-6 p-4 border border-gray-300 rounded bg-gray-50">
        <h4 className="text-md font-semibold text-gray-800 mb-2">Important Information:</h4>
        <p className="text-sm text-gray-700 mb-3">
          I understand that due to my occupational exposure to blood or other potentially infectious materials, 
          I may be at risk of acquiring hepatitis B virus (HBV) infection. I have been given the opportunity 
          to be vaccinated with Hepatitis B vaccine, at no charge to myself.
        </p>
      </div>

      {/* Consent Options */}
      <div className="space-y-6">
        {/* Option 1: Elect to receive vaccine */}
        <div className="p-4 border border-gray-300 rounded">
          <div className="flex items-start">
            <input
              type="checkbox"
              id="consent-to-vaccine"
              checked={formData["I elect to receive the Hepatitis B vaccine"]}
              onChange={(e) => onCheckboxChange("I elect to receive the Hepatitis B vaccine", e.target.checked)}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="consent-to-vaccine" className="ml-3 block">
              <span className="text-sm font-medium text-gray-700">I elect to receive the Hepatitis B vaccine.</span>
              <p className="mt-1 text-sm text-gray-600">
                Select this option if you consent to receive the Hepatitis B vaccine series.
              </p>
            </label>
          </div>
        </div>

        {/* Option 2: Already vaccinated */}
        <div className="p-4 border border-gray-300 rounded">
          <div className="flex items-start">
            <input
              type="checkbox"
              id="already-vaccinated"
              checked={formData["I have received the Hepatitis B Vaccine Series"]}
              onChange={(e) => onCheckboxChange("I have received the Hepatitis B Vaccine Series", e.target.checked)}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="already-vaccinated" className="ml-3 block">
              <span className="text-sm font-medium text-gray-700">I have received the Hepatitis B Vaccine Series.</span>
              <p className="mt-1 text-sm text-gray-600">
                Select this option if you have already completed the Hepatitis B vaccine series.
              </p>
            </label>
          </div>

          {/* Show date fields if already vaccinated is checked */}
          {formData["I have received the Hepatitis B Vaccine Series"] && (
            <div className="mt-4 pl-7">
              <label className="block text-sm font-medium text-gray-700 mb-2">Vaccination Dates:</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Date #1</label>
                  <input
                    type="date"
                    value={formatDateForInput(formData["Dates1"])}
                    onChange={(e) => onInputChange("Dates1", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Date #2</label>
                  <input
                    type="date"
                    value={formatDateForInput(formData["Dates2"])}
                    onChange={(e) => onInputChange("Dates2", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Date #3</label>
                  <input
                    type="date"
                    value={formatDateForInput(formData["Dates3"])}
                    onChange={(e) => onInputChange("Dates3", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* Proof of immunity option */}
          <div className="mt-3 pl-7">
            <div className="flex items-start">
              <input
                type="checkbox"
                id="proof-of-immunity"
                checked={formData["Medical proof of vaccination Proof of immunity Attach results"]}
                onChange={(e) => onCheckboxChange("Medical proof of vaccination Proof of immunity Attach results", e.target.checked)}
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="proof-of-immunity" className="ml-3 block">
                <span className="text-sm font-medium text-gray-700">Medical proof of vaccination / Proof of immunity (Attach results.)</span>
                <p className="mt-1 text-sm text-gray-600">
                  Check this box if you have attached proof of immunity or vaccination records.
                </p>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Signature Section */}
      <div className="mt-8">
        <h4 className="text-md font-semibold text-gray-800 mb-4">Signature & Date</h4>
        
        {/* Digital Signature Canvas */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">Employee Signature</label>
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

        {/* Date Field */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
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
  );
};

export default ConsentSection;