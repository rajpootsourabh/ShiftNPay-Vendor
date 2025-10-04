import { Box, Button, Divider, IconButton, Modal, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { IoIosClose } from "react-icons/io";
import axios from 'axios';
import { LoadingButton } from '@mui/lab';
import { useSelector } from 'react-redux';
import Stack from '@mui/material/Stack';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import moment from 'moment';

const EditShift = ({ openModale, setOpenModale, setLoading, setSuccess, setError, setOpen, setCustomVariant, refresh, setRefresh, shiftId }) => {
    console.log(shiftId,'shiftId')
    const options = { Authorization: `Bearer ${localStorage.getItem("shinpay-vendor-token")}`, "Content-Type": "application/json" };
    const user = useSelector((state) => state.user.user);

    const [start, setStart] = useState( shiftId?.start);
    const [end, setEnd] = useState( shiftId?.end);
    const [loading, setLoadingState] = useState(false);

    const handleSubmit = async (evt) => {
        evt.preventDefault();
        if (!start || !end) {
            setError("Please select both start and end times!");
            setOpen(true);
            return;
        }

        setLoading(true);
        setLoadingState(true);
        try {
            const response = await axios.put(`${process.env.REACT_APP_BASH_URL}/shift/update/${shiftId?._id}`, { start, end, userId: user?._id }, { headers: options });
            setSuccess(response.data.msg);
            setCustomVariant("success");
            setOpen(true);
            setRefresh(!refresh);
            handleClose();
        } catch (error) {
            setError(error.response?.data?.msg || "Error updating shift");
            setCustomVariant("error");
            setOpen(true);
        } finally {
            setLoading(false);
            setLoadingState(false);
        }
    };

    const handleClose = () => {
        setOpenModale(false);
        setStart(null);
        setEnd(null);
    };
   
    return (
        <Modal open={openModale} onClose={handleClose}>
            <Box sx={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 400, bgcolor: "background.paper", boxShadow: 24, borderRadius: 2, p: 3 }}>
                <Typography variant="h6">Edit Shift</Typography>
                <IconButton onClick={handleClose} sx={{ position: "absolute", right: 8, top: 8 }}>
                    <IoIosClose size={24} />
                </IconButton>
                <Divider sx={{ my: 2 }} />
                <LocalizationProvider dateAdapter={AdapterMoment}>
                    <Stack spacing={2}>
                        <TimePicker label="Start Time" value={moment(start)} onChange={(newValue) => setStart(newValue)} />
                        <TimePicker label="End Time" value={moment(end)} onChange={(newValue) => setEnd(newValue)} />
                    </Stack>
                </LocalizationProvider>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                    <Button onClick={handleClose} variant="outlined" sx={{ mr: 2 }}>Cancel</Button>
                    {loading ? <LoadingButton loading variant="contained">Save</LoadingButton> : <Button onClick={handleSubmit} variant="contained" color="primary">Save</Button>}
                </Box>
            </Box>
        </Modal>
    );
};

export default EditShift;
