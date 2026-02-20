import React from 'react';

const EducationSection = ({ formData, onInputChange }) => {
  const educationLevels = [
    {
      level: "High School",
      fields: [
        { key: "NAME OF SCHOOLHigh School", label: "Name of School" },
        { key: "LOCATIONHigh School", label: "Location" },
        { key: "NO OF YEARS COMPLETEDHigh School", label: "Years Completed", type: "number" },
        { key: "MAJOR OR DEGREEHigh School", label: "Major/Degree" }
      ]
    },
    {
      level: "College",
      fields: [
        { key: "NAME OF SCHOOLCollege", label: "Name of School" },
        { key: "LOCATIONCollege", label: "Location" },
        { key: "NO OF YEARS COMPLETEDCollege", label: "Years Completed", type: "number" },
        { key: "MAJOR OR DEGREECollege", label: "Major/Degree" }
      ]
    },
    {
      level: "College (Additional)",
      fields: [
        { key: "NAME OF SCHOOLCollege_2", label: "Name of School" },
        { key: "LOCATIONCollege_2", label: "Location" },
        { key: "NO OF YEARS COMPLETEDCollege_2", label: "Years Completed", type: "number" },
        { key: "MAJOR OR DEGREECollege_2", label: "Major/Degree" }
      ]
    },
    {
      level: "Other",
      fields: [
        { key: "NAME OF SCHOOLOther", label: "Name of School/Training" },
        { key: "LOCATIONOther", label: "Location" },
        { key: "NO OF YEARS COMPLETEDOther", label: "Years Completed", type: "number" },
        { key: "MAJOR OR DEGREEOther", label: "Major/Degree/Certificate" }
      ]
    }
  ];

  // Handle input change with number restriction for years completed fields
  const handleInputChange = (key, value, isNumberField = false) => {
    if (isNumberField) {
      // Only allow numbers and empty string, maximum 4 digits
      if (value === '' || (/^\d+$/.test(value) && value.length <= 4)) {
        onInputChange(key, value);
      }
    } else {
      onInputChange(key, value);
    }
  };

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-4">Education History</h3>
      
      {educationLevels.map((levelData, index) => (
        <div key={levelData.level} className="mb-6">
          <h4 className="text-md font-medium text-gray-700 mb-3">{levelData.level}</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {levelData.fields.map(field => (
              <div key={field.key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {field.label}
                </label>
                <input
                  type="text"
                  value={formData[field.key]}
                  onChange={(e) => handleInputChange(field.key, e.target.value, field.type === "number")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  inputMode={field.type === "number" ? "numeric" : "text"}
                  pattern={field.type === "number" ? "[0-9]{0,4}" : undefined}
                  maxLength={field.type === "number" ? 4 : undefined}
                  placeholder={field.type === "number" ? "e.g. 2025" : ""}
                />
                {/* {field.type === "number" && formData[field.key] && formData[field.key].length > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    {4 - formData[field.key].length} digits remaining
                  </p>
                )} */}
              </div>
            ))}
          </div>
          {index < educationLevels.length - 1 && <hr className="my-4" />}
        </div>
      ))}
    </div>
  );
};

export default EducationSection;