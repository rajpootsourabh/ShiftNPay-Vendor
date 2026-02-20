// components/forms/sections/HandbookAcknowledgment/AcknowledgementSection.jsx
import React from 'react';

const AcknowledgementSection = ({ formData, onInputChange }) => {
  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-4">Handbook Acknowledgment</h3>
      
      {/* Acknowledgment Text */}
      <div className="mb-6 p-4 border border-gray-300 rounded bg-gray-50 max-h-80 overflow-y-auto">
        <div className="text-sm text-gray-700 space-y-3">
          <p>
            I acknowledge that I have received a copy of the Mastercare Homecare Employee Handbook. I
            have read and understood the policies in the Employee Handbook, and I understand that my
            failure to comply with any of the rules, policies, or procedures of Mastercare Homecare, Inc.
            may result in disciplinary action, up to and including dismissal. I further understand and
            acknowledge that:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              It is my responsibility to adhere to the policies contained in the Employee Handbook.
            </li>
            <li>
              The Employee Handbook may be changed or superseded by Mastercare Homecare at any
              time, with or without prior notice.
            </li>
            <li>
              I am an "at-will" employee and the provisions contained in the Employee Handbook do not
              constitute an implied or express contract of employment and do not alter the at-will
              employment relationship in any way.
            </li>
          </ul>
          <p>
            I have reviewed the following information in the Employee Handbook and have been given the
            opportunity to ask question regarding its content. I understand that at any time should I have
            questions regarding any policies and how they may relate to my job or to my employment I
            should contact the manager for clarification.
          </p>
        </div>
      </div>

      {/* Agreement Checkbox */}
      <div className="mb-6 p-4 border border-gray-200 rounded-lg">
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="acknowledge"
              type="checkbox"
              checked={formData["acknowledged"] || false}
              onChange={(e) => onInputChange("acknowledged", e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              required
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="acknowledge" className="font-medium text-gray-700">
              I acknowledge and agree to all of the above statements
            </label>
            <p className="text-gray-500 mt-1">
              By checking this box, you confirm that you have read, understood, and agree to the terms outlined above.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AcknowledgementSection;