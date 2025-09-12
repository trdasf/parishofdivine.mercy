import React, { useState, useEffect } from "react";
import { AiOutlineArrowLeft } from "react-icons/ai"; 
import { useLocation, useNavigate } from "react-router-dom";
import "./clientconfirmationview.css";

const ClientConfirmationView = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [confirmationData, setConfirmationData] = useState(null);
  const [error, setError] = useState(null);

  // Helper function to format date to "December 23, 2025" format
  const formatDate = (dateString) => {
    if (!dateString || dateString === 'N/A') return 'N/A';
    
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
    // Check if we have necessary state data (confirmationID and clientID)
    const confirmationID = location.state?.confirmationID;
    const clientID = location.state?.clientID;

    if (!confirmationID || !clientID) {
      setError("Missing confirmation information. Please try again.");
      setLoading(false);
      return;
    }

    // Fetch the confirmation details
    fetchConfirmationDetails(confirmationID);
  }, [location]);

  const fetchConfirmationDetails = async (confirmationID) => {
    try {
      const response = await fetch(`https://parishofdivinemercy.com/backend/fetch_confirmation_details.php?confirmationID=${confirmationID}`);
      const data = await response.json();
      
      if (data.success) {
        setConfirmationData(data.data);
      } else {
        setError(data.message || "Failed to fetch confirmation details");
      }
    } catch (error) {
      console.error("Error fetching confirmation details:", error);
      setError("An error occurred while fetching the data");
    } finally {
      setLoading(false);
    }
  };

  // Function to render read-only input field
  const renderReadOnlyField = (value) => {
    return <div className="client-view-value">{value || "N/A"}</div>;
  };

  if (loading) {
    return (
      <div className="client-kumpil-view-container">
        <div className="loading">Loading confirmation details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="client-kumpil-view-container">
        <div className="error">
          <p>{error}</p>
          <button onClick={() => navigate('/client-appointment')}>Back to Appointments</button>
        </div>
      </div>
    );
  }

  if (!confirmationData) {
    return (
      <div className="client-kumpil-view-container">
        <div className="error">
          <p>No confirmation data found.</p>
          <button onClick={() => navigate('/client-appointment')}>Back to Appointments</button>
        </div>
      </div>
    );
  }

  const { confirmation, address, father, mother } = confirmationData;

  return (
    <div className="client-kumpil-view-container">
      {/* Header */}
      <div className="client-kumpil-view-header">
        <div className="client-view-left-section">
          <button className="client-view-back-button" onClick={() => navigate('/client-appointment')}>
            <AiOutlineArrowLeft className="client-view-back-icon" /> Back
          </button>
        </div>
      </div>
      <h1 className="client-view-title">Confirmation Application Details</h1>
      
      {/* Confirmation Data Section */}
      <div className="client-kumpil-view-data">
        <div className="client-kumpil-view-info-card">
          <div className="client-kumpil-view-row-date">
            <div className="client-kumpil-view-field-date">
              <label>Date of Appointment:</label>
              {renderReadOnlyField(formatDate(confirmation.date))}
            </div>
            
            <div className="client-kumpil-view-field-time">
              <label>Time of Appointment:</label>
              {renderReadOnlyField(formatTime(confirmation.time))}
            </div>
          </div>
        </div>
        
        <div className="client-view-bypart">
          <h3 className="client-view-sub-title">Personal Information</h3>
          <div className="client-kumpil-view-info-card">
            <div className="client-kumpil-view-row">
              <div className="client-kumpil-view-field">
                <label>First Name</label>
                {renderReadOnlyField(confirmation.first_name)}
              </div>
              <div className="client-kumpil-view-field">
                <label>Middle Name</label>
                {renderReadOnlyField(confirmation.middle_name)}
              </div>
              <div className="client-kumpil-view-field">
                <label>Last Name</label>
                {renderReadOnlyField(confirmation.last_name)}
              </div>
              <div className="client-kumpil-view-field">
                <label>Date of Birth</label>
                {renderReadOnlyField(formatDate(confirmation.dateOfBirth))}
              </div>
            </div>
            <div className="client-kumpil-view-row">
              <div className="client-kumpil-view-field">
                <label>Age</label>
                {renderReadOnlyField(confirmation.age)}
              </div>
              <div className="client-kumpil-view-field">
                <label>Gender</label>
                {renderReadOnlyField(confirmation.gender)}
              </div>
              <div className="client-kumpil-view-field">
                <label>Date of Baptism</label>
                {renderReadOnlyField(formatDate(confirmation.dateOfBaptism))}
              </div>
              <div className="client-kumpil-view-field">
                <label>Church of Baptism</label>
                {renderReadOnlyField(confirmation.churchOfBaptism)}
              </div>
            </div>
            <label className="sub-mini-cc">Place of Birth</label>
            <div className="client-kumpil-view-row">
              <div className="client-kumpil-view-field">
                <label>Place of Birth</label>
                {renderReadOnlyField(confirmation.placeOfBirth)}
              </div>
            </div>
            
            {/* Address Fields */}
            <label className="sub-mini-cc">Home Address</label>
            <div className="client-kumpil-view-row">
            <div className="client-kumpil-view-field">
                <label>Street</label>
                <div className="client-view-value-add">{address.street}</div>
              </div>
              <div className="client-kumpil-view-field">
                <label>Barangay</label>
                <div className="client-view-value-add">{address.barangay}</div>
              </div>
              <div className="client-kumpil-view-field">
                <label>Municipality</label>
                <div className="client-view-value-add">{address.municipality}</div>
              </div>
              <div className="client-kumpil-view-field">
                <label>Province</label>
                <div className="client-view-value-add">{address.province}</div>
              </div>
              <div className="client-kumpil-view-field">
                <label>Region</label>
                <div className="client-view-value-add">{address.region}</div>
              </div>
            </div>
          </div>
          
          {/* Father's Information */}
          <h3 className="client-view-sub-title">Father's Information</h3>
          <div className="client-kumpil-view-info-card">
            <div className="client-kumpil-view-row">
              <div className="client-kumpil-view-field">
                <label>First Name</label>
                {renderReadOnlyField(father.first_name)}
              </div>
              <div className="client-kumpil-view-field">
                <label>Middle Name</label>
                {renderReadOnlyField(father.middle_name)}
              </div>
              <div className="client-kumpil-view-field">
                <label>Last Name</label>
                {renderReadOnlyField(father.last_name)}
              </div>
            </div>
            <div className="client-kumpil-view-row">
              <div className="client-kumpil-view-field">
                <label>Date of Birth</label>
                {renderReadOnlyField(formatDate(father.dateOfBirth))}
              </div>
              <div className="client-kumpil-view-field">
                <label>Contact Number</label>
                {renderReadOnlyField(father.contact_number)}
              </div>
              <div className="client-kumpil-view-field">
                <label>Place of Birth</label>
                {renderReadOnlyField(father.placeOfBirth)}
              </div>
            </div>
          </div>
          
          {/* Mother's Information */}
          <h3 className="client-view-sub-title">Mother's Information</h3>
          <div className="client-kumpil-view-info-card">
            <div className="client-kumpil-view-row">
              <div className="client-kumpil-view-field">
                <label>First Name</label>
                {renderReadOnlyField(mother.first_name)}
              </div>
              <div className="client-kumpil-view-field">
                <label>Middle Name</label>
                {renderReadOnlyField(mother.middle_name)}
              </div>
              <div className="client-kumpil-view-field">
                <label>Last Name</label>
                {renderReadOnlyField(mother.last_name)}
              </div>
            </div>
            <div className="client-kumpil-view-row">
              <div className="client-kumpil-view-field">
                <label>Date of Birth</label>
                {renderReadOnlyField(formatDate(mother.dateOfBirth))}
              </div>
              <div className="client-kumpil-view-field">
                <label>Contact Number</label>
                {renderReadOnlyField(mother.contact_number)}
              </div>
              <div className="client-kumpil-view-field">
                <label>Place of Birth</label>
                {renderReadOnlyField(mother.placeOfBirth)}
              </div>
            </div>
          </div>
        </div>
        
        {/* Requirements section */}
        <div className="client-requirements-view-container">
          <h2 className="client-requirements-view-title">Requirements</h2>
          <div className="client-requirements-view-box">
          <h3 className="client-view-section-header">Requirements Documents</h3>
            <div className="client-info-view-list">
              <div className="client-info-view-item">
                <div className="client-view-req-label">
                  <p>Certificate of Baptism</p>
                </div>
              </div>
              <div className="client-info-view-item">
                <div className="client-view-req-label">
                  <p>Birth Certificate</p>
                </div>
              </div>
              <div className="client-info-view-item">
                <div className="client-view-req-label">
                  <p>Valid ID for the candidate</p>
                </div>
              </div>
              <div className="client-info-view-item">
                <div className="client-view-req-label">
                  <p>Must receive the Sacrament of Confession before Confirmation</p>
                </div>
              </div>
            </div>
            <h3 className="client-view-section-header">Requirements for Candidate</h3>
            <div className="client-info-view-list">
              <div className="client-info-view-item">
                <div className="client-view-req-label">
                  <p>Must have received the Sacraments of Baptism and Holy Eucharist</p>
                </div>
              </div>
              <div className="client-info-view-item">
                <div className="client-view-req-label">
                  <p>Must be at least 12 years old (Age requirement may vary by parish)</p>
                </div>
              </div>
              <div className="client-info-view-item">
                <div className="client-view-req-label">
                  <p>Must attend Catechism Classes or Confirmation Seminar</p>
                </div>
              </div>
              <div className="client-info-view-item">
                <div className="client-view-req-label">
                  <p>Must receive the Sacrament of Confession before Confirmation</p>
                </div>
              </div>
              <div className="client-info-view-item">
                <div className="client-view-req-label">
                  <p>Must attend a Confirmation Retreat (if required by parish)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientConfirmationView;