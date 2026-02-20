// components/forms/HandbookAcknowledgmentForm.jsx
import React, { useState, useRef, useEffect } from 'react';
import { PDFDocument } from 'pdf-lib';
import axios from 'axios';
import StatusModal from './StatusModal';
import AcknowledgementSection from './sections/HandbookAcknowledgment/AcknowledgementSection';
import SignatureSection from './sections/HandbookAcknowledgment/SignatureSection';

const HandbookAcknowledgmentForm = ({ document, token, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    // Core fields
    "Date": "",
    "Print Name": "",
    "Position with Company": "",
    "Verified by": "",
    "Date_2": "",
    "Signature30_es_:signer:signature": "",
    
    // Additional field for checkbox
    "acknowledged": false
  });

  const [generatingPreview, setGeneratingPreview] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [filledPdfBytes, setFilledPdfBytes] = useState(null);
  const [signatureDataUrl, setSignatureDataUrl] = useState('');
  const [activeSection, setActiveSection] = useState('acknowledgement');
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
    { id: 'acknowledgement', name: 'Acknowledgment' },
    { id: 'signature', name: 'Signature & Verification' }
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
  const handleSignatureEnd = () => {
    if (sigCanvasRef.current && !sigCanvasRef.current.isEmpty()) {
      const signatureDataURL = sigCanvasRef.current.toDataURL();
      setSignatureDataUrl(signatureDataURL);
      handleInputChange("Signature30_es_:signer:signature", "Signed");
    }
  };

  const clearSignature = () => {
    if (sigCanvasRef.current) {
      sigCanvasRef.current.clear();
      setSignatureDataUrl('');
      handleInputChange("Signature30_es_:signer:signature", "");
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
      // Check if acknowledgment checkbox is checked
      if (!formData["acknowledged"]) {
        throw new Error("You must acknowledge the handbook terms before submitting.");
      }

      const pdfResponse = await fetch(pdfUrl);
      const pdfBuffer = await pdfResponse.arrayBuffer();
      const pdfDoc = await PDFDocument.load(pdfBuffer);
      const form = pdfDoc.getForm();

      // Fill all text fields
      const textFields = [
        "Date", "Print Name", "Position with Company", "Verified by", "Date_2"
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

      // Handle signature field
      try {
        const signatureField = form.getTextField("Signature30_es_:signer:signature");
        if (signatureField) {
          if (signatureDataUrl) {
            // Use drawn signature as image
            const signatureImageBytes = await dataURLToImageBytes(signatureDataUrl);
            if (signatureImageBytes) {
              const signatureImage = await pdfDoc.embedPng(signatureImageBytes);
              const pages = pdfDoc.getPages();
              
              // Try to find signature field position
              try {
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
                    width: rect.width || (rect.right - rect.left) || 200,
                    height: rect.height || (rect.top - rect.bottom) || 50,
                  });
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
              
              // Clear text from signature field when using drawn signature
              signatureField.setText("");
            }
          } else {
            // Use text signature
            signatureField.setText(formData["Signature30_es_:signer:signature"] || "");
          }
        }
      } catch (error) {
        console.log('❌ Error handling signature field:', error.message);
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
      console.error('Error filling Handbook Acknowledgment Form:', error);
      throw error;
    }
  };

  const handlePreview = async () => {
    console.log('📊 Current formData:', formData);
    try {
      // Validate acknowledgment
      if (!formData["acknowledged"]) {
        showStatusModal(
          'error',
          'Acknowledgment Required',
          'You must acknowledge the handbook terms before generating a preview.'
        );
        return;
      }

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
        error.message || 'Failed to generate preview. Please try again.'
      );
    } finally {
      setGeneratingPreview(false);
    }
  };

  const handleSubmit = async () => {
    try {
      // Validate acknowledgment
      if (!formData["acknowledged"]) {
        showStatusModal(
          'error',
          'Acknowledgment Required',
          'You must acknowledge the handbook terms before submitting.'
        );
        return;
      }

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
        'Your Handbook Acknowledgment form has been submitted successfully.'
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
      case 'acknowledgement':
        return (
          <AcknowledgementSection
            formData={formData}
            onInputChange={handleInputChange}
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
          <AcknowledgementSection
            formData={formData}
            onInputChange={handleInputChange}
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
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[95vh] overflow-hidden">
          <div className="flex justify-between items-center p-6 border-b">
            <h2 className="text-xl font-semibold">Fill Handbook Acknowledgment Form</h2>
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
                disabled={generatingPreview || !formData["acknowledged"]}
                className={`flex items-center justify-center gap-2 px-6 py-2 rounded-md min-w-[160px] transition-colors ${
                  !formData["acknowledged"]
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400'
                }`}
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

export default HandbookAcknowledgmentForm;