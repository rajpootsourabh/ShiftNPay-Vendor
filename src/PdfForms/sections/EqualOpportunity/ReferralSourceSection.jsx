import React from 'react';

const ReferralSourceSection = ({ formData, onInputChange, onCheckboxChange }) => {
  const referralSources = [
    { key: "Newspaper", label: "Newspaper", hasSpecify: true, specifyKey: "Specify", specifyLabel: "Specify" },
    { key: "Employment Agency", label: "Employment Agency", hasSpecify: true, specifyKey: "Specify_2", specifyLabel: "Specify" },
    { key: "School", label: "School", hasSpecify: true, specifyKey: "Specify_3", specifyLabel: "Specify" },
    { key: "Internet", label: "Internet", hasSpecify: true, specifyKey: "Specify_4", specifyLabel: "Specify" },
    { key: "Employee Referral", label: "Employee Referral", hasSpecify: true, specifyKey: "Name of Employee", specifyLabel: "Name of Employee" },
    { key: "Other", label: "Other", hasSpecify: true, specifyKey: "Specify_5", specifyLabel: "Specify" },
    { key: "Walk-In", label: "Walk-In", hasSpecify: false },
    { key: "Relative-Friend", label: "Relative / Friend", hasSpecify: false },
    { key: "TV-Radio", label: "TV / Radio", hasSpecify: false },
    { key: "Flier", label: "Flier", hasSpecify: false },
    { key: "Mastercare Website", label: "Mastercare Website", hasSpecify: false },
    { key: "Unsolicited Resume", label: "Unsolicited Resume", hasSpecify: false }
  ];

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-4">How did you find out about this job?</h3>
      <div className="space-y-4">
        {referralSources.map(source => (
          <div key={source.key} className="flex flex-col sm:flex-row sm:items-start gap-4 p-4 border border-gray-200 rounded-lg">
            <label className="flex items-center gap-3 min-w-[200px]">
              <input
                type="checkbox"
                checked={formData[source.key]}
                onChange={(e) => onCheckboxChange(source.key, e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="font-medium text-gray-700">{source.label}</span>
            </label>
            
            {source.hasSpecify && (
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {source.specifyLabel}
                </label>
                <input
                  type="text"
                  value={formData[source.specifyKey]}
                  onChange={(e) => onInputChange(source.specifyKey, e.target.value)}
                  disabled={!formData[source.key]} // Disable if checkbox is not checked
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    !formData[source.key] ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''
                  }`}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReferralSourceSection;