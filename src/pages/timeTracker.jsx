import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Backdrop,
  Box,
  Button,
  CircularProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { CSVLink } from "react-csv";
import { FaEdit, FaFileExport, FaFilter, FaTrash } from "react-icons/fa";
import { MdAccessTime, MdTimer, MdWork, MdPerson, MdDateRange } from "react-icons/md";
import moment from "moment-timezone";
import {
  fetchEmployeeAssignedJobs,
  fetchEmployeesByVendor,
  loadEmployeeTracker,
  submitTimeTracker,
  // deleteTimeEntry,
} from "../store/Tracker/trackerSlice";
import {
  convertToUTC,
  formatDateTime,
  formatTime,
  formatToSimpleDate,
  getUserName,
  processOverTimeData,
} from "../Helper/functions";

const TimeTracker = ({ user }) => {
  const dispatch = useDispatch();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [employee, setEmployee] = useState("");
  const [employeeJob, setEmployeeJob] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [selectedJob, setSelectedJob] = useState(null);
  const [data, setData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState(null);
  const [userTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const { JobsTracking, employees, assignedJobsToEmployee, loading, error } = useSelector(
    (state) => state.timeTracker
  );

  // Fetch employees and jobs when user changes
  useEffect(() => {
    if (user) {
      dispatch(fetchEmployeesByVendor(user?._id));
    }
  }, [user, dispatch]);

  useEffect(() => {
    if (employee) {
      dispatch(fetchEmployeeAssignedJobs({ vendor: user?._id, employee }));
    }
  }, [employee, dispatch, user]);

  useEffect(() => {
    let newData = processOverTimeData(JobsTracking);
    setData(newData);
  }, [JobsTracking]);

  useEffect(() => {
    if (error) {
      showSnackbar(error, "error");
    }
  }, [error]);

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!employee || !startDate || !endDate) {
      showSnackbar("Please select employee and date range", "error");
      return;
    }
    dispatch(loadEmployeeTracker({ employee, employeeJob, startDate, endDate }));
  };

  const handlePopupSubmit = (e) => {
    e.preventDefault();
    if (!startTime || !endTime) {
      showSnackbar("Please enter both start and end times", "error");
      return;
    }

    dispatch(
      submitTimeTracker({
        jobId: selectedJob.jobId,
        startTime: convertToUTC(selectedJob.sessionDate, startTime),
        endTime: convertToUTC(selectedJob.sessionDate, endTime),
        date: selectedJob.sessionDate,
      })
    )
      .unwrap()
      .then(() => {
        setShowModal(false);
        showSnackbar("Time entry updated successfully");
        dispatch(
          loadEmployeeTracker({ employee, employeeJob, startDate, endDate })
        );
      })
      .catch((error) => {
        showSnackbar(`Failed to update time: ${error.message}`, "error");
      });
  };



  const formatToLocalTime = (dateString) => {
    return moment(dateString).tz(userTimezone).format("HH:mm:ss");
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const clearFilters = () => {
    setEmployee("");
    setEmployeeJob("");
    setStartDate("");
    setEndDate("");
  };

  return (
    <>
      <Backdrop open={loading}>
        <CircularProgress color="inherit" />
      </Backdrop>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <div className={`alert alert-${snackbar.severity}`} style={{ minWidth: '300px' }}>
          {snackbar.message}
        </div>
      </Snackbar>

      <Paper sx={{ borderRadius: 2, width: "100%", p: 3, mb: 3 }}>
        <Box sx={{ mb: 3 }}>
          {/* <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <MdTimer style={{ marginRight: 8 }} />
            Time Tracker
          </Typography> */}
          
          <Typography variant="subtitle1" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
            <MdAccessTime style={{ marginRight: 8 }} />
            Current Timezone: {userTimezone}
          </Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel id="employee-label">Employee</InputLabel>
              <Select
                labelId="employee-label"
                value={employee}
                onChange={(e) => setEmployee(e.target.value)}
                label="Employee"
                startAdornment={
                    <MdPerson />
                }
              >
                <MenuItem value="">
                  <em>Select Employee</em>
                </MenuItem>
                {employees?.map((emp) => (
                  <MenuItem key={emp._id} value={emp._id}>
                    {getUserName(emp)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel id="job-label">Job</InputLabel>
              <Select
                labelId="job-label"
                value={employeeJob}
                onChange={(e) => setEmployeeJob(e.target.value)}
                label="Job"
                startAdornment={
                    <MdWork />
                }
              >
                <MenuItem value="">
                  <em>Select Job</em>
                </MenuItem>
                {assignedJobsToEmployee?.map((job) => (
                  <MenuItem key={job._id} value={job._id}>
                    {job.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={2}>
            <TextField
              label="Start Date"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              InputProps={{
                startAdornment: (
                    <MdDateRange />
                ),
              }}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </Grid>

          <Grid item xs={12} md={2}>
            <TextField
              label="End Date"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              InputProps={{
                startAdornment: (
                    <MdDateRange />
                ),
              }}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </Grid>

          <Grid item xs={12} md={2} sx={{ display: 'flex', alignItems: 'flex-end', gap: 1 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              startIcon={<FaFilter />}
              sx={{ height: 56 }}
            >
              Filter
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={clearFilters}
              sx={{ height: 56 }}
            >
              Clear
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ borderRadius: 2, width: "100%", p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">
            Time Entries ({JobsTracking?.length || 0})
          </Typography>
          <CSVLink 
            data={data} 
            filename={`time-entries-${new Date().toISOString()}.csv`}
          >
            <Button variant="outlined" startIcon={<FaFileExport />}>
              Export CSV
            </Button>
          </CSVLink>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "rgba(22, 163, 74, var(--tw-bg-opacity, 1))", }}>
                <TableCell sx={{ color: "white", fontWeight: 'bold' }}>Job Name</TableCell>
                <TableCell sx={{ color: "white", fontWeight: 'bold' }} align="center">Date</TableCell>
                <TableCell sx={{ color: "white", fontWeight: 'bold' }} align="center">Start Time</TableCell>
                <TableCell sx={{ color: "white", fontWeight: 'bold' }} align="center">End Time</TableCell>
                <TableCell sx={{ color: "white", fontWeight: 'bold' }} align="center">Break Time</TableCell>
                <TableCell sx={{ color: "white", fontWeight: 'bold' }} align="center">Total Time</TableCell>
                <TableCell sx={{ color: "white", fontWeight: 'bold' }} align="center">Amount</TableCell>
                <TableCell sx={{ color: "white", fontWeight: 'bold' }} align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {JobsTracking?.length ? (
                JobsTracking.slice(
                  page * rowsPerPage,
                  page * rowsPerPage + rowsPerPage
                ).map((task, ind) => (
                  <TableRow key={ind} hover>
                    <TableCell>{task.jobDetails?.name || "N/A"}</TableCell>
                    <TableCell align="center">
                      {formatToSimpleDate(task?.startTime)}
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title={`System: ${formatDateTime(task?.startTime)}`}>
                        <span>{formatToLocalTime(task?.startTime)}</span>
                      </Tooltip>
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title={`System: ${task?.stoppedTime ? formatDateTime(task?.stoppedTime) : 'N/A'}`}>
                        <span>{task?.stoppedTime ? formatToLocalTime(task?.stoppedTime) : "--:--:--"}</span>
                      </Tooltip>
                    </TableCell>
                    <TableCell align="center">
                      {formatTime(task.totalBreakTime)}
                    </TableCell>
                    <TableCell align="center">
                      <Chip 
                        label={formatTime(task.elapsedTime)} 
                        color={task.elapsedTime > 28800 ? "error" : "primary"} // Highlight if > 8 hours
                      />
                    </TableCell>
                    <TableCell align="center">
                      ${task?.amount?.toFixed(2) || "0.00"}
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Edit Time">
                        <IconButton
                          color="primary"
                          onClick={() => {
                            setSelectedJob(task);
                            setStartTime(moment(task.startTime).tz(userTimezone).format("HH:mm"));
                            setEndTime(task.stoppedTime ? moment(task.stoppedTime).tz(userTimezone).format("HH:mm") : "");
                            setShowModal(true);
                          }}
                        >
                          <FaEdit />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <Typography>No time entries found</Typography>
                    {employee && (
                      <Typography variant="body2" color="text.secondary">
                        Try adjusting your filters
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[10, 25, 50]}
            component="div"
            count={JobsTracking?.length || 0}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </TableContainer>
      </Paper>

      {/* Edit Time Dialog */}
      <Dialog
        open={showModal}
        onClose={() => setShowModal(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Edit Time Entry</DialogTitle>
        <form onSubmit={handlePopupSubmit}>
          <DialogContent dividers>
            <Grid container spacing={3} sx={{ pt: 1 }}>
              <Grid item xs={12}>
                <Typography variant="subtitle1">
                  <strong>Date:</strong> {selectedJob && formatToSimpleDate(selectedJob.sessionDate)}
                </Typography>
                <Typography variant="subtitle1">
                  <strong>Job:</strong> {selectedJob?.jobDetails?.name}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Start Time"
                  type="time"
                  fullWidth
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="End Time"
                  type="time"
                  fullWidth
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              Save Changes
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
};

export default TimeTracker;