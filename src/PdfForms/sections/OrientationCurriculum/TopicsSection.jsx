import React, { useState } from 'react';

const TopicsSection = ({ formData, onInputChange, onBulkUpdate }) => {
  const [bulkDate, setBulkDate] = useState('');
  const [bulkTrainerInitials, setBulkTrainerInitials] = useState('');
  const [bulkEmployeeInitials, setBulkEmployeeInitials] = useState('');

  const topics = [
    "Cultural Differences",
    "Blood Bourne Pathogens",
    "Emergency Preparedness",
    "Fall Prevention",
    "Fire Safety",
    "Violence in the Home",
    "Developmentally Disabled",
    "Infection Control"
  ];

  const handleBulkApply = () => {
    onBulkUpdate(bulkDate, bulkTrainerInitials.toUpperCase(), bulkEmployeeInitials.toUpperCase());
  };

  // Format date for input
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return dateString;
    
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
    
    return dateString;
  };

  // Handle initials input - auto-uppercase and limit to 3 characters
  const handleInitialsChange = (field, value) => {
    const cleaned = value.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 3);
    onInputChange(field, cleaned);
  };

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-4">Training Topics</h3>
      
      {/* Bulk Update Section */}
      <div className="mb-6 p-4 border border-blue-300 rounded-lg bg-blue-50">
        <h4 className="text-md font-semibold text-blue-800 mb-3">Bulk Update (Apply to all topics)</h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={bulkDate}
              onChange={(e) => setBulkDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Trainer Initials</label>
            <input
              type="text"
              value={bulkTrainerInitials}
              onChange={(e) => setBulkTrainerInitials(e.target.value.toUpperCase().slice(0, 3))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="ABC"
              maxLength={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Employee Initials</label>
            <input
              type="text"
              value={bulkEmployeeInitials}
              onChange={(e) => setBulkEmployeeInitials(e.target.value.toUpperCase().slice(0, 3))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="XYZ"
              maxLength={3}
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleBulkApply}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Apply to All
            </button>
          </div>
        </div>
        <p className="text-xs text-blue-600">
          Use this section to quickly fill all topics with the same information.
        </p>
      </div>

      {/* Topics Table */}
      <div className="mb-6">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-2/5">
                  TOPIC
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trainer Initials
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee Initials
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {topics.map((topic, index) => {
                const rowNum = index + 1;
                return (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 border-r">
                      {topic}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <input
                        type="date"
                        value={formatDateForInput(formData[`DateRow${rowNum}`])}
                        onChange={(e) => onInputChange(`DateRow${rowNum}`, e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <input
                        type="text"
                        value={formData[`Trainer InitialsRow${rowNum}`]}
                        onChange={(e) => handleInitialsChange(`Trainer InitialsRow${rowNum}`, e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-center focus:outline-none focus:ring-1 focus:ring-blue-500 uppercase"
                        placeholder="ABC"
                        maxLength={3}
                      />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <input
                        type="text"
                        value={formData[`Employee InitialsRow${rowNum}`]}
                        onChange={(e) => handleInitialsChange(`Employee InitialsRow${rowNum}`, e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-center focus:outline-none focus:ring-1 focus:ring-blue-500 uppercase"
                        placeholder="XYZ"
                        maxLength={3}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-6 p-4 border border-gray-300 rounded bg-gray-50">
        <h4 className="text-md font-semibold text-gray-800 mb-2">Instructions:</h4>
        <ul className="text-sm text-gray-700 space-y-1 list-disc pl-5">
          <li>Fill in the date for each training topic completion</li>
          <li>Enter trainer initials (maximum 3 characters)</li>
          <li>Enter your initials (maximum 3 characters)</li>
          <li>Use "Apply to All" button to quickly fill all topics with the same information</li>
          <li>All initials will be automatically converted to uppercase</li>
        </ul>
      </div>
    </div>
  );
};

export default TopicsSection;