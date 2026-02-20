// components/forms/sections/OrientationAcknowledgements/AcknowledgementSection.jsx
import React from 'react';

const AcknowledgementSection = ({ formData, onInputChange }) => {
  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-4">Orientation Acknowledgements</h3>
      
      {/* Acknowledgment Text */}
      <div className="mb-6 p-4 border border-gray-300 rounded bg-gray-50 max-h-80 overflow-y-auto">
        <div className="text-sm text-gray-700 space-y-3">
          <p>
            I acknowledge my obligation to fulfill the duties and responsibilities as set forth by the Employee Handbook and through our Orientation. I agree to comply with the terms as it relates to my employment with Mastercare. I further understand that violations of the information that is provided to me in the Employee Handbook will be grounds for disciplinary action, and may include termination of my employment.
          </p>
          <p>
            I have reviewed the following information in my Orientation and have been given the opportunity to ask question regarding its content. I understand that at any time should I have questions regarding any policies and how they may relate to my job or to my employment I should contact the Human Resources for clarification.
          </p>
        </div>
      </div>

      {/* Agreement Checkbox */}
      <div className="mb-6 p-4 border border-gray-200 rounded-lg">
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="orientation-acknowledge"
              type="checkbox"
              checked={formData["orientation_acknowledged"] || false}
              onChange={(e) => onInputChange("orientation_acknowledged", e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              required
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="orientation-acknowledge" className="font-medium text-gray-700">
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