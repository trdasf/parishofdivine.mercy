import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./clientprofile.css";

const ClientProfile = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const clientID = location.state?.clientID || JSON.parse(localStorage.getItem('user'))?.clientID;

  const [image, setImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const [profileData, setProfileData] = useState({
    first_name: '',
    middle_name: '',
    last_name: '',
    sex: '',
    age: '',
    date_of_birthday: '',
    contact_number: '',
    nationality: '',
    region: '',
    place_of_birth: '',
    email: '',
    facebook_account: '',
    barangay: '',
    street: '',
    municipality: '',
    province: ''
  });

  const [locationData, setLocationData] = useState({
    provinces: [],
    municipalities: [],
    barangays: []
  });

  const [showDropdowns, setShowDropdowns] = useState({
    province: false,
    municipality: false,
    barangay: false
  });

  useEffect(() => {
    if (!clientID) {
      navigate('/client-login');
      return;
    }

    fetchProfileData();
  }, [clientID, navigate]);

  const fetchProfileData = async () => {
    try {
      const response = await fetch(`http://parishofdivinemercy.com/backend/client_profile.php?clientID=${clientID}`);
      const data = await response.json();
      
      if (data.success && data.profile) {
        // Format date for display (dd/mm/yyyy)
        if (data.profile.date_of_birthday) {
          const date = new Date(data.profile.date_of_birthday);
          const formattedDate = date.toLocaleDateString('en-GB');
          data.profile.date_of_birthday = formattedDate;
        }
        
        setProfileData(data.profile);
        if (data.profile.profile_image) {
          setImage(data.profile.profile_image);
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchLocations = async (search = '', field = '', filterProvince = '', filterMunicipality = '') => {
    try {
      let url = `http://parishofdivinemercy.com/backend/get_location.php?search=${search}&field=${field}`;
      
      if (filterProvince) {
        url += `&province=${encodeURIComponent(filterProvince)}`;
      }
      if (filterMunicipality) {
        url += `&municipality=${encodeURIComponent(filterMunicipality)}`;
      }

      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        if (field === 'province') {
          const provinces = [...new Set(data.locations.map(loc => loc.province))];
          setLocationData(prev => ({ ...prev, provinces }));
        } else if (field === 'municipality') {
          const municipalities = [...new Set(data.locations.map(loc => loc.municipality))];
          setLocationData(prev => ({ ...prev, municipalities }));
        } else if (field === 'barangay') {
          const barangays = [...new Set(data.locations.map(loc => loc.barangay))];
          setLocationData(prev => ({ ...prev, barangays }));
        }
      }
    } catch (error) {
      console.error('Error fetching locations:', error);
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDateChange = (value) => {
    const date = new Date(value);
    const formattedDate = date.toLocaleDateString('en-GB');
    handleInputChange('date_of_birthday', formattedDate);
  };

  const handleProvinceSearch = (value) => {
    handleInputChange('province', value);
    if (value) {
      fetchLocations(value, 'province');
      setShowDropdowns(prev => ({ ...prev, province: true }));
    } else {
      setShowDropdowns(prev => ({ ...prev, province: false }));
    }
  };

  const handleMunicipalitySearch = (value) => {
    handleInputChange('municipality', value);
    if (value) {
      fetchLocations(value, 'municipality', profileData.province);
      setShowDropdowns(prev => ({ ...prev, municipality: true }));
    } else {
      setShowDropdowns(prev => ({ ...prev, municipality: false }));
    }
  };

  const handleBarangaySearch = (value) => {
    handleInputChange('barangay', value);
    if (value) {
      fetchLocations(value, 'barangay', profileData.province, profileData.municipality);
      setShowDropdowns(prev => ({ ...prev, barangay: true }));
    } else {
      setShowDropdowns(prev => ({ ...prev, barangay: false }));
    }
  };

  const selectLocation = (field, value) => {
    handleInputChange(field, value);
    setShowDropdowns(prev => ({ ...prev, [field]: false }));
    
    if (field === 'province') {
      handleInputChange('municipality', '');
      handleInputChange('barangay', '');
    } else if (field === 'municipality') {
      handleInputChange('barangay', '');
    }
  };

  const handleSubmit = async () => {
    try {
      // Convert date to yyyy-mm-dd format for database
      let dateForDB = profileData.date_of_birthday;
      if (dateForDB && dateForDB.includes('/')) {
        const [day, month, year] = dateForDB.split('/');
        dateForDB = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }

      const formData = new FormData();
      formData.append('clientID', clientID);
      
      // Add profile data
      Object.keys(profileData).forEach(key => {
        formData.append(key, key === 'date_of_birthday' ? dateForDB : (profileData[key] || ''));
      });
      
      // Add image if there's a new file or existing image
      if (imageFile) {
        formData.append('profile_image', imageFile);
      } else if (image && !image.startsWith('data:')) {
        // If there's an existing image URL but no new file
        formData.append('existing_image', image);
      }

      const response = await fetch('http://parishofdivinemercy.com/backend/client_profile.php', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      
      if (data.success) {
        setShowUpdateModal(false);
        setShowSuccessModal(true);
      } else {
        setShowErrorModal(true);
        setErrorMessage(data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setShowErrorModal(true);
      setErrorMessage('Error updating profile');
    }
  };

  const handleClear = () => {
    setProfileData({
      first_name: '',
      middle_name: '',
      last_name: '',
      sex: '',
      age: '',
      date_of_birthday: '',
      contact_number: '',
      nationality: '',
      region: '',
      place_of_birth: '',
      email: '',
      facebook_account: '',
      barangay: '',
      street: '',
      municipality: '',
      province: ''
    });
    setImage(null);
    setImageFile(null);
    document.getElementById('imageUpload').value = '';
    setShowClearModal(false);
  };

  return (
    <div className="client-profile-container">
      <div className="client-profile-header">
        <h1 className="title-cp">CLIENT PROFILE</h1>
      </div>

      <div className="client-profile-content">
        <div className="image-upload-container-cp">
          <label htmlFor="imageUpload" className="image-upload-label">
            {image ? (
              <img src={image} alt="Profile" className="profile-image-cp" />
            ) : (
              <div className="image-placeholder-cp">Click to Upload</div>
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

        <div className="client-profile-fields-cp">
          <div className="client-profile-row-cp">
            <div className="cp-fields">
              <label>First Name</label>
              <input 
                type="text" 
                value={profileData.first_name}
                onChange={(e) => handleInputChange('first_name', e.target.value)}
              />
            </div>
            <div className="cp-fields">
              <label>Middle Name</label>
              <input 
                type="text" 
                value={profileData.middle_name}
                onChange={(e) => handleInputChange('middle_name', e.target.value)}
              />
            </div>
            <div className="cp-fields">
              <label>Last Name</label>
              <input 
                type="text" 
                value={profileData.last_name}
                onChange={(e) => handleInputChange('last_name', e.target.value)}
              />
            </div>
            <div className="cp-fields">
              <label>Sex</label>
              <select 
                value={profileData.sex}
                onChange={(e) => handleInputChange('sex', e.target.value)}
              >
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            </div>
            <div className="client-profile-row-cp">
            <div className="cp-fields">
              <label>Age</label>
              <input 
                type="number" 
                value={profileData.age}
                onChange={(e) => handleInputChange('age', e.target.value)}
              />
            </div>
            <div className="cp-fields">
              <label>Date of Birth (dd/mm/yyyy)</label>
              <input 
                type="date" 
                value={profileData.date_of_birthday && profileData.date_of_birthday.includes('/') 
                  ? profileData.date_of_birthday.split('/').reverse().join('-')
                  : profileData.date_of_birthday}
                onChange={(e) => handleDateChange(e.target.value)}
              />
            </div>
            <div className="cp-fields">
              <label>Phone Number</label>
              <input 
                type="text" 
                value={profileData.contact_number}
                onChange={(e) => handleInputChange('contact_number', e.target.value)}
              />
            </div>
            <div className="cp-fields">
              <label>Nationality</label>
              <input 
                type="text" 
                value={profileData.nationality}
                onChange={(e) => handleInputChange('nationality', e.target.value)}
              />
            </div>
            </div>
            <div className="client-profile-row-cp">
            <div className="cp-fields">
              <label>Region</label>
              <input 
                type="text" 
                value={profileData.region}
                onChange={(e) => handleInputChange('region', e.target.value)}
              />
            </div>
             <div>
          <label>Email Address</label>
          <input 
            type="email" 
            value={profileData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
          />
        </div>
        <div>
          <label>Facebook Account</label>
          <input 
            type="text" 
            value={profileData.facebook_account}
            onChange={(e) => handleInputChange('facebook_account', e.target.value)}
          />
        </div>
          </div>
        </div>
      </div>

      <div className="client-profile-row-cp">
        <div>
          <label>Place of Birth</label>
          <input 
            type="text" 
            className="cp-pob" 
            value={profileData.place_of_birth}
            onChange={(e) => handleInputChange('place_of_birth', e.target.value)}
          />
        </div>
      </div>
      <label className="sub-cc">Home Address</label>
      <div className="client-profile-row-cp">
        <div className="location-dropdown-container">
          <label>Province</label>
          <input 
            type="text" 
            value={profileData.province}
            onChange={(e) => handleProvinceSearch(e.target.value)}
            onFocus={() => fetchLocations('', 'province')}
          />
          {showDropdowns.province && locationData.provinces.length > 0 && (
            <div className="location-dropdown">
              {locationData.provinces.map((province, index) => (
                <div 
                  key={index}
                  onClick={() => selectLocation('province', province)}
                  className="location-dropdown-item"
                >
                  {province}
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="location-dropdown-container">
          <label>Municipality</label>
          <input 
            type="text" 
            value={profileData.municipality}
            onChange={(e) => handleMunicipalitySearch(e.target.value)}
            onFocus={() => fetchLocations('', 'municipality', profileData.province)}
          />
          {showDropdowns.municipality && locationData.municipalities.length > 0 && (
            <div className="location-dropdown">
              {locationData.municipalities.map((municipality, index) => (
                <div 
                  key={index}
                  onClick={() => selectLocation('municipality', municipality)}
                  className="location-dropdown-item"
                >
                  {municipality}
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="location-dropdown-container">
          <label>Barangay</label>
          <input 
            type="text" 
            value={profileData.barangay}
            onChange={(e) => handleBarangaySearch(e.target.value)}
            onFocus={() => fetchLocations('', 'barangay', profileData.province, profileData.municipality)}
          />
          {showDropdowns.barangay && locationData.barangays.length > 0 && (
            <div className="location-dropdown">
              {locationData.barangays.map((barangay, index) => (
                <div 
                  key={index}
                  onClick={() => selectLocation('barangay', barangay)}
                  className="location-dropdown-item"
                >
                  {barangay}
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div>
          <label>Street</label>
          <input 
            type="text" 
            value={profileData.street}
            onChange={(e) => handleInputChange('street', e.target.value)}
          />
        </div>
      </div>
      
      <div className="button-container-cp">
        <button className="update-btn-cp" onClick={() => setShowUpdateModal(true)}>Update</button>
        <button className="clear-btn-cp" onClick={() => setShowClearModal(true)}>Clear</button>
      </div>

      {/* Update Modal */}
      {showUpdateModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="modal-title">Update Profile</h2>
            <p className="modal-text">Are you sure you want to update your profile?</p>
            <div className="modal-buttons">
              <button onClick={handleSubmit} className="modal-btn-yes">Yes</button>
              <button onClick={() => setShowUpdateModal(false)} className="modal-btn-no">No</button>
            </div>
          </div>
        </div>
      )}

      {/* Clear Modal */}
      {showClearModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="modal-title">Clear Profile</h2>
            <p className="modal-text">Are you sure you want to clear all profile fields?</p>
            <div className="modal-buttons">
              <button onClick={handleClear} className="modal-btn-yes">Yes</button>
              <button onClick={() => setShowClearModal(false)} className="modal-btn-no">No</button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="modal-title">Success</h2>
            <p className="modal-text">Profile updated successfully!</p>
            <div className="modal-buttons">
              <button onClick={() => setShowSuccessModal(false)} className="modal-btn-yes">OK</button>
            </div>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="modal-title">Error</h2>
            <p className="modal-text">{errorMessage}</p>
            <div className="modal-buttons">
              <button onClick={() => setShowErrorModal(false)} className="modal-btn-no">OK</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientProfile;