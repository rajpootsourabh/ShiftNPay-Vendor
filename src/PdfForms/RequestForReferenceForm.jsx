// components/forms/RequestForReferenceForm.jsx
import React, { useState, useRef, useEffect } from 'react';
import { PDFDocument } from 'pdf-lib';
import axios from 'axios';
import StatusModal from './StatusModal';
import RequestForReferenceSection from './sections/RequestForReference/RequestForReferenceSection';
import SignatureCanvas from 'react-signature-canvas';

const RequestForReferenceForm = ({ document, token, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        // Basic Information
        "Please reply by": "",
        "Company Name 1": "",
        "Phone Number": "",
        "Employee Name": "",
        "Date of Birth": "",
        "I": "",
        "Date": "",
        "Address 1": "", // Added Address field
        
        // Employment Verification
        "From": "",
        "To": "",
        "Reason for Leaving": "",
        "Salary": "",
        "Notice Yes": false,
        "Notice No": false,
        
        // Reference Verification
        "Additional InformationRow1": "",
        "Name": "",
        "Date_2": "",
        "Title": "",
        "Mastercare Representative": "",
        "Date_3": "",
        "Signature202_es_:signer:signature": "",
        "Mastercare Office Address": "",
        
        // Checkbox fields
        "Knowledgeable Yes": false,
        "Knowledgeable No": false,
        "Dependable Yes": false,
        "Dependable No": false,
        "Rehire Yes": false,
        "Rehire No": false,
        "Recommend Yes": false,
        "Recommend No": false
    });

    const [generatingPreview, setGeneratingPreview] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [previewUrl, setPreviewUrl] = useState('');
    const [filledPdfBytes, setFilledPdfBytes] = useState(null);
    const [signatureDataUrl, setSignatureDataUrl] = useState('');
    const sigCanvasRef = useRef();

    // Status modal state
    const [statusModal, setStatusModal] = useState({
        isOpen: false,
        type: 'success',
        title: '',
        message: ''
    });

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

    const handleCheckboxChange = (fieldName, checked) => {
        console.log(`🔘 Checkbox changed: ${fieldName} = ${checked}`);
        setFormData(prev => ({
            ...prev,
            [fieldName]: checked
        }));
    };

    // Signature handling functions - Drawn signature only
    const handleSignatureEnd = () => {
        if (sigCanvasRef.current && !sigCanvasRef.current.isEmpty()) {
            const signatureDataURL = sigCanvasRef.current.toDataURL();
            setSignatureDataUrl(signatureDataURL);
            // Don't set text in formData - we'll embed the image directly
        }
    };

    const clearSignature = () => {
        if (sigCanvasRef.current) {
            sigCanvasRef.current.clear();
            setSignatureDataUrl('');
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

    // PDF filling logic with signature embedding
    const fillPdf = async (formData, pdfUrl) => {
        try {
            const pdfResponse = await fetch(pdfUrl);
            const pdfBuffer = await pdfResponse.arrayBuffer();
            const pdfDoc = await PDFDocument.load(pdfBuffer);
            const form = pdfDoc.getForm();

            // Fill all text fields (EXCEPT signature field)
            const textFields = [
                "Please reply by", "Company Name 1", "Phone Number", "Employee Name", 
                "Date of Birth", "I", "Date", "From", "To", "Reason for Leaving", 
                "Salary", "Additional InformationRow1", "Name", "Date_2", "Title", 
                "Mastercare Representative", "Date_3", "Mastercare Office Address", "Address 1"
            ];

            console.log('🔄 Filling text fields...');
            textFields.forEach(fieldName => {
                try {
                    const field = form.getTextField(fieldName);
                    if (field) {
                        field.setText(formData[fieldName] || "");
                        console.log(`✅ Set text field: ${fieldName} = "${formData[fieldName]}"`);
                    } else {
                        console.log(`❌ Text field not found: ${fieldName}`);
                    }
                } catch (error) {
                    console.log(`❌ Error setting text field ${fieldName}:`, error.message);
                }
            });

            // Fill checkbox fields
            const checkboxFields = [
                "Notice Yes", "Notice No", "Knowledgeable Yes", "Knowledgeable No",
                "Dependable Yes", "Dependable No", "Rehire Yes", "Rehire No",
                "Recommend Yes", "Recommend No"
            ];

            console.log('🔄 Filling checkbox fields...');
            checkboxFields.forEach(fieldName => {
                try {
                    const field = form.getCheckBox(fieldName);
                    if (field) {
                        if (formData[fieldName] === true) {
                            field.check();
                            console.log(`✅ Checked: ${fieldName}`);
                        } else {
                            field.uncheck();
                            console.log(`✅ Unchecked: ${fieldName}`);
                        }
                    } else {
                        console.log(`❌ Checkbox field not found: ${fieldName}`);
                    }
                } catch (error) {
                    console.log(`❌ Error setting checkbox ${fieldName}:`, error.message);
                }
            });

            // Handle signature image embedding (DRAWN SIGNATURE ONLY)
            if (signatureDataUrl) {
                try {
                    const signatureImageBytes = await dataURLToImageBytes(signatureDataUrl);
                    if (signatureImageBytes) {
                        const signatureImage = await pdfDoc.embedPng(signatureImageBytes);
                        const pages = pdfDoc.getPages();

                        // Try to find signature field position
                        try {
                            const signatureField = form.getTextField("Signature202_es_:signer:signature");
                            if (signatureField) {
                                const widgets = signatureField.acroField.getWidgets();
                                if (widgets && widgets.length > 0) {
                                    const widget = widgets[0];
                                    const rect = widget.getRectangle();
                                    
                                    // Find which page this widget is on
                                    const pageRef = widget.P();
                                    let pageIndex = 0;
                                    for (let i = 0; i < pages.length; i++) {
                                        if (pages[i].ref === pageRef) {
                                            pageIndex = i;
                                            break;
                                        }
                                    }
                                    
                                    // Draw the signature on the correct page
                                    if (pages[pageIndex]) {
                                        pages[pageIndex].drawImage(signatureImage, {
                                            x: rect.x || rect.left || 100,
                                            y: rect.y || rect.bottom || 100,
                                            width: rect.width || (rect.right - rect.left) || 200,
                                            height: rect.height || (rect.top - rect.bottom) || 50,
                                        });
                                    }
                                    
                                    // Clear the signature text field so it doesn't show text
                                    signatureField.setText("");
                                }
                            } else {
                                console.warn("Signature text field not found in PDF");
                            }
                        } catch (err) {
                            console.warn("Could not find exact signature field position, using default:", err);
                            // Fallback to default position on first page
                            if (pages[0]) {
                                pages[0].drawImage(signatureImage, { 
                                    x: 100, 
                                    y: 100, 
                                    width: 200, 
                                    height: 50 
                                });
                            }
                        }
                    }
                } catch (error) {
                    console.error("Error embedding drawn signature:", error);
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
            console.error('Error filling Request for Reference Form:', error);
            throw error;
        }
    };

    const handlePreview = async () => {
        console.log('📊 Current formData:', formData);
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
                'Your Request for Reference form has been submitted successfully.'
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

    // cleanup on unmount
    useEffect(() => {
        return () => {
            if (previewUrl) {
                try { URL.revokeObjectURL(previewUrl); } catch (e) { /* ignore */ }
            }
            if (sigCanvasRef.current) {
                try { sigCanvasRef.current.clear(); } catch (e) { /* ignore */ }
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Render signature section
    const renderSignatureSection = () => {
        return (
            <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">Signature & Date</h3>
                
                <div className="flex justify-between items-end mb-4">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Applicant Signature</label>
                        
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-600">Draw your signature below:</span>
                            <button
                                type="button"
                                onClick={clearSignature}
                                className="text-sm text-red-600 hover:text-red-800"
                            >
                                Clear Signature
                            </button>
                        </div>
                        
                        <div className="border border-gray-300 rounded-md overflow-hidden bg-white">
                            <SignatureCanvas
                                ref={sigCanvasRef}
                                canvasProps={{
                                    className: "w-full h-32 bg-white",
                                    style: { cursor: 'crosshair' }
                                }}
                                onEnd={handleSignatureEnd}
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
                    
                    <div className="ml-6">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                        <input
                            type="date"
                            value={formData["Date"]}
                            onChange={(e) => handleInputChange("Date", e.target.value)}
                            className="w-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
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
            </div>
        );
    };

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg max-w-6xl w-full max-h-[95vh] overflow-hidden">
                    <div className="flex justify-between items-center p-6 border-b">
                        <h2 className="text-xl font-semibold">Request for Reference Form</h2>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">✕</button>
                    </div>

                    <div className="p-6 overflow-y-auto max-h-[85vh]">
                        {/* Main Section */}
                        <RequestForReferenceSection
                            formData={formData}
                            onInputChange={handleInputChange}
                            onCheckboxChange={handleCheckboxChange}
                        />

                        {/* Signature Section */}
                        {renderSignatureSection()}

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

export default RequestForReferenceForm;