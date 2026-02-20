import React from 'react';

const PersonalInformationSection = ({ formData, onInputChange }) => {
  const fields = [
    { key: "Name", label: "Full Name", type: "text", required: true, fullWidth: false },
    { key: "Date", label: "Date", type: "date", required: true, fullWidth: false },
    { key: "Address", label: "Address", type: "text", required: true, fullWidth: true },
    { key: "City", label: "City", type: "text", required: true, fullWidth: false },
    { key: "State", label: "State", type: "text", required: true, fullWidth: false },
    { key: "Zip", label: "ZIP Code", type: "zip", required: true, fullWidth: false },
    { key: "Email Address", label: "Email", type: "email", required: true, fullWidth: false },
    { key: "Phone", label: "Phone", type: "phone", required: true, fullWidth: false }
  ];

  // Handle input change with silent validation
  const handleInputChange = (key, value, fieldType = "text") => {
    if (fieldType === "zip") {
      // Allow only numbers for ZIP code, max 10 digits (for ZIP+4)
      if (value === '' || (/^\d+$/.test(value) && value.length <= 10)) {
        onInputChange(key, value);
      }
    } else if (fieldType === "phone") {
      // Allow only numbers for phone, max 15 digits
      if (value === '' || (/^\d+$/.test(value) && value.length <= 15)) {
        onInputChange(key, value);
      }
    } else {
      onInputChange(key, value);
    }
  };

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields.map(field => (
          <div key={field.key} className={field.fullWidth ? 'md:col-span-2' : ''}>
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
                style={{
                  WebkitAppearance: 'menulist',
                }}
              />
            ) : (
              <input
                type="text"
                value={formData[field.key]}
                onChange={(e) => handleInputChange(field.key, e.target.value, field.type)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required={field.required}
                inputMode={
                  field.type === "zip" || field.type === "phone" ? "numeric" : 
                  field.type === "email" ? "email" : "text"
                }
                maxLength={
                  field.type === "zip" ? 10 : 
                  field.type === "phone" ? 15 : 
                  undefined
                }
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PersonalInformationSection;