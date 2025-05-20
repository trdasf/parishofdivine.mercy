import React, { useState, useRef, useEffect } from "react";
import { AiOutlineArrowLeft } from "react-icons/ai";
import { useLocation, useNavigate } from "react-router-dom";
import "../../client/ClientBlessing.css";

import axios from "axios";

const Blessing = () => {
  // Add location and navigate hooks
  const location = useLocation();
  const navigate = useNavigate();


  // State to track form data
  const [formData, setFormData] = useState({
    preferredDate: "",
    preferredTime: "",
    firstName: "",
    middleName: "",
    lastName: "",
    gender: "",
    age: "",
    dateOfBirth: "",
    contactNumber: "",
    emailAddress: "",
    placeOfBirth: "",
    barangay: "",
    street: "",
    municipality: "",
    province: "",
    blessingType: "house", // Default blessing type
    location: "",
    purpose: "",
    notes: "",
  });

  // State to track modals and loading
  const [showModal, setShowModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  
  // Add validation state
  const [validationErrors, setValidationErrors] = useState({});
  const [showValidationErrors, setShowValidationErrors] = useState(false);
  const [validationErrorRef, setValidationErrorRef] = useState(null);
  
  // Add location data state
  const [locationData, setLocationData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [focusedField, setFocusedField] = useState(null);
  const [suggestions, setSuggestions] = useState({
    barangay: [],
    municipality: [],
    province: [],
    placeOfBirth: []
  });

  // Add states for schedules
  const [schedules, setSchedules] = useState([]);
  const [uniqueDates, setUniqueDates] = useState([]);
  const [filteredTimes, setFilteredTimes] = useState([]);

  // Add state for existing blessing applications
  const [existingBlessings, setExistingBlessings] = useState([]);

  // Fetch location data
  const fetchLocations = async () => {
    try {
      const response = await axios.get('http://parishofdivinemercy.com/backend/get_location.php');
      if (response.data.success) {
        setLocationData(response.data.locations);
      }
    } catch (error) {
      console.error('Error fetching locations:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch existing blessing applications
  const fetchExistingBlessings = async () => {
    try {
      const response = await fetch('http://parishofdivinemercy.com/backend/get_blessing_applications.php');
      const data = await response.json();
      if (data.success) {
        setExistingBlessings(data.applications);
        console.log('Existing blessing applications:', data.applications);
      }
    } catch (error) {
      console.error('Error fetching existing blessings:', error);
    }
  };

  // Fetch schedules for Blessing
  const fetchBlessingSchedules = async () => {
    try {
      const [schedulesResponse, blessingsResponse] = await Promise.all([
        fetch('http://parishofdivinemercy.com/backend/schedule.php'),
        fetch('http://parishofdivinemercy.com/backend/get_blessing_applications.php')
      ]);
      
      const scheduleData = await schedulesResponse.json();
      const blessingData = await blessingsResponse.json();
      
      if (scheduleData.success) {
        const blessingSchedules = scheduleData.schedules.filter(
          schedule => schedule.sacramentType.toLowerCase() === 'blessing'
        );
        
        // Get existing blessing applications
        const existingBlessingSet = new Set();
        if (blessingData.success) {
          blessingData.applications.forEach(app => {
            existingBlessingSet.add(`${app.preferredDate}-${app.preferredTime}`);
          });
        }

        // Filter out already booked schedules
        const availableSchedules = blessingSchedules.filter(schedule => {
          const key = `${schedule.date}-${schedule.time}`;
          return !existingBlessingSet.has(key);
        });
        
        setSchedules(availableSchedules);
        
        // Extract unique dates
        const uniqueDatesSet = new Set();
        const uniqueDatesArray = [];
        
        availableSchedules.forEach(schedule => {
          if (!uniqueDatesSet.has(schedule.date)) {
            uniqueDatesSet.add(schedule.date);
            uniqueDatesArray.push(schedule.date);
          }
        });
        
        setUniqueDates(uniqueDatesArray);
      }
    } catch (error) {
      console.error('Error fetching blessing schedules:', error);
    }
  };

  useEffect(() => {
    fetchBlessingSchedules();
    fetchLocations();
    fetchExistingBlessings();
  }, []);

  // Update available times when date is selected
  useEffect(() => {
    if (formData.preferredDate) {
      const timesForDate = schedules
        .filter(schedule => schedule.date === formData.preferredDate)
        .map(schedule => schedule.time);
      const uniqueTimes = [...new Set(timesForDate)];
      setFilteredTimes(uniqueTimes);
      if (!uniqueTimes.includes(formData.preferredTime)) {
        setFormData(prev => ({ ...prev, preferredTime: '' }));
      }
    } else {
      setFilteredTimes([]);
    }
  }, [formData.preferredDate, schedules]);

  // Enhanced filter functions to consider the other fields
  const filterBarangays = (input, municipality = null, province = null) => {
    const inputLower = input.toLowerCase();
    let filtered = locationData;

    if (municipality && municipality.trim() !== '') {
      filtered = filtered.filter(location => location.municipality === municipality);
    }
    
    if (province && province.trim() !== '') {
      filtered = filtered.filter(location => location.province === province);
    }
    
    return [...new Set(filtered.map(loc => loc.barangay))]
      .filter(barangay => barangay.toLowerCase().includes(inputLower))
      .sort();
  };

  const filterMunicipalities = (input, province = null) => {
    const inputLower = input.toLowerCase();
    let filtered = locationData;
    
    if (province && province.trim() !== '') {
      filtered = filtered.filter(location => location.province === province);
    }
    
    return [...new Set(filtered.map(loc => loc.municipality))]
      .filter(municipality => municipality.toLowerCase().includes(inputLower))
      .sort();
  };

  const filterProvinces = (input) => {
    const inputLower = input.toLowerCase();
    return [...new Set(locationData.map(loc => loc.province))]
      .filter(province => province.toLowerCase().includes(inputLower))
      .sort();
  };

  // Filter helpers for birth place
  const filterBirthPlaces = (input) => {
    const inputLower = input.toLowerCase();
    const searchTerms = inputLower.split(/\s+/).filter(term => term.length > 0);
    return locationData
      .filter(location => {
        const locationString = `${location.barangay} ${location.municipality} ${location.province}`.toLowerCase();
        return searchTerms.every(term => locationString.includes(term));
      })
      .map(location => ({
        barangay: location.barangay,
        municipality: location.municipality,
        province: location.province
      }));
  };

  // Updated handlers to filter based on other fields
  const handleBarangayChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, barangay: value }));
    
    if (focusedField === 'barangay') {
      setSuggestions(prev => ({
        ...prev,
        barangay: filterBarangays(value, formData.municipality, formData.province)
      }));
    }
  };

  const handleMunicipalityChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, municipality: value }));
    
    if (focusedField === 'municipality') {
      setSuggestions(prev => ({
        ...prev,
        municipality: filterMunicipalities(value, formData.province)
      }));
    }
    
    if (value) {
      const matchedLocation = locationData.find(loc => 
        loc.municipality.toLowerCase() === value.toLowerCase()
      );
      if (matchedLocation && !formData.province) {
        setFormData(prev => ({ ...prev, province: matchedLocation.province }));
      }
    }
  };

  const handleProvinceChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, province: value }));
    
    if (focusedField === 'province') {
      setSuggestions(prev => ({
        ...prev,
        province: filterProvinces(value)
      }));
    }
  };

  // Place of Birth handlers
  const handlePlaceOfBirthChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, placeOfBirth: value }));
    if (focusedField === 'placeOfBirth') {
      setSuggestions(s => ({
        ...s,
        placeOfBirth: filterBirthPlaces(value)
      }));
    }
  };

  const handleSelectPlaceOfBirth = (location) => {
    const formattedPlace = `${location.barangay}, ${location.municipality}, ${location.province}`;
    setFormData(prev => ({ ...prev, placeOfBirth: formattedPlace }));
    setFocusedField(null);
  };

  // Updated selection handlers
  const handleSelectBarangay = (barangay) => {
    setFormData(prev => ({ ...prev, barangay: barangay }));
    setFocusedField(null);
    
    const matchedLocation = locationData.find(loc => loc.barangay === barangay);
    if (matchedLocation) {
      if (!formData.municipality) {
        setFormData(prev => ({ ...prev, municipality: matchedLocation.municipality }));
      }
      if (!formData.province) {
        setFormData(prev => ({ ...prev, province: matchedLocation.province }));
      }
    }
  };

  const handleSelectMunicipality = (municipality) => {
    setFormData(prev => ({ ...prev, municipality: municipality }));
    
    const matchedLocation = locationData.find(loc => loc.municipality === municipality);
    if (matchedLocation && !formData.province) {
      setFormData(prev => ({ ...prev, province: matchedLocation.province }));
    }
    
    setFocusedField(null);
  };

  const handleSelectProvince = (province) => {
    setFormData(prev => ({ ...prev, province: province }));
    setFocusedField(null);
  };

  // Updated focus handlers
  const handleFocus = (field) => {
    setFocusedField(field);
    
    if (field === 'barangay') {
      setSuggestions(prev => ({
        ...prev,
        barangay: filterBarangays(formData.barangay || '', formData.municipality, formData.province)
      }));
    } else if (field === 'municipality') {
      setSuggestions(prev => ({
        ...prev,
        municipality: filterMunicipalities(formData.municipality || '', formData.province)
      }));
    } else if (field === 'province') {
      setSuggestions(prev => ({
        ...prev,
        province: filterProvinces(formData.province || '')
      }));
    } else if (field === 'placeOfBirth') {
      setSuggestions(prev => ({
        ...prev,
        placeOfBirth: filterBirthPlaces(formData.placeOfBirth || '')
      }));
    }
  };

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      const autocompleteContainers = document.querySelectorAll('.location-dropdown-container');
      let clickedOutside = true;
      
      autocompleteContainers.forEach(container => {
        if (container.contains(event.target)) {
          clickedOutside = false;
        }
      });
      
      if (clickedOutside) {
        setFocusedField(null);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Function to handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Add function to validate the form
  const validateForm = () => {
    const errors = {};
    // Required personal information fields
    const requiredFields = [
      { name: 'preferredDate', label: 'Date of Blessing Ceremony' },
      { name: 'preferredTime', label: 'Time of Blessing Ceremony' },
      { name: 'firstName', label: 'First Name' },
      { name: 'lastName', label: 'Last Name' },
      { name: 'contactNumber', label: 'Contact Number' },
      { name: 'emailAddress', label: 'Email Address' },
      { name: 'placeOfBirth', label: 'Place of Birth' },
      { name: 'barangay', label: 'Barangay' },
      { name: 'street', label: 'Street' },
      { name: 'municipality', label: 'Municipality' },
      { name: 'province', label: 'Province' },
      { name: 'purpose', label: 'Purpose' },
    ];

    // Check required fields
    requiredFields.forEach(field => {
      if (!formData[field.name] || formData[field.name].trim() === '') {
        errors[field.name] = `${field.label} is required`;
      }
    });

    return errors;
  };

  // Function to handle form submission
  const handleSubmit = () => {
    const errors = validateForm();
    const hasErrors = Object.keys(errors).length > 0;
    
    if (hasErrors) {
      setValidationErrors(errors);
      setShowValidationErrors(true);
      
      // Scroll to first error
      setTimeout(() => {
        const firstErrorField = Object.keys(errors)[0];
        const element = document.querySelector(`[name="${firstErrorField}"]`);
        
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          setValidationErrorRef(element);
        }
      }, 100);
    } else {
      setShowModal(true);
    }
  };

  // Function to handle Yes confirmation
  const handleYes = async () => {
    setShowModal(false);
    setIsLoading(true);
    try {
      // Create address data object
      const addressData = {
        street: formData.street,
        barangay: formData.barangay,
        municipality: formData.municipality,
        province: formData.province
      };

      // Create blessing type data object
      const blessingTypeData = {
        blessing_type: formData.blessingType,
        purpose: formData.purpose,
        note: formData.notes
      };

      // Create FormData object
      const formDataToSend = new FormData();
      
      // Add all form fields
   
      formDataToSend.append('blessingData', JSON.stringify({
        ...formData,
        placeOfBirth: formData.placeOfBirth
      }));
      formDataToSend.append('addressData', JSON.stringify(addressData));
      formDataToSend.append('blessingTypeData', JSON.stringify(blessingTypeData));

      // Submit the form
      const response = await fetch('http://parishofdivinemercy.com/backend/sec_blessing_application.php', {
        method: 'POST',
        body: formDataToSend
      });

      const data = await response.json();
      
      if (data.success) {
        // Send confirmation email
      
        setShowSuccessModal(true);
        setIsLoading(false);
        setTimeout(() => {
          navigate('/secretary-appointment');
        }, 2000);
      } else {
        console.error('Server returned error:', data.message);
        setErrorMessage(data.message || 'Failed to submit application');
        setShowErrorModal(true);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrorMessage(error.message || 'Error submitting application');
      setShowErrorModal(true);
      setIsLoading(false);
    }
  };

  return (
    <div className="client-blessing-container">
      <div className="client-blessing-header">
        <div className="client-blessing-back-button" onClick={() => navigate('/secretary-appointment')}>
          <AiOutlineArrowLeft /> Back
        </div>
      </div>
      <h1 className="client-blessing-title">Blessing Registration Form</h1>
      <div className="client-blessing-data">
        <div className="client-blessing-row-date">
          <div className="client-blessing-field-date">
            <label>Date of Appointment <span className="required-marker">*</span></label>
            <select
              name="preferredDate"
              className={showValidationErrors && validationErrors.preferredDate ? 'input-error' : ''}
              value={formData.preferredDate}
              onChange={e => setFormData(prev => ({ ...prev, preferredDate: e.target.value, preferredTime: '' }))}
            >
              <option value="">Select Date</option>
              {uniqueDates.map(date => (
                <option key={date} value={date}>{date}</option>
              ))}
            </select>
          </div>
          
          <div className="client-blessing-field-time">
            <label>Time of Appointment <span className="required-marker">*</span></label>
            <select
              name="preferredTime"
              className={showValidationErrors && validationErrors.preferredTime ? 'input-error' : ''}
              value={formData.preferredTime}
              onChange={e => setFormData(prev => ({ ...prev, preferredTime: e.target.value }))}
              disabled={!formData.preferredDate}
            >
              <option value="">Select Time</option>
              {filteredTimes.map(time => (
                <option key={time} value={time}>{time}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="client-blessing-bypart">
          <h2 className="client-blessing-section-title">Personal Information</h2>
          <div className="client-blessing-row">
            <div className={`client-blessing-field ${showValidationErrors && validationErrors.firstName ? 'field-error' : ''}`}>
              <label>First Name <span className="required-marker">*</span></label>
              <input 
                type="text" 
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className={showValidationErrors && validationErrors.firstName ? 'input-error' : ''}
              />
            </div>
            <div className="client-blessing-field">
              <label>Middle Name</label>
              <input 
                type="text" 
                name="middleName"
                value={formData.middleName}
                onChange={handleInputChange}
              />
            </div>
            <div className={`client-blessing-field ${showValidationErrors && validationErrors.lastName ? 'field-error' : ''}`}>
              <label>Last Name <span className="required-marker">*</span></label>
              <input 
                type="text" 
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className={showValidationErrors && validationErrors.lastName ? 'input-error' : ''}
              />
            </div>
            <div className={`client-blessing-field ${showValidationErrors && validationErrors.contactNumber ? 'field-error' : ''}`}>
              <label>Contact Number <span className="required-marker">*</span></label>
              <input 
                type="tel" 
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleInputChange}
                className={showValidationErrors && validationErrors.contactNumber ? 'input-error' : ''}
              />
            </div>
          </div>
          
          <div className="client-blessing-row">
          <div className={`client-blessing-field ${showValidationErrors && validationErrors.emailAddress ? 'field-error' : ''}`}>
              <label>Email Address <span className="required-marker">*</span></label>
              <input 
                type="email" 
                name="emailAddress"
                value={formData.emailAddress}
                onChange={handleInputChange}
                className={showValidationErrors && validationErrors.emailAddress ? 'input-error' : ''}
              />
            </div>
            <div className={`client-blessing-field location-dropdown-container ${showValidationErrors && validationErrors.placeOfBirth ? 'field-error' : ''}`}>
              <label>Place of Birth (Barangay, Municipality, Province) <span className="required-marker">*</span></label>
              <input
                name="placeOfBirth"
                value={formData.placeOfBirth || ""}
                onChange={handlePlaceOfBirthChange}
                onFocus={() => handleFocus('placeOfBirth')}
                placeholder="Type to search (Barangay, Municipality, Province)"
                autoComplete="off"
                className={showValidationErrors && validationErrors.placeOfBirth ? 'input-error' : ''}
              />
              {focusedField === 'placeOfBirth' && suggestions.placeOfBirth.length > 0 && (
                <div className="location-dropdown">
                  {suggestions.placeOfBirth.map((location, idx) => (
                    <div key={idx} onClick={() => handleSelectPlaceOfBirth(location)} className="location-dropdown-item">
                      {`${location.barangay}, ${location.municipality}, ${location.province}`}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <label className="sub-cc">Location <span className="required-marker">*</span></label>
          <div className="client-blessing-row">
          <div className={`client-blessing-field ${showValidationErrors && validationErrors.street ? 'field-error' : ''}`}>
              <label>Street <span className="required-marker">*</span></label>
              <input
                name="street"
                value={formData.street || ""}
                onChange={handleInputChange}
                placeholder="Street"
                autoComplete="off"
                className={showValidationErrors && validationErrors.street ? 'input-error' : ''}
              />
            </div>
            <div className={`client-blessing-field location-dropdown-container ${showValidationErrors && validationErrors.barangay ? 'field-error' : ''}`}>
              <label>Barangay <span className="required-marker">*</span></label>
              <input
                name="barangay"
                value={formData.barangay || ""}
                onChange={handleBarangayChange}
                onFocus={() => handleFocus('barangay')}
                placeholder="Type to search"
                autoComplete="off"
                className={showValidationErrors && validationErrors.barangay ? 'input-error' : ''}
              />
              {focusedField === 'barangay' && suggestions.barangay.length > 0 && (
                <div className="location-dropdown">
                  {suggestions.barangay.map((barangay, idx) => (
                    <div key={idx} onClick={() => handleSelectBarangay(barangay)} className="location-dropdown-item">
                      {barangay}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className={`client-blessing-field location-dropdown-container ${showValidationErrors && validationErrors.municipality ? 'field-error' : ''}`}>
              <label>Municipality <span className="required-marker">*</span></label>
              <input
                name="municipality"
                value={formData.municipality || ""}
                onChange={handleMunicipalityChange}
                onFocus={() => handleFocus('municipality')}
                placeholder="Type to search"
                autoComplete="off"
                className={showValidationErrors && validationErrors.municipality ? 'input-error' : ''}
              />
              {focusedField === 'municipality' && suggestions.municipality.length > 0 && (
                <div className="location-dropdown">
                  {suggestions.municipality.map((municipality, idx) => (
                    <div key={idx} onClick={() => handleSelectMunicipality(municipality)} className="location-dropdown-item">
                      {municipality}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className={`client-blessing-field location-dropdown-container ${showValidationErrors && validationErrors.province ? 'field-error' : ''}`}>
              <label>Province <span className="required-marker">*</span></label>
              <input
                name="province"
                value={formData.province || ""}
                onChange={handleProvinceChange}
                onFocus={() => handleFocus('province')}
                placeholder="Type to search"
                autoComplete="off"
                className={showValidationErrors && validationErrors.province ? 'input-error' : ''}
              />
              {focusedField === 'province' && suggestions.province.length > 0 && (
                <div className="location-dropdown">
                  {suggestions.province.map((province, idx) => (
                    <div key={idx} onClick={() => handleSelectProvince(province)} className="location-dropdown-item">
                      {province}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="client-blessing-row">
             <div className="client-blessing-field">
              <label>Blessing Type <span className="required-marker">*</span></label>
              <select 
                name="blessingType"
                value={formData.blessingType}
                onChange={handleInputChange}
              >
                <option value="house">House Blessing</option>
                <option value="business">Business Blessing</option>
                <option value="car">Car Blessing</option>
              </select>
            </div>
            <div className={`client-blessing-field ${showValidationErrors && validationErrors.purpose ? 'field-error' : ''}`}>
              <label>Purpose <span className="required-marker">*</span></label>
              <input 
                type="text" 
                name="purpose"
                value={formData.purpose}
                onChange={handleInputChange}
                placeholder="Brief description of the purpose for the blessing"
                className={showValidationErrors && validationErrors.purpose ? 'input-error' : ''}
              />
            </div>
          </div>

          <div className="client-blessing-row">
            <div className="client-blessing-field">
              <label>Notes</label>
              <textarea 
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Additional information or special requests"
                className="client-blessing-textarea"
              ></textarea>
            </div>
          </div>
        </div>

        <div className="client-blessing-button-container">
          <button className="client-blessing-submit-btn" onClick={handleSubmit}>Submit</button>
          <button className="client-blessing-cancel-btn" onClick={() => navigate('/secretary-appointment')}>Cancel</button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="client-blessing-modal-overlay">
          <div className="client-blessing-modal">
            <h2>Submit Application</h2>
            <hr className="client-blessing-custom-hr" />
            <p>Are you sure you want to submit your {formData.blessingType.charAt(0).toUpperCase() + formData.blessingType.slice(1)} Blessing application?</p>
            <div className="client-blessing-modal-buttons">
              <button className="client-blessing-yes-btn" onClick={handleYes}>Yes</button>
              <button className="client-blessing-modal-no-btn" onClick={() => setShowModal(false)}>No</button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="client-blessing-modal-overlay">
          <div className="client-blessing-modal">
            <h2>Success</h2>
            <hr className="client-blessing-custom-hr" />
            <p>Your blessing application has been submitted successfully!</p>
            <div className="client-blessing-modal-buttons">
              <button className="client-blessing-yes-btn" onClick={() => {
                setShowSuccessModal(false);
                navigate('/secretary-appointment');
              }}>OK</button>
            </div>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <div className="client-blessing-modal-overlay">
          <div className="client-blessing-modal">
            <h2>Error</h2>
            <hr className="client-blessing-custom-hr" />
            <p>{errorMessage}</p>
            <div className="client-blessing-modal-buttons">
              <button className="client-blessing-modal-no-btn" onClick={() => {
                setShowErrorModal(false);
                setErrorMessage("");
              }}>OK</button>
            </div>
          </div>
        </div>
      )}

      {/* Loading Modal */}
      {isLoading && (
        <div className="client-blessing-modal-overlay">
          <div className="client-blessing-modal">
            <h2>Processing Application</h2>
            <hr className="client-blessing-custom-hr" />
            <p>Please wait while we submit your blessing application...</p>
            <div className="client-blessing-loading-spinner">
              <div className="client-blessing-spinner"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Blessing;