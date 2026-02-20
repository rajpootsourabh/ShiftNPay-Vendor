import React from 'react';

const EmergencyContactsSection = ({ formData, onInputChange, contactNumber, title }) => {
    const fieldPrefix = contactNumber === 1 ? '' : `_${contactNumber}`;

    const contactFields = [
        {
            id: `Emergency Contact Name${fieldPrefix}`,
            label: "Full Name",
            type: "text",
            required: true,
            placeholder: "Enter full name"
        },
        {
            id: `Relationship${fieldPrefix}`,
            label: "Relationship",
            type: "text",
            required: true,
            placeholder: "e.g., Spouse, Parent, Sibling, Friend"
        },
        {
            id: contactNumber === 1 ? "Address_2" : contactNumber === 2 ? "Address_3" : "Address_4",
            label: "Address",
            type: "text",
            placeholder: "Enter contact's address"
        },
        {
            id: contactNumber === 1 ? "Phone Numbers" : contactNumber === 2 ? "Phone Numbers_2" : "Phone Numbers_3",
            label: "Phone Number(s)",
            type: "tel",
            required: true,
            placeholder: "(123) 456-7890"
        }
    ];

    const getTitle = () => {
        switch (contactNumber) {
            case 1: return "Primary Emergency Contact";
            case 2: return "Secondary Emergency Contact";
            case 3: return "Tertiary Emergency Contact";
            default: return "Emergency Contact";
        }
    };

    return (
        <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">{getTitle()}</h3>

            {/* Instructions */}
            <div className="mb-6 p-4 border border-gray-300 rounded bg-gray-50">
                <h4 className="text-md font-semibold text-gray-800 mb-2">Instructions:</h4>
                <p className="text-sm text-gray-700">
                    Please provide contact information for someone we can reach in case of an emergency. This should be someone who is typically available and can make decisions on your behalf if necessary.
                </p>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
                {contactFields.map((field) => (
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

export default EmergencyContactsSection;