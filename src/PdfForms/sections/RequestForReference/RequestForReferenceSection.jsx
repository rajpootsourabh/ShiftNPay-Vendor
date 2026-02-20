
import React from 'react';

const RequestForReferenceSection = ({ formData, onInputChange, onCheckboxChange }) => {
  
  // Handle mutually exclusive checkboxes for Notice
  const handleNoticeChange = (selectedOption) => {
    onCheckboxChange("Notice Yes", selectedOption === 'Yes');
    onCheckboxChange("Notice No", selectedOption === 'No');
  };

  // Handle mutually exclusive checkboxes for Reference questions
  const handleReferenceChange = (fieldKey, selectedOption) => {
    onCheckboxChange(`${fieldKey} Yes`, selectedOption === 'Yes');
    onCheckboxChange(`${fieldKey} No`, selectedOption === 'No');
  };

  // Handle phone number input with validation
  const handlePhoneChange = (value) => {
    // Allow only numbers, dashes, and parentheses
    const cleanedValue = value.replace(/[^\d\-()\s]/g, '');
    onInputChange("Phone Number", cleanedValue);
  };

  // Handle salary input with validation
  const handleSalaryChange = (value) => {
    // Allow only numbers and decimal point
    const cleanedValue = value.replace(/[^\d.]/g, '');
    onInputChange("Salary", cleanedValue);
  };

  // Format date for display in date inputs
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    // If it's already in YYYY-MM-DD format, return as is
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return dateString;
    
    // Try to parse other date formats
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
    
    return dateString;
  };

  return (
    <div className="mb-8">
      {/* Reply Information */}
      <div className="mb-6">
        <div className="flex items-center mb-4 w-1/3">
          <span className="font-medium mr-2">Please reply by:</span>
          <input
            type="date"
            value={formatDateForInput(formData["Please reply by"])}
            onChange={(e) => onInputChange("Please reply by", e.target.value)}
            className="flex-1 border-b border-gray-300 px-2 py-1 focus:outline-none focus:border-blue-500"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
            <input
              type="text"
              value={formData["Company Name 1"]}
              onChange={(e) => onInputChange("Company Name 1", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input
              type="text"
              value={formData["Phone Number"]}
              onChange={(e) => handlePhoneChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="(123) 456-7890"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Employee Name</label>
            <input
              type="text"
              value={formData["Employee Name"]}
              onChange={(e) => onInputChange("Employee Name", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
            <input
              type="date"
              value={formatDateForInput(formData["Date of Birth"])}
              onChange={(e) => onInputChange("Date of Birth", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Address Field */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
          <input
            type="text"
            value={formData["Address 1"]}
            onChange={(e) => onInputChange("Address 1", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter full address"
          />
        </div>
      </div>

      {/* Permission Section */}
      <div className="mb-6 p-4 border border-gray-300 rounded">
        <div className="flex items-center">
          <span>I,</span>
          <input
            type="text"
            value={formData["I"]}
            onChange={(e) => onInputChange("I", e.target.value)}
            className="flex-1 mx-2 border-b border-gray-300 px-2 py-1 focus:outline-none focus:border-blue-500"
          />
          <span>, hereby give my permission for the release of information to Mastercare, Inc. regarding my employment and earnings.</span>
        </div>
      </div>

      {/* Employment Verification */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4 border-b pb-2">Employment Verification</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dates of Employment</label>
            <div className="flex gap-2">
              <div className="flex-1">
                <span className="text-xs text-gray-500">From:</span>
                <input
                  type="date"
                  value={formatDateForInput(formData["From"])}
                  onChange={(e) => onInputChange("From", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex-1">
                <span className="text-xs text-gray-500">To:</span>
                <input
                  type="date"
                  value={formatDateForInput(formData["To"])}
                  onChange={(e) => onInputChange("To", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Leaving</label>
            <input
              type="text"
              value={formData["Reason for Leaving"]}
              onChange={(e) => onInputChange("Reason for Leaving", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Salary</label>
            <input
              type="text"
              value={formData["Salary"]}
              onChange={(e) => handleSalaryChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 50000.00"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Was Notice Provided?</label>
          <div className="flex gap-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData["Notice Yes"]}
                onChange={(e) => {
                  if (e.target.checked) handleNoticeChange('Yes');
                }}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2"
              />
              YES
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData["Notice No"]}
                onChange={(e) => {
                  if (e.target.checked) handleNoticeChange('No');
                }}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2"
              />
              NO
            </label>
          </div>
        </div>
      </div>

      {/* Reference Verification */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4 border-b pb-2">Reference Verification</h3>
        <p className="text-sm text-gray-600 mb-4 italic">For your convenience you may choose to answer with a yes or no.</p>
        
        <div className="space-y-4">
          {[
            { key: "Knowledgeable", label: "Knowledgeable of Position" },
            { key: "Dependable", label: "Dependable" },
            { key: "Rehire", label: "Eligible for Rehire" },
            { key: "Recommend", label: "Would You Recommend" }
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between p-3 border border-gray-200 rounded">
              <span className="font-medium">{item.label}</span>
              <div className="flex gap-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData[`${item.key} Yes`]}
                    onChange={(e) => {
                      if (e.target.checked) handleReferenceChange(item.key, 'Yes');
                    }}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2"
                  />
                  Yes
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData[`${item.key} No`]}
                    onChange={(e) => {
                      if (e.target.checked) handleReferenceChange(item.key, 'No');
                    }}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2"
                  />
                  No
                </label>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Additional Information:</label>
          <textarea
            value={formData["Additional InformationRow1"]}
            onChange={(e) => onInputChange("Additional InformationRow1", e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Information Provided By */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4 border-b pb-2">Information provided by:</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={formData["Name"]}
              onChange={(e) => onInputChange("Name", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={formData["Title"]}
              onChange={(e) => onInputChange("Title", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={formatDateForInput(formData["Date_2"])}
              onChange={(e) => onInputChange("Date_2", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t pt-6">
        <p className="text-sm italic mb-4">Thank you for your time, consideration, and cooperation.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mastercare Representative</label>
            <input
              type="text"
              value={formData["Mastercare Representative"]}
              onChange={(e) => onInputChange("Mastercare Representative", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={formatDateForInput(formData["Date_3"])}
              onChange={(e) => onInputChange("Date_3", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="bg-gray-100 p-4 rounded">
          <label className="block text-sm font-medium text-gray-700 mb-1">Please return references to:</label>
          <input
            type="text"
            value={formData["Mastercare Office Address"]}
            onChange={(e) => onInputChange("Mastercare Office Address", e.target.value)}
            placeholder="(Enter Mastercare Office Address)"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );
};

export default RequestForReferenceSection;