import React, { useState, useEffect } from "react";
import { Button, Table, Modal, ModalHeader, ModalBody } from "reactstrap";
import { updateEmployeeChecklist } from "../store/CheckList/checklistSlice";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";

const basImgUrl = process.env.REACT_APP_BASH_IMG_URL;
const UpdateChecklistModal = ({ items, open, onClose }) => {
  const dispatch = useDispatch();
  const [uploadedDocuments, setUploadedDocuments] = useState({});
  const [ratings, setRatings] = useState({});
  const [status, setStatus] = useState({});

  useEffect(() => {
    if (open) {
      const initialRatings = {};
      const initialDocuments = {};
      const initialStatus = {};
      items.stepsStatus.forEach((step, idx) => {
        initialRatings[idx] =
          step.rating && step.rating != null ? step.rating : 0;
        initialDocuments[idx] =
          step.document && step.document != null ? step.document : null;
        initialStatus[idx] = step.isClosed || false;
      });
      setRatings(initialRatings);
      setUploadedDocuments(initialDocuments);
      setStatus(initialStatus);
    }
  }, [open, items]);

  const handleFileUpload = (e, idx) => {
    const file = e.target.files[0];
    setUploadedDocuments((prevState) => ({
      ...prevState,
      [idx]: file, // Store the actual file object
    }));
  };

  const handleRating = (rate, idx) => {
    setRatings((prevState) => ({
      ...prevState,
      [idx]: rate,
    }));
  };

  const handleDeleteDocument = (idx) => {
    setUploadedDocuments((prevState) => ({
      ...prevState,
      [idx]: null, // Clear the document field
    }));
  };

  const handleStatusChange = (idx) => {
    setStatus((prevState) => ({
      ...prevState,
      [idx]: !prevState[idx], // Toggle between open and completed
    }));
  };

  const handleAssignChecklist = () => {
    const checklistData = items.stepsStatus.map((stepStatus, idx) => ({
      stepId: stepStatus.stepId,
      rating: ratings[idx] || 0,
      isClosed: status[idx],
    }));

    let employeeId = items.employee._id;
    let checklistId = items.checklist._id;

    // Create FormData
    const formData = new FormData();
    formData.append("employeeId", employeeId);
    formData.append("checklistId", checklistId);
    checklistData.forEach((data, idx) => {
      formData.append(`stepsStatus[${idx}][stepId]`, data.stepId);
      formData.append(`stepsStatus[${idx}][rating]`, data.rating);
      formData.append(`stepsStatus[${idx}][isClosed]`, data.isClosed);
      console.log("uploadedDocuments[idx]    : ", uploadedDocuments[idx]);
      if (uploadedDocuments[idx]) {
        formData.append(
          `stepsStatus[${idx}][document]`,
          uploadedDocuments[idx]
        ); // Append the actual file
      }
    });

    dispatch(updateEmployeeChecklist(formData));
    toast.success('checklist data updated successfully.')
    onClose();
  };

  const resetForm = () => {
    setUploadedDocuments({});
    setRatings({});
    setStatus({});
    onClose();
  };
  const openDocument = (document) => {
    console.log(document);
    console.log(typeof document);
    if (typeof document == "string") {
      window.open(`${basImgUrl}/documents/${document}`, "_blank");
    } else {
      window.open(URL.createObjectURL(document), "_blank");
    }
  };
  const renderRatingStars = (rating, idx) => {
    return (
      <div>
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            onClick={() => handleRating(star, idx)}
            xmlns="http://www.w3.org/2000/svg"
            width="24px"
            height="24px"
            fill={star <= (ratings[idx] || rating) ? "gold" : "gray"}
            viewBox="0 0 24 24"
            style={{ cursor: "pointer", marginRight: "4px" }}
          >
            <path d="M12 .587l3.668 7.431 8.2 1.191-5.93 5.771 1.4 8.161L12 18.897l-7.338 3.845 1.4-8.161L.13 9.209l8.2-1.191L12 .587z" />
          </svg>
        ))}
      </div>
    );
  };

  return (
    <Modal
      isOpen={open}
      toggle={resetForm}
      style={{ minWidth: "750px" }}
      className="addEmployee"
    >
      <ModalHeader toggle={resetForm}>View Checklist Steps</ModalHeader>
      <ModalBody className="d-flex p-4">
        <div className="w-100" style={{ minHeight: "350px" }}>
          <Table className="overflow-hidden mb-0">
            <thead>
              <tr>
                <th>Status</th>
                <th>Select Steps</th>
                <th>Upload Document</th>
                <th>Select Rating</th>
              </tr>
            </thead>
            <tbody>
              {items?.stepsStatus?.length ? (
                items.stepsStatus.map((step, idx) => (
                  <tr key={idx} style={{ verticalAlign: "middle" }}>
                    <td >
                      <div className="custom-checkbox">
                        <input
                          type="checkbox"
                          id={`statusCheckbox${idx}`}
                          checked={status[idx]}
                          onChange={() => handleStatusChange(idx)}
                        />
                        <label htmlFor={`statusCheckbox${idx}`}></label>
                      </div>
                    </td>

                    <td>
                      <strong>{items?.checklist?.steps[idx]?.title}</strong>
                    </td>
                    <td align="left">
                      {uploadedDocuments[idx] &&
                      uploadedDocuments[idx] != null ? (
                        <div className="d-flex justify-content-space gap-2">
                          <Button
                            color="success"
                            onClick={() => openDocument(uploadedDocuments[idx])}
                            className="ml-2"
                          >
                            View
                          </Button>
                          <Button
                            color="danger"
                            onClick={() => handleDeleteDocument(idx)}
                            className="ml-2"
                          >
                            Remove
                          </Button>
                        </div>
                      ) : (
                        <div>
                          <button
                            type="button"
                            className="btn btn-secondary btn-success"
                            onClick={() =>
                              document
                                .getElementById(`fileInput-${idx}`)
                                .click()
                            }
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 512 512"
                              width="16px"
                              height="16px"
                              fill="white"
                            >
                              <path d="M288 109.3L288 352c0 17.7-14.3 32-32 32s-32-14.3-32-32l0-242.7-73.4 73.4c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3l128-128c12.5-12.5 32.8-12.5 45.3 0l128 128c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L288 109.3zM64 352l128 0c0 35.3 28.7 64 64 64s64-28.7 64-64l128 0c35.3 0 64 28.7 64 64l0 32c0 35.3-28.7 64-64 64L64 512c-35.3 0-64-28.7-64-64l0-32c0-35.3 28.7-64 64-64zM432 456a24 24 0 1 0 0-48 24 24 0 1 0 0 48z"></path>
                            </svg>{" "}
                            Upload
                          </button>
                          <input
                            id={`fileInput-${idx}`}
                            type="file"
                            style={{ display: "none" }}
                            onChange={(e) => handleFileUpload(e, idx)}
                          />
                        </div>
                      )}
                    </td>
                    <td>{renderRatingStars(step.rating ?? 0, idx)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-4 py-4 text-center" colSpan="3">
                    <p className="mb-0">No Record Found.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      </ModalBody>
      <div className="pb-4 text-center">
        <Button
          color="success"
          className="px-5"
          onClick={handleAssignChecklist}
        >
          Submit
        </Button>
      </div>
    </Modal>
  );
};

export default UpdateChecklistModal;
