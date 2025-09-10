import React, { useState, useRef, useEffect, useMemo } from "react";
import { AiOutlineArrowLeft, AiOutlineCheck, AiOutlineUpload, AiOutlineClose } from "react-icons/ai";
import { useLocation, useNavigate } from "react-router-dom";
import "./ClientBaptism.css";
import axios from 'axios';


const formatTimeTo12Hour = (time24) => {
  if (!time24) return '';
  
  // Handle different time formats that might come from backend
  let timeString = time24.toString();
  
  // If it's in HH:MM:SS format, extract just HH:MM
  if (timeString.includes(':')) {
    const parts = timeString.split(':');
    timeString = `${parts[0]}:${parts[1]}`;
  }
  
  // Create a date object with the time
  const [hours, minutes] = timeString.split(':');
  const date = new Date();
  date.setHours(parseInt(hours, 10));
  date.setMinutes(parseInt(minutes, 10));
  
  // Format to 12-hour time
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};
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

 // Add states for separate birth location components
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
   birthBarangay: [],
   birthMunicipality: [],
   birthProvince: [],
   fatherBirthBarangay: [],
   fatherBirthMunicipality: [],
   fatherBirthProvince: [],
   motherBirthBarangay: [],
   motherBirthMunicipality: [],
   motherBirthProvince: [],
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

 // Create memoized location indexes for faster filtering
 const locationIndexes = useMemo(() => {
   if (!locationData.length) return {};
   
   // Create indexes for each type of location data
   const barangays = {};
   const municipalities = {};
   const provinces = {};
   const barangaysByMunicipality = {};
   const barangaysByProvince = {};
   const municipalitiesByProvince = {};

   locationData.forEach(loc => {
     // Add to barangays index
     if (!barangays[loc.barangay.toLowerCase()]) {
       barangays[loc.barangay.toLowerCase()] = [];
     }
     barangays[loc.barangay.toLowerCase()].push(loc);

     // Add to municipalities index
     if (!municipalities[loc.municipality.toLowerCase()]) {
       municipalities[loc.municipality.toLowerCase()] = [];
     }
     municipalities[loc.municipality.toLowerCase()].push(loc);

     // Add to provinces index
     if (!provinces[loc.province.toLowerCase()]) {
       provinces[loc.province.toLowerCase()] = [];
     }
     provinces[loc.province.toLowerCase()].push(loc);

     // Add to barangaysByMunicipality index
     const munKey = loc.municipality.toLowerCase();
     if (!barangaysByMunicipality[munKey]) {
       barangaysByMunicipality[munKey] = new Set();
     }
     barangaysByMunicipality[munKey].add(loc.barangay);

     // Add to barangaysByProvince index
     const provKey = loc.province.toLowerCase();
     if (!barangaysByProvince[provKey]) {
       barangaysByProvince[provKey] = new Set();
     }
     barangaysByProvince[provKey].add(loc.barangay);

     // Add to municipalitiesByProvince index
     if (!municipalitiesByProvince[provKey]) {
       municipalitiesByProvince[provKey] = new Set();
     }
     municipalitiesByProvince[provKey].add(loc.municipality);
   });

   // Convert Sets to arrays
   Object.keys(barangaysByMunicipality).forEach(key => {
     barangaysByMunicipality[key] = Array.from(barangaysByMunicipality[key]);
   });

   Object.keys(barangaysByProvince).forEach(key => {
     barangaysByProvince[key] = Array.from(barangaysByProvince[key]);
   });

   Object.keys(municipalitiesByProvince).forEach(key => {
     municipalitiesByProvince[key] = Array.from(municipalitiesByProvince[key]);
   });

   return {
     barangays,
     municipalities,
     provinces,
     barangaysByMunicipality,
     barangaysByProvince,
     municipalitiesByProvince
   };
 }, [locationData]);

 // Memoize unique provinces and municipalities
 const uniqueProvinces = useMemo(() => {
   if (!locationData.length) return [];
   return [...new Set(locationData.map(loc => loc.province))].sort();
 }, [locationData]);

 const uniqueMunicipalities = useMemo(() => {
   if (!locationData.length) return [];
   return [...new Set(locationData.map(loc => loc.municipality))].sort();
 }, [locationData]);

 const uniqueBarangays = useMemo(() => {
   if (!locationData.length) return [];
   return [...new Set(locationData.map(loc => loc.barangay))].sort();
 }, [locationData]);

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

 // Optimized filter functions
 const filterBarangays = (input, municipality = null, province = null) => {
   if (!input || !input.trim() || !locationIndexes.barangays) {
     // Return an empty array or the first few items if input is empty
     if (municipality && locationIndexes.barangaysByMunicipality) {
       const municipalityKey = municipality.toLowerCase();
       if (locationIndexes.barangaysByMunicipality[municipalityKey]) {
         return locationIndexes.barangaysByMunicipality[municipalityKey].slice(0, 10);
       }
     } else if (province && locationIndexes.barangaysByProvince) {
       const provinceKey = province.toLowerCase();
       if (locationIndexes.barangaysByProvince[provinceKey]) {
         return locationIndexes.barangaysByProvince[provinceKey].slice(0, 10);
       }
     }
     return uniqueBarangays.slice(0, 10);
   }
   
   const inputLower = input.toLowerCase();
   
   // Use the appropriate index based on filters
   let filteredResults = [];
   if (municipality && province) {
     // Both municipality and province provided
     const municipalityKey = municipality.toLowerCase();
     if (locationIndexes.barangaysByMunicipality[municipalityKey]) {
       filteredResults = locationIndexes.barangaysByMunicipality[municipalityKey].filter(
         barangay => barangay.toLowerCase().includes(inputLower)
       );
     }
   } else if (municipality) {
     // Only municipality provided
     const municipalityKey = municipality.toLowerCase();
     if (locationIndexes.barangaysByMunicipality[municipalityKey]) {
       filteredResults = locationIndexes.barangaysByMunicipality[municipalityKey].filter(
         barangay => barangay.toLowerCase().includes(inputLower)
       );
     }
   } else if (province) {
     // Only province provided
     const provinceKey = province.toLowerCase();
     if (locationIndexes.barangaysByProvince[provinceKey]) {
       filteredResults = locationIndexes.barangaysByProvince[provinceKey].filter(
         barangay => barangay.toLowerCase().includes(inputLower)
       );
     }
   } else {
     // No filters, search all barangays
     filteredResults = uniqueBarangays.filter(
       barangay => barangay.toLowerCase().includes(inputLower)
     );
   }
   
   return filteredResults.slice(0, 10); // Limit to 10 results for better performance
 };

 const filterMunicipalities = (input, province = null) => {
   if (!input || !input.trim() || !locationIndexes.municipalities) {
     // Return an empty array or the first few items if input is empty
     if (province && locationIndexes.municipalitiesByProvince) {
       const provinceKey = province.toLowerCase();
       if (locationIndexes.municipalitiesByProvince[provinceKey]) {
         return locationIndexes.municipalitiesByProvince[provinceKey].slice(0, 10);
       }
     }
     return uniqueMunicipalities.slice(0, 10);
   }
   
   const inputLower = input.toLowerCase();
   
   let filteredResults = [];
   if (province) {
     // Province provided, filter municipalities by province
     const provinceKey = province.toLowerCase();
     if (locationIndexes.municipalitiesByProvince[provinceKey]) {
       filteredResults = locationIndexes.municipalitiesByProvince[provinceKey].filter(
         municipality => municipality.toLowerCase().includes(inputLower)
       );
     }
   } else {
     // No province filter, search all municipalities
     filteredResults = uniqueMunicipalities.filter(
       municipality => municipality.toLowerCase().includes(inputLower)
     );
   }
   
   return filteredResults.slice(0, 10); // Limit to 10 results
 };

 const filterProvinces = (input) => {
   if (!input || !input.trim() || !uniqueProvinces) {
     return uniqueProvinces.slice(0, 10);
   }
   
   const inputLower = input.toLowerCase();
   const filteredResults = uniqueProvinces.filter(
     province => province.toLowerCase().includes(inputLower)
   );
   
   return filteredResults.slice(0, 10); // Limit to 10 results
 };

 // Update the filterBirthPlaces function to show suggestions immediately
 const filterBirthPlaces = (input = '') => {
   if (!input.trim() || !locationData.length) {
     return [];
   }
   
   const inputLower = input.toLowerCase();
   const searchTerms = inputLower.split(/\s+/).filter(term => term.length > 0);
   
   if (searchTerms.length === 0) {
     return [];
   }
   
   // Only process the first 500 locations for performance
   const maxLocationsToCheck = Math.min(locationData.length, 500);
   const possibleLocations = [];
   
   for (let i = 0; i < maxLocationsToCheck; i++) {
     const loc = locationData[i];
     const locationString = `${loc.barangay} ${loc.municipality} ${loc.province}`.toLowerCase();
     
     if (searchTerms.every(term => locationString.includes(term))) {
       possibleLocations.push({
         barangay: loc.barangay,
         municipality: loc.municipality,
         province: loc.province
       });
       
       // Limit to 10 results for better performance
       if (possibleLocations.length >= 10) {
         break;
       }
     }
   }
   
   return possibleLocations;
 };

 // Update filterRegions function to show all options immediately
 const filterRegions = (input = '') => {
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
   
   const inputLower = input.toLowerCase();
   return regions
     .filter(region => region.toLowerCase().includes(inputLower))
     .slice(0, 10);
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
   if (!value) {
     handleInputChange(field, '');
     return;
   }
   
   // Just store the date in yyyy-mm-dd format directly
   handleInputChange(field, value);
   
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

 // Updated handlers for birth place fields
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
       birthMunicipality: filterMunicipalities(value, birthFields.province) 
     }));
   }
   
   // If typing a municipality, check if it has a province
   if (value && locationIndexes.municipalities) {
     const municipalityKey = value.toLowerCase();
     const matchedLocations = locationIndexes.municipalities[municipalityKey];
     
     if (matchedLocations && matchedLocations.length > 0 && !birthFields.province) {
       const newFields = {...updatedFields, province: matchedLocations[0].province};
       setBirthFields(newFields);
       updatePlaceOfBirth(newFields);
     }
   }
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
   if (locationIndexes.barangays) {
     const barangayKey = barangay.toLowerCase();
     const matchedLocations = locationIndexes.barangays[barangayKey];
     
     if (matchedLocations && matchedLocations.length > 0) {
       const foundMunicipality = matchedLocations[0].municipality;
       const foundProvince = matchedLocations[0].province;
       
       // Only update municipality and province if they're not already set
       const finalFields = {
         ...newFields
       };
       
       let shouldUpdate = false;
       
       if (!newFields.municipality && foundMunicipality) {
         finalFields.municipality = foundMunicipality;
         shouldUpdate = true;
       }
       
       if (!newFields.province && foundProvince) {
         finalFields.province = foundProvince;
         shouldUpdate = true;
       }
       
       if (shouldUpdate) {
         // Update the state with the additional fields
         setBirthFields(finalFields);
         // Update place of birth with complete information
         updatePlaceOfBirth(finalFields);
       }
     }
   }
 };

 const handleSelectBirthMunicipality = (municipality) => {
   // Create a copy with the updated municipality
   const newFields = {
     ...birthFields,
     municipality: municipality
   };
   
   // Update birth fields state
   setBirthFields(newFields);
   
   // Update place of birth with all fields
   updatePlaceOfBirth(newFields);
   
   // Find the province for this municipality
   if (locationIndexes.municipalities) {
     const municipalityKey = municipality.toLowerCase();
     const matchedLocations = locationIndexes.municipalities[municipalityKey];
     
     if (matchedLocations && matchedLocations.length > 0 && !birthFields.province) {
       const foundProvince = matchedLocations[0].province;
       
       // Update with the province
       const finalFields = {
         ...newFields,
         province: foundProvince
       };
       
       // Update the state
       setBirthFields(finalFields);
       // Update place of birth with complete information
       updatePlaceOfBirth(finalFields);
     }
   }
   
   setFocusedField(null);
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
 const handleSelectFatherBirthMunicipality = (municipality) => {
  // Create a copy with the updated municipality
  const newFields = {
    ...fatherBirthFields,
    municipality: municipality  // This sets the value in the field
  };
  
  // Update father birth fields state
  setFatherBirthFields(newFields);
  
  // Update father's place of birth with all fields
  updateFatherPlaceOfBirth(newFields);
  
  // Find the province for this municipality if not already set
  if (locationIndexes.municipalities) {
    const municipalityKey = municipality.toLowerCase();
    const matchedLocations = locationIndexes.municipalities[municipalityKey];
    
    if (matchedLocations && matchedLocations.length > 0 && !fatherBirthFields.province) {
      const foundProvince = matchedLocations[0].province;
      
      // Update with the province
      const finalFields = {
        ...newFields,
        province: foundProvince
      };
      
      // Update the state
      setFatherBirthFields(finalFields);
      // Update father's place of birth with complete information
      updateFatherPlaceOfBirth(finalFields);
    }
  }
  
  // Close the dropdown
  setFocusedField(null);
};

 // Handlers for father birth place fields
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
       fatherBirthMunicipality: filterMunicipalities(value, fatherBirthFields.province) 
     }));
   }
   
   // If typing a municipality, check if it has a province
   if (value && locationIndexes.municipalities) {
     const municipalityKey = value.toLowerCase();
     const matchedLocations = locationIndexes.municipalities[municipalityKey];
     
     if (matchedLocations && matchedLocations.length > 0 && !fatherBirthFields.province) {
       const newFields = {...updatedFields, province: matchedLocations[0].province};
       setFatherBirthFields(newFields);
       updateFatherPlaceOfBirth(newFields);
     }
   }
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

 // Function to update father's place of birth
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
       fatherPlaceOfBirth: formattedPlace
     }));
   }
 };

 // Handlers for father birth place selection
 const handleSelectFatherBirthBarangay = (barangay) => {
   const newFields = {
     ...fatherBirthFields,
     barangay: barangay
   };
   
   setFatherBirthFields(newFields);
   updateFatherPlaceOfBirth(newFields);
   setFocusedField(null);
   
   if (locationIndexes.barangays) {
     const barangayKey = barangay.toLowerCase();
     const matchedLocations = locationIndexes.barangays[barangayKey];
     
     if (matchedLocations && matchedLocations.length > 0 && !fatherBirthFields.province) {
       const foundProvince = matchedLocations[0].province;
       
       const finalFields = {
         ...newFields,
         province: foundProvince
       };
       
       setFatherBirthFields(finalFields);
       updateFatherPlaceOfBirth(finalFields);
     }
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

 // Handlers for mother birth place fields
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
       motherBirthMunicipality: filterMunicipalities(value, motherBirthFields.province) 
     }));
   }
   
   // If typing a municipality, check if it has a province
   if (value && locationIndexes.municipalities) {
     const municipalityKey = value.toLowerCase();
     const matchedLocations = locationIndexes.municipalities[municipalityKey];
     
     if (matchedLocations && matchedLocations.length > 0 && !motherBirthFields.province) {
       const newFields = {...updatedFields, province: matchedLocations[0].province};
       setMotherBirthFields(newFields);
       updateMotherPlaceOfBirth(newFields);
     }
   }
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

 // Function to update mother's place of birth
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
       motherPlaceOfBirth: formattedPlace
     }));
   }
 };

 // Handlers for mother birth place selection
 const handleSelectMotherBirthBarangay = (barangay) => {
   const newFields = {
     ...motherBirthFields,
     barangay: barangay
   };
   
   setMotherBirthFields(newFields);
   updateMotherPlaceOfBirth(newFields);
   setFocusedField(null);
   
   if (locationIndexes.barangays) {
     const barangayKey = barangay.toLowerCase();
     const matchedLocations = locationIndexes.barangays[barangayKey];
     
     if (matchedLocations && matchedLocations.length > 0) {
       const foundMunicipality = matchedLocations[0].municipality;
       const foundProvince = matchedLocations[0].province;
       
       const finalFields = {
         ...newFields
       };
       
       let shouldUpdate = false;
       
       if (!newFields.municipality && foundMunicipality) {
         finalFields.municipality = foundMunicipality;
         shouldUpdate = true;
       }
       
       if (!newFields.province && foundProvince) {
         finalFields.province = foundProvince;
         shouldUpdate = true;
       }
       
       if (shouldUpdate) {
         setMotherBirthFields(finalFields);
         updateMotherPlaceOfBirth(finalFields);
       }
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
   
   if (locationIndexes.municipalities) {
     const municipalityKey = municipality.toLowerCase();
     const matchedLocations = locationIndexes.municipalities[municipalityKey];
     
     if (matchedLocations && matchedLocations.length > 0 && !motherBirthFields.province) {
       const foundProvince = matchedLocations[0].province;
       
       const finalFields = {
         ...newFields,
         province: foundProvince
       };
       
       setMotherBirthFields(finalFields);
       updateMotherPlaceOfBirth(finalFields);
     }
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

 // Updated handlers for address fields
 const handleBarangayChange = (e) => {
   const value = e.target.value;
   handleInputChange('barangay', value);
   
   // Only update suggestions if field is focused
   if (focusedField === 'barangay') {
     const suggestions = filterBarangays(value, formData.municipality, formData.province);
     setSuggestions(prev => ({
       ...prev,
       barangay: suggestions
     }));
   }
 };

 const handleMunicipalityChange = (e) => {
   const value = e.target.value;
   handleInputChange('municipality', value);
   
   if (focusedField === 'municipality') {
     const suggestions = filterMunicipalities(value, formData.province);
     setSuggestions(prev => ({
       ...prev,
       municipality: suggestions
     }));
   }
   
   // If typing a municipality, check if it has a province
   if (value && locationIndexes.municipalities) {
     const municipalityKey = value.toLowerCase();
     const matchedLocations = locationIndexes.municipalities[municipalityKey];
     
     if (matchedLocations && matchedLocations.length > 0 && !formData.province) {
       handleInputChange('province', matchedLocations[0].province);
     }
   }
 };

 const handleProvinceChange = (e) => {
   const value = e.target.value;
   handleInputChange('province', value);
   
   if (focusedField === 'province') {
     const suggestions = filterProvinces(value);
     setSuggestions(prev => ({
       ...prev,
       province: suggestions
     }));
   }
 };

 // Handlers for region fields
 const handleRegionChange = (e) => {
   const value = e.target.value;
   handleInputChange('region', value);
   
   if (focusedField === 'region') {
     setSuggestions(prev => ({
       ...prev,
       region: filterRegions(value)
     }));
   }
 };
 
 const handleAddressRegionChange = (e) => {
   const value = e.target.value;
   handleInputChange('addressRegion', value);
   
   if (focusedField === 'addressRegion') {
     setSuggestions(prev => ({
       ...prev,
       addressRegion: filterRegions(value)
     }));
   }
 };

 // Updated selection handlers for address fields
 const handleSelectBarangay = (barangay) => {
   handleInputChange('barangay', barangay);
   setFocusedField(null);
   
   // Check if this barangay has a specific municipality and province
   if (locationIndexes.barangays) {
     const barangayKey = barangay.toLowerCase();
     const matchedLocations = locationIndexes.barangays[barangayKey];
     
     if (matchedLocations && matchedLocations.length > 0) {
       if (!formData.municipality) {
         handleInputChange('municipality', matchedLocations[0].municipality);
       }
       if (!formData.province) {
         handleInputChange('province', matchedLocations[0].province);
       }
     }
   }
 };

 const handleSelectMunicipality = (municipality) => {
   handleInputChange('municipality', municipality);
   
   // Find the province for this municipality
   if (locationIndexes.municipalities) {
     const municipalityKey = municipality.toLowerCase();
     const matchedLocations = locationIndexes.municipalities[municipalityKey];
     
     if (matchedLocations && matchedLocations.length > 0 && !formData.province) {
       handleInputChange('province', matchedLocations[0].province);
     }
   }
   
   setFocusedField(null);
 };

 const handleSelectProvince = (province) => {
   handleInputChange('province', province);
   setFocusedField(null);
 };

 // Selection handlers for regions
 const handleSelectRegion = (region) => {
   handleInputChange('region', region);
   setFocusedField(null);
 };
 
 const handleSelectAddressRegion = (region) => {
   handleInputChange('addressRegion', region);
   setFocusedField(null);
 };

 // Updated focus handlers with optimized performance
 const handleFocus = (field) => {
   setFocusedField(field);
   
   // Immediate feedback by showing suggestions based on current input
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
         barangay: filterBarangays(formData.barangay, formData.municipality, formData.province)
       }));
       break;
     case 'municipality':
       setSuggestions(prev => ({
         ...prev,
         municipality: filterMunicipalities(formData.municipality, formData.province)
       }));
       break;
     case 'province':
       setSuggestions(prev => ({
         ...prev,
         province: filterProvinces(formData.province)
       }));
       break;
     case 'region':
       setSuggestions(prev => ({
         ...prev,
         region: filterRegions(formData.region)
       }));
       break;
     case 'addressRegion':
       setSuggestions(prev => ({
         ...prev,
         addressRegion: filterRegions(formData.addressRegion)
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
 
     // Convert dates from yyyy-mm-dd format to server format if needed
     if (submitData.dateOfBirth && submitData.dateOfBirth.includes('-')) {
       const date = new Date(submitData.dateOfBirth);
       submitData.dateOfBirth = date.toISOString().split('T')[0];
     }
     if (submitData.fatherDateOfBirth && submitData.fatherDateOfBirth.includes('-')) {
       const date = new Date(submitData.fatherDateOfBirth);
       submitData.fatherDateOfBirth = date.toISOString().split('T')[0];
     }
     if (submitData.motherDateOfBirth && submitData.motherDateOfBirth.includes('-')) {
       const date = new Date(submitData.motherDateOfBirth);
       submitData.motherDateOfBirth = date.toISOString().split('T')[0];
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

 // Update marital status logic
 const handleMaritalStatusChange = (e) => {
   const value = e.target.value;
   handleInputChange('maritalStatus', value);
   if (value !== 'Married') {
     handleInputChange('yearsMarried', '0');
   }
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
                {formatTimeTo12Hour(time)}
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
               readOnly
             />
           </div>
         </div>
         <div className="client-baptismal-row">
          <div className="client-baptismal-field">
             <label>Date of Birth</label>
             <input 
               type="date"
               className={`date-input ${validationErrors.dateOfBirth ? 'client-error-input' : ''}`}
               onChange={(e) => handleDateChange('dateOfBirth', e.target.value)}
             />
           </div>
           <div className="client-baptismal-field location-dropdown-container">
             <label>Birth Province</label>
             <input 
               type="text"
               placeholder="Type to search"
               value={birthFields.province}
               onChange={handleBirthProvinceChange}
               onFocus={() => handleFocus('birthProvince')}
               className={validationErrors.placeOfBirth ? 'client-error-input' : ''}
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
           <div className="client-baptismal-field location-dropdown-container">
             <label>Birth Municipality</label>
             <input 
               type="text"
               placeholder="Type to search"
               value={birthFields.municipality}
               onChange={handleBirthMunicipalityChange}
               onFocus={() => handleFocus('birthMunicipality')}
               className={validationErrors.placeOfBirth ? 'client-error-input' : ''}
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
                      <div className="client-baptismal-field location-dropdown-container">
             <label>Birth Barangay</label>
             <input 
               type="text"
               placeholder="Type to search"
               value={birthFields.barangay}
               onChange={handleBirthBarangayChange}
               onFocus={() => handleFocus('birthBarangay')}
               className={validationErrors.placeOfBirth ? 'client-error-input' : ''}
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
            <div className="client-baptismal-field">
             <label>Father's Contact Number</label>
             <input 
               type="text"
               value={formData.fatherContact}
               onChange={(e) => handleInputChange('fatherContact', e.target.value)}
             />
           </div>
         </div>
         
         {/* Father's Place of Birth with separated fields */}
         <div className="client-baptismal-row">
             <div className="client-baptismal-field">
             <label>Father's Date of Birth</label>
             <input 
               type="date"
               className={`date-input ${validationErrors.fatherDateOfBirth ? 'client-error-input' : ''}`}
               onChange={(e) => handleDateChange('fatherDateOfBirth', e.target.value)}
             />
           </div>
           <div className="client-baptismal-field location-dropdown-container">
             <label>Father's Birth Province</label>
             <input 
               type="text"
               placeholder="Type to search"
               value={fatherBirthFields.province}
               onChange={handleFatherBirthProvinceChange}
               onFocus={() => handleFocus('fatherBirthProvince')}
               className={validationErrors.fatherPlaceOfBirth ? 'client-error-input' : ''}
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

           <div className="client-baptismal-field location-dropdown-container">
             <label>Father's Birth Municipality</label>
             <input 
               type="text"
               placeholder="Type to search"
               value={fatherBirthFields.municipality}
               onChange={handleFatherBirthMunicipalityChange}
               onFocus={() => handleFocus('fatherBirthMunicipality')}
               className={validationErrors.fatherPlaceOfBirth ? 'client-error-input' : ''}
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
            <div className="client-baptismal-field location-dropdown-container">
             <label>Father's Birth Barangay</label>
             <input 
               type="text"
               placeholder="Type to search"
               value={fatherBirthFields.barangay}
               onChange={handleFatherBirthBarangayChange}
               onFocus={() => handleFocus('fatherBirthBarangay')}
               className={validationErrors.fatherPlaceOfBirth ? 'client-error-input' : ''}
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
            <div className="client-baptismal-field">
             <label>Mother's Contact Number</label>
             <input 
               type="text"
               value={formData.motherContact}
               onChange={(e) => handleInputChange('motherContact', e.target.value)}
             />
           </div>
         </div>

         {/* Mother's Place of Birth with separated fields */}
         <div className="client-baptismal-row">
            <div className="client-baptismal-field">
             <label>Mother's Date of Birth</label>
             <input 
               type="date"
               className={`date-input ${validationErrors.motherDateOfBirth ? 'client-error-input' : ''}`}
               onChange={(e) => handleDateChange('motherDateOfBirth', e.target.value)}
             />
           </div>
            <div className="client-baptismal-field location-dropdown-container">
             <label>Mother's Birth Province</label>
             <input 
               type="text"
               placeholder="Type to search"
               value={motherBirthFields.province}
               onChange={handleMotherBirthProvinceChange}
               onFocus={() => handleFocus('motherBirthProvince')}
               className={validationErrors.motherPlaceOfBirth ? 'client-error-input' : ''}
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

           <div className="client-baptismal-field location-dropdown-container">
             <label>Mother's Birth Municipality</label>
             <input 
               type="text"
               placeholder="Type to search"
               value={motherBirthFields.municipality}
               onChange={handleMotherBirthMunicipalityChange}
               onFocus={() => handleFocus('motherBirthMunicipality')}
               className={validationErrors.motherPlaceOfBirth ? 'client-error-input' : ''}
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
           <div className="client-baptismal-field location-dropdown-container">
             <label>Mother's Birth Barangay</label>
             <input 
               type="text"
               placeholder="Type to search"
               value={motherBirthFields.barangay}
               onChange={handleMotherBirthBarangayChange}
               onFocus={() => handleFocus('motherBirthBarangay')}
               className={validationErrors.motherPlaceOfBirth ? 'client-error-input' : ''}
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
         <div className="client-baptismal-field">
             <label>Street</label>
             <input 
               type="text"
               value={formData.street}
               onChange={(e) => handleInputChange('street', e.target.value)}
             />
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
             {focusedField === 'addressRegion' && suggestions.addressRegion.length > 0 && (
               <div className="location-dropdown">
                 {suggestions.addressRegion.map((region, index) => (
                   <div 
                     key={index}
                     onClick={() => handleSelectAddressRegion(region)}
                     className="location-dropdown-item"
                   >
                     {region}
                   </div>
                 ))}
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

     {/* Requirements Section */}
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