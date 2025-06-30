import React, { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faPlus, faTimes, faUpload, faCheckCircle, faExclamationCircle } from "@fortawesome/free-solid-svg-icons";
import axios from 'axios';
import "./secretaryusermanagement.css";

const API_URL = "http://parishofdivinemercy.com/backend";

const SecretaryUserManagement = () => {
  const [showModal, setShowModal] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showCredentials, setShowCredentials] = useState(true);
  const fileInputRef = useRef(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [positionFilter, setPositionFilter] = useState("");
  
  // States for handling messages in the modal
  const [formError, setFormError] = useState(null);
  const [formSuccess, setFormSuccess] = useState(null);
  const [formProcessing, setFormProcessing] = useState(false);

  // Location dropdown states
  const [locationData, setLocationData] = useState([]);
  const [locationLoading, setLocationLoading] = useState(true);
  const [focusedField, setFocusedField] = useState(null);
  const [suggestions, setSuggestions] = useState({
    barangay: [],
    municipality: [],
    province: []
  });
  const [formData, setFormData] = useState({
    barangay: '',
    municipality: '',
    province: ''
  });

  // Helper function to ensure base64 images have proper format
  const ensureBase64Format = (imageData) => {
    if (!imageData) return null;
    
    // If the image already has the data:image prefix, return as is
    if (imageData.startsWith('data:image')) {
      return imageData;
    }
    
    // Otherwise, add the prefix
    return `data:image/jpeg;base64,${imageData}`;
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
      setLocationLoading(false);
    }
  };

  // Location filter functions
  const filterBarangays = (input, municipality = null, province = null) => {
    if (municipality && municipality.trim() !== '') {
      const filtered = locationData.filter(location => location.municipality === municipality);
      const allBarangays = [...new Set(filtered.map(loc => loc.barangay))].sort();
      
      if (input && input.trim()) {
        const inputLower = input.toLowerCase();
        return allBarangays.filter(barangay => barangay.toLowerCase().includes(inputLower));
      }
      
      return allBarangays;
    }
    
    if (province && province.trim() !== '') {
      const filtered = locationData.filter(location => location.province === province);
      const allBarangays = [...new Set(filtered.map(loc => loc.barangay))].sort();
      
      if (input && input.trim()) {
        const inputLower = input.toLowerCase();
        return allBarangays.filter(barangay => barangay.toLowerCase().includes(inputLower));
      }
      
      return allBarangays;
    }
    
    const inputLower = input ? input.toLowerCase() : '';
    const uniqueBarangays = [...new Set(locationData.map(loc => loc.barangay))].sort();
    
    if (!input || input.trim() === '') {
      return uniqueBarangays.slice(0, 10);
    }
    
    return uniqueBarangays
      .filter(barangay => barangay.toLowerCase().includes(inputLower))
      .slice(0, 10);
  };

  const filterMunicipalities = (input, province = null, barangay = null) => {
    if (barangay && barangay.trim() !== '') {
      const filtered = locationData.filter(location => location.barangay === barangay);
      const allMunicipalities = [...new Set(filtered.map(loc => loc.municipality))].sort();
      
      if (input && input.trim()) {
        const inputLower = input.toLowerCase();
        return allMunicipalities.filter(municipality => municipality.toLowerCase().includes(inputLower));
      }
      
      return allMunicipalities;
    }
    
    if (province && province.trim() !== '') {
      const filtered = locationData.filter(location => location.province === province);
      const allMunicipalities = [...new Set(filtered.map(loc => loc.municipality))].sort();
      
      if (input && input.trim()) {
        const inputLower = input.toLowerCase();
        return allMunicipalities.filter(municipality => municipality.toLowerCase().includes(inputLower));
      }
      
      return allMunicipalities;
    }
    
    const inputLower = input ? input.toLowerCase() : '';
    const uniqueMunicipalities = [...new Set(locationData.map(loc => loc.municipality))].sort();
    
    if (!input || input.trim() === '') {
      return uniqueMunicipalities.slice(0, 10);
    }
    
    return uniqueMunicipalities
      .filter(municipality => municipality.toLowerCase().includes(inputLower))
      .slice(0, 10);
  };

  const filterProvinces = (input, municipality = null, barangay = null) => {
    if (municipality && municipality.trim() !== '') {
      const filtered = locationData.filter(location => location.municipality === municipality);
      const allProvinces = [...new Set(filtered.map(loc => loc.province))].sort();
      
      if (input && input.trim()) {
        const inputLower = input.toLowerCase();
        return allProvinces.filter(province => province.toLowerCase().includes(inputLower));
      }
      
      return allProvinces;
    }
    
    if (barangay && barangay.trim() !== '') {
      const filtered = locationData.filter(location => location.barangay === barangay);
      const allProvinces = [...new Set(filtered.map(loc => loc.province))].sort();
      
      if (input && input.trim()) {
        const inputLower = input.toLowerCase();
        return allProvinces.filter(province => province.toLowerCase().includes(inputLower));
      }
      
      return allProvinces;
    }
    
    const inputLower = input ? input.toLowerCase() : '';
    const uniqueProvinces = [...new Set(locationData.map(loc => loc.province))].sort();
    
    if (!input || input.trim() === '') {
      return uniqueProvinces.slice(0, 10);
    }
    
    return uniqueProvinces
      .filter(province => province.toLowerCase().includes(inputLower))
      .slice(0, 10);
  };

  // Auto-fill helper function
  const autoFillLocationFields = (selectedValue, selectedType) => {
    let updates = {};
    
    if (selectedType === 'barangay') {
      const matchingLocations = locationData.filter(loc => loc.barangay === selectedValue);
      const uniqueMunicipalities = [...new Set(matchingLocations.map(loc => loc.municipality))];
      const uniqueProvinces = [...new Set(matchingLocations.map(loc => loc.province))];
      
      if (uniqueMunicipalities.length === 1) {
        updates.municipality = uniqueMunicipalities[0];
      }
      
      if (uniqueProvinces.length === 1) {
        updates.province = uniqueProvinces[0];
      }
    } 
    else if (selectedType === 'municipality') {
      const matchingLocations = locationData.filter(loc => loc.municipality === selectedValue);
      const uniqueProvinces = [...new Set(matchingLocations.map(loc => loc.province))];
      
      if (uniqueProvinces.length === 1) {
        updates.province = uniqueProvinces[0];
      }
    }
    
    return updates;
  };

  // Location change handlers
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

  // Selection handlers
  const handleSelectBarangay = (barangay) => {
    setFormData(prev => ({ ...prev, barangay }));
    setFocusedField(null);
    
    const autoFills = autoFillLocationFields(barangay, 'barangay');
    if (Object.keys(autoFills).length > 0) {
      setFormData(prev => ({ ...prev, ...autoFills }));
    }
  };

  const handleSelectMunicipality = (municipality) => {
    setFormData(prev => ({ ...prev, municipality }));
    setFocusedField(null);
    
    const autoFills = autoFillLocationFields(municipality, 'municipality');
    if (Object.keys(autoFills).length > 0) {
      setFormData(prev => ({ ...prev, ...autoFills }));
    }
  };

  const handleSelectProvince = (province) => {
    setFormData(prev => ({ ...prev, province }));
    setFocusedField(null);
  };

  // Focus handler
  const handleFocus = (field) => {
    setFocusedField(field);
    
    switch(field) {
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

  // Fetch users from the API
  const fetchUsers = async () => {
    try {
      setLoading(true);
      let url = `${API_URL}/user_management.php`;
      
      if (positionFilter) {
        url += `?position=${encodeURIComponent(positionFilter)}`;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Process all user profile images to ensure they have the correct format
        const processedUsers = data.users.map(user => ({
          ...user,
          profile: user.profile ? ensureBase64Format(user.profile) : null
        }));
        setUsers(processedUsers);
      } else {
        throw new Error(data.message || "Failed to fetch users");
      }
    } catch (err) {
      setError(err.message);
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  // Load users when component mounts or when position filter changes
  useEffect(() => {
    fetchUsers();
  }, [positionFilter]);

  // Fetch locations when component mounts
  useEffect(() => {
    fetchLocations();
  }, []);

  // Handle clicks outside dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (focusedField) {
        const clickedInput = event.target.tagName === 'INPUT' || event.target.tagName === 'SELECT';
        const clickedLocationDropdownItem = event.target.classList.contains('location-dropdown-item');
        
        const currentFocusedContainer = document.querySelector(`input[name="${focusedField}"]`)?.closest('.location-dropdown-container');
        const clickedInsideCurrentContainer = currentFocusedContainer && currentFocusedContainer.contains(event.target);
        
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

  const toggleModal = (user = null) => {
    // Reset all form states when opening/closing modal
    setFormError(null);
    setFormSuccess(null);
    setFormProcessing(false);
    
    if (user) {
      setIsEditing(true);
      setCurrentUser(user);
      setShowCredentials(true);
      // Set form data for editing
      setFormData({
        barangay: user.barangay || '',
        municipality: user.municipality || '',
        province: user.province || ''
      });
      if (user.profile) {
        setPreviewImage(ensureBase64Format(user.profile));
      } else {
        setPreviewImage(null);
      }
    } else {
      setIsEditing(false);
      setCurrentUser(null);
      setPreviewImage(null);
      setShowCredentials(true);
      // Reset form data for new user
      setFormData({
        barangay: '',
        municipality: '',
        province: ''
      });
    }
    setShowModal(!showModal);
    setFocusedField(null); // Reset focused field
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setFormError("Image size should not exceed 5MB");
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handlePositionChange = (e) => {
    // Always show credentials regardless of position
    setShowCredentials(true);
  };

  const validateForm = (formData) => {
    // Validate password and confirm password match
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');
    
    if (!isEditing || (password && password.length > 0)) {
      if (password !== confirmPassword) {
        return "Passwords do not match.";
      }
      
      if (password.length < 6) {
        return "Password should be at least 6 characters long.";
      }
    }
    
    // Email validation
    const email = formData.get('email');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address.";
    }
    
    // Contact number validation
    const contactNumber = formData.get('contactNumber');
    const contactRegex = /^[0-9+\-\s()]+$/;
    if (!contactRegex.test(contactNumber)) {
      return "Please enter a valid contact number.";
    }
    
    return null; // No errors
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset previous messages
    setFormError(null);
    setFormSuccess(null);
    setFormProcessing(true);
    
    const formDataToSubmit = new FormData(e.target);
    
    // Add location data from state to form data
    formDataToSubmit.set('barangay', formData.barangay);
    formDataToSubmit.set('municipality', formData.municipality);
    formDataToSubmit.set('province', formData.province);
    
    // Validate form
    const validationError = validateForm(formDataToSubmit);
    if (validationError) {
      setFormError(validationError);
      setFormProcessing(false);
      return;
    }
    
    const userData = {
      firstName: formDataToSubmit.get('firstName'),
      middleName: formDataToSubmit.get('middleName') || "",
      lastName: formDataToSubmit.get('lastName'),
      profile: previewImage,
      gender: formDataToSubmit.get('gender'),
      dateOfBirth: formDataToSubmit.get('dateOfBirth'),
      contactNumber: formDataToSubmit.get('contactNumber'),
      nationality: formDataToSubmit.get('nationality'),
      religion: formDataToSubmit.get('religion'),
      email: formDataToSubmit.get('email'),
      street: formDataToSubmit.get('street'),
      barangay: formData.barangay,
      municipality: formData.municipality,
      province: formData.province,
      position: formDataToSubmit.get('position'),
      membershipStatus: formDataToSubmit.get('membershipStatus'),
      joinedDate: formDataToSubmit.get('joinedDate'),
      password: formDataToSubmit.get('password')
    };

    try {
      let response;
      
      if (isEditing) {
        // Update existing user
        userData.userID = currentUser.userID;
        
        // Don't send password if it's empty (no change)
        if (!userData.password) {
          delete userData.password;
        }
        
        response = await fetch(`${API_URL}/user_management.php`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userData)
        });
      } else {
        // Add new user
        response = await fetch(`${API_URL}/user_management.php`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userData)
        });
      }

      const data = await response.json();
      
      if (data.success) {
        // Refresh the user list
        fetchUsers();
        
        // Show success message
        setFormSuccess(isEditing ? "User updated successfully!" : "User added successfully!");
        
        // After 2 seconds, close the modal
        setTimeout(() => {
          toggleModal();
        }, 2000);
      } else {
        // Handle specific errors
        if (data.error === "email_exists") {
          setFormError("An account with this email already exists.");
        } else if (data.error === "invalid_email") {
          setFormError("Invalid email format.");
        } else if (data.error === "invalid_contact") {
          setFormError("Invalid contact number format.");
        } else if (data.error === "invalid_password") {
          setFormError("Password must be at least 6 characters long.");
        } else if (data.error === "invalid_image") {
          setFormError("Invalid image file. Please try another image.");
        } else {
          setFormError(data.message || "Operation failed. Please try again.");
        }
      }
    } catch (err) {
      console.error("Error:", err);
      setFormError("An error occurred. Please try again.");
    } finally {
      setFormProcessing(false);
    }
  };

  const handleDeleteUser = async (userID) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        const response = await fetch(`${API_URL}/user_management.php?userID=${userID}`, {
          method: 'DELETE',
        });

        const data = await response.json();
        
        if (data.success) {
          fetchUsers();
          alert("User deleted successfully");
        } else {
          alert(data.message || "Delete operation failed");
        }
      } catch (err) {
        console.error("Error:", err);
        alert("An error occurred. Please try again.");
      }
    }
  };

  const handlePositionFilterChange = (e) => {
    setPositionFilter(e.target.value);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Filter users based on search term with flexible matching
  const filteredUsers = users.filter(user => {
    if (!searchTerm.trim()) {
      return true;
    }

    const searchValue = searchTerm.toLowerCase().trim(); // Remove leading/trailing spaces for comparison
    const originalSearchValue = searchTerm.toLowerCase(); // Keep original for trailing space detection
    
    // Normalize both data and search by trimming and replacing multiple spaces
    const firstName = user.firstName?.toLowerCase().trim() || '';
    const middleName = user.middleName?.toLowerCase().trim() || '';
    const lastName = user.lastName?.toLowerCase().trim() || '';
    
    // Create different name combinations
    const fullNameWithMiddle = `${firstName} ${middleName} ${lastName}`.replace(/\s+/g, ' ').trim();
    const fullNameWithoutMiddle = `${firstName} ${lastName}`.replace(/\s+/g, ' ').trim();
    const displayedName = `${user.firstName} ${user.lastName}`.toLowerCase().trim(); // Exact format shown in table
    
    const contactNumber = user.contactNumber?.toLowerCase().trim() || '';
    const position = user.position?.toLowerCase().trim() || '';
    
    // Format joined date to YYYY-MM-DD
    const formattedJoinedDate = user.joinedDate ? new Date(user.joinedDate).toISOString().split('T')[0] : '';
    
    // Normalize search value by replacing multiple spaces with single space
    const normalizedSearchValue = searchValue.replace(/\s+/g, ' ');
    
    // If search ends with space, only match if the trimmed search is a prefix
    const endsWithSpace = originalSearchValue !== searchValue;
    
    if (endsWithSpace && searchValue) {
      // For searches ending with space, check if any field starts with the search term
      return (
        firstName.startsWith(normalizedSearchValue) ||
        middleName.startsWith(normalizedSearchValue) ||
        lastName.startsWith(normalizedSearchValue) ||
        fullNameWithMiddle.startsWith(normalizedSearchValue) ||
        fullNameWithoutMiddle.startsWith(normalizedSearchValue) ||
        displayedName.startsWith(normalizedSearchValue) ||
        contactNumber.startsWith(normalizedSearchValue) ||
        position.startsWith(normalizedSearchValue) ||
        formattedJoinedDate.startsWith(normalizedSearchValue)
      );
    } else {
      // Regular search - check if any field contains the search term
      return (
        firstName.includes(normalizedSearchValue) ||
        middleName.includes(normalizedSearchValue) ||
        lastName.includes(normalizedSearchValue) ||
        fullNameWithMiddle.includes(normalizedSearchValue) ||
        fullNameWithoutMiddle.includes(normalizedSearchValue) ||
        displayedName.includes(normalizedSearchValue) ||
        contactNumber.includes(normalizedSearchValue) ||
        position.includes(normalizedSearchValue) ||
        formattedJoinedDate.includes(normalizedSearchValue)
      );
    }
  });

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toISOString().split('T')[0]; // Return YYYY-MM-DD format
    } catch (error) {
      return dateString;
    }
  };

  return (
    <div className="user-container-sum">
      <h1 className="title-sum">USER MANAGEMENT</h1>
      <div className="user-actions-sum">
        <div className="search-bar-sum">
          <input 
            type="text" 
            placeholder="Search by name, contact number, organizer, or joined date" 
            value={searchTerm}
            onChange={handleSearch}
          />
          <FontAwesomeIcon icon={faSearch} className="search-icon-sum" />
        </div>

        <div className="filter-add-container-sum">
          <select 
            className="filter-select-sum"
            value={positionFilter}
            onChange={handlePositionFilterChange}
          >
            <option value="">All Positions</option>
            <option value="Youth Ministry">Youth Ministry</option>
            <option value="Music Ministry">Music Ministry</option>
            <option value="Outreach Ministry">Outreach Ministry</option>
          </select>

          <button className="add-btn-sum" onClick={() => toggleModal()}>
            <FontAwesomeIcon icon={faPlus} /> ADD
          </button>
        </div>
      </div>

      {loading ? (
        <p>Loading users...</p>
      ) : error ? (
        <p>Error: {error}</p>
      ) : (
        <table className="user-table-sum">
          <thead>
            <tr>
              <th>No.</th>
              <th>Profile</th>
              <th>Name</th>
              <th>Contact Number</th>
              <th>Organizer</th>
              <th>Joined Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user, index) => (
              <tr key={user.userID}>
                <td>{index + 1}</td>
                <td>
                  <div className="profile-placeholder-sum">
                    {user.profile ? (
                      <img 
                        src={ensureBase64Format(user.profile)} 
                        alt="Profile" 
                      />
                    ) : (
                      <span>{user.firstName.charAt(0)}</span>
                    )}
                  </div>
                </td>
                <td>{`${user.firstName} ${user.lastName}`}</td>
                <td>{user.contactNumber}</td>
                <td>{user.position}</td>
                <td>{formatDate(user.joinedDate)}</td>
                <td>
                  <button className="sum-details" onClick={() => toggleModal(user)}>Edit</button>
                </td>
              </tr>
            ))}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan="7" style={{ textAlign: "center" }}>No users found</td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {/* User Registration/Edit Modal */}
      {showModal && (
        <div className="user-modal-overlay-sum">
          <div className="user-modal-sum">
            <div className="user-modal-header-sum">
              <h2>{isEditing ? 'Edit User' : 'Add New User'}</h2>
            </div>
            <div>
              <hr className="custom-hr-sum"/>
            </div>
            
            {/* Form messages */}
            {formError && (
              <div className="form-message-sum error-message-sum">
                <FontAwesomeIcon icon={faExclamationCircle} />
                <p>{formError}</p>
              </div>
            )}
            
            {formSuccess && (
              <div className="form-message-sum success-message-sum">
                <FontAwesomeIcon icon={faCheckCircle} />
                <p>{formSuccess}</p>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="user-form-sum">
              <div className="profile-upload-sum">
                <div 
                  className="profile-image-container-sum" 
                  onClick={triggerFileInput}
                >
                  {previewImage ? (
                    <img src={previewImage} alt="Profile Preview" className="profile-preview-sum" />
                  ) : (
                    <div className="upload-placeholder-sum">
                      <FontAwesomeIcon icon={faUpload} />
                      <span>Upload Photo</span>
                    </div>
                  )}
                </div>
                <input 
                  type="file" 
                  accept="image/*" 
                  ref={fileInputRef} 
                  onChange={handleImageUpload} 
                  style={{ display: 'none' }} 
                />
              </div>

              <div className="form-row-sum">
                <div className="form-group-sum">
                  <label>First Name</label>
                  <input 
                    type="text" 
                    name="firstName" 
                    required 
                    defaultValue={currentUser?.firstName || ''}
                  />
                </div>
                <div className="form-group-sum">
                  <label>Middle Name</label>
                  <input 
                    type="text" 
                    name="middleName" 
                    defaultValue={currentUser?.middleName || ''}
                  />
                </div>
                <div className="form-group-sum">
                  <label>Last Name</label>
                  <input 
                    type="text" 
                    name="lastName" 
                    required 
                    defaultValue={currentUser?.lastName || ''}
                  />
                </div>
              </div>

              <div className="form-row-sum">
                <div className="form-group-sum">
                  <label>Gender</label>
                  <select 
                    name="gender" 
                    required 
                    defaultValue={currentUser?.gender || ''}
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="form-group-sum">
                  <label>Date of Birth</label>
                  <input 
                    type="date" 
                    name="dateOfBirth" 
                    required 
                    defaultValue={currentUser?.dateOfBirth || ''}
                  />
                </div>
                <div className="form-group-sum">
                  <label>Contact Number</label>
                  <input 
                    type="tel" 
                    name="contactNumber" 
                    required 
                    defaultValue={currentUser?.contactNumber || ''}
                  />
                </div>
              </div>

              <div className="form-row-sum">
                <div className="form-group-sum">
                  <label>Nationality</label>
                  <input 
                    type="text" 
                    name="nationality" 
                    required 
                    defaultValue={currentUser?.nationality || ''}
                  />
                </div>
                <div className="form-group-sum">
                  <label>Religion</label>
                  <input 
                    type="text" 
                    name="religion" 
                    required 
                    defaultValue={currentUser?.religion || ''}
                  />
                </div>
                <div className="form-group-sum">
                  <label>Email Address</label>
                  <input 
                    type="email" 
                    name="email" 
                    required 
                    defaultValue={currentUser?.email || ''}
                  />
                </div>
              </div>

              <div className="form-row-sum">
                  <div className="form-group-sum">
                  <label>Organizer</label>
                  <select 
                    name="position" 
                    required 
                    defaultValue={currentUser?.position || ''}
                    onChange={handlePositionChange}
                  >
                    <option value="">Select Position</option>
                    <option value="Youth Ministry">Youth Ministry</option>
                    <option value="Music Ministry">Music Ministry</option>
                    <option value="Outreach Ministry">Outreach Ministry</option>
                  </select>
                </div>
                <div className="form-group-sum">
                  <label>Membership Status</label>
                  <select 
                    name="membershipStatus" 
                    required 
                    defaultValue={currentUser?.membershipStatus || ''}
                  >
                    <option value="">Select Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
                    <div className="form-group-sum">
                  <label>Street</label>
                  <input 
                    type="text" 
                    name="street" 
                    required 
                    defaultValue={currentUser?.street || ''}
                  />
                </div>
                </div>
              <div className="form-row-sum">
                <div className="form-group-sum-loc location-dropdown-container">
                  <label>Barangay</label>
                  <input 
                    type="text" 
                    name="barangay" 
                    required 
                    value={formData.barangay}
                    onChange={handleBarangayChange}
                    onFocus={() => handleFocus('barangay')}
                    placeholder="Type to search"
                    autoComplete="off"
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
                <div className="form-group-sum-loc location-dropdown-container">
                  <label>Municipality</label>
                  <input 
                    type="text" 
                    name="municipality" 
                    required 
                    value={formData.municipality}
                    onChange={handleMunicipalityChange}
                    onFocus={() => handleFocus('municipality')}
                    placeholder="Type to search"
                    autoComplete="off"
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

                <div className="form-group-sum-loc location-dropdown-container">
                  <label>Province</label>
                  <input 
                    type="text" 
                    name="province" 
                    required 
                    value={formData.province}
                    onChange={handleProvinceChange}
                    onFocus={() => handleFocus('province')}
                    placeholder="Type to search"
                    autoComplete="off"
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
        



              </div>

              {/* Always show credentials section regardless of position */}
              <div className="form-row-sum">
                 <div className="form-group-sum">
                  <label>Joined Date</label>
                  <input 
                    type="date" 
                    name="joinedDate" 
                    required 
                    defaultValue={currentUser?.joinedDate || ''}
                  />
                </div>
                <div className="form-group-sum">
                  <label>Password</label>
                  <input 
                    type="password" 
                    name="password" 
                    required={!isEditing} // Required for new users, optional for editing
                    defaultValue={''} // Never show existing password
                    placeholder={isEditing ? "Leave blank to keep current" : ""}
                  />
                </div>
                <div className="form-group-sum">
                  <label>Confirm Password</label>
                  <input 
                    type="password" 
                    name="confirmPassword" 
                    required={!isEditing} // Required for new users, optional for editing
                    defaultValue={''}
                    placeholder={isEditing ? "Leave blank to keep current" : ""}
                  />
                </div>
              </div>

              <div className="form-actions-sum">
                <button 
                  type="submit" 
                  className="submit-btn-sum"
                  disabled={formProcessing}
                >
                  {formProcessing ? 'Processing...' : (isEditing ? 'Update' : 'Save')}
                </button>
                <button 
                  type="button" 
                  className="cancel-btn-sum" 
                  onClick={() => toggleModal()}
                  disabled={formProcessing}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SecretaryUserManagement;