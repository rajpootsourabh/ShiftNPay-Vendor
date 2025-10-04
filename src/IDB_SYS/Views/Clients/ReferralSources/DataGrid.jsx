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
  createReferralSource,
  deleteReferralSource,
  fetchReferralSourceById,
  fetchReferralSourcesByVendor,
  updateReferralSource,
} from "../../../../store/IDB_SYS/Clients/referralSourceSlice";

const ReferralSourceSchema = Yup.object().shape({
  name: Yup.string().required("Name is required"),
});

const DataGrid = () => {
  const dispatch = useDispatch();
  const { referralSources } = useSelector((state) => state.referralSource);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewData, setViewData] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [initialValues, setInitialValues] = useState({
    name: "",
  });
  const [apiLoading, setApiLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchReferralSourcesByVendor());
  }, [dispatch]);

  const handleDelete = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You want to delete this Referral Source!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        setApiLoading(true);
        dispatch(deleteReferralSource(id)).finally(() => {
          setApiLoading(false);
        });
      }
    });
  };

const handleEdit = (id) => {
  console.log("Editing ID:", id);
  setApiLoading(true);
  dispatch(fetchReferralSourceById(id))
    .then((res) => {
      console.log("Edit response:", res);
      console.log("Edit payload:", res.payload);
      if (res.payload) {
        setInitialValues(res.payload);
        setEditMode(true);
        setShowModal(true);
      } else {
        console.log("No payload received");
      }
    })
    .catch((error) => {
      console.error("Edit error:", error);
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
      dispatch(updateReferralSource({ id: values._id, data: values }))
        .then(() => {
          setSubmitting(false);
          setShowModal(false);
          setEditMode(false);
        })
        .finally(() => {
          setApiLoading(false);
        });
    } else {
      dispatch(createReferralSource(values))
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
              <th className="text-left">Name</th>
              <th className="text-left">Created Date</th>
            </tr>
          </thead>
          <tbody>
            {referralSources.length > 0 ? (
              referralSources.map((row, index) => (
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
                  <td>{row.name}</td>
                  <td>{new Date(row.createdAt).toLocaleDateString()}</td>
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

      {showModal && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div
              className="modal-content border-0 shadow-lg"
              style={{ maxWidth: "600px" }}
            >
              <Formik
                initialValues={initialValues}
                validationSchema={ReferralSourceSchema}
                enableReinitialize
                onSubmit={handleSubmit}
              >
                {({ isSubmitting }) => (
                  <Form>
                    <div className="modal-header bg-green text-white py-2">
                      <h5 className="modal-title fs-6">
                        {editMode ? "Edit Referral Source" : "Add New Referral Source"}
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
                        <label className="form-label small fw-semibold">
                          Name *
                        </label>
                        <Field
                          type="text"
                          name="name"
                          className="form-control form-control-sm"
                          placeholder="Enter referral source name"
                        />
                        <ErrorMessage
                          name="name"
                          component="div"
                          className="text-danger small mt-1"
                        />
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
          <div className="modal-dialog modal-dialog-centered">
            <div
              className="modal-content border-0 shadow-lg"
              style={{ maxWidth: "600px" }}
            >
              <div className="modal-header bg-green text-white py-2">
                <h5 className="modal-title fs-6">View Referral Source Details</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowViewModal(false)}
                ></button>
              </div>
              <div className="modal-body p-3">
                <div className="mb-2">
                  <label className="form-label small fw-semibold">
                    Name
                  </label>
                  <div className="form-control-plaintext form-control-sm bg-light rounded p-2">
                    {viewData.name}
                  </div>
                </div>
                <div className="mb-2">
                  <label className="form-label small fw-semibold">
                    Created Date
                  </label>
                  <div className="form-control-plaintext form-control-sm bg-light rounded p-2">
                    {new Date(viewData.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="mb-2">
                  <label className="form-label small fw-semibold">
                    Last Updated
                  </label>
                  <div className="form-control-plaintext form-control-sm bg-light rounded p-2">
                    {new Date(viewData.updatedAt).toLocaleDateString()}
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