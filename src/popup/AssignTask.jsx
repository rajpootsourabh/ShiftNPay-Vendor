import React, { useEffect, useState } from 'react'
import { Box, Button, Checkbox, Divider, FormControl, FormControlLabel, FormGroup, IconButton, InputLabel, MenuItem, Modal, Select, TextField, Typography } from '@mui/material'
import { IoIosClose } from "react-icons/io";
import { grey } from '@mui/material/colors';
import axios from 'axios';
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


function AssignTask({ openModale, setOpenModale, user, setLoading, setSuccess, setError, setOpen, setCustomVariant, id, refresh, setRefresh }) {
    const options = { Authorization: `Bearer ${localStorage.getItem("shinpay-vendor-token")}`, "Content-Type": "application/json" };

    const [jobs, setJobs] = useState([])

    const [job, setJob] = useState('')
    const [valJob, setValJob] = useState('')

    const [circle, setCircle] = useState(false)

    const getAllJobs = async () => {
        return await axios.get(`${bashUrl}/job/get-all-jobs-id/${user?._id}`, { headers: options }).then((response) => {
            setJobs(response.data.result)
            // console.log("response: ", response?.data?.result);
            setLoading(false)
        }).catch((error) => {
            setLoading(false)
            console.log("error on getAllJobs: ", error);
        })
    }

    const handlClose = () => {
        setOpenModale(false)
        setJob("")
    }

    const handleChangeSelect = (evt) => {
        setJob(evt.target.value)
        setValJob('')
    }

    useEffect(() => {
        getAllJobs()
    }, [openModale])

    // console.log("job: ", job);
    const handlSubmit = async (evt) => {
        evt.preventDefault()
        if (!job) {
            setValJob("Please select job!")
        } else {
            setCircle(true)
            return await axios.post(`${bashUrl}/job/assign-job`, { id: user?._id, empId: id, jobId: job?._id }, { headers: options }).then((response) => {
                setLoading(true)
                setError("")
                setSuccess(response.data.msg)
                setCustomVariant("success")
                setOpen(true)
                setCircle(false)
                handlClose()
                setRefresh(!refresh)
            }).catch((error) => {
                setSuccess("")
                setError(error.response.data.msg)
                setCustomVariant("error")
                setOpen(true)
                setCircle(false)
                setLoading(false)
                console.log("error on handlSubmit: ", error);
            })
        }
    }
    return (
        <Modal keepMounted open={openModale} onClose={handlClose} aria-labelledby="keep-mounted-modal-title" aria-describedby="keep-mounted-modal-description">
            <Box sx={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "50%", bgcolor: "background.paper", boxShadow: 24, borderRadius: 2 }}>
                <Box component={'form'} noValidate onSubmit={handlSubmit}>
                    <Box sx={{ width: '100%', display: 'flex', height: 45, lineHeight: 45, px: 4, pt: 2 }} >
                        <Typography >Assign Job Employee</Typography>
                        <Box sx={{ flexGrow: 1 }} />
                        <IconButton onClick={handlClose} sx={{ width: 40, height: 40, marginTop: -1 }}><IoIosClose size={28} /> </IconButton>
                    </Box>
                    <Divider sx={{ width: '100%', color: 'black' }} />
                    <Box sx={{ mt: 1, px: 4, py: 2 }}>
                        <FormControl fullWidth sx={{ my: 1, background: 'white' }} error={valJob ? true : false} required>
                            <InputLabel id="demo-simple-select-label">Jobs</InputLabel>
                            <Select labelId="demo-simple-select-label" id="demo-simple-select" value={job?.name} label="Jobs" onChange={handleChangeSelect}>
                                {jobs?.map((item, ind) => {
                                    return (
                                        <MenuItem value={item} >{item?.name}</MenuItem>
                                    )
                                })}
                            </Select>
                        </FormControl>
                        <Typography variant='caption' component={'div'} color={'error'} sx={{ mt: -1 }}>{valJob ? valJob : ''}</Typography>
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

export default AssignTask