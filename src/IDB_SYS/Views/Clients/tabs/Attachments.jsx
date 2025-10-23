import React, { useState, useEffect } from "react";
import { ErrorMessage, Field, FieldArray } from "formik";
import { FaTrash, FaUpload, FaEye, FaDownload, FaSpinner } from "react-icons/fa";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faSave } from "@fortawesome/free-solid-svg-icons";
import { useDispatch, useSelector } from "react-redux";
import { uploadClientAttachment, deleteClientAttachment, fetchClientById } from "../../../../store/IDB_SYS/Clients/clientSlice";

const Attachments = ({ formik, clientData, onSaveTab, isSaved, isSaving }) => {
  const [previewFile, setPreviewFile] = useState(null);
  const [previewFileName, setPreviewFileName] = useState("");
  const [previewFileType, setPreviewFileType] = useState("");
  const [uploadingIndex, setUploadingIndex] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const dispatch = useDispatch();
  const { selectedClient, loading } = useSelector((state) => state.client);

  // Get client ID
  const clientId = clientData?._id || formik.values._id;

  // Check if there are any files or attachments
  const hasFilesOrAttachments = () => {
    const attachments = formik.values.attachments || [];
    return attachments.some(attachment => attachment.fileName);
  };

  const getFileUrl = (fileName) => {
    if (!fileName) return null;

    console.log('🔍 Constructing URL for file:', fileName);

    // If it's already a full URL, return as is
    if (fileName.startsWith('http')) {
      return fileName;
    }

    // If it's a relative path starting with /, construct full URL
    if (fileName.startsWith('/')) {
      const baseUrl = process.env.REACT_APP_BASH_URL || window.location.origin;
      const fullUrl = `${baseUrl}${fileName}`;
      console.log('📁 Constructed full URL from relative path:', fullUrl);
      return fullUrl;
    }

    // If it's just a filename, construct the full URL using the correct base path
    const baseUrl = process.env.REACT_APP_BASH_URL || window.location.origin;
    // Use /client-documents/ without /v1/ prefix since that's how it's served
    const fullUrl = `${baseUrl}/client-documents/${fileName}`;
    return fullUrl;
  };

  // Handle immediate file upload
  const handleFileSelect = async (event, index) => {
    const file = event.currentTarget.files[0];
    if (!file) return;

    // Clear previous errors
    formik.setFieldError(`attachments[${index}].file`, undefined);

    // Validate file
    const validTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!validTypes.includes(file.type)) {
      formik.setFieldError(`attachments[${index}].file`, "Invalid file type. Only PDF, JPG, PNG, DOC allowed");
      return;
    }

    try {
      setUploadingIndex(index);

      // Get form data
      const description = formik.values.attachments[index]?.description || file.name;
      const clientAccess = formik.values.attachments[index]?.clientAccess || 'restricted';

      // Create form data for upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('description', description);
      formData.append('clientAccess', clientAccess);

      // Upload file immediately
      const result = await dispatch(uploadClientAttachment({ clientId, formData })).unwrap();

      console.log('✅ File uploaded successfully:', result.attachment);

      // Refresh client data to get updated attachments
      await dispatch(fetchClientById(clientId)).unwrap();

      // Clear the file input
      event.target.value = '';

    } catch (error) {
      console.error('Error uploading file:', error);
      formik.setFieldError(`attachments[${index}].file`, error.message || "Error uploading file");
    } finally {
      setUploadingIndex(null);
    }
  };

  // Handle immediate attachment deletion
  const handleAttachmentDelete = async (attachmentId, index) => {
    if (!attachmentId) {
      formik.setFieldValue('attachments',
        formik.values.attachments.filter((_, i) => i !== index)
      );
      return;
    }

    try {
      setDeletingId(attachmentId);

      console.log('🗑️ Deleting attachment:', attachmentId);
      await dispatch(deleteClientAttachment({ clientId, attachmentId })).unwrap();

      console.log('✅ Attachment deleted successfully');

      // Refresh client data to get updated attachments
      await dispatch(fetchClientById(clientId)).unwrap();

    } catch (error) {
      console.error('❌ Error deleting attachment:', error);

      if (error.message && error.message.includes('Attachment not found')) {
        // If attachment was already deleted, refresh data
        await dispatch(fetchClientById(clientId)).unwrap();
      } else {
        alert('Error deleting attachment: ' + error.message);
      }
    } finally {
      setDeletingId(null);
    }
  };

  // Handle file preview
  const handleFilePreview = (attachment) => {
    if (!attachment) return;

    let fileUrl = null;
    let fileName = attachment.originalName;
    let fileType = attachment.fileType;

    // Try different methods to get the file URL
    if (attachment.url) {
      fileUrl = getFileUrl(attachment.url);
    } else if (attachment.fileName) {
      fileUrl = getFileUrl(attachment.fileName);
    }

    console.log('🔍 Preview details:', {
      attachment,
      fileUrl,
      fileName,
      fileType
    });

    if (fileUrl) {
      setPreviewFile(fileUrl);
      setPreviewFileName(fileName);
      setPreviewFileType(fileType);
    } else {
      console.warn('⚠️ No valid file URL found for preview');
      alert('Unable to preview this file. The file may not be accessible.');
    }
  };

  // Handle file download
  const handleDownload = (attachment) => {
    if (!attachment) return;

    let fileUrl = null;

    if (attachment.url) {
      fileUrl = getFileUrl(attachment.url);
    } else if (attachment.fileName) {
      fileUrl = getFileUrl(attachment.fileName);
    }

    if (fileUrl) {
      console.log('📥 Downloading file:', fileUrl);
      window.open(fileUrl, '_blank');
    } else {
      console.warn('⚠️ No valid file URL found for download');
      alert('Unable to download this file. The file may not be accessible.');
    }
  };

  const handleRemovePreview = () => {
    setPreviewFile(null);
    setPreviewFileName("");
    setPreviewFileType("");
  };

  // Sync formik with Redux state
  useEffect(() => {
    if (selectedClient && selectedClient.attachments) {
      const formattedAttachments = selectedClient.attachments.map((attachment) => ({
        ...attachment,
        _isExisting: true
      }));

      const currentAttachments = formik.values.attachments || [];
      if (JSON.stringify(currentAttachments) !== JSON.stringify(formattedAttachments)) {
        formik.setFieldValue('attachments', formattedAttachments);
      }
    }
  }, [selectedClient, formik.setFieldValue]);

  return (
    <div className="attachments-container">
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
                      const isExistingFile = attachment._id;
                      const isUploading = uploadingIndex === index;
                      const isDeleting = deletingId === attachment._id;

                      return (
                        <tr key={attachment._id || index}>
                          <td>
                            <Field
                              name={`attachments[${index}].description`}
                              className="form-control"
                              placeholder="Enter description"
                              disabled={isUploading || isDeleting}
                            />
                            <ErrorMessage
                              name={`attachments[${index}].description`}
                              component="div"
                              className="invalid-feedback"
                            />
                          </td>
                          <td>
                            <div className="d-flex flex-column">
                              {attachment.fileName ? (
                                <div className="d-flex align-items-center flex-wrap gap-2">
                                  <span className="text-truncate" style={{ maxWidth: '150px' }}>
                                    {attachment.originalName || attachment.fileName}
                                  </span>
                                  <span className="badge bg-secondary">
                                    {attachment.fileSize ? `${(attachment.fileSize / (1024 * 1024)).toFixed(1)} MB` : 'Unknown size'}
                                  </span>

                                  <button
                                    type="button"
                                    className="btn btn-sm btn-outline-primary"
                                    onClick={() => handleFilePreview(attachment)}
                                    title="Preview file"
                                    disabled={isUploading || isDeleting}
                                  >
                                    <FaEye />
                                  </button>

                                  <button
                                    type="button"
                                    className="btn btn-sm btn-outline-success"
                                    onClick={() => handleDownload(attachment)}
                                    title="Download file"
                                    disabled={isUploading || isDeleting}
                                  >
                                    <FaDownload />
                                  </button>

                                  {isExistingFile ? (
                                    <span className="badge bg-info text-dark">Saved</span>
                                  ) : (
                                    <span className="badge bg-warning text-dark">Unsaved</span>
                                  )}
                                </div>
                              ) : (
                                <>
                                  <div className="d-flex align-items-center">
                                    <label
                                      className="btn btn-sm btn-outline-secondary"
                                      title="Select file"
                                    >
                                      {isUploading ? (
                                        <>
                                          <FaSpinner className="me-1 spinner-border-sm" />
                                          Uploading...
                                        </>
                                      ) : (
                                        <>
                                          <FaUpload className="me-1" />
                                          Select File
                                        </>
                                      )}
                                      <input
                                        type="file"
                                        className="d-none"
                                        onChange={(e) => handleFileSelect(e, index)}
                                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                        disabled={loading || isUploading || isDeleting}
                                      />
                                    </label>
                                  </div>
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
                              disabled={isUploading || isDeleting}
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
                              onClick={() => handleAttachmentDelete(attachment._id, index)}
                              disabled={isUploading || isDeleting || loading}
                            >
                              {isDeleting ? (
                                <FaSpinner className="spinner-border-sm" />
                              ) : (
                                <FaTrash />
                              )}
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
                  arrayHelpers.push({
                    description: "",
                    file: null,
                    fileName: "",
                    fileType: "",
                    fileSize: 0,
                    clientAccess: "restricted",
                  })
                }}
                disabled={loading}
              >
                Add Attachment
              </button>
            </div>
          </div>
        )}
      </FieldArray>

      {/* Preview Modal */}
      {previewFile && (
        <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{previewFileName}</h5>
                <button type="button" className="btn-close" onClick={handleRemovePreview}></button>
              </div>
              <div className="modal-body">
                {previewFileType && previewFileType.includes('image/') ? (
                  <img src={previewFile} alt="Preview" className="img-fluid" />
                ) : previewFileType && previewFileType.includes('application/pdf') ? (
                  <iframe
                    src={previewFile}
                    className="w-100"
                    style={{ height: '400px' }}
                    title="PDF Preview"
                    onError={(e) => {
                      console.error('❌ Error loading PDF preview:', e);
                      e.target.innerHTML = `
                        <div class="text-center p-5">
                          <p class="text-danger">Unable to load PDF preview.</p>
                          <button class="btn btn-primary" onclick="window.open('${previewFile}', '_blank')">
                            Open PDF in new tab
                          </button>
                        </div>
                      `;
                    }}
                  />
                ) : (
                  <div className="text-center py-5">
                    <p>Preview not available for this file type.</p>
                    <p className="small text-muted">File type: {previewFileType || 'Unknown'}</p>
                    <button
                      className="btn btn-primary"
                      onClick={() => window.open(previewFile, '_blank')}
                    >
                      Open File
                    </button>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => window.open(previewFile, '_blank')}
                >
                  Open in New Tab
                </button>
                <button className="btn btn-primary" onClick={handleRemovePreview}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Save Button */}
      <div className="mt-4 pt-3 border-top d-flex justify-content-end">
        <div className="d-flex align-items-center gap-3">
          {isSaved && (
            <span className="text-success d-flex align-items-center">
              <FontAwesomeIcon icon={faCheck} className="me-1" />
              Saved successfully
            </span>
          )}
          <button
            type="button"
            className="btn btn-success"
            onClick={onSaveTab}
            disabled={isSaving || loading || !hasFilesOrAttachments()}
          >
            {isSaving ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                Saving...
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faSave} className="me-2" />
                Save
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Attachments;