import "bootstrap/dist/css/bootstrap.min.css";

import { Row, Col, Card, CardBody, Button, Table, Badge } from "reactstrap";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { dashboardData } from "../store/Dashboard/dashboardSlice";
import ProfilePic from "../assets/dummy.jpg";
import { convertSecondsToHHMMSS, formatDateTime, getUserName, timeAgo } from "../Helper/functions";
import "./../css/custom.css";

function Home() {
  const dispatch = useDispatch();
  const BaseUrlProfile = process.env.REACT_APP_BASH_IMG_URL;

  const dashboard = useSelector((state) => state.dashboard.data);

  useEffect(() => {
    dispatch(dashboardData());
  }, []);

  const UserIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width="80"
      height="80"
      className="rounded bg-light p-2"
      style={{ backgroundColor: "#EDEAFF", color: "#8A4FFF" }}
    >
      <circle cx="12" cy="7" r="4" />
      <path d="M5.4 19a7 7 0 0 1 13.2 0" />
    </svg>
  );

  const JobIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width="80"
      height="80"
      className="rounded bg-light p-2"
      style={{ backgroundColor: "#FFF7E5", color: "#FFA726" }}
    >
      <rect x="3" y="7" width="18" height="13" rx="2" ry="2" />
      <path d="M16 3h-8a2 2 0 0 0-2 2v3h12V5a2 2 0 0 0-2-2z" />
    </svg>
  );

  const ActiveJobIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width="80"
      height="80"
      className="rounded bg-light p-2"
      style={{ backgroundColor: "#EBFDF1", color: "#2ECC71" }}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h4l3 8 4-16 3 8h4" />
    </svg>
  );

  return (
    <div className="container my-4">
      <Row className="justify-content-between">
        <Col md="4">
          <Card className="text-center p-1">
          <CardBody className="d-flex justify-content-between" >
          <div className="d-flex justify-content-center flex-column">
                <h6 className="mt-2">Running Shift</h6>
                <h3 className="font-weight-bold text-capitalize">
                  {dashboard.currentShift?.name ?? "N/A"}
                </h3>
              </div>
              <div className="d-flex iconShane text-right">
                <UserIcon />
              </div>
            </CardBody>
          </Card>
        </Col>
        <Col md="4">
          <Card className="text-center p-1">
            <CardBody className="d-flex justify-content-between">
              <div className="w-70 text-justify">
                <h6 className="mt-2">Running Jobs</h6>
                <h3 className="font-weight-bold">
                  {dashboard?.runningJobs?.length ?? 0}
                </h3>
              </div>
              <div className="d-flex iconShane text-right">
                <JobIcon />
              </div>
            </CardBody>
          </Card>
        </Col>
        <Col md="4">
          <Card className="text-center p-1">
            <CardBody className="d-flex justify-content-between">
              <div className="w-70 text-justify">
                <h6 className="mt-2">Active Jobs</h6>
                <h3 className="font-weight-bold">{dashboard.activeJobs}</h3>
              </div>
              <div className="d-flex iconShane text-right">
                <ActiveJobIcon />
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>

      <div className="row ">
        <div className="col-lg-8 col-md-9 col-sm-12 p-4">
          <div className="row bg-white border rounded">
            <div className="col-md-12 p-3 border-bottom">
              <div>
                <span className="h5">Running Job List</span>
              </div>
            </div>
            <div className="col-md-12 p-0 overflow-hidden">
              <Table className="overflow-hidden mb-0">
                <tbody>
                  {dashboard?.runningJobs?.length ? (
                    dashboard?.runningJobs?.map((job, idx) => (
                      <tr key={idx} style={{ verticalAlign: "middle" }}>
                        <td
                          className=" w-100 d-flex align-items-center "
                          style={{ minHeight: "90px" }}
                        >
                          <div className="w-25 text-center">
                            <img
                              src={ProfilePic}
                              alt="profile"
                              className="rounded-circle"
                              width="50"
                              height="50"
                            />
                          </div>
                          <div className="w-70 text-left">
                            <div>
                              <strong>{getUserName(job.userId)}</strong>
                            </div>
                            <small>id : {job.userId?.ssnNo}</small>
                          </div>
                        </td>
                        <td align="left">
                          <div>
                            <div>
                              <strong>{job.jobId.name}</strong>
                            </div>
                            {job.isTimerRunning ? (
                              <div>Started {timeAgo(job.lastStartTime)}</div>
                            ) : (
                              <div>Stopped {timeAgo(job.stoppedTime)}</div>
                            )}
                          </div>
                        </td>
                        <td align="center">
                          <Badge
                            color={job.isTimerRunning ? "success" : "warning"}
                          >
                            {job.isTimerRunning ? "Running" : "Paused"}
                          </Badge>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} align="center" style={{textAlign:'center', height: "90px",verticalAlign: "middle"}}>
                        No Data Available
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          </div>
        </div>
        <div className="col-lg-4 col-md-9 col-sm-12 p-4 member-database">
          <div className="row bg-white border rounded ">
            <div className="col-md-12 p-3 border-bottom mb-0">
              <div>
                <span className="h5">Active Members</span>
              </div>
            </div>
            <Table className="overflow-hidden mb-0">
              <tbody>
              {dashboard.loginLogs?.length  ? (
                  dashboard.loginLogs?.map((job, idx) => (
                  <tr key={idx} style={{ verticalAlign: "middle" }}>
                    <td
                      className=" w-100 d-flex align-items-center "
                      style={{ minHeight: "90px" }}
                    >
                      <div className="w-25 text-center">
                        <img
                          src={
                            job.employeeId?.image
                              ? `${BaseUrlProfile}/profile/${job.employeeId?.image}`
                              : ProfilePic
                          }
                          alt="profile"
                          className="rounded-circle"
                          width="50"
                          height="50"
                        />
                      </div>
                      <div className="w-70 text-left">
                        <div>
                          <strong>{getUserName(job?.employeeId)}</strong>
                        </div>
                        <small>{timeAgo(job.loginTime)}</small>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr  style={{ minHeight: "90px" }}>
                  <td colSpan={4} align="center" style={{textAlign:'center', height: "90px" ,verticalAlign: "middle"}}>
                    No Data Available
                  </td>
                </tr>
              )}
              </tbody>
            </Table>
          </div>
        </div>
        <div className="col-lg-12 col-md-12 col-sm-12 p-4">
          <div className="row rounded">
            <div className="d-flex justify-content-between align-items-center mb-3 mt-4">
              <h5>On Borad Schedules</h5>
            </div>
            <Table className="custom-table w-full divide-y divide-gray-200 timetracker ">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Current Day In Time</th>
                  <th>Out Time</th>
                  <th>Today Hours</th>
                </tr>
              </thead>
              <tbody>
                {dashboard.runningJobs?.length  ? (
                  dashboard.runningJobs?.map((employee, idx) => (
                    <tr key={idx}>
                      <td>{employee.userId.name}</td>
                      <td>{formatDateTime(employee.startTime)}</td>
                      <td>{employee.isTimerRunning ? '--' : formatDateTime(employee.stoppedTime)}</td>
                      <td>{convertSecondsToHHMMSS(employee.elapsedTime)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} align="center" style={{textAlign:'center',fontWeight:'normal'}}>
                      No Data Available
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
