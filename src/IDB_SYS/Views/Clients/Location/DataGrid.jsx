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
  createLocation,
  deleteLocation,
  fetchLocationById,
  fetchLocationsByVendor,
  updateLocation,
} from "../../../../store/IDB_SYS/Clients/locationSlice";
import { timezoneOptions } from "../../../contants";


const getValidationSchema = (overrideCompanyInfo, overrideTimezone) =>
  Yup.object().shape({
    location: Yup.string().max(3, "Max 3 characters").required("Location is required"),
    description: Yup.string().required("Description is required"),
    overrideCompanyInfo: Yup.boolean(),
    companyName: overrideCompanyInfo
      ? Yup.string().required("Company Name is required")
      : Yup.string(),
    taxId: overrideCompanyInfo ? Yup.string().required("Tax ID is required") : Yup.string(),
    address: overrideCompanyInfo ? Yup.string().required("Address is required") : Yup.string(),
    city: overrideCompanyInfo ? Yup.string().required("City is required") : Yup.string(),
    state: overrideCompanyInfo ? Yup.string().required("State is required") : Yup.string(),
    zip: overrideCompanyInfo ? Yup.string().required("ZIP is required") : Yup.string(),
    phone: overrideCompanyInfo ? Yup.string().required("Phone is required") : Yup.string(),
    payrollId: overrideCompanyInfo ? Yup.string().required("Payroll ID is required") : Yup.string(),
    overrideTimezone: Yup.boolean(),
    evvTimezone: overrideTimezone ? Yup.string().required("Timezone is required") : Yup.string(),
  });

