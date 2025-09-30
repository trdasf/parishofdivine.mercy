import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AiOutlineArrowLeft } from "react-icons/ai";
import "./SecretaryCommunionCertificateView.css";

const SecretaryCommunionCertificateView = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { reqcommunionID } = location.state || {};

  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch communion request details
  const fetchCommunionDetails = async () => {
    if (!reqcommunionID) {
      setError("Communion request ID is required");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`http://parishofdivinemercy.com/backend/sec_communion_request_details.php?reqcommunionID=${reqcommunionID}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setData(result.request);
        console.log("Communion request details:", result.request);
      } else {
        throw new Error(result.message || 'Failed to fetch communion request details');
      }
    } catch (error) {
      console.error('Error fetching communion details:', error);
      setError(error.message || 'Failed to load communion certificate details');
    } finally {
      setIsLoading(false);
    }
  };

  // Load data when component mounts
  useEffect(() => {
    fetchCommunionDetails();
  }, [reqcommunionID]);

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
    if (data.purposeSchool) purposes.push('School Requirement');
    if (data.purposeConfirmation) purposes.push('Confirmation Preparation');
    if (data.purposeMarriage) purposes.push('Marriage Preparation');
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
      // Navigate to secretary communion with search parameters
      navigate("/secretary-communion", {
        state: {
          autoSearch: true,
          firstName: data.first_name,
          lastName: data.last_name
        }
      });
      console.log(`Navigate to appointments with search: ${data.first_name} ${data.last_name}`);
    } else {
      navigate("/secretary-communion");
      console.log('Navigate to appointments');
    }
  };

  // Show error if no reqcommunionID provided
  if (!reqcommunionID) {
    return (
      <div className="sccv-container">
        <div className="sccv-header">
          <div className="sccv-left-section">
            <button className="sccv-back-button" onClick={handleBack}>
              <AiOutlineArrowLeft className="sccv-back-icon" /> Back
            </button>
          </div>
        </div>
        <h1 className="sccv-title">ERROR</h1>
        <div className="sccv-form-container">
          <div className="sccv-error-message">
            <p>Error: Communion request ID is required to view this certificate request.</p>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="sccv-container">
        <div className="sccv-header">
          <div className="sccv-left-section">
            <button className="sccv-back-button" onClick={handleBack}>
              <AiOutlineArrowLeft className="sccv-back-icon" /> Back
            </button>
          </div>
        </div>
        <h1 className="sccv-title">FIRST HOLY COMMUNION CERTIFICATE REQUEST</h1>
        <div className="sccv-form-container">
          <div className="sccv-loading">
            <p>Loading communion certificate details...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="sccv-container">
        <div className="sccv-header">
          <div className="sccv-left-section">
            <button className="sccv-back-button" onClick={handleBack}>
              <AiOutlineArrowLeft className="sccv-back-icon" /> Back
            </button>
          </div>
        </div>
        <h1 className="sccv-title">ERROR</h1>
        <div className="sccv-form-container">
          <div className="sccv-error-message">
            <p>Error: {error}</p>
            <button onClick={fetchCommunionDetails} className="sccv-retry-btn">
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show data if loaded successfully
  return (
    <div className="sccv-container">
      {/* Header */}
      <div className="sccv-header">
        <div className="sccv-left-section">
          <button className="sccv-back-button" onClick={handleBack}>
            <AiOutlineArrowLeft className="sccv-back-icon" /> Back
          </button>
        </div>
        <div className="sccv-right-section">
          <div className="sccv-date-field">
            <label>Request Date:</label>
            <span className="sccv-date-display">{formatDate(data?.date_submitted)}</span>
          </div>
        </div>
      </div>
      
      <h1 className="sccv-title">FIRST HOLY COMMUNION CERTIFICATE REQUEST</h1>
      
      <div className="sccv-form-container">
        {/* Personal Information Section */}
        <div className="sccv-section">
          <h3 className="sccv-section-title">PERSONAL INFORMATION</h3>
          <div className="sccv-row">
            <div className="sccv-field">
              <label>First Name</label>
              <div className="sccv-display-value">{data?.first_name || 'N/A'}</div>
            </div>
            <div className="sccv-field">
              <label>Middle Name</label>
              <div className="sccv-display-value">{data?.middle_name || 'N/A'}</div>
            </div>
            <div className="sccv-field">
              <label>Last Name</label>
              <div className="sccv-display-value">{data?.last_name || 'N/A'}</div>
            </div>
          </div>
        </div>

        {/* Father Information Section */}
        <div className="sccv-section">
          <h3 className="sccv-section-title">Father Information</h3>
          <div className="sccv-row">
            <div className="sccv-field">
              <label>Father's First Name</label>
              <div className="sccv-display-value">{data?.father_fname || 'N/A'}</div>
            </div>
            <div className="sccv-field">
              <label>Father's Middle Name</label>
              <div className="sccv-display-value">{data?.father_mname || 'N/A'}</div>
            </div>
            <div className="sccv-field">
              <label>Father's Last Name</label>
              <div className="sccv-display-value">{data?.father_lname || 'N/A'}</div>
            </div>
          </div>
        </div>

        {/* Mother Information Section */}
        <div className="sccv-section">
          <h3 className="sccv-section-title">Mother Information</h3>
          <div className="sccv-row">
            <div className="sccv-field">
              <label>Mother's First Name</label>
              <div className="sccv-display-value">{data?.mother_fname || 'N/A'}</div>
            </div>
            <div className="sccv-field">
              <label>Mother's Middle Name</label>
              <div className="sccv-display-value">{data?.mother_mname || 'N/A'}</div>
            </div>
            <div className="sccv-field">
              <label>Mother's Last Name</label>
              <div className="sccv-display-value">{data?.mother_lname || 'N/A'}</div>
            </div>
          </div>
        </div>

        {/* Communion Details Section */}
        <div className="sccv-section">
          <div className="sccv-row">
            <div className="sccv-field sccv-field-wide">
              <label>Place of Communion (Parish/Church)</label>
              <div className="sccv-display-value">{data?.place_of_communion || 'N/A'}</div>
            </div>
          </div>
          <div className="sccv-row">
            <div className="sccv-field">
              <label>Date of First Holy Communion</label>
              <div className="sccv-display-value">{formatDate(data?.date_of_communion)}</div>
            </div>
            <div className="sccv-field">
              <label>Name of Priest/ Minister (if known)</label>
              <div className="sccv-display-value">{data?.name_of_priest || 'N/A'}</div>
            </div>
          </div>
        </div>

        {/* Purpose of Request Section */}
        <div className="sccv-section">
          <h3 className="sccv-section-title">PURPOSE OF REQUEST</h3>
          <div className="sccv-purpose-display">
            <div className="sccv-display-value">{getPurposes()}</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="sccv-button-container">
          <button className="sccv-appointments-btn" onClick={handleGoToAppointments}>
            Go to Appointments
          </button>
        </div>
      </div>
    </div>
  );
};

export default SecretaryCommunionCertificateView;