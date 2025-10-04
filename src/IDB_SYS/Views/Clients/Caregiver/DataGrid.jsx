import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";
import Plus from "./../../../assets/images/Plus.png";
import deleteIcon from "./../../../assets/images/icons/delete.png";
import audit from "./../../../assets/images/icons/audit.png";
import edit from "./../../../assets/images/icons/edit.png";
import {
  fetchCareGiverByVendor,
  fetchCareGiverById,
  createCareGiver,
  updateCareGiver,
  deleteCareGiver,
} from "../../../../store/IDB_SYS/Clients/careGiverSlice";
import { toast } from "react-toastify";

const EmployeeSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Required"),
  firstName: Yup.string().when("editMode", (editMode, schema) =>
    editMode ? schema.required("Required") : schema
  ),
  lastName: Yup.string().when("editMode", (editMode, schema) =>
    editMode ? schema.required("Required") : schema
  ),
  mobile: Yup.string().when("editMode", (editMode, schema) =>
    editMode ? schema.required("Required") : schema
  ),
  wage: Yup.number().when("editMode", (editMode, schema) =>
    editMode ? schema.required("Required") : schema
  ),
  empStatus: Yup.string().when("editMode", (editMode, schema) =>
    editMode ? schema.required("Required") : schema
  ),
});

const DataGrid = () => {
  const dispatch = useDispatch();
  const { careGiver } = useSelector((state) => state.careGiver);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [viewData, setViewData] = useState(null);
  const [initialValues, setInitialValues] = useState({
    email: "",
    firstName: "",
    lastName: "",
    mobile: "",
    wage: 0,
    empStatus: "active",
    department: "",
    jobTitle: "",
    address: "",
    ssnNo: "",
    editMode: false,
  });

  // Fetch data on component mount
  useEffect(() => {
    dispatch(fetchCareGiverByVendor());
  }, [dispatch]);

  const handleDelete = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You want to delete this employee!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(deleteCareGiver(id));
      }
    });
  };

  const handleEdit = (id) => {
    dispatch(fetchCareGiverById(id)).then((res) => {
      if (res.payload) {
        setInitialValues({
          ...res.payload,
          _id: res.payload._id,
          editMode: true,
        });
        setEditMode(true);
        setShowModal(true);
      }
    });
  };

  const handleView = (row) => {
    const formattedData = {
      Name: `${row.firstName || ""} ${row.middleName || ""} ${
        row.lastName || ""
      }`.trim(),
      Email: row.email,
      Mobile: row.mobile,
      "SSN No.": row.ssnNo,
      Status: row.empStatus,
      Department: row.department,
      "Job Title": row.jobTitle,
      Wage: `$${row.wage || 0}`,
      Address: row.address,
      SSN: row.ssnNo,
    };
    setViewData(formattedData);
    setShowViewModal(true);
  };

  const handleSubmit = (values, { setSubmitting, resetForm }) => {
    const submitData = { ...values };
    delete submitData.editMode;

    if (editMode) {
      dispatch(updateCareGiver({ id: values._id, data: submitData }))
        .unwrap()
        .then(() => {
          toast.success("Caregiver updated successfully!");
          setSubmitting(false);
          setShowModal(false);
          setEditMode(false);
          resetForm();
        })
        .catch((error) => {
          toast.error(error || "Failed to update caregiver.");
          setSubmitting(false);
        });
    } else {
      dispatch(createCareGiver({ email: values.email }))
        .unwrap()
        .then(() => {
          toast.success("Caregiver created successfully!");
          setSubmitting(false);
          setShowModal(false);
          resetForm();
        })
        .catch((error) => {
          console.log(error)
          toast.error(error.msg || "Failed to create caregiver.");
          setSubmitting(false);
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
                      email: "",
                      firstName: "",
                      lastName: "",
                      mobile: "",
                      wage: 0,
                      empStatus: "active",
                      department: "",
                      jobTitle: "",
                      address: "",
                      ssnNo: "",
                      editMode: false,
                    });
                  }}
                >
                  <span className="d-flex align-items-center">
                    <img src={Plus} className="icons mx-1" />
                    <span>New</span>
                  </span>
                </div>
              </th>
              <th>Name</th>
              <th>Email</th>
              <th>Mobile</th>
              <th>SSN No.</th>
              <th>Department</th>
              <th>Job Title</th>
              <th>Wage</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {careGiver.length > 0 ? (
              careGiver.map((row, index) => (
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
                  <td>{`${row.name || ""}`.trim()}</td>
                  <td>{row.email}</td>
                  <td>{row.mobile}</td>
                  <td>{row.ssnNo}</td>
                  <td>{row.department}</td>
                  <td>{row.jobTitle}</td>
                  <td>${row.wage || 0}</td>
                  <td>{row.empStatus}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="text-center">
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
                validationSchema={EmployeeSchema}
                enableReinitialize
                onSubmit={handleSubmit}
              >
                {({ isSubmitting, values }) => (
                  <Form>
                    <div className="modal-header bg-green text-white py-2">
                      <h5 className="modal-title fs-6">
                        {editMode ? "Edit Employee" : "Add New Employee"}
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
                          Email
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

                      {editMode && (
                        <>
                          <div className="mb-2">
                            <label className="form-label small fw-semibold">
                              First Name
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
                              Last Name
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
                          <div className="mb-2">
                            <label className="form-label small fw-semibold">
                              Mobile
                            </label>
                            <Field
                              type="text"
                              name="mobile"
                              className="form-control form-control-sm"
                            />
                            <ErrorMessage
                              name="mobile"
                              component="div"
                              className="text-danger small mt-1"
                            />
                          </div>
                          <div className="mb-2">
                            <label className="form-label small fw-semibold">
                              Wage
                            </label>
                            <Field
                              type="number"
                              name="wage"
                              className="form-control form-control-sm"
                            />
                            <ErrorMessage
                              name="wage"
                              component="div"
                              className="text-danger small mt-1"
                            />
                          </div>
                          <div className="mb-2">
                            <label className="form-label small fw-semibold">
                              Status
                            </label>
                            <Field
                              as="select"
                              name="empStatus"
                              className="form-select form-select-sm"
                            >
                              <option value="active">Active</option>
                              <option value="inactive">Inactive</option>
                            </Field>
                            <ErrorMessage
                              name="empStatus"
                              component="div"
                              className="text-danger small mt-1"
                            />
                          </div>
                          <div className="mb-2">
                            <label className="form-label small fw-semibold">
                              Department
                            </label>
                            <Field
                              type="text"
                              name="department"
                              className="form-control form-control-sm"
                            />
                          </div>
                          <div className="mb-2">
                            <label className="form-label small fw-semibold">
                              Job Title
                            </label>
                            <Field
                              type="text"
                              name="jobTitle"
                              className="form-control form-control-sm"
                            />
                          </div>
                        </>
                      )}
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
                <h5 className="modal-title fs-6">Employee Details</h5>
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