const DataGrid = () => {
  const dispatch = useDispatch();
  const { location } = useSelector((state) => state.location);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const [apiLoading, setApiLoading] = useState(false);
  const [initialValues, setInitialValues] = useState({
    location: "",
    description: "",
    overrideCompanyInfo: false,
    companyName: "",
    taxId: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    phone: "",
    payrollId: "",
    overrideTimezone: false,
    evvTimezone: "",
  });
  const [viewData, setViewData] = useState(null);

  useEffect(() => {
    dispatch(fetchLocationsByVendor());
  }, [dispatch]);

  const handleDelete = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You want to delete this location!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        setApiLoading(true);
        dispatch(deleteLocation(id)).finally(() => setApiLoading(false));
      }
    });
  };

  const handleEdit = (id) => {
    setApiLoading(true);
    dispatch(fetchLocationById(id))
      .then((res) => {
        if (res.payload) {
          setInitialValues(res.payload);
          setEditMode(true);
          setShowModal(true);
        }
      })
      .finally(() => setApiLoading(false));
  };

  const handleSubmit = (values, { setSubmitting, resetForm }) => {
    setApiLoading(true);
    const action = editMode
      ? updateLocation({ id: values._id, data: values })
      : createLocation(values);

    dispatch(action)
      .then(() => {
        setSubmitting(false);
        setShowModal(false);
        setEditMode(false);
        resetForm();
      })
      .finally(() => setApiLoading(false));
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
                    onClick={() => { setShowModal(true); setEditMode(false); setInitialValues({ location: "", description: "", overrideCompanyInfo: false, companyName: "", taxId: "", address: "", city: "", state: "", zip: "", phone: "", payrollId: "", overrideTimezone: false, evvTimezone: "" }); }} style={{ cursor: "pointer" }}
                  >
                    <span className="d-flex align-items-center">
                      <img src={Plus} className="icons mx-1" alt="Add" />
                      <span> New </span>
                    </span>
                  </div>
                </div>
                </th>
              <th>Location</th>
              <th>Description</th>
              <th>Company Name</th>
              <th>Tax ID</th>
              <th>Address</th>
              <th>City</th>
              <th>State</th>
              <th>ZIP</th>
              <th>Phone</th>
              <th>Payroll ID</th>
              <th>Timezone</th>
            </tr>
          </thead>
          <tbody>
            {location.length > 0 ? (
              location.map((row) => (
                <tr key={row._id}>
                  <td>
                    <div className="d-flex flex-wrap">
                      <div className="action-buttons">
                        <span
                          className="d-flex align-items-center"
                          onClick={() => handleEdit(row._id)}
                          style={{ cursor: "pointer" }}
                        >
                          <img src={edit} className="icons mx-1" alt="Edit" />
                        </span>
                        <span
                          className="d-flex align-items-center"
                          onClick={() => handleDelete(row._id)}
                          style={{ cursor: "pointer" }}
                        >
                          <img
                            src={deleteIcon}
                            className="icons mx-1"
                            alt="Delete"
                          />
                        </span>
                        <span
                          className="d-flex align-items-center"
                          style={{ cursor: "pointer" }}
                          onClick={() => { setViewData(row); setViewModal(true); }}
                        >
                          <img src={audit} className="icons mx-1" alt="View" />
                        </span>
                      </div>
                    </div>
                  </td>
                  <td>{row.location}</td>
                  <td>{row.description}</td>
                  <td>{row.companyName}</td>
                  <td>{row.taxId}</td>
                  <td>{row.address}</td>
                  <td>{row.city}</td>
                  <td>{row.state}</td>
                  <td>{row.zip}</td>
                  <td>{row.phone}</td>
                  <td>{row.payrollId}</td>
                  <td>{row.evvTimezone}</td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="12" className="text-center">No record found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg">
              <Formik
                initialValues={initialValues}
                validationSchema={getValidationSchema(initialValues.overrideCompanyInfo, initialValues.overrideTimezone)}
                enableReinitialize
                onSubmit={handleSubmit}
              >
                {({ values, setFieldValue, isSubmitting }) => (
                  <Form>
                    <div className="modal-header bg-green text-white py-2">
                      <h5 className="modal-title">{editMode ? "Edit Location" : "Add Location"}</h5>
                      <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)} disabled={isSubmitting}></button>
                    </div>
                    <div className="modal-body">
                      <div className="row">
                        <div className="col-md-12 mb-0">
                          <label className="form-label small fw-semibold">
                            <Field type="checkbox" name="overrideCompanyInfo" checked={values.overrideCompanyInfo} onChange={() => setFieldValue("overrideCompanyInfo", !values.overrideCompanyInfo)} />
                            &nbsp; Override Company Info
                          </label>
                        </div>

                        <div className="col-md-6 mb-1">
                          <label className="form-label small fw-semibold">Location <span className="text-danger">*</span></label>
                          <Field type="text" name="location" className="form-control form-control-sm" maxLength={3}/>
                          <ErrorMessage name="location" component="div" className="text-danger small" />
                        </div>

                        <div className="col-md-6 mb-1">
                          <label className="form-label small fw-semibold">Description <span className="text-danger">*</span></label>
                          <Field type="text" name="description" className="form-control form-control-sm" />
                          <ErrorMessage name="description" component="div" className="text-danger small" />
                        </div>

                        <div className="col-md-6 mb-1 d-flex align-items-center">
                          <label className="form-label small fw-semibold">
                            <Field type="checkbox" name="overrideTimezone" checked={values.overrideTimezone} onChange={() => setFieldValue("overrideTimezone", !values.overrideTimezone)} />
                            &nbsp; Override Timezone
                          </label>
                        </div>

                        <div className="col-md-6 mb-1">
                          <label className="form-label small fw-semibold">EVV Timezone {values.overrideTimezone && <span className="text-danger">*</span>}</label>
                          <Field as="select" name="evvTimezone" className="form-control form-control-sm" disabled={!values.overrideTimezone}>
                            {timezoneOptions.map((zone, i) => (
                              <option key={i} value={zone === "--Select--" ? "" : zone}>{zone}</option>
                            ))}
                          </Field>
                          <ErrorMessage name="evvTimezone" component="div" className="text-danger small" />
                        </div>

                        <div className="col-md-6 mb-1">
                          <label className="form-label small fw-semibold">Provider ID</label>
                          <Field type="text" name="providerId" className="form-control form-control-sm" />
                          <ErrorMessage name="providerId" component="div" className="text-danger small" />

                        </div>
                        <div className="col-md-6 mb-1">
                          <label className="form-label small fw-semibold">Company Name</label>
                          <Field type="text" name="companyName" className="form-control form-control-sm"   disabled={!values.overrideCompanyInfo} />
                          <ErrorMessage name="companyName" component="div" className="text-danger small" />

                        </div>

                             <div className="col-md-6 mb-1">
                          <label className="form-label small fw-semibold">Tax Id</label>
                          <Field type="text" name="taxId" className="form-control form-control-sm"   disabled={!values.overrideCompanyInfo} />
                          <ErrorMessage name="taxId" component="div" className="text-danger small" />

                        </div>
                         <div className="col-md-6 mb-1">
                          <label className="form-label small fw-semibold">Address</label>
                          <Field type="text" name="address" className="form-control form-control-sm"   disabled={!values.overrideCompanyInfo} />
                          <ErrorMessage name="address" component="div" className="text-danger small" />

                        </div>
                         <div className="col-md-6 mb-1">
                          <label className="form-label small fw-semibold">City</label>
                          <Field type="text" name="city" className="form-control form-control-sm"   disabled={!values.overrideCompanyInfo} />
                          <ErrorMessage name="city" component="div" className="text-danger small" />

                        </div>
                         <div className="col-md-3 mb-0">
                          <label className="form-label small fw-semibold">State</label>
                          <Field type="text" name="state" className="form-control form-control-sm"   disabled={!values.overrideCompanyInfo} />
                          <ErrorMessage name="state" component="div" className="text-danger small" />

                        </div>
                         <div className="col-md-3 mb-0">
                          <label className="form-label small fw-semibold">Zip</label>
                          <Field type="text" name="zip" className="form-control form-control-sm"   disabled={!values.overrideCompanyInfo} />
                          <ErrorMessage name="zip" component="div" className="text-danger small" />

                        </div>
                         <div className="col-md-6 mb-1">
                          <label className="form-label small fw-semibold">Phone</label>
                          <Field type="text" name="phone" className="form-control form-control-sm"   disabled={!values.overrideCompanyInfo} />
                          <ErrorMessage name="phone" component="div" className="text-danger small" />

                        </div>
                         <div className="col-md-6 mb-1">
                          <label className="form-label small fw-semibold">Payroll Id</label>
                          <Field type="text" name="payrollId" className="form-control form-control-sm"   disabled={!values.overrideCompanyInfo} />
                          <ErrorMessage name="payrollId" component="div" className="text-danger small" />
                        </div>
                      </div>
                    </div>
                    <div className="modal-footer bg-light py-2">
                      <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowModal(false)} disabled={isSubmitting}>Cancel</button>
                      <button type="submit" className="btn btn-success btn-sm" disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Save"}</button>
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DataGrid;
