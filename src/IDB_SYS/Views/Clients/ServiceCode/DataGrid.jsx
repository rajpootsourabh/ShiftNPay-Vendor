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
  createServiceCode,
  deleteServiceCode,
  fetchServiceCodeById,
  fetchServiceCodeByVendor,
  updateServiceCode,
} from "../../../../store/IDB_SYS/Clients/serviceCodeSlice";

const ServiceCodeSchema = Yup.object().shape({
  description: Yup.string().required("Required").max(23, "Max 23 characters"),
  shortDesc: Yup.string(),
  procedureCode: Yup.string(),
  type: Yup.string().oneOf(["Service", "Mileage"]).required("Required"),
  cost: Yup.number().required("Required").positive("Must be positive"),
  status: Yup.string().oneOf(["Active", "Inactive"]),
  billedPerVisit: Yup.string().oneOf(["Hourly", "Flat Rate"]),
  adpIncludeInAdjustedDed: Yup.boolean(),
  overridePaychexFlex: Yup.boolean(),
  payplusExport: Yup.object().shape({
    regularCode: Yup.string().max(3, "Max 3 characters"),
    overtimeCode: Yup.string().max(3, "Max 3 characters"),
    holidayCode: Yup.string().max(3, "Max 3 characters"),
    type: Yup.string().oneOf(["Service", "Mileage"]),
  }),
  mod1: Yup.string(),
  mod2: Yup.string(),
  mod3: Yup.string(),
  mod4: Yup.string(),
  tos: Yup.string(),
  supplementalInfo: Yup.string(),
  revCode: Yup.string(),
  otherEVVSystem: Yup.boolean(),
  taxonomyCode: Yup.string(),
});

