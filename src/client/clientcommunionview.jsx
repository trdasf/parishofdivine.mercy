import React, { useState, useEffect } from "react";
import { AiOutlineArrowLeft } from "react-icons/ai"; 
import { useLocation, useNavigate } from "react-router-dom";
import "./ClientCommunionView.css";

const ClientCommunionView = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [communionData, setCommunionData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if we have necessary state data (communionID and clientID)
    const communionID = location.state?.communionID;
    const clientID = location.state?.clientID;

    if (!communionID || !clientID) {
      setError("Missing communion information. Please try again.");
      setLoading(false);
      return;
    }

    // Fetch the communion details
    fetchCommunionDetails(communionID);
  }, [location]);

  const fetchCommunionDetails = async (communionID) => {
    try {
      const response = await fetch(`https://parishofdivinemercy.com/backend/fetch_communion_details.php?communionID=${communionID}`);
      const data = await response.json();
      
      if (data.success) {
        setCommunionData(data.data);
      } else {
        setError(data.message || "Failed to fetch communion details");
      }
    } catch (error) {
      console.error("Error fetching communion details:", error);
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
      <div className="client-communion-view-container">
        <div className="loading">Loading communion details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="client-communion-view-container">
        <div className="error">
          <p>{error}</p>
          <button onClick={() => navigate('/client-appointment')}>Back to Appointments</button>
        </div>
      </div>
    );
  }

  if (!communionData) {
    return (
      <div className="client-communion-view-container">
        <div className="error">
          <p>No communion data found.</p>
          <button onClick={() => navigate('/client-appointment')}>Back to Appointments</button>
        </div>
      </div>
    );
  }

  const { communion, address, father, mother } = communionData;

  return (
    <div className="client-communion-view-container">
      {/* Header */}
      <div className="client-communion-view-header">
        <div className="client-view-left-section">
          <button className="client-view-back-button" onClick={() => navigate('/client-appointment')}>
            <AiOutlineArrowLeft className="client-view-back-icon" /> Back
          </button>
        </div>
      </div>
      <h1 className="client-view-title">Holy Communion Application Details</h1>
      
      {/* Holy Communion Data Section */}
      <div className="client-communion-view-data">
        <div className="client-communion-view-info-card">
          <div className="client-communion-view-row-date">
            <div className="client-communion-view-field-date">
              <label>Date of Appointment:</label>
              {renderReadOnlyField(communion.date)}
            </div>
            
            <div className="client-communion-view-field-time">
              <label>Time of Appointment:</label>
              {renderReadOnlyField(communion.time)}
            </div>
          </div>
        </div>
        
        <div className="client-view-bypart">
          <h3 className="client-view-sub-title">Child's Information</h3>
          <div className="client-communion-view-info-card">
            <div className="client-communion-view-row">
              <div className="client-communion-view-field">
                <label>First Name</label>
                {renderReadOnlyField(communion.first_name)}
              </div>
              <div className="client-communion-view-field">
                <label>Middle Name</label>
                {renderReadOnlyField(communion.middle_name)}
              </div>
              <div className="client-communion-view-field">
                <label>Last Name</label>
                {renderReadOnlyField(communion.last_name)}
              </div>
              <div className="client-communion-view-field">
                <label>Date of Birth</label>
                {renderReadOnlyField(communion.dateOfBirth)}
              </div>
            </div>

            <div className="client-communion-view-row">
              <div className="client-communion-view-field">
                <label>Age</label>
                {renderReadOnlyField(communion.age)}
              </div>
              <div className="client-communion-view-field">
                <label>Gender</label>
                {renderReadOnlyField(communion.gender)}
              </div>
              <div className="client-communion-view-field">
                <label>Date of Baptism</label>
                {renderReadOnlyField(communion.dateOfBaptism)}
              </div>
              <div className="client-communion-view-field">
                <label>Church of Baptism</label>
                {renderReadOnlyField(communion.churchOfBaptism)}
              </div>
            </div>
            <div className="client-communion-view-row">
              <div className="client-communion-view-field">
                <label>Place of Birth</label>
                {renderReadOnlyField(communion.placeOfBirth)}
              </div>
            </div>
            <div className="client-communion-view-row">
            <div className="client-communion-view-field">
                <label>Street</label>
                <div className="client-view-value-add">{address.street}</div>
              </div>
              <div className="client-communion-view-field">
                <label>Barangay</label>
                <div className="client-view-value-add">{address.barangay}</div>
              </div>
              <div className="client-communion-view-field">
                <label>Municipality</label>
                <div className="client-view-value-add">{address.municipality}</div>
              </div>
              <div className="client-communion-view-field">
                <label>Province</label>
                <div className="client-view-value-add">{address.province}</div>
              </div>
              <div className="client-communion-view-field">
                <label>Region</label>
                <div className="client-view-value-add">{address.region}</div>
              </div>
            </div>
          </div>

          {/* Father's Information */}
          <h3 className="client-view-sub-title">Father's Information</h3>
          <div className="client-communion-view-info-card">
            <div className="client-communion-view-row">
              <div className="client-communion-view-field">
                <label>Father's First Name</label>
                {renderReadOnlyField(father.first_name)}
              </div>
              <div className="client-communion-view-field">
                <label>Father's Middle Name</label>
                {renderReadOnlyField(father.middle_name)}
              </div>
              <div className="client-communion-view-field">
                <label>Father's Last Name</label>
                {renderReadOnlyField(father.last_name)}
              </div>
            </div>
            
            <div className="client-communion-view-row">
              <div className="client-communion-view-field">
                <label>Father's Date of Birth</label>
                {renderReadOnlyField(father.dateOfBirth)}
              </div>
              <div className="client-communion-view-field">
                <label>Father's Contact Number</label>
                {renderReadOnlyField(father.contact_number)}
              </div>
              <div className="client-communion-view-field">
                <label>Father's Place of Birth</label>
                {renderReadOnlyField(father.placeOfBirth)}
              </div>
            </div>
          </div>
          
          {/* Mother's Information */}
          <h3 className="client-view-sub-title">Mother's Information</h3>
          <div className="client-communion-view-info-card">
            <div className="client-communion-view-row">
              <div className="client-communion-view-field">
                <label>Mother's First Name</label>
                {renderReadOnlyField(mother.first_name)}
              </div>
              <div className="client-communion-view-field">
                <label>Mother's Middle Name</label>
                {renderReadOnlyField(mother.middle_name)}
              </div>
              <div className="client-communion-view-field">
                <label>Mother's Last Name</label>
                {renderReadOnlyField(mother.last_name)}
              </div>
            </div>
            
            <div className="client-communion-view-row">
              <div className="client-communion-view-field">
                <label>Mother's Date of Birth</label>
                {renderReadOnlyField(mother.dateOfBirth)}
              </div>
              <div className="client-communion-view-field">
                <label>Mother's Contact Number</label>
                {renderReadOnlyField(mother.contact_number)}
              </div>
              <div className="client-communion-view-field">
                <label>Mother's Place of Birth</label>
                {renderReadOnlyField(mother.placeOfBirth)}
              </div>
            </div>
          </div>
        </div>
        
        {/* Requirements section */}
        <div className="client-requirements-view-container">
          <h2 className="client-requirements-view-title">Requirements</h2>
          <div className="client-requirements-view-box">
            <h3 className="client-view-section-header">Documents Status</h3>
            <div className="client-info-view-list">
              <div className="client-info-view-item">
                <p>Certificate of Baptism(Proof of Catholic Baptism)</p>
              </div>
              <div className="client-info-view-item">
              <p>First Communion Certificate(If Applicable, for record purposes)</p>
              </div>
              <div className="client-info-view-item">
              <p>Birth Certificate(For verification purposes)</p>
              </div>
              <div className="client-info-view-item">
              <p>Certificate of Permission(If outside the Parish)</p>
              </div>
            </div>

            <h3 className="client-view-section-header">Requirements for Candidate</h3>
            <div className="client-info-view-list">
              <div className="client-info-view-item">
                <p>Must be a baptized Catholic</p>
              </div>
              <div className="client-info-view-item">
                <p>Must have reached the age of reason (usually around 7 years old)</p>
              </div>
              <div className="client-info-view-item">
                <p>Must have received the Sacrament of Reconciliation (Confession) before First Communion</p>
              </div>
              <div className="client-info-view-item">
                <p>Must attend a First Communion Catechesis or Religious Instruction Program</p>
              </div>
              <div className="client-info-view-item">
                <p>Must understand the significance of the Holy Eucharist and believe in the real presence of Christ in the sacrament</p>
              </div>
              <div className="client-info-view-item">
                <p>Must attend a First Communion Retreat (if required by the parish)</p>
              </div>
            </div>

            <h3 className="client-view-section-header">Parish Requirements</h3>
            <div className="client-info-view-list">
              <div className="client-info-view-item">
                <p>Must be registered in the parish where First Communion will be received</p>
              </div>
              <div className="client-info-view-item">
                <p>Must attend the required preparation classes and rehearsals</p>
              </div>
              <div className="client-info-view-item">
                <p>Must participate in a First Communion Retreat (if required by the parish)</p>
              </div>
            </div>

            <h3 className="client-view-section-header">Dress Code (If Specified by Parish)</h3>
            <div className="client-info-view-list">
              <div className="client-info-view-item">
                <p>Boys: White polo or barong, black pants, and formal shoes</p>
              </div>
              <div className="client-info-view-item">
                <p>Girls: White dress with sleeves (modest), white veil (optional), and formal shoes</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientCommunionView;