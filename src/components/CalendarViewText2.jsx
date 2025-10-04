/* import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Box, Typography } from '@mui/material';
import axios from 'axios';
import moment from 'moment';
import './styls.css'

const bashUrl = process.env.REACT_APP_BASH_URL;

function CalendarViewText2({ staff }) {

    const options = { Authorization: `Bearer ${localStorage.getItem("shinpay-vendor-token")}`, "Content-Type": "application/json" };

    const [events, setEvents] = useState([]);
    const [dailyDurations, setDailyDurations] = useState({});

    const gettingTrackingDataByEmpId = async () => {
        try {
            const response = await axios.get(`${bashUrl}/tracking/get-tracking-by-user-id/${staff?._id}`, { headers: options });
            const formattedEvents = response.data.result?.map((item) => ({
                title: item?.name || 'Job Name',
                start: moment(item?.startTime).toDate(),
                end: moment(item?.endTime).toDate(),
                duration: moment.duration(moment(item?.endTime).diff(moment(item?.startTime)))
            }));

            setEvents(formattedEvents);

            const durations = formattedEvents.reduce((acc, item) => {
                const date = moment(item.start).format('YYYY-MM-DD');

                if (!acc[date]) {
                    acc[date] = moment.duration(0);
                }

                acc[date].add(item.duration);
                return acc;
            }, {});

            const formattedDurations = Object.keys(durations).reduce((acc, date) => {
                const duration = durations[date];
                acc[date] = `${Math.floor(duration.asHours())} hours, ${duration.minutes()} minutes, ${duration.seconds()} seconds`;
                return acc;
            }, {});

            setDailyDurations(formattedDurations);
        } catch (error) {
            console.error("Error on gettingTrackingDataByEmpId: ", error);
        }
    };

    useEffect(() => {
        gettingTrackingDataByEmpId();
    }, [staff]);



    const renderDayCellContent = (dayCellInfo) => {
        const date = moment(dayCellInfo.date).format('YYYY-MM-DD');
        const duration = dailyDurations[date];

        return (
            <div>
                <div>{dayCellInfo.dayNumberText}</div>
                {duration && (
                    <div className="fc-day-duration">
                        <small>Total: {duration}</small>
                    </div>
                )}
            </div>
        );
    };



    const renderEventContent = (eventInfo) => {
        const startTime = moment(eventInfo.event.start).format('hh:mm:ss a');
        const endTime = moment(eventInfo.event.end).format('hh:mm:ss a');
        return (
            <div style={{width: '100%', textAlign: 'center'}}>
                <Typography sx={{ alignSelf: 'center', color: 'black' }}>{eventInfo.event.title}</Typography>
                <Typography sx={{ color: 'black' }}>Start: {startTime}</Typography>
                <Typography sx={{ color: 'black' }}>End: {endTime}</Typography>
            </div>
        );
    };


    return (
        <Box sx={{ width: '100%', height: '100%' }}>
            <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                headerToolbar={{
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth,timeGridWeek'
                }}
                events={events}
                eventContent={renderEventContent}
                dayCellContent={renderDayCellContent}
                eventOverlap={false}
                allDaySlot={false}
            />
        </Box>
    );
}

export default CalendarViewText2 */


/* import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Box } from '@mui/material';
import axios from 'axios';
import moment from 'moment';
import './styls.css'


const bashUrl = process.env.REACT_APP_BASH_URL;

function CalendarViewText2({ staff }) {
    const options = {
        Authorization: `Bearer ${localStorage.getItem("shinpay-vendor-token")}`,
        "Content-Type": "application/json"
    };

    const [events, setEvents] = useState([]);
    const [dailyDurations, setDailyDurations] = useState({});

    const gettingTrackingDataByEmpId = async () => {
        try {
            const response = await axios.get(`${bashUrl}/tracking/get-tracking-by-user-id/${staff?._id}`, { headers: options });
            const formattedEvents = response.data.result.map((item) => ({
                title: item?.name || 'Job Name',
                start: moment(item?.startTime).toDate(),
                end: moment(item?.endTime).toDate(),
                duration: moment.duration(moment(item?.endTime).diff(moment(item?.startTime)))
            }));

            setEvents(formattedEvents);

            const durations = formattedEvents.reduce((acc, item) => {
                const date = moment(item.start).format('YYYY-MM-DD');

                if (!acc[date]) {
                    acc[date] = moment.duration(0);
                }

                acc[date].add(item.duration);
                return acc;
            }, {});

            const formattedDurations = Object.keys(durations).reduce((acc, date) => {
                const duration = durations[date];
                acc[date] = `${Math.floor(duration.asHours())} hours, ${duration.minutes()} minutes, ${duration.seconds()} seconds`;
                return acc;
            }, {});

            setDailyDurations(formattedDurations);
        } catch (error) {
            console.error("Error on gettingTrackingDataByEmpId: ", error);
        }
    };

    useEffect(() => {
        gettingTrackingDataByEmpId();
    }, [staff]);

    const renderDayCellContent = (dayCellInfo) => {
        const date = moment(dayCellInfo.date).format('YYYY-MM-DD');
        const duration = dailyDurations[date];

        return (
            <div>
                <div>{dayCellInfo.dayNumberText}</div>
                {duration && (
                    <div className="fc-day-duration">
                        <small>Total: {duration}</small>
                    </div>
                )}
            </div>
        );
    };

    const renderEventContent = (eventInfo) => {
        const startTime = moment(eventInfo.event.start).format('hh:mm:ss a');
        const endTime = moment(eventInfo.event.end).format('hh:mm:ss a');
        return (
            <div>
                <b>{startTime} - {endTime}</b>
                <i>{eventInfo.event.title}</i>
            </div>
        );
    };

    return (
        <Box sx={{ width: '100%', height: '100%' }}>
            <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                headerToolbar={{
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth,timeGridWeek'
                }}
                events={events}
                eventContent={renderEventContent}
                dayCellContent={renderDayCellContent}
                slotMinTime="08:00:00"
                slotMaxTime="20:00:00"
                eventOverlap={false}
                allDaySlot={false}
                slotLabelFormat={{
                    hour: 'numeric',
                    minute: '2-digit',
                    omitZeroMinute: false,
                    meridiem: 'short'
                }}
                eventTimeFormat={{
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    meridiem: 'short'
                }}
                expandRows={true}
                height="auto"
            />
        </Box>
    );
}

export default CalendarViewText2; */

import React, { useEffect, useRef, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Box, Tooltip, Typography, Button } from '@mui/material';
import axios from 'axios';
import moment from 'moment';
import * as XLSX from 'xlsx';
import './styls.css';

const bashUrl = process.env.REACT_APP_BASH_URL;


function CalendarViewText2({ staff }) {
    const options = { Authorization: `Bearer ${localStorage.getItem("shinpay-vendor-token")}`, "Content-Type": "application/json" };

    const calendarRef = useRef(null)

    const [events, setEvents] = useState([]);
    const [dailyDurations, setDailyDurations] = useState({});

    const gettingTrackingDataByEmpId = async () => {
        try {
            const response = await axios.get(`${bashUrl}/tracking/get-tracking-by-user-id/${staff?._id}`, { headers: options });
            const formattedEvents = response.data.result.map((item) => ({
                title: item?.name || 'Job Name',
                start: moment(item?.startTime).toDate(),
                end: moment(item?.endTime).toDate(),
                duration: moment.duration(moment(item?.endTime).diff(moment(item?.startTime)))
            }));

            setEvents(formattedEvents);

            const durations = formattedEvents.reduce((acc, item) => {
                const date = moment(item.start).format('YYYY-MM-DD');

                if (!acc[date]) {
                    acc[date] = moment.duration(0);
                }

                acc[date] = acc[date].add(item.duration);
                return acc;
            }, {});

            const formattedDurations = Object.keys(durations).reduce((acc, date) => {
                const duration = durations[date];
                acc[date] = `${Math.floor(duration.asHours())} hours, ${duration.minutes()} min, ${duration.seconds()} sec`;
                return acc;
            }, {});

            setDailyDurations(formattedDurations);
        } catch (error) {
            console.error("Error on gettingTrackingDataByEmpId: ", error);
        }
    };

    useEffect(() => {
        gettingTrackingDataByEmpId();
    }, [staff]);

    const renderDayCellContent = (dayCellInfo) => {
        const date = moment(dayCellInfo.date).format('YYYY-MM-DD');
        const duration = dailyDurations[date];
        return (
            <Box sx={{ width: '100%', textAlign: 'center', padding: '4px', backgroundColor: '#f0f0f0' }}>
                <Typography sx={{ textAlign: 'center', color: 'black' }}>{dayCellInfo.dayNumberText}</Typography>
                {duration && <Typography sx={{ color: 'black' }}>{duration}</Typography>}
            </Box>
        );
    };

    const renderEventContent = (eventInfo) => {
        const startTime = moment(eventInfo.event.start).format('hh:mm:ss a');
        const endTime = moment(eventInfo.event.end).format('hh:mm:ss a');
        return (
            <Tooltip title={`Duration: ${(eventInfo.event.end - eventInfo.event.start) / 1000} seconds.`}>
                <Box sx={{ width: '100%', textAlign: 'center', backgroundColor: '#e0e0e0', borderRadius: '4px', marginBottom: '4px', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    <Typography sx={{ alignSelf: 'center', color: 'black', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{eventInfo.event.title}</Typography>
                    <Typography sx={{ color: 'black', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Start: {startTime}</Typography>
                    <Typography sx={{ color: 'black', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>End: {endTime}</Typography>
                </Box>
            </Tooltip>
        );
    };

    const exportToExcel = () => {
        const formattedData = events.map(event => ({
            Title: event.title,
            Start: moment(event.start).format('YYYY-MM-DD HH:mm:ss'),
            End: moment(event.end).format('YYYY-MM-DD HH:mm:ss'),
            Duration: `${event.duration.hours()} hours, ${event.duration.minutes()} min, ${event.duration.seconds()} sec`
        }));

        const worksheet = XLSX.utils.json_to_sheet(formattedData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Month Report');
        XLSX.writeFile(workbook, `${staff?.email}.xlsx`);
    };

    return (
        <Box sx={{ width: '100%', height: '100%' }}>
            {/* <Button sx={{ my: 1 }} variant="contained" color="primary" onClick={exportToExcel}>Export to Excel</Button> */}
            <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                headerToolbar={{
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth,timeGridWeek,timeGridDay'
                }}
                events={events}
                eventContent={renderEventContent}
                dayCellContent={renderDayCellContent}
                ref={calendarRef}
                // height="auto"
                // slotMinHeight={50} // Ensure each slot has a minimum height
                // slotDuration="00:30:00" // Adjust this to control the time slots height
                // expandRows={true}
            />
        </Box>
    );
}

export default CalendarViewText2;