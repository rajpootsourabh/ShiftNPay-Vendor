import React from 'react';

const WorkPreferencesSection = ({ formData, onInputChange, onCheckboxChange }) => {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const workTypes = ["Full Time Only", "Part Time Only", "Full or Part Time"];
  const yesNoQuestions = [
    { key: "Nights Yes", label: "Available to Work Nights" },
    { key: "Work US Yes", label: "Authorized to Work in US", required: true },
    { key: "Test Yes", label: "Willing to Take Pre-employment Test" },
    { key: "Accommodation Yes", label: "Need Accommodation" }
  ];

  // Handle work type selection (radio button behavior)
  const handleWorkTypeChange = (selectedType) => {
    const updatedWorkTypes = {};
    workTypes.forEach(type => {
      updatedWorkTypes[type] = type === selectedType;
    });
    
    Object.keys(updatedWorkTypes).forEach(type => {
      onCheckboxChange(type, updatedWorkTypes[type]);
    });
  };

  // Handle "No Preference" checkbox
  const handleNoPreferenceChange = (checked) => {
    if (checked) {
      // If "No Preference" is checked, uncheck all individual days
      onCheckboxChange("No Preference", true);
      days.forEach(day => {
        onCheckboxChange(day, false);
      });
    } else {
      onCheckboxChange("No Preference", false);
    }
  };

  // Handle individual day checkbox
  const handleDayChange = (day, checked) => {
    if (checked) {
      // If an individual day is checked, uncheck "No Preference"
      onCheckboxChange("No Preference", false);
      onCheckboxChange(day, true);
    } else {
      onCheckboxChange(day, false);
    }
  };

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-4">Work Preferences</h3>

      {/* Days Available */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">Days Available to Work:</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData["No Preference"]}
              onChange={(e) => handleNoPreferenceChange(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2"
            />
            No Preference
          </label>
          {days.map(day => (
            <label key={day} className="flex items-center">
              <input
                type="checkbox"
                checked={formData[day]}
                onChange={(e) => handleDayChange(day, e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2"
              />
              {day}
            </label>
          ))}
        </div>
      </div>

      {/* Work Type - Now behaves like radio buttons */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">Work Type Preference:</label>
        <div className="space-y-2">
          {workTypes.map(type => (
            <label key={type} className="flex items-center">
              <input
                type="checkbox"
                checked={formData[type]}
                onChange={(e) => {
                  if (e.target.checked) {
                    handleWorkTypeChange(type);
                  }
                }}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2"
              />
              {type}
            </label>
          ))}
        </div>
      </div>

      {/* Yes/No Questions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {yesNoQuestions.map(question => (
          <label key={question.key} className="flex items-center">
            <input
              type="checkbox"
              checked={formData[question.key]}
              onChange={(e) => onCheckboxChange(question.key, e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2"
              required={question.required}
            />
            {question.label}
          </label>
        ))}
      </div>

      {/* Accommodation Details */}
      {formData["Accommodation Yes"] && (
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Accommodation Details</label>
          <textarea
            value={formData["reasonable accommodation If no describe what accommodations you would need 1"]}
            onChange={(e) => onInputChange("reasonable accommodation If no describe what accommodations you would need 1", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical min-h-[80px]"
            placeholder="Please describe any accommodations needed"
          />
        </div>
      )}
    </div>
  );
};

export default WorkPreferencesSection;