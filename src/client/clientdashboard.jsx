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
  faCheckCircle
} from '@fortawesome/free-solid-svg-icons';

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
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showHolidayInfo, setShowHolidayInfo] = useState(false);
  const [selectedHoliday, setSelectedHoliday] = useState(null);
  
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

  // Sample appointments data - would normally come from API
  const appointments = [
    { 
      id: 1, 
      firstName: "Maria", 
      lastName: "Santos", 
      sacramentType: "Baptism", 
      date: new Date(2025, 3, 15), 
      time: "9:00 AM", 
      status: "Confirmed" 
    },
    { 
      id: 2, 
      firstName: "Juan", 
      lastName: "Dela Cruz", 
      sacramentType: "Marriage", 
      date: new Date(2025, 3, 20), 
      time: "3:00 PM", 
      status: "Pending" 
    },
    { 
      id: 3, 
      firstName: "Pedro", 
      lastName: "Reyes", 
      sacramentType: "Communion", 
      date: new Date(2025, 3, 25), 
      time: "10:30 AM", 
      status: "Confirmed" 
    },
    { 
      id: 4, 
      firstName: "Ana", 
      lastName: "Manalo", 
      sacramentType: "Kumpil", 
      date: new Date(2025, 3, 28), 
      time: "11:00 AM", 
      status: "Pending" 
    }
  ];

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

  // Get status icon based on appointment status
  const getStatusIcon = (status) => {
    switch(status.toLowerCase()) {
      case 'confirmed':
        return <FontAwesomeIcon icon={faCheckCircle} style={{ marginRight: '5px', color: '#155724' }} />;
      case 'pending':
        return <FontAwesomeIcon icon={faCircle} style={{ marginRight: '5px', color: '#856404' }} />;
      case 'cancelled':
        return <FontAwesomeIcon icon={faCircle} style={{ marginRight: '5px', color: '#721c24' }} />;
      case 'completed':
        return <FontAwesomeIcon icon={faCheckCircle} style={{ marginRight: '5px', color: '#004085' }} />;
      default:
        return null;
    }
  };

  // Check if a date is today
  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() && 
           date.getMonth() === today.getMonth() && 
           date.getFullYear() === today.getFullYear();
  };

  return (
    <div className="dashboard-container-cd">
      <h1 className="title-cd">CLIENT DASHBOARD</h1>
      
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
                  {hasAppointment(date) && <div className="appointment-dot-cd"></div>}
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
                    <li key={appointment.id} className="appointment-item-cd">
                      <div className="appointment-time-cd">{appointment.time}</div>
                      <div className="appointment-details-cd">
                        <span className="appointment-name-cd">{appointment.firstName} {appointment.lastName}</span>
                        <span className="appointment-type-cd">{appointment.sacramentType}</span>
                        <span className={`appointment-status-cd ${appointment.status.toLowerCase()}-cd`}>
                          {getStatusIcon(appointment.status)}
                          {appointment.status}
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