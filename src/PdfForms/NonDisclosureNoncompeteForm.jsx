import React, { useState, useRef, useEffect } from 'react';
import { PDFDocument } from 'pdf-lib';
import axios from 'axios';
import StatusModal from './StatusModal';
import EmployeeSection from './sections/Nondisclosure/EmployeeSection';
import CompanySection from './sections/Nondisclosure/CompanySection';
import WitnessSection from './sections/Nondisclosure/WitnessSection';

const NondisclosureNoncompeteForm = ({ document, token, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    // Employee Information
    "Employee": "",
    "Employee Address": "",
    
    // Company Information
    "Print Name and Title": "",
    "Print Name and Title_2": "",
    "Print Name": "",
    "Address": "",
    "City": "",
    "State": "",
    "Telephone": "",
    
    // Dates
    "Effective Date": "",
    "Date": "",
    
    // Signatures - CORRECTED MAPPING:
    // Signature144 = Company Authorized Signature
    // Signature145 = Witness Signature
    // Signature146 = Employee Signature
    "Signature144_es_:signer:signature": "",
    "Signature145_es_:signer:signature": "",
    "Signature146_es_:signer:signature": ""
  });

  const [generatingPreview, setGeneratingPreview] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [filledPdfBytes, setFilledPdfBytes] = useState(null);
  
  // Separate signature URLs for each signer
  const [employeeSignatureDataUrl, setEmployeeSignatureDataUrl] = useState('');
  const [companySignatureDataUrl, setCompanySignatureDataUrl] = useState('');
  const [witnessSignatureDataUrl, setWitnessSignatureDataUrl] = useState('');
  
  const [activeSection, setActiveSection] = useState('employee');
  
  // Separate canvas refs for each signer
  const employeeSigCanvasRef = useRef();
  const companySigCanvasRef = useRef();
  const witnessSigCanvasRef = useRef();

  // Status modal state
  const [statusModal, setStatusModal] = useState({
    isOpen: false,
    type: 'success',
    title: '',
    message: ''
  });

  // Navigation sections - now with 3 sections
  const sections = [
    { id: 'employee', name: 'Employee Signature' },
    { id: 'company', name: 'Company Signature' },
    { id: 'witness', name: 'Witness Signature' }
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

  // Signature handling - separate for each signer
  const handleEmployeeSignatureEnd = () => {
    if (employeeSigCanvasRef.current && !employeeSigCanvasRef.current.isEmpty()) {
      const signatureDataURL = employeeSigCanvasRef.current.toDataURL();
      setEmployeeSignatureDataUrl(signatureDataURL);
      handleInputChange("Signature146_es_:signer:signature", "");
    }
  };

  const handleCompanySignatureEnd = () => {
    if (companySigCanvasRef.current && !companySigCanvasRef.current.isEmpty()) {
      const signatureDataURL = companySigCanvasRef.current.toDataURL();
      setCompanySignatureDataUrl(signatureDataURL);
      handleInputChange("Signature144_es_:signer:signature", "");
    }
  };

  const handleWitnessSignatureEnd = () => {
    if (witnessSigCanvasRef.current && !witnessSigCanvasRef.current.isEmpty()) {
      const signatureDataURL = witnessSigCanvasRef.current.toDataURL();
      setWitnessSignatureDataUrl(signatureDataURL);
      handleInputChange("Signature145_es_:signer:signature", "");
    }
  };

  // Clear signatures only for the current section
  const clearEmployeeSignature = () => {
    if (employeeSigCanvasRef.current) {
      employeeSigCanvasRef.current.clear();
      setEmployeeSignatureDataUrl('');
      handleInputChange("Signature146_es_:signer:signature", "");
    }
  };

  const clearCompanySignature = () => {
    if (companySigCanvasRef.current) {
      companySigCanvasRef.current.clear();
      setCompanySignatureDataUrl('');
      handleInputChange("Signature144_es_:signer:signature", "");
    }
  };

  const clearWitnessSignature = () => {
    if (witnessSigCanvasRef.current) {
      witnessSigCanvasRef.current.clear();
      setWitnessSignatureDataUrl('');
      handleInputChange("Signature145_es_:signer:signature", "");
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

  // PDF filling logic with correct signature mapping
  const fillPdf = async (formData, pdfUrl) => {
    try {
      const pdfResponse = await fetch(pdfUrl);
      const pdfBuffer = await pdfResponse.arrayBuffer();
      const pdfDoc = await PDFDocument.load(pdfBuffer);
      const form = pdfDoc.getForm();

      console.log('🔄 Filling Nondisclosure/Noncompete Agreement form fields...');
      
      // DEBUG: List all available fields in the PDF
      console.log('📋 All available PDF fields:', form.getFields().map(f => f.getName()));

      // Fill text fields
      console.log('🔄 Filling text fields...');
      const textFields = [
        "Print Name and Title",
        "Print Name and Title_2",
        "Date",
        "Print Name",
        "Address",
        "City",
        "State",
        "Telephone",
        "Signature144_es_:signer:signature",
        "Signature145_es_:signer:signature",
        "Signature146_es_:signer:signature",
        "Effective Date",
        "Employee",
        "Employee Address"
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

      // Embed signatures for all three signers
      const embedSignature = async (signatureDataUrl, signatureField) => {
        if (!signatureDataUrl) return;
        
        const signatureImageBytes = await dataURLToImageBytes(signatureDataUrl);
        if (!signatureImageBytes) return;
        
        const signatureImage = await pdfDoc.embedPng(signatureImageBytes);
        const pages = pdfDoc.getPages();

        try {
          const sigField = form.getTextField(signatureField);
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
                width: rect.width || (rect.right - rect.left) || 200,
                height: rect.height || (rect.top - rect.bottom) || 50,
              });
              console.log(`✅ Embedded signature for ${signatureField}`);
            }
          }
        } catch (error) {
          console.warn(`Could not find exact position for ${signatureField}:`, error);
          // Fallback to default position on appropriate page
          const pageIndex = signatureField.includes("145") ? 3 : 0;
          if (pages[pageIndex]) {
            pages[pageIndex].drawImage(signatureImage, { 
              x: 100, 
              y: 100, 
              width: 200, 
              height: 50 
            });
          }
        }
      };

      // Embed all three signatures
      console.log('🔄 Embedding signatures...');
      await embedSignature(companySignatureDataUrl, "Signature144_es_:signer:signature");
      await embedSignature(witnessSignatureDataUrl, "Signature145_es_:signer:signature");
      await embedSignature(employeeSignatureDataUrl, "Signature146_es_:signer:signature");

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
      console.error('Error filling Nondisclosure/Noncompete Agreement form:', error);
      throw error;
    }
  };

  const handlePreview = async () => {
    console.log('📊 Current formData:', formData);
    
    // // Validation - Only require employee fields
    // const requiredFields = [
    //   { field: "Employee", label: "Employee Name" },
    //   { field: "Employee Address", label: "Employee Address" },
    //   { field: "Effective Date", label: "Effective Date" },
    //   { field: "Date", label: "Date" },
    //   { field: "Signature146_es_:signer:signature", label: "Employee Signature" }
    // ];

    // const missingFields = [];
    // requiredFields.forEach(({ field, label }) => {
    //   if (!formData[field] || formData[field].trim() === "") {
    //     missingFields.push(label);
    //   }
    // });

    // if (missingFields.length > 0) {
    //   showStatusModal(
    //     'error',
    //     'Missing Information',
    //     `Please fill in the following required fields: ${missingFields.join(', ')}`
    //   );
    //   return;
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
        'Your Nondisclosure/Noncompete Agreement has been submitted successfully.'
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
      case 'employee':
        return (
          <EmployeeSection
            formData={formData}
            onInputChange={handleInputChange}
            signatureDataUrl={employeeSignatureDataUrl}
            onSignatureEnd={handleEmployeeSignatureEnd}
            onClearSignature={clearEmployeeSignature}
            sigCanvasRef={employeeSigCanvasRef}
          />
        );
      case 'company':
        return (
          <CompanySection
            formData={formData}
            onInputChange={handleInputChange}
            signatureDataUrl={companySignatureDataUrl}
            onSignatureEnd={handleCompanySignatureEnd}
            onClearSignature={clearCompanySignature}
            sigCanvasRef={companySigCanvasRef}
          />
        );
      case 'witness':
        return (
          <WitnessSection
            formData={formData}
            onInputChange={handleInputChange}
            signatureDataUrl={witnessSignatureDataUrl}
            onSignatureEnd={handleWitnessSignatureEnd}
            onClearSignature={clearWitnessSignature}
            sigCanvasRef={witnessSigCanvasRef}
          />
        );
      default:
        return (
          <EmployeeSection
            formData={formData}
            onInputChange={handleInputChange}
            signatureDataUrl={employeeSignatureDataUrl}
            onSignatureEnd={handleEmployeeSignatureEnd}
            onClearSignature={clearEmployeeSignature}
            sigCanvasRef={employeeSigCanvasRef}
          />
        );
    }
  };

  // Signature status summary
  const SignatureStatus = () => (
    <div className="mt-6 p-4 border border-gray-300 rounded bg-gray-50">
      <h4 className="text-md font-semibold text-gray-800 mb-2">Signature Status:</h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`p-3 rounded border ${formData["Signature146_es_:signer:signature"] ? 'border-green-500 bg-green-50' : 'border-gray-300'}`}>
          <div className="flex items-center mb-2">
            <span className={`w-3 h-3 rounded-full mr-2 ${formData["Signature146_es_:signer:signature"] ? 'bg-green-500' : 'bg-gray-300'}`}></span>
            <span className="text-sm font-medium">Employee</span>
          </div>
          <p className="text-xs text-gray-600">
            {formData["Signature146_es_:signer:signature"] ? '✓ Signed' : 'Required - Not signed yet'}
          </p>
        </div>
        
        <div className={`p-3 rounded border ${formData["Signature144_es_:signer:signature"] ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}>
          <div className="flex items-center mb-2">
            <span className={`w-3 h-3 rounded-full mr-2 ${formData["Signature144_es_:signer:signature"] ? 'bg-blue-500' : 'bg-gray-300'}`}></span>
            <span className="text-sm font-medium">Company</span>
          </div>
          <p className="text-xs text-gray-600">
            {formData["Signature144_es_:signer:signature"] ? '✓ Signed' : 'Optional - Not signed yet'}
          </p>
        </div>
        
        <div className={`p-3 rounded border ${formData["Signature145_es_:signer:signature"] ? 'border-purple-500 bg-purple-50' : 'border-gray-300'}`}>
          <div className="flex items-center mb-2">
            <span className={`w-3 h-3 rounded-full mr-2 ${formData["Signature145_es_:signer:signature"] ? 'bg-purple-500' : 'bg-gray-300'}`}></span>
            <span className="text-sm font-medium">Witness</span>
          </div>
          <p className="text-xs text-gray-600">
            {formData["Signature145_es_:signer:signature"] ? '✓ Signed' : 'Optional - Not signed yet'}
          </p>
        </div>
      </div>
      <p className="text-xs text-gray-500 mt-3">
        Note: Only the Employee signature is required. Company and Witness signatures are optional.
      </p>
    </div>
  );

  // cleanup on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        try { URL.revokeObjectURL(previewUrl); } catch (e) { /* ignore */ }
      }
    };
  }, [previewUrl]);

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-6xl w-full max-h-[95vh] overflow-hidden">
          <div className="flex justify-between items-center p-6 border-b">
            <h2 className="text-xl font-semibold">Nondisclosure & Noncompete Agreement</h2>
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

            {/* Signature Status Summary */}
            <SignatureStatus />

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

export default NondisclosureNoncompeteForm;