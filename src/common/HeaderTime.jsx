import { Box, Button, Divider, Paper, TextField, Typography } from '@mui/material'
import React from 'react'
import './inputStyle.css'
import { IoIosAddCircleOutline } from "react-icons/io";
import { HiOutlineTag } from "react-icons/hi2";
import { PiCurrencyDollarSimpleLight } from "react-icons/pi";

function HeaderTime() {
    return (
        <Paper elevation={1} sx={{ borderRadius: 0, width: '100%', ml: 1 }}>
            <Box sx={{ width: '100%', height: 60, bgcolor: 'white', display: 'flex', alignItems: 'center', mb: 1, px: 1 }}>
                {/* <TextField variant='standard' placeholder='What are you working on?' sx={{ width: '50%' }} /> */}
                <input className='headerTime' placeholder='What are you working on?' />

                <Box sx={{ width: '40%', height: 60, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <Box sx={{ height: 60, display: 'flex', alignItems: 'center', width: '20%' }}>
                        <IoIosAddCircleOutline color='rgba(16, 138, 0, 1)' size={25} />
                        <Typography sx={{ ml: 1, color: 'rgba(16, 138, 0, 1)' }}>Project</Typography>
                    </Box>

                    <Divider orientation='vertical' sx={{ height: 35, mx: 1 }} />

                    <Box sx={{ height: 60, display: 'flex', alignItems: 'center', width: '20%', justifyContent: 'center', }}>
                        <HiOutlineTag color='grey' size={25} />
                    </Box>

                    <Divider orientation='vertical' sx={{ height: 35, mx: 1 }} />

                    <Box sx={{ height: 60, display: 'flex', alignItems: 'center', width: '20%', justifyContent: 'center' }}>
                        <PiCurrencyDollarSimpleLight color='grey' size={25} />
                    </Box>

                    <Box sx={{ height: 60, display: 'flex', alignItems: 'center', width: '20%', justifyContent: 'center' }}>
                        <Typography>00:00:00</Typography>
                    </Box>

                    <Box sx={{ height: 60, display: 'flex', alignItems: 'center', width: '20%', justifyContent: 'center' }}>
                        <Button variant='contained' sx={{ borderRadius: 1, width: '100%', bgcolor: "rgba(16, 138, 0, 1)", ":hover": { bgcolor: "rgba(16, 138, 0, 10)" } }}>start</Button>
                    </Box>
                </Box>
            </Box>
        </Paper>
    )
}

export default HeaderTime