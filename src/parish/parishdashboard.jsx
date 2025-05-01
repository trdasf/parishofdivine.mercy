import React, { useState, useEffect } from 'react';
import './parishdashboard.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faChevronLeft, 
  faChevronRight, 
  faCalendarAlt, 
  faEye, 
  faUsers, 
  faClipboardList,
  faHandshake,
  faPrayingHands,
  faChurch
} from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';

const ParishDashboard = () => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  
  // Modal state
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEventData, setSelectedEventData] = useState(null);
  
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
  
  // Corrected the id: A to id: 1
  const appointments = [
    { 
      id: 1, 
      firstName: "Maria", 
      lastName: "Santos", 
      sacramentType: "Baptism", 
      date: new Date(2025, 3, 13), 
      time: "8:00 AM", 
      status: "Approved" 
    },
    { 
      id: 2, 
      firstName: "Juan", 
      lastName: "Dela Cruz", 
      sacramentType: "Marriage", 
      date: new Date(2025, 3, 17), 
      time: "6:00 PM", 
      status: "Approved" 
    },
    { 
      id: 3, 
      firstName: "Pedro", 
      lastName: "Reyes", 
      sacramentType: "Communion", 
      date: new Date(2025, 3, 20), 
      time: "5:30 PM", 
      status: "Approved" 
    },
    { 
      id: 4, 
      firstName: "Ana", 
      lastName: "Manalo", 
      sacramentType: "Confirmation", 
      date: new Date(2025, 3, 27), 
      time: "9:00 PM", 
      status: "Approved" 
    }
  ];

  const parishEvents = [
    { 
      id: 1, 
      name: "Youth Bible Study", 
      organizer: "Youth Ministry", 
      type: "Formation", 
      date: new Date(2025, 3, 12), 
      time: "4:00 PM", 
      location: "Parish Hall",
      status: "Approved",
      description: "Weekly Bible study session for youth members",
      category: "Formation",
      start_date: "04/12/2025",
      end_date: "04/12/2025",
      start_time: "4:00 PM",
      created_at: "03/15/2025",
      updated_at: "03/15/2025"
    },
    { 
      id: 2, 
      name: "Charity Outreach", 
      organizer: "Social Services Committee", 
      type: "Outreach", 
      date: new Date(2025, 3, 18), 
      time: "9:00 AM", 
      location: "Barangay Center",
      status: "Approved",
      description: "Community service outreach program",  
      category: "Outreach",
      start_date: "04/18/2025",
      end_date: "04/18/2025",
      start_time: "9:00 AM",
      created_at: "03/20/2025",
      updated_at: "03/25/2025"
    },
    { 
      id: 3, 
      name: "Choir Practice", 
      organizer: "Music Ministry", 
      type: "Formation", 
      date: new Date(2025, 3, 22), 
      time: "5:30 PM", 
      location: "Church",
      status: "Approved",
      description: "Weekly practice for the church choir",
      category: "Formation",
      start_date: "04/22/2025",
      end_date: "04/22/2025",
      start_time: "5:30 PM",
      created_at: "03/28/2025",
      updated_at: "03/28/2025"
    },
    { 
      id: 4, 
      name: "Parish Council Meeting", 
      organizer: "Parish Council", 
      type: "Administrative", 
      date: new Date(2025, 3, 25), 
      time: "7:00 PM", 
      location: "Conference Room",
      status: "Approved",
      description: "Monthly parish council meeting to discuss parish matters",
      category: "Administrative",
      start_date: "04/25/2025",
      end_date: "04/25/2025",
      start_time: "7:00 PM",
      created_at: "04/01/2025",
      updated_at: "04/05/2025"
    }
  ];

  // Calculate totals
  const totalAppointments = appointments.length;
  const totalEvents = parishEvents.length;
  
  // Get current month data
  const getCurrentMonthAppointments = () => {
    return appointments.filter(appointment => 
      appointment.date.getMonth() === currentDate.getMonth() &&
      appointment.date.getFullYear() === currentDate.getFullYear()
    );
  };

  const getCurrentMonthEvents = () => {
    return parishEvents.filter(event => 
      event.date.getMonth() === currentDate.getMonth() &&
      event.date.getFullYear() === currentDate.getFullYear()
    );
  };

  // Navigate to previous month
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  // Navigate to next month
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Format date to display in the header
  const formatMonthYear = (date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  // Check for special dates
  const hasHoliday = (date) => {
    return holidays.some(holiday => 
      holiday.date.getDate() === date.getDate() && 
      holiday.date.getMonth() === date.getMonth() && 
      holiday.date.getFullYear() === date.getFullYear()
    );
  };

  // Get holiday name for a specific date
  const getHolidayName = (date) => {
    const holiday = holidays.find(holiday => 
      holiday.date.getDate() === date.getDate() && 
      holiday.date.getMonth() === date.getMonth() && 
      holiday.date.getFullYear() === date.getFullYear()
    );
    return holiday ? holiday.name : null;
  };

  const hasAppointment = (date) => {
    return appointments.some(appointment => 
      appointment.date.getDate() === date.getDate() && 
      appointment.date.getMonth() === date.getMonth() && 
      appointment.date.getFullYear() === date.getFullYear()
    );
  };

  const hasEvent = (date) => {
    return parishEvents.some(event => 
      event.date.getDate() === date.getDate() && 
      event.date.getMonth() === date.getMonth() && 
      event.date.getFullYear() === date.getFullYear()
    );
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

  // View details functions
 // In ParishDashboard.js, modify the viewAppointmentDetails function

const viewAppointmentDetails = (appointmentId) => {
    const appointment = appointments.find(a => a.id === appointmentId);
    if (appointment) {
      // Navigate based on sacrament type with source parameter
      switch(appointment.sacramentType) {
        case "Baptism":
          navigate("/baptism-view", { state: { appointmentData: appointment, source: "parish" } });
          break;
        case "Marriage":
          navigate("/marriage-view", { state: { appointmentData: appointment, source: "parish" } });
          break;
        case "Funeral Mass":
          navigate("/funeral-mass-view", { state: { appointmentData: appointment, source: "parish" } });
          break;
        case "Blessing":
          navigate("/blessing-view", { state: { appointmentData: appointment, source: "parish" } });
          break;
        case "Confirmation":
          navigate("/confirmation-view", { state: { appointmentData: appointment, source: "parish" } });
          break;
        case "Communion":
          navigate("/communion-view", { state: { appointmentData: appointment, source: "parish" } });
          break;
        default:
          console.log(`Unknown sacrament: ${appointment.sacramentType}`);
      }
    }
  };
  // Opens the modal for event details
  const viewEventDetails = (eventId) => {
    const event = parishEvents.find(e => e.id === eventId);
    if (event) {
      setSelectedEventData(event);
      setShowEventModal(true);
    }
  };

  // Get specific day details if selected
  const getSelectedDayDetails = () => {
    if (!selectedDate) return { appointments: [], events: [] };
    
    const dayAppointments = appointments.filter(appointment => 
      appointment.date.getDate() === selectedDate.getDate() && 
      appointment.date.getMonth() === selectedDate.getMonth() && 
      appointment.date.getFullYear() === selectedDate.getFullYear()
    );
    
    const dayEvents = parishEvents.filter(event => 
      event.date.getDate() === selectedDate.getDate() && 
      event.date.getMonth() === selectedDate.getMonth() && 
      event.date.getFullYear() === selectedDate.getFullYear()
    );
    
    return { appointments: dayAppointments, events: dayEvents };
  };
  
  // Get the selected day's holiday name
  const getSelectedDayHoliday = () => {
    if (!selectedDate) return null;
    
    const holiday = holidays.find(holiday => 
      holiday.date.getDate() === selectedDate.getDate() && 
      holiday.date.getMonth() === selectedDate.getMonth() && 
      holiday.date.getFullYear() === selectedDate.getFullYear()
    );
    
    return holiday ? holiday.name : null;
  };

  const selectedDayDetails = getSelectedDayDetails();
  const selectedDayHoliday = getSelectedDayHoliday();

  return (
    <div className="dashboard-container-parish">
      <h1 className="title-parish">PARISH DASHBOARD</h1>
      
      {/* Summary Cards */}
      <div className="summary-container-parish">
        <div className="card-parish masses-card-parish">
          <div className="card-icon-parish">
            <FontAwesomeIcon icon={faPrayingHands} />
          </div>
          <div className="card-content-parish">
            <h3 className="card-title-parish">Total Appointments</h3>
            <p className="card-count-parish">{totalAppointments}</p>
          </div>
        </div>
        <div className="card-parish events-card-parish">
          <div className="card-icon-parish">
            <FontAwesomeIcon icon={faChurch} />
          </div>
          <div className="card-content-parish">
            <h3 className="card-title-parish">Total Events</h3>
            <p className="card-count-parish">{totalEvents}</p>
          </div>
        </div>
      </div>
      
      {/* Calendar Section */}
      <div className="calendar-section-parish">
        <div className="calendar-header-parish">
          <button className="nav-btn-parish" onClick={prevMonth}>
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>
          <h2 className="month-year-parish">{formatMonthYear(currentDate)}</h2>
          <button className="nav-btn-parish" onClick={nextMonth}>
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
        </div>
        
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
              className={`calendar-day-parish ${!date ? 'empty-day-parish' : ''} ${
                date && hasAppointment(date) ? 'has-appointment-parish' : ''
              } ${
                date && hasEvent(date) ? 'has-event-parish' : ''
              } ${
                date && selectedDate && 
                date.getDate() === selectedDate.getDate() && 
                date.getMonth() === selectedDate.getMonth() && 
                date.getFullYear() === selectedDate.getFullYear() 
                  ? 'selected-day-parish' 
                  : ''
              }`}
              onClick={() => handleDayClick(date)}
            >
              {date && (
                <>
                  <span className="day-number-parish">{date.getDate()}</span>
                  <div className="indicator-container-parish">
                    {hasHoliday(date) && (
                      <div className="holiday-indicator-parish">
                        <div className="holiday-dot-parish"></div>
                        <span className="holiday-name-parish">{getHolidayName(date)}</span>
                      </div>
                    )}
                    {hasAppointment(date) && <div className="appointment-dot-parish"></div>}
                    {hasEvent(date) && <div className="event-dot-parish"></div>}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
        
        {/* Calendar Legend */}
        <div className="calendar-legend-parish">
          <div className="legend-item-parish">
            <div className="legend-color-holiday-parish"></div>
            <span>Holiday</span>
          </div>
          <div className="legend-item-parish">
            <div className="legend-color-appointment-parish"></div>
            <span>Appointment</span>
          </div>
          <div className="legend-item-parish">
            <div className="legend-color-event-parish"></div>
            <span>Parish Event</span>
          </div>
        </div>
      </div>
      
      {/* Selected Date Details Section */}
      {selectedDate && (
        <div className="selected-date-details-parish">
          <h3 className="selected-date-title-parish">
            Details for {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </h3>
          
          {selectedDayHoliday && (
            <div className="holiday-alert-parish">
              <FontAwesomeIcon icon={faCalendarAlt} /> Holiday: {selectedDayHoliday}
            </div>
          )}
          
          <div className="selected-date-content-parish">
            {selectedDayDetails.appointments.length === 0 && selectedDayDetails.events.length === 0 ? (
              <p className="no-events-message-parish">No appointments or events scheduled for this day.</p>
            ) : (
              <>
                {selectedDayDetails.appointments.length > 0 && (
                  <div className="selected-date-appointments-parish">
                    <h4>Appointments</h4>
                    <ul>
                      {selectedDayDetails.appointments.map(appointment => (
                        <li key={appointment.id}>
                          <span>{appointment.time} - {appointment.sacramentType}</span>
                          <span>{appointment.firstName} {appointment.lastName}</span>
                          <span className={`status-pill-parish ${appointment.status.toLowerCase()}-parish`}>
                            {appointment.status}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {selectedDayDetails.events.length > 0 && (
                  <div className="selected-date-events-parish">
                    <h4>Events</h4>
                    <ul>
                      {selectedDayDetails.events.map(event => (
                        <li key={event.id}>
                          <span>{event.time} - {event.name}</span>
                          <span>{event.location}</span>
                          <span className={`status-pill-parish ${event.status.toLowerCase()}-parish`}>
                            {event.status}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
      
      {/* Tables Section */}
      <div className="tables-container-parish">
        {/* Appointments Table - Previously Masses Table */}
        <div className="table-section-parish appointments-table-section-parish">
          <h2 className="section-title-parish">
            <FontAwesomeIcon icon={faPrayingHands} className="section-icon-parish" />
            Appointments for {formatMonthYear(currentDate)}
          </h2>
          <div className="data-table-container-parish">
            <table className="data-table-parish">
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
                        <span className={`status-parish ${appointment.status.toLowerCase()}-parish`}>
                          {appointment.status}
                        </span>
                      </td>
                      <td>
                        <button
                          className="view-btn-parish"
                          onClick={() => viewAppointmentDetails(appointment.id)}
                        >
                          <FontAwesomeIcon icon={faEye} /> View
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="no-data-parish">
                      No appointments for this month
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Events Table */}
        <div className="table-section-parish events-table-section-parish">
          <h2 className="section-title-parish">
            <FontAwesomeIcon icon={faHandshake} className="section-icon-parish" />
            Parish Events for {formatMonthYear(currentDate)}
          </h2>
          <div className="data-table-container-parish">
            <table className="data-table-parish">
              <thead>
                <tr>
                  <th>No.</th>
                  <th>Event</th>
                  <th>Organizer</th>
                  <th>Category</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {getCurrentMonthEvents().length > 0 ? (
                  getCurrentMonthEvents().map((event) => (
                    <tr key={event.id}>
                      <td>{event.id}</td>
                      <td>{event.name}</td>
                      <td>{event.organizer}</td>
                      <td>{event.type}</td>
                      <td>{formatDate(event.date)}</td>
                      <td>{event.time}</td>
                      <td>{event.location}</td>
                      <td>
                        <span className={`status-parish ${event.status.toLowerCase()}-parish`}>
                          {event.status}
                        </span>
                      </td>
                      <td>
                        <button
                          className="view-btn-parish event-view-btn-parish"
                          onClick={() => viewEventDetails(event.id)}
                        >
                          <FontAwesomeIcon icon={faEye} /> View
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="no-data-parish">
                      No events for this month
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
        <div className="modal-backdrop-parish">
          <div className="modal-content-parish">
            <h2>Event & Activity Details</h2>
            <hr className="custom-hr-parish"/>
            <div className="view-details-parish">
              <div className="detail-row-parish">
                <div className="detail-label-parish">Title:</div>
                <div className="detail-value-parish">{selectedEventData.name}</div>
              </div>
              <div className="detail-row-parish">
                <div className="detail-label-parish">Description:</div>
                <div className="detail-value-parish">{selectedEventData.description}</div>
              </div>
              <div className="detail-row-parish">
                <div className="detail-label-parish">Category:</div>
                <div className="detail-value-parish">{selectedEventData.type}</div>
              </div>
              <div className="detail-row-parish">
                <div className="detail-label-parish">Start Date:</div>
                <div className="detail-value-parish">{selectedEventData.start_date}</div>
              </div>
              <div className="detail-row-parish">
                <div className="detail-label-parish">End Date:</div>
                <div className="detail-value-parish">{selectedEventData.end_date}</div>
              </div>
              <div className="detail-row-parish">
                <div className="detail-label-parish">Start Time:</div>
                <div className="detail-value-parish">{selectedEventData.time}</div>
              </div>
              <div className="detail-row-parish">
                <div className="detail-label-parish">Location:</div>
                <div className="detail-value-parish">{selectedEventData.location}</div>
              </div>
              <div className="detail-row-parish">
                <div className="detail-label-parish">Organizer:</div>
                <div className="detail-value-parish">{selectedEventData.organizer}</div>
              </div>
              <div className="detail-row-parish">
                <div className="detail-label-parish">Status:</div>
                <div className="detail-value-parish">{selectedEventData.status}</div>
              </div>
              <div className="detail-row-parish">
                <div className="detail-label-parish">Created At:</div>
                <div className="detail-value-parish">{selectedEventData.created_at}</div>
              </div>
              <div className="detail-row-parish">
                <div className="detail-label-parish">Updated At:</div>
                <div className="detail-value-parish">{selectedEventData.updated_at}</div>
              </div>
            </div>
            <div className="modal-actions-parish">
              <button onClick={() => setShowEventModal(false)} className="cancel-btn-parish">
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