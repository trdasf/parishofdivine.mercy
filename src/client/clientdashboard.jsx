import React, { useState, useEffect } from 'react';
import './clientdashboard.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight, faCalendarAlt, faEye } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';

const ClientDashboard = () => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  
  // Sample data - in a real app, these would come from an API or database
  const holidays = [
    { date: new Date(2025, 0, 1), name: "New Year's Day" },
    { date: new Date(2025, 3, 18), name: "Good Friday" },
    { date: new Date(2025, 4, 1), name: "Labor Day" },
    { date: new Date(2025, 5, 12), name: "Independence Day" },
    { date: new Date(2025, 7, 21), name: "Ninoy Aquino Day" },
    { date: new Date(2025, 10, 1), name: "All Saints' Day" },
    { date: new Date(2025, 11, 25), name: "Christmas Day" },
    { date: new Date(2025, 11, 30), name: "Rizal Day" },
  ];

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

  // Check if a date has an appointment
  const hasAppointment = (date) => {
    return appointments.some(appointment => 
      appointment.date.getDate() === date.getDate() && 
      appointment.date.getMonth() === date.getMonth() && 
      appointment.date.getFullYear() === date.getFullYear()
    );
  };

  // Get appointments for the current month
  const getCurrentMonthAppointments = () => {
    return appointments.filter(appointment => 
      appointment.date.getMonth() === currentDate.getMonth() &&
      appointment.date.getFullYear() === currentDate.getFullYear()
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
    }
  };

  // Format date for display in the table
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
  };

  // View appointment details
  const viewAppointmentDetails = (appointmentId) => {
    // Navigate to appointment details page based on sacrament type
    const appointment = appointments.find(a => a.id === appointmentId);
    if (appointment) {
      switch(appointment.sacramentType) {
        case "Baptism":
          navigate("/client-baptism-view", { state: { viewOnly: true, appointmentData: appointment } });
          break;
        case "Marriage":
          navigate("/client-marriage-view", { state: { viewOnly: true, appointmentData: appointment } });
          break;
        case "Funeral Mass":
          navigate("/client-funeral-mass-view", { state: { viewOnly: true, appointmentData: appointment } });
          break;
        case "Blessing":
          navigate("/client-blessing-view", { state: { viewOnly: true, appointmentData: appointment } });
          break;
        case "Kumpil":
          navigate("/client-kumpil-view", { state: { viewOnly: true, appointmentData: appointment } });
          break;
        case "Communion":
          navigate("/client-communion-view", { state: { viewOnly: true, appointmentData: appointment } });
          break;
        default:
          console.log(`Unknown sacrament: ${appointment.sacramentType}`);
      }
    }
  };

  return (
    <div className="dashboard-container-cd">
      <h1 className="title-cd">DASHBOARD</h1>
      
      {/* Calendar Section */}
      <div className="calendar-section-cd">
        <div className="calendar-header-cd">
          <button className="nav-btn-cd" onClick={prevMonth}>
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>
          <h2 className="month-year-cd">{formatMonthYear(currentDate)}</h2>
          <button className="nav-btn-cd" onClick={nextMonth}>
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
              className={`calendar-day-cd ${!date ? 'empty-day-cd' : ''} ${
                date && hasAppointment(date) ? 'has-appointment-cd' : ''
              } ${
                date && selectedDate && 
                date.getDate() === selectedDate.getDate() && 
                date.getMonth() === selectedDate.getMonth() && 
                date.getFullYear() === selectedDate.getFullYear() 
                  ? 'selected-day-cd' 
                  : ''
              }`}
              onClick={() => handleDayClick(date)}
            >
              {date && (
                <>
                  <span className="day-number-cd">{date.getDate()}</span>
                  {hasHoliday(date) && <div className="holiday-dot-cd"></div>}
                </>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Appointments Table Section */}
      <div className="appointments-section-cd">
        <h2 className="section-title-cd">
          <FontAwesomeIcon icon={faCalendarAlt} className="section-icon-cd" />
          Appointments for {formatMonthYear(currentDate)}
        </h2>
        
        <table className="appointments-table-cd">
          <thead>
            <tr>
              <th>No.</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Sacrament Type</th>
              <th>Date</th>
              <th>Time</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {getCurrentMonthAppointments().length > 0 ? (
              getCurrentMonthAppointments().map((appointment) => (
                <tr key={appointment.id}>
                  <td>{appointment.id}</td>
                  <td>{appointment.firstName}</td>
                  <td>{appointment.lastName}</td>
                  <td>{appointment.sacramentType}</td>
                  <td>{formatDate(appointment.date)}</td>
                  <td>{appointment.time}</td>
                  <td>
                    <span className={`status-cd ${appointment.status.toLowerCase()}-cd`}>
                      {appointment.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className="view-btn-cd"
                      onClick={() => viewAppointmentDetails(appointment.id)}
                    >
                      <FontAwesomeIcon icon={faEye} /> View
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="no-appointments-cd">
                  No appointments for this month
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ClientDashboard;