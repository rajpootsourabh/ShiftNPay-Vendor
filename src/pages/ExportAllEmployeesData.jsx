import { Backdrop, Box, CircularProgress, Paper, Snackbar, TextField, InputAdornment, Button } from '@mui/material';
import React, { useEffect, useState } from 'react';
import MuiAlert from "@mui/material/Alert";
import { CiSearch } from "react-icons/ci";
import axios from 'axios';
import { useSelector } from 'react-redux';
import { DataGrid } from '@mui/x-data-grid';
import * as XLSX from 'xlsx';
import moment from 'moment';
import ExportAll from '../popup/ExportAll';
import { formatDateTime, getUserName } from '../Helper/functions';

// Alert notification of MUI
const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});
const bashUrl = process.env.REACT_APP_BASH_URL;

function ExportAllEmployeesData() {
    const options = { Authorization: `Bearer ${localStorage.getItem("shinpay-vendor-token")}`, "Content-Type": "application/json" };
    const user = useSelector((state) => state.user.user);

    const [staffs, setStaffs] = useState([]);

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [filteredData, setFilteredData] = useState([]);
    const [refresh, setRefresh] = useState(false);
    const [search, setSearch] = useState("");
    const [open, setOpen] = useState(false);
    const [customVariant, setCustomVariant] = useState("success");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState();
    const [loading, setLoading] = useState(true);
    const [selectedIds, setSelectedIds] = useState([]); // State to store selected row IDs

    const [excelData, setExcelData] = useState([])

    const [openDate, setOpenDate] = useState(false)


    useEffect(() => {
        const searchData = staffs.filter((item) =>
            item?.email?.toLowerCase().includes(search.toLowerCase()) ? item : null
        );
        const rows = searchData.map((item, index) => ({
            ...item,
            count: index + 1, // Add a count field for the row number
        }));

        setFilteredData(rows);
    }, [search, staffs]);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    const getAllStaff = async () => {
        try {
            const response = await axios.get(`${bashUrl}/emp/get-by-vendor-id`, { headers: options });
            setStaffs(response.data.result);
            setFilteredData(response.data.result);
            setLoading(false);
        } catch (error) {
            setSuccess("");
            setError(error?.response?.data?.msg);
            setCustomVariant("error");
            setLoading(false);
        }
    };

    useEffect(() => {
        getAllStaff();
    }, [refresh, user?._id]);

    const columns = [
        { field: 'count', headerName: 'ID', width: 90 },
        { field: 'name', headerName: 'Name', width: 350, 
            selector: (row) => {
                return  getUserName(row);
            },
            editable: false },

        { field: 'email', headerName: 'Email', width: 350, editable: false },
    ];

    const handleOpenDate = async () => {
        if (selectedIds.length > 0) {
            setOpenDate(true)
        } else {
            setSuccess("")
            setError("Please select at least one employee to export tracking data.")
            setCustomVariant("error")
            setOpen(true)
        }
    }

    const handleSelectionChange = async (newSelection) => {
        console.log("newSelection: ", newSelection);
        setSelectedIds(newSelection); // Update selected IDs
        setLoading(true)
        let date = new Date()
        let end = new Date()
        return await axios.get(`${bashUrl}/tracking/get-all-emp/${newSelection}?start=${date}&end=${end}`).then((response) => {
            console.log("response: ", response.data.result);
            exportToExcel(response.data.result)
            setLoading(false)
        }).catch((error) => {
            console.log("error: ", error);
            setLoading(false)
        })
    };

    function formatDuration(durationInSeconds) {
        if (durationInSeconds < 60) {
            return `${durationInSeconds} second${durationInSeconds !== 1 ? 's' : ''}`;
        } else if (durationInSeconds < 3600) {
            let minutes = Math.floor(durationInSeconds / 60);
            let seconds = durationInSeconds % 60;
            return `${minutes} minute${minutes !== 1 ? 's' : ''}${seconds > 0 ? ` ${seconds} second${seconds !== 1 ? 's' : ''}` : ''}`;
        } else {
            let hours = Math.floor(durationInSeconds / 3600);
            let minutes = Math.floor((durationInSeconds % 3600) / 60);
            let seconds = durationInSeconds % 60;
            return `${hours} hour${hours !== 1 ? 's' : ''}${minutes > 0 ? ` ${minutes} minute${minutes !== 1 ? 's' : ''}` : ''}${seconds > 0 ? ` ${seconds} second${seconds !== 1 ? 's' : ''}` : ''}`;
        }
    }


    const exportToExcel = (result) => {
        // Prepare data for Excel
        console.log('result : ', result);
    
        const excelData = result.map(item => {
            // Initialize a base entry for each row
            const row = {
                "Name": item.employeeName,
                "Job Name": item.jobName,
                "Shift Name": item.shift ? item.userId.shift.map(s => s.name).join(', ') : '----',
                "Date": moment(item.sessionDate).format('LLL'),
                "Total Work Hours": formatDuration(item.totalDuration), // Calculate and format total duration
                "Over Time": item.rate,
            };
    
            // Loop through clockLogs and handle time logs (clock-in, clock-out, break-in, break-out)
            item.clockLogs.forEach((log, index) => {
                // Depending on the type of log, assign values to specific columns
                if (log.type === 'clock-in') {
                    row[`Clock In ${index + 1}`] = formatDateTime(log.time); // Format clock-in time
                } else if (log.type === 'clock-out') {
                    row[`Clock Out ${index + 1}`] = formatDateTime(log.time); // Format clock-out time
                } else if (log.type === 'break-in') {
                    row[`Break In ${index + 1}`] = formatDateTime(log.time); // Format break-in time
                } else if (log.type === 'break-out') {
                    row[`Break Out ${index + 1}`] = formatDateTime(log.time); // Format break-out time
                }
            });
    
            return row;
        });
    
        // Convert data to worksheet
        const worksheet = XLSX.utils.json_to_sheet(excelData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'TrackingData');
    
        // Export to Excel
        XLSX.writeFile(workbook, 'TrackingData.xlsx');
    };
    
    // console.log("selectino: ", selectedIds);

    return (
        <Paper sx={{ borderRadius: 0, maxWidth: '100%', ml: 1, p: 2 }}>
            <Box>
                <Snackbar open={open} autoHideDuration={6000} onClose={() => setOpen(false)} anchorOrigin={{ vertical: "top", horizontal: "right" }} key={"top" + "right"}>
                    <Alert onClose={() => setOpen(false)} severity={customVariant} sx={{ width: "100%" }}>{error ? error : success}</Alert>
                </Snackbar>
                <Backdrop sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }} open={loading}>
                    <CircularProgress color="inherit" />
                </Backdrop>

                <ExportAll openModale={openDate} setOpenModale={setOpenDate} setLoading={setLoading} setSuccess={setSuccess} setError={setError} setCustomVariant={setCustomVariant} selectedIds={selectedIds} setOpen={setOpen} />

                <Box sx={{ width: '100%', height: 70, mb: 1, display: 'flex', alignItems: 'center' }} >
                    <Box sx={{ width: "40%" }}>
                        <TextField fullWidth label="Search" name="search" onChange={(evt) => setSearch(evt.target.value)} value={search} placeholder="Search email" id="outlined-start-adornment"
                            InputProps={{ startAdornment: (<InputAdornment position="start"><CiSearch /></InputAdornment>) }}
                        />
                    </Box>
                    <Box sx={{ flexGrow: 1 }} />
                    <Button variant='contained' sx={{ height: 40, width: 200, bgcolor: "rgba(16, 138, 0, 1)", ":hover": { bgcolor: "rgba(16, 138, 0, 10)" } }} onClick={handleOpenDate}>Export All</Button>
                </Box>
                <Box sx={{ width: '100%', maxWidth: '100%' }}>
                    <DataGrid rows={filteredData} columns={columns}
                        getRowId={(row) => row._id}
                        initialState={{
                            pagination: {
                                paginationModel: {
                                    pageSize: 10,
                                },
                            },
                        }}
                        pageSizeOptions={[10]}
                        checkboxSelection
                        disableRowSelectionOnClick
                        autoHeight
                        sx={{ maxWidth: '100%' }} // Ensure the DataGrid doesn't exceed the container's width
                        onRowSelectionModelChange={(newSelectionModel) => setSelectedIds(newSelectionModel)} // Handle selection change
                    />
                </Box>
            </Box>
        </Paper>
    );
}

export default ExportAllEmployeesData;
