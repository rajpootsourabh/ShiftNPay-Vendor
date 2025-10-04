import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";
import Plus from "./../../../assets/images/Plus.png";
import deleteIcon from "./../../../assets/images/icons/delete.png";
import audit from "./../../../assets/images/icons/audit.png";
import edit from "./../../../assets/images/icons/edit.png";
import { fetchServiceCodeByVendor } from "../../../../store/IDB_SYS/Clients/serviceCodeSlice";
import {
  createCaseManager,
  deleteCaseManager,
  fetchCaseManagerById,
  updateCaseManager,
} from "../../../../store/IDB_SYS/Clients/caseManagerSlice";
import { fetchAgenciesByVendor } from "../../../../store/IDB_SYS/Clients/agencySlice";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlusCircle, faSyncAlt } from "@fortawesome/free-solid-svg-icons";

const CaseManagerSchema = Yup.object().shape({
  firstName: Yup.string().required("Required"),
  lastName: Yup.string().required("Required"),
  phone: Yup.string().required("Required"),
  ext: Yup.string(),
  phone2: Yup.string(),
  fax: Yup.string(),
  email: Yup.string().email("Invalid email"),
  status: Yup.string().oneOf(["Active", "Inactive"]).required("Required"),
  Agency: Yup.string().required("Required"),
});

