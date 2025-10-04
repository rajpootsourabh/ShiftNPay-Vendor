import "bootstrap/dist/css/bootstrap.min.css";
import "./../css/custom.css";
import React, { useEffect, useState } from "react";
import {
    Button,
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Badge,
    Container,
    Row,
    Col,
    Nav,
    TabContent,
    TabPane,
} from "reactstrap";
import { toast } from "react-toastify";
import classnames from "classnames";
import { useDispatch, useSelector } from "react-redux";
import { FaUser, FaCheck, FaTimes, FaSyncAlt } from "react-icons/fa";
import { IoLocationSharp } from "react-icons/io5";
import { CiClock1 } from "react-icons/ci";
import GoogleMapReact from 'google-map-react';
import { fetchEmployeesByVendor } from "../store/Tracker/trackerSlice";
import {
    startAutoScheduleJob,
    getJobQueueStatus,
    respondToJobRequest,
    fetchUnassignedJobs
} from "../store/jobSlice";
import { getUserName } from "../Helper/functions";
import moment from "moment";

const AnyReactComponent = ({ text }) => <div>{text}</div>;
// Add this timer component at the top of your file
const CountdownTimer = ({ targetDate }) => {
    const [timeLeft, setTimeLeft] = useState({
        minutes: 15,
        seconds: 0
    });

    useEffect(() => {
        if (!targetDate) return;

        const interval = setInterval(() => {
            const now = new Date();
            const target = new Date(targetDate);
            const difference = target - now;

            if (difference <= 0) {
                clearInterval(interval);
                return;
            }

            const minutes = Math.floor((difference / 1000 / 60) % 60);
            const seconds = Math.floor((difference / 1000) % 60);

            setTimeLeft({ minutes, seconds });
        }, 1000);

        return () => clearInterval(interval);
    }, [targetDate]);

    return (
        <span className="text-danger">
            {timeLeft.minutes}m {timeLeft.seconds}s
        </span>
    );
};

