import React from 'react';
import SignatureCanvas from 'react-signature-canvas';

const EmployerVerification = ({
    formData,
    onInputChange,
    onCheckboxChange,
    signatureDataUrl,
    onSignatureEnd,
    onClearSignature,
    sigCanvasRef,
    formatDateForInput
}) => {
    return (
        <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Section 2: Employer Review and Verification</h3>

            <div className="mb-6 p-4 border border-gray-300 rounded bg-gray-50">
                <h4 className="text-md font-semibold text-gray-800 mb-2">Instructions:</h4>
                <p className="text-sm text-gray-700 mb-2">
                    Employers or their authorized representative must complete and sign Section 2 within three business days
                    after the employee's first day of employment.
                </p>
            </div>

            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">First Day of Employment (mm/dd/yyyy)</label>
                <input
                    type="date"
                    value={formatDateForInput(formData["FirstDayEmployed mmddyyyy"])}
                    onChange={(e) => onInputChange("FirstDayEmployed mmddyyyy", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            {/* List A Documents */}
            <div className="mb-6">
                <h4 className="text-md font-semibold text-gray-800 mb-3">List A: Documents that Establish Both Identity and Employment Authorization</h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Document Title 1</label>
                        <input
                            type="text"
                            value={formData["Document Title 1"]}
                            onChange={(e) => onInputChange("Document Title 1", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Issuing Authority</label>
                        <input
                            type="text"
                            value={formData["Issuing Authority 1"]}
                            onChange={(e) => onInputChange("Issuing Authority 1", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Document Number</label>
                        <input
                            type="text"
                            value={formData["Document Number 0 (if any)"]}
                            onChange={(e) => onInputChange("Document Number 0 (if any)", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Expiration Date (if any)</label>
                        <input
                            type="date"
                            value={formatDateForInput(formData["Expiration Date if any"])}
                            onChange={(e) => onInputChange("Expiration Date if any", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                <div className="mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Document Title 2</label>
                            <input
                                type="text"
                                value={formData["Document Title 2 If any"]}
                                onChange={(e) => onInputChange("Document Title 2 If any", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Issuing Authority</label>
                            <input
                                type="text"
                                value={formData["Issuing Authority_2"]}
                                onChange={(e) => onInputChange("Issuing Authority_2", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Document Number</label>
                            <input
                                type="text"
                                value={formData["Document Number If any_2"]}
                                onChange={(e) => onInputChange("Document Number If any_2", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Expiration Date (if any)</label>
                            <input
                                type="date"
                                value={formatDateForInput(formData["List A.  Document 2. Expiration Date (if any)"])}
                                onChange={(e) => onInputChange("List A.  Document 2. Expiration Date (if any)", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                </div>

                <div className="mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Document Title 3</label>
                            <input
                                type="text"
                                value={formData["List A.   Document Title 3.  If any"]}
                                onChange={(e) => onInputChange("List A.   Document Title 3.  If any", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Issuing Authority</label>
                            <input
                                type="text"
                                value={formData["List A. Document 3.  Enter Issuing Authority"]}
                                onChange={(e) => onInputChange("List A. Document 3.  Enter Issuing Authority", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Document Number</label>
                            <input
                                type="text"
                                value={formData["List A.  Document 3 Number.  If any"]}
                                onChange={(e) => onInputChange("List A.  Document 3 Number.  If any", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Expiration Date (if any)</label>
                            <input
                                type="date"
                                value={formatDateForInput(formData["Document Number if any_3"])}
                                onChange={(e) => onInputChange("Document Number if any_3", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* List B & C Documents */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* List B */}
                <div>
                    <h4 className="text-md font-semibold text-gray-800 mb-3">List B: Documents that Establish Identity</h4>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Document Title</label>
                            <input
                                type="text"
                                value={formData["List B Document 1 Title"]}
                                onChange={(e) => onInputChange("List B Document 1 Title", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Issuing Authority</label>
                            <input
                                type="text"
                                value={formData["List B Issuing Authority 1"]}
                                onChange={(e) => onInputChange("List B Issuing Authority 1", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Document Number</label>
                            <input
                                type="text"
                                value={formData["List B Document Number 1"]}
                                onChange={(e) => onInputChange("List B Document Number 1", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Expiration Date (if any)</label>
                            <input
                                type="date"
                                value={formatDateForInput(formData["List B Expiration Date 1"])}
                                onChange={(e) => onInputChange("List B Expiration Date 1", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                </div>

                {/* List C */}
                <div>
                    <h4 className="text-md font-semibold text-gray-800 mb-3">List C: Documents that Establish Employment Authorization</h4>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Document Title</label>
                            <input
                                type="text"
                                value={formData["List C Document Title 1"]}
                                onChange={(e) => onInputChange("List C Document Title 1", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Issuing Authority</label>
                            <input
                                type="text"
                                value={formData["List C Issuing Authority 1"]}
                                onChange={(e) => onInputChange("List C Issuing Authority 1", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Document Number</label>
                            <input
                                type="text"
                                value={formData["List C Document Number 1"]}
                                onChange={(e) => onInputChange("List C Document Number 1", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Expiration Date (if any)</label>
                            <input
                                type="date"
                                value={formatDateForInput(formData["List C Expiration Date 1"])}
                                onChange={(e) => onInputChange("List C Expiration Date 1", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Additional Document Row */}


            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Additional Information</label>
                <textarea
                    value={formData["Additional Information"]}
                    onChange={(e) => onInputChange("Additional Information", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    placeholder="Any additional notes or information about the documents"
                />
            </div>

            <div className="mb-6">
                <div className="flex items-start">
                    <input
                        type="checkbox"
                        id="alternative-procedure"
                        checked={formData["CB_Alt"]}
                        onChange={(e) => onCheckboxChange("CB_Alt", e.target.checked)}
                        className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="alternative-procedure" className="ml-3 block">
                        <span className="text-sm font-medium text-gray-700">
                            Check here if you used an alternative procedure authorized by DHS to examine documents.
                        </span>
                    </label>
                </div>
            </div>

            {/* Employer Information */}
            <div className="mt-6 border-t pt-6">
                <h4 className="text-md font-semibold text-gray-800 mb-4">Employer Certification</h4>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name, First Name and Title of Employer or Authorized Representative</label>
                    <input
                        type="text"
                        value={formData["Last Name First Name and Title of Employer or Authorized Representative"]}
                        onChange={(e) => onInputChange("Last Name First Name and Title of Employer or Authorized Representative", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Smith, Jane - HR Manager"
                    />
                </div>

                <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-gray-700">Signature of Employer or Authorized Representative</label>
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

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Employer's Business or Organization Name</label>
                    <input
                        type="text"
                        value={formData["Employers Business or Org Name"]}
                        onChange={(e) => onInputChange("Employers Business or Org Name", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Employer's Business or Organization Address</label>
                    <input
                        type="text"
                        value={formData["Employers Business or Org Address"]}
                        onChange={(e) => onInputChange("Employers Business or Org Address", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Street, City, State, ZIP"
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Today's Date (mm/dd/yyyy)</label>
                    <input
                        type="date"
                        value={formatDateForInput(formData["S2 Todays Date mmddyyyy"])}
                        onChange={(e) => onInputChange("S2 Todays Date mmddyyyy", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>
        </div>
    );
};

export default EmployerVerification;