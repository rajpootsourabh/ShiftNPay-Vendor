import React, { useState, useEffect, useRef } from "react";
import { ErrorMessage, Field, FieldArray } from "formik";
import { FaTrash, FaUpload, FaEye, FaInfoCircle, FaExternalLinkAlt, FaDownload, FaTimes, FaExclamationTriangle } from "react-icons/fa";

const Attachments = ({ formik, clientData }) => {
  const [previewFile, setPreviewFile] = useState(null);
  const [previewFileName, setPreviewFileName] = useState("");
  const [previewFileType, setPreviewFileType] = useState("");
  const blobUrlsRef = useRef(new Map());

  // Configuration - STRICT LIMITS (RAW FILE SIZES)
  const MAX_INDIVIDUAL_FILE_SIZE = 8.5 * 1024 * 1024; // 8.5MB per file
  const MAX_TOTAL_RAW_SIZE = 8.5 * 1024 * 1024; // 8.5MB total RAW size (STRICT LIMIT - includes ALL files)

  // Clean up blob URLs on unmount
  useEffect(() => {
    return () => {
      blobUrlsRef.current.forEach((url) => {
        URL.revokeObjectURL(url);
      });
      blobUrlsRef.current.clear();
    };
  }, []);

  // Calculate total RAW size of ALL files (existing + new)
  const calculateTotalRawSize = () => {
    const attachments = formik.values.attachments || [];
    return attachments
      .filter(att => att.fileSize)
      .reduce((total, att) => total + att.fileSize, 0);
  };

  // Calculate payload size (with base64 overhead) for information only
  const calculateTotalPayloadSize = () => {
    const attachments = formik.values.attachments || [];
    return attachments
      .filter(att => att.fileSize)
      .reduce((total, att) => total + (att.fileSize * 1.33), 0);
  };

  // Count ALL files (existing + new)
  const countAllFiles = () => {
    const attachments = formik.values.attachments || [];
    return attachments.length;
  };

  // Count new files only
  const countNewFiles = () => {
    const attachments = formik.values.attachments || [];
    return attachments.filter(att => !att._isExisting).length;
  };

  // Count existing files only
  const countExistingFiles = () => {
    const attachments = formik.values.attachments || [];
    return attachments.filter(att => att._isExisting).length;
  };

  // Get real-time usage statistics for ALL files (RAW sizes)
  const getUsageStats = () => {
    const totalRawSize = calculateTotalRawSize();
    const totalPayloadSize = calculateTotalPayloadSize();
    const allFilesCount = countAllFiles();
    const newFilesCount = countNewFiles();
    const existingFilesCount = countExistingFiles();
    
    return {
      totalRawSize,
      totalPayloadSize,
      allFilesCount,
      newFilesCount,
      existingFilesCount,
      remainingSize: Math.max(0, MAX_TOTAL_RAW_SIZE - totalRawSize),
      usagePercentage: (totalRawSize / MAX_TOTAL_RAW_SIZE) * 100,
      isOverLimit: totalRawSize > MAX_TOTAL_RAW_SIZE
    };
  };

  // Convert base64 to blob URL for large files from API
  const base64ToBlobUrl = (base64String, fileType) => {
    try {
      const base64Data = base64String.split(',')[1];
      const byteCharacters = atob(base64Data);
      const byteArrays = [];
      
      for (let offset = 0; offset < byteCharacters.length; offset += 1024) {
        const slice = byteCharacters.slice(offset, offset + 1024);
        const byteNumbers = new Array(slice.length);
        
        for (let i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i);
        }
        
        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
      }
      
      const blob = new Blob(byteArrays, { type: fileType });
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error('Error converting base64 to blob:', error);
      return base64String;
    }
  };

  // Convert File object to base64 for API submission
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  // Initialize attachments from API data
  useEffect(() => {
    if (clientData && clientData.attachments) {
      const formattedAttachments = clientData.attachments.map((attachment, index) => {
        let processedFile = attachment.file;
        
        if (attachment.file && 
            typeof attachment.file === 'string' && 
            attachment.file.startsWith('data:') &&
            attachment.fileSize > 5 * 1024 * 1024) {
          
          const blobUrl = base64ToBlobUrl(attachment.file, attachment.fileType);
          if (blobUrl && blobUrl.startsWith('blob:')) {
            blobUrlsRef.current.set(`api-${index}`, blobUrl);
            processedFile = blobUrl;
          }
        }
        
        return {
          _id: attachment._id || '',
          description: attachment.description || '',
          file: processedFile,
          fileName: attachment.fileName || '',
          fileType: attachment.fileType || '',
          fileSize: attachment.fileSize || 0,
          clientAccess: attachment.clientAccess || 'restricted',
          isFromApi: true,
          _isExisting: true,
          _originalFileData: attachment.file
        };
      });
      
      formik.setFieldValue('attachments', formattedAttachments);
    }
  }, [clientData, formik.setFieldValue]);

  const getFileUrl = (attachment, index) => {
    // If we have a file object (new upload), use blob URL
    if (attachment._fileObject instanceof File) {
      if (!blobUrlsRef.current.has(index)) {
        const blobUrl = URL.createObjectURL(attachment._fileObject);
        blobUrlsRef.current.set(index, blobUrl);
      }
      return blobUrlsRef.current.get(index);
    }
    
    // If it's a blob URL (from API conversion)
    if (typeof attachment.file === 'string' && attachment.file.startsWith('blob:')) {
      return attachment.file;
    }
    
    // If it's a base64 string (for preview of small files)
    if (typeof attachment.file === 'string' && attachment.file.startsWith('data:')) {
      return attachment.file;
    }
    
    // If it's a URL from API
    if (typeof attachment.file === 'string' && attachment.file.startsWith('http')) {
      return attachment.file;
    }
    
    return null;
  };

  const handleFileChange = async (event, index, arrayHelpers) => {
    const file = event.currentTarget.files[0];
    if (!file) return;

    // Clear previous errors
    formik.setFieldError(`attachments[${index}].file`, undefined);

    // Validate file type and size
    const validTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    // Individual file size validation - STRICT 8.5MB LIMIT
    if (!validTypes.includes(file.type)) {
      formik.setFieldError(
        `attachments[${index}].file`,
        "Invalid file type. Only PDF, JPG, PNG, DOC allowed"
      );
      return;
    }

    if (file.size > MAX_INDIVIDUAL_FILE_SIZE) {
      formik.setFieldError(
        `attachments[${index}].file`,
        `File too large. Max ${MAX_INDIVIDUAL_FILE_SIZE / (1024 * 1024)}MB allowed per file`
      );
      return;
    }

    // Check total RAW size for ALL files (existing + new) - STRICT 8.5MB LIMIT
    const currentStats = getUsageStats();
    const estimatedNewRawSize = currentStats.totalRawSize + file.size;
    
    if (estimatedNewRawSize > MAX_TOTAL_RAW_SIZE) {
      const remainingMB = (MAX_TOTAL_RAW_SIZE - currentStats.totalRawSize) / (1024 * 1024);
      formik.setFieldError(
        `attachments[${index}].file`,
        `Total file size exceeds ${MAX_TOTAL_RAW_SIZE / (1024 * 1024)}MB limit! You can only add ${Math.max(0, remainingMB).toFixed(1)}MB more. Remove some files.`
      );
      return;
    }

    try {
      // Convert file to base64 for API submission
      const base64File = await fileToBase64(file);
      
      // Create blob URL for preview
      const blobUrl = URL.createObjectURL(file);
      blobUrlsRef.current.set(index, blobUrl);

      // Store both base64 (for API) and file object (for preview)
      arrayHelpers.replace(index, {
        ...formik.values.attachments[index],
        file: base64File,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        isFromApi: false,
        _isExisting: false,
        _fileObject: file,
        _originalFileData: undefined
      });

      // Clear error after successful upload
      formik.setFieldError(`attachments[${index}].file`, undefined);
    } catch (error) {
      formik.setFieldError(
        `attachments[${index}].file`,
        "Error processing file. Please try again."
      );
    }
  };

  const handleFilePreview = (attachment, index) => {
    const fileUrl = getFileUrl(attachment, index);
    
    if (!fileUrl) return;

    setPreviewFile(fileUrl);
    setPreviewFileName(attachment.fileName);
    setPreviewFileType(attachment.fileType);
  };

  const handleLargeFilePreview = (attachment, index) => {
    const fileUrl = getFileUrl(attachment, index);
    
    if (!fileUrl) return;

    if (attachment.fileSize > 10 * 1024 * 1024 && attachment.isFromApi) {
      if (attachment.fileType.includes('pdf')) {
        openPdfInNewTab(fileUrl, attachment.fileName);
      } else if (attachment.fileType.includes('image')) {
        openImageInNewTab(fileUrl, attachment.fileName);
      } else {
        handleDownload(attachment, index);
      }
    } else {
      setPreviewFile(fileUrl);
      setPreviewFileName(attachment.fileName);
      setPreviewFileType(attachment.fileType);
    }
  };

  const handleRemovePreview = () => {
    setPreviewFile(null);
    setPreviewFileName("");
    setPreviewFileType("");
  };

  const handleDownload = (attachment, index) => {
    const fileUrl = getFileUrl(attachment, index);
    
    if (fileUrl) {
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = attachment.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const openPdfInNewTab = (fileUrl, fileName) => {
    const newTab = window.open('', '_blank');
    if (newTab) {
      newTab.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${fileName}</title>
            <style>
              body, html { margin: 0; padding: 0; height: 100%; overflow: hidden; }
              .pdf-container { width: 100%; height: 100vh; }
              embed { width: 100%; height: 100%; }
            </style>
          </head>
          <body>
            <div class="pdf-container">
              <embed src="${fileUrl}" type="application/pdf">
            </div>
          </body>
        </html>
      `);
      newTab.document.close();
    }
  };

  const openImageInNewTab = (fileUrl, fileName) => {
    const newTab = window.open('', '_blank');
    if (newTab) {
      newTab.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${fileName}</title>
            <style>
              body { 
                margin: 0; 
                padding: 20px; 
                display: flex; 
                justify-content: center; 
                align-items: center; 
                min-height: 100vh; 
                background: #f0f0f0; 
              }
              img { 
                max-width: 100%; 
                max-height: 95vh; 
                box-shadow: 0 4px 8px rgba(0,0,0,0.3);
              }
            </style>
          </head>
          <body>
            <img src="${fileUrl}" alt="${fileName}" 
                 onerror="this.style.display='none'; document.body.innerHTML='<div style=\"text-align:center;padding:50px;\"><h3>Failed to load image</h3><p>The file may be too large or corrupted.</p></div>';">
          </body>
        </html>
      `);
      newTab.document.close();
    }
  };

  // Transform attachments before submission
  const transformAttachmentsForSubmit = (attachments) => {
    if (!attachments) return [];
    
    return attachments.map(attachment => {
      // For existing files, don't send file content at all
      if (attachment._isExisting) {
        const { file, _fileObject, _originalFileData, _isExisting, ...cleanAttachment } = attachment;
        return cleanAttachment;
      }
      
      // For new files, send everything
      const { _fileObject, _originalFileData, _isExisting, ...cleanAttachment } = attachment;
      return cleanAttachment;
    });
  };

  // Intercept form submission to transform attachments
  useEffect(() => {
    const originalSubmit = formik.handleSubmit;
    
    formik.handleSubmit = (e) => {
      if (e && e.preventDefault) e.preventDefault();
      
      // Check if total RAW size exceeds limit before submission
      const currentStats = getUsageStats();
      if (currentStats.isOverLimit) {
        formik.setFieldError('attachments', `Total file size (${(currentStats.totalRawSize / (1024 * 1024)).toFixed(1)}MB) exceeds the ${MAX_TOTAL_RAW_SIZE / (1024 * 1024)}MB limit. Please remove some files.`);
        return;
      }
      
      // Transform attachments before submission
      const transformedAttachments = transformAttachmentsForSubmit(formik.values.attachments);
      const submitData = {
        ...formik.values,
        attachments: transformedAttachments
      };
      
      // Use Formik's submit function with transformed data
      formik.submitForm().then(() => {
        // Optionally restore original values if needed
      });
    };
    
    return () => {
      formik.handleSubmit = originalSubmit;
    };
  }, [formik]);

  // Get current usage stats for real-time display
  const usageStats = getUsageStats();

  return (
    <div className="attachments-container">
      <div className="mb-4">
        <h3>Client Attachments</h3>
        
        {/* Real-time Usage Display - Shows ALL files (RAW sizes) */}
        <div className={`card mb-3 ${usageStats.isOverLimit ? 'border-danger' : ''}`}>
          <div className="card-body">
            <div className="row align-items-center">
              <div className="col-md-8">
                <h6 className="card-title mb-2">
                  <FaInfoCircle className="me-2" />
                  Total File Size Usage (All Files)
                  {usageStats.isOverLimit && (
                    <span className="badge bg-danger ms-2">OVER LIMIT</span>
                  )}
                </h6>
                <div className="progress mb-2" style={{ height: '8px' }}>
                  <div 
                    className={`progress-bar ${usageStats.isOverLimit ? 'bg-danger' : usageStats.usagePercentage > 80 ? 'bg-warning' : usageStats.usagePercentage > 60 ? 'bg-info' : 'bg-success'}`}
                    role="progressbar" 
                    style={{ width: `${Math.min(usageStats.usagePercentage, 100)}%` }}
                    aria-valuenow={usageStats.usagePercentage}
                    aria-valuemin="0" 
                    aria-valuemax="100"
                  >
                  </div>
                </div>
                <small className="text-muted">
                  {usageStats.allFilesCount} total files ({usageStats.existingFilesCount} existing + {usageStats.newFilesCount} new) • 
                  {(usageStats.totalRawSize / (1024 * 1024)).toFixed(1)}MB / {MAX_TOTAL_RAW_SIZE / (1024 * 1024)}MB used • 
                  {(usageStats.remainingSize / (1024 * 1024)).toFixed(1)}MB remaining
                </small>
              </div>
              <div className="col-md-4 text-end">
                {usageStats.isOverLimit ? (
                  <div className="text-danger">
                    <FaExclamationTriangle className="me-1" />
                    <strong>OVER LIMIT!</strong>
                    <div className="small">Remove files to submit</div>
                  </div>
                ) : usageStats.usagePercentage > 80 && (
                  <div className="text-warning">
                    <FaExclamationTriangle className="me-1" />
                    <strong>Near Limit!</strong>
                  </div>
                )}
                <div className="text-muted">
                  Max: {MAX_TOTAL_RAW_SIZE / (1024 * 1024)}MB total
                </div>
              </div>
            </div>
          </div>
        </div>

        <p className="text-muted">
          Max {MAX_INDIVIDUAL_FILE_SIZE / (1024 * 1024)}MB per file • Max {MAX_TOTAL_RAW_SIZE / (1024 * 1024)}MB total (includes all files)
        </p>
      </div>

      <FieldArray name="attachments">
        {(arrayHelpers) => (
          <div>
            <div className="table-responsive">
              <table className="table table-bordered">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: "25%" }}>Description</th>
                    <th style={{ width: "30%" }}>File</th>
                    <th style={{ width: "20%" }}>Client Access</th>
                    <th style={{ width: "25%" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {formik.values.attachments && formik.values.attachments.length > 0 ? (
                    formik.values.attachments.map((attachment, index) => {
                      const fileUrl = getFileUrl(attachment, index);
                      const isLargeFile = attachment.fileSize > 5 * 1024 * 1024;
                      const isExistingFile = attachment._isExisting;
                      const canAddMoreFiles = usageStats.remainingSize > 0 && !usageStats.isOverLimit;
                      
                      return (
                        <tr key={index}>
                          <td>
                            <Field
                              name={`attachments[${index}].description`}
                              className={`form-control ${
                                formik.errors.attachments?.[index]?.description
                                  ? "is-invalid"
                                  : ""
                              }`}
                              placeholder="Enter description"
                            />
                            <ErrorMessage
                              name={`attachments[${index}].description`}
                              component="div"
                              className="invalid-feedback"
                            />
                          </td>
                          <td>
                            <div className="d-flex flex-column">
                              {fileUrl ? (
                                <div className="d-flex align-items-center flex-wrap gap-2">
                                  <span className="text-truncate" style={{ maxWidth: '150px' }} title={attachment.fileName}>
                                    {attachment.fileName}
                                  </span>
                                  <span className="badge bg-secondary">
                                    {(attachment.fileSize / (1024 * 1024)).toFixed(1)} MB
                                  </span>
                                  
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-outline-primary"
                                    onClick={() => handleLargeFilePreview(attachment, index)}
                                    title={isLargeFile ? "Open in new tab (Large file)" : "Preview file"}
                                  >
                                    {isLargeFile ? <FaExternalLinkAlt /> : <FaEye />}
                                  </button>

                                  <button
                                    type="button"
                                    className="btn btn-sm btn-outline-success"
                                    onClick={() => handleDownload(attachment, index)}
                                    title="Download file"
                                  >
                                    <FaDownload />
                                  </button>

                                  {isLargeFile && (
                                    <span className="badge bg-warning text-dark" title="Large file">
                                      Large
                                    </span>
                                  )}
                                  {isExistingFile ? (
                                    <span className="badge bg-info text-dark" title="Existing file">
                                      Existing
                                    </span>
                                  ) : (
                                    <span className="badge bg-success text-dark" title="New upload">
                                      New
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <>
                                  <div className="d-flex align-items-center">
                                    <label
                                      className={`btn btn-sm btn-outline-secondary ${
                                        !canAddMoreFiles || formik.errors.attachments?.[index]?.file ? "is-invalid" : ""
                                      }`}
                                      style={!canAddMoreFiles ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
                                      title={!canAddMoreFiles ? "File size limit reached" : "Upload file"}
                                    >
                                      <FaUpload className="me-1" />
                                      Upload
                                      <input
                                        type="file"
                                        className="d-none"
                                        onChange={(e) => handleFileChange(e, index, arrayHelpers)}
                                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                        disabled={!canAddMoreFiles}
                                      />
                                    </label>
                                  </div>
                                  {!canAddMoreFiles && (
                                    <div className="text-danger small mt-1">
                                      <FaExclamationTriangle className="me-1" />
                                      {usageStats.isOverLimit ? 'Over limit! Remove files.' : 'File size limit reached'}
                                    </div>
                                  )}
                                  {formik.errors.attachments?.[index]?.file && (
                                    <div className="text-danger small mt-1">
                                      {formik.errors.attachments[index].file}
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          </td>
                          <td>
                            <Field
                              as="select"
                              name={`attachments[${index}].clientAccess`}
                              className="form-select"
                            >
                              <option value="restricted">Restricted</option>
                              <option value="view">View Only</option>
                              <option value="download">Download</option>
                            </Field>
                          </td>
                          <td>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => {
                                const blobKey = attachment.isFromApi ? `api-${index}` : index;
                                if (blobUrlsRef.current.has(blobKey)) {
                                  URL.revokeObjectURL(blobUrlsRef.current.get(blobKey));
                                  blobUrlsRef.current.delete(blobKey);
                                }
                                arrayHelpers.remove(index);
                              }}
                            >
                              <FaTrash />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center text-muted py-4">
                        No attachments found. Click "Add Attachment" to upload documents.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-3">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  if (usageStats.isOverLimit) {
                    formik.setFieldError('attachments', `Total file size exceeds ${MAX_TOTAL_RAW_SIZE / (1024 * 1024)}MB limit! Remove files to add more.`);
                    return;
                  }
                  if (usageStats.remainingSize <= 0) {
                    formik.setFieldError('attachments', `File size limit reached! Remove files to add more.`);
                    return;
                  }
                  arrayHelpers.push({
                    description: "",
                    file: null,
                    fileName: "",
                    fileType: "",
                    fileSize: 0,
                    clientAccess: "restricted",
                    isFromApi: false,
                    _isExisting: false,
                  })
                }}
                disabled={usageStats.isOverLimit || usageStats.remainingSize <= 0}
                title={usageStats.isOverLimit ? "Over limit - remove files" : usageStats.remainingSize <= 0 ? "File size limit reached" : "Add new attachment row"}
              >
                Add Attachment
                {(usageStats.isOverLimit || usageStats.remainingSize <= 0) && ` (Limit Reached)`}
              </button>
            </div>
          </div>
        )}
      </FieldArray>

      {/* Preview Modal */}
      {previewFile && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg" style={{ maxWidth: '800px', margin: '2rem auto' }}>
            <div className="modal-content" style={{ borderRadius: '8px', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
              <div className="modal-header bg-light" style={{ borderBottom: '1px solid #dee2e6', borderRadius: '8px 8px 0 0' }}>
                <h5 className="modal-title fw-bold" style={{ fontSize: '1.1rem' }}>
                  {previewFileName}
                </h5>
                <div className="d-flex gap-2">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => {
                      if (previewFileType.includes('pdf')) {
                        openPdfInNewTab(previewFile, previewFileName);
                      } else if (previewFileType.includes('image')) {
                        openImageInNewTab(previewFile, previewFileName);
                      } else {
                        window.open(previewFile, '_blank');
                      }
                    }}
                    title="Open in new tab"
                  >
                    <FaExternalLinkAlt />
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-light"
                    onClick={handleRemovePreview}
                    title="Close preview"
                  >
                    <FaTimes />
                  </button>
                </div>
              </div>
              <div className="modal-body p-0" style={{ maxHeight: '60vh', overflow: 'auto' }}>
                {previewFileType.includes('image/') ? (
                  <div className="d-flex justify-content-center align-items-center p-3 bg-dark" style={{ minHeight: '400px' }}>
                    <img 
                      src={previewFile} 
                      alt="Preview" 
                      className="img-fluid"
                      style={{ 
                        maxHeight: '55vh', 
                        maxWidth: '100%',
                        objectFit: 'contain'
                      }}
                    />
                  </div>
                ) : previewFileType.includes('application/pdf') ? (
                  <div style={{ height: '500px' }}>
                    <iframe 
                      src={previewFile} 
                      className="w-100 h-100 border-0"
                      title="PDF Preview"
                    />
                  </div>
                ) : (
                  <div className="text-center py-5 bg-light">
                    <FaInfoCircle className="text-muted mb-3" size={48} />
                    <p className="text-muted mb-3">Preview not available for this file type.</p>
                    <button
                      className="btn btn-primary"
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = previewFile;
                        link.download = previewFileName;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                    >
                      <FaDownload className="me-2" />
                      Download File
                    </button>
                  </div>
                )}
              </div>
              <div className="modal-footer bg-light" style={{ borderTop: '1px solid #dee2e6', borderRadius: '0 0 8px 8px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleRemovePreview}
                >
                  Close
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = previewFile;
                    link.download = previewFileName;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                >
                  <FaDownload className="me-2" />
                  Download
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Attachments;