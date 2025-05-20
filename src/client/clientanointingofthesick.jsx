import React, { useState, useRef, useEffect } from "react";
import { AiOutlineArrowLeft, AiOutlineCheck, AiOutlineUpload, AiOutlineClose } from "react-icons/ai";
import { useLocation, useNavigate } from "react-router-dom";
import "./ClientAnointingOfTheSick.css";
import axios from 'axios';

const ClientAnointingOfTheSick = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {clientID} = location.state || {};
  console.log('Received clientID:', clientID);
 
  // State for form validation
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  // State for form data
  const [formData, setFormData] = useState({
    // Anointing Information
    dateOfAnointing: '',
    timeOfAnointing: '',
    
    // Sick Person Information
    firstName: '',
    middleName: '',
    lastName: '',
    sex: '',
    age: '',
    dateOfBirth: '',
    placeOfBirth: '',
    religion: '',
    reasonForAnointing: '',
    
    // Contact Person Information
    contactFirstName: '',
    contactMiddleName: '',
    contactLastName: '',
    contactRelationship: '',
    contactPhone: '',
    contactEmail: '',
    
    // Location Information
    locationType: 'Hospital', // 'Hospital', 'Home', 'Hospice', 'Nursing Home', 'Other'
    locationName: '',
    roomNumber: '',
    
    // Address
    barangay: '',
    street: '',
    municipality: '',
    province: '',
    locationRegion: '', // Added location region
    
    // Additional Information
    isCritical: false,
    needsViaticum: false,
    needsReconciliation: false,
    additionalNotes: ''
  });

  // States for location data
  const [locationData, setLocationData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [focusedField, setFocusedField] = useState(null);
  const [suggestions, setSuggestions] = useState({
    barangay: [],
    municipality: [],
    province: [],
    region: [], // For all region suggestions
    regionOfBirth: [], // Specific for birth region
    birthBarangay: [],
    birthMunicipality: [],
    birthProvince: [],
    placeOfBirth: [] // Add this new field for combined place of birth
  });

  // States for dropdown data
  const [schedules, setSchedules] = useState([]);
  const [priests, setPriests] = useState([]);

  // State for unique dates and filtered schedules
  const [uniqueDates, setUniqueDates] = useState([]);
  const [filteredTimes, setFilteredTimes] = useState([]);
  const [filteredPriests, setFilteredPriests] = useState([]);

  // State for existing anointing applications
  const [existingAnointings, setExistingAnointings] = useState([]);

  // State to track uploaded files and their status
  const [uploadedFiles, setUploadedFiles] = useState({});
  const [uploadStatus, setUploadStatus] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Refs for file inputs - only 2 documents needed
  const fileInputRefs = {
    'medical_cert': useRef(null),
    'valid_ids': useRef(null)
  };

  // Add new state for birth location components
  const [birthFields, setBirthFields] = useState({
    barangay: '',
    municipality: '',
    province: ''
  });

  // Fetch all necessary data on component mount
  useEffect(() => {
    fetchAnointingSchedules();
    fetchPriests();
    fetchLocations();
  }, []);

  // Fetch existing anointing applications
  const fetchExistingAnointings = async () => {
    try {
      const response = await fetch('http://parishofdivinemercy.com/backend/get_anointing_applications.php');
      const data = await response.json();
      if (data.success) {
        setExistingAnointings(data.applications);
      }
    } catch (error) {
      console.error('Error fetching existing anointings:', error);
    }
  };

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

  // Fetch anointing schedules and process unique dates
  const fetchAnointingSchedules = async () => {
    try {
      const [schedulesResponse, anointingsResponse] = await Promise.all([
        fetch('http://parishofdivinemercy.com/backend/schedule.php'),
        fetch('http://parishofdivinemercy.com/backend/get_anointing_applications.php')
      ]);
      
      const scheduleData = await schedulesResponse.json();
      const anointingData = await anointingsResponse.json();
      
      if (scheduleData.success) {
        // Filter only anointing schedules
        const anointingSchedules = scheduleData.schedules.filter(
          schedule => schedule.sacramentType.toLowerCase() === 'anointing of the sick and viaticum'
        );
        
        // Get existing anointing applications
        const existingAnointingSet = new Set();
        if (anointingData.success) {
          anointingData.applications.forEach(app => {
            existingAnointingSet.add(`${app.dateOfAnointing}-${app.timeOfAnointing}-${app.priestName}`);
          });
        }

        // Filter out already booked schedules
        const availableSchedules = anointingSchedules.filter(schedule => {
          const key = `${schedule.date}-${schedule.time}-${schedule.parishName}`;
          return !existingAnointingSet.has(key);
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
      console.error('Error fetching schedules:', error);
    }
  };

  // Fetch priests from parish.php
  const fetchPriests = async () => {
    try {
      const response = await fetch('http://parishofdivinemercy.com/backend/parish.php');
      const data = await response.json();
      
      if (data.success) {
        setPriests(data.parishes);
      } else {
        console.error('Error fetching priests:', data.message);
      }
    } catch (error) {
      console.error('Error fetching priests:', error);
    }
  };

  // Update available times when date is selected
  useEffect(() => {
    if (formData.dateOfAnointing) {
      const timesForDate = schedules
        .filter(schedule => schedule.date === formData.dateOfAnointing)
        .map(schedule => schedule.time);
      
      // Remove duplicates
      const uniqueTimes = [...new Set(timesForDate)];
      setFilteredTimes(uniqueTimes);
      
      // Clear time and priest if they're not available for the new date
      if (!uniqueTimes.includes(formData.timeOfAnointing)) {
        setFormData(prev => ({
          ...prev,
          timeOfAnointing: '',
          priestName: ''
        }));
      }
    } else {
      setFilteredTimes([]);
    }
  }, [formData.dateOfAnointing, schedules]);

  // Update available priests when date and time are selected
  useEffect(() => {
    if (formData.dateOfAnointing && formData.timeOfAnointing) {
      const priestsForDateTime = schedules
        .filter(schedule => 
          schedule.date === formData.dateOfAnointing && 
          schedule.time === formData.timeOfAnointing
        )
        .map(schedule => schedule.parishName);
      
      // Remove duplicates
      const uniquePriests = [...new Set(priestsForDateTime)];
      setFilteredPriests(uniquePriests);
      
      // Clear priest if not available for the new date/time
      if (!uniquePriests.includes(formData.priestName)) {
        setFormData(prev => ({
          ...prev,
          priestName: ''
        }));
      }
    } else {
      setFilteredPriests([]);
    }
  }, [formData.dateOfAnointing, formData.timeOfAnointing, schedules]);

  // Enhanced filter functions to consider the other fields
  const filterBarangays = (input, municipality = null, province = null) => {
    const inputLower = input.toLowerCase();
    let filtered = locationData;

    // If municipality is provided, filter by municipality
    if (municipality && municipality.trim() !== '') {
      filtered = filtered.filter(location => location.municipality === municipality);
    }
    
    // If province is provided, filter by province
    if (province && province.trim() !== '') {
      filtered = filtered.filter(location => location.province === province);
    }
    
    // Extract unique barangays and filter by input
    return [...new Set(filtered.map(loc => loc.barangay))]
      .filter(barangay => barangay.toLowerCase().includes(inputLower))
      .sort();
  };

  const filterMunicipalities = (input, province = null) => {
    const inputLower = input.toLowerCase();
    let filtered = locationData;
    
    // If province is provided, filter by province
    if (province && province.trim() !== '') {
      filtered = filtered.filter(location => location.province === province);
    }
    
    // Extract unique municipalities and filter by input
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

  // New filter function for regions
  const filterRegions = (input) => {
    const inputLower = input.toLowerCase();
    // Assuming we have regions in the location data. If not, use a static list
    const regions = [
      'NCR - National Capital Region',
      'CAR - Cordillera Administrative Region',
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
      'BARMM - Bangsamoro Autonomous Region in Muslim Mindanao'
    ];
    
    return regions.filter(region => region.toLowerCase().includes(inputLower));
  };

  // Add a filter method for birth places
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

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle date changes to store in yyyy-mm-dd format
  const handleDateChange = (field, value) => {
    if (!value) {
      handleInputChange(field, '');
      return;
    }
    
    // Just store the date in yyyy-mm-dd format directly
    handleInputChange(field, value);
    
    // Calculate age automatically if this is the date of birth field
    if (field === 'dateOfBirth') {
      const birthDate = new Date(value);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      // Adjust age if birth month hasn't occurred yet this year
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      handleInputChange('age', age.toString());
    }
  };

  // Handle checkbox changes
  const handleCheckboxChange = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  // Updated handlers to filter based on other fields
  const handleBarangayChange = (e) => {
    const value = e.target.value;
    handleInputChange('barangay', value);
    
    if (focusedField === 'barangay') {
      // Filter barangays based on municipality and province if they exist
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
      // Filter municipalities based on province if it exists
      setSuggestions({
        ...suggestions,
        municipality: filterMunicipalities(value, formData.province)
      });
    }
    
    // If typing a municipality, check if it has a province
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

  // New handlers for region fields
  const handleRegionOfBirthChange = (e) => {
    const value = e.target.value;
    handleInputChange('regionOfBirth', value);
    
    if (focusedField === 'regionOfBirth') {
      setSuggestions({
        ...suggestions,
        regionOfBirth: filterRegions(value)
      });
    }
  };

  const handleLocationRegionChange = (e) => {
    const value = e.target.value;
    handleInputChange('locationRegion', value);
    
    if (focusedField === 'locationRegion') {
      setSuggestions({
        ...suggestions,
        region: filterRegions(value)
      });
    }
  };

  // Updated selection handlers
  const handleSelectBarangay = (barangay) => {
    handleInputChange('barangay', barangay);
    setFocusedField(null);
    
    // Check if this barangay has a specific municipality and province
    const matchedLocation = locationData.find(loc => loc.barangay === barangay);
    if (matchedLocation) {
      if (!formData.municipality) {
        handleInputChange('municipality', matchedLocation.municipality);
      }
      if (!formData.province) {
        handleInputChange('province', matchedLocation.province);
      }
    }
  };

  const handleSelectMunicipality = (municipality) => {
    handleInputChange('municipality', municipality);
    
    // Find the province for this municipality
    const matchedLocation = locationData.find(loc => loc.municipality === municipality);
    if (matchedLocation && !formData.province) {
      handleInputChange('province', matchedLocation.province);
    }
    
    setFocusedField(null);
  };

  const handleSelectProvince = (province) => {
    handleInputChange('province', province);
    setFocusedField(null);
  };

  // New selection handlers for regions
  const handleSelectRegionOfBirth = (region) => {
    handleInputChange('regionOfBirth', region);
    setFocusedField(null);
  };

  const handleSelectLocationRegion = (region) => {
    handleInputChange('locationRegion', region);
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
          birthMunicipality: filterMunicipalities(birthFields.municipality, birthFields.province) 
        }));
        break;
      case 'birthProvince':
        setSuggestions(prev => ({ 
          ...prev, 
          birthProvince: filterProvinces(birthFields.province) 
        }));
        break;
      case 'placeOfBirth':
        setSuggestions(prev => ({ 
          ...prev, 
          placeOfBirth: filterBirthPlaces(formData.placeOfBirth) 
        }));
        break;
      case 'barangay':
        setSuggestions({
          ...suggestions,
          barangay: filterBarangays(formData.barangay, formData.municipality, formData.province)
        });
        break;
      case 'municipality':
        setSuggestions({
          ...suggestions,
          municipality: filterMunicipalities(formData.municipality, formData.province)
        });
        break;
      case 'province':
        setSuggestions({
          ...suggestions,
          province: filterProvinces(formData.province)
        });
        break;
      case 'regionOfBirth':
        setSuggestions({
          ...suggestions,
          regionOfBirth: filterRegions(formData.regionOfBirth)
        });
        break;
      case 'locationRegion':
        setSuggestions({
          ...suggestions,
          region: filterRegions(formData.locationRegion)
        });
        break;
      default:
        break;
    }
  };

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      const autocompleteContainers = document.querySelectorAll('.aos-location-dropdown-container');
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

  // Function to trigger file input click
  const triggerFileUpload = (requirementId) => {
    if (fileInputRefs[requirementId] && fileInputRefs[requirementId].current) {
      fileInputRefs[requirementId].current.click();
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
      
      // Clear any errors for this requirement
      if (errors[requirementId]) {
        const newErrors = {...errors};
        delete newErrors[requirementId];
        setErrors(newErrors);
      }
    }, 1000);
  };

  // Handle requirement checkbox click - allow unchecking to clear files
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
      
      // Add validation error for this requirement if the form was already submitted once
      if (submitted) {
        setErrors({
          ...errors,
          [requirementId]: 'This document is required'
        });
      }
    }
    // If not submitted, trigger file upload
    else {
      triggerFileUpload(requirementId);
    }
  };

  // Render upload status selector
  const renderStatusSelector = (requirementId) => {
    const status = uploadStatus[requirementId] || "Not Submitted";
    const isSubmitted = status === "Submitted";
    const isUploading = status === "Uploading...";
    
    return (
      <select 
        className={`aos-status-dropdown ${
          isSubmitted ? 'aos-status-submitted' : 
          isUploading ? 'aos-status-uploading' :
          'aos-status-not-submitted'
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
            
            // Add validation error for this requirement if the form was already submitted once
            if (submitted) {
              setErrors({
                ...errors,
                [requirementId]: 'This document is required'
              });
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

  // Add validate form function before the handleSubmit function
  const validateForm = () => {
    const newErrors = {};
    
    // Required fields validation
    const requiredFields = [
      'dateOfAnointing', 'timeOfAnointing',
      'firstName', 'lastName', 'sex', 'dateOfBirth',
      'contactFirstName', 'contactLastName', 'contactPhone',
      'barangay', 'street', 'municipality', 'province'
    ];
    
    requiredFields.forEach(field => {
      if (!formData[field] || formData[field].trim() === '') {
        newErrors[field] = 'This field is required';
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Function to handle form submission
  const handleSubmit = () => {
    setSubmitted(true);
    if (validateForm()) {
      setShowModal(true);
    } else {
      window.scrollTo(0, 0);
    }
  };

  const handleYes = async () => {
    setShowModal(false);
    setIsLoading(true);
    
    try {
      // Create formData object for submission
      const formDataToSend = new FormData();
      
      // Add client ID
      formDataToSend.append('clientID', clientID);
      
      // Add the form data as JSON
      formDataToSend.append('anointingData', JSON.stringify(formData));
      
      // Submit the form
      const response = await fetch('http://parishofdivinemercy.com/backend/anointing_application.php', {
        method: 'POST',
        body: formDataToSend
      });
      
      const data = await response.json();
      setIsLoading(false);
      
      if (data.success) {
        // Optionally send email notification
        try {
          const emailResponse = await fetch('http://parishofdivinemercy.com/backend/send_anointing_email.php', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              clientID: clientID,
              anointingData: formData
            })
          });
          
          console.log('Email response:', await emailResponse.json());
        } catch (emailError) {
          console.error('Error sending email:', emailError);
        }
        
        setShowSuccessModal(true);
        setTimeout(() => {
          navigate('/client-appointment');
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

  // Add handlers for birth place fields
  const handleBirthBarangayChange = (e) => {
    const value = e.target.value;
    setBirthFields(prev => ({...prev, barangay: value}));
    updatePlaceOfBirth({...birthFields, barangay: value});
    
    if (focusedField === 'birthBarangay') {
      setSuggestions(prev => ({ 
        ...prev, 
        birthBarangay: filterBarangays(value, birthFields.municipality, birthFields.province) 
      }));
    }
  };

  const handleBirthMunicipalityChange = (e) => {
    const value = e.target.value;
    setBirthFields(prev => ({...prev, municipality: value}));
    updatePlaceOfBirth({...birthFields, municipality: value});
    
    if (focusedField === 'birthMunicipality') {
      setSuggestions(prev => ({ 
        ...prev, 
        birthMunicipality: filterMunicipalities(value, birthFields.province) 
      }));
    }
    
    // If typing a municipality, check if it has a province
    if (value) {
      const matchedLocation = locationData.find(loc => 
        loc.municipality.toLowerCase() === value.toLowerCase()
      );
      if (matchedLocation && !birthFields.province) {
        setBirthFields(prev => ({...prev, province: matchedLocation.province}));
        updatePlaceOfBirth({...birthFields, municipality: value, province: matchedLocation.province});
      }
    }
  };

  const handleBirthProvinceChange = (e) => {
    const value = e.target.value;
    setBirthFields(prev => ({...prev, province: value}));
    updatePlaceOfBirth({...birthFields, province: value});
    
    if (focusedField === 'birthProvince') {
      setSuggestions(prev => ({ 
        ...prev, 
        birthProvince: filterProvinces(value) 
      }));
    }
  };

  // Add select handlers for place of birth dropdowns
  const handleSelectBirthBarangay = (barangay) => {
    setBirthFields(prev => ({...prev, barangay}));
    updatePlaceOfBirth({...birthFields, barangay});
    setFocusedField(null);
    
    // Check if this barangay has a specific municipality and province
    const matchedLocation = locationData.find(loc => loc.barangay === barangay);
    if (matchedLocation) {
      if (!birthFields.municipality) {
        setBirthFields(prev => ({...prev, municipality: matchedLocation.municipality}));
        updatePlaceOfBirth({...birthFields, barangay, municipality: matchedLocation.municipality});
      }
      if (!birthFields.province) {
        setBirthFields(prev => ({...prev, province: matchedLocation.province}));
        updatePlaceOfBirth({...birthFields, barangay, province: matchedLocation.province});
      }
    }
  };

  const handleSelectBirthMunicipality = (municipality) => {
    setBirthFields(prev => ({...prev, municipality}));
    updatePlaceOfBirth({...birthFields, municipality});
    
    // Find the province for this municipality
    const matchedLocation = locationData.find(loc => loc.municipality === municipality);
    if (matchedLocation && !birthFields.province) {
      setBirthFields(prev => ({...prev, province: matchedLocation.province}));
      updatePlaceOfBirth({...birthFields, municipality, province: matchedLocation.province});
    }
    
    setFocusedField(null);
  };

  const handleSelectBirthProvince = (province) => {
    setBirthFields(prev => ({...prev, province}));
    updatePlaceOfBirth({...birthFields, province});
    setFocusedField(null);
  };

  // Helper to update the placeOfBirth field with formatted address
  const updatePlaceOfBirth = (fields) => {
    const { barangay, municipality, province } = fields;
    const parts = [];
    
    if (barangay) parts.push(barangay);
    if (municipality) parts.push(municipality);
    if (province) parts.push(province);
    
    const formattedPlace = parts.join(', ');
    handleInputChange('placeOfBirth', formattedPlace);
  };

  // Add handlers for place of birth combined field
  const handlePlaceOfBirthChange = (e) => {
    const value = e.target.value;
    handleInputChange('placeOfBirth', value);
    
    if (focusedField === 'placeOfBirth') {
      setSuggestions(prev => ({ 
        ...prev, 
        placeOfBirth: filterBirthPlaces(value) 
      }));
    }
  };

  const handleSelectPlaceOfBirth = (location) => {
    const formattedPlace = `${location.barangay}, ${location.municipality}, ${location.province}`;
    handleInputChange('placeOfBirth', formattedPlace);
    setFocusedField(null);
  };

  return (
    <div className="aos-container">
      {/* Header */}
      <div className="aos-header">
        <div className="aos-left-section">
          <button className="aos-back-button" onClick={() => navigate(-1)}>
            <AiOutlineArrowLeft className="aos-back-icon" /> Back
          </button>
        </div>
      </div>
      <h1 className="aos-title">Anointing of the Sick and Viaticum Application</h1>
      
      <div className="aos-data">
        {submitted && Object.keys(errors).length > 0 && (
          <div className="aos-error-message">
            Please fill in all required fields marked with (*).
          </div>
        )}
      
        <div className="aos-row-date">
          <div className="aos-field-date">
            <label>Date of Appointment <span className="required">*</span></label>
            <select 
              value={formData.dateOfAnointing}
              onChange={(e) => handleInputChange('dateOfAnointing', e.target.value)}
              className={submitted && errors.dateOfAnointing ? 'input-error' : ''}
            >
              <option value="">Select Date</option>
              {uniqueDates.map((date) => (
                <option key={date} value={date}>
                  {new Date(date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </option>
              ))}
            </select>
          </div>
          
          <div className="aos-field-time">
            <label>Time of Appointment <span className="required">*</span></label>
            <select 
              value={formData.timeOfAnointing}
              onChange={(e) => handleInputChange('timeOfAnointing', e.target.value)}
              disabled={!formData.dateOfAnointing}
              className={submitted && errors.timeOfAnointing ? 'input-error' : ''}
            >
              <option value="">Select Time</option>
              {filteredTimes.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="aos-section">
          <h3 className="aos-sub-title">Sick Person Information</h3>
          <div className="aos-row">
            <div className="aos-field">
              <label>First Name of the Sick Person <span className="required">*</span></label>
              <input 
                type="text" 
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                className={submitted && errors.firstName ? 'input-error' : ''}
              />
            </div>
            <div className="aos-field">
              <label>Middle Name</label>
              <input 
                type="text"
                value={formData.middleName}
                onChange={(e) => handleInputChange('middleName', e.target.value)}
              />
            </div>
            <div className="aos-field">
              <label>Last Name <span className="required">*</span></label>
              <input 
                type="text"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                className={submitted && errors.lastName ? 'input-error' : ''}
              />
            </div>
            <div className="aos-field">
              <label>Date of Birth <span className="required">*</span></label>
              <input 
                type="date"
                className={`date-input ${submitted && errors.dateOfBirth ? 'input-error' : ''}`}
                onChange={(e) => handleDateChange('dateOfBirth', e.target.value)}
              />
            </div>
          </div>
          <div className="aos-row">
          <div className="aos-field-ga">
              <label>Age</label>
              <input 
                type="text"
                value={formData.age}
                onChange={(e) => handleInputChange('age', e.target.value)}
                readOnly
              />
            </div>
            <div className="aos-field-ga">
              <label>Sex <span className="required">*</span></label>
              <select 
                value={formData.sex}
                onChange={(e) => handleInputChange('sex', e.target.value)}
                className={submitted && errors.sex ? 'input-error' : ''}
              >
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div className="aos-field aos-location-dropdown-container">
              <label>Place of Birth</label>
              <input 
                type="text"
                placeholder="Type to search (Barangay, Municipality, Province)"
                value={formData.placeOfBirth}
                onChange={handlePlaceOfBirthChange}
                onFocus={() => handleFocus('placeOfBirth')}
              />
              {focusedField === 'placeOfBirth' && suggestions.placeOfBirth && suggestions.placeOfBirth.length > 0 && (
                <div className="aos-location-dropdown">
                  {suggestions.placeOfBirth.map((location, index) => (
                    <div 
                      key={index}
                      onClick={() => handleSelectPlaceOfBirth(location)}
                      className="aos-location-dropdown-item"
                    >
                      {`${location.barangay}, ${location.municipality}, ${location.province}`}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="aos-field">
              <label>Religion</label>
              <input 
                type="text"
                value={formData.religion}
                onChange={(e) => handleInputChange('religion', e.target.value)}
              />
            </div>
          </div>

          <div className="aos-row">
            <div className="aos-field-wide">
              <label>Reason for Anointing (Medical Condition)</label>
              <textarea 
                value={formData.reasonForAnointing}
                onChange={(e) => handleInputChange('reasonForAnointing', e.target.value)}
                rows={3}
                placeholder="Please describe the medical condition or reason for requesting the sacrament"
              />
            </div>
          </div>

          {/* Contact Person Information */}
          <h3 className="aos-sub-title">Contact Person Information</h3>
          <div className="aos-row">
            <div className="aos-field">
              <label>Contact Person's First Name <span className="required">*</span></label>
              <input 
                type="text"
                value={formData.contactFirstName}
                onChange={(e) => handleInputChange('contactFirstName', e.target.value)}
                className={submitted && errors.contactFirstName ? 'input-error' : ''}
              />
            </div>
            <div className="aos-field">
              <label>Middle Name</label>
              <input 
                type="text"
                value={formData.contactMiddleName}
                onChange={(e) => handleInputChange('contactMiddleName', e.target.value)}
              />
            </div>
            <div className="aos-field">
              <label>Last Name <span className="required">*</span></label>
              <input 
                type="text"
                value={formData.contactLastName}
                onChange={(e) => handleInputChange('contactLastName', e.target.value)}
                className={submitted && errors.contactLastName ? 'input-error' : ''}
              />
            </div>
          </div>
          <div className="aos-row">
            <div className="aos-field">
              <label>Relationship to Sick Person</label>
              <input 
                type="text"
                value={formData.contactRelationship}
                onChange={(e) => handleInputChange('contactRelationship', e.target.value)}
              />
            </div>
            <div className="aos-field">
              <label>Phone Number <span className="required">*</span></label>
              <input 
                type="text"
                value={formData.contactPhone}
                onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                className={submitted && errors.contactPhone ? 'input-error' : ''}
              />
            </div>
            <div className="aos-field">
              <label>Email Address</label>
              <input 
                type="email"
                value={formData.contactEmail}
                onChange={(e) => handleInputChange('contactEmail', e.target.value)}
              />
            </div>
            </div>
             {/* Location Information */}
          <h3 className="aos-sub-title">Location Information</h3>
          <div className="aos-row">
            <div className="aos-field">
              <label>Location Type</label>
              <select
                value={formData.locationType}
                onChange={(e) => handleInputChange('locationType', e.target.value)}
              >
                <option value="Hospital">Hospital</option>
                <option value="Home">Home</option>
                <option value="Hospice">Hospice</option>
                <option value="Nursing Home">Nursing Home</option>
                <option value="Other">Other</option>
              </select>
            </div>
            
            <div className="aos-field">
              <label>Location Name</label>
              <input 
                type="text"
                value={formData.locationName}
                onChange={(e) => handleInputChange('locationName', e.target.value)}
                placeholder="Name of hospital, hospice, etc."
              />
            </div>
            
            <div className="aos-field">
              <label>Room/Room Number</label>
              <input 
                type="text"
                value={formData.roomNumber}
                onChange={(e) => handleInputChange('roomNumber', e.target.value)}
              />
            </div>
          </div>
          

          {/* Address Fields */}
          <div className="aos-row aos-address-row">
          <div className="aos-field">
              <label>Street <span className="required">*</span></label>
              <input 
                type="text"
                value={formData.street}
                onChange={(e) => handleInputChange('street', e.target.value)}
                className={submitted && errors.street ? 'input-error' : ''}
              />
            </div>
            <div className="aos-field aos-location-dropdown-container">
              <label>Barangay <span className="required">*</span></label>
              <input 
                type="text"
                value={formData.barangay}
                onChange={handleBarangayChange}
                onFocus={() => handleFocus('barangay')}
                placeholder="Type to search"
                className={submitted && errors.barangay ? 'input-error' : ''}
              />
              {focusedField === 'barangay' && suggestions.barangay.length > 0 && (
                <div className="aos-location-dropdown">
                  {suggestions.barangay.map((barangay, index) => (
                    <div 
                      key={index}
                      onClick={() => handleSelectBarangay(barangay)}
                      className="aos-location-dropdown-item"
                    >
                      {barangay}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="aos-field aos-location-dropdown-container">
              <label>Municipality <span className="required">*</span></label>
              <input 
                type="text"
                value={formData.municipality}
                onChange={handleMunicipalityChange}
                onFocus={() => handleFocus('municipality')}
                placeholder="Type to search"
                className={submitted && errors.municipality ? 'input-error' : ''}
              />
              {focusedField === 'municipality' && suggestions.municipality.length > 0 && (
                <div className="aos-location-dropdown">
                  {suggestions.municipality.map((municipality, index) => (
                    <div 
                      key={index}
                      onClick={() => handleSelectMunicipality(municipality)}
                      className="aos-location-dropdown-item"
                    >
                      {municipality}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="aos-field aos-location-dropdown-container">
              <label>Province <span className="required">*</span></label>
              <input 
                type="text"
                value={formData.province}
                onChange={handleProvinceChange}
                onFocus={() => handleFocus('province')}
                placeholder="Type to search"
                className={submitted && errors.province ? 'input-error' : ''}
              />
              {focusedField === 'province' && suggestions.province.length > 0 && (
                <div className="aos-location-dropdown">
                  {suggestions.province.map((province, index) => (
                    <div 
                      key={index}
                      onClick={() => handleSelectProvince(province)}
                      className="aos-location-dropdown-item"
                    >
                      {province}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="aos-field aos-location-dropdown-container">
              <label>Region</label>
              <input 
                type="text"
                value={formData.locationRegion}
                onChange={handleLocationRegionChange}
                onFocus={() => handleFocus('locationRegion')}
                placeholder="Type to search"
              />
              {focusedField === 'locationRegion' && suggestions.region.length > 0 && (
                <div className="aos-location-dropdown">
                  {suggestions.region.map((region, index) => (
                    <div 
                      key={index}
                      onClick={() => handleSelectLocationRegion(region)}
                      className="aos-location-dropdown-item"
                    >
                      {region}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Additional Information */}
          <h3 className="aos-sub-title">Additional Information</h3>
          <div className="aos-row">
            <div className="aos-checkbox-container">
              <input 
                type="checkbox" 
                id="isCritical"
                checked={formData.isCritical}
                onChange={() => handleCheckboxChange('isCritical')}
              />
              <label htmlFor="isCritical">Is the person in critical condition?</label>
            </div>
          </div>
          <div className="aos-row">
            <div className="aos-checkbox-container">
              <input 
                type="checkbox" 
                id="needsViaticum"
                checked={formData.needsViaticum}
                onChange={() => handleCheckboxChange('needsViaticum')}
              />
              <label htmlFor="needsViaticum">Needs Viaticum (Holy Communion)</label>
            </div>
          </div>
          <div className="aos-row">
            <div className="aos-checkbox-container">
              <input 
                type="checkbox" 
                id="needsReconciliation"
                checked={formData.needsReconciliation}
                onChange={() => handleCheckboxChange('needsReconciliation')}
              />
              <label htmlFor="needsReconciliation">Needs Sacrament of Reconciliation (Confession)</label>
            </div>
          </div>
          <div className="aos-row">
            <div className="aos-field-wide">
              <label>Additional Notes or Special Requests</label>
              <textarea 
                value={formData.additionalNotes}
                onChange={(e) => handleInputChange('additionalNotes', e.target.value)}
                rows={3}
                placeholder="Include any special circumstances, accessibility needs, or other important information"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="aos-requirements-container">
        <h2 className="aos-requirements-title">About Anointing of the Sick</h2>
        <div className="aos-requirements-box">
          <h3 className="aos-section-header">Documents Required(Bring the following documents)</h3>
          <div className="aos-info-list">
            <div className="aos-info-item">
              <p>Medical Certificate or Doctor's note</p>
            </div>
            <div className="aos-info-item">
              <p>Valid IDs of the sick person or the contact person</p>
            </div>
            <div className="aos-info-item">
              <p>Certificate of Permission(if the candidate is not a resident of the parish)</p>
            </div>
          </div>
          <h3 className="aos-section-header">About Anointing of the Sick</h3>
          <div className="aos-info-list">
            <div className="aos-info-item">
              <p>The Sacrament of Anointing of the Sick provides spiritual strength and comfort to those who are ill or facing serious medical conditions.</p>
            </div>
            <div className="aos-info-item">
              <p>Viaticum is the Holy Communion given to a dying person as spiritual food for their journey to eternal life.</p>
            </div>
            <div className="aos-info-item">
              <p>This sacrament can be received by any Catholic who is seriously ill, facing surgery, or weakened by old age.</p>
            </div>
          </div>

          <h3 className="aos-section-header">Important Notes</h3>
          <div className="aos-info-list">
            <div className="aos-info-item">
              <p>For emergency cases, please call the parish emergency number directly at _______ instead of using this form.</p>
            </div>
            <div className="aos-info-item">
              <p>A priest will visit the location provided to administer the sacrament.</p>
            </div>
            <div className="aos-info-item">
              <p>Please ensure someone will be present to receive the priest and guide them to the sick person.</p>
            </div>
            <div className="aos-info-item">
              <p>You will receive a confirmation email once your request has been processed.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="aos-button-container">
        <button className="aos-submit-btn" onClick={handleSubmit}>Submit</button>
        <button className="aos-cancel-btn" onClick={() => navigate(-1)}>Cancel</button>
      </div>

      {showModal && (
        <div className="aos-modal-overlay">
          <div className="aos-modal">
            <h2>Submit Application</h2>
            <hr className="custom-hr-aos"/>
            <p>Are you sure you want to submit your Anointing of the Sick application?</p>
            <div className="aos-modal-buttons">
              <button className="aos-yes-btn" onClick={handleYes}>Yes</button>
              <button className="aos-modal-no-btn" onClick={() => setShowModal(false)}>No</button>
            </div>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div className="aos-modal-overlay">
          <div className="aos-modal">
            <h2>Success</h2>
            <hr className="custom-hr-aos"/>
            <p>Your Anointing of the Sick application has been submitted successfully!</p>
            <div className="aos-modal-buttons">
              <button className="aos-yes-btn" onClick={() => setShowSuccessModal(false)}>OK</button>
            </div>
          </div>
        </div>
      )}

      {showErrorModal && (
        <div className="aos-modal-overlay">
          <div className="aos-modal">
            <h2>Error</h2>
            <hr className="custom-hr-aos"/>
            <p>{errorMessage}</p>
            <div className="aos-modal-buttons">
              <button className="aos-modal-no-btn" onClick={() => setShowErrorModal(false)}>OK</button>
            </div>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="aos-modal-overlay">
          <div className="aos-modal">
            <h2>Processing Application</h2>
            <hr className="custom-hr-aos"/>
            <p>Please wait while we submit your Anointing of the Sick application...</p>
            <div className="client-anointing-loading-spinner">
              <div className="client-anointing-spinner"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientAnointingOfTheSick;