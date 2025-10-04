import React, { useEffect, useState, useCallback } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useDispatch, useSelector } from "react-redux";
import { fetchCareGiverByVendor } from "../../../../store/IDB_SYS/Clients/careGiverSlice";
import { fetchClientByVendor } from "../../../../store/IDB_SYS/Clients/clientSlice";
import { fetchSchedules, updateSchedule } from "../../../../store/IDB_SYS/scheduler/scheduleSlice";
import "./month.css";
import { useParams } from "react-router-dom";
import SchedulePopup from "../../../components/Popup/SchedulePopup";

const localizer = momentLocalizer(moment);

const DataGrid = ({isPopupOpen , togglePopup, setIsPopupOpen}) => {
  const dispatch = useDispatch();
  const [calendarView, setCalendarView] = useState("month");
  const { view } = useParams();

  useEffect(() => {
    switch (view) {
      case "month":
        setCalendarView("month");
        break;
      case "week":
        setCalendarView("week");
        break;
      case "day":
        setCalendarView("day");
        break;
      default:
        setCalendarView("month");
    }
  }, [view]);
  
  const { careGiver } = useSelector((state) => state.careGiver);
  const { clients } = useSelector((state) => state.client);
  const { schedule, loading: scheduleLoading } = useSelector(
    (state) => state.schedule
  );

  const [events, setEvents] = useState([]);
  const [formData, setFormData] = useState({ title: "", description: "" });
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedClient, setSelectedClient] = useState("");
  const [selectedCaregiver, setSelectedCaregiver] = useState("");
  const [totalAmount, setTotalAmount] = useState(0);
  const [noData, setNoData] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0); // Add refresh trigger

  useEffect(() => {
    dispatch(fetchCareGiverByVendor());
    dispatch(fetchClientByVendor());
  }, [dispatch]);

  useEffect(() => {
    if (selectedCaregiver) {
      fetchDataForCurrentMonth();
    } else {
      setEvents([]);
      setTotalAmount(0);
      setNoData(true);
    }
  }, [selectedCaregiver, refreshTrigger]); // Add refreshTrigger dependency

  useEffect(() => {
    combineEvents();
  }, [schedule, currentDate]); // Added currentDate to re-render events on month change

  const fetchDataForCurrentMonth = (newDate) => {
    setIsLoading(true);
    Promise.all([fetchSchedulesData(newDate)]).finally(() =>
      setIsLoading(false)
    );
  };

  const fetchSchedulesData = async (newDate) => {
    const month = moment(newDate || currentDate).format("YYYY-MM"); // Use currentDate if newDate not provided

    const filters = {
      caregiver: selectedCaregiver,
      month,
    };

    try {
      await dispatch(fetchSchedules(filters)).unwrap();
    } catch (error) {
      console.error("Error fetching schedules:", error);
    }
  };

  const combineDateWithTime = (date, timeString) => {
  const [hours, minutes, seconds] = timeString.split(':').map(Number);
  const newDate = new Date(date);
  newDate.setHours(hours, minutes, seconds || 0, 0);
  return newDate;
};

const combineEvents = useCallback(() => {
  if (!schedule || schedule.length === 0) {
    setEvents([]);
    return;
  }

  const scheduleEvents = schedule.flatMap((scheduleItem) => {
    const events = [];
    const startOfMonth = moment(currentDate).startOf('month');
    const endOfMonth = moment(currentDate).endOf('month');
    
    const scheduleStart = moment(scheduleItem.start);
    const scheduleEnd = moment(scheduleItem.end);

    // For recurring events with specific days
    if (scheduleItem.frequency && scheduleItem.frequency !== "none" && scheduleItem.days) {
      const daysOfWeek = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

      let currentDateIter = moment.max(scheduleStart.clone(), startOfMonth);
      const iterationEndDate = moment.min(scheduleEnd.clone(), endOfMonth);

      while (currentDateIter.isSameOrBefore(iterationEndDate)) {
        const dayName = daysOfWeek[currentDateIter.day()].toLowerCase();

        if (scheduleItem.days[dayName]) {
          const eventStart = currentDateIter.clone()
            .set({
              hour: scheduleStart.hour(),
              minute: scheduleStart.minute(),
              second: 0,
              millisecond: 0
            });

          const eventEnd = currentDateIter.clone()
            .set({
              hour: scheduleEnd.hour(),
              minute: scheduleEnd.minute(),
              second: 0,
              millisecond: 0
            });

          // Only add if it's within the current month
          if (eventStart.isSameOrAfter(startOfMonth) && eventEnd.isSameOrBefore(endOfMonth)) {
            events.push(createEventObject(scheduleItem, eventStart.toDate(), eventEnd.toDate()));
          }
        }
        currentDateIter.add(1, "day");
      }
    } 
    // For non-recurring events
    else {
      // Check if the single event falls within the current month
      if (scheduleStart.isSameOrAfter(startOfMonth) && scheduleEnd.isSameOrBefore(endOfMonth)) {
        events.push(createEventObject(scheduleItem, scheduleStart.toDate(), scheduleEnd.toDate()));
      }
    }

    return events;
  });
  
  setEvents(scheduleEvents);
}, [schedule, currentDate]);


 const createEventObject = (schedule, start, end) => {
  // Extract time from shift
  const shiftStartTime = schedule?.service?.shift?.start 
    ? moment(schedule.service.shift.start).format('HH:mm:ss') 
    : '00:00:00';
  
  const shiftEndTime = schedule?.service?.shift?.end 
    ? moment(schedule.service.shift.end).format('HH:mm:ss') 
    : '00:00:00';

  // Create new dates by combining the event date with shift time
  const eventStart = combineDateWithTime(start, shiftStartTime);
  const eventEnd = combineDateWithTime(end, shiftEndTime);

  return {
    id: `${schedule.id || schedule._id}-${start.getTime()}`,
    title: `${schedule?.service?.name} - ${schedule.client?.firstName} ${schedule.client?.lastName}`,
    start: eventStart,  // Combined date with shift time
    end: eventEnd,      // Combined date with shift time
    allDay: false,
    resource: schedule,
    extendedProps: {
      type: "schedule",
      service: schedule?.service,
      jobName: schedule?.service?.name,
      duration: calculateDuration(eventStart, eventEnd),
      client: schedule.client,
      caregiver: schedule.caregiver,
      confirmation: schedule.confirmation,
      serviceOrder: schedule.serviceOrder,
      payor: schedule.payor,
      isRecurring: schedule.frequency !== "none",
    },
  };
};

  const calculateDuration = (start, end) => {
    const startMoment = moment(start);
    const endMoment = moment(end);
    const hours = endMoment.diff(startMoment, "hours");
    const minutes = endMoment.diff(startMoment, "minutes") % 60;

    if (hours > 0 && minutes > 0) {
      return `${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${minutes}m`;
    }
  };

  const handleNavigate = (newDate) => {
    setCurrentDate(newDate);
    if (selectedCaregiver) {
      fetchDataForCurrentMonth(newDate);
    }
  };

  const navigateMonth = (direction) => {
    const newDate = moment(currentDate)
      .add(direction === "next" ? 1 : -1, "month")
      .toDate();
    handleNavigate(newDate);
  };

  const formatMonthYear = (date) => {
    return moment(date).format("MMMM YYYY");
  };

  const formatTime = (date) => {
     return moment(date).format('hh:mm A');
  };

  const handleEventClick = (event) => {
    console.log('(event.resource : ',event.resource)
    setSelectedEvent(event.resource);
    
    setShowEditModal(true);
  };

  // Improved handleSave function to prevent duplicates
  const handleSave = async () => {
    try {
      // Force a refresh by incrementing the refresh trigger
      setRefreshTrigger(prev => prev + 1);
        console.log('caleed...........')
        setIsPopupOpen(false);
      // if (isEdit) {
      //   setShowEditModal(false);
      //   setSelectedEvent(null);
        
      //   // Small delay to ensure state updates before refetching
      //   setTimeout(() => {
         
      //   }, 100);
      // }
    } catch (error) {
      console.error("Error saving schedule:", error);
    }
  };

 const renderEventContent = (eventInfo) => {
  const { extendedProps, start, end } = eventInfo.event;
  
  return (
    <div className="event-card">
      <div className="event-header">
        <span className={`event-status ${extendedProps.confirmation}`}>
          {extendedProps.confirmation}
        </span>
      </div>
      <div className="event-job">{extendedProps.jobName}</div>
      <div className="event-client">
        Client: {extendedProps.client?.firstName} {extendedProps.client?.lastName}
      </div>
      <div className="event-times">
        <div className="event-time">
          <span className="time-icon">🕒</span>
          {formatTime(start)} - {formatTime(end)}
        </div>
      </div>
      <div className="event-service-order">
        SO: {extendedProps.serviceOrder}
      </div>
    </div>
  );
};

  return (
    <div className="calendar-page-container">
      {/* Filter Section */}
      <div className="d-flex align-items-center gap-4 justify-content-center bg-white p-2 mb-3 border">
        {/* Clients Dropdown */}
        <select
          className="form-select form-select-sm"
          value={selectedClient}
          onChange={(e) => setSelectedClient(e.target.value)}
          style={{ width: "200px" }}
          // disabled={true}
        >
          <option value="" disabled>
            Clients
          </option>
          {clients.map((row) => (
            <option key={row._id} value={row._id}>
              {row.firstName} {row.middleInitial} {row.lastName}
            </option>
          ))}
        </select>

        <button className="btn btn-sm btn-success">⋯</button>
        <button className="btn btn-outline-success btn-sm">
          <i className="bi bi-funnel"></i> Filters
        </button>

        <button
          className="btn btn-success btn-sm"
          onClick={() => navigateMonth("prev")}
        >
          ⏪
        </button>

        <span className="px-1 border text-center" style={{ width: "200px" }}>
          {formatMonthYear(currentDate)}
        </span>

        <button
          className="btn btn-success btn-sm"
          onClick={() => navigateMonth("next")}
        >
          ⏩
        </button>

        <button className="btn btn-outline-success btn-sm">
          <i className="bi bi-display"></i> Display Options
        </button>

        <select
          className="form-select form-select-sm"
          value={selectedCaregiver}
          onChange={(e) => setSelectedCaregiver(e.target.value)}
          style={{ width: "200px" }}
        >
          <option value="" disabled>
            Select CareGiver
          </option>
          {careGiver.map((manager) => (
            <option key={manager._id} value={manager._id}>
              {manager.firstName ?? ""}{" "}
              {manager.lastName != "" ? manager.lastName : manager.email}
            </option>
          ))}
        </select>

        <button className="btn btn-sm btn-success">⋯</button>
      </div>
      
      {/* Calendar Container */}
      <div className="calendar-main-container">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          views={{ [calendarView]: true }}
          view={calendarView} // 👈 force selected view
          components={{
            month: {
              event: renderEventContent,
            },
            week: {
              event: renderEventContent,
            },
            day: {
              event: renderEventContent,
            },
          }}
          style={{ 
            height: "calc(100vh - 180px)",
            minHeight: "600px",
            margin: "0",
            padding: "0"
          }}
          date={currentDate}
          onNavigate={handleNavigate}
          onSelectEvent={handleEventClick}
        />
      </div>

      {/* Add Schedule Popup */}
      <SchedulePopup
        isOpen={isPopupOpen}
        toggle={togglePopup}
        onSave={handleSave}
      />

      {/* Edit Schedule Modal */}
      {selectedEvent && (
        <SchedulePopup
          setSelectedEvent={setSelectedEvent}
          isOpen={showEditModal}
          toggle={() => setShowEditModal(false)}
          onSave={handleSave}
          schedule={selectedEvent}
          isEdit={true}
        />
      )}
    </div>
  );
};

export default DataGrid;