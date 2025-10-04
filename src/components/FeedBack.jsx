import { LoadingButton } from '@mui/lab'
import { Backdrop, Box, Button, CircularProgress, Grid, Paper, Rating, Snackbar, TextField, Typography } from '@mui/material'
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import MuiAlert from "@mui/material/Alert";
import { useSelector } from 'react-redux'


const bashUrl = process.env.REACT_APP_BASH_URL;


// Alert notification of MUI
const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});


function FeedBack() {
    const { id } = useParams()

    const options = { Authorization: `Bearer ${localStorage.getItem("shinpay-vendor-token")}`, "Content-Type": "multipart/form-data" };
    const user = useSelector((state) => state.user.user);

    const [loading, setLoading] = useState(true)

    const [open, setOpen] = useState(false);
    const [customVariant, setCustomVariant] = useState("success");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState();


    const [feed, setFeed] = useState({
        feed: '',
        rate: ''
    })

    const [valfeed, setValFeed] = useState({
        feed: '',
        rate: ''
    })

    const [emp, setEmp] = useState("")

    // const [feedId, setFeedId] = useState('')

    const [circle, setCircle] = useState(false)


    const handOnChange = evt => {
        setFeed({ ...feed, [evt.target.name]: evt.target.value })
    }

    // console.log("user: ", feed);
    const getFeedBackId = async () => {
        return await axios.get(`${bashUrl}/feed/get-by-emp-id/${id}`, { headers: options }).then((response) => {
            setFeed(response.data.result)
            setLoading(false)
        }).catch((error) => {
            setLoading(false)
            // console.log("error on getFeedBackId: ", error);
        })
    }

    const getEmpoyee = async () => {
        return await axios.get(`${bashUrl}/emp/get-by-id/${id}`, { headers: options }).then((response) => {
            setEmp(response.data.result)
            setLoading(false)
            // setJobs(response.data.result?.jobId)
            // console.log("response: ", response.data.result.jobId);
        }).catch((error) => {
            console.log("error on getSingleEmp: ", error);
            // setSuccess("")
            // setError(error.response.data.msg)
            // setCustomVariant("error")
            // setOpen(true)
            setLoading(false)
        })
    }

    useEffect(() => {
        getFeedBackId()
        getEmpoyee()
    }, [loading])


    const handleSubmit = async (evt) => {
        evt.preventDefault()
        if (!feed.feed) {
            setValFeed({ feed: 'Review is required!' })
        } else if (!feed.rate) {
            setValFeed({ rate: 'Rating is required!' })
        } else {
            setLoading(true)
            setCircle(true)
            if (feed._id) {
                return await axios.post(`${bashUrl}/feed/update-feed`, { id: feed?._id, feed: feed.feed, rate: feed.rate }, { headers: options }).then((response) => {
                    setError("")
                    setSuccess(response.data.msg)
                    setCustomVariant("success")
                    setOpen(true)
                    setCircle(false)
                    setLoading(false)
                }).catch((error) => {
                    setSuccess("")
                    setError(error.response.data.msg)
                    setCustomVariant("error")
                    setOpen(true)
                    setCircle(false)
                    setLoading(false)
                })
            }
            // console.log("this is else part: ", feed);
            return await axios.post(`${bashUrl}/feed/add-feed`, { id: id, userId: user?._id, feed: feed.feed, rate: feed.rate }, { headers: options }).then((response) => {
                setError("")
                setSuccess(response.data.msg)
                setCustomVariant("success")
                setOpen(true)
                setCircle(false)
                setLoading(false)
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
    return (
        <Box sx={{ width: '100%', ml: 1, }}>
            <Snackbar open={open} autoHideDuration={6000} onClose={() => setOpen(false)} anchorOrigin={{ vertical: "top", horizontal: "right" }} key={"top" + "right"}>
                <Alert onClose={() => setOpen(false)} severity={customVariant} sx={{ width: "100%" }}>{error ? error : success}</Alert>
            </Snackbar>
            <Backdrop sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }} open={loading}>
                <CircularProgress color="inherit" />
            </Backdrop>


            <Paper sx={{ width: '100%', borderRadius: 1, mt: 1, p: 2 }}>
                <Box component={'form'} noValidate onSubmit={handleSubmit}>
                    <Box sx={{ display: 'flex' }}>
                        <Box>
                            <Typography variant='h6' component={'div'}>{emp?.name}</Typography>
                            <Typography variant='body2' sx={{ color: 'grey' }}>Review will be published to employee.</Typography>
                        </Box>
                        <Box sx={{ flexGrow: 1 }} />
                        {/* <Button variant='contained' color='success' onClick={logout} sx={{ height: 40 }}>Logout</Button> */}
                    </Box>

                    <Grid spacing={2} container sx={{ mt: 2 }}>

                        <Grid item xs={12}>
                            <TextField value={feed?.feed} type="text" id="outlined-basic" label="Review" variant="outlined" name="feed" multiline rows={10} sx={{}} placeholder={`Write your review here...`} onChange={handOnChange} error={valfeed.feed ? true : false} fullWidth required />
                            <Typography variant='caption' component={'div'} color={'error'} sx={{}}>{valfeed.feed ? valfeed.feed : ''}</Typography>
                        </Grid>

                        <Grid item xs={12}>
                            <Box sx={{ ml: 2 }}>
                                <Typography variant='h5'>Rating</Typography>
                                <Rating name="simple-controlled" value={feed.rate} precision={0.5} onChange={(event, newValue) => { setFeed({ ...feed, rate: newValue }); setValFeed({ ...valfeed, rate: '' }) }} size='large' />
                                <Typography variant='caption' component={'div'} color={'error'} sx={{}}>{valfeed.rate ? valfeed.rate : ''}</Typography>
                            </Box>
                        </Grid>

                        <Grid item xs={6}>
                            {circle ? <LoadingButton loading variant="contained" sx={{ height: 50, width: 100 }}>Submit</LoadingButton> : <Button variant='contained' color='success' type='submit' sx={{ height: 50, width: 100 }}>Submit</Button>}
                        </Grid>
                    </Grid>
                </Box>
            </Paper>
        </Box>
    )
}

export default FeedBack