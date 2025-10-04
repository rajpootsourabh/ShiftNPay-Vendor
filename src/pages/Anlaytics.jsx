import "bootstrap/dist/css/bootstrap.min.css";

import { Row, Col, Card, CardBody, Button, Table, Badge } from "reactstrap";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { dashboardData } from "../store/Dashboard/dashboardSlice";
import ProfilePic from "../assets/dummy.jpg";
import {
  calculateTotalAmount,
  convertSecondsToHHMMSS,
  formatDateTime,
  formatTime,
  getUserName,
  timeAgo,
  timeDifferenceInHours,
} from "../Helper/functions";
import "./../css/custom.css";
import moment from "moment";
import axios from "axios";
const bashUrl = process.env.REACT_APP_BASH_URL;
function Anlaytics() {
  const dispatch = useDispatch();
  const BaseUrlProfile = process.env.REACT_APP_BASH_IMG_URL;
  const [employeeLeaves, setEmployeeLeaves] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredJobs, setFilteredJobs] = useState([]);
  const user = useSelector((state) => state.user.user);
  const dashboard = useSelector((state) => state.dashboard.data);
  const options = {
    Authorization: `Bearer ${localStorage.getItem("shinpay-vendor-token")}`,
    "Content-Type": "application/json",
  };
  const fetchEmployeeLeavesForToday = async () => {
    try {
      const response = await axios.get(
        `${bashUrl}/leaves/employee-leave-requests?status=approved&date=today`,
        { headers: options }
      );

      const today = new Date().toLocaleDateString();

      const filteredLeaves = response.data.data.filter((job) => {
        const startDate = new Date(job.leaves.consumed.startDate).toLocaleDateString();
        const endDate = new Date(job.leaves.consumed.endDate).toLocaleDateString();

       
        
        // Check if today lies between startDate and endDate, inclusive
        return (
          today >= startDate &&
          today <= endDate
        );
      });
      console.log('filteredLeaves : ' , filteredLeaves)
      setEmployeeLeaves(filteredLeaves);
    } catch (error) {}
  };


  const handleSearch = () => {
    // Filter runningJobs based on the search term
    const filtered = dashboard?.runningJobs?.filter((job) =>
      job.userId?.firstName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredJobs(filtered || []);
  };

  useEffect(() => {
    dispatch(dashboardData());
    fetchEmployeeLeavesForToday();
  }, []);

  useEffect(() => {
    setFilteredJobs(dashboard?.runningJobs || []); // Initialize with all running jobs
  }, [dashboard]);

  return (
    <div className="container mt-4">
      {/* Search Section */}
      <div className="row mb-4">
        <div className="col-md-8">
           <input
            type="text"
            className="form-control"
            placeholder="Search by employee"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)} // Update searchTerm state
          />
        </div>
        <div className="col-md-4">
         <button className="btn btn-success w-100" onClick={handleSearch}>
            Search
          </button>
        </div>
      </div>

      {/* Hours Tracking and Holiday */}
      <div className="row mb-4">
        {/* Hours Tracking */}
        <div className="col-md-6">
          <div className="card shadow-sm">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h6 className="mb-0">Hours Tracking</h6>
              <button className="btn btn-light btn-sm">...</button>
            </div>
            <div className="card-body p-0">
              <table className="table table-bordered mb-0">
                <thead className="thead-light">
                  <tr className="table-active">
                    <th scope="col">Name</th>
                    <th scope="col">Job Name</th>
                    <th scope="col">Total Hours</th>
                    <th scope="col">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredJobs?.length ? (
                    filteredJobs?.map((job, idx) => (
                      <tr key={idx} style={{ verticalAlign: "middle" }}>
                        <td className="py-4">{getUserName(job.userId)}</td>
                        <td className="py-4">{job.jobId.name}</td>
                        <td className="py-4">
                          {job.isTimerRunning ? (
                            <div>
                              {formatTime(
                                job.elapsedTime
                              )}{" "}
                              Hrs
                            </div>
                          ) : (
                            <div>
                              {formatTime(
                                job.elapsedTime
                              )}{" "}
                              Hrs
                            </div>
                          )}
                        </td>
                        <td className="py-4">{moment().format("D-M-Y")}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={4}
                        align="center"
                        style={{
                          textAlign: "center",
                          height: "72px",
                          verticalAlign: "middle",
                        }}
                      >
                        No Data Available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Holiday */}
        <div className="col-md-6">
          <div className="card shadow-sm">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h6 className="mb-0">Holiday</h6>
              <button className="btn btn-light btn-sm">...</button>
            </div>
            <div className="card-body p-0">
              <table className="table table-bordered mb-0">
                <thead className="thead-light">
                  <tr>
                    <th scope="col">Name</th>
                    <th scope="col">Job Type</th>
                    <th scope="col">Holiday Type</th>
                    <th scope="col">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {employeeLeaves?.length ? (
                    employeeLeaves?.map((job, idx) => (
                      <tr key={idx} style={{ verticalAlign: "middle" }}>
                        <td className="py-4">{job.employeeName}</td>
                        <td className="py-4">---</td>
                        <td className="py-4">{job.leaveTypeInfo.name}</td>
                        <td className="py-4">
                          {new Date().toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={4}
                        align="center"
                        style={{
                          textAlign: "center",
                          height: "72px",
                          verticalAlign: "middle",
                        }}
                      >
                        No Data Available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Overtime Section */}
      <div className="row">
        <div className="col-md-12">
          <div className="card shadow-sm">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h6 className="mb-0">Overtime</h6>
              <button className="btn btn-light btn-sm">...</button>
            </div>
            <div className="card-body p-0">
              <table className="table table-bordered mb-0">
                <thead className="thead-light">
                  <tr>
                    <th scope="col">Job Name</th>
                    <th scope="col">Start Time</th>
                    <th scope="col">Actual Hours</th>
                    <th scope="col">Rate</th>
                    <th scope="col">Employee Name</th>
                    <th scope="col">OT Time</th>
                    <th scope="col">OT Rate</th>
                    <th scope="col">OT Amount</th>
                    <th scope="col">Total Amount</th>
                  </tr>
                </thead>
                <tbody>
                {filteredJobs?.length ? (
                    filteredJobs?.map((job, idx) => (
                      <tr key={idx} style={{ verticalAlign: "middle" }}>
                        <td className="py-4">{job.jobId.name}</td>
                        <td className="py-4">{formatDateTime(job?.startTime)}</td>
                        <td className="py-4">
                          {job.isTimerRunning ? (
                            <div>
                              {formatTime(
                                job.elapsedTime
                              )}{" "}
                              Hrs
                            </div>
                          ) : (
                            <div>
                              {formatTime(
                                job.elapsedTime
                              )}{" "}
                              Hrs
                            </div>
                          )}
                        </td>
                        <td className="py-4">{`${job.userId.rate ? `$${job.userId.rate}` : 'Not Updated'}`}</td>

                        <td className="py-4">{getUserName(job.userId)}</td>
                        <td className="py-4">00:00:00</td>
                        <td className="py-4">${job.userId.overTimeRate}</td>
                        <td className="py-4">$0</td>

                        <td className="py-4">{calculateTotalAmount({
                          rate:job.userId.rate || 0,
                          overTimeRate:job.userId.overTimeRate,
                          timeInSeconds:job.elapsedTime,
                        })}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={4}
                        align="center"
                        style={{
                          textAlign: "center",
                          height: "72px",
                          verticalAlign: "middle",
                        }}
                      >
                        No Data Available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Anlaytics;