const AutoSchedular = ({ user }) => {
    const dispatch = useDispatch();
    const defaultProps = {
        center: {
            lat: 10.99835602,
            lng: 77.01502627
        },
        zoom: 11
    };

    const { employees } = useSelector((state) => state.timeTracker);
    const { unassignedJobs, jobQueues } = useSelector((state) => state.job);
    const [activeTab, setActiveTab] = useState("1");
    const [modal, setModal] = useState(false);
    const [activeRequests, setActiveRequests] = useState([]);

    const toggleTab = (tab) => {
        if (activeTab !== tab) setActiveTab(tab);
    };

    const toggleModal = () => setModal(!modal);

    useEffect(() => {
        if (user) {
            dispatch(fetchEmployeesByVendor(user?._id));
            dispatch(fetchUnassignedJobs(user?._id));
            loadActiveJobQueues();
        }
    }, [user, dispatch]);

    const loadActiveJobQueues = async () => {
        try {
            const response = await dispatch(getJobQueueStatus(user?._id));
            setActiveRequests(response.payload || []);
        } catch (err) {
            console.error("Failed to load job queues:", err);
        }
    };

    const handleAutoSchedule = (jobId) => {
        dispatch(startAutoScheduleJob(jobId))
            .then(() => {
                toast.success("Auto-scheduling started for this job");
                dispatch(fetchUnassignedJobs(user?._id));
                loadActiveJobQueues();
                toggleModal();
            })
            .catch(err => {
                toast.error(err.message || "Failed to start auto-scheduling");
            });
    };

    const handleEmployeeResponse = (queueId, response) => {
        dispatch(respondToJobRequest({
            queueId,
            employeeId: user._id,
            status: response ? 'accepted' : 'rejected'
        }))
            .then(() => {
                toast.success(`Job ${response ? 'accepted' : 'rejected'}`);
                loadActiveJobQueues();
            })
            .catch(err => {
                toast.error(err.message || "Failed to process response");
            });
    };

    const renderJobStatusBadge = (status) => {
        const statusMap = {
            pending: { color: "warning", text: "Pending" },
            accepted: { color: "success", text: "Accepted" },
            failed: { color: "danger", text: "Failed" },
            retrying: { color: "info", text: "Retrying" }
        };

        const statusInfo = statusMap[status] || { color: "secondary", text: "Unknown" };
        return <Badge color={statusInfo.color}>{statusInfo.text}</Badge>;
    };
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return (
        <Container className="mt-5 mx-2">
            <Row className="row bg-white rounded">
                <Col md="12" className="px-0">
                    <Nav tabs className="mb-0 checkListMenu">
                        <div>
                            <p
                                className={classnames({ active: activeTab === "1" })}
                                onClick={() => toggleTab("1")}
                                style={{
                                    cursor: "pointer",
                                    padding: "10px 22px",
                                    fontSize: "17px",
                                    marginBottom: "0px",
                                }}
                            >
                                Overview
                            </p>
                        </div>
                        <div>
                            <p
                                className={classnames({ active: activeTab === "2" })}
                                onClick={() => toggleTab("2")}
                                style={{
                                    cursor: "pointer",
                                    padding: "10px 22px",
                                    fontSize: "17px",
                                    marginBottom: "0px",
                                }}
                            >
                                Live Locations
                            </p>
                        </div>
                        <div>
                            <p
                                className={classnames({ active: activeTab === "3" })}
                                onClick={() => toggleTab("3")}
                                style={{
                                    cursor: "pointer",
                                    padding: "10px 22px",
                                    fontSize: "17px",
                                    marginBottom: "0px",
                                }}
                            >
                                Shift Status
                            </p>
                        </div>
                    </Nav>

                    <TabContent activeTab={activeTab} className="my-3">
                        {/* Tab 1: Overview (with auto-scheduling) */}
                        <TabPane tabId="1">
                            <div className="row m-2 justify-space-between gap-4">
                                <div className="col-md-3 card overflow-hidden">
                                    <div className="row">
                                        <div className="col-md-12 bg-primary">
                                            <p className="mb-0 p-2 text-dark">Employees <span>({employees.length})</span></p>
                                        </div>
                                        {employees.map((emp, index) => (
                                            <div className="col-md-12 p-2" key={emp._id}>
                                                <div className="border card overflow-hidden">
                                                    <div className="d-flex py-2 justify-content-around align-items-center">
                                                        <span className="user-icon"><FaUser /></span>
                                                        <div className="d-flex flex-column">
                                                            <span className="f17">{getUserName(emp)}</span>
                                                            <span className="f17">{emp?.ssnNo ?? 'N/A'}</span>
                                                        </div>
                                                        <span className="badge badge-success bg-success">Timeline</span>
                                                    </div>
                                                    <div className="bg-light-red f17 m-2 p-2">
                                                        <p className="mb-0">
                                                            <span><IoLocationSharp /> Currently not available</span>
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="col-md-8 card overflow-hidden">
                                    <div className="row">
                                        <div className="col-md-12 bg-primary d-flex justify-content-between align-items-center">
                                            <p className="mb-0 p-2 text-dark">Shift Schedule</p>
                                            <Button
                                                color="primary"
                                                size="sm"
                                                onClick={() => {
                                                    dispatch(fetchUnassignedJobs(user?._id));
                                                    toggleModal();
                                                }}
                                            >
                                                View Unassigned Jobs ({unassignedJobs.length})
                                            </Button>
                                        </div>
                                        <div className="col-md-12 p-3">
                                            {activeRequests.length > 0 ? (
                                                <div className="w-100">
                                                    {activeRequests.map(queue => {
                                                        const expirationTime = new Date(queue.requestTime);
                                                        expirationTime.setMinutes(expirationTime.getMinutes() + 15);

                                                        const currentEmployee = queue.employeeQueue[queue.currentEmployeeIndex]?.employeeId;
                                                        const nextEmployee = queue.employeeQueue[queue.currentEmployeeIndex + 1]?.employeeId;
                                                        const shift = queue.jobId?.shift;

                                                        const localStart = shift?.utcStart
                                                            ? moment.utc(shift.utcStart).tz(userTimezone).format('hh:mm A')
                                                            : null;
                                                        const localEnd = shift?.utcEnd
                                                            ? moment.utc(shift.utcEnd).tz(userTimezone).format('hh:mm A')
                                                            : null;
                                                        return (
                                                            <div key={queue._id} className="bg-primary-light text-dark f17 card mb-3 p-3">
                                                                <div className="row">
                                                                    <div className="col-md-4">
                                                                        <div className="d-flex flex-column">
                                                                            <strong>Job Title :  {queue.jobId?.name || 'N/A'}</strong>
                                                                            <small className="text-muted text-capitalize">
                                                                                <strong>Shift Name :</strong> {queue.jobId.shift.name}
                                                                            </small>
                                                                            <small className="text-muted">
                                                                                <strong> [ {`${localStart} -  ${localEnd}`} ]</strong>
                                                                            </small>
                                                                            <div className="mt-2">
                                                                                {renderJobStatusBadge(queue.status)}
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    <div className="col-md-4">
                                                                        <div className="d-flex flex-column">
                                                                            <strong>Current Employee:</strong>
                                                                            {currentEmployee ? (
                                                                              <>  <span>
                                                                                    {currentEmployee.name || currentEmployee.email}
                                                                                   
                                                                                </span>
                                                                                 {queue.status === 'pending' && (
                                                                                    <span className="ml-2">
                                                                                        (Expires in: <CountdownTimer targetDate={expirationTime} />)
                                                                                    </span>
                                                                                )}
                                                                                </>
                                                                            ) : (
                                                                                <span>No current employee</span>
                                                                            )}

                                                                            {nextEmployee && (
                                                                                <>
                                                                                    <strong className="mt-2">Next Employee:</strong>
                                                                                    <span>{nextEmployee.name || nextEmployee.email}</span>
                                                                                </>
                                                                            )}
                                                                        </div>
                                                                    </div>

                                                                    <div className="col-md-4">
                                                                        <div className="d-flex flex-column">
                                                                            <strong>Queue Position:</strong>
                                                                            <span>
                                                                                {queue.currentEmployeeIndex + 1} of {queue.employeeQueue.length}
                                                                            </span>

                                                                            {queue.status === 'pending' && queue.currentEmployee?._id === user._id && (
                                                                                <div className="d-flex gap-2 mt-2">
                                                                                    <Button
                                                                                        color="success"
                                                                                        size="sm"
                                                                                        onClick={() => handleEmployeeResponse(queue._id, true)}
                                                                                    >
                                                                                        <FaCheck /> Accept
                                                                                    </Button>
                                                                                    <Button
                                                                                        color="danger"
                                                                                        size="sm"
                                                                                        onClick={() => handleEmployeeResponse(queue._id, false)}
                                                                                    >
                                                                                        <FaTimes /> Reject
                                                                                    </Button>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {queue.responses.length > 0 && (
                                                                    <div className="mt-3">
                                                                        <strong>Response History:</strong>
                                                                        <div className="mt-1">
                                                                            {queue.responses.map((response, idx) => (
                                                                                <div key={idx} className="d-flex align-items-center">
                                                                                    <span className="m-2">
                                                                                        {response.employeeId?.name || response.employeeId?.email || 'Unknown'}:
                                                                                    </span>
                                                                                    <Badge className="text-capitalize" color={response.status === 'accepted' ? 'success' : 'danger'}>
                                                                                        {response.status}
                                                                                    </Badge>
                                                                                    <small className="text-muted m-2">
                                                                                        {new Date(response.respondedAt).toLocaleTimeString()}
                                                                                    </small>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <div className="text-center py-4">
                                                    <p>No active job assignments</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Unassigned Jobs Modal */}
                            <Modal isOpen={modal} toggle={toggleModal} size="lg" className="job-assignment-modal">
                                <ModalHeader toggle={toggleModal} className="bg-primary text-dark">
                                    <div className="d-flex justify-content-between align-items-center w-100 gap-3">
                                        <span >Unassigned Jobs</span>
                                        <Badge color="light" pill className="text-primary ">
                                            {unassignedJobs.length} Available
                                        </Badge>
                                    </div>
                                </ModalHeader>
                                <ModalBody className="p-0">
                                    {unassignedJobs.length > 0 ? (
                                        <div className="job-list-container">
                                            {unassignedJobs.map(job => (
                                                <div key={job._id} className="job-card p-3 border-bottom">
                                                    <div className="d-flex justify-content-between">
                                                        <div className="flex-grow-1">
                                                            <div className="d-flex align-items-center mb-2">
                                                                <div className="job-badge bg-primary-light text-primary rounded p-1 mr-2">
                                                                    <CiClock1 size={18} />
                                                                </div>
                                                                <h5 className="mb-0 font-weight-bold text-dark">{job.name}</h5>
                                                            </div>

                                                            <div className="job-details pl-4">
                                                                <div className="row">
                                                                    <div className="col-md-6">
                                                                        <div className="detail-item mb-2">
                                                                             <span className="detail-value text-muted"><strong>Shift:</strong> {job.shift.name}</span>

                                                                        </div>
                                                                        <div className="d-flex mb-2">
                                                                            <span>
                                                                                [ {moment.utc(job.shift.utcStart).tz(userTimezone).format('hh:mm A')} -
                                                                                {moment.utc(job.shift.utcEnd).tz(userTimezone).format('hh:mm A')} ]
                                                                            </span>

                                                                        </div>
                                                                        {/* <div className="detail-item mb-2">
                                                                            <span className="detail-label">Created:</span>
                                                                            <span className="detail-value">
                                                                                {new Date(job.createdAt).toLocaleDateString('en-US', {
                                                                                    year: 'numeric',
                                                                                    month: 'short',
                                                                                    day: 'numeric',
                                                                                    hour: '2-digit',
                                                                                    minute: '2-digit'
                                                                                })}
                                                                            </span>
                                                                        </div>
                                                                        <div className="detail-item">
                                                                            <span className="detail-label">Last Updated:</span>
                                                                            <span className="detail-value">
                                                                                {new Date(job.updatedAt).toLocaleDateString('en-US', {
                                                                                    year: 'numeric',
                                                                                    month: 'short',
                                                                                    day: 'numeric',
                                                                                    hour: '2-digit',
                                                                                    minute: '2-digit'
                                                                                })}
                                                                            </span>
                                                                        </div> */}
                                                                    </div>

                                                                    <div className="col-md-6">
                                                                        {job.subJob && job.subJob.length > 0 && (
                                                                            <div className="subjobs-container">
                                                                                <div className="detail-label mb-1">Sub Jobs:</div>
                                                                                <div className="subjob-list">
                                                                                    {job.subJob.map((sub, index) => (
                                                                                        <Badge key={index} color="secondary" pill className="mr-1 mb-1">
                                                                                            {sub}
                                                                                        </Badge>
                                                                                    ))}
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="d-flex flex-column justify-content-between pl-3">
                                                            <Button
                                                                color="primary"
                                                                size="sm"
                                                                onClick={() => handleAutoSchedule(job._id)}
                                                                className="align-self-end mb-2"
                                                            >
                                                                <FaSyncAlt className="mr-1" />
                                                                Auto Schedule
                                                            </Button>
                                                            <small className="text-muted text-right">
                                                                Click to start assignment
                                                            </small>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="empty-state text-center py-5">
                                            <div className="empty-icon mb-3">
                                                <FaUser size={48} className="text-muted" />
                                            </div>
                                            <h5 className="text-muted">No unassigned jobs available</h5>
                                            <p className="text-muted">All jobs have been assigned to employees</p>
                                            <Button color="primary" onClick={toggleModal} className="mt-3">
                                                Close
                                            </Button>
                                        </div>
                                    )}
                                </ModalBody>
                                <ModalFooter className="bg-light">
                                    <Button color="secondary" onClick={toggleModal}>
                                        Close
                                    </Button>
                                </ModalFooter>
                            </Modal>
                        </TabPane>

                        {/* Tab 2: Live Locations (unchanged) */}
                        <TabPane tabId="2">
                            <div className="row m-2 justify-space-between gap-4">
                                <div className="col-md-3 card overflow-hidden">
                                    <div className="row">
                                        <div className="col-md-12 bg-primary">
                                            <p className="mb-0 p-2 text-dark">Employees <span>({employees.length})</span></p>
                                        </div>
                                        {employees.map((emp, index) => (
                                            <div className="col-md-12 p-2" key={emp._id}>
                                                <div className="border card overflow-hidden">
                                                    <div className="d-flex py-2 justify-content-around align-items-center">
                                                        <span className="user-icon"><FaUser /></span>
                                                        <div className="d-flex flex-column">
                                                            <span className="f17">{getUserName(emp)}</span>
                                                            <span className="f17">{emp?.ssnNo ?? 'N/A'}</span>
                                                        </div>
                                                        <span className="badge badge-info bg-info">Timeline</span>
                                                    </div>
                                                    <div className="bg-light-red f17 m-2 p-2">
                                                        <p className="mb-0">
                                                            <span><IoLocationSharp /> Currently not available</span>
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="col-md-8 overflow-hidden">
                                    <div className="row">
                                        <div className="col-md-12 bg-primary">
                                            <div style={{ height: '100vh', width: '100%' }}>
                                                <GoogleMapReact
                                                    bootstrapURLKeys={{ key: "" }}
                                                    defaultCenter={defaultProps.center}
                                                    defaultZoom={defaultProps.zoom}
                                                >
                                                    <AnyReactComponent
                                                        lat={59.955413}
                                                        lng={30.337844}
                                                        text="My Marker"
                                                    />
                                                </GoogleMapReact>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </TabPane>

                        {/* Tab 3: Shift Status (unchanged) */}
                        <TabPane tabId="3">
                            <div className="row m-2 justify-space-between gap-4">
                                <div className="col-md-12 card overflow-hidden">
                                    <div className="row">
                                        <div className="col-md-12 bg-primary d-flex justify-content-between align-items-center">
                                            <p className="mb-0 p-2 text-dark">Shift Status</p>
                                            <Badge color="light" className="text-primary">
                                                {jobQueues.filter(q => q.status === 'accepted').length} Accepted Jobs
                                            </Badge>
                                        </div>
                                        <div className="col-md-12 p-3">
                                            {jobQueues.filter(q => q.status === 'accepted').length > 0 ? (
                                                <div className="accepted-jobs-list">
                                                    {jobQueues.filter(q => q.status === 'accepted').map(queue => (
                                                        <div key={queue._id} className="accepted-job-card mb-4 p-3 border rounded">
                                                            <div className="row">
                                                                {/* Job Details Column */}
                                                                <div className="col-md-5">
                                                                    <h6 className="font-weight-bold text-primary mb-3">
                                                                        {queue.jobId?.name || 'Untitled Job'}
                                                                    </h6>
                                                                    <div className="job-meta">
                                                                        <div className="d-flex mb-2">
                                                                            <span className="text-muted mr-2">Job Title : </span>
                                                                            <span>{queue.jobId?.name || 'N/A'}</span>
                                                                        </div>
                                                                        {queue.jobId?.shift && (
                                                                            <>
                                                                                <div className="d-flex mb-2">
                                                                                    <span className="text-muted mr-2">Shift Name : </span>
                                                                                    <span>{queue.jobId.shift.name || 'N/A'}</span>

                                                                                </div>
                                                                                <div className="d-flex mb-2">
                                                                                    <span>

                                                                                        [ {moment.utc(queue.jobId.shift.utcStart).tz(userTimezone).format('hh:mm A')} -
                                                                                        {moment.utc(queue.jobId.shift.utcEnd).tz(userTimezone).format('hh:mm A')} ]
                                                                                    </span>

                                                                                </div>
                                                                            </>
                                                                        )}
                                                                        <div className="d-flex mb-2">
                                                                            <span className="text-muted mr-2">Assigned On:</span>
                                                                            <span>
                                                                                {new Date(queue.updatedAt).toLocaleDateString('en-US', {
                                                                                    month: 'short',
                                                                                    day: 'numeric',
                                                                                    year: 'numeric',
                                                                                    hour: '2-digit',
                                                                                    minute: '2-digit'
                                                                                })}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* Employee Details Column */}
                                                                <div className="col-md-4 border-left">
                                                                    <h6 className="font-weight-bold mb-3">Assigned Employee</h6>
                                                                    {queue.responses.find(r => r.status === 'accepted') && (
                                                                        <div className="employee-info">
                                                                            <div className="d-flex align-items-center mb-2">
                                                                                <FaUser className="text-secondary mr-2" />
                                                                                <span>
                                                                                    {queue.responses.find(r => r.status === 'accepted').employeeId?.name ||
                                                                                        queue.responses.find(r => r.status === 'accepted').employeeId?.email ||
                                                                                        'Unknown Employee'}
                                                                                </span>
                                                                            </div>
                                                                            <div className="d-flex mb-2">
                                                                                <span className="text-muted mr-2">Responded:</span>
                                                                                <span>
                                                                                    {new Date(
                                                                                        queue.responses.find(r => r.status === 'accepted').respondedAt
                                                                                    ).toLocaleTimeString()}
                                                                                </span>
                                                                            </div>
                                                                            <Badge color="success" pill>
                                                                                Accepted
                                                                            </Badge>
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                {/* Status Column */}
                                                                <div className="col-md-3 border-left">
                                                                    <h6 className="font-weight-bold mb-3">Assignment Details</h6>
                                                                    <div className="d-flex flex-column">
                                                                        <div className="mb-2">
                                                                            <span className="text-muted d-block">Queue Position:</span>
                                                                            <strong>
                                                                                {queue.currentEmployeeIndex + 1} / {queue.employeeQueue.length}
                                                                            </strong>
                                                                        </div>
                                                                        <div>
                                                                            <span className="text-muted d-block">Time to Accept:</span>
                                                                            <strong>
                                                                                {Math.floor(
                                                                                    (new Date(queue.responses.find(r => r.status === 'accepted').respondedAt) -
                                                                                        new Date(queue.requestTime)) / 60000
                                                                                )} minutes
                                                                            </strong>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Response History */}
                                                            <div className="mt-3 pt-3 border-top">
                                                                <h6 className="font-weight-bold mb-2">Response History</h6>
                                                                <div className="response-timeline">
                                                                    {queue.responses.map((response, idx) => (
                                                                        <div key={idx} className="timeline-item d-flex align-items-center mb-2">
                                                                            <div className={`timeline-badge mr-3 ${response.status === 'accepted' ? 'bg-success' : 'bg-danger'
                                                                                }`}></div>
                                                                            <div className="flex-grow-1">
                                                                                <div className="d-flex justify-content-between">
                                                                                    <span>
                                                                                        {response.employeeId?.name || response.employeeId?.email || 'Unknown'}
                                                                                    </span>
                                                                                    <span className="text-muted">
                                                                                        {new Date(response.respondedAt).toLocaleTimeString([], {
                                                                                            hour: '2-digit',
                                                                                            minute: '2-digit'
                                                                                        })}
                                                                                    </span>
                                                                                </div>
                                                                                <Badge className="text-capitalize" color={response.status === 'accepted' ? 'success' : 'danger'} pill>
                                                                                    {response.status}
                                                                                </Badge>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="empty-state text-center py-5">
                                                    <div className="empty-icon mb-3">
                                                        <FaUser size={48} className="text-muted" />
                                                    </div>
                                                    <h5 className="text-muted">No Accepted Jobs</h5>
                                                    <p className="text-muted">Jobs that are accepted will appear here</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </TabPane>
                    </TabContent>
                </Col>
            </Row>
        </Container>
    );
};

export default AutoSchedular;