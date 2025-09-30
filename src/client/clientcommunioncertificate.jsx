import React, { useState } from "react";
import { AiOutlineArrowLeft } from "react-icons/ai";
import { useNavigate, useLocation } from "react-router-dom";
import "./ClientCommunionCertificate.css";

const ClientCommunionCertificate = () => {
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
    
    // Communion Details
    placeOfCommunion: '',
    dateOfCommunion: '',
    priestName: '',
    
    // Purpose of Request
    purposeSchool: false,
    purposeConfirmation: false,
    purposeMarriage: false,
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
      'placeOfCommunion', 'dateOfCommunion'
    ];
    
    requiredFields.forEach(field => {
      if (!formData[field] || formData[field].trim() === '') {
        newErrors[field] = 'This field is required';
      }
    });

    // Check if at least one purpose is selected
    const purposeSelected = formData.purposeSchool || 
                           formData.purposeConfirmation || 
                           formData.purposeMarriage || 
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
      const response = await fetch('http://parishofdivinemercy.com/backend/request_communion.php', {
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
          placeOfCommunion: formData.placeOfCommunion,
          dateOfCommunion: formData.dateOfCommunion,
          priestName: formData.priestName,
          purposeSchool: formData.purposeSchool,
          purposeConfirmation: formData.purposeConfirmation,
          purposeMarriage: formData.purposeMarriage,
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
    <div className="ccc-container">
      {/* Header */}
      <div className="ccc-header">
        <div className="ccc-left-section">
          <button className="ccc-back-button" onClick={() => navigate(-1)}>
            <AiOutlineArrowLeft className="ccc-back-icon" /> Back
          </button>
        </div>
        <div className="ccc-right-section">
          <div className="ccc-date-field">
            <label>Date:</label>
            <input 
              type="date" 
              value={formData.requestDate}
              className="ccc-date-input"
              readOnly
              disabled
            />
          </div>
        </div>
      </div>
      
      <h1 className="ccc-title">REQUEST FOR FIRST HOLY COMMUNION CERTIFICATE</h1>
      
      <div className="ccc-form-container">
        {submitted && Object.keys(errors).length > 0 && (
          <div className="ccc-error-message">
            Please fill in all required fields marked with (*).
          </div>
        )}

        {/* Personal Information Section */}
        <div className="ccc-section">
          <h3 className="ccc-section-title">PERSONAL INFORMATION</h3>
          <div className="ccc-row">
            <div className="ccc-field">
              <label>First Name <span className="ccc-required">*</span></label>
              <input 
                type="text" 
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                className={submitted && errors.firstName ? 'ccc-input-error' : ''}
              />
            </div>
            <div className="ccc-field">
              <label>Middle Name</label>
              <input 
                type="text"
                value={formData.middleName}
                onChange={(e) => handleInputChange('middleName', e.target.value)}
              />
            </div>
            <div className="ccc-field">
              <label>Last Name <span className="ccc-required">*</span></label>
              <input 
                type="text"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                className={submitted && errors.lastName ? 'ccc-input-error' : ''}
              />
            </div>
          </div>
        </div>

        {/* Father Information Section */}
        <div className="ccc-section">
          <h3 className="ccc-section-title">Father Information</h3>
          <div className="ccc-row">
            <div className="ccc-field">
              <label>Father's First Name <span className="ccc-required">*</span></label>
              <input 
                type="text"
                value={formData.fatherFirstName}
                onChange={(e) => handleInputChange('fatherFirstName', e.target.value)}
                className={submitted && errors.fatherFirstName ? 'ccc-input-error' : ''}
              />
            </div>
            <div className="ccc-field">
              <label>Father's Middle Name</label>
              <input 
                type="text"
                value={formData.fatherMiddleName}
                onChange={(e) => handleInputChange('fatherMiddleName', e.target.value)}
              />
            </div>
            <div className="ccc-field">
              <label>Father's Last Name <span className="ccc-required">*</span></label>
              <input 
                type="text"
                value={formData.fatherLastName}
                onChange={(e) => handleInputChange('fatherLastName', e.target.value)}
                className={submitted && errors.fatherLastName ? 'ccc-input-error' : ''}
              />
            </div>
          </div>
        </div>

        {/* Mother Information Section */}
        <div className="ccc-section">
          <h3 className="ccc-section-title">Mother Information</h3>
          <div className="ccc-row">
            <div className="ccc-field">
              <label>Mother's First Name <span className="ccc-required">*</span></label>
              <input 
                type="text"
                value={formData.motherFirstName}
                onChange={(e) => handleInputChange('motherFirstName', e.target.value)}
                className={submitted && errors.motherFirstName ? 'ccc-input-error' : ''}
              />
            </div>
            <div className="ccc-field">
              <label>Mother's Middle Name</label>
              <input 
                type="text"
                value={formData.motherMiddleName}
                onChange={(e) => handleInputChange('motherMiddleName', e.target.value)}
              />
            </div>
            <div className="ccc-field">
              <label>Mother's Last Name <span className="ccc-required">*</span></label>
              <input 
                type="text"
                value={formData.motherLastName}
                onChange={(e) => handleInputChange('motherLastName', e.target.value)}
                className={submitted && errors.motherLastName ? 'ccc-input-error' : ''}
              />
            </div>
          </div>
        </div>

        {/* Communion Details Section */}
        <div className="ccc-section">
          <div className="ccc-row">
            <div className="ccc-field ccc-field-wide">
              <label>Place of Communion (Parish/Church) <span className="ccc-required">*</span></label>
              <input 
                type="text"
                value={formData.placeOfCommunion}
                onChange={(e) => handleInputChange('placeOfCommunion', e.target.value)}
                className={submitted && errors.placeOfCommunion ? 'ccc-input-error' : ''}
                placeholder="Enter the name of the parish or church where communion took place"
              />
            </div>
          </div>
          <div className="ccc-row">
            <div className="ccc-field">
              <label>Date of First Holy Communion <span className="ccc-required">*</span></label>
              <input 
                type="date"
                value={formData.dateOfCommunion}
                onChange={(e) => handleDateChange('dateOfCommunion', e.target.value)}
                className={submitted && errors.dateOfCommunion ? 'ccc-input-error' : ''}
              />
            </div>
            <div className="ccc-field">
              <label>Name of Priest/ Minister (if known):</label>
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
        <div className="ccc-section">
          <h3 className="ccc-section-title">PURPOSE OF REQUEST</h3>
          {submitted && errors.purpose && (
            <div className="ccc-purpose-error">{errors.purpose}</div>
          )}
          <div className="ccc-purpose-options">
            <div className="ccc-checkbox-container">
              <input 
                type="checkbox" 
                id="school"
                checked={formData.purposeSchool}
                onChange={() => handleCheckboxChange('purposeSchool')}
              />
              <label htmlFor="school">School Requirement</label>
            </div>
            <div className="ccc-checkbox-container">
              <input 
                type="checkbox" 
                id="confirmation"
                checked={formData.purposeConfirmation}
                onChange={() => handleCheckboxChange('purposeConfirmation')}
              />
              <label htmlFor="confirmation">Confirmation Preparation</label>
            </div>
            <div className="ccc-checkbox-container">
              <input 
                type="checkbox" 
                id="marriage"
                checked={formData.purposeMarriage}
                onChange={() => handleCheckboxChange('purposeMarriage')}
              />
              <label htmlFor="marriage">Marriage Preparation</label>
            </div>
            <div className="ccc-checkbox-container">
              <input 
                type="checkbox" 
                id="personal"
                checked={formData.purposePersonal}
                onChange={() => handleCheckboxChange('purposePersonal')}
              />
              <label htmlFor="personal">Personal Record</label>
            </div>
            <div className="ccc-checkbox-container ccc-others-container">
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
                className={`ccc-others-input ${submitted && errors.othersText ? 'ccc-input-error' : ''} ${!formData.purposeOthers ? 'ccc-disabled' : ''}`}
                placeholder="Please specify"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="ccc-button-container">
        <button className="ccc-submit-btn" onClick={handleSubmit}>Submit</button>
        <button className="ccc-cancel-btn" onClick={() => navigate(-1)}>Cancel</button>
      </div>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="ccc-modal-overlay">
          <div className="ccc-modal">
            <h2>Submit Request</h2>
            <hr className="ccc-custom-hr"/>
            <p>Are you sure you want to submit your communion certificate request?</p>
            <div className="ccc-modal-buttons">
              <button className="ccc-yes-btn" onClick={handleYes}>Yes</button>
              <button className="ccc-no-btn" onClick={() => setShowModal(false)}>No</button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="ccc-modal-overlay">
          <div className="ccc-modal">
            <h2>Success</h2>
            <hr className="ccc-custom-hr"/>
            <p>Your communion certificate request has been submitted successfully!</p>
            <div className="ccc-modal-buttons">
              <button className="ccc-yes-btn" onClick={() => setShowSuccessModal(false)}>OK</button>
            </div>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <div className="ccc-modal-overlay">
          <div className="ccc-modal">
            <h2>Error</h2>
            <hr className="ccc-custom-hr"/>
            <p>{errorMessage}</p>
            <div className="ccc-modal-buttons">
              <button className="ccc-no-btn" onClick={() => setShowErrorModal(false)}>OK</button>
            </div>
          </div>
        </div>
      )}

      {/* Loading Modal */}
      {isLoading && (
        <div className="ccc-modal-overlay">
          <div className="ccc-modal">
            <h2>Processing Request</h2>
            <hr className="ccc-custom-hr"/>
            <p>Please wait while we submit your communion certificate request...</p>
            <div className="ccc-loading-spinner">
              <div className="ccc-spinner"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientCommunionCertificate;