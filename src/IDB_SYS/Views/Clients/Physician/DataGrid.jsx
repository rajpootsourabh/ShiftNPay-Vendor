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
  fetchPhysicianByVendor,
  fetchPhysicianById,
  createPhysician,
  updatePhysician,
  deletePhysician
} from "../../../../store/IDB_SYS/Clients/physicianSlice";

const PhysicianSchema = Yup.object().shape({
  name: Yup.string().required("Required"),
  firstName: Yup.string().required("Required"),
  lastName: Yup.string().required("Required"),
  specialty: Yup.string(),
  address1: Yup.string(),
  address2: Yup.string(),
  city: Yup.string(),
  state: Yup.string(),
  zip: Yup.string().matches(/^\d{5}(-\d{4})?$/, "Invalid ZIP code format"),
  phone: Yup.string(),
  altPhone: Yup.string(),
  fax: Yup.string(),
  email: Yup.string().email("Invalid email"),
  status: Yup.string().oneOf(["Active", "Inactive"]).required("Required"),
  npi: Yup.string(),
  qualId: Yup.string(),
  qualNumber: Yup.string(),
  taxonomyCode: Yup.string(),
  taxonomyNumber: Yup.string(),
  providerAssignedId: Yup.string(),
  notes: Yup.string()
});

