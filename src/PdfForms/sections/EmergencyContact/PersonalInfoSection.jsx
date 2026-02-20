import React from 'react';

const PersonalInfoSection = ({ formData, onInputChange }) => {
    const personalFields = [
        {
            id: "First Name",
            label: "First Name",
            type: "text",
            required: true,
            placeholder: "Enter your first name"
        },
        {
            id: "Middle Name",
            label: "Middle Name",
            type: "text",
            placeholder: "Enter your middle name"
        },
        {
            id: "Last Name",
            label: "Last Name",
            type: "text",
            required: true,
            placeholder: "Enter your last name"
        },
        {
            id: "Nickname",
            label: "Nickname",
            type: "text",
            placeholder: "Enter your preferred nickname"
        },
        {
            id: "Address",
            label: "Address",
            type: "text",
            required: true,
            placeholder: "Enter your full address"
        },
        {
            id: "Home Phone",
            label: "Home Phone",
            type: "tel",
            placeholder: "(123) 456-7890"
        },
        {
            id: "Cellular Phone",
            label: "Cellular Phone",
            type: "tel",
            required: true,
            placeholder: "(123) 456-7890"
        },
        {
            id: "Email Address",
            label: "Email Address",
            type: "email",
            required: true,
            placeholder: "your.email@example.com"
        },
        {
            id: "Drivers LicenseState ID Number",
            label: "Driver's License / State ID Number",
            type: "text",
            placeholder: "Enter your license/ID number"
        }
    ];

    return (
        <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Personal Information</h3>

            {/* Instructions */}
            <div className="mb-6 p-4 border border-gray-300 rounded bg-gray-50">
                <h4 className="text-md font-semibold text-gray-800 mb-2">Instructions:</h4>
                <p className="text-sm text-gray-700">
                    Please provide accurate personal information. This information will be used for emergency contact purposes and must be kept up to date.
                </p>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {personalFields.map((field) => (
                    <div key={field.id} className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {field.label}
                            {field.required && <span className="text-red-500 ml-1"></span>}
                        </label>
                        <input
                            type={field.type}
                            value={formData[field.id]}
                            onChange={(e) => onInputChange(field.id, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder={field.placeholder}
                            required={field.required}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PersonalInfoSection;