import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './clientdashboard.css'; // Make sure this points to where you saved the improved CSS
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faChevronLeft, 
  faChevronRight, 
  faInfoCircle, 
  faCalendarAlt, 
  faCircle,
  faCheckCircle,
  faExclamationTriangle,
  faCertificate,
  faCalendarCheck
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

const ClientDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get clientID and user data from location state
  const clientID = location.state?.clientID;
  const user = location.state?.user;
  
  // Check if user is logged in, if not redirect to login
  useEffect(() => {
    if (!clientID || !user) {
      // Check localStorage as fallback
      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        navigate('/client-login');
      }
    }
  }, [clientID, user, navigate]);
  
  // Function to get current date in Philippines timezone
  const getPhilippinesDate = () => {
    return new Date(new Date().toLocaleString("en-US", {timeZone: "Asia/Manila"}));
  };
  
  // Setting default date to current date in Philippines
  const [currentDate, setCurrentDate] = useState(getPhilippinesDate());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showHolidayInfo, setShowHolidayInfo] = useState(false);
  const [selectedHoliday, setSelectedHoliday] = useState(null);
  
  // State for appointments data
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
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
    const currentYear = currentDate.getFullYear();
    setHolidays(getHolidaysForYear(currentYear));
  }, [currentDate]);

  // Fetch client's appointments (both application and approved ceremony dates)
  useEffect(() => {
    const fetchClientAppointments = async () => {
      if (!clientID) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Fetch all appointments for this specific client
        const response = await axios.get(`${API_BASE_URL}/fetch_all_client_appointments.php?clientID=${clientID}`);
        
        if (response.data && response.data.success && response.data.appointments) {
          // Transform and process appointments
          const processedAppointments = response.data.appointments
            .map(app => {
              let appointmentDate;
              
              // Parse the date from various possible formats
              if (app.date) {
                appointmentDate = new Date(app.date);
                
                // If date parsing fails, try different formats
                if (isNaN(appointmentDate.getTime())) {
                  // Try MM/DD/YYYY format
                  const dateParts = app.date.split('/');
                  if (dateParts.length === 3) {
                    appointmentDate = new Date(parseInt(dateParts[2]), parseInt(dateParts[0]) - 1, parseInt(dateParts[1]));
                  } else {
                    // Try YYYY-MM-DD format
                    const dashParts = app.date.split('-');
                    if (dashParts.length === 3) {
                      appointmentDate = new Date(parseInt(dashParts[0]), parseInt(dashParts[1]) - 1, parseInt(dashParts[2]));
                    }
                  }
                }
              } else {
                // Skip appointments without dates
                return null;
              }
              
              return {
                id: app.id,
                firstName: app.firstName || '',
                lastName: app.lastName || '',
                sacramentType: app.sacramentType,
                date: appointmentDate,
                time: app.time || '12:00 PM',
                status: app.status,
                appointmentSource: app.appointmentSource || 'application', // New field to distinguish appointment types
                priest: app.priest || null // For approved ceremonies
              };
            })
            .filter(app => app !== null); // Remove null entries
          
          // Sort appointments by date
          processedAppointments.sort((a, b) => a.date - b.date);
          setAppointments(processedAppointments);
        } else {
          setAppointments([]);
        }
        
      } catch (err) {
        console.error('Error fetching client appointments:', err);
        setError('Failed to load your appointments. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchClientAppointments();
  }, [clientID, API_BASE_URL]);

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

  // Check if a date has an approved ceremony
  const hasApprovedCeremony = (date) => {
    return appointments.some(appointment => 
      appointment.appointmentSource === 'approved_ceremony' &&
      appointment.date.getDate() === date.getDate() && 
      appointment.date.getMonth() === date.getMonth() && 
      appointment.date.getFullYear() === date.getFullYear()
    );
  };

  // Check if a date has an application appointment
  const hasApplicationAppointment = (date) => {
    return appointments.some(appointment => 
      appointment.appointmentSource === 'application' &&
      appointment.date.getDate() === date.getDate() && 
      appointment.date.getMonth() === date.getMonth() && 
      appointment.date.getFullYear() === date.getFullYear()
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

  // Get appointment details for selected date
  const getAppointmentsForSelectedDate = () => {
    if (!selectedDate) return [];
    
    return appointments.filter(appointment => 
      appointment.date.getDate() === selectedDate.getDate() && 
      appointment.date.getMonth() === selectedDate.getMonth() && 
      appointment.date.getFullYear() === selectedDate.getFullYear()
    );
  };

  // Get status icon based on appointment status and source
  const getStatusIcon = (appointment) => {
    if (appointment.appointmentSource === 'approved_ceremony') {
      return <FontAwesomeIcon icon={faCertificate} style={{ marginRight: '5px', color: '#b3701f' }} />;
    }
    
    switch(appointment.status.toLowerCase()) {
      case 'approved':
      case 'confirmed':
        return <FontAwesomeIcon icon={faCheckCircle} style={{ marginRight: '5px', color: '#573901' }} />;
      case 'pending':
        return <FontAwesomeIcon icon={faCircle} style={{ marginRight: '5px', color: '#856404' }} />;
      case 'cancelled':
        return <FontAwesomeIcon icon={faCircle} style={{ marginRight: '5px', color: '#721c24' }} />;
      case 'completed':
        return <FontAwesomeIcon icon={faCheckCircle} style={{ marginRight: '5px', color: '#b3701f' }} />;
      default:
        return null;
    }
  };

  // Get appointment type display text
  const getAppointmentTypeDisplay = (appointment) => {
    if (appointment.appointmentSource === 'approved_ceremony') {
      return `${appointment.sacramentType} - Ceremony Date`;
    }
    return `${appointment.sacramentType} - Application`;
  };

  // Check if a date is today - Updated to use current Philippines date
  const isToday = (date) => {
    const today = getPhilippinesDate();
    return date.getDate() === today.getDate() && 
           date.getMonth() === today.getMonth() && 
           date.getFullYear() === today.getFullYear();
  };

  return (
    <div className="dashboard-container-cd">
      <h1 className="title-cd">CLIENT DASHBOARD</h1>
      
      {/* Error message */}
      {error && (
        <div className="error-message-container">
          <FontAwesomeIcon icon={faExclamationTriangle} className="error-icon" />
          <span>{error}</span>
        </div>
      )}
      
      {/* Legend for different appointment types */}
      <div className="legend-container-cd">
        <h3>Legend:</h3>
        <div className="legend-items-cd">
          <div className="legend-item-cd">
            <div className="appointment-dot-cd application-dot-cd"></div>
            <span>Application Appointment</span>
          </div>
          <div className="legend-item-cd">
            <div className="appointment-dot-cd ceremony-dot-cd"></div>
            <span>Approved Ceremony Date</span>
          </div>
          <div className="legend-item-cd">
            <div className="holiday-dot-cd" style={{ backgroundColor: "#e74c3c" }}></div>
            <span>Regular Holiday</span>
          </div>
          <div className="legend-item-cd">
            <div className="holiday-dot-cd" style={{ backgroundColor: "#f39c12" }}></div>
            <span>Special Holiday</span>
          </div>
        </div>
      </div>
      
      {/* Calendar Section */}
      <div className="calendar-section-cd">
        <div className="calendar-header-cd">
          <button className="nav-btn-cd" onClick={prevMonth} aria-label="Previous month">
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>
          <h2 className="month-year-cd">
            <FontAwesomeIcon icon={faCalendarAlt} style={{ marginRight: '10px' }} />
            {formatMonthYear(currentDate)}
          </h2>
          <button className="nav-btn-cd" onClick={nextMonth} aria-label="Next month">
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
        </div>
        
        {loading ? (
          <div className="loading-calendar">
            <p>Loading your appointments...</p>
          </div>
        ) : (
          <div className="calendar-grid-cd">
            {/* Calendar week days */}
            <div className="weekday-cd">Sun</div>
            <div className="weekday-cd">Mon</div>
            <div className="weekday-cd">Tue</div>
            <div className="weekday-cd">Wed</div>
            <div className="weekday-cd">Thu</div>
            <div className="weekday-cd">Fri</div>
            <div className="weekday-cd">Sat</div>
            
            {/* Calendar days */}
            {generateCalendarDays().map((date, index) => (
              <div 
                key={index} 
                className={`calendar-day-cd 
                  ${!date ? 'empty-day-cd' : ''} 
                  ${date && hasAppointment(date) ? 'has-appointment-cd' : ''} 
                  ${date && hasApprovedCeremony(date) ? 'has-ceremony-cd' : ''} 
                  ${date && hasHoliday(date) ? 'holiday-day-cd' : ''} 
                  ${date && isToday(date) ? 'today-cd' : ''}
                  ${date && selectedDate && 
                    date.getDate() === selectedDate.getDate() && 
                    date.getMonth() === selectedDate.getMonth() && 
                    date.getFullYear() === selectedDate.getFullYear() 
                      ? 'selected-day-cd' 
                      : ''
                  }`}
                onClick={() => handleDayClick(date)}
                aria-label={date ? `${date.getDate()}, ${hasHoliday(date) ? 'Holiday' : ''} ${hasAppointment(date) ? 'Has appointment' : ''}` : 'Empty day'}
              >
                {date && (
                  <>
                    <span className="day-number-cd">{date.getDate()}</span>
                    {hasApplicationAppointment(date) && <div className="appointment-dot-cd application-dot-cd"></div>}
                    {hasApprovedCeremony(date) && <div className="appointment-dot-cd ceremony-dot-cd"></div>}
                    {hasHoliday(date) && (
                      <div className="holiday-indicator-cd">
                        <div 
                          className="holiday-dot-cd" 
                          style={{ 
                            backgroundColor: getHoliday(date).type === "Regular" ? "#e74c3c" : "#f39c12" 
                          }}
                        ></div>
                        <span className="holiday-name-cd">{getHoliday(date).name}</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        )}
        
        {/* Holiday Information */}
        {showHolidayInfo && selectedHoliday && (
          <div className="holiday-info-cd">
            <div className="holiday-info-header-cd">
              <FontAwesomeIcon icon={faInfoCircle} className="holiday-info-icon-cd" />
              <h3>Holiday Information</h3>
            </div>
            <div className="holiday-info-content-cd">
              <p><strong>Date:</strong> {formatDate(selectedHoliday.date)}</p>
              <p><strong>Holiday:</strong> {selectedHoliday.name}</p>
              <p><strong>Type:</strong> <span className={`holiday-type-cd ${selectedHoliday.type.toLowerCase()}-holiday-cd`}>{selectedHoliday.type} Holiday</span></p>
            </div>
          </div>
        )}
        
        {/* Selected Date Appointments */}
        {selectedDate && (
          <div className="selected-date-info-cd">
            <h3>
              <FontAwesomeIcon icon={faCalendarAlt} style={{ marginRight: '10px', color: '#b3701f' }} />
              {formatDate(selectedDate)}
            </h3>
            
            {getAppointmentsForSelectedDate().length > 0 ? (
              <div className="selected-date-appointments-cd">
                <h4>Your Scheduled Appointments:</h4>
                <ul className="appointment-list-cd">
                  {getAppointmentsForSelectedDate().map(appointment => (
                    <li key={`${appointment.id}-${appointment.appointmentSource}`} className={`appointment-item-cd ${appointment.appointmentSource}-appointment-cd`}>
                      <div className="appointment-time-cd">{appointment.time}</div>
                      <div className="appointment-details-cd">
                        <span className="appointment-name-cd">{appointment.firstName} {appointment.lastName}</span>
                        <span className="appointment-type-cd">{getAppointmentTypeDisplay(appointment)}</span>
                        {appointment.priest && (
                          <span className="appointment-priest-cd">Priest: {appointment.priest}</span>
                        )}
                        <span className={`appointment-status-cd ${appointment.status.toLowerCase()}-cd`}>
                          {getStatusIcon(appointment)}
                          {appointment.appointmentSource === 'approved_ceremony' ? 'Approved Ceremony' : appointment.status}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="no-appointments-message-cd">
                No appointments scheduled for this date. 
                Select a different date or contact the parish office to schedule a new appointment.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientDashboard;