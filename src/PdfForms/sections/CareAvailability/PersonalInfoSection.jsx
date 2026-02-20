// components/forms/sections/CareAvailability/PersonalInfoSection.jsx
import React from 'react';

const PersonalInfoSection = ({ formData, onInputChange }) => {
  // Format phone numbers
  const handlePhoneChange = (field, value) => {
    let cleaned = value.replace(/\D/g, '');
    
    if (cleaned.length > 3 && cleaned.length <= 6) {
      cleaned = '(' + cleaned.slice(0, 3) + ') ' + cleaned.slice(3);
    } else if (cleaned.length > 6) {
      cleaned = '(' + cleaned.slice(0, 3) + ') ' + cleaned.slice(3, 6) + '-' + cleaned.slice(6, 10);
    }
    
    onInputChange(field, cleaned);
  };

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input
            type="text"
            value={formData["Name"]}
            onChange={(e) => onInputChange("Name", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
          <input
            type="text"
            value={formData["Position"]}
            onChange={(e) => onInputChange("Position", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
          <input
            type="text"
            value={formData["Address"]}
            onChange={(e) => onInputChange("Address", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cell Phone</label>
          <input
            type="text"
            value={formData["Cell Phone"]}
            onChange={(e) => handlePhoneChange("Cell Phone", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="(123) 456-7890"
            maxLength={14}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Home Phone</label>
          <input
            type="text"
            value={formData["Home Phone"]}
            onChange={(e) => handlePhoneChange("Home Phone", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="(123) 456-7890"
            maxLength={14}
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            value={formData["Email"]}
            onChange={(e) => onInputChange("Email", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
      </div>
    </div>
  );
};

export default PersonalInfoSection;