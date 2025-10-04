import { Box, Button, Checkbox, Divider, FormControlLabel, FormGroup, IconButton, Modal, TextField, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { IoIosClose } from "react-icons/io";
import { grey } from '@mui/material/colors';
import * as EmailValidator from 'email-validator';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { LoadingButton } from '@mui/lab';


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

function AddEmp({ openModale, setOpenModale, setLoading, setSuccess, setError, setOpen, setCustomVariant, user }) {
    const options = { Authorization: `Bearer ${localStorage.getItem("shinpay-vendor-token")}`, "Content-Type": "application/json" };
    // const [check, setCheck] = useState(false)

    const [circle, setCircle] = useState(false)

    const [email, setEmail] = useState('')
    const [isSent, setIsSent] = useState(true)

    const [emailVal, setEmailVal] = useState('')

    const handleChange = evt => {
        setEmail(evt.target.value)
        setEmailVal("")
    }

    const handlSubmit = async (evt) => {
        evt.preventDefault()
        if (!email) {
            setEmailVal("Please enter email!")
        } else if (!EmailValidator.validate(email)) {
            setEmailVal("Enter valid email!")
        } else {
            setLoading(true)
            setCircle(true)
            return await axios.post(`${bashUrl}/vendor/create-emp`, { id: user?._id, email: email, isSent: isSent }, { headers: options }).then((response) => {
                setError("")
                setSuccess(response.data.msg)
                setCustomVariant("success")
                setOpen(true)
                setLoading(false)
                setCircle(false)
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

    }, [openModale])

    const handlClose = () => {
        setOpenModale(false)
        setEmail("")
        setEmailVal("")
        // setIsSent(false)
    }


    // console.log("openModale: ", isSent);
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
                        <TextField value={email} type="email" id="outlined-basic" label="Email" variant="outlined" name="email" sx={{ my: 2 }} placeholder='Email' onChange={handleChange} error={emailVal ? true : false} fullWidth required />
                        <Typography variant='caption' component={'div'} color={'error'} sx={{ mt: -1 }}>{emailVal ? emailVal : ''}</Typography>

                        <FormGroup>
                            <FormControlLabel control={<Checkbox checked={isSent} color='success' />} label="Send an invite mail" onClick={() => setIsSent(!isSent)} />
                        </FormGroup>
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

export default AddEmp