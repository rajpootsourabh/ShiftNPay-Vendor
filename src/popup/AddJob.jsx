import {
  Box,
  Button,
  Divider,
  IconButton,
  Modal,
  TextField,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";

import React, { useEffect, useState } from "react";
import { IoIosClose } from "react-icons/io";
import { grey } from "@mui/material/colors";
import * as EmailValidator from "email-validator";
import axios from "axios";
import { LoadingButton } from "@mui/lab";
import { useSelector } from "react-redux";
import moment from "moment";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 500,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
};

const bashUrl = process.env.REACT_APP_BASH_URL;
function AddJob({
  openModale,
  setOpenModale,
  setLoading,
  setSuccess,
  setError,
  setOpen,
  setCustomVariant,
  refresh,
  setRefresh,
  user,
}) {
  const options = {
    Authorization: `Bearer ${localStorage.getItem("shinpay-vendor-token")}`,
    "Content-Type": "application/json",
  };

  const [name, setName] = useState("");
  const [shifts, setShifts] = useState([]);
  const [valName, setValName] = useState("");
  const [shiftError, setShiftError] = useState("");

  const [overtimeAllowed, setOvertimeAllowed] = useState("");
  const [selectedShift, setSelectedShift] = useState("");
  const [circle, setCircle] = useState(false);

  const handleChange = (evt) => {
    setName(evt.target.value);
    setValName("");
  };

  const handleOvertimeChange = (evt) => {
    setOvertimeAllowed(evt.target.value);
    setShiftError("")
  };

  const handleShiftChange = (evt) => {
    setSelectedShift(evt.target.value);
  };
  const handlSubmit = async (evt) => {
    evt.preventDefault();
    if (!name) {
      setValName("Please enter job name!");
    }else if (!selectedShift) {
      setShiftError("Please Select Shift Time for the Job!");
    } else  {
      setLoading(true);
      setCircle(true);
      return await axios
        .post(
          `${bashUrl}/job/add-job`,
          { id: user?._id, name: name, overtimeAllowed ,selectedShift},
          { headers: options }
        )
        .then((response) => {
          setError("");
          setSuccess(response.data.msg);
          setCustomVariant("success");
          setOpen(true);
          setCircle(false);
          // setLoading(false)
          handlClose();
          setRefresh(!refresh);
        })
        .catch((error) => {
          setSuccess("");
          setError(error.response.data.msg);
          setCustomVariant("error");
          setOpen(true);
          setCircle(false);
          setLoading(false);
        });
    }
  };

  const handlClose = () => {
    setOpenModale(false);
    setName("");
    setValName("");
    setShiftError("");
    
    setOvertimeAllowed("");
    setSelectedShift("");
  };

  const getAllShifts = async () => {
    return await axios
      .get(`${bashUrl}/shift/get-all`, { headers: options })
      .then((response) => {
        setShifts(response.data.result);
      })
      .catch((error) => {
        setSuccess("");
        setError(error.response.data.msg);
        setCustomVariant("error");
      });
  };

  useEffect(() => {
    getAllShifts();
  }, []);

  // console.log("openModale: ", openModale);
  return (
    <Modal
      keepMounted
      open={openModale}
      onClose={handlClose}
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
        <Box component={"form"} noValidate onSubmit={handlSubmit}>
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
            <Typography>Add Jobs</Typography>
            <Box sx={{ flexGrow: 1 }} />
            <IconButton
              onClick={handlClose}
              sx={{ width: 40, height: 40, marginTop: -1 }}
            >
              <IoIosClose size={28} />{" "}
            </IconButton>
          </Box>
          <Divider sx={{ width: "100%", color: "black" }} />
          <Box sx={{ mt: 1, px: 4, py: 2 }}>
            {/* plan title */}
            <TextField
              value={name}
              type="text"
              id="outlined-basic"
              label="Job Name"
              variant="outlined"
              name="name"
              sx={{ my: 2 }}
              placeholder="Job Name"
              onChange={handleChange}
              error={valName ? true : false}
              fullWidth
              required
            />
            <Typography
              variant="caption"
              component={"div"}
              color={"error"}
              sx={{ mt: -1 }}
            >
              {valName ? valName : ""}
            </Typography>
            <FormControl fullWidth sx={{ my: 2 }}>
              <InputLabel id="overtime-allowed-label">
                Over Time Allowed
              </InputLabel>
              <Select
                labelId="overtime-allowed-label"
                id="overtime-allowed"
                value={overtimeAllowed}
                onChange={handleOvertimeChange}
                label="Over Time Allowed"
                required
              >
                <MenuItem value={"yes"}>Yes</MenuItem>
                <MenuItem value={"no"}>No</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth sx={{ my: 2 }}>
              <InputLabel id="shift-select-label">Select Shift</InputLabel>
              <Select
                labelId="shift-select-label"
                id="overtime-allowed"
                value={selectedShift}
                onChange={handleShiftChange}
                label="Select Shift"
                error={shiftError ? true : false}
                required
              >
                 <MenuItem value={""}>Select</MenuItem>
                {shifts.map((shift) => (
                  <MenuItem key={shift._id} value={shift._id}>
                    {`${shift.name} - [ ${moment(shift?.start).format('hh:mm:ss A')} - ${moment(shift?.end).format('hh:mm:ss A')} ]`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
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
              onClick={handlClose}
            >
              Cancel
            </Button>
            {/* <Button variant='contained' color='success' type='submit' >Add</Button> */}
            {circle ? (
              <LoadingButton loading variant="contained" sx={{}}>
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

export default AddJob;
