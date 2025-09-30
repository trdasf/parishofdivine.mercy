import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AiOutlineArrowLeft } from "react-icons/ai";
import "./SecretaryMarriageCertificateView.css";

const SecretaryMarriageCertificateView = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { reqmarriageID } = location.state || {};

  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch marriage request details
  const fetchMarriageDetails = async () => {
    if (!reqmarriageID) {
      setError("Marriage request ID is required");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`http://parishofdivinemercy.com/backend/sec_marriage_request_details.php?reqmarriageID=${reqmarriageID}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setData(result.request);
        console.log("Marriage request details:", result.request);
      } else {
        throw new Error(result.message || 'Failed to fetch marriage request details');
      }
    } catch (error) {
      console.error('Error fetching marriage details:', error);
      setError(error.message || 'Failed to load marriage certificate details');
    } finally {
      setIsLoading(false);
    }
  };

  // Load data when component mounts
  useEffect(() => {
    fetchMarriageDetails();
  }, [reqmarriageID]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getPurposes = () => {
    if (!data) return 'Not specified';
    
    const purposes = [];
    if (data.purposeCivil) purposes.push('Civil Requirement');
    if (data.purposeChurch) purposes.push('Church Requirement (e.g., renewal, canonical processing)');
    if (data.purposePersonal) purposes.push('Personal Record');
    if (data.purposeOthers) purposes.push(`Others: ${data.othersText}`);
    return purposes.length > 0 ? purposes.join(', ') : 'Not specified';
  };

  const handleBack = () => {
    navigate("/secretary-request-certificate");
    console.log('Navigate back');
  };

  const handleGoToAppointments = () => {
    if (data) {
      // Navigate to secretary marriage with search parameters
      // For marriage, we'll search using groom's name primarily
      navigate("/secretary-marriage", {
        state: {
          autoSearch: true,
          groomFirstName: data.groom_fname,
          groomLastName: data.groom_lname,
          brideFirstName: data.bride_fname,
          brideLastName: data.bride_lname
        }
      });
      console.log(`Navigate to appointments with search: Groom: ${data.groom_fname} ${data.groom_lname}, Bride: ${data.bride_fname} ${data.bride_lname}`);
    } else {
      navigate("/secretary-marriage");
      console.log('Navigate to appointments');
    }
  };

  // Show error if no reqmarriageID provided
  if (!reqmarriageID) {
    return (
      <div className="smcv-container">
        <div className="smcv-header">
          <div className="smcv-left-section">
            <button className="smcv-back-button" onClick={handleBack}>
              <AiOutlineArrowLeft className="smcv-back-icon" /> Back
            </button>
          </div>
        </div>
        <h1 className="smcv-title">ERROR</h1>
        <div className="smcv-form-container">
          <div className="smcv-error-message">
            <p>Error: Marriage request ID is required to view this certificate request.</p>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="smcv-container">
        <div className="smcv-header">
          <div className="smcv-left-section">
            <button className="smcv-back-button" onClick={handleBack}>
              <AiOutlineArrowLeft className="smcv-back-icon" /> Back
            </button>
          </div>
        </div>
        <h1 className="smcv-title">MARRIAGE CERTIFICATE REQUEST</h1>
        <div className="smcv-form-container">
          <div className="smcv-loading">
            <p>Loading marriage certificate details...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="smcv-container">
        <div className="smcv-header">
          <div className="smcv-left-section">
            <button className="smcv-back-button" onClick={handleBack}>
              <AiOutlineArrowLeft className="smcv-back-icon" /> Back
            </button>
          </div>
        </div>
        <h1 className="smcv-title">ERROR</h1>
        <div className="smcv-form-container">
          <div className="smcv-error-message">
            <p>Error: {error}</p>
            <button onClick={fetchMarriageDetails} className="smcv-retry-btn">
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show data if loaded successfully
  return (
    <div className="smcv-container">
      {/* Header */}
      <div className="smcv-header">
        <div className="smcv-left-section">
          <button className="smcv-back-button" onClick={handleBack}>
            <AiOutlineArrowLeft className="smcv-back-icon" /> Back
          </button>
        </div>
        <div className="smcv-right-section">
          <div className="smcv-date-field">
            <label>Request Date:</label>
            <span className="smcv-date-display">{formatDate(data?.date_submitted)}</span>
          </div>
        </div>
      </div>
      
      <h1 className="smcv-title">MARRIAGE CERTIFICATE REQUEST</h1>
      
      <div className="smcv-form-container">
        {/* Full Name of Groom Section */}
        <div className="smcv-section">
          <h3 className="smcv-section-title">FULL NAME OF GROOM</h3>
          <div className="smcv-row">
            <div className="smcv-field">
              <label>First Name</label>
              <div className="smcv-display-value">{data?.groom_fname || 'N/A'}</div>
            </div>
            <div className="smcv-field">
              <label>Middle Name</label>
              <div className="smcv-display-value">{data?.groom_mname || 'N/A'}</div>
            </div>
            <div className="smcv-field">
              <label>Last Name</label>
              <div className="smcv-display-value">{data?.groom_lname || 'N/A'}</div>
            </div>
          </div>
        </div>

        {/* Full Name of Bride Section */}
        <div className="smcv-section">
          <h3 className="smcv-section-title">FULL NAME OF BRIDE (MAIDEN NAME)</h3>
          <div className="smcv-row">
            <div className="smcv-field">
              <label>First Name</label>
              <div className="smcv-display-value">{data?.bride_fname || 'N/A'}</div>
            </div>
            <div className="smcv-field">
              <label>Middle Name</label>
              <div className="smcv-display-value">{data?.bride_mname || 'N/A'}</div>
            </div>
            <div className="smcv-field">
              <label>Last Name</label>
              <div className="smcv-display-value">{data?.bride_lname || 'N/A'}</div>
            </div>
          </div>
        </div>

        {/* Marriage Details Section */}
        <div className="smcv-section">
          <div className="smcv-row">
            <div className="smcv-field smcv-field-wide">
              <label>Place of Marriage</label>
              <div className="smcv-display-value">{data?.place_of_marriage || 'N/A'}</div>
            </div>
          </div>
          <div className="smcv-row">
            <div className="smcv-field">
              <label>Date of Marriage</label>
              <div className="smcv-display-value">{formatDate(data?.date_of_marriage)}</div>
            </div>
            <div className="smcv-field">
              <label>Name of Officiating Priest (if known)</label>
              <div className="smcv-display-value">{data?.name_of_priest || 'N/A'}</div>
            </div>
          </div>
        </div>

        {/* Purpose of Request Section */}
        <div className="smcv-section">
          <h3 className="smcv-section-title">PURPOSE OF REQUEST</h3>
          <div className="smcv-purpose-display">
            <div className="smcv-display-value">{getPurposes()}</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="smcv-button-container">
          <button className="smcv-appointments-btn" onClick={handleGoToAppointments}>
            Go to Appointments
          </button>
        </div>
      </div>
    </div>
  );
};

export default SecretaryMarriageCertificateView;