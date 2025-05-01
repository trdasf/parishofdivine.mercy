import React, { useState } from "react";
import "./clientprofile.css";

const ClientProfile = () => {
  const [image, setImage] = useState(null);

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
              <input type="text" />
            </div>
            <div className="cp-fields">
              <label>Middle Name</label>
              <input type="text" />
            </div>
            <div className="cp-fields">
              <label>Last Name</label>
              <input type="text" />
            </div>
            <div className="cp-fields-sa">
              <label>Sex</label>
              <input type="text" />
            </div>
            <div className="cp-fields-sa">
              <label>Age</label>
              <input type="number" />
            </div>
          </div>

          <div className="client-profile-row-cp">
            <div className="cp-fields">
              <label>Date of Birth</label>
              <input type="text" />
            </div>
            <div className="cp-fields">
              <label>Phone Number</label>
              <input type="text" />
            </div>
            <div className="cp-fields">
              <label>Nationality</label>
              <input type="text" />
            </div>
            <div className="cp-fields">
              <label>Region</label>
              <input type="text" />
            </div>
          </div>
        </div>
      </div>

      <div className="client-profile-row-cp">
  <div>
    <label>Place of Birth</label>
    <input type="text" className="cp-pob" />
  </div>
  <div>
    <label>Email Address</label>
    <input type="email" />
  </div>
  <div>
    <label>Facebook Account</label>
    <input type="text" />
  </div>
</div>

      <div className="client-profile-row-cp">
      <div>
    <label>Barangay</label>
    <input type="text" />
  </div>
      <div>
    <label>Street</label>
    <input type="text" />
  </div>
  <div>
    <label>Municipality</label>
    <input type="text" />
  </div>
  <div>
    <label>Province</label>
    <input type="text" />
  </div>
      </div>
        <div className="button-container-cp">
          <button className="update-btn-cp">Update</button>
          <button className="clear-btn-cp">Clear</button>
        </div>
      </div>
  );
};

export default ClientProfile;
