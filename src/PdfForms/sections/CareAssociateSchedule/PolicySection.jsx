import React from 'react';

const PolicySection = ({ formData, onInputChange }) => {
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
      <h3 className="text-lg font-semibold mb-4">Schedule Policy Review</h3>
      
      {/* Policy Header */}
      <div className="mb-6 p-4 border border-gray-300 rounded bg-gray-50">
        <p className="text-sm text-gray-700">
          Please read the following statements and sign below to indicate your acknowledgement of the
          Care Associate Schedule policy.
        </p>
      </div>

      {/* Policy Statements */}
      <div className="mb-6">
        <div className="space-y-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3 mt-0.5">
              <span className="text-blue-600 font-semibold">1</span>
            </div>
            <div className="flex-1 p-3 border border-gray-200 rounded bg-white">
              <p className="text-sm text-gray-700">
                Your schedule will be supplied to you weekly.
              </p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3 mt-0.5">
              <span className="text-blue-600 font-semibold">2</span>
            </div>
            <div className="flex-1 p-3 border border-gray-200 rounded bg-white">
              <p className="text-sm text-gray-700">
                You can only work your authorized schedule and you will be paid according to this schedule.
              </p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3 mt-0.5">
              <span className="text-blue-600 font-semibold">3</span>
            </div>
            <div className="flex-1 p-3 border border-gray-200 rounded bg-white">
              <p className="text-sm text-gray-700">
                If you do not receive your schedule you must check with the office to confirm your hours and days to be worked.
              </p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3 mt-0.5">
              <span className="text-blue-600 font-semibold">4</span>
            </div>
            <div className="flex-1 p-3 border border-gray-200 rounded bg-white">
              <p className="text-sm text-gray-700">
                You must not work over your authorized hours. You will NOT be paid for any hours that were not previously scheduled.
              </p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3 mt-0.5">
              <span className="text-blue-600 font-semibold">5</span>
            </div>
            <div className="flex-1 p-3 border border-gray-200 rounded bg-white">
              <p className="text-sm text-gray-700">
                If there are special circumstances where you must go over your authorized hours, you must call the office for approval. The office will contact the client and request the additional hour(s).
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Acknowledgment Statement */}
      <div className="mb-6 p-4 border border-blue-200 rounded-lg bg-blue-50">
        <h4 className="text-md font-semibold text-blue-800 mb-3">Acknowledgment Statement:</h4>
        <p className="text-sm text-blue-700 italic mb-4">
          "I acknowledge that I have read and understand the Care Associate Schedule Acknowledgement. If I have any questions about my schedule, I understand that I need to contact the Staffing Coordinator or the Mastercare Office for assistance."
        </p>
        
        <div className="mt-4 p-3 bg-white border border-blue-100 rounded">
          <p className="text-sm text-gray-600">
            This statement will be signed in the next section along with the Mastercare representative signature.
          </p>
        </div>
      </div>

      {/* Basic Information */}
      <div className="mt-6 p-4 border border-gray-300 rounded bg-gray-50">
        <h4 className="text-md font-semibold text-gray-800 mb-3">Care Associate Information:</h4>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Care Associate Print Name
          </label>
          <input
            type="text"
            value={formData["Care Associate Print Name"]}
            onChange={(e) => onInputChange("Care Associate Print Name", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your full name"
            required
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date (Care Associate)
            </label>
            <input
              type="date"
              value={formatDateForInput(formData["Date"])}
              onChange={(e) => onInputChange("Date", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date (Mastercare Representative)
            </label>
            <input
              type="date"
              value={formatDateForInput(formData["Date_2"])}
              onChange={(e) => onInputChange("Date_2", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PolicySection;