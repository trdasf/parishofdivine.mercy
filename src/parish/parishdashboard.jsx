import React, { useState, useEffect } from 'react';
import './ParishDashboard.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faChevronLeft, 
  faChevronRight, 
  faInfoCircle, 
  faCalendarAlt, 
  faUsers, 
  faClipboardList,
  faHandshake,
  faCircle,
  faCheckCircle,
  faEye,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // Make sure axios is installed

const ParishDashboard = () => {
  const navigate = useNavigate();
  
  // Function to get current date in Philippines timezone
  const getPhilippinesDate = () => {
    return new Date(new Date().toLocaleString("en-US", {timeZone: "Asia/Manila"}));
  };
  
  // Function to convert time to 12-hour format with AM/PM
  const convertTo12HourFormat = (timeString) => {
    if (!timeString) return 'N/A';
    
    // Handle different time formats
    let time24 = timeString.toString().trim();
    
    // If already in 12-hour format, return as is
    if (time24.toLowerCase().includes('am') || time24.toLowerCase().includes('pm')) {
      return time24;
    }
    
    // Remove seconds if present (e.g., "14:30:00" -> "14:30")
    if (time24.includes(':')) {
      const parts = time24.split(':');
      if (parts.length >= 2) {
        time24 = `${parts[0]}:${parts[1]}`;
      }
    }
    
    // Parse the time
    const [hours, minutes] = time24.split(':');
    if (!hours || !minutes) return timeString; // Return original if can't parse
    
    const hour24 = parseInt(hours, 10);
    const min = parseInt(minutes, 10);
    
    if (isNaN(hour24) || isNaN(min)) return timeString; // Return original if invalid
    
    const period = hour24 >= 12 ? 'PM' : 'AM';
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
    const formattedMinutes = min.toString().padStart(2, '0');
    
    return `${hour12}:${formattedMinutes} ${period}`;
  };
  
  // Setting default date to current date in Philippines
  const [currentDate, setCurrentDate] = useState(getPhilippinesDate());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showHolidayInfo, setShowHolidayInfo] = useState(false);
  const [selectedHoliday, setSelectedHoliday] = useState(null);
  
  // State for data
  const [appointments, setAppointments] = useState([]);
  const [activities, setActivities] = useState([]);
  const [totalAppointments, setTotalAppointments] = useState(0);
  const [totalActivities, setTotalActivities] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Added modal state
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEventData, setSelectedEventData] = useState(null);
  
  // API Base URL
  const API_BASE_URL = 'https://parishofdivinemercy.com/backend';
  
  // Function to calculate Easter Sunday (needed for Holy Week calculations)
  const calculateEaster = (year) => {
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31) - 1; // 0-indexed month
    const day = ((h + l - 7 * m + 114) % 31) + 1;
    
    return new Date(year, month, day);
  };

  // Function to get the last Monday of a specific month
  const getLastMondayOfMonth = (year, month) => {
    const lastDay = new Date(year, month + 1, 0);
    const lastMonday = new Date(lastDay);
    while (lastMonday.getDay() !== 1) {
      lastMonday.setDate(lastMonday.getDate() - 1);
    }
    return lastMonday;
  };

  // Function to calculate Chinese New Year (approximate)
  const calculateChineseNewYear = (year) => {
    // This is a simplified calculation. For precise dates, you'd need a lunar calendar API
    const baseYear = 2024;
    const baseDate = new Date(2024, 1, 10); // Feb 10, 2024
    const yearDiff = year - baseYear;
    const daysToAdd = yearDiff * 354; // Lunar year is approximately 354 days
    const newDate = new Date(baseDate);
    newDate.setDate(newDate.getDate() + daysToAdd);
    
    // Adjust to ensure it falls between Jan 21 and Feb 20
    if (newDate.getMonth() === 0 && newDate.getDate() < 21) {
      newDate.setDate(21);
    } else if (newDate.getMonth() === 1 && newDate.getDate() > 20) {
      newDate.setDate(20);
    }
    
    return newDate;
  };

  // Function to calculate Islamic holidays (approximate)
  const calculateIslamicHolidays = (year) => {
    // Islamic calendar is lunar, approximately 11 days shorter than Gregorian
    // This is a simplified calculation. For precise dates, you'd need an Islamic calendar API
    const baseYear = 2024;
    const baseEidAlFitr = new Date(2024, 3, 10); // April 10, 2024
    const baseEidAlAdha = new Date(2024, 5, 17); // June 17, 2024
    
    const yearDiff = year - baseYear;
    const daysToSubtract = yearDiff * 11; // Islamic year is about 11 days shorter
    
    const eidAlFitr = new Date(baseEidAlFitr);
    eidAlFitr.setDate(eidAlFitr.getDate() - daysToSubtract);
    
    const eidAlAdha = new Date(baseEidAlAdha);
    eidAlAdha.setDate(eidAlAdha.getDate() - daysToSubtract);
    
    return { eidAlFitr, eidAlAdha };
  };

  // Function to get all holidays for a given year
  const getHolidaysForYear = (year) => {
    const holidays = [];
    
    // Regular holidays (fixed dates)
    holidays.push({ date: new Date(year, 0, 1), name: "New Year's Day", type: "Regular" });
    holidays.push({ date: new Date(year, 3, 9), name: "Araw ng Kagitingan", type: "Regular" });
    holidays.push({ date: new Date(year, 4, 1), name: "Labor Day", type: "Regular" });
    holidays.push({ date: new Date(year, 5, 12), name: "Independence Day", type: "Regular" });
    holidays.push({ date: new Date(year, 10, 30), name: "Bonifacio Day", type: "Regular" });
    holidays.push({ date: new Date(year, 11, 25), name: "Christmas Day", type: "Regular" });
    holidays.push({ date: new Date(year, 11, 30), name: "Rizal Day", type: "Regular" });
    
    // Special non-working holidays (fixed dates)
    holidays.push({ date: new Date(year, 7, 21), name: "Ninoy Aquino Day", type: "Special" });
    holidays.push({ date: new Date(year, 10, 1), name: "All Saints' Day", type: "Special" });
    holidays.push({ date: new Date(year, 10, 2), name: "All Souls' Day", type: "Special" });
    holidays.push({ date: new Date(year, 11, 8), name: "Immaculate Conception", type: "Special" });
    holidays.push({ date: new Date(year, 11, 24), name: "Christmas Eve", type: "Special" });
    holidays.push({ date: new Date(year, 11, 31), name: "New Year's Eve", type: "Special" });
    
    // EDSA Revolution Anniversary (February 25)
    holidays.push({ date: new Date(year, 1, 25), name: "EDSA Revolution", type: "Special" });
    
    // Moveable holidays
    
    // National Heroes Day (Last Monday of August)
    const nationalHeroesDay = getLastMondayOfMonth(year, 7);
    holidays.push({ date: nationalHeroesDay, name: "National Heroes Day", type: "Regular" });
    
    // Holy Week (based on Easter)
    const easter = calculateEaster(year);
    const holyThursday = new Date(easter);
    holyThursday.setDate(easter.getDate() - 3);
    const goodFriday = new Date(easter);
    goodFriday.setDate(easter.getDate() - 2);
    const blackSaturday = new Date(easter);
    blackSaturday.setDate(easter.getDate() - 1);
    
    holidays.push({ date: holyThursday, name: "Maundy Thursday", type: "Regular" });
    holidays.push({ date: goodFriday, name: "Good Friday", type: "Regular" });
    holidays.push({ date: blackSaturday, name: "Black Saturday", type: "Special" });
    
    // Chinese New Year
    const chineseNewYear = calculateChineseNewYear(year);
    holidays.push({ date: chineseNewYear, name: "Chinese New Year", type: "Special" });
    
    // Islamic holidays
    const islamicHolidays = calculateIslamicHolidays(year);
    holidays.push({ date: islamicHolidays.eidAlFitr, name: "Eid'l Fitr", type: "Regular" });
    holidays.push({ date: islamicHolidays.eidAlAdha, name: "Eid'l Adha", type: "Regular" });
    
    return holidays;
  };

  // Get holidays for the current year
  const [holidays, setHolidays] = useState([]);
  
  useEffect(() => {
    const year = currentDate.getFullYear();
    setHolidays(getHolidaysForYear(year));
  }, [currentDate]);
  
  // Fetch data when component mounts or currentDate changes
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Get the month and year from currentDate
        const month = currentDate.getMonth() + 1; // JavaScript months are 0-indexed
        const year = currentDate.getFullYear();
        
        // Fetch total appointments
        try {
          const totalAppsResponse = await axios.get(`${API_BASE_URL}/fetch_total_appointments.php`);
          if (totalAppsResponse.data && totalAppsResponse.data.success) {
            setTotalAppointments(totalAppsResponse.data.total_appointments);
          }
        } catch (err) {
          console.error('Error fetching total appointments:', err);
          // Continue execution, don't set error state yet
        }
        
        // Fetch total activities
        try {
          const totalActsResponse = await axios.get(`${API_BASE_URL}/fetch_total_activities.php`);
          if (totalActsResponse.data && totalActsResponse.data.success) {
            setTotalActivities(totalActsResponse.data.total_activities);
          }
        } catch (err) {
          console.error('Error fetching total activities:', err);
          // Continue execution, don't set error state yet
        }
        
        // Fetch monthly appointments with status=Approved
        try {
          const monthlyAppsResponse = await axios.get(`${API_BASE_URL}/fetch_all_appointments.php`);
          if (monthlyAppsResponse.data && monthlyAppsResponse.data.success) {
            // Filter approved appointments for current month/year
            const filteredAppointments = monthlyAppsResponse.data.appointments.filter(app => {
              // Create a Date object from the date string
              let dateObj;
              
              if (app.date) {
                dateObj = new Date(app.date);
                
                // If date parsing fails, try different formats
                if (isNaN(dateObj.getTime())) {
                  // Try MM/DD/YYYY format
                  const dateParts = app.date.split('/');
                  if (dateParts.length === 3) {
                    dateObj = new Date(parseInt(dateParts[2]), parseInt(dateParts[0]) - 1, parseInt(dateParts[1]));
                  } else {
                    // Try YYYY-MM-DD format
                    const dashParts = app.date.split('-');
                    if (dashParts.length === 3) {
                      dateObj = new Date(parseInt(dashParts[0]), parseInt(dashParts[1]) - 1, parseInt(dashParts[2]));
                    }
                  }
                }
              } else {
                return false; // Skip entries without dates
              }
              
              // Filter by month, year and status
              return dateObj.getMonth() + 1 === month && 
                     dateObj.getFullYear() === year && 
                     app.status.toLowerCase() === 'approved';
            }).map(app => {
              // Convert date strings to Date objects
              let dateObj;
              
              if (app.date) {
                dateObj = new Date(app.date);
                
                // If date parsing fails, try different formats
                if (isNaN(dateObj.getTime())) {
                  // Try MM/DD/YYYY format
                  const dateParts = app.date.split('/');
                  if (dateParts.length === 3) {
                    dateObj = new Date(parseInt(dateParts[2]), parseInt(dateParts[0]) - 1, parseInt(dateParts[1]));
                  } else {
                    // Try YYYY-MM-DD format
                    const dashParts = app.date.split('-');
                    if (dashParts.length === 3) {
                      dateObj = new Date(parseInt(dashParts[0]), parseInt(dashParts[1]) - 1, parseInt(dashParts[2]));
                    }
                  }
                }
              } else {
                dateObj = new Date(); // Default to current date if no date is provided
              }
              
              return {
                ...app,
                date: dateObj
              };
            });
            
            setAppointments(filteredAppointments);
          }
        } catch (err) {
          console.error('Error fetching monthly appointments:', err);
          setAppointments([]);
        }
        
        // Fetch activities with status=Approved
        try {
          const activitiesResponse = await axios.get(`${API_BASE_URL}/fetch_activities.php?status=Approved`);
          if (activitiesResponse.data && activitiesResponse.data.success) {
            // Filter for current month/year
            const filteredActivities = activitiesResponse.data.activities.filter(activity => {
              // Try to parse startDate
              let dateObj;
              
              if (activity.startDate) {
                dateObj = new Date(activity.startDate);
                
                // If date parsing fails, try different formats
                if (isNaN(dateObj.getTime())) {
                  // Try MM/DD/YYYY format
                  const dateParts = activity.startDate.split('/');
                  if (dateParts.length === 3) {
                    dateObj = new Date(parseInt(dateParts[2]), parseInt(dateParts[0]) - 1, parseInt(dateParts[1]));
                  } else {
                    // Try YYYY-MM-DD format
                    const dashParts = activity.startDate.split('-');
                    if (dashParts.length === 3) {
                      dateObj = new Date(parseInt(dashParts[0]), parseInt(dashParts[1]) - 1, parseInt(dashParts[2]));
                    }
                  }
                }
              } else {
                return false; // Skip entries without dates
              }
              
              // Filter by month and year
              return dateObj.getMonth() + 1 === month && 
                     dateObj.getFullYear() === year;
            }).map(activity => {
              // Create a Date object
              let dateObj;
              
              if (activity.startDate) {
                dateObj = new Date(activity.startDate);
                
                // If date parsing fails, try different formats
                if (isNaN(dateObj.getTime())) {
                  // Try MM/DD/YYYY format
                  const dateParts = activity.startDate.split('/');
                  if (dateParts.length === 3) {
                    dateObj = new Date(parseInt(dateParts[2]), parseInt(dateParts[0]) - 1, parseInt(dateParts[1]));
                  } else {
                    // Try YYYY-MM-DD format
                    const dashParts = activity.startDate.split('-');
                    if (dashParts.length === 3) {
                      dateObj = new Date(parseInt(dashParts[0]), parseInt(dashParts[1]) - 1, parseInt(dashParts[2]));
                    }
                  }
                }
              } else {
                dateObj = new Date(); // Default to current date if no date is provided
              }
              
              return {
                ...activity,
                date: dateObj,
                // Create standardized fields if needed
                time: activity.startTime || '12:00 PM'
              };
            });
            
            setActivities(filteredActivities);
          }
        } catch (err) {
          console.error('Error fetching activities:', err);
          setActivities([]);
        }
        
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [currentDate, API_BASE_URL]);
  
  // Navigate to previous month
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  // Navigate to next month
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Check if a date has a holiday
  const hasHoliday = (date) => {
    return holidays.some(holiday => 
      holiday.date.getDate() === date.getDate() && 
      holiday.date.getMonth() === date.getMonth() && 
      holiday.date.getFullYear() === date.getFullYear()
    );
  };

  // Get holiday for a specific date
  const getHoliday = (date) => {
    return holidays.find(holiday => 
      holiday.date.getDate() === date.getDate() && 
      holiday.date.getMonth() === date.getMonth() && 
      holiday.date.getFullYear() === date.getFullYear()
    );
  };

  // Check if a date has an appointment
  const hasAppointment = (date) => {
    return appointments.some(appointment => 
      appointment.date.getDate() === date.getDate() && 
      appointment.date.getMonth() === date.getMonth() && 
      appointment.date.getFullYear() === date.getFullYear()
    );
  };

  // Check if a date has an event
  const hasEvent = (date) => {
    return activities.some(activity => 
      activity.date.getDate() === date.getDate() && 
      activity.date.getMonth() === date.getMonth() && 
      activity.date.getFullYear() === date.getFullYear()
    );
  };

  // Format date to display in the header
  const formatMonthYear = (date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    
    const daysInMonth = lastDayOfMonth.getDate();
    const firstDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      days.push(date);
    }
    
    return days;
  };

  // Handle day click
  const handleDayClick = (date) => {
    if (date) {
      setSelectedDate(date);
      
      // Check if the date has a holiday
      if (hasHoliday(date)) {
        setSelectedHoliday(getHoliday(date));
        setShowHolidayInfo(true);
      } else {
        setShowHolidayInfo(false);
        setSelectedHoliday(null);
      }
    }
  };

  // Format date for display
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  };

  // Format date for table display in YYYY-MM-DD format
  const formatDateShort = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // View details functions - Updated to match requirements
  const viewAppointmentDetails = (appointment) => {
    // Navigate based on sacrament type, passing ID and status
    switch(appointment.sacramentType) {
      case "Baptism":
        navigate("/baptism-view", { 
          state: { 
            baptismID: appointment.id,
            status: appointment.status
          }
        });
        break;
      case "Marriage":
        navigate("/marriage-view", { 
          state: { 
            marriageID: appointment.id,
            status: appointment.status
          }
        });
        break;
      case "Funeral Mass":
        navigate("/funeral-mass-view", { 
          state: { 
            funeralID: appointment.id,
            status: appointment.status
          }
        });
        break;
      case "Blessing":
        navigate("/blessing-view", { 
          state: { 
            blessingID: appointment.id,
            status: appointment.status
          }
        });
        break;
      case "Communion":
        navigate("/communion-view", { 
          state: { 
            communionID: appointment.id,
            status: appointment.status
          }
        });
        break;
      case "Confirmation":
        navigate("/confirmation-view", { 
          state: { 
            confirmationID: appointment.id,
            status: appointment.status
          }
        });
        break;
      case "Anointing of the Sick and Viaticum":
        navigate("/anointing-of-the-sick-view", { 
          state: { 
            anointingID: appointment.id,
            status: appointment.status
          }
        });
        break;
      default:
        console.log(`Unknown sacrament: ${appointment.sacramentType}`);
    }
  };
  
  // View event details - Updated to match SecretaryActivitiesEvent component
  const viewEventDetails = (eventId) => {
    const event = activities.find(e => e.activityID === eventId);
    if (event) {
      setSelectedEventData(event);
      setShowEventModal(true);
    }
  };

  // Get specific day details if selected
  const getAppointmentsForSelectedDate = () => {
    if (!selectedDate) return [];
    
    return appointments.filter(appointment => 
      appointment.date.getDate() === selectedDate.getDate() && 
      appointment.date.getMonth() === selectedDate.getMonth() && 
      appointment.date.getFullYear() === selectedDate.getFullYear()
    );
  };
  
  const getEventsForSelectedDate = () => {
    if (!selectedDate) return [];
    
    return activities.filter(activity => 
      activity.date.getDate() === selectedDate.getDate() && 
      activity.date.getMonth() === selectedDate.getMonth() && 
      activity.date.getFullYear() === selectedDate.getFullYear()
    );
  };

  // Get status icon based on status
  const getStatusIcon = (status) => {
    const statusLower = status.toLowerCase();
    
    switch(statusLower) {
      case 'approved':
      case 'confirmed':
        return <FontAwesomeIcon icon={faCheckCircle} style={{ marginRight: '5px', color: '#155724' }} />;
      case 'pending':
        return <FontAwesomeIcon icon={faCircle} style={{ marginRight: '5px', color: '#856404' }} />;
      case 'cancelled':
      case 'rejected':
        return <FontAwesomeIcon icon={faCircle} style={{ marginRight: '5px', color: '#721c24' }} />;
      case 'completed':
        return <FontAwesomeIcon icon={faCheckCircle} style={{ marginRight: '5px', color: '#004085' }} />;
      default:
        return null;
    }
  };

  // Check if a date is today - Updated to use current Philippines date
  const isToday = (date) => {
    const today = getPhilippinesDate();
    return date.getDate() === today.getDate() && 
           date.getMonth() === today.getMonth() && 
           date.getFullYear() === today.getFullYear();
  };

  return (
    <div className="dashboard-container-parish">
      <h1 className="title-parish">PARISH DASHBOARD</h1>
      
      {/* Error message */}
      {error && (
        <div className="error-message-container">
          <FontAwesomeIcon icon={faExclamationTriangle} className="error-icon" />
          <span>{error}</span>
        </div>
      )}
      
      {/* Summary Cards */}
      <div className="summary-container-parish">
        <div className="card-parish appointments-card-parish">
          <div className="card-icon-parish">
            <FontAwesomeIcon icon={faCalendarAlt} />
          </div>
          <div className="card-content-sec">
            <h3 className="card-title-sec">Total Appointments</h3>
            <p className="card-count-parish">{loading ? "..." : totalAppointments}</p>
          </div>
        </div>
        <div className="card-parish events-card-parish">
          <div className="card-icon-parish">
            <FontAwesomeIcon icon={faUsers} />
          </div>
          <div className="card-content-parish">
            <h3 className="card-title-parish">Total Events</h3>
            <p className="card-count-parish">{loading ? "..." : totalActivities}</p>
          </div>
        </div>
      </div>
      
      {/* Calendar Section */}
      <div className="calendar-section-parish">
        <div className="calendar-header-parish">
          <button className="nav-btn-parish" onClick={prevMonth} aria-label="Previous month">
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>
          <h2 className="month-year-parish">
            <FontAwesomeIcon icon={faCalendarAlt} style={{ marginRight: '10px' }} />
            {formatMonthYear(currentDate)}
          </h2>
          <button className="nav-btn-parish" onClick={nextMonth} aria-label="Next month">
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
        </div>
        
        {loading ? (
          <div className="loading-calendar">
            <p>Loading calendar data...</p>
          </div>
        ) : (
          <div className="calendar-grid-parish">
            {/* Calendar week days */}
            <div className="weekday-parish">Sun</div>
            <div className="weekday-parish">Mon</div>
            <div className="weekday-parish">Tue</div>
            <div className="weekday-parish">Wed</div>
            <div className="weekday-parish">Thu</div>
            <div className="weekday-parish">Fri</div>
            <div className="weekday-parish">Sat</div>
            
            {/* Calendar days */}
            {generateCalendarDays().map((date, index) => (
              <div 
                key={index} 
                className={`calendar-day-parish 
                  ${!date ? 'empty-day-parish' : ''} 
                  ${date && hasAppointment(date) ? 'has-appointment-parish' : ''} 
                  ${date && hasEvent(date) ? 'has-event-parish' : ''} 
                  ${date && hasHoliday(date) ? 'holiday-day-parish' : ''} 
                  ${date && isToday(date) ? 'today-parish' : ''}
                  ${date && selectedDate && 
                    date.getDate() === selectedDate.getDate() && 
                    date.getMonth() === selectedDate.getMonth() && 
                    date.getFullYear() === selectedDate.getFullYear() 
                      ? 'selected-day-parish' 
                      : ''
                  }`}
                onClick={() => handleDayClick(date)}
                aria-label={date ? `${date.getDate()}, ${hasHoliday(date) ? 'Holiday' : ''} ${hasAppointment(date) ? 'Has appointment' : ''} ${hasEvent(date) ? 'Has event' : ''}` : 'Empty day'}
              >
                {date && (
                  <>
                    <span className="day-number-sec">{date.getDate()}</span>
                    {hasAppointment(date) && <div className="appointment-dot-sec"></div>}
                    {hasEvent(date) && <div className="event-dot-sec"></div>}
                    {hasHoliday(date) && (
                      <div className="holiday-indicator-sec">
                        <div 
                          className="holiday-dot-sec" 
                          style={{ 
                            backgroundColor: getHoliday(date).type === "Regular" ? "#e74c3c" : "#f39c12" 
                          }}
                        ></div>
                        <span className="holiday-name-sec">{getHoliday(date).name}</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        )}
        
        {/* Calendar Legend */}
        <div className="calendar-legend-parish">
          <div className="legend-item-parish">
            <div className="legend-dot-parish" style={{ backgroundColor: "#e74c3c" }}></div>
            <span>Regular Holiday</span>
          </div>
          <div className="legend-item-parish">
            <div className="legend-dot-parish" style={{ backgroundColor: "#f39c12" }}></div>
            <span>Special Holiday</span>
          </div>
          <div className="legend-item-parish">
            <div className="legend-dot-parish appointment-legend-parish"></div>
            <span>Appointment Scheduled</span>
          </div>
          <div className="legend-item-parish">
            <div className="legend-dot-parish event-legend-parish"></div>
            <span>Community Event</span>
          </div>
        </div>
        
        {/* Holiday Information */}
        {showHolidayInfo && selectedHoliday && (
          <div className="holiday-info-parish">
            <div className="holiday-info-header-parish">
              <FontAwesomeIcon icon={faInfoCircle} className="holiday-info-icon-parish" />
              <h3>Holiday Information</h3>
            </div>
            <div className="holiday-info-content-parish">
              <p><strong>Date:</strong> {formatDate(selectedHoliday.date)}</p>
              <p><strong>Holiday:</strong> {selectedHoliday.name}</p>
              <p><strong>Type:</strong> <span className={`holiday-type-parish ${selectedHoliday.type.toLowerCase()}-holiday-parish`}>{selectedHoliday.type} Holiday</span></p>
            </div>
          </div>
        )}
        
        {/* Selected Date Details */}
        {selectedDate && (
          <div className="selected-date-info-parish">
            <h3>
              <FontAwesomeIcon icon={faCalendarAlt} style={{ marginRight: '10px', color: '#b3701f' }} />
              {formatDate(selectedDate)}
            </h3>
            
            {getAppointmentsForSelectedDate().length > 0 && (
              <div className="selected-date-appointments-sec">
                <h4>Appointments:</h4>
                <ul className="appointment-list-parish">
                  {getAppointmentsForSelectedDate().map(appointment => (
                    <li key={appointment.id} className="appointment-item-parish">
                      <div className="appointment-time-parish">{convertTo12HourFormat(appointment.time)}</div>
                      <div className="appointment-details-parish">
                        <span className="appointment-name-parish">{appointment.firstName} {appointment.lastName}</span>
                        <span className="appointment-type-parish">{appointment.sacramentType}</span>
                        <span className={`appointment-status-parish ${appointment.status.toLowerCase()}-parish`}>
                          {getStatusIcon(appointment.status)}
                          {appointment.status}
                        </span>
                      </div>
                      <button 
                        className="view-btn-parish" 
                        onClick={() => viewAppointmentDetails(appointment)}
                      >
                        <FontAwesomeIcon icon={faEye} /> View
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {getEventsForSelectedDate().length > 0 && (
              <div className="selected-date-events-parish">
                <h4>Events:</h4>
                <ul className="event-list-parish">
                  {getEventsForSelectedDate().map(activity => (
                    <li key={activity.activityID} className="event-item-parish">
                      <div className="event-time-parish">{convertTo12HourFormat(activity.startTime)}</div>
                      <div className="event-details-parish">
                        <span className="event-name-parish">{activity.title}</span>
                        <span className="event-organizer-parish">{activity.proposedBy || activity.organizer}</span>
                        <span className="event-location-parish">{activity.location}</span>
                        <span className={`event-status-parish ${activity.status.toLowerCase()}-parish`}>
                          {getStatusIcon(activity.status)}
                          {activity.status}
                        </span>
                      </div>
                      <button 
                        className="view-btn-parish event-view-btn-parish" 
                        onClick={() => viewEventDetails(activity.activityID)}
                      >
                        <FontAwesomeIcon icon={faEye} /> View
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {getAppointmentsForSelectedDate().length === 0 && getEventsForSelectedDate().length === 0 && (
              <p className="no-appointments-message-parish">
                No appointments or events scheduled for this date.
              </p>
            )}
          </div>
        )}
      </div>
      
      {/* Tables Section */}
      <div className="tables-container-sec">
        {/* Appointments Table */}
        <div className="table-section-sec appointments-table-section-sec">
          <h2 className="section-title-parish">
            <FontAwesomeIcon icon={faClipboardList} className="section-icon-parish" />
            Appointments for {formatMonthYear(currentDate)}
          </h2>
          <div className="data-table-container-parish">
            <table className="appointment-table-sa">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>First Name</th>
                  <th>Last Name</th>
                  <th>Sacrament Type</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.length > 0 ? (
                  appointments.map((appointment) => (
                    <tr key={appointment.id}>
                      <td>{appointment.id}</td>
                      <td>{appointment.firstName}</td>
                      <td>{appointment.lastName}</td>
                      <td>{appointment.sacramentType}</td>
                      <td>{formatDateShort(appointment.date)}</td>
                      <td>{convertTo12HourFormat(appointment.time)}</td>
                      <td className={`status-${appointment.status?.toLowerCase()}`}>
                        {appointment.status}
                      </td>
                      <td className="actions-cell-sa">
                        <button
                          className="view-btn-sa"
                          onClick={() => viewAppointmentDetails(appointment)}
                          title="View Details"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" style={{ textAlign: "center" }}>
                      {loading ? 'Loading appointments...' : 'No approved appointments for this month'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Events Table */}
        <div className="table-section-sec events-table-section-sec">
          <h2 className="section-title-parish">
            <FontAwesomeIcon icon={faHandshake} className="section-icon-parish" />
            Community Events for {formatMonthYear(currentDate)}
          </h2>
          <div className="data-table-container-parish">
            <table className="event-table-sae">
              <thead>
                <tr>
                  <th>No.</th>
                  <th>Title</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Start Date</th>
                  <th>Start Time</th>
                  <th>Location</th>
                  <th>Organizer</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {activities.length > 0 ? (
                  activities.map((activity, index) => (
                    <tr key={activity.activityID}>
                      <td>{index + 1}</td>
                      <td>{activity.title}</td>
                      <td>{activity.description}</td>
                      <td>{activity.category}</td>
                      <td>{formatDateShort(activity.date)}</td>
                      <td>{convertTo12HourFormat(activity.startTime)}</td>
                      <td>{activity.location}</td>
                      <td>{activity.proposedBy}</td>
                      <td className={`status-${activity.status?.toLowerCase()}`}>
                        {activity.status}
                      </td>
                      <td>
                        <button
                          className="sae-details"
                          onClick={() => viewEventDetails(activity.activityID)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="10" style={{ textAlign: "center" }}>
                      {loading ? 'Loading events...' : 'No approved events for this month'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Event Modal */}
      {showEventModal && selectedEventData && (
        <div className="modal-backdrop-sae">
          <div className="modal-content-sae">
            <h2>Event & Activity Details</h2>
            <hr className="custom-hr-sum"/>
            <div className="view-details-sae">
              <div className="detail-row-sae">
                <div className="detail-label-sae">Title:</div>
                <div className="detail-value-sae">{selectedEventData.title}</div>
              </div>
              <div className="detail-row-sae">
                <div className="detail-label-sae">Description:</div>
                <div className="detail-value-sae">{selectedEventData.description}</div>
              </div>
              <div className="detail-row-parish">
                <div className="detail-label-sae">Category:</div>
                <div className="detail-value-sae">{selectedEventData.category}</div>
              </div>
              <div className="detail-row-sae">
                <div className="detail-label-sae">Start Date:</div>
                <div className="detail-value-sae">{formatDateShort(selectedEventData.date)}</div>
              </div>
              <div className="detail-row-sae">
                <div className="detail-label-sae">Start Time:</div>
                <div className="detail-value-sae">{convertTo12HourFormat(selectedEventData.startTime)}</div>
              </div>
              <div className="detail-row-sae">
                <div className="detail-label-sae">Location:</div>
                <div className="detail-value-sae">{selectedEventData.location}</div>
              </div>
              <div className="detail-row-sae">
                <div className="detail-label-sae">Organizer:</div>
                <div className="detail-value-sae">{selectedEventData.organizer || selectedEventData.proposedBy}</div>
              </div>
              <div className="detail-row-sae">
                <div className="detail-label-sae">Status:</div>
                <div className={`detail-value-sae status-${selectedEventData.status.toLowerCase()}`}>
                  {selectedEventData.status}
                </div>
              </div>
              {selectedEventData.created_at && (
                <div className="detail-row-sae">
                  <div className="detail-label-sae">Created At:</div>
                  <div className="detail-value-sae">
                    {new Date(selectedEventData.created_at).toLocaleString()}
                  </div>
                </div>
              )}
              {selectedEventData.updated_at && (
                <div className="detail-row-sae">
                  <div className="detail-label-sae">Updated At:</div>
                  <div className="detail-value-sae">
                    {new Date(selectedEventData.updated_at).toLocaleString()}
                  </div>
                </div>
              )}
            </div>
            <div className="modal-actions-sae">
              <button onClick={() => setShowEventModal(false)} className="cancel-btn-sae">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParishDashboard;