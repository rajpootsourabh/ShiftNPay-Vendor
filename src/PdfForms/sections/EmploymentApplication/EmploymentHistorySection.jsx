import React from 'react';

const EmploymentHistorySection = ({ formData, onInputChange, onCheckboxChange }) => {
  const employmentRecords = [
    {
      prefix: "",
      fields: {
        employer: "Name of Employer",
        from: "EMPLOYMENT FROM",
        to: "EMPLOYMENT TO",
        address: "COMPLETE ADDRESS",
        phone: "PHONE NUMBER",
        supervisor: "NAME OF SUPERVISOR",
        contactYes: "MAY WE CONTACT FOR REFERENCES",
        contactNo: "NO_5",
        jobTitle: "YOUR LAST JOB TITLE",
        reason: "REASON FOR LEAVING PLEASE BE SPECIFIC",
        duties: "PLEASE LIST THE JOB DUTIES OF YOUR POSITION WITH THIS COMPANYRow1"
      }
    },
    {
      prefix: "_2",
      fields: {
        employer: "2 NAME OF EMPLOYER",
        from: "EMPLOYMENT DATES FROM_2",
        to: "EMPLOYMENT DATES TO_2",
        address: "COMPLETE ADDRESS_2",
        phone: "PHONE NUMBER_2",
        supervisor: "NAME OF SUPERVISOR_2",
        contactYes: "MAY WE CONTACT FOR REFERENCES_2",
        contactNo: "NO_6",
        jobTitle: "YOUR LAST JOB TITLE_2",
        reason: "REASON FOR LEAVING PLEASE BE SPECIFIC_2",
        duties: "PLEASE LIST THE JOB DUTIES OF YOUR POSITION WITH THIS COMPANYRow1_2"
      }
    },
    {
      prefix: "_3",
      fields: {
        employer: "3 NAME OF EMPLOYER",
        from: "EMPLOYMENT DATES FROM_3",
        to: "EMPLOYMENT DATES TO_3",
        address: "COMPLETE ADDRESS_3",
        phone: "PHONE NUMBER_3",
        supervisor: "NAME OF SUPERVISOR_3",
        contactYes: "MAY WE CONTACT FOR REFERENCES_3",
        contactNo: "NO_7",
        jobTitle: "YOUR LAST JOB TITLE_3",
        reason: "REASON FOR LEAVING PLEASE BE SPECIFIC_3",
        duties: "PLEASE LIST THE JOB DUTIES OF YOUR POSITION WITH THIS COMPANYRow1_3"
      }
    }
  ];

  // Handle contact reference selection (mutually exclusive)
  const handleContactReferenceChange = (record, selectedOption) => {
    if (selectedOption === 'yes') {
      onCheckboxChange(record.fields.contactYes, true);
      onCheckboxChange(record.fields.contactNo, false);
    } else if (selectedOption === 'no') {
      onCheckboxChange(record.fields.contactYes, false);
      onCheckboxChange(record.fields.contactNo, true);
    }
  };

  // Convert date to MM/YYYY string format
  const formatDateToString = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${year}`;
  };

  // Convert MM/YYYY string to date input value (YYYY-MM)
  const formatStringToDateInput = (dateString) => {
    if (!dateString) return '';
    
    // Check if it's already in MM/YYYY format
    const match = dateString.match(/^(\d{1,2})\/(\d{4})$/);
    if (match) {
      const month = match[1].padStart(2, '0');
      const year = match[2];
      return `${year}-${month}`;
    }
    
    return '';
  };

  // Handle date input change
  const handleDateChange = (fieldKey, dateValue) => {
    const formattedDate = formatDateToString(dateValue);
    onInputChange(fieldKey, formattedDate);
  };

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-4">Employment History</h3>
      
      {employmentRecords.map((record, index) => (
        <div key={record.prefix || "first"} className="mb-8 p-4 border border-gray-200 rounded-lg">
          <h4 className="text-md font-medium text-gray-700 mb-4">
            Employment Record {index + 1}
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Employer Information */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name of Employer
              </label>
              <input
                type="text"
                value={formData[record.fields.employer]}
                onChange={(e) => onInputChange(record.fields.employer, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Employment From
              </label>
              <input
                type="month"
                value={formatStringToDateInput(formData[record.fields.from])}
                onChange={(e) => handleDateChange(record.fields.from, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {formData[record.fields.from] && (
                <p className="text-xs text-gray-500 mt-1">
                  Display: {formData[record.fields.from]}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Employment To
              </label>
              <input
                type="month"
                value={formatStringToDateInput(formData[record.fields.to])}
                onChange={(e) => handleDateChange(record.fields.to, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {formData[record.fields.to] && (
                <p className="text-xs text-gray-500 mt-1">
                  Display: {formData[record.fields.to]}
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Complete Address
              </label>
              <input
                type="text"
                value={formData[record.fields.address]}
                onChange={(e) => onInputChange(record.fields.address, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                value={formData[record.fields.phone]}
                onChange={(e) => onInputChange(record.fields.phone, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name of Supervisor
              </label>
              <input
                type="text"
                value={formData[record.fields.supervisor]}
                onChange={(e) => onInputChange(record.fields.supervisor, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Job Title
              </label>
              <input
                type="text"
                value={formData[record.fields.jobTitle]}
                onChange={(e) => onInputChange(record.fields.jobTitle, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Contact Reference */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                May we contact for references?
              </label>
              <div className="flex gap-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData[record.fields.contactYes]}
                    onChange={(e) => {
                      if (e.target.checked) {
                        handleContactReferenceChange(record, 'yes');
                      }
                    }}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2"
                  />
                  Yes
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData[record.fields.contactNo]}
                    onChange={(e) => {
                      if (e.target.checked) {
                        handleContactReferenceChange(record, 'no');
                      }
                    }}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2"
                  />
                  No
                </label>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason for Leaving
              </label>
              <input
                type="text"
                value={formData[record.fields.reason]}
                onChange={(e) => onInputChange(record.fields.reason, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Please be specific"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Job Duties
              </label>
              <textarea
                value={formData[record.fields.duties]}
                onChange={(e) => onInputChange(record.fields.duties, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical min-h-[80px]"
                placeholder="Please list the job duties of your position"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default EmploymentHistorySection;