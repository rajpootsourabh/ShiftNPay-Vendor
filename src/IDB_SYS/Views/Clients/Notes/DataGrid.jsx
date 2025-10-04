import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Plus from "./../../../assets/images/Plus.png";
import deleteIcon from "./../../../assets/images/icons/delete.png";
import audit from "./../../../assets/images/icons/audit.png";
import edit from "./../../../assets/images/icons/edit.png";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";
import {
  createNoteTypes,
  deleteNoteTypes,
  fetchNoteTypesById,
  fetchNoteTypesByVendor,
  updateNoteTypes,
} from "../../../../store/IDB_SYS/Clients/noteTypesSlice";

const NoteTypeSchema = Yup.object().shape({
  description: Yup.string().required("Required"),
  status: Yup.string().oneOf(["Active", "Inactive", "Pending"]).required("Required"),
});

const NoteTypeDataGrid = () => {
  const dispatch = useDispatch();
  const { noteTypes, loading } = useSelector((state) => state.noteTypes);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewData, setViewData] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [initialValues, setInitialValues] = useState({
    description: "",
    status: "Active",
  });
  const [apiLoading, setApiLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchNoteTypesByVendor());
  }, [dispatch]);

  const handleDelete = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You want to delete this note type!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        setApiLoading(true);
        dispatch(deleteNoteTypes(id)).finally(() => {
          setApiLoading(false);
        });
      }
    });
  };

  const handleEdit = (id) => {
    setApiLoading(true);
    dispatch(fetchNoteTypesById(id)).then((res) => {
      if (res.payload) {
        setInitialValues(res.payload);
        setEditMode(true);
        setShowModal(true);
      }
    }).finally(() => {
      setApiLoading(false);
    });
  };

  const handleView = (row) => {
    setViewData(row);
    setShowViewModal(true);
  };

  const handleSubmit = (values, { setSubmitting, resetForm }) => {
    setApiLoading(true);
    if (editMode) {
      dispatch(updateNoteTypes({ id: values._id, data: values })).then(() => {
        setSubmitting(false);
        setShowModal(false);
        setEditMode(false);
      }).finally(() => {
        setApiLoading(false);
      });
    } else {
      dispatch(createNoteTypes(values)).then(() => {
        setSubmitting(false);
        setShowModal(false);
      }).finally(() => {
        setApiLoading(false);
      });
    }
    resetForm();
  };

  return (
    <>
      {apiLoading && (
        <div className="overlay">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}

      <div className="table-responsive table-striped custom-table-new">
        <table className="table table-bordered">
          <thead className="table-success text-white">
            <tr>
              <th style={{ width: "90px" }}>
                <div className="d-flex flex-wrap">
                  <div
                    className="custom-btn py-1 round"
                    onClick={() => {
                      setShowModal(true);
                      setEditMode(false);
                      setInitialValues({
                        description: "",
                        status: "Active",
                      });
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    <span className="d-flex align-items-center">
                      <img src={Plus} className="icons mx-1" />
                      <span> New </span>
                    </span>
                  </div>
                </div>
              </th>
              <th className="text-center">Description</th>
              <th className="text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {noteTypes.length > 0 ? (
              noteTypes.map((row, index) => (
                <tr key={index}>
                  <td>
                    <div className="d-flex flex-wrap">
                      <div className="action-buttons">
                        <span
                          className="d-flex align-items-center"
                          onClick={() => handleEdit(row._id)}
                          style={{ cursor: "pointer" }}
                        >
                          <img src={edit} className="icons mx-1" />
                        </span>
                        <span
                          className="d-flex align-items-center"
                          onClick={() => handleDelete(row._id)}
                          style={{ cursor: "pointer" }}
                        >
                          <img src={deleteIcon} className="icons mx-1" />
                        </span>
                        <span
                          className="d-flex align-items-center"
                          style={{ cursor: "pointer" }}
                          onClick={() => handleView(row)}
                        >
                          <img src={audit} className="icons mx-1" />
                        </span>
                      </div>
                    </div>
                  </td>
                  <td>{row.description}</td>
                  <td>{row.status}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="text-center">
                  No record found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg" style={{ maxWidth: '600px' }}>
              <Formik
                initialValues={initialValues}
                validationSchema={NoteTypeSchema}
                enableReinitialize
                onSubmit={handleSubmit}
              >
                {({ isSubmitting }) => (
                  <Form>
                    <div className="modal-header bg-green text-white py-2">
                      <h5 className="modal-title fs-6">
                        {editMode ? "Edit Note Type" : "Add New Note Type"}
                      </h5>
                      <button
                        type="button"
                        className="btn-close btn-close-white"
                        onClick={() => setShowModal(false)}
                        disabled={isSubmitting}
                      ></button>
                    </div>
                    <div className="modal-body p-3">
                      <div className="mb-2">
                        <label className="form-label small fw-semibold">Description</label>
                        <Field
                          type="text"
                          name="description"
                          className="form-control form-control-sm"
                        />
                        <ErrorMessage name="description" component="div" className="text-danger small mt-1" />
                      </div>

                      <div className="mb-2">
                        <label className="form-label small fw-semibold">Status</label>
                        <Field
                          as="select"
                          name="status"
                          className="form-select form-select-sm"
                        >
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                          <option value="Pending">Pending</option>
                        </Field>
                        <ErrorMessage name="status" component="div" className="text-danger small mt-1" />
                      </div>
                    </div>
                    <div className="modal-footer border-0 bg-light py-2">
                      <button
                        type="button"
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() => setShowModal(false)}
                        disabled={isSubmitting}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="btn btn-success btn-sm px-3"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Saving..." : "Save"}
                      </button>
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && viewData && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg" style={{ maxWidth: '600px' }}>
              <div className="modal-header bg-green text-white py-2">
                <h5 className="modal-title fs-6">View Note Type Details</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowViewModal(false)}
                ></button>
              </div>
              <div className="modal-body p-3">
                <div className="mb-2">
                  <label className="form-label small fw-semibold">Description</label>
                  <div className="form-control-plaintext form-control-sm bg-light rounded p-2">
                    {viewData.description}
                  </div>
                </div>

                <div className="mb-2">
                  <label className="form-label small fw-semibold">Status</label>
                  <div className="form-control-plaintext form-control-sm bg-light rounded p-2">
                    {viewData.status}
                  </div>
                </div>
              </div>
              <div className="modal-footer border-0 bg-light py-2">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowViewModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NoteTypeDataGrid;
