import React, { useState, useRef, useEffect } from 'react';
import { PDFDocument } from 'pdf-lib';
import axios from 'axios';
import StatusModal from './StatusModal';
import ConsentSection from './sections/PreEmploymentDrug/ConsentSection';

const PreEmploymentDrugConsentForm = ({ document, token, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    // Applicant Information
    "Print Name": "",
    "Date": "",
    
    // Witness Information
    "Print Name_2": "",
    "Date_2": "",
    
    // Results (optional field)
    "Results": "",
    
    // Signatures
    "Signature134_es_:signer:signature": "",
    "Signature135_es_:signer:signature": ""
  });

  const [generatingPreview, setGeneratingPreview] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [filledPdfBytes, setFilledPdfBytes] = useState(null);
  const [applicantSignatureUrl, setApplicantSignatureUrl] = useState('');
  const [witnessSignatureUrl, setWitnessSignatureUrl] = useState('');
  const [activeSignature, setActiveSignature] = useState('applicant'); // 'applicant' or 'witness'
  const applicantSigCanvasRef = useRef();
  const witnessSigCanvasRef = useRef();

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

  // Signature handling
  const handleSignatureEnd = (type) => {
    let canvasRef, signatureField, signatureUrlSetter;
    
    if (type === 'applicant') {
      canvasRef = applicantSigCanvasRef;
      signatureField = "Signature134_es_:signer:signature";
      signatureUrlSetter = setApplicantSignatureUrl;
    } else {
      canvasRef = witnessSigCanvasRef;
      signatureField = "Signature135_es_:signer:signature";
      signatureUrlSetter = setWitnessSignatureUrl;
    }
    
    if (canvasRef.current && !canvasRef.current.isEmpty()) {
      const signatureDataURL = canvasRef.current.toDataURL();
      signatureUrlSetter(signatureDataURL);
      handleInputChange(signatureField, "");
    }
  };

  const clearSignature = (type) => {
    let canvasRef, signatureField, signatureUrlSetter;
    
    if (type === 'applicant') {
      canvasRef = applicantSigCanvasRef;
      signatureField = "Signature134_es_:signer:signature";
      signatureUrlSetter = setApplicantSignatureUrl;
    } else {
      canvasRef = witnessSigCanvasRef;
      signatureField = "Signature135_es_:signer:signature";
      signatureUrlSetter = setWitnessSignatureUrl;
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

      console.log('🔄 Filling Pre-Employment Drug Consent form fields...');

      // Fill text fields
      console.log('🔄 Filling text fields...');
      const textFields = [
        "Print Name", "Date", "Print Name_2", "Date_2", "Results"
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

      // Handle applicant signature image
      if (applicantSignatureUrl) {
        const signatureImageBytes = await dataURLToImageBytes(applicantSignatureUrl);
        if (signatureImageBytes) {
          const signatureImage = await pdfDoc.embedPng(signatureImageBytes);
          const pages = pdfDoc.getPages();

          try {
            const signatureField = form.getTextField("Signature134_es_:signer:signature");
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
            console.warn("Could not find applicant signature field position:", error);
          }
        }
      }

      // Handle witness signature image
      if (witnessSignatureUrl) {
        const signatureImageBytes = await dataURLToImageBytes(witnessSignatureUrl);
        if (signatureImageBytes) {
          const signatureImage = await pdfDoc.embedPng(signatureImageBytes);
          const pages = pdfDoc.getPages();

          try {
            const signatureField = form.getTextField("Signature135_es_:signer:signature");
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
            console.warn("Could not find witness signature field position:", error);
          }
        }
      }

      // Set signature text fields
      const signatureTextFields = [
        "Signature134_es_:signer:signature",
        "Signature135_es_:signer:signature"
      ];

      signatureTextFields.forEach(fieldName => {
        try {
          const field = form.getTextField(fieldName);
          if (field) {
            field.setText(formData[fieldName] || "");
          }
        } catch (error) {
          console.log(`Error setting signature text field ${fieldName}:`, error.message);
        }
      });

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
      console.error('Error filling Pre-Employment Drug Consent form:', error);
      throw error;
    }
  };

  const handlePreview = async () => {
    console.log('📊 Current formData:', formData);
    
    // // Validation
    // if (!formData["Print Name"]) {
    //   showStatusModal(
    //     'error',
    //     'Missing Information',
    //     'Please enter your printed name.'
    //   );
    //   return;
    // }

    // if (!formData["Date"]) {
    //   showStatusModal(
    //     'error',
    //     'Missing Information',
    //     'Please enter the date.'
    //   );
    //   return;
    // }

    // if (!applicantSignatureUrl) {
    //   showStatusModal(
    //     'error',
    //     'Signature Required',
    //     'Please provide your signature as the applicant.'
    //   );
    //   return;
    // }

    // if (!formData["Print Name_2"]) {
    //   showStatusModal(
    //     'error',
    //     'Missing Information',
    //     'Please enter the witness printed name.'
    //   );
    //   return;
    // }

    // if (!formData["Date_2"]) {
    //   showStatusModal(
    //     'error',
    //     'Missing Information',
    //     'Please enter the witness date.'
    //   );
    //   return;
    // }

    // if (!witnessSignatureUrl) {
    //   showStatusModal(
    //     'error',
    //     'Signature Required',
    //     'Please provide the witness signature.'
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
        'Your Pre-Employment Drug/Alcohol Testing Consent has been submitted successfully.'
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
      if (applicantSigCanvasRef.current) {
        try { applicantSigCanvasRef.current.clear(); } catch (e) { /* ignore */ }
      }
      if (witnessSigCanvasRef.current) {
        try { witnessSigCanvasRef.current.clear(); } catch (e) { /* ignore */ }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-6xl w-full max-h-[95vh] overflow-hidden">
          <div className="flex justify-between items-center p-6 border-b">
            <h2 className="text-xl font-semibold">Pre-Employment Drug/Alcohol Testing Consent</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">✕</button>
          </div>

          <div className="p-6 overflow-y-auto max-h-[85vh]">
            {/* Single Section for all content */}
            <ConsentSection
              formData={formData}
              onInputChange={handleInputChange}
              applicantSignatureUrl={applicantSignatureUrl}
              witnessSignatureUrl={witnessSignatureUrl}
              onApplicantSignatureEnd={() => handleSignatureEnd('applicant')}
              onWitnessSignatureEnd={() => handleSignatureEnd('witness')}
              onClearApplicantSignature={() => clearSignature('applicant')}
              onClearWitnessSignature={() => clearSignature('witness')}
              applicantSigCanvasRef={applicantSigCanvasRef}
              witnessSigCanvasRef={witnessSigCanvasRef}
              activeSignature={activeSignature}
              setActiveSignature={setActiveSignature}
            />

            {/* Signature Status */}
            <div className="mt-6 p-4 border border-gray-300 rounded bg-gray-50">
              <h4 className="text-md font-semibold text-gray-800 mb-2">Signature Status:</h4>
              <div className="flex flex-wrap gap-4">
                <div className={`px-3 py-1 rounded-full text-sm ${applicantSignatureUrl ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {applicantSignatureUrl ? '✓ Applicant Signed' : 'Applicant Signature Required'}
                </div>
                <div className={`px-3 py-1 rounded-full text-sm ${witnessSignatureUrl ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {witnessSignatureUrl ? '✓ Witness Signed' : 'Witness Signature Required'}
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

export default PreEmploymentDrugConsentForm;