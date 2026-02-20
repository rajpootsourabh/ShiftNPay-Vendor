import React, { useState, useEffect } from 'react';
import { PDFDocument } from 'pdf-lib';
import axios from 'axios';
import StatusModal from './StatusModal';
import PersonalInfoSection from './sections/EmergencyContact/PersonalInfoSection';
import EmergencyContactsSection from './sections/EmergencyContact/EmergencyContactsSection';

const EmergencyContactForm = ({ document, token, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    // Personal Information
    "First Name": "",
    "Middle Name": "",
    "Last Name": "",
    "Nickname": "",
    "Address": "",
    "Home Phone": "",
    "Cellular Phone": "",
    "Email Address": "",
    "Drivers LicenseState ID Number": "",
    
    // Emergency Contact 1
    "Emergency Contact Name": "",
    "Relationship": "",
    "Address_2": "",
    "Phone Numbers": "",
    
    // Emergency Contact 2
    "Emergency Contact Name_2": "",
    "Relationship_2": "",
    "Address_3": "",
    "Phone Numbers_2": "",
    
    // Emergency Contact 3
    "Emergency Contact Name_3": "",
    "Relationship_3": "",
    "Address_4": "",
    "Phone Numbers_3": "",
  });

  const [generatingPreview, setGeneratingPreview] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [filledPdfBytes, setFilledPdfBytes] = useState(null);
  const [activeSection, setActiveSection] = useState('personal');

  // Status modal state
  const [statusModal, setStatusModal] = useState({
    isOpen: false,
    type: 'success',
    title: '',
    message: ''
  });

  // Navigation sections - No signature section needed
  const sections = [
    { id: 'personal', name: 'Personal Information' },
    { id: 'emergency1', name: 'Emergency Contact 1' },
    { id: 'emergency2', name: 'Emergency Contact 2' },
    { id: 'emergency3', name: 'Emergency Contact 3' }
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

  // PDF filling logic - SIMPLIFIED: No signature handling
  const fillPdf = async (formData, pdfUrl) => {
    try {
      const pdfResponse = await fetch(pdfUrl);
      const pdfBuffer = await pdfResponse.arrayBuffer();
      const pdfDoc = await PDFDocument.load(pdfBuffer);
      const form = pdfDoc.getForm();

      console.log('🔄 Filling Emergency Contact Information form fields...');

      // Fill all text fields
      const textFields = [
        "First Name", "Middle Name", "Last Name", "Nickname",
        "Address", "Home Phone", "Cellular Phone", "Email Address",
        "Drivers LicenseState ID Number", "Emergency Contact Name",
        "Relationship", "Address_2", "Phone Numbers",
        "Emergency Contact Name_2", "Relationship_2", "Address_3", "Phone Numbers_2",
        "Emergency Contact Name_3", "Relationship_3", "Address_4", "Phone Numbers_3"
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
      console.error('Error filling Emergency Contact Information form:', error);
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
        'Your Emergency Contact Information has been submitted successfully.'
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

  // Render current section - NO SIGNATURE SECTION
  const renderCurrentSection = () => {
    switch (activeSection) {
      case 'personal':
        return (
          <PersonalInfoSection
            formData={formData}
            onInputChange={handleInputChange}
          />
        );
      case 'emergency1':
        return (
          <EmergencyContactsSection
            formData={formData}
            onInputChange={handleInputChange}
            contactNumber={1}
            title="Primary Emergency Contact"
          />
        );
      case 'emergency2':
        return (
          <EmergencyContactsSection
            formData={formData}
            onInputChange={handleInputChange}
            contactNumber={2}
            title="Secondary Emergency Contact"
          />
        );
      case 'emergency3':
        return (
          <EmergencyContactsSection
            formData={formData}
            onInputChange={handleInputChange}
            contactNumber={3}
            title="Tertiary Emergency Contact"
          />
        );
      default:
        return (
          <PersonalInfoSection
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
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-6xl w-full max-h-[95vh] overflow-hidden">
          <div className="flex justify-between items-center p-6 border-b">
            <h2 className="text-xl font-semibold">Emergency Contact Information</h2>
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

export default EmergencyContactForm;