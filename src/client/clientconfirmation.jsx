import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AiOutlineArrowLeft, AiOutlineUpload } from "react-icons/ai"; 
import axios from "axios";
import "./clientconfirmation.css";

const ClientConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { clientID } = location.state || {};

  // Form state
  const [formData, setFormData] = useState({
    date: "",
    time: "",
    first_name: "",
    middle_name: "",
    last_name: "",
    gender: "",
    age: "",
    dateOfBirth: "",
    dateOfBaptism: "",
    churchOfBaptism: "",
    placeOfBirth: "",
    pob_region: "",
    street: "",
    barangay: "",
    municipality: "",
    province: "",
    region: "",
    father_first_name: "",
    father_middle_name: "",
    father_last_name: "",
    father_dateOfBirth: "",
    father_placeOfBirth: "",
    father_region: "",
    father_contact: "",
    mother_first_name: "",
    mother_middle_name: "",
    mother_last_name: "",
    mother_dateOfBirth: "",
    mother_placeOfBirth: "",
    mother_region: "",
    mother_contact: "",
  });

  // Requirements
  const [requirements, setRequirements] = useState({
    baptism_cert: { file: null, status: "Not Submitted" },
    birth_cert: { file: null, status: "Not Submitted" },
    valid_ids: { file: null, status: "Not Submitted" },
  });

  // File input refs
  const fileInputRefs = {
    baptism_cert: useRef(null),
    birth_cert: useRef(null),
    valid_ids: useRef(null),
  };

  // States for location data
  const [locationData, setLocationData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [focusedField, setFocusedField] = useState(null);
  const [suggestions, setSuggestions] = useState({
    barangay: [],
    municipality: [],
    province: [],
    placeOfBirth: [],
    pob_region: [],
    region: [],
    father_placeOfBirth: [],
    father_region: [],
    mother_placeOfBirth: [],
    mother_region: []
  });

  const [schedules, setSchedules] = useState([]);
  const [uniqueDates, setUniqueDates] = useState([]);
  const [filteredTimes, setFilteredTimes] = useState([]);

  // Add state for existing confirmation applications
  const [existingConfirmations, setExistingConfirmations] = useState([]);

  // Add modal state variables
  const [showModal, setShowModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Add validation states
  const [validationErrors, setValidationErrors] = useState({});
  const [showValidationErrors, setShowValidationErrors] = useState(false);
  const [validationErrorRef, setValidationErrorRef] = useState(null);

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

  useEffect(() => {
    fetchConfirmationSchedules();
    fetchLocations();
    fetchExistingConfirmations();
  }, []);

  // Fetch schedules for Confirmation
  const fetchConfirmationSchedules = async () => {
    try {
      const response = await fetch('http://parishofdivinemercy.com/backend/schedule.php');
      const data = await response.json();
      if (data.success) {
        const confirmationSchedules = data.schedules.filter(
          schedule => schedule.sacramentType.toLowerCase() === 'confirmation'
        );
        setSchedules(confirmationSchedules);
        // Extract unique dates
        const uniqueDatesSet = new Set();
        const uniqueDatesArray = [];
        confirmationSchedules.forEach(schedule => {
          if (!uniqueDatesSet.has(schedule.date)) {
            uniqueDatesSet.add(schedule.date);
            uniqueDatesArray.push(schedule.date);
          }
        });
        setUniqueDates(uniqueDatesArray);
      }
    } catch (error) {
      console.error('Error fetching confirmation schedules:', error);
    }
  };

  // Update available times when date is selected
  useEffect(() => {
    if (formData.date) {
      const timesForDate = schedules
        .filter(schedule => schedule.date === formData.date)
        .map(schedule => schedule.time);
      const uniqueTimes = [...new Set(timesForDate)];
      setFilteredTimes(uniqueTimes);
      if (!uniqueTimes.includes(formData.time)) {
        setFormData(prev => ({ ...prev, time: '' }));
      }
    } else {
      setFilteredTimes([]);
    }
  }, [formData.date, schedules]);

  // Enhanced filter functions to consider the other fields
  const filterBarangays = (input = '', municipality = null, province = null) => {
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
    
    // Extract unique barangays and filter by input if provided
    const uniqueBarangays = [...new Set(filtered.map(loc => loc.barangay))].sort();
    
    if (input) {
      return uniqueBarangays.filter(barangay => barangay.toLowerCase().includes(inputLower));
    }
    
    return uniqueBarangays;
  };

  const filterMunicipalities = (input = '', province = null) => {
    const inputLower = input.toLowerCase();
    let filtered = locationData;
    
    // If province is provided, filter by province
    if (province && province.trim() !== '') {
      filtered = filtered.filter(location => location.province === province);
    }
    
    // Extract unique municipalities and filter by input if provided
    const uniqueMunicipalities = [...new Set(filtered.map(loc => loc.municipality))].sort();
    
    if (input) {
      return uniqueMunicipalities.filter(municipality => municipality.toLowerCase().includes(inputLower));
    }
    
    return uniqueMunicipalities;
  };

  const filterProvinces = (input = '') => {
    const inputLower = input.toLowerCase();
    const uniqueProvinces = [...new Set(locationData.map(loc => loc.province))].sort();
    
    if (input) {
      return uniqueProvinces.filter(province => province.toLowerCase().includes(inputLower));
    }
    
    return uniqueProvinces;
  };

  // Add filterRegions function
  const filterRegions = (input = '') => {
    const inputLower = input.toLowerCase();
    // List of regions in the Philippines
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
    
    if (input) {
      return regions.filter(region => region.toLowerCase().includes(inputLower));
    }
    
    return regions;
  };

  // Updated handlers to filter based on other fields
  const handleBarangayChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, barangay: value }));
    
    if (focusedField === 'barangay') {
      // Filter barangays based on municipality and province if they exist
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
      // Filter municipalities based on province if it exists
      setSuggestions(prev => ({
        ...prev,
        municipality: filterMunicipalities(value, formData.province)
      }));
    }
    
    // If typing a municipality, check if it has a province
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

  // Updated selection handlers
  const handleSelectBarangay = (barangay) => {
    setFormData(prev => ({ ...prev, barangay: barangay }));
    setFocusedField(null);
    
    // Check if this barangay has a specific municipality and province
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
    
    // Find the province for this municipality
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
    } else if (field === 'father_placeOfBirth') {
      setSuggestions(prev => ({
        ...prev,
        father_placeOfBirth: filterBirthPlaces(formData.father_placeOfBirth || '')
      }));
    } else if (field === 'mother_placeOfBirth') {
      setSuggestions(prev => ({
        ...prev,
        mother_placeOfBirth: filterBirthPlaces(formData.mother_placeOfBirth || '')
      }));
    } else if (field === 'region') {
      setSuggestions(prev => ({
        ...prev,
        region: filterRegions(formData.region || '')
      }));
    } else if (field === 'father_region') {
      setSuggestions(prev => ({
        ...prev,
        father_region: filterRegions(formData.father_region || '')
      }));
    } else if (field === 'mother_region') {
      setSuggestions(prev => ({
        ...prev,
        mother_region: filterRegions(formData.mother_region || '')
      }));
    } else if (field === 'pob_region') {
      setSuggestions(prev => ({
        ...prev,
        pob_region: filterRegions(formData.pob_region || '')
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

  // Filter helpers for birth place
  const filterBirthPlaces = (input = '') => {
    const inputLower = input.toLowerCase();
    
    // If there's input, filter based on search terms
    if (input) {
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
        }))
        .slice(0, 30); // Limit results to 30 locations
    }
    
    // If no input, ensure we still show some locations (first 30)
    // This is different from before where we might not be showing any if locationData was empty
    if (locationData && locationData.length > 0) {
      return locationData
        .slice(0, 30) // Show first 30 locations
        .map(location => ({
          barangay: location.barangay,
          municipality: location.municipality,
          province: location.province
        }));
    }
    
    return []; // Return empty array if no locations available
  };

  // Address handlers
  const handleAddressChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (focusedField === 'barangay') {
      setSuggestions(s => ({
        ...s,
        barangay: filterBarangays(value, formData.municipality, formData.province)
      }));
    }
    if (focusedField === 'municipality') {
      setSuggestions(s => ({
        ...s,
        municipality: filterMunicipalities(value, formData.province)
      }));
    }
    if (focusedField === 'province') {
      setSuggestions(s => ({
        ...s,
        province: filterProvinces(value)
      }));
    }
    if (focusedField === 'region') {
      setSuggestions(s => ({
        ...s,
        region: filterRegions(value)
      }));
    }
  };

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle file upload
  const handleFileChange = (key, e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Update status to "Uploading..."
    setRequirements((prev) => ({
      ...prev,
      [key]: { file: null, status: "Uploading..." },
    }));

    // Simulate file upload with a timeout
    setTimeout(() => {
      // Create a URL for the uploaded file (for preview purposes)
      const fileUrl = URL.createObjectURL(file);
      
      // Update states to reflect successful upload
      setRequirements((prev) => ({
        ...prev,
        [key]: { file, status: "Submitted" },
      }));
      
      // Clear validation error for this requirement if it exists
      if (validationErrors.documents && documentErrors.includes(key)) {
        setDocumentErrors(prevErrors => prevErrors.filter(id => id !== key));
        
        // If all documents are now valid, remove the documents error
        if (documentErrors.length === 1) {
          setValidationErrors(prev => {
            const updated = {...prev};
            delete updated.documents;
            return updated;
          });
        }
      }
    }, 1000); // Simulate upload delay
  };

  // Handle requirement checkbox click
  const handleRequirementCheckboxClick = (key) => {
    // If the requirement is currently submitted, clear it when unchecked
    if (requirements[key].status === "Submitted") {
      // Clear the file input
      if (fileInputRefs[key] && fileInputRefs[key].current) {
        fileInputRefs[key].current.value = '';
      }
      
      setRequirements((prev) => ({
        ...prev,
        [key]: { file: null, status: "Not Submitted" },
      }));
      
      // Add to document errors if it's a required document
      if (['baptism_cert', 'birth_cert', 'valid_ids'].includes(key)) {
        if (!documentErrors.includes(key)) {
          setDocumentErrors(prev => [...prev, key]);
        }
      }
    }
    // If not submitted, trigger file upload
    else {
      if (fileInputRefs[key] && fileInputRefs[key].current) {
        fileInputRefs[key].current.click();
      }
    }
  };

  // Handle status change
  const handleStatusChange = (key, e) => {
    const newStatus = e.target.value;
    
    // If status is changed to "Not Submitted" manually, clear the uploaded file
    if (newStatus === "Not Submitted" && requirements[key].file) {
      // Clear the file input
      if (fileInputRefs[key] && fileInputRefs[key].current) {
        fileInputRefs[key].current.value = '';
      }
      
      setRequirements((prev) => ({
        ...prev,
        [key]: { file: null, status: newStatus },
      }));
      
      // Add to document errors if it's a required document
      if (['baptism_cert', 'birth_cert', 'valid_ids'].includes(key)) {
        if (!documentErrors.includes(key)) {
          setDocumentErrors(prev => [...prev, key]);
        }
      }
    } else {
      setRequirements((prev) => ({
        ...prev,
        [key]: { ...prev[key], status: newStatus },
      }));
      
      // Remove from document errors if status is changed to "Submitted"
      if (newStatus === "Submitted" && ['baptism_cert', 'birth_cert', 'valid_ids'].includes(key)) {
        setDocumentErrors(prev => prev.filter(id => id !== key));
      }
    }
  };

  // Father's Place of Birth handlers
  const handleFatherPlaceOfBirthChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, father_placeOfBirth: value }));
    if (focusedField === 'father_placeOfBirth') {
      setSuggestions(s => ({
        ...s,
        father_placeOfBirth: filterBirthPlaces(value)
      }));
    }
  };
  const handleSelectFatherPlaceOfBirth = (location) => {
    const formattedPlace = `${location.barangay}, ${location.municipality}, ${location.province}`;
    setFormData(prev => ({ ...prev, father_placeOfBirth: formattedPlace }));
    setFocusedField(null);
  };

  // Mother's Place of Birth handlers
  const handleMotherPlaceOfBirthChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, mother_placeOfBirth: value }));
    if (focusedField === 'mother_placeOfBirth') {
      setSuggestions(s => ({
        ...s,
        mother_placeOfBirth: filterBirthPlaces(value)
      }));
    }
  };
  const handleSelectMotherPlaceOfBirth = (location) => {
    const formattedPlace = `${location.barangay}, ${location.municipality}, ${location.province}`;
    setFormData(prev => ({ ...prev, mother_placeOfBirth: formattedPlace }));
    setFocusedField(null);
  };

  // Handle date change
  const handleDateChange = (field, value) => {
    // Store the date in yyyy-mm-dd format as is from the date input
    setFormData(prev => ({ ...prev, [field]: value }));

    // Calculate age if this is the date of birth field
    if (field === 'dateOfBirth') {
      const today = new Date();
      const birthDate = new Date(value);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      // Adjust age if birthday hasn't occurred this year
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      setFormData(prev => ({ ...prev, age: age.toString() }));
    }
  };

  // Add function to fetch existing confirmation applications
  const fetchExistingConfirmations = async () => {
    try {
      const response = await fetch('http://parishofdivinemercy.com/backend/get_confirmation_applications.php');
      const data = await response.json();
      
      if (data.success) {
        setExistingConfirmations(data.applications);
        console.log('Existing confirmation applications:', data.applications);
      }
    } catch (error) {
      console.error('Error fetching existing confirmations:', error);
    }
  };

  // Add validation function
  const validateForm = () => {
    const errors = {};
    
    // Required fields
    const requiredFields = [
      { name: 'date', label: 'Date of Confirmation' },
      { name: 'time', label: 'Time of Confirmation' },
      { name: 'first_name', label: 'First Name' },
      { name: 'last_name', label: 'Last Name' },
      { name: 'gender', label: 'Gender' },
      { name: 'dateOfBirth', label: 'Date of Birth' },
      { name: 'dateOfBaptism', label: 'Date of Baptism' },
      { name: 'churchOfBaptism', label: 'Church of Baptism' },
      { name: 'placeOfBirth', label: 'Place of Birth' },
      { name: 'barangay', label: 'Barangay' },
      { name: 'street', label: 'Street' },
      { name: 'municipality', label: 'Municipality' },
      { name: 'province', label: 'Province' },
      { name: 'father_first_name', label: 'Father\'s First Name' },
      { name: 'father_last_name', label: 'Father\'s Last Name' },
      { name: 'mother_first_name', label: 'Mother\'s First Name' },
      { name: 'mother_last_name', label: 'Mother\'s Last Name' }
    ];

    // Check required fields
    requiredFields.forEach(field => {
      if (!formData[field.name] || formData[field.name].trim() === '') {
        errors[field.name] = `${field.label} is required`;
      }
    });

    return errors;
  };
  
  // Update the handleSubmit function to include validation
  const handleSubmit = async () => {
    // Validate the form first
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
      
      // Show error message
      setErrorMessage('Please fill in all required fields');
      setShowErrorModal(true);
      return;
    }
    
    // Check if there are any scheduling conflicts
    const selectedDate = formData.date;
    const selectedTime = formData.time;
    
    const conflictingAppointment = existingConfirmations.find(confirmation => 
      confirmation.date === selectedDate && 
      confirmation.time === selectedTime
    );
    
    if (conflictingAppointment) {
      setErrorMessage('This schedule is already booked. Please select a different date or time.');
      setShowErrorModal(true);
      return;
    }

    setShowModal(true);
  };

  // Add function to handle form submission after confirmation
  const handleConfirmSubmit = async () => {
    setIsLoading(true);
    setShowModal(false);
    
    try {
      // Format dates to ensure they're in yyyy-mm-dd format
      const formatDate = (dateString) => {
        if (!dateString) return '';
        
        try {
          // If it's already in yyyy-mm-dd format, return it
          if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
            return dateString;
          }
          
          // Otherwise try to parse and format it
          const date = new Date(dateString);
          if (isNaN(date.getTime())) {
            console.error('Invalid date:', dateString);
            return '';
          }
          
          return date.toISOString().split('T')[0]; // Gets yyyy-mm-dd
        } catch (error) {
          console.error('Error formatting date:', error);
          return '';
        }
      };
      
      // Create a formatted copy of the form data
      const formattedData = {
        ...formData,
        dateOfBirth: formatDate(formData.dateOfBirth),
        dateOfBaptism: formatDate(formData.dateOfBaptism),
        father_dateOfBirth: formatDate(formData.father_dateOfBirth),
        mother_dateOfBirth: formatDate(formData.mother_dateOfBirth)
      };
      
      // Create FormData object
      const formDataToSend = new FormData();
      
      // Add form fields with formatted dates
      formDataToSend.append("clientID", clientID);
      formDataToSend.append("applicationData", JSON.stringify(formattedData));
      
      // Add address data
      formDataToSend.append(
        "addressData",
        JSON.stringify({
          street: formData.street,
          barangay: formData.barangay,
          municipality: formData.municipality,
          province: formData.province,
          region: formData.region,
        })
      );
      
      // Add parent data
      formDataToSend.append(
        "fatherData",
        JSON.stringify({
          first_name: formattedData.father_first_name,
          middle_name: formattedData.father_middle_name,
          last_name: formattedData.father_last_name,
          placeOfBirth: formattedData.father_placeOfBirth,
          dateOfBirth: formattedData.father_dateOfBirth,
          contact_number: formattedData.father_contact,
        })
      );
      formDataToSend.append(
        "motherData",
        JSON.stringify({
          first_name: formattedData.mother_first_name,
          middle_name: formattedData.mother_middle_name,
          last_name: formattedData.mother_last_name,
          placeOfBirth: formattedData.mother_placeOfBirth,
          dateOfBirth: formattedData.mother_dateOfBirth,
          contact_number: formattedData.mother_contact,
        })
      );
      
      // Send to backend
      const response = await fetch(
        "http://parishofdivinemercy.com/backend/confirmation_application.php",
        {
          method: "POST",
          body: formDataToSend,
        }
      );
      const data = await response.json();
      
      setIsLoading(false);
      
      if (data.success) {
        // Optionally send email
        try {
          await fetch(
            "http://parishofdivinemercy.com/backend/send_confirmation_email.php",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ 
                clientID, 
                confirmationData: {
                  ...formattedData
                }
              }),
            }
          );
        } catch (emailError) {
          console.error("Error sending email:", emailError);
          // Continue anyway - don't block the success message
        }
        
        setShowSuccessModal(true);
        setTimeout(() => {
          navigate("/client-appointment");
        }, 2000);
      } else {
        setErrorMessage(data.message || "Failed to submit application");
        setShowErrorModal(true);
      }
    } catch (error) {
      setIsLoading(false);
      setErrorMessage("An error occurred while submitting your application. Please try again.");
      setShowErrorModal(true);
      console.error("Submission error:", error);
    }
  };

  return (
    <div className="client-kumpil-container">
      {/* Header */}
      <div className="client-kumpil-header">
        <div className="client-kumpil-left-section">
          <button className="client-kumpil-back-button" onClick={() => window.history.back()}>
            <AiOutlineArrowLeft className="client-kumpil-back-icon" /> Back
          </button>
        </div>
      </div>
      <h1 className="client-kumpil-title">Confirmation Application Form</h1>
      
      {/* Confirmation Data Section */}
      <div className="client-kumpil-data">
        <div className="client-kumpil-row-date">
          <div className="client-kumpil-field-date">
            <label>Date of Appointment <span className="required-marker">*</span></label>
            <select
              name="date"
              value={formData.date}
              onChange={e => setFormData(prev => ({ ...prev, date: e.target.value }))}
              className={showValidationErrors && validationErrors.date ? 'input-error' : ''}
            >
              <option value="">Select Date</option>
              {uniqueDates.map(date => (
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
          
          <div className="client-kumpil-field-time">
            <label>Time of Appointment <span className="required-marker">*</span></label>
            <select
              name="time"
              value={formData.time}
              onChange={e => setFormData(prev => ({ ...prev, time: e.target.value }))}
              disabled={!formData.date}
              className={showValidationErrors && validationErrors.time ? 'input-error' : ''}
            >
              <option value="">Select Time</option>
              {filteredTimes.map(time => (
                <option key={time} value={time}>{time}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="client-kumpil-bypart">
          <h3 className="client-kumpil-sub-title">Personal Information</h3>
          <div className="client-kumpil-row">
            <div className={`client-kumpil-field ${showValidationErrors && validationErrors.first_name ? 'field-error' : ''}`}>
              <label>First Name <span className="required-marker">*</span></label>
              <input 
                name="first_name" 
                value={formData.first_name} 
                onChange={handleInputChange} 
                className={showValidationErrors && validationErrors.first_name ? 'input-error' : ''}
              />
            </div>
            <div className="client-kumpil-field">
              <label>Middle Name</label>
              <input name="middle_name" value={formData.middle_name} onChange={handleInputChange} />
            </div>
            <div className={`client-kumpil-field ${showValidationErrors && validationErrors.last_name ? 'field-error' : ''}`}>
              <label>Last Name <span className="required-marker">*</span></label>
              <input 
                name="last_name" 
                value={formData.last_name} 
                onChange={handleInputChange} 
                className={showValidationErrors && validationErrors.last_name ? 'input-error' : ''}
              />
            </div>
            <div className={`client-kumpil-field ${showValidationErrors && validationErrors.dateOfBirth ? 'field-error' : ''}`}>
              <label>Date of Birth <span className="required-marker">*</span></label>
              <input 
                name="dateOfBirth" 
                type="date" 
                onChange={(e) => handleDateChange('dateOfBirth', e.target.value)} 
                className={`date-input ${showValidationErrors && validationErrors.dateOfBirth ? 'input-error' : ''}`}
              />
            </div>
          </div>
          <div className="client-kumpil-row">
          <div className="client-kumpil-field">
              <label>Age</label>
              <input name="age" value={formData.age} onChange={handleInputChange} />
            </div>
            <div className={`client-kumpil-field ${showValidationErrors && validationErrors.gender ? 'field-error' : ''}`}>
              <label>Gender <span className="required-marker">*</span></label>
              <select 
                name="gender" 
                value={formData.gender} 
                onChange={handleInputChange}
                className={showValidationErrors && validationErrors.gender ? 'input-error' : ''}
              >
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div className={`client-kumpil-field ${showValidationErrors && validationErrors.dateOfBaptism ? 'field-error' : ''}`}>
              <label>Date of Baptism <span className="required-marker">*</span></label>
              <input 
                name="dateOfBaptism" 
                type="date" 
                onChange={(e) => handleDateChange('dateOfBaptism', e.target.value)} 
                className={`date-input ${showValidationErrors && validationErrors.dateOfBaptism ? 'input-error' : ''}`}
              />
            </div>
            <div className={`client-kumpil-field ${showValidationErrors && validationErrors.churchOfBaptism ? 'field-error' : ''}`}>
              <label>Church of Baptism <span className="required-marker">*</span></label>
              <input 
                name="churchOfBaptism" 
                value={formData.churchOfBaptism} 
                onChange={handleInputChange}
                className={showValidationErrors && validationErrors.churchOfBaptism ? 'input-error' : ''}
              />
            </div>
          </div>
          <div className="client-kumpil-row">
            <div className={`client-kumpil-field location-dropdown-container ${showValidationErrors && validationErrors.placeOfBirth ? 'field-error' : ''}`}>
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
              {focusedField === 'placeOfBirth' && (
                <div className="location-dropdown">
                  {loading ? (
                    <div className="location-dropdown-item">Loading locations...</div>
                  ) : suggestions.placeOfBirth && suggestions.placeOfBirth.length > 0 ? (
                    suggestions.placeOfBirth.map((location, idx) => (
                      <div key={idx} onClick={() => handleSelectPlaceOfBirth(location)} className="location-dropdown-item">
                        {`${location.barangay}, ${location.municipality}, ${location.province}`}
                      </div>
                    ))
                  ) : (
                    <div className="location-dropdown-item">No locations found. Try a different search.</div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Address Fields - Changed to three dropdowns */}
          <label className="sub-cc">Home Address <span className="required-marker">*</span></label>
          <div className="client-kumpil-row">
          <div className={`client-kumpil-field ${showValidationErrors && validationErrors.street ? 'field-error' : ''}`}>
              <label>Street <span className="required-marker">*</span></label>
              <input
                name="street"
                value={formData.street || ""}
                onChange={e => setFormData(prev => ({ ...prev, street: e.target.value }))}
                placeholder="Street"
                autoComplete="off"
                className={showValidationErrors && validationErrors.street ? 'input-error' : ''}
              />
            </div>
            <div className={`client-kumpil-field location-dropdown-container ${showValidationErrors && validationErrors.barangay ? 'field-error' : ''}`}>
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
              {focusedField === 'barangay' && (
                <div className="location-dropdown">
                  {suggestions.barangay && suggestions.barangay.length > 0 ? (
                    suggestions.barangay.map((barangay, idx) => (
                      <div key={idx} onClick={() => handleSelectBarangay(barangay)} className="location-dropdown-item">
                        {barangay}
                      </div>
                    ))
                  ) : (
                    <div className="location-dropdown-item">No barangays found</div>
                  )}
                </div>
              )}
            </div>
            <div className={`client-kumpil-field location-dropdown-container ${showValidationErrors && validationErrors.municipality ? 'field-error' : ''}`}>
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
              {focusedField === 'municipality' && (
                <div className="location-dropdown">
                  {suggestions.municipality && suggestions.municipality.length > 0 ? (
                    suggestions.municipality.map((municipality, idx) => (
                      <div key={idx} onClick={() => handleSelectMunicipality(municipality)} className="location-dropdown-item">
                        {municipality}
                      </div>
                    ))
                  ) : (
                    <div className="location-dropdown-item">No municipalities found</div>
                  )}
                </div>
              )}
            </div>
            <div className={`client-kumpil-field location-dropdown-container ${showValidationErrors && validationErrors.province ? 'field-error' : ''}`}>
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
              {focusedField === 'province' && (
                <div className="location-dropdown">
                  {suggestions.province && suggestions.province.length > 0 ? (
                    suggestions.province.map((province, idx) => (
                      <div key={idx} onClick={() => handleSelectProvince(province)} className="location-dropdown-item">
                        {province}
                      </div>
                    ))
                  ) : (
                    <div className="location-dropdown-item">No provinces found</div>
                  )}
                </div>
              )}
            </div>
             <div className="client-kumpil-field location-dropdown-container">
              <label>Region</label>
              <input
                name="region"
                value={formData.region || ""}
                onChange={(e) => handleAddressChange('region', e.target.value)}
                onFocus={() => handleFocus('region')}
                placeholder="Type to search"
                autoComplete="off"
              />
              {focusedField === 'region' && (
                <div className="location-dropdown">
                  {suggestions.region && suggestions.region.length > 0 ? (
                    suggestions.region.map((region, idx) => (
                      <div key={idx} onClick={() => handleAddressChange('region', region)} className="location-dropdown-item">
                        {region}
                      </div>
                    ))
                  ) : (
                    <div className="location-dropdown-item">No regions found</div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Father's Information */}
          <h3 className="client-kumpil-sub-title">Father's Information</h3>
          <div className="client-kumpil-row">
            <div className={`client-kumpil-field ${showValidationErrors && validationErrors.father_first_name ? 'field-error' : ''}`}>
              <label>Father's First Name <span className="required-marker">*</span></label>
              <input 
                name="father_first_name" 
                value={formData.father_first_name} 
                onChange={handleInputChange} 
                className={showValidationErrors && validationErrors.father_first_name ? 'input-error' : ''}
              />
            </div>
            <div className="client-kumpil-field">
              <label>Father's Middle Name</label>
              <input name="father_middle_name" value={formData.father_middle_name} onChange={handleInputChange} />
            </div>
            <div className={`client-kumpil-field ${showValidationErrors && validationErrors.father_last_name ? 'field-error' : ''}`}>
              <label>Father's Last Name <span className="required-marker">*</span></label>
              <input 
                name="father_last_name" 
                value={formData.father_last_name} 
                onChange={handleInputChange} 
                className={showValidationErrors && validationErrors.father_last_name ? 'input-error' : ''}
              />
            </div>
          </div>
          <div className="client-kumpil-row">
            <div className="client-kumpil-field">
              <label>Father's Date of Birth</label>
              <input 
                name="father_dateOfBirth" 
                type="date" 
                value={formData.father_dateOfBirth || ""} 
                onChange={(e) => handleDateChange('father_dateOfBirth', e.target.value)} 
                className="date-input" 
              />
            </div>
            <div className="client-kumpil-field">
              <label>Father's Contact Number</label>
              <input name="father_contact" value={formData.father_contact} onChange={handleInputChange} />
            </div>
            <div className="client-kumpil-field location-dropdown-container">
              <label>Father's Region</label>
              <input
                name="father_region"
                value={formData.father_region || ""}
                onChange={(e) => handleAddressChange('father_region', e.target.value)}
                onFocus={() => handleFocus('father_region')}
                placeholder="Type to search"
                autoComplete="off"
              />
              {focusedField === 'father_region' && (
                <div className="location-dropdown">
                  {suggestions.father_region && suggestions.father_region.length > 0 ? (
                    suggestions.father_region.map((region, idx) => (
                      <div key={idx} onClick={() => handleAddressChange('father_region', region)} className="location-dropdown-item">
                        {region}
                      </div>
                    ))
                  ) : (
                    <div className="location-dropdown-item">No regions found</div>
                  )}
                </div>
              )}
            </div>
            </div>
          <div className="client-kumpil-row">
            <div className="client-kumpil-field location-dropdown-container">
              <label>Father's Place of Birth (Barangay, Municipality, Province)</label>
              <input
                name="father_placeOfBirth"
                value={formData.father_placeOfBirth || ""}
                onChange={handleFatherPlaceOfBirthChange}
                onFocus={() => handleFocus('father_placeOfBirth')}
                placeholder="Type to search (Barangay, Municipality, Province)"
                autoComplete="off"
              />
              {focusedField === 'father_placeOfBirth' && (
                <div className="location-dropdown">
                  {loading ? (
                    <div className="location-dropdown-item">Loading locations...</div>
                  ) : suggestions.father_placeOfBirth && suggestions.father_placeOfBirth.length > 0 ? (
                    suggestions.father_placeOfBirth.map((location, idx) => (
                      <div key={idx} onClick={() => handleSelectFatherPlaceOfBirth(location)} className="location-dropdown-item">
                        {`${location.barangay}, ${location.municipality}, ${location.province}`}
                      </div>
                    ))
                  ) : (
                    <div className="location-dropdown-item">No locations found. Try a different search.</div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Mother's Information */}
          <h3 className="client-kumpil-sub-title">Mother's Information</h3>
          <div className="client-kumpil-row">
            <div className={`client-kumpil-field ${showValidationErrors && validationErrors.mother_first_name ? 'field-error' : ''}`}>
              <label>Mother's First Name <span className="required-marker">*</span></label>
              <input 
                name="mother_first_name" 
                value={formData.mother_first_name} 
                onChange={handleInputChange} 
                className={showValidationErrors && validationErrors.mother_first_name ? 'input-error' : ''}
              />
            </div>
            <div className="client-kumpil-field">
              <label>Mother's Middle Name</label>
              <input name="mother_middle_name" value={formData.mother_middle_name} onChange={handleInputChange} />
            </div>
            <div className={`client-kumpil-field ${showValidationErrors && validationErrors.mother_last_name ? 'field-error' : ''}`}>
              <label>Mother's Last Name <span className="required-marker">*</span></label>
              <input 
                name="mother_last_name" 
                value={formData.mother_last_name} 
                onChange={handleInputChange} 
                className={showValidationErrors && validationErrors.mother_last_name ? 'input-error' : ''}
              />
            </div>
          </div>
          <div className="client-kumpil-row">
            <div className="client-kumpil-field">
              <label>Mother's Date of Birth</label>
              <input 
                name="mother_dateOfBirth" 
                type="date" 
                value={formData.mother_dateOfBirth || ""} 
                onChange={(e) => handleDateChange('mother_dateOfBirth', e.target.value)} 
                className="date-input" 
              />
            </div>
            <div className="client-kumpil-field">
              <label>Mother's Contact Number</label>
              <input name="mother_contact" value={formData.mother_contact} onChange={handleInputChange} />
            </div>
            <div className="client-kumpil-field location-dropdown-container">
              <label>Mother's Region</label>
              <input
                name="mother_region"
                value={formData.mother_region || ""}
                onChange={(e) => handleAddressChange('mother_region', e.target.value)}
                onFocus={() => handleFocus('mother_region')}
                placeholder="Type to search"
                autoComplete="off"
              />
              {focusedField === 'mother_region' && (
                <div className="location-dropdown">
                  {suggestions.mother_region && suggestions.mother_region.length > 0 ? (
                    suggestions.mother_region.map((region, idx) => (
                      <div key={idx} onClick={() => handleAddressChange('mother_region', region)} className="location-dropdown-item">
                        {region}
                      </div>
                    ))
                  ) : (
                    <div className="location-dropdown-item">No regions found</div>
                  )}
                </div>
              )}
            </div>
          </div>
          </div>
          <div className="client-kumpil-row">
            <div className="client-kumpil-field location-dropdown-container">
              <label>Mother's Place of Birth (Barangay, Municipality, Province)</label>
              <input
                name="mother_placeOfBirth"
                value={formData.mother_placeOfBirth || ""}
                onChange={handleMotherPlaceOfBirthChange}
                onFocus={() => handleFocus('mother_placeOfBirth')}
                placeholder="Type to search (Barangay, Municipality, Province)"
                autoComplete="off"
              />
              {focusedField === 'mother_placeOfBirth' && (
                <div className="location-dropdown">
                  {loading ? (
                    <div className="location-dropdown-item">Loading locations...</div>
                  ) : suggestions.mother_placeOfBirth && suggestions.mother_placeOfBirth.length > 0 ? (
                    suggestions.mother_placeOfBirth.map((location, idx) => (
                      <div key={idx} onClick={() => handleSelectMotherPlaceOfBirth(location)} className="location-dropdown-item">
                        {`${location.barangay}, ${location.municipality}, ${location.province}`}
                      </div>
                    ))
                  ) : (
                    <div className="location-dropdown-item">No locations found. Try a different search.</div>
                  )}
                </div>
              )}
            </div>
        </div>
        
        {/* Requirements section */}
        <div className="client-kumpil-requirements-container">
          <h2 className="client-kumpil-requirements-title">Requirements</h2>
          <div className="client-kumpil-requirements-box">
          <h3 className="client-kumpil-section-header">Requirements Documents(Bring the following documents)</h3>
            <div className="client-kumpil-info-list">
              <div className="client-kumpil-info-item">
                <p>Baptismal Certificate</p>
              </div>
              <div className="client-kumpil-info-item">
                <p>Birth Certificate</p>
              </div>
              <div className="client-kumpil-info-item">
                <p>Valid ID for the candidate</p>
              </div>
              <div className="client-kumpil-info-item">
                <p>Certificate of Permission(if the candidate is not a resident of the parish)</p>
              </div>
              </div>
            <h3 className="client-kumpil-section-header">Requirements for Candidate</h3>
            <div className="client-kumpil-info-list">
              <div className="client-kumpil-info-item">
                <p>Must have received the Sacraments of Baptism and Holy Eucharist</p>
              </div>
              <div className="client-kumpil-info-item">
                <p>Must be at least 12 years old (Age requirement may vary by parish)</p>
              </div>
              <div className="client-kumpil-info-item">
                <p>Must attend Catechism Classes or Confirmation Seminar</p>
              </div>
              <div className="client-kumpil-info-item">
                <p>Must receive the Sacrament of Confession before Confirmation</p>
              </div>
              <div className="client-kumpil-info-item">
                <p>Must attend a Confirmation Retreat (if required by parish)</p>
              </div>
            </div>
          </div>
        </div>

        <div className="client-kumpil-button-container">
          <button className="client-kumpil-submit-btn" onClick={handleSubmit}>Submit</button>
          <button className="client-kumpil-cancel-btn">Cancel</button>
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      {showModal && (
        <div className="client-kumpil-modal-overlay">
          <div className="client-kumpil-modal">
            <h2>Submit Application</h2>
            <p>Are you sure you want to submit your Confirmation application?</p>
            <div className="client-kumpil-modal-buttons">
              <button className="client-kumpil-yes-btn" onClick={handleConfirmSubmit}>Yes</button>
              <button className="client-kumpil-modal-no-btn" onClick={() => setShowModal(false)}>No</button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="client-kumpil-modal-overlay">
          <div className="client-kumpil-modal">
            <h2>Success</h2>
            <p>Your Confirmation application has been submitted successfully!</p>
            <div className="client-kumpil-modal-buttons">
              <button className="client-kumpil-yes-btn" onClick={() => setShowSuccessModal(false)}>OK</button>
            </div>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <div className="client-kumpil-modal-overlay">
          <div className="client-kumpil-modal">
            <h2>Error</h2>
            <p>{errorMessage}</p>
            <div className="client-kumpil-modal-buttons">
              <button className="client-kumpil-modal-no-btn" onClick={() => setShowErrorModal(false)}>OK</button>
            </div>
          </div>
        </div>
      )}

      {/* Loading Modal */}
      {isLoading && (
        <div className="client-kumpil-modal-overlay">
          <div className="client-kumpil-modal">
            <h2>Processing Application</h2>
            <p>Please wait while we submit your confirmation application...</p>
            <div className="client-kumpil-loading-spinner">
              <div className="client-kumpil-spinner"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientConfirmation;