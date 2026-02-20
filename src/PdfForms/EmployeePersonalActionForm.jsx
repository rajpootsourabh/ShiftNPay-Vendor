import React, { useState, useRef, useEffect } from 'react';
import { PDFDocument } from 'pdf-lib';
import axios from 'axios';
import StatusModal from './StatusModal';
import NewHireSection from './sections/EmployeePersonalAction/NewHireSection';
import SeparationSection from './sections/EmployeePersonalAction/SeparationSection';
import SignatureSection from './sections/EmployeePersonalAction/SignatureSection';

const EmployeePersonalActionForm = ({ document, token, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    // New Hire Information - TEXT FIELDS
    "Last Name": "",
    "First Name": "",
    "Mail": "", // Mailing Address
    "Date of Birth": "",
    "Gender identified as": "",
    "ssn": "",
    "Date of Hire": "",
    "Position": "",
    "Pay Rate": "",
    "Resident of": "",
    "W-4 Status": "",
    "Bank Name": "",
    "Routing": "",
    "Account": "",
    "Reports To": "",
    "Hours Per Week": "",
    "State": "",
    "zipcode": "",
    
    // Separation Information - TEXT FIELDS
    "Employee Name": "",
    "ESIPosition": "",
    "Last Day Worked": "",
    "Immediate Supervisor": "",
    "ESIReason": "",
    "If Terminated Who Was the Witness": "",
    "Total Number of Hours Employee is Owed at Termination": "",
    "Inactive Date Entered": "",
    "Completed By": "",
    "ManagerHR": "",
    
    // Signature - TEXT FIELDS
    "Signature": "",
    "signature_date": "",
    "payrolldate": "",
    "Date": "", // Appears to be generic date field
    
    // ========== CHECKBOXES ==========
    // Marital Status
    "checkbox_married": false,
    "checkbox_divorced": false,
    "checkbox_single": false,
    
    // Paycheck Delivery
    "checkbox_PickupatOffice": false,
    "checkbox_DirectDeposit": false,
    
    // Account Type
    "checkbox_savings": false,
    "checkbox_checking": false,
    
    // Separation Code
    "checkbox_QuitWNotice": false,
    "checkbox_QuitNONotice": false,
    "checkbox_Terminated": false,
    "checkbox_Job Abandonment": false,
    
    // Rehire Eligibility
    "checkbox_Eligible RehireYes": false,
    "checkbox_EligibleRehireNo": false,
    
    // Administrative
    "checkbox_ReceivedbyPayroll": false,
    
    // Verify I-9 - CHECKBOX (no "checkbox_" prefix)
    "Verify I-9": false
  });

  const [generatingPreview, setGeneratingPreview] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [filledPdfBytes, setFilledPdfBytes] = useState(null);
  const [signatureDataUrl, setSignatureDataUrl] = useState('');
  const [activeSection, setActiveSection] = useState('newhire');
  const sigCanvasRef = useRef();

  // Status modal state
  const [statusModal, setStatusModal] = useState({
    isOpen: false,
    type: 'success',
    title: '',
    message: ''
  });

  // Navigation sections
  const sections = [
    { id: 'newhire', name: 'New Hire Information' },
    { id: 'separation', name: 'Separation Information' },
    { id: 'signature', name: 'Signature & Review' }
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

  const handleCheckboxChange = (fieldName, value) => {
    console.log(`🔘 Checkbox change: ${fieldName} = ${value}`);

    // Handle Verify I-9 separately (it's a regular checkbox, not mutually exclusive)
    if (fieldName === "Verify I-9") {
      setFormData(prev => ({
        ...prev,
        [fieldName]: value
      }));
      return;
    }

    // Handle mutually exclusive groups
    if (fieldName.startsWith('checkbox_')) {
      // Marital Status group
      if (['checkbox_married', 'checkbox_divorced', 'checkbox_single'].includes(fieldName)) {
        setFormData(prev => ({
          ...prev,
          checkbox_married: fieldName === 'checkbox_married' ? value : false,
          checkbox_divorced: fieldName === 'checkbox_divorced' ? value : false,
          checkbox_single: fieldName === 'checkbox_single' ? value : false,
        }));
        return;
      }

      // Paycheck Delivery group
      if (['checkbox_PickupatOffice', 'checkbox_DirectDeposit'].includes(fieldName)) {
        setFormData(prev => ({
          ...prev,
          checkbox_PickupatOffice: fieldName === 'checkbox_PickupatOffice' ? value : false,
          checkbox_DirectDeposit: fieldName === 'checkbox_DirectDeposit' ? value : false,
        }));
        return;
      }

      // Account Type group
      if (['checkbox_savings', 'checkbox_checking'].includes(fieldName)) {
        setFormData(prev => ({
          ...prev,
          checkbox_savings: fieldName === 'checkbox_savings' ? value : false,
          checkbox_checking: fieldName === 'checkbox_checking' ? value : false,
        }));
        return;
      }

      // Separation Code group
      if (fieldName === 'checkbox_QuitWNotice' || 
          fieldName === 'checkbox_QuitNONotice' || 
          fieldName === 'checkbox_Terminated' || 
          fieldName === 'checkbox_Job Abandonment') {
        const updates = {
          checkbox_QuitWNotice: false,
          checkbox_QuitNONotice: false,
          checkbox_Terminated: false,
          'checkbox_Job Abandonment': false
        };
        updates[fieldName] = value;
        setFormData(prev => ({ ...prev, ...updates }));
        return;
      }

      // Rehire Eligibility group
      if (fieldName === 'checkbox_Eligible RehireYes' || fieldName === 'checkbox_EligibleRehireNo') {
        setFormData(prev => ({
          ...prev,
          'checkbox_Eligible RehireYes': fieldName === 'checkbox_Eligible RehireYes' ? value : false,
          'checkbox_EligibleRehireNo': fieldName === 'checkbox_EligibleRehireNo' ? value : false,
        }));
        return;
      }
    }

    // For other non-mutually exclusive checkboxes (like checkbox_ReceivedbyPayroll)
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  // Signature handling
  const handleSignatureEnd = () => {
    if (sigCanvasRef.current && !sigCanvasRef.current.isEmpty()) {
      const signatureDataURL = sigCanvasRef.current.toDataURL();
      setSignatureDataUrl(signatureDataURL);
      handleInputChange("Signature", "");
    }
  };

  const clearSignature = () => {
    if (sigCanvasRef.current) {
      sigCanvasRef.current.clear();
      setSignatureDataUrl('');
      handleInputChange("Signature", "");
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

  // Auto-fill Employee Name from New Hire section
  useEffect(() => {
    if (formData["First Name"] || formData["Last Name"]) {
      const fullName = `${formData["First Name"]} ${formData["Last Name"]}`.trim();
      if (fullName) {
        handleInputChange("Employee Name", fullName);
      }
    }
  }, [formData["First Name"], formData["Last Name"]]);

  // PDF filling logic
  const fillPdf = async (formData, pdfUrl) => {
    try {
      const pdfResponse = await fetch(pdfUrl);
      const pdfBuffer = await pdfResponse.arrayBuffer();
      const pdfDoc = await PDFDocument.load(pdfBuffer);
      const form = pdfDoc.getForm();

      console.log('🔄 Filling EPAF form fields...');

      // Fill all text fields - EXACT FIELD NAMES FROM YOUR LIST
      const textFields = [
        "Last Name",
        "First Name", 
        "Mail",
        "Bank Name",
        "Account",
        "Reports To",
        "Routing",
        "Resident of",
        "Date",  // Field #9
        "W-4 Status",
        "Position",
        "Pay Rate",
        "ssn",
        "Date of Hire",
        "Date of Birth",
        "Gender identified as",
        "State",
        "zipcode",
        "Hours Per Week",
        "Employee Name",
        "ESIPosition",
        "Last Day Worked",
        "Immediate Supervisor",
        "ESIReason",
        "If Terminated Who Was the Witness",
        "Inactive Date Entered",
        "Completed By",
        "Total Number of Hours Employee is Owed at Termination",
        "ManagerHR",
        "payrolldate",
        "Signature",
        "signature_date"
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

      // Handle checkboxes - ALL CHECKBOXES FROM YOUR LIST
      const checkboxFields = [
        "checkbox_married",
        "checkbox_divorced",
        "checkbox_single",
        "checkbox_PickupatOffice",
        "checkbox_DirectDeposit",
        "checkbox_savings",
        "checkbox_checking",
        "checkbox_QuitWNotice",
        "checkbox_QuitNONotice",
        "checkbox_Terminated",
        "checkbox_Job Abandonment",
        "checkbox_Eligible RehireYes",
        "checkbox_EligibleRehireNo",
        "checkbox_ReceivedbyPayroll",
        "Verify I-9"  // Field #46 - no "checkbox_" prefix!
      ];

      checkboxFields.forEach(fieldName => {
        try {
          const field = form.getCheckBox(fieldName);
          if (field) {
            const shouldBeChecked = formData[fieldName] === true;
            console.log(`🔘 Setting checkbox ${fieldName} to: ${shouldBeChecked} (value: ${formData[fieldName]})`);
            
            if (shouldBeChecked) {
              field.check();
              console.log(`✅ Checked checkbox: ${fieldName}`);
            } else {
              field.uncheck();
              console.log(`✅ Unchecked checkbox: ${fieldName}`);
            }
          } else {
            console.log(`❌ Checkbox field not found: ${fieldName}`);
            
            // Debug: try to find the field with different variations
            try {
              const allFields = form.getFields();
              console.log(`🔍 Available fields for ${fieldName}:`, 
                allFields.map(f => f.getName()).filter(name => 
                  name.includes(fieldName.replace('checkbox_', '')) || 
                  name.includes(fieldName)
                )
              );
            } catch (e) {
              console.log(`🔍 Could not list fields for debugging: ${e.message}`);
            }
          }
        } catch (error) {
          console.log(`❌ Error setting checkbox ${fieldName}:`, error.message);
        }
      });

      // Handle signature image
      if (signatureDataUrl) {
        const signatureImageBytes = await dataURLToImageBytes(signatureDataUrl);
        if (signatureImageBytes) {
          const signatureImage = await pdfDoc.embedPng(signatureImageBytes);
          const pages = pdfDoc.getPages();

          try {
            const signatureField = form.getTextField("Signature");
            if (signatureField) {
              const widgets = signatureField.acroField.getWidgets();
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
            console.warn("Could not find exact signature field position, using default:", error);
            if (pages[0]) {
              pages[0].drawImage(signatureImage, { 
                x: 100, 
                y: 100, 
                width: 150, 
                height: 50 
              });
            }
          }
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

      // form.flatten();
      const filledPdfBytes = await pdfDoc.save();
      return filledPdfBytes;

    } catch (error) {
      console.error('Error filling Employee Personal Action Form:', error);
      throw error;
    }
  };

  // Debug useEffect
  useEffect(() => {
    console.log('🔍 Current formData checkboxes:', {
      marital: {
        married: formData.checkbox_married,
        divorced: formData.checkbox_divorced,
        single: formData.checkbox_single
      },
      paycheck: {
        pickup: formData.checkbox_PickupatOffice,
        deposit: formData.checkbox_DirectDeposit
      },
      account: {
        checking: formData.checkbox_checking,
        savings: formData.checkbox_savings
      },
      verifyI9: formData["Verify I-9"],
      separation: {
        quitWNotice: formData.checkbox_QuitWNotice,
        quitNoNotice: formData.checkbox_QuitNONotice,
        terminated: formData.checkbox_Terminated,
        jobAbandonment: formData["checkbox_Job Abandonment"]
      }
    });
  }, [formData]);

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
        'Your Employee Personal Action Form has been submitted successfully.'
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
      case 'newhire':
        return (
          <NewHireSection
            formData={formData}
            onInputChange={handleInputChange}
            onCheckboxChange={handleCheckboxChange}
          />
        );
      case 'separation':
        return (
          <SeparationSection
            formData={formData}
            onInputChange={handleInputChange}
            onCheckboxChange={handleCheckboxChange}
          />
        );
      case 'signature':
        return (
          <SignatureSection
            formData={formData}
            onInputChange={handleInputChange}
            signatureDataUrl={signatureDataUrl}
            onSignatureEnd={handleSignatureEnd}
            onClearSignature={clearSignature}
            sigCanvasRef={sigCanvasRef}
          />
        );
      default:
        return (
          <NewHireSection
            formData={formData}
            onInputChange={handleInputChange}
            onCheckboxChange={handleCheckboxChange}
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
      if (sigCanvasRef.current) {
        try { sigCanvasRef.current.clear(); } catch (e) { /* ignore */ }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-6xl w-full max-h-[95vh] overflow-hidden">
          <div className="flex justify-between items-center p-6 border-b">
            <h2 className="text-xl font-semibold">Employee Personal Action Form (EPAF)</h2>
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

export default EmployeePersonalActionForm;