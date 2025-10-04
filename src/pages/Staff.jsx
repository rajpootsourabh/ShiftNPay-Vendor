import { Backdrop, Box, Button, CircularProgress, IconButton, InputAdornment, Paper, Snackbar, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TextField, Tooltip, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import MuiAlert from "@mui/material/Alert";
import { CiSearch } from "react-icons/ci";
import AddEmp from '../popup/AddEmp';
import axios from 'axios';
import { MdDeleteForever } from "react-icons/md";
import { FaEdit } from "react-icons/fa";
import UpdateEmp from '../popup/UpdateEmp';
import DeleteComponent from '../common/DeleteComponent';
import { Link } from 'react-router-dom';
import { IoIosEye } from "react-icons/io";
import { useSelector } from 'react-redux';

// Alert notification of MUI
const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});
const bashUrl = process.env.REACT_APP_BASH_URL;
function Staff({user}) {
    const options = { Authorization: `Bearer ${localStorage.getItem("shinpay-vendor-token")}`, "Content-Type": "application/json" };
    
    const [staffs, setStaffs] = useState([])



    const [addEmpOpen, setAddEmpOpen] = useState(false)
    const [updateEmpOpen, setUpdateEmpOpen] = useState(false)
    const [deleteEmpOpen, setDeleteEmpOpen] = useState(false)
    const [data, setData] = useState({
        type: 'job',
        id: '',
        title: ''
    })

    const [empUpdate, setEmpUpdate] = useState('')

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [filterdData, setFilterData] = useState([]);
    const [refresh, setRefresh] = useState(false);
    const [search, setSearch] = useState("");
    const [open, setOpen] = useState(false);
    const [customVariant, setCustomVariant] = useState("success");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState();
    const [loading, setLoading] = useState(true);

    // const [searchBy, setSearchBy] = useState('All')

    // this is fro seraching data of driver
    useEffect(() => {
        const searchData = staffs.filter((item) =>
            item?.email?.toLowerCase().includes(search.toLocaleLowerCase()) ? item : null
        );
        setFilterData(searchData);
    }, [search]);


    // This is for Designing
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    /* const handleOnSelect = evt => {
        setSearchBy(evt.target.value)
    } */


    const getAllStaff = async () => {
        return await axios.get(`${bashUrl}/emp/get-by-vendor-id`, { headers: options }).then((response) => {
            setStaffs(response.data.result)
            setFilterData(response.data.result)
            setLoading(false)
        }).catch((error) => {
            setSuccess("")
            setError(error?.response?.data?.msg)
            setCustomVariant("error")
            // setOpen(true)
            setLoading(false)
        })
    }

    useEffect(() => {
        getAllStaff()
    }, [loading, refresh])


    return (
        <Paper sx={{ borderRadius: 0, width: '100%', ml: 1, p: 2 }}>
            <Box>
                {/* <SnackBar success={success} error={error} customVariant={customVariant} open={open} setOpen={setOpen} /> */}
                <Snackbar open={open} autoHideDuration={6000} onClose={() => setOpen(false)} anchorOrigin={{ vertical: "top", horizontal: "right" }} key={"top" + "right"}>
                    <Alert onClose={() => setOpen(false)} severity={customVariant} sx={{ width: "100%" }}>{error ? error : success}</Alert>
                </Snackbar>
                <Backdrop sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }} open={loading}>
                    <CircularProgress color="inherit" />
                </Backdrop>

                {/* this is for adding employee */}
                <AddEmp setOpenModale={setAddEmpOpen} openModale={addEmpOpen} setLoading={setLoading} setSuccess={setSuccess} setError={setError} setOpen={setOpen} setCustomVariant={setCustomVariant} user={user}/>

                {/* this is for updating employee */}
                <UpdateEmp setOpenModale={setUpdateEmpOpen} openModale={updateEmpOpen} setLoading={setLoading} setSuccess={setSuccess} setError={setError} setOpen={setOpen} setCustomVariant={setCustomVariant} empUpdate={empUpdate} setEmpUpdate={setEmpUpdate} setRefresh={setRefresh} refresh={refresh} user={user}/>

                {/* this is for deleting emp */}
                <DeleteComponent setOpenModale={setDeleteEmpOpen} openModale={deleteEmpOpen} setLoading={setLoading} setSuccess={setSuccess} setError={setError} setOpen={setOpen} setCustomVariant={setCustomVariant} data={data} setData={setData} setRefresh={setRefresh} refresh={refresh} user={user}/>

                <Box sx={{ width: '100%', height: 70, mb: 1, display: 'flex', alignItems: 'center' }} >
                    {/* <Box sx={{ width: "20%", mr: 2 }}>
                        <FormControl fullWidth>
                            <InputLabel id="demo-simple-select-label">Show all</InputLabel>
                            <Select labelId="demo-simple-select-label" id="demo-simple-select" value={searchBy} label="Select" onChange={handleOnSelect}>
                                <MenuItem value={"All"}>Show All</MenuItem>
                                <MenuItem value={"Email"}>Email</MenuItem>
                                <MenuItem value={"Name"}>Name</MenuItem>
                            </Select>
                        </FormControl>
                    </Box> */}

                    <Box sx={{ width: "40%" }}>
                        <TextField fullWidth label="Search" name="search" onChange={(evt) => setSearch(evt.target.value)} value={search} placeholder="Search email" id="outlined-start-adornment"
                            InputProps={{ startAdornment: (<InputAdornment position="start"><CiSearch /></InputAdornment>), }}
                        />
                    </Box>
                    <Box sx={{ flexGrow: 1 }} />
                    <Button variant='contained' sx={{ height: 40, width: 200, bgcolor: "rgba(16, 138, 0, 1)", ":hover": { bgcolor: "rgba(16, 138, 0, 10)" } }} onClick={() => setAddEmpOpen(true)}>Add Staff</Button>
                </Box>

                <TableContainer component={Paper}>
                    <Table /* aria-label='collapsible table' */>
                        <TableHead>
                            <TableRow sx={{ bgcolor: "#E4EAEE", color: 'white' }}>
                                <TableCell sx={{ color: 'black' }} >Name</TableCell>
                                <TableCell sx={{ color: 'black' }} align="center">Email</TableCell>
                                <TableCell sx={{ color: 'black' }} align="center">Rate</TableCell>
                                <TableCell sx={{ color: 'black' }} align="center">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filterdData && filterdData.length ? (
                                filterdData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((item, ind) => {
                                    return (
                                        <TableRow key={ind} hover>
                                            <TableCell >{item?.name}</TableCell>
                                            <TableCell align="center">{item.email}</TableCell>
                                            <TableCell align="center">{item?.rate && '$'} {item?.rate} </TableCell>
                                            <TableCell align="center">
                                                <Link to={`/staff/${item._id}`} ><Tooltip title="View Employee"><IconButton color='success' > <IoIosEye /> </IconButton></Tooltip></Link>
                                                <Tooltip title="Edit Employee"><IconButton color='warning' onClick={() => { setUpdateEmpOpen(true); setEmpUpdate(item?._id) }}> <FaEdit /> </IconButton></Tooltip>
                                                <Tooltip title="Deactive Employee"><IconButton color='error' onClick={() => { setDeleteEmpOpen(true); setData({ title: item?.email, type: 'emp', id: item?._id }) }}> <MdDeleteForever /> </IconButton></Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} align="center">
                                        <Typography>No staff data found!</Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                    <TablePagination rowsPerPageOptions={[10, 25, 100]} component="div" count={filterdData?.length} rowsPerPage={rowsPerPage} page={page} onPageChange={handleChangePage} onRowsPerPageChange={handleChangeRowsPerPage} />
                </TableContainer>
            </Box>
        </Paper >
    )
}

export default Staff