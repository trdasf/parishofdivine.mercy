import React, { useState, useEffect } from "react";
import { AiOutlineArrowLeft } from "react-icons/ai"; 
import { useLocation, useNavigate } from "react-router-dom";
import "./clientmarriageview.css";

const ClientMarriageView = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [marriageData, setMarriageData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if we have necessary state data (marriageID and clientID)
    const marriageID = location.state?.marriageID;
    const clientID = location.state?.clientID;

    if (!marriageID || !clientID) {
      setError("Missing marriage information. Please try again.");
      setLoading(false);
      return;
    }

    // Fetch the marriage details
    fetchMarriageDetails(marriageID);
  }, [location]);

  const fetchMarriageDetails = async (marriageID) => {
    try {
      const response = await fetch(`https://parishofdivinemercy.com/backend/fetch_marriage_details.php?marriageID=${marriageID}`);
      const data = await response.json();
      
      if (data.success) {
        setMarriageData(data.data);
      } else {
        setError(data.message || "Failed to fetch marriage details");
      }
    } catch (error) {
      console.error("Error fetching marriage details:", error);
      setError("An error occurred while fetching the data");
    } finally {
      setLoading(false);
    }
  };

  // Function to convert 24-hour time to 12-hour format
  const formatTimeTo12Hour = (time24) => {
    if (!time24) return 'N/A';
    
    try {
      // Handle different time formats that might come from backend
      let timeString = time24.toString();
      
      // If it's in HH:MM:SS format, extract just HH:MM
      if (timeString.includes(':')) {
        const parts = timeString.split(':');
        timeString = `${parts[0]}:${parts[1]}`;
      }
      
      // Create a date object with the time
      const [hours, minutes] = timeString.split(':');
      const date = new Date();
      date.setHours(parseInt(hours, 10));
      date.setMinutes(parseInt(minutes, 10));
      
      // Format to 12-hour time
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      console.error('Error formatting time:', error);
      return time24; // Return original if formatting fails
    }
  };

  // Function to format date to readable format
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return dateString; // Return original if formatting fails
    }
  };

  // Function to render read-only input field
  const renderReadOnlyField = (value) => {
    return <div className="client-view-value">{value || "N/A"}</div>;
  };

  if (loading) {
    return (
      <div className="client-marriage-view-container">
        <div className="client-marriage-view-loading">Loading marriage details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="client-marriage-view-container">
        <div className="client-marriage-view-error">
          <p>{error}</p>
          <button onClick={() => navigate('/client-appointment')}>Back to Appointments</button>
        </div>
      </div>
    );
  }

  if (!marriageData) {
    return (
      <div className="client-marriage-view-container">
        <div className="client-marriage-view-error">
          <p>No marriage data found.</p>
          <button onClick={() => navigate('/client-appointment')}>Back to Appointments</button>
        </div>
      </div>
    );
  }

  const { 
    marriage, 
    groomAddress, 
    brideAddress, 
    firstWitness, 
    secondWitness,
    groomFather,
    groomMother,
    brideFather,
    brideMother
  } = marriageData;

  return (
    <div className="client-marriage-view-container">
      {/* Header */}
      <div className="client-marriage-view-header">
        <div className="client-view-left-section">
          <button className="client-view-back-button" onClick={() => navigate('/client-appointment')}>
            <AiOutlineArrowLeft className="client-view-back-icon" /> Back
          </button>
        </div>
      </div>
      <h1 className="client-view-title">Marriage Application Details</h1>
      
      {/* Wedding Information */}
      <div className="client-marriage-view-data">
        <div className="client-view-bypart">
          <h3 className="client-view-sub-title">Wedding Information</h3>
          <div className="client-marriage-view-info-card">
            <div className="client-marriage-view-row">
              <div className="client-marriage-view-field">
                <label>Date of Appointment:</label>
                {renderReadOnlyField(formatDate(marriage.date))}
              </div>
              <div className="client-marriage-view-field">
                <label>Time of Appointment:</label>
                {renderReadOnlyField(formatTimeTo12Hour(marriage.time))}
              </div>
            </div>
          </div>
        </div>

        {/* Groom's Information */}
        <div className="client-view-bypart">
          <h3 className="client-view-sub-title">Groom's Information</h3>
          <div className="client-marriage-view-info-card">
            <div className="client-marriage-view-row">
              <div className="client-marriage-view-field">
                <label>First Name:</label>
                {renderReadOnlyField(marriage.groom_first_name)}
              </div>
              <div className="client-marriage-view-field">
                <label>Middle Name:</label>
                {renderReadOnlyField(marriage.groom_middle_name)}
              </div>
              <div className="client-marriage-view-field">
                <label>Last Name:</label>
                {renderReadOnlyField(marriage.groom_last_name)}
              </div>
            </div>
            <div className="client-marriage-view-row">
              <div className="client-marriage-view-field">
                <label>Age:</label>
                {renderReadOnlyField(marriage.groom_age)}
              </div>
              <div className="client-marriage-view-field">
                <label>Date of Birth:</label>
                {renderReadOnlyField(formatDate(marriage.groom_dateOfBirth))}
              </div>
              <div className="client-marriage-view-field">
                <label>Civil Status:</label>
                {renderReadOnlyField(marriage.groom_civil_status)}
              </div>
            </div>
            <div className="client-marriage-view-row">
              <div className="client-marriage-view-field">
                <label>Religion:</label>
                {renderReadOnlyField(marriage.groom_religion)}
              </div>
              <div className="client-marriage-view-field">
                <label>Date of Baptism:</label>
                {renderReadOnlyField(formatDate(marriage.groom_dateOfBaptism))}
              </div>
              <div className="client-marriage-view-field">
                <label>Church of Baptism:</label>
                {renderReadOnlyField(marriage.groom_churchOfBaptism)}
              </div>
            </div>
            <div className="client-marriage-view-row">
              <div className="client-marriage-view-field">
                <label>Place of Birth:</label>
                {renderReadOnlyField(marriage.groom_placeOfBirth)}
              </div>
            </div>
          </div>
        </div>

        {/* Groom's Address */}
        <div className="client-view-bypart">
          <h3 className="client-view-sub-title">Groom's Address</h3>
          <div className="client-marriage-view-info-card">
            <div className="client-marriage-view-row">
              <div className="client-marriage-view-field">
                <label>Street:</label>
                {renderReadOnlyField(groomAddress?.street)}
              </div>
              <div className="client-marriage-view-field">
                <label>Barangay:</label>
                {renderReadOnlyField(groomAddress?.barangay)}
              </div>
              <div className="client-marriage-view-field">
                <label>Municipality:</label>
                {renderReadOnlyField(groomAddress?.municipality)}
              </div>
            </div>
            <div className="client-marriage-view-row">
              <div className="client-marriage-view-field">
                <label>Province:</label>
                {renderReadOnlyField(groomAddress?.province)}
              </div>
              <div className="client-marriage-view-field">
                <label>Region:</label>
                {renderReadOnlyField(groomAddress?.region)}
              </div>
            </div>
          </div>
        </div>

        {/* Groom's Father Information */}
        <div className="client-view-bypart">
          <h3 className="client-view-sub-title">Groom's Father Information</h3>
          <div className="client-marriage-view-info-card">
            <div className="client-marriage-view-row">
              <div className="client-marriage-view-field">
                <label>First Name:</label>
                {renderReadOnlyField(groomFather?.first_name)}
              </div>
              <div className="client-marriage-view-field">
                <label>Middle Name:</label>
                {renderReadOnlyField(groomFather?.middle_name)}
              </div>
              <div className="client-marriage-view-field">
                <label>Last Name:</label>
                {renderReadOnlyField(groomFather?.last_name)}
              </div>
            </div>
            <div className="client-marriage-view-row">
              <div className="client-marriage-view-field">
                <label>Date of Birth:</label>
                {renderReadOnlyField(formatDate(groomFather?.dateOfBirth))}
              </div>
              <div className="client-marriage-view-field">
                <label>Age:</label>
                {renderReadOnlyField(groomFather?.age)}
              </div>
              <div className="client-marriage-view-field">
                <label>Contact Number:</label>
                {renderReadOnlyField(groomFather?.contact_number)}
              </div>
            </div>
          </div>
        </div>

        {/* Groom's Mother Information */}
        <div className="client-view-bypart">
          <h3 className="client-view-sub-title">Groom's Mother Information</h3>
          <div className="client-marriage-view-info-card">
            <div className="client-marriage-view-row">
              <div className="client-marriage-view-field">
                <label>First Name:</label>
                {renderReadOnlyField(groomMother?.first_name)}
              </div>
              <div className="client-marriage-view-field">
                <label>Middle Name:</label>
                {renderReadOnlyField(groomMother?.middle_name)}
              </div>
              <div className="client-marriage-view-field">
                <label>Last Name:</label>
                {renderReadOnlyField(groomMother?.last_name)}
              </div>
            </div>
            <div className="client-marriage-view-row">
              <div className="client-marriage-view-field">
                <label>Date of Birth:</label>
                {renderReadOnlyField(formatDate(groomMother?.dateOfBirth))}
              </div>
              <div className="client-marriage-view-field">
                <label>Age:</label>
                {renderReadOnlyField(groomMother?.age)}
              </div>
              <div className="client-marriage-view-field">
                <label>Contact Number:</label>
                {renderReadOnlyField(groomMother?.contact_number)}
              </div>
            </div>
          </div>
        </div>

        {/* Bride's Information */}
        <div className="client-view-bypart">
          <h3 className="client-view-sub-title">Bride's Information</h3>
          <div className="client-marriage-view-info-card">
            <div className="client-marriage-view-row">
              <div className="client-marriage-view-field">
                <label>First Name:</label>
                {renderReadOnlyField(marriage.bride_first_name)}
              </div>
              <div className="client-marriage-view-field">
                <label>Middle Name:</label>
                {renderReadOnlyField(marriage.bride_middle_name)}
              </div>
              <div className="client-marriage-view-field">
                <label>Last Name:</label>
                {renderReadOnlyField(marriage.bride_last_name)}
              </div>
            </div>
            <div className="client-marriage-view-row">
              <div className="client-marriage-view-field">
                <label>Age:</label>
                {renderReadOnlyField(marriage.bride_age)}
              </div>
              <div className="client-marriage-view-field">
                <label>Date of Birth:</label>
                {renderReadOnlyField(formatDate(marriage.bride_dateOfBirth))}
              </div>
              <div className="client-marriage-view-field">
                <label>Civil Status:</label>
                {renderReadOnlyField(marriage.bride_civil_status)}
              </div>
            </div>
            <div className="client-marriage-view-row">
              <div className="client-marriage-view-field">
                <label>Religion:</label>
                {renderReadOnlyField(marriage.bride_religion)}
              </div>
              <div className="client-marriage-view-field">
                <label>Date of Baptism:</label>
                {renderReadOnlyField(formatDate(marriage.bride_dateOfBaptism))}
              </div>
              <div className="client-marriage-view-field">
                <label>Church of Baptism:</label>
                {renderReadOnlyField(marriage.bride_churchOfBaptism)}
              </div>
            </div>
            <div className="client-marriage-view-row">
              <div className="client-marriage-view-field">
                <label>Place of Birth:</label>
                {renderReadOnlyField(marriage.bride_placeOfBirth)}
              </div>
            </div>
          </div>
        </div>

        {/* Bride's Address */}
        <div className="client-view-bypart">
          <h3 className="client-view-sub-title">Bride's Address</h3>
          <div className="client-marriage-view-info-card">
            <div className="client-marriage-view-row">
              <div className="client-marriage-view-field">
                <label>Street:</label>
                {renderReadOnlyField(brideAddress?.street)}
              </div>
              <div className="client-marriage-view-field">
                <label>Barangay:</label>
                {renderReadOnlyField(brideAddress?.barangay)}
              </div>
              <div className="client-marriage-view-field">
                <label>Municipality:</label>
                {renderReadOnlyField(brideAddress?.municipality)}
              </div>
            </div>
            <div className="client-marriage-view-row">
              <div className="client-marriage-view-field">
                <label>Province:</label>
                {renderReadOnlyField(brideAddress?.province)}
              </div>
              <div className="client-marriage-view-field">
                <label>Region:</label>
                {renderReadOnlyField(brideAddress?.region)}
              </div>
            </div>
          </div>
        </div>

        {/* Bride's Father Information */}
        <div className="client-view-bypart">
          <h3 className="client-view-sub-title">Bride's Father Information</h3>
          <div className="client-marriage-view-info-card">
            <div className="client-marriage-view-row">
              <div className="client-marriage-view-field">
                <label>First Name:</label>
                {renderReadOnlyField(brideFather?.first_name)}
              </div>
              <div className="client-marriage-view-field">
                <label>Middle Name:</label>
                {renderReadOnlyField(brideFather?.middle_name)}
              </div>
              <div className="client-marriage-view-field">
                <label>Last Name:</label>
                {renderReadOnlyField(brideFather?.last_name)}
              </div>
            </div>
            <div className="client-marriage-view-row">
              <div className="client-marriage-view-field">
                <label>Date of Birth:</label>
                {renderReadOnlyField(formatDate(brideFather?.dateOfBirth))}
              </div>
              <div className="client-marriage-view-field">
                <label>Age:</label>
                {renderReadOnlyField(brideFather?.age)}
              </div>
              <div className="client-marriage-view-field">
                <label>Contact Number:</label>
                {renderReadOnlyField(brideFather?.contact_number)}
              </div>
            </div>
          </div>
        </div>

        {/* Bride's Mother Information */}
        <div className="client-view-bypart">
          <h3 className="client-view-sub-title">Bride's Mother Information</h3>
          <div className="client-marriage-view-info-card">
            <div className="client-marriage-view-row">
              <div className="client-marriage-view-field">
                <label>First Name:</label>
                {renderReadOnlyField(brideMother?.first_name)}
              </div>
              <div className="client-marriage-view-field">
                <label>Middle Name:</label>
                {renderReadOnlyField(brideMother?.middle_name)}
              </div>
              <div className="client-marriage-view-field">
                <label>Last Name:</label>
                {renderReadOnlyField(brideMother?.last_name)}
              </div>
            </div>
            <div className="client-marriage-view-row">
              <div className="client-marriage-view-field">
                <label>Date of Birth:</label>
                {renderReadOnlyField(formatDate(brideMother?.dateOfBirth))}
              </div>
              <div className="client-marriage-view-field">
                <label>Age:</label>
                {renderReadOnlyField(brideMother?.age)}
              </div>
              <div className="client-marriage-view-field">
                <label>Contact Number:</label>
                {renderReadOnlyField(brideMother?.contact_number)}
              </div>
            </div>
          </div>
        </div>

        {/* Witnesses */}
        <div className="client-view-bypart">
          <h3 className="client-view-sub-title">Witnesses</h3>
          <div className="client-marriage-view-info-card">
            {/* First Witness */}
            <div className="client-witness-section">
              <h4 className="client-witness-header">First Witness</h4>
              <div className="client-marriage-view-row">
                <div className="client-marriage-view-field">
                  <label>First Name:</label>
                  {renderReadOnlyField(firstWitness?.first_name)}
                </div>
                <div className="client-marriage-view-field">
                  <label>Middle Name:</label>
                  {renderReadOnlyField(firstWitness?.middle_name)}
                </div>
                <div className="client-marriage-view-field">
                  <label>Last Name:</label>
                  {renderReadOnlyField(firstWitness?.last_name)}
                </div>
              </div>
              <div className="client-marriage-view-row">
              <div className="client-marriage-view-field">
                  <label>Date of Birth:</label>
                  {renderReadOnlyField(formatDate(firstWitness?.dateOfBirth))}
                </div>
              <div className="client-marriage-view-field">
                  <label>Age:</label>
                  {renderReadOnlyField(firstWitness?.age)}
                </div>
                <div className="client-marriage-view-field">
                  <label>Gender:</label>
                  {renderReadOnlyField(firstWitness?.gender)}
                </div>
              </div>
              <div className="client-marriage-view-row">
                <div className="client-marriage-view-field">
                  <label>Contact Number:</label>
                  {renderReadOnlyField(firstWitness?.contact_number)}
                </div>
              </div>
              <div className="client-marriage-view-row">
                <div className="client-marriage-view-field">
                  <label>Address:</label>
                  {renderReadOnlyField(
                    firstWitness ? `${firstWitness.street || ''}, ${firstWitness.barangay || ''}, ${firstWitness.municipality || ''}, ${firstWitness.province || ''}, ${firstWitness.region || ''}`.replace(/^,\s*|,\s*$/g, '').replace(/,\s*,/g, ',') : 'N/A'
                  )}
                </div>
              </div>
            </div>

            <hr className="client-witness-divider" />

            {/* Second Witness */}
            <div className="client-witness-section">
              <h4 className="client-witness-header">Second Witness</h4>
              <div className="client-marriage-view-row">
                <div className="client-marriage-view-field">
                  <label>First Name:</label>
                  {renderReadOnlyField(secondWitness?.first_name)}
                </div>
                <div className="client-marriage-view-field">
                  <label>Middle Name:</label>
                  {renderReadOnlyField(secondWitness?.middle_name)}
                </div>
                <div className="client-marriage-view-field">
                  <label>Last Name:</label>
                  {renderReadOnlyField(secondWitness?.last_name)}
                </div>
              </div>
              <div className="client-marriage-view-row">
              <div className="client-marriage-view-field">
                  <label>Date of Birth:</label>
                  {renderReadOnlyField(formatDate(secondWitness?.dateOfBirth))}
                </div>
                <div className="client-marriage-view-field">
                  <label>Age:</label>
                  {renderReadOnlyField(secondWitness?.age)}
                </div>
                <div className="client-marriage-view-field">
                  <label>Gender:</label>
                  {renderReadOnlyField(secondWitness?.gender)}
                </div>
              </div>
              <div className="client-marriage-view-row">
                <div className="client-marriage-view-field">
                  <label>Contact Number:</label>
                  {renderReadOnlyField(secondWitness?.contact_number)}
                </div>
              </div>
              <div className="client-marriage-view-row">
                <div className="client-marriage-view-field">
                  <label>Address:</label>
                  {renderReadOnlyField(
                    secondWitness ? `${secondWitness.street || ''}, ${secondWitness.barangay || ''}, ${secondWitness.municipality || ''}, ${secondWitness.province || ''}, ${secondWitness.region || ''}`.replace(/^,\s*|,\s*$/g, '').replace(/,\s*,/g, ',') : 'N/A'
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Requirements */}
        <div className="client-requirements-view-container">
          <h2 className="client-requirements-view-title">Requirements</h2>
          <h3 className="client-view-section-header">Documents Requirements(Bring the following documents)</h3>
            <div className="client-info-view-list">
            <div className="client-info-view-item">
                <p>Certificate of Baptism</p>
              </div>
              <div className="client-info-view-item">
                <p>Certificate of Confirmation</p>
              </div>
              <div className="client-info-view-item">
                <p>Birth Certificate</p>
              </div>
              <div className="client-info-view-item">
                <p>Certificate of No Marriage</p>
              </div>
              <div className="client-info-view-item">
                <p>Publication of Banns</p>
              </div>
              <div className="client-info-view-item">
                <p>Permit from Proper Parish</p>
              </div>
              <div className="client-info-view-item">
                <p>Pre-Cana Seminar or Marriage Preparation Program</p>
              </div>
              <div className="client-info-view-item">
                <p>Complete list of sponsors</p>
              </div>
              <div className="client-info-view-item">
                <p>Canonical Interview/Examination</p>
              </div>
              <div className="client-info-view-item">
                <p>Certificate of Permission (if outside the Parish)</p>
              </div>
            </div>
            <h3 className="client-view-section-header">Marriage Requirements Information</h3>
            <div className="client-info-view-list">
              <div className="client-info-view-item">
                <p>Both parties must be free to marry in the Catholic Church</p>
              </div>
              <div className="client-info-view-item">
                <p>At least one party must be Catholic</p>
              </div>
              <div className="client-info-view-item">
                <p>Completion of Pre-Cana (Pre-Marriage) Seminar</p>
              </div>
              <div className="client-info-view-item">
                <p>Valid government-issued marriage license</p>
              </div>
              <div className="client-info-view-item">
                <p>Canonical interview with the parish priest</p>
              </div>
              <div className="client-info-view-item">
                <p>Two witnesses present at the ceremony</p>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default ClientMarriageView;