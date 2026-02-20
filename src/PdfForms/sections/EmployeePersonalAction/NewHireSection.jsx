import React from 'react';

const NewHireSection = ({ formData, onInputChange, onCheckboxChange }) => {
  // Format SSN
  const handleSSNChange = (value) => {
    let cleaned = value.replace(/\D/g, '');
    
    if (cleaned.length > 3 && cleaned.length <= 5) {
      cleaned = cleaned.slice(0, 3) + '-' + cleaned.slice(3);
    } else if (cleaned.length > 5) {
      cleaned = cleaned.slice(0, 3) + '-' + cleaned.slice(3, 5) + '-' + cleaned.slice(5, 9);
    }
    
    onInputChange("ssn", cleaned);
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

  // Format currency
  const handleCurrencyChange = (value) => {
    const cleaned = value.replace(/[^0-9.]/g, '');
    onInputChange("Pay Rate", cleaned);
  };

  // Format routing number
  const handleRoutingChange = (value) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 9);
    onInputChange("Routing", cleaned);
  };

  // Format account number
  const handleAccountChange = (value) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 17);
    onInputChange("Account", cleaned);
  };

  // Format ZIP code
  const handleZipChange = (value) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 5);
    onInputChange("zipcode", cleaned);
  };

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-4">New Hire Information</h3>
      
      {/* Personal Information */}
      <div className="mb-6">
        <h4 className="text-md font-medium text-gray-700 mb-3 border-b pb-2">Personal Information</h4>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
            <input
              type="text"
              value={formData["Last Name"]}
              onChange={(e) => onInputChange("Last Name", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
            <input
              type="text"
              value={formData["First Name"]}
              onChange={(e) => onInputChange("First Name", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Mailing Address</label>
          <input
            type="text"
            value={formData["Mail"]}
            onChange={(e) => onInputChange("Mail", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Street Address, City, State ZIP"
          />
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
            <input
              type="text"
              value={formData["State"]}
              onChange={(e) => onInputChange("State", e.target.value.toUpperCase().slice(0, 2))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="TX"
              maxLength={2}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
            <input
              type="text"
              value={formData["zipcode"]}
              onChange={(e) => handleZipChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="77001"
              maxLength={5}
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

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
            <input
              type="text"
              value={formData["Gender identified as"]}
              onChange={(e) => onInputChange("Gender identified as", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Male/Female/Other"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">SSN</label>
            <input
              type="text"
              value={formData["ssn"]}
              onChange={(e) => handleSSNChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="XXX-XX-XXXX"
              maxLength={11}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Marital Status</label>
            <div className="flex gap-4 mt-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData["checkbox_married"]}
                  onChange={(e) => onCheckboxChange("checkbox_married", e.target.checked)}
                  className="h-4 w-4 text-blue-600 rounded"
                />
                <span className="ml-2 text-sm">Married</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData["checkbox_divorced"]}
                  onChange={(e) => onCheckboxChange("checkbox_divorced", e.target.checked)}
                  className="h-4 w-4 text-blue-600 rounded"
                />
                <span className="ml-2 text-sm">Divorced</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData["checkbox_single"]}
                  onChange={(e) => onCheckboxChange("checkbox_single", e.target.checked)}
                  className="h-4 w-4 text-blue-600 rounded"
                />
                <span className="ml-2 text-sm">Single</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Employment Information */}
      <div className="mb-6">
        <h4 className="text-md font-medium text-gray-700 mb-3 border-b pb-2">Employment Information</h4>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date of Hire</label>
            <input
              type="date"
              value={formatDateForInput(formData["Date of Hire"])}
              onChange={(e) => onInputChange("Date of Hire", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
            <input
              type="text"
              value={formData["Position"]}
              onChange={(e) => onInputChange("Position", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pay Rate ($/hr)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              <input
                type="text"
                value={formData["Pay Rate"]}
                onChange={(e) => handleCurrencyChange(e.target.value)}
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Verify I-9 Date</label>
            <input
              type="date"
              value={formatDateForInput(formData["Verify I-9"])}
              onChange={(e) => onInputChange("Verify I-9", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hours Per Week</label>
            <input
              type="number"
              value={formData["Hours Per Week"]}
              onChange={(e) => onInputChange("Hours Per Week", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
              max="168"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Resident of (State)</label>
            <input
              type="text"
              value={formData["Resident of"]}
              onChange={(e) => onInputChange("Resident of", e.target.value.toUpperCase())}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="TX"
              maxLength={2}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">W-4 Status</label>
            <input
              type="text"
              value={formData["W-4 Status"]}
              onChange={(e) => onInputChange("W-4 Status", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Single-2"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Reports To</label>
          <input
            type="text"
            value={formData["Reports To"]}
            onChange={(e) => onInputChange("Reports To", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Supervisor's Name"
          />
        </div>
      </div>

      {/* Payroll Information */}
      <div>
        <h4 className="text-md font-medium text-gray-700 mb-3 border-b pb-2">Payroll Information</h4>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Send Paychecks to:</label>
          <div className="flex gap-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData["checkbox_PickupatOffice"]}
                onChange={(e) => onCheckboxChange("checkbox_PickupatOffice", e.target.checked)}
                className="h-4 w-4 text-blue-600 rounded"
              />
              <span className="ml-2 text-sm">Pick up at Office</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData["checkbox_DirectDeposit"]}
                onChange={(e) => onCheckboxChange("checkbox_DirectDeposit", e.target.checked)}
                className="h-4 w-4 text-blue-600 rounded"
              />
              <span className="ml-2 text-sm">Direct Deposit</span>
            </label>
          </div>
        </div>

        {formData["checkbox_DirectDeposit"] && (
          <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
            <h5 className="text-sm font-medium text-gray-700 mb-3">Direct Deposit Information</h5>
            
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Account Type:</label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData["checkbox_checking"]}
                    onChange={(e) => onCheckboxChange("checkbox_checking", e.target.checked)}
                    className="h-4 w-4 text-blue-600 rounded"
                  />
                  <span className="ml-2 text-sm">Checking</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData["checkbox_savings"]}
                    onChange={(e) => onCheckboxChange("checkbox_savings", e.target.checked)}
                    className="h-4 w-4 text-blue-600 rounded"
                  />
                  <span className="ml-2 text-sm">Savings</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                <input
                  type="text"
                  value={formData["Bank Name"]}
                  onChange={(e) => onInputChange("Bank Name", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Routing #</label>
                <input
                  type="text"
                  value={formData["Routing"]}
                  onChange={(e) => handleRoutingChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="9 digits"
                  maxLength={9}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Account #</label>
              <input
                type="text"
                value={formData["Account"]}
                onChange={(e) => handleAccountChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Account number"
                maxLength={17}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewHireSection;