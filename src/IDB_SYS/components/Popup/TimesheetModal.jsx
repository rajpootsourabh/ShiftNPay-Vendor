import React, { useState } from 'react';
import {
  Modal,
  Spinner,
  Alert,
  Card,
  CardBody,
  Row,
  Col
} from 'react-bootstrap';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Tooltip,
  IconButton,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Button,
  Box
} from '@mui/material';
import { FaEdit, FaUser, FaUserTie, FaCalendar, FaClock, FaDollarSign, FaFileExport } from 'react-icons/fa';
import moment from 'moment';
import { useDispatch } from 'react-redux';
import { submitTimeTracker } from '../../../store/Tracker/trackerSlice';
import { convertToUTC, formatToSimpleDate } from '../../../Helper/functions';
import { updateScheduleState } from '../../../store/IDB_SYS/timesheet/timesheetWeekSlice';

const TimesheetModal = ({ 
  showModal, 
  handleCloseModal, 
  loading, 
  error, 
  schedules, 
  selectedWeekData 
}) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [showTimeEditDialog, setShowTimeEditDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [payrollReport, setPayrollReport] = useState([]);
  const [showPayrollReport, setShowPayrollReport] = useState(false);
  const dispatch = useDispatch();
  
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // // Format functions
  // const formatToSimpleDate = (date) => {
  //   return moment(date).format('MM/DD/YYYY');
  // };

  const formatToLocalTime = (date) => {
    return moment(date).format('hh:mm A');
  };

  const formatDateTime = (date) => {
    return moment(date).format('MM/DD/YYYY hh:mm A');
  };

  const formatTime = (seconds) => {
    if (!seconds) return '00:00:00';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  const formatDateTimeAsTrackerData = (dateTime) => {
  
    const date = new Date(dateTime);
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const seconds = date.getSeconds().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const formattedHours = hours.toString().padStart(2, "0");
    return `${formattedHours}:${minutes}:${seconds} ${ampm}`;
  };

  // Generate payroll report
  const generatePayrollReport = () => {
    if (!schedules || schedules.length === 0) return;
    
    const reportData = [];
    
    schedules.forEach(schedule => {
      if (schedule.tracking && schedule.tracking.entries && schedule.tracking.entries.length > 0) {
        schedule.tracking.entries.forEach(entry => {
          // Calculate hours worked
          const start = moment(entry.startTime);
          const end = moment(entry.stoppedTime);
          const hoursWorked = (end - start) / (1000 * 60 * 60); // Convert milliseconds to hours
          
          // Calculate amount to pay
          const amountToPay = hoursWorked * schedule.rate;
          
          // Create report entry
          const reportEntry = {
            payrollId: schedule._id.substring(schedule._id.length - 4), // Last 4 chars of ID
            lastName: schedule.caregiver?.name ? schedule.caregiver.name.split(' ').pop() : 'N/A',
            firstName: schedule.caregiver?.name ? schedule.caregiver.name.split(' ')[0] : 'N/A',
            startDate: formatToSimpleDate(entry.startTime),
            startTime: formatToLocalTime(entry.startTime),
            endDate: formatToSimpleDate(entry.stoppedTime),
            endTime: formatToLocalTime(entry.stoppedTime),
            totalUnits: hoursWorked.toFixed(2),
            rateOfPay: schedule.rate,
            payrollItemName: schedule.payrollItem || 'N/A',
            amountToPay: amountToPay.toFixed(2),
            payCode: '', // Empty as per example
            payType: 'REG', // Default to REG as per example
            class: schedule.client?.name || 'N/A',
            description: schedule.service?.name || 'N/A',
            shortDescription: schedule.service?.name ? schedule.service.name.substring(0, 10) : 'N/A',
            cost: amountToPay.toFixed(2),
            itemTypeId: 1, // Default to 1 as per example
            flatRate: 'N', // Default to N as per example
            alternateDescription: schedule.service?.name || 'N/A',
            status: entry.status || 'pending',
            modifier1: '', // Empty as per example
            TOS: '', // Empty as per example
            modifier2: '', // Empty as per example
            clientCity: schedule.client?.address?.city || 'N/A'
          };
          
          reportData.push(reportEntry);
        });
      }
    });
    
    setPayrollReport(reportData);
    setShowPayrollReport(true);
  };

  // Export to CSV function
  const exportToCSV = () => {
    if (payrollReport.length === 0) return;
    
    // Create CSV header
    const headers = Object.keys(payrollReport[0]).join(',');
    
    // Create CSV rows
    const rows = payrollReport.map(entry => 
      Object.values(entry).map(value => `"${value}"`).join(',')
    );
    
    // Combine header and rows
    const csvContent = [headers, ...rows].join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `payroll-report-${moment().format('YYYY-MM-DD')}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle opening the time edit dialog
  const handleOpenTimeEdit = (task) => {
    setSelectedTask(task);
    setStartTime(task.startTime ? moment(task.startTime).format('HH:mm') : '');
    setEndTime(task.stoppedTime ? moment(task.stoppedTime).format('HH:mm') : '');
    setShowTimeEditDialog(true);
  };

  // Handle closing the time edit dialog
  const handleCloseTimeEdit = () => {
    setShowTimeEditDialog(false);
    setSelectedTask(null);
    setStartTime('');
    setEndTime('');
  };

  const handleTimeEditSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedTask || !startTime || !endTime) return;
    
    // Calculate new start and end datetime objects
    const taskDate = moment(selectedTask.startTime).format('YYYY-MM-DD');
    const newStartTime = new Date(`${taskDate}T${startTime}`);
    const newEndTime = new Date(`${taskDate}T${endTime}`);

    // Validate that end time is after start time
    if (newEndTime <= newStartTime) {
      alert('End time must be after start time');
      return;
    }

    try {
      // Calculate elapsed time in seconds
      const elapsedTime = Math.floor((newEndTime - newStartTime) / 1000);
      
      // Prepare the update data
      const updateData = {
        startTime: convertToUTC(selectedTask.sessionDate, startTime),
        endTime: convertToUTC(selectedTask.sessionDate, endTime),
        elapsedTime: elapsedTime,
      };

      // Make API call to update the time entry
      dispatch(
            submitTimeTracker({
              jobId: selectedTask.jobId,
              startTime: convertToUTC(selectedTask.sessionDate, startTime),
              endTime: convertToUTC(selectedTask.sessionDate, endTime),
              date: selectedTask.sessionDate,
            })
          )
            .unwrap();

      const updatedSchedules = schedules.map(schedule => {
        if (schedule.tracking && schedule.tracking.entries) {
          const updatedEntries = schedule.tracking.entries.map(entry => 
            entry._id === selectedTask._id ? {...entry ,...updateData } : entry
          );
          return {
            ...schedule,
            tracking: {
              ...schedule.tracking,
              entries: updatedEntries
            }
          };
        }
        return schedule;
      });

      dispatch(updateScheduleState(updatedSchedules));
      handleCloseTimeEdit();

    } catch (error) {
      console.error('Error updating time entry:', error);
      alert('Failed to update time entry. Please try again.');
    }
  };

  return (
    <>
      <Modal show={showModal} onHide={handleCloseModal} size="xl">
        <Modal.Header closeButton>
          <Modal.Title>
            Timesheet Details - Week of {selectedWeekData && 
              `${moment(selectedWeekData.startDate).format("MM/DD/YYYY")} to ${moment(selectedWeekData.endDate).format("MM/DD/YYYY")}`
            }
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loading ? (
            <div className="text-center py-4">
              <Spinner animation="border" role="status" className="mb-3" />
              <p>Fetching schedules for the selected week...</p>
            </div>
          ) : error ? (
            <Alert variant="danger">
              Error loading schedules: {error}
            </Alert>
          ) : (
            <div>
              {showPayrollReport ? (
                <div>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6">Payroll Report</Typography>
                    <Button 
                      variant="contained" 
                      color="primary" 
                      startIcon={<FaFileExport />}
                      onClick={exportToCSV}
                    >
                      Export to CSV
                    </Button>
                  </Box>
                  
                  <TableContainer sx={{ maxHeight: 440 }}>
                    <Table stickyHeader size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Payroll ID</TableCell>
                          <TableCell>Last Name</TableCell>
                          <TableCell>First Name</TableCell>
                          <TableCell>Start Date</TableCell>
                          <TableCell>Start Time</TableCell>
                          <TableCell>End Date</TableCell>
                          <TableCell>End Time</TableCell>
                          <TableCell>Total Units</TableCell>
                          <TableCell>Rate of Pay</TableCell>
                          <TableCell>Payroll Item Name</TableCell>
                          <TableCell>Amount To Pay</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {payrollReport.map((row, index) => (
                          <TableRow key={index} hover>
                            <TableCell>{row.payrollId}</TableCell>
                            <TableCell>{row.lastName}</TableCell>
                            <TableCell>{row.firstName}</TableCell>
                            <TableCell>{row.startDate}</TableCell>
                            <TableCell>{row.startTime}</TableCell>
                            <TableCell>{row.endDate}</TableCell>
                            <TableCell>{row.endTime}</TableCell>
                            <TableCell>{row.totalUnits}</TableCell>
                            <TableCell>{row.rateOfPay}</TableCell>
                            <TableCell>{row.payrollItemName}</TableCell>
                            <TableCell>{row.amountToPay}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </div>
              ) : schedules && schedules.length > 0 ? (
                schedules.map(schedule => (
                  <div key={schedule._id} className="mb-4">
                    {/* Client and Employee Details Card */}
                    <Card className="mb-3 shadow-sm">
                      <CardBody>
                        <Row>
                          {/* Client Details */}
                          <Col md={6}>
                            <div className="d-flex align-items-center mb-2">
                              <FaUser className="text-primary me-2" />
                              <h5 className="mb-0">Client Details</h5>
                            </div>
                            <div className="ms-4">
                              <p className="mb-1"><strong>Name:</strong> {schedule.client?.name || 'N/A'}</p>
                              <p className="mb-1"><strong>Service Order:</strong> {schedule.serviceOrder || 'N/A'}</p>
                              <p className="mb-1"><strong>Service:</strong> {schedule.service?.name || 'N/A'} ({schedule.service?.code || 'N/A'})</p>
                              <p className="mb-0"><strong>Payor:</strong> {schedule.payor?.payor || 'N/A'}</p>
                            </div>
                          </Col>
                          
                          {/* Employee Details */}
                          <Col md={6}>
                            <div className="d-flex align-items-center mb-2">
                              <FaUserTie className="text-success me-2" />
                              <h5 className="mb-0">Employee Details</h5>
                            </div>
                            <div className="ms-4">
                              <p className="mb-1"><strong>Name:</strong> {schedule.caregiver?.name || 'N/A'}</p>
                              <p className="mb-1"><strong>Email:</strong> {schedule.caregiver?.email || 'N/A'}</p>
                              <p className="mb-1"><strong>Phone:</strong> {schedule.caregiver?.phone || 'N/A'}</p>
                              <p className="mb-0"><strong>Payroll Item:</strong> {schedule.payrollItem || 'N/A'}</p>
                            </div>
                          </Col>
                        </Row>
                      </CardBody>
                    </Card>

                    {/* Time Tracking Table */}
                    {schedule.tracking && schedule.tracking.entries && schedule.tracking.entries.length > 0 ? (
                      <div>
                        <div className="d-flex align-items-center mb-2">
                          <FaClock className="text-primary me-2" />
                          <h5>Time Tracking Details</h5>
                        </div>
                        
                        <TableContainer>
                          <Table size="small">
                            <TableHead>
                              <TableRow sx={{ backgroundColor: 'primary.main' }}>
                                <TableCell sx={{ color: "white", fontWeight: 'bold' }}>Date</TableCell>
                                <TableCell sx={{ color: "white", fontWeight: 'bold' }} align="center">Start Time</TableCell>
                                <TableCell sx={{ color: "white", fontWeight: 'bold' }} align="center">End Time</TableCell>
                                <TableCell sx={{ color: "white", fontWeight: 'bold' }} align="center">Break Time</TableCell>
                                <TableCell sx={{ color: "white", fontWeight: 'bold' }} align="center">Total Time</TableCell>
                                <TableCell sx={{ color: "white", fontWeight: 'bold' }} align="center">Amount</TableCell>
                                <TableCell sx={{ color: "white", fontWeight: 'bold' }} align="center">Status</TableCell>
                                <TableCell sx={{ color: "white", fontWeight: 'bold' }} align="center">Actions</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {schedule.tracking.entries
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((task, ind) => (
                                  <TableRow key={ind} hover>
                                    <TableCell>
                                      {formatToSimpleDate(task.startTime)}
                                    </TableCell>
                                    <TableCell align="center">
                                      <Tooltip title={`System: ${formatDateTime(task.startTime)}`}>
                                        <span>{formatToLocalTime(task.startTime)}</span>
                                      </Tooltip>
                                    </TableCell>
                                    <TableCell align="center">
                                      <Tooltip title={`System: ${task.stoppedTime ? formatDateTime(task.stoppedTime) : 'N/A'}`}>
                                        <span>{task.stoppedTime ? formatToLocalTime(task.stoppedTime) : "--:--:--"}</span>
                                      </Tooltip>
                                    </TableCell>
                                    <TableCell align="center">
                                      {formatTime(task.totalBreakTime)}
                                    </TableCell>
                                    <TableCell align="center">
                                      <Chip 
                                        label={formatTime(task.elapsedTime)} 
                                        color={task.elapsedTime > 28800 ? "error" : "primary"}
                                        size="small"
                                      />
                                    </TableCell>
                                    <TableCell align="center">
                                      ${task.amount?.toFixed(2) || "0.00"}
                                    </TableCell>
                                    <TableCell align="center">
                                      <Chip 
                                        label={task.status || 'pending'} 
                                        color={
                                          task.status === 'approved' ? 'success' :
                                          task.status === 'rejected' ? 'error' : 'warning'
                                        }
                                        size="small"
                                      />
                                    </TableCell>
                                    <TableCell align="center">
                                      <Tooltip title="Edit Time">
                                        <IconButton
                                          color="primary"
                                          size="small"
                                          onClick={() => handleOpenTimeEdit(task)}
                                        >
                                          <FaEdit />
                                        </IconButton>
                                      </Tooltip>
                                    </TableCell>
                                  </TableRow>
                                ))
                              }
                            </TableBody>
                          </Table>
                          <TablePagination
                            rowsPerPageOptions={[5, 10, 25]}
                            component="div"
                            count={schedule.tracking.entries.length}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                          />
                        </TableContainer>
                      </div>
                    ) : (
                      <Alert variant="info" className="mb-3">
                        No tracking data available for this schedule.
                      </Alert>
                    )}
                  </div>
                ))
              ) : (
                <Typography variant="body1" className="text-muted text-center py-4">
                  No schedules found for this week.
                </Typography>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          {showPayrollReport && (
            <Button variant="outlined" onClick={() => setShowPayrollReport(false)}>
              Back to Details
            </Button>
          )}
          <button className="btn btn-secondary" onClick={handleCloseModal}>
            Close
          </button>
          {!showPayrollReport && (
            <button 
              className="btn btn-primary" 
              onClick={generatePayrollReport}
              disabled={loading || !schedules || schedules.length === 0}
            >
              Generate Payroll Report
            </button>
          )}
        </Modal.Footer>
      </Modal>

      {/* Time Edit Dialog */}
      <Dialog
        open={showTimeEditDialog}
        onClose={handleCloseTimeEdit}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Edit Time Entry</DialogTitle>
        <form onSubmit={handleTimeEditSubmit}>
          <DialogContent dividers>
            <Grid container spacing={3} sx={{ pt: 1 }}>
              <Grid item xs={12}>
                <Typography variant="subtitle1">
                  <strong>Date:</strong> {selectedTask && formatToSimpleDate(selectedTask.startTime)}
                </Typography>
                <Typography variant="subtitle1">
                  <strong>Job:</strong> {selectedTask?.jobDetails?.name || 'N/A'}
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
            <Button onClick={handleCloseTimeEdit}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              Save Changes
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
};

export default TimesheetModal;