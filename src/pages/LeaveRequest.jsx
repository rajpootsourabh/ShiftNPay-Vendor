import React, { useEffect, useState } from "react";
import {
  Backdrop,
  Box,
  Button,
  CircularProgress,
  Paper,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from "@mui/material";
import MuiAlert from "@mui/material/Alert";
import axios from "axios";
const bashUrl = process.env.REACT_APP_BASH_URL;

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

function LeaveRequest() {
  const options = {
    Authorization: `Bearer ${localStorage.getItem("shinpay-vendor-token")}`,
    "Content-Type": "application/json",
  };
  const [employeeLeaves, setEmployeeLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [customVariant, setCustomVariant] = useState("success");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loadingButton, setLoadingButton] = useState(null); // Track loading for individual buttons

  const fetchEmployeeLeaves = async () => {
    try {
      const response = await axios.get(
        `${bashUrl}/leaves/employee-leave-requests`,
        { headers: options }
      );
      console.log("response.data", response.data.data);
      setEmployeeLeaves(response.data.data);
      setLoading(false);
    } catch (error) {
      setSuccess("");
      setError(error?.response?.data?.msg || "Failed to fetch data.");
      setCustomVariant("error");
      setOpen(true);
      setLoading(false);
    }
  };

  const handleApproveLeave = async (leaveManagementId, leaveId) => {
    setLoadingButton(leaveId); // Start loader on specific button
    try {
      const response = await axios.post(
        `${bashUrl}/leaves/approve/${leaveManagementId}/${leaveId}`,
        {},
        { headers: options }
      );
      setSuccess("Leave request approved successfully!");
      setError("");
      setCustomVariant("success");
      setOpen(true);
      fetchEmployeeLeaves(); // Refetch data after approval
    } catch (error) {
      setSuccess("");
      setError(error?.response?.data?.msg || "Failed to approve leave.");
      setCustomVariant("error");
      setOpen(true);
    }
    setLoadingButton(null); // Stop loader
  };

  const handleRejectLeave = async (leaveManagementId, leaveId) => {
    setLoadingButton(leaveId); // Start loader on specific button
    try {
      const response = await axios.post(
        `${bashUrl}/leaves/reject/${leaveManagementId}/${leaveId}`,
        {},
        { headers: options }
      );
      setSuccess("Leave request rejected successfully!");
      setError("");
      setCustomVariant("success");
      setOpen(true);
      fetchEmployeeLeaves(); // Refetch data after rejection
    } catch (error) {
      setSuccess("");
      setError(error?.response?.data?.msg || "Failed to reject leave.");
      setCustomVariant("error");
      setOpen(true);
    }
    setLoadingButton(null); // Stop loader
  };

  useEffect(() => {
    fetchEmployeeLeaves();
  }, []);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  return (
    <Paper sx={{ borderRadius: 0, width: "100%", ml: 1, p: 2 }}>
      <Box>
        <Backdrop
          sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={loading}
        >
          <CircularProgress color="inherit" />
        </Backdrop>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "#E4EAEE", color: "white" }}>
                <TableCell sx={{ color: "black" }} align="center">
                  Employee Name
                </TableCell>
                <TableCell sx={{ color: "black" }} align="center">
                  Type
                </TableCell>
                <TableCell sx={{ color: "black" }} align="center">
                  Status
                </TableCell>
                <TableCell sx={{ color: "black" }} align="center">
                  Applied Date
                </TableCell>
                <TableCell sx={{ color: "black" }} align="center">
                  From
                </TableCell>
                <TableCell sx={{ color: "black" }} align="center">
                  Till
                </TableCell>
                <TableCell sx={{ color: "black" }} align="center">
                  Count
                </TableCell>
                <TableCell sx={{ color: "black" }} align="center">
                  Reason
                </TableCell>
                <TableCell sx={{ color: "black" }} align="center">
                  Document
                </TableCell>
                <TableCell sx={{ color: "black" }} align="center">
                  Action
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {employeeLeaves && employeeLeaves?.length ? (
                employeeLeaves
                  ?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((history, ind) => {
                    return (
                      <TableRow key={ind} hover>
                        <TableCell align="center">
                          {history.employeeName}
                        </TableCell>
                        <TableCell align="center">
                          {history.leaveTypeInfo.name}
                        </TableCell>
                        <TableCell align="center">
                          {history.leaves.consumed.status}
                        </TableCell>
                        <TableCell align="center">
                          {new Date(
                            history.leaves.consumed.appliedDate
                          ).toLocaleDateString()}
                        </TableCell>
                        <TableCell align="center">
                          {new Date(
                            history.leaves.consumed.startDate
                          ).toLocaleDateString()}
                        </TableCell>
                        <TableCell align="center">
                          {new Date(
                            history.leaves.consumed.endDate
                          ).toLocaleDateString()}
                        </TableCell>
                        <TableCell align="center">
                          {history.leaves.consumed.count}
                        </TableCell>
                        <TableCell align="center">
                          {history.leaves.consumed.reason}
                        </TableCell>
                        <TableCell align="center">
                          {history.leaves.consumed.document ? (
                            <Button
                            variant="contained"
                            color="success"
                              onClick={() => {
                                window.open(
                                  `${process.env.REACT_APP_BASH_IMG_URL + "/" +history.leaves.consumed.document}`,
                                  "_blank"
                                );
                              }}
                            >
                              View
                            </Button>
                          ) : (
                            "N/A"
                          )}
                        </TableCell>

                        <TableCell align="center" className="gap-3">
                          <div className="d-flex gap-3">
                            <Button
                              variant="contained"
                              color="success"
                              disabled={
                                loadingButton === history.leaves.consumed._id ||
                                history.leaves.consumed.status === "approved"
                              }
                              onClick={() =>
                                handleApproveLeave(
                                  history._id,
                                  history.leaves.consumed._id
                                )
                              }
                              startIcon={
                                loadingButton ===
                                history.leaves.consumed._id ? (
                                  <CircularProgress size={20} color="inherit" />
                                ) : null
                              }
                            >
                              {history.leaves.consumed.status === "approved"
                                ? "Approved"
                                : "Approve"}
                            </Button>
                            <Button
                              variant="contained"
                              color="error"
                              disabled={
                                loadingButton === history.leaves.consumed._id ||
                                history.leaves.consumed.status === "rejected"
                              }
                              onClick={() =>
                                handleRejectLeave(
                                  history._id,
                                  history.leaves.consumed._id
                                )
                              }
                              startIcon={
                                loadingButton ===
                                history.leaves.consumed._id ? (
                                  <CircularProgress size={20} color="inherit" />
                                ) : null
                              }
                            >
                              Reject
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
              ) : (
                <TableRow>
                  <TableCell colSpan={10} align="center">
                    <Typography>No Leave Request Found!</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[10, 25, 100]}
            component="div"
            count={employeeLeaves?.length || 0}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </TableContainer>
      </Box>
    </Paper>
  );
}

export default LeaveRequest;
