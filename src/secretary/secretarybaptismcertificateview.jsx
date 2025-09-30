import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AiOutlineArrowLeft } from "react-icons/ai";
import "./SecretaryBaptismCertificateView.css";

const SecretaryBaptismCertificateView = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { reqbaptismID } = location.state || {};

  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch baptism request details
  const fetchBaptismDetails = async () => {
    if (!reqbaptismID) {
      setError("Baptism request ID is required");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`http://parishofdivinemercy.com/backend/sec_baptism_request_details.php?reqbaptismID=${reqbaptismID}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setData(result.request);
        console.log("Baptism request details:", result.request);
      } else {
        throw new Error(result.message || 'Failed to fetch baptism request details');
      }
    } catch (error) {
      console.error('Error fetching baptism details:', error);
      setError(error.message || 'Failed to load baptism certificate details');
    } finally {
      setIsLoading(false);
    }
  };

  // Load data when component mounts
  useEffect(() => {
    fetchBaptismDetails();
  }, [reqbaptismID]);

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
    if (data.purposeCommConfir) purposes.push('First Communion / Confirmation');
    if (data.purposeSchool) purposes.push('School Requirements');
    if (data.purposeOthers) purposes.push(`Others: ${data.othersText}`);
    return purposes.length > 0 ? purposes.join(', ') : 'Not specified';
  };

  const handleBack = () => {
    navigate("/secretary-request-certificate");
    console.log('Navigate back');
  };

  const handleGoToAppointments = () => {
    if (data) {
      // Navigate to secretary baptism with search parameters
      navigate("/secretary-baptism", {
        state: {
          autoSearch: true,
          firstName: data.first_name,
          lastName: data.last_name
        }
      });
      console.log(`Navigate to appointments with search: ${data.first_name} ${data.last_name}`);
    } else {
      navigate("/secretary-baptism");
      console.log('Navigate to appointments');
    }
  };

  // Show error if no reqbaptismID provided
  if (!reqbaptismID) {
    return (
      <div className="sbcv-container">
        <div className="sbcv-header">
          <div className="sbcv-left-section">
            <button className="sbcv-back-button" onClick={handleBack}>
              <AiOutlineArrowLeft className="sbcv-back-icon" /> Back
            </button>
          </div>
        </div>
        <h1 className="sbcv-title">ERROR</h1>
        <div className="sbcv-form-container">
          <div className="sbcv-error-message">
            <p>Error: Baptism request ID is required to view this certificate request.</p>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="sbcv-container">
        <div className="sbcv-header">
          <div className="sbcv-left-section">
            <button className="sbcv-back-button" onClick={handleBack}>
              <AiOutlineArrowLeft className="sbcv-back-icon" /> Back
            </button>
          </div>
        </div>
        <h1 className="sbcv-title">BAPTISM CERTIFICATE REQUEST</h1>
        <div className="sbcv-form-container">
          <div className="sbcv-loading">
            <p>Loading baptism certificate details...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="sbcv-container">
        <div className="sbcv-header">
          <div className="sbcv-left-section">
            <button className="sbcv-back-button" onClick={handleBack}>
              <AiOutlineArrowLeft className="sbcv-back-icon" /> Back
            </button>
          </div>
        </div>
        <h1 className="sbcv-title">ERROR</h1>
        <div className="sbcv-form-container">
          <div className="sbcv-error-message">
            <p>Error: {error}</p>
            <button onClick={fetchBaptismDetails} className="sbcv-retry-btn">
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show data if loaded successfully
  return (
    <div className="sbcv-container">
      {/* Header */}
      <div className="sbcv-header">
        <div className="sbcv-left-section">
          <button className="sbcv-back-button" onClick={handleBack}>
            <AiOutlineArrowLeft className="sbcv-back-icon" /> Back
          </button>
        </div>
        <div className="sbcv-right-section">
          <div className="sbcv-date-field">
            <label>Request Date:</label>
            <span className="sbcv-date-display">{formatDate(data?.date_submitted)}</span>
          </div>
        </div>
      </div>
      
      <h1 className="sbcv-title">BAPTISM CERTIFICATE REQUEST</h1>
      
      <div className="sbcv-form-container">
        {/* Full Name of Baptism Section */}
        <div className="sbcv-section">
          <h3 className="sbcv-section-title">FULL NAME OF BAPTISM</h3>
          <div className="sbcv-row">
            <div className="sbcv-field">
              <label>First Name</label>
              <div className="sbcv-display-value">{data?.first_name || 'N/A'}</div>
            </div>
            <div className="sbcv-field">
              <label>Middle Name</label>
              <div className="sbcv-display-value">{data?.middle_name || 'N/A'}</div>
            </div>
            <div className="sbcv-field">
              <label>Last Name</label>
              <div className="sbcv-display-value">{data?.last_name || 'N/A'}</div>
            </div>
          </div>
        </div>

        {/* Father Information Section */}
        <div className="sbcv-section">
          <h3 className="sbcv-section-title">Father Information</h3>
          <div className="sbcv-row">
            <div className="sbcv-field">
              <label>Father's First Name</label>
              <div className="sbcv-display-value">{data?.father_fname || 'N/A'}</div>
            </div>
            <div className="sbcv-field">
              <label>Father's Middle Name</label>
              <div className="sbcv-display-value">{data?.father_mname || 'N/A'}</div>
            </div>
            <div className="sbcv-field">
              <label>Father's Last Name</label>
              <div className="sbcv-display-value">{data?.father_lname || 'N/A'}</div>
            </div>
          </div>
        </div>

        {/* Mother Information Section */}
        <div className="sbcv-section">
          <h3 className="sbcv-section-title">Mother Information</h3>
          <div className="sbcv-row">
            <div className="sbcv-field">
              <label>Mother's First Name</label>
              <div className="sbcv-display-value">{data?.mother_fname || 'N/A'}</div>
            </div>
            <div className="sbcv-field">
              <label>Mother's Middle Name</label>
              <div className="sbcv-display-value">{data?.mother_mname || 'N/A'}</div>
            </div>
            <div className="sbcv-field">
              <label>Mother's Last Name</label>
              <div className="sbcv-display-value">{data?.mother_lname || 'N/A'}</div>
            </div>
          </div>
        </div>

        {/* Baptism Details Section */}
        <div className="sbcv-section">
          <div className="sbcv-row">
            <div className="sbcv-field sbcv-field-wide">
              <label>Place of Baptism (Parish/Church)</label>
              <div className="sbcv-display-value">{data?.place_of_baptism || 'N/A'}</div>
            </div>
          </div>
          <div className="sbcv-row">
            <div className="sbcv-field">
              <label>Date of Baptism</label>
              <div className="sbcv-display-value">{formatDate(data?.date_of_baptism)}</div>
            </div>
            <div className="sbcv-field">
              <label>Name of Priest (if known)</label>
              <div className="sbcv-display-value">{data?.name_of_priest || 'N/A'}</div>
            </div>
          </div>
        </div>

        {/* Purpose of Request Section */}
        <div className="sbcv-section">
          <h3 className="sbcv-section-title">PURPOSE OF REQUEST</h3>
          <div className="sbcv-purpose-display">
            <div className="sbcv-display-value">{getPurposes()}</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="sbcv-button-container">
          <button className="sbcv-appointments-btn" onClick={handleGoToAppointments}>
            Go to Appointments
          </button>
        </div>
      </div>
    </div>
  );
};

export default SecretaryBaptismCertificateView;