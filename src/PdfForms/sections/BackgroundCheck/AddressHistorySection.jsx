// components/forms/sections/BackgroundCheck/AddressHistorySection.jsx
import React from 'react';

const AddressHistorySection = ({ formData, onInputChange }) => {
  // Handle years input - only allow numbers
  const handleYearsChange = (field, value) => {
    const cleaned = value.replace(/\D/g, '');
    onInputChange(field, cleaned);
  };

  const addressFields = [
    {
      label: "Current Address",
      streetField: "Street",
      cityStateZipField: "CityStateZip",
      yearsField: "Years",
      required: true
    },
    {
      label: "Previous Address (1)",
      streetField: "Street_2",
      cityStateZipField: "CityStateZip_2",
      yearsField: "Years_2",
      required: true
    },
    {
      label: "Previous Address (2)",
      streetField: "Street_3",
      cityStateZipField: "CityStateZip_3",
      yearsField: "Years_3",
      required: false
    }
  ];

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-4">Address History (Past 5 years required)</h3>
      
      <div className="space-y-6">
        {addressFields.map((addr, index) => (
          <div key={index} className="p-4 border border-gray-200 rounded-lg">
            <h4 className="font-medium text-gray-700 mb-3">{addr.label}</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                <input
                  type="text"
                  value={formData[addr.streetField]}
                  onChange={(e) => onInputChange(addr.streetField, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required={addr.required}
                  placeholder="123 Main St, Apt 4B"
                />
              </div>
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1"># Years</label>
                <input
                  type="text"
                  value={formData[addr.yearsField]}
                  onChange={(e) => handleYearsChange(addr.yearsField, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required={addr.required}
                  placeholder="2"
                />
              </div>
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">City, State, ZIP</label>
                <input
                  type="text"
                  value={formData[addr.cityStateZipField]}
                  onChange={(e) => onInputChange(addr.cityStateZipField, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required={addr.required}
                  placeholder="Houston, TX 77001"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-700">
          <strong>Note:</strong> Please provide addresses for the past 5 years. If you lived at your current address for less than 5 years, include previous addresses.
        </p>
      </div>
    </div>
  );
};

export default AddressHistorySection;