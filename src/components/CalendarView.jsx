import React, { useEffect, useRef, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Box, Tooltip, Typography, Button, Backdrop, CircularProgress } from '@mui/material';
import axios from 'axios';
import moment from 'moment';
import * as XLSX from 'xlsx';
import './styls.css';


const bashUrl = process.env.REACT_APP_BASH_URL;


function CalendarView({ staff }) {
    const options = { Authorization: `Bearer ${localStorage.getItem("shinpay-vendor-token")}`, "Content-Type": "application/json" };

    const calendarRef = useRef(null)
    const [loading, setLoading] = useState(true)

    // console.log("staff: ", staff);

    const [events, setEvents] = useState([]);
    const [dailyDurations, setDailyDurations] = useState({});
    const [totalMonthlyAmount, setTotalMonthlyAmount] = useState(0);
    const [totalAmount, setTotalAmount] = useState()

    const [viewDates, setViewDates] = useState({ start: null, end: null });



    // this is getting data and formatting
    const gettingTrackingDataByEmpId = async () => {
        try {
            const response = await axios.get(`${bashUrl}/tracking/get-tracking-by-user-id/${staff?._id}`, { headers: options });
            console.log("respones: ", response.data.result);
            const formattedEvents = response.data.result.map((item) => ({
                title: item?.name || 'Job Name',
                start: moment(item?.startTime).toDate(),
                end: moment(item?.endTime).toDate(),
                duration: moment.duration(moment(item?.endTime).diff(moment(item?.startTime)))
            }));

            // setting data to events
            setEvents(formattedEvents);

            // getting duration
            const durations = formattedEvents.reduce((acc, item) => {
                const date = moment(item.start).format('YYYY-MM-DD');

                if (!acc[date]) {
                    acc[date] = moment.duration(0);
                }

                acc[date].add(item.duration);
                return acc;
            }, {});

            // making format for daily data total time
            const formattedDurations = Object.keys(durations).reduce((acc, date) => {
                const duration = durations[date];
                acc[date] = `${Math.floor(duration.asHours())} hours, ${duration.minutes()} min, ${duration.seconds()} sec`;
                return acc;
            }, {});

            setDailyDurations(formattedDurations);

            const totalAmount = formattedEvents.reduce((acc, event) => {
                const durationInSeconds = event.duration.asSeconds();
                const amount = calculateRate(durationInSeconds);
                return acc + parseFloat(amount);
            }, 0);

            setTotalMonthlyAmount(totalAmount.toFixed(3));
            setLoading(false)
        } catch (error) {
            console.error("Error on gettingTrackingDataByEmpId: ", error);
            setLoading(false)
        }
    };

    useEffect(() => {
        gettingTrackingDataByEmpId();
    }, [staff, loading]);

    useEffect(() => {
        if (viewDates.start && viewDates.end) {
            calculateDurationsAndAmounts(events, viewDates.start, viewDates.end);
        }
    }, [viewDates, events]);

    // calculating rate with seconds
    const calculateRate = (totalTimeInSeconds) => {
        const hourlyRate = staff?.rate; // $15 per hour
        const secondsInAnHour = 3600; // 60 seconds * 60 minutes
        const ratePerSecond = hourlyRate / secondsInAnHour;
        // console.log("staff rate: ", staff?.rate);
        // console.log("totlaTimeInSeconds: ", totalTimeInSeconds);
        if (totalTimeInSeconds >= 5) {
            let totalRate = ratePerSecond * totalTimeInSeconds;
            // console.log("in if condition: ", totalRate);
            return totalRate.toFixed(3);
        } else {
            return (ratePerSecond * 5).toFixed(3); // Minimum rate for 5 seconds
        }
    };

    // ui edit for showing daily time like 0 hours 0 min 0 sec
    const renderDayCellContent = (dayCellInfo) => {
        const date = moment(dayCellInfo.date).format('YYYY-MM-DD');
        const duration = dailyDurations[date];
        // console.log("duration: ", dayCellInfo.date);
        return (
            <Box sx={{ width: '100%', textAlign: 'center' }}>
                <Typography sx={{ textAlign: 'center', color: 'black' }}>{dayCellInfo.dayNumberText}</Typography>
                {duration && <Typography sx={{ color: 'black' }}>{duration}</Typography>}
            </Box>
        );
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


    // this is ui to show the daily multiple events data
    const renderEventContent = (eventInfo) => {
        const startTime = moment(eventInfo.event.start).format('hh:mm:ss a');
        const endTime = moment(eventInfo.event.end).format('hh:mm:ss a');
        // console.log("evtnInfo: ", eventInfo);
        let duration = (eventInfo.event.end - eventInfo.event.start) / 1000
        // let duration1 = `${Math.floor(duration.asHours())} hours, ${duration.minutes()} min, ${duration.seconds()} sec`;
        let amount = calculateRate(duration)
        // console.log("amount: ", duration);
        return (
            <Tooltip title={`Duration: ${formatDuration(duration)}`}>
                <Box sx={{ width: '100%', px: 1, textAlign: 'center', bgcolor: 'lightgray', borderRadius: 1 }}>
                    <Typography sx={{ alignSelf: 'center', color: 'black' }}>{eventInfo.event.title}</Typography>
                    <Typography sx={{ color: 'black' }}>Start: {startTime}</Typography>
                    <Typography sx={{ color: 'black' }}>End: {endTime}</Typography>
                    <Typography sx={{ color: 'black' }}>Amount: $ {amount}</Typography>
                </Box>
            </Tooltip>
        );
    };

    const totalDurationInSeconds = events.reduce((total, event) => total + event.duration.asSeconds(), 0);

    const calculateDurationsAndAmounts = (events, startDate, endDate) => {
        const filteredEvents = events.filter(event => {
            const eventStart = moment(event.start);
            return eventStart.isBetween(startDate, endDate, null, '[]');
        });

        const durations = filteredEvents.reduce((acc, item) => {
            const date = moment(item.start).format('YYYY-MM-DD');

            if (!acc[date]) {
                acc[date] = moment.duration(0);
            }

            acc[date].add(item.duration);
            return acc;
        }, {});

        const formattedDurations = Object.keys(durations).reduce((acc, date) => {
            const duration = durations[date];
            acc[date] = `${Math.floor(duration.asHours())} hours, ${duration.minutes()} min, ${duration.seconds()} sec`;
            return acc;
        }, {});

        setDailyDurations(formattedDurations);

        const totalAmount = filteredEvents.reduce((acc, event) => {
            const durationInSeconds = event.duration.asSeconds();
            const amount = calculateRate(durationInSeconds);
            return acc + parseFloat(amount);
        }, 0);

        setTotalAmount(totalAmount.toFixed(2));
    };


    const exportToExcel = () => {
        const filteredEvents = events.filter(event => {
            const eventStart = moment(event.start);
            return eventStart.isBetween(viewDates.start, viewDates.end, null, '[]');
        });

        const formattedData = filteredEvents.map(event => ({
            Name: staff?.name,
            Email: staff?.email,
            "Job Name": event.title,
            "Shift Name": staff && staff?.shift ? staff?.shift?.map(s => s.name).join(', ') : null,
            "Clock In": moment(event.start).format('YYYY-MM-DD HH:mm:ss'),
            "Clock Out": moment(event.end).format('YYYY-MM-DD HH:mm:ss'),
            "Duration": `${event.duration.hours()} hours, ${event.duration.minutes()} min, ${event.duration.seconds()} sec`,
            Amount: calculateRate(event.duration.asSeconds())
        }));

        const totalMonthlyAmount = filteredEvents.reduce((acc, event) => {
            const durationInSeconds = event.duration.asSeconds();
            const amount = calculateRate(durationInSeconds);
            return acc + parseFloat(amount);
        }, 0);

        const totalAmountRow = {
            Name: staff?.name,
            Email: staff?.email,
            "Job Name": 'Total Amount',
            "Clock In": '',
            "Clock Out": '',
            "Duration": '',
            Amount: totalMonthlyAmount.toFixed(4)
        };

        const worksheet = XLSX.utils.json_to_sheet([...formattedData, totalAmountRow]);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');
        XLSX.writeFile(workbook, `${staff?.email}.xlsx`);
    };


    const handleDatesSet = (dateInfo) => {
        setViewDates({ start: moment(dateInfo.start).startOf('day'), end: moment(dateInfo.end).endOf('day') });
    };

    return (
        <Box sx={{ width: '100%', height: '100%' }}>
            <Backdrop sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }} open={loading}>
                <CircularProgress color="inherit" />
            </Backdrop>
            <Button color='success' sx={{ my: 1 }} variant="contained" onClick={exportToExcel}>Export to Excel</Button>

            <Typography>Total Amount: $ {totalAmount}</Typography>
            <FullCalendar plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]} initialView="dayGridMonth" headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek' }} events={events} eventContent={renderEventContent} dayCellContent={renderDayCellContent} datesSet={handleDatesSet} />
        </Box>
    )
}

export default CalendarView