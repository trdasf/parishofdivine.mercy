import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AiOutlineArrowLeft, AiOutlineUpload } from "react-icons/ai"; 
import axios from "axios";
import "../../client/clientconfirmation.css";

const Confirmation = () => {
   const location = useLocation();


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
  // Separate birth location fields
  birth_barangay: "",
  birth_municipality: "",
  birth_province: "",
  // REMOVE pob_region
  street: "",
  barangay: "",
  municipality: "",
  province: "",
  region: "", // Keep only home address region
  father_first_name: "",
  father_middle_name: "",
  father_last_name: "",
  father_dateOfBirth: "",
  father_placeOfBirth: "",
  // Separate father birth location fields
  father_birth_barangay: "",
  father_birth_municipality: "",
  father_birth_province: "",
  // REMOVE father_region
  father_contact: "",
  mother_first_name: "",
  mother_middle_name: "",
  mother_last_name: "",
  mother_dateOfBirth: "",
  mother_placeOfBirth: "",
  // Separate mother birth location fields
  mother_birth_barangay: "",
  mother_birth_municipality: "",
  mother_birth_province: "",
  // REMOVE mother_region
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
  const [documentErrors, setDocumentErrors] = useState([]);
  const [suggestions, setSuggestions] = useState({
  barangay: [],
  municipality: [],
  province: [],
  birth_barangay: [],
  birth_municipality: [],
  birth_province: [],
  father_birth_barangay: [],
  father_birth_municipality: [],
  father_birth_province: [],
  mother_birth_barangay: [],
  mother_birth_municipality: [],
  mother_birth_province: [],
  region: [] // Keep only home address region
  // REMOVE pob_region, father_region, mother_region
});

  const [schedules, setSchedules] = useState([]);
  const [uniqueDates, setUniqueDates] = useState([]);
  const [filteredTimes, setFilteredTimes] = useState([]);

  // Add state for existing confirmation applications


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
  
  }, []);

  // Fetch schedules for Confirmation
 const fetchConfirmationSchedules = async () => {
  try {
    const [schedulesResponse, confirmationsResponse] = await Promise.all([
      fetch('http://parishofdivinemercy.com/backend/schedule.php'),
      fetch('http://parishofdivinemercy.com/backend/get_confirmation_applications.php')
    ]);
    
    const scheduleData = await schedulesResponse.json();
    const confirmationData = await confirmationsResponse.json();
    
    if (scheduleData.success) {
      // Filter only confirmation schedules
      const confirmationSchedules = scheduleData.schedules.filter(
        schedule => schedule.sacramentType.toLowerCase() === 'confirmation'
      );
      
      // Get existing confirmation applications
      const existingConfirmationSet = new Set();
      if (confirmationData.success) {
        confirmationData.applications.forEach(app => {
          const key = `${app.date}-${app.time}`;
          existingConfirmationSet.add(key);
        });
      }

      // Filter out already booked schedules
      const availableSchedules = confirmationSchedules.filter(schedule => {
        const key = `${schedule.date}-${schedule.time}`;
        return !existingConfirmationSet.has(key);
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
    return allBarangays.slice(0, 20); // Limit to 20 for performance
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
    return allBarangays.slice(0, 20); // Limit to 20 for performance
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
      province: filterProvinces(value, formData.municipality, formData.barangay)
    }));
  }
};
  const handleRegionChange = (e) => {
  const value = e.target.value;
  setFormData(prev => ({ ...prev, region: value }));
  
  if (focusedField === 'region') {
    setSuggestions(prev => ({
      ...prev,
      region: filterRegions(value)
    }));
  }
};
const handleSelectRegion = (region) => {
  setFormData(prev => ({ ...prev, region: region }));
  setFocusedField(null);
};

  // Birth place handlers for candidate
  const handleBirthBarangayChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, birth_barangay: value }));
    
    if (focusedField === 'birth_barangay') {
      setSuggestions(prev => ({
        ...prev,
        birth_barangay: filterBarangays(value, formData.birth_municipality, formData.birth_province)
      }));
    }
  };

 const handleBirthMunicipalityChange = (e) => {
  const value = e.target.value;
  setFormData(prev => ({ ...prev, birth_municipality: value }));
  
  if (focusedField === 'birth_municipality') {
    setSuggestions(prev => ({
      ...prev,
      birth_municipality: filterMunicipalities(value, formData.birth_province, formData.birth_barangay)
    }));
  }
  // NO AUTO-FILL while typing
};

 const handleBirthProvinceChange = (e) => {
  const value = e.target.value;
  setFormData(prev => ({ ...prev, birth_province: value }));
  
  if (focusedField === 'birth_province') {
    setSuggestions(prev => ({
      ...prev,
      birth_province: filterProvinces(value, formData.birth_municipality, formData.birth_barangay)
    }));
  }
};

  // Father birth place handlers
  const handleFatherBirthBarangayChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, father_birth_barangay: value }));
    
    if (focusedField === 'father_birth_barangay') {
      setSuggestions(prev => ({
        ...prev,
        father_birth_barangay: filterBarangays(value, formData.father_birth_municipality, formData.father_birth_province)
      }));
    }
  };

 const handleFatherBirthMunicipalityChange = (e) => {
  const value = e.target.value;
  setFormData(prev => ({ ...prev, father_birth_municipality: value }));
  
  if (focusedField === 'father_birth_municipality') {
    setSuggestions(prev => ({
      ...prev,
      father_birth_municipality: filterMunicipalities(value, formData.father_birth_province, formData.father_birth_barangay)
    }));
  }
  // NO AUTO-FILL while typing
};

 const handleFatherBirthProvinceChange = (e) => {
  const value = e.target.value;
  setFormData(prev => ({ ...prev, father_birth_province: value }));
  
  if (focusedField === 'father_birth_province') {
    setSuggestions(prev => ({
      ...prev,
      father_birth_province: filterProvinces(value, formData.father_birth_municipality, formData.father_birth_barangay)
    }));
  }
};
  // Mother birth place handlers
  const handleMotherBirthBarangayChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, mother_birth_barangay: value }));
    
    if (focusedField === 'mother_birth_barangay') {
      setSuggestions(prev => ({
        ...prev,
        mother_birth_barangay: filterBarangays(value, formData.mother_birth_municipality, formData.mother_birth_province)
      }));
    }
  };

 const handleMotherBirthMunicipalityChange = (e) => {
  const value = e.target.value;
  setFormData(prev => ({ ...prev, mother_birth_municipality: value }));
  
  if (focusedField === 'mother_birth_municipality') {
    setSuggestions(prev => ({
      ...prev,
      mother_birth_municipality: filterMunicipalities(value, formData.mother_birth_province, formData.mother_birth_barangay)
    }));
  }
  // NO AUTO-FILL while typing
};


 const handleMotherBirthProvinceChange = (e) => {
  const value = e.target.value;
  setFormData(prev => ({ ...prev, mother_birth_province: value }));
  
  if (focusedField === 'mother_birth_province') {
    setSuggestions(prev => ({
      ...prev,
      mother_birth_province: filterProvinces(value, formData.mother_birth_municipality, formData.mother_birth_barangay)
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

  // Birth place selection handlers
  const handleSelectBirthBarangay = (barangay) => {
    setFormData(prev => ({ ...prev, birth_barangay: barangay }));
    setFocusedField(null);
    
    const matchedLocation = locationData.find(loc => loc.barangay === barangay);
    if (matchedLocation) {
      if (!formData.birth_municipality) {
        setFormData(prev => ({ ...prev, birth_municipality: matchedLocation.municipality }));
      }
      if (!formData.birth_province) {
        setFormData(prev => ({ ...prev, birth_province: matchedLocation.province }));
      }
    }
  };

 const handleSelectBirthMunicipality = (municipality) => {
  setFormData(prev => ({ ...prev, birth_municipality: municipality }));
  setFocusedField(null);
  
  // Auto-fill province if available
  const matchingLocations = locationData.filter(loc => loc.municipality === municipality);
  const uniqueProvinces = [...new Set(matchingLocations.map(loc => loc.province))];
  
  if (uniqueProvinces.length === 1 && !formData.birth_province) {
    setFormData(prev => ({ ...prev, birth_province: uniqueProvinces[0] }));
  }
};

  const handleSelectBirthProvince = (province) => {
    setFormData(prev => ({ ...prev, birth_province: province }));
    setFocusedField(null);
  };

  // Father birth place selection handlers
  const handleSelectFatherBirthBarangay = (barangay) => {
    setFormData(prev => ({ ...prev, father_birth_barangay: barangay }));
    setFocusedField(null);
    
    const matchedLocation = locationData.find(loc => loc.barangay === barangay);
    if (matchedLocation) {
      if (!formData.father_birth_municipality) {
        setFormData(prev => ({ ...prev, father_birth_municipality: matchedLocation.municipality }));
      }
      if (!formData.father_birth_province) {
        setFormData(prev => ({ ...prev, father_birth_province: matchedLocation.province }));
      }
    }
  };

  const handleSelectFatherBirthMunicipality = (municipality) => {
  setFormData(prev => ({ ...prev, father_birth_municipality: municipality }));
  setFocusedField(null);
  
  // Auto-fill province if available
  const matchingLocations = locationData.filter(loc => loc.municipality === municipality);
  const uniqueProvinces = [...new Set(matchingLocations.map(loc => loc.province))];
  
  if (uniqueProvinces.length === 1 && !formData.father_birth_province) {
    setFormData(prev => ({ ...prev, father_birth_province: uniqueProvinces[0] }));
  }
};

  const handleSelectFatherBirthProvince = (province) => {
    setFormData(prev => ({ ...prev, father_birth_province: province }));
    setFocusedField(null);
  };

  // Mother birth place selection handlers
  const handleSelectMotherBirthBarangay = (barangay) => {
    setFormData(prev => ({ ...prev, mother_birth_barangay: barangay }));
    setFocusedField(null);
    
    const matchedLocation = locationData.find(loc => loc.barangay === barangay);
    if (matchedLocation) {
      if (!formData.mother_birth_municipality) {
        setFormData(prev => ({ ...prev, mother_birth_municipality: matchedLocation.municipality }));
      }
      if (!formData.mother_birth_province) {
        setFormData(prev => ({ ...prev, mother_birth_province: matchedLocation.province }));
      }
    }
  };

 const handleSelectMotherBirthMunicipality = (municipality) => {
  setFormData(prev => ({ ...prev, mother_birth_municipality: municipality }));
  setFocusedField(null);
  
  // Auto-fill province if available
  const matchingLocations = locationData.filter(loc => loc.municipality === municipality);
  const uniqueProvinces = [...new Set(matchingLocations.map(loc => loc.province))];
  
  if (uniqueProvinces.length === 1 && !formData.mother_birth_province) {
    setFormData(prev => ({ ...prev, mother_birth_province: uniqueProvinces[0] }));
  }
};

  const handleSelectMotherBirthProvince = (province) => {
    setFormData(prev => ({ ...prev, mother_birth_province: province }));
    setFocusedField(null);
  };

  // Updated focus handlers
 const handleFocus = (field) => {
  setFocusedField(field);
  
  switch(field) {
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
    
    // Birth location fields
    case 'birth_barangay':
      setSuggestions(prev => ({
        ...prev,
        birth_barangay: filterBarangays(formData.birth_barangay || '', formData.birth_municipality, formData.birth_province)
      }));
      break;
    case 'birth_municipality':
      setSuggestions(prev => ({
        ...prev,
        birth_municipality: filterMunicipalities(formData.birth_municipality || '', formData.birth_province, formData.birth_barangay)
      }));
      break;
    case 'birth_province':
      setSuggestions(prev => ({
        ...prev,
        birth_province: filterProvinces(formData.birth_province || '', formData.birth_municipality, formData.birth_barangay)
      }));
      break;
    
    // Father's birth location fields
    case 'father_birth_barangay':
      setSuggestions(prev => ({
        ...prev,
        father_birth_barangay: filterBarangays(formData.father_birth_barangay || '', formData.father_birth_municipality, formData.father_birth_province)
      }));
      break;
    case 'father_birth_municipality':
      setSuggestions(prev => ({
        ...prev,
        father_birth_municipality: filterMunicipalities(formData.father_birth_municipality || '', formData.father_birth_province, formData.father_birth_barangay)
      }));
      break;
    case 'father_birth_province':
      setSuggestions(prev => ({
        ...prev,
        father_birth_province: filterProvinces(formData.father_birth_province || '', formData.father_birth_municipality, formData.father_birth_barangay)
      }));
      break;
    
    // Mother's birth location fields
    case 'mother_birth_barangay':
      setSuggestions(prev => ({
        ...prev,
        mother_birth_barangay: filterBarangays(formData.mother_birth_barangay || '', formData.mother_birth_municipality, formData.mother_birth_province)
      }));
      break;
    case 'mother_birth_municipality':
      setSuggestions(prev => ({
        ...prev,
        mother_birth_municipality: filterMunicipalities(formData.mother_birth_municipality || '', formData.mother_birth_province, formData.mother_birth_barangay)
      }));
      break;
    case 'mother_birth_province':
      setSuggestions(prev => ({
        ...prev,
        mother_birth_province: filterProvinces(formData.mother_birth_province || '', formData.mother_birth_municipality, formData.mother_birth_barangay)
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

  // Handle date change
  const handleDateChange = (field, value) => {
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
     { name: 'birth_barangay', label: 'Birth Barangay' },
     { name: 'birth_municipality', label: 'Birth Municipality' },
     { name: 'birth_province', label: 'Birth Province' },
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
  // Combine birth place fields before validation
  const combinedPlaceOfBirth = [
    formData.birth_barangay,
    formData.birth_municipality,
    formData.birth_province
  ].filter(Boolean).join(', ');
  
  const combinedFatherPlaceOfBirth = [
    formData.father_birth_barangay,
    formData.father_birth_municipality,
    formData.father_birth_province
  ].filter(Boolean).join(', ');
  
  const combinedMotherPlaceOfBirth = [
    formData.mother_birth_barangay,
    formData.mother_birth_municipality,
    formData.mother_birth_province
  ].filter(Boolean).join(', ');
  
  // Update formData with combined values for validation
  const updatedFormData = {
    ...formData,
    placeOfBirth: combinedPlaceOfBirth,
    father_placeOfBirth: combinedFatherPlaceOfBirth,
    mother_placeOfBirth: combinedMotherPlaceOfBirth
  };
  
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
  
  // Since we're filtering schedules in fetchConfirmationSchedules,
  // if the date/time appears in availableDates and availableTimes,
  // it means it's not booked. No need to check conflicts here.
  
  // Clear validation errors if all fields are valid
  setValidationErrors({});
  
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
    
    // Combine birth place fields
    const combinedPlaceOfBirth = [
      formData.birth_barangay,
      formData.birth_municipality,
      formData.birth_province
    ].filter(Boolean).join(', ');
    
    const combinedFatherPlaceOfBirth = [
      formData.father_birth_barangay,
      formData.father_birth_municipality,
      formData.father_birth_province
    ].filter(Boolean).join(', ');
    
    const combinedMotherPlaceOfBirth = [
      formData.mother_birth_barangay,
      formData.mother_birth_municipality,
      formData.mother_birth_province
    ].filter(Boolean).join(', ');
    
    // Create a formatted copy of the form data
    const formattedData = {
      ...formData,
      placeOfBirth: combinedPlaceOfBirth,
      father_placeOfBirth: combinedFatherPlaceOfBirth,
      mother_placeOfBirth: combinedMotherPlaceOfBirth,
      dateOfBirth: formatDate(formData.dateOfBirth),
      dateOfBaptism: formatDate(formData.dateOfBaptism),
      father_dateOfBirth: formatDate(formData.father_dateOfBirth),
      mother_dateOfBirth: formatDate(formData.mother_dateOfBirth)
    };
    
    // Create FormData object
    const formDataToSend = new FormData();
    
    // Add form fields with formatted dates
 
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
        placeOfBirth: combinedFatherPlaceOfBirth,
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
        placeOfBirth: combinedMotherPlaceOfBirth,
        dateOfBirth: formattedData.mother_dateOfBirth,
        contact_number: formattedData.mother_contact,
      })
    );
    
    // Add files if any requirements were uploaded
    Object.keys(requirements).forEach((key) => {
      if (requirements[key].file) {
        formDataToSend.append(key, requirements[key].file);
      }
      formDataToSend.append(`${key}_status`, requirements[key].status);
    });
    
    console.log('Sending form data to backend...');
    // Send to backend
    const response = await fetch(
      "http://parishofdivinemercy.com/backend/confirmation_application.php",
      {
        method: "POST",
        body: formDataToSend,
      }
    );
    
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
      console.log('Application submitted successfully, sending email...');
    
      setShowSuccessModal(true);
      setTimeout(() => {
        navigate("/client-appointment");
      }, 2000);
    } else {
      console.error('Application submission failed:', data.message);
      setErrorMessage(data.message || "Failed to submit application");
      setShowErrorModal(true);
    }
  } catch (error) {
    setIsLoading(false);
    console.error('Error submitting form:', error);
    setErrorMessage(error.message || "An error occurred while submitting your application. Please try again.");
    setShowErrorModal(true);
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
         
         {/* Birth Place Fields - Separated into three fields */}
         <label className="sub-cc">Place of Birth <span className="required-marker">*</span></label>
         <div className="client-kumpil-row">
           <div className={`client-kumpil-field location-dropdown-container ${showValidationErrors && validationErrors.birth_barangay ? 'field-error' : ''}`}>
             <label>Birth Barangay <span className="required-marker">*</span></label>
             <input
               name="birth_barangay"
               value={formData.birth_barangay || ""}
               onChange={handleBirthBarangayChange}
               onFocus={() => handleFocus('birth_barangay')}
               placeholder="Type to search"
               autoComplete="off"
               className={showValidationErrors && validationErrors.birth_barangay ? 'input-error' : ''}
             />
             {focusedField === 'birth_barangay' && (
               <div className="location-dropdown">
                 {suggestions.birth_barangay && suggestions.birth_barangay.length > 0 ? (
                   suggestions.birth_barangay.map((barangay, idx) => (
                     <div key={idx} onClick={() => handleSelectBirthBarangay(barangay)} className="location-dropdown-item">
                       {barangay}
                     </div>
                   ))
                 ) : (
                   <div className="location-dropdown-item">No barangays found</div>
                 )}
               </div>
             )}
           </div>
           <div className={`client-kumpil-field location-dropdown-container ${showValidationErrors && validationErrors.birth_municipality ? 'field-error' : ''}`}>
             <label>Birth Municipality <span className="required-marker">*</span></label>
             <input
               name="birth_municipality"
               value={formData.birth_municipality || ""}
               onChange={handleBirthMunicipalityChange}
               onFocus={() => handleFocus('birth_municipality')}
               placeholder="Type to search"
               autoComplete="off"
               className={showValidationErrors && validationErrors.birth_municipality ? 'input-error' : ''}
             />
             {focusedField === 'birth_municipality' && (
               <div className="location-dropdown">
                 {suggestions.birth_municipality && suggestions.birth_municipality.length > 0 ? (
                   suggestions.birth_municipality.map((municipality, idx) => (
                     <div key={idx} onClick={() => handleSelectBirthMunicipality(municipality)} className="location-dropdown-item">
                       {municipality}
                     </div>
                   ))
                 ) : (
                   <div className="location-dropdown-item">No municipalities found</div>
                 )}
               </div>
             )}
           </div>
           <div className={`client-kumpil-field location-dropdown-container ${showValidationErrors && validationErrors.birth_province ? 'field-error' : ''}`}>
             <label>Birth Province <span className="required-marker">*</span></label>
             <input
               name="birth_province"
               value={formData.birth_province || ""}
               onChange={handleBirthProvinceChange}
               onFocus={() => handleFocus('birth_province')}
               placeholder="Type to search"
               autoComplete="off"
               className={showValidationErrors && validationErrors.birth_province ? 'input-error' : ''}
             />
             {focusedField === 'birth_province' && (
               <div className="location-dropdown">
                 {suggestions.birth_province && suggestions.birth_province.length > 0 ? (
                   suggestions.birth_province.map((province, idx) => (
                     <div key={idx} onClick={() => handleSelectBirthProvince(province)} className="location-dropdown-item">
                       {province}
                     </div>
                   ))
                 ) : (
                   <div className="location-dropdown-item">No provinces found</div>
                 )}
               </div>
             )}
           </div>
         </div>
         
         {/* Address Fields */}
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
    onChange={handleRegionChange}
    onFocus={() => handleFocus('region')}
    placeholder="Type to search"
    autoComplete="off"
  />
  {focusedField === 'region' && (
    <div className="location-dropdown">
      {suggestions.region && suggestions.region.length > 0 ? (
        suggestions.region.map((region, idx) => (
          <div key={idx} onClick={() => handleSelectRegion(region)} className="location-dropdown-item">
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
           </div>
         
         {/* Father's Place of Birth - Separated into three fields */}
         <label className="sub-cc">Father's Place of Birth</label>
         <div className="client-kumpil-row">
           <div className="client-kumpil-field location-dropdown-container">
             <label>Father's Birth Barangay</label>
             <input
               name="father_birth_barangay"
               value={formData.father_birth_barangay || ""}
               onChange={handleFatherBirthBarangayChange}
               onFocus={() => handleFocus('father_birth_barangay')}
               placeholder="Type to search"
               autoComplete="off"
               />
             {focusedField === 'father_birth_barangay' && (
               <div className="location-dropdown">
                 {suggestions.father_birth_barangay && suggestions.father_birth_barangay.length > 0 ? (
                   suggestions.father_birth_barangay.map((barangay, idx) => (
                     <div key={idx} onClick={() => handleSelectFatherBirthBarangay(barangay)} className="location-dropdown-item">
                       {barangay}
                     </div>
                   ))
                 ) : (
                   <div className="location-dropdown-item">No barangays found</div>
                 )}
               </div>
             )}
           </div>
           <div className="client-kumpil-field location-dropdown-container">
             <label>Father's Birth Municipality</label>
             <input
               name="father_birth_municipality"
               value={formData.father_birth_municipality || ""}
               onChange={handleFatherBirthMunicipalityChange}
               onFocus={() => handleFocus('father_birth_municipality')}
               placeholder="Type to search"
               autoComplete="off"
             />
             {focusedField === 'father_birth_municipality' && (
               <div className="location-dropdown">
                 {suggestions.father_birth_municipality && suggestions.father_birth_municipality.length > 0 ? (
                   suggestions.father_birth_municipality.map((municipality, idx) => (
                     <div key={idx} onClick={() => handleSelectFatherBirthMunicipality(municipality)} className="location-dropdown-item">
                       {municipality}
                     </div>
                   ))
                 ) : (
                   <div className="location-dropdown-item">No municipalities found</div>
                 )}
               </div>
             )}
           </div>
           <div className="client-kumpil-field location-dropdown-container">
             <label>Father's Birth Province</label>
             <input
               name="father_birth_province"
               value={formData.father_birth_province || ""}
               onChange={handleFatherBirthProvinceChange}
               onFocus={() => handleFocus('father_birth_province')}
               placeholder="Type to search"
               autoComplete="off"
             />
             {focusedField === 'father_birth_province' && (
               <div className="location-dropdown">
                 {suggestions.father_birth_province && suggestions.father_birth_province.length > 0 ? (
                   suggestions.father_birth_province.map((province, idx) => (
                     <div key={idx} onClick={() => handleSelectFatherBirthProvince(province)} className="location-dropdown-item">
                       {province}
                     </div>
                   ))
                 ) : (
                   <div className="location-dropdown-item">No provinces found</div>
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
         </div>
         
         {/* Mother's Place of Birth - Separated into three fields */}
         <label className="sub-cc">Mother's Place of Birth</label>
         <div className="client-kumpil-row">
           <div className="client-kumpil-field location-dropdown-container">
             <label>Mother's Birth Barangay</label>
             <input
               name="mother_birth_barangay"
               value={formData.mother_birth_barangay || ""}
               onChange={handleMotherBirthBarangayChange}
               onFocus={() => handleFocus('mother_birth_barangay')}
               placeholder="Type to search"
               autoComplete="off"
             />
             {focusedField === 'mother_birth_barangay' && (
               <div className="location-dropdown">
                 {suggestions.mother_birth_barangay && suggestions.mother_birth_barangay.length > 0 ? (
                   suggestions.mother_birth_barangay.map((barangay, idx) => (
                     <div key={idx} onClick={() => handleSelectMotherBirthBarangay(barangay)} className="location-dropdown-item">
                       {barangay}
                     </div>
                   ))
                 ) : (
                   <div className="location-dropdown-item">No barangays found</div>
                 )}
               </div>
             )}
           </div>
           <div className="client-kumpil-field location-dropdown-container">
             <label>Mother's Birth Municipality</label>
             <input
               name="mother_birth_municipality"
               value={formData.mother_birth_municipality || ""}
               onChange={handleMotherBirthMunicipalityChange}
               onFocus={() => handleFocus('mother_birth_municipality')}
               placeholder="Type to search"
               autoComplete="off"
             />
             {focusedField === 'mother_birth_municipality' && (
               <div className="location-dropdown">
                 {suggestions.mother_birth_municipality && suggestions.mother_birth_municipality.length > 0 ? (
                   suggestions.mother_birth_municipality.map((municipality, idx) => (
                     <div key={idx} onClick={() => handleSelectMotherBirthMunicipality(municipality)} className="location-dropdown-item">
                       {municipality}
                     </div>
                   ))
                 ) : (
                   <div className="location-dropdown-item">No municipalities found</div>
                 )}
               </div>
             )}
           </div>
           <div className="client-kumpil-field location-dropdown-container">
             <label>Mother's Birth Province</label>
             <input
               name="mother_birth_province"
               value={formData.mother_birth_province || ""}
               onChange={handleMotherBirthProvinceChange}
               onFocus={() => handleFocus('mother_birth_province')}
               placeholder="Type to search"
               autoComplete="off"
             />
             {focusedField === 'mother_birth_province' && (
               <div className="location-dropdown">
                 {suggestions.mother_birth_province && suggestions.mother_birth_province.length > 0 ? (
                   suggestions.mother_birth_province.map((province, idx) => (
                     <div key={idx} onClick={() => handleSelectMotherBirthProvince(province)} className="location-dropdown-item">
                       {province}
                     </div>
                   ))
                 ) : (
                   <div className="location-dropdown-item">No provinces found</div>
                 )}
               </div>
             )}
           </div>
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


export default Confirmation;