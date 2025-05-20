import React, { useState, useEffect } from "react";
import { AiOutlineArrowLeft } from "react-icons/ai"; 
import { useLocation, useNavigate } from "react-router-dom";
import "./ClientFuneralMassView.css";

const ClientFuneralMassView = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [funeralData, setFuneralData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if we have necessary state data (funeralID and clientID)
    const funeralID = location.state?.funeralID;
    const clientID = location.state?.clientID;

    if (!funeralID || !clientID) {
      setError("Missing funeral information. Please try again.");
      setLoading(false);
      return;
    }

    // Fetch the funeral details
    fetchFuneralDetails(funeralID);
  }, [location]);

  const fetchFuneralDetails = async (funeralID) => {
    try {
      const response = await fetch(`https://parishofdivinemercy.com/backend/fetch_funeral_details.php?funeralID=${funeralID}`);
      const data = await response.json();
      
      if (data.success) {
        setFuneralData(data.data);
      } else {
        setError(data.message || "Failed to fetch funeral details");
      }
    } catch (error) {
      console.error("Error fetching funeral details:", error);
      setError("An error occurred while fetching the data");
    } finally {
      setLoading(false);
    }
  };

  // Function to render read-only input field
  const renderReadOnlyField = (value) => {
    return <div className="client-funeral-view-value">{value || "N/A"}</div>;
  };

  if (loading) {
    return (
      <div className="client-funeral-view-container">
        <div className="loading">Loading funeral details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="client-funeral-view-container">
        <div className="error">
          <p>{error}</p>
          <button onClick={() => navigate('/client-appointment')}>Back to Appointments</button>
        </div>
      </div>
    );
  }

  if (!funeralData) {
    return (
      <div className="client-funeral-view-container">
        <div className="error">
          <p>No funeral data found.</p>
          <button onClick={() => navigate('/client-appointment')}>Back to Appointments</button>
        </div>
      </div>
    );
  }

  const { funeral, deceased, requester, address } = funeralData;

  return (
    <div className="client-funeral-view-container">
      {/* Header */}
      <div className="client-funeral-view-header">
        <div className="client-funeral-view-left-section">
          <button className="client-funeral-view-back-button" onClick={() => navigate('/client-appointment')}>
            <AiOutlineArrowLeft className="client-funeral-view-back-icon" /> Back
          </button>
        </div>
      </div>
      <h1 className="client-funeral-view-title">Funeral Mass Application Details</h1>
      
      {/* Funeral Mass Data Section */}
      <div className="client-funeral-view-data">
        <div className="client-funeral-view-info-card">
          <div className="client-funeral-view-row-date">
            <div className="client-funeral-view-field-date">
              <label>Date of Appointment:</label>
              {renderReadOnlyField(funeral.dateOfFuneralMass)}
            </div>
            
            <div className="client-funeral-view-field-time">
              <label>Time of Appointment:</label>
              {renderReadOnlyField(funeral.timeOfFuneralMass)}
            </div>
          </div>
        </div>
        
        {/* Deceased Information */}
        <div className="client-funeral-view-bypart">
          <h3 className="client-funeral-view-sub-title">Deceased Information</h3>
          <div className="client-funeral-view-info-card">
            <div className="client-funeral-view-row">
              <div className="client-funeral-view-field">
                <label>First Name</label>
                {renderReadOnlyField(deceased.first_name)}
              </div>
              <div className="client-funeral-view-field">
                <label>Middle Name</label>
                {renderReadOnlyField(deceased.middle_name)}
              </div>
              <div className="client-funeral-view-field">
                <label>Last Name</label>
                {renderReadOnlyField(deceased.last_name)}
              </div>
            </div>

            <div className="client-funeral-view-row">
            <div className="client-funeral-view-field">
                <label>Date of Birth</label>
                {renderReadOnlyField(deceased.dateOfBirth)}
              </div>
              <div className="client-funeral-view-field">
                <label>Age</label>
                {renderReadOnlyField(deceased.age)}
              </div>
              <div className="client-funeral-view-field">
                <label>Gender</label>
                {renderReadOnlyField(deceased.sex)}
              </div>
              <div className="client-funeral-view-field">
                <label>Date of Death</label>
                {renderReadOnlyField(deceased.dateOfDeath)}
              </div>
            </div>
            
            <div className="client-funeral-view-row">
              <div className="client-funeral-view-field">
                <label>Cause of Death</label>
                {renderReadOnlyField(deceased.causeOfDeath)}
              </div>
            </div>
            
            <div className="client-funeral-view-row">
              <div className="client-funeral-view-field">
                <label>Wake Location</label>
                {renderReadOnlyField(deceased.wake_location)}
              </div>
            </div>
            
            <div className="client-funeral-view-row">
              <div className="client-funeral-view-field">
                <label>Burial Location</label>
                {renderReadOnlyField(deceased.burial_location)}
              </div>
            </div>
          </div>
          
          {/* Requester Information */}
          <h3 className="client-funeral-view-sub-title">Requester Information</h3>
          <div className="client-funeral-view-info-card">
            <div className="client-funeral-view-row">
              <div className="client-funeral-view-field">
                <label>First Name</label>
                {renderReadOnlyField(requester.first_name)}
              </div>
              <div className="client-funeral-view-field">
                <label>Middle Name</label>
                {renderReadOnlyField(requester.middle_name)}
              </div>
              <div className="client-funeral-view-field">
                <label>Last Name</label>
                {renderReadOnlyField(requester.last_name)}
              </div>
            </div>
            
            <div className="client-funeral-view-row">
              <div className="client-funeral-view-field">
                <label>Relationship to the Deceased</label>
                {renderReadOnlyField(requester.relationship)}
              </div>
              <div className="client-funeral-view-field">
                <label>Contact Number</label>
                {renderReadOnlyField(requester.contact_number)}
              </div>
              <div className="client-funeral-view-field">
                <label>Email Address</label>
                {renderReadOnlyField(requester.email)}
              </div>
            </div>
          </div>
          
          {/* Address Information */}
          <h3 className="client-funeral-view-sub-title">Address</h3>
          <div className="client-funeral-view-info-card">
            <div className="client-funeral-view-row client-funeral-view-address-row">
            <div className="client-funeral-view-field">
                <label>Street</label>
                {renderReadOnlyField(address.street)}
              </div>
              <div className="client-funeral-view-field">
                <label>Barangay</label>
                {renderReadOnlyField(address.barangay)}
              </div>
              <div className="client-funeral-view-field">
                <label>Municipality</label>
                {renderReadOnlyField(address.municipality)}
              </div>
              <div className="client-funeral-view-field">
                <label>Province</label>
                {renderReadOnlyField(address.province)}
              </div>
            </div>
          </div>
        </div>
        
        {/* Requirements section */}
        <div className="client-funeral-view-requirements-container">
          <h2 className="client-funeral-view-requirements-title">Requirements</h2>
          <div className="client-funeral-view-requirements-box">
            <h3 className="client-funeral-view-section-header">Documents Needed(Bring the following documents)</h3>
            <div className="client-funeral-view-info-list">
              <div className="client-funeral-view-info-item">
                <p>Certificate of Death</p>
              </div>
              <div className="client-funeral-view-info-item">
                <p>Parish Clearance</p>
              </div>
              <div className="client-funeral-view-info-item">
                <p>Permit to Bury</p>
              </div>
              <div className="client-funeral-view-info-item">
                <p>Certificate of Permission(if outside the Parish)</p>
              </div>
            </div>
            <h3 className="client-funeral-view-section-header">Funeral Setup Requirements</h3>
            <div className="client-funeral-view-info-list">
              <div className="client-funeral-view-info-item">
                <p>Photos/memorial table allowed with limitations (not on the altar)</p>
              </div>
              <div className="client-funeral-view-info-item">
                <p>Eulogies may be given before/after the Mass or at the cemetery</p>
              </div>
              <div className="client-funeral-view-info-item">
                <p>Family and guests should wear respectful and modest attire</p>
              </div>
              <div className="client-funeral-view-info-item">
                <p>No loud music, applause, or improper conduct during the Mass</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientFuneralMassView;