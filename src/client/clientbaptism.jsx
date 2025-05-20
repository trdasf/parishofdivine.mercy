import React, { useState, useRef, useEffect } from "react";
import { AiOutlineArrowLeft, AiOutlineCheck, AiOutlineUpload, AiOutlineClose } from "react-icons/ai";
import { useLocation, useNavigate } from "react-router-dom";
import "./ClientBaptism.css";
import axios from 'axios';

// Remove the inline CSS constants
const ClientBaptism = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {clientID} = location.state || {};
  console.log('Received clientID:', clientID);
 
  // State for form data
  const [formData, setFormData] = useState({
    // Baptism Information
    dateOfBaptism: '',
    timeOfBaptism: '',
    firstName: '',
    middleName: '',
    lastName: '',
    sex: '',
    age: '',
    dateOfBirth: '',
    region: '',
    placeOfBirth: '',
    
    // Father Information
    fatherFirstName: '',
    fatherMiddleName: '',
    fatherLastName: '',
    fatherPlaceOfBirth: '',
    fatherDateOfBirth: '',
    fatherContact: '',
    
    // Mother Information
    motherFirstName: '',
    motherMiddleName: '',
    motherLastName: '',
    motherPlaceOfBirth: '',
    motherDateOfBirth: '',
    motherContact: '',
    
    // Marital Status
    maritalStatus: '',
    yearsMarried: '',
    
    // Address
    barangay: '',
    street: '',
    municipality: '',
    province: '',
    addressRegion: '',

    // Godparents
    godFathers: [],
    godMothers: []
  });

  // Add state for form validation errors
  const [validationErrors, setValidationErrors] = useState({});
  const [notMarriedOption, setNotMarriedOption] = useState(false);

  // States for location data
  const [locationData, setLocationData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [focusedField, setFocusedField] = useState(null);
  const [suggestions, setSuggestions] = useState({
    barangay: [],
    municipality: [],
    province: [],
    birthPlace: [],
    fatherBirthPlace: [],
    motherBirthPlace: [],
    region: [],
    addressRegion: []
  });

  // States for dropdown data
  const [schedules, setSchedules] = useState([]);

  // State for unique dates and filtered schedules
  const [uniqueDates, setUniqueDates] = useState([]);
  const [filteredTimes, setFilteredTimes] = useState([]);

  // State for existing baptism applications
  const [existingBaptisms, setExistingBaptisms] = useState([]);

  // State for modals
  const [showModal, setShowModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // States for file uploads
  const [uploadStatus, setUploadStatus] = useState({});
  const [uploadedFiles, setUploadedFiles] = useState({});
  
  // Refs for file inputs - only 3 documents needed
  const fileInputRefs = {
    'birth_cert': useRef(null),
    'marriage_cert': useRef(null),
    'valid_ids': useRef(null)
  };

  // Fetch all necessary data on component mount
  useEffect(() => {
    fetchBaptismSchedules();
    fetchLocations();
  }, []);

  // Fetch existing baptism applications
  const fetchExistingBaptisms = async () => {
    try {
      const response = await fetch('http://parishofdivinemercy.com/backend/get_baptism_applications.php');
      const data = await response.json();
      if (data.success) {
        setExistingBaptisms(data.applications);
      }
    } catch (error) {
      console.error('Error fetching existing baptisms:', error);
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

  // Fetch baptism schedules and process unique dates
  const fetchBaptismSchedules = async () => {
    try {
      const [schedulesResponse, baptismsResponse] = await Promise.all([
        fetch('http://parishofdivinemercy.com/backend/schedule.php'),
        fetch('http://parishofdivinemercy.com/backend/get_baptism_applications.php')
      ]);
      
      const scheduleData = await schedulesResponse.json();
      const baptismData = await baptismsResponse.json();
      
      if (scheduleData.success) {
        // Filter only baptism schedules
        const baptismSchedules = scheduleData.schedules.filter(
          schedule => schedule.sacramentType.toLowerCase() === 'baptism'
        );
        
        // Get existing baptism applications
        const existingBaptismSet = new Set();
        if (baptismData.success) {
          baptismData.applications.forEach(app => {
            existingBaptismSet.add(`${app.dateOfBaptism}-${app.timeOfBaptism}`);
          });
        }

        // Filter out already booked schedules
        const availableSchedules = baptismSchedules.filter(schedule => {
          const key = `${schedule.date}-${schedule.time}`;
          return !existingBaptismSet.has(key);
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

  // Update available times when date is selected
  useEffect(() => {
    if (formData.dateOfBaptism) {
      const timesForDate = schedules
        .filter(schedule => schedule.date === formData.dateOfBaptism)
        .map(schedule => schedule.time);
      
      // Remove duplicates
      const uniqueTimes = [...new Set(timesForDate)];
      setFilteredTimes(uniqueTimes);
      
      // Clear time if it's not available for the new date
      if (!uniqueTimes.includes(formData.timeOfBaptism)) {
        setFormData(prev => ({
          ...prev,
          timeOfBaptism: ''
        }));
      }
    } else {
      setFilteredTimes([]);
    }
  }, [formData.dateOfBaptism, schedules]);

  // Update the filterBarangays function to show all options without requiring input
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

  // Update the filterBirthPlaces function to show suggestions immediately
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
        }));
    }
    
    // If no input, return a limited set of locations to avoid too many results
    return locationData
      .slice(0, 30) // Show first 30 locations
      .map(location => ({
        barangay: location.barangay,
        municipality: location.municipality,
        province: location.province
      }));
  };

  // Update filterRegions function to show all options immediately
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

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear validation error for this field if it exists
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const updated = {...prev};
        delete updated[field];
        return updated;
      });
    }
  };

  // Update handleDateChange to calculate age
  const handleDateChange = (field, value) => {
    // Convert from yyyy-mm-dd to dd/mm/yyyy for display
    const date = new Date(value);
    const formattedDate = date.toLocaleDateString('en-GB');
    handleInputChange(field, formattedDate);

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
      
      handleInputChange('age', age.toString());
    }
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

  // Updated focus handlers to show dropdown immediately without input
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
    } else if (field === 'addressRegion') {
      setSuggestions({
        ...suggestions,
        addressRegion: filterRegions(formData.addressRegion)
      });
    } else if (field === 'birthPlace') {
      setSuggestions({
        ...suggestions,
        birthPlace: filterBirthPlaces(formData.placeOfBirth)
      });
    } else if (field === 'fatherBirthPlace') {
      setSuggestions({
        ...suggestions,
        fatherBirthPlace: filterBirthPlaces(formData.fatherPlaceOfBirth)
      });
    } else if (field === 'motherBirthPlace') {
      setSuggestions({
        ...suggestions,
        motherBirthPlace: filterBirthPlaces(formData.motherPlaceOfBirth)
      });
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

  // Function to trigger file input click
  const triggerFileUpload = (requirementId) => {
    if (fileInputRefs[requirementId] && fileInputRefs[requirementId].current) {
      fileInputRefs[requirementId].current.click();
    }
  };

  // Function to handle requirement checkbox click
  const handleRequirementCheckboxClick = (requirementId) => {
    // If the requirement is currently submitted, clear it when unchecked
    if (uploadStatus[requirementId] === "Submitted") {
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
        [requirementId]: "Not Submitted"
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
      
      // Clear validation error for this requirement if it exists
      if (validationErrors[requirementId]) {
        setValidationErrors(prev => {
          const updated = {...prev};
          delete updated[requirementId];
          return updated;
        });
      }
    }, 1000);
  };

  // Render upload status selector
  const renderStatusSelector = (requirementId) => {
    const status = uploadStatus[requirementId] || "Not Submitted";
    const isSubmitted = status === "Submitted";
    const isNotRequired = status === "Not Required";
    const isUploading = status === "Uploading...";
    
    return (
      <select 
        className={`client-status-dropdown ${
          isSubmitted ? 'client-status-submitted' : 
          isNotRequired ? 'client-status-not-required' : 
          isUploading ? 'client-status-uploading' :
          'client-status-not-submitted'
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
        }}
        disabled={isUploading}
      >
        <option value="Not Submitted">Not Submitted</option>
        <option value="Submitted">Submitted</option>
        {requirementId === 'marriage_cert' && <option value="Not Required">Not Required</option>}
      </select>
    );
  };

  // Updated Form validation function
  const validateForm = () => {
    const errors = {};
    
    // Required fields validation
    const requiredFields = [
      'dateOfBaptism', 'timeOfBaptism',
      'firstName', 'lastName', 'sex', 'dateOfBirth', 'region', 'placeOfBirth',
      'fatherFirstName', 'fatherLastName', 'fatherPlaceOfBirth', 'fatherDateOfBirth',
      'motherFirstName', 'motherLastName', 'motherPlaceOfBirth', 'motherDateOfBirth',
      'maritalStatus',
      'barangay', 'municipality', 'province', 'addressRegion'
    ];
    
    requiredFields.forEach(field => {
      if (!formData[field] || formData[field].trim() === '') {
        errors[field] = true; // Just mark as error without specific message
      }
    });
    
    // Check if we have at least one godfather and one godmother
    if (formData.godFathers.length === 0) {
      errors.godFathers = true;
    }
    
    if (formData.godMothers.length === 0) {
      errors.godMothers = true;
    }
    
    return errors;
  };

  // Updated function to handle form submission
  const handleSubmit = () => {
    // Validate form fields
    const errors = validateForm();
    
    if (Object.keys(errors).length > 0) {
      // Show validation errors
      setValidationErrors(errors);
      
      // Simple error message
      setErrorMessage("All fields must be filled");
      setShowErrorModal(true);
      return;
    }
    
    // If validation passes, show confirmation modal
    setShowModal(true);
  };

  // Handle not married checkbox change
  const handleNotMarriedCheckbox = (e) => {
    const isChecked = e.target.checked;
    setNotMarriedOption(isChecked);
    
    // If checked, set marriage certificate as not required
    if (isChecked) {
      setUploadStatus({
        ...uploadStatus,
        'marriage_cert': 'Not Required'
      });
      
      // Clear any validation error for marriage certificate
      setValidationErrors(prev => {
        const updated = {...prev};
        delete updated.marriage_cert;
        return updated;
      });
    } else {
      // If unchecked and no file is uploaded, set status back to Not Submitted
      if (!uploadedFiles['marriage_cert']) {
        setUploadStatus({
          ...uploadStatus,
          'marriage_cert': 'Not Submitted'
        });
      }
    }
  };

  const handleYes = async () => {
    setShowModal(false);
    setIsLoading(true);
    try {
      // Prepare form data for submission
      const submitData = {
        ...formData,
        clientID: clientID,
      };
  
      // Convert dates from dd/mm/yyyy to yyyy-mm-dd for database
      if (submitData.dateOfBirth) {
        const [day, month, year] = submitData.dateOfBirth.split('/');
        submitData.dateOfBirth = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
      if (submitData.fatherDateOfBirth) {
        const [day, month, year] = submitData.fatherDateOfBirth.split('/');
        submitData.fatherDateOfBirth = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
      if (submitData.motherDateOfBirth) {
        const [day, month, year] = submitData.motherDateOfBirth.split('/');
        submitData.motherDateOfBirth = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
      // Format dateOfBaptism to yyyy-mm-dd
      if (submitData.dateOfBaptism) {
        const date = new Date(submitData.dateOfBaptism);
        submitData.dateOfBaptism = date.toISOString().split('T')[0];
      }
  
      // Create FormData object for submission
      const formDataToSend = new FormData();
      
      // Add all form fields
      Object.keys(submitData).forEach(key => {
        if (key !== 'godFathers' && key !== 'godMothers') {
          formDataToSend.append(key, submitData[key]);
        }
      });
      
      // Add godparents as JSON
      formDataToSend.append('godFathers', JSON.stringify(submitData.godFathers));
      formDataToSend.append('godMothers', JSON.stringify(submitData.godMothers));
  
      // Submit the form
      const response = await fetch('http://parishofdivinemercy.com/backend/baptism_application.php', {
        method: 'POST',
        body: formDataToSend
      });
  
      const responseText = await response.text();
      console.log('Raw response:', responseText);
  
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('Failed to parse response as JSON:', responseText);
        throw new Error('Invalid response from server');
      }
  
      console.log('Parsed response:', data);
      
      setIsLoading(false);
      
      if (data.success) {
        // Send confirmation email
        try {
          const emailResponse = await fetch('http://parishofdivinemercy.com/backend/send_email.php', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              clientID: clientID,
              baptismData: formData
            })
          });
          
          const emailData = await emailResponse.json();
          console.log('Email response:', emailData);
        } catch (emailError) {
          console.error('Error sending email:', emailError);
          // Continue anyway - don't block the success message
        }
        
        setShowSuccessModal(true);
        // Redirect after success
        setTimeout(() => {
          navigate('/client-appointment');
        }, 2000);
      } else {
        setErrorMessage(data.message || 'Failed to submit application');
        setShowErrorModal(true);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setIsLoading(false);
      setErrorMessage(error.message || 'Error submitting application');
      setShowErrorModal(true);
    }
  };

  // Add godparent
  const addGodparent = (type) => {
    if (type === 'godfather') {
      const godFatherName = document.getElementById('godfather-input').value;
      if (godFatherName) {
        setFormData(prev => ({
          ...prev,
          godFathers: [...prev.godFathers, godFatherName]
        }));
        document.getElementById('godfather-input').value = '';
        
        // Clear validation error for godFathers if it exists
        if (validationErrors.godFathers) {
          setValidationErrors(prev => {
            const updated = {...prev};
            delete updated.godFathers;
            return updated;
          });
        }
      }
    } else {
      const godMotherName = document.getElementById('godmother-input').value;
      if (godMotherName) {
        setFormData(prev => ({
          ...prev,
          godMothers: [...prev.godMothers, godMotherName]
        }));
        document.getElementById('godmother-input').value = '';
        
        // Clear validation error for godMothers if it exists
        if (validationErrors.godMothers) {
          setValidationErrors(prev => {
            const updated = {...prev};
            delete updated.godMothers;
            return updated;
          });
        }
      }
    }
  };

  // Remove godparent
  const removeGodparent = (type, index) => {
    if (type === 'godfather') {
      setFormData(prev => ({
        ...prev,
        godFathers: prev.godFathers.filter((_, i) => i !== index)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        godMothers: prev.godMothers.filter((_, i) => i !== index)
      }));
    }
  };

  // Update the handleBirthPlaceChange to handle partial input
  const handleBirthPlaceChange = (e) => {
    const value = e.target.value;
    handleInputChange('placeOfBirth', value);
    
    if (focusedField === 'birthPlace') {
      setSuggestions({
        ...suggestions,
        birthPlace: filterBirthPlaces(value)
      });
    }
  };

  // Update the handleSelectBirthPlace to ensure consistent format
  const handleSelectBirthPlace = (location) => {
    const formattedPlace = `${location.barangay}, ${location.municipality}, ${location.province}`;
    handleInputChange('placeOfBirth', formattedPlace);
  
    setFocusedField(null);
  };

  // Add handlers for father's birth place
  const handleFatherBirthPlaceChange = (e) => {
    const value = e.target.value;
    handleInputChange('fatherPlaceOfBirth', value);
    
    if (focusedField === 'fatherBirthPlace') {
      setSuggestions({
        ...suggestions,
        fatherBirthPlace: filterBirthPlaces(value)
      });
    }
  };

  const handleSelectFatherBirthPlace = (location) => {
    const formattedPlace = `${location.barangay}, ${location.municipality}, ${location.province}`;
    handleInputChange('fatherPlaceOfBirth', formattedPlace);
    setFocusedField(null);
  };

  // Add handlers for mother's birth place
  const handleMotherBirthPlaceChange = (e) => {
    const value = e.target.value;
    handleInputChange('motherPlaceOfBirth', value);
    
    if (focusedField === 'motherBirthPlace') {
      setSuggestions({
        ...suggestions,
        motherBirthPlace: filterBirthPlaces(value)
      });
    }
  };

  const handleSelectMotherBirthPlace = (location) => {
    const formattedPlace = `${location.barangay}, ${location.municipality}, ${location.province}`;
    handleInputChange('motherPlaceOfBirth', formattedPlace);
    setFocusedField(null);
  };

  // Update marital status logic
  const handleMaritalStatusChange = (e) => {
    const value = e.target.value;
    handleInputChange('maritalStatus', value);
    if (value !== 'Married') {
      handleInputChange('yearsMarried', '0');
    }
  };

  // Add handlers for region fields
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
  
  const handleAddressRegionChange = (e) => {
    const value = e.target.value;
    handleInputChange('addressRegion', value);
    
    if (focusedField === 'addressRegion') {
      setSuggestions({
        ...suggestions,
        addressRegion: filterRegions(value)
      });
    }
  };
  
  const handleSelectRegion = (region) => {
    handleInputChange('region', region);
    setFocusedField(null);
  };
  
  const handleSelectAddressRegion = (region) => {
    handleInputChange('addressRegion', region);
    setFocusedField(null);
  };

  return (
    <div className="client-baptism-container">
      {/* Header */}
      <div className="client-baptism-header">
        <div className="client-left-section">
          <button className="client-back-button" onClick={() => navigate(-1)}>
            <AiOutlineArrowLeft className="client-back-icon" /> Back
          </button>
        </div>
      </div>
      <h1 className="client-title">Baptism Application</h1>
      
      {/* Baptismal Data Section */}
      <div className="client-baptismal-data">
        <div className="client-baptismal-row-date">
          <div className="client-baptismal-field-date">
            <label>Date of Appointment</label>
            <select 
              value={formData.dateOfBaptism}
              onChange={(e) => handleInputChange('dateOfBaptism', e.target.value)}
              className={validationErrors.dateOfBaptism ? 'client-error-input' : ''}
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
          
          <div className="client-baptismal-field-time">
            <label>Time of Appointment</label>
            <select 
              value={formData.timeOfBaptism}
              onChange={(e) => handleInputChange('timeOfBaptism', e.target.value)}
              disabled={!formData.dateOfBaptism}
              className={validationErrors.timeOfBaptism ? 'client-error-input' : ''}
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

        <div className="client-bypart">
          <h3 className="client-sub-title">Baptism Information</h3>
          <div className="client-baptismal-row">
            <div className="client-baptismal-field">
              <label>First Name of the Baptized</label>
              <input 
                type="text" 
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                className={validationErrors.firstName ? 'client-error-input' : ''}
              />
            </div>
            <div className="client-baptismal-field">
              <label>Middle Name of the Baptized</label>
              <input 
                type="text"
                value={formData.middleName}
                onChange={(e) => handleInputChange('middleName', e.target.value)}
              />
            </div>
            <div className="client-baptismal-field">
              <label>Last Name of the Baptized</label>
              <input 
                type="text"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                className={validationErrors.lastName ? 'client-error-input' : ''}
              />
            </div>
            <div className="client-baptismal-field">
              <label>Date of Birth (dd/mm/yyyy)</label>
              <input 
                type="date"
                className={`date-input ${validationErrors.dateOfBirth ? 'client-error-input' : ''}`}
                onChange={(e) => handleDateChange('dateOfBirth', e.target.value)}
              />
            </div>
          </div>
          <div className="client-baptismal-row">
          <div className="client-baptismal-field-ga">
              <label>Sex</label>
              <select 
                value={formData.sex}
                onChange={(e) => handleInputChange('sex', e.target.value)}
                className={validationErrors.sex ? 'client-error-input' : ''}
              >
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div className="client-baptismal-field-ga">
              <label>Age</label>
              <input 
                type="text"
                value={formData.age}
                onChange={(e) => handleInputChange('age', e.target.value)}
              />
            </div>
            <div className="client-baptismal-field location-dropdown-container">
              <label>Birth Region</label>
              <input 
                type="text"
                value={formData.region}
                onChange={handleRegionChange}
                onFocus={() => handleFocus('region')}
                placeholder="Enter birth region"
                className={validationErrors.region ? 'client-error-input' : ''}
              />
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
            <div className="client-baptismal-field location-dropdown-container">
              <label>Place of Birth</label>
              <input 
                type="text"
                placeholder="Type to search (Barangay, Municipality, Province)"
                value={formData.placeOfBirth}
                onChange={handleBirthPlaceChange}
                onFocus={() => handleFocus('birthPlace')}
                className={validationErrors.placeOfBirth ? 'client-error-input' : ''}
              />
              {focusedField === 'birthPlace' && (
                <div className="location-dropdown">
                  {suggestions.birthPlace && suggestions.birthPlace.length > 0 ? (
                    suggestions.birthPlace.map((location, index) => (
                      <div 
                        key={index}
                        onClick={() => handleSelectBirthPlace(location)}
                        className="location-dropdown-item"
                      >
                        {`${location.barangay}, ${location.municipality}, ${location.province}`}
                      </div>
                    ))
                  ) : (
                    <div className="location-dropdown-item">No locations found</div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Father's Information */}
          <h3 className="client-sub-title">Father Information</h3>
          <div className="client-baptismal-row">
            <div className="client-baptismal-field">
              <label>Father's First Name</label>
              <input 
                type="text"
                value={formData.fatherFirstName}
                onChange={(e) => handleInputChange('fatherFirstName', e.target.value)}
                className={validationErrors.fatherFirstName ? 'client-error-input' : ''}
              />
            </div>
            <div className="client-baptismal-field">
              <label>Father's Middle Name</label>
              <input 
                type="text"
                value={formData.fatherMiddleName}
                onChange={(e) => handleInputChange('fatherMiddleName', e.target.value)}
              />
            </div>
            <div className="client-baptismal-field">
              <label>Father's Last Name</label>
              <input 
                type="text"
                value={formData.fatherLastName}
                onChange={(e) => handleInputChange('fatherLastName', e.target.value)}
                className={validationErrors.fatherLastName ? 'client-error-input' : ''}
              />
            </div>
          </div>
          <div className="client-baptismal-row">
            <div className="client-baptismal-field location-dropdown-container">
              <label>Father's Place of Birth</label>
              <input 
                type="text"
                placeholder="Type to search (Barangay, Municipality, Province)"
                value={formData.fatherPlaceOfBirth}
                onChange={handleFatherBirthPlaceChange}
                onFocus={() => handleFocus('fatherBirthPlace')}
                className={validationErrors.fatherPlaceOfBirth ? 'client-error-input' : ''}
              />
              {focusedField === 'fatherBirthPlace' && (
                <div className="location-dropdown">
                  {suggestions.fatherBirthPlace && suggestions.fatherBirthPlace.length > 0 ? (
                    suggestions.fatherBirthPlace.map((location, index) => (
                      <div 
                        key={index}
                        onClick={() => handleSelectFatherBirthPlace(location)}
                        className="location-dropdown-item"
                      >
                        {`${location.barangay}, ${location.municipality}, ${location.province}`}
                      </div>
                    ))
                  ) : (
                    <div className="location-dropdown-item">No locations found</div>
                  )}
                </div>
              )}
            </div>
            <div className="client-baptismal-field-fpob">
              <label>Father's Date of Birth (dd/mm/yyyy)</label>
              <input 
                type="date"
                className={`date-input ${validationErrors.fatherDateOfBirth ? 'client-error-input' : ''}`}
                onChange={(e) => handleDateChange('fatherDateOfBirth', e.target.value)}
              />
            </div>
          </div>

          <div className="client-baptismal-row">
            <div className="client-baptismal-field">
              <label>Father's Contact Number</label>
              <input 
                type="text"
                value={formData.fatherContact}
                onChange={(e) => handleInputChange('fatherContact', e.target.value)}
              />
            </div>
          </div>

          {/* Mother's Information */}
          <h3 className="client-sub-title">Mother Information</h3>
          <div className="client-baptismal-row">
            <div className="client-baptismal-field">
              <label>Mother's First Name</label>
              <input 
                type="text"
                value={formData.motherFirstName}
                onChange={(e) => handleInputChange('motherFirstName', e.target.value)}
                className={validationErrors.motherFirstName ? 'client-error-input' : ''}
              />
            </div>
            <div className="client-baptismal-field">
              <label>Mother's Middle Name</label>
              <input 
                type="text"
                value={formData.motherMiddleName}
                onChange={(e) => handleInputChange('motherMiddleName', e.target.value)}
              />
            </div>
            <div className="client-baptismal-field">
              <label>Mother's Last Name</label>
              <input 
                type="text"
                value={formData.motherLastName}
                onChange={(e) => handleInputChange('motherLastName', e.target.value)}
                className={validationErrors.motherLastName ? 'client-error-input' : ''}
              />
            </div>
          </div>

          <div className="client-baptismal-row">
            <div className="client-baptismal-field location-dropdown-container">
              <label>Mother's Place of Birth</label>
              <input 
                type="text"
                placeholder="Type to search (Barangay, Municipality, Province)"
                value={formData.motherPlaceOfBirth}
                onChange={handleMotherBirthPlaceChange}
                onFocus={() => handleFocus('motherBirthPlace')}
                className={validationErrors.motherPlaceOfBirth ? 'client-error-input' : ''}
              />
              {focusedField === 'motherBirthPlace' && (
                <div className="location-dropdown">
                  {suggestions.motherBirthPlace && suggestions.motherBirthPlace.length > 0 ? (
                    suggestions.motherBirthPlace.map((location, index) => (
                      <div 
                        key={index}
                        onClick={() => handleSelectMotherBirthPlace(location)}
                        className="location-dropdown-item"
                      >
                        {`${location.barangay}, ${location.municipality}, ${location.province}`}
                      </div>
                    ))
                  ) : (
                    <div className="location-dropdown-item">No locations found</div>
                  )}
                </div>
              )}
            </div>
            <div className="client-baptismal-field-fpob">
              <label>Mother's Date of Birth (dd/mm/yyyy)</label>
              <input 
                type="date"
                className={`date-input ${validationErrors.motherDateOfBirth ? 'client-error-input' : ''}`}
                onChange={(e) => handleDateChange('motherDateOfBirth', e.target.value)}
              />
            </div>
          </div>

          <div className="client-baptismal-row">
            <div className="client-baptismal-field">
              <label>Mother's Contact Number</label>
              <input 
                type="text"
                value={formData.motherContact}
                onChange={(e) => handleInputChange('motherContact', e.target.value)}
              />
            </div>
          </div>

          {/* Marital Status */}
          <h3 className="client-sub-title">Parents Marital Status</h3>
          <div className="client-baptismal-row-pms">
            <div className="client-marital-status">
              <label className="client-section-label">Select the parent's marital status by choosing one of the following options:</label>
              <div className="client-marital-options">
                <div className="client-pms-label">
                  <input 
                    type="radio" 
                    id="married" 
                    name="maritalStatus"
                    value="Married"
                    onChange={handleMaritalStatusChange}
                    checked={formData.maritalStatus === 'Married'}
                    className={validationErrors.maritalStatus ? 'client-error-input' : ''}
                  />
                  <label htmlFor="married">Married</label>
                </div>
                <div className="client-pms-label">
                  <input 
                    type="radio" 
                    id="civil"
                    name="maritalStatus"
                    value="Civil"
                    onChange={handleMaritalStatusChange}
                    checked={formData.maritalStatus === 'Civil'}
                    className={validationErrors.maritalStatus ? 'client-error-input' : ''}
                  />
                  <label htmlFor="civil">Civil</label>
                </div>
                <div className="client-pms-label">
                  <input 
                    type="radio" 
                    id="living-together"
                    name="maritalStatus"
                    value="Living Together"
                    onChange={handleMaritalStatusChange}
                    checked={formData.maritalStatus === 'Living Together'}
                    className={validationErrors.maritalStatus ? 'client-error-input' : ''}
                  />
                  <label htmlFor="living-together">Living Together</label>
                </div>
              </div>
            </div>

            <div className="client-years-married">
              <input 
                type="text" 
                className="client-short-input"
                value={formData.yearsMarried}
                onChange={(e) => handleInputChange('yearsMarried', e.target.value)}
                disabled={formData.maritalStatus !== 'Married'}
              />
              <label>Number of Years Married</label>
            </div>
          </div>

          {/* Address Fields */}
          <div className="client-baptismal-row client-address-row">
          <div className="client-baptismal-field">
              <label>Street</label>
              <input 
                type="text"
                value={formData.street}
                onChange={(e) => handleInputChange('street', e.target.value)}
              />
            </div>
            <div className="client-baptismal-field location-dropdown-container">
              <label>Barangay</label>
              <input 
                type="text"
                value={formData.barangay}
                onChange={handleBarangayChange}
                onFocus={() => handleFocus('barangay')}
                placeholder="Type to search"
                className={validationErrors.barangay ? 'client-error-input' : ''}
              />
              {focusedField === 'barangay' && (
                <div className="location-dropdown">
                  {suggestions.barangay && suggestions.barangay.length > 0 ? (
                    suggestions.barangay.map((barangay, index) => (
                      <div 
                        key={index}
                        onClick={() => handleSelectBarangay(barangay)}
                        className="location-dropdown-item"
                      >
                        {barangay}
                      </div>
                    ))
                  ) : (
                    <div className="location-dropdown-item">No barangays found</div>
                  )}
                </div>
              )}
            </div>
            <div className="client-baptismal-field location-dropdown-container">
              <label>Municipality</label>
              <input 
                type="text"
                value={formData.municipality}
                onChange={handleMunicipalityChange}
                onFocus={() => handleFocus('municipality')}
                placeholder="Type to search"
                className={validationErrors.municipality ? 'client-error-input' : ''}
              />
              {focusedField === 'municipality' && (
                <div className="location-dropdown">
                  {suggestions.municipality && suggestions.municipality.length > 0 ? (
                    suggestions.municipality.map((municipality, index) => (
                      <div 
                        key={index}
                        onClick={() => handleSelectMunicipality(municipality)}
                        className="location-dropdown-item"
                      >
                        {municipality}
                      </div>
                    ))
                  ) : (
                    <div className="location-dropdown-item">No municipalities found</div>
                  )}
                </div>
              )}
            </div>
            <div className="client-baptismal-field location-dropdown-container">
              <label>Province</label>
              <input 
                type="text"
                value={formData.province}
                onChange={handleProvinceChange}
                onFocus={() => handleFocus('province')}
                placeholder="Type to search"
                className={validationErrors.province ? 'client-error-input' : ''}
              />
              {focusedField === 'province' && (
                <div className="location-dropdown">
                  {suggestions.province && suggestions.province.length > 0 ? (
                    suggestions.province.map((province, index) => (
                      <div 
                        key={index}
                        onClick={() => handleSelectProvince(province)}
                        className="location-dropdown-item"
                      >
                        {province}
                      </div>
                    ))
                  ) : (
                    <div className="location-dropdown-item">No provinces found</div>
                  )}
                </div>
              )}
            </div>
            <div className="client-baptismal-field location-dropdown-container">
              <label>Address Region</label>
              <input 
                type="text"
                value={formData.addressRegion}
                onChange={handleAddressRegionChange}
                onFocus={() => handleFocus('addressRegion')}
                placeholder="Enter address region"
                className={validationErrors.addressRegion ? 'client-error-input' : ''}
              />
              {focusedField === 'addressRegion' && (
                <div className="location-dropdown">
                  {suggestions.addressRegion && suggestions.addressRegion.length > 0 ? (
                    suggestions.addressRegion.map((region, index) => (
                      <div 
                        key={index}
                        onClick={() => handleSelectAddressRegion(region)}
                        className="location-dropdown-item"
                      >
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
          
          {/* Godparents */}
          <div className="client-bypart">
            <h3 className="client-sub-title">Godparents Information</h3>
            <div className="client-baptismal-row">
              <div className="client-baptismal-field">
                <label>God Father Name (Ninong)</label>
                <input 
                  type="text" 
                  id="godfather-input" 
                  className={validationErrors.godFathers ? 'client-error-input' : ''}
                />
              </div>
              <button className="client-add-button" onClick={() => addGodparent('godfather')}>Add</button>
            </div>
            {formData.godFathers.map((godfather, index) => (
              <div key={index} className="added-godparent">
                <span>{godfather}</span>
                <button 
                  className="remove-godparent-btn"
                  onClick={() => removeGodparent('godfather', index)}
                >
                  <AiOutlineClose />
                </button>
              </div>
            ))}

            <div className="client-baptismal-row">
              <div className="client-baptismal-field">
                <label>God Mother Name (Ninang)</label>
                <input 
                  type="text" 
                  id="godmother-input" 
                  className={validationErrors.godMothers ? 'client-error-input' : ''}
                />
              </div>
              <button className="client-add-button" onClick={() => addGodparent('godmother')}>Add</button>
            </div>
            {formData.godMothers.map((godmother, index) => (
              <div key={index} className="added-godparent">
                <span>{godmother}</span>
                <button 
                  className="remove-godparent-btn"
                  onClick={() => removeGodparent('godmother', index)}
                >
                  <AiOutlineClose />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Requirements Section - Only 3 documents */}
      <div className="client-requirements-container">
      <h3 className="client-section-header">Documents Required(Bring the following documents)</h3>
          <div className="client-info-list">
            <div className="client-info-item">
              <p>Birth Certificate of the child(PSA or Local Civil Registrar Copy)</p>
            </div>
            <div className="client-info-item">
              <p>Parents' Marriage Certificate(If married in the Catholic Church)</p>
            </div>
            <div className="client-info-item">
              <p>Valid IDs of Parents and Godparents</p>
            </div>
            <div className="client-info-item">
              <p>Certificate of Permission(If outside the Parish)</p>
            </div>
          </div>

          <h3 className="client-section-header">Requirements for Parent</h3>
          <div className="client-info-list">
            <div className="client-info-item">
              <p>At least one parent must be Catholic</p>
            </div>
            <div className="client-info-item">
              <p>Parents should be willing to raise the child in the Catholic faith</p>
            </div>
            <div className="client-info-item">
              <p>Must attend Pre-Baptismal Seminar (Required in most parishes)</p>
            </div>
          </div>

          <h3 className="client-section-header">Requirements for Godparents</h3>
          <div className="client-info-list">
            <div className="client-info-item">
              <p>Must be a practicing Catholic</p>
            </div>
            <div className="client-info-item">
              <p>Must have received the Sacraments of Baptism, Confirmation, and Holy Eucharist</p>
            </div>
            <div className="client-info-item">
              <p>Must be at least 16 years old</p>
            </div>
            <div className="client-info-item">
              <p>If married, must be married in the Catholic Church</p>
            </div>
            <div className="client-info-item">
              <p>Confirmation Certificate (Some parishes require this for proof of faith practice)</p>
            </div>
            <div className="client-info-item">
              <p>Certificate of Permission (if outside the Parish)</p>
            </div>
          </div>
        </div>


      <div className="client-button-container">
        <button className="client-submit-btn" onClick={handleSubmit}>Submit</button>
        <button className="client-cancel-btn" onClick={() => navigate(-1)}>Cancel</button>
      </div>

      {/* Submit Confirmation Modal */}
      {showModal && (
        <div className="client-modal-overlay">
          <div className="client-modal">
            <h2>Submit Application</h2>
            <hr className="custom-hr-b"/>
            <p>Are you sure you want to submit your Baptism application?</p>
            <div className="client-modal-buttons">
              <button className="client-yes-btn" onClick={handleYes}>Yes</button>
              <button className="client-modal-no-btn" onClick={() => setShowModal(false)}>No</button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="client-modal-overlay">
          <div className="client-modal">
            <h2>Success</h2>
            <hr className="custom-hr-b"/>
            <p>Your Baptism application has been submitted successfully!</p>
            <div className="client-modal-buttons">
              <button className="client-yes-btn" onClick={() => setShowSuccessModal(false)}>OK</button>
            </div>
          </div>
        </div>
      )}

      {/* Error Modal - Simplified */}
      {showErrorModal && (
        <div className="client-modal-overlay">
          <div className="client-modal">
            <h2>Form Validation Error</h2>
            <hr className="custom-hr-b"/>
            <p>{errorMessage}</p>
            <div className="client-modal-buttons">
              <button className="client-modal-no-btn" onClick={() => setShowErrorModal(false)}>OK</button>
            </div>
          </div>
        </div>
      )}

      {/* Loading Modal */}
      {isLoading && (
        <div className="client-modal-overlay">
          <div className="client-modal">
            <h2>Processing Application</h2>
            <hr className="custom-hr-b"/>
            <p>Please wait while we submit your baptism application...</p>
            <div className="client-loading-spinner">
              <div className="client-spinner"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientBaptism;