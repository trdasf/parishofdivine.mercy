import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./secretaryactivitiesevent.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";

const SecretaryActivitiesEvent = () => {
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewEventData, setViewEventData] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch activities on component mount
  useEffect(() => {
    fetchActivities();
  }, []);

  // Fetch activities from the server
  const fetchActivities = async () => {
    try {
      setLoading(true);
      const response = await axios.get('https://parishofdivinemercy.com/backend/fetch_activities.php');
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
        "https://parishofdivinemercy.com/backend/fetch_activities.php",
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

    const searchValue = searchTerm.toLowerCase().trim(); // Remove leading/trailing spaces for comparison
    const originalSearchValue = searchTerm.toLowerCase(); // Keep original for trailing space detection
    
    // Normalize both data and search by trimming and replacing multiple spaces
    const title = activity.title?.toLowerCase().trim() || '';
    const description = activity.description?.toLowerCase().trim() || '';
    const category = activity.category?.toLowerCase().trim() || '';
    const organizer = activity.organizer?.toLowerCase().trim() || '';
    const proposedBy = activity.proposedBy?.toLowerCase().trim() || '';
    const location = activity.location?.toLowerCase().trim() || '';
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
        proposedBy.startsWith(normalizedSearchValue) ||
        location.startsWith(normalizedSearchValue) ||
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
        proposedBy.includes(normalizedSearchValue) ||
        location.includes(normalizedSearchValue) ||
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

        <div className="filter-container-sae">
          <select 
            className="filter-select-sae"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="Approved">Approved</option>
            <option value="Pending">Pending</option>
           
          </select>
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
                <th>Proposed By</th>
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
                    <td>{activity.organizer}</td>
                    <td>{activity.proposedBy}</td>
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
                <div className="detail-value-sae">{viewEventData.organizer}</div>
              </div>
              <div className="detail-row-sae">
                <div className="detail-label-sae">Proposed By:</div>
                <div className="detail-value-sae">{viewEventData.proposedBy}</div>
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