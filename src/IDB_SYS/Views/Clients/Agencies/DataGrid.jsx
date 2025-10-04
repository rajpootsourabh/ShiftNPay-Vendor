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
  createAgency,
  deleteAgency,
  fetchAgencyById,
  fetchAgenciesByVendor,
  updateAgency,
} from "../../../../store/IDB_SYS/Clients/agencySlice";

const AgencySchema = Yup.object().shape({
  agency: Yup.string().required("Required"),
  address_1: Yup.string().required("Required"),
  address_2: Yup.string().required("Required"),
  city: Yup.string().required("Required"),
  state: Yup.string().required("Required"),
  zip: Yup.string().required("Required"),
});

const DataGrid = () => {
  const dispatch = useDispatch();
  const { agencies, selectedAgency, loading } = useSelector((state) => state.agency);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewData, setViewData] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [initialValues, setInitialValues] = useState({
    agency: "",
    address_1: "",
    address_2: "",
    city: "",
    state: "",
    zip: "",
  });
  const [apiLoading, setApiLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchAgenciesByVendor());
  }, [dispatch]);

  const handleDelete = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You want to delete this agency!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        setApiLoading(true);
        dispatch(deleteAgency(id)).finally(() => {
          setApiLoading(false);
        });
      }
    });
  };

  const handleEdit = (id) => {
    setApiLoading(true);
    dispatch(fetchAgencyById(id)).then((res) => {
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
      dispatch(updateAgency({ id: values._id, data: values })).then(() => {
        setSubmitting(false);
        setShowModal(false);
        setEditMode(false);
      }).finally(() => {
        setApiLoading(false);
      });
    } else {
      const payload = { ...values };
      dispatch(createAgency(payload)).then(() => {
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
                        agency: "",
                        address_1: "",
                        address_2: "",
                        city: "",
                        state: "",
                        zip: "",
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
              <th className="text-center" style={{ width: "150px" }}>
                Agency Name
              </th>
              <th className="text-center" style={{ width: "150px" }}>
                Address 1
              </th>
              <th className="text-center" style={{ width: "150px" }}>
                Address 2
              </th>
              <th className="text-center" style={{ width: "80px" }}>
                City
              </th>
              <th className="text-center" style={{ width: "80px" }}>
                State
              </th>
              <th className="text-center" style={{ width: "120px" }}>
                Zip
              </th>
            </tr>
          </thead>
          <tbody>
            {agencies.length > 0 ? (
              agencies.map((row, index) => (
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
                  <td>{row.agency}</td>
                  <td>{row.address_1}</td>
                  <td>{row.address_2}</td>
                  <td>{row.city}</td>
                  <td>{row.state}</td>
                  <td>{row.zip}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center">
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
                validationSchema={AgencySchema}
                enableReinitialize
                onSubmit={handleSubmit}
              >
                {({ isSubmitting }) => (
                  <Form>
                    <div className="modal-header bg-green text-white py-2">
                      <h5 className="modal-title fs-6">
                        {editMode ? "Edit Agency" : "Add New Agency"}
                      </h5>
                      <button
                        type="button"
                        className="btn-close btn-close-white"
                        onClick={() => setShowModal(false)}
                        disabled={isSubmitting}
                      ></button>
                    </div>
                    <div className="modal-body p-3">
                      <div className="row g-2">
                        <div className="col-md-12">
                          <div className="mb-2">
                            <label className="form-label small fw-semibold">Agency</label>
                            <Field
                              type="text"
                              name="agency"
                              className="form-control form-control-sm"
                            />
                            <ErrorMessage
                              name="agency"
                              component="div"
                              className="text-danger small mt-1"
                            />
                          </div>
                        </div>
                        
                        <div className="col-md-6">
                          <div className="mb-2">
                            <label className="form-label small fw-semibold">Address 1</label>
                            <Field
                              type="text"
                              name="address_1"
                              className="form-control form-control-sm"
                            />
                            <ErrorMessage
                              name="address_1"
                              component="div"
                              className="text-danger small mt-1"
                            />
                          </div>
                        </div>
                        
                        <div className="col-md-6">
                          <div className="mb-2">
                            <label className="form-label small fw-semibold">Address 2</label>
                            <Field
                              type="text"
                              name="address_2"
                              className="form-control form-control-sm"
                            />
                            <ErrorMessage
                              name="address_2"
                              component="div"
                              className="text-danger small mt-1"
                            />
                          </div>
                        </div>
                        
                        <div className="col-md-4">
                          <div className="mb-2">
                            <label className="form-label small fw-semibold">City</label>
                            <Field
                              type="text"
                              name="city"
                              className="form-control form-control-sm"
                            />
                            <ErrorMessage
                              name="city"
                              component="div"
                              className="text-danger small mt-1"
                            />
                          </div>
                        </div>
                        
                        <div className="col-md-4">
                          <div className="mb-2">
                            <label className="form-label small fw-semibold">State</label>
                            <Field
                              type="text"
                              name="state"
                              className="form-control form-control-sm"
                            />
                            <ErrorMessage
                              name="state"
                              component="div"
                              className="text-danger small mt-1"
                            />
                          </div>
                        </div>
                        
                        <div className="col-md-4">
                          <div className="mb-2">
                            <label className="form-label small fw-semibold">Zip</label>
                            <Field
                              type="text"
                              name="zip"
                              className="form-control form-control-sm"
                            />
                            <ErrorMessage
                              name="zip"
                              component="div"
                              className="text-danger small mt-1"
                            />
                          </div>
                        </div>
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
                        {isSubmitting ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                            Saving...
                          </>
                        ) : (
                          "Save"
                        )}
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
                <h5 className="modal-title fs-6">View Agency Details</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowViewModal(false)}
                ></button>
              </div>
              <div className="modal-body p-3">
                <div className="row g-2">
                  <div className="col-md-12">
                    <div className="mb-2">
                      <label className="form-label small fw-semibold">Agency</label>
                      <div className="form-control-plaintext form-control-sm bg-light rounded p-2">
                        {viewData.agency}
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-md-6">
                    <div className="mb-2">
                      <label className="form-label small fw-semibold">Address 1</label>
                      <div className="form-control-plaintext form-control-sm bg-light rounded p-2">
                        {viewData.address_1}
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-md-6">
                    <div className="mb-2">
                      <label className="form-label small fw-semibold">Address 2</label>
                      <div className="form-control-plaintext form-control-sm bg-light rounded p-2">
                        {viewData.address_2}
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-md-4">
                    <div className="mb-2">
                      <label className="form-label small fw-semibold">City</label>
                      <div className="form-control-plaintext form-control-sm bg-light rounded p-2">
                        {viewData.city}
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-md-4">
                    <div className="mb-2">
                      <label className="form-label small fw-semibold">State</label>
                      <div className="form-control-plaintext form-control-sm bg-light rounded p-2">
                        {viewData.state}
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-md-4">
                    <div className="mb-2">
                      <label className="form-label small fw-semibold">Zip</label>
                      <div className="form-control-plaintext form-control-sm bg-light rounded p-2">
                        {viewData.zip}
                      </div>
                    </div>
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
      
      <style jsx>{`
        .overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.2);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 9999;
        }
        .modal-content {
          border-radius: 5px;
          overflow: hidden;
        }
        .modal-header {
          border-bottom: 1px solid rgba(0, 0, 0, 0.1);
        }
        .modal-footer {
          border-top: 1px solid rgba(0, 0, 0, 0.1);
        }
        .form-control-sm {
          padding: 0.25rem 0.5rem;
          font-size: 0.875rem;
          border-radius: 0.2rem;
        }
        .custom-btn:hover {
          background-color: lightgrey;
        }
        .action-buttons span:hover {
          opacity: 0.8;
        }
        .form-control-plaintext {
          min-height: calc(1.5em + 0.5rem + 2px);
        }
      `}</style>
    </>
  );
};

export default DataGrid;