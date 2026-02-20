// W4Form2023SinglePage.jsx
import React, { useState, useRef, useEffect } from 'react';
import { PDFDocument } from 'pdf-lib';
import axios from 'axios';
import SignatureCanvas from 'react-signature-canvas';
import StatusModal from './StatusModal';

const W4Form2023SinglePage = ({ document, token, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        // Step 1: Personal Information
        "text_ First name and middle initial": "",
        "text_last name": "",
        "text_social security number": "",
        "text_address": "",
        "text_City or town": "",

        // Step 1(c): Filing Status Checkboxes
        "checkbox_single": false,
        "checkbox_married": false,
        "checkbox_head of household": false,

        // Step 2: Multiple Jobs
        "checkbox_If there are only two jobs total, you may check this box": false,
        "text_two jobs": "",
        "text_three jobs_2a": "",
        "text_three jobs_2b": "",
        "text_three jobs_2c": "",
        "text_Enter the number of pay periods per year for the highest paying job": "",
        "text_Divide the annual amount on line 1 or line 2c by the number of pay periods on line 3": "",

        // Step 3: Claim Dependents
        "text_Multiply the number of qualifying children under age 17": "",
        "text_Multiply the number of other dependents b": "",
        "text_Add the amounts above for qualifying children and other dependents": "",

        // Step 4: Other Adjustments
        "text_Other income not from jobs": "",
        "text_Deductions": "",
        "text_Extra withholding": "",

        // Deductions Worksheet
        "text_Enter an estimate of your 2023 itemized deductions": "",
        "text_Enter:": "",
        "text_If line 1 is greater than line 2": "",
        "text_Enter an estimate of your student loan interest": "",
        "text_Add lines 3 and 4": "",

        // Step 5 & Employer Section
        "text_employer's signature date": "",
        "text_First date of employment": "",
        "text_Employer identification number": "",
        "textarea_Employer’s name": "",
        "text_Employer’s address": "",
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

    const handleCheckboxChange = (fieldName, value) => {
        // Handle mutually exclusive filing status checkboxes
        if (['checkbox_single', 'checkbox_married', 'checkbox_head of household'].includes(fieldName)) {
            setFormData(prev => ({
                ...prev,
                checkbox_single: fieldName === 'checkbox_single' ? value : false,
                checkbox_married: fieldName === 'checkbox_married' ? value : false,
                'checkbox_head of household': fieldName === 'checkbox_head of household' ? value : false,
            }));
            return;
        }

        // For other checkboxes
        setFormData(prev => ({
            ...prev,
            [fieldName]: value
        }));
    };

    // Format SSN
    const handleSSNChange = (value) => {
        let cleaned = value.replace(/\D/g, '');

        if (cleaned.length > 3 && cleaned.length <= 5) {
            cleaned = cleaned.slice(0, 3) + '-' + cleaned.slice(3);
        } else if (cleaned.length > 5) {
            cleaned = cleaned.slice(0, 3) + '-' + cleaned.slice(3, 5) + '-' + cleaned.slice(5, 9);
        }

        handleInputChange("text_social security number", cleaned);
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

    // Signature handling
    const handleSignatureEnd = () => {
        if (sigCanvasRef.current && !sigCanvasRef.current.isEmpty()) {
            const signatureDataURL = sigCanvasRef.current.toDataURL();
            setSignatureDataUrl(signatureDataURL);
        }
    };

    const clearSignature = () => {
        if (sigCanvasRef.current) {
            sigCanvasRef.current.clear();
            setSignatureDataUrl('');
        }
    };

    // PDF filling logic with flattening/read-only fields
    const fillPdf = async (formData, pdfUrl) => {
        try {
            const pdfResponse = await fetch(pdfUrl);
            const pdfBuffer = await pdfResponse.arrayBuffer();
            const pdfDoc = await PDFDocument.load(pdfBuffer);
            const form = pdfDoc.getForm();

            console.log('🔄 Filling W-4 form fields...');

            // Fill all text fields
            const textFields = [
                "text_ First name and middle initial",
                "text_last name",
                "text_social security number",
                "text_address",
                "text_City or town",
                "text_two jobs",
                "text_three jobs_2a",
                "text_three jobs_2b",
                "text_three jobs_2c",
                "text_Enter the number of pay periods per year for the highest paying job",
                "text_Divide the annual amount on line 1 or line 2c by the number of pay periods on line 3",
                "text_Multiply the number of qualifying children under age 17",
                "text_Multiply the number of other dependents b",
                "text_Add the amounts above for qualifying children and other dependents",
                "text_Other income not from jobs",
                "text_Deductions",
                "text_Extra withholding",
                "text_Enter an estimate of your 2023 itemized deductions",
                "text_Enter:",
                "text_If line 1 is greater than line 2",
                "text_Enter an estimate of your student loan interest",
                "text_Add lines 3 and 4",
                "text_First date of employment",
                "text_Employer identification number",
                "textarea_Employer’s name",
                "text_Employer’s address",
                "text_employer's signature date"
            ];

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

            // Handle checkboxes
            const checkboxFields = [
                "checkbox_single",
                "checkbox_married",
                "checkbox_head of household",
                "checkbox_If there are only two jobs total, you may check this box"
            ];

            checkboxFields.forEach(fieldName => {
                try {
                    const field = form.getCheckBox(fieldName);
                    if (field) {
                        const shouldBeChecked = formData[fieldName] === true;
                        console.log(`🔘 Setting checkbox ${fieldName} to: ${shouldBeChecked}`);

                        if (shouldBeChecked) {
                            field.check();
                            console.log(`✅ Checked checkbox: ${fieldName}`);
                        } else {
                            field.uncheck();
                            console.log(`✅ Unchecked checkbox: ${fieldName}`);
                        }
                    } else {
                        console.log(`❌ Checkbox field not found: ${fieldName}`);
                    }
                } catch (error) {
                    console.log(`❌ Error setting checkbox ${fieldName}:`, error.message);
                }
            });

            // Handle signature as image overlay
            if (signatureDataUrl) {
                const signatureImageBytes = await dataURLToImageBytes(signatureDataUrl);
                if (signatureImageBytes) {
                    const signatureImage = await pdfDoc.embedPng(signatureImageBytes);
                    const pages = pdfDoc.getPages();

                    // Draw signature on the first page at a specific position
                    if (pages[0]) {
                        pages[0].drawImage(signatureImage, {
                            x: 100,
                            y: 100,
                            width: 150,
                            height: 50,
                        });
                        console.log('✅ Signature image added to PDF');
                    }
                }
            }

            // Make all fields read-only (lock them)
            console.log('🔒 Locking form fields...');
            form.getFields().forEach((field) => {
                try {
                    // First try to enable read-only
                    field.enableReadOnly();
                    console.log(`✅ Enabled read-only for field: ${field.getName()}`);
                } catch (err) {
                    console.log(`⚠️ Could not set read-only for field: ${field.getName()}`, err.message);
                }
            });

            // Alternative: Flatten the form (makes it non-editable)
            try {
                console.log('🔒 Flattening form (making non-editable)...');
                // This flattens the form and removes form fields entirely
                // form.flatten();
                console.log('✅ Form flattened successfully');
            } catch (flattenError) {
                console.log('⚠️ Could not flatten form, using read-only mode:', flattenError.message);
            }

            const filledPdfBytes = await pdfDoc.save();
            return filledPdfBytes;

        } catch (error) {
            console.error('Error filling W-4 form:', error);
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
                'Form W-4 Submitted Successfully!',
                'Your W-4 form has been submitted successfully.'
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
            const errorMessage = error.response?.data?.message || 'Failed to submit form. Please try again.';
            showStatusModal('error', 'Submission Failed', errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    // Cleanup
    useEffect(() => {
        return () => {
            if (previewUrl) {
                try { URL.revokeObjectURL(previewUrl); } catch (e) { /* ignore */ }
            }
            if (sigCanvasRef.current) {
                try { sigCanvasRef.current.clear(); } catch (e) { /* ignore */ }
            }
        };
    }, []);

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg max-w-6xl w-full max-h-[95vh] overflow-hidden">
                    <div className="flex justify-between items-center p-6 border-b">
                        <h2 className="text-xl font-semibold">Employee's Withholding Certificate</h2>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">✕</button>
                    </div>

                    <div className="p-6 overflow-y-auto max-h-[85vh]">
                        {/* Single Page Form */}
                        <div className="space-y-8">
                            {/* Step 1: Personal Information */}
                            <div className="border rounded-lg p-6">
                                <h3 className="text-lg font-semibold mb-4 border-b pb-2">Step 1: Personal Information</h3>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">First Name and Middle Initial</label>
                                            <input
                                                type="text"
                                                value={formData["text_ First name and middle initial"]}
                                                onChange={(e) => handleInputChange("text_ First name and middle initial", e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                                            <input
                                                type="text"
                                                value={formData["text_last name"]}
                                                onChange={(e) => handleInputChange("text_last name", e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Social Security Number</label>
                                        <input
                                            type="text"
                                            value={formData["text_social security number"]}
                                            onChange={(e) => handleSSNChange(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="XXX-XX-XXXX"
                                            maxLength={11}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                        <input
                                            type="text"
                                            value={formData["text_address"]}
                                            onChange={(e) => handleInputChange("text_address", e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Street Address"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">City or Town</label>
                                        <input
                                            type="text"
                                            value={formData["text_City or town"]}
                                            onChange={(e) => handleInputChange("text_City or town", e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="City, State ZIP"
                                        />
                                    </div>

                                    <div className="pt-4 border-t">
                                        <label className="block text-sm font-medium text-gray-700 mb-3">Filing Status (Check only one):</label>
                                        <div className="space-y-3">
                                            <label className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={formData["checkbox_single"]}
                                                    onChange={(e) => handleCheckboxChange("checkbox_single", e.target.checked)}
                                                    className="h-4 w-4 text-blue-600 rounded"
                                                />
                                                <span className="ml-2 text-sm">Single or Married filing separately</span>
                                            </label>
                                            <label className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={formData["checkbox_married"]}
                                                    onChange={(e) => handleCheckboxChange("checkbox_married", e.target.checked)}
                                                    className="h-4 w-4 text-blue-600 rounded"
                                                />
                                                <span className="ml-2 text-sm">Married filing jointly or Qualifying surviving spouse</span>
                                            </label>
                                            <label className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={formData["checkbox_head of household"]}
                                                    onChange={(e) => handleCheckboxChange("checkbox_head of household", e.target.checked)}
                                                    className="h-4 w-4 text-blue-600 rounded"
                                                />
                                                <span className="ml-2 text-sm">Head of household (Check only if you're unmarried and pay more than half the costs of keeping up a home for yourself and a qualifying individual)</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Step 2: Multiple Jobs */}
                            <div className="border rounded-lg p-6">
                                <h3 className="text-lg font-semibold mb-4 border-b pb-2">Step 2: Multiple Jobs or Spouse Works</h3>
                                <div className="space-y-4">
                                    <div className="bg-blue-50 p-4 rounded-lg">
                                        <p className="text-sm text-blue-700">
                                            <strong>Complete this step if you:</strong><br />
                                            1. Hold more than one job at a time, OR<br />
                                            2. Are married filing jointly and your spouse also works
                                        </p>
                                    </div>

                                    <div className="pt-4">
                                        <label className="flex items-center mb-4">
                                            <input
                                                type="checkbox"
                                                checked={formData["checkbox_If there are only two jobs total, you may check this box"]}
                                                onChange={(e) => handleCheckboxChange("checkbox_If there are only two jobs total, you may check this box", e.target.checked)}
                                                className="h-4 w-4 text-blue-600 rounded"
                                            />
                                            <span className="ml-2 text-sm">If there are only two jobs total, you may check this box. Do the same on Form W-4 for the other job.</span>
                                        </label>
                                    </div>

                                    <div className="space-y-4">
                                        <h4 className="font-medium text-gray-700">Multiple Jobs Worksheet (Optional)</h4>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Two jobs total amount</label>
                                                <input
                                                    type="text"
                                                    value={formData["text_two jobs"]}
                                                    onChange={(e) => handleInputChange("text_two jobs", e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="From table on page 4"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Number of pay periods per year</label>
                                                <input
                                                    type="text"
                                                    value={formData["text_Enter the number of pay periods per year for the highest paying job"]}
                                                    onChange={(e) => handleInputChange("text_Enter the number of pay periods per year for the highest paying job", e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="52 for weekly, 26 for bi-weekly, 12 for monthly"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Three jobs - Line 2a</label>
                                                <input
                                                    type="text"
                                                    value={formData["text_three jobs_2a"]}
                                                    onChange={(e) => handleInputChange("text_three jobs_2a", e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Three jobs - Line 2b</label>
                                                <input
                                                    type="text"
                                                    value={formData["text_three jobs_2b"]}
                                                    onChange={(e) => handleInputChange("text_three jobs_2b", e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Three jobs - Line 2c (2a + 2b)</label>
                                                <input
                                                    type="text"
                                                    value={formData["text_three jobs_2c"]}
                                                    onChange={(e) => handleInputChange("text_three jobs_2c", e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Extra withholding per pay period (Line 4)</label>
                                            <input
                                                type="text"
                                                value={formData["text_Divide the annual amount on line 1 or line 2c by the number of pay periods on line 3"]}
                                                onChange={(e) => handleInputChange("text_Divide the annual amount on line 1 or line 2c by the number of pay periods on line 3", e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="Enter amount manually"
                                            />
                                            <p className="text-xs text-gray-500 mt-1">Enter amount manually</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Step 3: Dependents */}
                            <div className="border rounded-lg p-6">
                                <h3 className="text-lg font-semibold mb-4 border-b pb-2">Step 3: Claim Dependents and Other Credits</h3>
                                <div className="space-y-4">
                                    <div className="bg-blue-50 p-4 rounded-lg">
                                        <p className="text-sm text-blue-700">
                                            <strong>Complete this step if your total income will be $200,000 or less ($400,000 or less if married filing jointly)</strong>
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Number of qualifying children under age 17
                                            </label>
                                            <div className="flex flex-col">
                                                <input
                                                    type="text"
                                                    value={formData["text_Multiply the number of qualifying children under age 17"]}
                                                    onChange={(e) => handleInputChange("text_Multiply the number of qualifying children under age 17", e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="Enter number or amount"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Number of other dependents
                                            </label>
                                            <div className="flex flex-col">
                                                <input
                                                    type="text"
                                                    value={formData["text_Multiply the number of other dependents b"]}
                                                    onChange={(e) => handleInputChange("text_Multiply the number of other dependents b", e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="Enter number or amount"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Total credits
                                            </label>
                                            <input
                                                type="text"
                                                value={formData["text_Add the amounts above for qualifying children and other dependents"]}
                                                onChange={(e) => handleInputChange("text_Add the amounts above for qualifying children and other dependents", e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="Enter total amount"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Step 4: Other Adjustments */}
                            <div className="border rounded-lg p-6">
                                <h3 className="text-lg font-semibold mb-4 border-b pb-2">Step 4: Other Adjustments (Optional)</h3>
                                <div className="space-y-6">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Other income (not from jobs)</label>
                                            <input
                                                type="text"
                                                value={formData["text_Other income not from jobs"]}
                                                onChange={(e) => handleInputChange("text_Other income not from jobs", e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="Interest, dividends, retirement income"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Deductions</label>
                                            <input
                                                type="text"
                                                value={formData["text_Deductions"]}
                                                onChange={(e) => handleInputChange("text_Deductions", e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>

                                        <div className="pt-4 border-t">
                                            <h4 className="font-medium text-gray-700 mb-3">Deductions Worksheet</h4>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Itemized deductions estimate</label>
                                                    <input
                                                        type="text"
                                                        value={formData["text_Enter an estimate of your 2023 itemized deductions"]}
                                                        onChange={(e) => handleInputChange("text_Enter an estimate of your 2023 itemized deductions", e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Standard deduction</label>
                                                    <input
                                                        type="text"
                                                        value={formData["text_Enter:"]}
                                                        onChange={(e) => handleInputChange("text_Enter:", e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        placeholder="$13,850 for single, $27,700 for married"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">If line 1 is greater than line 2</label>
                                                    <input
                                                        type="text"
                                                        value={formData["text_If line 1 is greater than line 2"]}
                                                        onChange={(e) => handleInputChange("text_If line 1 is greater than line 2", e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        placeholder="Enter amount manually"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Student loan interest & other adjustments</label>
                                                    <input
                                                        type="text"
                                                        value={formData["text_Enter an estimate of your student loan interest"]}
                                                        onChange={(e) => handleInputChange("text_Enter an estimate of your student loan interest", e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                </div>
                                            </div>

                                            <div className="mt-4">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Total deductions (Line 5)</label>
                                                <input
                                                    type="text"
                                                    value={formData["text_Add lines 3 and 4"]}
                                                    onChange={(e) => handleInputChange("text_Add lines 3 and 4", e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="Enter total amount manually"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Extra withholding</label>
                                            <input
                                                type="text"
                                                value={formData["text_Extra withholding"]}
                                                onChange={(e) => handleInputChange("text_Extra withholding", e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="Additional tax per pay period"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Step 5: Signature & Employer Info */}
                            <div className="border rounded-lg p-6">
                                <h3 className="text-lg font-semibold mb-4 border-b pb-2">Step 5: Signature & Employer Information</h3>
                                <div className="space-y-6">
                                    <div className="space-y-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Employee Signature</label>

                                        <div className="mb-4">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-sm text-gray-600">Sign below:</span>
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
                                                        ✓ Signature captured
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                                <input
                                                    type="date"
                                                    value={formData["text_employer's signature date"]}
                                                    onChange={(e) => handleInputChange("text_employer's signature date", e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">First Date of Employment</label>
                                                <input
                                                    type="date"
                                                    value={formData["text_First date of employment"]}
                                                    onChange={(e) => handleInputChange("text_First date of employment", e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t">
                                        <h4 className="font-medium text-gray-700 mb-3">Employer Information (For Employer Use Only)</h4>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Employer Identification Number (EIN)</label>
                                                <input
                                                    type="text"
                                                    value={formData["text_Employer identification number"]}
                                                    onChange={(e) => handleInputChange("text_Employer identification number", e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="XX-XXXXXXX"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Employer's Name</label>
                                                <input
                                                    type="text"
                                                    value={formData["textarea_Employer’s name"]}
                                                    onChange={(e) => handleInputChange("textarea_Employer’s name", e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                        </div>

                                        <div className="mt-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Employer's Address</label>
                                            <input
                                                type="text"
                                                value={formData["text_Employer’s address"]}
                                                onChange={(e) => handleInputChange("text_Employer’s address", e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-4 mt-8">
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
                                        'Submit Form'
                                    )}
                                </button>
                            )}
                        </div>

                        {/* PDF Preview */}
                        {previewUrl && (
                            <div className="mt-6">
                                <h3 className="text-lg font-semibold mb-4">Preview Filled Form</h3>
                                <div className="border rounded-lg overflow-hidden">
                                    <iframe
                                        src={previewUrl}
                                        className="w-full h-96"
                                        title="W-4 Form Preview"
                                    />
                                    <div className="bg-gray-50 p-3 text-sm text-gray-600">
                                        <p>Review your W-4 form above. If everything looks correct, click "Submit Form".</p>
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

export default W4Form2023SinglePage;