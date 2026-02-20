// components/forms/sections/BackgroundCheck/AuthorizationSection.jsx
import React, { useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';

const AuthorizationSection = ({ formData, onInputChange, signatureDataUrl, onSignatureEnd, onClearSignature, sigCanvasRef }) => {
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
      <h3 className="text-lg font-semibold mb-4">Authorization & Signature</h3>
      
      {/* Authorization Text */}
      <div className="mb-6 p-4 border border-gray-300 rounded bg-gray-50 max-h-60 overflow-y-auto">
        <div className="text-sm text-gray-700 space-y-3">
          <p>
            <strong>Authorization:</strong> I hereby authorize Mastercare Homecare, Inc. and its designated agents and representatives to conduct a comprehensive review of my background causing a consumer report and/or an investigative consumer report to be generated for employment and/or volunteer purpose. I understand that the scope of the consumer report/investigative consumer report may include but is not limited to the following areas:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Verification of social security number</li>
            <li>Current and previous residences</li>
            <li>Employment history</li>
            <li>Education background</li>
            <li>Character reference</li>
            <li>Drug testing</li>
            <li>Civil and criminal history records from any criminal justice agency in any and all federal, state, county jurisdictions</li>
            <li>Driving record</li>
            <li>Birth records</li>
            <li>Any other public records</li>
          </ul>
          <p>
            I further authorize any individual, company, firm, corporation, or public agency (including the Social Security Administration and law enforcement agencies) to divulge any and all information, verbal or written, pertaining to me, to Mastercare Homecare, Inc. or its agents. I further authorize the complete release of any record or data pertaining to me which the individual, company, firm, corporation, or public agency may have, to include information or data received from other sources.
          </p>
          <p>
            <strong>Release of Liability:</strong> I hereby release Mastercare Homecare, Inc. the Social Security Administration and its agents, officials, representative, or assigned agencies including officers, employees, or related personnel both individually and collectively, from any and all liability for damages of whatever kind, which may at any time result to me, my heirs, family or associates because of compliance with this authorization and request to release.
          </p>
          <p>
            <strong>Certification:</strong> The information provided in this application are true and factual to the best of my knowledge.
          </p>
        </div>
      </div>

      {/* Signature Options */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">Employee Signature</label>
        
        {/* Digital Signature Canvas */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Draw your signature below:</span>
            <button
              type="button"
              onClick={onClearSignature}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Clear Signature
            </button>
          </div>
          <div className="border border-gray-300 rounded-md overflow-hidden bg-white">
            <SignatureCanvas
              ref={sigCanvasRef}
              canvasProps={{
                className: "w-full h-40 bg-white",
                style: { cursor: 'crosshair' }
              }}
              onEnd={onSignatureEnd}
            />
          </div>
          {signatureDataUrl && (
            <div className="mt-2">
              <p className="text-xs text-green-600">
                ✓ Signature captured. You can re-draw if needed.
              </p>
            </div>
          )}
        </div>

        {/* Signature Preview */}
        {signatureDataUrl && (
          <div className="mb-4 p-3 border border-gray-200 rounded bg-white">
            <p className="text-sm font-medium text-gray-700 mb-2">Signature Preview:</p>
            <div className="border border-gray-300 rounded p-2 bg-white">
              <img 
                src={signatureDataUrl} 
                alt="Signature preview" 
                className="h-16 max-w-full object-contain"
              />
            </div>
          </div>
        )}

        {/* Print Name */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Print Name</label>
          <input
            type="text"
            value={formData["Print Name"]}
            onChange={(e) => onInputChange("Print Name", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Type your name as it should appear printed"
          />
        </div>

        {/* Date */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
          <input
            type="date"
            value={formatDateForInput(formData["Date"])}
            onChange={(e) => onInputChange("Date", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Footer Note */}
      <div className="mt-6 p-3 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          1070/MC-Rev.0423 ©Mastercare Homecare, Inc. All Rights Reserved
        </p>
      </div>
    </div>
  );
};

export default AuthorizationSection;