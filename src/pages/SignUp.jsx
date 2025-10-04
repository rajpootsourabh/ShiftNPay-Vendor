import React, { useState } from 'react'
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { IoEye } from "react-icons/io5";
import { IoEyeOff } from "react-icons/io5";
import * as EmailValidator from 'email-validator';
import { Link, useNavigate } from "react-router-dom";
import { FormControl, IconButton, InputAdornment, InputLabel, OutlinedInput, Snackbar, } from "@mui/material";
import axios from "axios";
import MuiAlert from "@mui/material/Alert";
import { LoadingButton } from '@mui/lab';

const defaultTheme = createTheme();

function Copyright(props) {
    return (
        <Typography variant="body2" color="text.secondary" align="center" {...props}>
            {'Copyright © '}
            <Link color="inherit" href="/">
                SK Software LTD
            </Link>{' '}
            {new Date().getFullYear()}
            {'.'}
        </Typography>
    );
}

// Alert notification of MUI
const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

function SignUp() {
    const navigate = useNavigate();
    // const url = "https://team-career-camp.onrender.com"
    const bashUrl = process.env.REACT_APP_BASH_URL;
    const [circle, setCirlcle] = React.useState(false);
    const [open, setOpen] = React.useState(false);
    const [showPassword, setShowPassword] = React.useState(false);
    const [customVariant, setCustomVariant] = React.useState("success");
    const [error, setError] = React.useState("");
    const [success, setSuccess] = useState("")
    const [emp, setEmp] = React.useState({
        name: "",
        email: "",
        address: "",
        password: "",
        role: 'vender'
    });

    const [valErr, setValErr] = React.useState({
        name: "",
        email: "",
        address: "",
        password: ""
    });

    // handle close for UI component alert
    const handleClose = (event, reason) => {
        if (reason === "clickaway") {
            return;
        }
        setOpen(false);
    };

    // input onchange event
    const handleOnChange = (evt) => {
        setEmp({ ...emp, [evt.target.name]: evt.target.value, });

        setValErr({
            name: "",
            email: "",
            address: "",
            password: ""
        });
    };

    const handleClickShowPassword = () => setShowPassword((show) => !show);
    const handleMouseDownPassword = (event) => {
        event.preventDefault();
    };

    // handle submit for SigIn
    const handleSubmit = async (evt) => {
        evt.preventDefault();
        if (!emp.name) {
            setValErr({ name: 'Name is required!' })
        } else if (!emp.email) {
            setValErr({ email: "Email required!", });
        } else if (!EmailValidator.validate(emp.email)) {
            setValErr({ email: "Invalid email!", });
        } else if (!emp.address) {
            setValErr({ address: "Address is required!" })
        } else if (!emp.password) {
            // console.log("password: ");
            setValErr({ password: "Password required!", });
        } else if (emp.password.length < 5) {
            setValErr({ password: "Password must be more than 5 words!", });
        } else {
            setCirlcle(true)
            return await axios.post(`${bashUrl}/vendor/register`, emp).then((response) => {
                setError("")
                setSuccess(response.data.msg)
                setCustomVariant("success")
                setOpen(true)
                setCirlcle(false)
                navigate("/signin");
            }).catch((err) => {
                setError(err.response?.data?.msg);
                setCustomVariant("error");
                setOpen(true);
                setCirlcle(false)
                // console.log("err: ", err);
            });
        }
    };


    return (
        <ThemeProvider theme={defaultTheme}>
            <Snackbar open={open} autoHideDuration={6000} onClose={handleClose} anchorOrigin={{ vertical: "top", horizontal: "right" }} key={"top" + "right"}>
                <Alert onClose={handleClose} severity={customVariant} sx={{ width: "100%" }}>{error ? error : success}</Alert>
            </Snackbar>
            <Grid container component="main" sx={{ height: '100vh' }}>
                <CssBaseline />
                <Grid item xs={false} sm={4} md={7} sx={{ backgroundImage: 'url(https://shiftnpay.com/api/images/login/loginImage.jpg)', backgroundRepeat: 'no-repeat', backgroundColor: (t) => t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900], backgroundSize: 'cover', backgroundPosition: 'center', }} />

                <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
                    <Box sx={{ my: 3, mx: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', }}>

                        <Box sx={{ width: 200, height: 150 }}><img src='./logo/sky.png' alt='logo' style={{ width: '100%', height: '100%' }} /></Box>
                        <Typography component="h1" variant="h5"> Register</Typography>

                        <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 1 }}>

                            {/* <TextField error={valErr.email ? true : false} helperText={valErr.email ? valErr.email : ""} required fullWidth id="email" onChange={handleOnChange} label="Email" name="email" type={"email"} sx={{ mb: 2 }} /> */}
                            <TextField error={valErr.name ? true : false} helperText={valErr.name ? valErr.name : ""} required fullWidth id="name" onChange={handleOnChange} label="Name" name="name" type={"text"} sx={{ mb: 2 }} />

                            <TextField error={valErr.email ? true : false} helperText={valErr.email ? valErr.email : ""} required fullWidth id="email" onChange={handleOnChange} label="Email" name="email" type={"email"} sx={{ mb: 2 }} />

                            <TextField error={valErr.address ? true : false} helperText={valErr.address ? valErr.address : ""} required fullWidth id="address" onChange={handleOnChange} label="Address" name="address" type={"text"} sx={{ mb: 2 }} />

                            <FormControl variant="outlined" fullWidth>
                                <InputLabel htmlFor="outlined-adornment-password">Password</InputLabel>
                                <OutlinedInput name="password" value={emp.password} onChange={handleOnChange} id="outlined-adornment-password" type={showPassword ? "text" : "password"} error={valErr.password ? true : false} endAdornment={
                                    <IconButton aria-label="toggle password visibility" onClick={handleClickShowPassword} onMouseDown={handleMouseDownPassword} edge="end">
                                        {showPassword ? <IoEyeOff /> : <IoEye />}
                                    </IconButton>} label="Password" />
                                <Typography variant="caption" color={'error'} >{valErr.password ? valErr.password : ''}</Typography>
                            </FormControl>


                            {/* <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2, bgcolor: "#108A00", '&:hover': { bgcolor: "#0D6E00" } }}>Register</Button> */}
                            {circle ? <LoadingButton loading fullWidth variant="contained" sx={{ mt: 3, mb: 2, }}>Register</LoadingButton> : <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2, bgcolor: "#108A00", '&:hover': { bgcolor: "#0D6E00" } }}>Register</Button>}
                            <Grid container>
                                {/* <Grid item xs>
                                    <Link to={"/"} variant="body2">Forgot password?</Link>
                                </Grid> */}
                                <Grid item>
                                    <Link to={'/signin'} variant="body2">{"Already have an account? Sign In"}</Link>
                                </Grid>
                            </Grid>
                            <Copyright sx={{ mt: 5 }} />
                        </Box>
                    </Box>
                </Grid>
            </Grid>
        </ThemeProvider>
    )
}

export default SignUp