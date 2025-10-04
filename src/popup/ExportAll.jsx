import {
  Box,
  Button,
  Divider,
  IconButton,
  Modal,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { IoIosClose } from "react-icons/io";
import { grey } from "@mui/material/colors";
import axios from "axios";
import { useSelector } from "react-redux";
import { LoadingButton } from "@mui/lab";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import moment from "moment";
import * as XLSX from "xlsx";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import dayjs from "dayjs";
import { formatDateTime } from "../Helper/functions";

const bashUrl = process.env.REACT_APP_BASH_URL;

function ExportAll({
  openModale,
  setOpenModale,
  setLoading,
  setSuccess,
  setError,
  setCustomVariant,
  selectedIds,
  setOpen,
}) {
  const options = {
    Authorization: `Bearer ${localStorage.getItem("shinpay-vendor-token")}`,
    "Content-Type": "application/json",
  };
  const user = useSelector((state) => state.user.user);

  const [circle, setCircle] = useState(false);
  const [start, setStart] = useState(null);
  const [end, setEnd] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [valShift, setValShift] = useState({ start: "", end: "" });

  const handleClose = () => {
    setOpenModale(false);
    setStart(null);
    setEnd(null);
    setStartDate(null);
    setEndDate(null);
    setValShift({ start: "", end: "" });
  };

  useEffect(() => {
    // This effect is empty; can be removed or used for additional setup if needed
  }, [openModale]);

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    if (!start) {
      setValShift({ start: "Please select start date!" });
    } else if (!end) {
      setValShift({ end: "Please select end date!" });
    } else {
      setLoading(true);
      setCircle(true);
      try {
        const response = await axios.get(
          `${bashUrl}/tracking/get-all-emp/${selectedIds}?startDate=${start}&endDate=${end}`,
          { headers: options }
        );
        // console.log("response: ", response.data.result);
        exportToExcel(response.data.result);
        setLoading(false);
        setCircle(false);
        setError("");
        setSuccess(response.data.msg);
        setCustomVariant("success");
        setOpen(true);
        handleClose();
      } catch (error) {
        console.log("error: ", error);
        setLoading(false);
        setCircle(false);
        setSuccess("");
        setError(error.response?.data?.msg || "An error occurred");
        setCustomVariant("error");
        setOpen(true);
      }
    }
  };

  function formatDuration(durationInSeconds) {
    if (durationInSeconds < 60) {
      return `${String(Math.floor(durationInSeconds)).padStart(2, "0")} sec${
        durationInSeconds !== 1 ? "s" : ""
      }`;
    } else if (durationInSeconds < 3600) {
      let minutes = Math.floor(durationInSeconds / 60);
      let seconds = Math.floor(durationInSeconds % 60);
      return `${minutes} min${minutes !== 1 ? "s" : ""} ${String(
        seconds
      ).padStart(2, "0")} sec${seconds !== 1 ? "s" : ""}`;
    } else {
      let hours = Math.floor(durationInSeconds / 3600);
      let minutes = Math.floor((durationInSeconds % 3600) / 60);
      let seconds = Math.floor(durationInSeconds % 60);
      return `${hours} hr${hours !== 1 ? "s" : ""}${
        minutes > 0 ? ` ${minutes} min${minutes !== 1 ? "s" : ""}` : ""
      } ${String(seconds).padStart(2, "0")} sec${seconds !== 1 ? "s" : ""}`;
    }
  }

  const exportToExcel = (result) => {
    // Prepare data for Excel
    console.log("result : ", result);

    const excelData = result.map((item) => {
      // Initialize a base entry for each row
      const row = {
        Name: item.employeeName,
        "Job Name": item.jobName,
        "Shift Name": item.shift
          ? item.userId.shift.map((s) => s.name).join(", ")
          : "----",
        Date: item.date,
        // Calculate and format total duration
      };
            let breankTime = item.totalBreakDuration ?? 0;
        if(Array.isArray(item.clockLogs) && item.clockLogs.length > 0){
                item.clockLogs.forEach((log, index) => {
                // Depending on the type of log, assign values to specific columns
                    if (log.type === "clock-in") {
                        row[`Clock In ${index + 1}`] = formatDateTime(log.time); // Format clock-in time
                    } else if (log.type === "clock-out") {
                        row[`Clock Out ${index + 1}`] = formatDateTime(log.time); // Format clock-out time
                    } else if (log.type === "break-in") {
                        row[`Break In ${index + 1}`] = formatDateTime(log.time); // Format break-in time
                    } else if (log.type === "break-out") {
                        row[`Break Out ${index + 1}`] = formatDateTime(log.time); // Format break-out time
                    }
                });
        }
        row["Break Time"] =  formatDuration(breankTime);
        row["Working Hours"] =  formatDuration(item.totalDuration);
        row["Productive Hours"] =  formatDuration(item.totalDuration - breankTime);

      return row;
    });

    // Convert data to worksheet
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "TrackingData");

    // Export to Excel
    XLSX.writeFile(workbook, "TrackingData.xlsx");
  };

  return (
    <Modal
      keepMounted
      open={openModale}
      onClose={handleClose}
      aria-labelledby="keep-mounted-modal-title"
      aria-describedby="keep-mounted-modal-description"
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "50%",
          bgcolor: "background.paper",
          boxShadow: 24,
          borderRadius: 2,
        }}
      >
        <Box component={"form"} noValidate onSubmit={handleSubmit}>
          <Box
            sx={{
              width: "100%",
              display: "flex",
              height: 45,
              lineHeight: 45,
              px: 4,
              pt: 2,
            }}
          >
            <Typography>Export All</Typography>
            <Box sx={{ flexGrow: 1 }} />
            <IconButton
              onClick={handleClose}
              sx={{ width: 40, height: 40, marginTop: -1 }}
            >
              <IoIosClose size={28} />
            </IconButton>
          </Box>
          <Divider sx={{ width: "100%", color: "black" }} />

          <Box sx={{ mt: 1, px: 4, py: 2 }}>
            <LocalizationProvider
              dateAdapter={AdapterMoment}
              sx={{ width: "100%", my: 2 }}
            >
              <DatePicker
                label="Start Date"
                sx={{ width: "100%", my: 2 }}
                value={startDate}
                onChange={(date) => {
                  console.log(date, "ddddd");
                  const formattedDate = dayjs(date).format("YYYY-MM-DD");
                  setStart(formattedDate);
                  setStartDate(date);
                  setValShift({ ...valShift, start: "" });
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    error={valShift?.start ? true : false}
                    helperText={valShift.start}
                  />
                )}
              />
              <Typography
                variant="caption"
                component={"div"}
                color={"error"}
                sx={{ mt: -2 }}
              >
                {valShift.start ? valShift.start : ""}
              </Typography>

              <DatePicker
                label="End Date"
                sx={{ width: "100%", my: 2 }}
                value={endDate}
                onChange={(date) => {
                  const formattedDate = dayjs(date).format("YYYY-MM-DD");
                  setEnd(formattedDate);
                  setEndDate(date);
                  setValShift({ ...valShift, end: "" });
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    error={valShift?.end ? true : false}
                    helperText={valShift.end}
                  />
                )}
              />
              <Typography
                variant="caption"
                component={"div"}
                color={"error"}
                sx={{ mt: -2 }}
              >
                {valShift.end ? valShift.end : ""}
              </Typography>
            </LocalizationProvider>
          </Box>
          <Box
            sx={{
              px: 4,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              pb: 2,
            }}
          >
            <Button
              variant="outlined"
              sx={{
                mr: 2,
                borderColor: grey[400],
                color: grey[500],
                ":hover": {
                  background: grey[500],
                  borderColor: grey[500],
                  color: "white",
                },
              }}
              onClick={handleClose}
            >
              Cancel
            </Button>

            {circle ? (
              <LoadingButton loading variant="contained">
                Add
              </LoadingButton>
            ) : (
              <Button variant="contained" color="success" type="submit">
                Add
              </Button>
            )}
          </Box>
        </Box>
      </Box>
    </Modal>
  );
}

export default ExportAll;
