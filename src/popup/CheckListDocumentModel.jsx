import React, { useState, useEffect } from "react";
import { Button, Table, Modal, ModalHeader, ModalBody } from "reactstrap";
import { updateEmployeeChecklist } from "../store/CheckList/checklistSlice";
import { useDispatch } from "react-redux";
import { formatFileSize } from "../Helper/functions";
const basImgUrl = process.env.REACT_APP_BASH_IMG_URL;
const CheckListDocumentModel = ({ items, open, onClose }) => {
  const dispatch = useDispatch();
  const [uploadedDocuments, setUploadedDocuments] = useState({});

  useEffect(() => {
    if (open) {
      const initialDocuments = {};
      items.stepsStatus.forEach((step, idx) => {
        initialDocuments[idx] =
          step.document && step.document != null
            ? { url: `${basImgUrl}/documents/${step.document}` }
            : null;
      });
      setUploadedDocuments(initialDocuments);
    }
  }, [open, items]);

  const openDocument = (document) => {
    window.open(document.url, "_blank");
  };

  const resetForm = () => {
    setUploadedDocuments({});
    onClose();
  };
  return (
    <Modal
      isOpen={open}
      toggle={resetForm}
      style={{ minWidth: "750px" }}
      className="addEmployee"
    >
      <ModalHeader toggle={resetForm}>View Checklist Documents</ModalHeader>
      <ModalBody className="d-flex p-4">
        <div className="w-100">
          <Table className="overflow-hidden mb-0">
            <thead>
              <tr>
                <th>Step</th>
                <th>Document name</th>
                <th>Size</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {items?.stepsStatus?.length ? (
                items.stepsStatus.map((step, idx) => (
                  <tr key={idx} style={{ verticalAlign: "middle" }}>
                    <td style={{ height: "50px" }}>
                      <strong>{items?.checklist?.steps[idx]?.title}</strong>
                    </td>
                    <td align="left">
                      <strong>
                        {step?.document ? (
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
                            <p className="mb-0">
                              {step?.document}
                            </p>
                          </div>
                        ) : (
                          "---"
                        )}
                      </strong>
                    </td>

                    <td align="left">
                      <strong>
                        {step?.fileSize ? (
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
                              {formatFileSize(step?.fileSize)}
                            </p>
                          </div>
                        ) : (
                          "---"
                        )}
                      </strong>
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
                        </div>
                      ) : (
                        <strong>---</strong>
                      )}
                    </td>
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
    </Modal>
  );
};

export default CheckListDocumentModel;
