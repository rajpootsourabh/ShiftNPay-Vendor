import React from 'react';

const ADLSection = ({ formData, onCheckboxChange }) => {
  const adlSkills = [
    { 
      name: "Assisting with Eating", 
      fields: ["1.1.0", "1.1.1", "1.1.2", "1.1.3"] 
    },
    { 
      name: "Meal Preparation", 
      fields: ["1.2.0", "1.2.1", "1.2.2", "1.2.3"] 
    },
    { 
      name: "Grocery Shopping", 
      fields: ["1.3.0", "1.3.1", "1.3.2", "1.3.3"] 
    },
    { 
      name: "Assistance with Ambulation", 
      fields: ["1.4.0", "1.4.1", "1.4.2", "1.4.3"] 
    },
    { 
      name: "Accompany on Outings", 
      fields: ["1.5.0", "1.5.1", "1.5.2", "1.5.3"] 
    },
    { 
      name: "Assistance with Wheelchair", 
      fields: ["1.6.0", "1.6.1", "1.6.2", "1.6.3"] 
    },
    { 
      name: "Assistance with Bathing", 
      fields: ["1.7.0", "1.7.1", "1.7.2", "1.7.3"] 
    },
    { 
      name: "Bed Bath or Shower", 
      fields: ["1.8.0", "1.8.1", "1.8.2", "1.8.3"] 
    },
    { 
      name: "Assistance with Clothing", 
      fields: ["1.9.0", "1.9.1", "1.9.2", "1.9.3"] 
    },
    { 
      name: "Diaper Changing", 
      fields: ["1.10.0", "1.10.1", "1.10.2", "1.10.3"] 
    },
    { 
      name: "Oral Hygiene", 
      fields: ["1.11.0", "1.11.1", "1.11.2", "1.11.3"] 
    },
    { 
      name: "Pericare", 
      fields: ["1.12.0", "1.12.1", "1.12.2", "1.12.3"] 
    },
    { 
      name: "Shampoo", 
      fields: ["1.13.0", "1.13.1", "1.13.2", "1.13.3"] 
    },
    { 
      name: "Shave", 
      fields: ["1.14.0", "1.14.1", "1.14.2", "1.14.3"] 
    },
    { 
      name: "Foot and Nail Care", 
      fields: ["1.15.0", "1.15.1", "1.15.2", "1.15.3"] 
    },
    { 
      name: "Skin Care", 
      fields: ["1.16.0", "1.16.1", "1.16.2", "1.16.3"] 
    }
  ];

  const getSelectedLevel = (fields) => {
    for (let i = 0; i < fields.length; i++) {
      if (formData[fields[i]]) return i;
    }
    return -1;
  };

  const handleRadioChange = (fieldName) => {
    // The fieldName is like "1.1.0", "1.1.1", etc.
    // Extract the skill group (e.g., "1.1" from "1.1.0")
    const skillGroup = fieldName.substring(0, fieldName.lastIndexOf('.'));
    
    // Find all fields in this skill group and uncheck them
    const fieldsToUpdate = {};
    adlSkills.forEach(skill => {
      skill.fields.forEach(field => {
        if (field.startsWith(skillGroup + '.')) {
          fieldsToUpdate[field] = field === fieldName;
        }
      });
    });
    
    // Update the form via callback
    Object.keys(fieldsToUpdate).forEach(field => {
      onCheckboxChange(field, fieldsToUpdate[field]);
    });
  };

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-4">1. ACTIVITIES OF DAILY LIVING</h3>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider w-2/5">Skill</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                <div className="flex flex-col items-center">
                  <span className="font-bold">1</span>
                  <span className="text-xs text-gray-500 mt-1">Very Experienced</span>
                </div>
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                <div className="flex flex-col items-center">
                  <span className="font-bold">2</span>
                  <span className="text-xs text-gray-500 mt-1">Moderate Experience</span>
                </div>
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                <div className="flex flex-col items-center">
                  <span className="font-bold">3</span>
                  <span className="text-xs text-gray-500 mt-1">No Experience</span>
                </div>
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                <div className="flex flex-col items-center">
                  <span className="font-bold">4</span>
                  <span className="text-xs text-gray-500 mt-1">Do Not Want to Perform</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {adlSkills.map((skill, index) => {
              const selectedLevel = getSelectedLevel(skill.fields);
              
              return (
                <tr key={skill.name} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50 hover:bg-gray-100'}>
                  <td className="px-4 py-3 text-sm text-gray-900 font-medium">{skill.name}</td>
                  {skill.fields.map((field, levelIndex) => (
                    <td key={field} className="px-4 py-3 text-center">
                      <div className="flex justify-center items-center h-full">
                        <input
                          type="radio"
                          name={`skill-${skill.name.replace(/\s+/g, '-')}`}
                          checked={selectedLevel === levelIndex}
                          onChange={() => handleRadioChange(field)}
                          className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                      </div>
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 p-3 border border-blue-200 rounded bg-blue-50">
        <p className="text-sm text-blue-700">
          <strong>Note:</strong> Select only one rating per skill. Click on the circle to make your selection.
        </p>
      </div>
    </div>
  );
};

export default ADLSection;