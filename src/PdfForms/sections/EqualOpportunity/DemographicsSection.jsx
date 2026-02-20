import React from 'react';

const DemographicsSection = ({ formData, onInputChange, onCheckboxChange, onGenderChange, onVeteranChange }) => {
  const raceOptions = [
    {
      label: "White",
      definition: "All persons having origins in any of the original peoples of Europe, North Africa, or the Middle East."
    },
    {
      label: "Asian",
      definition: "All persons having origins in any of the original peoples of the Far East, Southeast Asia, or the Indian Subcontinent. This area includes, for example: Cambodia, China, India, Japan, Korea, Malaysia, Pakistan, Philippines, Thailand, and Vietnam."
    },
    {
      label: "2 or more Races",
      definition: "All persons who identify with more than one of the above five races."
    },
    {
      label: "Hispanic  Latino",
      definition: "A person of Cuban, Mexican, Puerto Rican, South or Central American, or other Spanish culture or origin, regardless of race."
    },
    {
      label: "Pacific Islander",
      definition: "All persons having origins in any of the original peoples of Hawaii, Guam, Samoa, or other Pacific Islands."
    },
    {
      label: "Black  African American",
      definition: "All persons having origins in any of the Black racial group of Africa."
    },
    {
      label: "American Indian",
      definition: "All persons having origins in any of the original peoples of North America, and who maintain cultural identification through tribal affiliation or community recognition."
    }
  ];

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-4">Demographic Information</h3>
      
      {/* Gender */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">Gender</label>
        <div className="flex gap-6">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData["Male"]}
              onChange={(e) => {
                if (e.target.checked) onGenderChange('Male');
              }}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2"
            />
            Male
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData["Female"]}
              onChange={(e) => {
                if (e.target.checked) onGenderChange('Female');
              }}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2"
            />
            Female
          </label>
        </div>
      </div>

      {/* Veteran Status */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">Are you a protected veteran?</label>
        <div className="flex gap-6">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData["Yes"]}
              onChange={(e) => {
                if (e.target.checked) onVeteranChange('Yes');
              }}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2"
            />
            Yes
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData["No"]}
              onChange={(e) => {
                if (e.target.checked) onVeteranChange('No');
              }}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2"
            />
            No
          </label>
        </div>
      </div>

      {/* Race/Ethnicity */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-3">Race/Ethnicity:</label>
        <div className="space-y-4">
          {raceOptions.map(race => (
            <div key={race.label} className="flex flex-col">
              <label className="flex items-start">
                <input
                  type="checkbox"
                  checked={formData[race.label] || false}
                  onChange={(e) => onCheckboxChange(race.label, e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2 mt-1 flex-shrink-0"
                />
                <div className="flex flex-col">
                  <span className="text-sm font-medium">
                    {race.label.replace('  ', ' ')}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">
                    {race.definition}
                  </p>
                </div>
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DemographicsSection;