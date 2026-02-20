import React from 'react';

const PersonalInfoSection = ({ formData, onInputChange }) => {
  const fields = [
    { key: "Position Applied For", label: "Position Applied For", type: "text", required: true },
    { key: "Date of Application", label: "Date of Application", type: "date", required: true },
    { key: "Last Name", label: "Last Name", type: "text", required: true },
    { key: "First Name", label: "First Name", type: "text", required: true },
    { key: "Middle Name", label: "Middle Name", type: "text", required: false },
    { key: "Date of Birth", label: "Date of Birth", type: "date", required: true }
  ];

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields.map(field => (
          <div key={field.key}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label}
            </label>
            {field.type === "date" ? (
              <input
                type="date"
                value={formData[field.key] || ''}
                onChange={(e) => onInputChange(field.key, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required={field.required}
                style={{ WebkitAppearance: 'menulist' }}
              />
            ) : (
              <input
                type="text"
                value={formData[field.key]}
                onChange={(e) => onInputChange(field.key, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required={field.required}
              />
            )}
          </div>
        ))}
        
        {/* Address and City in same row */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Address (if applicable)
          </label>
          <input
            type="text"
            value={formData["Address"]}
            onChange={(e) => onInputChange("Address", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter address"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            City
          </label>
          <input
            type="text"
            value={formData["City"]}
            onChange={(e) => onInputChange("City", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required={true}
          />
        </div>

        {/* State and ZIP Code */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            State
          </label>
          <input
            type="text"
            value={formData["State"]}
            onChange={(e) => onInputChange("State", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required={true}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ZIP Code
          </label>
          <input
            type="text"
            value={formData["Zip"]}
            onChange={(e) => onInputChange("Zip", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required={true}
          />
        </div>
      </div>
    </div>
  );
};

export default PersonalInfoSection;