import React, { useState, useRef, useEffect } from 'react';
import { PDFDocument } from 'pdf-lib';
import SignatureCanvas from 'react-signature-canvas';
import axios from 'axios';

// Import section components
import PersonalInformationSection from './sections/EmploymentApplication/PersonalInformationSection';
import PositionInformationSection from './sections/EmploymentApplication/PositionInformationSection';
import WorkPreferencesSection from './sections/EmploymentApplication/WorkPreferencesSection';
import EducationSection from './sections/EmploymentApplication/EducationSection';
import EmploymentHistorySection from './sections/EmploymentApplication/EmploymentHistorySection';
import ProfessionalReferencesSection from './sections/EmploymentApplication/ProfessionalReferencesSection';
import SignatureSection from './sections/EmploymentApplication/SignatureSection';
import StatusModal from './StatusModal';
import AwardsCertificationsSection from './sections/EmploymentApplication/AwardsCertificationsSection';

const EmploymentApplicationForm = ({ document, token, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    // Personal Information
    "Name": "",
    "Date": "",
    "Address": "",
    "City": "",
    "State": "",
    "Zip": "",
    "Email Address": "",
    "Phone": "",

    // Position Information
    "Position": "",
    "Location Preference": "",
    "Salary Desired": "",
    "How many hours can you work weekly": "",
    "When would you be available to begin work": "",

    // Work Preferences
    "No Preference": false,
    "Monday": false,
    "Tuesday": false,
    "Wednesday": false,
    "Thursday": false,
    "Friday": false,
    "Saturday": false,
    "Sunday": false,
    "Full Time Only": false,
    "Part Time Only": false,
    "Full or Part Time": false,
    "Nights Yes": false,
    "Nights No": false,
    "Work US Yes": false,
    "Work US No": false,
    "Test Yes": false,
    "Test No": false,
    "Accommodation Yes": false,
    "Accommodation No": false,
    "reasonable accommodation If no describe what accommodations you would need 1": "",

    // Education
    "NAME OF SCHOOLHigh School": "",
    "LOCATIONHigh School": "",
    "NO OF YEARS COMPLETEDHigh School": "",
    "MAJOR OR DEGREEHigh School": "",
    "NAME OF SCHOOLCollege": "",
    "LOCATIONCollege": "",
    "NO OF YEARS COMPLETEDCollege": "",
    "MAJOR OR DEGREECollege": "",
    "NAME OF SCHOOLCollege_2": "",
    "LOCATIONCollege_2": "",
    "NO OF YEARS COMPLETEDCollege_2": "",
    "MAJOR OR DEGREECollege_2": "",
    "NAME OF SCHOOLOther": "",
    "LOCATIONOther": "",
    "NO OF YEARS COMPLETEDOther": "",
    "MAJOR OR DEGREEOther": "",

    // Employment History
    "Name of Employer": "",
    "EMPLOYMENT FROM": "",
    "EMPLOYMENT TO": "",
    "COMPLETE ADDRESS": "",
    "PHONE NUMBER": "",
    "NAME OF SUPERVISOR": "",
    "MAY WE CONTACT FOR REFERENCES": false,
    "NO_5": false,
    "YOUR LAST JOB TITLE": "",
    "REASON FOR LEAVING PLEASE BE SPECIFIC": "",
    "PLEASE LIST THE JOB DUTIES OF YOUR POSITION WITH THIS COMPANYRow1": "",

    "2 NAME OF EMPLOYER": "",
    "EMPLOYMENT DATES FROM_2": "",
    "EMPLOYMENT DATES TO_2": "",
    "COMPLETE ADDRESS_2": "",
    "PHONE NUMBER_2": "",
    "NAME OF SUPERVISOR_2": "",
    "MAY WE CONTACT FOR REFERENCES_2": false,
    "NO_6": false,
    "YOUR LAST JOB TITLE_2": "",
    "REASON FOR LEAVING PLEASE BE SPECIFIC_2": "",
    "PLEASE LIST THE JOB DUTIES OF YOUR POSITION WITH THIS COMPANYRow1_2": "",

    "3 NAME OF EMPLOYER": "",
    "EMPLOYMENT DATES FROM_3": "",
    "EMPLOYMENT DATES TO_3": "",
    "COMPLETE ADDRESS_3": "",
    "PHONE NUMBER_3": "",
    "NAME OF SUPERVISOR_3": "",
    "MAY WE CONTACT FOR REFERENCES_3": false,
    "NO_7": false,
    "YOUR LAST JOB TITLE_3": "",
    "REASON FOR LEAVING PLEASE BE SPECIFIC_3": "",
    "PLEASE LIST THE JOB DUTIES OF YOUR POSITION WITH THIS COMPANYRow1_3": "",

    // Professional References
    "Prof Name_1": "",
    "Prof Company_1": "",
    "Prof Telephone_1": "",
    "Prof Years_1": "",
    "Prof Name_2": "",
    "Prof Company_2": "",
    "Prof Telephone_2": "",
    "Prof Years_2": "",
    "Prof Name_3": "",
    "Prof Company_3": "",
    "Prof Telephone_3": "",
    "Prof Years_3": "",

    // Additional Information
    "1": "",
    "2": "",
    "3": "",
    "4": "",
    "5": "",
    "6": "",
    "Please use this space for any additional information you would like to provide that may assist us in the hiring process 1": "",

    // Signature
    "Date_2": "",
    "Date_3": "",
    "Signature1_es_:signer:signature": "",
    "Signature2_es_:signer:signature": ""
  });

  const [generatingPreview, setGeneratingPreview] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [filledPdfBytes, setFilledPdfBytes] = useState(null); // store bytes to avoid re-fetching preview URL
  const [signatureDataUrl, setSignatureDataUrl] = useState('');
  const [signatureType, setSignatureType] = useState('text');
  const [activeSection, setActiveSection] = useState('personal');
  const sigCanvasRef = useRef();

  // Status modal state
  const [statusModal, setStatusModal] = useState({
    isOpen: false,
    type: 'success', // 'success' or 'error'
    title: '',
    message: ''
  });

  // Navigation sections
  const sections = [
    { id: 'personal', name: 'Personal Info' },
    { id: 'position', name: 'Position' },
    { id: 'work', name: 'Work Preferences' },
    { id: 'education', name: 'Education' },
    { id: 'employment', name: 'Employment History' },
    { id: 'awards', name: 'Awards & Certifications' },
    { id: 'references', name: 'References' },
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

  const handleCheckboxChange = (fieldName, checked) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: checked
    }));
  };

  // Signature handling functions
  const handleSignatureEnd = () => {
    if (sigCanvasRef.current && !sigCanvasRef.current.isEmpty()) {
      const signatureDataURL = sigCanvasRef.current.toDataURL();
      setSignatureDataUrl(signatureDataURL);
      handleInputChange("Signature1_es_:signer:signature", "Signed");
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

  // Function to get signature field position
  const getSignatureFieldPosition = async (pdfDoc) => {
    try {
      const form = pdfDoc.getForm();

      // Look for both signature fields
      const signatureFields = [
        "Signature1_es_:signer:signature",
        "Signature2_es_:signer:signature"
      ];

      let signatureField = null;
      let foundFieldName = "";

      for (const fieldName of signatureFields) {
        try {
          signatureField = form.getTextField(fieldName);
          if (signatureField) {
            foundFieldName = fieldName;
            break;
          }
        } catch (error) {
          // ignore not-found
        }
      }

      if (!signatureField) return null;

      const widgets = signatureField.acroField.getWidgets();

      for (let widget of widgets) {
        const rect = widget.getRectangle();
        const pageRef = widget.P();

        if (pageRef) {
          const pages = pdfDoc.getPages();
          let pageIndex = -1;

          for (let i = 0; i < pages.length; i++) {
            if (pages[i].ref === pageRef) {
              pageIndex = i;
              break;
            }
          }

          if (pageIndex !== -1) {
            return {
              ...rect,
              pageIndex: pageIndex,
              fieldName: foundFieldName
            };
          }
        }
      }

      if (widgets.length > 0) {
        const rect = widgets[0].getRectangle();
        return {
          ...rect,
          pageIndex: 1,
          fieldName: foundFieldName
        };
      }
    } catch (error) {
      console.warn("Could not get signature field position:", error);
    }

    return { x: 100, y: 600, width: 200, height: 50, pageIndex: 1 };
  };

  // Updated PDF filling logic with all new fields
  const fillPdf = async (formData, pdfUrl) => {
    try {
      const pdfResponse = await fetch(pdfUrl);
      const pdfBuffer = await pdfResponse.arrayBuffer();
      const pdfDoc = await PDFDocument.load(pdfBuffer);
      const form = pdfDoc.getForm();

      // Fill all text fields
      const textFields = [
        "Name", "Date", "Address", "City", "State", "Zip", "Email Address", "Phone",
        "Position", "Location Preference", "Salary Desired", "How many hours can you work weekly",
        "When would you be available to begin work", "reasonable accommodation If no describe what accommodations you would need 1",
        // Education
        "NAME OF SCHOOLHigh School", "LOCATIONHigh School", "NO OF YEARS COMPLETEDHigh School", "MAJOR OR DEGREEHigh School",
        "NAME OF SCHOOLCollege", "LOCATIONCollege", "NO OF YEARS COMPLETEDCollege", "MAJOR OR DEGREECollege",
        "NAME OF SCHOOLCollege_2", "LOCATIONCollege_2", "NO OF YEARS COMPLETEDCollege_2", "MAJOR OR DEGREECollege_2",
        "NAME OF SCHOOLOther", "LOCATIONOther", "NO OF YEARS COMPLETEDOther", "MAJOR OR DEGREEOther",
        // Employment
        "Name of Employer", "EMPLOYMENT FROM", "EMPLOYMENT TO", "COMPLETE ADDRESS", "PHONE NUMBER", "NAME OF SUPERVISOR",
        "YOUR LAST JOB TITLE", "REASON FOR LEAVING PLEASE BE SPECIFIC", "PLEASE LIST THE JOB DUTIES OF YOUR POSITION WITH THIS COMPANYRow1",
        "2 NAME OF EMPLOYER", "EMPLOYMENT DATES FROM_2", "EMPLOYMENT DATES TO_2", "COMPLETE ADDRESS_2", "PHONE NUMBER_2", "NAME OF SUPERVISOR_2",
        "YOUR LAST JOB TITLE_2", "REASON FOR LEAVING PLEASE BE SPECIFIC_2", "PLEASE LIST THE JOB DUTIES OF YOUR POSITION WITH THIS COMPANYRow1_2",
        "3 NAME OF EMPLOYER", "EMPLOYMENT DATES FROM_3", "EMPLOYMENT DATES TO_3", "COMPLETE ADDRESS_3", "PHONE NUMBER_3", "NAME OF SUPERVISOR_3",
        "YOUR LAST JOB TITLE_3", "REASON FOR LEAVING PLEASE BE SPECIFIC_3", "PLEASE LIST THE JOB DUTIES OF YOUR POSITION WITH THIS COMPANYRow1_3",
        // References
        "Prof Name_1", "Prof Company_1", "Prof Telephone_1", "Prof Years_1",
        "Prof Name_2", "Prof Company_2", "Prof Telephone_2", "Prof Years_2",
        "Prof Name_3", "Prof Company_3", "Prof Telephone_3", "Prof Years_3",
        // Additional
        "1", "2", "3", "4", "5", "6",
        "Please use this space for any additional information you would like to provide that may assist us in the hiring process 1",
        // Signature dates
        "Date_2", "Date_3"
      ];

      textFields.forEach(fieldName => {
        try {
          const field = form.getTextField(fieldName);
          if (field) {
            field.setText(formData[fieldName] || "");
          }
        } catch (error) {
          // ignore missing fields
        }
      });

      // Fill checkbox fields
      const checkboxFields = [
        "No Preference", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday",
        "Full Time Only", "Part Time Only", "Full or Part Time",
        "Nights Yes", "Nights No", "Work US Yes", "Work US No", "Test Yes", "Test No",
        "Accommodation Yes", "Accommodation No",
        "MAY WE CONTACT FOR REFERENCES", "NO_5", "MAY WE CONTACT FOR REFERENCES_2", "NO_6",
        "MAY WE CONTACT FOR REFERENCES_3", "NO_7"
      ];

      checkboxFields.forEach(fieldName => {
        try {
          const field = form.getCheckBox(fieldName);
          if (field) {
            if (formData[fieldName] === true) {
              field.check();
            } else {
              field.uncheck();
            }
          }
        } catch (error) {
          // ignore missing checkboxes
        }
      });

      // Handle signature based on type
      if (signatureType === "text") {
        const signatureFields = ["Signature1_es_:signer:signature", "Signature2_es_:signer:signature"];
        signatureFields.forEach(fieldName => {
          try {
            const field = form.getTextField(fieldName);
            if (field) {
              field.setText(formData["Signature1_es_:signer:signature"] || "");
            }
          } catch (error) {
            // ignore
          }
        });
      } else {
        // Use drawn signature - embed as image at exact field positions for BOTH signature fields
        if (signatureDataUrl) {
          const signatureImageBytes = await dataURLToImageBytes(signatureDataUrl);
          if (signatureImageBytes) {
            const signatureImage = await pdfDoc.embedPng(signatureImageBytes);
            const pages = pdfDoc.getPages();

            const signatureFieldsToTry = [
              "Signature1_es_:signer:signature",
              "Signature2_es_:signer:signature"
            ];

            const signaturePositions = [];

            for (const sfn of signatureFieldsToTry) {
              try {
                const field = form.getTextField(sfn);
                if (!field) continue;
                const widgets = field.acroField.getWidgets();
                if (!widgets || widgets.length === 0) continue;
                const rect = widgets[0].getRectangle();
                const pageRef = widgets[0].P();
                let pageIndex = 0;
                for (let i = 0; i < pages.length; i++) {
                  if (pages[i].ref === pageRef) {
                    pageIndex = i;
                    break;
                  }
                }
                signaturePositions.push({
                  x: rect.x ?? rect.left ?? 100,
                  y: rect.y ?? rect.bottom ?? 600,
                  width: rect.width ?? (rect.right - rect.left) ?? 200,
                  height: rect.height ?? (rect.top - rect.bottom) ?? 50,
                  pageIndex,
                  fieldName: sfn
                });
              } catch (err) {
                // ignore per-field errors
              }
            }

            // Draw signature at found positions
            if (signaturePositions.length > 0) {
              signaturePositions.forEach(position => {
                const page = pages[position.pageIndex] || pages[0];
                if (!page) return;
                page.drawImage(signatureImage, {
                  x: position.x,
                  y: position.y,
                  width: position.width,
                  height: position.height,
                });
              });
            } else {
              // fallbacks
              if (pages[1]) {
                pages[1].drawImage(signatureImage, { x: 100, y: 600, width: 200, height: 50 });
              } else if (pages[0]) {
                pages[0].drawImage(signatureImage, { x: 100, y: 600, width: 200, height: 50 });
              }
            }
          }
        }

        // Clear both signature text fields when using drawn signature
        const signatureTextFields = ["Signature1_es_:signer:signature", "Signature2_es_:signer:signature"];
        signatureTextFields.forEach(fieldName => {
          try {
            const field = form.getTextField(fieldName);
            if (field) {
              field.setText("");
            }
          } catch (error) {
            // ignore
          }
        });
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
      console.error('Error filling Employment Application:', error);
      throw error;
    }
  };

  const handlePreview = async () => {
    try {
      setGeneratingPreview(true);

      // revoke old preview to avoid leaks
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

      // use stored bytes if available, otherwise regenerate
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

      // success
      showStatusModal(
        'success',
        'Document Submitted Successfully!',
        'Your employment application has been submitted successfully.'
      );

      // cleanup preview and bytes
      if (previewUrl) {
        try { URL.revokeObjectURL(previewUrl); } catch (e) { /* ignore */ }
      }
      setPreviewUrl('');
      setFilledPdfBytes(null);

      // Call onSuccess and close after short delay
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
      if (sigCanvasRef.current) {
        try { sigCanvasRef.current.clear(); } catch (e) { /* ignore */ }
      }
    };
    // intentionally empty deps to run only on unmount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Render current section
  const renderCurrentSection = () => {
    switch (activeSection) {
      case 'personal':
        return (
          <PersonalInformationSection
            formData={formData}
            onInputChange={handleInputChange}
          />
        );
      case 'position':
        return (
          <PositionInformationSection
            formData={formData}
            onInputChange={handleInputChange}
          />
        );
      case 'work':
        return (
          <WorkPreferencesSection
            formData={formData}
            onInputChange={handleInputChange}
            onCheckboxChange={handleCheckboxChange}
          />
        );
      case 'education':
        return (
          <EducationSection
            formData={formData}
            onInputChange={handleInputChange}
          />
        );
      case 'employment':
        return (
          <EmploymentHistorySection
            formData={formData}
            onInputChange={handleInputChange}
            onCheckboxChange={handleCheckboxChange}
          />
        );
      case 'awards':
        return (
          <AwardsCertificationsSection
            formData={formData}
            onInputChange={handleInputChange}
          />
        );
      case 'references':
        return (
          <ProfessionalReferencesSection
            formData={formData}
            onInputChange={handleInputChange}
          />
        );
      case 'signature':
        return (
          <SignatureSection
            formData={formData}
            signatureType={signatureType}
            signatureDataUrl={signatureDataUrl}
            onInputChange={handleInputChange}
            onSignatureTypeChange={setSignatureType}
            onSignatureEnd={handleSignatureEnd}
            onClearSignature={clearSignature}
            sigCanvasRef={sigCanvasRef}
          />
        );
      default:
        return <PersonalInformationSection formData={formData} onInputChange={handleInputChange} />;
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-6xl w-full max-h-[95vh] overflow-hidden">
          <div className="flex justify-between items-center p-6 border-b">
            <h2 className="text-xl font-semibold">Fill Employment Application</h2>
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

export default EmploymentApplicationForm;