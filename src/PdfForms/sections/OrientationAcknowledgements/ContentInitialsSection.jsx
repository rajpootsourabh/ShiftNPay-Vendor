// components/forms/sections/OrientationAcknowledgements/ContentInitialsSection.jsx
import React from 'react';

const ContentInitialsSection = ({ formData, onInputChange }) => {
  const orientationContent = [
    "No Harassment Policy",
    "HIPAA",
    "Work Schedules",
    "Attendance and Punctuality",
    "No Call/No Show",
    "Work Attire & Personal Appearance",
    "Standards of Conduct",
    "Standards of Conduct in a Client's Home",
    "Client Bill of Rights",
    "Abuse",
    "Gifts and Gratuities",
    "No Solicitation & Distribution",
    "Personal Telephone Calls",
    "Visitors in the Workplace",
    "Relationships in the Workplace",
    "Conflicts of Interest",
    "Use of Recording Devices",
    "No Solicitation & Distribution", // Second occurrence
    "Progressive Discipline",
    "Performance & Conduct Not Subject to Progressive Discipline",
    "Employee Safety Responsibilities",
    "Drug and Alcohol Free Workplace",
    "Workplace Violence Prevention"
  ];

  // Show all 23 topics in one view (matching PDF layout)
  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-4">Orientation Content & Initials</h3>
      
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-4">
          Please provide your initials for each orientation topic below to acknowledge that you have reviewed and understood each section.
        </p>
      </div>

      {/* Three Column Layout - All 23 Topics */}
      <div className="overflow-x-auto">
        <div className="min-w-full">
          {/* Header Row */}
          <div className="grid grid-cols-12 gap-4 mb-2 border-b pb-2">
            <div className="col-span-5">
              <h4 className="font-medium text-gray-700">Content</h4>
            </div>
            <div className="col-span-3">
              <h4 className="font-medium text-gray-700 text-center">Employee Initials</h4>
            </div>
            <div className="col-span-4">
              <h4 className="font-medium text-gray-700 text-center">Trainer Initials</h4>
            </div>
          </div>

          {/* Content Rows for ALL Topics (1-23) */}
          {orientationContent.map((topic, index) => {
            // For duplicate "No Solicitation & Distribution", show which occurrence it is
            const isDuplicateNoSolicitation = topic === "No Solicitation & Distribution" && 
              orientationContent.slice(0, index).filter(t => t === topic).length > 0;
            
            return (
              <div key={index} className="grid grid-cols-12 gap-4 mb-3 py-2 border-b border-gray-100 hover:bg-gray-50">
                {/* Content Column - Wider */}
                <div className="col-span-5">
                  <div className="flex items-center h-full">
                    <span className="text-sm font-medium text-gray-500 mr-2 min-w-[2rem]">
                      {index + 1}.
                    </span>
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-700 break-words">
                        {topic}
                      </span>
                      {isDuplicateNoSolicitation && (
                        <span className="text-xs text-gray-500 mt-1">
                          (Second occurrence)
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Employee Initials Column */}
                <div className="col-span-3">
                  <div className="flex justify-center h-full items-center">
                    <input
                      type="text"
                      value={formData[`Initials ${index + 1}`] || ''}
                      onChange={(e) => {
                        // Only allow 2-3 characters for initials
                        const value = e.target.value.toUpperCase().slice(0, 3);
                        onInputChange(`Initials ${index + 1}`, value);
                      }}
                      className="w-24 px-3 py-2 border border-gray-300 rounded text-center focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm uppercase"
                      placeholder="XX"
                      maxLength={3}
                    />
                  </div>
                </div>

                {/* Trainer Initials Column */}
                <div className="col-span-4">
                  <div className="flex justify-center h-full items-center">
                    <input
                      type="text"
                      value={formData[`Initials ${index + 1}_2`] || ''}
                      onChange={(e) => {
                        const value = e.target.value.toUpperCase().slice(0, 3);
                        onInputChange(`Initials ${index + 1}_2`, value);
                      }}
                      className="w-24 px-3 py-2 border border-gray-300 rounded text-center focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm uppercase"
                      placeholder="XX"
                      maxLength={3}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Note about duplicate topic */}
      <div className="mt-4 p-3 border border-gray-200 rounded-lg bg-yellow-50">
        <p className="text-sm text-yellow-700">
          <strong>Note:</strong> "No Solicitation & Distribution" appears twice in the list (topics 12 and 18). 
          Please provide initials for both occurrences.
        </p>
      </div>

      <div className="mt-6 p-3 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="text-sm text-gray-600 space-y-2">
          <p>
            <strong>Instructions:</strong> Provide your initials (2-3 characters) for each orientation topic. 
            The trainer initials section is optional and will be completed during the orientation session.
          </p>
          <p className="text-xs">
            <strong>Total Topics:</strong> 23 topics including all listed content.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ContentInitialsSection;