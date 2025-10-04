import React, { useEffect, useState } from 'react';
import {
  Paper,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Modal,
  TextField,
  Typography,
  IconButton,
} from '@mui/material';
import MuiAlert from '@mui/material/Alert';
import axios from 'axios';

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const bashUrl = process.env.REACT_APP_BASH_URL;

function LeaveTypeManagement() {
  const options = {
    Authorization: `Bearer ${localStorage.getItem("shinpay-vendor-token")}`,
    "Content-Type": "application/json",
  };

  const [leaveTypes, setLeaveTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedLeaveType, setSelectedLeaveType] = useState(null);
  const [leaveTypeName, setLeaveTypeName] = useState("");

  const fetchLeaveTypes = async () => {
    try {
      const response = await axios.get(`${bashUrl}/leaves/types`, { headers: options });
      setLeaveTypes(response.data);
      setLoading(false);
    } catch (error) {
      setSnackbarMessage("Failed to fetch leave types.");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaveTypes();
  }, []);

  const handleOpenModal = (leaveType) => {
    setSelectedLeaveType(leaveType);
    setLeaveTypeName(leaveType ? leaveType.name : "");
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedLeaveType(null);
    setLeaveTypeName("");
  };

  const handleSave = async () => {
    try {
      if (selectedLeaveType) {
        // Edit leave type
        await axios.put(`${bashUrl}/leaves/types/${selectedLeaveType._id}`, { name: leaveTypeName }, { headers: options });
        setSnackbarMessage("Leave type updated successfully.");
      } else {
        // Add new leave type
        await axios.post(`${bashUrl}/leaves/types`, { name: leaveTypeName }, { headers: options });
        setSnackbarMessage("Leave type added successfully.");
      }
      setOpenSnackbar(true);
      fetchLeaveTypes(); // Refresh the list
      handleCloseModal();
    } catch (error) {
      setSnackbarMessage("Failed to save leave type.");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${bashUrl}/leaves/types/${id}`, { headers: options });
      setSnackbarMessage("Leave type deleted successfully.");
      setOpenSnackbar(true);
      fetchLeaveTypes(); // Refresh the list
    } catch (error) {
      setSnackbarMessage("Failed to delete leave type.");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
    }
  };

  return (
    <Paper sx={{ width: '100%', padding: 2 }}>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert onClose={() => setOpenSnackbar(false)} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>

      <Button variant="contained" color="primary" onClick={() => handleOpenModal(null)}>Add Leave Type</Button>

      <TableContainer component={Paper} sx={{ marginTop: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Leave Type</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {leaveTypes.map((leaveType) => (
              <TableRow key={leaveType.id}>
                <TableCell>{leaveType.name}</TableCell>
                <TableCell align="right">
                  <Button variant="contained" color="primary" sx={{ marginRight: '10px'}}  onClick={() => handleOpenModal(leaveType)}>Edit</Button>
                  <Button  variant="contained" color="success" onClick={() => handleDelete(leaveType._id)}>Delete</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal for adding/editing leave type */}
      <Modal open={modalOpen} onClose={handleCloseModal}>
        <Paper sx={{ padding: 4, maxWidth: 400, margin: 'auto', marginTop: '20%' }}>
          <Typography variant="h6">{selectedLeaveType ? "Edit Leave Type" : "Add Leave Type"}</Typography>
          <TextField
            label="Leave Type Name"
            value={leaveTypeName}
            onChange={(e) => setLeaveTypeName(e.target.value)}
            fullWidth
            sx={{ marginTop: 2 }}
          />
          <Button variant="contained" color="primary" onClick={handleSave} sx={{ marginTop: 2 }}>
            Save
          </Button>
        </Paper>
      </Modal>
    </Paper>
  );
}

export default LeaveTypeManagement;
