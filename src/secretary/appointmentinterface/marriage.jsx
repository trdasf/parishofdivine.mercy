import React, { useState, useRef, useEffect } from "react";
import { AiOutlineArrowLeft, AiOutlineUpload } from "react-icons/ai"; 
import "../../client/ClientMarriage.css";
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const Marriage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [showModal, setShowModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [locationData, setLocationData] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [uniqueDates, setUniqueDates] = useState([]);
  const [filteredTimes, setFilteredTimes] = useState([]);
  const [focusedField, setFocusedField] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [suggestions, setSuggestions] = useState({
    barangay: [],
    municipality: [],
    province: [],
    placeOfBirth: [],
    groomPlaceOfBirth: [],
    bridePlaceOfBirth: [],
    groomBarangay: [],
    groomMunicipality: [],
    groomProvince: [],
    groomRegion: [],
    brideBarangay: [],
    brideMunicipality: [],
    brideProvince: [],
    brideRegion: [],
    firstWitnessBarangay: [],
    firstWitnessMunicipality: [],
    firstWitnessProvince: [],
    firstWitnessRegion: [],
    secondWitnessBarangay: [],
    secondWitnessMunicipality: [],
    secondWitnessProvince: [],
    secondWitnessRegion: []
  });
  
  const [formData, setFormData] = useState({
    // Groom Information
    groom_first_name: '',
    groom_middle_name: '',
    groom_last_name: '',
    groom_age: '',
    groom_dateOfBirth: '',
    groom_dateOfBaptism: '',
    groom_churchOfBaptism: '',
    groom_placeOfBirth: '',
    groom_street: '',
    groom_barangay: '',
    groom_municipality: '',
    groom_province: '',
    groom_region: '',

    // Bride Information
    bride_first_name: '',
    bride_middle_name: '',
    bride_last_name: '',
    bride_age: '',
    bride_dateOfBirth: '',
    bride_dateOfBaptism: '',
    bride_churchOfBaptism: '',
    bride_placeOfBirth: '',
    bride_street: '',
    bride_barangay: '',
    bride_municipality: '',
    bride_province: '',
    bride_region: '',

    // Witness Information
    first_witness_first_name: '',
    first_witness_middle_name: '',
    first_witness_last_name: '',
    first_witness_gender: '',
    first_witness_age: '',
    first_witness_dateOfBirth: '',
    first_witness_contact_number: '',
    first_witness_street: '',
    first_witness_barangay: '',
    first_witness_municipality: '',
    first_witness_province: '',
    first_witness_region: '',

    second_witness_first_name: '',
    second_witness_middle_name: '',
    second_witness_last_name: '',
    second_witness_gender: '',
    second_witness_age: '',
    second_witness_dateOfBirth: '',
    second_witness_contact_number: '',
    second_witness_street: '',
    second_witness_barangay: '',
    second_witness_municipality: '',
    second_witness_province: '',
    second_witness_region: '',

    // Wedding Details
    date: '',
    time: ''
  });

  useEffect(() => {
    fetchLocations();
    fetchMarriageSchedules();
  }, []);

    const fetchLocations = async () => {
      try {
        const response = await axios.get('http://parishofdivinemercy.com/backend/get_location.php');
      if (response.data.success) {
        setLocationData(response.data.locations);
      } else {
        setLocationData(response.data); // Fallback in case the API format is different
      }
      } catch (error) {
        console.error('Error fetching locations:', error);
      }
    };

  // Fetch marriage schedules and process unique dates
  const fetchMarriageSchedules = async () => {
    try {
      const [schedulesResponse, marriageResponse] = await Promise.all([
        fetch('http://parishofdivinemercy.com/backend/schedule.php'),
        fetch('http://parishofdivinemercy.com/backend/get_marriage_applications.php')
      ]);
      
      const scheduleData = await schedulesResponse.json();
      const marriageData = await marriageResponse.json();
      
      if (scheduleData.success) {
        // Filter only marriage schedules
        const marriageSchedules = scheduleData.schedules.filter(
          schedule => schedule.sacramentType.toLowerCase() === 'marriage'
        );
        
        // Get existing marriage applications
        const existingMarriageSet = new Set();
        if (marriageData.success) {
          marriageData.applications.forEach(app => {
            existingMarriageSet.add(`${app.date}-${app.time}`);
          });
        }

        // Filter out already booked schedules
        const availableSchedules = marriageSchedules.filter(schedule => {
          const key = `${schedule.date}-${schedule.time}`;
          return !existingMarriageSet.has(key);
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
    if (formData.date) {
      const timesForDate = schedules
        .filter(schedule => schedule.date === formData.date)
        .map(schedule => schedule.time);
      
      // Remove duplicates
      const uniqueTimes = [...new Set(timesForDate)];
      setFilteredTimes(uniqueTimes);
      
      // Clear time if it's not available for the new date
      if (!uniqueTimes.includes(formData.time)) {
        setFormData(prev => ({
          ...prev,
          time: ''
        }));
      }
    } else {
      setFilteredTimes([]);
    }
  }, [formData.date, schedules]);

  // Enhanced filter functions for addresses
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

  // Filter place of birth suggestions
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

  // Handlers for input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle date changes with automatic age calculation
  const handleDateChange = (field, value, targetAgeField = null) => {
    // Convert to standard yyyy-mm-dd format
    const dateString = value ? String(value).trim() : '';
    
    // Directly store the date value without any processing
    handleInputChange(field, dateString);

    // Log the date for debugging
    console.log(`Setting ${field} to:`, dateString);

    // Calculate age if this is a date of birth field and target age field is provided
    if (field.includes('dateOfBirth') && targetAgeField) {
      try {
        const today = new Date();
        const birthDate = new Date(dateString);
        
        // Ensure valid date before calculating age
        if (!isNaN(birthDate.getTime())) {
          let age = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();
          
          // Adjust age if birthday hasn't occurred this year
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
          }
          
          handleInputChange(targetAgeField, age.toString());
          console.log(`Calculated age for ${field}:`, age);
        } else {
          console.error('Invalid date for age calculation:', dateString);
          handleInputChange(targetAgeField, '');
        }
      } catch (error) {
        console.error('Error calculating age:', error);
        handleInputChange(targetAgeField, '');
      }
    }
  };

  // Place of Birth handlers for groom
  const handleGroomPlaceOfBirthChange = (e) => {
    const value = e.target.value;
    handleInputChange('groom_placeOfBirth', value);
    if (focusedField === 'groomPlaceOfBirth') {
      setSuggestions(prev => ({ ...prev, groomPlaceOfBirth: filterBirthPlaces(value) }));
    }
  };

  const handleSelectGroomPlaceOfBirth = (location) => {
    const formattedPlace = `${location.barangay}, ${location.municipality}, ${location.province}`;
    handleInputChange('groom_placeOfBirth', formattedPlace);
    setFocusedField(null);
  };

  // Place of Birth handlers for bride
  const handleBridePlaceOfBirthChange = (e) => {
    const value = e.target.value;
    handleInputChange('bride_placeOfBirth', value);
    if (focusedField === 'bridePlaceOfBirth') {
      setSuggestions(prev => ({ ...prev, bridePlaceOfBirth: filterBirthPlaces(value) }));
    }
  };

  const handleSelectBridePlaceOfBirth = (location) => {
    const formattedPlace = `${location.barangay}, ${location.municipality}, ${location.province}`;
    handleInputChange('bride_placeOfBirth', formattedPlace);
    setFocusedField(null);
  };

  // Handlers for groom address fields
  const handleGroomBarangayChange = (e) => {
    const value = e.target.value;
    handleInputChange('groom_barangay', value);
    
    if (focusedField === 'groomBarangay') {
      setSuggestions(prev => ({ 
        ...prev, 
        groomBarangay: filterBarangays(value, formData.groom_municipality, formData.groom_province) 
      }));
    }
  };

  const handleGroomMunicipalityChange = (e) => {
    const value = e.target.value;
    handleInputChange('groom_municipality', value);
    
    if (focusedField === 'groomMunicipality') {
      setSuggestions(prev => ({ 
        ...prev, 
        groomMunicipality: filterMunicipalities(value, formData.groom_province) 
      }));
    }
    
    // If typing a municipality, check if it has a province
    if (value) {
      const matchedLocation = locationData.find(loc => 
        loc.municipality.toLowerCase() === value.toLowerCase()
      );
      if (matchedLocation && !formData.groom_province) {
        handleInputChange('groom_province', matchedLocation.province);
      }
    }
  };

  const handleGroomProvinceChange = (e) => {
    const value = e.target.value;
    handleInputChange('groom_province', value);
    
    if (focusedField === 'groomProvince') {
      setSuggestions(prev => ({ ...prev, groomProvince: filterProvinces(value) }));
    }
  };

  const handleSelectGroomBarangay = (barangay) => {
    handleInputChange('groom_barangay', barangay);
    setFocusedField(null);
    
    // Check if this barangay has a specific municipality and province
    const matchedLocation = locationData.find(loc => loc.barangay === barangay);
    if (matchedLocation) {
      if (!formData.groom_municipality) {
        handleInputChange('groom_municipality', matchedLocation.municipality);
      }
      if (!formData.groom_province) {
        handleInputChange('groom_province', matchedLocation.province);
      }
    }
  };

  const handleSelectGroomMunicipality = (municipality) => {
    handleInputChange('groom_municipality', municipality);
    
    // Find the province for this municipality
    const matchedLocation = locationData.find(loc => loc.municipality === municipality);
    if (matchedLocation && !formData.groom_province) {
      handleInputChange('groom_province', matchedLocation.province);
    }
    
    setFocusedField(null);
  };

  const handleSelectGroomProvince = (province) => {
    handleInputChange('groom_province', province);
    setFocusedField(null);
  };

  // Handlers for bride address fields (similar to groom)
  const handleBrideBarangayChange = (e) => {
    const value = e.target.value;
    handleInputChange('bride_barangay', value);
    
    if (focusedField === 'brideBarangay') {
      setSuggestions(prev => ({ 
        ...prev, 
        brideBarangay: filterBarangays(value, formData.bride_municipality, formData.bride_province) 
      }));
    }
  };

  const handleBrideMunicipalityChange = (e) => {
    const value = e.target.value;
    handleInputChange('bride_municipality', value);
    
    if (focusedField === 'brideMunicipality') {
      setSuggestions(prev => ({ 
        ...prev, 
        brideMunicipality: filterMunicipalities(value, formData.bride_province) 
      }));
    }
    
    if (value) {
      const matchedLocation = locationData.find(loc => 
        loc.municipality.toLowerCase() === value.toLowerCase()
      );
      if (matchedLocation && !formData.bride_province) {
        handleInputChange('bride_province', matchedLocation.province);
      }
    }
  };

  const handleBrideProvinceChange = (e) => {
    const value = e.target.value;
    handleInputChange('bride_province', value);
    
    if (focusedField === 'brideProvince') {
      setSuggestions(prev => ({ ...prev, brideProvince: filterProvinces(value) }));
    }
  };

  const handleSelectBrideBarangay = (barangay) => {
    handleInputChange('bride_barangay', barangay);
    setFocusedField(null);
    
    const matchedLocation = locationData.find(loc => loc.barangay === barangay);
    if (matchedLocation) {
      if (!formData.bride_municipality) {
        handleInputChange('bride_municipality', matchedLocation.municipality);
      }
      if (!formData.bride_province) {
        handleInputChange('bride_province', matchedLocation.province);
      }
    }
  };

  const handleSelectBrideMunicipality = (municipality) => {
    handleInputChange('bride_municipality', municipality);
    
    const matchedLocation = locationData.find(loc => loc.municipality === municipality);
    if (matchedLocation && !formData.bride_province) {
      handleInputChange('bride_province', matchedLocation.province);
    }
    
    setFocusedField(null);
  };

  const handleSelectBrideProvince = (province) => {
    handleInputChange('bride_province', province);
    setFocusedField(null);
  };

  // Handlers for first witness address fields
  const handleFirstWitnessBarangayChange = (e) => {
    const value = e.target.value;
    handleInputChange('first_witness_barangay', value);
    
    if (focusedField === 'firstWitnessBarangay') {
      setSuggestions(prev => ({ 
        ...prev, 
        firstWitnessBarangay: filterBarangays(value, formData.first_witness_municipality, formData.first_witness_province) 
      }));
    }
  };

  const handleFirstWitnessMunicipalityChange = (e) => {
    const value = e.target.value;
    handleInputChange('first_witness_municipality', value);
    
    if (focusedField === 'firstWitnessMunicipality') {
      setSuggestions(prev => ({ 
        ...prev, 
        firstWitnessMunicipality: filterMunicipalities(value, formData.first_witness_province) 
      }));
    }
    
    if (value) {
      const matchedLocation = locationData.find(loc => 
        loc.municipality.toLowerCase() === value.toLowerCase()
      );
      if (matchedLocation && !formData.first_witness_province) {
        handleInputChange('first_witness_province', matchedLocation.province);
      }
    }
  };

  const handleFirstWitnessProvinceChange = (e) => {
    const value = e.target.value;
    handleInputChange('first_witness_province', value);
    
    if (focusedField === 'firstWitnessProvince') {
      setSuggestions(prev => ({ ...prev, firstWitnessProvince: filterProvinces(value) }));
    }
  };

  const handleSelectFirstWitnessBarangay = (barangay) => {
    handleInputChange('first_witness_barangay', barangay);
    setFocusedField(null);
    
    const matchedLocation = locationData.find(loc => loc.barangay === barangay);
    if (matchedLocation) {
      if (!formData.first_witness_municipality) {
        handleInputChange('first_witness_municipality', matchedLocation.municipality);
      }
      if (!formData.first_witness_province) {
        handleInputChange('first_witness_province', matchedLocation.province);
      }
    }
  };

  const handleSelectFirstWitnessMunicipality = (municipality) => {
    handleInputChange('first_witness_municipality', municipality);
    
    const matchedLocation = locationData.find(loc => loc.municipality === municipality);
    if (matchedLocation && !formData.first_witness_province) {
      handleInputChange('first_witness_province', matchedLocation.province);
    }
    
    setFocusedField(null);
  };

  const handleSelectFirstWitnessProvince = (province) => {
    handleInputChange('first_witness_province', province);
    setFocusedField(null);
  };

  // Handlers for second witness address fields
  const handleSecondWitnessBarangayChange = (e) => {
    const value = e.target.value;
    handleInputChange('second_witness_barangay', value);
    
    if (focusedField === 'secondWitnessBarangay') {
      setSuggestions(prev => ({ 
        ...prev, 
        secondWitnessBarangay: filterBarangays(value, formData.second_witness_municipality, formData.second_witness_province) 
      }));
    }
  };

  const handleSecondWitnessMunicipalityChange = (e) => {
    const value = e.target.value;
    handleInputChange('second_witness_municipality', value);
    
    if (focusedField === 'secondWitnessMunicipality') {
      setSuggestions(prev => ({ 
        ...prev, 
        secondWitnessMunicipality: filterMunicipalities(value, formData.second_witness_province) 
      }));
    }
    
    if (value) {
      const matchedLocation = locationData.find(loc => 
        loc.municipality.toLowerCase() === value.toLowerCase()
      );
      if (matchedLocation && !formData.second_witness_province) {
        handleInputChange('second_witness_province', matchedLocation.province);
      }
    }
  };

  const handleSecondWitnessProvinceChange = (e) => {
    const value = e.target.value;
    handleInputChange('second_witness_province', value);
    
    if (focusedField === 'secondWitnessProvince') {
      setSuggestions(prev => ({ ...prev, secondWitnessProvince: filterProvinces(value) }));
    }
  };

  const handleSelectSecondWitnessBarangay = (barangay) => {
    handleInputChange('second_witness_barangay', barangay);
    setFocusedField(null);
    
    const matchedLocation = locationData.find(loc => loc.barangay === barangay);
    if (matchedLocation) {
      if (!formData.second_witness_municipality) {
        handleInputChange('second_witness_municipality', matchedLocation.municipality);
      }
      if (!formData.second_witness_province) {
        handleInputChange('second_witness_province', matchedLocation.province);
      }
    }
  };

  const handleSelectSecondWitnessMunicipality = (municipality) => {
    handleInputChange('second_witness_municipality', municipality);
    
    const matchedLocation = locationData.find(loc => loc.municipality === municipality);
    if (matchedLocation && !formData.second_witness_province) {
      handleInputChange('second_witness_province', matchedLocation.province);
    }
    
    setFocusedField(null);
  };

  const handleSelectSecondWitnessProvince = (province) => {
    handleInputChange('second_witness_province', province);
    setFocusedField(null);
  };

  // Add filterRegions function
  const filterRegions = (input) => {
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
    
    return regions.filter(region => region.toLowerCase().includes(inputLower));
  };

  // State for existing marriage applications
  const [existingMarriages, setExistingMarriages] = useState([]);

  // Handle field focus for dropdowns
  const handleFocus = (field) => {
    setFocusedField(field);
    
    // Set appropriate suggestions based on the field being focused
    switch(field) {
      case 'groomPlaceOfBirth':
        setSuggestions(prev => ({ ...prev, groomPlaceOfBirth: filterBirthPlaces(formData.groom_placeOfBirth) }));
        break;
      case 'bridePlaceOfBirth':
        setSuggestions(prev => ({ ...prev, bridePlaceOfBirth: filterBirthPlaces(formData.bride_placeOfBirth) }));
        break;
      case 'groomBarangay':
        setSuggestions(prev => ({ ...prev, groomBarangay: filterBarangays(formData.groom_barangay, formData.groom_municipality, formData.groom_province) }));
        break;
      case 'groomMunicipality':
        setSuggestions(prev => ({ ...prev, groomMunicipality: filterMunicipalities(formData.groom_municipality, formData.groom_province) }));
        break;
      case 'groomProvince':
        setSuggestions(prev => ({ ...prev, groomProvince: filterProvinces(formData.groom_province) }));
        break;
      case 'groomRegion':
        setSuggestions(prev => ({ ...prev, groomRegion: filterRegions(formData.groom_region) }));
        break;
      case 'brideBarangay':
        setSuggestions(prev => ({ ...prev, brideBarangay: filterBarangays(formData.bride_barangay, formData.bride_municipality, formData.bride_province) }));
        break;
      case 'brideMunicipality':
        setSuggestions(prev => ({ ...prev, brideMunicipality: filterMunicipalities(formData.bride_municipality, formData.bride_province) }));
        break;
      case 'brideProvince':
        setSuggestions(prev => ({ ...prev, brideProvince: filterProvinces(formData.bride_province) }));
        break;
      case 'brideRegion':
        setSuggestions(prev => ({ ...prev, brideRegion: filterRegions(formData.bride_region) }));
        break;
      case 'firstWitnessBarangay':
        setSuggestions(prev => ({ ...prev, firstWitnessBarangay: filterBarangays(formData.first_witness_barangay, formData.first_witness_municipality, formData.first_witness_province) }));
        break;
      case 'firstWitnessMunicipality':
        setSuggestions(prev => ({ ...prev, firstWitnessMunicipality: filterMunicipalities(formData.first_witness_municipality, formData.first_witness_province) }));
        break;
      case 'firstWitnessProvince':
        setSuggestions(prev => ({ ...prev, firstWitnessProvince: filterProvinces(formData.first_witness_province) }));
        break;
      case 'firstWitnessRegion':
        setSuggestions(prev => ({ ...prev, firstWitnessRegion: filterRegions(formData.first_witness_region) }));
        break;
      case 'secondWitnessBarangay':
        setSuggestions(prev => ({ ...prev, secondWitnessBarangay: filterBarangays(formData.second_witness_barangay, formData.second_witness_municipality, formData.second_witness_province) }));
        break;
      case 'secondWitnessMunicipality':
        setSuggestions(prev => ({ ...prev, secondWitnessMunicipality: filterMunicipalities(formData.second_witness_municipality, formData.second_witness_province) }));
        break;
      case 'secondWitnessProvince':
        setSuggestions(prev => ({ ...prev, secondWitnessProvince: filterProvinces(formData.second_witness_province) }));
        break;
      case 'secondWitnessRegion':
        setSuggestions(prev => ({ ...prev, secondWitnessRegion: filterRegions(formData.second_witness_region) }));
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

  // Function to handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Simplified validation - only check the most critical fields
    const criticalFields = [
      // Core wedding details
      'date', 'time',
      
      // Basic groom information
      'groom_first_name', 'groom_last_name',
      
      // Basic bride information
      'bride_first_name', 'bride_last_name'
    ];
    
    // Check if any critical field is empty
    const emptyFields = criticalFields.filter(field => !formData[field]);
    
    // Create validation errors object
    const errors = {};
    emptyFields.forEach(field => {
      errors[field] = true;
    });
    
    // Update validation states
    setValidationErrors(errors);
    
    if (emptyFields.length > 0) {
      setErrorMessage('Please fill in the basic required fields (names, date, and time) before submitting.');
      setShowErrorModal(true);
      
      // Scroll to the first error field
      const firstErrorField = document.querySelector(`.error-field`);
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    
    // Clear validation errors if all fields are valid
    setValidationErrors({});
    
    // If all validations pass, show confirmation modal
    setShowModal(true);
  };

  const handleYes = async () => {
    setShowModal(false);
    setIsLoading(true);
  
    try {
      // Basic application data with all required fields
      const applicationData = {
        date: formData.date,
        time: formData.time,
        groom_first_name: formData.groom_first_name || '',
        groom_middle_name: formData.groom_middle_name || '', // Added middle name
        groom_last_name: formData.groom_last_name || '',
        groom_age: formData.groom_age || '',
        groom_dateOfBirth: formData.groom_dateOfBirth || '',
        groom_dateOfBaptism: formData.groom_dateOfBaptism || '',
        groom_churchOfBaptism: formData.groom_churchOfBaptism || '',
        groom_placeOfBirth: formData.groom_placeOfBirth || '',
        bride_first_name: formData.bride_first_name || '',
        bride_middle_name: formData.bride_middle_name || '', // Added middle name
        bride_last_name: formData.bride_last_name || '',
        bride_age: formData.bride_age || '',
        bride_dateOfBirth: formData.bride_dateOfBirth || '',
        bride_dateOfBaptism: formData.bride_dateOfBaptism || '',
        bride_churchOfBaptism: formData.bride_churchOfBaptism || '',
        bride_placeOfBirth: formData.bride_placeOfBirth || ''
      };
  
      // Prepare address data
      const groomAddressData = {
        street: formData.groom_street || '',
        barangay: formData.groom_barangay || '',
        municipality: formData.groom_municipality || '',
        province: formData.groom_province || '',
        region: formData.groom_region || ''
      };
  
      const brideAddressData = {
        street: formData.bride_street || '',
        barangay: formData.bride_barangay || '',
        municipality: formData.bride_municipality || '',
        province: formData.bride_province || '',
        region: formData.bride_region || ''
      };
  
      // Prepare witness data
      const firstWitnessData = {
        first_name: formData.first_witness_first_name || '',
        middle_name: formData.first_witness_middle_name || '', // Added middle name
        last_name: formData.first_witness_last_name || '',
        gender: formData.first_witness_gender || '',
        age: formData.first_witness_age || '',
        dateOfBirth: formData.first_witness_dateOfBirth || '',
        contact_number: formData.first_witness_contact_number || '',
        street: formData.first_witness_street || '',
        barangay: formData.first_witness_barangay || '',
        municipality: formData.first_witness_municipality || '',
        province: formData.first_witness_province || '',
        region: formData.first_witness_region || ''
      };
  
      const secondWitnessData = {
        first_name: formData.second_witness_first_name || '',
        middle_name: formData.second_witness_middle_name || '', // Added middle name
        last_name: formData.second_witness_last_name || '',
        gender: formData.second_witness_gender || '',
        age: formData.second_witness_age || '',
        dateOfBirth: formData.second_witness_dateOfBirth || '',
        contact_number: formData.second_witness_contact_number || '',
        street: formData.second_witness_street || '',
        barangay: formData.second_witness_barangay || '',
        municipality: formData.second_witness_municipality || '',
        province: formData.second_witness_province || '',
        region: formData.second_witness_region || ''
      };
  
      // Prepare form data for submission
      const formDataToSend = new FormData();
      
      // Add JSON data with stringification
      formDataToSend.append('applicationData', JSON.stringify(applicationData));
      formDataToSend.append('groomAddressData', JSON.stringify(groomAddressData));
      formDataToSend.append('brideAddressData', JSON.stringify(brideAddressData));
      formDataToSend.append('firstWitnessData', JSON.stringify(firstWitnessData));
      formDataToSend.append('secondWitnessData', JSON.stringify(secondWitnessData));
  
      console.log('Submitting marriage application...');
      const response = await axios.post(
        'http://parishofdivinemercy.com/backend/sec_marriage_application.php',
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
  
      console.log('Application response:', response.data);
  
      if (response.data.success) {
        // Send email
      
        setShowSuccessModal(true);
      } else {
        throw new Error(response.data.message || 'Failed to submit application');
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      setErrorMessage(error.message || 'An error occurred while submitting the application');
      setShowErrorModal(true);
    } finally {
      setIsLoading(false);
    }
  };
  const handleNo = () => {
    setShowModal(false);
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    navigate('/secretary-appointment');
  };

  const handleCloseErrorModal = () => {
    setShowErrorModal(false);
  };

  // Add handlers for region fields
  const handleGroomRegionChange = (e) => {
    const value = e.target.value;
    handleInputChange('groom_region', value);
    
    if (focusedField === 'groomRegion') {
      setSuggestions(prev => ({
        ...prev,
        groomRegion: filterRegions(value)
      }));
    }
  };
  
  const handleBrideRegionChange = (e) => {
    const value = e.target.value;
    handleInputChange('bride_region', value);
    
    if (focusedField === 'brideRegion') {
      setSuggestions(prev => ({
        ...prev,
        brideRegion: filterRegions(value)
      }));
    }
  };
  
  const handleFirstWitnessRegionChange = (e) => {
    const value = e.target.value;
    handleInputChange('first_witness_region', value);
    
    if (focusedField === 'firstWitnessRegion') {
      setSuggestions(prev => ({
        ...prev,
        firstWitnessRegion: filterRegions(value)
      }));
    }
  };
  
  const handleSecondWitnessRegionChange = (e) => {
    const value = e.target.value;
    handleInputChange('second_witness_region', value);
    
    if (focusedField === 'secondWitnessRegion') {
      setSuggestions(prev => ({
        ...prev,
        secondWitnessRegion: filterRegions(value)
      }));
    }
  };
  
  const handleSelectGroomRegion = (region) => {
    handleInputChange('groom_region', region);
    setFocusedField(null);
  };
  
  const handleSelectBrideRegion = (region) => {
    handleInputChange('bride_region', region);
    setFocusedField(null);
  };
  
  const handleSelectFirstWitnessRegion = (region) => {
    handleInputChange('first_witness_region', region);
    setFocusedField(null);
  };
  
  const handleSelectSecondWitnessRegion = (region) => {
    handleInputChange('second_witness_region', region);
    setFocusedField(null);
  };

  return (
    <div className="client-marriage-container">
      {/* Header */}
      <div className="client-marriage-header">
        <div className="client-marriage-left-section">
          <button className="client-marriage-back-button" onClick={() => window.history.back()}>
            <AiOutlineArrowLeft className="client-marriage-back-icon" /> Back
          </button>
        </div>
      </div>
      <h1 className="client-marriage-title">Marriage Application Form</h1>
      
      {/* Matrimony Data Section */}
      <div className="client-marriage-data">
        <div className="client-marriage-row-date">
          <div className={`client-marriage-field-date ${validationErrors['date'] ? 'error-field' : ''}`}>
            <label>Date of Appointment<span className="required-marker">*</span></label>
            <select
              name="date"
              value={formData.date}
              onChange={e => handleInputChange('date', e.target.value)}
              required
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
            {validationErrors['date'] && <div className="error-message">Required</div>}
          </div>
          <div className={`client-marriage-field-time ${validationErrors['time'] ? 'error-field' : ''}`}>
            <label>Time of Appointment<span className="required-marker">*</span></label>
            <select
              name="time"
              value={formData.time}
              onChange={e => handleInputChange('time', e.target.value)}
              disabled={!formData.date}
              required
            >
              <option value="">Select Time</option>
              {filteredTimes.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
            {validationErrors['time'] && <div className="error-message">Required</div>}
          </div>
        </div>

        <div className="client-marriage-bypart">
          <h3 className="client-marriage-sub-title">Groom Information</h3>
          <div className="client-marriage-row">
            <div className={`client-marriage-field ${validationErrors['groom_first_name'] ? 'error-field' : ''}`}>
              <label>First Name of the Groom<span className="required-marker">*</span></label>
              <input 
                type="text"
                value={formData.groom_first_name}
                onChange={e => handleInputChange('groom_first_name', e.target.value)}
              />
              {validationErrors['groom_first_name'] && <div className="error-message">Required</div>}
            </div>
            <div className={`client-marriage-field ${validationErrors['groom_middle_name'] ? 'error-field' : ''}`}>
              <label>Middle Name of the Groom</label>
              <input 
                type="text"
                value={formData.groom_middle_name}
                onChange={e => handleInputChange('groom_middle_name', e.target.value)}
              />
              {validationErrors['groom_middle_name'] && <div className="error-message">Required</div>}
            </div>
            <div className={`client-marriage-field ${validationErrors['groom_last_name'] ? 'error-field' : ''}`}>
              <label>Last Name of the Groom<span className="required-marker">*</span></label>
              <input 
                type="text"
                value={formData.groom_last_name}
                onChange={e => handleInputChange('groom_last_name', e.target.value)}
              />
              {validationErrors['groom_last_name'] && <div className="error-message">Required</div>}
            </div>
            <div className={`client-marriage-field ${validationErrors['groom_dateOfBirth'] ? 'error-field' : ''}`}>
              <label>Date of Birth<span className="required-marker">*</span></label>
              <input 
                type="date" 
                className="date-input"
                value={formData.groom_dateOfBirth || ''}
                onChange={e => {
                  // Store the date directly without any processing
                  handleInputChange('groom_dateOfBirth', e.target.value);
                  
                  // Calculate age separately
                  const today = new Date();
                  const birthDate = new Date(e.target.value);
                  
                  if (!isNaN(birthDate.getTime())) {
                    let age = today.getFullYear() - birthDate.getFullYear();
                    const monthDiff = today.getMonth() - birthDate.getMonth();
                    
                    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                      age--;
                    }
                    
                    handleInputChange('groom_age', age.toString());
                  }
                }}
              />
              {validationErrors['groom_dateOfBirth'] && <div className="error-message">Required</div>}
            </div>
          </div>

          <div className="client-marriage-row">
          <div className="client-marriage-field-dob">
              <label>Age</label>
              <input 
                type="text"
                value={formData.groom_age}
                onChange={e => handleInputChange('groom_age', e.target.value)}
                readOnly
              />
            </div>
            <div className={`client-marriage-field-dob ${validationErrors['groom_dateOfBaptism'] ? 'error-field' : ''}`}>
              <label>Date of Baptism<span className="required-marker">*</span></label>
              <input 
                type="date" 
                className="date-input"
                value={formData.groom_dateOfBaptism || ''}
                onChange={e => handleInputChange('groom_dateOfBaptism', e.target.value)}
              />
              {validationErrors['groom_dateOfBaptism'] && <div className="error-message">Required</div>}
            </div>
            <div className={`client-marriage-field ${validationErrors['groom_churchOfBaptism'] ? 'error-field' : ''}`}>
              <label>Church of Baptism<span className="required-marker">*</span></label>
              <input 
                type="text"
                value={formData.groom_churchOfBaptism}
                onChange={e => handleInputChange('groom_churchOfBaptism', e.target.value)}
              />
              {validationErrors['groom_churchOfBaptism'] && <div className="error-message">Required</div>}
            </div>
            </div>
          
          <label className="mini-title">Place of Birth</label>
          <div className="client-marriage-row">
            <div className={`client-marriage-field location-dropdown-container ${validationErrors['groom_placeOfBirth'] ? 'error-field' : ''}`}>
              <label>Place of Birth<span className="required-marker">*</span></label>
              <input 
                type="text"
                placeholder="Type to search (Barangay, Municipality, Province)"
                value={formData.groom_placeOfBirth}
                onChange={handleGroomPlaceOfBirthChange}
                onFocus={() => handleFocus('groomPlaceOfBirth')}
              />
              {validationErrors['groom_placeOfBirth'] && <div className="error-message">Required</div>}
              {focusedField === 'groomPlaceOfBirth' && suggestions.groomPlaceOfBirth && suggestions.groomPlaceOfBirth.length > 0 && (
                <div className="location-dropdown">
                  {suggestions.groomPlaceOfBirth.map((location, index) => (
                    <div 
                      key={index}
                      onClick={() => handleSelectGroomPlaceOfBirth(location)}
                      className="location-dropdown-item"
                    >
                      {`${location.barangay}, ${location.municipality}, ${location.province}`}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Address Fields with dropdowns */}
          <label className="mini-title">Home Address</label>
          <div className="client-marriage-row">
          <div className={`client-marriage-field ${validationErrors['groom_street'] ? 'error-field' : ''}`}>
              <label>Street<span className="required-marker">*</span></label>
              <input 
                type="text"
                value={formData.groom_street}
                onChange={e => handleInputChange('groom_street', e.target.value)}
              />
              {validationErrors['groom_street'] && <div className="error-message">Required</div>}
            </div>
            <div className={`client-marriage-field location-dropdown-container ${validationErrors['groom_barangay'] ? 'error-field' : ''}`}>
              <label>Barangay<span className="required-marker">*</span></label>
              <input 
                type="text"
                placeholder="Type to search"
                value={formData.groom_barangay}
                onChange={handleGroomBarangayChange}
                onFocus={() => handleFocus('groomBarangay')}
              />
              {validationErrors['groom_barangay'] && <div className="error-message">Required</div>}
              {focusedField === 'groomBarangay' && suggestions.groomBarangay && suggestions.groomBarangay.length > 0 && (
                <div className="location-dropdown">
                  {suggestions.groomBarangay.map((barangay, index) => (
                    <div 
                      key={index}
                      onClick={() => handleSelectGroomBarangay(barangay)}
                      className="location-dropdown-item"
                    >
                      {barangay}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className={`client-marriage-field location-dropdown-container ${validationErrors['groom_municipality'] ? 'error-field' : ''}`}>
              <label>Municipality<span className="required-marker">*</span></label>
              <input 
                type="text"
                placeholder="Type to search"
                value={formData.groom_municipality}
                onChange={handleGroomMunicipalityChange}
                onFocus={() => handleFocus('groomMunicipality')}
              />
              {validationErrors['groom_municipality'] && <div className="error-message">Required</div>}
              {focusedField === 'groomMunicipality' && suggestions.groomMunicipality && suggestions.groomMunicipality.length > 0 && (
                <div className="location-dropdown">
                  {suggestions.groomMunicipality.map((municipality, index) => (
                    <div 
                      key={index}
                      onClick={() => handleSelectGroomMunicipality(municipality)}
                      className="location-dropdown-item"
                    >
                      {municipality}
            </div>
                  ))}
                </div>
              )}
            </div>
            <div className={`client-marriage-field location-dropdown-container ${validationErrors['groom_province'] ? 'error-field' : ''}`}>
              <label>Province<span className="required-marker">*</span></label>
              <input 
                type="text"
                placeholder="Type to search"
                value={formData.groom_province}
                onChange={handleGroomProvinceChange}
                onFocus={() => handleFocus('groomProvince')}
              />
              {validationErrors['groom_province'] && <div className="error-message">Required</div>}
              {focusedField === 'groomProvince' && suggestions.groomProvince && suggestions.groomProvince.length > 0 && (
                <div className="location-dropdown">
                  {suggestions.groomProvince.map((province, index) => (
                    <div 
                      key={index}
                      onClick={() => handleSelectGroomProvince(province)}
                      className="location-dropdown-item"
                    >
                      {province}
                    </div>
                  ))}
                </div>
              )}
            </div>
             <div className={`client-marriage-field location-dropdown-container ${validationErrors['groom_region'] ? 'error-field' : ''}`}>
              <label>Region<span className="required-marker">*</span></label>
              <input 
                type="text"
                value={formData.groom_region}
                onChange={handleGroomRegionChange}
                onFocus={() => handleFocus('groomRegion')}
                placeholder="Type to search"
              />
              {validationErrors['groom_region'] && <div className="error-message">Required</div>}
              {focusedField === 'groomRegion' && suggestions.groomRegion && suggestions.groomRegion.length > 0 && (
                <div className="location-dropdown">
                  {suggestions.groomRegion.map((region, index) => (
                    <div 
                      key={index}
                      onClick={() => handleSelectGroomRegion(region)}
                      className="location-dropdown-item"
                    >
                      {region}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <h3 className="client-marriage-sub-title">Bride Information</h3>
          
          <div className="client-marriage-row">
            <div className={`client-marriage-field ${validationErrors['bride_first_name'] ? 'error-field' : ''}`}>
              <label>First Name of the Bride<span className="required-marker">*</span></label>
              <input 
                type="text"
                value={formData.bride_first_name}
                onChange={e => handleInputChange('bride_first_name', e.target.value)}
              />
              {validationErrors['bride_first_name'] && <div className="error-message">Required</div>}
            </div>
            <div className={`client-marriage-field ${validationErrors['bride_middle_name'] ? 'error-field' : ''}`}>
              <label>Middle Name of the Bride</label>
              <input 
                type="text"
                value={formData.bride_middle_name}
                onChange={e => handleInputChange('bride_middle_name', e.target.value)}
              />
              {validationErrors['bride_middle_name'] && <div className="error-message">Required</div>}
            </div>
            <div className={`client-marriage-field ${validationErrors['bride_last_name'] ? 'error-field' : ''}`}>
              <label>Last Name of the Bride<span className="required-marker">*</span></label>
              <input 
                type="text"
                value={formData.bride_last_name}
                onChange={e => handleInputChange('bride_last_name', e.target.value)}
              />
              {validationErrors['bride_last_name'] && <div className="error-message">Required</div>}
            </div>
            <div className={`client-marriage-field ${validationErrors['bride_dateOfBirth'] ? 'error-field' : ''}`}>
              <label>Date of Birth<span className="required-marker">*</span></label>
              <input 
                type="date" 
                className="date-input"
                value={formData.bride_dateOfBirth || ''}
                onChange={e => {
                  // Store the date directly without any processing
                  handleInputChange('bride_dateOfBirth', e.target.value);
                  
                  // Calculate age separately
                  const today = new Date();
                  const birthDate = new Date(e.target.value);
                  
                  if (!isNaN(birthDate.getTime())) {
                    let age = today.getFullYear() - birthDate.getFullYear();
                    const monthDiff = today.getMonth() - birthDate.getMonth();
                    
                    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                      age--;
                    }
                    
                    handleInputChange('bride_age', age.toString());
                  }
                }}
              />
              {validationErrors['bride_dateOfBirth'] && <div className="error-message">Required</div>}
            </div>
          </div>

          <div className="client-marriage-row">
          <div className="client-marriage-field-dob">
              <label>Age</label>
              <input 
                type="text"
                value={formData.bride_age}
                onChange={e => handleInputChange('bride_age', e.target.value)}
                readOnly
              />
            </div>
            <div className={`client-marriage-field-dob ${validationErrors['bride_dateOfBaptism'] ? 'error-field' : ''}`}>
              <label>Date of Baptism<span className="required-marker">*</span></label>
              <input 
                type="date" 
                className="date-input"
                value={formData.bride_dateOfBaptism || ''}
                onChange={e => handleInputChange('bride_dateOfBaptism', e.target.value)}
              />
              {validationErrors['bride_dateOfBaptism'] && <div className="error-message">Required</div>}
            </div>
            <div className={`client-marriage-field ${validationErrors['bride_churchOfBaptism'] ? 'error-field' : ''}`}>
              <label>Church of Baptism<span className="required-marker">*</span></label>
              <input 
                type="text"
                value={formData.bride_churchOfBaptism}
                onChange={e => handleInputChange('bride_churchOfBaptism', e.target.value)}
              />
              {validationErrors['bride_churchOfBaptism'] && <div className="error-message">Required</div>}
            </div>
          </div>
          
          <label className="mini-title">Place of Birth</label>
          <div className="client-marriage-row">
            <div className={`client-marriage-field location-dropdown-container ${validationErrors['bride_placeOfBirth'] ? 'error-field' : ''}`}>
              <label>Place of Birth<span className="required-marker">*</span></label>
              <input 
                type="text"
                placeholder="Type to search (Barangay, Municipality, Province)"
                value={formData.bride_placeOfBirth}
                onChange={handleBridePlaceOfBirthChange}
                onFocus={() => handleFocus('bridePlaceOfBirth')}
              />
              {validationErrors['bride_placeOfBirth'] && <div className="error-message">Required</div>}
              {focusedField === 'bridePlaceOfBirth' && suggestions.bridePlaceOfBirth && suggestions.bridePlaceOfBirth.length > 0 && (
                <div className="location-dropdown">
                  {suggestions.bridePlaceOfBirth.map((location, index) => (
                    <div 
                      key={index}
                      onClick={() => handleSelectBridePlaceOfBirth(location)}
                      className="location-dropdown-item"
                    >
                      {`${location.barangay}, ${location.municipality}, ${location.province}`}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Address Fields with dropdowns */}
          <label className="mini-title">Home Address</label>
          <div className="client-marriage-row">
          <div className="client-marriage-field">
              <label>Street<span className="required-marker">*</span></label>
              <input 
                type="text"
                value={formData.bride_street}
                onChange={e => handleInputChange('bride_street', e.target.value)}
              />
              {validationErrors['bride_street'] && <div className="error-message">Required</div>}
            </div>
            <div className={`client-marriage-field location-dropdown-container ${validationErrors['bride_barangay'] ? 'error-field' : ''}`}>
              <label>Barangay<span className="required-marker">*</span></label>
              <input 
                type="text"
                placeholder="Type to search"
                value={formData.bride_barangay}
                onChange={handleBrideBarangayChange}
                onFocus={() => handleFocus('brideBarangay')}
              />
              {validationErrors['bride_barangay'] && <div className="error-message">Required</div>}
              {focusedField === 'brideBarangay' && suggestions.brideBarangay && suggestions.brideBarangay.length > 0 && (
                <div className="location-dropdown">
                  {suggestions.brideBarangay.map((barangay, index) => (
                    <div 
                      key={index}
                      onClick={() => handleSelectBrideBarangay(barangay)}
                      className="location-dropdown-item"
                    >
                      {barangay}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className={`client-marriage-field location-dropdown-container ${validationErrors['bride_municipality'] ? 'error-field' : ''}`}>
              <label>Municipality<span className="required-marker">*</span></label>
              <input 
                type="text"
                placeholder="Type to search"
                value={formData.bride_municipality}
                onChange={handleBrideMunicipalityChange}
                onFocus={() => handleFocus('brideMunicipality')}
              />
              {validationErrors['bride_municipality'] && <div className="error-message">Required</div>}
              {focusedField === 'brideMunicipality' && suggestions.brideMunicipality && suggestions.brideMunicipality.length > 0 && (
                <div className="location-dropdown">
                  {suggestions.brideMunicipality.map((municipality, index) => (
                    <div 
                      key={index}
                      onClick={() => handleSelectBrideMunicipality(municipality)}
                      className="location-dropdown-item"
                    >
                      {municipality}
            </div>
                  ))}
                </div>
              )}
            </div>
            <div className={`client-marriage-field location-dropdown-container ${validationErrors['bride_province'] ? 'error-field' : ''}`}>
              <label>Province<span className="required-marker">*</span></label>
              <input 
                type="text"
                placeholder="Type to search"
                value={formData.bride_province}
                onChange={handleBrideProvinceChange}
                onFocus={() => handleFocus('brideProvince')}
              />
              {validationErrors['bride_province'] && <div className="error-message">Required</div>}
              {focusedField === 'brideProvince' && suggestions.brideProvince && suggestions.brideProvince.length > 0 && (
                <div className="location-dropdown">
                  {suggestions.brideProvince.map((province, index) => (
                    <div 
                      key={index}
                      onClick={() => handleSelectBrideProvince(province)}
                      className="location-dropdown-item"
                    >
                      {province}
                    </div>
                  ))}
                </div>
              )}
            </div>
             <div className={`client-marriage-field location-dropdown-container ${validationErrors['bride_region'] ? 'error-field' : ''}`}>
              <label>Region<span className="required-marker">*</span></label>
              <input 
                type="text"
                value={formData.bride_region}
                onChange={handleBrideRegionChange}
                onFocus={() => handleFocus('brideRegion')}
                placeholder="Type to search"
              />
              {validationErrors['bride_region'] && <div className="error-message">Required</div>}
              {focusedField === 'brideRegion' && suggestions.brideRegion && suggestions.brideRegion.length > 0 && (
                <div className="location-dropdown">
                  {suggestions.brideRegion.map((region, index) => (
                    <div 
                      key={index}
                      onClick={() => handleSelectBrideRegion(region)}
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

        {/* First Witness Information */}
        <div className="client-marriage-witness-container">
          <h2 className="client-marriage-witness-title">First Witness Information</h2>
          <div className="client-marriage-witness-box">
          <div className="client-marriage-row">
            <div className="client-marriage-field">
              <label>First Witness First Name</label>
                <input 
                  type="text"
                  value={formData.first_witness_first_name}
                  onChange={e => handleInputChange('first_witness_first_name', e.target.value)}
                />
            </div>
            <div className="client-marriage-field">
              <label>First Witness Middle Name</label>
                <input 
                  type="text"
                  value={formData.first_witness_middle_name}
                  onChange={e => handleInputChange('first_witness_middle_name', e.target.value)}
                />
            </div>
            <div className="client-marriage-field">
              <label>First Witness Last Name</label>
                <input 
                  type="text"
                  value={formData.first_witness_last_name}
                  onChange={e => handleInputChange('first_witness_last_name', e.target.value)}
                />
            </div>
            <div className="client-marriage-field">
              <label>First Witness Date of Birth</label>
                <input 
                  type="date"
                  className="date-input"
                  value={formData.first_witness_dateOfBirth || ''}
                  onChange={e => {
                    try {
                      handleDateChange('first_witness_dateOfBirth', e.target.value, 'first_witness_age');
                    } catch (error) {
                      console.error('Error handling first witness date:', error);
                      // Set a fallback value if there's an error
                      handleInputChange('first_witness_dateOfBirth', '');
                      handleInputChange('first_witness_age', '');
                    }
                  }}
               />
            </div>
          </div>
          
          <div className="client-marriage-row">
             <div className="client-marriage-field-ga">
              <label>Age</label>
                <input 
                  type="text"
                  value={formData.first_witness_age}
                  onChange={e => handleInputChange('first_witness_age', e.target.value)}
                  readOnly
                />
            </div>
          <div className="client-marriage-field-ga">
              <label>Gender</label>
                <select
                  value={formData.first_witness_gender}
                  onChange={e => handleInputChange('first_witness_gender', e.target.value)}
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
            </div>
            <div className="client-marriage-field">
              <label>First Witness Contact Number</label>
                <input 
                  type="text"
                  value={formData.first_witness_contact_number}
                  onChange={e => handleInputChange('first_witness_contact_number', e.target.value)}
                />
            </div>
            </div>
          
          <div className="client-marriage-row">
          <div className="client-marriage-field">
              <label>Street</label>
                <input 
                  type="text"
                  value={formData.first_witness_street}
                  onChange={e => handleInputChange('first_witness_street', e.target.value)}
                />
            </div>
              <div className="client-marriage-field location-dropdown-container">
              <label>Barangay</label>
                <input 
                  type="text"
                  placeholder="Type to search"
                  value={formData.first_witness_barangay}
                  onChange={handleFirstWitnessBarangayChange}
                  onFocus={() => handleFocus('firstWitnessBarangay')}
                />
                {focusedField === 'firstWitnessBarangay' && suggestions.firstWitnessBarangay && suggestions.firstWitnessBarangay.length > 0 && (
                  <div className="location-dropdown">
                    {suggestions.firstWitnessBarangay.map((barangay, index) => (
                      <div 
                        key={index}
                        onClick={() => handleSelectFirstWitnessBarangay(barangay)}
                        className="location-dropdown-item"
                      >
                        {barangay}
                      </div>
                    ))}
                  </div>
                )}
            </div>
              <div className="client-marriage-field location-dropdown-container">
              <label>Municipality</label>
                <input 
                  type="text"
                  placeholder="Type to search"
                  value={formData.first_witness_municipality}
                  onChange={handleFirstWitnessMunicipalityChange}
                  onFocus={() => handleFocus('firstWitnessMunicipality')}
                />
                {focusedField === 'firstWitnessMunicipality' && suggestions.firstWitnessMunicipality && suggestions.firstWitnessMunicipality.length > 0 && (
                  <div className="location-dropdown">
                    {suggestions.firstWitnessMunicipality.map((municipality, index) => (
                      <div 
                        key={index}
                        onClick={() => handleSelectFirstWitnessMunicipality(municipality)}
                        className="location-dropdown-item"
                      >
                        {municipality}
            </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="client-marriage-field location-dropdown-container">
              <label>Province</label>
                <input 
                  type="text"
                  placeholder="Type to search"
                  value={formData.first_witness_province}
                  onChange={handleFirstWitnessProvinceChange}
                  onFocus={() => handleFocus('firstWitnessProvince')}
                />
                {focusedField === 'firstWitnessProvince' && suggestions.firstWitnessProvince && suggestions.firstWitnessProvince.length > 0 && (
                  <div className="location-dropdown">
                    {suggestions.firstWitnessProvince.map((province, index) => (
                      <div 
                        key={index}
                        onClick={() => handleSelectFirstWitnessProvince(province)}
                        className="location-dropdown-item"
                      >
                        {province}
                      </div>
                    ))}
                  </div>
                )}
            </div>
             <div className="client-marriage-field location-dropdown-container">
              <label>Region</label>
                <input 
                  type="text"
                  value={formData.first_witness_region}
                  onChange={handleFirstWitnessRegionChange}
                  onFocus={() => handleFocus('firstWitnessRegion')}
                  placeholder="Type to search"
                />
                {focusedField === 'firstWitnessRegion' && suggestions.firstWitnessRegion && suggestions.firstWitnessRegion.length > 0 && (
                  <div className="location-dropdown">
                    {suggestions.firstWitnessRegion.map((region, index) => (
                      <div 
                        key={index}
                        onClick={() => handleSelectFirstWitnessRegion(region)}
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
        </div>

        {/* Second Witness Information */}
        <div className="client-marriage-witness-container">
          <h2 className="client-marriage-witness-title">Second Witness Information</h2>
          <div className="client-marriage-witness-box">
          <div className="client-marriage-row">
            <div className="client-marriage-field">
              <label>Second Witness First Name</label>
                <input 
                  type="text"
                  value={formData.second_witness_first_name}
                  onChange={e => handleInputChange('second_witness_first_name', e.target.value)}
                />
            </div>
            <div className="client-marriage-field">
              <label>Second Witness Middle Name</label>
                <input 
                  type="text"
                  value={formData.second_witness_middle_name}
                  onChange={e => handleInputChange('second_witness_middle_name', e.target.value)}
                />
            </div>
            <div className="client-marriage-field">
              <label>Second Witness Last Name</label>
                <input 
                  type="text"
                  value={formData.second_witness_last_name}
                  onChange={e => handleInputChange('second_witness_last_name', e.target.value)}
                />
            </div>
            <div className="client-marriage-field">
              <label>Second Witness Date of Birth</label>
                <input 
                  type="date"
                  className="date-input"
                  value={formData.second_witness_dateOfBirth || ''}
                  onChange={e => {
                    try {
                      handleDateChange('second_witness_dateOfBirth', e.target.value, 'second_witness_age');
                    } catch (error) {
                      console.error('Error handling second witness date:', error);
                      // Set a fallback value if there's an error
                      handleInputChange('second_witness_dateOfBirth', '');
                      handleInputChange('second_witness_age', '');
                    }
                  }}
                />
            </div>
          </div>
          
          <div className="client-marriage-row">
            <div className="client-marriage-field-ga">
              <label>Age</label>
                <input 
                  type="text"
                  value={formData.second_witness_age}
                  onChange={e => handleInputChange('second_witness_age', e.target.value)}
                  readOnly
                />
            </div>
            <div className="client-marriage-field-ga">
              <label>Gender</label>
                <select
                  value={formData.second_witness_gender}
                  onChange={e => handleInputChange('second_witness_gender', e.target.value)}
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
            </div>
            <div className="client-marriage-field">
              <label>Second Witness Contact Number</label>
                <input 
                  type="text"
                  value={formData.second_witness_contact_number}
                  onChange={e => handleInputChange('second_witness_contact_number', e.target.value)}
                />
            </div>
            </div>
          
          <div className="client-marriage-row">
          <div className="client-marriage-field">
              <label>Street</label>
                <input 
                  type="text"
                  value={formData.second_witness_street}
                  onChange={e => handleInputChange('second_witness_street', e.target.value)}
                />
            </div>
            <div className="client-marriage-field location-dropdown-container">
              <label>Barangay</label>
                <input 
                  type="text"
                  placeholder="Type to search"
                  value={formData.second_witness_barangay}
                  onChange={handleSecondWitnessBarangayChange}
                  onFocus={() => handleFocus('secondWitnessBarangay')}
                />
                {focusedField === 'secondWitnessBarangay' && suggestions.secondWitnessBarangay && suggestions.secondWitnessBarangay.length > 0 && (
                  <div className="location-dropdown">
                    {suggestions.secondWitnessBarangay.map((barangay, index) => (
                      <div 
                        key={index}
                        onClick={() => handleSelectSecondWitnessBarangay(barangay)}
                        className="location-dropdown-item"
                      >
                        {barangay}
                      </div>
                    ))}
                  </div>
                )}
            </div>
              <div className="client-marriage-field location-dropdown-container">
              <label>Municipality</label>
                <input 
                  type="text"
                  placeholder="Type to search"
                  value={formData.second_witness_municipality}
                  onChange={handleSecondWitnessMunicipalityChange}
                  onFocus={() => handleFocus('secondWitnessMunicipality')}
                />
                {focusedField === 'secondWitnessMunicipality' && suggestions.secondWitnessMunicipality && suggestions.secondWitnessMunicipality.length > 0 && (
                  <div className="location-dropdown">
                    {suggestions.secondWitnessMunicipality.map((municipality, index) => (
                      <div 
                        key={index}
                        onClick={() => handleSelectSecondWitnessMunicipality(municipality)}
                        className="location-dropdown-item"
                      >
                        {municipality}
            </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="client-marriage-field location-dropdown-container">
              <label>Province</label>
                <input 
                  type="text"
                  placeholder="Type to search"
                  value={formData.second_witness_province}
                  onChange={handleSecondWitnessProvinceChange}
                  onFocus={() => handleFocus('secondWitnessProvince')}
                />
                {focusedField === 'secondWitnessProvince' && suggestions.secondWitnessProvince && suggestions.secondWitnessProvince.length > 0 && (
                  <div className="location-dropdown">
                    {suggestions.secondWitnessProvince.map((province, index) => (
                      <div 
                        key={index}
                        onClick={() => handleSelectSecondWitnessProvince(province)}
                        className="location-dropdown-item"
                      >
                        {province}
                      </div>
                    ))}
                  </div>
                )}
            </div>
             <div className="client-marriage-field location-dropdown-container">
              <label>Region</label>
                <input 
                  type="text"
                  value={formData.second_witness_region}
                  onChange={handleSecondWitnessRegionChange}
                  onFocus={() => handleFocus('secondWitnessRegion')}
                  placeholder="Type to search"
                />
                {focusedField === 'secondWitnessRegion' && suggestions.secondWitnessRegion && suggestions.secondWitnessRegion.length > 0 && (
                  <div className="location-dropdown">
                    {suggestions.secondWitnessRegion.map((region, index) => (
                      <div 
                        key={index}
                        onClick={() => handleSelectSecondWitnessRegion(region)}
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
        </div>
        
        {/* Requirements section */}
        <div className="client-marriage-requirements-container">
          <h2 className="client-marriage-requirements-title">Requirements</h2>
          
          <div className="client-marriage-requirements-box">
            <h3 className="client-marriage-section-header">Documents Needed</h3>
            <div className="client-marriage-info-list">
              <div className="client-marriage-info-item">
                <p>Baptismal Certificate</p>
              </div>
              <div className="client-marriage-info-item">
                <p>Confirmation Certificate</p>
              </div>
              <div className="client-marriage-info-item">
                <p>Birth Certificate</p>
              </div>
              <div className="client-marriage-info-item">
                <p>Marriage License</p>
              </div>
              <div className="client-marriage-info-item">
                <p>Certificate of No Marriage</p>
              </div>
              <div className="client-marriage-info-item">
                <p>Publication of Banns</p>
              </div>
              <div className="client-marriage-info-item">
                <p>Parish Permit from the Parish Priest</p>
              </div>
              <div className="client-marriage-info-item">
                <p>Pre-Cana Seminar or Marriage Preparation Program</p>
              </div>
              <div className="client-marriage-info-item">
                <p>Sponsors List</p>
              </div>
              <div className="client-marriage-info-item">
                <p>Canonical Interview</p>
              </div>
              <div className="client-marriage-info-item">
                <p>Certificate of Permission (if outside the Parish)</p>
              </div>
            </div>
            <h3 className="client-marriage-section-header">Requirements for the Couple</h3>
            <div className="client-marriage-info-list">
              <div className="client-marriage-info-item">
                <p>Must be a baptized Catholic (at least one of the partners)</p>
              </div>
              <div className="client-marriage-info-item">
                <p>Must have received the Sacrament of Confirmation</p>
              </div>
              <div className="client-marriage-info-item">
                <p>Must undergo a Pre-Cana Seminar or Marriage Preparation Program</p>
              </div>
              <div className="client-marriage-info-item">
                <p>Must be of legal age (as required by civil law)</p>
              </div>
              <div className="client-marriage-info-item">
                <p>Must provide proof of freedom to marry (e.g., no previous valid marriage in the Church)</p>
              </div>
            </div>

            <h3 className="client-marriage-section-header">Parish Requirements</h3>
            <div className="client-marriage-info-list">
              <div className="client-marriage-info-item">
                <p>Must schedule an interview with the parish priest</p>
              </div>
              <div className="client-marriage-info-item">
                <p>Must submit all required documents at least 3 months before the wedding</p>
              </div>
              <div className="client-marriage-info-item">
                <p>Must attend marriage banns (announcements made in the parish for three consecutive Sundays)</p>
              </div>
              <div className="client-marriage-info-item">
                <p>Must choose sponsors (Ninong & Ninang) who are practicing Catholics</p>
              </div>
            </div>

            <h3 className="client-marriage-section-header">Dress Code (If Specified by Parish)</h3>
            <div className="client-marriage-info-list">
              <div className="client-marriage-info-item">
                <p>Groom: Formal attire (barong or suit)</p>
              </div>
              <div className="client-marriage-info-item">
                <p>Bride: Modest wedding gown (with sleeves or shawl for Church ceremony)</p>
              </div>
              <div className="client-marriage-info-item">
                <p>Sponsors: Formal attire, respectful and modest</p>
              </div>
            </div>
          </div>
        </div>

        <div className="client-marriage-button-container">
          <button className="client-marriage-submit-btn" onClick={handleSubmit}>Submit</button>
          <button className="client-marriage-cancel-btn">Cancel</button>
        </div>
      </div>

      {/* Download Modal */}
      {showModal && (
        <div className="client-marriage-modal-overlay">
          <div className="client-marriage-modal">
            <h2>Submit Application</h2>
            <hr class="custom-hr-b"/>
            <p>Are you sure you want to submit your Holy Matrimony application?</p>
            <div className="client-marriage-modal-buttons">
              <button className="client-marriage-yes-btn" onClick={handleYes}>Yes</button>
              <button className="client-marriage-modal-no-btn" onClick={handleNo}>No</button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="client-marriage-modal-overlay">
          <div className="client-marriage-modal">
            <h2>Success!</h2>
            <hr className="custom-hr-b"/>
            <p>Your marriage application has been submitted successfully.</p>
            <div className="client-marriage-modal-buttons">
              <button className="client-marriage-yes-btn" onClick={handleCloseSuccessModal}>OK</button>
            </div>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <div className="client-marriage-modal-overlay">
          <div className="client-marriage-modal">
            <h2>Error</h2>
            <hr className="custom-hr-b"/>
            <p>{errorMessage}</p>
            <div className="client-marriage-modal-buttons">
              <button className="client-marriage-modal-no-btn" onClick={handleCloseErrorModal}>OK</button>
            </div>
          </div>
        </div>
      )}

      {/* Loading Modal */}
      {isLoading && (
        <div className="client-marriage-modal-overlay">
          <div className="client-marriage-modal">
            <h2>Processing Application</h2>
            <hr className="custom-hr-b"/>
            <p>Please wait while we submit your Holy Matrimony application...</p>
            <div className="client-marriage-loading-spinner">
              <div className="client-marriage-spinner"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Marriage;