import React, { useState, useEffect } from "react";
import { AiOutlineArrowLeft } from "react-icons/ai"; 
import { useLocation, useNavigate } from "react-router-dom";
import "./ClientAnointingOfTheSickView.css";

const ClientAnointingOfTheSickView = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [anointingData, setAnointingData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if we have necessary state data (anointingID and clientID)
    const anointingID = location.state?.anointingID;
    const clientID = location.state?.clientID;

    if (!anointingID || !clientID) {
      setError("Missing anointing information. Please try again.");
      setLoading(false);
      return;
    }

    // Fetch the anointing details
    fetchAnointingDetails(anointingID);
  }, [location]);

  const fetchAnointingDetails = async (anointingID) => {
    try {
      const response = await fetch(`https://parishofdivinemercy.com/backend/fetch_anointing_details.php?anointingID=${anointingID}`);
      const data = await response.json();
      
      if (data.success) {
        // Initialize empty objects for any missing data to prevent undefined errors
        const safeData = {
          anointing: data.data.anointing || {},
          contact: data.data.contact || {},
          locationInfo: data.data.locationInfo || {},
          additionalInfo: data.data.additionalInfo || {},
          requirements: data.data.requirements || {}
        };
        setAnointingData(safeData);
      } else {
        setError(data.message || "Failed to fetch anointing details");
      }
    } catch (error) {
      console.error("Error fetching anointing details:", error);
      setError("An error occurred while fetching the data");
    } finally {
      setLoading(false);
    }
  };

  // Function to render read-only input field
  const renderReadOnlyField = (value) => {
    return <div className="client-anointing-view-value">{value || "N/A"}</div>;
  };

  // Function to render spouse name
  const renderSpouseName = (firstName, middleName, lastName) => {
    const nameParts = [firstName, middleName, lastName].filter(part => part && part.trim() !== '');
    const fullName = nameParts.length > 0 ? nameParts.join(' ') : '';
    return renderReadOnlyField(fullName);
  };

  // Function to render document status
  const renderDocumentStatus = (status, filePath) => {
    const isSubmitted = status === 'Submitted';
    let displayFileName = '';
    
    if (filePath && isSubmitted) {
      // Extract the filename from the path if necessary
      displayFileName = filePath.includes('/') ? filePath.split('/').pop() : filePath;
    }
    
    return (
      <div className={`client-anointing-view-status ${isSubmitted ? 'client-anointing-view-submitted' : 'client-anointing-view-not-submitted'}`}>
        {isSubmitted ? `${status}: ${displayFileName || ''}` : status || "Not Submitted"}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="client-anointing-view-container">
        <div className="loading">Loading anointing details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="client-anointing-view-container">
        <div className="error">
          <p>{error}</p>
          <button onClick={() => navigate('/client-appointment')}>Back to Appointments</button>
        </div>
      </div>
    );
  }

  if (!anointingData) {
    return (
      <div className="client-anointing-view-container">
        <div className="error">
          <p>No anointing data found.</p>
          <button onClick={() => navigate('/client-appointment')}>Back to Appointments</button>
        </div>
      </div>
    );
  }

  // Safely destructure data with empty objects as fallbacks
  const { 
    anointing = {}, 
    contact = {}, 
    locationInfo = {}, 
    additionalInfo = {}, 
    requirements = {} 
  } = anointingData;

  return (
    <div className="client-anointing-view-container">
      {/* Header */}
      <div className="client-anointing-view-header">
        <div className="client-anointing-view-left-section">
          <button className="client-anointing-view-back-button" onClick={() => navigate('/client-appointment')}>
            <AiOutlineArrowLeft className="client-anointing-view-back-icon" /> Back
          </button>
        </div>
      </div>
      <h1 className="client-anointing-view-title">Anointing of the Sick and Viaticum Application Details</h1>
      
      {/* Anointing Data Section */}
      <div className="client-anointing-view-data">
        <div className="client-anointing-view-row-date">
          <div className="client-anointing-view-field-date">
            <label>Date of Appointment:</label>
            {renderReadOnlyField(anointing.dateOfAnointing)}
          </div>
          
          <div className="client-anointing-view-field-time">
            <label>Time of Appointment:</label>
            {renderReadOnlyField(anointing.timeOfAnointing)}
          </div>
        </div>
        
        <div className="client-anointing-view-bypart">
          <h3 className="client-anointing-view-sub-title">Sick Person Information</h3>
          <div className="client-anointing-view-info-card">
            <div className="client-anointing-view-row">
              <div className="client-anointing-view-field">
                <label>First Name of the Sick Person:</label>
                {renderReadOnlyField(anointing.firstName)}
              </div>
              <div className="client-anointing-view-field">
                <label>Middle Name:</label>
                {renderReadOnlyField(anointing.middleName)}
              </div>
              <div className="client-anointing-view-field">
                <label>Last Name:</label>
                {renderReadOnlyField(anointing.lastName)}
              </div>
            </div>
            
            <div className="client-anointing-view-row">
            <div className="client-anointing-view-field">
                <label>Date of Birth:</label>
                {renderReadOnlyField(anointing.dateOfBirth)}
              </div>
              <div className="client-anointing-view-field">
                <label>Sex:</label>
                {renderReadOnlyField(anointing.sex)}
              </div>
              <div className="client-anointing-view-field">
                <label>Age:</label>
                {renderReadOnlyField(anointing.age)}
              </div>
            </div>
            
            <div className="client-anointing-view-row">
              <div className="client-anointing-view-field">
                <label>Civil Status:</label>
                {renderReadOnlyField(anointing.maritalStatus)}
              </div>
              <div className="client-anointing-view-field">
                <label>Years Married:</label>
                {renderReadOnlyField(anointing.yearsMarried)}
              </div>
            </div>
            
            <div className="client-anointing-view-row">
              <div className="client-anointing-view-field-wide">
                <label>Spouse Name:</label>
                {renderSpouseName(anointing.spouseFirstName, anointing.spouseMiddleName, anointing.spouseLastName)}
              </div>
            </div>
            
            <div className="client-anointing-view-row">
              <div className="client-anointing-view-field">
                <label>Place of Birth:</label>
                {renderReadOnlyField(anointing.placeOfBirth)}
              </div>
            </div>
            
            <div className="client-anointing-view-row">
              <div className="client-anointing-view-field-wide">
                <label>Reason for Anointing (Medical Condition):</label>
                {renderReadOnlyField(anointing.reasonForAnointing)}
              </div>
            </div>
          </div>

          {/* Contact Person Information */}
          <h3 className="client-anointing-view-sub-title">Contact Person Information</h3>
          <div className="client-anointing-view-info-card">
            <div className="client-anointing-view-row">
              <div className="client-anointing-view-field">
                <label>Contact Person's First Name:</label>
                {renderReadOnlyField(contact.contactFirstName)}
              </div>
              <div className="client-anointing-view-field">
                <label>Middle Name:</label>
                {renderReadOnlyField(contact.contactMiddleName)}
              </div>
              <div className="client-anointing-view-field">
                <label>Last Name:</label>
                {renderReadOnlyField(contact.contactLastName)}
              </div>
            </div>
            <div className="client-anointing-view-row">
              <div className="client-anointing-view-field">
                <label>Relationship to Sick Person:</label>
                {renderReadOnlyField(contact.contactRelationship)}
              </div>
              <div className="client-anointing-view-field">
                <label>Phone Number:</label>
                {renderReadOnlyField(contact.contactPhone)}
              </div>
              <div className="client-anointing-view-field">
                <label>Email Address:</label>
                {renderReadOnlyField(contact.contactEmail)}
              </div>
            </div>
          </div>
          
          {/* Location Information */}
          <h3 className="client-anointing-view-sub-title">Location Information</h3>
          <div className="client-anointing-view-info-card">
            <div className="client-anointing-view-row">
              <div className="client-anointing-view-field">
                <label>Location Type:</label>
                {renderReadOnlyField(locationInfo?.locationType)}
              </div>
              <div className="client-anointing-view-field">
                <label>Location Name:</label>
                {renderReadOnlyField(locationInfo?.locationName)}
              </div>
              <div className="client-anointing-view-field">
                <label>Room/Room Number:</label>
                {renderReadOnlyField(locationInfo?.roomNumber)}
              </div>
              <div className="client-anointing-view-field">
                <label>Region:</label>
                {renderReadOnlyField(locationInfo?.locationRegion)}
              </div>
            </div>
            <div className="client-anointing-view-row client-anointing-address-view-row">
              <div className="client-anointing-view-field">
                <label>Street:</label>
                {renderReadOnlyField(locationInfo?.street)}
              </div>
              <div className="client-anointing-view-field">
                <label>Barangay:</label>
                {renderReadOnlyField(locationInfo?.barangay)}
              </div>
              <div className="client-anointing-view-field">
                <label>Municipality:</label>
                {renderReadOnlyField(locationInfo?.municipality)}
              </div>
              <div className="client-anointing-view-field">
                <label>Province:</label>
                {renderReadOnlyField(locationInfo?.province)}
              </div>
            </div>
          </div>
          
          {/* Additional Information */}
          <h3 className="client-anointing-view-sub-title">Additional Information</h3>
          <div className="client-anointing-view-info-card">
            <div className="client-anointing-view-row">
              <div className="client-anointing-checkbox-container">
                <span className={`client-anointing-view-checkbox ${parseInt(additionalInfo?.isCritical || 0) === 1 ? 'client-anointing-view-checked' : ''}`}></span>
                <label>Is the person in critical condition?</label>
              </div>
            </div>
            <div className="client-anointing-view-row">
              <div className="client-anointing-checkbox-container">
                <span className={`client-anointing-view-checkbox ${parseInt(additionalInfo?.needsViaticum || 0) === 1 ? 'client-anointing-view-checked' : ''}`}></span>
                <label>Needs Viaticum (Holy Communion)</label>
              </div>
            </div>
            <div className="client-anointing-view-row">
              <div className="client-anointing-checkbox-container">
                <span className={`client-anointing-view-checkbox ${parseInt(additionalInfo?.needsReconciliation || 0) === 1 ? 'client-anointing-view-checked' : ''}`}></span>
                <label>Needs Sacrament of Reconciliation (Confession)</label>
              </div>
            </div>
            <div className="client-anointing-view-row">
              <div className="client-anointing-view-field-wide">
                <label>Additional Notes or Special Requests:</label>
                {renderReadOnlyField(additionalInfo?.additionalNotes)}
              </div>
            </div>
          </div>
        </div>
        
        <div className="client-anointing-requirements-view-container">
          <h2 className="client-anointing-requirements-view-title">About Anointing of the Sick</h2>
          <div className="client-anointing-requirements-view-box">
          <h3 className="client-anointing-view-section-header">Documents Required</h3>
            <div className="client-anointing-info-view-list">
              <div className="client-anointing-info-view-item">
                <p>Medical Certificate or Doctor's note</p>
              </div>
              <div className="client-anointing-info-view-item">
                <p>Valid IDs of the sick person or the contact person</p>
              </div>
              <div className="client-anointing-info-view-item">
                <p>Certificate of Permission(if the candidate is not a resident of the parish)</p>
              </div>
            </div>
            <h3 className="client-anointing-view-section-header">About Anointing of the Sick</h3>
            <div className="client-anointing-info-view-list">
              <div className="client-anointing-info-view-item">
                <p>The Sacrament of Anointing of the Sick provides spiritual strength and comfort to those who are ill or facing serious medical conditions.</p>
              </div>
              <div className="client-anointing-info-view-item">
                <p>Viaticum is the Holy Communion given to a dying person as spiritual food for their journey to eternal life.</p>
              </div>
              <div className="client-anointing-info-view-item">
                <p>This sacrament can be received by any Catholic who is seriously ill, facing surgery, or weakened by old age.</p>
              </div>
            </div>

            <h3 className="client-anointing-view-section-header">Important Notes</h3>
            <div className="client-anointing-info-view-list">
              <div className="client-anointing-info-view-item">
                <p>For emergency cases, please call the parish emergency number directly instead of using this form.</p>
              </div>
              <div className="client-anointing-info-view-item">
                <p>A priest will visit the location provided to administer the sacrament.</p>
              </div>
              <div className="client-anointing-info-view-item">
                <p>Please ensure someone will be present to receive the priest and guide them to the sick person.</p>
              </div>
              <div className="client-anointing-info-view-item">
                <p>You will receive a confirmation email once your request has been processed.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientAnointingOfTheSickView;