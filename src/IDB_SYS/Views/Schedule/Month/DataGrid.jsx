import React, { useEffect, useState, useCallback } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useDispatch, useSelector } from "react-redux";
import { fetchCareGiverByVendor } from "../../../../store/IDB_SYS/Clients/careGiverSlice";
import { fetchClientByVendor } from "../../../../store/IDB_SYS/Clients/clientSlice";
import { 
  fetchSchedules, 
  updateSchedule, 
  fetchClientInterruptions,
  clearClientInterruptions 
} from "../../../../store/IDB_SYS/scheduler/scheduleSlice";
import "./month.css";
import { useParams } from "react-router-dom";
import SchedulePopup from "../../../components/Popup/SchedulePopup";
import { toast } from "react-toastify";

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
  const { schedule, loading: scheduleLoading, clientInterruptions } = useSelector(
    (state) => state.schedule
  );

  const [events, setEvents] = useState([]);
  const [blockedEvents, setBlockedEvents] = useState([]); // Blocked date events from interruptions
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

  // Fetch client interruptions when a client is selected
  useEffect(() => {
    if (selectedClient) {
      const startOfMonth = moment(currentDate).startOf('month').format('YYYY-MM-DD');
      const endOfMonth = moment(currentDate).endOf('month').format('YYYY-MM-DD');
      
      dispatch(fetchClientInterruptions({
        clientId: selectedClient,
        start: startOfMonth,
        end: endOfMonth
      }));
    } else {
      dispatch(clearClientInterruptions());
      setBlockedEvents([]);
    }
  }, [selectedClient, currentDate, dispatch]);

  // Convert client interruptions to blocked calendar events
  useEffect(() => {
    if (!clientInterruptions || clientInterruptions.length === 0) {
      setBlockedEvents([]);
      return;
    }

    const startOfMonth = moment(currentDate).startOf('month');
    const endOfMonth = moment(currentDate).endOf('month');

    const blocked = clientInterruptions.map((interruption, index) => {
      const intStart = moment(interruption.startDate);
      const intEnd = moment(interruption.endDate);
      
      // Adjust dates to be within the current month view
      const eventStart = moment.max(intStart, startOfMonth).toDate();
      const eventEnd = moment.min(intEnd, endOfMonth).endOf('day').toDate();

      return {
        id: `blocked-${index}-${interruption.startDate}`,
        title: `🚫 Service Blocked${interruption.type ? ` (${interruption.type})` : ''}`,
        start: eventStart,
        end: eventEnd,
        allDay: true,
        resource: {
          type: 'interruption',
          interruption: interruption
        },
        extendedProps: {
          type: 'interruption',
          interruptionType: interruption.type,
          reason: interruption.reason,
          status: interruption.status,
          isBlocked: true
        }
      };
    });

    setBlockedEvents(blocked);
  }, [clientInterruptions, currentDate]);

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
  }, [schedule, currentDate, blockedEvents]); // Added blockedEvents dependency

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
  const scheduleEvents = [];
  
  if (schedule && schedule.length > 0) {
    schedule.forEach((scheduleItem) => {
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
              scheduleEvents.push(createEventObject(scheduleItem, eventStart.toDate(), eventEnd.toDate()));
            }
          }
          currentDateIter.add(1, "day");
        }
      } 
      // For non-recurring events
      else {
        // Check if the single event falls within the current month
        if (scheduleStart.isSameOrAfter(startOfMonth) && scheduleEnd.isSameOrBefore(endOfMonth)) {
          scheduleEvents.push(createEventObject(scheduleItem, scheduleStart.toDate(), scheduleEnd.toDate()));
        }
      }
    });
  }
  
  // Merge schedule events with blocked events (interruptions)
  const allEvents = [...scheduleEvents, ...blockedEvents];
  setEvents(allEvents);
}, [schedule, currentDate, blockedEvents]);


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
    // Don't allow editing blocked/interruption events
    if (event.extendedProps?.type === 'interruption' || event.extendedProps?.isBlocked) {
      toast.warning(`Service is blocked: ${event.extendedProps?.reason || 'Service Interruption'}`);
      return;
    }
    
    console.log('(event.resource : ',event.resource)
    setSelectedEvent(event.resource);
    
    setShowEditModal(true);
  };

  // Helper function to check if a date is within any blocked period
  const isDateBlocked = useCallback((date) => {
    if (!clientInterruptions || clientInterruptions.length === 0) return false;
    
    const checkDate = moment(date);
    return clientInterruptions.some(interruption => {
      const start = moment(interruption.startDate);
      const end = moment(interruption.endDate);
      return checkDate.isBetween(start, end, 'day', '[]'); // inclusive
    });
  }, [clientInterruptions]);

  // Handle slot selection (when user clicks on empty date)
  const handleSelectSlot = useCallback((slotInfo) => {
    if (selectedClient && isDateBlocked(slotInfo.start)) {
      toast.warning('Cannot schedule on blocked dates. Client has an active service interruption.');
      return;
    }
    // Allow opening the popup if not blocked
    // The popup will handle the actual scheduling
  }, [selectedClient, isDateBlocked]);

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
  const { extendedProps, start, end, title } = eventInfo.event;
  
  // Render blocked/interruption events differently
  if (extendedProps?.type === 'interruption' || extendedProps?.isBlocked) {
    return (
      <div className="event-card blocked-event">
        <div className="blocked-header">
          <span className="blocked-icon">🚫</span>
          <span className="blocked-label">BLOCKED</span>
        </div>
        {extendedProps?.interruptionType && (
          <div className="blocked-type">{extendedProps.interruptionType}</div>
        )}
        {extendedProps?.reason && (
          <div className="blocked-reason" title={extendedProps.reason}>
            {extendedProps.reason}
          </div>
        )}
      </div>
    );
  }
  
  // Regular schedule event
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
        >
          <option value="">
            All Clients
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
          eventPropGetter={(event) => {
            // Style blocked events differently
            if (event.extendedProps?.type === 'interruption' || event.extendedProps?.isBlocked) {
              return {
                className: 'rbc-event-blocked',
                style: {
                  backgroundColor: '#dc3545',
                  borderColor: '#c82333',
                  color: '#fff',
                  opacity: 0.9,
                }
              };
            }
            return {};
          }}
          dayPropGetter={(date) => {
            // Highlight blocked days
            if (selectedClient && isDateBlocked(date)) {
              return {
                className: 'rbc-day-blocked',
                style: {
                  backgroundColor: '#ffebee',
                }
              };
            }
            return {};
          }}
          selectable={true}
          onSelectSlot={handleSelectSlot}
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