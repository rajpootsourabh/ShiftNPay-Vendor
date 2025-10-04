import { Box, Button, Divider, IconButton, Modal, TextField, Typography } from '@mui/material';
import { grey } from '@mui/material/colors';
import axios from 'axios';
import React, { useState } from 'react'
import { IoIosClose } from "react-icons/io";

const bashUrl = process.env.REACT_APP_BASH_URL;


function CahngePassword({ openModale, setOpenModale, user, setLoading, setSuccess, setError, setOpen, setCustomVariant }) {
    const options = { Authorization: `Bearer ${localStorage.getItem("shinpay-vendor-token")}`, "Content-Type": "application/json" };

    const [password, setPassword] = useState('')
    const [conPass, setConPass] = useState('')

    const [valPassword, setValPassword] = useState('')
    const [valConPass, setValConPass] = useState('')


    const handlClose = () => {
        setOpenModale(false)
        setPassword("")
        setConPass("")
    }

    // console.log("user: ", user);

    const handlSubmit = async (evt) => {
        evt.preventDefault()
        if (!password) {
            setValPassword("Password is required!")
        } else if (!conPass) {
            setValConPass("Confirm password is required!")
        } else if (password !== conPass) {
            setValConPass("Password and Confirm password are not match!")
        } else {
            setLoading(true)
            return await axios.post(`${bashUrl}/vendor/change-password`, { id: user, password: password }, { headers: options }).then((response) => {
                setError("")
                setSuccess(response.data.msg)
                setCustomVariant("success")
                setOpen(true)
                handlClose()
            }).catch((error) => {
                setLoading(false)
                setSuccess("")
                setError(error.response.data.msg)
                setCustomVariant("error")
                setOpen(true)
            })
        }
    }


    return (
        <Modal keepMounted open={openModale} onClose={handlClose} aria-labelledby="keep-mounted-modal-title" aria-describedby="keep-mounted-modal-description">
            <Box sx={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "50%", bgcolor: "background.paper", boxShadow: 24, borderRadius: 2 }}>
                <Box sx={{ width: '100%', display: 'flex', height: 45, lineHeight: 45, px: 4, pt: 2 }} >
                    <Typography >Change Password</Typography>
                    <Box sx={{ flexGrow: 1 }} />
                    <IconButton onClick={handlClose} sx={{ width: 40, height: 40, marginTop: -1 }}><IoIosClose size={28} /> </IconButton>
                </Box>
                <Divider sx={{ width: '100%', color: 'black' }} />
                <Box component={'form'} noValidate onSubmit={handlSubmit}>
                    <Box sx={{ mt: 1, px: 4, py: 2 }}>
                        {/* plan title */}
                        <TextField value={password} type="password" id="outlined-basic" label="Password" variant="outlined" name="password" sx={{ my: 2 }} placeholder='Password' onChange={(e) => { setPassword(e.target.value); setValPassword("") }} error={valPassword ? true : false} fullWidth required />
                        <Typography variant='caption' component={'div'} color={'error'} sx={{ mt: -1 }}>{valPassword ? valPassword : ''}</Typography>


                        <TextField value={conPass} type="password" id="outlined-basic" label="Confirm Password" variant="outlined" name="conPass" sx={{ my: 2 }} placeholder='Confirm Password' onChange={(e) => { setConPass(e.target.value); setValConPass("") }} error={valConPass ? true : false} fullWidth required />
                        <Typography variant='caption' component={'div'} color={'error'} sx={{ mt: -1 }}>{valConPass ? valConPass : ''}</Typography>
                    </Box>

                    <Box sx={{ px: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', pb: 2 }}>
                        <Button variant='outlined' sx={{ mr: 2, borderColor: grey[400], color: grey[500], ":hover": { background: grey[500], borderColor: grey[500], color: 'white' } }} onClick={handlClose} >Cancel</Button>
                        <Button variant='contained' color='success' type='submit' >Add</Button>
                    </Box>
                </Box>
            </Box>
        </Modal>
    )
}

export default CahngePassword