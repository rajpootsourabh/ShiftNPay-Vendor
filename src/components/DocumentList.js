import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "reactstrap";
import Modal from "react-bootstrap/Modal";
import Swal from "sweetalert2";
import { deleteDocument, fetchDocuments, uploadDocument } from "../store/Product/documentSlice";
import { formatDate, formatFileSize } from "../Helper/functions";
import { debounce } from "lodash";
const BaseUrl = process.env.REACT_APP_BASH_DOC_URL;
const DocumentList = () => {
    const dispatch = useDispatch();

    const [search, setSearch] = useState("");
    const [date, setDate] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const { documents, loading } = useSelector((state) => state.documents);
    const [documentId, setDocumentId] = useState("");

    useEffect(() => {
        const fetchDocs = debounce(() => {
            dispatch(fetchDocuments({ date, search }));
        }, 500);
        fetchDocs();
        return () => fetchDocs.cancel();
    }, [search, date]);

    const handleSearch = (e) => setSearch(e.target.value);
    const handleDateChange = (e) => setDate(e.target.value);

    const handleFileSelect = (e) => setSelectedFile(e.target.files[0]);
    const handleRemoveFile = () => setSelectedFile(null);

    const handleFileUpload = async () => {

        if (!documentId.trim()) {
            Swal.fire("Error", "Please Enter Document Id.", "error");;
            return;
        }

        if (!selectedFile) {
            Swal.fire("Error", "Please select a file to upload.", "error");
            return;
        }

       


        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("documentId", `${documentId}`);

        try {
            const response = await dispatch(uploadDocument(formData)).unwrap(); // Ensure proper handling

            if (response.success) { // Check API response (modify based on your API structure)
                Swal.fire("Success", "File uploaded successfully", "success");
                setSelectedFile(null);
                setShowModal(false); // Hide modal only on success
            } else {
                Swal.fire("Error", response.message || "File upload failed", "error");
            }
        } catch (error) {
            Swal.fire("Error", error.message || "Something went wrong", "error");
        } finally {
        }
    };


    const handleDelete = async (itemId) => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!",
            showLoaderOnConfirm: true,
            allowOutsideClick: false,
            allowEscapeKey: false,
            preConfirm: async () => {
                try {
                    await dispatch(deleteDocument(itemId)).unwrap(); // Ensure proper error handling
                    return true; // Resolve the promise successfully
                } catch (error) {
                    Swal.showValidationMessage(error?.message || "Failed to delete the file.");
                    return false; // Keep the alert open
                }
            },
        });

        if (result.isConfirmed) {
            Swal.fire("Deleted!", "Your file has been deleted.", "success");
        }
    };



    const searchFiles = () => {
        dispatch(fetchDocuments({ date, search }));
    };
    const handleView = (fileUrl) => {
        window.open(`${BaseUrl + fileUrl}`, "_blank");
    };
    const handleReset = () => {
        setSearch("");
        setDate("");
        dispatch(fetchDocuments({ date: "", search: "" }));
    };

    return (
        <div className="container my-4">
            <div className="row">
                <div className="col-lg-12 col-md-12 col-sm-12 p-4">
                    <div className="row rounded">
                        <div className="card p-3 mb-4">
                            <form className="row g-3 py-3">
                                <div className="col-md-6">
                                    <label htmlFor="memberName" className="w-50 pb-2">
                                        Search File
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={search}
                                        onChange={handleSearch}
                                    />
                                </div>
                                <div className="col-md-2">
                                    <label htmlFor="memberName" className="w-50 pb-2">
                                        Date
                                    </label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        value={date}
                                        onChange={handleDateChange}
                                    />
                                </div>
                                <div className="col-md-2 text-center d-flex justify-content-end align-items-end ">
                                    <button
                                        type="button"
                                        className="btn btn-success mx-2"
                                        onClick={() => {
                                            searchFiles();
                                        }}
                                    >
                                        Submit
                                    </button>
                                    <button
                                        type="reset"
                                        className="btn btn-light   mx-2"
                                        onClick={handleReset}
                                    >
                                        Clear
                                    </button>
                                </div>
                            </form>
                        </div>
                        <div className="d-flex justify-content-between align-items-center mb-3 mt-4">
                            <button
                                className="btn btn-success"
                                onClick={() => setShowModal(true)}
                            >
                                Upload Document
                            </button>
                        </div>
                        <table className="custom-table w-full divide-y divide-gray-200 timetracker">
                            <thead>
                                <tr>
                                    <th>Document No.</th>
                                    <th>Document Name</th>
                                    <th>File Size</th>
                                    <th>Date</th>
                                    <th className="text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="text-center">
                                {documents?.length ? (
                                    documents?.map((file, index) => (
                                        <tr key={index}>
                                            <td>{file.docIdentity}</td>
                                            <td>
                                                <div
                                                    className="d-flex align-items-center"
                                                    style={{ gap: "3px" }}
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        viewBox="0 0 384 512"
                                                        width="16px"
                                                        height="16px"
                                                    >
                                                        <path d="M64 0C28.7 0 0 28.7 0 64L0 448c0 35.3 28.7 64 64 64l256 0c35.3 0 64-28.7 64-64l0-288-128 0c-17.7 0-32-14.3-32-32L224 0 64 0zM256 0l0 128 128 0L256 0zM112 256l160 0c8.8 0 16 7.2 16 16s-7.2 16-16 16l-160 0c-8.8 0-16-7.2-16-16s7.2-16 16-16zm0 64l160 0c8.8 0 16 7.2 16 16s-7.2 16-16 16l-160 0c-8.8 0-16-7.2-16-16s7.2-16 16-16zm0 64l160 0c8.8 0 16 7.2 16 16s-7.2 16-16 16l-160 0c-8.8 0-16-7.2-16-16s7.2-16 16-16z" />
                                                    </svg>
                                                    <p className="mb-0">{file.fileName}</p>
                                                </div>
                                            </td>
                                            <td>
                                                <div
                                                    className="d-flex align-items-center"
                                                    style={{ gap: "3px" }}
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        width="16px"
                                                        height="16px"
                                                        viewBox="0 0 384 512"
                                                    >
                                                        <path d="M0 64C0 28.7 28.7 0 64 0L224 0l0 128c0 17.7 14.3 32 32 32l128 0 0 288c0 35.3-28.7 64-64 64L64 512c-35.3 0-64-28.7-64-64L0 64zm384 64l-128 0L256 0 384 128z" />
                                                    </svg>
                                                    <p className="mb-0 ml-1">
                                                        {formatFileSize(file.fileSize)}
                                                    </p>
                                                </div>
                                            </td>
                                            <td>
                                                <div
                                                    className="d-flex align-items-center"
                                                    style={{ gap: "3px" }}
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        width="16px"
                                                        height="16px"
                                                        viewBox="0 0 448 512"
                                                    >
                                                        <path d="M96 32l0 32L48 64C21.5 64 0 85.5 0 112l0 48 448 0 0-48c0-26.5-21.5-48-48-48l-48 0 0-32c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 32L160 64l0-32c0-17.7-14.3-32-32-32S96 14.3 96 32zM448 192L0 192 0 464c0 26.5 21.5 48 48 48l352 0c26.5 0 48-21.5 48-48l0-272z" />
                                                    </svg>
                                                    <p className="mb-0 ml-1">{formatDate(file.date)}</p>
                                                </div>
                                            </td>
                                            <td
                                                className="d-flex justify-content-around document-action"
                                                style={{ "border-bottom": "none" }}
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    width="20px"
                                                    height="20px"
                                                    viewBox="0 0 576 512"
                                                    fill="blue"
                                                    onClick={() => handleView(file.fileUrl)}
                                                >
                                                    <path d="M288 80c-65.2 0-118.8 29.6-159.9 67.7C89.6 183.5 63 226 49.4 256c13.6 30 40.2 72.5 78.6 108.3C169.2 402.4 222.8 432 288 432s118.8-29.6 159.9-67.7C486.4 328.5 513 286 526.6 256c-13.6-30-40.2-72.5-78.6-108.3C406.8 109.6 353.2 80 288 80zM95.4 112.6C142.5 68.8 207.2 32 288 32s145.5 36.8 192.6 80.6c46.8 43.5 78.1 95.4 93 131.1c3.3 7.9 3.3 16.7 0 24.6c-14.9 35.7-46.2 87.7-93 131.1C433.5 443.2 368.8 480 288 480s-145.5-36.8-192.6-80.6C48.6 356 17.3 304 2.5 268.3c-3.3-7.9-3.3-16.7 0-24.6C17.3 208 48.6 156 95.4 112.6zM288 336c44.2 0 80-35.8 80-80s-35.8-80-80-80c-.7 0-1.3 0-2 0c1.3 5.1 2 10.5 2 16c0 35.3-28.7 64-64 64c-5.5 0-10.9-.7-16-2c0 .7 0 1.3 0 2c0 44.2 35.8 80 80 80zm0-208a128 128 0 1 1 0 256 128 128 0 1 1 0-256z" />
                                                </svg>
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    width="20px"
                                                    height="20px"
                                                    viewBox="0 0 448 512"
                                                    fill="#008000"
                                                    onClick={() => handleDelete(file._id)}
                                                >
                                                    <path d="M135.2 17.7L128 32 32 32C14.3 32 0 46.3 0 64S14.3 96 32 96l384 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-96 0-7.2-14.3C307.4 6.8 296.3 0 284.2 0L163.8 0c-12.1 0-23.2 6.8-28.6 17.7zM416 128L32 128 53.2 467c1.6 25.3 22.6 45 47.9 45l245.8 0c25.3 0 46.3-19.7 47.9-45L416 128z" />
                                                </svg>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td className="px-4 py-2 text-center" colSpan="4">
                                            <p>No Record Found.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                <Modal
                    show={showModal}
                    onHide={() => setShowModal(false)}
                    centered
                    className="custom-modal custom-view-modal"
                >
                    <Modal.Header closeButton>
                        <Modal.Title>Upload Document</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="mb-3">
                            <label className="form-label">Document ID</label>
                            <div className="input-group">
                                <span className="input-group-text">Title</span>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Enter document ID"
                                    value={documentId}
                                    onChange={(e) => setDocumentId(e.target.value)}
                                />
                            </div>
                        </div>
                        <p className="text-muted f15">
                            Supported file format (.docx , .pdf only )
                        </p>
                        <div className="upload-section text-center p-4 rounded">
                            <div className="mb-3">
                                <i className="fas fa-file-upload fa-3x text-success"></i>
                            </div>

                            {selectedFile ? (
                                <div className="file-info text-center">
                                    <p>{selectedFile.name}</p>
                                    <button
                                        onClick={handleRemoveFile}
                                        className="btn btn-danger btn-sm"
                                    >
                                        &times; Remove File
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <input
                                        type="file"
                                        onChange={handleFileSelect}
                                        className="form-control"
                                        style={{ display: "none" }}
                                        id="fileInput"
                                        accept=".docx, .pdf"
                                    />
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="40px"
                                        height="40px"
                                        fill="green"
                                        viewBox="0 0 576 512"
                                    >
                                        <path d="M160 32c-35.3 0-64 28.7-64 64l0 224c0 35.3 28.7 64 64 64l352 0c35.3 0 64-28.7 64-64l0-224c0-35.3-28.7-64-64-64L160 32zM396 138.7l96 144c4.9 7.4 5.4 16.8 1.2 24.6S480.9 320 472 320l-144 0-48 0-80 0c-9.2 0-17.6-5.3-21.6-13.6s-2.9-18.2 2.9-25.4l64-80c4.6-5.7 11.4-9 18.7-9s14.2 3.3 18.7 9l17.3 21.6 56-84C360.5 132 368 128 376 128s15.5 4 20 10.7zM192 128a32 32 0 1 1 64 0 32 32 0 1 1 -64 0zM48 120c0-13.3-10.7-24-24-24S0 106.7 0 120L0 344c0 75.1 60.9 136 136 136l320 0c13.3 0 24-10.7 24-24s-10.7-24-24-24l-320 0c-48.6 0-88-39.4-88-88l0-224z" />
                                    </svg>
                                    <p className="mt-2">Drag and Drop File here or</p>
                                    <label htmlFor="fileInput" className="btn btn-outline-success">
                                        Browse File
                                    </label>
                                </>
                            )}
                        </div>
                    </Modal.Body>
                    <Modal.Footer className="d-flex justify-content-between">
                        <p
                            type="button"
                            className="btn btn-outline-success"
                            onClick={() => setShowModal(false)}
                            disabled={loading}
                        >
                            <i className="fas fa-times"></i> Cancel
                        </p>
                        <Button
                            disabled={loading}
                            type="button"
                            className="btn btn-success"
                            onClick={handleFileUpload}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 512 512"
                                width="16px"
                                height="16px"
                                fill="white"
                            >
                                <path d="M288 109.3L288 352c0 17.7-14.3 32-32 32s-32-14.3-32-32l0-242.7-73.4 73.4c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3l128-128c12.5-12.5 32.8-12.5 45.3 0l128 128c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L288 109.3zM64 352l128 0c0 35.3 28.7 64 64 64s64-28.7 64-64l128 0c35.3 0 64 28.7 64 64l0 32c0 35.3-28.7 64-64 64L64 512c-35.3 0-64-28.7-64-64l0-32c0-35.3 28.7-64 64-64zM432 456a24 24 0 1 0 0-48 24 24 0 1 0 0 48z" />
                            </svg>{" "}
                            {loading ? 'Uploading...' : 'Upload'}
                        </Button>
                    </Modal.Footer>
                </Modal>
            </div>
        </div>
    );
};
export default DocumentList;