const DataGrid = () => {
  const dispatch = useDispatch();
  const { serviceCode, loading, pagination } = useSelector((state) => state.serviceCode);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewData, setViewData] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [initialValues, setInitialValues] = useState({
    description: "",
    shortDesc: "",
    procedureCode: "",
    type: "Service",
    cost: 0,
    status: "Active",
    billedPerVisit: "Hourly",
    adpIncludeInAdjustedDed: false,
    overridePaychexFlex: false,
    payplusExport: {
      regularCode: "",
      overtimeCode: "",
      holidayCode: "",
      type: "Service",
    },
    mod1: "",
    mod2: "",
    mod3: "",
    mod4: "",
    tos: "",
    supplementalInfo: "",
    revCode: "",
    otherEVVSystem: false,
    taxonomyCode: "",
  });

  useEffect(() => {
    dispatch(fetchServiceCodeByVendor({ page: 1, limit: 10 }));
  }, [dispatch]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      dispatch(fetchServiceCodeByVendor({ page: newPage, limit: 10 }));
    }
  };

  const getBillingLabel = (value) => {
  if (value === "Hourly" || value === "Flat Rate") return value;

  // normalize boolean strings
  if (
    value === true ||
    (typeof value === "string" && value.toLowerCase() === "true")
  ) {
    return "Flat Rate";
  }

  if (
    value === false ||
    (typeof value === "string" && value.toLowerCase() === "false")
  ) {
    return "Hourly";
  }

  return "";
};


  const handleDelete = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You want to delete this Service Code!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(deleteServiceCode(id)).then(() => {
          dispatch(fetchServiceCodeByVendor({ page: pagination.page, limit: 10 }));
        });
      }
    });
  };

  const handleEdit = (id) => {
    dispatch(fetchServiceCodeById(id)).then((res) => {
      if (res.payload) {
        setInitialValues(res.payload);
        setEditMode(true);
        setShowModal(true);
      }
    });
  };

  const handleView = (row) => {
    setViewData(row);
    setShowViewModal(true);
  };

  const handleSubmit = (values, { setSubmitting, resetForm }) => {
    if (editMode) {
      dispatch(updateServiceCode({ id: values._id, data: values })).then(() => {
        setSubmitting(false);
        setShowModal(false);
        setEditMode(false);
        resetForm();
        dispatch(fetchServiceCodeByVendor({ page: pagination.page, limit: 10 }));
      });
    } else {
      dispatch(createServiceCode(values)).then(() => {
        setSubmitting(false);
        setShowModal(false);
        resetForm();
        dispatch(fetchServiceCodeByVendor({ page: 1, limit: 10 }));
      });
    }
  };

  return (
    <>
      {loading && (
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
                        shortDesc: "",
                        procedureCode: "",
                        type: "Service",
                        cost: 0,
                        status: "Active",
                        billedPerVisit: "",
                        adpIncludeInAdjustedDed: false,
                        overridePaychexFlex: false,
                        payplusExport: {
                          regularCode: "",
                          overtimeCode: "",
                          holidayCode: "",
                          type: "Service",
                        },
                        mod1: "",
                        mod2: "",
                        mod3: "",
                        mod4: "",
                        tos: "",
                        supplementalInfo: "",
                        revCode: "",
                        otherEVVSystem: false,
                        taxonomyCode: "",
                      });
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    <span className="d-flex align-items-center">
                      <img src={Plus} className="icons mx-1" alt="Add" />
                      <span> New </span>
                    </span>
                  </div>
                </div>
              </th>
              <th className="text-left">Description</th>
              <th className="text-left">Type</th>
              <th className="text-left">Cost</th>
              <th className="text-left">Status</th>
              <th className="text-left">Billed Per Visit</th>
            </tr>
          </thead>
          <tbody>
            {serviceCode.length > 0 ? (
              serviceCode.map((row, index) => (
                <tr key={index}>
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
                          onClick={() => handleView(row)}
                        >
                          <img src={audit} className="icons mx-1" alt="View" />
                        </span>
                      </div>
                    </div>
                  </td>
                  <td>{row.description}</td>
                  <td>{row.type}</td>
                  <td>${Number(row.cost || 0).toFixed(2)}</td>
                  <td>
                  {row.status === "I"
                    ? "Inactive"
                    : row.status === "A"
                    ? "Active"
                    : row.status}
                 </td>

           <td>{getBillingLabel(row.billedPerVisit)}</td>


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


      {showModal && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered modal-xl">
            <div className="modal-content border-0 shadow-lg">
              <Formik
                initialValues={initialValues}
                validationSchema={ServiceCodeSchema}
                enableReinitialize
                onSubmit={handleSubmit}
              >
                {({ isSubmitting, values }) => (
                  <Form>
                    <div className="modal-header bg-green text-white py-2">
                      <h5 className="modal-title fs-6">
                        {editMode
                          ? "Edit Service Code"
                          : "Add New Service Code"}
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
                        <div className="col-md-4">
                          <div className="mb-3">
                            <label className="form-label small fw-semibold">
                              Description*
                            </label>
                            <Field
                              type="text"
                              name="description"
                              className="form-control form-control-sm"
                              maxLength="23"
                            />
                            <ErrorMessage
                              name="description"
                              component="div"
                              className="text-danger small mt-1"
                            />
                          </div>

                          <div className="mb-3">
                            <label className="form-label small fw-semibold">
                              Short Description
                            </label>
                            <Field
                              type="text"
                              name="shortDesc"
                              className="form-control form-control-sm"
                            />
                          </div>

                          <div className="mb-3">
                            <label className="form-label small fw-semibold">
                              Procedure Code
                            </label>
                            <Field
                              type="text"
                              name="procedureCode"
                              className="form-control form-control-sm"
                            />
                          </div>

                          <div className="mb-3">
                            <label className="form-label small fw-semibold">
                              Type*
                            </label>
                            <Field
                              as="select"
                              name="type"
                              className="form-select form-select-sm"
                            >
                              <option value="Service">Service</option>
                              <option value="Mileage">Mileage</option>
                            </Field>
                            <ErrorMessage
                              name="type"
                              component="div"
                              className="text-danger small mt-1"
                            />
                          </div>

                          <div className="mb-3">
                            <label className="form-label small fw-semibold">
                              Cost*
                            </label>
                            <Field
                              type="number"
                              name="cost"
                              className="form-control form-control-sm"
                              step="0.01"
                              min="0"
                            />
                            <ErrorMessage
                              name="cost"
                              component="div"
                              className="text-danger small mt-1"
                            />
                          </div>

                          <div className="mb-3">
                            <label className="form-label small fw-semibold">
                              Status
                            </label>
                            <Field
                              as="select"
                              name="status"
                              className="form-select form-select-sm"
                            >
                              <option value="Active">Active</option>
                              <option value="Inactive">Inactive</option>
                            </Field>
                          </div>

                          <div className="mb-3">
                            <label className="form-label small fw-semibold">
                              Billed Per Visit
                            </label>
                            <Field
                              as="select"
                              name="billedPerVisit"
                              className="form-select form-select-sm"
                            >
                              <option value="Hourly">Hourly</option>
                              <option value="Flat Rate">Flat Rate</option>
                            </Field>
                          </div>

                          <div className="mb-3 form-check">
                            <Field
                              type="checkbox"
                              name="adpIncludeInAdjustedDed"
                              className="form-check-input"
                              id="adpIncludeInAdjustedDed"
                            />
                            <label
                              className="form-check-label small fw-semibold"
                              htmlFor="adpIncludeInAdjustedDed"
                            >
                              ADP Include in Adjusted Ded
                            </label>
                          </div>

                          <div className="mb-3 form-check">
                            <Field
                              type="checkbox"
                              name="overridePaychexFlex"
                              className="form-check-input"
                              id="overridePaychexFlex"
                            />
                            <label
                              className="form-check-label small fw-semibold"
                              htmlFor="overridePaychexFlex"
                            >
                              Override Paychex Flex
                            </label>
                          </div>

                          <div className="mb-3 form-check">
                            <Field
                              type="checkbox"
                              name="otherEVVSystem"
                              className="form-check-input"
                              id="otherEVVSystem"
                            />
                            <label
                              className="form-check-label small fw-semibold"
                              htmlFor="otherEVVSystem"
                            >
                              Other EVV System
                            </label>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <h6 className="mb-3">Payplus Export</h6>
                          <div className="mb-3">
                            <label className="form-label small fw-semibold">
                              Regular Code
                            </label>
                            <Field
                              type="text"
                              name="payplusExport.regularCode"
                              className="form-control form-control-sm"
                              maxLength="3"
                            />
                            <ErrorMessage
                              name="payplusExport.regularCode"
                              component="div"
                              className="text-danger small mt-1"
                            />
                          </div>

                          <div className="mb-3">
                            <label className="form-label small fw-semibold">
                              Overtime Code
                            </label>
                            <Field
                              type="text"
                              name="payplusExport.overtimeCode"
                              className="form-control form-control-sm"
                              maxLength="3"
                            />
                          </div>

                          <div className="mb-3">
                            <label className="form-label small fw-semibold">
                              Holiday Code
                            </label>
                            <Field
                              type="text"
                              name="payplusExport.holidayCode"
                              className="form-control form-control-sm"
                              maxLength="3"
                            />
                          </div>

                          <div className="mb-3">
                            <label className="form-label small fw-semibold">
                              Taxonomy Code
                            </label>
                            <Field
                              type="text"
                              name="taxonomyCode"
                              className="form-control form-control-sm"
                            />
                          </div>
                        </div>
                        <div className="col-md-4">


                          <h6 className="mb-3">CMS 1500 Fields</h6>
                          <div className="mb-3">
                            <label className="form-label small fw-semibold">
                              MOD 1
                            </label>
                            <Field
                              type="text"
                              name="mod1"
                              className="form-control form-control-sm"
                            />
                          </div>

                          <div className="mb-3">
                            <label className="form-label small fw-semibold">
                              MOD 2
                            </label>
                            <Field
                              type="text"
                              name="mod2"
                              className="form-control form-control-sm"
                            />
                          </div>

                          <div className="mb-3">
                            <label className="form-label small fw-semibold">
                              MOD 3
                            </label>
                            <Field
                              type="text"
                              name="mod3"
                              className="form-control form-control-sm"
                            />
                          </div>

                          <div className="mb-3">
                            <label className="form-label small fw-semibold">
                              MOD 4
                            </label>
                            <Field
                              type="text"
                              name="mod4"
                              className="form-control form-control-sm"
                            />
                          </div>

                          <div className="mb-3">
                            <label className="form-label small fw-semibold">
                              TOS
                            </label>
                            <Field
                              type="text"
                              name="tos"
                              className="form-control form-control-sm"
                            />
                          </div>

                          <div className="mb-3">
                            <label className="form-label small fw-semibold">
                              Supplemental Info
                            </label>
                            <Field
                              type="text"
                              name="supplementalInfo"
                              className="form-control form-control-sm"
                            />
                          </div>

                          <div className="mb-3">
                            <label className="form-label small fw-semibold">
                              Rev Code
                            </label>
                            <Field
                              type="text"
                              name="revCode"
                              className="form-control form-control-sm"
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
          <div className="modal-dialog modal-dialog-centered modal-xl">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-green text-white py-2">
                <h5 className="modal-title fs-6">Service Code Details</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowViewModal(false)}
                ></button>
              </div>
              <div className="modal-body p-3">
                <div className="row">
                  <div className="col-md-4">
                    <div className="mb-3">
                      <label className="form-label small fw-semibold">
                        Description
                      </label>
                      <div className="form-control-plaintext form-control-sm bg-light rounded p-2">
                        {viewData.description}
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label small fw-semibold">
                        Short Description
                      </label>
                      <div className="form-control-plaintext form-control-sm bg-light rounded p-2">
                        {viewData.shortDesc || "-"}
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label small fw-semibold">
                        Procedure Code
                      </label>
                      <div className="form-control-plaintext form-control-sm bg-light rounded p-2">
                        {viewData.procedureCode || "-"}
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label small fw-semibold">
                        Type
                      </label>
                      <div className="form-control-plaintext form-control-sm bg-light rounded p-2">
                        {viewData.type}
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label small fw-semibold">
                        Cost
                      </label>
                      <div className="form-control-plaintext form-control-sm bg-light rounded p-2">
                        ${viewData.cost?.toFixed(2) || "0.00"}
                      </div>
                    </div>
                    <h6 className="mb-3">Payplus Export</h6>
                    <div className="mb-3">
                      <label className="form-label small fw-semibold">
                        Regular Code
                      </label>
                      <div className="form-control-plaintext form-control-sm bg-light rounded p-2">
                        {viewData.payplusExport?.regularCode || "-"}
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label small fw-semibold">
                        Overtime Code
                      </label>
                      <div className="form-control-plaintext form-control-sm bg-light rounded p-2">
                        {viewData.payplusExport?.overtimeCode || "-"}
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label small fw-semibold">
                        Holiday Code
                      </label>
                      <div className="form-control-plaintext form-control-sm bg-light rounded p-2">
                        {viewData.payplusExport?.holidayCode || "-"}
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label small fw-semibold">
                        Taxonomy Code
                      </label>
                      <div className="form-control-plaintext form-control-sm bg-light rounded p-2">
                        {viewData.taxonomyCode || "-"}
                      </div>
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="mb-3">
                      <label className="form-label small fw-semibold">
                        Status
                      </label>
                      <div className="form-control-plaintext form-control-sm bg-light rounded p-2">
                        {viewData.status}
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label small fw-semibold">
                        Billed Per Visit
                      </label>
                      <div className="form-control-plaintext form-control-sm bg-light rounded p-2">
                        {viewData.billedPerVisit}
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label small fw-semibold">
                        ADP Include in Adjusted Ded
                      </label>
                      <div className="form-control-plaintext form-control-sm bg-light rounded p-2">
                        {viewData.adpIncludeInAdjustedDed ? "Yes" : "No"}
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label small fw-semibold">
                        Override Paychex Flex
                      </label>
                      <div className="form-control-plaintext form-control-sm bg-light rounded p-2">
                        {viewData.overridePaychexFlex ? "Yes" : "No"}
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label small fw-semibold">
                        Other EVV System
                      </label>
                      <div className="form-control-plaintext form-control-sm bg-light rounded p-2">
                        {viewData.otherEVVSystem ? "Yes" : "No"}
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4">

                    <h6 className="mb-3">CMS 1500 Fields</h6>
                    <div className="mb-3">
                      <label className="form-label small fw-semibold">
                        MOD 1
                      </label>
                      <div className="form-control-plaintext form-control-sm bg-light rounded p-2">
                        {viewData.mod1 || "-"}
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label small fw-semibold">
                        MOD 2
                      </label>
                      <div className="form-control-plaintext form-control-sm bg-light rounded p-2">
                        {viewData.mod2 || "-"}
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label small fw-semibold">
                        MOD 3
                      </label>
                      <div className="form-control-plaintext form-control-sm bg-light rounded p-2">
                        {viewData.mod3 || "-"}
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label small fw-semibold">
                        MOD 4
                      </label>
                      <div className="form-control-plaintext form-control-sm bg-light rounded p-2">
                        {viewData.mod4 || "-"}
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label small fw-semibold">
                        TOS
                      </label>
                      <div className="form-control-plaintext form-control-sm bg-light rounded p-2">
                        {viewData.tos || "-"}
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label small fw-semibold">
                        Supplemental Info
                      </label>
                      <div className="form-control-plaintext form-control-sm bg-light rounded p-2">
                        {viewData.supplementalInfo || "-"}
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label small fw-semibold">
                        Rev Code
                      </label>
                      <div className="form-control-plaintext form-control-sm bg-light rounded p-2">
                        {viewData.revCode || "-"}
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
    </>
  );
};

export default DataGrid;
