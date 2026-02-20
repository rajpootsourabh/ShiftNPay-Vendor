import React, { useState, useRef, useEffect } from 'react';
import { PDFDocument } from 'pdf-lib';
import axios from 'axios';
import StatusModal from './StatusModal';
import EmployeeInfo from './sections/I9/EmployeeInfo';
import EmployerVerification from './sections/I9/EmployerVerification';
import SupplementAPreparer from './sections/I9/SupplementAPreparer';
import SupplementBRehire from './sections/I9/SupplementBRehire';

const I9Form = ({ document, token, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        // Section 1: Employee Information
        "Last Name (Family Name)": "", // 98
        "First Name (Given Name)": "", // 5
        "Employee Middle Initial (if any)": "", // 6
        "Employee Other Last Names Used (if any)": "", // 7
        "Address Street Number and Name": "", // 99
        "Apt Number (if any)": "", // 100
        "City or Town": "", // 101
        "State": "", // 93 (dropdown)
        "ZIP Code": "", // 94
        "Date of Birth mmddyyyy": "", // 95
        "US Social Security Number": "", // 96
        "Employees E-mail Address": "", // 102
        "Telephone Number": "", // 97

        // Section 1: Citizenship/Immigration Status (Checkboxes)
        "CB_1": false, // 47 - A citizen of the United States
        "CB_2": false, // 48 - A noncitizen national of the United States
        "CB_3": false, // 49 - A lawful permanent resident
        "CB_4": false, // 50 - A noncitizen authorized to work

        // Section 1: Immigration documentation fields
        "3 A lawful permanent resident Enter USCIS or ANumber": "", // 0
        "USCIS ANumber": "", // 104
        "Form I94 Admission Number": "", // 105
        "Foreign Passport Number and Country of IssuanceRow1": "", // 106
        "Exp Date mmddyyyy": "", // 103

        // Section 1: Employee Signature
        "Signature of Employee": "", // 1
        "Today's Date mmddyyy": "", // 8

        // Section 2: Employer Information
        "FirstDayEmployed mmddyyyy": "", // 118

        // Section 2: List A Documents
        "Document Title 1": "", // 107 (List A)
        "Issuing Authority 1": "", // 108
        "Document Number 0 (if any)": "", // 109
        "List A. Document 2. Expiration Date (if any)": "", // 9

        // List A additional row
        "List A.   Document Title 3.  If any": "", // 10
        "List A. Document 3.  Enter Issuing Authority": "", // 11
        "List A.  Document 3 Number.  If any": "", // 12


        // Section 2: List B Documents
        "List B Document 1 Title": "", // 13
        "List B Issuing Authority 1": "", // 125
        "List B Document Number 1": "", // 126
        "List B Expiration Date 1": "", // 127

        // Section 2: List C Documents
        "List C Document Title 1": "", // 117
        "List C Issuing Authority 1": "", // 116
        "List C Document Number 1": "", // 115
        "List C Expiration Date 1": "", // 114

        // Section 2: Additional Document Row
        "Document Title 2 If any": "", // 110
        "Issuing Authority_2": "", // 111
        "Document Number If any_2": "", // 112
        "Document Number if any_3": "", // 113

        // Section 2: Additional Information
        "Additional Information": "", // 14

        // Section 2: Employer Certification
        "Last Name First Name and Title of Employer or Authorized Representative": "", // 120
        "Signature of Employer or AR": "", // 121
        "Employers Business or Org Name": "", // 122
        "Employers Business or Org Address": "", // 123
        "S2 Todays Date mmddyyyy": "", // 119

        // Section 2: Alternative Procedure
        "CB_Alt": false, // 90

        // Supplement A: Preparer/Translator Information (up to 4)
        // Preparer 0
        "Preparer or Translator First Name (Given Name) 0": "", // 31
        "Preparer or Translator Last Name (Family Name) 0": "", // 24
        "PT Middle Initial 0": "", // 66
        "Preparer or Translator Address (Street Number and Name) 0": "", // 27
        "Preparer or Translator City or Town 0": "", // 35
        "Preparer State 0": "", // 39 (dropdown)
        "Zip Code 0": "", // 43
        "Signature of Preparer or Translator 0": "", // 20
        "Sig Date mmddyyyy 0": "", // 17

        // Preparer 1
        "Preparer or Translator First Name (Given Name) 1": "", // Missing in list but exists in form
        "Preparer or Translator Last Name (Family Name) 1": "", // 32
        "PT Middle Initial 1": "", // 67
        "Preparer or Translator Address (Street Number and Name) 1": "", // 28
        "Preparer or Translator City or Town 1": "", // 36
        "Preparer State 1": "", // 40 (dropdown)
        "Zip Code 1": "", // 44
        "Signature of Preparer or Translator 1": "", // 21
        "Sig Date mmddyyyy 1": "", // 16

        // Preparer 2
        "Preparer or Translator First Name (Given Name) 2": "", // 33
        "Preparer or Translator Last Name (Family Name) 2": "", // 25
        "PT Middle Initial 2": "", // 68
        "Preparer or Translator Address (Street Number and Name) 2": "", // 29
        "Preparer or Translator City or Town 2": "", // 37
        "Preparer State 2": "", // 41 (dropdown)
        "Zip Code 2": "", // 45
        "Signature of Preparer or Translator 2": "", // 22
        "Sig Date mmddyyyy 2": "", // 18

        // Preparer 3
        "Preparer or Translator First Name (Given Name) 3": "", // 34
        "Preparer or Translator Last Name (Family Name) 3": "", // 26
        "PT Middle Initial 3": "", // 69
        "Preparer or Translator Address (Street Number and Name) 3": "", // 30
        "Preparer or Translator City or Town 3": "", // 38
        "Preparer State 3": "", // 42 (dropdown)
        "Zip Code 3": "", // 46
        "Signature of Preparer or Translator 3": "", // 23
        "Sig Date mmddyyyy 3": "", // 19

        // Supplement A: Employee name reference (duplicate fields)
        "Last Name Family Name from Section 1": "", // 2
        "First Name Given Name from Section 1": "", // 3
        "Middle initial if any from Section 1": "", // 4
        "Last Name Family Name from Section 1-2": "", // 91
        "First Name Given Name from Section 1-2": "", // 92
        "Middle initial if any from Section 1-2": "", // 15

        // Supplement B: Reverification and Rehire (up to 3)
        // Rehire 0
        "Date of Rehire 0": "", // 51
        "Last Name 0": "", // 57
        "First Name 0": "", // 60
        "Middle Initial 0": "", // 63
        "Document Title 0": "", // 70
        "Document Number 0": "", // 72
        "Expiration Date 0": "", // 75
        "Name of Emp or Auth Rep 0": "", // 78
        "Signature of Emp Rep 0": "", // 81
        "Todays Date 0": "", // 54
        "CB_Alt_0": false, // 84
        "Addtl Info 0": "", // 87

        // Rehire 1
        "Date of Rehire 1": "", // 52
        "Last Name 1": "", // 58
        "First Name 1": "", // 61
        "Middle Initial 1": "", // 64
        "Document Title 1_rehire": "", // 71 (duplicate with Document Title 2)
        "Document Number 1": "", // 73
        "Expiration Date 1": "", // 77
        "Name of Emp or Auth Rep 1": "", // 79
        "Signature of Emp Rep 1": "", // 82
        "Todays Date 1": "", // 55
        "CB_Alt_1": false, // 85
        "Addtl Info 1": "", // 89

        // Rehire 2
        "Date of Rehire 2": "", // 53
        "Last Name 2": "", // 59
        "First Name 2": "", // 62
        "Middle Initial 2": "", // 65
        "Document Title 2_rehire": "", // 71 (will use same as Document Title 2)
        "Document Number 2": "", // 74
        "Expiration Date 2": "", // 76
        "Name of Emp or Auth Rep 2": "", // 80
        "Signature of Emp Rep 2": "", // 83
        "Todays Date 2": "", // 56
        "CB_Alt_2": false, // 86
        "Addtl Info 2": "", // 88

        // Additional field from list
        "Expiration Date if any": "", // 124
    });

    const [generatingPreview, setGeneratingPreview] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [previewUrl, setPreviewUrl] = useState('');
    const [filledPdfBytes, setFilledPdfBytes] = useState(null);
    const [signatureDataUrl, setSignatureDataUrl] = useState('');
    const [activeSection, setActiveSection] = useState('section1');
    const [preparerCount, setPreparerCount] = useState(0);
    const [rehireCount, setRehireCount] = useState(0);

    // Signature refs
    const employeeSigCanvasRef = useRef();
    const employerSigCanvasRef = useRef();
    const preparerSigCanvasRefs = [useRef(), useRef(), useRef(), useRef()];
    const rehireSigCanvasRefs = [useRef(), useRef(), useRef()];

    const [statusModal, setStatusModal] = useState({
        isOpen: false,
        type: 'success',
        title: '',
        message: ''
    });

    // US States for dropdown
    const usStates = [
        'AK', 'AL', 'AR', 'AS', 'AZ', 'CA', 'CO', 'CT', 'DC', 'DE',
        'FL', 'GA', 'GU', 'HI', 'IA', 'ID', 'IL', 'IN', 'KS', 'KY',
        'LA', 'MA', 'MD', 'ME', 'MI', 'MN', 'MO', 'MP', 'MS', 'MT',
        'NC', 'ND', 'NE', 'NH', 'NJ', 'NM', 'NV', 'NY', 'OH', 'OK',
        'OR', 'PA', 'PR', 'RI', 'SC', 'SD', 'TN', 'TX', 'UM', 'UT',
        'VA', 'VI', 'VT', 'WA', 'WI', 'WV', 'WY'
    ];

    // Navigation sections
    const sections = [
        { id: 'section1', name: 'Section 1: Employee' },
        { id: 'section2', name: 'Section 2: Employer' },
        { id: 'preparer', name: 'Preparer/Translator' },
        { id: 'rehire', name: 'Rehire/Reverification' }
    ];

    const showStatusModal = (type, title, message) => {
        setStatusModal({
            isOpen: true,
            type,
            title,
            message
        });
    };

    const closeStatusModal = () => {
        setStatusModal(prev => ({ ...prev, isOpen: false }));
    };

    const handleInputChange = (fieldName, value) => {
        setFormData(prev => ({
            ...prev,
            [fieldName]: value
        }));
    };

    const handleCheckboxChange = (fieldName, checked) => {
        setFormData(prev => ({
            ...prev,
            [fieldName]: checked
        }));

        // Handle mutual exclusivity for citizenship status checkboxes
        if (['CB_1', 'CB_2', 'CB_3', 'CB_4'].includes(fieldName) && checked) {
            ['CB_1', 'CB_2', 'CB_3', 'CB_4'].forEach(cb => {
                if (cb !== fieldName) {
                    setFormData(prev => ({ ...prev, [cb]: false }));
                }
            });
        }
    };

    // Handle signatures
    // Handle signatures - store the actual signature data URL in formData
    const handleSignatureEnd = (signerType, index = null) => {
        let canvasRef;
        let fieldName;

        switch (signerType) {
            case 'employee':
                canvasRef = employeeSigCanvasRef;
                fieldName = 'Signature of Employee';
                break;
            case 'employer':
                canvasRef = employerSigCanvasRef;
                fieldName = 'Signature of Employer or AR';
                break;
            case 'preparer':
                canvasRef = preparerSigCanvasRefs[index];
                fieldName = `Signature of Preparer or Translator ${index}`;
                break;
            case 'rehire':
                canvasRef = rehireSigCanvasRefs[index];
                fieldName = `Signature of Emp Rep ${index}`;
                break;
            default:
                return;
        }

        if (canvasRef.current && !canvasRef.current.isEmpty()) {
            const signatureDataURL = canvasRef.current.toDataURL();

            // Store the actual signature data URL in formData
            handleInputChange(fieldName, signatureDataURL);

            // Also update the visual signature URL for the current active section
            setSignatureDataUrl(signatureDataURL);
        }
    };

    const clearSignature = (signerType, index = null) => {
        let canvasRef;
        let fieldName;

        switch (signerType) {
            case 'employee':
                canvasRef = employeeSigCanvasRef;
                fieldName = 'Signature of Employee';
                break;
            case 'employer':
                canvasRef = employerSigCanvasRef;
                fieldName = 'Signature of Employer or AR';
                break;
            case 'preparer':
                canvasRef = preparerSigCanvasRefs[index];
                fieldName = `Signature of Preparer or Translator ${index}`;
                break;
            case 'rehire':
                canvasRef = rehireSigCanvasRefs[index];
                fieldName = `Signature of Emp Rep ${index}`;
                break;
            default:
                return;
        }

        if (canvasRef.current) {
            canvasRef.current.clear();

            // Clear the signature from formData
            handleInputChange(fieldName, "");

            // Clear the visual signature URL
            setSignatureDataUrl('');
        }
    };

    // Add a new preparer/translator
    const addPreparer = () => {
        if (preparerCount < 4) {
            setPreparerCount(preparerCount + 1);
        }
    };

    // Add a new rehire/reverification entry
    const addRehire = () => {
        if (rehireCount < 3) {
            setRehireCount(rehireCount + 1);
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

            console.log('🔄 Filling I-9 form fields...');

            // DEBUG: List all available fields in the PDF
            console.log('📋 All available PDF fields:', form.getFields().map(f => f.getName()));

            // Fill text fields
            const textFields = Object.keys(formData).filter(key =>
                key.startsWith('CB_') === false
            );

            textFields.forEach(fieldName => {
                try {
                    // First try as text field
                    const field = form.getTextField(fieldName);
                    if (field) {
                        const value = formData[fieldName];
                        if (value !== undefined && value !== null) {
                            // Check if this is a signature field with a data URL
                            if (value.startsWith('data:image/')) {
                                // For signature fields, we'll embed the image, not set text
                                // Leave the text field empty or set a placeholder
                                field.setText("");
                                console.log(`✅ Signature field detected: ${fieldName} (will embed image)`);
                            } else {
                                field.setText(value.toString());
                                console.log(`✅ Set text field: ${fieldName} = "${value}"`);
                            }
                        }
                    } else {
                        // Try as dropdown
                        const dropdown = form.getDropdown(fieldName);
                        if (dropdown) {
                            const value = formData[fieldName];
                            if (value) {
                                try {
                                    dropdown.select(value);
                                    console.log(`✅ Set dropdown: ${fieldName} = "${value}"`);
                                } catch (error) {
                                    console.log(`❌ Could not set dropdown ${fieldName} to value "${value}":`, error.message);
                                }
                            }
                        } else {
                            console.log(`⚠️ Field not found: ${fieldName}`);
                        }
                    }
                } catch (error) {
                    console.log(`❌ Error with field ${fieldName}:`, error.message);
                }
            });

            // Fill checkboxes
            const checkboxFields = [
                'CB_1', 'CB_2', 'CB_3', 'CB_4', 'CB_Alt',
                'CB_Alt_0', 'CB_Alt_1', 'CB_Alt_2'
            ];

            checkboxFields.forEach(fieldName => {
                try {
                    const checkbox = form.getCheckBox(fieldName);
                    if (checkbox) {
                        if (formData[fieldName]) {
                            checkbox.check();
                            console.log(`✅ Checked: ${fieldName}`);
                        } else {
                            checkbox.uncheck();
                            console.log(`✅ Unchecked: ${fieldName}`);
                        }
                    } else {
                        console.log(`⚠️ Checkbox not found: ${fieldName}`);
                    }
                } catch (error) {
                    console.log(`❌ Error with checkbox ${fieldName}:`, error.message);
                }
            });

            // Handle ALL dropdown fields explicitly (including the main State field)
            const dropdownFields = [
                'State', // Main state field
                'Preparer State 0',
                'Preparer State 1',
                'Preparer State 2',
                'Preparer State 3'
            ];

            dropdownFields.forEach(fieldName => {
                try {
                    const dropdown = form.getDropdown(fieldName);
                    if (dropdown && formData[fieldName]) {
                        dropdown.select(formData[fieldName]);
                        console.log(`✅ Set dropdown ${fieldName} = "${formData[fieldName]}"`);
                    } else if (!formData[fieldName]) {
                        console.log(`ℹ️ No value for dropdown: ${fieldName}`);
                    } else {
                        console.log(`⚠️ Dropdown not found: ${fieldName}`);
                    }
                } catch (error) {
                    console.log(`❌ Error with dropdown ${fieldName}:`, error.message);
                }
            });

            // EMBED SIGNATURE IMAGES
            console.log('🎨 Embedding signature images...');

            // List of signature fields to check
            const signatureFields = [
                'Signature of Employee',
                'Signature of Employer or AR',
                'Signature of Preparer or Translator 0',
                'Signature of Preparer or Translator 1',
                'Signature of Preparer or Translator 2',
                'Signature of Preparer or Translator 3',
                'Signature of Emp Rep 0',
                'Signature of Emp Rep 1',
                'Signature of Emp Rep 2'
            ];

            // Helper function to embed a signature
            const embedSignature = async (pdfDoc, signatureDataUrl, fieldName) => {
                if (!signatureDataUrl || !signatureDataUrl.startsWith('data:image/')) {
                    console.log(`ℹ️ No valid signature for ${fieldName}`);
                    return;
                }

                try {
                    console.log(`🖋️ Embedding signature for ${fieldName}`);

                    // Convert data URL to image bytes
                    const response = await fetch(signatureDataUrl);
                    const blob = await response.blob();
                    const signatureBytes = new Uint8Array(await blob.arrayBuffer());

                    // Embed the PNG image
                    const signatureImage = await pdfDoc.embedPng(signatureBytes);

                    // Try to find the signature field
                    const sigField = form.getTextField(fieldName);
                    if (sigField) {
                        // Get the widget to find its position
                        const widgets = sigField.acroField.getWidgets();
                        if (widgets && widgets.length > 0) {
                            const widget = widgets[0];
                            const rect = widget.getRectangle();

                            // Find which page this widget is on
                            const pageRef = widget.P();
                            const allPages = pdfDoc.getPages();

                            let targetPage = allPages[0]; // Default to first page
                            for (let i = 0; i < allPages.length; i++) {
                                if (allPages[i].ref === pageRef) {
                                    targetPage = allPages[i];
                                    break;
                                }
                            }

                            // Draw the signature image at the field location
                            // Adjust coordinates as needed based on your PDF
                            targetPage.drawImage(signatureImage, {
                                x: rect.x || 100,
                                y: rect.y || 100,
                                width: 150,
                                height: 50
                            });

                            console.log(`✅ Successfully embedded signature for ${fieldName}`);
                        } else {
                            console.log(`⚠️ No widget found for signature field: ${fieldName}`);
                            // Fallback: draw signature on first page at a reasonable position
                            const firstPage = pdfDoc.getPages()[0];
                            firstPage.drawImage(signatureImage, {
                                x: 100,
                                y: 100,
                                width: 150,
                                height: 50
                            });
                        }
                    } else {
                        console.log(`⚠️ Signature field not found in PDF: ${fieldName}`);
                    }
                } catch (error) {
                    console.log(`❌ Error embedding signature for ${fieldName}:`, error.message);
                }
            };

            // Embed signatures for all signature fields
            for (const fieldName of signatureFields) {
                const signatureDataUrl = formData[fieldName];
                if (signatureDataUrl) {
                    await embedSignature(pdfDoc, signatureDataUrl, fieldName);
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
            console.error('Error filling I-9 form:', error);
            throw error;
        }
    };

    const handlePreview = async () => {
        // Check at least one citizenship status is selected
        // const citizenshipSelected = ['CB_1', 'CB_2', 'CB_3', 'CB_4'].some(cb => formData[cb]);
        // if (!citizenshipSelected) {
        //   showStatusModal(
        //     'error',
        //     'Citizenship Status Required',
        //     'Please select your citizenship or immigration status.'
        //   );
        //   return;
        // }

        // // Check for Lawful Permanent Resident - if CB_3 is checked, A-Number is required
        // if (formData["CB_3"] && !formData["3 A lawful permanent resident Enter USCIS or ANumber"]) {
        //   showStatusModal(
        //     'error',
        //     'A-Number Required',
        //     'Please enter your USCIS A-Number as a Lawful Permanent Resident.'
        //   );
        //   return;
        // }

        // // Check for Authorized Noncitizen - if CB_4 is checked, at least one document is required
        // if (formData["CB_4"]) {
        //   const hasDocument = 
        //     formData["USCIS ANumber"] || 
        //     formData["Form I94 Admission Number"] || 
        //     formData["Foreign Passport Number and Country of IssuanceRow1"];

        //   if (!hasDocument) {
        //     showStatusModal(
        //       'error',
        //       'Documentation Required',
        //       'Please provide at least one document number (USCIS A-Number, I-94 Admission Number, or Foreign Passport Number) for authorized noncitizen status.'
        //     );
        //     return;
        //   }

        //   // Expiration date is required for noncitizens
        //   if (!formData["Exp Date mmddyyyy"]) {
        //     showStatusModal(
        //       'error',
        //       'Expiration Date Required',
        //       'Please provide the expiration date for your work authorization.'
        //     );
        //     return;
        //   }
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
                'Your I-9 form has been submitted successfully.'
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

    // Render different sections
    const renderCurrentSection = () => {
        switch (activeSection) {
            case 'section1':
                return (
                    <EmployeeInfo
                        formData={formData}
                        onInputChange={handleInputChange}
                        onCheckboxChange={handleCheckboxChange}
                        signatureDataUrl={signatureDataUrl}
                        onSignatureEnd={() => handleSignatureEnd('employee')}
                        onClearSignature={() => clearSignature('employee')}
                        sigCanvasRef={employeeSigCanvasRef}
                        formatDateForInput={formatDateForInput}
                        usStates={usStates}
                    />
                );
            case 'section2':
                return (
                    <EmployerVerification
                        formData={formData}
                        onInputChange={handleInputChange}
                        onCheckboxChange={handleCheckboxChange}
                        signatureDataUrl={signatureDataUrl}
                        onSignatureEnd={() => handleSignatureEnd('employer')}
                        onClearSignature={() => clearSignature('employer')}
                        sigCanvasRef={employerSigCanvasRef}
                        formatDateForInput={formatDateForInput}
                    />
                );
            case 'preparer':
                return (
                    <SupplementAPreparer
                        formData={formData}
                        onInputChange={handleInputChange}
                        preparerCount={preparerCount}
                        setPreparerCount={setPreparerCount}
                        onAddPreparer={addPreparer}
                        preparerSigCanvasRefs={preparerSigCanvasRefs}
                        onSignatureEnd={handleSignatureEnd}
                        onClearSignature={clearSignature}
                        formatDateForInput={formatDateForInput}
                        usStates={usStates}
                    />
                );
            case 'rehire':
                return (
                    <SupplementBRehire
                        formData={formData}
                        onInputChange={handleInputChange}
                        onCheckboxChange={handleCheckboxChange}
                        rehireCount={rehireCount}
                        setRehireCount={setRehireCount}
                        onAddRehire={addRehire}
                        rehireSigCanvasRefs={rehireSigCanvasRefs}
                        onSignatureEnd={handleSignatureEnd}
                        onClearSignature={clearSignature}
                        formatDateForInput={formatDateForInput}
                    />
                );
            default:
                return (
                    <EmployeeInfo
                        formData={formData}
                        onInputChange={handleInputChange}
                        onCheckboxChange={handleCheckboxChange}
                        signatureDataUrl={signatureDataUrl}
                        onSignatureEnd={() => handleSignatureEnd('employee')}
                        onClearSignature={() => clearSignature('employee')}
                        sigCanvasRef={employeeSigCanvasRef}
                        formatDateForInput={formatDateForInput}
                        usStates={usStates}
                    />
                );
        }
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (previewUrl) {
                try { URL.revokeObjectURL(previewUrl); } catch (e) { /* ignore */ }
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg max-w-6xl w-full max-h-[95vh] overflow-hidden">
                    <div className="flex justify-between items-center p-6 border-b">
                        <h2 className="text-xl font-semibold">Employment Eligibility Verification (Form I-9)</h2>
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

export default I9Form;