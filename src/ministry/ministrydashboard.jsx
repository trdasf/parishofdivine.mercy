import React, { useState, useEffect } from 'react';
import './ministrydashboard.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faChevronLeft, 
  faChevronRight, 
  faCalendarAlt, 
  faEye, 
  faUsers,
  faInfoCircle,
  faCircle,
  faCheckCircle
} from '@fortawesome/free-solid-svg-icons';
import { useNavigate, useLocation } from 'react-router-dom';

const MinistryDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userData, setUserData] = useState(null);
  const [userID, setUserID] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showEventInfo, setShowEventInfo] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  
  // Get userID and user data from location state or localStorage
  useEffect(() => {
    // First try to get from location state
    if (location.state && location.state.userData) {
      setUserData(location.state.userData);
      setUserID(location.state.userID);
      console.log("Dashboard: User data from location state", location.state.userData);
      console.log("Dashboard: UserID from location state", location.state.userID);
    }
    // If not in location state, try localStorage
    else {
      const storedUser = localStorage.getItem("ministry_user");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUserData(parsedUser);
        setUserID(parsedUser.userID);
        console.log("Dashboard: User data from localStorage", parsedUser);
        console.log("Dashboard: UserID from localStorage", parsedUser.userID);
      } else {
        // No user data found, redirect to login
        console.log("Dashboard: No user data found, redirecting to login");
        navigate("/");
      }
    }
  }, [location, navigate]);

  // Sample data - in a real app, these would come from an API or database
  const communityEvents = [
    { date: new Date(2025, 0, 6), name: "Epiphany Celebration", type: "Liturgical" },
    { date: new Date(2025, 2, 19), name: "St. Joseph's Feast", type: "Feast Day" },
    { date: new Date(2025, 3, 20), name: "Easter Vigil", type: "Liturgical" },
    { date: new Date(2025, 4, 31), name: "Flores de Mayo Closing", type: "Cultural" },
    { date: new Date(2025, 5, 29), name: "Sts. Peter & Paul Feast", type: "Feast Day" },
    { date: new Date(2025, 7, 15), name: "Assumption Day", type: "Liturgical" },
    { date: new Date(2025, 10, 2), name: "All Souls' Day", type: "Liturgical" },
    { date: new Date(2025, 11, 24), name: "Christmas Eve Mass", type: "Liturgical" },
  ];

  const communityActivities = [
    { 
      id: 1, 
      name: "Youth Bible Study", 
      organizer: "Youth Ministry", 
      type: "Formation", 
      date: new Date(2025, 3, 12), 
      time: "4:00 PM", 
      location: "Parish Hall",
      status: "Upcoming" 
    },
    { 
      id: 2, 
      name: "Charity Outreach", 
      organizer: "Social Services Committee", 
      type: "Outreach", 
      date: new Date(2025, 3, 18), 
      time: "9:00 AM", 
      location: "Barangay Center",
      status: "Upcoming" 
    },
    { 
      id: 3, 
      name: "Choir Practice", 
      organizer: "Music Ministry", 
      type: "Formation", 
      date: new Date(2025, 3, 22), 
      time: "5:30 PM", 
      location: "Church",
      status: "Upcoming" 
    },
    { 
      id: 4, 
      name: "Community Clean-up", 
      organizer: "Parish Council", 
      type: "Service", 
      date: new Date(2025, 3, 27), 
      time: "7:00 AM", 
      location: "Church Grounds",
      status: "Planning" 
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

  // Check if a date has a community event
  const hasEvent = (date) => {
    return communityEvents.some(event => 
      event.date.getDate() === date.getDate() && 
      event.date.getMonth() === date.getMonth() && 
      event.date.getFullYear() === date.getFullYear()
    );
  };
  
  // Get event for a specific date
  const getEvent = (date) => {
    return communityEvents.find(event => 
      event.date.getDate() === date.getDate() && 
      event.date.getMonth() === date.getMonth() && 
      event.date.getFullYear() === date.getFullYear()
    );
  };

  // Check if a date has an activity
  const hasActivity = (date) => {
    return communityActivities.some(activity => 
      activity.date.getDate() === date.getDate() && 
      activity.date.getMonth() === date.getMonth() && 
      activity.date.getFullYear() === date.getFullYear()
    );
  };

  // Get activities for the current month
  const getCurrentMonthActivities = () => {
    return communityActivities.filter(activity => 
      activity.date.getMonth() === currentDate.getMonth() &&
      activity.date.getFullYear() === currentDate.getFullYear()
    );
  };
  
  // Get activities for selected date
  const getActivitiesForSelectedDate = () => {
    if (!selectedDate) return [];
    
    return communityActivities.filter(activity => 
      activity.date.getDate() === selectedDate.getDate() && 
      activity.date.getMonth() === selectedDate.getMonth() && 
      activity.date.getFullYear() === selectedDate.getFullYear()
    );
  };

  // Format date to display in the header
  const formatMonthYear = (date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };
  
  // Format date for display
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  };

  // Format date for display in the table
  const formatTableDate = (date) => {
    return date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
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
      
      // Check if the date has an event
      if (hasEvent(date)) {
        setSelectedEvent(getEvent(date));
        setShowEventInfo(true);
      } else {
        setShowEventInfo(false);
        setSelectedEvent(null);
      }
    }
  };

  // View activity details
  const viewActivityDetails = (activityId) => {
    // Navigate to activity details page based on activity type
    const activity = communityActivities.find(a => a.id === activityId);
    if (activity) {
      navigate("/community-activity-details", { 
        state: { 
          viewOnly: true, 
          activityData: activity,
          userID: userID,
          userData: userData
        } 
      });
    }
  };
  
  // Check if a date is today
  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() && 
           date.getMonth() === today.getMonth() && 
           date.getFullYear() === today.getFullYear();
  };
  
  // Get status icon based on activity status
  const getStatusIcon = (status) => {
    switch(status.toLowerCase()) {
      case 'upcoming':
        return <FontAwesomeIcon icon={faCircle} style={{ marginRight: '5px', color: '#155724' }} />;
      case 'planning':
        return <FontAwesomeIcon icon={faCircle} style={{ marginRight: '5px', color: '#856404' }} />;
      case 'cancelled':
        return <FontAwesomeIcon icon={faCircle} style={{ marginRight: '5px', color: '#721c24' }} />;
      case 'completed':
        return <FontAwesomeIcon icon={faCheckCircle} style={{ marginRight: '5px', color: '#004085' }} />;
      default:
        return null;
    }
  };

  // Don't render the dashboard until user data is loaded
  if (!userData) {
    return null;
  }

  return (
    <div className="dashboard-container-cd">
      <h1 className="title-comm">MINISTRY DASHBOARD</h1>
      
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
                ${date && hasActivity(date) ? 'has-appointment-cd' : ''} 
                ${date && hasEvent(date) ? 'holiday-day-cd' : ''} 
                ${date && isToday(date) ? 'today-cd' : ''}
                ${date && selectedDate && 
                  date.getDate() === selectedDate.getDate() && 
                  date.getMonth() === selectedDate.getMonth() && 
                  date.getFullYear() === selectedDate.getFullYear() 
                    ? 'selected-day-cd' 
                    : ''
                }`}
              onClick={() => handleDayClick(date)}
              aria-label={date ? `${date.getDate()}, ${hasEvent(date) ? 'Community Event' : ''} ${hasActivity(date) ? 'Has activity' : ''}` : 'Empty day'}
            >
              {date && (
                <>
                  <span className="day-number-cd">{date.getDate()}</span>
                  {hasActivity(date) && <div className="appointment-dot-cd"></div>}
                  {hasEvent(date) && (
                    <div className="holiday-indicator-cd">
                      <div 
                        className="holiday-dot-cd" 
                        style={{ 
                          backgroundColor: getEvent(date).type === "Liturgical" ? "#e74c3c" : "#f39c12" 
                        }}
                      ></div>
                      <span className="holiday-name-cd">{getEvent(date).name}</span>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
        
        {/* Calendar Legend */}
        <div className="calendar-legend-cd">
          <div className="legend-item-cd">
            <div className="legend-dot-cd" style={{ backgroundColor: "#e74c3c" }}></div>
            <span>Liturgical Event</span>
          </div>
          <div className="legend-item-cd">
            <div className="legend-dot-cd" style={{ backgroundColor: "#f39c12" }}></div>
            <span>Other Event</span>
          </div>
          <div className="legend-item-cd">
            <div className="legend-dot-cd appointment-legend-cd"></div>
            <span>Activity Scheduled</span>
          </div>
        </div>
        
        {/* Event Information */}
        {showEventInfo && selectedEvent && (
          <div className="holiday-info-cd">
            <div className="holiday-info-header-cd">
              <FontAwesomeIcon icon={faInfoCircle} className="holiday-info-icon-cd" />
              <h3>Community Event Information</h3>
            </div>
            <div className="holiday-info-content-cd">
              <p><strong>Date:</strong> {formatDate(selectedEvent.date)}</p>
              <p><strong>Event:</strong> {selectedEvent.name}</p>
              <p><strong>Type:</strong> <span className={`holiday-type-cd ${selectedEvent.type === "Liturgical" ? "regular" : "special"}-holiday-cd`}>{selectedEvent.type} Event</span></p>
            </div>
          </div>
        )}
        
        {/* Selected Date Activities */}
        {selectedDate && (
          <div className="selected-date-info-cd">
            <h3>
              <FontAwesomeIcon icon={faCalendarAlt} style={{ marginRight: '10px', color: '#b3701f' }} />
              {formatDate(selectedDate)}
            </h3>
            
            {getActivitiesForSelectedDate().length > 0 ? (
              <div className="selected-date-appointments-cd">
                <h4>Scheduled Activities:</h4>
                <ul className="appointment-list-cd">
                  {getActivitiesForSelectedDate().map(activity => (
                    <li key={activity.id} className="appointment-item-cd">
                      <div className="appointment-time-cd">{activity.time}</div>
                      <div className="appointment-details-cd">
                        <span className="appointment-name-cd">{activity.name}</span>
                        <span className="appointment-type-cd">{activity.type}</span>
                        <span className={`appointment-status-cd ${activity.status.toLowerCase()}-cd`}>
                          {getStatusIcon(activity.status)}
                          {activity.status}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="no-appointments-message-cd">
                No activities scheduled for this date. 
                Use the activities section below to plan new ministry activities.
              </p>
            )}
          </div>
        )}
      </div>
      
      {/* Activities Table Section */}
      <div className="activities-section-cd">
        <h2 className="section-title-cd">
          <FontAwesomeIcon icon={faUsers} className="section-icon-cd" />
          Community Activities for {formatMonthYear(currentDate)}
        </h2>
        
        <table className="activities-table-cd">
          <thead>
            <tr>
              <th>No.</th>
              <th>Title</th>
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
            {getCurrentMonthActivities().length > 0 ? (
              getCurrentMonthActivities().map((activity) => (
                <tr key={activity.id}>
                  <td>{activity.id}</td>
                  <td>{activity.name}</td>
                  <td>{activity.organizer}</td>
                  <td>{activity.type}</td>
                  <td>{formatTableDate(activity.date)}</td>
                  <td>{activity.time}</td>
                  <td>{activity.location}</td>
                  <td>
                    <span className={`status-cd ${activity.status.toLowerCase()}-cd`}>
                      {activity.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className="view-btn-cd"
                      onClick={() => viewActivityDetails(activity.id)}
                    >
                      <FontAwesomeIcon icon={faEye} /> View
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="no-activities-cd">
                  No community activities for this month
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MinistryDashboard;