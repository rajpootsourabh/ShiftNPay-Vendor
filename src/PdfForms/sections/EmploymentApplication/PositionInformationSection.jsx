import React from 'react';

const PositionInformationSection = ({ formData, onInputChange }) => {
  const fields = [
    { key: "Position", label: "Position Applied For", type: "text", required: true, fullWidth: true },
    { key: "Location Preference", label: "Location Preference", type: "text", required: false, fullWidth: false },
    { key: "Salary Desired", label: "Desired Salary", type: "salary", required: false, fullWidth: false },
    { key: "How many hours can you work weekly", label: "Hours Available Per Week", type: "hours", required: false, fullWidth: false },
    { key: "When would you be available to begin work", label: "Available Start Date", type: "date", required: false, fullWidth: false }
  ];

  // Handle input change with silent validation
  const handleInputChange = (key, value, fieldType = "text") => {
    if (fieldType === "salary") {
      // Allow numbers, decimal point, and currency symbols
      if (value === '' || /^[\d.,$€£¥]*$/.test(value)) {
        onInputChange(key, value);
      }
    } else if (fieldType === "hours") {
      // Allow only numbers, max 168 (hours in a week)
      if (value === '' || (/^\d+$/.test(value) && parseInt(value) <= 168)) {
        onInputChange(key, value);
      }
    } else {
      onInputChange(key, value);
    }
  };

  // Handle date input separately - store as YYYY-MM-DD for native date picker
  const handleDateChange = (key, dateValue) => {
    onInputChange(key, dateValue); // Store as YYYY-MM-DD for native date picker compatibility
  };

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-4">Position Information</h3>
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
                onChange={(e) => handleDateChange(field.key, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required={field.required}
              />
            ) : (
              <input
                type="text"
                value={formData[field.key]}
                onChange={(e) => handleInputChange(field.key, e.target.value, field.type)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required={field.required}
                inputMode={
                  field.type === "salary" || field.type === "hours" ? "numeric" : "text"
                }
                maxLength={field.type === "hours" ? 3 : undefined}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PositionInformationSection;