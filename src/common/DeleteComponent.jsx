import { Box, Button, CircularProgress, Divider, IconButton, Modal, Typography } from '@mui/material'
import React, { useState } from 'react'
import { IoIosClose } from "react-icons/io";
import { grey } from '@mui/material/colors';
// import * as EmailValidator from 'email-validator';
import axios from 'axios';
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



const bashUrl = process.env.REACT_APP_BASH_URL;
function DeleteComponent({ openModale, setOpenModale, setLoading, setSuccess, setError, setOpen, setCustomVariant, data, setData, refresh, setRefresh }) {
    const options = { Authorization: `Bearer ${localStorage.getItem("shinpay-vendor-token")}`, "Content-Type": "application/json" };
    const user = useSelector((state) => state.user.user);

    const [circul, setCircul] = useState(false)

    // const [loading, setLoading] = useState(false)

    const handlClose = () => {
        setOpenModale(false)
        setData("")
    }


    const handlSubmit = async (evt) => {
        evt.preventDefault()
        if (data.type == 'job') {
            setCircul(true)
            return await axios.delete(`${bashUrl}/job/delete-job/${data.id}`, { headers: options }).then((response) => {
                setError("")
                setSuccess(response.data.msg)
                setCustomVariant("success")
                setOpen(true)
                setLoading(true)
                setCircul(false)
                handlClose()
            }).catch((error) => {
                setSuccess("")
                setError(error.response.data.msg)
                setCustomVariant("error")
                setOpen(true)
                setCircul(false)
            })
        } else if (data.type == 'emp') {
            setCircul(true)
            return await axios.delete(`${bashUrl}/emp/delete-emp/${data.id}`, { venderId: 1, empId: 1 }, { headers: options }).then((response) => {
                setError("")
                setSuccess(response.data.msg)
                setCustomVariant("success")
                setOpen(true)
                setLoading(true)
                setCircul(false)
                handlClose()
            }).catch((error) => {
                setSuccess("")
                setError(error.response.data.msg)
                setCustomVariant("error")
                setOpen(true)
                setCircul(false)
            })
        } else if (data.type == 'empJob') {
            setCircul(true)
            // console.log("data: ", data);
            return await axios.post(`${bashUrl}/emp/remove-job-from-emp`, { id: data.id, jobId: data.jobId }, { headers: options }).then((response) => {
                setError("")
                setSuccess(response.data.msg)
                setCustomVariant("success")
                setOpen(true)
                setLoading(true)
                setCircul(false)
                handlClose()
            }).catch((err) => {
                setSuccess("")
                setError(err.response.data.msg)
                setCustomVariant("error")
                setOpen(true)
                setCircul(false)
            })
        } else if (data.type == 'shift') {
            setCircul(true)
            return await axios.delete(`${bashUrl}/shift/delete/${data.id}`, { headers: options }).then((response) => {
                setError("")
                setSuccess(response.data.msg)
                setCustomVariant("success")
                setOpen(true)
                setLoading(true)
                setCircul(false)
                handlClose()
            }).catch((err) => {
                setSuccess("")
                setError(err.response.data.msg)
                setCustomVariant("error")
                setOpen(true)
                setCircul(false)
            })
        } else if (data.type == 'deAssign') {
            // console.log("data: ", data);
            setCircul(true)
            return await axios.post(`${bashUrl}/shift/remove-assign`, data, { headers: options }).then((response) => {
                setError("")
                setSuccess(response.data.msg)
                setCustomVariant("success")
                setOpen(true)
                setLoading(true)
                setCircul(false)
                setRefresh(!refresh)
                handlClose()
            }).catch((err) => {
                setSuccess("")
                setError(err.response.data.msg)
                setCustomVariant("error")
                setOpen(true)
                setCircul(false)
            })
        } else if (data.type == 'state') {
            setCircul(true)
            return await axios.delete(`${bashUrl}/state/delete-state/${data.id}`, { headers: options }).then((response) => {
                setError("")
                setSuccess(response.data.msg)
                setCustomVariant("success")
                setOpen(true)
                setLoading(true)
                setCircul(false)
                setRefresh(!refresh)
                handlClose()
            }).catch((err) => {
                setSuccess("")
                setError(err.response.data.msg)
                setCustomVariant("error")
                setOpen(true)
                setCircul(false)
            })
        }
    }

    return (
        <Modal keepMounted open={openModale} onClose={handlClose} aria-labelledby="keep-mounted-modal-title" aria-describedby="keep-mounted-modal-description">
            <Box sx={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "50%", bgcolor: "background.paper", boxShadow: 24, borderRadius: 2 }}>
                <Box /* component={'form'} noValidate onSubmit={handlSubmit} */>
                    <Box sx={{ width: '100%', display: 'flex', height: 45, lineHeight: 45, px: 4, pt: 2 }} >
                        <Typography sx={{ textTransform: 'capitalize' }}>Delete {data.type}</Typography>
                        <Box sx={{ flexGrow: 1 }} />
                        <IconButton onClick={handlClose} sx={{ width: 40, height: 40, marginTop: -1 }}><IoIosClose size={28} /> </IconButton>
                    </Box>
                    <Divider sx={{ width: '100%', color: 'black' }} />
                    <Box sx={{ mt: 1, px: 4, py: 2, alignItems: 'center', justifyContent: 'center', display: 'flex' }}>
                        <Typography color={'error'}>Are you sure to delete {data.title}</Typography>
                    </Box>

                    <Box sx={{ px: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', pb: 2 }}>
                        <Button variant='outlined' sx={{ mr: 2, borderColor: grey[400], color: grey[500], ":hover": { background: grey[500], borderColor: grey[500], color: 'white' } }} onClick={handlClose} >Cancel</Button>
                        <Box sx={{ m: 1, position: 'relative' }}>
                            {circul ? <CircularProgress size={24} sx={{ color: grey[500], position: 'absolute', top: '50%', left: '50%', marginTop: '-12px' }} /> : <Button variant='contained' color='error' type='submit' onClick={handlSubmit} >Delete</Button>}
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Modal>
    )
}

export default DeleteComponent