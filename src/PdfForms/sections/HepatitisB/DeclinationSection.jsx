import React from 'react';
import SignatureCanvas from 'react-signature-canvas';

const DeclinationSection = ({ 
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
      <h3 className="text-lg font-semibold mb-4">Hepatitis B Vaccine Declination</h3>
      
      {/* Information */}
      <div className="mb-6 p-4 border border-gray-300 rounded bg-gray-50">
        <h4 className="text-md font-semibold text-gray-800 mb-2">Declaration Statement:</h4>
        <p className="text-sm text-gray-700 mb-3">
          I understand that due to my occupational exposure to blood or other potentially infectious materials 
          I may be at risk of acquiring hepatitis B virus (HBV) infection. I have been given the opportunity 
          to be vaccinated with Hepatitis B vaccine, at no charge to myself. However, I elect to decline the 
          Hepatitis B vaccination at this time.
        </p>
        <p className="text-sm text-gray-700">
          I understand that if in the future I continue to have occupational exposure to blood or other 
          potentially infectious materials and I want to be vaccinated with Hepatitis B vaccine, I can receive 
          the vaccination series at no charge to me.
        </p>
      </div>

      {/* Declination Option */}
      <div className="p-4 border border-gray-300 rounded">
        <div className="flex items-start">
          <input
            type="checkbox"
            id="decline-vaccine"
            checked={formData["I decline the Hepatitis B Vaccine and understand I can receive it at any time in the future"]}
            onChange={(e) => onCheckboxChange("I decline the Hepatitis B Vaccine and understand I can receive it at any time in the future", e.target.checked)}
            className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="decline-vaccine" className="ml-3 block">
            <span className="text-sm font-medium text-gray-700">
              I decline the Hepatitis B Vaccine and understand I can receive it at any time in the future.
            </span>
            <p className="mt-1 text-sm text-gray-600">
              By checking this box, you acknowledge that you are declining the vaccine now but can choose 
              to receive it later at no cost.
            </p>
          </label>
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
            value={formatDateForInput(formData["Date_2"])}
            onChange={(e) => onInputChange("Date_2", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
      </div>
    </div>
  );
};

export default DeclinationSection;