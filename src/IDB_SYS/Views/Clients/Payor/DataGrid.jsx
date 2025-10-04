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
  fetchPayorByVendor,
  fetchPayorById,
  createPayor,
  updatePayor,
  deletePayor,
} from "../../../../store/IDB_SYS/Clients/payorSlice";
import { claimFilingIndicators, interchangeIDQualifiers } from "../../../../constants";

const PayorSchema = Yup.object().shape({
  payor: Yup.string().required("Payor name is required"),
  payorId: Yup.string(),
  address1: Yup.string(),
  address2: Yup.string(),
  city: Yup.string(),
  state: Yup.string(),
  zip: Yup.string().matches(/^\d{5}(-\d{4})?$/, "Invalid ZIP code format"),
  phone1: Yup.string(),
  phone2: Yup.string(),
  email: Yup.string().email("Invalid email"),
  website: Yup.string().url("Invalid URL"),
  status: Yup.string()
    .oneOf(["Active", "Inactive"])
    .required("Status is required"),
  notes: Yup.string(),
  edi: Yup.object().shape({
    senderCode: Yup.string(),
    receiverName: Yup.string(),
    receiverCode: Yup.string(),
    receiverETIN: Yup.string(),
    ediVersion: Yup.string(),
    submitterName: Yup.string(),
    ediContactName: Yup.string(),
    submitterETIN: Yup.string(),
    ediContactNumber: Yup.string(),
    claimFilingIndicator: Yup.string(),
    isa05SenderIdQualifier: Yup.string(),
    isa07ReceiverIdQualifier: Yup.string(),
    stateEVV: Yup.boolean(),
    evvId: Yup.string(),
    payorProgram: Yup.string(),
    providerCommercialNumber: Yup.string(),
  }),
  options: Yup.object().shape({
    includeServiceTaxonomyCodes: Yup.boolean(),
    includeOtherProvider: Yup.boolean(),
    doNotPrint2420APrv: Yup.boolean(),
    includeCGNameAndNPI: Yup.boolean(),
    includeClientAddress: Yup.boolean(),
    removeLeadingZeros: Yup.boolean(),
    addModifier76: Yup.boolean(),
  }),
  callProcessing: Yup.object().shape({
    overrideDefaultEVVRounding: Yup.boolean(),
    roundingInterval: Yup.number(),
    roundToScheduledTime: Yup.number(),
  }),
});

