import { useState, useEffect } from "react";
import {
  FiSettings,
  FiSave,
  FiUsers,
  FiClock,
  FiAward,
  FiCheck,
  FiRefreshCw,
  FiGift,
  FiCalendar,
  FiUserPlus,
  FiXCircle,
  FiArchive,
} from "react-icons/fi";
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Container,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Divider,
  Tab,
  Tabs,
  Badge,
} from "@mui/material";
import axios from "axios";
import { toast } from "react-toastify";
import moment from "moment";
import { getUserName } from "../Helper/functions";

const bashUrl = process.env.REACT_APP_BASH_URL;

const api = axios.create({
  baseURL: bashUrl,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("shinpay-vendor-token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const RewardManagement = ({ employerId }) => {
  const [tabValue, setTabValue] = useState(0);
  const [baseUrl, setBaseUrl] = useState(bashUrl);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [allEmployees, setAllEmployees] = useState([]);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [config, setConfig] = useState({
    isActive: false,
    thresholdHours: 40,
    rewardHours: 4,
    weekStartDay: 1,
    allowVacation: true,
    allowDonations: true,
  });

  const [employees, setEmployees] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState({
    config: true,
    employees: true,
    requests: true,
  });
  const [calculating, setCalculating] = useState(false);

  useEffect(() => {
    api.defaults.baseURL = baseUrl;
  }, [baseUrl]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [configRes, employeesRes, requestsRes] = await Promise.all([
          api.get("/rewards/config"),
          api.post(`/rewards/calculate`),
          api.get("/rewards/requests"),
        ]);

        if (configRes.data) setConfig(configRes.data);
        if (employeesRes.data) {
          setEmployees(employeesRes.data);
          setAllEmployees(employeesRes.data);
        }
        if (requestsRes.data) setPendingRequests(requestsRes.data);

        setLoading({ config: false, employees: false, requests: false });
      } catch (err) {
        toast.error(
          `Failed to load data: ${err.response?.data?.message || err.message}`
        );
        setLoading({ config: false, employees: false, requests: false });
      }
    };

    fetchData();
  }, [employerId]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    if (newValue === 3) {
      // History tab selected
      loadHistory();
    }
  };

  const loadHistory = async () => {
    setHistoryLoading(true);
    try {
      const { data } = await api.get("/rewards/history");
      setHistory(data);
    } catch (err) {
      toast.error(
        `Failed to load history: ${err.response?.data?.message || err.message}`
      );
    }
    setHistoryLoading(false);
  };

  const handleConfigChange = (e) => {
    const { name, value, type, checked } = e.target;
    setConfig((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const saveConfig = async () => {
    try {
      const { data } = await api.put("/rewards/config", {
        ...config,
        thresholdHours: Number(config.thresholdHours),
        rewardHours: Number(config.rewardHours),
        weekStartDay: Number(config.weekStartDay),
      });
      setConfig(data);
      toast.success("Configuration saved");
    } catch (err) {
      toast.error(
        `Failed to save configuration: ${
          err.response?.data?.message || err.message
        }`
      );
    }
  };

  const calculateRewards = async () => {
    setCalculating(true);
    try {
      const { data } = await api.post(`/rewards/calculate`);
      setEmployees(data);
      setAllEmployees(data);
      toast.success("Rewards calculated");
    } catch (err) {
      toast.error(
        `Failed to calculate rewards: ${
          err.response?.data?.message || err.message
        }`
      );
    }
    setCalculating(false);
  };

  const approveReward = async (employeeId) => {
    try {
      await api.post(`/rewards/${employeeId}/approve`);
      setEmployees(prev =>
        prev.rewards.map(emp =>
          emp.employeeId === employeeId
            ? { ...emp, status: "approved", updatedAt: new Date().toISOString() }
            : emp
        )
      );
      toast.success("Reward approved successfully");
    } catch (err) {
      toast.error(
        `Failed to approve reward: ${err.response?.data?.message || err.message}`
      );
    }
  };

  const rejectReward = async (employeeId) => {
    try {
      await api.post(`/rewards/${employeeId}/reject`);
      setEmployees(prev =>
        prev.rewards.map(emp =>
          emp.employeeId === employeeId
            ? { ...emp, status: "rejected", updatedAt: new Date().toISOString() }
            : emp
        )
      );
      toast.success("Reward rejected");
    } catch (err) {
      toast.error(
        `Failed to reject reward: ${err.response?.data?.message || err.message}`
      );
    }
  };

  const handleRequestAction = async (requestId, action) => {
    try {
      await api.post(`/rewards/requests/${requestId}/${action}`);
      // Refresh data
      const [
        { data: employeesData },
        { data: requestsData },
      ] = await Promise.all([
        api.post(`/rewards/calculate`),
        api.get("/rewards/requests"),
      ]);
      setEmployees(employeesData);
      setPendingRequests(requestsData);
      toast.success(
        `Request ${action === "approve" ? "approved" : "rejected"}`
      );
    } catch (err) {
      toast.error(
        `Failed to ${action} request: ${
          err.response?.data?.message || err.message
        }`
      );
    }
  };

  const bulkApprove = async () => {
    try {
      await api.post("/rewards/bulk-approve");
      // Refresh data
      const { data } = await api.post(`/rewards/calculate`);
      setEmployees(data);
      toast.success("All pending rewards approved");
    } catch (err) {
      toast.error(
        `Failed to bulk approve: ${err.response?.data?.message || err.message}`
      );
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Main Content with Tabs */}
      <Paper elevation={3} sx={{ mb: 4 }}>
        <Tabs value={tabValue} onChange={handleTabChange} variant="fullWidth">
          <Tab label="Reward Configuration" icon={<FiSettings />} />
          <Tab
            label={
              <Badge badgeContent={employees?.rewards?.filter(e => e.status === 'pending').length} color="error">
                Pending Rewards
              </Badge>
            }
            icon={<FiAward />}
          />
          <Tab
            label={
              <Badge badgeContent={pendingRequests.length} color="error">
                Donation Requests
              </Badge>
            }
            icon={<FiGift />}
          />
          <Tab label="Reward History" icon={<FiArchive />} />
        </Tabs>
      </Paper>

      {/* Reward Configuration Tab */}
      {tabValue === 0 && (
        <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
          <Box display="flex" alignItems="center" mb={3}>
            <FiSettings style={{ marginRight: 8, color: "#1976d2" }} />
            <Typography variant="h5" component="h2">
              Reward Configuration
            </Typography>
          </Box>

          {loading.config ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : (
            <Box>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={config.isActive}
                    onChange={handleConfigChange}
                    name="isActive"
                    color="primary"
                  />
                }
                label="Enable Reward System"
              />

              <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Threshold Hours"
                    name="thresholdHours"
                    type="number"
                    value={config.thresholdHours}
                    onChange={handleConfigChange}
                    disabled={!config.isActive}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <FiClock />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Reward Hours"
                    name="rewardHours"
                    type="number"
                    value={config.rewardHours}
                    onChange={handleConfigChange}
                    disabled={!config.isActive}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <FiAward />
                        </InputAdornment>
                      ),
                      inputProps: { step: "0.5" },
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField
                    select
                    fullWidth
                    label="Week Starts On"
                    name="weekStartDay"
                    value={config.weekStartDay}
                    onChange={handleConfigChange}
                    disabled={!config.isActive}
                  >
                    <MenuItem value={0}>Sunday</MenuItem>
                    <MenuItem value={1}>Monday</MenuItem>
                    <MenuItem value={2}>Tuesday</MenuItem>
                    <MenuItem value={3}>Wednesday</MenuItem>
                    <MenuItem value={4}>Thursday</MenuItem>
                    <MenuItem value={5}>Friday</MenuItem>
                    <MenuItem value={6}>Saturday</MenuItem>
                  </TextField>
                </Grid>
              </Grid>

              <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={config.allowVacation}
                        onChange={handleConfigChange}
                        name="allowVacation"
                        color="primary"
                        disabled={!config.isActive}
                      />
                    }
                    label="Allow redeeming as vacation time"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={config.allowDonations}
                        onChange={handleConfigChange}
                        name="allowDonations"
                        color="primary"
                        disabled={!config.isActive}
                      />
                    }
                    label="Allow donating bonus hours to others"
                  />
                </Grid>
              </Grid>

              <Box mt={3}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<FiSave />}
                  onClick={saveConfig}
                  sx={{ px: 4 }}
                >
                  Save Configuration
                </Button>
              </Box>
            </Box>
          )}
        </Paper>
      )}

      {/* Pending Rewards Tab */}
      {tabValue === 1 && (
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={3}
          >
            <Box display="flex" alignItems="center">
              <FiAward style={{ marginRight: 8, color: "#1976d2" }} />
              <Typography variant="h5" component="h2">
                Pending Rewards Approval
              </Typography>
            </Box>
            <Box>
              <Button
                variant="contained"
                color="success"
                startIcon={
                  calculating ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <FiRefreshCw />
                  )
                }
                onClick={calculateRewards}
                disabled={calculating || !config.isActive}
                sx={{ mr: 2 }}
              >
                Recalculate
              </Button>
              {/* <Button
                variant="contained"
                color="primary"
                startIcon={<FiCheck />}
                onClick={bulkApprove}
                disabled={
                  !employees?.rewards?.some(e => e.status === 'pending') ||
                  !config.isActive
                }
              >
                Approve All
              </Button> */}
            </Box>
          </Box>

          {loading.employees ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Employee</TableCell>
                    <TableCell>Week</TableCell>
                    <TableCell>Hours Worked</TableCell>
                    <TableCell>Bonus Hours</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {employees?.rewards?.map((employee) => {
                    const startDate = moment(employee.weekStartDate);
                    const endDate = moment(startDate).day(5); // Friday of the same week
                    
                    const weekRange = `${startDate.format("MMM D")} - ${endDate.format("MMM D, YYYY")}`;
                    return (
                      <TableRow key={employee.employeeId}>
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            <Avatar sx={{ mr: 2, bgcolor: "primary.main" }}>
                              {employee.employeeName?.charAt(0) || "E"}
                            </Avatar>
                            <Box>
                              <Typography fontWeight="medium">
                                {employee.employeeName || "Unknown Employee"}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {employee.position || "-"}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>{weekRange}</TableCell>
                        <TableCell>
                          {employee.totalWorkedHours?.toFixed(1) || "0.0"} hrs
                        </TableCell>
                        <TableCell>
                          <Typography color="success.main" fontWeight="medium">
                            {employee.bonusHours?.toFixed(1) || "0.0"} hrs
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={employee.status || "N/A"}
                            color={
                              employee.status === "approved"
                                ? "success"
                                : employee.status === "rejected"
                                ? "error"
                                : "warning"
                            }
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          {employee.status === "pending" && (
                            <Box display="flex" gap={1}>
                             <Chip
                            label={'Auto Approve Weekly'}
                            color={ "success"
                            }
                            variant="outlined"
                          /> 
                              {/* <Button
                                size="small"
                                variant="contained"
                                color="success"
                                startIcon={<FiCheck />}
                                onClick={() => approveReward(employee.employeeId)}
                              >
                                Approve
                              </Button>
                              <Button
                                size="small"
                                variant="outlined"
                                color="error"
                                startIcon={<FiXCircle />}
                                onClick={() => rejectReward(employee.employeeId)}
                              >
                                Reject
                              </Button> */}
                            </Box>
                          )}
                          {employee.status === "approved" && (
                            <Typography variant="body2" color="text.secondary">
                              Approved on {moment(employee.updatedAt).format("MMM D, YYYY")}
                            </Typography>
                          )}
                          {employee.status === "rejected" && (
                            <Typography variant="body2" color="error">
                              Rejected on {moment(employee.updatedAt).format("MMM D, YYYY")}
                            </Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      )}

      {/* Pending Requests Tab */}
      {tabValue === 2 && (
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box display="flex" alignItems="center" mb={3}>
            <FiGift style={{ marginRight: 8, color: "#1976d2" }} />
            <Typography variant="h5" component="h2">
              Pending Requests
            </Typography>
          </Box>

          {loading.requests ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : pendingRequests.length === 0 ? (
            <Typography
              variant="body1"
              color="text.secondary"
              textAlign="center"
              py={4}
            >
              No pending requests
            </Typography>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Employee Name</TableCell>
                    <TableCell>Redumption Type</TableCell>
                    <TableCell>Hours</TableCell>
                    <TableCell>Request Date</TableCell>
                    <TableCell>Message</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pendingRequests.map((request) => (
                    <TableRow key={request._id}>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <Avatar sx={{ mr: 2, bgcolor: "primary.main" }}>
                            {getUserName(request.employeeId).charAt(0)}
                          </Avatar>
                          <Typography>{getUserName(request.employeeId)}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                       {request?.redemptionType}
                      </TableCell>
                      <TableCell>
                        <Typography fontWeight="medium">
                          {request?.hoursRedeemed}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {moment(request.createdAt).format("MMM D, YYYY")}
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          fontStyle={request.requestMessage ? "normal" : "italic"}
                        >
                          {request.requestMessage || "No message"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" gap={1}>
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            startIcon={<FiCheck />}
                            onClick={() =>
                              handleRequestAction(request._id, "approve")
                            }
                          >
                            Approve
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            startIcon={<FiXCircle />}
                            onClick={() =>
                              handleRequestAction(request._id, "reject")
                            }
                          >
                            Reject
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      )}

      {/* Reward History Tab */}
      {tabValue === 3 && (
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box display="flex" alignItems="center" mb={3}>
            <FiArchive style={{ marginRight: 8, color: "#1976d2" }} />
            <Typography variant="h5" component="h2">
              Reward History
            </Typography>
          </Box>

          {historyLoading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : history.length === 0 ? (
            <Typography
              variant="body1"
              color="text.secondary"
              textAlign="center"
              py={4}
            >
              No reward history available
            </Typography>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                  <TableCell>Employee Name</TableCell>
                    <TableCell>Redumption Type</TableCell>
                    <TableCell>Hours</TableCell>
                    <TableCell>Request Date</TableCell>
                    <TableCell>Message</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Processed Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {history.map((item) => (
                    <TableRow key={item._id}>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <Avatar sx={{ mr: 2, bgcolor: "primary.main" }}>
                            {getUserName(item.employeeId)?.charAt(0)}
                          </Avatar>
                          <Typography>{getUserName(item.employeeId) }</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                       {item?.redemptionType}
                      </TableCell>
                      <TableCell>
                        <Typography fontWeight="medium">
                          {item?.hoursRedeemed}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {moment(item.createdAt).format("MMM D, YYYY")}
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          fontStyle={item.requestMessage ? "normal" : "italic"}
                        >
                          {item.requestMessage || "No message"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={item.status}
                          color={
                            item.status === "approved"
                              ? "success"
                              : item.status === "rejected"
                              ? "error"
                              : "default"
                          }
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        {moment(item.updatedAt).format("MMM D, YYYY h:mm A")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      )}
    </Container>
  );
};

export default RewardManagement;