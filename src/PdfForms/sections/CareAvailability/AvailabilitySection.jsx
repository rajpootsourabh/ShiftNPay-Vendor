// components/forms/sections/CareAvailability/AvailabilitySection.jsx
import React from 'react';

const AvailabilitySection = ({ formData, onInputChange }) => {
  const days = [
    { key: 'Sun', label: 'Sunday', amField: 'SundayAM', pmField: 'SundayPM' },
    { key: 'Mon', label: 'Monday', amField: 'MondayAM', pmField: 'MondayPM' },
    { key: 'Tue', label: 'Tuesday', amField: 'TuesdayAM', pmField: 'TuesdayPM' },
    { key: 'Wed', label: 'Wednesday', amField: 'WedAM', pmField: 'WedPM' },
    { key: 'Thu', label: 'Thursday', amField: 'ThuAM', pmField: 'ThuPM' },
    { key: 'Fri', label: 'Friday', amField: 'FridayAM', pmField: 'FridayPM' },
    { key: 'Sat', label: 'Saturday', amField: 'SatAM', pmField: 'SatPM' }
  ];

  const timeSlots = ['AM', 'PM'];

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-4">My Availability</h3>
      
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 p-2 text-sm font-medium text-gray-700 w-20"></th>
              {days.map(day => (
                <th key={day.key} className="border border-gray-300 p-2 text-sm font-medium text-gray-700 text-center">
                  {day.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timeSlots.map(slot => (
              <tr key={slot}>
                <td className="border border-gray-300 p-2 text-sm font-medium text-gray-700 bg-gray-50">
                  {slot}
                </td>
                {days.map(day => {
                  const fieldName = slot === 'AM' ? day.amField : day.pmField;
                  return (
                    <td key={day.key + slot} className="border border-gray-300 p-2">
                      <input
                        type="text"
                        value={formData[fieldName] || ''}
                        onChange={(e) => onInputChange(fieldName, e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-center focus:outline-none focus:ring-1 focus:ring-blue-500"
                        // placeholder="Available?"
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-700">
          <strong>Instructions:</strong> Please indicate your availability for each day and time slot (AM/PM). 
          You can enter specific times (e.g., "8-12AM"), "Available", or leave blank for unavailable.
        </p>
      </div>
    </div>
  );
};

export default AvailabilitySection;