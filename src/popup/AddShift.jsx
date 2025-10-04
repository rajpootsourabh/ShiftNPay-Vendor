import { Box, Button, Checkbox, Divider, FormControlLabel, FormGroup, IconButton, Modal, TextField, Typography } from '@mui/material'
import React, { useState } from 'react'
import { IoIosClose } from "react-icons/io";
import { grey } from '@mui/material/colors';
import * as EmailValidator from 'email-validator';
import axios from 'axios';
import { LoadingButton } from '@mui/lab';
import { useSelector } from 'react-redux';
import Stack from '@mui/material/Stack';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import moment from 'moment';


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
function AddShift({ openModale, setOpenModale, setLoading, setSuccess, setError, setOpen, setCustomVariant, refresh, setRefresh }) {
    const options = { Authorization: `Bearer ${localStorage.getItem("shinpay-vendor-token")}`, "Content-Type": "application/json" };
    const user = useSelector((state) => state.user.user);


    const [shift, setShift] = useState({
        name: '',
        start: '',
        end: ''
    })
    const [valShift, setValShift] = useState({
        name: '',
        start: '',
        end: ''
    })

    const [start, setStart] = useState(null);
    const [end, setEnd] = useState(null);

    const [circle, setCircle] = useState(false)


    /* const handleChange = evt => {
        setName(evt.target.value)
        setValName("")
    } */

    const handleOnChange = evt => {
        setShift({ ...shift, [evt.target.name]: evt.target.value })
    }

    const handlSubmit = async (evt) => {
        evt.preventDefault()
        if (!shift.name) {
            console.log("!shift.name");
            setValShift({ name: "Please enter shift name!" })
        } else if (!start) {
            console.log("!start");
            setValShift({ start: 'Please select start time!' })
        } else if (!end) {
            console.log("!end");
            setValShift({ end: 'Please enter end time!' })
        } else {
            setLoading(true)
            setCircle(true)
            return await axios.post(`${bashUrl}/shift/add`, { name: shift.name, start: start, end: end, userId: user?._id }, { headers: options }).then((response) => {
                setError("")
                setSuccess(response.data.msg)
                setCustomVariant("success")
                setOpen(true)
                setCircle(false)
                // setLoading(false)
                handlClose()
                setRefresh(!refresh)
            }).catch((error) => {
                setSuccess("")
                setError(error.response.data.msg)
                setCustomVariant("error")
                setOpen(true)
                setCircle(false)
                setLoading(false)
            })
        }
    }



    const handlClose = () => {
        setOpenModale(false)

        setShift({ name: '', start: '', end: '' })
        setValShift({ name: '', start: '', end: '' })
        setStart(null)
        setEnd(null)
    }


    // console.log("openModale: ", openModale);
    return (
        <Modal keepMounted open={openModale} onClose={handlClose} aria-labelledby="keep-mounted-modal-title" aria-describedby="keep-mounted-modal-description">
            <Box sx={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "50%", bgcolor: "background.paper", boxShadow: 24, borderRadius: 2 }}>
                <Box component={'form'} noValidate onSubmit={handlSubmit}>
                    <Box sx={{ width: '100%', display: 'flex', height: 45, lineHeight: 45, px: 4, pt: 2 }} >
                        <Typography >Add Shift</Typography>
                        <Box sx={{ flexGrow: 1 }} />
                        <IconButton onClick={handlClose} sx={{ width: 40, height: 40, marginTop: -1 }}><IoIosClose size={28} /> </IconButton>
                    </Box>

                    <Divider sx={{ width: '100%', color: 'black' }} />

                    <Box sx={{ mt: 1, px: 4, py: 2 }}>
                        {/* shift name */}
                        <TextField value={shift.name} type="text" id="outlined-basic" label="Shift Name" variant="outlined" name="name" sx={{ my: 2 }} placeholder='Shift Name' onChange={handleOnChange} error={valShift.name ? true : false} fullWidth required />
                        <Typography variant='caption' component={'div'} color={'error'} sx={{ mt: -1 }}>{valShift.name ? valShift.name : ''}</Typography>

                        {/* start time */}
                        {/* <TextField value={shift.name} type="text" id="outlined-basic" label="Shift Name" variant="outlined" name="name" sx={{ my: 2 }} placeholder='Shift Name' onChange={handleOnChange} error={valShift.name ? true : false} fullWidth required />
                        <Typography variant='caption' component={'div'} color={'error'} sx={{ mt: -1 }}>{valShift.name ? valShift.name : ''}</Typography> */}
                        <LocalizationProvider dateAdapter={AdapterMoment} error={valShift.start ? true : false}>
                            <Stack spacing={2} sx={{ my: 1 }} fullWidth error={valShift.start ? true : false}>
                                <TimePicker value={start} onChange={setStart} referenceDate={moment('2022-04-17')} />
                            </Stack>
                            <Typography variant='caption' component={'div'} color={'error'} sx={{ mt: -1 }}>{valShift.start ? valShift.start : ''}</Typography>
                        </LocalizationProvider>

                        {/* end time */}
                        {/* <TextField value={shift.name} type="text" id="outlined-basic" label="Shift Name" variant="outlined" name="name" sx={{ my: 2 }} placeholder='Shift Name' onChange={handleOnChange} error={valShift.name ? true : false} fullWidth required />
                        <Typography variant='caption' component={'div'} color={'error'} sx={{ mt: -1 }}>{valShift.name ? valShift.name : ''}</Typography> */}

                        <LocalizationProvider dateAdapter={AdapterMoment} sx={{ my: 2 }}>
                            <Stack spacing={2} sx={{ my: 2 }} fullWidth>
                                <TimePicker value={end} onChange={setEnd} referenceDate={moment('2022-04-17')} />
                            </Stack>
                            <Typography variant='caption' component={'div'} color={'error'} sx={{ mt: -1 }}>{valShift.end ? valShift.end : ''}</Typography>
                        </LocalizationProvider>

                    </Box>

                    <Box sx={{ px: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', pb: 2 }}>
                        <Button variant='outlined' sx={{ mr: 2, borderColor: grey[400], color: grey[500], ":hover": { background: grey[500], borderColor: grey[500], color: 'white' } }} onClick={handlClose} >Cancel</Button>
                        {/* <Button variant='contained' color='success' type='submit' >Add</Button> */}
                        {circle ? <LoadingButton loading variant="contained" sx={{}}>Add</LoadingButton> : <Button variant='contained' color='success' type='submit' >Add</Button>}
                    </Box>
                </Box>
            </Box>
        </Modal>
    )
}

export default AddShift