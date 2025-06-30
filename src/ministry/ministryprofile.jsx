import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from 'axios';
import "./ministryprofile.css";

const MinistryProfile = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [userData, setUserData] = useState(null);
  const [userID, setUserID] = useState(null);
  const [image, setImage] = useState(null);
  const [profile, setProfile] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    gender: "",
    dateOfBirth: "",
    contactNumber: "",
    nationality: "",
    religion: "",
    email: "",
    street: "",
    barangay: "",
    municipality: "",
    province: "",
    position: "",
    membershipStatus: "",
    joinedDate: ""
  });

  // Password change states
  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: ""
  });
  const [passwordError, setPasswordError] = useState("");

  // Location dropdown states
  const [locationData, setLocationData] = useState([]);
  const [focusedField, setFocusedField] = useState(null);
  const [suggestions, setSuggestions] = useState({
    barangay: [],
    municipality: [],
    province: []
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

  // Get userID from location state or localStorage on mount
  useEffect(() => {
    // First try to get from location state
    if (location.state && location.state.userData) {
      setUserData(location.state.userData);
      setUserID(location.state.userID);
      console.log("Profile: User data from location state", location.state.userData);
      console.log("Profile: UserID from location state", location.state.userID);
      fetchUserProfile(location.state.userID);
    }
    // If not in location state, try localStorage
    else {
      const storedUser = localStorage.getItem("ministry_user");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUserData(parsedUser);
        setUserID(parsedUser.userID);
        console.log("Profile: User data from localStorage", parsedUser);
        console.log("Profile: UserID from localStorage", parsedUser.userID);
        fetchUserProfile(parsedUser.userID);
      } else {
        // No user data found, redirect to login
        console.log("Profile: No user data found, redirecting to login");
        navigate("/");
      }
    }
    
    // Fetch location data
    fetchLocations();
  }, [location, navigate]);

  // Fetch location data for dropdowns
  const fetchLocations = async () => {
    try {
      const response = await axios.get('https://parishofdivinemercy.com/backend/get_location.php');
      if (response.data.success) {
        setLocationData(response.data.locations);
      }
    } catch (error) {
      console.error('Error fetching locations:', error);
    }
  };

  // Fetch user profile data
  const fetchUserProfile = async (id) => {
    try {
      setLoading(true);
      const response = await fetch(`https://parishofdivinemercy.com/backend/user_management.php?userID=${id}`);
      const data = await response.json();
      
      if (data.success && data.users && data.users.length > 0) {
        const userData = data.users[0];
        console.log("Fetched user data:", userData);
        
        // Set image if available - ensure it has the correct format
        if (userData.profile) {
          setImage(ensureBase64Format(userData.profile));
        }
        
        // Update form fields with user data
        setProfile({
          firstName: userData.firstName || "",
          middleName: userData.middleName || "",
          lastName: userData.lastName || "",
          gender: userData.gender || "",
          dateOfBirth: userData.dateOfBirth ? userData.dateOfBirth.split(' ')[0] : "", // Get only the date part
          contactNumber: userData.contactNumber || "",
          nationality: userData.nationality || "",
          religion: userData.religion || "",
          email: userData.email || "",
          street: userData.street || "",
          barangay: userData.barangay || "",
          municipality: userData.municipality || "",
          province: userData.province || "",
          position: userData.position || "",
          membershipStatus: userData.membershipStatus || "",
          joinedDate: userData.joinedDate ? userData.joinedDate.split(' ')[0] : "" // Get only the date part
        });
      } else {
        setMessage({ text: "Failed to fetch user profile", type: "error" });
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setMessage({ text: "An error occurred while fetching the profile", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Location filtering functions
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

  // Location field handlers
  const handleBarangayChange = (e) => {
    const value = e.target.value;
    handleInputChange('barangay', value);
    
    if (focusedField === 'barangay') {
      // Filter barangays based on municipality and province if they exist
      setSuggestions({
        ...suggestions,
        barangay: filterBarangays(value, profile.municipality, profile.province)
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
        municipality: filterMunicipalities(value, profile.province)
      });
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

  // Handle suggestions selection
  const handleSelectBarangay = (barangay) => {
    handleInputChange('barangay', barangay);
    setFocusedField(null);
    
    // Check if this barangay has a specific municipality and province
    const matchedLocation = locationData.find(loc => loc.barangay === barangay);
    if (matchedLocation) {
      if (!profile.municipality) {
        handleInputChange('municipality', matchedLocation.municipality);
      }
      if (!profile.province) {
        handleInputChange('province', matchedLocation.province);
      }
    }
  };

  const handleSelectMunicipality = (municipality) => {
    handleInputChange('municipality', municipality);
    setFocusedField(null);
    
    // Find the province for this municipality
    const matchedLocation = locationData.find(loc => loc.municipality === municipality);
    if (matchedLocation && !profile.province) {
      handleInputChange('province', matchedLocation.province);
    }
  };

  const handleSelectProvince = (province) => {
    handleInputChange('province', province);
    setFocusedField(null);
  };

  // Focus handler for location fields
  const handleFocus = (field) => {
    setFocusedField(field);
    
    if (field === 'barangay') {
      setSuggestions({
        ...suggestions,
        barangay: filterBarangays(profile.barangay, profile.municipality, profile.province)
      });
    } else if (field === 'municipality') {
      setSuggestions({
        ...suggestions,
        municipality: filterMunicipalities(profile.municipality, profile.province)
      });
    } else if (field === 'province') {
      setSuggestions({
        ...suggestions,
        province: filterProvinces(profile.province)
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

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ text: "Image size should not exceed 5MB", type: "error" });
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (name, value) => {
    setProfile({
      ...profile,
      [name]: value
    });
  };

  // Password change handlers
  const handlePasswordChange = (name, value) => {
    setPasswordData({
      ...passwordData,
      [name]: value
    });
    
    // Clear password error when user starts typing
    if (passwordError) {
      setPasswordError("");
    }
  };

  // Validate password fields
  const validatePassword = () => {
    // If both fields are empty, it's valid (no password change)
    if (!passwordData.newPassword && !passwordData.confirmPassword) {
      return true;
    }
    
    // If only one field is filled, it's invalid
    if (!passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordError("Both password fields must be filled if you want to change your password");
      return false;
    }
    
    // Check password length
    if (passwordData.newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters long");
      return false;
    }
    
    // Check if passwords match
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("Passwords do not match");
      return false;
    }
    
    return true;
  };

  const handleClear = () => {
    // Only clear editable fields
    setProfile({
      ...profile,
      firstName: "",
      middleName: "",
      lastName: "",
      gender: "",
      dateOfBirth: "",
      contactNumber: "",
      nationality: "",
      religion: "",
      email: "",
      street: "",
      barangay: "",
      municipality: "",
      province: "",
    });
    setImage(null);
    // Clear password fields
    setPasswordData({
      newPassword: "",
      confirmPassword: ""
    });
    setPasswordError("");
  };

  const handleUpdate = async () => {
    if (!userID) {
      setMessage({ text: "User ID is missing, please login again", type: "error" });
      return;
    }

    // Validate password if provided
    if (!validatePassword()) {
      return;
    }

    try {
      setUpdating(true);
      setMessage({ text: "", type: "" });

      // Prepare data for update
      const updateData = {
        ...profile,
        userID: userID,
        profile: image
      };

      // Add password if provided
      if (passwordData.newPassword && passwordData.confirmPassword) {
        updateData.password = passwordData.newPassword;
      }

      const response = await fetch("https://parishofdivinemercy.com/backend/user_management.php", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData)
      });

      const data = await response.json();
      
      if (data.success) {
        setMessage({ text: "Profile updated successfully", type: "success" });
        
        // Clear password fields after successful update
        setPasswordData({
          newPassword: "",
          confirmPassword: ""
        });
        setPasswordError("");
        
        // Update local storage data
        const storedUser = JSON.parse(localStorage.getItem("ministry_user"));
        if (storedUser) {
          const updatedUser = {
            ...storedUser,
            firstName: profile.firstName,
            lastName: profile.lastName,
            email: profile.email
          };
          localStorage.setItem("ministry_user", JSON.stringify(updatedUser));
        }
      } else {
        setMessage({ text: data.message || "Failed to update profile", type: "error" });
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage({ text: "An error occurred while updating the profile", type: "error" });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <div className="loading-indicator">Loading profile data...</div>;
  }

  return (
    <div className="community-profile-container">
      <div className="community-profile-header">
        <h1 className="title-mp">MINISTRY PROFILE</h1>
      </div>

      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="community-profile-content">
        {/* Profile Image Upload */}
        <div className="image-upload-container-cp">
          <label htmlFor="imageUpload" className="image-upload-label">
            {image ? (
              <img src={image} alt="Profile" className="profile-image-cp" />
            ) : (
              <div className="image-placeholder-cp">
                {profile.firstName ? profile.firstName.charAt(0).toUpperCase() : "Click to Upload"}
              </div>
            )}
          </label>
          <input
            type="file"
            id="imageUpload"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden-file-input"
          />
        </div>

        {/* Form Fields */}
        <div className="community-profile-fields-cp">
          <div className="community-profile-row-cp">
            <div>
              <label>First Name</label>
              <input 
                type="text" 
                name="firstName" 
                value={profile.firstName} 
                onChange={(e) => handleInputChange('firstName', e.target.value)} 
              />
            </div>
            <div>
              <label>Middle Name</label>
              <input 
                type="text" 
                name="middleName" 
                value={profile.middleName} 
                onChange={(e) => handleInputChange('middleName', e.target.value)} 
              />
            </div>
            <div>
              <label>Last Name</label>
              <input 
                type="text" 
                name="lastName" 
                value={profile.lastName} 
                onChange={(e) => handleInputChange('lastName', e.target.value)} 
              />
            </div>
          </div>
          
          <div className="community-profile-row-cp">
            <div>
              <label>Gender</label>
              <select 
                name="gender" 
                value={profile.gender} 
                onChange={(e) => handleInputChange('gender', e.target.value)}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div> 
              <label>Date of Birth</label>
              <input 
                type="date" 
                name="dateOfBirth" 
                value={profile.dateOfBirth} 
                onChange={(e) => handleInputChange('dateOfBirth', e.target.value)} 
              />
            </div>
            <div>
              <label>Contact Number</label>
              <input 
                type="text" 
                name="contactNumber" 
                value={profile.contactNumber} 
                onChange={(e) => handleInputChange('contactNumber', e.target.value)} 
              />
            </div>
          </div>

          <div className="community-profile-row-cp">
            <div>
              <label>Email Address</label>
              <input 
                type="email" 
                name="email" 
                value={profile.email} 
                onChange={(e) => handleInputChange('email', e.target.value)} 
              />
            </div>
            <div>
              <label>Nationality</label>
              <input 
                type="text" 
                name="nationality" 
                value={profile.nationality} 
                onChange={(e) => handleInputChange('nationality', e.target.value)} 
              />
            </div>
          </div>
        </div>
      </div>

      <div className="community-profile-row-cp">
        <div>
          <label>Street</label>
          <input 
            type="text" 
            name="street" 
            value={profile.street} 
            onChange={(e) => handleInputChange('street', e.target.value)} 
          />
        </div>
        <div className="location-dropdown-container">
          <label>Barangay</label>
          <input 
            type="text" 
            name="barangay" 
            value={profile.barangay} 
            onChange={handleBarangayChange}
            onFocus={() => handleFocus('barangay')}
            placeholder="Type to search"
          />
          {focusedField === 'barangay' && suggestions.barangay.length > 0 && (
            <div className="location-dropdown">
              {suggestions.barangay.map((barangay, index) => (
                <div 
                  key={index} 
                  className="location-dropdown-item"
                  onClick={() => handleSelectBarangay(barangay)}
                >
                  {barangay}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="location-dropdown-container">
          <label>Municipality</label>
          <input 
            type="text" 
            name="municipality" 
            value={profile.municipality} 
            onChange={handleMunicipalityChange}
            onFocus={() => handleFocus('municipality')}
            placeholder="Type to search"
          />
          {focusedField === 'municipality' && suggestions.municipality.length > 0 && (
            <div className="location-dropdown">
              {suggestions.municipality.map((municipality, index) => (
                <div 
                  key={index} 
                  className="location-dropdown-item"
                  onClick={() => handleSelectMunicipality(municipality)}
                >
                  {municipality}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="location-dropdown-container">
          <label>Province</label>
          <input 
            type="text" 
            name="province" 
            value={profile.province} 
            onChange={handleProvinceChange}
            onFocus={() => handleFocus('province')}
            placeholder="Type to search"
          />
          {focusedField === 'province' && suggestions.province.length > 0 && (
            <div className="location-dropdown">
              {suggestions.province.map((province, index) => (
                <div 
                  key={index} 
                  className="location-dropdown-item"
                  onClick={() => handleSelectProvince(province)}
                >
                  {province}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Password Change Section */}
      <div className="community-profile-row-cp">
        <div>
          <label>New Password</label>
          <input 
            type="password" 
            name="newPassword" 
            value={passwordData.newPassword} 
            onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
            placeholder="Leave blank to keep current password"
          />
        </div>
        <div>
          <label>Confirm New Password</label>
          <input 
            type="password" 
            name="confirmPassword" 
            value={passwordData.confirmPassword} 
            onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
            placeholder="Confirm your new password"
          />
        </div>
      </div>

      {/* Password Error Message */}
      {passwordError && (
        <div className="password-error-message">
          {passwordError}
        </div>
      )}

      {/* Non-editable fields */}
      <div className="community-profile-row-cp">
        <div>
          <label>Religion</label>
          <input 
            type="text" 
            name="religion" 
            value={profile.religion} 
            onChange={(e) => handleInputChange('religion', e.target.value)} 
          />
        </div>
        <div>
          <label>Position</label>
          <input 
            type="text" 
            value={profile.position} 
            readOnly 
            className="readonly-field" 
          />
        </div>
        <div>
          <label>Membership Status</label>
          <input 
            type="text" 
            value={profile.membershipStatus} 
            readOnly 
            className="readonly-field" 
          />
        </div>
        <div>
          <label>Joined Date</label>
          <input 
            type="text" 
            value={profile.joinedDate} 
            readOnly 
            className="readonly-field" 
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="button-container-cp">
        <button 
          className="update-btn-cp" 
          onClick={handleUpdate}
          disabled={updating}
        >
          {updating ? "Updating..." : "Update"}
        </button>
        <button className="clear-btn-cp-1" onClick={handleClear}>Clear</button>
      </div>
    </div>
  );
};

export default MinistryProfile;