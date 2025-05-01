import React, { useState } from 'react';
import './communitydashboard.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight, faCalendarAlt, faEye, faUsers } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';

const CommunityDashboard = () => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  
  // Sample data - in a real app, these would come from an API or database
  const communityEvents = [
    { date: new Date(2025, 0, 6), name: "Epiphany Celebration" },
    { date: new Date(2025, 2, 19), name: "St. Joseph's Feast" },
    { date: new Date(2025, 3, 20), name: "Easter Vigil" },
    { date: new Date(2025, 4, 31), name: "Flores de Mayo Closing" },
    { date: new Date(2025, 5, 29), name: "Sts. Peter & Paul Feast" },
    { date: new Date(2025, 7, 15), name: "Assumption Day" },
    { date: new Date(2025, 10, 2), name: "All Souls' Day" },
    { date: new Date(2025, 11, 24), name: "Christmas Eve Mass" },
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

  // View activity details
  const viewActivityDetails = (activityId) => {
    // Navigate to activity details page based on activity type
    const activity = communityActivities.find(a => a.id === activityId);
    if (activity) {
      navigate("/community-activity-details", { state: { viewOnly: true, activityData: activity } });
    }
  };

  return (
    <div className="dashboard-container-cd">
      <h1 className="title-comm">COMMUNITY DASHBOARD</h1>
      
      {/* Calendar Section */}
      <div className="calendar-section-comm">
        <div className="calendar-header-comm">
          <button className="nav-btn-comm" onClick={prevMonth}>
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>
          <h2 className="month-year-comm">{formatMonthYear(currentDate)}</h2>
          <button className="nav-btn-comm" onClick={nextMonth}>
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
        </div>
        
        <div className="calendar-grid-comm">
          {/* Calendar week days */}
          <div className="weekday-comm">Sun</div>
          <div className="weekday-comm">Mon</div>
          <div className="weekday-comm">Tue</div>
          <div className="weekday-comm">Wed</div>
          <div className="weekday-comm">Thu</div>
          <div className="weekday-comm">Fri</div>
          <div className="weekday-comm">Sat</div>
          
          {/* Calendar days */}
          {generateCalendarDays().map((date, index) => (
            <div 
              key={index} 
              className={`calendar-day-comm ${!date ? 'empty-day-comm' : ''} ${
                date && hasActivity(date) ? 'has-activity-comm' : ''
              } ${
                date && selectedDate && 
                date.getDate() === selectedDate.getDate() && 
                date.getMonth() === selectedDate.getMonth() && 
                date.getFullYear() === selectedDate.getFullYear() 
                  ? 'selected-day-comm' 
                  : ''
              }`}
              onClick={() => handleDayClick(date)}
            >
              {date && (
                <>
                  <span className="day-number-comm">{date.getDate()}</span>
                  {hasEvent(date) && <div className="event-dot-comm"></div>}
                </>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Activities Table Section */}
      <div className="activities-section-comm">
        <h2 className="section-title-comm">
          <FontAwesomeIcon icon={faUsers} className="section-icon-comm" />
          Community Activities for {formatMonthYear(currentDate)}
        </h2>
        
        <table className="activities-table-comm">
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
                  <td>{formatDate(activity.date)}</td>
                  <td>{activity.time}</td>
                  <td>{activity.location}</td>
                  <td>
                    <span className={`status-comm ${activity.status.toLowerCase()}-comm`}>
                      {activity.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className="view-btn-comm"
                      onClick={() => viewActivityDetails(activity.id)}
                    >
                      <FontAwesomeIcon icon={faEye} /> View
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="no-activities-comm">
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

export default CommunityDashboard;