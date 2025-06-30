import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faPlus, faTimes, faCalendarAlt, faCheckCircle, faExclamationCircle } from "@fortawesome/free-solid-svg-icons";
import "./secretaryschedule.css";

const API_URL = "http://parishofdivinemercy.com/backend";

const SecretarySchedule = () => {
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentSchedule, setCurrentSchedule] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sacramentTypeFilter, setSacramentTypeFilter] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  
  // Store data from API
  const [schedules, setSchedules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [nextScheduleNumber, setNextScheduleNumber] = useState(1);

  // Sacrament Types list
  const sacramentTypes = [
    "Baptism",
    "Marriage",
    "Funeral Mass",
    "Confirmation",
    "Communion",
    "Blessing",
    "Anointing of the Sick and Viaticum"
  ];

  // Fetch schedules on component mount
  useEffect(() => {
    fetchSchedules();
  }, []);

  // Generate schedule code in the format SCH-YYYY-NNNN
  const generateScheduleCode = (index) => {
    const currentYear = new Date().getFullYear();
    
    // Find the highest existing code number to avoid duplication
    let highestNumber = 0;
    
    schedules.forEach(schedule => {
      if (schedule.scheduleCode && schedule.scheduleCode.startsWith(`SCH-${currentYear}-`)) {
        const parts = schedule.scheduleCode.split('-');
        if (parts.length === 3) {
          const codeNumber = parseInt(parts[2], 10);
          if (!isNaN(codeNumber) && codeNumber > highestNumber) {
            highestNumber = codeNumber;
          }
        }
      }
    });
    
    // Use the highest number + 1 to ensure uniqueness
    const nextNumber = Math.max(highestNumber + 1, index);
    const paddedNumber = String(nextNumber).padStart(4, '0');
    
    return `SCH-${currentYear}-${paddedNumber}`;
  };

  // Fetch schedules from API
  const fetchSchedules = async () => {
    setIsLoading(true);
    try {
      console.log("Fetching schedules from:", `${API_URL}/secretary_schedule.php`);
      const response = await fetch(`${API_URL}/secretary_schedule.php`);
      
      const responseText = await response.text();
      console.log("Raw response from schedules fetch:", responseText);
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("Error parsing JSON response:", parseError);
        showError("Server returned invalid data. Check console for details.");
        setIsLoading(false);
        return;
      }
      
      if (data.success) {
        // Process schedules and generate sequential schedule codes
        const processedSchedules = data.schedules.map((schedule, index) => ({
          ...schedule,
          // Ensure date is in correct format
          date: schedule.date || '',
          // Ensure time is in correct format
          time: schedule.time || '',
          // Use existing schedule code or generate a unique one
          scheduleCode: schedule.scheduleCode || generateUniqueScheduleCode(index + 1, data.schedules),
        }));
        
        setSchedules(processedSchedules);
        
        // Calculate next schedule number based on the highest existing code number
        let highestNumber = 0;
        const currentYear = new Date().getFullYear();
        
        processedSchedules.forEach(schedule => {
          if (schedule.scheduleCode && schedule.scheduleCode.startsWith(`SCH-${currentYear}-`)) {
            const parts = schedule.scheduleCode.split('-');
            if (parts.length === 3) {
              const codeNumber = parseInt(parts[2], 10);
              if (!isNaN(codeNumber) && codeNumber > highestNumber) {
                highestNumber = codeNumber;
              }
            }
          }
        });
        
        setNextScheduleNumber(highestNumber + 1);
        
        // Log for debugging
        console.log("Fetched schedules:", processedSchedules);
        console.log("Next schedule number will be:", highestNumber + 1);
      } else {
        console.error("Failed to fetch schedules:", data);
        showError(data.error || data.message || "Failed to fetch schedules. Please try again.");
      }
    } catch (error) {
      console.error("Error fetching schedules:", error);
      showError("Error connecting to the server. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Generate a unique schedule code that doesn't exist in the schedules array
  const generateUniqueScheduleCode = (index, existingSchedules) => {
    const currentYear = new Date().getFullYear();
    let number = index;
    let code = `SCH-${currentYear}-${String(number).padStart(4, '0')}`;
    
    // Check if this code already exists in the schedules
    let codeExists = existingSchedules.some(s => s.scheduleCode === code);
    
    // Keep incrementing the number until we find a unique code
    while (codeExists) {
      number++;
      code = `SCH-${currentYear}-${String(number).padStart(4, '0')}`;
      codeExists = existingSchedules.some(s => s.scheduleCode === code);
    }
    
    return code;
  };

  const toggleModal = (schedule = null) => {
    if (schedule) {
      setIsEditing(true);
      setCurrentSchedule(schedule);
    } else {
      setIsEditing(false);
      // For new schedule, pre-generate the next code
      setCurrentSchedule({
        scheduleCode: generateScheduleCode(nextScheduleNumber)
      });
    }
    setShowModal(!showModal);
  };

  // Show success modal
  const showSuccess = (message) => {
    setSuccessMessage(message);
    setShowSuccessModal(true);
    // Auto-close after 3 seconds
    setTimeout(() => {
      setShowSuccessModal(false);
    }, 3000);
  };

  // Show error modal
  const showError = (message) => {
    setErrorMessage(message);
    setShowErrorModal(true);
    // Auto-close after 4 seconds
    setTimeout(() => {
      setShowErrorModal(false);
    }, 4000);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle sacrament type filter change
  const handleSacramentTypeFilterChange = (e) => {
    setSacramentTypeFilter(e.target.value);
  };

  // Function to format time for searching (handle different time formats)
  const formatTimeForSearch = (timeString) => {
    try {
      if (!timeString) return '';
      
      let hours, minutes;
      
      if (timeString.includes(':')) {
        [hours, minutes] = timeString.split(':');
      } else if (timeString.includes('T')) {
        const timePart = timeString.split('T')[1];
        [hours, minutes] = timePart.split(':');
      } else {
        return timeString.toLowerCase();
      }
      
      const time = new Date();
      time.setHours(parseInt(hours));
      time.setMinutes(parseInt(minutes));
      
      const formatted12Hour = time.toLocaleString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }).toLowerCase();
      
      const formatted24Hour = `${String(parseInt(hours)).padStart(2, '0')}:${String(parseInt(minutes)).padStart(2, '0')}`;
      
      return `${formatted12Hour} ${formatted24Hour}`;
    } catch (e) {
      return timeString.toLowerCase();
    }
  };

  // Filter schedules based on search term and filters with flexible matching - REAL-TIME
  const filteredSchedules = schedules.filter(schedule => {
    // First apply sacrament type filter
    const matchesSacramentType = sacramentTypeFilter === "" || schedule.sacramentType === sacramentTypeFilter;
    
    // If no search term, show all results that match sacrament filter
    if (!searchTerm.trim()) {
      return matchesSacramentType;
    }

    const searchValue = searchTerm.toLowerCase().trim();
    const originalSearchValue = searchTerm.toLowerCase();
    
    // Normalize both data and search by trimming and replacing multiple spaces
    const sacramentType = schedule.sacramentType?.toLowerCase().trim() || '';
    
    // Format date to YYYY-MM-DD for searching
    const formattedDate = schedule.date ? new Date(schedule.date).toISOString().split('T')[0] : '';
    
    // Format time for searching (both 12-hour and 24-hour formats)
    const searchableTime = formatTimeForSearch(schedule.time);
    
    // Normalize search value by replacing multiple spaces with single space
    const normalizedSearchValue = searchValue.replace(/\s+/g, ' ');
    
    // REAL-TIME SEARCH: Check if search term matches any field immediately
    // If search ends with space, only match if the trimmed search is a prefix
    const endsWithSpace = originalSearchValue !== searchValue;
    
    let matchesSearch;
    if (endsWithSpace && searchValue) {
      // For searches ending with space, check if any field starts with the search term
      matchesSearch = (
        sacramentType.startsWith(normalizedSearchValue) ||
        formattedDate.startsWith(normalizedSearchValue) ||
        searchableTime.startsWith(normalizedSearchValue)
      );
    } else {
      // Regular search - check if any field contains the search term (REAL-TIME)
      matchesSearch = (
        sacramentType.includes(normalizedSearchValue) ||
        formattedDate.includes(normalizedSearchValue) ||
        searchableTime.includes(normalizedSearchValue)
      );
    }
    
    return matchesSacramentType && matchesSearch;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    // Make sure date is in YYYY-MM-DD format
    const dateValue = formData.get('date');
    const timeValue = formData.get('time');
    
    // Validate date format
    if (!dateValue || !timeValue) {
      showError("Date and time are required");
      return;
    }
    
    const scheduleData = {
      sacramentType: formData.get('sacramentType'),
      date: dateValue,
      time: timeValue,
      scheduleCode: formData.get('scheduleCode') || generateScheduleCode(nextScheduleNumber)
    };

    console.log("Submitting schedule data:", scheduleData);

    try {
      let response;
      
      if (isEditing) {
        // Update existing schedule
        console.log("Updating schedule with ID:", currentSchedule.id);
        response = await fetch(`${API_URL}/secretary_schedule.php`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...scheduleData,
            id: currentSchedule.id
          }),
        });
      } else {
        // Add new schedule
        console.log("Adding new schedule");
        response = await fetch(`${API_URL}/secretary_schedule.php`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(scheduleData),
        });
      }
      
      const responseText = await response.text();
      console.log("Raw response:", responseText);
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("Error parsing JSON response:", parseError);
        showError("Server returned invalid data. Check console for details.");
        return;
      }
      
      if (data.success) {
        if (!isEditing) {
          // Increment the next schedule number after adding
          setNextScheduleNumber(prevNumber => prevNumber + 1);
        }
        
        // Refresh schedules list
        fetchSchedules();
        toggleModal();
        showSuccess(isEditing ? "Schedule updated successfully!" : "Schedule added successfully!");
      } else {
        console.error("Failed to save schedule:", data);
        // Show specific error message for date/time conflict
        if (data.error === "date_time_conflict") {
          showError("A schedule with this date and time already exists. Please choose a different time.");
        } else {
          showError(data.error || data.message || "Failed to save schedule. Please try again.");
        }
      }
    } catch (error) {
      console.error("Error saving schedule:", error);
      showError("Error connecting to the server. Please try again later.");
    }
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toISOString().split('T')[0]; // Return YYYY-MM-DD format
    } catch (error) {
      return dateString;
    }
  };

  const formatTime = (timeString) => {
    try {
      // Handle different time formats
      let hours, minutes;
      
      if (timeString.includes(':')) {
        [hours, minutes] = timeString.split(':');
      } else if (timeString.includes('T')) {
        const timePart = timeString.split('T')[1];
        [hours, minutes] = timePart.split(':');
      } else {
        return timeString; // Return as is if format is unrecognized
      }
      
      const time = new Date();
      time.setHours(parseInt(hours));
      time.setMinutes(parseInt(minutes));
      
      return time.toLocaleString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (e) {
      console.error("Error formatting time:", e);
      return timeString; // Return original string on error
    }
  };

  // Function to check if date/time is already taken
  const isDateTimeTaken = (date, time, excludeId = null) => {
    return schedules.some(schedule => 
      schedule.date === date && 
      schedule.time === time && 
      (excludeId === null || schedule.id !== excludeId)
    );
  };

  // Validate the form before submitting
  const validateScheduleForm = (formData) => {
    const date = formData.get('date');
    const time = formData.get('time');
    
    // Check if this date and time combination already exists
    const currentId = isEditing ? currentSchedule.id : null;
    if (isDateTimeTaken(date, time, currentId)) {
      showError("A schedule with this date and time already exists. Please choose a different time.");
      return false;
    }
    
    return true;
  };

  // Dynamic placeholder text based on sacrament filter
  const getPlaceholderText = () => {
    if (sacramentTypeFilter) {
      return `Search date or time of ${sacramentTypeFilter}`;
    }
    return "Search by sacrament type, date, or time";
  };

  return (
    <div className="schedule-container-ssc">
      <div className="title-container-ssc">
        <h1 className="title-ssc">SCHEDULE MANAGEMENT</h1>
      </div>
      
      <div className="schedule-actions-ssc">
        <div className="search-bar-ssc-ssc">
          <input 
            type="text" 
            placeholder={getPlaceholderText()} 
            value={searchTerm} 
            onChange={handleSearch}
          />
          <FontAwesomeIcon icon={faSearch} className="search-icon-ssc" />
        </div>

        <div className="filter-add-container-ssc">
          <select 
            className="filter-select-ssc"
            value={sacramentTypeFilter}
            onChange={handleSacramentTypeFilterChange}
          >
            <option value="">All Sacrament Types</option>
            {sacramentTypes.map((type, index) => (
              <option key={index} value={type}>{type}</option>
            ))}
          </select>

          <button className="add-btn-ssc" onClick={() => toggleModal()}>
            <FontAwesomeIcon icon={faPlus} /> ADD
          </button>
        </div>
      </div>

      <table className="schedule-table-ssc">
        <thead>
          <tr>
            <th>Schedule Code</th>
            <th>Sacrament Type</th>
            <th>Date</th>
            <th>Time</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan="5" className="loading-ssc">Loading schedules...</td>
            </tr>
          ) : filteredSchedules.length > 0 ? (
            filteredSchedules.map((schedule, index) => (
              <tr key={schedule.id}>
                <td>{schedule.scheduleCode}</td>
                <td>{schedule.sacramentType}</td>
                <td>{formatDate(schedule.date)}</td>
                <td>{formatTime(schedule.time)}</td>
                <td>
                  <button className="ssc-details" onClick={() => toggleModal(schedule)}>
                    Edit
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="no-results-ssc">No schedules found</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Schedule Modal */}
      {showModal && (
        <div className="schedule-modal-overlay-ssc">
          <div className="schedule-modal-ssc">
            <div className="schedule-modal-header-ssc">
              <h2>{isEditing ? 'Edit Schedule' : 'Add New Schedule'}</h2>
            </div>
            <div>
              <hr className="custom-hr-ssc"/>
            </div>
            <form onSubmit={handleSubmit} className="schedule-form-ssc">
              <div className="form-row-ssc">
                <div className="form-group-ssc">
                  <label>Schedule Code</label>
                  <input 
                    type="text" 
                    name="scheduleCode"
                    defaultValue={currentSchedule?.scheduleCode || ''}
                    readOnly
                  />
                </div>
              </div>

              <div className="form-row-ssc">
                <div className="form-group-ssc">
                  <label>Sacrament Type</label>
                  <select 
                    name="sacramentType" 
                    required 
                    defaultValue={currentSchedule?.sacramentType || ''}
                  >
                    <option value="">Select Sacrament Type</option>
                    {sacramentTypes.map((type, index) => (
                      <option key={index} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row-ssc">
                <div className="form-group-ssc">
                  <label>Date</label>
                  <input 
                    type="date" 
                    name="date" 
                    required 
                    defaultValue={currentSchedule?.date ? currentSchedule.date.split('T')[0] : ''}
                  />
                </div>
                <div className="form-group-ssc">
                  <label>Time</label>
                  <input 
                    type="time" 
                    name="time" 
                    required 
                    defaultValue={currentSchedule?.time ? currentSchedule.time.split('T')[1]?.substring(0, 5) : currentSchedule?.time || ''}
                  />
                </div>
              </div>

              <div className="form-actions-ssc">
                <button type="submit" className="submit-btn-ssc">
                  {isEditing ? 'Update' : 'Save'}
                </button>
                <button type="button" className="cancel-btn-ssc" onClick={() => toggleModal()}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Success Modal */}
      {showSuccessModal && (
        <div className="notification-modal success-modal">
          <div className="notification-content success">
            <FontAwesomeIcon icon={faCheckCircle} className="notification-icon" />
            <p>{successMessage}</p>
          </div>
        </div>
      )}
      
      {/* Error Modal */}
      {showErrorModal && (
        <div className="notification-modal error-modal">
          <div className="notification-content error">
            <FontAwesomeIcon icon={faExclamationCircle} className="notification-icon" />
            <p>{errorMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SecretarySchedule;