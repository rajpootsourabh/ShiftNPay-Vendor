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
  CircularProgress 
} from '@mui/material';
import MuiAlert from '@mui/material/Alert';
import axios from 'axios';
import moment from 'moment';
import { toast } from "react-toastify";

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const bashUrl = process.env.REACT_APP_BASH_URL;

function Holidays() {
  const options = {
    Authorization: `Bearer ${localStorage.getItem("shinpay-vendor-token")}`,
    "Content-Type": "application/json",
  };
  const [loading, setLoading] = useState(false); 
  const [holidaysData, setHolidaysData] = useState([]);
  const [editHoldiay, setEditHoldiay] = useState({});
  const [method, setMethod] = useState('new');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [modalOpen, setModalOpen] = useState(false);
  const [holidayName, setHolidayName] = useState("");
  const [holidayDate, setHolidayDate] = useState("");

  const fetchHolidays = async () => {
    try {
      const response = await axios.get(`${bashUrl}/leaves/holidays`, { headers: options });
      setHolidaysData(response.data);
      setLoading(false);
    } catch (error) {
      setSnackbarMessage("Failed to fetch leave types.");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHolidays();
  }, []);

  const handleOpenModal = (data) => {
    console.log(data)
    setHolidayName(data?.name);
    setEditHoldiay(data);
    if(data?.date){
    setHolidayDate(moment(data.date).format("yyyy-MM-D"))
      
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setHolidayName(null);
    setHolidayDate("");
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      console.log(method, "method");
      console.log("holidayName : ", holidayName);
      console.log("holidayDate : ", holidayDate);
  
      if (method == "new") {
        await axios.post(
          `${bashUrl}/leaves/holidays`,
          { name: holidayName, date: holidayDate },
          { headers: options }
        );
        toast.success("Holiday added successfully!");
      } else {
        await axios.post(
          `${bashUrl}/leaves/holidays/${editHoldiay._id}`,
          { name: holidayName, date: holidayDate },
          { headers: options }
        );
        toast.success("Holiday updated successfully!");
      }
  
      fetchHolidays(); // Refresh the holidays list
      handleCloseModal(); // Close the modal
    } catch (error) {
      console.error("Error saving holiday:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to save holiday.";
      toast.error(errorMessage); // Show error alert
    }finally {
      setLoading(false); // Stop loader
    }
  };


  const handleDelete = async (id) => {
    try {
      await axios.delete(`${bashUrl}/leaves/holidays/${id}`, { headers: options });
      setSnackbarMessage("Leave type deleted successfully.");
      setOpenSnackbar(true);
      fetchHolidays(); // Refresh the list
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

      <Button variant="contained" color="primary" onClick={() =>  {
        setMethod('new'); handleOpenModal(null);
      }}>Add Holiday</Button>

      <TableContainer component={Paper} sx={{ marginTop: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Date</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {holidaysData.map((leaveType) => (
              <TableRow key={leaveType.id}>
                <TableCell>{leaveType.name}</TableCell>
                <TableCell>{moment(leaveType.date).format('D-M-Y')}</TableCell>
                <TableCell align="right">
                  <Button variant="contained" color="primary" sx={{ marginRight: '10px' }} onClick={() =>{
                    setMethod('edit');
                     handleOpenModal(leaveType)}}>Edit</Button>
                  <Button variant="contained" color="success" onClick={() => handleDelete(leaveType._id)}>Delete</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal for adding/editing leave type */}
      <Modal open={modalOpen} onClose={handleCloseModal}>
        <Paper sx={{ padding: 4, maxWidth: 400, margin: 'auto', marginTop: '20%' }}>
          <Typography variant="h6">{holidayName ? "Edit Holiday" : "Add Holiday"}</Typography>
          <TextField
            label="Holiday Name"
            value={holidayName}
            onChange={(e) => setHolidayName(e.target.value)}
            fullWidth
            required
            sx={{ marginBottom: 2 }}
          />
          <TextField
            label="Date"
            type="date"
            value={holidayDate}
            onChange={(e) => setHolidayDate(e.target.value)}
            fullWidth
            required
            sx={{ marginBottom: 2 }}
            InputLabelProps={{
              shrink: true,
            }}
          />
          <Button variant="contained" color="primary" disabled={loading}  
            onClick={ () =>{
           
             handleSave()
          }} sx={{ marginTop: 2 }}>
          {loading ? <CircularProgress size={24} color="inherit" /> : "Save"}
        </Button>
    </Paper>
      </Modal >
    </Paper >
  );
}

export default Holidays;
