import React, { useEffect, useState } from "react";
import {
  Backdrop,
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  Paper,
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
import {
  MdDeleteForever,
  MdCheckCircle,
  MdDone,
  MdAccessAlarm,
} from "react-icons/md";
import { FaEdit } from "react-icons/fa";
import MuiAlert from "@mui/material/Alert";
import axios from "axios";
import { CiSearch } from "react-icons/ci";
import AddJob from "../popup/AddJob";
import moment from "moment-timezone";
import DeleteComponent from "../common/DeleteComponent";
import { useSelector } from "react-redux";
import swal from "sweetalert";

const UpdateShiftPopup = ({ job, shifts, onUpdate, onClose }) => {
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const [selectedShift, setSelectedShift] = useState("");
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setSelectedShift("");
    onClose();
    setOpen(false);
  };

  const handleUpdate = async () => {
    if (selectedShift) {
      await onUpdate(job._id, selectedShift);
      handleClose();
    }
  };

  return (
    <>
      <Tooltip title="Edit shift">
        <IconButton color="success" onClick={handleOpen}>
          <FaEdit title="Active" />
        </IconButton>
      </Tooltip>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Update Shift for {job.name}</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Select Shift</InputLabel>
            <Select
              value={selectedShift}
              onChange={(e) => setSelectedShift(e.target.value)}
              label="Select Shift"
            >
              {shifts.map((shift) => {
                const originalStart = moment
                  .utc(shift.start)
                  .tz(shift.timezone || "America/Chicago");
                const originalEnd = moment
                  .utc(shift.end)
                  .tz(shift.timezone || "America/Chicago");
                const localStart = moment.utc(shift.start).tz(userTimezone);
                const localEnd = moment.utc(shift.end).tz(userTimezone);

                return (
                  <MenuItem key={shift._id} value={shift._id}>
                    <Box sx={{ width: "100%" }}>
                      <Typography fontWeight="bold">{shift.name}</Typography>
                      <Typography variant="body2">
                        Original: {originalStart.format("h:mm A")} -{" "}
                        {originalEnd.format("h:mm A")}(
                        {shift.timezone || "America/Chicago"})
                      </Typography>
                      <Typography variant="body2">
                        Your Time: {localStart.format("h:mm A")} -{" "}
                        {localEnd.format("h:mm A")}
                      </Typography>
                    </Box>
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            onClick={handleUpdate}
            disabled={!selectedShift}
            variant="contained"
            color="primary"
          >
            Update Shift
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

// Alert notification of MUI
const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

function Jobs({ user }) {
  const bashUrl = process.env.REACT_APP_BASH_URL;
  const options = {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("shinpay-vendor-token")}`,
      "Content-Type": "application/json",
    },
  };
  const [staffs, setStaffs] = useState([]);

  const [addEmpOpen, setAddEmpOpen] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [data, setData] = useState({
    type: "job",
    id: "",
    title: "",
  });

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filterdData, setFilterData] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [customVariant, setCustomVariant] = useState("success");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState();
  const [loading, setLoading] = useState(true);
  const [shifts, setShifts] = useState([]);

  const handleUpdateShift = async (jobId, shiftId) => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${bashUrl}/job/assign-shift/${jobId}`,
        { vendorId: user?._id, shiftId },
        { headers: options }
      );
      // Handle success (maybe refresh job list)
    } catch (error) {
      console.error("Error updating shift:", error);
      // Handle error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const searchData = staffs?.filter((item) =>
      item?.name?.toLowerCase().includes(search.toLocaleLowerCase())
        ? item
        : null
    );
    setFilterData(searchData);
  }, [search, staffs]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const getAllJobs = async () => {
    return await axios
      .get(`${bashUrl}/job/get-all-jobs-id/${user?._id}`, { headers: options })
      .then((response) => {
        setStaffs(response.data.result);
        setFilterData(response.data.result);
        setLoading(false);
      })
      .catch((error) => {
        setSuccess("");
        setError(error.response.data.msg);
        setCustomVariant("error");
        setLoading(false);
      });
  };

  useEffect(() => {
    getAllJobs();
  }, [loading, refresh]);

  const getAllShifts = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${bashUrl}/shift/get-all`, options);
      setShifts(response.data.result);
    } catch (error) {
      setError(error.response?.data?.msg || "Error fetching shifts");
    }
  };

  useEffect(() => {
    getAllShifts();
  }, []);

  // Function to mark a job as completed
  const markJobAsCompleted = async (job) => {
    console.log("job : ", job);
    const { _id: jobId, name } = job;
    swal({
      title: "Are you sure?",
      text: `Do you want to mark the job "${name}" as completed?`,
      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then(async (willComplete) => {
      if (willComplete) {
        try {
          const response = await axios.post(
            `${bashUrl}/job/mark-completed/${jobId}`,
            { vendorId: user?._id },
            { headers: options }
          );
          if (response.status === 200) {
            swal(
              "Success!",
              "The job has been marked as completed.",
              "success"
            );
            setRefresh((prev) => !prev);
          } else {
            swal(
              "Error",
              "There was an error marking the job as completed.",
              "error"
            );
          }
        } catch (error) {
          swal(
            "Error",
            error.response
              ? error.response.data.msg
              : "There was an error marking the job as completed.",
            "error"
          );
        }
      }
    });
  };

  console.log('filterdData : ' , filterdData)
  return (
    <Paper sx={{ borderRadius: 0, width: "100%", ml: 1, p: 2 }}>
      <Box>
        <Snackbar
          open={open}
          autoHideDuration={6000}
          onClose={() => setOpen(false)}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
          key={"top" + "right"}
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

        <Box
          sx={{
            width: "100%",
            height: 70,
            mb: 1,
            display: "flex",
            alignItems: "center",
          }}
        >
          <Box sx={{ width: "40%" }}>
            <TextField
              fullWidth
              label="Search"
              name="search"
              onChange={(evt) => setSearch(evt.target.value)}
              value={search}
              placeholder="Search job name"
              id="outlined-start-adornment"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CiSearch />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
          <Box sx={{ flexGrow: 1 }} />
          <Button
            variant="contained"
            sx={{
              height: 40,
              width: 200,
              bgcolor: "rgba(16, 138, 0, 1)",
              ":hover": { bgcolor: "rgba(16, 138, 0, 10)" },
            }}
            onClick={() => setAddEmpOpen(true)}
          >
            Add Job
          </Button>
        </Box>

        {/* adding job */}
        <AddJob
          setOpenModale={setAddEmpOpen}
          openModale={addEmpOpen}
          user={user}
          setLoading={setLoading}
          setSuccess={setSuccess}
          setError={setError}
          setOpen={setOpen}
          setCustomVariant={setCustomVariant}
          setRefresh={setRefresh}
          refresh={refresh}
        />

        {/* deleting job */}
        <DeleteComponent
          setOpenModale={setOpenDelete}
          openModale={openDelete}
          user={user}
          setLoading={setLoading}
          setSuccess={setSuccess}
          setError={setError}
          setOpen={setOpen}
          setCustomVariant={setCustomVariant}
          data={data}
          setData={setData}
          setRefresh={setRefresh}
          refresh={refresh}
        />

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "#E4EAEE", color: "white" }}>
                <TableCell sx={{ color: "black" }}>Job Name</TableCell>
                <TableCell sx={{ color: "black" }}>OverTime Allowed</TableCell>
                <TableCell sx={{ color: "black" }}>Shift Timing</TableCell>
                <TableCell sx={{ color: "black" }}>Local Timing</TableCell>
                <TableCell sx={{ color: "black" }} align="center">
                  Date
                </TableCell>
                <TableCell sx={{ color: "black" }} align="center">
                  Status
                </TableCell>
                <TableCell sx={{ color: "black" }} align="center">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filterdData && filterdData.length ? (
                filterdData
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((item, ind) => {
                    const userTimezone = Intl.DateTimeFormat().resolvedOptions()
                      .timeZone;
                    const shift = item.shift;
                    const originalStart = shift != null
                      ? moment
                          .utc(shift?.start || new Date())
                          .tz(shift?.timezone || "America/Chicago")
                      : null;
                    const originalEnd = shift != null
                      ? moment
                          .utc(shift?.end || new Date())
                          .tz(shift?.timezone || "America/Chicago")
                      : null;
                    const localStart = shift != null
                      ? moment.utc(shift?.start).tz(userTimezone)
                      : null;
                    const localEnd = shift != null
                      ? moment.utc(shift?.end).tz(userTimezone)
                      : null;

                    return (
                      <TableRow key={ind} hover>
                        <TableCell>{item?.name}</TableCell>
                        <TableCell style={{ textTransform: "capitalize" }}>
                          {item?.overtimeAllowed ?? "Yes"}
                        </TableCell>
                        <TableCell>
                          {shift ? (
                            <>
                              {shift.name}
                              <br />
                              <small>
                                {originalStart.format("h:mm A")} -{" "}
                                {originalEnd.format("h:mm A")}
                                <br />({shift.timezone || "America/Chicago"})
                              </small>
                            </>
                          ) : (
                            "Not Assigned"
                          )}
                        </TableCell>
                        <TableCell>
                          {shift ? (
                            <>
                              {localStart.format("h:mm A")} -{" "}
                              {localEnd.format("h:mm A")}
                              <br />
                              <small>(Your Time)</small>
                            </>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell align="center">
                          {moment(item?.createdAt).format("LL")}
                        </TableCell>
                        <TableCell align="center">
                          {item?.status
                            ? item?.status == "active"
                              ? "Active"
                              : "Completed"
                            : "Active"}
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="Delete Job">
                            <IconButton
                              color="error"
                              onClick={() => {
                                setOpenDelete(true);
                                setData({
                                  id: item?._id,
                                  title: item?.name,
                                  type: "job",
                                });
                              }}
                            >
                              <MdDeleteForever />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Complete Job">
                            {item?.status ? (
                              item?.status == "active" ? (
                                <IconButton
                                  color="success"
                                  onClick={() => markJobAsCompleted(item)}
                                >
                                  <MdAccessAlarm title="Active" />
                                </IconButton>
                              ) : (
                                <IconButton color="danger">
                                  <MdDone title="Done" />
                                </IconButton>
                              )
                            ) : (
                              <IconButton
                                color="success"
                                onClick={() => markJobAsCompleted(item)}
                              >
                                <MdAccessAlarm title="Active" />
                              </IconButton>
                            )}
                          </Tooltip>
                          <UpdateShiftPopup
                            job={item}
                            shifts={shifts}
                            onUpdate={handleUpdateShift}
                            onClose={() => {}}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography>No jobs data found!</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[10, 25, 100]}
            component="div"
            count={filterdData?.length}
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

export default Jobs;
