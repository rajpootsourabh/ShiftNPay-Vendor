import React from 'react';

const SeparationSection = ({ formData, onInputChange, onCheckboxChange }) => {
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
      <h3 className="text-lg font-semibold mb-4">Employee Separation Information</h3>
      
      <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
        <p className="text-sm text-gray-600">
          <strong>Note:</strong> Employees who quit will receive their final pay on the regular scheduled payday. Failure to notify the corporate office/payroll that an employee has quit or has been terminated could lead to employee discipline including termination.
        </p>
      </div>

      {/* Employee Information */}
      <div className="mb-6">
        <h4 className="text-md font-medium text-gray-700 mb-3 border-b pb-2">Employee Information</h4>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Employee Name</label>
            <input
              type="text"
              value={formData["Employee Name"]}
              onChange={(e) => onInputChange("Employee Name", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
            <input
              type="text"
              value={formData["ESIPosition"]}
              onChange={(e) => onInputChange("ESIPosition", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Last Day Worked</label>
            <input
              type="date"
              value={formatDateForInput(formData["Last Day Worked"])}
              onChange={(e) => onInputChange("Last Day Worked", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Immediate Supervisor</label>
            <input
              type="text"
              value={formData["Immediate Supervisor"]}
              onChange={(e) => onInputChange("Immediate Supervisor", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Separation Details */}
      <div className="mb-6">
        <h4 className="text-md font-medium text-gray-700 mb-3 border-b pb-2">Separation Details</h4>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Separation Code:</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <label className="flex items-center p-2 border border-gray-300 rounded hover:bg-gray-50">
              <input
                type="checkbox"
                checked={formData["checkbox_QuitWNotice"]}
                onChange={(e) => onCheckboxChange("checkbox_QuitWNotice", e.target.checked)}
                className="h-4 w-4 text-blue-600 rounded"
              />
              <span className="ml-2 text-sm">Quit w/ Notice</span>
            </label>
            <label className="flex items-center p-2 border border-gray-300 rounded hover:bg-gray-50">
              <input
                type="checkbox"
                checked={formData["checkbox_QuitNONotice"]}
                onChange={(e) => onCheckboxChange("checkbox_QuitNONotice", e.target.checked)}
                className="h-4 w-4 text-blue-600 rounded"
              />
              <span className="ml-2 text-sm">Quit NO Notice</span>
            </label>
            <label className="flex items-center p-2 border border-gray-300 rounded hover:bg-gray-50">
              <input
                type="checkbox"
                checked={formData["checkbox_Terminated"]}
                onChange={(e) => onCheckboxChange("checkbox_Terminated", e.target.checked)}
                className="h-4 w-4 text-blue-600 rounded"
              />
              <span className="ml-2 text-sm">Terminated</span>
            </label>
            <label className="flex items-center p-2 border border-gray-300 rounded hover:bg-gray-50">
              <input
                type="checkbox"
                checked={formData["checkbox_Job Abandonment"]}
                onChange={(e) => onCheckboxChange("checkbox_Job Abandonment", e.target.checked)}
                className="h-4 w-4 text-blue-600 rounded"
              />
              <span className="ml-2 text-sm">Job Abandonment</span>
            </label>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Separation</label>
          <textarea
            value={formData["ESIReason"]}
            onChange={(e) => onInputChange("ESIReason", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
            placeholder="Provide detailed reason for separation..."
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">If Terminated, Who Was the Witness?</label>
          <input
            type="text"
            value={formData["If Terminated Who Was the Witness"]}
            onChange={(e) => onInputChange("If Terminated Who Was the Witness", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Witness name"
          />
        </div>
      </div>

      {/* Final Details */}
      <div>
        <h4 className="text-md font-medium text-gray-700 mb-3 border-b pb-2">Final Details</h4>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Total Hours Owed at Termination</label>
            <input
              type="number"
              value={formData["Total Number of Hours Employee is Owed at Termination"]}
              onChange={(e) => onInputChange("Total Number of Hours Employee is Owed at Termination", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
              step="0.5"
              placeholder="0.0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Inactive Date Entered</label>
            <input
              type="date"
              value={formatDateForInput(formData["Inactive Date Entered"])}
              onChange={(e) => onInputChange("Inactive Date Entered", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Completed By</label>
          <input
            type="text"
            value={formData["Completed By"]}
            onChange={(e) => onInputChange("Completed By", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Name of person completing this form"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Manager/HR</label>
          <input
            type="text"
            value={formData["ManagerHR"]}
            onChange={(e) => onInputChange("ManagerHR", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Manager or HR representative name"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Is Employee Eligible for Rehire?</label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData["checkbox_Eligible RehireYes"]}
                onChange={(e) => onCheckboxChange("checkbox_Eligible RehireYes", e.target.checked)}
                className="h-4 w-4 text-blue-600 rounded"
              />
              <span className="ml-2 text-sm">Yes</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData["checkbox_EligibleRehireNo"]}
                onChange={(e) => onCheckboxChange("checkbox_EligibleRehireNo", e.target.checked)}
                className="h-4 w-4 text-blue-600 rounded"
              />
              <span className="ml-2 text-sm">No</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeparationSection;