import React, { useState } from "react";
import { AiOutlineArrowLeft } from "react-icons/ai";
import { useNavigate, useLocation } from "react-router-dom";
import "./ClientMarriageCertificate.css";

const ClientMarriageCertificate = () => {
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
    
    // Full Name of Groom
    groomFirstName: '',
    groomMiddleName: '',
    groomLastName: '',
    
    // Full Name of Bride (Maiden Name)
    brideFirstName: '',
    brideMiddleName: '',
    brideLastName: '',
    
    // Marriage Details
    placeOfMarriage: '',
    dateOfMarriage: '',
    officiatingPriest: '',
    
    // Purpose of Request
    purposeCivil: false,
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
      'groomFirstName', 'groomLastName',
      'brideFirstName', 'brideLastName',
      'placeOfMarriage', 'dateOfMarriage'
    ];
    
    requiredFields.forEach(field => {
      if (!formData[field] || formData[field].trim() === '') {
        newErrors[field] = 'This field is required';
      }
    });

    // Check if at least one purpose is selected
    const purposeSelected = formData.purposeCivil || 
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

  // Handle modal confirmation
  const handleYes = async () => {
    setShowModal(false);
    setIsLoading(true);
    
    try {
      // Prepare data for API submission
      const submitData = {
        clientID: clientID,
        groomFirstName: formData.groomFirstName,
        groomMiddleName: formData.groomMiddleName,
        groomLastName: formData.groomLastName,
        brideFirstName: formData.brideFirstName,
        brideMiddleName: formData.brideMiddleName,
        brideLastName: formData.brideLastName,
        placeOfMarriage: formData.placeOfMarriage,
        dateOfMarriage: formData.dateOfMarriage,
        officiatingPriest: formData.officiatingPriest,
        purposeCivil: formData.purposeCivil,
        purposeChurch: formData.purposeChurch,
        purposePersonal: formData.purposePersonal,
        purposeOthers: formData.purposeOthers,
        othersText: formData.othersText
      };

      // Make API call to submit marriage certificate request
      const response = await fetch('http://parishofdivinemercy.com/backend/request_marriage.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData)
      });

      const result = await response.json();
      
      setIsLoading(false);
      
      if (result.success) {
        setShowSuccessModal(true);
        
        setTimeout(() => {
          setShowSuccessModal(false);
          navigate(-1); // Go back to previous page
        }, 2000);
      } else {
        throw new Error(result.message || 'Failed to submit marriage certificate request');
      }
      
    } catch (error) {
      setIsLoading(false);
      setErrorMessage(error.message || 'An error occurred while submitting the request');
      setShowErrorModal(true);
    }
  };

  return (
    <div className="cmc-container">
      {/* Header */}
      <div className="cmc-header">
        <div className="cmc-left-section">
          <button className="cmc-back-button" onClick={() => navigate(-1)}>
            <AiOutlineArrowLeft className="cmc-back-icon" /> Back
          </button>
        </div>
        <div className="cmc-right-section">
          <div className="cmc-date-field">
            <label>Date:</label>
            <input 
              type="date" 
              value={formData.requestDate}
              className="cmc-date-input"
              readOnly
              disabled
            />
          </div>
        </div>
      </div>
      
      <h1 className="cmc-title">REQUEST FOR MARRIAGE CERTIFICATE</h1>
      
      <div className="cmc-form-container">
        {submitted && Object.keys(errors).length > 0 && (
          <div className="cmc-error-message">
            Please fill in all required fields marked with (*).
          </div>
        )}

        {/* Full Name of Groom Section */}
        <div className="cmc-section">
          <h3 className="cmc-section-title">FULL NAME OF GROOM</h3>
          <div className="cmc-row">
            <div className="cmc-field">
              <label>First Name <span className="cmc-required">*</span></label>
              <input 
                type="text" 
                value={formData.groomFirstName}
                onChange={(e) => handleInputChange('groomFirstName', e.target.value)}
                className={submitted && errors.groomFirstName ? 'cmc-input-error' : ''}
              />
            </div>
            <div className="cmc-field">
              <label>Middle Name</label>
              <input 
                type="text"
                value={formData.groomMiddleName}
                onChange={(e) => handleInputChange('groomMiddleName', e.target.value)}
              />
            </div>
            <div className="cmc-field">
              <label>Last Name <span className="cmc-required">*</span></label>
              <input 
                type="text"
                value={formData.groomLastName}
                onChange={(e) => handleInputChange('groomLastName', e.target.value)}
                className={submitted && errors.groomLastName ? 'cmc-input-error' : ''}
              />
            </div>
          </div>
        </div>

        {/* Full Name of Bride Section */}
        <div className="cmc-section">
          <h3 className="cmc-section-title">FULL NAME OF BRIDE (MAIDEN NAME)</h3>
          <div className="cmc-row">
            <div className="cmc-field">
              <label>First Name <span className="cmc-required">*</span></label>
              <input 
                type="text"
                value={formData.brideFirstName}
                onChange={(e) => handleInputChange('brideFirstName', e.target.value)}
                className={submitted && errors.brideFirstName ? 'cmc-input-error' : ''}
              />
            </div>
            <div className="cmc-field">
              <label>Middle Name</label>
              <input 
                type="text"
                value={formData.brideMiddleName}
                onChange={(e) => handleInputChange('brideMiddleName', e.target.value)}
              />
            </div>
            <div className="cmc-field">
              <label>Last Name <span className="cmc-required">*</span></label>
              <input 
                type="text"
                value={formData.brideLastName}
                onChange={(e) => handleInputChange('brideLastName', e.target.value)}
                className={submitted && errors.brideLastName ? 'cmc-input-error' : ''}
              />
            </div>
          </div>
        </div>

        {/* Marriage Details Section */}
        <div className="cmc-section">
          <div className="cmc-row">
            <div className="cmc-field cmc-field-wide">
              <label>Place of Marriage <span className="cmc-required">*</span></label>
              <input 
                type="text"
                value={formData.placeOfMarriage}
                onChange={(e) => handleInputChange('placeOfMarriage', e.target.value)}
                className={submitted && errors.placeOfMarriage ? 'cmc-input-error' : ''}
                placeholder="Enter the name of the parish or church where marriage took place"
              />
            </div>
          </div>
          <div className="cmc-row">
            <div className="cmc-field">
              <label>Date of Marriage <span className="cmc-required">*</span></label>
              <input 
                type="date"
                value={formData.dateOfMarriage}
                onChange={(e) => handleDateChange('dateOfMarriage', e.target.value)}
                className={submitted && errors.dateOfMarriage ? 'cmc-input-error' : ''}
              />
            </div>
            <div className="cmc-field">
              <label>Name of Officiating Priest (if known):</label>
              <input 
                type="text"
                value={formData.officiatingPriest}
                onChange={(e) => handleInputChange('officiatingPriest', e.target.value)}
                placeholder="Enter priest's name if known"
              />
            </div>
          </div>
        </div>

        {/* Purpose of Request Section */}
        <div className="cmc-section">
          <h3 className="cmc-section-title">PURPOSE OF REQUEST</h3>
          {submitted && errors.purpose && (
            <div className="cmc-purpose-error">{errors.purpose}</div>
          )}
          <div className="cmc-purpose-options">
            <div className="cmc-checkbox-container">
              <input 
                type="checkbox" 
                id="civil"
                checked={formData.purposeCivil}
                onChange={() => handleCheckboxChange('purposeCivil')}
              />
              <label htmlFor="civil">Civil Requirement</label>
            </div>
            <div className="cmc-checkbox-container">
              <input 
                type="checkbox" 
                id="church"
                checked={formData.purposeChurch}
                onChange={() => handleCheckboxChange('purposeChurch')}
              />
              <label htmlFor="church">Church Requirement (e.g., renewal, canonical processing)</label>
            </div>
            <div className="cmc-checkbox-container">
              <input 
                type="checkbox" 
                id="personal"
                checked={formData.purposePersonal}
                onChange={() => handleCheckboxChange('purposePersonal')}
              />
              <label htmlFor="personal">Personal Record</label>
            </div>
            <div className="cmc-checkbox-container cmc-others-container">
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
                className={`cmc-others-input ${submitted && errors.othersText ? 'cmc-input-error' : ''} ${!formData.purposeOthers ? 'cmc-disabled' : ''}`}
                placeholder="Please specify"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="cmc-button-container">
        <button className="cmc-submit-btn" onClick={handleSubmit}>Submit</button>
        <button className="cmc-cancel-btn" onClick={() => navigate(-1)}>Cancel</button>
      </div>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="cmc-modal-overlay">
          <div className="cmc-modal">
            <h2>Submit Request</h2>
            <hr className="cmc-custom-hr"/>
            <p>Are you sure you want to submit your marriage certificate request?</p>
            <div className="cmc-modal-buttons">
              <button className="cmc-yes-btn" onClick={handleYes}>Yes</button>
              <button className="cmc-no-btn" onClick={() => setShowModal(false)}>No</button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="cmc-modal-overlay">
          <div className="cmc-modal">
            <h2>Success</h2>
            <hr className="cmc-custom-hr"/>
            <p>Your marriage certificate request has been submitted successfully!</p>
            <div className="cmc-modal-buttons">
              <button className="cmc-yes-btn" onClick={() => setShowSuccessModal(false)}>OK</button>
            </div>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <div className="cmc-modal-overlay">
          <div className="cmc-modal">
            <h2>Error</h2>
            <hr className="cmc-custom-hr"/>
            <p>{errorMessage}</p>
            <div className="cmc-modal-buttons">
              <button className="cmc-no-btn" onClick={() => setShowErrorModal(false)}>OK</button>
            </div>
          </div>
        </div>
      )}

      {/* Loading Modal */}
      {isLoading && (
        <div className="cmc-modal-overlay">
          <div className="cmc-modal">
            <h2>Processing Request</h2>
            <hr className="cmc-custom-hr"/>
            <p>Please wait while we submit your marriage certificate request...</p>
            <div className="cmc-loading-spinner">
              <div className="cmc-spinner"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientMarriageCertificate;