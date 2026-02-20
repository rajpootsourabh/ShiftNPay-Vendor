import React from 'react';

const SkillsChecklistSection = ({ formData, skillsData, onInputChange, onSkillRatingChange, getSelectedColumn }) => {
  const ratingOptions = [
    { value: 0, label: "1 - Very Experienced", color: "green" },
    { value: 1, label: "2 - Moderate Experience", color: "yellow" },
    { value: 2, label: "3 - No Experience", color: "red" },
    { value: 3, label: "4 - Do Not Want to Perform", color: "gray" }
  ];

  const getColorClasses = (colIndex) => {
    switch (colIndex) {
      case 0: return {
        border: 'border-green-500',
        bg: 'bg-green-500',
        ring: 'focus:ring-green-500',
        checkedBorder: 'peer-checked:border-green-500',
        checkedBg: 'peer-checked:bg-green-500'
      };
      case 1: return {
        border: 'border-yellow-500',
        bg: 'bg-yellow-500',
        ring: 'focus:ring-yellow-500',
        checkedBorder: 'peer-checked:border-yellow-500',
        checkedBg: 'peer-checked:bg-yellow-500'
      };
      case 2: return {
        border: 'border-red-500',
        bg: 'bg-red-500',
        ring: 'focus:ring-red-500',
        checkedBorder: 'peer-checked:border-red-500',
        checkedBg: 'peer-checked:bg-red-500'
      };
      case 3: return {
        border: 'border-gray-500',
        bg: 'bg-gray-500',
        ring: 'focus:ring-gray-500',
        checkedBorder: 'peer-checked:border-gray-500',
        checkedBg: 'peer-checked:bg-gray-500'
      };
      default: return {
        border: 'border-blue-500',
        bg: 'bg-blue-500',
        ring: 'focus:ring-blue-500',
        checkedBorder: 'peer-checked:border-blue-500',
        checkedBg: 'peer-checked:bg-blue-500'
      };
    }
  };

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-6">Skills Checklist</h3>

      <div className="space-y-8 max-h-[500px] overflow-y-auto pr-2">
        {skillsData.map((sectionData) => (
          <div key={sectionData.section} className="border rounded-lg p-4">
            <h4 className="font-semibold text-blue-600 mb-4">
              {sectionData.title}
            </h4>

            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border p-2 text-left font-medium text-gray-700 min-w-[200px]">Skill</th>
                    <th className="border p-2 text-center font-medium text-gray-700">1 - Very Experienced</th>
                    <th className="border p-2 text-center font-medium text-gray-700">2 - Moderate Experience</th>
                    <th className="border p-2 text-center font-medium text-gray-700">3 - No Experience</th>
                    <th className="border p-2 text-center font-medium text-gray-700">4 - Do Not Want</th>
                  </tr>
                </thead>
                <tbody>
                  {sectionData.skills.map((skill, skillIndex) => {
                    const selectedColumn = getSelectedColumn(sectionData.section, skillIndex);

                    return (
                      <tr key={`${sectionData.section}-${skillIndex}`} className="hover:bg-gray-50">
                        <td className="border p-2 font-medium text-gray-700">
                          <div className="flex items-center">
                            <span>{skill}</span>
                          </div>
                        </td>
                        {[0, 1, 2, 3].map((colIndex) => {
                          const colorClasses = getColorClasses(colIndex);
                          const isChecked = selectedColumn === colIndex;

                          return (
                            <td key={colIndex} className="border p-2 text-center">
                              <div className="flex justify-center items-center">
                                <label className="relative flex items-center cursor-pointer">
                                  <input
                                    type="radio"
                                    name={`skill-${sectionData.section}-${skillIndex}`}
                                    checked={isChecked}
                                    onChange={() => {
                                      console.log(`Selecting: Section ${sectionData.section}, Skill ${skillIndex}, Column ${colIndex}`);
                                      onSkillRatingChange(sectionData.section, skillIndex, colIndex);
                                    }}
                                    className="sr-only peer"
                                  />
                                  <div className={`
                                    w-5 h-5 rounded-full border-2 flex items-center justify-center
                                    ${colorClasses.border}
                                    ${isChecked ? colorClasses.bg : 'bg-white'}
                                    transition-all duration-200
                                  `}>
                                    {isChecked && (
                                      <div className="w-2 h-2 rounded-full bg-white"></div>
                                    )}
                                  </div>
                                </label>
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
              {ratingOptions.map((option) => (
                <div key={option.value} className="flex items-center text-sm">
                  <div className={`w-3 h-3 rounded-full mr-2 ${option.value === 0 ? 'bg-green-500' :
                      option.value === 1 ? 'bg-yellow-500' :
                        option.value === 2 ? 'bg-red-500' :
                          'bg-gray-500'
                    }`} />
                  <span>{option.label}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SkillsChecklistSection;