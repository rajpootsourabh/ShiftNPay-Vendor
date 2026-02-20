import React from 'react';
import SignatureCanvas from 'react-signature-canvas';

const SignatureSection = ({ 
  formData, 
  onInputChange, 
  careAssociateSignature, 
  mastercareSignature,
  onCareAssociateSignatureEnd,
  onMastercareSignatureEnd,
  onClearCareAssociateSignature,
  onClearMastercareSignature,
  careAssociateSigCanvasRef,
  mastercareSigCanvasRef
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
      <h3 className="text-lg font-semibold mb-4">Signatures</h3>
      
      {/* Summary */}
      <div className="mb-6 p-4 border border-gray-300 rounded bg-gray-50">
        <p className="text-sm text-gray-700">
          Please provide signatures for both the Care Associate and the Mastercare Representative.
        </p>
      </div>

      {/* Two Signature Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        
        {/* Care Associate Signature */}
        <div className="p-4 border border-gray-300 rounded">
          <h4 className="text-md font-semibold text-gray-800 mb-4">Care Associate Signature</h4>
          
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Draw your signature:</span>
              <button
                type="button"
                onClick={onClearCareAssociateSignature}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Clear Signature
              </button>
            </div>
            <div className="border border-gray-300 rounded-md overflow-hidden bg-white">
              <SignatureCanvas
                ref={careAssociateSigCanvasRef}
                canvasProps={{
                  className: "w-full h-40 bg-white",
                  style: { cursor: 'crosshair' }
                }}
                onEnd={onCareAssociateSignatureEnd}
              />
            </div>
            {careAssociateSignature && (
              <div className="mt-2">
                <p className="text-xs text-green-600">
                  ✓ Care associate signature captured.
                </p>
              </div>
            )}
          </div>

          {/* Signature Preview */}
          {careAssociateSignature && (
            <div className="mb-4 p-3 border border-gray-200 rounded bg-white">
              <p className="text-sm font-medium text-gray-700 mb-2">Signature Preview:</p>
              <div className="border border-gray-300 rounded p-2 bg-white">
                <img 
                  src={careAssociateSignature} 
                  alt="Care associate signature preview" 
                  className="h-16 max-w-full object-contain"
                />
              </div>
            </div>
          )}

          {/* Care Associate Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={formatDateForInput(formData["Date"])}
              onChange={(e) => onInputChange("Date", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Mastercare Representative Signature */}
        <div className="p-4 border border-gray-300 rounded">
          <h4 className="text-md font-semibold text-gray-800 mb-4">Mastercare Representative Signature</h4>
          
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Draw representative signature:</span>
              <button
                type="button"
                onClick={onClearMastercareSignature}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Clear Signature
              </button>
            </div>
            <div className="border border-gray-300 rounded-md overflow-hidden bg-white">
              <SignatureCanvas
                ref={mastercareSigCanvasRef}
                canvasProps={{
                  className: "w-full h-40 bg-white",
                  style: { cursor: 'crosshair' }
                }}
                onEnd={onMastercareSignatureEnd}
              />
            </div>
            {mastercareSignature && (
              <div className="mt-2">
                <p className="text-xs text-green-600">
                  ✓ Mastercare representative signature captured.
                </p>
              </div>
            )}
          </div>

          {/* Signature Preview */}
          {mastercareSignature && (
            <div className="mb-4 p-3 border border-gray-200 rounded bg-white">
              <p className="text-sm font-medium text-gray-700 mb-2">Signature Preview:</p>
              <div className="border border-gray-300 rounded p-2 bg-white">
                <img 
                  src={mastercareSignature} 
                  alt="Mastercare representative signature preview" 
                  className="h-16 max-w-full object-contain"
                />
              </div>
            </div>
          )}

          {/* Mastercare Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={formatDateForInput(formData["Date_2"])}
              onChange={(e) => onInputChange("Date_2", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
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
            <h4 className="text-sm font-medium text-blue-800">Signature Verification</h4>
            <div className="mt-2 space-y-2">
              <div className="flex items-center">
                {careAssociateSignature ? (
                  <svg className="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4 text-gray-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                  </svg>
                )}
                <span className={`text-sm ${careAssociateSignature ? 'text-green-700' : 'text-gray-600'}`}>
                  Care Associate Signature {careAssociateSignature ? '✓ Complete' : 'Required'}
                </span>
              </div>
              <div className="flex items-center">
                {mastercareSignature ? (
                  <svg className="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4 text-gray-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                  </svg>
                )}
                <span className={`text-sm ${mastercareSignature ? 'text-green-700' : 'text-gray-600'}`}>
                  Mastercare Representative Signature {mastercareSignature ? '✓ Complete' : 'Required'}
                </span>
              </div>
            </div>
          </div>
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