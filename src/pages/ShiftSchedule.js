import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./customStyles.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter, faUsers } from '@fortawesome/free-solid-svg-icons';
import { useDispatch, useSelector } from "react-redux";
import { shiftScheduleOfMonth, shiftScheduleOfWeek } from "../store/Dashboard/dashboardSlice";
import moment from "moment";
import ShiftHolidayModal from "../popup/ShiftHolidayModal";

// Helper: Get current week's days
const getCurrentWeekDays = () => {
  const today = moment();
  const startOfWeek = today.clone().startOf('week').add(1, 'day'); // Monday
  return Array.from({ length: 7 }, (_, i) => {
    const date = startOfWeek.clone().add(i, 'days');
    return {
      day: date.format('ddd'),
      date: date.date(),
      fullDate: date.format('YYYY-MM-DD')
    };
  });
};

// Helper: Get all days in the current month
const getCurrentMonthDays = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  return Array.from({ length: daysInMonth }, (_, i) => {
    const date = new Date(year, month, i + 1);
    return {
      day: date.toLocaleString("default", { weekday: "short" }),
      date: date.getDate(),
    };
  });
};

const ShiftSchedule = () => {
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [viewMode, setViewMode] = useState("week");
  const currentWeek = getCurrentWeekDays();
  const dispatch = useDispatch();

  // Assuming you've updated your Redux state to store the weekly data in this format
  const { shift, monthlyShift } = useSelector((state) => state.dashboard);

  useEffect(() => {
    dispatch(shiftScheduleOfWeek());
    dispatch(shiftScheduleOfMonth());
  }, [dispatch]);

  const handleViewInfo = (employeeData, date) => {
    setModalData({
      employee: employeeData,
      date: date
    });
    setShowModal(true);
  };
  useEffect(() => {
    console.log('shift : ', shift)
  }, [shift])
  return (
    <div className="shift-schedule px-2">
      <div className="row">
        {/* Header Section */}
        <div className="col-md-12 p-3 border-bottom">
          <div className="row">
            <div className="col-md-6">
              <div className="row">
                <div className="col-md-4">
                  <div className="switchOuterDiv">
                    <div className="btn1 off">
                      <span><span>🕒</span> Shift View</span>
                    </div>
                    <div className="btn1 on">
                      <span> <span><FontAwesomeIcon icon={faUsers} /></span>Staff View</span>
                    </div>
                  </div>
                </div>
                <div className="col-md-2">
                  <div className="switchOuterDiv">
                    <span className="singleFilter"><span><FontAwesomeIcon icon={faFilter} /></span> Status All</span>
                  </div>
                </div>
                <div className="col-md-2">
                  <div className="switchOuterDiv">
                    <span className="singleFilter"><span><FontAwesomeIcon icon={faFilter} /></span> Team All</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="row">
                <div className="col-md-5"></div>
                <div className="col-md-3">
                  <div className="switchOuterDiv">
                    <div
                      className={`btn1 ${viewMode === "week" ? "on" : "off"} justify-content-center`}
                      onClick={() => setViewMode("week")}
                    >
                      <span>Week</span>
                    </div>
                    <div
                      className={`btn1 ${viewMode === "month" ? "on" : "off"} justify-content-center`}
                      onClick={() => setViewMode("month")}
                    >
                      <span>Month</span>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="switchOuterDiv">
                    <span className="singleFilter"> Current {viewMode === "week" ? "Week" : "Month"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {viewMode === "week" && (
          <div className="weekly-view">
            <div className="col-md-12 border-bottom">
              <div className="row px-1">
                <div className="col emptyCol"></div>
                {currentWeek.map((day, index) => (
                  <div className="col" key={index}>
                    <span className="text-uppercase pt-2" style={{ fontSize: '10px' }}>{day.day}</span>
                    <div>
                      <span>
                        <strong className="h5">{day.date}</strong>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Render employees with their weekly shifts */}
            {shift?.map((employee) => (
              <div key={employee.employeeId} className="col-md-12 border-bottom">
                <div className="row px-1">
                  <div className="col p-1">
                    <div className="userInfo card d-flex">
                      <div className="mt-1">
                        <span className="FirstLettersIcon">
                          {employee.employeeName.substring(0, 2).toUpperCase()}
                        </span>
                        <strong>{employee.employeeName}</strong>
                      </div>
                      {/* Display job names */}
                      <div className="job-names">
                        {employee.jobs?.map(job => (
                          <span key={job.jobId} className="job-badge">
                            {job.jobName}
                          </span>
                        ))}
                      </div>
                      <div>
                        Total: <span>{employee.totalHours.toFixed(2)} hours</span>
                      </div>
                    </div>
                  </div>

                  {currentWeek.map((day) => {
                    const dateKey = day.fullDate;
                    const shiftsForDay = employee.shiftDetails[dateKey] || [];
                    const hasLeave = employee.leaves.some(leave => leave.date === dateKey);

                    return (
                      <div key={dateKey} className="col p-1 shift-col">
                        {hasLeave ? (
                          <div className="card bg-warning">
                            <p className="mb-0">
                              {employee.leaves.find(l => l.date === dateKey).type}
                            </p>
                            <p className="mb-0">
                              {employee.leaves.find(l => l.date === dateKey).isHalfDay ?
                                'Half Day' : 'Full Day'}
                            </p>
                          </div>
                        ) : shiftsForDay.length > 0 ? (
                          shiftsForDay.map((shift, shiftIndex) => (
                            <div key={shiftIndex} className="card">
                              <p className="mb-0 timing">
                                {moment(shift.start).format('hh:mm A')} - {moment(shift.end).format('hh:mm A')}
                              </p>
                              <p className="mb-0">
                                <span>🕒 {shift.hours.toFixed(2)} Hours</span>
                              </p>
                              {/* Show job name for each shift if available */}
                              {employee.jobs?.length > 0 && (
                                <p className="mb-0 job-name">
                                  {employee.jobs[0].jobName} {/* Shows first job name */}
                                </p>
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="card bg-light">
                            <p className="mb-0 text-muted">No shift</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {viewMode === "month" && (
          <div className="monthly-view">
            <div className="col-md-12 border-bottom">
              {Array.from({ length: Math.ceil(Object.keys(monthlyShift).length / 7) }).map((_, rowIndex) => (
                <div className="row" key={rowIndex}>
                  {Object.keys(monthlyShift)
                    .slice(rowIndex * 7, rowIndex * 7 + 7)
                    .map((dayKey, index) => {
                      const dayData = monthlyShift[dayKey] || {}; // Access data based on the dayKey (the date)
                      const isCurrentDay = new Date().getDate() === parseInt(dayKey);

                      // Create a Date object from the dayKey (assuming it's a date string like '2024-12-23')
                      const dateObj = new Date(dayKey);
                      const dayOfWeek = dateObj.toLocaleString("en-US", { weekday: "long" }); // Get the day of the week
                      const dateFormatted = dateObj.getDate(); // Get the day of the month

                      console.log("dayData:", dayData);

                      return (
                        <div
                          className={`col border-bottom ${isCurrentDay ? "bg-info text-white" : ""}`}
                          style={{ minHeight: "98px" }}
                          key={index}
                        >
                          <span className="text-uppercase pt-2" style={{ fontSize: "10px" }}>
                            {dayOfWeek} {/* Show the day of the week */}
                          </span>
                          <div>
                            <span>
                              <strong className="h5">{dateFormatted}</strong> {/* Show the date */}
                            </span>
                            <div className="calender-info-section mt-3">
                              <p>
                                Employee Present:{" "}
                                <span>
                                  {dayData?.shifts?.length || 0}
                                </span>
                              </p>
                              <p>
                                On Leave:{" "}
                                <span>
                                  {dayData?.holidays?.length || 0}
                                </span>
                              </p>
                              {/* {dayData?.shifts && (
                        <div className="shifts-section mt-2">
                          {dayData.shifts.map((shift, shiftIndex) => (
                            <p key={shiftIndex} style={{ fontSize: "10px" }}>
                              <strong>{shift.name}</strong>: {shift.shift.name} (
                              {new Date(shift.shift.start).toLocaleTimeString("en-US", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                              -
                              {new Date(shift.shift.end).toLocaleTimeString("en-US", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                              )
                            </p>
                          ))}
                        </div>
                      )}
                      {dayData?.holidays && dayData.holidays.length > 0 && (
                        <div className="holidays-section mt-2">
                          <strong>Holidays:</strong>
                          {dayData.holidays.map((holiday, holidayIndex) => (
                            <p key={holidayIndex} style={{ fontSize: "10px" }}>
                              {holiday.name}
                            </p>
                          ))}
                        </div>
                      )} */}
                              <div className="d-flex justify-content-start">
                                <button className="btn btn-sm btn-success my-2" onClick={() => handleViewInfo(dayKey)}>
                                  View Info
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  {/* Add empty columns for the last row if less than 7 days */}
                  {Object.keys(monthlyShift).length % 7 !== 0 &&
                    rowIndex === Math.ceil(Object.keys(monthlyShift).length / 7) - 1 &&
                    Array.from({ length: 7 - (Object.keys(monthlyShift).length % 7) }).map(
                      (_, emptyIndex) => <div className="col border-bottom" key={emptyIndex} />
                    )}
                </div>
              ))}
            </div>
          </div>
        )}



      </div>
      <ShiftHolidayModal
        showModal={showModal}
        modalData={modalData}
        setShowModal={setShowModal}
      />

    </div>
  );
};

export default ShiftSchedule;
