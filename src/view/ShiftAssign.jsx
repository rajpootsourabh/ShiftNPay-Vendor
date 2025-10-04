import { Backdrop, Box, Button, CircularProgress, IconButton, InputAdornment, Paper, Snackbar, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TextField, Tooltip, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import MuiAlert from "@mui/material/Alert";
import { useSelector } from 'react-redux';
import axios from 'axios';
import { CiSearch } from "react-icons/ci";
import { useParams } from 'react-router-dom';
import DeleteComponent from '../common/DeleteComponent';
import { LoadingButton } from '@mui/lab';


// Alert notification of MUI
const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const bashUrl = process.env.REACT_APP_BASH_URL;
const basImgUrl = process.env.REACT_APP_BASH_IMG_URL;
function ShiftAssign() {
    const { id } = useParams()
    const options = { Authorization: `Bearer ${localStorage.getItem("shinpay-vendor-token")}`, "Content-Type": "application/json" };
    const user = useSelector((state) => state.user.user);

    const [circle, setCircle] = useState(false);

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

    const [shfitDetail, setShiftDetail] = useState("")

    const [staffs, setStaffs] = useState([])

    const [deleteOpen, setDeleteOpen] = useState(false)
    const [data, setData] = useState({
        type: 'deAssign',
        id: '',
        title: ''
    })

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

    const getShift = async () => {
        return await axios.get(`${bashUrl}/shift/get-by-id/${id}`, { headers: options }).then((response) => {
            setShiftDetail(response.data.result)
            setLoading(false)
        }).catch((error) => {
            setLoading(false)
            console.log("error on getShift: ", error);
        })
    }


    const getAllStaff = async () => {
        return await axios.get(`${bashUrl}/emp/get-by-vendor-id`, { headers: options }).then((response) => {
            setStaffs(response.data.result)
            setFilterData(response.data.result)
            setLoading(false)
            // console.log("response: ", response.data.result);
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
        getShift()
    }, [loading, refresh])

    const handleAssignShift = async (empId) => {
        setCircle(true)
        return await axios.post(`${bashUrl}/shift/assign`, { id: id, empId: empId }, { headers: options }).then((response) => {
            setError("")
            setSuccess(response.data.msg)
            setCustomVariant("success")
            setOpen(true)
            setRefresh(!refresh)
            setCircle(false)
        }).catch((error) => {
            console.log("error: ", error);
            setSuccess("")
            setError(error.response.data.msg)
            setCustomVariant("error")
            setOpen(true)
            setCircle(false)
        })
    }

    return (
        <Paper sx={{ borderRadius: 0, width: '100%', ml: 1, p: 2 }}>
            <Box>
                <Snackbar open={open} autoHideDuration={6000} onClose={() => setOpen(false)} anchorOrigin={{ vertical: "top", horizontal: "right" }} key={"top" + "right"}>
                    <Alert onClose={() => setOpen(false)} severity={customVariant} sx={{ width: "100%" }}>{error ? error : success}</Alert>
                </Snackbar>
                <Backdrop sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }} open={loading}>
                    <CircularProgress color="inherit" />
                </Backdrop>

                <Box sx={{ width: '100%', height: 70, mb: 1, display: 'flex', alignItems: 'center' }} >
                    <Box sx={{ width: "40%" }}>
                        <TextField fullWidth label="Search" name="search" onChange={(evt) => setSearch(evt.target.value)} value={search} placeholder="Search email" id="outlined-start-adornment"
                            InputProps={{ startAdornment: (<InputAdornment position="start"><CiSearch /></InputAdornment>), }}
                        />
                    </Box>
                    <Box sx={{ flexGrow: 1 }} />
                </Box>

                {/* deleting job */}
                <DeleteComponent setOpenModale={setDeleteOpen} openModale={deleteOpen} setLoading={setLoading} setSuccess={setSuccess} setError={setError} setOpen={setOpen} setCustomVariant={setCustomVariant} data={data} setData={setData} setRefresh={setRefresh} refresh={refresh} />

                <TableContainer component={Paper}>
                    <Table>
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
                                    let isShiftAssigned = item?.shift.some(shiftId => shiftId?._id === id);
                                    return (
                                        <TableRow key={ind} hover>
                                            <TableCell >{item?.name}</TableCell>
                                            <TableCell align="center">{item.email}</TableCell>
                                            <TableCell align="center">{item?.rate && '$'} {item?.rate} </TableCell>
                                            <TableCell align="center">
                                                {isShiftAssigned ? <Button sx={{ mt: 1, height: 40, width: 200 }} color='error' variant='contained' onClick={() => { setData({ type: 'deAssign', title: shfitDetail?.name, id: id, empId: item?._id }); setDeleteOpen(true) }} >Remove</Button> : <Button sx={{ mt: 1, height: 40, width: 200, color: 'white', bgcolor: "rgba(16, 138, 0, 1)", ":hover": { bgcolor: "rgba(16, 138, 0, 10)" } }} onClick={() => handleAssignShift(item?._id)} >Assign</Button>}
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
        </Paper>
    )
}

export default ShiftAssign