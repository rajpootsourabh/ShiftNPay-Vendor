// components/forms/sections/BackgroundCheck/PersonalInfoSection.jsx
import React from 'react';

const PersonalInfoSection = ({ formData, onInputChange }) => {
  // Format SSN for better UX
  const handleSSNChange = (value) => {
    // Remove all non-digits
    let cleaned = value.replace(/\D/g, '');
    
    // Format as XXX-XX-XXXX
    if (cleaned.length > 3 && cleaned.length <= 5) {
      cleaned = cleaned.slice(0, 3) + '-' + cleaned.slice(3);
    } else if (cleaned.length > 5) {
      cleaned = cleaned.slice(0, 3) + '-' + cleaned.slice(3, 5) + '-' + cleaned.slice(5, 9);
    }
    
    onInputChange("Social Security", cleaned);
  };

  // Format phone number
  const handlePhoneChange = (value) => {
    // Remove all non-digits
    let cleaned = value.replace(/\D/g, '');
    
    // Format as (XXX) XXX-XXXX
    if (cleaned.length > 3 && cleaned.length <= 6) {
      cleaned = '(' + cleaned.slice(0, 3) + ') ' + cleaned.slice(3);
    } else if (cleaned.length > 6) {
      cleaned = '(' + cleaned.slice(0, 3) + ') ' + cleaned.slice(3, 6) + '-' + cleaned.slice(6, 10);
    }
    
    onInputChange("Phone", cleaned);
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

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
      
      {/* Header Information */}
      <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
        <p className="text-sm text-gray-600 mb-3">
          <strong>Important:</strong> Each employee or volunteer to be screened must sign this authorization/waiver/indemnity form, giving approval for Mastercare Homecare, Inc. to perform an investigative background check.
        </p>
      </div>

      {/* Applicant Name */}
      <div className="mb-6">
        <h4 className="text-md font-medium text-gray-700 mb-3">Applicant Printed Name</h4>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Last</label>
            <input
              type="text"
              value={formData["Last First Middle"] ? formData["Last First Middle"].split(' ')[0] || '' : ''}
              onChange={(e) => {
                const current = formData["Last First Middle"] || '';
                const parts = current.split(' ');
                onInputChange("Last First Middle", `${e.target.value} ${parts[1] || ''} ${parts[2] || ''}`.trim());
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">First</label>
            <input
              type="text"
              value={formData["Last First Middle"] ? formData["Last First Middle"].split(' ')[1] || '' : ''}
              onChange={(e) => {
                const current = formData["Last First Middle"] || '';
                const parts = current.split(' ');
                onInputChange("Last First Middle", `${parts[0] || ''} ${e.target.value} ${parts[2] || ''}`.trim());
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Middle</label>
            <input
              type="text"
              value={formData["Last First Middle"] ? formData["Last First Middle"].split(' ')[2] || '' : ''}
              onChange={(e) => {
                const current = formData["Last First Middle"] || '';
                const parts = current.split(' ');
                onInputChange("Last First Middle", `${parts[0] || ''} ${parts[1] || ''} ${e.target.value}`.trim());
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Maiden Name and Other Names */}
      <div className="mb-6 grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Maiden Name</label>
          <input
            type="text"
            value={formData["Maiden"]}
            onChange={(e) => onInputChange("Maiden", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Other Names Used</label>
          <input
            type="text"
            value={formData["Other Names Used"]}
            onChange={(e) => onInputChange("Other Names Used", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="List any other names you've used"
          />
        </div>
      </div>

      {/* SSN and DOB */}
      <div className="mb-6 grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Social Security Number</label>
          <input
            type="text"
            value={formData["Social Security"]}
            onChange={(e) => handleSSNChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="XXX-XX-XXXX"
            maxLength={11}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
          <input
            type="date"
            value={formatDateForInput(formData["DOB"])}
            onChange={(e) => onInputChange("DOB", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Contact Information */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
          <input
            type="text"
            value={formData["Phone"]}
            onChange={(e) => handlePhoneChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="(XXX) XXX-XXXX"
            maxLength={14}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Driver’s License #</label>
          <input
            type="text"
            value={formData["Driver’s License"]}
            onChange={(e) => onInputChange("Driver’s License", e.target.value.toUpperCase())}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
          <input
            type="text"
            value={formData["State"]}
            onChange={(e) => onInputChange("State", e.target.value.toUpperCase())}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="TX"
            maxLength={2}
          />
        </div>
      </div>
    </div>
  );
};

export default PersonalInfoSection;