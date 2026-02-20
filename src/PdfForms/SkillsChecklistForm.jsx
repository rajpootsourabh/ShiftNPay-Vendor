import React, { useState, useRef, useEffect } from 'react';
import { PDFDocument } from 'pdf-lib';
import SignatureCanvas from 'react-signature-canvas';
import axios from 'axios';

// Import section components
import SkillsChecklistSection from './sections/SkillsChecklist/SkillsChecklistSection';
import SignatureSection from './sections/SkillsChecklist/SignatureSection';
import StatusModal from './StatusModal';

const SkillsChecklistForm = ({ document, token, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    // Language fields
    "Languages other than English that I can speak and understand 1": "",
    "Languages other than English that I can speak and understand 2": "",
    "Languages other than English that I can speak and understand 3": "",
    "Print Name": "",
    "Signature131_es_:signer:signature": "",
    "Date": "",
  });

  const [generatingPreview, setGeneratingPreview] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [filledPdfBytes, setFilledPdfBytes] = useState(null);
  const [signatureDataUrl, setSignatureDataUrl] = useState('');
  const [activeSection, setActiveSection] = useState('skills');
  const sigCanvasRef = useRef();

  // Status modal state
  const [statusModal, setStatusModal] = useState({
    isOpen: false,
    type: 'success',
    title: '',
    message: ''
  });

  // Skills data structure matching the PDF
  const skillsData = [
    {
      section: 1,
      title: "ACTIVITIES OF DAILY LIVING",
      skills: [
        "Assisting with Eating",
        "Meal Preparation",
        "Grocery Shopping",
        "Assistance with Ambulation",
        "Accompany on Outings",
        "Assistance with Wheelchair",
        "Assistance with Bathing",
        "Bed Bath or Shower",
        "Assistance with Clothing",
        "Diaper Changing",
        "Oral Hygiene",
        "Pericare",
        "Shampoo",
        "Shave",
        "Foot and Nail Care",
        "Skin Care"
      ],
      columnCount: 4,
      skillCount: 16
    },
    {
      section: 2,
      title: "HOUSEKEEPING",
      skills: [
        "Bathroom Cleanup: tub, toilet, sink",
        "Dust and Straighten",
        "Laundry: wash, dry, fold",
        "Bed-Making / Linen Change",
        "Vacuum / Sweep / Mop",
        "Kitchen Cleanup: dishes, wipe counters"
      ],
      columnCount: 4,
      skillCount: 6
    },
    {
      section: 3,
      title: "BODY MECHANICS / ACTIVITY",
      skills: [
        "Transfer Techniques",
        "ROM",
        "Assistance with Exercises",
        "Positioning / Repositioning",
        "Transfers and Turning",
        "Able to lift 50+ pounds"
      ],
      columnCount: 4,
      skillCount: 6
    },
    {
      section: 4,
      title: "GENERAL",
      skills: [
        "CPR / First Aid",
        "Companionship",
        "Dressing Changes - Sterile",
        "Wound Care",
        "Wound Irrigation",
        "Pressure Ulcer Care and Prevention",
        "Universal Precautions",
        "Isolation Techniques"
      ],
      columnCount: 4,
      skillCount: 8
    },
    {
      section: 5,
      title: "DIABETIC CARE",
      skills: [
        "Diabetes (IDDM/INIDDM)",
        "Use of Glucometers",
        "Performing Finger Sticks"
      ],
      columnCount: 4,
      skillCount: 3
    },
    {
      section: 6,
      title: "GASTROINTESTINAL",
      skills: [
        "Dehiscence",
        "J-Tubes Feeding and Care",
        "G-Tubes Feeding and Care",
        "Placement Checks",
        "Check for Residuals",
        "Colostomy Care",
        "Diets (ADA, Renal, Cardiac)",
        "Nutritional Needs/Turgor",
        "Hemovacs - Jackson Pratt",
        "Maintains NG Tubes",
        "Ostomy Care",
        "Rectal Tubes/Bags",
        "Tube Feedings",
        "T-Tubes",
        "GI Surgeries"
      ],
      columnCount: 4,
      skillCount: 15
    },
    {
      section: 7,
      title: "VITAL SIGNS",
      skills: [
        "Temperature",
        "Pulse",
        "Respiration",
        "Blood Pressure"
      ],
      columnCount: 4,
      skillCount: 4
    },
    {
      section: 8,
      title: "GENITOURINARY/ELIMINATION",
      skills: [
        "Bed Pan Assistance",
        "Urinal Assistance",
        "Incontinence Care",
        "Bowel Movements",
        "Fistulas and Shunts Care",
        "Foley Catheter Care",
        "Ins and Outs Data (I&O)"
      ],
      columnCount: 4,
      skillCount: 7
    },
    {
      section: 9,
      title: "MEDICAL ADMINISTRATION",
      skills: [
        "Duoderm",
        "Enema Administration",
        "Solosite Gel",
        "Ear Drops",
        "Eye Drops"
      ],
      columnCount: 4,
      skillCount: 5
    },
    {
      section: 10,
      title: "MEDICAL EQUIPMENT",
      skills: [
        "Abdominal Binders",
        "Cane / Crutches",
        "Effica Beds/Clintiron Beds",
        "Hospital Beds",
        "Gait Belt",
        "Hoyer Lift",
        "Montgomery Straps",
        "Sequential Compression Devices",
        "Splints",
        "Ted Stockings",
        "Walker",
        "Feeding Pumps"
      ],
      columnCount: 4,
      skillCount: 12
    },
    {
      section: 11,
      title: "NEUROLOGICAL",
      skills: [
        "Seizure Precautions",
        "Report Signs and Symptoms of CVA",
        "Spinal Cord/Brain Injury"
      ],
      columnCount: 4,
      skillCount: 3
    },
    {
      section: 12,
      title: "RESPIRATORY",
      skills: [
        "Oxygen Therapy",
        "Suctioning",
        "Tracheostomy Care"
      ],
      columnCount: 4,
      skillCount: 3
    },
    {
      section: 13,
      title: "VASCULAR",
      skills: [
        "Peripheral Pulses",
        "Fluid Overload",
        "Infusion Devices (Home / Hospital)"
      ],
      columnCount: 4,
      skillCount: 3
    }
  ];

  // Initialize all checkbox fields to false
  useEffect(() => {
    const initialData = {
      "Languages other than English that I can speak and understand 1": "",
      "Languages other than English that I can speak and understand 2": "",
      "Languages other than English that I can speak and understand 3": "",
      "Print Name": "",
      "Signature131_es_:signer:signature": "",
      "Date": "",
    };

    // Initialize all checkbox fields to false
    // CORRECTED PATTERN: section.column.skillIndex
    skillsData.forEach(sectionData => {
      // For each column (4 columns per skill: 0,1,2,3)
      for (let column = 0; column < sectionData.columnCount; column++) {
        // For each skill in the section
        for (let skillIndex = 0; skillIndex < sectionData.skillCount; skillIndex++) {
          const fieldName = `${sectionData.section}.${column + 1}.${skillIndex}`;
          initialData[fieldName] = false;
        }
      }
    });

    setFormData(initialData);
  }, []);

  // Navigation sections
  const sections = [
    { id: 'skills', name: 'Skills Checklist' },
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

  // Handle rating selection for a skill - only one column can be selected
  const handleSkillRatingChange = (section, skillIndex, selectedColumn) => {
    const updatedData = { ...formData };

    // For each column (1-4)
    for (let column = 1; column <= 4; column++) {
      const fieldName = `${section}.${column}.${skillIndex}`;
      // Set selected column to true, others to false
      updatedData[fieldName] = (column === (selectedColumn + 1));
    }

    setFormData(updatedData);
  };

  // Get selected column for a skill (0-3 for UI, 1-4 for PDF)
  const getSelectedColumn = (section, skillIndex) => {
    for (let column = 1; column <= 4; column++) {
      const fieldName = `${section}.${column}.${skillIndex}`;
      if (formData[fieldName]) {
        return column - 1; // Convert to 0-based for UI
      }
    }
    return null;
  };

  // Signature handling functions - Only drawn signature
  const handleSignatureEnd = () => {
    if (sigCanvasRef.current && !sigCanvasRef.current.isEmpty()) {
      const signatureDataURL = sigCanvasRef.current.toDataURL();
      setSignatureDataUrl(signatureDataURL);
      // Don't set text in formData - we'll embed the image directly
    }
  };

  const clearSignature = () => {
    if (sigCanvasRef.current) {
      sigCanvasRef.current.clear();
      setSignatureDataUrl('');
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

  // FIXED: PDF filling with correct field mapping
  const fillPdf = async (formData, pdfUrl) => {
    try {
      console.log("Starting PDF fill...");
      const pdfResponse = await fetch(pdfUrl);
      const pdfBuffer = await pdfResponse.arrayBuffer();
      const pdfDoc = await PDFDocument.load(pdfBuffer);
      const form = pdfDoc.getForm();

      // Get all fields for debugging
      const allFields = form.getFields();
      console.log(`Total fields in PDF: ${allFields.length}`);

      // Log all field names for debugging
      const fieldNames = allFields.map(f => f.getName());
      console.log('All field names:', fieldNames);

      // Fill text fields (EXCEPT signature field)
      const textFields = [
        "Languages other than English that I can speak and understand 1",
        "Languages other than English that I can speak and understand 2",
        "Languages other than English that I can speak and understand 3",
        "Print Name",
        "Date"
      ];

      textFields.forEach(fieldName => {
        try {
          const field = form.getTextField(fieldName);
          if (field) {
            field.setText(formData[fieldName] || "");
            console.log(`Set text field ${fieldName}: ${formData[fieldName]}`);
          } else {
            console.warn(`Text field not found: ${fieldName}`);
          }
        } catch (error) {
          console.warn(`Could not find text field ${fieldName}:`, error.message);
        }
      });

      // Fill checkbox fields
      let checkedCount = 0;
      let uncheckedCount = 0;
      let notFoundCount = 0;

      skillsData.forEach(sectionData => {
        console.log(`Processing section ${sectionData.section}: ${sectionData.title}`);

        // For each skill in the section
        for (let skillIndex = 0; skillIndex < sectionData.skillCount; skillIndex++) {
          // For each column (1-4)
          for (let column = 1; column <= 4; column++) {
            const fieldName = `${sectionData.section}.${column}.${skillIndex}`;
            const isChecked = formData[fieldName] === true;

            try {
              const field = form.getCheckBox(fieldName);
              if (field) {
                if (isChecked) {
                  field.check();
                  checkedCount++;
                } else {
                  field.uncheck();
                  uncheckedCount++;
                }
              } else {
                notFoundCount++;
                console.warn(`Checkbox field not found: ${fieldName}`);
              }
            } catch (error) {
              notFoundCount++;
              console.warn(`Error with field ${fieldName}:`, error.message);
            }
          }
        }
      });

      console.log(`Checkbox summary: Checked=${checkedCount}, Unchecked=${uncheckedCount}, Not found=${notFoundCount}`);

      // Handle signature image embedding (DRAWN SIGNATURE ONLY)
      if (signatureDataUrl) {
        try {
          const signatureImageBytes = await dataURLToImageBytes(signatureDataUrl);
          if (signatureImageBytes) {
            const signatureImage = await pdfDoc.embedPng(signatureImageBytes);
            const pages = pdfDoc.getPages();

            // Try to find signature field position
            try {
              const signatureField = form.getTextField("Signature131_es_:signer:signature");
              if (signatureField) {
                const widgets = signatureField.acroField.getWidgets();
                if (widgets.length > 0) {
                  const widget = widgets[0];
                  const rect = widget.getRectangle();

                  // Find which page this widget is on
                  const pageRef = widget.P();
                  let pageIndex = 0;
                  for (let i = 0; i < pages.length; i++) {
                    if (pages[i].ref === pageRef) {
                      pageIndex = i;
                      break;
                    }
                  }

                  // Draw the signature on the correct page
                  if (pages[pageIndex]) {
                    pages[pageIndex].drawImage(signatureImage, {
                      x: rect.x || rect.left || 100,
                      y: rect.y || rect.bottom || 100,
                      width: rect.width || (rect.right - rect.left) || 200,
                      height: rect.height || (rect.top - rect.bottom) || 50,
                    });
                  }

                  // Clear the signature text field so it doesn't show text
                  signatureField.setText("");
                }
              } else {
                console.warn("Signature text field not found in PDF");
              }
            } catch (err) {
              console.warn("Could not find exact signature field position, using default:", err);
              // Fallback to default position on first page
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
        } catch (error) {
          console.error("Error embedding drawn signature:", error);
        }
      }

      // ========== FLATTENING WITH BETTER ERROR HANDLING ==========
      console.log("Attempting to flatten form...");

      // First, try to enable read-only on all fields that exist
      const existingFieldNames = fieldNames;
      form.getFields().forEach((field) => {
        try {
          const fieldName = field.getName();
          if (existingFieldNames.includes(fieldName)) {
            field.enableReadOnly();
          }
        } catch (err) {
          console.warn(`Could not make field read-only:`, err.message);
        }
      });

      try {
        // Try to flatten only fields that exist
        form.flatten();
        console.log("Form flattened successfully");
      } catch (flattenError) {
        console.warn("Standard flatten failed:", flattenError.message);

        // Alternative: Flatten selectively by checking each field
        try {
          // Create a new form to track which fields to keep
          allFields.forEach(field => {
            try {
              const fieldName = field.getName();
              // Check if this field is in our formData or textFields
              const shouldFlatten =
                existingFieldNames.includes(fieldName) &&
                (textFields.includes(fieldName) ||
                  fieldName.includes('.') || // checkbox fields
                  fieldName === "Signature131_es_:signer:signature");

              if (shouldFlatten) {
                field.enableReadOnly();
              }
            } catch (err) {
              // Ignore individual field errors
            }
          });

          // Try flatten again with more selective approach
          try {
            form.flatten();
            console.log("Form flattened with selective approach");
          } catch (finalError) {
            console.warn("Final flatten failed, saving without flatten:", finalError.message);
            // Just save the PDF without flattening
          }
        } catch (error) {
          console.warn("Error in selective flattening:", error.message);
          // Save PDF without flattening
        }
      }

      const filledPdfBytes = await pdfDoc.save();
      console.log("PDF filled successfully");
      return filledPdfBytes;

    } catch (error) {
      console.error('Error filling Skills Checklist:', error);
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
        'Your skills checklist has been submitted successfully.'
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Render current section
  const renderCurrentSection = () => {
    switch (activeSection) {
      case 'skills':
        return (
          <SkillsChecklistSection
            formData={formData}
            skillsData={skillsData}
            onInputChange={handleInputChange}
            onSkillRatingChange={handleSkillRatingChange}
            getSelectedColumn={getSelectedColumn}
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
        return <SkillsChecklistSection
          formData={formData}
          skillsData={skillsData}
          onInputChange={handleInputChange}
          onSkillRatingChange={handleSkillRatingChange}
          getSelectedColumn={getSelectedColumn}
        />;
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-6xl w-full max-h-[95vh] overflow-hidden">
          <div className="flex justify-between items-center p-6 border-b">
            <h2 className="text-xl font-semibold">Fill Skills Checklist</h2>
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

            {/* Language Fields */}
            {activeSection === 'skills' && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4">Languages</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[1, 2, 3].map(num => (
                    <div key={num}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Language {num}
                      </label>
                      <input
                        type="text"
                        value={formData[`Languages other than English that I can speak and understand ${num}`]}
                        onChange={(e) => handleInputChange(`Languages other than English that I can speak and understand ${num}`, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={`Language ${num}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

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

export default SkillsChecklistForm;