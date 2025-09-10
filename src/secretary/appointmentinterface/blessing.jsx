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
  
  // Add state for birth location components
  const [birthFields, setBirthFields] = useState({
    barangay: '',
    municipality: '',
    province: ''
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
    birthBarangay: [],
    birthMunicipality: [],
    birthProvince: []
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
  // If we have municipality and/or province context, show ALL related barangays
  if (municipality && municipality.trim() !== '') {
    const filtered = locationData.filter(location => location.municipality === municipality);
    const allBarangays = [...new Set(filtered.map(loc => loc.barangay))].sort();
    
    // If there's input, filter by input
    if (input && input.trim()) {
      const inputLower = input.toLowerCase();
      return allBarangays.filter(barangay => barangay.toLowerCase().includes(inputLower));
    }
    
    // No input, return all barangays for this municipality
    return allBarangays;
  }
  
  if (province && province.trim() !== '') {
    const filtered = locationData.filter(location => location.province === province);
    const allBarangays = [...new Set(filtered.map(loc => loc.barangay))].sort();
    
    // If there's input, filter by input
    if (input && input.trim()) {
      const inputLower = input.toLowerCase();
      return allBarangays.filter(barangay => barangay.toLowerCase().includes(inputLower));
    }
    
    // No input, return all barangays for this province
    return allBarangays;
  }
  
  // No context provided - show first 10 or filter by input
  if (!input || !input.trim()) {
    return [...new Set(locationData.map(loc => loc.barangay))].sort().slice(0, 10);
  }
  
  const inputLower = input.toLowerCase();
  return [...new Set(locationData.map(loc => loc.barangay))]
    .filter(barangay => barangay.toLowerCase().includes(inputLower))
    .sort()
    .slice(0, 10);
};

const filterMunicipalities = (input, province = null, barangay = null) => {
  // If we have barangay context, show ALL municipalities that have this barangay
  if (barangay && barangay.trim() !== '') {
    const filtered = locationData.filter(location => location.barangay === barangay);
    const allMunicipalities = [...new Set(filtered.map(loc => loc.municipality))].sort();
    
    // If there's input, filter by input
    if (input && input.trim()) {
      const inputLower = input.toLowerCase();
      return allMunicipalities.filter(municipality => municipality.toLowerCase().includes(inputLower));
    }
    
    // No input, return all municipalities that have this barangay
    return allMunicipalities;
  }
  
  // If we have province context, show ALL municipalities in this province
  if (province && province.trim() !== '') {
    const filtered = locationData.filter(location => location.province === province);
    const allMunicipalities = [...new Set(filtered.map(loc => loc.municipality))].sort();
    
    // If there's input, filter by input
    if (input && input.trim()) {
      const inputLower = input.toLowerCase();
      return allMunicipalities.filter(municipality => municipality.toLowerCase().includes(inputLower));
    }
    
    // No input, return all municipalities for this province
    return allMunicipalities;
  }
  
  // No context provided - show first 10 or filter by input
  if (!input || !input.trim()) {
    return [...new Set(locationData.map(loc => loc.municipality))].sort().slice(0, 10);
  }
  
  const inputLower = input.toLowerCase();
  return [...new Set(locationData.map(loc => loc.municipality))]
    .filter(municipality => municipality.toLowerCase().includes(inputLower))
    .sort()
    .slice(0, 10);
};

const filterProvinces = (input, municipality = null, barangay = null) => {
  // If we have municipality context, show ALL provinces that have this municipality
  if (municipality && municipality.trim() !== '') {
    const filtered = locationData.filter(location => location.municipality === municipality);
    const allProvinces = [...new Set(filtered.map(loc => loc.province))].sort();
    
    // If there's input, filter by input
    if (input && input.trim()) {
      const inputLower = input.toLowerCase();
      return allProvinces.filter(province => province.toLowerCase().includes(inputLower));
    }
    
    // No input, return all provinces that have this municipality
    return allProvinces;
  }
  
  // If we have barangay context, show ALL provinces that have this barangay
  if (barangay && barangay.trim() !== '') {
    const filtered = locationData.filter(location => location.barangay === barangay);
    const allProvinces = [...new Set(filtered.map(loc => loc.province))].sort();
    
    // If there's input, filter by input
    if (input && input.trim()) {
      const inputLower = input.toLowerCase();
      return allProvinces.filter(province => province.toLowerCase().includes(inputLower));
    }
    
    // No input, return all provinces that have this barangay
    return allProvinces;
  }
  
  // No context provided - show first 10 or filter by input
  if (!input || !input.trim()) {
    return [...new Set(locationData.map(loc => loc.province))].sort().slice(0, 10);
  }
  
  const inputLower = input.toLowerCase();
  return [...new Set(locationData.map(loc => loc.province))]
    .filter(province => province.toLowerCase().includes(inputLower))
    .sort()
    .slice(0, 10);
};

  // Updated handlers for birth location fields
  const handleBirthBarangayChange = (e) => {
    const value = e.target.value;
    const updatedFields = {...birthFields, barangay: value};
    setBirthFields(updatedFields);
    updatePlaceOfBirth(updatedFields);
    
    if (focusedField === 'birthBarangay') {
      setSuggestions(prev => ({ 
        ...prev, 
        birthBarangay: filterBarangays(value, birthFields.municipality, birthFields.province) 
      }));
    }
  };

 const handleBirthMunicipalityChange = (e) => {
  const value = e.target.value;
  const updatedFields = {...birthFields, municipality: value};
  setBirthFields(updatedFields);
  updatePlaceOfBirth(updatedFields);
  
  if (focusedField === 'birthMunicipality') {
    setSuggestions(prev => ({ 
      ...prev, 
      birthMunicipality: filterMunicipalities(value, birthFields.province, birthFields.barangay) 
    }));
  }
  // NO AUTO-FILL while typing
};

  const handleBirthProvinceChange = (e) => {
    const value = e.target.value;
    const updatedFields = {...birthFields, province: value};
    setBirthFields(updatedFields);
    updatePlaceOfBirth(updatedFields);
    
    if (focusedField === 'birthProvince') {
      setSuggestions(prev => ({ 
        ...prev, 
        birthProvince: filterProvinces(value) 
      }));
    }
  };

  // Function to update place of birth from separate fields
  const updatePlaceOfBirth = (updatedFields) => {
    // Get the current values, prioritizing the updated fields
    const barangay = updatedFields.barangay !== undefined ? updatedFields.barangay : birthFields.barangay;
    const municipality = updatedFields.municipality !== undefined ? updatedFields.municipality : birthFields.municipality;
    const province = updatedFields.province !== undefined ? updatedFields.province : birthFields.province;
    
    // Build formatted place string with all three components when available
    let parts = [];
    if (barangay) parts.push(barangay);
    if (municipality) parts.push(municipality); 
    if (province) parts.push(province);
    
    const formattedPlace = parts.join(', ');
    
    // Only update if we have at least one component
    if (formattedPlace) {
      // Direct state update to ensure it happens immediately
      setFormData(prevState => ({
        ...prevState,
        placeOfBirth: formattedPlace
      }));
    }
  };

  // Add handlers for birth place selection
  const handleSelectBirthBarangay = (barangay) => {
    // Create a copy with the updated barangay
    const newFields = {
      ...birthFields,
      barangay: barangay
    };
    
    // Update birth fields state
    setBirthFields(newFields);
    
    // Update place of birth with all fields
    updatePlaceOfBirth(newFields);
    
    setFocusedField(null);
    
    // Check if this barangay has a specific municipality and province
    const matchedLocation = locationData.find(loc => loc.barangay === barangay);
    if (matchedLocation) {
      const finalFields = {
        ...newFields
      };
      
      let shouldUpdate = false;
      
      if (!newFields.municipality && matchedLocation.municipality) {
        finalFields.municipality = matchedLocation.municipality;
        shouldUpdate = true;
      }
      
      if (!newFields.province && matchedLocation.province) {
        finalFields.province = matchedLocation.province;
        shouldUpdate = true;
      }
      
      if (shouldUpdate) {
        // Update the state with the additional fields
        setBirthFields(finalFields);
        // Update place of birth with complete information
        updatePlaceOfBirth(finalFields);
      }
    }
  };

 const handleSelectBirthMunicipality = (municipality) => {
  const newFields = {
    ...birthFields,
    municipality: municipality
  };
  
  setBirthFields(newFields);
  updatePlaceOfBirth(newFields);
  setFocusedField(null);
  
  // Auto-fill province if available
  const matchingLocations = locationData.filter(loc => loc.municipality === municipality);
  const uniqueProvinces = [...new Set(matchingLocations.map(loc => loc.province))];
  
  if (uniqueProvinces.length === 1 && !birthFields.province) {
    const finalFields = {
      ...newFields,
      province: uniqueProvinces[0]
    };
    
    setBirthFields(finalFields);
    updatePlaceOfBirth(finalFields);
  }
};

  const handleSelectBirthProvince = (province) => {
    // Create a copy with the updated province
    const newFields = {
      ...birthFields,
      province: province
    };
    
    // Update birth fields state
    setBirthFields(newFields);
    
    // Update place of birth with all fields
    updatePlaceOfBirth(newFields);
    
    setFocusedField(null);
  };

  // Updated handlers for address fields
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
      municipality: filterMunicipalities(value, formData.province, formData.barangay)
    }));
  }
  // NO AUTO-FILL while typing
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
  setFocusedField(null);
  
  // Auto-fill province if available
  const matchingLocations = locationData.filter(loc => loc.municipality === municipality);
  const uniqueProvinces = [...new Set(matchingLocations.map(loc => loc.province))];
  
  if (uniqueProvinces.length === 1 && !formData.province) {
    setFormData(prev => ({ ...prev, province: uniqueProvinces[0] }));
  }
};
  const handleSelectProvince = (province) => {
    setFormData(prev => ({ ...prev, province: province }));
    setFocusedField(null);
  };

  // Updated focus handlers
 const handleFocus = (field) => {
  setFocusedField(field);
  
  switch(field) {
    case 'birthBarangay':
      setSuggestions(prev => ({ 
        ...prev, 
        birthBarangay: filterBarangays(birthFields.barangay, birthFields.municipality, birthFields.province) 
      }));
      break;
    case 'birthMunicipality':
      setSuggestions(prev => ({ 
        ...prev, 
        birthMunicipality: filterMunicipalities(birthFields.municipality, birthFields.province, birthFields.barangay) 
      }));
      break;
    case 'birthProvince':
      setSuggestions(prev => ({ 
        ...prev, 
        birthProvince: filterProvinces(birthFields.province, birthFields.municipality, birthFields.barangay) 
      }));
      break;
    case 'barangay':
      setSuggestions(prev => ({
        ...prev,
        barangay: filterBarangays(formData.barangay || '', formData.municipality, formData.province)
      }));
      break;
    case 'municipality':
      setSuggestions(prev => ({
        ...prev,
        municipality: filterMunicipalities(formData.municipality || '', formData.province, formData.barangay)
      }));
      break;
    case 'province':
      setSuggestions(prev => ({
        ...prev,
        province: filterProvinces(formData.province || '', formData.municipality, formData.barangay)
      }));
      break;
    default:
      break;
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
      const response = await fetch('http://parishofdivinemercy.com/backend/blessing_application.php', {
        method: 'POST',
        body: formDataToSend
      });

      const data = await response.json();
      
      if (data.success) {

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
                <div className="aos-left-section">
                  <button className="aos-back-button" onClick={() => navigate(-1)}>
                    <AiOutlineArrowLeft className="aos-back-icon" /> Back
                  </button>
                </div>
      </div>
      <h1 className="client-blessing-title">Blessing Application Form</h1>
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
          </div>
          
          {/* Place of Birth with separated fields */}
          <label className="sub-cc">Place of Birth <span className="required-marker">*</span></label>
          <div className="client-blessing-row">
            <div className={`client-blessing-field location-dropdown-container ${showValidationErrors && validationErrors.placeOfBirth ? 'field-error' : ''}`}>
              <label>Birth Province</label>
              <input 
                type="text"
                placeholder="Type to search"
              value={birthFields.province}
               onChange={handleBirthProvinceChange}
               onFocus={() => handleFocus('birthProvince')}
               className={showValidationErrors && validationErrors.placeOfBirth ? 'input-error' : ''}
             />
             {focusedField === 'birthProvince' && suggestions.birthProvince.length > 0 && (
               <div className="location-dropdown">
                 {suggestions.birthProvince.map((province, index) => (
                   <div 
                     key={index}
                     onClick={() => handleSelectBirthProvince(province)}
                     className="location-dropdown-item"
                   >
                     {province}
                   </div>
                 ))}
               </div>
             )}
           </div>
            <div className={`client-blessing-field location-dropdown-container ${showValidationErrors && validationErrors.placeOfBirth ? 'field-error' : ''}`}>
              <label>Birth Municipality</label>
              <input 
                type="text"
                placeholder="Type to search"
                value={birthFields.municipality}
                onChange={handleBirthMunicipalityChange}
                onFocus={() => handleFocus('birthMunicipality')}
                className={showValidationErrors && validationErrors.placeOfBirth ? 'input-error' : ''}
              />
              {focusedField === 'birthMunicipality' && suggestions.birthMunicipality.length > 0 && (
                <div className="location-dropdown">
                  {suggestions.birthMunicipality.map((municipality, index) => (
                    <div 
                      key={index}
                      onClick={() => handleSelectBirthMunicipality(municipality)}
                      className="location-dropdown-item"
                    >
                      {municipality}
                    </div>
                  ))}
                </div>
              )}
            </div>
             <div className={`client-blessing-field location-dropdown-container ${showValidationErrors && validationErrors.placeOfBirth ? 'field-error' : ''}`}>
              <label>Birth Barangay</label>
              <input
                type="text"
                placeholder="Type to search"
                value={birthFields.barangay}
                onChange={handleBirthBarangayChange}
                onFocus={() => handleFocus('birthBarangay')}
                className={showValidationErrors && validationErrors.placeOfBirth ? 'input-error' : ''}
              />
              {focusedField === 'birthBarangay' && suggestions.birthBarangay.length > 0 && (
                <div className="location-dropdown">
                  {suggestions.birthBarangay.map((barangay, index) => (
                    <div 
                      key={index}
                      onClick={() => handleSelectBirthBarangay(barangay)}
                      className="location-dropdown-item"
                    >
                      {barangay}
                    </div>
                  ))}
                </div>
              )}
            </div>
           
         </div>

         <label className="sub-cc">Current Address <span className="required-marker">*</span></label>
         <div className="client-blessing-row">
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
         <button className="client-blessing-cancel-btn" onClick={() => navigate('/client-appointment')}>Cancel</button>
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
               navigate('/client-appointment');
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