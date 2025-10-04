import React, { useState } from 'react';
import { Modal, Button } from 'reactstrap';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';

const FileUploadComponent = ({ onDataExtracted }) => {
  const [showModal, setShowModal] = useState(false);

  // Function to open the modal
  const handleOpenModal = () => {
    setShowModal(true);
  };

  // Function to close the modal
  const handleCloseModal = () => {
    setShowModal(false);
  };

  // Function to handle file drop and extraction
  const handleFileDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const data = reader.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        // Passing the extracted data back to the parent component
        onDataExtracted(jsonData);
        handleCloseModal(); // Close modal after data is extracted
      };
      reader.readAsBinaryString(file);
    }
  };

  // Dropzone configuration
  const { getRootProps, getInputProps } = useDropzone({
    onDrop: handleFileDrop,
    accept: '.xlsx', // Only accept .xlsx files
  });

  return (
    <div>
      {/* Upload Doc Button */}
      <Button color="primary" onClick={handleOpenModal}>
        Upload Doc
      </Button>

      {/* Modal for file upload */}
      <Modal isOpen={showModal} toggle={handleCloseModal}>
        <div className="modal-header">
          <h5 className="modal-title">Upload Excel File</h5>
          <button
            type="button"
            className="close"
            onClick={handleCloseModal}
            aria-label="Close"
          >
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div className="modal-body">
          <div
            {...getRootProps()}
            style={{
              border: '2px dashed #ccc',
              padding: '20px',
              textAlign: 'center',
              cursor: 'pointer',
            }}
          >
            <input {...getInputProps()} />
            <p>Drag & drop an .xlsx file here, or click to select one.</p>
          </div>
        </div>
        <div className="modal-footer">
          <Button color="secondary" onClick={handleCloseModal}>
            Close
          </Button>
        </div>
      </Modal>
    </div>
  );
};
// Correct way to export
export default FileUploadComponent;
