import React from 'react';
import SignatureCanvas from 'react-signature-canvas';

const SupplementAPreparer = ({
  formData,
  onInputChange,
  preparerCount,
  onAddPreparer,
  preparerSigCanvasRefs,
  onSignatureEnd,
  onClearSignature,
  formatDateForInput,
  usStates
}) => {
  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-4">Supplement A: Preparer and/or Translator Certification</h3>
      
      <div className="mb-6 p-4 border border-gray-300 rounded bg-gray-50">
        <h4 className="text-md font-semibold text-gray-800 mb-2">Instructions:</h4>
        <p className="text-sm text-gray-700 mb-2">
          This supplement must be completed by any preparer and/or translator who assists an employee 
          in completing Section 1 of Form I-9. Each preparer or translator must complete, sign, and date 
          a separate certification area.
        </p>
        <button
          onClick={onAddPreparer}
          disabled={preparerCount >= 4}
          className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
        >
          Add Preparer/Translator ({preparerCount}/4)
        </button>
      </div>

      {/* Employee Name Reference (Auto-filled from Section 1) */}
      <div className="mb-6 p-4 border border-gray-300 rounded bg-blue-50">
        <h4 className="text-md font-semibold text-gray-800 mb-2">Employee Information (for reference)</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name (Family Name)</label>
            <input
              type="text"
              value={formData["Last Name Family Name from Section 1"]}
              onChange={(e) => onInputChange("Last Name Family Name from Section 1", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="From Section 1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">First Name (Given Name)</label>
            <input
              type="text"
              value={formData["First Name Given Name from Section 1"]}
              onChange={(e) => onInputChange("First Name Given Name from Section 1", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="From Section 1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Middle Initial (if any)</label>
            <input
              type="text"
              value={formData["Middle initial if any from Section 1"]}
              onChange={(e) => onInputChange("Middle initial if any from Section 1", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="From Section 1"
              maxLength="1"
            />
          </div>
        </div>
      </div>

      {Array.from({ length: preparerCount }).map((_, index) => (
        <div key={index} className="mb-8 p-4 border border-gray-300 rounded">
          <h4 className="text-md font-semibold text-gray-800 mb-4">Preparer/Translator #{index + 1}</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
              <input
                type="text"
                value={formData[`Preparer or Translator First Name (Given Name) ${index}`] || ''}
                onChange={(e) => onInputChange(`Preparer or Translator First Name (Given Name) ${index}`, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required={preparerCount > 0}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
              <input
                type="text"
                value={formData[`Preparer or Translator Last Name (Family Name) ${index}`] || ''}
                onChange={(e) => onInputChange(`Preparer or Translator Last Name (Family Name) ${index}`, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required={preparerCount > 0}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Middle Initial</label>
              <input
                type="text"
                value={formData[`PT Middle Initial ${index}`] || ''}
                onChange={(e) => onInputChange(`PT Middle Initial ${index}`, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength="1"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Address (Street Number and Name) *</label>
            <input
              type="text"
              value={formData[`Preparer or Translator Address (Street Number and Name) ${index}`] || ''}
              onChange={(e) => onInputChange(`Preparer or Translator Address (Street Number and Name) ${index}`, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required={preparerCount > 0}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City or Town *</label>
              <input
                type="text"
                value={formData[`Preparer or Translator City or Town ${index}`] || ''}
                onChange={(e) => onInputChange(`Preparer or Translator City or Town ${index}`, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required={preparerCount > 0}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
              <select
                value={formData[`Preparer State ${index}`] || ''}
                onChange={(e) => onInputChange(`Preparer State ${index}`, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select State</option>
                {usStates.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code *</label>
              <input
                type="text"
                value={formData[`Zip Code ${index}`] || ''}
                onChange={(e) => onInputChange(`Zip Code ${index}`, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required={preparerCount > 0}
              />
            </div>
          </div>

          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">Signature of Preparer or Translator *</label>
              <button
                type="button"
                onClick={() => onClearSignature('preparer', index)}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Clear Signature
              </button>
            </div>
            <div className="border border-gray-300 rounded-md overflow-hidden bg-white">
              <SignatureCanvas
                ref={preparerSigCanvasRefs[index]}
                canvasProps={{
                  className: "w-full h-40 bg-white",
                  style: { cursor: 'crosshair' }
                }}
                onEnd={() => onSignatureEnd('preparer', index)}
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Date (mm/dd/yyyy) *</label>
            <input
              type="date"
              value={formatDateForInput(formData[`Sig Date mmddyyyy ${index}`] || '')}
              onChange={(e) => onInputChange(`Sig Date mmddyyyy ${index}`, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required={preparerCount > 0}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default SupplementAPreparer;