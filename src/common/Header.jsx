import { Box, Button, Paper, Typography } from '@mui/material'
import React from 'react'
import { useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
function Header({ title }) {

    const navigate = useNavigate();


    const logout = (e) => {
        localStorage.removeItem("shinpay-vendor-token")
        navigate("/signin");
    }
    
    const redirectToSubscriptionPage = (e) => {
        navigate("/modules");
    }
    return (
        <>
       <ToastContainer position="bottom-right" autoClose={3000} />
        <Paper sx={{ borderRadius: 0, width: '100%', ml: 1, mb: 1 }}>
            <Box sx={{ width: '100%', height: 70, bgcolor: 'white', mt: 2, display: 'flex', alignItems: 'center', px: 2 }}>
                <Typography sx={{ fontWeight: 700, fontSize: 20 }}>{title}</Typography>


                <Box sx={{ flexGrow: 1 }} />
                <Button variant='contained' color='primary' onClick={ redirectToSubscriptionPage} sx={{ height: 40 ,marginRight: '10px'}}>Upgrade</Button>

                <Button variant='contained' color='success' onClick={logout} sx={{ height: 40 }}>Logout</Button>
            </Box>
        </Paper>
        </>
    )
}

export default Header