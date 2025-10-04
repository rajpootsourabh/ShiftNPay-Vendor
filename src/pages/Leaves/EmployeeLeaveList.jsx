import React, { useEffect, useState } from "react";
import {
  Backdrop,
  Box,
  CircularProgress,
  Paper,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Typography,
  Button,
  Modal,
  IconButton,
  Grid,
} from "@mui/material";
import MuiAlert from "@mui/material/Alert";
import axios from "axios";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import "./leave.css";

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const bashUrl = process.env.REACT_APP_BASH_URL;

function EmployeeLeaveList() {
  const options = {
    Authorization: `Bearer ${localStorage.getItem("shinpay-vendor-token")}`,
    "Content-Type": "application/json",
  };

  const user = useSelector((state) => state.user.user);

  const [employeeLeaves, setEmployeeLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [customVariant, setCustomVariant] = useState("success");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Modal state for viewing details
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const getAvailableLeaves = (employeeLeaves) => {
    let count = 0;
    employeeLeaves?.leaveTypes.map((leaveType) => {
      let StringId = String(leaveType._id);
      count+= selectedEmployee[StringId]?.allotted
        ? selectedEmployee[StringId]?.allotted -
          selectedEmployee[StringId]?.consumed
        : 0;
    });

    return count;
  };

  const fetchEmployeeLeaves = async () => {
    try {
      const response = await axios.get(
        `${bashUrl}/leaves/employee-leaves-list`,
        { headers: options }
      );
      console.log("response.data", response.data);
      setEmployeeLeaves(response.data);
      setLoading(false);
    } catch (error) {
      setSuccess("");
      setError(error?.response?.data?.msg || "Failed to fetch data.");
      setCustomVariant("error");
      setOpen(true);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployeeLeaves();
  }, []);

  const handleViewClick = (employee) => {
    console.log("employee : ", employee);
    setSelectedEmployee(employee);
    setViewModalOpen(true);
  };

  const handleCloseModal = () => {
    setViewModalOpen(false);
    setSelectedEmployee(null);
  };

  const LeaveDetails = () => {
    return (
      <div className="container mt-4">
        <div className="row">
          <div className="col-12">
            <h3>Leave Details For {selectedEmployee.employeeName}</h3>
          </div>
          <div className="col-md-6">
            <div className="leave-box green">
              <div>
                <h5>Total Leaves Available</h5>
                <h2>{getAvailableLeaves(employeeLeaves)}</h2>
              </div>
              <div className="leave-box-icon">
                <i className="bi bi-calendar"></i>
              </div>
            </div>
          </div>
          {/* Total Leaves and Casual Leaves */}
          {employeeLeaves?.leaveTypes.map((leaveType) => {
            let StringId = String(leaveType._id);
            return (
              <div className="col-md-6 mb-4">
                <div className="leave-box orange">
                  <div>
                    <h5>{leaveType.name}</h5>
                    <h2>
                      {selectedEmployee[StringId]?.allotted
                        ? selectedEmployee[StringId]?.allotted -
                          selectedEmployee[StringId]?.consumed
                        : 0}
                    </h2>
                  </div>
                  <div className="leave-box-icon">
                    <i className="bi bi-calendar"></i>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Leave Credit History */}
        <div className="table-section">
          <h5>Leave History</h5>
          <table className="table table-bordered">
            <thead className="table-header">
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Status</th>
                <th>Applied Date</th>
                <th>From</th>
                <th>To</th>
                <th>Count</th>
                <th>Reason</th>
              </tr>
            </thead>
            <tbody>
              {selectedEmployee.consumedLeaves.map((history) => {
                return (
                  <tr>
                    <td>{selectedEmployee.employeeName}</td>
                    <td>{history.leaveType}</td>
                    <td>
                      <span className="badge badge-pending">
                        {history.status}
                      </span>
                    </td>
                    <td>
                      {new Date(history.appliedDate).toLocaleDateString()}
                    </td>
                    <td>{new Date(history.startDate).toLocaleDateString()}</td>
                    <td>{new Date(history.endDate).toLocaleDateString()}</td>
                    <td>{history.count}</td>
                    <td>{history.reason}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <Paper sx={{ borderRadius: 0, width: "100%", ml: 1, p: 2 }}>
      <Snackbar
        open={open}
        autoHideDuration={6000}
        onClose={() => setOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={() => setOpen(false)}
          severity={customVariant}
          sx={{ width: "100%" }}
        >
          {error ? error : success}
        </Alert>
      </Snackbar>

      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>

      <Box sx={{ width: "100%", mb: 2 }}>
        <Link to="/leave-management/add" style={{ textDecoration: "none" }}>
          <Button variant="contained" color="primary">
            Credit Leaves
          </Button>
        </Link>
      </Box>
      <Box sx={{ width: "100%" }}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "#E4EAEE", color: "white" }}>
                <TableCell sx={{ color: "black" }}>Employee Name</TableCell>
                <TableCell sx={{ color: "black" }} align="center">
                  Email
                </TableCell>
                {employeeLeaves?.leaveTypes?.map((leave) => (
                  <TableCell
                    key={leave._id}
                    sx={{ color: "black" }}
                    align="center"
                  >
                    {leave.name} (Allotted/Consumed)
                  </TableCell>
                ))}
                <TableCell sx={{ color: "black" }} align="center">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {employeeLeaves?.data?.length ? (
                employeeLeaves?.data
                  ?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((employee, index) => (
                    <TableRow key={index} hover>
                      <TableCell>{employee.employeeName}</TableCell>
                      <TableCell>{employee.email}</TableCell>
                      {employeeLeaves?.leaveTypes.map((leaveType) => {
                        let StringId = String(leaveType._id);
                        return (
                          <TableCell key={leaveType._id} align="center">
                            {employee[StringId]?.allotted || 0} /{" "}
                            {employee[StringId]?.consumed || 0}
                          </TableCell>
                        );
                      })}
                      <TableCell align="center">
                        <Button
                          variant="outlined"
                          onClick={() => handleViewClick(employee)}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={employeeLeaves?.leaveTypes?.length + 2}
                    align="center"
                  >
                    <Typography>No employee leave data found!</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[10, 25, 100]}
            component="div"
            count={employeeLeaves?.data?.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </TableContainer>
      </Box>

      {selectedEmployee && (
        <div
          className={`modal fade ${viewModalOpen ? "show" : ""}`}
          tabIndex="-1"
          style={{ display: viewModalOpen ? "block" : "none" }}
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Leave Details</h5>
                <button
                  type="button"
                  className="btn-close"
                  aria-label="Close"
                  onClick={handleCloseModal}
                ></button>
              </div>
              <div className="modal-body">
                <LeaveDetails />
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCloseModal}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {viewModalOpen && <div className="modal-backdrop fade show"></div>}
    </Paper>
  );
}

export default EmployeeLeaveList;
