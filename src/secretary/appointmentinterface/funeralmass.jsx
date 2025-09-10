import React, { useState, useRef, useEffect } from "react";
import { AiOutlineArrowLeft, AiOutlineUpload } from "react-icons/ai"; 
import { useLocation, useNavigate } from "react-router-dom";
import axios from 'axios';
import "../../client/ClientFuneralMass.css";

const FuneralMass = () => {
   const location = useLocation();
  const navigate = useNavigate();
 

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
    // Separate wake location fields
    wake_barangay: '',
    wake_municipality: '',
    wake_province: '',
    burialLocation: '',
    // Separate burial location fields
    burial_barangay: '',
    burial_municipality: '',
    burial_province: '',
    
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
 

  // States for location data
  const [locationData, setLocationData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [focusedField, setFocusedField] = useState(null);
  const [suggestions, setSuggestions] = useState({
    barangay: [],
    municipality: [],
    province: [],
    region: [],
    wake_barangay: [],
    wake_municipality: [],
    wake_province: [],
    burial_barangay: [],
    burial_municipality: [],
    burial_province: []
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
    const [schedulesResponse, funeralsResponse] = await Promise.all([
      fetch('http://parishofdivinemercy.com/backend/schedule.php'),
      fetch('http://parishofdivinemercy.com/backend/get_funeral_applications.php')
    ]);
    
    const scheduleData = await schedulesResponse.json();
    const funeralData = await funeralsResponse.json();
    
    if (scheduleData.success) {
      // Filter only funeral mass schedules
      const funeralSchedules = scheduleData.schedules.filter(
        schedule => schedule.sacramentType.toLowerCase() === 'funeral mass'
      );
      
      // Get existing funeral applications
      const existingFuneralSet = new Set();
      if (funeralData.success) {
        funeralData.applications.forEach(app => {
          const key = `${app.dateOfFuneral}-${app.timeOfFuneral}`;
          existingFuneralSet.add(key);
        });
      }

      // Filter out already booked schedules
      const availableSchedules = funeralSchedules.filter(schedule => {
        const key = `${schedule.date}-${schedule.time}`;
        return !existingFuneralSet.has(key);
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
      
      setAvailableDates(uniqueDatesArray);
    }
  } catch (error) {
    console.error('Error fetching schedules:', error);
  }
};

  useEffect(() => {
  if (formData.dateOfFuneralMass) {
    const timesForDate = schedules
      .filter(schedule => schedule.date === formData.dateOfFuneralMass)
      .map(schedule => schedule.time);
    
    // Remove duplicates
    const uniqueTimes = [...new Set(timesForDate)];
    setAvailableTimes(uniqueTimes);
    
    // Clear time if it's not available for the new date
    if (!uniqueTimes.includes(formData.timeOfFuneralMass)) {
      setFormData(prev => ({
        ...prev,
        timeOfFuneralMass: ''
      }));
    }
  } else {
    setAvailableTimes([]);
  }
}, [formData.dateOfFuneralMass, schedules]);
 
  // Location filter functions
 // Updated filter functions - REPLACE THE EXISTING ONES
const filterBarangays = (input, municipality = null, province = null) => {
  // If we have municipality context, show ALL barangays for that municipality
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
  const inputLower = input ? input.toLowerCase() : '';
  const uniqueBarangays = [...new Set(locationData.map(loc => loc.barangay))].sort();
  
  if (!input || input.trim() === '') {
    return uniqueBarangays.slice(0, 10); // Show first 10 when no input
  }
  
  return uniqueBarangays
    .filter(barangay => barangay.toLowerCase().includes(inputLower))
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
  const inputLower = input ? input.toLowerCase() : '';
  const uniqueMunicipalities = [...new Set(locationData.map(loc => loc.municipality))].sort();
  
  if (!input || input.trim() === '') {
    return uniqueMunicipalities.slice(0, 10); // Show first 10 when no input
  }
  
  return uniqueMunicipalities
    .filter(municipality => municipality.toLowerCase().includes(inputLower))
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
  const inputLower = input ? input.toLowerCase() : '';
  const uniqueProvinces = [...new Set(locationData.map(loc => loc.province))].sort();
  
  if (!input || input.trim() === '') {
    return uniqueProvinces.slice(0, 10); // Show first 10 when no input
  }
  
  return uniqueProvinces
    .filter(province => province.toLowerCase().includes(inputLower))
    .slice(0, 10);
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


 // Updated auto-fill helper function - REPLACE THE EXISTING ONE
const autoFillLocationFields = (selectedValue, selectedType, fieldPrefix) => {
  let updates = {};
  
  if (selectedType === 'barangay') {
    // Find all locations with this barangay
    const matchingLocations = locationData.filter(loc => loc.barangay === selectedValue);
    
    // Get unique municipalities and provinces
    const uniqueMunicipalities = [...new Set(matchingLocations.map(loc => loc.municipality))];
    const uniqueProvinces = [...new Set(matchingLocations.map(loc => loc.province))];
    
    console.log(`Barangay "${selectedValue}" found in:`, {
      municipalities: uniqueMunicipalities,
      provinces: uniqueProvinces
    });
    
    // Always auto-fill if only one option exists
    if (uniqueMunicipalities.length === 1) {
      updates[`${fieldPrefix}_municipality`] = uniqueMunicipalities[0];
      console.log(`Auto-filling municipality: ${uniqueMunicipalities[0]}`);
    }
    
    if (uniqueProvinces.length === 1) {
      updates[`${fieldPrefix}_province`] = uniqueProvinces[0];
      console.log(`Auto-filling province: ${uniqueProvinces[0]}`);
    }
  } 
  else if (selectedType === 'municipality') {
    // Find all locations with this municipality
    const matchingLocations = locationData.filter(loc => loc.municipality === selectedValue);
    
    // Get unique provinces
    const uniqueProvinces = [...new Set(matchingLocations.map(loc => loc.province))];
    
    console.log(`Municipality "${selectedValue}" found in provinces:`, uniqueProvinces);
    
    // Auto-fill province if only one option exists
    if (uniqueProvinces.length === 1) {
      updates[`${fieldPrefix}_province`] = uniqueProvinces[0];
      console.log(`Auto-filling province: ${uniqueProvinces[0]}`);
    }
  }
  
  return updates;
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

  // Wake location handlers
const handleWakeBarangayChange = (e) => {
  const value = e.target.value;
  setFormData(prev => ({ ...prev, wake_barangay: value }));
  
  if (focusedField === 'wake_barangay') {
    setSuggestions(prev => ({
      ...prev,
      wake_barangay: filterBarangays(value, formData.wake_municipality, formData.wake_province)
    }));
  }
};

const handleWakeMunicipalityChange = (e) => {
  const value = e.target.value;
  setFormData(prev => ({ ...prev, wake_municipality: value }));
  
  if (focusedField === 'wake_municipality') {
    setSuggestions(prev => ({
      ...prev,
      wake_municipality: filterMunicipalities(value, formData.wake_province, formData.wake_barangay)
    }));
  }
  // NO AUTO-FILL while typing
};

const handleWakeProvinceChange = (e) => {
  const value = e.target.value;
  setFormData(prev => ({ ...prev, wake_province: value }));
  
  if (focusedField === 'wake_province') {
    setSuggestions(prev => ({
      ...prev,
      wake_province: filterProvinces(value, formData.wake_municipality, formData.wake_barangay)
    }));
  }
};
  // Burial location handlers
 const handleBurialBarangayChange = (e) => {
  const value = e.target.value;
  setFormData(prev => ({ ...prev, burial_barangay: value }));
  
  if (focusedField === 'burial_barangay') {
    setSuggestions(prev => ({
      ...prev,
      burial_barangay: filterBarangays(value, formData.burial_municipality, formData.burial_province)
    }));
  }
};

const handleBurialMunicipalityChange = (e) => {
  const value = e.target.value;
  setFormData(prev => ({ ...prev, burial_municipality: value }));
  
  if (focusedField === 'burial_municipality') {
    setSuggestions(prev => ({
      ...prev,
      burial_municipality: filterMunicipalities(value, formData.burial_province, formData.burial_barangay)
    }));
  }
  // NO AUTO-FILL while typing
};

const handleBurialProvinceChange = (e) => {
  const value = e.target.value;
  setFormData(prev => ({ ...prev, burial_province: value }));
  
  if (focusedField === 'burial_province') {
    setSuggestions(prev => ({
      ...prev,
      burial_province: filterProvinces(value, formData.burial_municipality, formData.burial_barangay)
    }));
  }
};
  // Selection handlers for wake location
  const handleSelectWakeMunicipality = (municipality) => {
  setFormData(prev => ({ ...prev, wake_municipality: municipality }));
  setFocusedField(null);
  
  // Auto-fill related fields
  const autoFills = autoFillLocationFields(municipality, 'municipality', 'wake');
  if (Object.keys(autoFills).length > 0) {
    setFormData(prev => ({ ...prev, ...autoFills }));
  }
};

const handleSelectWakeBarangay = (barangay) => {
  setFormData(prev => ({ ...prev, wake_barangay: barangay }));
  setFocusedField(null);
  
  // Auto-fill related fields
  const autoFills = autoFillLocationFields(barangay, 'barangay', 'wake');
  if (Object.keys(autoFills).length > 0) {
    setFormData(prev => ({ ...prev, ...autoFills }));
  }
};
  const handleSelectWakeProvince = (province) => {
    setFormData(prev => ({ ...prev, wake_province: province }));
    setFocusedField(null);
  };

  // Selection handlers for burial location
  const handleSelectBurialMunicipality = (municipality) => {
  setFormData(prev => ({ ...prev, burial_municipality: municipality }));
  setFocusedField(null);
  
  // Auto-fill related fields
  const autoFills = autoFillLocationFields(municipality, 'municipality', 'burial');
  if (Object.keys(autoFills).length > 0) {
    setFormData(prev => ({ ...prev, ...autoFills }));
  }
};

const handleSelectBurialBarangay = (barangay) => {
  setFormData(prev => ({ ...prev, burial_barangay: barangay }));
  setFocusedField(null);
  
  // Auto-fill related fields
  const autoFills = autoFillLocationFields(barangay, 'barangay', 'burial');
  if (Object.keys(autoFills).length > 0) {
    setFormData(prev => ({ ...prev, ...autoFills }));
  }
};
  const handleSelectBurialProvince = (province) => {
    setFormData(prev => ({ ...prev, burial_province: province }));
    setFocusedField(null);
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

  // Location change handlers for address
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
      municipality: filterMunicipalities(value, formData.province, formData.barangay)
    });
  }
  // NO AUTO-FILL while typing
};

const handleProvinceChange = (e) => {
  const value = e.target.value;
  handleInputChange('province', value);
  
  if (focusedField === 'province') {
    setSuggestions({
      ...suggestions,
      province: filterProvinces(value, formData.municipality, formData.barangay)
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

  // Selection handlers for address
 const handleSelectMunicipality = (municipality) => {
  handleInputChange('municipality', municipality);
  setFocusedField(null);
  
  // Auto-fill related fields - for address fields, use direct field names
  const matchingLocations = locationData.filter(loc => loc.municipality === municipality);
  const uniqueProvinces = [...new Set(matchingLocations.map(loc => loc.province))];
  
  if (uniqueProvinces.length === 1 && !formData.province) {
    handleInputChange('province', uniqueProvinces[0]);
  }
  
  // Blur the input field to close any mobile keyboard
  document.querySelector('input[name="municipality"]')?.blur();
};

const handleSelectBarangay = (barangay) => {
  handleInputChange('barangay', barangay);
  setFocusedField(null);
  
  // Auto-fill related fields for address
  const matchingLocations = locationData.filter(loc => loc.barangay === barangay);
  const uniqueMunicipalities = [...new Set(matchingLocations.map(loc => loc.municipality))];
  const uniqueProvinces = [...new Set(matchingLocations.map(loc => loc.province))];
  
  if (uniqueMunicipalities.length === 1 && !formData.municipality) {
    handleInputChange('municipality', uniqueMunicipalities[0]);
  }
  if (uniqueProvinces.length === 1 && !formData.province) {
    handleInputChange('province', uniqueProvinces[0]);
  }
  
  // Blur the input field to close any mobile keyboard
  document.querySelector('input[name="barangay"]')?.blur();
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
  
  switch(field) {
    // Wake location fields
    case 'wake_barangay':
      setSuggestions(prev => ({
        ...prev,
        wake_barangay: filterBarangays(formData.wake_barangay || '', formData.wake_municipality, formData.wake_province)
      }));
      break;
    case 'wake_municipality':
      setSuggestions(prev => ({
        ...prev,
        wake_municipality: filterMunicipalities(formData.wake_municipality || '', formData.wake_province, formData.wake_barangay)
      }));
      break;
    case 'wake_province':
      setSuggestions(prev => ({
        ...prev,
        wake_province: filterProvinces(formData.wake_province || '', formData.wake_municipality, formData.wake_barangay)
      }));
      break;
    
    // Burial location fields
    case 'burial_barangay':
      setSuggestions(prev => ({
        ...prev,
        burial_barangay: filterBarangays(formData.burial_barangay || '', formData.burial_municipality, formData.burial_province)
      }));
      break;
    case 'burial_municipality':
      setSuggestions(prev => ({
        ...prev,
        burial_municipality: filterMunicipalities(formData.burial_municipality || '', formData.burial_province, formData.burial_barangay)
      }));
      break;
    case 'burial_province':
      setSuggestions(prev => ({
        ...prev,
        burial_province: filterProvinces(formData.burial_province || '', formData.burial_municipality, formData.burial_barangay)
      }));
      break;
    
    // Home address fields
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
    case 'region':
      setSuggestions(prev => ({
        ...prev,
        region: filterRegions(formData.region || '')
      }));
      break;
    
    default:
      break;
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
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [focusedField]);

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
  // REPLACE the existing handleSubmit and handleYes functions with these:

const handleSubmit = () => {
  // Define all required fields
  const requiredFields = [
    // Funeral Mass Information
    'dateOfFuneralMass', 'timeOfFuneralMass',
    
    // Deceased Information
    'deceasedFirstName', 'deceasedLastName', 
    'deceasedSex', 'deceasedDateOfBirth', 'deceasedDateOfDeath',
    'causeOfDeath', 
    'wake_barangay', 'wake_municipality', 'wake_province',
    'burial_barangay', 'burial_municipality', 'burial_province',
    
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
  
  // Since we're filtering schedules in fetchFuneralSchedules, 
  // if the date/time appears in availableDates and availableTimes,
  // it means it's not booked. No need to check conflicts here.
  
  // Clear validation errors if all fields are valid
  setValidationErrors({});
  
  // Continue with normal submission
  setShowModal(true);
};

const handleYes = async () => {
  setShowModal(false);
  setIsLoading(true);
  
  try {
    // Since we've already filtered out booked schedules in fetchFuneralSchedules,
    // we don't need to check for conflicts here anymore.
    // The available dates/times already exclude booked slots.
    
    // Combine wake and burial location fields
    const combinedWakeLocation = [
      formData.wake_barangay,
      formData.wake_municipality,
      formData.wake_province
    ].filter(Boolean).join(', ');
    
    const combinedBurialLocation = [
      formData.burial_barangay,
      formData.burial_municipality,
      formData.burial_province
    ].filter(Boolean).join(', ');
    
    // Format dates for server
    let submitData = {
      ...formData,
      wakeLocation: combinedWakeLocation,
      burialLocation: combinedBurialLocation
    };
    
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
    const response = await fetch('http://parishofdivinemercy.com/backend/funeral_mass_application.php', {
      method: 'POST',
      body: formDataToSend
    });
    
    const data = await response.json();
    
    setIsLoading(false);
    
    if (data.success) {
     
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
         
         {/* Wake Location - Separated into three fields */}
         <label className="sub-cc">Wake Location <span className="required-marker">*</span></label>
         <div className="client-funeral-row">
           <div className={`client-funeral-field location-dropdown-container ${validationErrors['wake_province'] ? 'error-field' : ''}`}>
             <label>Wake Province <span className="required-marker">*</span></label>
             <input
               type="text"
               name="wake_province"
               value={formData.wake_province || ""}
               onChange={handleWakeProvinceChange}
               onFocus={() => handleFocus('wake_province')}
               placeholder="Type to search"
               autoComplete="off"
             />
             {validationErrors['wake_province'] && <div className="error-message">Required</div>}
            {focusedField === 'wake_province' && suggestions.wake_province.length > 0 && (
  <div className="location-dropdown">
    {suggestions.wake_province.map((province, idx) => (
      <div key={idx} onClick={() => handleSelectWakeProvince(province)} className="location-dropdown-item">
        {province}
      </div>
    ))}
  </div>
)}
           </div>
           <div className={`client-funeral-field location-dropdown-container ${validationErrors['wake_municipality'] ? 'error-field' : ''}`}>
             <label>Wake Municipality <span className="required-marker">*</span></label>
             <input
               type="text"
               name="wake_municipality"
               value={formData.wake_municipality || ""}
               onChange={handleWakeMunicipalityChange}
               onFocus={() => handleFocus('wake_municipality')}
               placeholder="Type to search"
               autoComplete="off"
             />
             {validationErrors['wake_municipality'] && <div className="error-message">Required</div>}
           {focusedField === 'wake_municipality' && suggestions.wake_municipality.length > 0 && (
  <div className="location-dropdown">
    {suggestions.wake_municipality.map((municipality, idx) => (
      <div key={idx} onClick={() => handleSelectWakeMunicipality(municipality)} className="location-dropdown-item">
        {municipality}
      </div>
    ))}
  </div>
)}
           </div>
            <div className={`client-funeral-field location-dropdown-container ${validationErrors['wake_barangay'] ? 'error-field' : ''}`}>
             <label>Wake Barangay <span className="required-marker">*</span></label>
             <input
               type="text"
               name="wake_barangay"
               value={formData.wake_barangay || ""}
               onChange={handleWakeBarangayChange}
               onFocus={() => handleFocus('wake_barangay')}
               placeholder="Type to search"
               autoComplete="off"
             />
             {validationErrors['wake_barangay'] && <div className="error-message">Required</div>}
            {focusedField === 'wake_barangay' && suggestions.wake_barangay.length > 0 && (
  <div className="location-dropdown">
    {suggestions.wake_barangay.map((barangay, idx) => (
      <div key={idx} onClick={() => handleSelectWakeBarangay(barangay)} className="location-dropdown-item">
        {barangay}
      </div>
    ))}
  </div>
)}
           </div>
          
         </div>
         
         {/* Burial Location - Separated into three fields */}
         <label className="sub-cc">Burial Location <span className="required-marker">*</span></label>
         <div className="client-funeral-row">
 <div className={`client-funeral-field location-dropdown-container ${validationErrors['burial_province'] ? 'error-field' : ''}`}>
             <label>Burial Province <span className="required-marker">*</span></label>
             <input
               type="text"
               name="burial_province"
               value={formData.burial_province || ""}
               onChange={handleBurialProvinceChange}
               onFocus={() => handleFocus('burial_province')}
               placeholder="Type to search"
               autoComplete="off"
             />
             {validationErrors['burial_province'] && <div className="error-message">Required</div>}
             {focusedField === 'burial_province' && suggestions.burial_province.length > 0 && (
  <div className="location-dropdown">
    {suggestions.burial_province.map((province, idx) => (
      <div key={idx} onClick={() => handleSelectBurialProvince(province)} className="location-dropdown-item">
        {province}
      </div>
    ))}
  </div>
)}
           </div>
           <div className={`client-funeral-field location-dropdown-container ${validationErrors['burial_municipality'] ? 'error-field' : ''}`}>
             <label>Burial Municipality <span className="required-marker">*</span></label>
             <input
               type="text"
               name="burial_municipality"
               value={formData.burial_municipality || ""}
               onChange={handleBurialMunicipalityChange}
               onFocus={() => handleFocus('burial_municipality')}
               placeholder="Type to search"
               autoComplete="off"
             />
             {validationErrors['burial_municipality'] && <div className="error-message">Required</div>}
             {focusedField === 'burial_municipality' && suggestions.burial_municipality.length > 0 && (
  <div className="location-dropdown">
    {suggestions.burial_municipality.map((municipality, idx) => (
      <div key={idx} onClick={() => handleSelectBurialMunicipality(municipality)} className="location-dropdown-item">
        {municipality}
      </div>
    ))}
  </div>
)}
           </div>
                      <div className={`client-funeral-field location-dropdown-container ${validationErrors['burial_barangay'] ? 'error-field' : ''}`}>
             <label>Burial Barangay <span className="required-marker">*</span></label>
             <input
               type="text"
               name="burial_barangay"
               value={formData.burial_barangay || ""}
               onChange={handleBurialBarangayChange}
               onFocus={() => handleFocus('burial_barangay')}
               placeholder="Type to search"
               autoComplete="off"
             />
             {validationErrors['burial_barangay'] && <div className="error-message">Required</div>}
            {focusedField === 'burial_barangay' && suggestions.burial_barangay.length > 0 && (
  <div className="location-dropdown">
    {suggestions.burial_barangay.map((barangay, idx) => (
      <div key={idx} onClick={() => handleSelectBurialBarangay(barangay)} className="location-dropdown-item">
        {barangay}
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
         <div className={`client-funeral-field ${validationErrors['street'] ? 'error-field' : ''}`}>
             <label>Street<span className="required-marker">*</span></label>
             <input 
               type="text"
               value={formData.street}
               onChange={(e) => handleInputChange('street', e.target.value)}
             />
             {validationErrors['street'] && <div className="error-message">Required</div>}
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