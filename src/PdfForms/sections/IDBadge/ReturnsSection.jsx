import React from 'react';
import SignatureCanvas from 'react-signature-canvas';

const ReturnsSection = ({ 
  formData, 
  onInputChange, 
  returnManagerSignatureUrl,
  onReturnManagerSignatureEnd,
  onClearReturnManagerSignature,
  returnManagerSigCanvasRef,
  activeSignature,
  setActiveSignature
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

  // Calculate total deduction
  const calculateTotalDeduction = () => {
    const notReturnedValue = parseFloat(formData["fill_12"] || "0");
    return notReturnedValue.toFixed(2);
  };

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-4">ID Badge Return Record</h3>
      
      {/* Information */}
      <div className="mb-6 p-4 border border-gray-300 rounded bg-gray-50">
        <h4 className="text-md font-semibold text-gray-800 mb-2">Instructions:</h4>
        <p className="text-sm text-gray-700">
          Complete this section when an employee returns or fails to return their ID badge upon termination 
          of employment. This section is typically completed by management or HR personnel.
        </p>
      </div>

      {/* Returns Table */}
      <div className="mb-6 p-4 border border-gray-300 rounded">
        <h4 className="text-md font-semibold text-gray-800 mb-4">ID Badge Return Record</h4>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Returned</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items Returned</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items Not Returned</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-4 py-3">
                  <input
                    type="date"
                    value={formatDateForInput(formData["Date ReturnedRow1"])}
                    onChange={(e) => onInputChange("Date ReturnedRow1", e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    type="text"
                    value={formData["Items ReturnedRow1"]}
                    onChange={(e) => onInputChange("Items ReturnedRow1", e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    placeholder="e.g., ID Badge, Keys"
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    type="text"
                    value={formData["Items Not ReturnedRow1"]}
                    onChange={(e) => onInputChange("Items Not ReturnedRow1", e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    placeholder="e.g., ID Badge"
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center">
                    <span className="mr-1">$</span>
                    <input
                      type="text"
                      value={formData["fill_12"]}
                      onChange={(e) => onInputChange("fill_12", e.target.value)}
                      className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                      placeholder="5.00"
                    />
                  </div>
                </td>
              </tr>
              <tr className="bg-gray-50">
                <td colSpan="3" className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                  Total Deduction
                </td>
                <td className="px-4 py-3 text-sm font-bold text-gray-900">
                  ${calculateTotalDeduction()}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Manager Signature for Returns */}
      <div className="p-4 border border-purple-200 rounded-lg bg-purple-50">
        <h4 className="text-md font-semibold text-purple-800 mb-4">Manager Verification (Returns)</h4>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              value={formatDateForInput(formData["Date_3"])}
              onChange={(e) => onInputChange("Date_3", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Manager Signature
              </label>
              <button
                type="button"
                onClick={onClearReturnManagerSignature}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Clear Signature
              </button>
            </div>
            <div 
              className={`border rounded-md overflow-hidden bg-white cursor-pointer ${activeSignature === 'returnManager' ? 'ring-2 ring-purple-500' : ''}`}
              onClick={() => setActiveSignature('returnManager')}
            >
              <SignatureCanvas
                ref={returnManagerSigCanvasRef}
                canvasProps={{
                  className: "w-full h-32 bg-white",
                  style: { cursor: 'crosshair' }
                }}
                onEnd={onReturnManagerSignatureEnd}
              />
            </div>
            {returnManagerSignatureUrl && (
              <div className="mt-2">
                <p className="text-xs text-green-600">
                  ✓ Signature captured. Click canvas to edit.
                </p>
              </div>
            )}
          </div>

          {returnManagerSignatureUrl && (
            <div className="p-3 border border-gray-200 rounded bg-white">
              <p className="text-sm font-medium text-gray-700 mb-2">Signature Preview:</p>
              <div className="border border-gray-300 rounded p-2 bg-white">
                <img 
                  src={returnManagerSignatureUrl} 
                  alt="Manager signature preview" 
                  className="h-12 max-w-full object-contain"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Note
      <div className="mt-6 p-3 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          2900/MC-Rev.0619 ©Mastercare, Inc. All Rights Reserved
        </p>
      </div> */}
    </div>
  );
};

export default ReturnsSection;