const DataGrid = () => {
  const dispatch = useDispatch();
  const { physician, loading } = useSelector((state) => state.physician);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewData, setViewData] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [initialValues, setInitialValues] = useState({
    name: "",
    firstName: "",
    lastName: "",
    specialty: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    zip: "",
    phone: "",
    altPhone: "",
    fax: "",
    email: "",
    status: "Active",
    npi: "",
    qualId: "",
    qualNumber: "",
    taxonomyCode: "",
    taxonomyNumber: "",
    providerAssignedId: "",
    notes: ""
  });
  const [apiLoading, setApiLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchPhysicianByVendor());
  }, [dispatch]);

  const handleDelete = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You want to delete this physician!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        setApiLoading(true);
        dispatch(deletePhysician(id)).finally(() => {
          setApiLoading(false);
        });
      }
    });
  };

  const handleEdit = (id) => {
    setApiLoading(true);
    dispatch(fetchPhysicianById(id))
      .then((res) => {
        if (res.payload) {
          setInitialValues(res.payload);
          setEditMode(true);
          setShowModal(true);
        }
      })
      .finally(() => {
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
      dispatch(updatePhysician({ id: values._id, data: values }))
        .then(() => {
          setSubmitting(false);
          setShowModal(false);
          setEditMode(false);
        })
        .finally(() => {
          setApiLoading(false);
        });
    } else {
      dispatch(createPhysician(values))
        .then(() => {
          setSubmitting(false);
          setShowModal(false);
        })
        .finally(() => {
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
                        name: "",
                        firstName: "",
                        lastName: "",
                        specialty: "",
                        address1: "",
                        address2: "",
                        city: "",
                        state: "",
                        zip: "",
                        phone: "",
                        altPhone: "",
                        fax: "",
                        email: "",
                        status: "Active",
                        npi: "",
                        qualId: "",
                        qualNumber: "",
                        taxonomyCode: "",
                        taxonomyNumber: "",
                        providerAssignedId: "",
                        notes: ""
                      });
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    <span className="d-flex align-items-center">
                      <img src={Plus} className="icons mx-1" alt="add" />
                      <span> New </span>
                    </span>
                  </div>
                </div>
              </th>
              <th>Name</th>
              <th>Specialty</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {physician.length > 0 ? (
              physician.map((row, index) => (
                <tr key={index}>
                  <td>
                    <div className="d-flex flex-wrap">
                      <div className="action-buttons">
                        <span onClick={() => handleEdit(row._id)} style={{ cursor: "pointer" }}>
                          <img src={edit} className="icons mx-1" alt="edit" />
                        </span>
                        <span onClick={() => handleDelete(row._id)} style={{ cursor: "pointer" }}>
                          <img src={deleteIcon} className="icons mx-1" alt="delete" />
                        </span>
                        <span onClick={() => handleView(row)} style={{ cursor: "pointer" }}>
                          <img src={audit} className="icons mx-1" alt="view" />
                        </span>
                      </div>
                    </div>
                  </td>
                  <td>{row.name}</td>
                  <td>{row.specialty}</td>
                  <td>{row.email}</td>
                  <td>{row.phone}</td>
                  <td>{row.status}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center">
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
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg">
              <Formik
                initialValues={initialValues}
                validationSchema={PhysicianSchema}
                enableReinitialize
                onSubmit={handleSubmit}
              >
                {({ isSubmitting }) => (
                  <Form>
                    <div className="modal-header bg-green text-white py-2">
                      <h5 className="modal-title fs-6">
                        {editMode ? "Edit Physician" : "Add New Physician"}
                      </h5>
                      <button
                        type="button"
                        className="btn-close btn-close-white"
                        onClick={() => setShowModal(false)}
                        disabled={isSubmitting}
                      ></button>
                    </div>
                    <div className="modal-body p-3">
                      <div className="row">
                        <div className="col-md-4 mb-2">
                          <label className="form-label small fw-semibold">Name*</label>
                          <Field type="text" name="name" className="form-control form-control-sm" />
                          <ErrorMessage name="name" component="div" className="text-danger small mt-1" />
                        </div>
                        <div className="col-md-4 mb-2">
                          <label className="form-label small fw-semibold">First Name*</label>
                          <Field type="text" name="firstName" className="form-control form-control-sm" />
                          <ErrorMessage name="firstName" component="div" className="text-danger small mt-1" />
                        </div>
                        <div className="col-md-4 mb-2">
                          <label className="form-label small fw-semibold">Last Name*</label>
                          <Field type="text" name="lastName" className="form-control form-control-sm" />
                          <ErrorMessage name="lastName" component="div" className="text-danger small mt-1" />
                        </div>
                        
                        <div className="col-md-6 mb-2">
                          <label className="form-label small fw-semibold">Specialty</label>
                          <Field type="text" name="specialty" className="form-control form-control-sm" />
                        </div>
                        <div className="col-md-6 mb-2">
                          <label className="form-label small fw-semibold">Status*</label>
                          <Field as="select" name="status" className="form-control form-control-sm">
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                          </Field>
                          <ErrorMessage name="status" component="div" className="text-danger small mt-1" />
                        </div>
                        
                        <div className="col-md-6 mb-2">
                          <label className="form-label small fw-semibold">Email</label>
                          <Field type="email" name="email" className="form-control form-control-sm" />
                          <ErrorMessage name="email" component="div" className="text-danger small mt-1" />
                        </div>
                        <div className="col-md-6 mb-2">
                          <label className="form-label small fw-semibold">Phone</label>
                          <Field type="text" name="phone" className="form-control form-control-sm" />
                        </div>
                        
                        <div className="col-md-6 mb-2">
                          <label className="form-label small fw-semibold">Alternate Phone</label>
                          <Field type="text" name="altPhone" className="form-control form-control-sm" />
                        </div>
                        <div className="col-md-6 mb-2">
                          <label className="form-label small fw-semibold">Fax</label>
                          <Field type="text" name="fax" className="form-control form-control-sm" />
                        </div>
                        
                        <div className="col-md-6 mb-2">
                          <label className="form-label small fw-semibold">Address 1</label>
                          <Field type="text" name="address1" className="form-control form-control-sm" />
                        </div>
                        <div className="col-md-6 mb-2">
                          <label className="form-label small fw-semibold">Address 2</label>
                          <Field type="text" name="address2" className="form-control form-control-sm" />
                        </div>
                        
                        <div className="col-md-4 mb-2">
                          <label className="form-label small fw-semibold">City</label>
                          <Field type="text" name="city" className="form-control form-control-sm" />
                        </div>
                        <div className="col-md-4 mb-2">
                          <label className="form-label small fw-semibold">State</label>
                          <Field type="text" name="state" className="form-control form-control-sm" />
                        </div>
                        <div className="col-md-4 mb-2">
                          <label className="form-label small fw-semibold">ZIP</label>
                          <Field type="text" name="zip" className="form-control form-control-sm" />
                          <ErrorMessage name="zip" component="div" className="text-danger small mt-1" />
                        </div>
                        
                        <div className="col-md-6 mb-2">
                          <label className="form-label small fw-semibold">NPI</label>
                          <Field type="text" name="npi" className="form-control form-control-sm" />
                        </div>
                        <div className="col-md-6 mb-2">
                          <label className="form-label small fw-semibold">Qualification ID</label>
                          <Field type="text" name="qualId" className="form-control form-control-sm" />
                        </div>
                        
                        <div className="col-md-6 mb-2">
                          <label className="form-label small fw-semibold">Qualification Number</label>
                          <Field type="text" name="qualNumber" className="form-control form-control-sm" />
                        </div>
                        <div className="col-md-6 mb-2">
                          <label className="form-label small fw-semibold">Taxonomy Code</label>
                          <Field type="text" name="taxonomyCode" className="form-control form-control-sm" />
                        </div>
                        
                        <div className="col-md-6 mb-2">
                          <label className="form-label small fw-semibold">Taxonomy Number</label>
                          <Field type="text" name="taxonomyNumber" className="form-control form-control-sm" />
                        </div>
                        <div className="col-md-6 mb-2">
                          <label className="form-label small fw-semibold">Provider Assigned ID</label>
                          <Field type="text" name="providerAssignedId" className="form-control form-control-sm" />
                        </div>
                        
                        <div className="col-12 mb-2">
                          <label className="form-label small fw-semibold">Notes</label>
                          <Field as="textarea" name="notes" className="form-control form-control-sm" rows="3" />
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
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-green text-white py-2">
                <h5 className="modal-title fs-6">View Physician Details</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowViewModal(false)}
                ></button>
              </div>
              <div className="modal-body p-3">
                <div className="row">
                  <div className="col-md-6 mb-2">
                    <strong>Name:</strong> {viewData.name}
                  </div>
                  <div className="col-md-6 mb-2">
                    <strong>First Name:</strong> {viewData.firstName}
                  </div>
                  <div className="col-md-6 mb-2">
                    <strong>Last Name:</strong> {viewData.lastName}
                  </div>
                  <div className="col-md-6 mb-2">
                    <strong>Specialty:</strong> {viewData.specialty}
                  </div>
                  <div className="col-md-6 mb-2">
                    <strong>Status:</strong> {viewData.status}
                  </div>
                  <div className="col-md-6 mb-2">
                    <strong>Email:</strong> {viewData.email}
                  </div>
                  <div className="col-md-6 mb-2">
                    <strong>Phone:</strong> {viewData.phone}
                  </div>
                  <div className="col-md-6 mb-2">
                    <strong>Alternate Phone:</strong> {viewData.altPhone}
                  </div>
                  <div className="col-md-6 mb-2">
                    <strong>Fax:</strong> {viewData.fax}
                  </div>
                  <div className="col-12 mb-2">
                    <strong>Address 1:</strong> {viewData.address1}
                  </div>
                  <div className="col-12 mb-2">
                    <strong>Address 2:</strong> {viewData.address2}
                  </div>
                  <div className="col-md-4 mb-2">
                    <strong>City:</strong> {viewData.city}
                  </div>
                  <div className="col-md-4 mb-2">
                    <strong>State:</strong> {viewData.state}
                  </div>
                  <div className="col-md-4 mb-2">
                    <strong>ZIP:</strong> {viewData.zip}
                  </div>
                  <div className="col-md-6 mb-2">
                    <strong>NPI:</strong> {viewData.npi}
                  </div>
                  <div className="col-md-6 mb-2">
                    <strong>Qualification ID:</strong> {viewData.qualId}
                  </div>
                  <div className="col-md-6 mb-2">
                    <strong>Qualification Number:</strong> {viewData.qualNumber}
                  </div>
                  <div className="col-md-6 mb-2">
                    <strong>Taxonomy Code:</strong> {viewData.taxonomyCode}
                  </div>
                  <div className="col-md-6 mb-2">
                    <strong>Taxonomy Number:</strong> {viewData.taxonomyNumber}
                  </div>
                  <div className="col-md-6 mb-2">
                    <strong>Provider Assigned ID:</strong> {viewData.providerAssignedId}
                  </div>
                  <div className="col-12 mb-2">
                    <strong>Notes:</strong> {viewData.notes}
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

export default DataGrid;