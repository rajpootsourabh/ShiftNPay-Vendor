import React, { useEffect, useState } from "react";
import {
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  CircularProgress,
  Snackbar,
  TablePagination,
  InputAdornment,
  Backdrop,
  Typography,
  Box,
  MenuItem,
} from "@mui/material";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import { CiSearch } from "react-icons/ci";
import axios from "axios";
import MuiAlert from "@mui/material/Alert";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers";
import Stack from "@mui/material/Stack";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import moment from "moment-timezone";

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const ShiftComponent = ({ setMenu }) => {
  const bashUrl = process.env.REACT_APP_BASH_URL;
  const options = {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("shinpay-vendor-token")}`,
      "Content-Type": "application/json",
    },
  };

  // State management
  const [shifts, setShifts] = useState([]);
  const [filteredShifts, setFilteredShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [customVariant, setCustomVariant] = useState("success");

  // Popup states
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [currentShift, setCurrentShift] = useState(null);

  // Fetch all shifts
  const getAllShifts = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${bashUrl}/shift/get-all`, options);
      setShifts(response.data.result);
      setFilteredShifts(response.data.result);
      setLoading(false);
    } catch (error) {
      setError(error.response?.data?.msg || "Error fetching shifts");
      setCustomVariant("error");
      setOpen(true);
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllShifts();
  }, []);

  // Search functionality
  useEffect(() => {
    const searchData = shifts.filter((item) =>
      item?.name?.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredShifts(searchData);
    setPage(0); // Reset to first page when searching
  }, [search, shifts]);

  // Pagination handlers
  const handleChangePage = (_, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  // Shift operations
  const handleAddShift = async (newShift) => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${bashUrl}/shift/add`,
        newShift,
        options
      );
      setSuccess("Shift added successfully");
      setCustomVariant("success");
      setOpen(true);
      getAllShifts();
    } catch (error) {
      console.log("error------", error.message);
      setError(error.response?.data?.msg);
      setCustomVariant("error");
      setOpen(true);
    } finally {
      setLoading(false);
      setAddOpen(false);
    }
  };

  const handleEditShift = async (updatedShift) => {
    try {
      setLoading(true);
      const response = await axios.put(
        `${bashUrl}/shift/update/${updatedShift._id}`,
        updatedShift,
        options
      );
      setSuccess("Shift updated successfully");
      setCustomVariant("success");
      setOpen(true);
      getAllShifts();
    } catch (error) {
      setError(error.response?.data?.msg);
      setCustomVariant("error");
      setOpen(true);
    } finally {
      setLoading(false);
      setEditOpen(false);
    }
  };

  const handleDeleteShift = async (id) => {
    try {
      setLoading(true);
      const response = await axios.delete(
        `${bashUrl}/shift/delete/${id}`,
        options
      );
      setSuccess("Shift deleted successfully");
      setCustomVariant("success");
      setOpen(true);
      getAllShifts();
    } catch (error) {
      setError(error.response?.data?.msg);
      setCustomVariant("error");
      setOpen(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ borderRadius: 0, width: "100%", ml: 1, p: 2 }}>
      {/* Notification Snackbar */}
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
          {error || success}
        </Alert>
      </Snackbar>

      {/* Loading Backdrop */}
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>

      {/* Search and Add Button */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 2, gap: 2 }}>
        <TextField
          fullWidth
          label="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search shift by name"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <CiSearch />
              </InputAdornment>
            ),
          }}
        />
        <Button
          variant="contained"
          startIcon={<FaPlus />}
          onClick={() => setAddOpen(true)}
          sx={{
            width: 200,
            bgcolor: "rgba(16, 138, 0, 1)",
            ":hover": { bgcolor: "rgba(16, 138, 0, 10)" },
          }}
        >
          Add Shift
        </Button>
      </Box>

      {/* Add Shift Popup */}
      <AddShiftPopup
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSave={handleAddShift}
      />

      {/* Edit Shift Popup */}
      {currentShift && (
        <EditShiftPopup
          open={editOpen}
          onClose={() => setEditOpen(false)}
          shift={currentShift}
          onSave={handleEditShift}
        />
      )}

      {/* Shifts Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ bgcolor: "#E4EAEE" }}>
            <TableRow>
              <TableCell sx={{ color: "black" }}>Shift Name</TableCell>
              <TableCell sx={{ color: "black" }} align="center">
                Timezone
              </TableCell>
              <TableCell sx={{ color: "black" }} align="center">
                Shift Time (Original)
              </TableCell>
              <TableCell sx={{ color: "black" }} align="center">
                Your Local Time
              </TableCell>
              <TableCell sx={{ color: "black" }} align="center">
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredShifts.length > 0 ? (
              filteredShifts
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((shift) => {
                  const localTz = Intl.DateTimeFormat().resolvedOptions()
                    .timeZone;
                  const originalStart = moment
                    .utc(shift.start)
                    .tz(shift.timezone || "America/Chicago");
                  const originalEnd = moment
                    .utc(shift.end)
                    .tz(shift.timezone || "America/Chicago");
                  const localStart = moment.utc(shift.start).tz(localTz);
                  const localEnd = moment.utc(shift.end).tz(localTz);

                  return (
                    <TableRow key={shift._id} hover>
                      <TableCell>{shift.name}</TableCell>
                      <TableCell align="center">
                        {shift.timezone || "America/Chicago"}
                        <br />
                        <small>
                          (UTC
                          {moment
                            .tz(shift.timezone || "America/Chicago")
                            .format("Z")}
                          )
                        </small>
                      </TableCell>
                      <TableCell align="center">
                        {originalStart.format("h:mm A")} -{" "}
                        {originalEnd.format("h:mm A")}
                      </TableCell>
                      <TableCell align="center">
                        {localStart.format("h:mm A")} -{" "}
                        {localEnd.format("h:mm A")}
                        <br />
                        <small>({localTz})</small>
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Edit Shift">
                          <IconButton
                            color="primary"
                            onClick={() => {
                              setCurrentShift(shift);
                              setEditOpen(true);
                            }}
                          >
                            <FaEdit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Shift">
                          <IconButton
                            color="error"
                            onClick={() => handleDeleteShift(shift._id)}
                          >
                            <FaTrash />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography>No shift data found!</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[10, 25, 100]}
          component="div"
          count={filteredShifts.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>
    </Paper>
  );
};

const AddShiftPopup = ({ open, onClose, onSave }) => {
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const [shift, setShift] = useState({ 
    name: '', 
    start: moment.tz('America/Chicago').set({ hour: 9, minute: 0, second: 0 }),
    end: moment.tz('America/Chicago').set({ hour: 17, minute: 0, second: 0 }),
    timezone: 'America/Chicago'
  });

  const [timezones, setTimezones] = useState([]);
  const [timeDiff, setTimeDiff] = useState('');

  useEffect(() => {
    if (shift.timezone) {
      const userOffset = moment.tz(userTimezone).utcOffset();
      const selectedOffset = moment.tz(shift.timezone).utcOffset();
      const diffMinutes = selectedOffset - userOffset;
      const diffHours = diffMinutes / 60;
      
      const absDiff = Math.abs(diffHours);
      const direction = diffHours > 0 ? 'ahead' : 'behind';
      
      setTimeDiff(`${absDiff} hour${absDiff !== 1 ? 's' : ''} ${direction} of your time`);
    }
  }, [shift.timezone, userTimezone]);

  useEffect(() => {
    const zones = Intl.supportedValuesOf('timeZone').map(zone => {
      const now = moment.tz(zone);
      const offset = now.utcOffset();
      const diffFromUser = offset - moment.tz(userTimezone).utcOffset();
      const diffHours = diffFromUser / 60;
      
      return {
        name: zone,
        offset,
        label: `${zone.replace(/_/g, ' ')} (UTC${now.format('Z')})`,
        diffLabel: diffFromUser === 0 ? 'Same as yours' : 
                  `${Math.abs(diffHours)}h ${diffHours > 0 ? 'ahead' : 'behind'}`
      };
    }).sort((a, b) => a.offset - b.offset);
    
    setTimezones(zones);
  }, [userTimezone]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setShift(prev => {
      const newState = { ...prev, [name]: value };
      if (name === 'timezone' && value !== prev.timezone) {
        const startHour = prev.start.hours();
        const startMinute = prev.start.minutes();
        const endHour = prev.end.hours();
        const endMinute = prev.end.minutes();
        
        return {
          ...newState,
          start: moment.tz(value).set({ hour: startHour, minute: startMinute }),
          end: moment.tz(value).set({ hour: endHour, minute: endMinute })
        };
      }
      return newState;
    });
  };

  const handleTimeChange = (field, value) => {
    setShift(prev => {
      const newTime = moment(value).tz(prev.timezone);
      const updated = { ...prev, [field]: newTime };
      
      // If end time is before start time, add 1 day to end time
      if (field === 'start' && updated.end.isBefore(newTime)) {
        updated.end = newTime.clone().add(1, 'hour');
      }
      
      return updated;
    });
  };

  const handleSave = () => {
    // Clone moments and ensure proper date handling
    const start = shift.start.clone().tz(shift.timezone);
    let end = shift.end.clone().tz(shift.timezone);
    
    // If end time is before start time in the same day, it crosses midnight
    if (end.isBefore(start)) {
      end.add(1, 'day');
    }
    onSave({
      name: shift.name,
      start: start.utc().toISOString(),
      end: end.utc().toISOString(),
      timezone: shift.timezone
    });
    
    // Reset form
    setShift({ 
      name: '', 
      start: moment.tz('America/Chicago').set({ hour: 9, minute: 0 }),
      end: moment.tz('America/Chicago').set({ hour: 17, minute: 0 }),
      timezone: 'America/Chicago'
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Add New Shift</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          margin="normal"
          label="Shift Name"
          name="name"
          value={shift.name}
          onChange={handleChange}
          required
        />

        <TextField
          select
          fullWidth
          margin="normal"
          label={`Timezone (${timeDiff})`}
          name="timezone"
          value={shift.timezone}
          onChange={handleChange}
          required
        >
          {timezones.map((zone) => (
            <MenuItem key={zone.name} value={zone.name}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                <span>{zone.label}</span>
                <span style={{ color: zone.diffLabel === 'Same as yours' ? 'green' : '#666' }}>
                  {zone.diffLabel}
                </span>
              </Box>
            </MenuItem>
          ))}
        </TextField>

        <Box sx={{ mt: 2, mb: 2, width: '100%' }}>
          <Typography variant="subtitle1">
            Start Time ({moment.tz(shift.start, shift.timezone).format('h:mm A z')}) - 
            Your Time: {moment.tz(shift.start, userTimezone).format('h:mm A z')}
          </Typography>
          <LocalizationProvider dateAdapter={AdapterMoment}>
            <Stack spacing={2} sx={{ my: 1 }}>
              <TimePicker 
                value={shift.start}
                onChange={(value) => handleTimeChange('start', value)}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </Stack>
          </LocalizationProvider>
        </Box>

        <Box sx={{ mt: 2, mb: 2, width: '100%' }}>
          <Typography variant="subtitle1">
            End Time ({moment.tz(shift.end, shift.timezone).format('h:mm A z')}) - 
            Your Time: {moment.tz(shift.end, userTimezone).format('h:mm A z')}
          </Typography>
          <LocalizationProvider dateAdapter={AdapterMoment}>
            <Stack spacing={2} sx={{ my: 1 }}>
              <TimePicker 
                value={shift.end}
                onChange={(value) => handleTimeChange('end', value)}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </Stack>
          </LocalizationProvider>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};


// Edit Shift Popup Component
const EditShiftPopup = ({ open, onClose, shift, onSave }) => {
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const shiftTimezone = shift.timezone || userTimezone;

  // Convert UTC times from database to the shift's local timezone
  const [editedShift, setEditedShift] = useState({
    name: shift.name,
    start: moment.utc(shift.start).tz(shiftTimezone),
    end: moment.utc(shift.end).tz(shiftTimezone),
    timezone: shiftTimezone,
  });

  const [timezones, setTimezones] = useState([]);
  const [timeDiff, setTimeDiff] = useState("");

  useEffect(() => {
    // Calculate time difference whenever timezone changes
    if (editedShift.timezone) {
      const userOffset = moment.tz(userTimezone).utcOffset();
      const selectedOffset = moment.tz(editedShift.timezone).utcOffset();
      const diffMinutes = selectedOffset - userOffset;
      const diffHours = diffMinutes / 60;

      const absDiff = Math.abs(diffHours);
      const direction = diffHours > 0 ? "ahead" : "behind";

      setTimeDiff(
        `${absDiff} hour${absDiff !== 1 ? "s" : ""} ${direction} of your time`
      );
    }
  }, [editedShift.timezone, userTimezone]);

  useEffect(() => {
    // Initialize timezones list
    const zones = Intl.supportedValuesOf("timeZone")
      .map((zone) => {
        const now = moment.tz(zone);
        const offset = now.utcOffset();
        const diffFromUser = offset - moment.tz(userTimezone).utcOffset();
        const diffHours = diffFromUser / 60;

        return {
          name: zone,
          offset,
          label: `${zone.replace(/_/g, " ")} (UTC${now.format("Z")})`,
          diffLabel:
            diffFromUser === 0
              ? "Same as yours"
              : `${Math.abs(diffHours)}h ${diffHours > 0 ? "ahead" : "behind"}`,
        };
      })
      .sort((a, b) => a.offset - b.offset);

    setTimezones(zones);
  }, [userTimezone]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedShift(prev => {
      const newState = { ...prev, [name]: value };
      // When timezone changes, adjust times to maintain the same local time
      if (name === 'timezone' && value !== prev.timezone) {
        const startHour = prev.start.hours();
        const startMinute = prev.start.minutes();
        const endHour = prev.end.hours();
        const endMinute = prev.end.minutes();
        
        return {
          ...newState,
          start: moment.tz(value).set({ hour: startHour, minute: startMinute }),
          end: moment.tz(value).set({ hour: endHour, minute: endMinute })
        };
      }
      return newState;
    });
  };

  const handleTimeChange = (field, value) => {
    setEditedShift(prev => ({ 
      ...prev, 
      [field]: moment(value).tz(prev.timezone) // Keep in selected timezone
    }));
  };

  const handleSave = () => {
    const start = editedShift.start.clone().tz(editedShift.timezone);
    let end = editedShift.end.clone().tz(editedShift.timezone);
    
    // If end time is before start time in the same day, it crosses midnight
    if (end.isBefore(start)) {
      end.add(1, 'day');
    }
    console.log({start:start.clone().utc().toISOString(),end :end.clone().utc().toISOString() })
    onSave({
      _id: shift._id,
      name: editedShift.name,
      start: start.clone().utc().toISOString(), // Convert to UTC
      end: end.clone().utc().toISOString(),    // Convert to UTC
      timezone: editedShift.timezone
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Edit Shift</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          margin="normal"
          label="Shift Name"
          name="name"
          value={editedShift.name}
          onChange={handleChange}
        />

        <TextField
          select
          fullWidth
          margin="normal"
          label={`Timezone (${timeDiff})`}
          name="timezone"
          value={editedShift.timezone}
          onChange={handleChange}
        >
          {timezones.map((zone) => (
            <MenuItem key={zone.name} value={zone.name}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  width: "100%",
                }}
              >
                <span>{zone.label}</span>
                <span
                  style={{
                    color:
                      zone.diffLabel === "Same as yours" ? "green" : "#666",
                  }}
                >
                  {zone.diffLabel}
                </span>
              </Box>
            </MenuItem>
          ))}
        </TextField>

        <Box sx={{ mt: 2, mb: 2, width: "100%" }}>
          <Typography variant="subtitle1">
            Start Time (
            {moment.tz(editedShift.start, editedShift.timezone).format("h:mm A z")}) - 
            Your Time: {moment.tz(editedShift.start, userTimezone).format("h:mm A z")}
          </Typography>
          <LocalizationProvider dateAdapter={AdapterMoment}>
            <Stack spacing={2} sx={{ my: 1 }}>
              <TimePicker
                value={editedShift.start}
                onChange={(value) => handleTimeChange("start", value)}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </Stack>
          </LocalizationProvider>
        </Box>

        <Box sx={{ mt: 2, mb: 2, width: "100%" }}>
          <Typography variant="subtitle1">
            End Time (
            {moment.tz(editedShift.end, editedShift.timezone).format("h:mm A z")}) - 
            Your Time: {moment.tz(editedShift.end, userTimezone).format("h:mm A z")}
          </Typography>
          <LocalizationProvider dateAdapter={AdapterMoment}>
            <Stack spacing={2} sx={{ my: 1 }}>
              <TimePicker
                value={editedShift.end}
                onChange={(value) => handleTimeChange("end", value)}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </Stack>
          </LocalizationProvider>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};
export default ShiftComponent;
