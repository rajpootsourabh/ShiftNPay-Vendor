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
  Chip,
  Avatar,
  Collapse,
} from "@mui/material";
import MuiAlert from "@mui/material/Alert";
import { useDispatch, useSelector } from "react-redux";
import {
  approveTimeTrackerRequest,
  clearMessages,
  getEmployeesJobsTrackingRequests,
} from "../store/Tracker/trackerSlice";
import {
  convertSecondsToHHMMSS,
  formatDateTime,
  formatTime,
  formatToSimpleDate,
} from "../Helper/functions";
import moment from "moment-timezone";
import {
  MdExpandMore,
  MdExpandLess,
  MdCheckCircle,
  MdPending,
  MdAccessTime,
  MdTimer,
  MdSchedule,
  MdEvent,
  MdPerson,
  MdWork,
} from "react-icons/md";

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

function TimeTrackerRequest({ setMenu }) {
  const dispatch = useDispatch();
  const {
    loading: approveLoading,
    error,
    successMessage,
    TimeTrackerApprovalRequests,
  } = useSelector((state) => state.timeTracker);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedRow, setExpandedRow] = useState(null);
  const [userTimezone, setUserTimezone] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone
  );

  useEffect(() => {
    loadTimeTrackerRequests();
  }, [dispatch]);

  const loadTimeTrackerRequests = ()=>{
    setLoading(true);
    dispatch(getEmployeesJobsTrackingRequests())
      .unwrap()
      .then((response) => {
        setFilteredData(response);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const handleApprove = (trackingId) => {
    dispatch(approveTimeTrackerRequest(trackingId)).unwrap().then((response) => {
      loadTimeTrackerRequests();
    });
    
  };

  const toggleRowExpand = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const formatToTimezone = (dateString, format = "HH:mm:ss") => {
    return moment(dateString).tz(userTimezone).format(format);
  };

  const getStatusChip = (status) => {
    const iconStyle = { marginRight: 8, verticalAlign: "middle" };
    switch (status) {
      case "approved":
        return (
          <Chip
            icon={<MdCheckCircle style={iconStyle} />}
            label="Approved"
            color="success"
            size="small"
          />
        );
      case "pending":
        return (
          <Chip
            icon={<MdPending style={iconStyle} />}
            label="Pending"
            color="warning"
            size="small"
          />
        );
      default:
        return (
          <Chip
            icon={<MdAccessTime style={iconStyle} />}
            label={status}
            color="default"
            size="small"
          />
        );
    }
  };

  return (
    <Paper sx={{ borderRadius: 2, width: "100%", p: 3, boxShadow: 3 }}>
      <Box>
        <Backdrop
          sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={loading}
        >
          <CircularProgress color="inherit" />
        </Backdrop>

        <Snackbar
          open={!!successMessage || !!error}
          autoHideDuration={5000}
          onClose={() => dispatch(clearMessages())}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Alert
            severity={successMessage ? "success" : "error"}
            onClose={() => dispatch(clearMessages())}
          >
            {successMessage || error}
          </Alert>
        </Snackbar>

        <Box
          sx={{
            mb: 3,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography
            variant="h5"
            component="h2"
            sx={{ fontWeight: "bold", display: "flex", alignItems: "center" }}
          >
            <MdTimer style={{ marginRight: 8 }} />
            Time Tracking Requests
          </Typography>
          <Chip
            icon={<MdSchedule style={{ marginLeft: 8 }} />}
            label={`Timezone: ${userTimezone}`}
            color="info"
            
            sx={{ px: 2 ,bgcolor: "rgba(22, 163, 74, var(--tw-bg-opacity, 1))" }}
          />
        </Box>

        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow
                sx={{
                  bgcolor: "rgba(22, 163, 74, var(--tw-bg-opacity, 1))",
                  "--tw-bg-opacity": 1, // you can change this dynamically if needed
                }}
              >
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  Employee
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  Job
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  Date
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  Time In/Out
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  Total Time
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  Break
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  Status
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData.length > 0 ? (
                filteredData
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((item) => {
                    const { employeeName, trackingData, jobData } = item;
                    const isExpanded = expandedRow === trackingData._id;

                    return (
                      <React.Fragment key={trackingData._id}>
                        <TableRow
                          hover
                          onClick={() => toggleRowExpand(trackingData._id)}
                        >
                          <TableCell>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 2,
                              }}
                            >
                              <Avatar sx={{ bgcolor: "primary.main" }}>
                                <MdPerson size={20} />
                              </Avatar>
                              <Typography>{employeeName}</Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 2,
                              }}
                            >
                              <MdWork size={20} color="action" />
                              <Typography>{jobData?.name ?? "N/A"}</Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 2,
                              }}
                            >
                              <MdEvent size={20} color="action" />
                              <Typography>
                                {formatToSimpleDate(trackingData.startTime)}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography>
                              {formatToTimezone(
                                trackingData.startTime,
                                "HH:mm"
                              )}{" "}
                              -{" "}
                              {trackingData.stoppedTime
                                ? formatToTimezone(
                                    trackingData.stoppedTime,
                                    "HH:mm"
                                  )
                                : "--:--"}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography>
                              {formatTime(trackingData.elapsedTime)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography>
                              {convertSecondsToHHMMSS(
                                trackingData.totalBreakTime
                              )}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {getStatusChip(trackingData.status)}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="contained"
                              color="success"
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleApprove(trackingData._id);
                              }}
                              disabled={trackingData.status === "approved"}
                              startIcon={<MdCheckCircle size={18} />}
                              sx={{ textTransform: "none" }}
                            >
                              {trackingData.status === "approved"
                                ? "Approved"
                                : "Approve"}
                            </Button>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell
                            colSpan={8}
                            sx={{ p: 0, borderBottom: isExpanded ? null : 0 }}
                          >
                            <Collapse
                              in={isExpanded}
                              timeout="auto"
                              unmountOnExit
                            >
                              <Box sx={{ p: 3, bgcolor: "background.default" }}>
                                <Typography
                                  variant="h6"
                                  gutterBottom
                                  sx={{
                                    mb: 2,
                                    display: "flex",
                                    alignItems: "center",
                                  }}
                                >
                                  <MdAccessTime style={{ marginRight: 8 }} />
                                  Detailed Time Logs
                                </Typography>
                                <Table size="small">
                                  <TableHead>
                                    <TableRow>
                                      <TableCell>Event</TableCell>
                                      <TableCell>System Time</TableCell>
                                      <TableCell>
                                        Local Time ({userTimezone})
                                      </TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {trackingData.clockLogs?.map(
                                      (log, logIndex) => (
                                        <TableRow key={logIndex}>
                                          <TableCell>
                                            <Chip
                                              label={log.type}
                                              color={
                                                log.type === "clock-in"
                                                  ? "primary"
                                                  : "secondary"
                                              }
                                              size="small"
                                            />
                                          </TableCell>
                                          <TableCell>
                                            {formatDateTime(log.time)}
                                          </TableCell>
                                          <TableCell>
                                            {formatToTimezone(log.time)}
                                          </TableCell>
                                        </TableRow>
                                      )
                                    )}
                                  </TableBody>
                                </Table>
                              </Box>
                            </Collapse>
                          </TableCell>
                        </TableRow>
                      </React.Fragment>
                    );
                  })
              ) : (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      No time tracking requests found
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[10, 25, 50]}
            component="div"
            count={filteredData.length}
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

export default TimeTrackerRequest;
