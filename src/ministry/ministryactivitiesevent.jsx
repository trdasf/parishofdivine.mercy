import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "./ministryactivitiesevent.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faPlus } from "@fortawesome/free-solid-svg-icons";

const MinistryActivitiesEvent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userID, setUserID] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    startDate: "",
    startTime: "",
    location: "",
    organizer: "",
    street: "",
    status: "Pending"
  });
  const [editEventData, setEditEventData] = useState(null);
  const [message, setMessage] = useState({ text: "", type: "" });

  // States for location data
  const [locationData, setLocationData] = useState([]);
  const [focusedField, setFocusedField] = useState(null);
  const [suggestions, setSuggestions] = useState({
    location: [],
    editLocation: []
  });

  // Get userID from location state or localStorage on mount
  useEffect(() => {
    // First try to get from location state
    if (location.state && location.state.userID) {
      setUserID(location.state.userID);
      if (location.state.userData) {
        setUserData(location.state.userData);
      }
      console.log("Activities: UserID from location state", location.state.userID);
    }
    // If not in location state, try localStorage
    else {
      const storedUser = localStorage.getItem("ministry_user");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUserData(parsedUser);
        setUserID(parsedUser.userID);
        console.log("Activities: User data from localStorage", parsedUser);
      } else {
        // No user data found, redirect to login
        console.log("Activities: No user data found, redirecting to login");
        navigate("/");
      }
    }

    // Fetch location data
    fetchLocations();
  }, [location, navigate]);

  // Fetch events when userID is available
  useEffect(() => {
    if (userID) {
      fetchEvents();
    }
  }, [userID]);

  // Fetch location data
  const fetchLocations = async () => {
    try {
      const response = await axios.get('https://parishofdivinemercy.com/backend/get_location.php');
      if (response.data.success) {
        setLocationData(response.data.locations);
      }
    } catch (error) {
      console.error('Error fetching locations:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch events from the server
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`https://parishofdivinemercy.com/backend/ministry_events.php`);
      if (response.data.success) {
        setEvents(response.data.events);
      } else {
        setMessage({ text: "Failed to fetch events", type: "error" });
      }
    } catch (error) {
      console.error("Error fetching events:", error);
      setMessage({ text: "An error occurred while fetching events", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (eventData) => {
    // Convert date format from YYYY-MM-DD to MM/DD/YYYY for display
    const startDate = eventData.startDate ? formatDateForDisplay(eventData.startDate) : "";
    
    setEditEventData({
      ...eventData,
      startDate: startDate
    });
    setShowEditModal(true);
  };

  // Format date for display in form (YYYY-MM-DD to MM/DD/YYYY)
  const formatDateForDisplay = (dateString) => {
    try {
      const [year, month, day] = dateString.split('-');
      return `${year}-${month}-${day}`;
    } catch (error) {
      return dateString;
    }
  };

  // Format date for database (MM/DD/YYYY to YYYY-MM-DD)
  const formatDateForDatabase = (dateString) => {
    try {
      return dateString; // Already in YYYY-MM-DD format from input
    } catch (error) {
      return dateString;
    }
  };

  // Format time for form display
  const formatTimeForDisplay = (timeString) => {
    return timeString || "";
  };

  // Filter locations based on search term
  const filterLocations = (input) => {
    const inputLower = input.toLowerCase();
    const searchTerms = inputLower.split(/\s+/).filter(term => term.length > 0);
    
    return locationData
      .filter(location => {
        const locationString = `${location.barangay} ${location.municipality} ${location.province}`.toLowerCase();
        return searchTerms.every(term => locationString.includes(term));
      })
      .map(location => ({
        barangay: location.barangay,
        municipality: location.municipality,
        province: location.province
      }));
  };

  // Handle location input changes
  const handleLocationChange = (e) => {
    const value = e.target.value;
    handleInputChange('location', value);
    
    if (focusedField === 'location') {
      setSuggestions({
        ...suggestions,
        location: filterLocations(value)
      });
    }
  };

  const handleEditLocationChange = (e) => {
    const value = e.target.value;
    setEditEventData({
      ...editEventData,
      location: value
    });
    
    if (focusedField === 'editLocation') {
      setSuggestions({
        ...suggestions,
        editLocation: filterLocations(value)
      });
    }
  };

  // Handle location selection
  const handleSelectLocation = (selectedLocation) => {
    // If there's a street value, include it at the beginning
    const street = formData.street ? formData.street + " " : "";
    const formattedLocation = `${street}${selectedLocation.barangay}, ${selectedLocation.municipality}, ${selectedLocation.province}`;
    handleInputChange('location', formattedLocation);
    setFocusedField(null);
  };

  const handleSelectEditLocation = (selectedLocation) => {
    // Extract street from current location if it exists
    let street = "";
    if (editEventData.location) {
      const parts = editEventData.location.split(',');
      if (parts.length > 0) {
        // Try to extract street from the first part
        const barangayParts = parts[0].trim().split(' ');
        const matchedBarangay = selectedLocation.barangay.trim();
        
        // If the last part of the first segment matches the barangay, extract everything before it as street
        const barangayIndex = parts[0].lastIndexOf(matchedBarangay);
        if (barangayIndex > 0) {
          street = parts[0].substring(0, barangayIndex).trim() + " ";
        }
      }
    }
    
    const formattedLocation = `${street}${selectedLocation.barangay}, ${selectedLocation.municipality}, ${selectedLocation.province}`;
    setEditEventData({
      ...editEventData,
      location: formattedLocation
    });
    setFocusedField(null);
  };

  // Handle street input changes
  const handleStreetChange = (e) => {
    const value = e.target.value;
    handleInputChange('street', value);
    
    // If location already has a barangay, municipality, province, update it with the new street
    if (formData.location) {
      const locationParts = formData.location.split(',');
      if (locationParts.length >= 3) {
        // Extract the barangay part
        const barangayPart = locationParts[0].trim();
        const barangayWords = barangayPart.split(' ');
        
        // Check if we can find a matching barangay in the location data
        const matchedLocation = locationData.find(loc => 
          barangayPart.includes(loc.barangay) || 
          loc.barangay.includes(barangayWords[barangayWords.length - 1])
        );
        
        if (matchedLocation) {
          // Reconstruct the location with the new street
          const newLocation = `${value} ${matchedLocation.barangay}, ${matchedLocation.municipality}, ${matchedLocation.province}`;
          handleInputChange('location', newLocation);
        } else {
          // If no match, just prepend the street to the existing location
          handleInputChange('location', `${value} ${formData.location}`);
        }
      } else {
        // If location doesn't have the right format yet, just prepend the street
        handleInputChange('location', `${value} ${formData.location}`);
      }
    }
  };

  const handleInputChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle focus for location fields
  const handleFocus = (field) => {
    setFocusedField(field);
    
    if (field === 'location') {
      setSuggestions({
        ...suggestions,
        location: filterLocations(formData.location)
      });
    } else if (field === 'editLocation') {
      setSuggestions({
        ...suggestions,
        editLocation: filterLocations(editEventData?.location || '')
      });
    }
  };

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      const autocompleteContainers = document.querySelectorAll('.location-dropdown-container');
      let clickedOutside = true;
      
      autocompleteContainers.forEach(container => {
        if (container.contains(event.target)) {
          clickedOutside = false;
        }
      });
      
      if (clickedOutside) {
        setFocusedField(null);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!userID) {
      setMessage({ text: "User ID is missing, please login again", type: "error" });
      return;
    }

    try {
      setMessage({ text: "", type: "" });
      
      // Format the date for database
      const formattedDate = formatDateForDatabase(formData.startDate);
      
      // Prepare data for API
      const eventData = {
        userID: userID,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        startDate: formattedDate,
        startTime: formData.startTime,
        location: formData.location,
        organizer: formData.organizer
      };
      
      const response = await axios.post(
        "https://parishofdivinemercy.com/backend/ministry_events.php",
        eventData
      );
      
      if (response.data.success) {
        setMessage({ text: "Event created successfully", type: "success" });
        // Close the modal
        setShowAddModal(false);
        // Reset form
        setFormData({
          title: "",
          description: "",
          category: "",
          startDate: "",
          startTime: "",
          location: "",
          organizer: "",
          street: "",
          status: "Pending"
        });
        // Refresh events list
        fetchEvents();
      } else {
        setMessage({ text: response.data.message || "Failed to create event", type: "error" });
      }
    } catch (error) {
      console.error("Error creating event:", error);
      setMessage({ 
        text: error.response?.data?.message || "An error occurred while creating the event", 
        type: "error" 
      });
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    
    if (!editEventData || !editEventData.activityID) {
      setMessage({ text: "Event data is missing", type: "error" });
      return;
    }

    try {
      setMessage({ text: "", type: "" });
      
      // Format the date for database
      const formattedDate = formatDateForDatabase(editEventData.startDate);
      
      // Prepare data for API
      const updateData = {
        activityID: editEventData.activityID,
        title: editEventData.title,
        description: editEventData.description,
        category: editEventData.category,
        startDate: formattedDate,
        startTime: editEventData.startTime,
        location: editEventData.location,
        organizer: editEventData.organizer
      };
      
      const response = await axios.put(
        "https://parishofdivinemercy.com/backend/ministry_events.php",
        updateData
      );
      
      if (response.data.success) {
        setMessage({ text: "Event updated successfully", type: "success" });
        // Close the modal
        setShowEditModal(false);
        // Reset edit data
        setEditEventData(null);
        // Refresh events list
        fetchEvents();
      } else {
        setMessage({ text: response.data.message || "Failed to update event", type: "error" });
      }
    } catch (error) {
      console.error("Error updating event:", error);
      setMessage({ 
        text: error.response?.data?.message || "An error occurred while updating the event", 
        type: "error" 
      });
    }
  };

  // Helper function to format date for searching
  const formatDateForSearch = (dateString) => {
    if (!dateString) return [];
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return [dateString.toLowerCase()];
      
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      
      return [
        dateString.toLowerCase(), // Original format
        `${year}-${month}-${day}`, // YYYY-MM-DD
        `${month}/${day}/${year}`, // MM/DD/YYYY
        `${day}/${month}/${year}`, // DD/MM/YYYY
        `${month}-${day}-${year}`, // MM-DD-YYYY
        `${day}-${month}-${year}`, // DD-MM-YYYY
        date.toLocaleDateString().toLowerCase(), // Locale format
        date.toDateString().toLowerCase(), // Readable format
        `${date.toLocaleDateString('en-US', { month: 'long' })} ${day}, ${year}`.toLowerCase(), // January 15, 2024
        `${day} ${date.toLocaleDateString('en-US', { month: 'long' })} ${year}`.toLowerCase(), // 15 January 2024
        date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toLowerCase(), // Jan 15, 2024
      ];
    } catch (error) {
      return [dateString.toLowerCase()];
    }
  };

  // Helper function to format time for searching
  const formatTimeForSearch = (timeString) => {
    if (!timeString) return [];
    
    try {
      const formats = [timeString.toLowerCase()];
      
      // Handle 24-hour format (HH:MM)
      const time24Match = timeString.match(/^(\d{1,2}):(\d{2})$/);
      if (time24Match) {
        const hours = parseInt(time24Match[1]);
        const minutes = time24Match[2];
        
        // Convert to 12-hour format
        if (hours === 0) {
          formats.push(`12:${minutes} am`);
          formats.push(`12:${minutes}am`);
        } else if (hours < 12) {
          formats.push(`${hours}:${minutes} am`);
          formats.push(`${hours}:${minutes}am`);
        } else if (hours === 12) {
          formats.push(`12:${minutes} pm`);
          formats.push(`12:${minutes}pm`);
        } else {
          formats.push(`${hours - 12}:${minutes} pm`);
          formats.push(`${hours - 12}:${minutes}pm`);
        }
        
        // Add padded hour formats
        const paddedHour = String(hours).padStart(2, '0');
        formats.push(`${paddedHour}:${minutes}`);
      }
      
      // Handle 12-hour format input
      const time12Match = timeString.toLowerCase().match(/^(\d{1,2}):(\d{2})\s*(am|pm)$/);
      if (time12Match) {
        const hours = parseInt(time12Match[1]);
        const minutes = time12Match[2];
        const period = time12Match[3];
        
        // Convert to 24-hour format
        let hours24;
        if (period === 'am') {
          hours24 = hours === 12 ? 0 : hours;
        } else {
          hours24 = hours === 12 ? 12 : hours + 12;
        }
        
        formats.push(`${String(hours24).padStart(2, '0')}:${minutes}`);
        formats.push(`${hours24}:${minutes}`);
      }
      
      return formats;
    } catch (error) {
      return [timeString.toLowerCase()];
    }
  };

  // Enhanced filter function to search across all event details
  const filteredEvents = events.filter(event => {
    const matchesStatus = statusFilter ? event.status === statusFilter : true;
    
    // If no search term, only filter by status
    if (!searchTerm) {
      return matchesStatus;
    }
    
    // Convert search term to lowercase for case-insensitive search
    const searchLower = searchTerm.toLowerCase();
    
    // Get all possible date formats for searching
    const dateFormats = formatDateForSearch(event.startDate);
    const timeFormats = formatTimeForSearch(event.startTime);
    
    // Search across all event fields including formatted dates and times
    const matchesSearch = 
      (event.title && event.title.toLowerCase().includes(searchLower)) ||
      (event.description && event.description.toLowerCase().includes(searchLower)) ||
      (event.category && event.category.toLowerCase().includes(searchLower)) ||
      (event.location && event.location.toLowerCase().includes(searchLower)) ||
      (event.organizer && event.organizer.toLowerCase().includes(searchLower)) ||
      (event.status && event.status.toLowerCase().includes(searchLower)) ||
      // Search in all date formats
      dateFormats.some(dateFormat => dateFormat.includes(searchLower)) ||
      // Search in all time formats
      timeFormats.some(timeFormat => timeFormat.includes(searchLower)) ||
      // Search combined date and time
      (event.startDate && event.startTime && 
        `${event.startDate} ${event.startTime}`.toLowerCase().includes(searchLower)) ||
      // Search formatted datetime combinations
      dateFormats.some(dateFormat => 
        timeFormats.some(timeFormat => 
          `${dateFormat} ${timeFormat}`.includes(searchLower)
        )
      );
    
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="event-container-cae">
      <h1 className="title-cae">EVENTS & ACTIVITIES</h1>
      
      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}
      
      <div className="event-actions-cae">
        <div className="search-bar-cae">
          <input 
            type="text" 
            placeholder="Search events by any detail (e.g., 'January 15, 2024', '2:30 PM', '2024-01-15 14:30')..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <FontAwesomeIcon icon={faSearch} className="search-icon-cae" />
        </div>

        <div className="right-actions-cae">
          <select 
            className="filter-select-cae"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Status</option>
            <option value="Approved">Approved</option>
            <option value="Pending">Pending</option>
            <option value="Rejected">Rejected</option>
          </select>
          
          <button 
            className="add-event-btn-cae"
            onClick={() => setShowAddModal(true)}
          >
            <FontAwesomeIcon icon={faPlus} /> Add Event
          </button>
        </div>
      </div>
      
      <div className="event-table-cae-container">
        {loading ? (
          <div className="loading-indicator">Loading events...</div>
        ) : filteredEvents.length === 0 ? (
          <div className="no-events-message">
            {searchTerm || statusFilter ? "No events match your search criteria" : "No events found"}
          </div>
        ) : (
          <table className="event-table-cae">
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
              {filteredEvents.map((event, index) => (
                <tr key={event.activityID}>
                  <td>{index + 1}</td>
                  <td>{event.title}</td>
                  <td>{event.description}</td>
                  <td>{event.category}</td>
                  <td>{event.startDate}</td>
                  <td>{event.startTime}</td>
                  <td>{event.location}</td>
                  <td>{event.organizer}</td>
                  <td>{event.status}</td>
                  <td>
                    <button
                      className="cae-details"
                      onClick={() => handleEditClick(event)}
                      disabled={event.status !== "Pending"}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal for adding new event */}
      {showAddModal && (
        <div className="modal-backdrop-cae">
          <div className="modal-content-cae">
            <h2>Add New Event & Activity</h2>
            <hr className="custom-hr-sum"/>
            <form onSubmit={handleSubmit}>
              <div className="form-group-cae">
                <label>Title</label>
                <input 
                  type="text" 
                  name="title" 
                  value={formData.title} 
                  onChange={(e) => handleInputChange('title', e.target.value)} 
                  required 
                />
              </div>
              <div className="form-group-cae">
                <label>Description</label>
                <textarea 
                  name="description" 
                  value={formData.description} 
                  onChange={(e) => handleInputChange('description', e.target.value)} 
                  required 
                />
              </div>
              <div className="form-group-cae">
                <label>Category</label>
                <input 
                  type="text" 
                  name="category" 
                  value={formData.category} 
                  onChange={(e) => handleInputChange('category', e.target.value)} 
                  required 
                />
              </div>
              <div className="form-row-cae">
                <div className="form-group-cae">
                  <label>Start Date</label>
                  <input 
                    type="date" 
                    name="startDate" 
                    value={formData.startDate} 
                    onChange={(e) => handleInputChange('startDate', e.target.value)} 
                    required 
                  />
                </div>
                <div className="form-group-cae">
                  <label>Start Time</label>
                  <input 
                    type="time" 
                    name="startTime" 
                    value={formData.startTime} 
                    onChange={(e) => handleInputChange('startTime', e.target.value)} 
                    required 
                  />
                </div>
              </div>
              <div className="form-group-cae">
                <label>Street</label>
                <input 
                  type="text" 
                  name="street" 
                  value={formData.street} 
                  onChange={handleStreetChange}
                  placeholder="Enter street or area (e.g., Purok 2)" 
                />
              </div>
              <div className="form-group-cae location-dropdown-container">
                <label>Location</label>
                <input 
                  type="text" 
                  name="location" 
                  value={formData.location} 
                  onChange={handleLocationChange}
                  onFocus={() => handleFocus('location')}
                  placeholder="Type to search (Barangay, Municipality, Province)" 
                  required
                />
                {focusedField === 'location' && suggestions.location.length > 0 && (
                  <div className="location-dropdown">
                    {suggestions.location.map((location, index) => (
                      <div 
                        key={index} 
                        className="location-dropdown-item"
                        onClick={() => handleSelectLocation(location)}
                      >
                        {`${location.barangay}, ${location.municipality}, ${location.province}`}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="form-group-cae">
                <label>Organizer</label>
                <input 
                  type="text" 
                  name="organizer" 
                  value={formData.organizer} 
                  onChange={(e) => handleInputChange('organizer', e.target.value)} 
                  required 
                />
              </div>
              <div className="modal-actions-cae">
              <button type="submit" className="submit-btn-cae">
                  Save
                </button>
                <button type="button" onClick={() => setShowAddModal(false)} className="cancel-btn-cae">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal for editing event */}
      {showEditModal && editEventData && (
        <div className="modal-backdrop-cae">
          <div className="modal-content-cae">
            <h2>Update Event & Activity</h2>
            <hr className="custom-hr-sum"/>
            <form onSubmit={handleUpdate}>
              <div className="form-group-cae">
                <label>Title</label>
                <input 
                  type="text" 
                  name="title" 
                  value={editEventData.title} 
                  onChange={(e) => setEditEventData({...editEventData, title: e.target.value})} 
                  required 
                />
              </div>
              <div className="form-group-cae">
                <label>Description</label>
                <textarea 
                  name="description" 
                  value={editEventData.description} 
                  onChange={(e) => setEditEventData({...editEventData, description: e.target.value})} 
                  required 
                />
              </div>
              <div className="form-group-cae">
                <label>Category</label>
                <input 
                  type="text" 
                  name="category" 
                  value={editEventData.category} 
                  onChange={(e) => setEditEventData({...editEventData, category: e.target.value})} 
                  required 
                />
              </div>
              <div className="form-row-cae">
                <div className="form-group-cae">
                  <label>Start Date</label>
                  <input 
                    type="date" 
                    name="startDate" 
                    value={editEventData.startDate} 
                    onChange={(e) => setEditEventData({...editEventData, startDate: e.target.value})} 
                    required 
                  />
                </div>
                <div className="form-group-cae">
                  <label>Start Time</label>
                  <input 
                    type="time" 
                    name="startTime" 
                    value={formatTimeForDisplay(editEventData.startTime)} 
                    onChange={(e) => setEditEventData({...editEventData, startTime: e.target.value})} 
                    required 
                  />
                </div>
              </div>
              <div className="form-group-cae location-dropdown-container">
                <label>Location</label>
                <input 
                  type="text" 
                  name="location" 
                  value={editEventData.location} 
                  onChange={handleEditLocationChange}
                  onFocus={() => handleFocus('editLocation')}
                  placeholder="Type to search (Barangay, Municipality, Province)" 
                  required
                />
                {focusedField === 'editLocation' && suggestions.editLocation.length > 0 && (
                  <div className="location-dropdown">
                    {suggestions.editLocation.map((location, index) => (
                      <div 
                        key={index} 
                        className="location-dropdown-item"
                        onClick={() => handleSelectEditLocation(location)}
                      >
                        {`${location.barangay}, ${location.municipality}, ${location.province}`}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="form-group-cae">
                <label>Organizer</label>
                <input 
                  type="text" 
                  name="organizer" 
                  value={editEventData.organizer} 
                  onChange={(e) => setEditEventData({...editEventData, organizer: e.target.value})} 
                  required 
                />
              </div>
              <div className="modal-actions-cae">
              <button type="submit" className="submit-btn-cae">
                  Update
                </button>
                <button type="button" onClick={() => setShowEditModal(false)} className="cancel-btn-cae">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MinistryActivitiesEvent;