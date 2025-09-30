import React, { useState, useEffect } from 'react';
import './ministrydashboard.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faChevronLeft, 
  faChevronRight, 
  faCalendarAlt, 
  faEye, 
  faInfoCircle,
  faCircle,
  faCheckCircle,
  faHandshake,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const MinistryDashboard = () => {
  const navigate = useNavigate();
  
  // Updated to use current date instead of hardcoded May 2025
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showHolidayInfo, setShowHolidayInfo] = useState(false);
  const [selectedHoliday, setSelectedHoliday] = useState(null);
  
  // State for data
  const [activities, setActivities] = useState([]);
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

  // Format date for table display
  const formatDateShort = (date) => {
    return date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
  };
  
  // View event details - Updated to match SecretaryActivitiesEvent component
  const viewEventDetails = (eventId) => {
    const event = activities.find(e => e.activityID === eventId);
    if (event) {
      setSelectedEventData(event);
      setShowEventModal(true);
    }
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

  // Updated isToday function to use actual current date
  const isToday = (date) => {
    const today = new Date(); // Use actual current date
    return date.getDate() === today.getDate() && 
           date.getMonth() === today.getMonth() && 
           date.getFullYear() === today.getFullYear();
  };

  return (
    <div className="dashboard-container-sec">
      <h1 className="title-sec">MINISTRY DASHBOARD</h1>
      
      {/* Error message */}
      {error && (
        <div className="error-message-container">
          <FontAwesomeIcon icon={faExclamationTriangle} className="error-icon" />
          <span>{error}</span>
        </div>
      )}
      
      {/* Calendar Section */}
      <div className="calendar-section-sec">
        <div className="calendar-header-sec">
          <button className="nav-btn-sec" onClick={prevMonth} aria-label="Previous month">
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>
          <h2 className="month-year-sec">
            <FontAwesomeIcon icon={faCalendarAlt} style={{ marginRight: '10px' }} />
            {formatMonthYear(currentDate)}
          </h2>
          <button className="nav-btn-sec" onClick={nextMonth} aria-label="Next month">
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
        </div>
        
        {loading ? (
          <div className="loading-calendar">
            <p>Loading calendar data...</p>
          </div>
        ) : (
          <div className="calendar-grid-sec">
            {/* Calendar week days */}
            <div className="weekday-sec">Sun</div>
            <div className="weekday-sec">Mon</div>
            <div className="weekday-sec">Tue</div>
            <div className="weekday-sec">Wed</div>
            <div className="weekday-sec">Thu</div>
            <div className="weekday-sec">Fri</div>
            <div className="weekday-sec">Sat</div>
            
            {/* Calendar days */}
            {generateCalendarDays().map((date, index) => (
              <div 
                key={index} 
                className={`calendar-day-sec 
                  ${!date ? 'empty-day-sec' : ''} 
                  ${date && hasEvent(date) ? 'has-event-sec' : ''} 
                  ${date && hasHoliday(date) ? 'holiday-day-sec' : ''} 
                  ${date && isToday(date) ? 'today-sec' : ''}
                  ${date && selectedDate && 
                    date.getDate() === selectedDate.getDate() && 
                    date.getMonth() === selectedDate.getMonth() && 
                    date.getFullYear() === selectedDate.getFullYear() 
                      ? 'selected-day-sec' 
                      : ''
                  }`}
                onClick={() => handleDayClick(date)}
                aria-label={date ? `${date.getDate()}, ${hasHoliday(date) ? 'Holiday' : ''} ${hasEvent(date) ? 'Has event' : ''}` : 'Empty day'}
              >
                {date && (
                  <>
                    <span className="day-number-sec">{date.getDate()}</span>
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
        <div className="calendar-legend-sec">
          <div className="legend-item-sec">
            <div className="legend-dot-sec" style={{ backgroundColor: "#e74c3c" }}></div>
            <span>Regular Holiday</span>
          </div>
          <div className="legend-item-sec">
            <div className="legend-dot-sec" style={{ backgroundColor: "#f39c12" }}></div>
            <span>Special Holiday</span>
          </div>
          <div className="legend-item-sec">
            <div className="legend-dot-sec event-legend-sec"></div>
            <span>Community Activity</span>
          </div>
        </div>
        
        {/* Holiday Information */}
        {showHolidayInfo && selectedHoliday && (
          <div className="holiday-info-sec">
            <div className="holiday-info-header-sec">
              <FontAwesomeIcon icon={faInfoCircle} className="holiday-info-icon-sec" />
              <h3>Holiday Information</h3>
            </div>
            <div className="holiday-info-content-sec">
              <p><strong>Date:</strong> {formatDate(selectedHoliday.date)}</p>
              <p><strong>Holiday:</strong> {selectedHoliday.name}</p>
              <p><strong>Type:</strong> <span className={`holiday-type-sec ${selectedHoliday.type.toLowerCase()}-holiday-sec`}>{selectedHoliday.type} Holiday</span></p>
            </div>
          </div>
        )}
        
        {/* Selected Date Details */}
        {selectedDate && (
          <div className="selected-date-info-sec">
            <h3>
              <FontAwesomeIcon icon={faCalendarAlt} style={{ marginRight: '10px', color: '#b3701f' }} />
              {formatDate(selectedDate)}
            </h3>
            
            {getEventsForSelectedDate().length > 0 && (
              <div className="selected-date-events-sec">
                <h4>Activities:</h4>
                <ul className="event-list-sec">
                  {getEventsForSelectedDate().map(activity => (
                    <li key={activity.activityID} className="event-item-sec">
                      <div className="event-time-sec">{activity.startTime}</div>
                      <div className="event-details-sec">
                        <span className="event-name-sec">{activity.title}</span>
                        <span className="event-organizer-sec">{activity.proposedBy || activity.organizer}</span>
                        <span className="event-location-sec">{activity.location}</span>
                        <span className={`event-status-sec ${activity.status.toLowerCase()}-sec`}>
                          {getStatusIcon(activity.status)}
                          {activity.status}
                        </span>
                      </div>
                      <button 
                        className="view-btn-sec event-view-btn-sec" 
                        onClick={() => viewEventDetails(activity.activityID)}
                      >
                        <FontAwesomeIcon icon={faEye} /> View
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {getEventsForSelectedDate().length === 0 && (
              <p className="no-appointments-message-sec">
                No activities scheduled for this date.
              </p>
            )}
          </div>
        )}
      </div>
      
      {/* Activities Table Section */}
      <div className="tables-container-sec">
        <div className="table-section-sec events-table-section-sec">
          <h2 className="section-title-sec">
            <FontAwesomeIcon icon={faHandshake} className="section-icon-sec" />
            Community Activities for {formatMonthYear(currentDate)}
          </h2>
          <div className="data-table-container">
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
                      <td>{activity.startTime}</td>
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
                      {loading ? 'Loading activities...' : 'No approved activities for this month'}
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
            <h2>Activity Details</h2>
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
              <div className="detail-row-sae">
                <div className="detail-label-sae">Category:</div>
                <div className="detail-value-sae">{selectedEventData.category}</div>
              </div>
              <div className="detail-row-sae">
                <div className="detail-label-sae">Start Date:</div>
                <div className="detail-value-sae">{formatDateShort(selectedEventData.date)}</div>
              </div>
              <div className="detail-row-sae">
                <div className="detail-label-sae">Start Time:</div>
                <div className="detail-value-sae">{selectedEventData.startTime}</div>
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

export default MinistryDashboard;