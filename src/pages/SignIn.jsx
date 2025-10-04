import * as React from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import { Link, useNavigate } from "react-router-dom";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import axios from "axios";
import MuiAlert from "@mui/material/Alert";
import { FormControl, IconButton, InputAdornment, InputLabel, OutlinedInput, Paper, Snackbar, } from "@mui/material";
import { IoEye } from "react-icons/io5";
import { IoEyeOff } from "react-icons/io5";
import * as EmailValidator from 'email-validator';
import { LoadingButton } from "@mui/lab";
import { dashboardData } from "../store/Dashboard/dashboardSlice";
import { useDispatch } from "react-redux";
import { setUser } from "../store/userSlice";
const defaultTheme = createTheme();


function Copyright(props) {
  return (
    <Typography variant="body2" color="text.secondary" align="center" {...props}>
      {'Copyright © '}
      <Link color="inherit" href="/">
      Shiftnpay, LLC, a Computerlog Company
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

export default function SignIn() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const bashUrl = process.env.REACT_APP_BASH_URL;
  const [open, setOpen] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [customVariant, setCustomVariant] = React.useState("success");
  const [error, setError] = React.useState("");

  const [circul, setCircul] = React.useState(false)

  const [emp, setEmp] = React.useState({
    email: "",
    password: "",
  });

  const [valErr, setValErr] = React.useState({
    email: "",
    password: "",
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
    setEmp({
      ...emp,
      [evt.target.name]: evt.target.value,
    });

    setValErr({
      email: "",
      password: "",
    });
  };

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    if (!emp.email) {
      setValErr({ email: "Email required!" });
    } else if (!EmailValidator.validate(emp.email)) {
      setValErr({ email: "Invalid email!" });
    } else if (!emp.password) {
      setValErr({ password: "Password required!" });
    } else if (emp.password.length < 5) {
      setValErr({ password: "Password must be more than 5 words!" });
    } else {
      setCircul(true);
      try {
        const response = await axios.post(`${bashUrl}/vendor/login`, emp);
        const { token, user } = response.data; 

        // Store token in localStorage
        localStorage.setItem("shinpay-vendor-token", token);
        
        // Dispatch user & token to Redux store
        dispatch(setUser({ user, token }));

        setCircul(false);
        navigate("/dashboard");
      } catch (err) {
        setError(err?.response?.data?.msg);
        setCustomVariant("error");
        setOpen(true);
        setCircul(false);
        console.log("err: ", err);
      }
    }
};


  // <IoMdEyeOff />
  return (
    <ThemeProvider theme={defaultTheme}>
      <Snackbar open={open} autoHideDuration={6000} onClose={handleClose} anchorOrigin={{ vertical: "top", horizontal: "right" }} key={"top" + "right"}>
        <Alert onClose={handleClose} severity={customVariant} sx={{ width: "100%" }}>{error ? error : ""}</Alert>
      </Snackbar>
      <Grid container component="main" sx={{ height: '100vh' }}>
        <CssBaseline />
        <Grid item xs={false} sm={4} md={7} sx={{ backgroundImage: 'url(https://shiftnpay.com/api/images/login/regisrationImage.png)', width: '100%', height: 'auto', backgroundColor: (t) => t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900], backgroundSize: 'cover',  backgroundSize: 'cover', // or 'contain'
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'top !important', }} />

        <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
          <Box sx={{ my: 8, mx: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', }}>

            <Box sx={{ width: 200, height: 150 }}><img src='./logo/sky.png' alt='logo' style={{ width: '100%', height: '100%' }} /></Box>
            <Typography component="h1" variant="h5"> Sign in</Typography>

            <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 1 }}>

              {/* <TextField error={valErr.email ? true : false} helperText={valErr.email ? valErr.email : ""} required fullWidth id="email" onChange={handleOnChange} label="Email" name="email" type={"email"} sx={{ mb: 2 }} /> */}
              <TextField error={valErr.email ? true : false} helperText={valErr.email ? valErr.email : ""} required fullWidth id="email" onChange={handleOnChange} label="Email" name="email" type={"email"} sx={{ mb: 2 }} />

              <FormControl variant="outlined" fullWidth>
                <InputLabel htmlFor="outlined-adornment-password">Password</InputLabel>
                <OutlinedInput name="password" value={emp.password} onChange={handleOnChange} id="outlined-adornment-password" type={showPassword ? "text" : "password"} error={valErr.password ? true : false} endAdornment={
                  <IconButton aria-label="toggle password visibility" onClick={handleClickShowPassword} onMouseDown={handleMouseDownPassword} edge="end">
                    {showPassword ? <IoEyeOff /> : <IoEye />}
                  </IconButton>} label="Password" />
                <Typography variant="caption" color={'error'} >{valErr.password ? valErr.password : ''}</Typography>
              </FormControl>

              {circul ? <LoadingButton loading fullWidth variant="contained" sx={{ mt: 3, mb: 2, }}>Sign In</LoadingButton> : <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2, bgcolor: "#108A00", '&:hover': { bgcolor: "#0D6E00" } }}>Sign In</Button>}
              {/* <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2, bgcolor: "#108A00", '&:hover': { bgcolor: "#0D6E00" } }}>Sign In</Button> */}

              <Grid container>
                {/* <Grid item xs>
                    <Link to={"/"} variant="body2">Forgot password?</Link>
                </Grid> */}
                <Grid item>
                  <Link to={'/register'} variant="body2">{"Don't have an account? Sign Up"}</Link>
                </Grid>
              </Grid>
              <Copyright sx={{ mt: 5 }} />
            </Box>
          </Box>
        </Grid>
      </Grid>
    </ThemeProvider>
  );
}