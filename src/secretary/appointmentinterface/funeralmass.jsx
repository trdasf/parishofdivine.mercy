import React, { useState, useRef, useEffect } from "react";
import { AiOutlineArrowLeft, AiOutlineUpload } from "react-icons/ai"; 
import { useLocation, useNavigate } from "react-router-dom";
import axios from 'axios';
import "../../client/ClientFuneralMass.css";

const FuneralMass = () => {
  const location = useLocation();

  
 
  // State for form data
  const [formData, setFormData] = useState({
    // Funeral Mass Information
    dateOfFuneralMass: '',
    timeOfFuneralMass: '',
    
    // Deceased Information
    deceasedFirstName: '',
    deceasedMiddleName: '',
    deceasedLastName: '',
    deceasedSex: '',
    deceasedAge: '',
    deceasedDateOfBirth: '',
    deceasedDateOfDeath: '',
    causeOfDeath: '',
    wakeLocation: '',
    burialLocation: '',
    
    // Requester Information
    requesterFirstName: '',
    requesterMiddleName: '',
    requesterLastName: '',
    relationship: '',
    contactNumber: '',
    email: '',
    
    // Address
    barangay: '',
    street: '',
    municipality: '',
    province: '',
    region: ''
  });

  // Add state for existing funeral applications
  const [existingFunerals, setExistingFunerals] = useState([]);

  // States for location data
  const [locationData, setLocationData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [focusedField, setFocusedField] = useState(null);
  const [suggestions, setSuggestions] = useState({
    barangay: [],
    municipality: [],
    province: [],
    region: []
  });

  // States for schedules
  const [schedules, setSchedules] = useState([]);
  const [availableDates, setAvailableDates] = useState([]);
  const [availableTimes, setAvailableTimes] = useState([]);

  // State to track modals and loading
  const [showModal, setShowModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [documentErrors, setDocumentErrors] = useState([]);
  
  // Refs for file inputs
  const fileInputRefs = {
    'death_certificate': useRef(null),
    'parish_clearance': useRef(null),
    'permit_to_bury': useRef(null),
    'certificate_baptism': useRef(null),
    'certificate_confirmation': useRef(null)
  };

  // Add suggestions for wake and burial locations
  const [wakeSuggestions, setWakeSuggestions] = useState([]);
  const [burialSuggestions, setBurialSuggestions] = useState([]);

  // Define required document IDs
  const requiredDocumentIds = [
    'death_certificate',
    'parish_clearance',
    'permit_to_bury',
    'certificate_baptism',
    'certificate_confirmation'
  ];

  // Fetch all necessary data on component mount
  useEffect(() => {
    fetchFuneralSchedules();
    fetchLocations();
    fetchExistingFunerals();
  }, []);

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

  // Fetch funeral schedules
  const fetchFuneralSchedules = async () => {
    try {
      const response = await fetch('http://parishofdivinemercy.com/backend/schedule.php');
      const data = await response.json();
      
      if (data.success) {
        // Filter only funeral mass schedules
        const funeralSchedules = data.schedules.filter(
          schedule => schedule.sacramentType.toLowerCase() === 'funeral mass'
        );
        setSchedules(funeralSchedules);
      }
    } catch (error) {
      console.error('Error fetching schedules:', error);
    }
  };

  // Fetch existing funeral applications
  const fetchExistingFunerals = async () => {
    try {
      const response = await fetch('http://parishofdivinemercy.com/backend/get_funeral_applications.php');
      const data = await response.json();
      
      if (data.success) {
        setExistingFunerals(data.applications);
      }
    } catch (error) {
      console.error('Error fetching existing funeral applications:', error);
    }
  };

  // Update available dates and times after schedules and existing funerals are loaded
  useEffect(() => {
    if (schedules.length > 0 && existingFunerals.length >= 0) {
      updateAvailableSchedules();
    }
  }, [schedules, existingFunerals]);

  // Filter available dates and times based on existing bookings
  const updateAvailableSchedules = () => {
    // Create a map of booked schedules
    const bookedSchedules = new Map();
    
    existingFunerals.forEach(funeral => {
      const key = `${funeral.dateOfFuneral}_${funeral.timeOfFuneral}`;
      bookedSchedules.set(key, true);
    });
    
    // Filter available dates and create a map of available times per date
    const availableDatesArray = [];
    const availableDateMap = new Map();
    
    schedules.forEach(schedule => {
      const key = `${schedule.date}_${schedule.time}`;
      
      // If this date-time combination is not booked
      if (!bookedSchedules.has(key)) {
        // Add this date to our list if it's not already there
        if (!availableDateMap.has(schedule.date)) {
          availableDateMap.set(schedule.date, true);
          availableDatesArray.push(schedule.date);
        }
      }
    });
    
    setAvailableDates(availableDatesArray);
    
    // If a date is selected, update available times for that date
    if (formData.dateOfFuneralMass) {
      updateAvailableTimes(formData.dateOfFuneralMass, bookedSchedules);
    }
  };

  // Update available times for a selected date
  const updateAvailableTimes = (selectedDate, bookedSchedules = null) => {
    if (!selectedDate) return;
    
    // If bookedSchedules is not provided, create it
    if (!bookedSchedules) {
      bookedSchedules = new Map();
      existingFunerals.forEach(funeral => {
        const key = `${funeral.dateOfFuneral}_${funeral.timeOfFuneral}`;
        bookedSchedules.set(key, true);
      });
    }
    
    // Filter schedules for the selected date and that are not booked
    const availableTimesForDate = schedules
      .filter(schedule => 
        schedule.date === selectedDate && 
        !bookedSchedules.has(`${schedule.date}_${schedule.time}`)
      )
      .map(schedule => schedule.time);
    
    setAvailableTimes(availableTimesForDate);
    
    // If the currently selected time is not available, clear it
    if (formData.timeOfFuneralMass && !availableTimesForDate.includes(formData.timeOfFuneralMass)) {
      setFormData(prev => ({
        ...prev,
        timeOfFuneralMass: ''
      }));
    }
  };

  // Location filter functions
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

  // Function to filter regions
  const filterRegions = (input) => {
    const inputLower = input.toLowerCase();
    // This is a simple static list of regions in the Philippines
    const regions = [
      'Region I - Ilocos Region',
      'Region II - Cagayan Valley',
      'Region III - Central Luzon',
      'Region IV-A - CALABARZON',
      'Region IV-B - MIMAROPA',
      'Region V - Bicol Region',
      'Region VI - Western Visayas',
      'Region VII - Central Visayas',
      'Region VIII - Eastern Visayas',
      'Region IX - Zamboanga Peninsula',
      'Region X - Northern Mindanao',
      'Region XI - Davao Region',
      'Region XII - SOCCSKSARGEN',
      'Region XIII - Caraga',
      'NCR - National Capital Region',
      'CAR - Cordillera Administrative Region',
      'BARMM - Bangsamoro Autonomous Region in Muslim Mindanao'
    ];
    
    return regions.filter(region => region.toLowerCase().includes(inputLower));
  };

  // Age calculation for deceased
  useEffect(() => {
    if (formData.deceasedDateOfBirth) {
      const birthDate = new Date(formData.deceasedDateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      if (!isNaN(age)) {
        setFormData(prev => ({ ...prev, deceasedAge: age.toString() }));
      }
    }
  }, [formData.deceasedDateOfBirth]);

  // Helper for location search (barangay, municipality, province)
  const filterLocations = (input) => {
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

  // Wake location handlers
  const handleWakeLocationChange = (e) => {
    const value = e.target.value;
    handleInputChange('wakeLocation', value);
    setWakeSuggestions(filterLocations(value));
  };
  const handleSelectWakeLocation = (location) => {
    const formatted = `${location.barangay}, ${location.municipality}, ${location.province}`;
    handleInputChange('wakeLocation', formatted);
    setWakeSuggestions([]);
    // Blur the input field to close any mobile keyboard
    document.querySelector('input[name="wakeLocation"]')?.blur();
  };

  // Burial location handlers
  const handleBurialLocationChange = (e) => {
    const value = e.target.value;
    handleInputChange('burialLocation', value);
    setBurialSuggestions(filterLocations(value));
  };
  const handleSelectBurialLocation = (location) => {
    const formatted = `${location.barangay}, ${location.municipality}, ${location.province}`;
    handleInputChange('burialLocation', formatted);
    setBurialSuggestions([]);
    // Blur the input field to close any mobile keyboard
    document.querySelector('input[name="burialLocation"]')?.blur();
  };

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // If changing the date, update available times
    if (field === 'dateOfFuneralMass') {
      updateAvailableTimes(value);
    }
  };

  // Handle date changes
  const handleDateChange = (field, value) => {
    handleInputChange(field, value);
  };

  // Location change handlers
  const handleBarangayChange = (e) => {
    const value = e.target.value;
    handleInputChange('barangay', value);
    
    if (focusedField === 'barangay') {
      setSuggestions({
        ...suggestions,
        barangay: filterBarangays(value, formData.municipality, formData.province)
      });
    }
  };

  const handleMunicipalityChange = (e) => {
    const value = e.target.value;
    handleInputChange('municipality', value);
    
    if (focusedField === 'municipality') {
      setSuggestions({
        ...suggestions,
        municipality: filterMunicipalities(value, formData.province)
      });
    }
    
    if (value) {
      const matchedLocation = locationData.find(loc => 
        loc.municipality.toLowerCase() === value.toLowerCase()
      );
      if (matchedLocation && !formData.province) {
        handleInputChange('province', matchedLocation.province);
      }
    }
  };

  const handleProvinceChange = (e) => {
    const value = e.target.value;
    handleInputChange('province', value);
    
    if (focusedField === 'province') {
      setSuggestions({
        ...suggestions,
        province: filterProvinces(value)
      });
    }
  };

  // Handle region change
  const handleRegionChange = (e) => {
    const value = e.target.value;
    handleInputChange('region', value);
    
    if (focusedField === 'region') {
      setSuggestions({
        ...suggestions,
        region: filterRegions(value)
      });
    }
  };

  // Selection handlers
  const handleSelectBarangay = (barangay) => {
    handleInputChange('barangay', barangay);
    setFocusedField(null);
    
    const matchedLocation = locationData.find(loc => loc.barangay === barangay);
    if (matchedLocation) {
      if (!formData.municipality) {
        handleInputChange('municipality', matchedLocation.municipality);
      }
      if (!formData.province) {
        handleInputChange('province', matchedLocation.province);
      }
    }
    
    // Blur the input field to close any mobile keyboard
    document.querySelector('input[name="barangay"]')?.blur();
  };

  const handleSelectMunicipality = (municipality) => {
    handleInputChange('municipality', municipality);
    
    const matchedLocation = locationData.find(loc => loc.municipality === municipality);
    if (matchedLocation && !formData.province) {
      handleInputChange('province', matchedLocation.province);
    }
    
    setFocusedField(null);
    // Blur the input field to close any mobile keyboard
    document.querySelector('input[name="municipality"]')?.blur();
  };

  const handleSelectProvince = (province) => {
    handleInputChange('province', province);
    setFocusedField(null);
    // Blur the input field to close any mobile keyboard
    document.querySelector('input[name="province"]')?.blur();
  };

  // Handle selecting a region
  const handleSelectRegion = (region) => {
    handleInputChange('region', region);
    setFocusedField(null);
    // Blur the input field to close any mobile keyboard
    document.querySelector('input[name="region"]')?.blur();
  };

  // Focus handlers
  const handleFocus = (field) => {
    setFocusedField(field);
    
    if (field === 'barangay') {
      setSuggestions({
        ...suggestions,
        barangay: filterBarangays(formData.barangay, formData.municipality, formData.province)
      });
    } else if (field === 'municipality') {
      setSuggestions({
        ...suggestions,
        municipality: filterMunicipalities(formData.municipality, formData.province)
      });
    } else if (field === 'province') {
      setSuggestions({
        ...suggestions,
        province: filterProvinces(formData.province)
      });
    } else if (field === 'region') {
      setSuggestions({
        ...suggestions,
        region: filterRegions(formData.region)
      });
    }
  };

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      // If we're already focused on a field and clicked on another input, close the dropdown
      if (focusedField) {
        const clickedInput = event.target.tagName === 'INPUT' || event.target.tagName === 'SELECT';
        const clickedLocationDropdownItem = event.target.classList.contains('location-dropdown-item');
        
        // Check if click is outside the current focused field's container
        const currentFocusedContainer = document.querySelector(`input[name="${focusedField}"]`)?.closest('.location-dropdown-container');
        const clickedInsideCurrentContainer = currentFocusedContainer && currentFocusedContainer.contains(event.target);
        
        // Close dropdown if clicked on another input or outside of any dropdown container
        if ((clickedInput && !clickedInsideCurrentContainer) || 
            (!clickedInsideCurrentContainer && !clickedLocationDropdownItem)) {
          setFocusedField(null);
        }
      }
      
      // Also close wake and burial location dropdowns when clicking elsewhere
      if (wakeSuggestions.length > 0) {
        const wakeLocationContainer = document.querySelector('input[name="wakeLocation"]')?.closest('.location-dropdown-container');
        const clickedInsideWakeContainer = wakeLocationContainer && wakeLocationContainer.contains(event.target);
        
        if (!clickedInsideWakeContainer) {
          setWakeSuggestions([]);
        }
      }
      
      if (burialSuggestions.length > 0) {
        const burialLocationContainer = document.querySelector('input[name="burialLocation"]')?.closest('.location-dropdown-container');
        const clickedInsideBurialContainer = burialLocationContainer && burialLocationContainer.contains(event.target);
        
        if (!clickedInsideBurialContainer) {
          setBurialSuggestions([]);
        }
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [focusedField, wakeSuggestions.length, burialSuggestions.length]);

  // Function to trigger file input click
  const triggerFileUpload = (requirementId) => {
    if (fileInputRefs[requirementId] && fileInputRefs[requirementId].current) {
      fileInputRefs[requirementId].current.click();
    }
  };

  // Function to handle requirement checkbox click
  const handleRequirementCheckboxClick = (requirementId) => {
    // If the requirement is currently submitted, clear it when unchecked
    if (uploadStatus[requirementId] === 'Submitted') {
      // Clear the file input
      if (fileInputRefs[requirementId] && fileInputRefs[requirementId].current) {
        fileInputRefs[requirementId].current.value = '';
      }
      
      // Clear the uploaded file data
      setUploadedFiles({
        ...uploadedFiles,
        [requirementId]: undefined
      });
      
      // Set status back to Not Submitted
      setUploadStatus({
        ...uploadStatus,
        [requirementId]: 'Not Submitted'
      });
    }
    // If not submitted, trigger file upload
    else {
      triggerFileUpload(requirementId);
    }
  };

  // Function to handle file selection and upload
  const handleFileChange = (requirementId, event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Update status to "Uploading..."
    setUploadStatus({
      ...uploadStatus,
      [requirementId]: "Uploading..."
    });

    // Simulate file upload with a timeout
    setTimeout(() => {
      // Create a URL for the uploaded file (for preview purposes)
      const fileUrl = URL.createObjectURL(file);
      
      // Update states to reflect successful upload
      setUploadedFiles({
        ...uploadedFiles,
        [requirementId]: {
          name: file.name,
          url: fileUrl,
          type: file.type,
          file: file  // Store the actual file for upload
        }
      });
      
      // Automatically set status to Submitted when a file is uploaded
      setUploadStatus({
        ...uploadStatus,
        [requirementId]: "Submitted"
      });
      
      // Remove document from error list if it was there
      if (documentErrors.includes(requirementId)) {
        setDocumentErrors(prevErrors => prevErrors.filter(id => id !== requirementId));
      }
    }, 1000); // Simulate upload delay
  };

  // Render upload status selector
  const renderStatusSelector = (requirementId) => {
    const status = uploadStatus[requirementId] || "Not Submitted";
    const isSubmitted = status === "Submitted";
    const isUploading = status === "Uploading...";
    
    return (
      <select 
        className={`client-funeral-status-dropdown ${
          isSubmitted ? 'client-funeral-status-submitted' : 
          isUploading ? 'client-funeral-status-uploading' :
          'client-funeral-status-not-submitted'
        }`}
        value={status}
        onChange={(e) => {
          const newStatus = e.target.value;
          setUploadStatus({...uploadStatus, [requirementId]: newStatus});
          
          // If status is changed to "Not Submitted" manually, clear the uploaded file
          if (newStatus === "Not Submitted" && uploadedFiles[requirementId]) {
            setUploadedFiles({
              ...uploadedFiles,
              [requirementId]: undefined
            });
            
            // Clear the file input
            if (fileInputRefs[requirementId] && fileInputRefs[requirementId].current) {
              fileInputRefs[requirementId].current.value = '';
            }
          }
          
          // Update document errors list
          if (newStatus === "Submitted") {
            setDocumentErrors(prevErrors => prevErrors.filter(id => id !== requirementId));
          } else {
            if (!documentErrors.includes(requirementId) && requiredDocumentIds.includes(requirementId)) {
              setDocumentErrors(prevErrors => [...prevErrors, requirementId]);
            }
          }
        }}
        disabled={isUploading}
      >
        <option value="Not Submitted">Not Submitted</option>
        <option value="Submitted">Submitted</option>
      </select>
    );
  };

  // Modified handleSubmit to check for conflicts and validate fields
  const handleSubmit = () => {
    // Define all required fields
    const requiredFields = [
      // Funeral Mass Information
      'dateOfFuneralMass', 'timeOfFuneralMass',
      
      // Deceased Information
      'deceasedFirstName', 'deceasedLastName', 
      'deceasedSex', 'deceasedDateOfBirth', 'deceasedDateOfDeath',
      'causeOfDeath', 'wakeLocation', 'burialLocation',
      
      // Requester Information
      'requesterFirstName', 'requesterLastName',
      'relationship', 'contactNumber', 'email',
      
      // Address
      'barangay', 'street', 'municipality', 'province', 'region'
    ];
    
    // Check if any required field is empty
    const emptyFields = requiredFields.filter(field => !formData[field]);
    
    // Create validation errors object
    const errors = {};
    emptyFields.forEach(field => {
      errors[field] = true;
    });
    
    // Update validation states
    setValidationErrors(errors);
    
    if (emptyFields.length > 0) {
      setErrorMessage('Please fill in all required fields before submitting.');
      setShowErrorModal(true);
      
      // Scroll to the first error field
      const firstErrorField = document.querySelector(`.error-field`);
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    
    // Check if there are any scheduling conflicts
    const selectedDate = formData.dateOfFuneralMass;
    const selectedTime = formData.timeOfFuneralMass;
    
    const conflictingAppointment = existingFunerals.find(funeral => 
      funeral.dateOfFuneral === selectedDate && 
      funeral.timeOfFuneral === selectedTime
    );
    
    if (conflictingAppointment) {
      setErrorMessage('This schedule is already booked. Please select a different date or time.');
      setShowErrorModal(true);
      return;
    }
    
    // Clear validation errors if all fields are valid
    setValidationErrors({});
    
    // Continue with normal submission
    setShowModal(true);
  };

  const handleYes = async () => {
    setShowModal(false);
    setIsLoading(true);
    
    try {
      // Check for schedule conflicts
      const conflictingAppointment = existingFunerals.find(funeral => 
        funeral.dateOfFuneral === formData.dateOfFuneralMass && 
        funeral.timeOfFuneral === formData.timeOfFuneralMass
      );
      
      if (conflictingAppointment) {
        setIsLoading(false);
        setErrorMessage('This schedule is already booked. Please select a different date or time.');
        setShowErrorModal(true);
        return;
      }
      
      // Format dates for server
      let submitData = {...formData};
      
      // Convert dates to yyyy-mm-dd format if they exist
      if (submitData.deceasedDateOfBirth) {
        const parts = submitData.deceasedDateOfBirth.split('/');
        if (parts.length === 3) {
          const [day, month, year] = parts;
          submitData.deceasedDateOfBirth = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }
      }
      
      if (submitData.deceasedDateOfDeath) {
        const parts = submitData.deceasedDateOfDeath.split('/');
        if (parts.length === 3) {
          const [day, month, year] = parts;
          submitData.deceasedDateOfDeath = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }
      }
      
      // Create FormData object
      const formDataToSend = new FormData();
      
      // Add all form fields
      Object.keys(submitData).forEach(key => {
        formDataToSend.append(key, submitData[key]);
      });
      
      // Submit the form
      const response = await fetch('http://parishofdivinemercy.com/backend/sec_funeral_mass.php', {
        method: 'POST',
        body: formDataToSend
      });
      
      const data = await response.json();
      
      setIsLoading(false);
      
      if (data.success) {
        // Optionally send email
      
        
        setShowSuccessModal(true);
        setTimeout(() => {
          navigate('/secretary-appointment');
        }, 2000);
      } else {
        setErrorMessage(data.message || 'Failed to submit application');
        setShowErrorModal(true);
      }
    } catch (error) {
      setIsLoading(false);
      console.error('Error submitting form:', error);
      setErrorMessage('An error occurred while submitting the application');
      setShowErrorModal(true);
    }
  };

  return (
    <div className="client-funeral-container">
      {/* Header */}
      <div className="client-funeral-header">
        <div className="client-funeral-left-section">
          <button className="client-funeral-back-button" onClick={() => navigate(-1)}>
            <AiOutlineArrowLeft className="client-funeral-back-icon" /> Back
          </button>
        </div>
      </div>
      <h1 className="client-funeral-title">Funeral Mass Application Form</h1>
      
      {/* Funeral Mass Data Section */}
      <div className="client-funeral-data">
        <div className="client-funeral-row-date">
          <div className={`client-funeral-field-date ${validationErrors['dateOfFuneralMass'] ? 'error-field' : ''}`}>
            <label>Date of Funeral Mass<span className="required-marker">*</span></label>
            <select 
              value={formData.dateOfFuneralMass}
              onChange={(e) => handleInputChange('dateOfFuneralMass', e.target.value)}
            >
              <option value="">Select Date</option>
              {availableDates.map((date) => (
                <option key={date} value={date}>
                  {new Date(date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </option>
              ))}
            </select>
            {validationErrors['dateOfFuneralMass'] && <div className="error-message">Required</div>}
          </div>
          
          <div className={`client-funeral-field-time ${validationErrors['timeOfFuneralMass'] ? 'error-field' : ''}`}>
            <label>Time of Funeral Mass<span className="required-marker">*</span></label>
            <select 
              value={formData.timeOfFuneralMass}
              onChange={(e) => handleInputChange('timeOfFuneralMass', e.target.value)}
              disabled={!formData.dateOfFuneralMass}
            >
              <option value="">Select Time</option>
              {availableTimes.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
            {validationErrors['timeOfFuneralMass'] && <div className="error-message">Required</div>}
          </div>
        </div>
        
        {/* Deceased Information */}
        <div className="client-funeral-bypart">
          <h3 className="client-funeral-sub-title">Deceased Information</h3>
          <div className="client-funeral-row">
            <div className={`client-funeral-field ${validationErrors['deceasedFirstName'] ? 'error-field' : ''}`}>
              <label>First Name<span className="required-marker">*</span></label>
              <input 
                type="text" 
                value={formData.deceasedFirstName}
                onChange={(e) => handleInputChange('deceasedFirstName', e.target.value)}
              />
              {validationErrors['deceasedFirstName'] && <div className="error-message">Required</div>}
            </div>
            <div className="client-funeral-field">
              <label>Middle Name</label>
              <input 
                type="text"
                value={formData.deceasedMiddleName}
                onChange={(e) => handleInputChange('deceasedMiddleName', e.target.value)}
              />
            </div>
            <div className={`client-funeral-field ${validationErrors['deceasedLastName'] ? 'error-field' : ''}`}>
              <label>Last Name<span className="required-marker">*</span></label>
              <input 
                type="text"
                value={formData.deceasedLastName}
                onChange={(e) => handleInputChange('deceasedLastName', e.target.value)}
              />
              {validationErrors['deceasedLastName'] && <div className="error-message">Required</div>}
            </div>
          </div>

          <div className="client-funeral-row">
            <div className={`client-funeral-field ${validationErrors['deceasedDateOfBirth'] ? 'error-field' : ''}`}>
              <label>Date of Birth<span className="required-marker">*</span></label>
              <input 
                type="date"
                className="date-input" 
                value={formData.deceasedDateOfBirth}
                onChange={(e) => handleDateChange('deceasedDateOfBirth', e.target.value)}
              />
              {validationErrors['deceasedDateOfBirth'] && <div className="error-message">Required</div>}
            </div>
            <div className="client-funeral-field">
              <label>Age</label>
              <input 
                type="text"
                value={formData.deceasedAge}
                readOnly
              />
            </div>
            <div className={`client-funeral-field ${validationErrors['deceasedSex'] ? 'error-field' : ''}`}>
              <label>Gender<span className="required-marker">*</span></label>
              <select
                value={formData.deceasedSex}
                onChange={(e) => handleInputChange('deceasedSex', e.target.value)}
              >
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
              {validationErrors['deceasedSex'] && <div className="error-message">Required</div>}
            </div>
            <div className={`client-funeral-field ${validationErrors['deceasedDateOfDeath'] ? 'error-field' : ''}`}>
              <label>Date of Death<span className="required-marker">*</span></label>
              <input 
                type="date"
                className="date-input" 
                value={formData.deceasedDateOfDeath}
                onChange={(e) => handleDateChange('deceasedDateOfDeath', e.target.value)}
              />
              {validationErrors['deceasedDateOfDeath'] && <div className="error-message">Required</div>}
            </div>
          </div>
          
          <div className="client-funeral-row">
            <div className={`client-funeral-field ${validationErrors['causeOfDeath'] ? 'error-field' : ''}`}>
              <label>Cause of Death<span className="required-marker">*</span></label>
              <input 
                type="text"
                value={formData.causeOfDeath}
                onChange={(e) => handleInputChange('causeOfDeath', e.target.value)}
              />
              {validationErrors['causeOfDeath'] && <div className="error-message">Required</div>}
            </div>
          </div>
          
          <div className="client-funeral-row">
            <div className={`client-funeral-field location-dropdown-container ${validationErrors['wakeLocation'] ? 'error-field' : ''}`}>
              <label>Wake Location<span className="required-marker">*</span></label>
              <input
                type="text"
                value={formData.wakeLocation}
                onChange={handleWakeLocationChange}
                placeholder="Type to search (Barangay, Municipality, Province)"
                onFocus={() => setWakeSuggestions(filterLocations(formData.wakeLocation))}
                name="wakeLocation"
              />
              {validationErrors['wakeLocation'] && <div className="error-message">Required</div>}
              {wakeSuggestions.length > 0 && (
                <div className="location-dropdown">
                  {wakeSuggestions.map((location, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleSelectWakeLocation(location)}
                      className="location-dropdown-item"
                    >
                      {`${location.barangay}, ${location.municipality}, ${location.province}`}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="client-funeral-row">
            <div className={`client-funeral-field location-dropdown-container ${validationErrors['burialLocation'] ? 'error-field' : ''}`}>
              <label>Burial Location<span className="required-marker">*</span></label>
              <input
                type="text"
                value={formData.burialLocation}
                onChange={handleBurialLocationChange}
                placeholder="Type to search (Barangay, Municipality, Province)"
                onFocus={() => setBurialSuggestions(filterLocations(formData.burialLocation))}
                name="burialLocation"
              />
              {validationErrors['burialLocation'] && <div className="error-message">Required</div>}
              {burialSuggestions.length > 0 && (
                <div className="location-dropdown">
                  {burialSuggestions.map((location, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleSelectBurialLocation(location)}
                      className="location-dropdown-item"
                    >
                      {`${location.barangay}, ${location.municipality}, ${location.province}`}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Requester Information */}
          <h3 className="client-funeral-sub-title">Requester Information</h3>
          <div className="client-funeral-row">
            <div className={`client-funeral-field ${validationErrors['requesterFirstName'] ? 'error-field' : ''}`}>
              <label>First Name<span className="required-marker">*</span></label>
              <input 
                type="text"
                value={formData.requesterFirstName}
                onChange={(e) => handleInputChange('requesterFirstName', e.target.value)}
              />
              {validationErrors['requesterFirstName'] && <div className="error-message">Required</div>}
            </div>
            <div className="client-funeral-field">
              <label>Middle Name</label>
              <input 
                type="text"
                value={formData.requesterMiddleName}
                onChange={(e) => handleInputChange('requesterMiddleName', e.target.value)}
              />
            </div>
            <div className={`client-funeral-field ${validationErrors['requesterLastName'] ? 'error-field' : ''}`}>
              <label>Last Name<span className="required-marker">*</span></label>
              <input 
                type="text"
                value={formData.requesterLastName}
                onChange={(e) => handleInputChange('requesterLastName', e.target.value)}
              />
              {validationErrors['requesterLastName'] && <div className="error-message">Required</div>}
            </div>
          </div>
          
          <div className="client-funeral-row">
            <div className={`client-funeral-field ${validationErrors['relationship'] ? 'error-field' : ''}`}>
              <label>Relationship to the Deceased<span className="required-marker">*</span></label>
              <input 
                type="text"
                value={formData.relationship}
                onChange={(e) => handleInputChange('relationship', e.target.value)}
              />
              {validationErrors['relationship'] && <div className="error-message">Required</div>}
            </div>
            <div className={`client-funeral-field ${validationErrors['contactNumber'] ? 'error-field' : ''}`}>
              <label>Contact Number<span className="required-marker">*</span></label>
              <input 
                type="text"
                value={formData.contactNumber}
                onChange={(e) => handleInputChange('contactNumber', e.target.value)}
              />
              {validationErrors['contactNumber'] && <div className="error-message">Required</div>}
            </div>
            <div className={`client-funeral-field ${validationErrors['email'] ? 'error-field' : ''}`}>
              <label>Email Address<span className="required-marker">*</span></label>
              <input 
                type="text"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
              />
              {validationErrors['email'] && <div className="error-message">Required</div>}
            </div>
          </div>
          
          {/* Address Fields */}
          <h3 className="client-funeral-sub-title">Address</h3>
          <div className="client-funeral-row client-funeral-address-row">
          <div className={`client-funeral-field ${validationErrors['street'] ? 'error-field' : ''}`}>
              <label>Street<span className="required-marker">*</span></label>
              <input 
                type="text"
                value={formData.street}
                onChange={(e) => handleInputChange('street', e.target.value)}
              />
              {validationErrors['street'] && <div className="error-message">Required</div>}
            </div>
            <div className={`client-funeral-field location-dropdown-container ${validationErrors['barangay'] ? 'error-field' : ''}`}>
              <label>Barangay<span className="required-marker">*</span></label>
              <input 
                type="text"
                value={formData.barangay}
                onChange={handleBarangayChange}
                onFocus={() => handleFocus('barangay')}
                placeholder="Type to search"
                name="barangay"
              />
              {validationErrors['barangay'] && <div className="error-message">Required</div>}
              {focusedField === 'barangay' && suggestions.barangay.length > 0 && (
                <div className="location-dropdown">
                  {suggestions.barangay.map((barangay, index) => (
                    <div 
                      key={index}
                      onClick={() => handleSelectBarangay(barangay)}
                      className="location-dropdown-item"
                    >
                      {barangay}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className={`client-funeral-field location-dropdown-container ${validationErrors['municipality'] ? 'error-field' : ''}`}>
              <label>Municipality<span className="required-marker">*</span></label>
              <input 
                type="text"
                value={formData.municipality}
                onChange={handleMunicipalityChange}
                onFocus={() => handleFocus('municipality')}
                placeholder="Type to search"
                name="municipality"
              />
              {validationErrors['municipality'] && <div className="error-message">Required</div>}
              {focusedField === 'municipality' && suggestions.municipality.length > 0 && (
                <div className="location-dropdown">
                  {suggestions.municipality.map((municipality, index) => (
                    <div 
                      key={index}
                      onClick={() => handleSelectMunicipality(municipality)}
                      className="location-dropdown-item"
                    >
                      {municipality}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className={`client-funeral-field location-dropdown-container ${validationErrors['province'] ? 'error-field' : ''}`}>
              <label>Province<span className="required-marker">*</span></label>
              <input 
                type="text"
                value={formData.province}
                onChange={handleProvinceChange}
                onFocus={() => handleFocus('province')}
                placeholder="Type to search"
                name="province"
              />
              {validationErrors['province'] && <div className="error-message">Required</div>}
              {focusedField === 'province' && suggestions.province.length > 0 && (
                <div className="location-dropdown">
                  {suggestions.province.map((province, index) => (
                    <div 
                      key={index}
                      onClick={() => handleSelectProvince(province)}
                      className="location-dropdown-item"
                    >
                      {province}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* New Region Field */}
            <div className={`client-funeral-field location-dropdown-container ${validationErrors['region'] ? 'error-field' : ''}`}>
              <label>Region<span className="required-marker">*</span></label>
              <input 
                type="text"
                value={formData.region}
                onChange={handleRegionChange}
                onFocus={() => handleFocus('region')}
                placeholder="Type to search"
                name="region"
              />
              {validationErrors['region'] && <div className="error-message">Required</div>}
              {focusedField === 'region' && suggestions.region.length > 0 && (
                <div className="location-dropdown">
                  {suggestions.region.map((region, index) => (
                    <div 
                      key={index}
                      onClick={() => handleSelectRegion(region)}
                      className="location-dropdown-item"
                    >
                      {region}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Requirements section */}
        <div className="client-funeral-requirements-container">
          <h2 className="client-funeral-requirements-title">Requirements</h2>
          
          {/* Error summary for documents */}
          {documentErrors.length > 0 && (
            <div className="client-funeral-error-summary">
              <p>The following required documents need to be uploaded and submitted:</p>
              <ul>
                {documentErrors.map(doc => (
                  <li key={doc}>{doc.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="client-funeral-requirements-box">
            <h3 className="client-funeral-section-header">Documents Needed</h3>
            <div className="client-funeral-info-list">
              <div className="client-funeral-info-item">
                <p>Certificate of Death</p>
              </div>
              <div className="client-funeral-info-item">
                <p>Parish Clearance</p>
              </div>
              <div className="client-funeral-info-item">
                <p>Permit to Bury</p>
              </div>
              <div className="client-funeral-info-item">
                <p>Certificate of Permission(if outside the Parish)</p>
              </div>
            </div>
            <h3 className="client-funeral-section-header">Funeral Setup Requirements</h3>
            <div className="client-funeral-info-list">
              <div className="client-funeral-info-item">
                <p>Photos/memorial table allowed with limitations (not on the altar)</p>
              </div>
              <div className="client-funeral-info-item">
                <p>Eulogies may be given before/after the Mass or at the cemetery</p>
              </div>
              <div className="client-funeral-info-item">
                <p>Family and guests should wear respectful and modest attire</p>
              </div>
              <div className="client-funeral-info-item">
                <p>No loud music, applause, or improper conduct during the Mass</p>
              </div>
            </div>
          </div>
        </div>
 
        <div className="client-funeral-button-container">
          <button className="client-funeral-submit-btn" onClick={handleSubmit}>Submit</button>
          <button className="client-funeral-cancel-btn" onClick={() => navigate(-1)}>Cancel</button>
        </div>
      </div>
 
      {/* Submit Confirmation Modal */}
      {showModal && (
        <div className="client-funeral-modal-overlay">
          <div className="client-funeral-modal">
            <h2>Submit Application</h2>
            <hr className="client-funeral-custom-hr" />
            <p>Are you sure you want to submit your Funeral Mass application?</p>
            <div className="client-funeral-modal-buttons">
              <button className="client-funeral-yes-btn" onClick={handleYes}>Yes</button>
              <button className="client-funeral-modal-no-btn" onClick={() => setShowModal(false)}>No</button>
            </div>
          </div>
        </div>
      )}
 
      {/* Success Modal */}
      {showSuccessModal && (
        <div className="client-funeral-modal-overlay">
          <div className="client-funeral-modal">
            <h2>Success</h2>
            <hr className="client-funeral-custom-hr" />
            <p>Your Funeral Mass application has been submitted successfully!</p>
            <div className="client-funeral-modal-buttons">
              <button className="client-funeral-yes-btn" onClick={() => setShowSuccessModal(false)}>OK</button>
            </div>
          </div>
        </div>
      )}
 
      {/* Error Modal */}
      {showErrorModal && (
        <div className="client-funeral-modal-overlay">
          <div className="client-funeral-modal">
            <h2>Error</h2>
            <hr className="client-funeral-custom-hr" />
            <p>{errorMessage}</p>
            <div className="client-funeral-modal-buttons">
              <button className="client-funeral-modal-no-btn" onClick={() => setShowErrorModal(false)}>OK</button>
            </div>
          </div>
        </div>
      )}

      {/* Loading Modal */}
      {isLoading && (
        <div className="client-funeral-modal-overlay">
          <div className="client-funeral-modal">
            <h2>Processing Application</h2>
            <hr className="client-funeral-custom-hr" />
            <p>Please wait while we submit your funeral mass application...</p>
            <div className="client-funeral-loading-spinner">
              <div className="client-funeral-spinner"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
 };
 
 export default FuneralMass;