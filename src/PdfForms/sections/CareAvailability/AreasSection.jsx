// components/forms/sections/CareAvailability/AreasSection.jsx
import React from 'react';

const AreasSection = ({ formData, onInputChange }) => {
  const areaFields = [
    { field: "Areas I can workRow1", placeholder: "Enter area 1 (e.g., Houston Downtown)" },
    { field: "Areas I can workRow2", placeholder: "Enter area 2 (e.g., Katy)" },
    { field: "Areas I can workRow3", placeholder: "Enter area 3" },
    { field: "Areas I can workRow4", placeholder: "Enter area 4" },
    { field: "Areas I can workRow5", placeholder: "Enter area 5" },
    { field: "Areas I can workRow6", placeholder: "Enter area 6" }
  ];

  const limitationFields = [
    { field: "1", label: "Limitation or Special Request 1" },
    { field: "2", label: "Limitation or Special Request 2" },
    { field: "3", label: "Limitation or Special Request 3" },
    { field: "4", label: "Limitation or Special Request 4" },
    { field: "5", label: "Limitation or Special Request 5" }
  ];

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-4">Work Areas & Limitations</h3>
      
      {/* Areas I can work */}
      <div className="mb-6">
        <h4 className="text-md font-medium text-gray-700 mb-3">Areas I can work</h4>
        <div className="space-y-3">
          {areaFields.map((item, index) => (
            <div key={index}>
              <input
                type="text"
                value={formData[item.field]}
                onChange={(e) => onInputChange(item.field, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={item.placeholder}
              />
            </div>
          ))}
        </div>
        <p className="mt-2 text-sm text-gray-500">
          Please list the geographic areas where you are willing and able to work.
        </p>
      </div>

      {/* Limitations or Special Requests */}
      <div>
        <h4 className="text-md font-medium text-gray-700 mb-3">Limitations or Special Requests</h4>
        <div className="space-y-3">
          {limitationFields.map((item, index) => (
            <div key={index}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {item.label}
              </label>
              <input
                type="text"
                value={formData[item.field]}
                onChange={(e) => onInputChange(item.field, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter any limitations or special requests"
              />
            </div>
          ))}
        </div>
        <p className="mt-2 text-sm text-gray-500">
          Please list any work limitations, special accommodations needed, or specific requests regarding assignments.
        </p>
      </div>

      {/* Footer Note */}
      <div className="mt-6 p-3 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          1204/MC-Rev.0120 ©Mastercare, Inc. All Rights Reserved
        </p>
      </div>
    </div>
  );
};

export default AreasSection;