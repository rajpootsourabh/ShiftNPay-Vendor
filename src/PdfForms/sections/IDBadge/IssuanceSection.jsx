import React from 'react';
import SignatureCanvas from 'react-signature-canvas';

const IssuanceSection = ({
    formData,
    onInputChange,
    employeeSignatureUrl,
    managerSignatureUrl,
    onEmployeeSignatureEnd,
    onManagerSignatureEnd,
    onClearEmployeeSignature,
    onClearManagerSignature,
    employeeSigCanvasRef,
    managerSigCanvasRef,
    activeSignature,
    setActiveSignature
}) => {
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
    // Build the display text with the actual name or placeholder
    const getAgreementText = () => {
        const name = formData["EmployeeNameBlank"] || "[Employee Name]";
        return (
            <div className="text-sm text-gray-700 space-y-3">
                <p>
                    I, <span className="font-semibold text-blue-600">{name}</span>, agree to accept this I.D. badge which is provided to me by Mastercare.
                    I agree to maintain my I.D. badge in a well-kept condition.
                </p>
                <p>
                    I also agree, that in the event that I leave my employment with Mastercare within 30 days,
                    I will return my I.D. badge within one (1) week after my last day of employment.
                </p>
                <p>
                    In the event I do not return my I.D. badge, I understand that the cost of the I.D. badge is $5.00,
                    which if I have not returned, will be deducted from my final paycheck.
                </p>
            </div>
        );
    };


    return (
        <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">ID Badge Issuance</h3>

            {/* Agreement Text */}
            {/* Agreement Text */}
            <div className="mb-6 p-4 border border-gray-300 rounded bg-gray-50">
                <h4 className="text-md font-semibold text-gray-800 mb-3">Agreement Terms:</h4>
                {/* Display Agreement with Name */}
                {getAgreementText()}
                {/* Name Input for Agreement */}
                <div className="mb-2 mt-4 p-3 border border-blue-200 rounded bg-blue-50">
                    <label className="block text-sm font-medium text-blue-800 mb-2">
                        Your Name for Agreement <span className="text-red-500"></span>
                    </label>
                    <div className="flex items-center">
                        <input
                            type="text"
                            value={formData["EmployeeNameBlank"]}
                            onChange={(e) => onInputChange("EmployeeNameBlank", e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter your name"
                            required
                        />
                    </div>
                    <p className="mt-2 text-xs text-blue-600">
                        Enter your name as it should appear in the agreement statement above.
                    </p>
                </div>
            </div>

            {/* ID Badge Issuance Table */}
            <div className="mb-6 p-4 border border-gray-300 rounded">
                <h4 className="text-md font-semibold text-gray-800 mb-4">ID Badge Issuance Record</h4>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Issued</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity Issued</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            <tr>
                                <td className="px-4 py-3 text-sm text-gray-900">I.D. Badge</td>
                                <td className="px-4 py-3">
                                    <input
                                        type="date"
                                        value={formatDateForInput(formData["Date IssuedID Badge"])}
                                        onChange={(e) => onInputChange("Date IssuedID Badge", e.target.value)}
                                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                    />
                                </td>
                                <td className="px-4 py-3">
                                    <input
                                        type="text"
                                        value={formData["Quantity IssuedID Badge"]}
                                        onChange={(e) => onInputChange("Quantity IssuedID Badge", e.target.value)}
                                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                        placeholder="1"
                                    />
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900">$5.00</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Two-column layout for Employee and Manager */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Employee Section */}
                <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
                    <h4 className="text-md font-semibold text-blue-800 mb-4">Employee Section</h4>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Employee Name <span className="text-red-500"></span>
                            </label>
                            <input
                                type="text"
                                value={formData["Employee Name"]}
                                onChange={(e) => onInputChange("Employee Name", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter employee name"
                                // required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Date <span className="text-red-500"></span>
                            </label>
                            <input
                                type="date"
                                value={formatDateForInput(formData["Date"])}
                                onChange={(e) => onInputChange("Date", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                // required
                            />
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Employee Signature <span className="text-red-500"></span>
                                </label>
                                <button
                                    type="button"
                                    onClick={onClearEmployeeSignature}
                                    className="text-sm text-red-600 hover:text-red-800"
                                >
                                    Clear Signature
                                </button>
                            </div>
                            <div
                                className={`border rounded-md overflow-hidden bg-white cursor-pointer ${activeSignature === 'employee' ? 'ring-2 ring-blue-500' : ''}`}
                                onClick={() => setActiveSignature('employee')}
                            >
                                <SignatureCanvas
                                    ref={employeeSigCanvasRef}
                                    canvasProps={{
                                        className: "w-full h-32 bg-white",
                                        style: { cursor: 'crosshair' }
                                    }}
                                    onEnd={onEmployeeSignatureEnd}
                                />
                            </div>
                            {employeeSignatureUrl && (
                                <div className="mt-2">
                                    <p className="text-xs text-green-600">
                                        ✓ Signature captured. Click canvas to edit.
                                    </p>
                                </div>
                            )}
                        </div>

                        {employeeSignatureUrl && (
                            <div className="p-3 border border-gray-200 rounded bg-white">
                                <p className="text-sm font-medium text-gray-700 mb-2">Signature Preview:</p>
                                <div className="border border-gray-300 rounded p-2 bg-white">
                                    <img
                                        src={employeeSignatureUrl}
                                        alt="Employee signature preview"
                                        className="h-12 max-w-full object-contain"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Manager Section */}
                <div className="p-4 border border-green-200 rounded-lg bg-green-50">
                    <h4 className="text-md font-semibold text-green-800 mb-4">Manager Section</h4>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Manager Name
                            </label>
                            <input
                                type="text"
                                value={formData["Manager Name"]}
                                onChange={(e) => onInputChange("Manager Name", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                placeholder="Enter manager name"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Date
                            </label>
                            <input
                                type="date"
                                value={formatDateForInput(formData["Date_2"])}
                                onChange={(e) => onInputChange("Date_2", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Manager Signature
                                </label>
                                <button
                                    type="button"
                                    onClick={onClearManagerSignature}
                                    className="text-sm text-red-600 hover:text-red-800"
                                >
                                    Clear Signature
                                </button>
                            </div>
                            <div
                                className={`border rounded-md overflow-hidden bg-white cursor-pointer ${activeSignature === 'manager' ? 'ring-2 ring-green-500' : ''}`}
                                onClick={() => setActiveSignature('manager')}
                            >
                                <SignatureCanvas
                                    ref={managerSigCanvasRef}
                                    canvasProps={{
                                        className: "w-full h-32 bg-white",
                                        style: { cursor: 'crosshair' }
                                    }}
                                    onEnd={onManagerSignatureEnd}
                                />
                            </div>
                            {managerSignatureUrl && (
                                <div className="mt-2">
                                    <p className="text-xs text-green-600">
                                        ✓ Signature captured. Click canvas to edit.
                                    </p>
                                </div>
                            )}
                        </div>

                        {managerSignatureUrl && (
                            <div className="p-3 border border-gray-200 rounded bg-white">
                                <p className="text-sm font-medium text-gray-700 mb-2">Signature Preview:</p>
                                <div className="border border-gray-300 rounded p-2 bg-white">
                                    <img
                                        src={managerSignatureUrl}
                                        alt="Manager signature preview"
                                        className="h-12 max-w-full object-contain"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IssuanceSection;