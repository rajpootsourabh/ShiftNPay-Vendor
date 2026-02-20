import React, { useState, useRef, useEffect } from 'react';
import { PDFDocument } from 'pdf-lib';
import axios from 'axios';
import StatusModal from './StatusModal';
import TopicsSection from './sections/OrientationCurriculum/TopicsSection';
import VideosSection from './sections/OrientationCurriculum/VideosSection';
import SignatureSection from './sections/OrientationCurriculum/SignatureSection';

const OrientationCurriculumForm = ({ document, token, onClose, onSuccess }) => {
  // Create initial state for all 55 fields
  const initialFormData = {};
  
  // Topics (8 rows × 3 columns = 24 fields)
  for (let i = 1; i <= 8; i++) {
    initialFormData[`DateRow${i}`] = "";
    initialFormData[`Trainer InitialsRow${i}`] = "";
    initialFormData[`Employee InitialsRow${i}`] = "";
  }
  
  // Videos (8 rows × 3 columns = 24 fields, plus an extra 9th row)
  for (let i = 1; i <= 8; i++) {
    initialFormData[`DateRow${i}_2`] = "";
    initialFormData[`Trainer InitialsRow${i}_2`] = "";
    initialFormData[`Employee InitialsRow${i}_2`] = "";
  }
  
  // Extra 9th row for videos
  initialFormData[`DateRow9`] = "";
  initialFormData[`Trainer InitialsRow9`] = "";
  initialFormData[`Employee InitialsRow9`] = "";
  
  // Signature section fields
  initialFormData[`Date`] = "";
  initialFormData[`Print Name`] = "";
  initialFormData[`Position with Company`] = "";
  initialFormData[`Start Date`] = "";
  initialFormData[`Signature1_es_:signer:signature`] = "";

  const [formData, setFormData] = useState(initialFormData);
  const [generatingPreview, setGeneratingPreview] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [filledPdfBytes, setFilledPdfBytes] = useState(null);
  const [signatureDataUrl, setSignatureDataUrl] = useState('');
  const [activeSection, setActiveSection] = useState('topics');
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
    { id: 'topics', name: 'Training Topics' },
    { id: 'videos', name: 'Training Videos' },
    { id: 'signature', name: 'Signature' }
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

  // Bulk update for topic rows
  const handleTopicsBulkUpdate = (date, trainerInitials, employeeInitials) => {
    const updates = {};
    for (let i = 1; i <= 8; i++) {
      updates[`DateRow${i}`] = date;
      updates[`Trainer InitialsRow${i}`] = trainerInitials;
      updates[`Employee InitialsRow${i}`] = employeeInitials;
    }
    setFormData(prev => ({ ...prev, ...updates }));
  };

  // Bulk update for video rows
  const handleVideosBulkUpdate = (date, trainerInitials, employeeInitials) => {
    const updates = {};
    for (let i = 1; i <= 8; i++) {
      updates[`DateRow${i}_2`] = date;
      updates[`Trainer InitialsRow${i}_2`] = trainerInitials;
      updates[`Employee InitialsRow${i}_2`] = employeeInitials;
    }
    // Also update the 9th row
    updates[`DateRow9`] = date;
    updates[`Trainer InitialsRow9`] = trainerInitials;
    updates[`Employee InitialsRow9`] = employeeInitials;
    setFormData(prev => ({ ...prev, ...updates }));
  };

  // Signature handling
  const handleSignatureEnd = () => {
    if (sigCanvasRef.current && !sigCanvasRef.current.isEmpty()) {
      const signatureDataURL = sigCanvasRef.current.toDataURL();
      setSignatureDataUrl(signatureDataURL);
      handleInputChange("Signature1_es_:signer:signature", "");
    }
  };

  const clearSignature = () => {
    if (sigCanvasRef.current) {
      sigCanvasRef.current.clear();
      setSignatureDataUrl('');
      handleInputChange("Signature1_es_:signer:signature", "");
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

      console.log('🔄 Filling Orientation Curriculum form fields...');

      // Fill all text fields (all 55 fields)
      const fieldNames = [
        // Topics rows 1-8
        "DateRow1", "Trainer InitialsRow1", "Employee InitialsRow1",
        "DateRow2", "Trainer InitialsRow2", "Employee InitialsRow2",
        "DateRow3", "Trainer InitialsRow3", "Employee InitialsRow3",
        "DateRow4", "Trainer InitialsRow4", "Employee InitialsRow4",
        "DateRow5", "Trainer InitialsRow5", "Employee InitialsRow5",
        "DateRow6", "Trainer InitialsRow6", "Employee InitialsRow6",
        "DateRow7", "Trainer InitialsRow7", "Employee InitialsRow7",
        "DateRow8", "Trainer InitialsRow8", "Employee InitialsRow8",
        
        // Videos rows 1-8 (_2 suffix)
        "DateRow1_2", "Trainer InitialsRow1_2", "Employee InitialsRow1_2",
        "DateRow2_2", "Trainer InitialsRow2_2", "Employee InitialsRow2_2",
        "DateRow3_2", "Trainer InitialsRow3_2", "Employee InitialsRow3_2",
        "DateRow4_2", "Trainer InitialsRow4_2", "Employee InitialsRow4_2",
        "DateRow5_2", "Trainer InitialsRow5_2", "Employee InitialsRow5_2",
        "DateRow6_2", "Trainer InitialsRow6_2", "Employee InitialsRow6_2",
        "DateRow7_2", "Trainer InitialsRow7_2", "Employee InitialsRow7_2",
        "DateRow8_2", "Trainer InitialsRow8_2", "Employee InitialsRow8_2",
        
        // Extra 9th row
        "DateRow9", "Trainer InitialsRow9", "Employee InitialsRow9",
        
        // Signature section
        "Date", "Print Name", "Position with Company", "Start Date", "Signature1_es_:signer:signature"
      ];

      console.log('🔄 Filling text fields...');
      fieldNames.forEach(fieldName => {
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

      // Handle signature image
      if (signatureDataUrl) {
        const signatureImageBytes = await dataURLToImageBytes(signatureDataUrl);
        if (signatureImageBytes) {
          const signatureImage = await pdfDoc.embedPng(signatureImageBytes);
          const pages = pdfDoc.getPages();

          // Try to find signature field position
          try {
            const signatureField = form.getTextField("Signature1_es_:signer:signature");
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
      console.error('Error filling Orientation Curriculum form:', error);
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
        'Your Orientation Curriculum form has been submitted successfully.'
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
      case 'topics':
        return (
          <TopicsSection
            formData={formData}
            onInputChange={handleInputChange}
            onBulkUpdate={handleTopicsBulkUpdate}
          />
        );
      case 'videos':
        return (
          <VideosSection
            formData={formData}
            onInputChange={handleInputChange}
            onBulkUpdate={handleVideosBulkUpdate}
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
          <TopicsSection
            formData={formData}
            onInputChange={handleInputChange}
            onBulkUpdate={handleTopicsBulkUpdate}
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
            <h2 className="text-xl font-semibold">Orientation Curriculum</h2>
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

export default OrientationCurriculumForm;