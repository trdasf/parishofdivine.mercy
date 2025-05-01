import React, { useState } from "react";
import "./communityprofile.css";

const CommunityProfile = () => {
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
    emailAddress: "",
    street: "",
    municipality: "",
    province: "",
    // These fields cannot be changed
    position: "Member", // Default value
    membershipStatus: "Active", // Default value
    joinedDate: "2024-01-01", // Default value
  });

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile({
      ...profile,
      [name]: value
    });
  };

  const handleClear = () => {
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
      emailAddress: "",
      street: "",
      municipality: "",
      province: "",
      // Unchangeable fields remain the same
    });
    setImage(null);
  };

  return (
    <div className="community-profile-container">
      <div className="community-profile-header">
        <h1 className="title-cp">COMMUNITY PROFILE</h1>
      </div>

      <div className="community-profile-content">
        {/* Profile Image Upload */}
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

        {/* Form Fields */}
        <div className="community-profile-fields-cp">
          <div className="community-profile-row-cp">
            <div className="cp-fields">
              <label>First Name</label>
              <input 
                type="text" 
                name="firstName" 
                value={profile.firstName} 
                onChange={handleInputChange} 
              />
            </div>
            <div className="cp-fields">
              <label>Middle Name</label>
              <input 
                type="text" 
                name="middleName" 
                value={profile.middleName} 
                onChange={handleInputChange} 
              />
            </div>
            <div className="cp-fields">
              <label>Last Name</label>
              <input 
                type="text" 
                name="lastName" 
                value={profile.lastName} 
                onChange={handleInputChange} 
              />
            </div>
            <div className="cp-fields-sa">
              <label>Gender</label>
              <select 
                name="gender" 
                value={profile.gender} 
                onChange={handleInputChange}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="community-profile-row-cp">
            <div className="cp-fields"> 
              <label>Date of Birth</label>
              <input 
                type="date" 
                name="dateOfBirth" 
                value={profile.dateOfBirth} 
                onChange={handleInputChange} 
              />
            </div>
            <div className="cp-fields">
              <label>Contact Number</label>
              <input 
                type="text" 
                name="contactNumber" 
                value={profile.contactNumber} 
                onChange={handleInputChange} 
              />
            </div>
            <div className="cp-fields">
              <label>Nationality</label>
              <input 
                type="text" 
                name="nationality" 
                value={profile.nationality} 
                onChange={handleInputChange} 
              />
            </div>
            <div className="cp-fields">
              <label>Religion</label>
              <input 
                type="text" 
                name="religion" 
                value={profile.religion} 
                onChange={handleInputChange} 
              />
            </div>
          </div>
        </div>
      </div>

      <div className="community-profile-row-cp">
        <div>
          <label>Email Address</label>
          <input 
            type="email" 
            name="emailAddress" 
            value={profile.emailAddress} 
            onChange={handleInputChange} 
          />
        </div>
        <div>
          <label>Street</label>
          <input 
            type="text" 
            name="street" 
            value={profile.street} 
            onChange={handleInputChange} 
          />
        </div>
        <div>
          <label>Municipality</label>
          <input 
            type="text" 
            name="municipality" 
            value={profile.municipality} 
            onChange={handleInputChange} 
          />
        </div>
        <div>
          <label>Province</label>
          <input 
            type="text" 
            name="province" 
            value={profile.province} 
            onChange={handleInputChange} 
          />
        </div>
      </div>

      {/* Non-editable fields */}
      <div className="community-profile-row-cp">
        <div>
          <label>Organizer</label>
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
        <button className="update-btn-cp">Update</button>
        <button className="clear-btn-cp-1" onClick={handleClear}>Clear</button>
      </div>
    </div>
  );
};

export default CommunityProfile;