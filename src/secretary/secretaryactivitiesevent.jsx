import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./secretaryactivitiesevent.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faPlus } from "@fortawesome/free-solid-svg-icons";

const SecretaryActivitiesEvent = () => {
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewEventData, setViewEventData] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });
  const [isUpdating, setIsUpdating] = useState(false);

  // States for location data
  const [locationData, setLocationData] = useState([]);
  const [focusedField, setFocusedField] = useState(null);
  const [suggestions, setSuggestions] = useState({
    location: []
  });

  // Add form data state for new activity
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    startDate: "",
    startTime: "",
    street: "",
    location: "",
    nameOfParish: "",
    status: "Approved"
  });

  // Fetch activities on component mount
  useEffect(() => {
    fetchActivities();
    fetchLocations();
  }, []);

  // Fetch location data
  const fetchLocations = async () => {
    try {
      const response = await axios.get('https://parishofdivinemercy.com/backend/get_location.php');
      if (response.data.success) {
        setLocationData(response.data.locations);
      }
    } catch (error) {
      console.error('Error fetching locations:', error);
    }
  };

  // Fetch activities from the server
  const fetchActivities = async () => {
    try {
      setLoading(true);
      const response = await axios.get('https://parishofdivinemercy.com/backend/sec_add_events.php');
      if (response.data.success) {
        setActivities(response.data.activities);
      } else {
        setMessage({ text: "Failed to fetch activities", type: "error" });
      }
    } catch (error) {
      console.error("Error fetching activities:", error);
      setMessage({ text: "An error occurred while fetching activities", type: "error" });
    } finally {
      setLoading(false);
    }
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

  // Handle location selection
  const handleSelectLocation = (selectedLocation) => {
    // If there's a street value, include it at the beginning
    const street = formData.street ? formData.street + " " : "";
    const formattedLocation = `${street}${selectedLocation.barangay}, ${selectedLocation.municipality}, ${selectedLocation.province}`;
    handleInputChange('location', formattedLocation);
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

  // Handle focus for location fields
  const handleFocus = (field) => {
    setFocusedField(field);
    
    if (field === 'location') {
      setSuggestions({
        ...suggestions,
        location: filterLocations(formData.location)
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

  // Handle input changes for form
  const handleInputChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle form submission for new activity
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setMessage({ text: "", type: "" });
      
      // Prepare data for API
      const activityData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        startDate: formData.startDate,
        startTime: formData.startTime,
        location: formData.location,
        nameOfParish: formData.nameOfParish,
        status: formData.status
      };
      
      const response = await axios.post(
        "https://parishofdivinemercy.com/backend/sec_add_events.php",
        activityData
      );
      
      if (response.data.success) {
        setMessage({ text: "Activity created successfully", type: "success" });
        // Close the modal
        setShowAddModal(false);
        // Reset form
        setFormData({
          title: "",
          description: "",
          category: "",
          startDate: "",
          startTime: "",
          street: "",
          location: "",
          nameOfParish: "",
          status: "Approved"
        });
        // Refresh activities list
        fetchActivities();
      } else {
        setMessage({ text: response.data.message || "Failed to create activity", type: "error" });
      }
    } catch (error) {
      console.error("Error creating activity:", error);
      setMessage({ 
        text: error.response?.data?.message || "An error occurred while creating the activity", 
        type: "error" 
      });
    }
  };

  // Handle view button click
  const handleViewClick = (eventData) => {
    setViewEventData(eventData);
    setShowViewModal(true);
  };

  // Handle approve button click
  const handleApprove = async () => {
    if (!viewEventData || !viewEventData.activityID) {
      setMessage({ text: "Activity data is missing", type: "error" });
      return;
    }

    try {
      setIsUpdating(true);
      setMessage({ text: "", type: "" });
      
      // Prepare data for API
      const updateData = {
        activityID: viewEventData.activityID,
        status: "Approved"
      };
      
      const response = await axios.put(
        "https://parishofdivinemercy.com/backend/sec_add_events.php",
        updateData
      );
      
      if (response.data.success) {
        // Update local state
        const updatedActivity = {...viewEventData, status: "Approved"};
        setViewEventData(updatedActivity);
        
        // Update activities list
        setActivities(prevActivities => 
          prevActivities.map(activity => 
            activity.activityID === updatedActivity.activityID ? updatedActivity : activity
          )
        );
        
        setMessage({ text: "Activity approved successfully", type: "success" });
      } else {
        setMessage({ text: response.data.message || "Failed to approve activity", type: "error" });
      }
    } catch (error) {
      console.error("Error approving activity:", error);
      setMessage({ 
        text: error.response?.data?.message || "An error occurred while approving the activity", 
        type: "error" 
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Format date to YYYY-MM-DD
  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      return new Date(dateString).toISOString().split('T')[0];
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString;
    }
  };

  // Filter activities based on status and search term with flexible matching
  const filteredActivities = activities.filter(activity => {
    const matchesStatus = statusFilter ? activity.status === statusFilter : true;
    
    if (!searchTerm.trim()) {
      return matchesStatus;
    }

    const searchValue = searchTerm.toLowerCase().trim();
    const originalSearchValue = searchTerm.toLowerCase();
    
    // Normalize both data and search by trimming and replacing multiple spaces
    const title = activity.title?.toLowerCase().trim() || '';
    const description = activity.description?.toLowerCase().trim() || '';
    const category = activity.category?.toLowerCase().trim() || '';
    const organizer = (activity.organizer || "N/A").toLowerCase().trim();
    const location = activity.location?.toLowerCase().trim() || '';
    const nameOfParish = (activity.nameOfParish || "N/A").toLowerCase().trim();
    const status = activity.status?.toLowerCase().trim() || '';
    const startTime = activity.startTime?.toLowerCase().trim() || '';
    const formattedStartDate = formatDate(activity.startDate);
    const formattedCreatedAt = activity.created_at ? formatDate(activity.created_at) : '';
    const formattedUpdatedAt = activity.updated_at ? formatDate(activity.updated_at) : '';
    
    // Normalize search value by replacing multiple spaces with single space
    const normalizedSearchValue = searchValue.replace(/\s+/g, ' ');
    
    // If search ends with space, only match if the trimmed search is a prefix
    const endsWithSpace = originalSearchValue !== searchValue;
    
    let matchesSearch;
    if (endsWithSpace && searchValue) {
      // For searches ending with space, check if any field starts with the search term
      matchesSearch = (
        title.startsWith(normalizedSearchValue) ||
        description.startsWith(normalizedSearchValue) ||
        category.startsWith(normalizedSearchValue) ||
        organizer.startsWith(normalizedSearchValue) ||
        location.startsWith(normalizedSearchValue) ||
        nameOfParish.startsWith(normalizedSearchValue) ||
        status.startsWith(normalizedSearchValue) ||
        startTime.startsWith(normalizedSearchValue) ||
        formattedStartDate.startsWith(normalizedSearchValue) ||
        formattedCreatedAt.startsWith(normalizedSearchValue) ||
        formattedUpdatedAt.startsWith(normalizedSearchValue)
      );
    } else {
      // Regular search - check if any field contains the search term
      matchesSearch = (
        title.includes(normalizedSearchValue) ||
        description.includes(normalizedSearchValue) ||
        category.includes(normalizedSearchValue) ||
        organizer.includes(normalizedSearchValue) ||
        location.includes(normalizedSearchValue) ||
        nameOfParish.includes(normalizedSearchValue) ||
        status.includes(normalizedSearchValue) ||
        startTime.includes(normalizedSearchValue) ||
        formattedStartDate.includes(normalizedSearchValue) ||
        formattedCreatedAt.includes(normalizedSearchValue) ||
        formattedUpdatedAt.includes(normalizedSearchValue)
      );
    }
    
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="event-container-sae">
      <h1 className="title-sae">EVENTS & ACTIVITIES</h1>
      
      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}
      
      <div className="event-actions-sae">
        <div className="search-bar-sae">
          <input 
            type="text" 
            placeholder="Search" 
            value={searchTerm}
            onChange={handleSearch}
          />
          <FontAwesomeIcon icon={faSearch} className="search-icon-sae" />
        </div>

        <div className="right-actions-sae">
          <select 
            className="filter-select-sae"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="Approved">Approved</option>
            <option value="Pending">Pending</option>
          </select>
          
          <button 
            className="add-event-btn-sae"
            onClick={() => setShowAddModal(true)}
          >
            <FontAwesomeIcon icon={faPlus} /> Add Activity
          </button>
        </div>
      </div>
      <div className="event-table-sae-container">
        {loading ? (
          <div className="loading-container-sb">Loading activities...</div>
        ) : (
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
                <th>Name of Parish</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredActivities.length === 0 ? (
                <tr>
                  <td colSpan="11" className="no-data-sb">
                    No activities found {searchTerm && "for the current search"}
                  </td>
                </tr>
              ) : (
                filteredActivities.map((activity, index) => (
                  <tr key={activity.activityID}>
                    <td>{index + 1}</td>
                    <td>{activity.title}</td>
                    <td>{activity.description}</td>
                    <td>{activity.category}</td>
                    <td>{formatDate(activity.startDate)}</td>
                    <td>{activity.startTime}</td>
                    <td>{activity.location}</td>
                    <td>{activity.organizer || "N/A"}</td>
                    <td>{activity.nameOfParish || "N/A"}</td>
                    <td className={`status-${activity.status.toLowerCase()}`}>{activity.status}</td>
                    <td>
                      <button
                        className="sae-details"
                        onClick={() => handleViewClick(activity)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal for adding new activity */}
      {showAddModal && (
        <div className="modal-backdrop-sae">
          <div className="modal-content-sae">
            <h2>Add New Activity</h2>
            <hr className="custom-hr-sum"/>
            <form onSubmit={handleSubmit}>
              <div className="form-group-sae">
                <label>Title</label>
                <input 
                  type="text" 
                  name="title" 
                  value={formData.title} 
                  onChange={(e) => handleInputChange('title', e.target.value)} 
                  required 
                />
              </div>
              <div className="form-group-sae">
                <label>Description</label>
                <textarea 
                  name="description" 
                  value={formData.description} 
                  onChange={(e) => handleInputChange('description', e.target.value)} 
                  required 
                />
              </div>
              <div className="form-group-sae">
                <label>Category</label>
                <input 
                  type="text" 
                  name="category" 
                  value={formData.category} 
                  onChange={(e) => handleInputChange('category', e.target.value)} 
                  required 
                />
              </div>
              <div className="form-row-sae">
                <div className="form-group-sae">
                  <label>Start Date</label>
                  <input 
                    type="date" 
                    name="startDate" 
                    value={formData.startDate} 
                    onChange={(e) => handleInputChange('startDate', e.target.value)} 
                    required 
                  />
                </div>
                <div className="form-group-sae">
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
              <div className="form-group-sae">
                <label>Street</label>
                <input 
                  type="text" 
                  name="street" 
                  value={formData.street} 
                  onChange={handleStreetChange}
                  placeholder="Enter street or area (e.g., Purok 2)" 
                />
              </div>
              <div className="form-group-sae location-dropdown-container">
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
              <div className="form-group-sae">
                <label>Name of Parish</label>
                <input 
                  type="text" 
                  name="nameOfParish" 
                  value={formData.nameOfParish} 
                  onChange={(e) => handleInputChange('nameOfParish', e.target.value)} 
                  required 
                />
              </div>
              <div className="modal-actions-sae">
                <button type="submit" className="submit-btn-sae">
                  Save
                </button>
                <button type="button" onClick={() => setShowAddModal(false)} className="cancel-btn-sae">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal for viewing event details */}
      {showViewModal && viewEventData && (
        <div className="modal-backdrop-sae">
          <div className="modal-content-sae">
            <h2>Event & Activity Details</h2>
            <hr className="custom-hr-sum"/>
            <div className="view-details-sae">
              <div className="detail-row-sae">
                <div className="detail-label-sae">Title:</div>
                <div className="detail-value-sae">{viewEventData.title}</div>
              </div>
              <div className="detail-row-sae">
                <div className="detail-label-sae">Description:</div>
                <div className="detail-value-sae">{viewEventData.description}</div>
              </div>
              <div className="detail-row-sae">
                <div className="detail-label-sae">Category:</div>
                <div className="detail-value-sae">{viewEventData.category}</div>
              </div>
              <div className="detail-row-sae">
                <div className="detail-label-sae">Start Date:</div>
                <div className="detail-value-sae">{formatDate(viewEventData.startDate)}</div>
              </div>
              <div className="detail-row-sae">
                <div className="detail-label-sae">Start Time:</div>
                <div className="detail-value-sae">{viewEventData.startTime}</div>
              </div>
              <div className="detail-row-sae">
                <div className="detail-label-sae">Location:</div>
                <div className="detail-value-sae">{viewEventData.location}</div>
              </div>
              <div className="detail-row-sae">
                <div className="detail-label-sae">Organizer:</div>
                <div className="detail-value-sae">{viewEventData.organizer || "N/A"}</div>
              </div>
              <div className="detail-row-sae">
                <div className="detail-label-sae">Name of Parish:</div>
                <div className="detail-value-sae">{viewEventData.nameOfParish || "N/A"}</div>
              </div>
              <div className="detail-row-sae">
                <div className="detail-label-sae">Status:</div>
                <div className={`detail-value-sae status-${viewEventData.status.toLowerCase()}`}>
                  {viewEventData.status}
                </div>
              </div>
              <div className="detail-row-sae">
                <div className="detail-label-sae">Created At:</div>
                <div className="detail-value-sae">
                  {viewEventData.created_at ? formatDate(viewEventData.created_at) : ""}
                </div>
              </div>
              <div className="detail-row-sae">
                <div className="detail-label-sae">Updated At:</div>
                <div className="detail-value-sae">
                  {viewEventData.updated_at ? formatDate(viewEventData.updated_at) : ""}
                </div>
              </div>
            </div>
            <div className="modal-actions-sae">
              {viewEventData.status === "Pending" && (
                <button 
                  onClick={handleApprove} 
                  className="approve-btn-sae"
                  disabled={isUpdating}
                >
                  {isUpdating ? "Approving..." : "Approve"}
                </button>
              )}
              <button onClick={() => setShowViewModal(false)} className="cancel-btn-sae">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SecretaryActivitiesEvent;