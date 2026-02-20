import React from 'react';
import SignatureCanvas from 'react-signature-canvas';

const SupplementBRehire = ({
  formData,
  onInputChange,
  onCheckboxChange,
  rehireCount,
  onAddRehire,
  rehireSigCanvasRefs,
  onSignatureEnd,
  onClearSignature,
  formatDateForInput
}) => {
  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-4">Supplement B: Reverification and Rehire</h3>
      
      <div className="mb-6 p-4 border border-gray-300 rounded bg-gray-50">
        <h4 className="text-md font-semibold text-gray-800 mb-2">Instructions:</h4>
        <p className="text-sm text-gray-700 mb-2">
          Only use this page if your employee requires reverification, is rehired within three years 
          of the date the original Form I-9 was completed, or provides proof of a legal name change.
        </p>
        <button
          onClick={onAddRehire}
          disabled={rehireCount >= 3}
          className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
        >
          Add Rehire/Reverification ({rehireCount}/3)
        </button>
      </div>

      {Array.from({ length: rehireCount }).map((_, index) => (
        <div key={index} className="mb-8 p-4 border border-gray-300 rounded">
          <h4 className="text-md font-semibold text-gray-800 mb-4">Rehire/Reverification #{index + 1}</h4>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Date of Rehire (if applicable)</label>
            <input
              type="date"
              value={formatDateForInput(formData[`Date of Rehire ${index}`] || '')}
              onChange={(e) => onInputChange(`Date of Rehire ${index}`, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name (if changed)</label>
              <input
                type="text"
                value={formData[`Last Name ${index}`] || ''}
                onChange={(e) => onInputChange(`Last Name ${index}`, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name (if changed)</label>
              <input
                type="text"
                value={formData[`First Name ${index}`] || ''}
                onChange={(e) => onInputChange(`First Name ${index}`, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Middle Initial (if changed)</label>
              <input
                type="text"
                value={formData[`Middle Initial ${index}`] || ''}
                onChange={(e) => onInputChange(`Middle Initial ${index}`, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength="1"
              />
            </div>
          </div>

          <div className="mb-4">
            <h5 className="text-sm font-semibold text-gray-700 mb-2">Document Information for Reverification</h5>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Document Title</label>
                <input
                  type="text"
                  value={formData[`Document Title ${index}`] || ''}
                  onChange={(e) => onInputChange(`Document Title ${index}`, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Document Number</label>
                <input
                  type="text"
                  value={formData[`Document Number ${index}`] || ''}
                  onChange={(e) => onInputChange(`Document Number ${index}`, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expiration Date</label>
                <input
                  type="date"
                  value={formatDateForInput(formData[`Expiration Date ${index}`] || '')}
                  onChange={(e) => onInputChange(`Expiration Date ${index}`, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Name of Employer or Authorized Representative</label>
            <input
              type="text"
              value={formData[`Name of Emp or Auth Rep ${index}`] || ''}
              onChange={(e) => onInputChange(`Name of Emp or Auth Rep ${index}`, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">Signature of Employer or Authorized Representative</label>
              <button
                type="button"
                onClick={() => onClearSignature('rehire', index)}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Clear Signature
              </button>
            </div>
            <div className="border border-gray-300 rounded-md overflow-hidden bg-white">
              <SignatureCanvas
                ref={rehireSigCanvasRefs[index]}
                canvasProps={{
                  className: "w-full h-40 bg-white",
                  style: { cursor: 'crosshair' }
                }}
                onEnd={() => onSignatureEnd('rehire', index)}
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Today's Date (mm/dd/yyyy)</label>
            <input
              type="date"
              value={formatDateForInput(formData[`Todays Date ${index}`] || '')}
              onChange={(e) => onInputChange(`Todays Date ${index}`, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-4">
            <div className="flex items-start">
              <input
                type="checkbox"
                id={`alternative-procedure-${index}`}
                checked={formData[`CB_Alt_${index}`] || false}
                onChange={(e) => onCheckboxChange(`CB_Alt_${index}`, e.target.checked)}
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor={`alternative-procedure-${index}`} className="ml-3 block">
                <span className="text-sm font-medium text-gray-700">
                  Check here if you used an alternative procedure authorized by DHS to examine documents.
                </span>
              </label>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Additional Information</label>
            <textarea
              value={formData[`Addtl Info ${index}`] || ''}
              onChange={(e) => onInputChange(`Addtl Info ${index}`, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="2"
              placeholder="Any additional notes about this rehire or reverification"
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default SupplementBRehire;