import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchSchedules,
  getAllWeeks,
  deleteWeek,
} from "../../../../store/IDB_SYS/timesheet/timesheetWeekSlice";
import moment from "moment";
import Modal from "react-bootstrap/Modal";
import Spinner from "react-bootstrap/Spinner";
import TimesheetModal from "../../../components/Popup/TimesheetModal";

const TimesheetManager = () => {
  const [activeTab, setActiveTab] = useState("create");
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const { weeks, schedules, loading, error } = useSelector(
    (state) => state.timesheetWeek
  );

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getAllWeeks());
  }, [dispatch]);

  useEffect(() => {
    if (schedules && schedules.length > 0) {
      // Data is already loaded, no need to show loader
    }
  }, [schedules]);

  const handleWeekSelect = (id) => {
    setSelectedWeek(id === selectedWeek ? null : id);
  };

  const handleCreateTimesheets = () => {
    if (!selectedWeek) {
      alert("Please select a week first");
      return;
    }

    setShowModal(true);
    dispatch(fetchSchedules({ weekId: selectedWeek }));
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleDeleteWeek = async (weekId, isLocked) => {
    if (isLocked) {
      alert("Cannot delete a locked/finalized week");
      return;
    }
    
    if (window.confirm("Are you sure you want to delete this draft week? This action cannot be undone.")) {
      try {
        await dispatch(deleteWeek(weekId)).unwrap();
        // Clear selection if the deleted week was selected
        if (selectedWeek === weekId) {
          setSelectedWeek(null);
        }
      } catch (error) {
        alert(error || "Failed to delete week");
      }
    }
  };

  const selectedWeekData = weeks.find((week) => week._id === selectedWeek);

  // Calculate totals from schedules
  const totalHours =
    schedules?.reduce((sum, schedule) => sum + (schedule.duration || 0), 0) ||
    0;
  const totalAmount =
    schedules?.reduce(
      (sum, schedule) => sum + (schedule.totalAmount || 0),
      0
    ) || 0;

  return (
    <div className="container-fluid mt-3">
      {/* Tabs */}
      <ul className="nav nav-pills mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "create" ? "active" : ""}`}
            onClick={() => setActiveTab("create")}
          >
            Create Timesheets
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "history" ? "active" : ""}`}
            onClick={() => setActiveTab("history")}
          >
            Timesheet History
          </button>
        </li>
      </ul>

      <div className="row">
        {/* Left Table */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-green text-white d-flex justify-content-between align-items-center">
              <h6 className="mb-0">Pay Periods</h6>
              {selectedWeek && (
                <small>
                  Selected:{" "}
                  {moment(selectedWeekData?.startDate).format("MM/DD/YYYY")} -{" "}
                  {moment(selectedWeekData?.endDate).format("MM/DD/YYYY")}
                </small>
              )}
            </div>
            <div className="card-body p-0">
              <div className="table-responsive" style={{ maxHeight: "500px" }}>
                <table className="table table-hover table-sm mb-0">
                  <thead className="table-secondary sticky-top">
                    <tr>
                      <th style={{ width: "40px" }}>Select</th>
                      <th>Pay Period ID</th>
                      <th>Start Date</th>
                      <th>End Date</th>
                      <th>Adv Billing</th>
                      <th>Allocated</th>
                      <th>Status</th>
                      <th style={{ width: "80px" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      // Loading spinner for table data
                      <tr>
                        <td colSpan="8" className="text-center py-4">
                          <div className="d-flex justify-content-center align-items-center">
                            <Spinner animation="border" variant="success" size="sm" className="me-2" />
                            <span>Loading pay periods...</span>
                          </div>
                        </td>
                      </tr>
                    ) : weeks.length === 0 ? (
                      // No records found message
                      <tr>
                        <td colSpan="8" className="text-center py-4">
                          <div className="text-muted">
                            <i className="bi bi-inbox" style={{ fontSize: "2rem" }}></i>
                            <p className="mt-2 mb-0">No pay periods found</p>
                            <small>Create a pay period to get started</small>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      // Table data
                      weeks.map((row, i) => (
                        <tr
                          key={row._id}
                          className={
                            selectedWeek === row._id ? "table-primary" : ""
                          }
                          style={{ cursor: "pointer" }}
                          onClick={() => handleWeekSelect(row._id)}
                        >
                          <td>
                            <input
                              type="radio"
                              className="form-check-input"
                              checked={selectedWeek === row._id}
                              onChange={() => handleWeekSelect(row._id)}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </td>
                          <td>
                            <strong>{row._id}</strong>
                          </td>
                          <td>{moment(row.startDate).format("MM/DD/yyyy")}</td>
                          <td>{moment(row.endDate).format("MM/DD/yyyy")}</td>
                          <td></td>
                          <td></td>
                          <td>
                            <span className={`badge ${row.isLocked ? 'bg-success' : 'bg-warning text-dark'}`}>
                              {row.isLocked ? 'Locked' : 'Draft'}
                            </span>
                          </td>
                          <td>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteWeek(row._id, row.isLocked);
                              }}
                              disabled={row.isLocked || loading}
                              title={row.isLocked ? "Cannot delete locked week" : "Delete draft week"}
                            >
                              🗑️
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="col-lg-4">
          {/* Create Timesheets Card */}
          <div className="card border-0 shadow-sm mb-3 pt-3">
            <div className="border">
              <h6
                className="mb-0 bg-white position-absolute"
                style={{ top: "6px", left: "14px", padding: "0px 8px" }}
              >
                Create Timesheets
              </h6>

              <div className="card-body">
                <div className="d-flex gap-2 my-3">
                  <button
                    className="btn btn-success"
                    onClick={handleCreateTimesheets}
                    disabled={!selectedWeek || loading}
                  >
                    {loading ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Processing...
                      </>
                    ) : (
                      "Create Timesheets"
                    )}
                  </button>
                  <button 
                    className="btn btn-outline-secondary"
                    disabled={loading}
                  >
                    Reset Timesheets
                  </button>
                </div>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="skipPaid"
                    defaultChecked
                    disabled={loading}
                  />
                  <label className="form-check-label small" htmlFor="skipPaid">
                    Do not update or delete timesheets that have been marked as
                    billed or paid
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Audit Reports Card */}
          <div className="card border-0 shadow-sm mb-3 pt-3">
            <div className="border">
              <h6
                className="mb-0 bg-white position-absolute"
                style={{ top: "6px", left: "14px", padding: "0px 8px" }}
              >
                Timesheet Audit Reports
              </h6>

              <div className="card-body">
                <div className="d-flex gap-2 my-3">
                  <button 
                    className="btn btn-success"
                    disabled={loading}
                  >
                    Schedules Missing Timesheets
                  </button>
                  <button 
                    className="btn btn-outline-info"
                    disabled={loading}
                  >
                    Timesheets Missing Schedules
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Advance Billing Card */}
          <div className="card border-0 shadow-sm mb-3 pt-3">
            <div className="border">
              <h6
                className="mb-0 bg-white position-absolute"
                style={{ top: "6px", left: "14px", padding: "0px 8px" }}
              >
                Advance Billing
              </h6>

              <div className="card-body">
                <div className="d-flex gap-2 my-3">
                  <button 
                    className="btn btn-success"
                    disabled={loading}
                  >
                    Adv Billing Checkpoint
                  </button>
                  <button 
                    className="btn btn-outline-warning"
                    disabled={loading}
                  >
                    Reconcile Adv Billing
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bootstrap Modal */}
      <TimesheetModal
        showModal={showModal}
        handleCloseModal={handleCloseModal}
        loading={loading}
        error={error}
        schedules={schedules}
        selectedWeekData={selectedWeekData}
        totalHours={totalHours}
        totalAmount={totalAmount}
      />
    </div>
  );
};

export default TimesheetManager;