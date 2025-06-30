import React, { useState, useRef, useEffect } from "react";
import { AiOutlineArrowLeft, AiOutlineUpload, AiOutlineClose } from "react-icons/ai"; 
import { useLocation, useNavigate } from "react-router-dom";
import "./ClientCommunion.css";
import axios from "axios";

const ClientCommunion = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {clientID} = location.state || {};
  console.log('Received clientID:', clientID);
 
  // Form state
 // REPLACE the formData state initialization:
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
  // REMOVE father_region
  father_contact: "",
  mother_first_name: "",
  mother_middle_name: "",
  mother_last_name: "",
  mother_dateOfBirth: "",
  mother_placeOfBirth: "",
  // REMOVE mother_region
  mother_contact: "",
});

  // Add state for separate birth location fields
  const [birthFields, setBirthFields] = useState({
    barangay: '',
    municipality: '',
    province: ''
  });

  const [fatherBirthFields, setFatherBirthFields] = useState({
    barangay: '',
    municipality: '',
    province: ''
  });

  const [motherBirthFields, setMotherBirthFields] = useState({
    barangay: '',
    municipality: '',
    province: ''
  });

  // Requirements
  const [requirements, setRequirements] = useState({
    baptism_cert: { file: null, status: "Not Submitted" },
    first_communion_cert: { file: null, status: "Not Submitted" },
    birth_cert: { file: null, status: "Not Submitted" },
  });

  // File input refs
  const fileInputRefs = {
    baptism_cert: useRef(null),
    first_communion_cert: useRef(null),
    birth_cert: useRef(null),
  };

  // States for location data
  const [locationData, setLocationData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [focusedField, setFocusedField] = useState(null);
 // REPLACE the suggestions state:
const [suggestions, setSuggestions] = useState({
  barangay: [],
  municipality: [],
  province: [],
  birthBarangay: [],
  birthMunicipality: [],
  birthProvince: [],
  fatherBirthBarangay: [],
  fatherBirthMunicipality: [],
  fatherBirthProvince: [],
  motherBirthBarangay: [],
  motherBirthMunicipality: [],
  motherBirthProvince: [],
  region: [] // Keep only home address region
  // REMOVE pob_region, father_region, mother_region
});

  // States for dropdown data
  const [schedules, setSchedules] = useState([]);
  const [priests, setPriests] = useState([]);
  const [uniqueDates, setUniqueDates] = useState([]);
  const [filteredTimes, setFilteredTimes] = useState([]);
  const [filteredPriests, setFilteredPriests] = useState([]);

  // State for existing communion applications
  const [existingCommunions, setExistingCommunions] = useState([]);

  // Add these state variables after the other state declarations
  const [showModal, setShowModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Add validation states after the existing state declarations
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
    fetchCommunionSchedules();
    fetchPriests();
    fetchLocations();
  }, []);

  // Updated fetchCommunionSchedules function that filters booked slots
  const fetchCommunionSchedules = async () => {
    try {
      // Fetch both schedules and existing applications in parallel
      const [schedulesResponse, communionsResponse] = await Promise.all([
        fetch('http://parishofdivinemercy.com/backend/schedule.php'),
        fetch('http://parishofdivinemercy.com/backend/get_communion_applications.php')
      ]);
      
      const scheduleData = await schedulesResponse.json();
      const communionData = await communionsResponse.json();
      
      if (scheduleData.success) {
        // Filter only communion schedules
        const communionSchedules = scheduleData.schedules.filter(
          schedule => schedule.sacramentType.toLowerCase() === 'communion'
        );
        
        // Store existing applications for reference
        if (communionData.success) {
          setExistingCommunions(communionData.applications);
        }
        
        // Get existing communion applications
        const existingCommunionSet = new Set();
        if (communionData.success) {
          communionData.applications.forEach(app => {
            existingCommunionSet.add(`${app.date}-${app.time}`);
          });
        }

        // Filter out already booked schedules
        const availableSchedules = communionSchedules.filter(schedule => {
          const key = `${schedule.date}-${schedule.time}`;
          return !existingCommunionSet.has(key);
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
      console.error('Error fetching communion schedules:', error);
    }
  };

  // Fetch priests
  const fetchPriests = async () => {
    try {
      const response = await fetch('http://parishofdivinemercy.com/backend/parish.php');
      const data = await response.json();
      if (data.success) {
        setPriests(data.parishes);
      }
    } catch (error) {
      console.error('Error fetching priests:', error);
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

  // Update available priests when date and time are selected
  useEffect(() => {
    if (formData.date && formData.time) {
      const priestsForDateTime = schedules
        .filter(schedule => 
          schedule.date === formData.date && 
          schedule.time === formData.time
        )
        .map(schedule => schedule.parishName);
      const uniquePriests = [...new Set(priestsForDateTime)];
      setFilteredPriests(uniquePriests);
      if (!uniquePriests.includes(formData.priest)) {
        setFormData(prev => ({ ...prev, priest: '' }));
      }
    } else {
      setFilteredPriests([]);
    }
  }, [formData.date, formData.time, schedules]);

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

// ADD this new auto-fill helper function:
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
    
    // Auto-fill if only one option exists
    if (uniqueMunicipalities.length === 1) {
      if (fieldPrefix === 'address') {
        updates.municipality = uniqueMunicipalities[0];
      } else {
        updates[`${fieldPrefix}`].municipality = uniqueMunicipalities[0];
      }
      console.log(`Auto-filling municipality: ${uniqueMunicipalities[0]}`);
    }
    if (uniqueProvinces.length === 1) {
      if (fieldPrefix === 'address') {
        updates.province = uniqueProvinces[0];
      } else {
        updates[`${fieldPrefix}`].province = uniqueProvinces[0];
      }
      console.log(`Auto-filling province: ${uniqueProvinces[0]}`);
    }
  } 
  else if (selectedType === 'municipality') {
    // Find all locations with this municipality
    const matchingLocations = locationData.filter(loc => loc.municipality === selectedValue);
    
    // Get unique provinces
    const uniqueProvinces = [...new Set(matchingLocations.map(loc => loc.province))];
    
    console.log(`Municipality "${selectedValue}" found in provinces:`, uniqueProvinces);
    
    // Auto-fill if only one option exists
    if (uniqueProvinces.length === 1) {
      if (fieldPrefix === 'address') {
        updates.province = uniqueProvinces[0];
      } else {
        updates[`${fieldPrefix}`].province = uniqueProvinces[0];
      }
      console.log(`Auto-filling province: ${uniqueProvinces[0]}`);
    }
  }
  
  return updates;
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
    
    if (!input || !input.trim()) {
      return regions.slice(0, 10);
    }
    
    return regions
      .filter(region => region.toLowerCase().includes(inputLower))
      .slice(0, 10);
  };

  // Functions to update combined place strings from separate fields
  const updatePlaceOfBirth = (updatedFields) => {
    const barangay = updatedFields.barangay !== undefined ? updatedFields.barangay : birthFields.barangay;
    const municipality = updatedFields.municipality !== undefined ? updatedFields.municipality : birthFields.municipality;
    const province = updatedFields.province !== undefined ? updatedFields.province : birthFields.province;
    
    let parts = [];
    if (barangay) parts.push(barangay);
    if (municipality) parts.push(municipality); 
    if (province) parts.push(province);
    
    const formattedPlace = parts.join(', ');
    
    if (formattedPlace) {
      setFormData(prevState => ({
        ...prevState,
        placeOfBirth: formattedPlace
      }));
    }
  };

  const updateFatherPlaceOfBirth = (updatedFields) => {
    const barangay = updatedFields.barangay !== undefined ? updatedFields.barangay : fatherBirthFields.barangay;
    const municipality = updatedFields.municipality !== undefined ? updatedFields.municipality : fatherBirthFields.municipality;
    const province = updatedFields.province !== undefined ? updatedFields.province : fatherBirthFields.province;
    
    let parts = [];
    if (barangay) parts.push(barangay);
    if (municipality) parts.push(municipality); 
    if (province) parts.push(province);
    
    const formattedPlace = parts.join(', ');
    
    if (formattedPlace) {
      setFormData(prevState => ({
        ...prevState,
        father_placeOfBirth: formattedPlace
      }));
    }
  };

  const updateMotherPlaceOfBirth = (updatedFields) => {
    const barangay = updatedFields.barangay !== undefined ? updatedFields.barangay : motherBirthFields.barangay;
    const municipality = updatedFields.municipality !== undefined ? updatedFields.municipality : motherBirthFields.municipality;
    const province = updatedFields.province !== undefined ? updatedFields.province : motherBirthFields.province;
    
    let parts = [];
    if (barangay) parts.push(barangay);
    if (municipality) parts.push(municipality); 
    if (province) parts.push(province);
    
    const formattedPlace = parts.join(', ');
    
    if (formattedPlace) {
      setFormData(prevState => ({
        ...prevState,
        mother_placeOfBirth: formattedPlace
      }));
    }
  };

  // Handlers for place of birth fields
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

  const handleSelectBirthBarangay = (barangay) => {
    const newFields = {
      ...birthFields,
      barangay: barangay
    };
    
    setBirthFields(newFields);
    updatePlaceOfBirth(newFields);
    setFocusedField(null);
    
    // Auto-fill municipality and province if available
    const matchedLocation = locationData.find(loc => loc.barangay === barangay);
    if (matchedLocation) {
      const finalFields = {...newFields};
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
        setBirthFields(finalFields);
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

// Apply similar logic to other selection handlers...


  const handleSelectBirthProvince = (province) => {
    const newFields = {
      ...birthFields,
      province: province
    };
    
    setBirthFields(newFields);
    updatePlaceOfBirth(newFields);
    setFocusedField(null);
  };

  // Handlers for father's place of birth fields
  const handleFatherBirthBarangayChange = (e) => {
    const value = e.target.value;
    const updatedFields = {...fatherBirthFields, barangay: value};
    setFatherBirthFields(updatedFields);
    updateFatherPlaceOfBirth(updatedFields);
    
    if (focusedField === 'fatherBirthBarangay') {
      setSuggestions(prev => ({ 
        ...prev, 
        fatherBirthBarangay: filterBarangays(value, fatherBirthFields.municipality, fatherBirthFields.province) 
      }));
    }
  };

 const handleFatherBirthMunicipalityChange = (e) => {
  const value = e.target.value;
  const updatedFields = {...fatherBirthFields, municipality: value};
  setFatherBirthFields(updatedFields);
  updateFatherPlaceOfBirth(updatedFields);
  
  if (focusedField === 'fatherBirthMunicipality') {
    setSuggestions(prev => ({ 
      ...prev, 
      fatherBirthMunicipality: filterMunicipalities(value, fatherBirthFields.province, fatherBirthFields.barangay) 
    }));
  }
  // NO AUTO-FILL while typing
};

  const handleFatherBirthProvinceChange = (e) => {
    const value = e.target.value;
    const updatedFields = {...fatherBirthFields, province: value};
    setFatherBirthFields(updatedFields);
    updateFatherPlaceOfBirth(updatedFields);
    
    if (focusedField === 'fatherBirthProvince') {
      setSuggestions(prev => ({ 
        ...prev, 
        fatherBirthProvince: filterProvinces(value) 
      }));
    }
  };

  const handleSelectFatherBirthBarangay = (barangay) => {
    const newFields = {
      ...fatherBirthFields,
      barangay: barangay
    };
    
    setFatherBirthFields(newFields);
    updateFatherPlaceOfBirth(newFields);
    setFocusedField(null);
    
    // Auto-fill municipality and province if available
    const matchedLocation = locationData.find(loc => loc.barangay === barangay);
    if (matchedLocation) {
      const finalFields = {...newFields};
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
        setFatherBirthFields(finalFields);
        updateFatherPlaceOfBirth(finalFields);
      }
    }
  };

  const handleSelectFatherBirthMunicipality = (municipality) => {
    const newFields = {
      ...fatherBirthFields,
      municipality: municipality
    };
    
    setFatherBirthFields(newFields);
    updateFatherPlaceOfBirth(newFields);
    
    // Auto-fill province if available
    const matchedLocation = locationData.find(loc => loc.municipality === municipality);
    if (matchedLocation && !fatherBirthFields.province) {
      const finalFields = {
        ...newFields,
        province: matchedLocation.province
      };
      
      setFatherBirthFields(finalFields);
      updateFatherPlaceOfBirth(finalFields);
    }
    
    setFocusedField(null);
  };

  const handleSelectFatherBirthProvince = (province) => {
    const newFields = {
      ...fatherBirthFields,
      province: province
    };
    
    setFatherBirthFields(newFields);
    updateFatherPlaceOfBirth(newFields);
    setFocusedField(null);
  };

  // Handlers for mother's place of birth fields
  const handleMotherBirthBarangayChange = (e) => {
    const value = e.target.value;
    const updatedFields = {...motherBirthFields, barangay: value};
    setMotherBirthFields(updatedFields);
    updateMotherPlaceOfBirth(updatedFields);
    
    if (focusedField === 'motherBirthBarangay') {
      setSuggestions(prev => ({ 
        ...prev, 
        motherBirthBarangay: filterBarangays(value, motherBirthFields.municipality, motherBirthFields.province) 
      }));
    }
  };

 const handleMotherBirthMunicipalityChange = (e) => {
  const value = e.target.value;
  const updatedFields = {...motherBirthFields, municipality: value};
  setMotherBirthFields(updatedFields);
  updateMotherPlaceOfBirth(updatedFields);
  
  if (focusedField === 'motherBirthMunicipality') {
    setSuggestions(prev => ({ 
      ...prev, 
      motherBirthMunicipality: filterMunicipalities(value, motherBirthFields.province, motherBirthFields.barangay) 
    }));
  }
  // NO AUTO-FILL while typing
};

  const handleMotherBirthProvinceChange = (e) => {
    const value = e.target.value;
    const updatedFields = {...motherBirthFields, province: value};
    setMotherBirthFields(updatedFields);
    updateMotherPlaceOfBirth(updatedFields);
    
    if (focusedField === 'motherBirthProvince') {
      setSuggestions(prev => ({ 
        ...prev, 
        motherBirthProvince: filterProvinces(value) 
      }));
    }
  };

  const handleSelectMotherBirthBarangay = (barangay) => {
    const newFields = {
      ...motherBirthFields,
      barangay: barangay
    };
    
    setMotherBirthFields(newFields);
    updateMotherPlaceOfBirth(newFields);
    setFocusedField(null);
    
    // Auto-fill municipality and province if available
    const matchedLocation = locationData.find(loc => loc.barangay === barangay);
    if (matchedLocation) {
      const finalFields = {...newFields};
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
        setMotherBirthFields(finalFields);
        updateMotherPlaceOfBirth(finalFields);
      }
    }
  };

  const handleSelectMotherBirthMunicipality = (municipality) => {
    const newFields = {
      ...motherBirthFields,
      municipality: municipality
    };
    
    setMotherBirthFields(newFields);
    updateMotherPlaceOfBirth(newFields);
    
    // Auto-fill province if available
    const matchedLocation = locationData.find(loc => loc.municipality === municipality);
    if (matchedLocation && !motherBirthFields.province) {
      const finalFields = {
        ...newFields,
        province: matchedLocation.province
      };
      
      setMotherBirthFields(finalFields);
      updateMotherPlaceOfBirth(finalFields);
    }
    
    setFocusedField(null);
  };

  const handleSelectMotherBirthProvince = (province) => {
    const newFields = {
      ...motherBirthFields,
      province: province
    };
    
    setMotherBirthFields(newFields);
    updateMotherPlaceOfBirth(newFields);
    setFocusedField(null);
  };

  // Add handlers for region fields
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

 
  
  // Updated focus handlers to handle separate location fields
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
      case 'fatherBirthBarangay':
        setSuggestions(prev => ({ 
          ...prev, 
          fatherBirthBarangay: filterBarangays(fatherBirthFields.barangay, fatherBirthFields.municipality, fatherBirthFields.province) 
        }));
        break;
      case 'fatherBirthMunicipality':
        setSuggestions(prev => ({ 
          ...prev, 
          fatherBirthMunicipality: filterMunicipalities(fatherBirthFields.municipality, fatherBirthFields.province) 
        }));
        break;
      case 'fatherBirthProvince':
        setSuggestions(prev => ({ 
          ...prev, 
          fatherBirthProvince: filterProvinces(fatherBirthFields.province) 
        }));
        break;
      case 'motherBirthBarangay':
        setSuggestions(prev => ({ 
          ...prev, 
          motherBirthBarangay: filterBarangays(motherBirthFields.barangay, motherBirthFields.municipality, motherBirthFields.province) 
        }));
        break;
      case 'motherBirthMunicipality':
        setSuggestions(prev => ({ 
          ...prev, 
          motherBirthMunicipality: filterMunicipalities(motherBirthFields.municipality, motherBirthFields.province) 
        }));
        break;
      case 'motherBirthProvince':
        setSuggestions(prev => ({ 
          ...prev, 
          motherBirthProvince: filterProvinces(motherBirthFields.province) 
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
          municipality: filterMunicipalities(formData.municipality || '', formData.province)
        }));
        break;
      case 'province':
        setSuggestions(prev => ({
          ...prev,
          province: filterProvinces(formData.province || '')
        }));
        break;
      case 'region':
        setSuggestions(prev => ({
          ...prev,
          region: filterRegions(formData.region || '')
        }));
        break;
      case 'father_region':
        setSuggestions(prev => ({
          ...prev,
          father_region: filterRegions(formData.father_region || '')
        }));
        break;
      case 'mother_region':
        setSuggestions(prev => ({
          ...prev,
          mother_region: filterRegions(formData.mother_region || '')
        }));
        break;
      case 'pob_region':
        setSuggestions(prev => ({
          ...prev,
          pob_region: filterRegions(formData.pob_region || '')
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

  // Update handleDateChange to calculate age
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

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // No special handling needed for gender - use the value directly as selected from dropdown
    setFormData(prev => ({ ...prev, [name]: value }));
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

  // Updated selection handlers for address fields
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

  // Update handleFileChange to handle uploading state
  const handleFileChange = (key, e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Set status to "Uploading..." first
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
      if (validationErrors.documents) {
        setValidationErrors(prev => {
          const updated = { ...prev };
          delete updated.documents;
          return updated;
        });
        setShowValidationErrors(false);
      }
    }, 1000); // Simulate upload delay
  };

  // Add a function to trigger file input click
  const triggerFileUpload = (key) => {
    if (fileInputRefs[key] && fileInputRefs[key].current) {
      fileInputRefs[key].current.click();
    }
  };

  // Function to handle requirement checkbox click
  const handleRequirementCheckboxClick = (key) => {
    // If the requirement is currently submitted, clear it when unchecked
    if (requirements[key].status === "Submitted") {
      // Clear the file input
      if (fileInputRefs[key] && fileInputRefs[key].current) {
        fileInputRefs[key].current.value = '';
      }
      
      // Clear the uploaded file data
      setRequirements((prev) => ({
        ...prev,
        [key]: { file: null, status: "Not Submitted" },
      }));
    } 
    // If not submitted and not uploading, trigger file upload
    else if (requirements[key].status !== "Uploading...") {
      triggerFileUpload(key);
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
    } else {
      setRequirements((prev) => ({
        ...prev,
        [key]: { ...prev[key], status: newStatus },
      }));
    }
  };

  // Add this validation function before the handleSubmit function
  const validateForm = () => {
    const errors = {};
    
    // Required fields
    const requiredFields = [
      { name: 'date', label: 'Date of Holy Communion' },
      { name: 'time', label: 'Time of Holy Communion' },
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

  // Replace the existing handleSubmit function with this new version
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
      return;
    }

    // Check if there are any scheduling conflicts
    const selectedDate = formData.date;
    const selectedTime = formData.time;
    
    const conflictingAppointment = existingCommunions.find(communion => 
      communion.date === selectedDate && 
      communion.time === selectedTime
    );
    
    if (conflictingAppointment) {
      setErrorMessage('This schedule is already booked. Please select a different date or time.');
      setShowErrorModal(true);
      return;
    }

    setShowModal(true);
  };

  const handleYes = async () => {
    setShowModal(false);
    setIsLoading(true);
    console.log('Starting form submission...');
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("clientID", clientID);
      formDataToSend.append("applicationData", JSON.stringify(formData));
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
      formDataToSend.append(
        "fatherData",
        JSON.stringify({
          first_name: formData.father_first_name,
          middle_name: formData.father_middle_name,
          last_name: formData.father_last_name,
          dateOfBirth: formData.father_dateOfBirth,
          placeOfBirth: formData.father_placeOfBirth,
          contact_number: formData.father_contact,
        })
      );
      formDataToSend.append(
        "motherData",
        JSON.stringify({
          first_name: formData.mother_first_name,
          middle_name: formData.mother_middle_name,
          last_name: formData.mother_last_name,
          dateOfBirth: formData.mother_dateOfBirth,
          placeOfBirth: formData.mother_placeOfBirth,
          contact_number: formData.mother_contact,
        })
      );

      // Requirements
      Object.keys(requirements).forEach((key) => {
        if (requirements[key].file) {
          formDataToSend.append(key, requirements[key].file);
        }
        formDataToSend.append(`${key}_status`, requirements[key].status);
      });

      console.log('Sending form data to backend...');
      // Send to backend
      const response = await fetch(
        "http://parishofdivinemercy.com/backend/communion_application.php",
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

      if (data.success) {
        console.log('Application submitted successfully, sending email...');
        // Send confirmation email
        try {
          const emailResponse = await fetch(
            "http://parishofdivinemercy.com/backend/send_communion_email.php",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                clientID: clientID,
                communionData: {
                  ...formData,
                  date: formData.date,
                  time: formData.time,
                  firstName: formData.first_name,
                  middleName: formData.middle_name,
                  lastName: formData.last_name,
                  gender: formData.gender,
                  age: formData.age,
                  dateOfBirth: formData.dateOfBirth,
                  dateOfBaptism: formData.dateOfBaptism,
                  churchOfBaptism: formData.churchOfBaptism,
                  placeOfBirth: formData.placeOfBirth,
                  address: {
                    street: formData.street,
                    barangay: formData.barangay,
                    municipality: formData.municipality,
                    province: formData.province,
                    region: formData.region
                  },
                  father: {
                    firstName: formData.father_first_name,
                    middleName: formData.father_middle_name,
                    lastName: formData.father_last_name,
                    dateOfBirth: formData.father_dateOfBirth,
                    placeOfBirth: formData.father_placeOfBirth,
                    contact: formData.father_contact
                  },
                  mother: {
                    firstName: formData.mother_first_name,
                    middleName: formData.mother_middle_name,
                    lastName: formData.mother_last_name,
                    dateOfBirth: formData.mother_dateOfBirth,
                    placeOfBirth: formData.mother_placeOfBirth,
                    contact: formData.mother_contact
                  }
                }
              }),
            }
          );
          
          const emailResponseText = await emailResponse.text();
          console.log('Raw email response:', emailResponseText);
          
          let emailData;
          try {
            emailData = JSON.parse(emailResponseText);
            console.log('Parsed email response:', emailData);
          } catch (e) {
            console.error('Failed to parse email response as JSON:', emailResponseText);
            // Continue anyway - don't block the success message
          }
        } catch (emailError) {
          console.error('Error sending email:', emailError);
          // Continue anyway - don't block the success message
        }
        
        setShowSuccessModal(true);
        setIsLoading(false);
        // Redirect after success
        setTimeout(() => {
          navigate('/client-appointment');
        }, 2000);
      } else {
        console.error('Application submission failed:', data.message);
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
    <div className="client-communion-container">
      {/* Header */}
      <div className="client-communion-header">
        <div className="client-communion-left-section">
          <button className="client-communion-back-button" onClick={() => window.history.back()}>
            <AiOutlineArrowLeft className="client-communion-back-icon" /> Back
          </button>
        </div>
      </div>
      <h1 className="client-communion-title">Holy Communion Application Form</h1>
      
      {/* Communion Data Section */}
      <div className="client-communion-data">
        <div className="client-communion-row-date">
          <div className="client-communion-field-date">
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
          
          <div className="client-communion-field-time">
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

        <div className="client-communion-bypart">
          <h3 className="client-communion-sub-title">Personal Information</h3>
          <div className="client-communion-row">
            <div className={`client-communion-field ${showValidationErrors && validationErrors.first_name ? 'field-error' : ''}`}>
              <label>First Name <span className="required-marker">*</span></label>
              <input 
                name="first_name" 
                value={formData.first_name} 
                onChange={handleInputChange} 
                className={showValidationErrors && validationErrors.first_name ? 'input-error' : ''}
              />
            </div>
            <div className="client-communion-field">
              <label>Middle Name</label>
              <input name="middle_name" value={formData.middle_name} onChange={handleInputChange} />
            </div>
            <div className={`client-communion-field ${showValidationErrors && validationErrors.last_name ? 'field-error' : ''}`}>
              <label>Last Name <span className="required-marker">*</span></label>
              <input 
                name="last_name" 
                value={formData.last_name} 
                onChange={handleInputChange} 
                className={showValidationErrors && validationErrors.last_name ? 'input-error' : ''}
              />
            </div>
            <div className={`client-communion-field ${showValidationErrors && validationErrors.dateOfBirth ? 'field-error' : ''}`}>
              <label>Date of Birth <span className="required-marker">*</span></label>
              <input 
                name="dateOfBirth" 
                type="date" 
                onChange={(e) => handleDateChange('dateOfBirth', e.target.value)} 
                className={`date-input ${showValidationErrors && validationErrors.dateOfBirth ? 'input-error' : ''}`}
              />
            </div>
          </div>
          <div className="client-communion-row">
            <div className="client-communion-field">
              <label>Age</label>
              <input name="age" value={formData.age} onChange={handleInputChange} />
            </div>
            <div className={`client-communion-field ${showValidationErrors && validationErrors.gender ? 'field-error' : ''}`}>
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
            <div className={`client-communion-field ${showValidationErrors && validationErrors.dateOfBaptism ? 'field-error' : ''}`}>
              <label>Date of Baptism <span className="required-marker">*</span></label>
              <input 
                name="dateOfBaptism" 
                type="date" 
                onChange={(e) => handleDateChange('dateOfBaptism', e.target.value)} 
                className={`date-input ${showValidationErrors && validationErrors.dateOfBaptism ? 'input-error' : ''}`}
              />
            </div>
            <div className={`client-communion-field ${showValidationErrors && validationErrors.churchOfBaptism ? 'field-error' : ''}`}>
              <label>Church of Baptism <span className="required-marker">*</span></label>
              <input 
                name="churchOfBaptism" 
                value={formData.churchOfBaptism} 
                onChange={handleInputChange} 
                className={showValidationErrors && validationErrors.churchOfBaptism ? 'input-error' : ''}
              />
            </div>
          </div>
          
          {/* Place of Birth with separated fields */}
          <label className="sub-cc">Place of Birth <span className="required-marker">*</span></label>
          <div className="client-communion-row">
            <div className={`client-communion-field location-dropdown-container ${showValidationErrors && validationErrors.placeOfBirth ? 'field-error' : ''}`}>
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
            <div className={`client-communion-field location-dropdown-container ${showValidationErrors && validationErrors.placeOfBirth ? 'field-error' : ''}`}>
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
            <div className={`client-communion-field location-dropdown-container ${showValidationErrors && validationErrors.placeOfBirth ? 'field-error' : ''}`}>
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
            <div className="client-communion-field location-dropdown-container">
             
            </div>
          </div>
          
          {/* Address Fields */}
          <label className="sub-cc">Home Address <span className="required-marker">*</span></label>
          <div className="client-communion-row">
          <div className={`client-communion-field ${showValidationErrors && validationErrors.street ? 'field-error' : ''}`}>
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
           <div className={`client-communion-field location-dropdown-container ${showValidationErrors && validationErrors.barangay ? 'field-error' : ''}`}>
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
           <div className={`client-communion-field location-dropdown-container ${showValidationErrors && validationErrors.municipality ? 'field-error' : ''}`}>
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
           <div className={`client-communion-field location-dropdown-container ${showValidationErrors && validationErrors.province ? 'field-error' : ''}`}>
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
           <div className="client-communion-field location-dropdown-container">
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
         <h3 className="client-communion-sub-title">Father's Information</h3>
         <div className="client-communion-row">
           <div className={`client-communion-field ${showValidationErrors && validationErrors.father_first_name ? 'field-error' : ''}`}>
             <label>Father's First Name <span className="required-marker">*</span></label>
             <input 
               name="father_first_name" 
               value={formData.father_first_name} 
               onChange={handleInputChange}
               className={showValidationErrors && validationErrors.father_first_name ? 'input-error' : ''} 
             />
           </div>
           <div className="client-communion-field">
             <label>Father's Middle Name</label>
             <input name="father_middle_name" value={formData.father_middle_name} onChange={handleInputChange} />
           </div>
           <div className={`client-communion-field ${showValidationErrors && validationErrors.father_last_name ? 'field-error' : ''}`}>
             <label>Father's Last Name <span className="required-marker">*</span></label>
             <input 
               name="father_last_name" 
               value={formData.father_last_name} 
               onChange={handleInputChange}
               className={showValidationErrors && validationErrors.father_last_name ? 'input-error' : ''} 
             />
           </div>
         </div>
         <div className="client-communion-row">
           <div className="client-communion-field">
             <label>Father's Date of Birth</label>
             <input name="father_dateOfBirth" type="date" value={formData.father_dateOfBirth} onChange={handleInputChange} className="date-input" />
           </div>
           <div className="client-communion-field">
             <label>Father's Contact Number</label>
             <input name="father_contact" value={formData.father_contact} onChange={handleInputChange} />
           </div>
           <div className="client-communion-field location-dropdown-container">
             
           </div>
         </div>
         
         {/* Father's Place of Birth with separated fields */}
         <label className="sub-cc">Father's Place of Birth</label>
         <div className="client-communion-row">
           <div className="client-communion-field location-dropdown-container">
             <label>Father's Birth Barangay</label>
             <input
               type="text"
               placeholder="Type to search"
               value={fatherBirthFields.barangay}
               onChange={handleFatherBirthBarangayChange}
               onFocus={() => handleFocus('fatherBirthBarangay')}
             />
             {focusedField === 'fatherBirthBarangay' && suggestions.fatherBirthBarangay.length > 0 && (
               <div className="location-dropdown">
                 {suggestions.fatherBirthBarangay.map((barangay, index) => (
                   <div 
                     key={index}
                     onClick={() => handleSelectFatherBirthBarangay(barangay)}
                     className="location-dropdown-item"
                   >
                     {barangay}
                   </div>
                 ))}
               </div>
             )}
           </div>
           <div className="client-communion-field location-dropdown-container">
             <label>Father's Birth Municipality</label>
             <input 
               type="text"
               placeholder="Type to search"
               value={fatherBirthFields.municipality}
               onChange={handleFatherBirthMunicipalityChange}
               onFocus={() => handleFocus('fatherBirthMunicipality')}
             />
             {focusedField === 'fatherBirthMunicipality' && suggestions.fatherBirthMunicipality.length > 0 && (
               <div className="location-dropdown">
                 {suggestions.fatherBirthMunicipality.map((municipality, index) => (
                   <div 
                     key={index}
                     onClick={() => handleSelectFatherBirthMunicipality(municipality)}
                     className="location-dropdown-item"
                   >
                     {municipality}
                   </div>
                 ))}
               </div>
             )}
           </div>
           <div className="client-communion-field location-dropdown-container">
             <label>Father's Birth Province</label>
             <input 
               type="text"
               placeholder="Type to search"
               value={fatherBirthFields.province}
               onChange={handleFatherBirthProvinceChange}
               onFocus={() => handleFocus('fatherBirthProvince')}
             />
             {focusedField === 'fatherBirthProvince' && suggestions.fatherBirthProvince.length > 0 && (
               <div className="location-dropdown">
                 {suggestions.fatherBirthProvince.map((province, index) => (
                   <div 
                     key={index}
                     onClick={() => handleSelectFatherBirthProvince(province)}
                     className="location-dropdown-item"
                   >
                     {province}
                   </div>
                 ))}
               </div>
             )}
           </div>
         </div>
         
         {/* Mother's Information */}
         <h3 className="client-communion-sub-title">Mother's Information</h3>
         <div className="client-communion-row">
           <div className={`client-communion-field ${showValidationErrors && validationErrors.mother_first_name ? 'field-error' : ''}`}>
             <label>Mother's First Name <span className="required-marker">*</span></label>
             <input 
               name="mother_first_name" 
               value={formData.mother_first_name} 
               onChange={handleInputChange}
               className={showValidationErrors && validationErrors.mother_first_name ? 'input-error' : ''} 
             />
           </div>
           <div className="client-communion-field">
             <label>Mother's Middle Name</label>
             <input name="mother_middle_name" value={formData.mother_middle_name} onChange={handleInputChange} />
           </div>
           <div className={`client-communion-field ${showValidationErrors && validationErrors.mother_last_name ? 'field-error' : ''}`}>
             <label>Mother's Last Name <span className="required-marker">*</span></label>
             <input 
               name="mother_last_name" 
               value={formData.mother_last_name} 
               onChange={handleInputChange}
               className={showValidationErrors && validationErrors.mother_last_name ? 'input-error' : ''}
             />
           </div>
         </div>
         <div className="client-communion-row">
           <div className="client-communion-field">
             <label>Mother's Date of Birth</label>
             <input name="mother_dateOfBirth" type="date" value={formData.mother_dateOfBirth} onChange={handleInputChange} className="date-input" />
           </div>
           <div className="client-communion-field">
             <label>Mother's Contact Number</label>
             <input name="mother_contact" value={formData.mother_contact} onChange={handleInputChange} />
           </div>
           <div className="client-communion-field location-dropdown-container">
            
           </div>
         </div>
         
         {/* Mother's Place of Birth with separated fields */}
         <label className="sub-cc">Mother's Place of Birth</label>
         <div className="client-communion-row">
           <div className="client-communion-field location-dropdown-container">
             <label>Mother's Birth Barangay</label>
             <input
               type="text"
               placeholder="Type to search"
               value={motherBirthFields.barangay}
               onChange={handleMotherBirthBarangayChange}
               onFocus={() => handleFocus('motherBirthBarangay')}
             />
             {focusedField === 'motherBirthBarangay' && suggestions.motherBirthBarangay.length > 0 && (
               <div className="location-dropdown">
                 {suggestions.motherBirthBarangay.map((barangay, index) => (
                   <div 
                     key={index}
                     onClick={() => handleSelectMotherBirthBarangay(barangay)}
                     className="location-dropdown-item"
                   >
                     {barangay}
                   </div>
                 ))}
               </div>
             )}
           </div>
           <div className="client-communion-field location-dropdown-container">
             <label>Mother's Birth Municipality</label>
             <input 
               type="text"
               placeholder="Type to search"
               value={motherBirthFields.municipality}
               onChange={handleMotherBirthMunicipalityChange}
               onFocus={() => handleFocus('motherBirthMunicipality')}
             />
             {focusedField === 'motherBirthMunicipality' && suggestions.motherBirthMunicipality.length > 0 && (
               <div className="location-dropdown">
                 {suggestions.motherBirthMunicipality.map((municipality, index) => (
                   <div 
                     key={index}
                     onClick={() => handleSelectMotherBirthMunicipality(municipality)}
                     className="location-dropdown-item"
                   >
                     {municipality}
                   </div>
                 ))}
               </div>
             )}
           </div>
           <div className="client-communion-field location-dropdown-container">
             <label>Mother's Birth Province</label>
             <input 
               type="text"
               placeholder="Type to search"
               value={motherBirthFields.province}
               onChange={handleMotherBirthProvinceChange}
               onFocus={() => handleFocus('motherBirthProvince')}
             />
             {focusedField === 'motherBirthProvince' && suggestions.motherBirthProvince.length > 0 && (
               <div className="location-dropdown">
                 {suggestions.motherBirthProvince.map((province, index) => (
                   <div 
                     key={index}
                     onClick={() => handleSelectMotherBirthProvince(province)}
                     className="location-dropdown-item"
                   >
                     {province}
                   </div>
                 ))}
               </div>
             )}
           </div>
         </div>
       </div>
       
       {/* Requirements section */}
       <div className="client-communion-requirements-container">
         <h2 className="client-communion-requirements-title">Requirements(Bring the following documents)</h2>
         <div className="client-communion-requirements-box">
           <h3 className="client-communion-section-header">Documents Needed</h3>
           <div className="client-communion-info-list">
             <div className="client-communion-info-item">
               <p>Certificate of Baptism(Proof of Catholic Baptism)</p>
             </div>
             <div className="client-communion-info-item">
               <p>First Communion Certificate(If Applicable, for record purposes)</p>
             </div>
             <div className="client-communion-info-item">
               <p>Birth Certificate(For verification purposes)</p>
             </div>
             <div className="client-communion-info-item">
               <p>Certificate of Permission(If outside the Parish)</p>
             </div>
           </div>

           <h3 className="client-communion-section-header">Requirements for Candidate</h3>
           <div className="client-communion-info-list">
             <div className="client-communion-info-item">
               <p>Must be a baptized Catholic</p>
             </div>
             <div className="client-communion-info-item">
               <p>Must have reached the age of reason (usually around 7 years old)</p>
             </div>
             <div className="client-communion-info-item">
               <p>Must have received the Sacrament of Reconciliation (Confession) before First Communion</p>
             </div>
             <div className="client-communion-info-item">
               <p>Must attend a First Communion Catechesis or Religious Instruction Program</p>
             </div>
             <div className="client-communion-info-item">
               <p>Must understand the significance of the Holy Eucharist and believe in the real presence of Christ in the sacrament</p>
             </div>
             <div className="client-communion-info-item">
               <p>Must attend a First Communion Retreat (if required by the parish)</p>
             </div>
           </div>

           <h3 className="client-communion-section-header">Parish Requirements</h3>
           <div className="client-communion-info-list">
             <div className="client-communion-info-item">
               <p>Must be registered in the parish where First Communion will be received</p>
             </div>
             <div className="client-communion-info-item">
               <p>Must attend the required preparation classes and rehearsals</p>
             </div>
             <div className="client-communion-info-item">
               <p>Must participate in a First Communion Retreat (if required by the parish)</p>
             </div>
           </div>

           <h3 className="client-communion-section-header">Dress Code (If Specified by Parish)</h3>
           <div className="client-communion-info-list">
             <div className="client-communion-info-item">
               <p>Boys: White polo or barong, black pants, and formal shoes</p>
             </div>
             <div className="client-communion-info-item">
               <p>Girls: White dress with sleeves (modest), white veil (optional), and formal shoes</p>
             </div>
           </div>
         </div>
       </div>

       <div className="client-communion-button-container">
         <button className="client-communion-submit-btn" onClick={handleSubmit}>Submit</button>
         <button className="client-communion-cancel-btn">Cancel</button>
       </div>
     </div>

     {/* Submit Confirmation Modal */}
     {showModal && (
       <div className="client-communion-modal-overlay">
         <div className="client-communion-modal">
           <h2>Submit Application</h2>
           <hr className="client-communion-custom-hr"/>
           <p>Are you sure you want to submit your Holy Communion application?</p>
           <div className="client-communion-modal-buttons">
             <button className="client-communion-yes-btn" onClick={handleYes}>Yes</button>
             <button className="client-communion-modal-no-btn" onClick={() => setShowModal(false)}>No</button>
           </div>
         </div>
       </div>
     )}

     {/* Success Modal */}
     {showSuccessModal && (
       <div className="client-communion-modal-overlay">
         <div className="client-communion-modal">
           <h2>Success</h2>
           <hr className="client-communion-custom-hr"/>
           <p>Your Holy Communion application has been submitted successfully!</p>
           <div className="client-communion-modal-buttons">
             <button className="client-communion-yes-btn" onClick={() => setShowSuccessModal(false)}>OK</button>
           </div>
         </div>
       </div>
     )}

     {/* Error Modal */}
     {showErrorModal && (
       <div className="client-communion-modal-overlay">
         <div className="client-communion-modal">
           <h2>Error</h2>
           <hr className="client-communion-custom-hr"/>
           <p>{errorMessage}</p>
           <div className="client-communion-modal-buttons">
             <button className="client-communion-modal-no-btn" onClick={() => setShowErrorModal(false)}>OK</button>
           </div>
         </div>
       </div>
     )}

     {/* Loading Modal */}
     {isLoading && (
       <div className="client-communion-modal-overlay">
         <div className="client-communion-modal">
           <h2>Processing Application</h2>
           <hr className="client-communion-custom-hr"/>
           <p>Please wait while we submit your Holy Communion application...</p>
           <div className="client-communion-loading-spinner">
             <div className="client-communion-spinner"></div>
           </div>
         </div>
       </div>
     )}
   </div>
 );
};

export default ClientCommunion;