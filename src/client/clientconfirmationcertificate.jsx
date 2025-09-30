import React, { useState } from "react";
import { AiOutlineArrowLeft } from "react-icons/ai";
import { useNavigate, useLocation } from "react-router-dom";
import "./ClientConfirmationCertificate.css";

const ClientConfirmationCertificate = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { clientID } = location.state || {};
  
  // State for form validation
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  // State for form data
  const [formData, setFormData] = useState({
    // Date
    requestDate: '',
    
    // Personal Information
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
    
    // Confirmation Details
    placeOfConfirmation: '',
    dateOfConfirmation: '',
    priestName: '',
    
    // Purpose of Request
    purposeMarriage: false,
    purposeSchool: false,
    purposeChurch: false,
    purposePersonal: false,
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
      'placeOfConfirmation', 'dateOfConfirmation'
    ];
    
    requiredFields.forEach(field => {
      if (!formData[field] || formData[field].trim() === '') {
        newErrors[field] = 'This field is required';
      }
    });

    // Check if at least one purpose is selected
    const purposeSelected = formData.purposeMarriage || 
                           formData.purposeSchool || 
                           formData.purposeChurch || 
                           formData.purposePersonal ||
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

  // Submit data to database
  const submitToDatabase = async () => {
    try {
      const response = await fetch('http://parishofdivinemercy.com/backend/request_confirmation.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientID: clientID,
          firstName: formData.firstName,
          middleName: formData.middleName,
          lastName: formData.lastName,
          fatherFirstName: formData.fatherFirstName,
          fatherMiddleName: formData.fatherMiddleName,
          fatherLastName: formData.fatherLastName,
          motherFirstName: formData.motherFirstName,
          motherMiddleName: formData.motherMiddleName,
          motherLastName: formData.motherLastName,
          placeOfConfirmation: formData.placeOfConfirmation,
          dateOfConfirmation: formData.dateOfConfirmation,
          priestName: formData.priestName,
          purposeMarriage: formData.purposeMarriage,
          purposeSchool: formData.purposeSchool,
          purposeChurch: formData.purposeChurch,
          purposePersonal: formData.purposePersonal,
          purposeOthers: formData.purposeOthers,
          othersText: formData.othersText
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        return { success: true, data: result };
      } else {
        throw new Error(result.message || 'Failed to submit request');
      }
    } catch (error) {
      console.error('Database submission error:', error);
      throw error;
    }
  };

  // Handle modal confirmation
  const handleYes = async () => {
    setShowModal(false);
    setIsLoading(true);
    
    try {
      const result = await submitToDatabase();
      
      setIsLoading(false);
      setShowSuccessModal(true);
      
      setTimeout(() => {
        setShowSuccessModal(false);
        navigate(-1); // Go back to previous page
      }, 3000);
      
    } catch (error) {
      setIsLoading(false);
      setErrorMessage(error.message || 'An error occurred while submitting the request');
      setShowErrorModal(true);
    }
  };

  return (
    <div className="cconf-container">
      {/* Header */}
      <div className="cconf-header">
        <div className="cconf-left-section">
          <button className="cconf-back-button" onClick={() => navigate(-1)}>
            <AiOutlineArrowLeft className="cconf-back-icon" /> Back
          </button>
        </div>
        <div className="cconf-right-section">
          <div className="cconf-date-field">
            <label>Date:</label>
            <input 
              type="date" 
              value={formData.requestDate}
              className="cconf-date-input"
              readOnly
              disabled
            />
          </div>
        </div>
      </div>
      
      <h1 className="cconf-title">REQUEST FOR CONFIRMATION CERTIFICATE</h1>
      
      <div className="cconf-form-container">
        {submitted && Object.keys(errors).length > 0 && (
          <div className="cconf-error-message">
            Please fill in all required fields marked with (*).
          </div>
        )}

        {/* Personal Information Section */}
        <div className="cconf-section">
          <h3 className="cconf-section-title">PERSONAL INFORMATION</h3>
          <div className="cconf-row">
            <div className="cconf-field">
              <label>First Name <span className="cconf-required">*</span></label>
              <input 
                type="text" 
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                className={submitted && errors.firstName ? 'cconf-input-error' : ''}
              />
            </div>
            <div className="cconf-field">
              <label>Middle Name</label>
              <input 
                type="text"
                value={formData.middleName}
                onChange={(e) => handleInputChange('middleName', e.target.value)}
              />
            </div>
            <div className="cconf-field">
              <label>Last Name <span className="cconf-required">*</span></label>
              <input 
                type="text"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                className={submitted && errors.lastName ? 'cconf-input-error' : ''}
              />
            </div>
          </div>
        </div>

        {/* Father Information Section */}
        <div className="cconf-section">
          <h3 className="cconf-section-title">Father Information</h3>
          <div className="cconf-row">
            <div className="cconf-field">
              <label>Father's First Name <span className="cconf-required">*</span></label>
              <input 
                type="text"
                value={formData.fatherFirstName}
                onChange={(e) => handleInputChange('fatherFirstName', e.target.value)}
                className={submitted && errors.fatherFirstName ? 'cconf-input-error' : ''}
              />
            </div>
            <div className="cconf-field">
              <label>Father's Middle Name</label>
              <input 
                type="text"
                value={formData.fatherMiddleName}
                onChange={(e) => handleInputChange('fatherMiddleName', e.target.value)}
              />
            </div>
            <div className="cconf-field">
              <label>Father's Last Name <span className="cconf-required">*</span></label>
              <input 
                type="text"
                value={formData.fatherLastName}
                onChange={(e) => handleInputChange('fatherLastName', e.target.value)}
                className={submitted && errors.fatherLastName ? 'cconf-input-error' : ''}
              />
            </div>
          </div>
        </div>

        {/* Mother Information Section */}
        <div className="cconf-section">
          <h3 className="cconf-section-title">Mother Information</h3>
          <div className="cconf-row">
            <div className="cconf-field">
              <label>Mother's First Name <span className="cconf-required">*</span></label>
              <input 
                type="text"
                value={formData.motherFirstName}
                onChange={(e) => handleInputChange('motherFirstName', e.target.value)}
                className={submitted && errors.motherFirstName ? 'cconf-input-error' : ''}
              />
            </div>
            <div className="cconf-field">
              <label>Mother's Middle Name</label>
              <input 
                type="text"
                value={formData.motherMiddleName}
                onChange={(e) => handleInputChange('motherMiddleName', e.target.value)}
              />
            </div>
            <div className="cconf-field">
              <label>Mother's Last Name <span className="cconf-required">*</span></label>
              <input 
                type="text"
                value={formData.motherLastName}
                onChange={(e) => handleInputChange('motherLastName', e.target.value)}
                className={submitted && errors.motherLastName ? 'cconf-input-error' : ''}
              />
            </div>
          </div>
        </div>

        {/* Confirmation Details Section */}
        <div className="cconf-section">
          <div className="cconf-row">
            <div className="cconf-field cconf-field-wide">
              <label>Place of Confirmation (Parish/Church) <span className="cconf-required">*</span></label>
              <input 
                type="text"
                value={formData.placeOfConfirmation}
                onChange={(e) => handleInputChange('placeOfConfirmation', e.target.value)}
                className={submitted && errors.placeOfConfirmation ? 'cconf-input-error' : ''}
                placeholder="Enter the name of the parish or church where confirmation took place"
              />
            </div>
          </div>
          <div className="cconf-row">
            <div className="cconf-field">
              <label>Date of Confirmation <span className="cconf-required">*</span></label>
              <input 
                type="date"
                value={formData.dateOfConfirmation}
                onChange={(e) => handleDateChange('dateOfConfirmation', e.target.value)}
                className={submitted && errors.dateOfConfirmation ? 'cconf-input-error' : ''}
              />
            </div>
            <div className="cconf-field">
              <label>Name of Priest/Minister (if known):</label>
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
        <div className="cconf-section">
          <h3 className="cconf-section-title">PURPOSE OF REQUEST</h3>
          {submitted && errors.purpose && (
            <div className="cconf-purpose-error">{errors.purpose}</div>
          )}
          <div className="cconf-purpose-options">
            <div className="cconf-checkbox-container">
              <input 
                type="checkbox" 
                id="marriage"
                checked={formData.purposeMarriage}
                onChange={() => handleCheckboxChange('purposeMarriage')}
              />
              <label htmlFor="marriage">Marriage Preparation</label>
            </div>
            <div className="cconf-checkbox-container">
              <input 
                type="checkbox" 
                id="school"
                checked={formData.purposeSchool}
                onChange={() => handleCheckboxChange('purposeSchool')}
              />
              <label htmlFor="school">School Requirement</label>
            </div>
            <div className="cconf-checkbox-container">
              <input 
                type="checkbox" 
                id="church"
                checked={formData.purposeChurch}
                onChange={() => handleCheckboxChange('purposeChurch')}
              />
              <label htmlFor="church">Church Requirement</label>
            </div>
            <div className="cconf-checkbox-container">
              <input 
                type="checkbox" 
                id="personal"
                checked={formData.purposePersonal}
                onChange={() => handleCheckboxChange('purposePersonal')}
              />
              <label htmlFor="personal">Personal Record</label>
            </div>
            <div className="cconf-checkbox-container cconf-others-container">
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
                className={`cconf-others-input ${submitted && errors.othersText ? 'cconf-input-error' : ''} ${!formData.purposeOthers ? 'cconf-disabled' : ''}`}
                placeholder="Please specify"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="cconf-button-container">
        <button className="cconf-submit-btn" onClick={handleSubmit}>Submit</button>
        <button className="cconf-cancel-btn" onClick={() => navigate(-1)}>Cancel</button>
      </div>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="cconf-modal-overlay">
          <div className="cconf-modal">
            <h2>Submit Request</h2>
            <hr className="cconf-custom-hr"/>
            <p>Are you sure you want to submit your confirmation certificate request?</p>
            <div className="cconf-modal-buttons">
              <button className="cconf-yes-btn" onClick={handleYes}>Yes</button>
              <button className="cconf-no-btn" onClick={() => setShowModal(false)}>No</button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="cconf-modal-overlay">
          <div className="cconf-modal">
            <h2>Success</h2>
            <hr className="cconf-custom-hr"/>
            <p>Your confirmation certificate request has been submitted successfully!</p>
            <div className="cconf-modal-buttons">
              <button className="cconf-yes-btn" onClick={() => setShowSuccessModal(false)}>OK</button>
            </div>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <div className="cconf-modal-overlay">
          <div className="cconf-modal">
            <h2>Error</h2>
            <hr className="cconf-custom-hr"/>
            <p>{errorMessage}</p>
            <div className="cconf-modal-buttons">
              <button className="cconf-no-btn" onClick={() => setShowErrorModal(false)}>OK</button>
            </div>
          </div>
        </div>
      )}

      {/* Loading Modal */}
      {isLoading && (
        <div className="cconf-modal-overlay">
          <div className="cconf-modal">
            <h2>Processing Request</h2>
            <hr className="cconf-custom-hr"/>
            <p>Please wait while we submit your confirmation certificate request...</p>
            <div className="cconf-loading-spinner">
              <div className="cconf-spinner"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientConfirmationCertificate;