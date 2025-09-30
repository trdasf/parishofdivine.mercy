import React, { useState } from "react";
import { AiOutlineArrowLeft } from "react-icons/ai";
import { useNavigate, useLocation } from "react-router-dom";
import "./ClientBaptismCertificate.css";

const ClientBaptismCertificate = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { clientID } = location.state || {};
  
  console.log('Received clientID:', clientID);
  
  // State for form validation
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  // State for form data
  const [formData, setFormData] = useState({
    // Date
    requestDate: '',
    
    // Full Name of Baptism
    firstName: '',
    middleName: '',
    lastName: '',
    
    // Father Information
    fatherFirstName: '',
    fatherMiddleName: '',
    fatherLastName: '',
    
    // Mother Information
    motherFirstName: '',
    motherMiddleName: '',
    motherLastName: '',
    
    // Baptism Details
    placeOfBaptism: '',
    dateOfBaptism: '',
    priestName: '',
    
    // Purpose of Request
    purposeMarriage: false,
    purposeCommConfir: false,
    purposeSchool: false,
    purposeOthers: false,
    othersText: ''
  });

  // State for modals
  const [showModal, setShowModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear errors when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // Handle checkbox changes
  const handleCheckboxChange = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
    
    // Enable/disable others text input
    if (field === 'purposeOthers' && !formData.purposeOthers) {
      setFormData(prev => ({
        ...prev,
        othersText: ''
      }));
    }
  };

  // Handle date changes
  const handleDateChange = (field, value) => {
    handleInputChange(field, value);
  };

  // Get current date in YYYY-MM-DD format
  const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Set current date on component mount
  React.useEffect(() => {
    setFormData(prev => ({
      ...prev,
      requestDate: getCurrentDate()
    }));
  }, []);

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    // Required fields
    const requiredFields = [
      'firstName', 'lastName',
      'fatherFirstName', 'fatherLastName',
      'motherFirstName', 'motherLastName',
      'placeOfBaptism', 'dateOfBaptism'
    ];
    
    requiredFields.forEach(field => {
      if (!formData[field] || formData[field].trim() === '') {
        newErrors[field] = 'This field is required';
      }
    });

    // Check if at least one purpose is selected
    const purposeSelected = formData.purposeMarriage || 
                           formData.purposeCommConfir || 
                           formData.purposeSchool || 
                           formData.purposeOthers;
    
    if (!purposeSelected) {
      newErrors.purpose = 'Please select at least one purpose for the request';
    }

    // If "Others" is selected, text is required
    if (formData.purposeOthers && (!formData.othersText || formData.othersText.trim() === '')) {
      newErrors.othersText = 'Please specify the other purpose';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = () => {
    setSubmitted(true);
    if (validateForm()) {
      setShowModal(true);
    } else {
      window.scrollTo(0, 0);
    }
  };

  // Handle modal confirmation
  const handleYes = async () => {
    setShowModal(false);
    setIsLoading(true);
    
    try {
      // Get clientID from localStorage if user is logged in
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const clientID = user.clientID || null;

      // Prepare data for API
      const requestData = {
        ...formData,
        clientID: clientID
      };

      // Make API call to PHP backend
      const response = await fetch('http://parishofdivinemercy.com/backend/request_baptism.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      const data = await response.json();
      
      setIsLoading(false);
      
      if (data.success) {
        setShowSuccessModal(true);
        
        // Reset form after successful submission
        setTimeout(() => {
          setShowSuccessModal(false);
          navigate(-1); // Go back to previous page
        }, 3000);
      } else {
        setErrorMessage(data.message || 'Failed to submit baptism certificate request');
        setShowErrorModal(true);
      }
      
    } catch (error) {
      setIsLoading(false);
      console.error('Error submitting request:', error);
      setErrorMessage('An error occurred while submitting the request. Please try again.');
      setShowErrorModal(true);
    }
  };

  return (
    <div className="cbc-container">
      {/* Header */}
      <div className="cbc-header">
        <div className="cbc-left-section">
          <button className="cbc-back-button" onClick={() => navigate(-1)}>
            <AiOutlineArrowLeft className="cbc-back-icon" /> Back
          </button>
        </div>
        <div className="cbc-right-section">
          <div className="cbc-date-field">
            <label>Date:</label>
            <input 
              type="date" 
              value={formData.requestDate}
              className="cbc-date-input"
              readOnly
              disabled
            />
          </div>
        </div>
      </div>
      
      <h1 className="cbc-title">REQUEST FOR BAPTISM CERTIFICATE</h1>
      
      <div className="cbc-form-container">
        {submitted && Object.keys(errors).length > 0 && (
          <div className="cbc-error-message">
            Please fill in all required fields marked with (*).
          </div>
        )}

        {/* Full Name of Baptism Section */}
        <div className="cbc-section">
          <h3 className="cbc-section-title">FULL NAME OF BAPTISM</h3>
          <div className="cbc-row">
            <div className="cbc-field">
              <label>First Name <span className="cbc-required">*</span></label>
              <input 
                type="text" 
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                className={submitted && errors.firstName ? 'cbc-input-error' : ''}
              />
            </div>
            <div className="cbc-field">
              <label>Middle Name</label>
              <input 
                type="text"
                value={formData.middleName}
                onChange={(e) => handleInputChange('middleName', e.target.value)}
              />
            </div>
            <div className="cbc-field">
              <label>Last Name <span className="cbc-required">*</span></label>
              <input 
                type="text"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                className={submitted && errors.lastName ? 'cbc-input-error' : ''}
              />
            </div>
          </div>
        </div>

        {/* Father Information Section */}
        <div className="cbc-section">
          <h3 className="cbc-section-title">Father Information</h3>
          <div className="cbc-row">
            <div className="cbc-field">
              <label>Father's First Name <span className="cbc-required">*</span></label>
              <input 
                type="text"
                value={formData.fatherFirstName}
                onChange={(e) => handleInputChange('fatherFirstName', e.target.value)}
                className={submitted && errors.fatherFirstName ? 'cbc-input-error' : ''}
              />
            </div>
            <div className="cbc-field">
              <label>Father's Middle Name</label>
              <input 
                type="text"
                value={formData.fatherMiddleName}
                onChange={(e) => handleInputChange('fatherMiddleName', e.target.value)}
              />
            </div>
            <div className="cbc-field">
              <label>Father's Last Name <span className="cbc-required">*</span></label>
              <input 
                type="text"
                value={formData.fatherLastName}
                onChange={(e) => handleInputChange('fatherLastName', e.target.value)}
                className={submitted && errors.fatherLastName ? 'cbc-input-error' : ''}
              />
            </div>
          </div>
        </div>

        {/* Mother Information Section */}
        <div className="cbc-section">
          <h3 className="cbc-section-title">Mother Information</h3>
          <div className="cbc-row">
            <div className="cbc-field">
              <label>Mother's First Name <span className="cbc-required">*</span></label>
              <input 
                type="text"
                value={formData.motherFirstName}
                onChange={(e) => handleInputChange('motherFirstName', e.target.value)}
                className={submitted && errors.motherFirstName ? 'cbc-input-error' : ''}
              />
            </div>
            <div className="cbc-field">
              <label>Mother's Middle Name</label>
              <input 
                type="text"
                value={formData.motherMiddleName}
                onChange={(e) => handleInputChange('motherMiddleName', e.target.value)}
              />
            </div>
            <div className="cbc-field">
              <label>Mother's Last Name <span className="cbc-required">*</span></label>
              <input 
                type="text"
                value={formData.motherLastName}
                onChange={(e) => handleInputChange('motherLastName', e.target.value)}
                className={submitted && errors.motherLastName ? 'cbc-input-error' : ''}
              />
            </div>
          </div>
        </div>

        {/* Baptism Details Section */}
        <div className="cbc-section">
          <div className="cbc-row">
            <div className="cbc-field cbc-field-wide">
              <label>Place of Baptism (Parish/Church) <span className="cbc-required">*</span></label>
              <input 
                type="text"
                value={formData.placeOfBaptism}
                onChange={(e) => handleInputChange('placeOfBaptism', e.target.value)}
                className={submitted && errors.placeOfBaptism ? 'cbc-input-error' : ''}
                placeholder="Enter the name of the parish or church where baptism took place"
              />
            </div>
          </div>
          <div className="cbc-row">
            <div className="cbc-field">
              <label>Date of Baptism <span className="cbc-required">*</span></label>
              <input 
                type="date"
                value={formData.dateOfBaptism}
                onChange={(e) => handleDateChange('dateOfBaptism', e.target.value)}
                className={submitted && errors.dateOfBaptism ? 'cbc-input-error' : ''}
              />
            </div>
            <div className="cbc-field">
              <label>Name of Priest (if known)</label>
              <input 
                type="text"
                value={formData.priestName}
                onChange={(e) => handleInputChange('priestName', e.target.value)}
                placeholder="Enter priest's name if known"
              />
            </div>
          </div>
        </div>

        {/* Purpose of Request Section */}
        <div className="cbc-section">
          <h3 className="cbc-section-title">PURPOSE OF REQUEST</h3>
          {submitted && errors.purpose && (
            <div className="cbc-purpose-error">{errors.purpose}</div>
          )}
          <div className="cbc-purpose-options">
            <div className="cbc-checkbox-container">
              <input 
                type="checkbox" 
                id="marriage"
                checked={formData.purposeMarriage}
                onChange={() => handleCheckboxChange('purposeMarriage')}
              />
              <label htmlFor="marriage">Marriage Preparation</label>
            </div>
            <div className="cbc-checkbox-container">
              <input 
                type="checkbox" 
                id="communion"
                checked={formData.purposeCommConfir}
                onChange={() => handleCheckboxChange('purposeCommConfir')}
              />
              <label htmlFor="communion">First Communion / Confirmation</label>
            </div>
            <div className="cbc-checkbox-container">
              <input 
                type="checkbox" 
                id="school"
                checked={formData.purposeSchool}
                onChange={() => handleCheckboxChange('purposeSchool')}
              />
              <label htmlFor="school">School Requirements</label>
            </div>
            <div className="cbc-checkbox-container cbc-others-container">
              <input 
                type="checkbox" 
                id="others"
                checked={formData.purposeOthers}
                onChange={() => handleCheckboxChange('purposeOthers')}
              />
              <label htmlFor="others">Others:</label>
              <input 
                type="text"
                value={formData.othersText}
                onChange={(e) => handleInputChange('othersText', e.target.value)}
                disabled={!formData.purposeOthers}
                className={`cbc-others-input ${submitted && errors.othersText ? 'cbc-input-error' : ''} ${!formData.purposeOthers ? 'cbc-disabled' : ''}`}
                placeholder="Please specify"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="cbc-button-container">
        <button className="cbc-submit-btn" onClick={handleSubmit}>Submit</button>
        <button className="cbc-cancel-btn" onClick={() => navigate(-1)}>Cancel</button>
      </div>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="cbc-modal-overlay">
          <div className="cbc-modal">
            <h2>Submit Request</h2>
            <hr className="cbc-custom-hr"/>
            <p>Are you sure you want to submit your baptism certificate request?</p>
            <div className="cbc-modal-buttons">
              <button className="cbc-yes-btn" onClick={handleYes}>Yes</button>
              <button className="cbc-no-btn" onClick={() => setShowModal(false)}>No</button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="cbc-modal-overlay">
          <div className="cbc-modal">
            <h2>Success</h2>
            <hr className="cbc-custom-hr"/>
            <p>Your baptism certificate request has been submitted successfully!</p>
            <div className="cbc-modal-buttons">
              <button className="cbc-yes-btn" onClick={() => setShowSuccessModal(false)}>OK</button>
            </div>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <div className="cbc-modal-overlay">
          <div className="cbc-modal">
            <h2>Error</h2>
            <hr className="cbc-custom-hr"/>
            <p>{errorMessage}</p>
            <div className="cbc-modal-buttons">
              <button className="cbc-no-btn" onClick={() => setShowErrorModal(false)}>OK</button>
            </div>
          </div>
        </div>
      )}

      {/* Loading Modal */}
      {isLoading && (
        <div className="cbc-modal-overlay">
          <div className="cbc-modal">
            <h2>Processing Request</h2>
            <hr className="cbc-custom-hr"/>
            <p>Please wait while we submit your baptism certificate request...</p>
            <div className="cbc-loading-spinner">
              <div className="cbc-spinner"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientBaptismCertificate;