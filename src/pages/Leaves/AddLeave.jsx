import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import axios from "axios";
import { fetchEmployeesByVendor } from "../../store/Tracker/trackerSlice";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
const bashUrl = process.env.REACT_APP_BASH_URL;

function AddLeave() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false); // Add this line
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [leaveType, setLeaveType] = useState("");
  const [leaveCount, setLeaveCount] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const user = useSelector((state) => state.user.user);
  const { employees } = useSelector((state) => state.timeTracker);
  const options = {
    Authorization: `Bearer ${localStorage.getItem("shinpay-vendor-token")}`,
    "Content-Type": "application/json",
  };

  useEffect(() => {
    if (user) {
      dispatch(fetchEmployeesByVendor(user?._id));
    }
  }, [user, dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEmployee || !leaveType || !leaveCount) {
      setError("Please fill in all fields");
      return;
    }
  
    // Check if isSubmitting is already true to avoid double submission
    if (isSubmitting) return;
  
    setIsSubmitting(true); // Set to true when starting submission
    setLoading(true); // You can keep this if you want a loading state for UI
  
    try {
      const response = await axios.post(
        `${bashUrl}/leaves/assign-leave`,
        {
          employeeId: selectedEmployee,
          leaveType,
          leaveCount,
          year: new Date().getFullYear(),
        },
        { headers: options }
      );
  
      setSuccess(response.data.msg);
      setError("");
      navigate('/leave-management');
    } catch (err) {
      setError("Error submitting leave");
      setSuccess("");
    } finally {
      setLoading(false); // Always set this back to false
      setIsSubmitting(false); // Reset submitting state
    }
  };
  
  const fetchLeaveTypes = async () => {
    try {
      const response = await axios.get(`${bashUrl}/leaves/types`, {
        headers: options,
      });
      setLeaveTypes(response.data);
    } catch (error) {}
  };

  useEffect(() => {
    fetchLeaveTypes();
  }, []);

  return (
    <Paper sx={{ borderRadius: 0, width: "100%", ml: 1, p: 2 }}>
      <Box sx={{ width: "400px", margin: "50px" }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Leave Credit
        </Typography>

        {/* Employee Dropdown */}
        <TextField
          select
          fullWidth
          label="Select Employee"
          value={selectedEmployee}
          onChange={(e) => setSelectedEmployee(e.target.value)}
          sx={{ mb: 3 }}
        >
          {employees.map((employee) => (
            <MenuItem key={employee._id} value={employee._id}>
              {employee.name || employee.email}
            </MenuItem>
          ))}
        </TextField>

        {/* Leave Type Dropdown */}
        <TextField
          select
          fullWidth
          label="Select Leave Type"
          value={leaveType}
          onChange={(e) => setLeaveType(e.target.value)}
          sx={{ mb: 3 }}
        >
          {leaveTypes.map((leave) => (
            <MenuItem key={leave._id} value={leave._id}>
              {leave.name}
            </MenuItem>
          ))}
        </TextField>

        {/* Leave Count */}
        <TextField
          fullWidth
          label="Leave Count"
          type="number"
          value={leaveCount}
          onChange={(e) => setLeaveCount(e.target.value)}
          sx={{ mb: 3 }}
        />

        {/* Submit Button */}
        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={handleSubmit}
          disabled={isSubmitting} // Disable button if isSubmitting is true
          >
            {loading ? "Crediting..." : "Credit Leave"}
        </Button>

        {/* Success/Error Message */}
        {success && (
          <Typography color="success" sx={{ mt: 2 }}>
            {success}
          </Typography>
        )}
        {error && (
          <Typography color="error" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}
      </Box>
    </Paper>
  );
}

export default AddLeave;