const DataGrid = () => {
  const dispatch = useDispatch();
  const { payor, loading } = useSelector((state) => state.payor);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewData, setViewData] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [initialValues, setInitialValues] = useState({
    payor: "",
    payorId: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    zip: "",
    phone1: "",
    phone2: "",
    email: "",
    website: "",
    status: "Active",
    notes: "",
    edi: {
      senderCode: "",
      receiverName: "",
      receiverCode: "",
      receiverETIN: "",
      ediVersion: "",
      submitterName: "",
      ediContactName: "",
      submitterETIN: "",
      ediContactNumber: "",
      claimFilingIndicator: "",
      isa05SenderIdQualifier: "",
      isa07ReceiverIdQualifier: "",
      stateEVV: false,
      evvId: "",
      payorProgram: "",
      providerCommercialNumber: "",
    },
    options: {
      includeServiceTaxonomyCodes: false,
      includeOtherProvider: false,
      doNotPrint2420APrv: false,
      includeCGNameAndNPI: false,
      includeClientAddress: false,
      removeLeadingZeros: false,
      addModifier76: false,
    },
    callProcessing: {
      overrideDefaultEVVRounding: false,
      roundingInterval: 0,
      roundToScheduledTime: 0,
    },
  });
  const [apiLoading, setApiLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchPayorByVendor());
  }, [dispatch]);

  const handleDelete = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You want to delete this payor!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        setApiLoading(true);
        dispatch(deletePayor(id)).finally(() => {
          setApiLoading(false);
        });
      }
    });
  };

  const handleEdit = (id) => {
    setApiLoading(true);
    dispatch(fetchPayorById(id))
      .then((res) => {
        if (res.payload) {
          // Ensure nested objects are properly initialized
          const payorData = {
            ...res.payload,
            edi: res.payload.edi || initialValues.edi,
            options: res.payload.options || initialValues.options,
            callProcessing:
              res.payload.callProcessing || initialValues.callProcessing,
          };
          setInitialValues(payorData);
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
      dispatch(updatePayor({ id: values._id, data: values }))
        .then(() => {
          setSubmitting(false);
          setShowModal(false);
          setEditMode(false);
        })
        .finally(() => {
          setApiLoading(false);
        });
    } else {
      dispatch(createPayor(values))
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
                        payor: "",
                        payorId: "",
                        address1: "",
                        address2: "",
                        city: "",
                        state: "",
                        zip: "",
                        phone1: "",
                        phone2: "",
                        email: "",
                        website: "",
                        status: "Active",
                        notes: "",
                        edi: {
                          senderCode: "",
                          receiverName: "",
                          receiverCode: "",
                          receiverETIN: "",
                          ediVersion: "",
                          submitterName: "",
                          ediContactName: "",
                          submitterETIN: "",
                          ediContactNumber: "",
                          claimFilingIndicator: "",
                          isa05SenderIdQualifier: "",
                          isa07ReceiverIdQualifier: "",
                          stateEVV: false,
                          evvId: "",
                          payorProgram: "",
                          providerCommercialNumber: "",
                        },
                        options: {
                          includeServiceTaxonomyCodes: false,
                          includeOtherProvider: false,
                          doNotPrint2420APrv: false,
                          includeCGNameAndNPI: false,
                          includeClientAddress: false,
                          removeLeadingZeros: false,
                          addModifier76: false,
                        },
                        callProcessing: {
                          overrideDefaultEVVRounding: false,
                          roundingInterval: 0,
                          roundToScheduledTime: 0,
                        },
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
              <th>Payor</th>
              <th>Payor ID</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {payor.length > 0 ? (
              payor.map((row, index) => (
                <tr key={index}>
                  <td>
                    <div className="d-flex flex-wrap">
                      <div className="action-buttons">
                        <span
                          onClick={() => handleEdit(row._id)}
                          style={{ cursor: "pointer" }}
                        >
                          <img src={edit} className="icons mx-1" alt="edit" />
                        </span>
                        <span
                          onClick={() => handleDelete(row._id)}
                          style={{ cursor: "pointer" }}
                        >
                          <img
                            src={deleteIcon}
                            className="icons mx-1"
                            alt="delete"
                          />
                        </span>
                        <span
                          onClick={() => handleView(row)}
                          style={{ cursor: "pointer" }}
                        >
                          <img src={audit} className="icons mx-1" alt="view" />
                        </span>
                      </div>
                    </div>
                  </td>
                  <td>{row.payor}</td>
                  <td>{row.payorId}</td>
                  <td>{row.email}</td>
                  <td>{row.phone1}</td>
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
          <div className="modal-dialog modal-dialog-centered modal-xl">
            <div className="modal-content border-0 shadow-lg">
              <Formik
                initialValues={initialValues}
                validationSchema={PayorSchema}
                enableReinitialize
                onSubmit={handleSubmit}
              >
                {({ isSubmitting, values }) => (
                  <Form>
                    <div className="modal-header bg-green text-white py-2">
                      <h5 className="modal-title fs-6">
                        {editMode ? "Edit Payor" : "Add New Payor"}
                      </h5>
                      <button
                        type="button"
                        className="btn-close btn-close-white"
                        onClick={() => setShowModal(false)}
                        disabled={isSubmitting}
                      ></button>
                    </div>
                    <div
                      className="modal-body p-3"
                      style={{ maxHeight: "70vh", overflowY: "auto" }}
                    >
                      <div className="row">
                        <div className="col-md-6 mb-2">
                          <label className="form-label small fw-semibold">
                            Payor Name*
                          </label>
                          <Field
                            type="text"
                            name="payor"
                            className="form-control form-control-sm"
                          />
                          <ErrorMessage
                            name="payor"
                            component="div"
                            className="text-danger small mt-1"
                          />
                        </div>
                        <div className="col-md-6 mb-2">
                          <label className="form-label small fw-semibold">
                            Payor ID
                          </label>
                          <Field
                            type="text"
                            name="payorId"
                            className="form-control form-control-sm"
                          />
                        </div>

                        <div className="col-md-6 mb-2">
                          <label className="form-label small fw-semibold">
                            Status*
                          </label>
                          <Field
                            as="select"
                            name="status"
                            className="form-control form-control-sm"
                          >
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                          </Field>
                          <ErrorMessage
                            name="status"
                            component="div"
                            className="text-danger small mt-1"
                          />
                        </div>
                        <div className="col-md-6 mb-2">
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

                        <div className="col-md-6 mb-2">
                          <label className="form-label small fw-semibold">
                            Primary Phone
                          </label>
                          <Field
                            type="text"
                            name="phone1"
                            className="form-control form-control-sm"
                          />
                        </div>
                        <div className="col-md-6 mb-2">
                          <label className="form-label small fw-semibold">
                            Secondary Phone
                          </label>
                          <Field
                            type="text"
                            name="phone2"
                            className="form-control form-control-sm"
                          />
                        </div>

                        <div className="col-md-6 mb-2">
                          <label className="form-label small fw-semibold">
                            Website
                          </label>
                          <Field
                            type="text"
                            name="website"
                            className="form-control form-control-sm"
                          />
                          <ErrorMessage
                            name="website"
                            component="div"
                            className="text-danger small mt-1"
                          />
                        </div>
                        <div className="col-md-6 mb-2">
                          <label className="form-label small fw-semibold">
                            ZIP
                          </label>
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

                        <div className="col-12 mb-2">
                          <label className="form-label small fw-semibold">
                            Address 1
                          </label>
                          <Field
                            type="text"
                            name="address1"
                            className="form-control form-control-sm"
                          />
                        </div>
                        <div className="col-12 mb-2">
                          <label className="form-label small fw-semibold">
                            Address 2
                          </label>
                          <Field
                            type="text"
                            name="address2"
                            className="form-control form-control-sm"
                          />
                        </div>

                        <div className="col-md-4 mb-2">
                          <label className="form-label small fw-semibold">
                            City
                          </label>
                          <Field
                            type="text"
                            name="city"
                            className="form-control form-control-sm"
                          />
                        </div>
                        <div className="col-md-4 mb-2">
                          <label className="form-label small fw-semibold">
                            State
                          </label>
                          <Field
                            type="text"
                            name="state"
                            className="form-control form-control-sm"
                          />
                        </div>

                        <div className="col-12 mb-2">
                          <label className="form-label small fw-semibold">
                            Notes
                          </label>
                          <Field
                            as="textarea"
                            name="notes"
                            className="form-control form-control-sm"
                            rows="3"
                          />
                        </div>

                        {/* EDI Information Section */}
                        <div className="col-12 mt-3 mb-2">
                          <h6 className="border-bottom pb-2">
                            EDI Information
                          </h6>
                        </div>

                        <div className="col-md-6 mb-2">
                          <label className="form-label small fw-semibold">
                            Sender Code
                          </label>
                          <Field
                            type="text"
                            name="edi.senderCode"
                            className="form-control form-control-sm"
                          />
                        </div>
                        <div className="col-md-6 mb-2">
                          <label className="form-label small fw-semibold">
                            Receiver Name
                          </label>
                          <Field
                            type="text"
                            name="edi.receiverName"
                            className="form-control form-control-sm"
                          />
                        </div>

                        <div className="col-md-6 mb-2">
                          <label className="form-label small fw-semibold">
                            Receiver Code
                          </label>
                          <Field
                            type="text"
                            name="edi.receiverCode"
                            className="form-control form-control-sm"
                          />
                        </div>
                        <div className="col-md-6 mb-2">
                          <label className="form-label small fw-semibold">
                            Receiver ETIN
                          </label>
                          <Field
                            type="text"
                            name="edi.receiverETIN"
                            className="form-control form-control-sm"
                          />
                        </div>

                        <div className="col-md-6 mb-2">
                          <label className="form-label small fw-semibold">
                            EDI Version
                          </label>
                          <Field
                            type="text"
                            name="edi.ediVersion"
                            className="form-control form-control-sm"
                          />
                        </div>
                        <div className="col-md-6 mb-2">
                          <label className="form-label small fw-semibold">
                            Submitter Name
                          </label>
                          <Field
                            type="text"
                            name="edi.submitterName"
                            className="form-control form-control-sm"
                          />
                        </div>

                        <div className="col-md-6 mb-2">
                          <label className="form-label small fw-semibold">
                            EDI Contact Name
                          </label>
                          <Field
                            type="text"
                            name="edi.ediContactName"
                            className="form-control form-control-sm"
                          />
                        </div>
                        <div className="col-md-6 mb-2">
                          <label className="form-label small fw-semibold">
                            Submitter ETIN
                          </label>
                          <Field
                            type="text"
                            name="edi.submitterETIN"
                            className="form-control form-control-sm"
                          />
                        </div>

                        <div className="col-md-6 mb-2">
                          <label className="form-label small fw-semibold">
                            EDI Contact Number
                          </label>
                          <Field
                            type="text"
                            name="edi.ediContactNumber"
                            className="form-control form-control-sm"
                          />
                        </div>
                        <div className="col-md-6 mb-2">
                          <label className="form-label small fw-semibold">
                            Claim Filing Indicator
                          </label>
                          <Field
                            as="select"
                            name="edi.claimFilingIndicator"
                            className="form-control form-control-sm"
                          >
                            <option value="">Select an option</option>
                            {claimFilingIndicators.map((option) => (
                              <option key={option.id} value={option.value}>
                                {option.value}
                              </option>
                            ))}
                          </Field>
                          <ErrorMessage
                            name="edi.claimFilingIndicator"
                            component="div"
                            className="invalid-feedback"
                          />
                        </div>

                        <div className="col-md-6 mb-2">
                          <label className="form-label small fw-semibold">
                             ISA05 Sender ID Qualifier
                          </label>
                          <Field
                            as="select"
                            name="edi.isa05SenderIdQualifier"
                            className="form-control form-control-sm"
                          >
                            <option value="">Select an option</option>
                            {interchangeIDQualifiers.map((option) => (
                              <option key={option.id} value={option.value}>
                                {option.value}
                              </option>
                            ))}
                          </Field>
                          <ErrorMessage
                            name="edi.isa05SenderIdQualifier"
                            component="div"
                            className="invalid-feedback"
                          />
                        </div>
                        <div className="col-md-6 mb-2">
                          <label className="form-label small fw-semibold">
                            ISA07 Receiver ID Qualifier
                          </label>
                          <Field
                            as="select"
                            name="edi.isa07ReceiverIdQualifier"
                            className="form-control form-control-sm"
                          >
                            <option value="">Select an option</option>
                            {interchangeIDQualifiers.map((option) => (
                              <option key={option.id} value={option.value}>
                                {option.value}
                              </option>
                            ))}
                          </Field>
                          <ErrorMessage
                            name="edi.isa07ReceiverIdQualifier"
                            component="div"
                            className="invalid-feedback"
                          />
                        </div>

                        <div className="col-md-6 mb-2">
                          <label className="form-label small fw-semibold">
                            State EVV
                          </label>
                          <Field
                            type="checkbox"
                            name="edi.stateEVV"
                            className="form-check-input ms-2"
                          />
                        </div>
                        <div className="col-md-6 mb-2">
                          <label className="form-label small fw-semibold">
                            EVV ID
                          </label>
                          <Field
                            type="text"
                            name="edi.evvId"
                            className="form-control form-control-sm"
                          />
                        </div>

                        <div className="col-md-6 mb-2">
                          <label className="form-label small fw-semibold">
                            Payor Program
                          </label>
                          <Field
                            type="text"
                            name="edi.payorProgram"
                            className="form-control form-control-sm"
                          />
                        </div>
                        <div className="col-md-6 mb-2">
                          <label className="form-label small fw-semibold">
                            Provider Commercial Number
                          </label>
                          <Field
                            type="text"
                            name="edi.providerCommercialNumber"
                            className="form-control form-control-sm"
                          />
                        </div>

                        {/* Options Section */}
                        <div className="col-12 mt-3 mb-2">
                          <h6 className="border-bottom pb-2">Options</h6>
                        </div>

                        <div className="col-md-6 mb-2">
                          <label className="form-label small fw-semibold">
                            Include Service Taxonomy Codes
                          </label>
                          <Field
                            type="checkbox"
                            name="options.includeServiceTaxonomyCodes"
                            className="form-check-input ms-2"
                          />
                        </div>
                        <div className="col-md-6 mb-2">
                          <label className="form-label small fw-semibold">
                            Include Other Provider
                          </label>
                          <Field
                            type="checkbox"
                            name="options.includeOtherProvider"
                            className="form-check-input ms-2"
                          />
                        </div>

                        <div className="col-md-6 mb-2">
                          <label className="form-label small fw-semibold">
                            Do Not Print 2420A Provider
                          </label>
                          <Field
                            type="checkbox"
                            name="options.doNotPrint2420APrv"
                            className="form-check-input ms-2"
                          />
                        </div>
                        <div className="col-md-6 mb-2">
                          <label className="form-label small fw-semibold">
                            Include CG Name and NPI
                          </label>
                          <Field
                            type="checkbox"
                            name="options.includeCGNameAndNPI"
                            className="form-check-input ms-2"
                          />
                        </div>

                        <div className="col-md-6 mb-2">
                          <label className="form-label small fw-semibold">
                            Include Client Address
                          </label>
                          <Field
                            type="checkbox"
                            name="options.includeClientAddress"
                            className="form-check-input ms-2"
                          />
                        </div>
                        <div className="col-md-6 mb-2">
                          <label className="form-label small fw-semibold">
                            Remove Leading Zeros
                          </label>
                          <Field
                            type="checkbox"
                            name="options.removeLeadingZeros"
                            className="form-check-input ms-2"
                          />
                        </div>

                        <div className="col-md-6 mb-2">
                          <label className="form-label small fw-semibold">
                            Add Modifier 76
                          </label>
                          <Field
                            type="checkbox"
                            name="options.addModifier76"
                            className="form-check-input ms-2"
                          />
                        </div>

                        {/* Call Processing Section */}
                        <div className="col-12 mt-3 mb-2">
                          <h6 className="border-bottom pb-2">
                            Call Processing
                          </h6>
                        </div>

                        <div className="col-md-6 mb-2">
                          <label className="form-label small fw-semibold">
                            Override Default EVV Rounding
                          </label>
                          <Field
                            type="checkbox"
                            name="callProcessing.overrideDefaultEVVRounding"
                            className="form-check-input ms-2"
                          />
                        </div>

                        <div className="col-md-6 mb-2">
                          <label className="form-label small fw-semibold">
                            Rounding Interval (minutes)
                          </label>
                          <Field
                            type="number"
                            name="callProcessing.roundingInterval"
                            className="form-control form-control-sm"
                          />
                        </div>

                        <div className="col-md-6 mb-2">
                          <label className="form-label small fw-semibold">
                            Round To Scheduled Time (minutes)
                          </label>
                          <Field
                            type="number"
                            name="callProcessing.roundToScheduledTime"
                            className="form-control form-control-sm"
                          />
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
          <div className="modal-dialog modal-dialog-centered modal-xl">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-green text-white py-2">
                <h5 className="modal-title fs-6">View Payor Details</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowViewModal(false)}
                ></button>
              </div>
              <div
                className="modal-body p-3"
                style={{ maxHeight: "70vh", overflowY: "auto" }}
              >
                <div className="row">
                  <div className="col-md-6 mb-2">
                    <strong>Payor Name:</strong> {viewData.payor}
                  </div>
                  <div className="col-md-6 mb-2">
                    <strong>Payor ID:</strong> {viewData.payorId}
                  </div>

                  <div className="col-md-6 mb-2">
                    <strong>Status:</strong> {viewData.status}
                  </div>
                  <div className="col-md-6 mb-2">
                    <strong>Email:</strong> {viewData.email}
                  </div>

                  <div className="col-md-6 mb-2">
                    <strong>Primary Phone:</strong> {viewData.phone1}
                  </div>
                  <div className="col-md-6 mb-2">
                    <strong>Secondary Phone:</strong> {viewData.phone2}
                  </div>

                  <div className="col-md-6 mb-2">
                    <strong>Website:</strong> {viewData.website}
                  </div>
                  <div className="col-md-6 mb-2">
                    <strong>ZIP:</strong> {viewData.zip}
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

                  <div className="col-12 mb-2">
                    <strong>Notes:</strong> {viewData.notes}
                  </div>

                  {/* EDI Information Section */}
                  <div className="col-12 mt-3 mb-2">
                    <h6 className="border-bottom pb-2">EDI Information</h6>
                  </div>

                  <div className="col-md-6 mb-2">
                    <strong>Sender Code:</strong> {viewData.edi?.senderCode}
                  </div>
                  <div className="col-md-6 mb-2">
                    <strong>Receiver Name:</strong> {viewData.edi?.receiverName}
                  </div>

                  <div className="col-md-6 mb-2">
                    <strong>Receiver Code:</strong> {viewData.edi?.receiverCode}
                  </div>
                  <div className="col-md-6 mb-2">
                    <strong>Receiver ETIN:</strong> {viewData.edi?.receiverETIN}
                  </div>

                  <div className="col-md-6 mb-2">
                    <strong>EDI Version:</strong> {viewData.edi?.ediVersion}
                  </div>
                  <div className="col-md-6 mb-2">
                    <strong>Submitter Name:</strong>{" "}
                    {viewData.edi?.submitterName}
                  </div>

                  <div className="col-md-6 mb-2">
                    <strong>EDI Contact Name:</strong>{" "}
                    {viewData.edi?.ediContactName}
                  </div>
                  <div className="col-md-6 mb-2">
                    <strong>Submitter ETIN:</strong>{" "}
                    {viewData.edi?.submitterETIN}
                  </div>

                  <div className="col-md-6 mb-2">
                    <strong>EDI Contact Number:</strong>{" "}
                    {viewData.edi?.ediContactNumber}
                  </div>
                  <div className="col-md-6 mb-2">
                    <strong>Claim Filing Indicator:</strong>{" "}
                    {claimFilingIndicators.find((item) => item.value === viewData.edi?.claimFilingIndicator)?.value.split('-')[1] || 'N/A'}
                  </div>

                  <div className="col-md-6 mb-2">
                    <strong>ISA05 Sender ID Qualifier:</strong>{" "}
                     {interchangeIDQualifiers.find((item) => item.value === viewData.edi?.isa05SenderIdQualifier)?.value.split('-')[1] || 'N/A'}
                  </div>
                  <div className="col-md-6 mb-2">
                    <strong>ISA07 Receiver ID Qualifier:</strong>{" "}
                    {interchangeIDQualifiers.find((item) => item.value === viewData.edi?.isa07ReceiverIdQualifier)?.value.split('-')[1] || 'N/A'}
                  </div>

                  <div className="col-md-6 mb-2">
                    <strong>State EVV:</strong>{" "}
                    {viewData.edi?.stateEVV ? "Yes" : "No"}
                  </div>
                  <div className="col-md-6 mb-2">
                    <strong>EVV ID:</strong> {viewData.edi?.evvId}
                  </div>

                  <div className="col-md-6 mb-2">
                    <strong>Payor Program:</strong> {viewData.edi?.payorProgram}
                  </div>
                  <div className="col-md-6 mb-2">
                    <strong>Provider Commercial Number:</strong>{" "}
                    {viewData.edi?.providerCommercialNumber}
                  </div>

                  {/* Options Section */}
                  <div className="col-12 mt-3 mb-2">
                    <h6 className="border-bottom pb-2">Options</h6>
                  </div>

                  <div className="col-md-6 mb-2">
                    <strong>Include Service Taxonomy Codes:</strong>{" "}
                    {viewData.options?.includeServiceTaxonomyCodes
                      ? "Yes"
                      : "No"}
                  </div>
                  <div className="col-md-6 mb-2">
                    <strong>Include Other Provider:</strong>{" "}
                    {viewData.options?.includeOtherProvider ? "Yes" : "No"}
                  </div>

                  <div className="col-md-6 mb-2">
                    <strong>Do Not Print 2420A Provider:</strong>{" "}
                    {viewData.options?.doNotPrint2420APrv ? "Yes" : "No"}
                  </div>
                  <div className="col-md-6 mb-2">
                    <strong>Include CG Name and NPI:</strong>{" "}
                    {viewData.options?.includeCGNameAndNPI ? "Yes" : "No"}
                  </div>

                  <div className="col-md-6 mb-2">
                    <strong>Include Client Address:</strong>{" "}
                    {viewData.options?.includeClientAddress ? "Yes" : "No"}
                  </div>
                  <div className="col-md-6 mb-2">
                    <strong>Remove Leading Zeros:</strong>{" "}
                    {viewData.options?.removeLeadingZeros ? "Yes" : "No"}
                  </div>

                  <div className="col-md-6 mb-2">
                    <strong>Add Modifier 76:</strong>{" "}
                    {viewData.options?.addModifier76 ? "Yes" : "No"}
                  </div>

                  {/* Call Processing Section */}
                  <div className="col-12 mt-3 mb-2">
                    <h6 className="border-bottom pb-2">Call Processing</h6>
                  </div>

                  <div className="col-md-6 mb-2">
                    <strong>Override Default EVV Rounding:</strong>{" "}
                    {viewData.callProcessing?.overrideDefaultEVVRounding
                      ? "Yes"
                      : "No"}
                  </div>

                  <div className="col-md-6 mb-2">
                    <strong>Rounding Interval (minutes):</strong>{" "}
                    {viewData.callProcessing?.roundingInterval}
                  </div>

                  <div className="col-md-6 mb-2">
                    <strong>Round To Scheduled Time (minutes):</strong>{" "}
                    {viewData.callProcessing?.roundToScheduledTime}
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
