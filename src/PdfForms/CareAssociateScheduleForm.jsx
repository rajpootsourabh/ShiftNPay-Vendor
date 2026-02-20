import React, { useState, useRef, useEffect } from 'react';
import { PDFDocument } from 'pdf-lib';
import axios from 'axios';
import StatusModal from './StatusModal';
import PolicySection from './sections/CareAssociateSchedule/PolicySection';
import SignatureSection from './sections/CareAssociateSchedule/SignatureSection';

const CareAssociateScheduleForm = ({ document, token, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    // Care Associate Information
    "Care Associate Print Name": "",
    "Date": "", // First date field
    "Date_2": "", // Second date field
    
    // Signatures (will be handled as "Signed" text for image embedding)
    "Signature41_es_:signer:signature": "",
    "Signature42_es_:signer:signature": ""
  });

  const [generatingPreview, setGeneratingPreview] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [filledPdfBytes, setFilledPdfBytes] = useState(null);
  const [careAssociateSignature, setCareAssociateSignature] = useState('');
  const [mastercareSignature, setMastercareSignature] = useState('');
  const [activeSection, setActiveSection] = useState('policy');
  
  // Two signature canvas refs
  const careAssociateSigCanvasRef = useRef();
  const mastercareSigCanvasRef = useRef();

  // Status modal state
  const [statusModal, setStatusModal] = useState({
    isOpen: false,
    type: 'success',
    title: '',
    message: ''
  });

  // Navigation sections
  const sections = [
    { id: 'policy', name: 'Policy Review' },
    { id: 'signature', name: 'Signatures' }
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
  const handleCareAssociateSignatureEnd = () => {
    if (careAssociateSigCanvasRef.current && !careAssociateSigCanvasRef.current.isEmpty()) {
      const signatureDataURL = careAssociateSigCanvasRef.current.toDataURL();
      setCareAssociateSignature(signatureDataURL);
      handleInputChange("Signature41_es_:signer:signature", "");
    }
  };

  const handleMastercareSignatureEnd = () => {
    if (mastercareSigCanvasRef.current && !mastercareSigCanvasRef.current.isEmpty()) {
      const signatureDataURL = mastercareSigCanvasRef.current.toDataURL();
      setMastercareSignature(signatureDataURL);
      handleInputChange("Signature42_es_:signer:signature", "");
    }
  };

  const clearCareAssociateSignature = () => {
    if (careAssociateSigCanvasRef.current) {
      careAssociateSigCanvasRef.current.clear();
      setCareAssociateSignature('');
      handleInputChange("Signature41_es_:signer:signature", "");
    }
  };

  const clearMastercareSignature = () => {
    if (mastercareSigCanvasRef.current) {
      mastercareSigCanvasRef.current.clear();
      setMastercareSignature('');
      handleInputChange("Signature42_es_:signer:signature", "");
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
  const fillPdf = async (formData, careAssociateSignature, mastercareSignature, pdfUrl) => {
    try {
      const pdfResponse = await fetch(pdfUrl);
      const pdfBuffer = await pdfResponse.arrayBuffer();
      const pdfDoc = await PDFDocument.load(pdfBuffer);
      const form = pdfDoc.getForm();

      console.log('🔄 Filling Care Associate Schedule Acknowledgement form fields...');

      // Fill all text fields
      const textFields = [
        "Care Associate Print Name",
        "Date",
        "Date_2",
        "Signature41_es_:signer:signature",
        "Signature42_es_:signer:signature"
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

      // Handle care associate signature image
      if (careAssociateSignature) {
        const signatureImageBytes = await dataURLToImageBytes(careAssociateSignature);
        if (signatureImageBytes) {
          const signatureImage = await pdfDoc.embedPng(signatureImageBytes);
          const pages = pdfDoc.getPages();

          try {
            const signatureField = form.getTextField("Signature41_es_:signer:signature");
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
            console.warn("Could not find exact care associate signature field position:", error);
            // Fallback to default position (likely top of page)
            if (pages[0]) {
              pages[0].drawImage(signatureImage, { 
                x: 100, 
                y: 300, 
                width: 150, 
                height: 50 
              });
            }
          }
        }
      }

      // Handle mastercare signature image
      if (mastercareSignature) {
        const signatureImageBytes = await dataURLToImageBytes(mastercareSignature);
        if (signatureImageBytes) {
          const signatureImage = await pdfDoc.embedPng(signatureImageBytes);
          const pages = pdfDoc.getPages();

          try {
            const signatureField = form.getTextField("Signature42_es_:signer:signature");
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
            console.warn("Could not find exact mastercare signature field position:", error);
            // Fallback to default position (likely bottom of page)
            if (pages[0]) {
              pages[0].drawImage(signatureImage, { 
                x: 100, 
                y: 150, 
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

      form.flatten();
      const filledPdfBytes = await pdfDoc.save();
      return filledPdfBytes;

    } catch (error) {
      console.error('Error filling Care Associate Schedule Acknowledgement form:', error);
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

      const bytes = await fillPdf(formData, careAssociateSignature, mastercareSignature, document.url);
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
        bytes = await fillPdf(formData, careAssociateSignature, mastercareSignature, document.url);
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
        'Your Care Associate Schedule Acknowledgement has been submitted successfully.'
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
      case 'policy':
        return (
          <PolicySection
            formData={formData}
            onInputChange={handleInputChange}
          />
        );
      case 'signature':
        return (
          <SignatureSection
            formData={formData}
            onInputChange={handleInputChange}
            careAssociateSignature={careAssociateSignature}
            mastercareSignature={mastercareSignature}
            onCareAssociateSignatureEnd={handleCareAssociateSignatureEnd}
            onMastercareSignatureEnd={handleMastercareSignatureEnd}
            onClearCareAssociateSignature={clearCareAssociateSignature}
            onClearMastercareSignature={clearMastercareSignature}
            careAssociateSigCanvasRef={careAssociateSigCanvasRef}
            mastercareSigCanvasRef={mastercareSigCanvasRef}
          />
        );
      default:
        return (
          <PolicySection
            formData={formData}
            onInputChange={handleInputChange}
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
      if (careAssociateSigCanvasRef.current) {
        try { careAssociateSigCanvasRef.current.clear(); } catch (e) { /* ignore */ }
      }
      if (mastercareSigCanvasRef.current) {
        try { mastercareSigCanvasRef.current.clear(); } catch (e) { /* ignore */ }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-6xl w-full max-h-[95vh] overflow-hidden">
          <div className="flex justify-between items-center p-6 border-b">
            <h2 className="text-xl font-semibold">Care Associate Schedule Acknowledgement</h2>
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

export default CareAssociateScheduleForm;