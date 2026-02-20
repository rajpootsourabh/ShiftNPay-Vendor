import React, { useState, useRef, useEffect } from 'react';
import { PDFDocument } from 'pdf-lib';
import axios from 'axios';
import StatusModal from './StatusModal';
import IssuanceSection from './sections/IDBadge/IssuanceSection';
import ReturnsSection from './sections/IDBadge/ReturnsSection';

const IDBadgeAgreementForm = ({ document, token, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        // Agreement Text with blank for name
        "by Mastercare I agree to maintain my ID badge in a wellkept condition I also agree that in the event":
            "I, [Employee Name], agree to accept this I.D. badge which is provided to me by Mastercare. I agree to maintain my I.D. badge in a well-kept condition. I also agree, that in the event that I leave my employment with Mastercare within 30 days, I will return my I.D. badge within one (1) week after my last day of employment. In the event I do not return my I.D. badge, I understand that the cost of the I.D. badge is $5.00, which if I have not returned, will be deducted from my final paycheck.",

        // Employee Name for the blank in the agreement
        "EmployeeNameBlank": "",

        // Rest of the fields remain the same...
        "Date IssuedID Badge": "",
        "Quantity IssuedID Badge": "1",
        "Employee Name": "",
        "Date": "",
        "Manager Name": "",
        "Date_2": "",
        "Date ReturnedRow1": "",
        "Items ReturnedRow1": "",
        "Items Not ReturnedRow1": "",
        "fill_12": "",
        "Date_3": "",
        "Signature136_es_:signer:signature": "",
        "Signature137_es_:signer:signature": "",
        "Signature138_es_:signer:signature": ""
    });

    const [generatingPreview, setGeneratingPreview] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [previewUrl, setPreviewUrl] = useState('');
    const [filledPdfBytes, setFilledPdfBytes] = useState(null);
    const [employeeSignatureUrl, setEmployeeSignatureUrl] = useState('');
    const [managerSignatureUrl, setManagerSignatureUrl] = useState('');
    const [returnManagerSignatureUrl, setReturnManagerSignatureUrl] = useState('');
    const [activeSection, setActiveSection] = useState('issuance');
    const [activeSignature, setActiveSignature] = useState('employee'); // 'employee', 'manager', 'returnManager'
    const employeeSigCanvasRef = useRef();
    const managerSigCanvasRef = useRef();
    const returnManagerSigCanvasRef = useRef();

    // Status modal state
    const [statusModal, setStatusModal] = useState({
        isOpen: false,
        type: 'success',
        title: '',
        message: ''
    });

    // Navigation sections
    const sections = [
        { id: 'issuance', name: 'ID Badge Issuance' },
        { id: 'returns', name: 'ID Badge Returns' }
    ];

    // Show status modal
    const showStatusModal = (type, title, message) => {
        setStatusModal({
            isOpen: true,
            type,
            title,
            message
        });
    };

    // Close status modal
    const closeStatusModal = () => {
        setStatusModal(prev => ({ ...prev, isOpen: false }));
    };

    // Handler functions
    const handleInputChange = (fieldName, value) => {
        setFormData(prev => ({
            ...prev,
            [fieldName]: value
        }));
    };

    // Signature handling
    const handleSignatureEnd = (type) => {
        let canvasRef, signatureField, signatureUrlSetter;

        switch (type) {
            case 'employee':
                canvasRef = employeeSigCanvasRef;
                signatureField = "Signature136_es_:signer:signature";
                signatureUrlSetter = setEmployeeSignatureUrl;
                break;
            case 'manager':
                canvasRef = managerSigCanvasRef;
                signatureField = "Signature137_es_:signer:signature";
                signatureUrlSetter = setManagerSignatureUrl;
                break;
            case 'returnManager':
                canvasRef = returnManagerSigCanvasRef;
                signatureField = "Signature138_es_:signer:signature";
                signatureUrlSetter = setReturnManagerSignatureUrl;
                break;
            default:
                return;
        }

        if (canvasRef.current && !canvasRef.current.isEmpty()) {
            const signatureDataURL = canvasRef.current.toDataURL();
            signatureUrlSetter(signatureDataURL);
            handleInputChange(signatureField, "");
        }
    };

    const clearSignature = (type) => {
        let canvasRef, signatureField, signatureUrlSetter;

        switch (type) {
            case 'employee':
                canvasRef = employeeSigCanvasRef;
                signatureField = "Signature136_es_:signer:signature";
                signatureUrlSetter = setEmployeeSignatureUrl;
                break;
            case 'manager':
                canvasRef = managerSigCanvasRef;
                signatureField = "Signature137_es_:signer:signature";
                signatureUrlSetter = setManagerSignatureUrl;
                break;
            case 'returnManager':
                canvasRef = returnManagerSigCanvasRef;
                signatureField = "Signature138_es_:signer:signature";
                signatureUrlSetter = setReturnManagerSignatureUrl;
                break;
            default:
                return;
        }

        if (canvasRef.current) {
            canvasRef.current.clear();
            signatureUrlSetter('');
            handleInputChange(signatureField, "");
        }
    };

    // Convert data URL to image bytes for PDF embedding
    const dataURLToImageBytes = async (dataURL) => {
        if (!dataURL) return null;
        try {
            const response = await fetch(dataURL);
            const blob = await response.blob();
            return new Uint8Array(await blob.arrayBuffer());
        } catch (error) {
            console.error("Error converting signature to image:", error);
            return null;
        }
    };

    // PDF filling logic
    const fillPdf = async (formData, pdfUrl) => {
        try {
            const pdfResponse = await fetch(pdfUrl);
            const pdfBuffer = await pdfResponse.arrayBuffer();
            const pdfDoc = await PDFDocument.load(pdfBuffer);
            const form = pdfDoc.getForm();

            console.log('🔄 Filling ID Badge Agreement form fields...');

            // Build the agreement text with the actual employee name
            const agreementText = `${formData["EmployeeNameBlank"] || "[Employee Name]"}`;

            // Fill text fields
            console.log('🔄 Filling text fields...');
            const textFields = [
                { field: "by Mastercare I agree to maintain my ID badge in a wellkept condition I also agree that in the event", value: agreementText },
                { field: "Date IssuedID Badge", value: formData["Date IssuedID Badge"] },
                { field: "Quantity IssuedID Badge", value: formData["Quantity IssuedID Badge"] },
                { field: "Employee Name", value: formData["Employee Name"] },
                { field: "Date", value: formData["Date"] },
                { field: "Manager Name", value: formData["Manager Name"] },
                { field: "Date_2", value: formData["Date_2"] },
                { field: "Date ReturnedRow1", value: formData["Date ReturnedRow1"] },
                { field: "Items ReturnedRow1", value: formData["Items ReturnedRow1"] },
                { field: "Items Not ReturnedRow1", value: formData["Items Not ReturnedRow1"] },
                { field: "fill_12", value: formData["fill_12"] },
                { field: "Date_3", value: formData["Date_3"] }
            ];

            textFields.forEach(({ field, value }) => {
                try {
                    const fieldObj = form.getTextField(field);
                    if (fieldObj) {
                        fieldObj.setText(value || "");
                        console.log(`✅ Set text field: ${field} = "${value}"`);
                    } else {
                        console.log(`❌ Text field not found: ${field}`);
                    }
                } catch (error) {
                    console.log(`❌ Error setting text field ${field}:`, error.message);
                }
            });

            // Handle signatures
            const signatureFields = [
                { url: employeeSignatureUrl, field: "Signature136_es_:signer:signature", type: "employee" },
                { url: managerSignatureUrl, field: "Signature137_es_:signer:signature", type: "manager" },
                { url: returnManagerSignatureUrl, field: "Signature138_es_:signer:signature", type: "returnManager" }
            ];

            for (const signature of signatureFields) {
                if (signature.url) {
                    const signatureImageBytes = await dataURLToImageBytes(signature.url);
                    if (signatureImageBytes) {
                        const signatureImage = await pdfDoc.embedPng(signatureImageBytes);
                        const pages = pdfDoc.getPages();

                        try {
                            const sigField = form.getTextField(signature.field);
                            if (sigField) {
                                const widgets = sigField.acroField.getWidgets();
                                if (widgets && widgets.length > 0) {
                                    const rect = widgets[0].getRectangle();
                                    const pageRef = widgets[0].P();

                                    let pageIndex = 0;
                                    for (let i = 0; i < pages.length; i++) {
                                        if (pages[i].ref === pageRef) {
                                            pageIndex = i;
                                            break;
                                        }
                                    }

                                    pages[pageIndex].drawImage(signatureImage, {
                                        x: rect.x || rect.left || 100,
                                        y: rect.y || rect.bottom || 100,
                                        width: rect.width || (rect.right - rect.left) || 150,
                                        height: rect.height || (rect.top - rect.bottom) || 50,
                                    });
                                }
                            }
                        } catch (error) {
                            console.warn(`Could not find ${signature.type} signature field position:`, error);
                        }
                    }
                }

                // Also set signature text
                try {
                    const field = form.getTextField(signature.field);
                    if (field) {
                        field.setText(formData[signature.field] || "");
                    }
                } catch (error) {
                    console.log(`Error setting signature text field ${signature.field}:`, error.message);
                }
            }

            // Lock all fields
            form.getFields().forEach((f) => {
                try {
                    f.enableReadOnly();
                } catch (err) {
                    // ignore
                }
            });

            form.flatten();
            const filledPdfBytes = await pdfDoc.save();
            return filledPdfBytes;

        } catch (error) {
            console.error('Error filling ID Badge Agreement form:', error);
            throw error;
        }
    };

    const handlePreview = async () => {
        console.log('📊 Current formData:', formData);

        // // Validation for issuance section
        // if (activeSection === 'issuance') {
        //     if (!formData["Employee Name"]) {
        //         showStatusModal(
        //             'error',
        //             'Missing Information',
        //             'Please enter employee name.'
        //         );
        //         return;
        //     }

        //     if (!formData["Date"]) {
        //         showStatusModal(
        //             'error',
        //             'Missing Information',
        //             'Please enter issuance date.'
        //         );
        //         return;
        //     }

        //     if (!employeeSignatureUrl) {
        //         showStatusModal(
        //             'error',
        //             'Signature Required',
        //             'Please provide employee signature.'
        //         );
        //         return;
        //     }
        // }

        // Validation for returns section (optional)
        // if (activeSection === 'returns') {
        //     // Only validate if any return information is entered
        //     const hasReturnInfo = formData["Date ReturnedRow1"] ||
        //         formData["Items ReturnedRow1"] ||
        //         formData["Items Not ReturnedRow1"] ||
        //         formData["fill_12"];

        //     if (hasReturnInfo) {
        //         if (!formData["Date ReturnedRow1"]) {
        //             showStatusModal(
        //                 'error',
        //                 'Missing Information',
        //                 'Please enter return date if filling return section.'
        //             );
        //             return;
        //         }

        //         if (!returnManagerSignatureUrl) {
        //             showStatusModal(
        //                 'error',
        //                 'Signature Required',
        //                 'Please provide manager signature for returns section.'
        //             );
        //             return;
        //         }
        //     }
        // }

        try {
            setGeneratingPreview(true);

            if (previewUrl) {
                try { URL.revokeObjectURL(previewUrl); } catch (e) { /* ignore */ }
                setPreviewUrl('');
            }

            const bytes = await fillPdf(formData, document.url);
            setFilledPdfBytes(bytes);

            const blob = new Blob([bytes], { type: "application/pdf" });
            const blobUrl = URL.createObjectURL(blob);
            setPreviewUrl(blobUrl);
        } catch (error) {
            showStatusModal(
                'error',
                'Preview Generation Failed',
                'Failed to generate preview. Please try again.'
            );
        } finally {
            setGeneratingPreview(false);
        }
    };

    const handleSubmit = async () => {
        try {
            setSubmitting(true);

            let bytes = filledPdfBytes;
            if (!bytes) {
                bytes = await fillPdf(formData, document.url);
            }

            const filledPdfBlob = new Blob([bytes], { type: "application/pdf" });

            const submitFormData = new FormData();
            submitFormData.append('filled_document', filledPdfBlob, `${document.name}_filled.pdf`);

            const uploadUrl = `${process.env.REACT_APP_BASH_URL}/candidate/document/${token}/submit`;
            const uploadResponse = await axios.post(uploadUrl, submitFormData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            showStatusModal(
                'success',
                'Document Submitted Successfully!',
                'Your ID Badge Agreement has been submitted successfully.'
            );

            if (previewUrl) {
                try { URL.revokeObjectURL(previewUrl); } catch (e) { /* ignore */ }
            }
            setPreviewUrl('');
            setFilledPdfBytes(null);

            setTimeout(() => {
                try { onSuccess && onSuccess(); } catch (e) { /* ignore */ }
                try { onClose && onClose(); } catch (e) { /* ignore */ }
            }, 2000);

        } catch (error) {
            console.error('Error submitting PDF:', error);
            const errorMessage = error.response?.data?.message || 'Failed to submit document. Please try again.';
            showStatusModal('error', 'Submission Failed', errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    // Render current section
    const renderCurrentSection = () => {
        switch (activeSection) {
            case 'issuance':
                return (
                    <IssuanceSection
                        formData={formData}
                        onInputChange={handleInputChange}
                        employeeSignatureUrl={employeeSignatureUrl}
                        managerSignatureUrl={managerSignatureUrl}
                        onEmployeeSignatureEnd={() => handleSignatureEnd('employee')}
                        onManagerSignatureEnd={() => handleSignatureEnd('manager')}
                        onClearEmployeeSignature={() => clearSignature('employee')}
                        onClearManagerSignature={() => clearSignature('manager')}
                        employeeSigCanvasRef={employeeSigCanvasRef}
                        managerSigCanvasRef={managerSigCanvasRef}
                        activeSignature={activeSignature}
                        setActiveSignature={setActiveSignature}
                    />
                );
            case 'returns':
                return (
                    <ReturnsSection
                        formData={formData}
                        onInputChange={handleInputChange}
                        returnManagerSignatureUrl={returnManagerSignatureUrl}
                        onReturnManagerSignatureEnd={() => handleSignatureEnd('returnManager')}
                        onClearReturnManagerSignature={() => clearSignature('returnManager')}
                        returnManagerSigCanvasRef={returnManagerSigCanvasRef}
                        activeSignature={activeSignature}
                        setActiveSignature={setActiveSignature}
                    />
                );
            default:
                return (
                    <IssuanceSection
                        formData={formData}
                        onInputChange={handleInputChange}
                        employeeSignatureUrl={employeeSignatureUrl}
                        managerSignatureUrl={managerSignatureUrl}
                        onEmployeeSignatureEnd={() => handleSignatureEnd('employee')}
                        onManagerSignatureEnd={() => handleSignatureEnd('manager')}
                        onClearEmployeeSignature={() => clearSignature('employee')}
                        onClearManagerSignature={() => clearSignature('manager')}
                        employeeSigCanvasRef={employeeSigCanvasRef}
                        managerSigCanvasRef={managerSigCanvasRef}
                        activeSignature={activeSignature}
                        setActiveSignature={setActiveSignature}
                    />
                );
        }
    };

    // cleanup on unmount
    useEffect(() => {
        return () => {
            if (previewUrl) {
                try { URL.revokeObjectURL(previewUrl); } catch (e) { /* ignore */ }
            }
            if (employeeSigCanvasRef.current) {
                try { employeeSigCanvasRef.current.clear(); } catch (e) { /* ignore */ }
            }
            if (managerSigCanvasRef.current) {
                try { managerSigCanvasRef.current.clear(); } catch (e) { /* ignore */ }
            }
            if (returnManagerSigCanvasRef.current) {
                try { returnManagerSigCanvasRef.current.clear(); } catch (e) { /* ignore */ }
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg max-w-6xl w-full max-h-[95vh] overflow-hidden">
                    <div className="flex justify-between items-center p-6 border-b">
                        <h2 className="text-xl font-semibold">ID Badge Agreement</h2>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">✕</button>
                    </div>

                    <div className="p-6 overflow-y-auto max-h-[85vh]">
                        {/* Navigation */}
                        <div className="mb-6">
                            <div className="flex flex-wrap gap-2">
                                {sections.map((section) => (
                                    <button
                                        key={section.id}
                                        onClick={() => setActiveSection(section.id)}
                                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeSection === section.id
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                            }`}
                                    >
                                        {section.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Current Section */}
                        {renderCurrentSection()}

                        {/* Signature Status
                        <div className="mt-6 p-4 border border-gray-300 rounded bg-gray-50">
                            <h4 className="text-md font-semibold text-gray-800 mb-2">Signature Status:</h4>
                            <div className="flex flex-wrap gap-3">
                                <div className={`px-3 py-1 rounded-full text-sm ${employeeSignatureUrl ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {employeeSignatureUrl ? '✓ Employee Signed' : 'Employee Signature Required'}
                                </div>
                                <div className={`px-3 py-1 rounded-full text-sm ${managerSignatureUrl ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                    {managerSignatureUrl ? '✓ Manager Signed' : 'Manager Signature Pending'}
                                </div>
                                <div className={`px-3 py-1 rounded-full text-sm ${returnManagerSignatureUrl ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                                    {returnManagerSignatureUrl ? '✓ Return Manager Signed' : 'Return Manager Optional'}
                                </div>
                            </div>
                        </div> */}

                        {/* Action Buttons */}
                        <div className="flex gap-4 mb-6 mt-8">
                            <button
                                onClick={handlePreview}
                                disabled={generatingPreview}
                                className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors min-w-[160px]"
                            >
                                {generatingPreview ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Generating Preview...
                                    </>
                                ) : (
                                    'Generate Preview'
                                )}
                            </button>

                            {previewUrl && (
                                <button
                                    onClick={handleSubmit}
                                    disabled={submitting}
                                    className="flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors min-w-[160px]"
                                >
                                    {submitting ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Submitting...
                                        </>
                                    ) : (
                                        'Submit Document'
                                    )}
                                </button>
                            )}
                        </div>

                        {/* PDF Preview */}
                        {previewUrl && (
                            <div className="mt-6">
                                <h3 className="text-lg font-semibold mb-4">Preview Filled Document</h3>
                                <div className="border rounded-lg overflow-hidden">
                                    <iframe
                                        src={previewUrl}
                                        className="w-full h-96"
                                        title="Filled PDF Preview"
                                    />
                                    <div className="bg-gray-50 p-3 text-sm text-gray-600">
                                        <p>Review your document above. If everything looks correct, click "Submit Document".</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Status Modal */}
            <StatusModal
                isOpen={statusModal.isOpen}
                onClose={closeStatusModal}
                type={statusModal.type}
                title={statusModal.title}
                message={statusModal.message}
                duration={statusModal.type === 'success' ? 2000 : 3000}
            />
        </>
    );
};

export default IDBadgeAgreementForm;