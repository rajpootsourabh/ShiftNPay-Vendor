import { Box, Button, Checkbox, Divider, FormControlLabel, FormGroup, IconButton, Modal, TextField, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { IoIosClose } from "react-icons/io";
import { grey } from '@mui/material/colors';
import * as EmailValidator from 'email-validator';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { LoadingButton } from '@mui/lab';
import { validateMobileNumber } from '../utils/valInput';
import { useParams } from 'react-router-dom';



const bashUrl = process.env.REACT_APP_BASH_URL;
function AddState({ setOpenModale, openModale, setLoading, setSuccess, setError, setOpen, setCustomVariant, setRefresh, refresh }) {
    const options = { Authorization: `Bearer ${localStorage.getItem("shinpay-vendor-token")}`, "Content-Type": "application/json" };
    // const [check, setCheck] = useState(false)
    const user = useSelector((state) => state.user.user);

    const { id } = useParams()

    const [circle, setCircle] = useState(false)

    const [provins, setProvins] = useState({
        name: '',
        weekHours: '',
        dayHours: '',
        userId: user?._id,
    })

    const [valProvins, setValProvins] = useState({
        name: '',
        weekHours: '',
        dayHours: ''
    })

    const getSingleState = async () => {
        return await axios.get(`${bashUrl}/state/get-by-id/${id}`, { headers: options }).then((response) => {
            setProvins(response.data.result)
            setLoading(false)
        }).catch((error) => {
            setLoading(false)
            console.log("error on getSingleState: ", error);
        })
    }

    const handleChange = evt => {
        setProvins({ ...provins, [evt.target.name]: evt.target.value })
        setValProvins({
            name: '',
            weekHours: '',
            dayHours: ''
        })
    }

    const handlSubmit = async (evt) => {
        evt.preventDefault()
        if (!provins.name) {
            setValProvins({ name: "Please enter state name!" })
        } else if (!provins.weekHours) {
            setValProvins({ weekHours: "Please enter week hours!" })
        } else if (!validateMobileNumber(provins.weekHours)) {
            setValProvins({ weekHours: "Please enter valid week hours!" })
        } else {
            setCircle(true)
            return await axios.post(`${bashUrl}/state/add-state`, provins, { headers: options }).then((response) => {
                setError("")
                setSuccess(response.data.msg)
                setCustomVariant("success")
                setOpen(true)
                setLoading(false)
                setCircle(false)
                setRefresh(!refresh)
                // setIsSent(false)
                handlClose()
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

    useEffect(() => {
        setProvins({ ...provins, userId: user?._id })
        if (id) {
            getSingleState()
        }
    }, [openModale])

    const handlClose = () => {
        setOpenModale(false)
        setProvins({
            name: '',
            weekHours: '',
            dayHours: ''
        })
        setValProvins({
            name: '',
            weekHours: '',
            dayHours: ''
        })
        // setIsSent(false)
    }


    return (
        <Modal keepMounted open={openModale} onClose={handlClose} aria-labelledby="keep-mounted-modal-title" aria-describedby="keep-mounted-modal-description">
            <Box sx={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "50%", bgcolor: "background.paper", boxShadow: 24, borderRadius: 2 }}>
                <Box component={'form'} noValidate onSubmit={handlSubmit}>
                    <Box sx={{ width: '100%', display: 'flex', height: 45, lineHeight: 45, px: 4, pt: 2 }} >
                        <Typography >Add Employee</Typography>
                        <Box sx={{ flexGrow: 1 }} />
                        <IconButton onClick={handlClose} sx={{ width: 40, height: 40, marginTop: -1 }}><IoIosClose size={28} /> </IconButton>
                    </Box>
                    <Divider sx={{ width: '100%', color: 'black' }} />
                    <Box sx={{ mt: 1, px: 4, py: 2 }}>
                        {/* plan title */}
                        <TextField value={provins.name} type="text" id="outlined-basic" label="State Name" variant="outlined" name="name" sx={{ my: 2 }} placeholder='State Name' onChange={handleChange} error={valProvins.name ? true : false} fullWidth required />
                        <Typography variant='caption' component={'div'} color={'error'} sx={{ mt: -1 }}>{valProvins.name ? valProvins.name : ''}</Typography>

                        <TextField value={provins.weekHours} type="number" id="outlined-basic" label="Week Hours" variant="outlined" name="weekHours" sx={{ my: 2 }} placeholder='Week Hours' onChange={handleChange} error={valProvins.weekHours ? true : false} fullWidth required inputProps={{ min: 0 }} />
                        <Typography variant='caption' component={'div'} color={'error'} sx={{ mt: -1 }}>{valProvins.weekHours ? valProvins.weekHours : ''}</Typography>

                        <TextField value={provins.dayHours} type="number" id="outlined-basic" label="Day Hours" variant="outlined" name="dayHours" sx={{ my: 2 }} placeholder='Day Hours' onChange={handleChange} error={valProvins.dayHours ? true : false} fullWidth inputProps={{ min: 0 }} />
                        <Typography variant='caption' component={'div'} color={'error'} sx={{ mt: -1 }}>{valProvins.dayHours ? valProvins.dayHours : ''}</Typography>

                    </Box>

                    <Box sx={{ px: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', pb: 2 }}>
                        <Button variant='outlined' sx={{ mr: 2, borderColor: grey[400], color: grey[500], ":hover": { background: grey[500], borderColor: grey[500], color: 'white' } }} onClick={handlClose} >Cancel</Button>

                        {circle ? <LoadingButton loading variant="contained" sx={{}}>Add</LoadingButton> : <Button variant='contained' color='success' type='submit' >Add</Button>}
                    </Box>
                </Box>
            </Box>
        </Modal>
    )
}

export default AddState