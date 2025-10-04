import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import MuiAlert from "@mui/material/Alert";
import { Avatar, Backdrop, Box, Button, Chip, CircularProgress, Divider, Grid, IconButton, Paper, Snackbar, Table, TableBody, TableCell, TableHead, TableRow, Toolbar, Tooltip, Typography } from '@mui/material';
import moment from 'moment';
import { MdDeleteForever } from "react-icons/md";
import AssignTask from '../popup/AssignTask';
import DeleteComponent from '../common/DeleteComponent';

// Alert notification of MUI
const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const bashUrl = process.env.REACT_APP_BASH_URL;
const basImgUrl = process.env.REACT_APP_BASH_IMG_URL;

function EmpDetails({ user, setMenu }) {
    const options = { Authorization: `Bearer ${localStorage.getItem("shinpay-vendor-token")}`, "Content-Type": "application/json" };
    const { id } = useParams()

    const [emp, setEmp] = useState('')

    const [jobs, setJobs] = useState([])
    const [shifts, setShifts] = useState([])

    const [openDelete, setOpenDelete] = useState(false)
    const [data, setData] = useState({
        type: 'empJob',
        id: '',
        title: '',
        jobId: ''
    })


    const [open, setOpen] = useState(false);
    const [customVariant, setCustomVariant] = useState("success");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState();

    const [loading, setLoading] = useState(true);
    const [refresh, setRefresh] = useState(false);

    // state of open assign job to emp
    const [assignOpen, setAssignOpen] = useState(false)


    // let result = emp?.workingDays?.map((item) => item.name)

    // console.log("result: ", typeof result === 'string' ? result.split(',') : result);

    const getSingleEmp = async () => {
        return await axios.get(`${bashUrl}/emp/get-by-id/${id}`, { headers: options }).then((response) => {
            setEmp(response.data.result)
            setLoading(false)
            setJobs(response.data.result?.jobId)

            console.log("response: ", response.data.result);
        }).catch((error) => {
            console.log("error on getSingleEmp: ", error);
            setSuccess("")
            setError(error.response.data.msg)
            setCustomVariant("error")
            setOpen(true)
            setLoading(false)
        })
    }

    useEffect(() => {
        getSingleEmp()
    }, [loading, refresh])
    // console.log("emp: ", emp);
    return (
        <Box>
            <Snackbar open={open} autoHideDuration={6000} onClose={() => setOpen(false)} anchorOrigin={{ vertical: "top", horizontal: "right" }} key={"top" + "right"}>
                <Alert onClose={() => setOpen(false)} severity={customVariant} sx={{ width: "100%" }}>{error ? error : success}</Alert>
            </Snackbar>

            <Backdrop sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }} open={loading}>
                <CircularProgress color="inherit" />
            </Backdrop>
            {/* assign jobs */}
            <AssignTask setOpenModale={setAssignOpen} openModale={assignOpen} user={user} id={id} setLoading={setLoading} setSuccess={setSuccess} setError={setError} setOpen={setOpen} setCustomVariant={setCustomVariant} setRefresh={setRefresh} refresh={refresh} />


            {/* deleting job */}
            <DeleteComponent setOpenModale={setOpenDelete} openModale={openDelete} user={user} setLoading={setLoading} setSuccess={setSuccess} setError={setError} setOpen={setOpen} setCustomVariant={setCustomVariant} data={data} setData={setData} /* setRefresh={setRefresh} refresh={refresh} */ />

            {/* <Typography>Employe Details</Typography> */}
            <Box sx={{ width: '100%', ml: 1, p: 1 }} component={Paper}>
                <Grid spacing={2} container>
                    <Grid item xs={6}>
                        <Box sx={{ display: 'flex' }}>
                            <Box>
                                <Avatar src={`${basImgUrl}/empProfile/${emp?.profile}`} sx={{ width: 100, height: 100 }} />
                            </Box>
                            <Box sx={{ ml: 2 }}>
                                <Typography><b>Name: </b>{emp?.name}</Typography>
                                <Typography><b>Email: </b>{emp?.email}</Typography>
                                <Typography><b>Address: </b>{emp?.address}</Typography>
                            </Box>
                        </Box>
                    </Grid>
                    <Grid item xs={6}>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                            <Button sx={{ height: 40, width: 200, color: 'white', bgcolor: "rgba(16, 138, 0, 1)", ":hover": { bgcolor: "rgba(16, 138, 0, 10)" } }} onClick={() => setAssignOpen(true)}>Add Job</Button>
                            <Link to={`/feed/${id}`} style={{ textDecoration: 'none' }}><Button onClick={() => setMenu({ name: `Employee Review Form`, active: 2 })} sx={{ ml: 2, height: 40, width: 200, color: 'white', bgcolor: "rgba(16, 138, 0, 1)", ":hover": { bgcolor: "rgba(16, 138, 0, 10)" } }} >  Add Review</Button></Link>
                        </Box>
                    </Grid>

                </Grid>
                <Grid spacing={2} container>
                    <Grid item xs={6}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', border: '1px solid #00000026', borderRadius: 2, p: 2, mt: 2, elevation: 2, minHeight: 150 }}>
                            <Box sx={{ width: '50%' }}>
                                <Typography>Start Day:</Typography>
                                <Typography>Rate:</Typography>
                                <Typography>Daily Work Capacity:</Typography>
                            </Box>
                            <Box sx={{ width: '50%' }}>
                                <Typography>{emp?.weekStart}</Typography>
                                <Typography>{emp?.rate}</Typography>
                                <Typography>{emp?.capacity}</Typography>
                            </Box>
                        </Box>
                    </Grid>
                    <Grid item xs={6}>
                        <Box sx={{ border: '1px solid #00000026', borderRadius: 2, p: 2, mt: 2, elevation: 2 }}>
                            <Typography>Working Day</Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'space-around', mt: 1 }}>
                                <Grid spacing={2} container>
                                    {emp?.workingDays?.map((item) => { return <Grid item lg={3} md={4} sm={6} xs={12}><Chip label={item?.name} variant="outlined" /> </Grid> })}
                                </Grid>
                            </Box>
                        </Box>
                    </Grid>
                </Grid>
            </Box>
            <Box>
                <Grid spacing={2} container>
                    <Grid item xs={12} lg={6} md={6} sm={12}>
                        <Table component={Paper} sx={{ ml: 1, mt: 2 }}>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Jobs</TableCell>
                                    <TableCell>Date</TableCell>
                                    <TableCell>Action</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {jobs.map((item, ind) => {
                                    return (
                                        <TableRow key={ind}>
                                            <TableCell>{item?.name}</TableCell>
                                            <TableCell>{moment(item?.createdAt).format('LL')}</TableCell>
                                            <TableCell><Tooltip title={`Delete Jobs from ${emp?.name ? emp?.name : 'employee'}`} onClick={() => { setOpenDelete(true); setData({ type: 'empJob', id: emp?._id, jobId: item?._id }) }}> <IconButton color='error'> <MdDeleteForever /></IconButton> </Tooltip> </TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    </Grid>
                    <Grid item xs={12} lg={6} md={6} sm={12}>
                        <Table component={Paper} sx={{ ml: 1, mt: 2 }}>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Shfit Name</TableCell>
                                    <TableCell>Start Time</TableCell>
                                    <TableCell>End Time</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {emp?.shift?.map((item, ind) => {
                                    return (
                                        <TableRow key={ind}>
                                            <TableCell>{item?.name}</TableCell>
                                            <TableCell>{moment(item?.start).format('hh:mm a')}</TableCell>
                                            <TableCell>{moment(item?.end).format('hh:mm a')}</TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    </Grid>
                </Grid>

            </Box>
        </Box>
    )
}

export default EmpDetails