const DataGrid = () => {
  const dispatch = useDispatch();
  const { caseManager } = useSelector((state) => state.caseManager);
  const { agencies } = useSelector((state) => state.agency);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [viewData, setViewData] = useState(null);
  const [initialValues, setInitialValues] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    ext: "",
    phone2: "",
    fax: "",
    email: "",
    status: "Active",
    Agency: "",
  });

  useEffect(() => {
    dispatch(fetchServiceCodeByVendor());
    dispatch(fetchAgenciesByVendor());
  }, [dispatch]);

  const handleDelete = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You want to delete this Case Manager!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(deleteCaseManager(id));
      }
    });
  };

  const handleEdit = (id) => {
    dispatch(fetchCaseManagerById(id)).then((res) => {
      if (res.payload) {
        setInitialValues({
          ...res.payload,
          Agency: res.payload.Agency?._id || "", // Ensure Agency is set to ID
        });
        setEditMode(true);
        setShowModal(true);
      }
    });
  };
  const navigateUser = (url) => {
    window.open(`/generations.idb-sys/${url}`, "_blank");
  };

  const handleView = (row) => {
    // Format the data for better display in view modal
    const formattedData = {
      "First Name": row.firstName,
      "Last Name": row.lastName,
      Agency: row.Agency?.agency || "",
      Phone: row.phone,
      Ext: row.ext,
      "Phone 2": row.phone2,
      Email: row.email,
      Fax: row.fax,
      Status: row.status,
    };
    setViewData(formattedData);
    setShowViewModal(true);
  };

  const handleSubmit = (values, { setSubmitting, resetForm }) => {
    const submitData = {
      ...values,
      Agency: values.Agency, // Already properly formatted from form
    };

    if (editMode) {
      dispatch(updateCaseManager({ id: values._id, data: submitData })).then(
        () => {
          setSubmitting(false);
          setShowModal(false);
          setEditMode(false);
        }
      );
    } else {
      dispatch(createCaseManager(submitData)).then(() => {
        setSubmitting(false);
        setShowModal(false);
      });
    }
    resetForm();
  };

  return (
    <>
      <div className="table-responsive table-striped custom-table-new">
        <table className="table table-bordered">
          <thead className="table-success text-white">
            <tr>
              <th style={{ width: "90px" }}>
                <div
                  className="custom-btn py-1 round"
                  onClick={() => {
                    setShowModal(true);
                    setEditMode(false);
                    setInitialValues({
                      firstName: "",
                      lastName: "",
                      phone: "",
                      ext: "",
                      phone2: "",
                      fax: "",
                      email: "",
                      status: "Active",
                      Agency: "",
                    });
                  }}
                >
                  <span className="d-flex align-items-center">
                    <img src={Plus} className="icons mx-1" />
                    <span>New</span>
                  </span>
                </div>
              </th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Agency Name</th>
              <th>Phone</th>
              <th>Ext.</th>
              <th>Phone2</th>
              <th>Email</th>
              <th>Fax</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {caseManager.length > 0 ? (
              caseManager.map((row, index) => (
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
                  <td>{row.firstName}</td>
                  <td>{row.lastName}</td>
                  <td>{row.Agency?.agency}</td>
                  <td>{row.phone}</td>
                  <td>{row.ext}</td>
                  <td>{row.phone2}</td>
                  <td>{row.email}</td>
                  <td>{row.fax}</td>
                  <td>{row.status}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="10" className="text-center">
                  No records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <Formik
                initialValues={initialValues}
                validationSchema={CaseManagerSchema}
                enableReinitialize
                onSubmit={handleSubmit}
              >
                {({ isSubmitting }) => (
                  <Form>
                    <div className="modal-header bg-green text-white py-2">
                      <h5 className="modal-title fs-6">
                        {editMode
                          ? "Edit Case Manager"
                          : "Add New Case Manager"}
                      </h5>
                      <button
                        type="button"
                        className="btn-close btn-close-white"
                        onClick={() => setShowModal(false)}
                      ></button>
                    </div>
                    <div className="modal-body p-3">
                      <div className="mb-2">
                        <label className="form-label small fw-semibold">
                          First Name <small className="text-danger">*</small>
                        </label>
                        <Field
                          type="text"
                          name="firstName"
                          className="form-control form-control-sm"
                        />
                        <ErrorMessage
                          name="firstName"
                          component="div"
                          className="text-danger small mt-1"
                        />
                      </div>
                      <div className="mb-2">
                        <label className="form-label small fw-semibold">
                          Last Name <small className="text-danger">*</small>
                        </label>
                        <Field
                          type="text"
                          name="lastName"
                          className="form-control form-control-sm"
                        />
                        <ErrorMessage
                          name="lastName"
                          component="div"
                          className="text-danger small mt-1"
                        />
                      </div>

                      <div className="form-row">
                        <label
                          htmlFor="caseManager"
                          className="col-sm-4 col-form-label"
                        >
                          Agency Name <small className="text-danger">*</small>
                        </label>
                        <div className="col-sm-12 col-md-12 d-flex gap-2">
                          <Field
                            as="select"
                            name="Agency"
                            className="form-select form-select-sm"
                          >
                            <option value="">Select</option>
                            {agencies.map((row, index) => (
                              <option key={index} value={row._id}>
                                {row.agency}
                              </option>
                            ))}
                          </Field>
                          <ErrorMessage
                          name="Agency"
                          component="div"
                          className="text-danger small mt-1"
                        />
                           <div className="input-group-text gap-2">
                          <FontAwesomeIcon
                            icon={faPlusCircle}
                            className="mx-2 cursor-pointer"
                            onClick={() => {
                              navigateUser("clients/agencies");
                            }}
                          />
                          <FontAwesomeIcon
                            icon={faSyncAlt}
                            className="mx-2  cursor-pointer"
                            onClick={() => {
                              dispatch(fetchAgenciesByVendor({ limit: 100 }));
                            }}
                          />
                        </div>
                        </div>
                      </div>
                      <div className="mb-2">
                        <label className="form-label small fw-semibold">
                          Phone <small className="text-danger">*</small>
                        </label>
                        <Field
                          type="text"
                          name="phone"
                          className="form-control form-control-sm"
                        />
                        <ErrorMessage
                          name="phone"
                          component="div"
                          className="text-danger small mt-1"
                        />
                      </div>
                      <div className="mb-2">
                        <label className="form-label small fw-semibold">
                          Ext <small className="text-danger"></small>
                        </label>
                        <Field
                          type="text"
                          name="ext"
                          className="form-control form-control-sm"
                        />
                        <ErrorMessage
                          name="ext"
                          component="div"
                          className="text-danger small mt-1"
                        />
                      </div>
                      <div className="mb-2">
                        <label className="form-label small fw-semibold">
                          Phone 2 <small className="text-danger"></small>
                        </label>
                        <Field
                          type="text"
                          name="phone2"
                          className="form-control form-control-sm"
                        />
                        <ErrorMessage
                          name="phone2"
                          component="div"
                          className="text-danger small mt-1"
                        />
                      </div>

                      <div className="mb-2">
                        <label className="form-label small fw-semibold">
                          Fax <small className="text-danger"></small>
                        </label>
                        <Field
                          type="text"
                          name="fax"
                          className="form-control form-control-sm"
                        />
                        <ErrorMessage
                          name="fax"
                          component="div"
                          className="text-danger small mt-1"
                        />
                      </div>
                      <div className="mb-2">
                        <label className="form-label small fw-semibold">
                          Email <small className="text-danger"></small>
                        </label>
                        <Field
                          type="email"
                          name="email"
                          className="form-control form-control-sm"
                        />
                        <ErrorMessage
                          name="email"
                          component="div"
                          className="text-danger small mt-1"
                        />
                      </div>

                      <div className="mb-2">
                        <label className="form-label small fw-semibold">
                          Status <small className="text-danger">*</small>
                        </label>
                        <Field
                          as="select"
                          name="status"
                          className="form-select form-select-sm"
                        >
                          <option value="">Select</option>
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                        </Field>
                        <ErrorMessage
                          name="status"
                          component="div"
                          className="text-danger small mt-1"
                        />
                      </div>
                    </div>
                    <div className="modal-footer bg-light py-2">
                      <button
                        type="button"
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() => setShowModal(false)}
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

      {showViewModal && viewData && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-green text-white py-2">
                <h5 className="modal-title fs-6">View Details</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowViewModal(false)}
                ></button>
              </div>
              <div className="modal-body p-3">
                {Object.entries(viewData).map(([key, value], idx) => (
                  <div className="mb-2" key={idx}>
                    <label className="form-label small fw-semibold">
                      {key}
                    </label>
                    <div className="form-control-plaintext form-control-sm bg-light rounded p-2">
                      {value || "-"}
                    </div>
                  </div>
                ))}
              </div>
              <div className="modal-footer bg-light py-2">
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
