import React, { useState, useRef, useEffect } from 'react';
import { PDFDocument } from 'pdf-lib';
import axios from 'axios';
import StatusModal from './StatusModal';
import ConsentSection from './sections/HepatitisB/ConsentSection';
import DeclinationSection from './sections/HepatitisB/DeclinationSection';

const HepatitisBConsentForm = ({ document, token, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    // Consent Section
    "I elect to receive the Hepatitis B vaccine": false,
    "I have received the Hepatitis B Vaccine Series": false,
    "Medical proof of vaccination  Proof of immunity Attach results": true,
    "Dates1": "",
    "Dates2": "",
    "Dates3": "",
    
    // Declination Section
    "I decline the Hepatitis B Vaccine and understand I can receive it at any time in the future": false,
    
    // Common Fields
    "Date": "",
    "Date_2": "",
    "Signature124_es_:signer:signature": "",
    "Signature125_es_:signer:signature": ""
  });

  const [generatingPreview, setGeneratingPreview] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [filledPdfBytes, setFilledPdfBytes] = useState(null);
  const [signatureDataUrl, setSignatureDataUrl] = useState('');
  const [activeSection, setActiveSection] = useState('consent');
  const [consentChoice, setConsentChoice] = useState(''); // 'consent', 'decline', or 'alreadyVaccinated'
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
    { id: 'consent', name: 'Vaccine Consent' },
    { id: 'declination', name: 'Vaccine Declination' }
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

  const handleCheckboxChange = (fieldName, checked) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: checked
    }));

    // Handle mutual exclusivity
    if (fieldName === "I elect to receive the Hepatitis B vaccine" && checked) {
      setFormData(prev => ({
        ...prev,
        "I decline the Hepatitis B Vaccine and understand I can receive it at any time in the future": false,
        "I have received the Hepatitis B Vaccine Series": false
      }));
      setConsentChoice('consent');
    } else if (fieldName === "I decline the Hepatitis B Vaccine and understand I can receive it at any time in the future" && checked) {
      setFormData(prev => ({
        ...prev,
        "I elect to receive the Hepatitis B vaccine": false,
        "I have received the Hepatitis B Vaccine Series": false
      }));
      setConsentChoice('decline');
    } else if (fieldName === "I have received the Hepatitis B Vaccine Series" && checked) {
      setFormData(prev => ({
        ...prev,
        "I elect to receive the Hepatitis B vaccine": false,
        "I decline the Hepatitis B Vaccine and understand I can receive it at any time in the future": false
      }));
      setConsentChoice('alreadyVaccinated');
    }
  };

  // Signature handling
  const handleSignatureEnd = () => {
    if (sigCanvasRef.current && !sigCanvasRef.current.isEmpty()) {
      const signatureDataURL = sigCanvasRef.current.toDataURL();
      setSignatureDataUrl(signatureDataURL);
      
      // Set signature text based on active section
      if (activeSection === 'consent') {
        handleInputChange("Signature124_es_:signer:signature", "");
      } else {
        handleInputChange("Signature125_es_:signer:signature", "");
      }
    }
  };

  const clearSignature = () => {
    if (sigCanvasRef.current) {
      sigCanvasRef.current.clear();
      setSignatureDataUrl('');
      
      // Clear signature text based on active section
      if (activeSection === 'consent') {
        handleInputChange("Signature124_es_:signer:signature", "");
      } else {
        handleInputChange("Signature125_es_:signer:signature", "");
      }
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
// PDF filling logic
const fillPdf = async (formData, pdfUrl) => {
  try {
    const pdfResponse = await fetch(pdfUrl);
    const pdfBuffer = await pdfResponse.arrayBuffer();
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    const form = pdfDoc.getForm();

    console.log('🔄 Filling Hepatitis B Consent/Declination form fields...');
    
    // DEBUG: List all available fields in the PDF
    console.log('📋 All available PDF fields:', form.getFields().map(f => f.getName()));

    // Fill checkboxes - USE .check()/.uncheck() INSTEAD OF .setValue()
    console.log('🔄 Filling checkbox fields...');
    
    // Handle "I elect to receive the Hepatitis B vaccine" checkbox
    try {
      const consentCheckbox = form.getCheckBox("I elect to receive the Hepatitis B vaccine");
      if (consentCheckbox) {
        if (formData["I elect to receive the Hepatitis B vaccine"]) {
          consentCheckbox.check();
          console.log(`✅ Checked: I elect to receive the Hepatitis B vaccine`);
        } else {
          consentCheckbox.uncheck();
          console.log(`✅ Unchecked: I elect to receive the Hepatitis B vaccine`);
        }
      } else {
        console.log(`❌ Checkbox field not found: I elect to receive the Hepatitis B vaccine`);
      }
    } catch (error) {
      console.log(`❌ Error with consent checkbox:`, error.message);
    }

    // Handle "I have received the Hepatitis B Vaccine Series" checkbox
    try {
      const vaccinatedCheckbox = form.getCheckBox("I have received the Hepatitis B Vaccine Series");
      if (vaccinatedCheckbox) {
        if (formData["I have received the Hepatitis B Vaccine Series"]) {
          vaccinatedCheckbox.check();
          console.log(`✅ Checked: I have received the Hepatitis B Vaccine Series`);
        } else {
          vaccinatedCheckbox.uncheck();
          console.log(`✅ Unchecked: I have received the Hepatitis B Vaccine Series`);
        }
      } else {
        console.log(`❌ Checkbox field not found: I have received the Hepatitis B Vaccine Series`);
      }
    } catch (error) {
      console.log(`❌ Error with vaccinated checkbox:`, error.message);
    }

    // Handle "Medical proof of vaccination / Proof of immunity (Attach results.)" checkbox
    // Note: Field name might be different - check the exact name from debug output
    try {
      // Try a few possible field name variations
      let proofCheckbox = form.getCheckBox("Medical proof of vaccination  Proof of immunity Attach results");
      if (!proofCheckbox) {
        // Try alternative names
        proofCheckbox = form.getCheckBox("Medical proof of vaccination / Proof of immunity (Attach results.)");
      }
      if (!proofCheckbox) {
        proofCheckbox = form.getCheckBox("Medical proof of vaccination");
      }
      
      if (proofCheckbox) {
        if (formData["Medical proof of vaccination  Proof of immunity Attach results"]) {
          proofCheckbox.check();
          console.log(`✅ Checked: Medical proof of vaccination`);
        } else {
          proofCheckbox.uncheck();
          console.log(`✅ Unchecked: Medical proof of vaccination`);
        }
      } else {
        console.log(`⚠️ Checkbox field not found for Medical proof of vaccination`);
      }
    } catch (error) {
      console.log(`❌ Error with proof checkbox:`, error.message);
    }

    // Handle "I decline the Hepatitis B Vaccine and understand I can receive it at any time in the future" checkbox
    try {
      const declineCheckbox = form.getCheckBox("I decline the Hepatitis B Vaccine and understand I can receive it at any time in the future");
      if (declineCheckbox) {
        if (formData["I decline the Hepatitis B Vaccine and understand I can receive it at any time in the future"]) {
          declineCheckbox.check();
          console.log(`✅ Checked: I decline the Hepatitis B Vaccine...`);
        } else {
          declineCheckbox.uncheck();
          console.log(`✅ Unchecked: I decline the Hepatitis B Vaccine...`);
        }
      } else {
        console.log(`❌ Checkbox field not found: I decline the Hepatitis B Vaccine...`);
      }
    } catch (error) {
      console.log(`❌ Error with decline checkbox:`, error.message);
    }

    // Fill text fields
    console.log('🔄 Filling text fields...');
    const textFields = [
      "Date", "Date_2", "Dates1", "Dates2", "Dates3",
      "Signature124_es_:signer:signature", "Signature125_es_:signer:signature"
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

    // Handle signature images
    if (signatureDataUrl) {
      const signatureImageBytes = await dataURLToImageBytes(signatureDataUrl);
      if (signatureImageBytes) {
        const signatureImage = await pdfDoc.embedPng(signatureImageBytes);
        const pages = pdfDoc.getPages();

        // Try to find and place signature on appropriate section
        const signatureField = activeSection === 'consent' 
          ? "Signature124_es_:signer:signature" 
          : "Signature125_es_:signer:signature";

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
            }
          }
        } catch (error) {
          console.warn("Could not find exact signature field position, using default:", error);
          // Fallback to default position
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
    console.error('Error filling Hepatitis B Consent/Declination form:', error);
    throw error;
  }
};

  const handlePreview = async () => {
    console.log('📊 Current formData:', formData);
    
    // Validation
    // const hasConsent = formData["I elect to receive the Hepatitis B vaccine"];
    // const hasDeclined = formData["I decline the Hepatitis B Vaccine and understand I can receive it at any time in the future"];
    // const hasVaccinated = formData["I have received the Hepatitis B Vaccine Series"];
    
    // if (!hasConsent && !hasDeclined && !hasVaccinated) {
    //   showStatusModal(
    //     'error',
    //     'Selection Required',
    //     'Please select either consent to vaccination, declination, or indicate you are already vaccinated.'
    //   );
    //   return;
    // }

    // if (hasVaccinated && (!formData["Dates1"] || !formData["Dates2"] || !formData["Dates3"])) {
    //   showStatusModal(
    //     'error',
    //     'Dates Required',
    //     'Please provide all three vaccination dates if you have already received the vaccine series.'
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
        'Your Hepatitis B Consent/Declination form has been submitted successfully.'
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
      case 'consent':
        return (
          <ConsentSection
            formData={formData}
            onInputChange={handleInputChange}
            onCheckboxChange={handleCheckboxChange}
            signatureDataUrl={signatureDataUrl}
            onSignatureEnd={handleSignatureEnd}
            onClearSignature={clearSignature}
            sigCanvasRef={sigCanvasRef}
            consentChoice={consentChoice}
          />
        );
      case 'declination':
        return (
          <DeclinationSection
            formData={formData}
            onInputChange={handleInputChange}
            onCheckboxChange={handleCheckboxChange}
            signatureDataUrl={signatureDataUrl}
            onSignatureEnd={handleSignatureEnd}
            onClearSignature={clearSignature}
            sigCanvasRef={sigCanvasRef}
            consentChoice={consentChoice}
          />
        );
      default:
        return (
          <ConsentSection
            formData={formData}
            onInputChange={handleInputChange}
            onCheckboxChange={handleCheckboxChange}
            signatureDataUrl={signatureDataUrl}
            onSignatureEnd={handleSignatureEnd}
            onClearSignature={clearSignature}
            sigCanvasRef={sigCanvasRef}
            consentChoice={consentChoice}
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
            <h2 className="text-xl font-semibold">Hepatitis B Vaccine Consent/Declination</h2>
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

            {/* Status Summary */}
            <div className="mt-6 p-4 border border-gray-300 rounded bg-gray-50">
              <h4 className="text-md font-semibold text-gray-800 mb-2">Current Selection:</h4>
              <div className="flex flex-wrap gap-4">
                <div className={`px-3 py-1 rounded-full text-sm ${consentChoice === 'consent' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                  {consentChoice === 'consent' ? '✓ Consent to Vaccine' : 'Consent to Vaccine'}
                </div>
                <div className={`px-3 py-1 rounded-full text-sm ${consentChoice === 'alreadyVaccinated' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'}`}>
                  {consentChoice === 'alreadyVaccinated' ? '✓ Already Vaccinated' : 'Already Vaccinated'}
                </div>
                <div className={`px-3 py-1 rounded-full text-sm ${consentChoice === 'decline' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-600'}`}>
                  {consentChoice === 'decline' ? '✓ Decline Vaccine' : 'Decline Vaccine'}
                </div>
              </div>
            </div>

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

export default HepatitisBConsentForm;