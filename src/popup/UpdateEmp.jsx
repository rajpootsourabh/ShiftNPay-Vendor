import { Backdrop, Box, Button, Checkbox, CircularProgress, Divider, FormControl, Grid, IconButton, InputLabel, ListItemText, MenuItem, Modal, Paper, Select, TextField, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { IoIosClose } from "react-icons/io";
import { grey } from '@mui/material/colors';
import * as EmailValidator from 'email-validator';
import axios from 'axios';
import './imageStyle.css'
import OutlinedInput from '@mui/material/OutlinedInput';
import { useSelector } from 'react-redux';

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

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            width: 250,
        },
    },
};

const names = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
];

const bashUrl = process.env.REACT_APP_BASH_URL;
const basImgUrl = process.env.REACT_APP_BASH_IMG_URL;
function UpdateEmp({ openModale, setOpenModale, setLoading, setSuccess, setError, setOpen, setCustomVariant, refresh, setRefresh, empUpdate, setEmpUpdate,user }) {
    const options = { Authorization: `Bearer ${localStorage.getItem("shinpay-vendor-token")}`, "Content-Type": "multipart/form-data" };

    // console.log("empUpdate: ", empUpdate);
    const [circul, setCircul] = useState(false)

    const [loader, setLoader] = useState(true)

    const [personName, setPersonName] = React.useState([]);

    const [imagePreview, setImagePreview] = useState('')
    const [emp, setEmp] = useState({
        name: '',
        email: '',
        image: '',
        weekStart: '',
        capacity: '',
        rate: ''
    })

    const [valEmp, setValEmp] = useState({
        name: '',
        email: '',
        image: '',
        weekStart: '',
        capacity: '',
        rate: '',
        days: ''
    })

    const getSingleEmp = async () => {
        return await axios.get(`${bashUrl}/emp/get-by-id/${empUpdate}`, { headers: options }).then((response) => {
            let result = response.data.result
            let getWorkingDays = result.workingDays.map((item) => item.name)
            setPersonName(getWorkingDays)
            setEmp({
                name: result?.name,
                email: result?.email,
                image: `${basImgUrl}/empProfile/${result?.profile}`,
                weekStart: result?.weekStart,
                capacity: result?.capacity,
                rate: result?.rate
            })
            setLoader(false)
        }).catch((error) => {
            console.log("error on getSingleEmp: ", error);
            setLoader(false)
        })
    }


    const handleChange = evt => {
        setEmp({ ...emp, [evt.target.name]: evt.target.value })
        setValEmp({
            name: '',
            email: '',
            image: '',
            weekStart: '',
            capacity: '',
            rate: '',
            days: ''
        })
    }

    const handleOnImageChange = (evt) => {
        setImagePreview(URL.createObjectURL(evt.target.files[0]))
        setEmp({ ...emp, image: evt.target.files[0] })
    }

    const handleChangeSelect = evt => {
        setEmp({ ...emp, weekStart: evt.target.value })
        setValEmp({
            name: '',
            email: '',
            image: '',
            weekStart: '',
            capacity: '',
            rate: '',
            days: ''
        })
    }

    const handleChangeSelection = (event) => {
        setValEmp({ ...valEmp, days: '' })
        const { target: { value }, } = event;
        setPersonName(typeof value === 'string' ? value.split(',') : value);
    };


    useEffect(() => {
        getSingleEmp()
    }, [loader, openModale])

    const handlSubmit = async (evt) => {
        evt.preventDefault()
        if (!emp.name) {
            setValEmp({ name: "Name is required!" })
        } else if (!emp.email) {
            setValEmp({ email: "Email is required!" })
        } else if (!EmailValidator.validate(emp.email)) {
            setValEmp({ email: "Invalid email!" })
        } else if (!emp.weekStart) {
            console.log("here week start");
            setValEmp({ weekStart: "Start day of week is required!" })
        } else if (personName.length <= 0) {
            setValEmp({ days: "Working days are required!" })
        } else if (!emp.capacity) {
            setValEmp({ capacity: "Daily work capacity is required!" })
        } else {
            setCircul(true)
            setLoading(true)
            const formDate = new FormData()
            formDate.append("empId", empUpdate)
            formDate.append("id", user?._id)
            if (imagePreview) {
                formDate.append("image", emp.image)
            }
            formDate.append("name", emp.name)
            formDate.append("weekStart", emp.weekStart)
            formDate.append("days", personName)
            formDate.append("capacity", emp.capacity)
            formDate.append("rate", emp.rate || "")

            return await axios.post(`${bashUrl}/emp/updaet-emp-by-vender`, formDate, { headers: options }).then((response) => {
                setPersonName([])
                setError("")
                setSuccess(response.data.msg)
                setCustomVariant('success')
                handlClose()
                setOpen(true)
                setLoading(false)
                setCircul(false)
                setRefresh(!refresh)
            }).catch((err) => {
                console.log("error on handlSubmit: ", err);
                setLoading(false)
                setSuccess("")
                setError(err?.response?.data?.msg)
                setCustomVariant("error")
                setOpen(true)
                setCircul(false)
            })
        }

    }

    const handlClose = () => {
        setOpenModale(false)
        setImagePreview("")
        setEmp({
            name: '',
            email: '',
            image: '',
            weekStart: '',
            capacity: '',
            rate: ''
        })
        setPersonName([])
    }

    return (
        <Modal keepMounted open={openModale} onClose={handlClose} aria-labelledby="keep-mounted-modal-title" aria-describedby="keep-mounted-modal-description">
            {/* <Backdrop sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }} open={loader}>
                <CircularProgress color="inherit" />
            </Backdrop> */}
            <Box sx={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "50%", bgcolor: "background.paper", boxShadow: 24, borderRadius: 2 }}>
                <Box component={'form'} noValidate onSubmit={handlSubmit}>
                    <Box sx={{ width: '100%', display: 'flex', height: 45, lineHeight: 45, px: 4, pt: 2 }} >
                        <Typography >Update Employee</Typography>
                        <Box sx={{ flexGrow: 1 }} />
                        <IconButton onClick={handlClose} sx={{ width: 40, height: 40, marginTop: -1 }}><IoIosClose size={28} /> </IconButton>
                    </Box>
                    <Divider sx={{ width: '100%', color: 'black' }} />
                    <Box sx={{ mt: 1, px: 4, py: 2 }}>
                        <Grid spacing={2} container>
                            <Grid item xs={6}>
                                <Box sx={{ width: '100%', height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed grey', borderRadius: 1 }}>
                                    <img src={imagePreview ? imagePreview : emp.image} alt={''} style={{ width: '100%', height: '100%' }} />
                                </Box>
                            </Grid>
                            <Grid item xs={6}>
                                <Box sx={{ width: '100%', height: 100, display: 'flex', alignItems: 'center', }}>
                                    <Paper sx={{ bgcolor: "rgba(16, 138, 0, 1)", ":hover": { bgcolor: "#116211", cursor: 'pointer' }, width: '70%', height: 50, transition: 'background-color 0.5s ease', }}>
                                        <label htmlFor='empProfile' style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>UPLOAD IMAGE</label>
                                    </Paper>
                                    <input type='file' onChange={handleOnImageChange} id={'empProfile'} style={{ display: 'none' }} />
                                </Box>
                            </Grid>
                        </Grid>

                        <TextField value={emp.name} type="text" id="outlined-basic" label="Name" variant="outlined" name="name" sx={{ my: 2 }} placeholder='Employee Name' onChange={handleChange} error={valEmp.name ? true : false} fullWidth required />
                        <Typography variant='caption' component={'div'} color={'error'} sx={{ mt: -1 }}>{valEmp.name ? valEmp.name : ''}</Typography>

                        <TextField value={emp.email} type="email" id="outlined-basic" label="Email" variant="outlined" name="email" sx={{ my: 2 }} placeholder='Employee Email' onChange={handleChange} error={valEmp.email ? true : false} fullWidth required disabled />
                        <Typography variant='caption' component={'div'} color={'error'} sx={{ mt: -1 }}>{valEmp.email ? valEmp.email : ''}</Typography>


                        <Box sx={{ width: '100%' }}>
                            <FormControl fullWidth sx={{ my: 1, background: 'white' }} error={valEmp.weekStart ? true : false} required>
                                <InputLabel id="demo-simple-select-label">Week Start</InputLabel>
                                <Select labelId="demo-simple-select-label" id="demo-simple-select" value={emp.weekStart} label="Week Start" onChange={handleChangeSelect}>
                                    <MenuItem value={'Monday'}>Monday</MenuItem>
                                    <MenuItem value={'Tuesday'}>Tuesday</MenuItem>
                                    <MenuItem value={'Wednesday'}>Wednesday</MenuItem>
                                    <MenuItem value={'Thursday'}>Thursday</MenuItem>
                                    <MenuItem value={'Friday'}>Friday</MenuItem>
                                    <MenuItem value={'Saturday'}>Saturday</MenuItem>
                                    <MenuItem value={'Sunday'}>Sunday</MenuItem>
                                </Select>
                            </FormControl>
                            <Typography variant='caption' component={'div'} color={'error'} sx={{ mt: -1 }}>{valEmp.weekStart ? valEmp.weekStart : ''}</Typography>
                        </Box>

                        <Box>
                            <FormControl sx={{ my: 2, width: '100%' }} error={valEmp.days ? true : false}>
                                <InputLabel id="demo-multiple-checkbox-label">Working Days</InputLabel>
                                <Select labelId="demo-multiple-checkbox-label" id="demo-multiple-checkbox" multiple value={personName} onChange={handleChangeSelection} input={<OutlinedInput label="Working Days" />} renderValue={(selected) => selected.join(', ')} MenuProps={MenuProps}>
                                    {names.map((name) => (
                                        <MenuItem key={name} value={name}>
                                            <Checkbox checked={personName.indexOf(name) > -1} />
                                            <ListItemText primary={name} />
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <Typography variant='caption' component={'div'} color={'error'} sx={{ mt: -1 }}>{valEmp.days ? valEmp.days : ''}</Typography>
                        </Box>

                        <TextField value={emp.capacity} type="number" id="outlined-basic" label="Daily work capacity" variant="outlined" name="capacity" sx={{ my: 2 }} placeholder='Daily work capacity' onChange={handleChange} error={valEmp.capacity ? true : false} fullWidth required />
                        <Typography variant='caption' component={'div'} color={'error'} sx={{ mt: -1 }}>{valEmp.capacity ? valEmp.capacity : ''}</Typography>

                        <TextField value={emp.rate} type="number" id="outlined-basic" label="Rate/Hour" variant="outlined" name="rate" sx={{ my: 2 }} placeholder='Rate/Hour' onChange={handleChange} error={valEmp.rate ? true : false} fullWidth required />
                        <Typography variant='caption' component={'div'} color={'error'} sx={{ mt: -1 }}>{valEmp.rate ? valEmp.rate : ''}</Typography>

                    </Box>

                    <Box sx={{ px: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', pb: 2 }}>
                        <Button variant='outlined' sx={{ mr: 2, borderColor: grey[400], color: grey[500], ":hover": { background: grey[500], borderColor: grey[500], color: 'white' } }} onClick={handlClose} >Cancel</Button>
                        <Box sx={{ m: 1, position: 'relative' }}>
                            {circul ? <CircularProgress size={24} sx={{ color: grey[500], position: 'absolute' }} /> : <Button variant='contained' color='success' type='submit' >Add</Button>}
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Modal>
    )
}

export default UpdateEmp