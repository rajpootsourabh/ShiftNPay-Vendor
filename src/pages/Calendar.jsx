import React, { useEffect, useState } from 'react'
import CalendarView from '../components/CalendarView'
import { Backdrop, Box, CircularProgress, FormControl, InputLabel, MenuItem, Paper, Select, Typography } from '@mui/material'
import { useSelector } from 'react-redux';
import axios from 'axios';
import CalendarViewText from '../components/CalendarViewText';
import CalendarViewText2 from '../components/CalendarViewText2';

const bashUrl = process.env.REACT_APP_BASH_URL;


function Calendar() {
    const options = { Authorization: `Bearer ${localStorage.getItem("shinpay-vendor-token")}`, "Content-Type": "application/json" };
    const user = useSelector((state) => state.user.user);

    const [staffs, setStaffs] = useState([])

    const [staff, setStaff] = useState('')
    const [valStaff, setValStaff] = useState('')


    const [open, setOpen] = useState(false);
    const [customVariant, setCustomVariant] = useState("success");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState();
    const [loading, setLoading] = useState(true);


    const getAllStaff = async () => {
        return await axios.get(`${bashUrl}/emp/get-by-vendor-id`, { headers: options }).then((response) => {
            setStaffs(response.data.result)
            setStaff(response.data.result[0])
            setLoading(false)
            // console.log("response: ", response.data.result);
        }).catch((error) => {
            setSuccess("")
            setError(error?.response?.data?.msg)
            setCustomVariant("error")
            // setOpen(true)
            setLoading(false)
        })
    }

    const handleChangeSelect = (evt) => {
        setStaff(evt.target.value)
    }

    useEffect(() => {
        getAllStaff()
    }, [loading])


    return (
        <Box>
            <Backdrop sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }} open={loading}>
                <CircularProgress color="inherit" />
            </Backdrop>

            {/* <Paper sx={{ borderRadius: 0, width: '100%', ml: 1, mb: 1 }}>
                <Box sx={{ width: '100%', height: 80, bgcolor: 'white', mt: 2, display: 'flex', alignItems: 'center', px: 2 }}>
                    <Box sx={{ width: '50%' }}>
                        <FormControl fullWidth sx={{ my: 1, background: 'white' }} error={valStaff ? true : false} required>
                            <InputLabel id="demo-simple-select-label">Select Employee Email</InputLabel>
                            <Select labelId="demo-simple-select-label" id="demo-simple-select" value={staff?.email} label="Select Employee Email" onChange={handleChangeSelect}>
                                {staffs.map((item, ind) => {
                                    return (<MenuItem key={ind} value={item}>{item?.email}</MenuItem>)
                                })}
                            </Select>
                        </FormControl>
                    </Box>
                </Box>
            </Paper> */}

            {/* <CalendarView staff={staff} /> */}
            <CalendarViewText staff={staff} />
            {/* <CalendarViewText2 staff={staff} /> */}
        </Box>
    )
}

export default Calendar