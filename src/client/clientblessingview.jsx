import React, { useState, useEffect } from "react";
import { AiOutlineArrowLeft } from "react-icons/ai";
import { useLocation, useNavigate } from "react-router-dom";
import "./ClientBlessingView.css";

const ClientBlessingView = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { clientID, blessingID, viewOnly, appointmentData } = location.state || {};
  
  const [loading, setLoading] = useState(true);
  const [blessingData, setBlessingData] = useState(null);
  const [error, setError] = useState(null);

  // Helper function to format date to "December 23, 2025" format
  const formatDate = (dateString) => {
    if (!dateString || dateString === 'N/A' || dateString === 'Not specified') return dateString;
    
    try {
      const date = new Date(dateString);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return dateString; // Return original if invalid date
      }
      
      // Format to "Month Day, Year"
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString; // Return original if formatting fails
    }
  };

  // Helper function to convert 24-hour time to 12-hour AM/PM format
  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    
    try {
      // Handle different time formats
      let time = timeString;
      
      // If time includes seconds (HH:MM:SS), remove them
      if (time.includes(':') && time.split(':').length === 3) {
        time = time.substring(0, 5); // Keep only HH:MM
      }
      
      // Split the time into hours and minutes
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours, 10);
      const min = minutes || '00';
      
      // Convert to 12-hour format
      if (hour === 0) {
        return `12:${min} AM`;
      } else if (hour < 12) {
        return `${hour}:${min} AM`;
      } else if (hour === 12) {
        return `12:${min} PM`;
      } else {
        return `${hour - 12}:${min} PM`;
      }
    } catch (error) {
      console.error('Error formatting time:', error);
      return timeString; // Return original if formatting fails
    }
  };

  useEffect(() => {
    if (blessingID) {
      fetchBlessingDetails();
    } else {
      setLoading(false);
    }
  }, [blessingID]);

  const fetchBlessingDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`https://parishofdivinemercy.com/backend/fetch_blessing_details.php?blessingID=${blessingID}`);
      const data = await response.json();
      
      if (data.success) {
        setBlessingData(data.data);
      } else {
        setError(data.message || "Failed to fetch blessing details");
      }
    } catch (error) {
      console.error("Error fetching blessing details:", error);
      setError("Error fetching blessing details. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="client-blessing-view-container">
        <div className="client-blessing-view-loading">
          <p>Loading blessing details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="client-blessing-view-container">
        <div className="client-blessing-view-error">
          <h2>Error</h2>
          <p>{error}</p>
          <button 
            className="client-blessing-view-back-button" 
            onClick={() => navigate('/client-appointment')}
          >
            Back to Appointments
          </button>
        </div>
      </div>
    );
  }

  // If no data is available, use appointment data or default values
  const data = blessingData ? {
    preferredDate: formatDate(blessingData.blessing.preferredDate), // Apply date formatting here
    preferredTime: formatTime(blessingData.blessing.preferredTime), // Apply time formatting here
    firstName: blessingData.blessing.firstName,
    middleName: blessingData.blessing.middleName,
    lastName: blessingData.blessing.lastName,
    contactNumber: blessingData.blessing.contactNumber,
    emailAddress: blessingData.blessing.emailAddress,
    placeOfBirth: blessingData.blessing.placeOfBirth,
    status: blessingData.blessing.status,
    dateCreated: formatDate(blessingData.blessing.dateCreated), // Apply date formatting here
    
    // Address data
    street: blessingData.address?.street || "",
    barangay: blessingData.address?.barangay || "",
    municipality: blessingData.address?.municipality || "",
    province: blessingData.address?.province || "",
    
    // Blessing type data
    blessingType: blessingData.type?.blessing_type || "house",
    purpose: blessingData.type?.purpose || "",
    notes: blessingData.type?.note || ""
  } : appointmentData ? {
    preferredDate: formatDate(appointmentData.preferredDate) || "Not specified", // Apply date formatting here
    preferredTime: formatTime(appointmentData.preferredTime) || "Not specified", // Apply formatting to fallback data too
    firstName: appointmentData.firstName || "Not specified",
    middleName: appointmentData.middleName || "",
    lastName: appointmentData.lastName || "Not specified",
    contactNumber: appointmentData.contactNumber || "Not specified",
    emailAddress: appointmentData.emailAddress || "Not specified",
    placeOfBirth: appointmentData.placeOfBirth || "Not specified",
    blessingType: appointmentData.blessingType || "house",
    street: appointmentData.street || "Not specified",
    barangay: appointmentData.barangay || "Not specified",
    municipality: appointmentData.municipality || "Not specified",
    province: appointmentData.province || "Not specified",
    purpose: appointmentData.purpose || "Not specified",
    notes: appointmentData.notes || ""
  } : {
    preferredDate: "Not specified",
    preferredTime: "Not specified",
    firstName: "Not specified",
    middleName: "",
    lastName: "Not specified",
    contactNumber: "Not specified",
    emailAddress: "Not specified",
    placeOfBirth: "Not specified",
    blessingType: "house",
    street: "Not specified",
    barangay: "Not specified",
    municipality: "Not specified",
    province: "Not specified",
    purpose: "Not specified",
    notes: ""
  };

  return (
    <div className="client-blessing-view-container">
      {/* Header */}
      <div className="client-blessing-view-header">
        <div className="client-blessing-view-left-section">
          <button className="client-blessing-view-back-button" onClick={() => navigate('/client-appointment')}>
            <AiOutlineArrowLeft className="client-blessing-view-back-icon" /> Back
          </button>
        </div>
      </div>
      <h1 className="client-blessing-view-title">Blessing Ceremony Application Details</h1>
      
    
      
      {/* Blessing Data Section */}
      <div className="client-blessing-view-data">
        <div className="client-blessing-view-info-card">
          <div className="client-blessing-view-row-date">
            <div className="client-blessing-view-field-date">
              <label>Date of Appointment:</label>
              <div className="client-blessing-view-value">{data.preferredDate}</div>
            </div>
            
            <div className="client-blessing-view-field-time">
              <label>Time of Appointment:</label>
              <div className="client-blessing-view-value">{data.preferredTime}</div>
            </div>
          </div>
        </div>
        
        <div className="client-blessing-view-bypart">
          <h2 className="client-blessing-view-sub-title">Personal Information</h2>
          
          <div className="client-blessing-view-info-card">
            <div className="client-blessing-view-row">
              <div className="client-blessing-view-field">
                <label>First Name</label>
                <div className="client-blessing-view-value">{data.firstName}</div>
              </div>
              <div className="client-blessing-view-field">
                <label>Middle Name</label>
                <div className="client-blessing-view-value">{data.middleName}</div>
              </div>
              <div className="client-blessing-view-field">
                <label>Last Name</label>
                <div className="client-blessing-view-value">{data.lastName}</div>
              </div>
            </div>

            <div className="client-blessing-view-row">
              <div className="client-blessing-view-field">
                <label>Contact Number</label>
                <div className="client-blessing-view-value">{data.contactNumber}</div>
              </div>
              <div className="client-blessing-view-field">
                <label>Email Address</label>
                <div className="client-blessing-view-value">{data.emailAddress}</div>
              </div>
              <div className="client-blessing-view-field">
                <label>Place of Birth</label>
                <div className="client-blessing-view-value">{data.placeOfBirth}</div>
              </div>
            </div>
          </div>

          <h2 className="client-blessing-view-sub-title">Blessing Details</h2>
          
          <div className="client-blessing-view-info-card">
            <label className="sub-mini-cc">Location</label>
            <div className="client-blessing-view-row">
            <div className="client-blessing-view-field">
                <label>Street</label>
                <div className="client-blessing-view-value-add">{data.street}</div>
              </div>
              <div className="client-blessing-view-field">
                <label>Barangay</label>
                <div className="client-blessing-view-value-add">{data.barangay}</div>
              </div>
              <div className="client-blessing-view-field">
                <label>Municipality</label>
                <div className="client-blessing-view-value-add">{data.municipality}</div>
              </div>
              <div className="client-blessing-view-field">
                <label>Province</label>
                <div className="client-blessing-view-value-add">{data.province}</div>
              </div>
            </div>

            <div className="client-blessing-view-row">
              <div className="client-blessing-view-field">
                <label>Blessing Type</label>
                <div className="client-blessing-view-value">
                  {data.blessingType.charAt(0).toUpperCase() + data.blessingType.slice(1)} Blessing
                </div>
              </div>
              <div className="client-blessing-view-field">
                <label>Purpose</label>
                <div className="client-blessing-view-value">{data.purpose}</div>
              </div>
            </div>

            <div className="client-blessing-view-row">
              <div className="client-blessing-view-field">
                <label>Notes</label>
                <div className="client-blessing-view-value">{data.notes || "No additional notes provided."}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientBlessingView;