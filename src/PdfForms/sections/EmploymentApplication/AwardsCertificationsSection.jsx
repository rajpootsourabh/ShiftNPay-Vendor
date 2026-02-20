import React from 'react';

const AwardsCertificationsSection = ({ formData, onInputChange }) => {
  const awardsFields = [
    { key: "1", label: "1" },
    { key: "2", label: "2" },
    { key: "3", label: "3" },
    { key: "4", label: "4" },
    { key: "5", label: "5" },
    { key: "6", label: "6" }
  ];

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-4">Awards and Certifications</h3>
      <p className="text-sm text-gray-600 mb-6">
        Please list any additional certifications or awards that may have direct impact on the position for which you are applying.
      </p>
      
      <div className="space-y-4">
        {awardsFields.map(field => (
          <div key={field.key} className="flex items-center gap-4">
            <label className="block text-sm font-medium text-gray-700 w-8">
              {field.label}
            </label>
            <input
              type="text"
              value={formData[field.key]}
              onChange={(e) => onInputChange(field.key, e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter certification or award"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default AwardsCertificationsSection;