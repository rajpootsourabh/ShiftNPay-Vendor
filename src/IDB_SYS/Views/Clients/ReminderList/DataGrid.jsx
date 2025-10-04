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
  createReminderList,
  deleteReminderList,
  fetchReminderListById,
  fetchReminderListByVendor,
  updateReminderList,
} from "../../../../store/IDB_SYS/Clients/reminderListSlice";

const CustomFieldSchema = Yup.object().shape({
  description: Yup.string().required("Required"),
});

const DataGrid = () => {
  const dispatch = useDispatch();
  const { reminderList } = useSelector((state) => state.reminderList);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewData, setViewData] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [initialValues, setInitialValues] = useState({
    description: "",
    client: false,
    caregiver: false,
    autoRemind: false,
    defaultVal: false,
    sortOrder: 0,
  });
  const [apiLoading, setApiLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchReminderListByVendor());
  }, [dispatch]);

  const handleDelete = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You want to delete this Reminder!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        setApiLoading(true);
        dispatch(deleteReminderList(id)).finally(() => {
          setApiLoading(false);
        });
      }
    });
  };

  const handleEdit = (id) => {
    setApiLoading(true);
    dispatch(fetchReminderListById(id))
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
      dispatch(updateReminderList({ id: values._id, data: values }))
        .then(() => {
          setSubmitting(false);
          setShowModal(false);
          setEditMode(false);
        })
        .finally(() => {
          setApiLoading(false);
        });
    } else {
      dispatch(createReminderList(values))
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
                        description: "",
                        client: false,
                        caregiver: false,
                        autoRemind: false,
                        sortOrder: 0,
                        defaultVal: false,
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
              <th className="text-left">Description</th>
              <th className="text-left">Caregiver</th>
              <th className="text-left">Client</th>
              <th className="text-left">Auto Remind Caregiver</th>
              <th className="text-left">Default</th>
              <th className="text-left">Sort Order</th>
            </tr>
          </thead>
          <tbody>
            {reminderList.length > 0 ? (
              reminderList.map((row, index) => (
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
                  <td>{row.caregiver ? "Yes" : "No"}</td>
                  <td>{row.client ? "Yes" : "No"}</td>
                  <td>{row.autoRemind ? "Yes" : "No"}</td>
                  <td>{row.defaultVal ? "Yes" : "No"}</td>
                  <td>{row.sortOrder ? row.sortOrder : 0}</td>
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

      {showModal && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div
              className="modal-content border-0 shadow-lg"
              style={{ maxWidth: "600px" }}
            >
              <Formik
                initialValues={initialValues}
                validationSchema={CustomFieldSchema}
                enableReinitialize
                onSubmit={handleSubmit}
              >
                {({ isSubmitting }) => (
                  <Form>
                    <div className="modal-header bg-green text-white py-2">
                      <h5 className="modal-title fs-6">
                        {editMode ? "Edit " : "Add New "}
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
                          Description
                        </label>
                        <Field
                          type="text"
                          name="description"
                          className="form-control form-control-sm"
                        />
                        <ErrorMessage
                          name="description"
                          component="div"
                          className="text-danger small mt-1"
                        />
                      </div>
                      <div className="mb-2">
                        <label className="form-label small fw-semibold">
                          Caregiver
                        </label>
                        <Field
                          type="checkbox"
                          name="caregiver"
                          className="form-check-input ms-2"
                        />
                      </div>
                      <div className="mb-2">
                        <label className="form-label small fw-semibold">
                          Client
                        </label>
                        <Field
                          type="checkbox"
                          name="client"
                          className="form-check-input ms-2"
                        />
                      </div>
                      <div className="mb-2">
                        <label className="form-label small fw-semibold">
                          Auto Remind Caregiver
                        </label>
                        <Field
                          type="checkbox"
                          name="autoRemind"
                          className="form-check-input ms-2"
                        />
                      </div>
                      <div className="mb-2">
                        <label className="form-label small fw-semibold">
                          Default
                        </label>
                        <Field
                          type="checkbox"
                          name="defaultVal"
                          className="form-check-input ms-2"
                        />
                      </div>
                      <div className="mb-2">
                        <label className="form-label small fw-semibold">
                          Sort Order
                        </label>
                        <Field
                          type="number"
                          name="sortOrder"
                          className="form-control form-control-sm"
                        />
                        <ErrorMessage
                          name="sortOrder"
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
                <h5 className="modal-title fs-6">View Details</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowViewModal(false)}
                ></button>
              </div>
              <div className="modal-body p-3">
                <div className="mb-2">
                  <label className="form-label small fw-semibold">
                    Description
                  </label>
                  <div className="form-control-plaintext form-control-sm bg-light rounded p-2">
                    {viewData.description}
                  </div>
                </div>
                <div className="mb-2">
                  <label className="form-label small fw-semibold">
                    Caregiver
                  </label>
                  <div className="form-control-plaintext form-control-sm bg-light rounded p-2">
                    {viewData.caregiver ? "Yes" : "No"}
                  </div>
                </div>
                <div className="mb-2">
                  <label className="form-label small fw-semibold">Client</label>
                  <div className="form-control-plaintext form-control-sm bg-light rounded p-2">
                    {viewData.client ? "Yes" : "No"}
                  </div>
                </div>
                <div className="mb-2">
                  <label className="form-label small fw-semibold">
                    Auto Remind Caregiver
                  </label>
                  <div className="form-control-plaintext form-control-sm bg-light rounded p-2">
                    {viewData.autoRemind ? "Yes" : "No"}
                  </div>
                </div>
                <div className="mb-2">
                  <label className="form-label small fw-semibold">
                    Default
                  </label>
                  <div className="form-control-plaintext form-control-sm bg-light rounded p-2">
                    {viewData.defaultVal ? "Yes" : "No"}
                  </div>
                </div>
                <div className="mb-2">
                  <label className="form-label small fw-semibold">
                    Sort Order
                  </label>
                  <div className="form-control-plaintext form-control-sm bg-light rounded p-2">
                    {viewData.sortOrder ? viewData.sortOrder : 0}
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
