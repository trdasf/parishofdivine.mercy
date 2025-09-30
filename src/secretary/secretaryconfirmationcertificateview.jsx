import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AiOutlineArrowLeft } from "react-icons/ai";
import "./SecretaryConfirmationCertificateView.css";

const SecretaryConfirmationCertificateView = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { reqconfirmationID } = location.state || {};

  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch confirmation request details
  const fetchConfirmationDetails = async () => {
    if (!reqconfirmationID) {
      setError("Confirmation request ID is required");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`http://parishofdivinemercy.com/backend/sec_confirmation_request_details.php?reqconfirmationID=${reqconfirmationID}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setData(result.request);
        console.log("Confirmation request details:", result.request);
      } else {
        throw new Error(result.message || 'Failed to fetch confirmation request details');
      }
    } catch (error) {
      console.error('Error fetching confirmation details:', error);
      setError(error.message || 'Failed to load confirmation certificate details');
    } finally {
      setIsLoading(false);
    }
  };

  // Load data when component mounts
  useEffect(() => {
    fetchConfirmationDetails();
  }, [reqconfirmationID]);

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
    if (data.purposeMarriage) purposes.push('Marriage Preparation');
    if (data.purposeSchool) purposes.push('School Requirement');
    if (data.purposeChurch) purposes.push('Church Requirement');
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
      // Navigate to secretary confirmation with search parameters
      navigate("/secretary-confirmation", {
        state: {
          autoSearch: true,
          firstName: data.first_name,
          lastName: data.last_name
        }
      });
      console.log(`Navigate to appointments with search: ${data.first_name} ${data.last_name}`);
    } else {
      navigate("/secretary-confirmation");
      console.log('Navigate to appointments');
    }
  };

  // Show error if no reqconfirmationID provided
  if (!reqconfirmationID) {
    return (
      <div className="sconfv-container">
        <div className="sconfv-header">
          <div className="sconfv-left-section">
            <button className="sconfv-back-button" onClick={handleBack}>
              <AiOutlineArrowLeft className="sconfv-back-icon" /> Back
            </button>
          </div>
        </div>
        <h1 className="sconfv-title">ERROR</h1>
        <div className="sconfv-form-container">
          <div className="sconfv-error-message">
            <p>Error: Confirmation request ID is required to view this certificate request.</p>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="sconfv-container">
        <div className="sconfv-header">
          <div className="sconfv-left-section">
            <button className="sconfv-back-button" onClick={handleBack}>
              <AiOutlineArrowLeft className="sconfv-back-icon" /> Back
            </button>
          </div>
        </div>
        <h1 className="sconfv-title">CONFIRMATION CERTIFICATE REQUEST</h1>
        <div className="sconfv-form-container">
          <div className="sconfv-loading">
            <p>Loading confirmation certificate details...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="sconfv-container">
        <div className="sconfv-header">
          <div className="sconfv-left-section">
            <button className="sconfv-back-button" onClick={handleBack}>
              <AiOutlineArrowLeft className="sconfv-back-icon" /> Back
            </button>
          </div>
        </div>
        <h1 className="sconfv-title">ERROR</h1>
        <div className="sconfv-form-container">
          <div className="sconfv-error-message">
            <p>Error: {error}</p>
            <button onClick={fetchConfirmationDetails} className="sconfv-retry-btn">
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show data if loaded successfully
  return (
    <div className="sconfv-container">
      {/* Header */}
      <div className="sconfv-header">
        <div className="sconfv-left-section">
          <button className="sconfv-back-button" onClick={handleBack}>
            <AiOutlineArrowLeft className="sconfv-back-icon" /> Back
          </button>
        </div>
        <div className="sconfv-right-section">
          <div className="sconfv-date-field">
            <label>Request Date:</label>
            <span className="sconfv-date-display">{formatDate(data?.date_submitted)}</span>
          </div>
        </div>
      </div>
      
      <h1 className="sconfv-title">CONFIRMATION CERTIFICATE REQUEST</h1>
      
      <div className="sconfv-form-container">
        {/* Personal Information Section */}
        <div className="sconfv-section">
          <h3 className="sconfv-section-title">PERSONAL INFORMATION</h3>
          <div className="sconfv-row">
            <div className="sconfv-field">
              <label>First Name</label>
              <div className="sconfv-display-value">{data?.first_name || 'N/A'}</div>
            </div>
            <div className="sconfv-field">
              <label>Middle Name</label>
              <div className="sconfv-display-value">{data?.middle_name || 'N/A'}</div>
            </div>
            <div className="sconfv-field">
              <label>Last Name</label>
              <div className="sconfv-display-value">{data?.last_name || 'N/A'}</div>
            </div>
          </div>
        </div>

        {/* Father Information Section */}
        <div className="sconfv-section">
          <h3 className="sconfv-section-title">Father Information</h3>
          <div className="sconfv-row">
            <div className="sconfv-field">
              <label>Father's First Name</label>
              <div className="sconfv-display-value">{data?.father_fname || 'N/A'}</div>
            </div>
            <div className="sconfv-field">
              <label>Father's Middle Name</label>
              <div className="sconfv-display-value">{data?.father_mname || 'N/A'}</div>
            </div>
            <div className="sconfv-field">
              <label>Father's Last Name</label>
              <div className="sconfv-display-value">{data?.father_lname || 'N/A'}</div>
            </div>
          </div>
        </div>

        {/* Mother Information Section */}
        <div className="sconfv-section">
          <h3 className="sconfv-section-title">Mother Information</h3>
          <div className="sconfv-row">
            <div className="sconfv-field">
              <label>Mother's First Name</label>
              <div className="sconfv-display-value">{data?.mother_fname || 'N/A'}</div>
            </div>
            <div className="sconfv-field">
              <label>Mother's Middle Name</label>
              <div className="sconfv-display-value">{data?.mother_mname || 'N/A'}</div>
            </div>
            <div className="sconfv-field">
              <label>Mother's Last Name</label>
              <div className="sconfv-display-value">{data?.mother_lname || 'N/A'}</div>
            </div>
          </div>
        </div>

        {/* Confirmation Details Section */}
        <div className="sconfv-section">
          <div className="sconfv-row">
            <div className="sconfv-field sconfv-field-wide">
              <label>Place of Confirmation (Parish/Church)</label>
              <div className="sconfv-display-value">{data?.place_of_confirmation || 'N/A'}</div>
            </div>
          </div>
          <div className="sconfv-row">
            <div className="sconfv-field">
              <label>Date of Confirmation</label>
              <div className="sconfv-display-value">{formatDate(data?.date_of_confirmation)}</div>
            </div>
            <div className="sconfv-field">
              <label>Name of Priest/Minister (if known)</label>
              <div className="sconfv-display-value">{data?.name_of_priest || 'N/A'}</div>
            </div>
          </div>
        </div>

        {/* Purpose of Request Section */}
        <div className="sconfv-section">
          <h3 className="sconfv-section-title">PURPOSE OF REQUEST</h3>
          <div className="sconfv-purpose-display">
            <div className="sconfv-display-value">{getPurposes()}</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="sconfv-button-container">
          <button className="sconfv-appointments-btn" onClick={handleGoToAppointments}>
            Go to Appointments
          </button>
        </div>
      </div>
    </div>
  );
};

export default SecretaryConfirmationCertificateView;