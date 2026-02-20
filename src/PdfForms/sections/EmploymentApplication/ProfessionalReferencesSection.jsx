import React from 'react';

const ProfessionalReferencesSection = ({ formData, onInputChange }) => {
  const references = [
    {
      number: "1",
      fields: [
        { key: "Prof Name_1", label: "Name" },
        { key: "Prof Company_1", label: "Company" },
        { key: "Prof Telephone_1", label: "Telephone", type: "telephone" },
        { key: "Prof Years_1", label: "Years Known", type: "number" }
      ]
    },
    {
      number: "2",
      fields: [
        { key: "Prof Name_2", label: "Name" },
        { key: "Prof Company_2", label: "Company" },
        { key: "Prof Telephone_2", label: "Telephone", type: "telephone" },
        { key: "Prof Years_2", label: "Years Known", type: "number" }
      ]
    },
    {
      number: "3",
      fields: [
        { key: "Prof Name_3", label: "Name" },
        { key: "Prof Company_3", label: "Company" },
        { key: "Prof Telephone_3", label: "Telephone", type: "telephone" },
        { key: "Prof Years_3", label: "Years Known", type: "number" }
      ]
    }
  ];

  // Handle input change with validation for different field types
  const handleInputChange = (key, value, fieldType = "text") => {
    if (fieldType === "number") {
      // Only allow numbers and empty string, maximum 3 digits (0-100 years)
      if (value === '' || (/^\d+$/.test(value) && value.length <= 3)) {
        onInputChange(key, value);
      }
    } else if (fieldType === "telephone") {
      // Allow numbers, spaces, parentheses, hyphens, plus sign for international
      if (value === '' || /^[\d\s\(\)\-+]+$/.test(value)) {
        onInputChange(key, value);
      }
    } else {
      onInputChange(key, value);
    }
  };

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-4">Professional References</h3>
      <p className="text-sm text-gray-600 mb-6">
        Please provide three professional references (not relatives or former supervisors)
      </p>
      
      {references.map((reference, index) => (
        <div key={reference.number} className="mb-6 p-4 border border-gray-200 rounded-lg">
          <h4 className="text-md font-medium text-gray-700 mb-4">
            Reference {reference.number}
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reference.fields.map(field => (
              <div key={field.key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {field.label}
                </label>
                <input
                  type="text"
                  value={formData[field.key]}
                  onChange={(e) => handleInputChange(field.key, e.target.value, field.type)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  inputMode={field.type === "number" ? "numeric" : field.type === "telephone" ? "tel" : "text"}
                  maxLength={field.type === "number" ? 3 : field.type === "telephone" ? 20 : undefined}
                />
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Additional Information */}
      <div className="mt-6">
        <h4 className="text-md font-medium text-gray-700 mb-4">Additional Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {[1, 2, 3, 4, 5, 6].map(num => (
            <div key={num}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Field {num}
              </label>
              <input
                type="text"
                value={formData[num.toString()]}
                onChange={(e) => onInputChange(num.toString(), e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Additional Information
          </label>
          <textarea
            value={formData["Please use this space for any additional information you would like to provide that may assist us in the hiring process 1"]}
            onChange={(e) => onInputChange("Please use this space for any additional information you would like to provide that may assist us in the hiring process 1", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical min-h-[100px]"
            placeholder="Please provide any additional information that may assist us in the hiring process"
          />
        </div>
      </div>
    </div>
  );
};

export default ProfessionalReferencesSection;