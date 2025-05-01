import React, { useState, useRef } from "react";
import { AiOutlineArrowLeft, AiOutlineUpload } from "react-icons/ai";
import "./ClientBlessing.css";

const ClientBlessing = () => {
  // State to track form data
  const [formData, setFormData] = useState({
    preferredDate: "",
    preferredTime: "",
    priestName: "",
    firstName: "",
    middleName: "",
    lastName: "",
    gender: "",
    age: "",
    dateOfBirth: "",
    contactNumber: "",
    emailAddress: "",
    barangay: "",
    street: "",
    municipality: "",
    province: "",
    blessingType: "house", // Default blessing type
    location: "",
    purpose: "",
    notes: "",
  });

  // State to track uploaded files and their status
  const [uploadedFiles, setUploadedFiles] = useState({});
  const [uploadStatus, setUploadStatus] = useState({});
  const [showModal, setShowModal] = useState(false);
  
  // Refs for file inputs
  const fileInputRefs = useRef({});
  
  // Initialize refs based on blessing type
  const getRequirementIds = () => {
    switch(formData.blessingType) {
      case "house":
        return ['valid_id', 'proof_of_ownership', 'barangay_clearance'];
      case "business":
        return ['business_permit'];
      case "car":
        return ['vehicle_registration'];
      default:
        return [];
    }
  };

  // Function to handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Function to trigger file input click
  const triggerFileUpload = (requirementId) => {
    if (fileInputRefs.current[requirementId]) {
      fileInputRefs.current[requirementId].click();
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
          type: file.type
        }
      });
      
      setUploadStatus({
        ...uploadStatus,
        [requirementId]: "Submitted"
      });
    }, 1000); // Simulate upload delay
  };

  // Render upload status selector
  const renderStatusSelector = (requirementId) => {
    const status = uploadStatus[requirementId] || "Not Submitted";
    const isSubmitted = status === "Submitted";
    
    return (
      <select 
        className={`client-blessing-status-dropdown ${isSubmitted ? 'client-blessing-status-submitted' : 'client-blessing-status-not-submitted'}`}
        value={status}
        onChange={(e) => setUploadStatus({...uploadStatus, [requirementId]: e.target.value})}
        disabled={!isSubmitted} // Only allow changing if submitted
      >
        <option value="Not Submitted">Not Submitted</option>
        <option value="Submitted">Submitted</option>
      </select>
    );
  };

  // Function to handle form submission
  const handleSubmit = () => {
    setShowModal(true);
  };

  // Function to handle Yes confirmation
  const handleYes = () => {
    setShowModal(false);
    // Additional functionality can be added here for form submission
    console.log("Form submitted:", formData);
    console.log("Uploaded files:", uploadedFiles);
  };

  // Render requirements based on blessing type
  const renderRequirements = () => {
    const requirementIds = getRequirementIds();
    
    if (!fileInputRefs.current) {
      fileInputRefs.current = {};
    }
    
    // Create requirements based on blessing type
    switch(formData.blessingType) {
      case "house":
        return (
          <>
            <h3 className="client-blessing-section-header">Documents Needed</h3>
            <div className="client-blessing-checkbox-list">
              {/* Valid ID */}
              <div className="client-blessing-requirement-item">
                <label>
                  <input 
                    type="checkbox" 
                    checked={uploadStatus['valid_id'] === 'Submitted'} 
                    readOnly 
                  /> Valid ID of the Requester
                </label>
                <div className="client-blessing-upload-controls">
                  <div className="client-blessing-upload-container">
                    <button 
                      className="client-blessing-upload-button" 
                      onClick={() => triggerFileUpload('valid_id')}
                    >
                      <AiOutlineUpload /> Upload
                    </button>
                    <input
                      type="file"
                      ref={el => fileInputRefs.current['valid_id'] = el}
                      style={{ display: 'none' }}
                      onChange={(e) => handleFileChange('valid_id', e)}
                      accept="image/*,.pdf"
                    />
                  </div>
                  {renderStatusSelector('valid_id')}
                </div>
                {uploadedFiles['valid_id'] && (
                  <div className="client-blessing-file-preview">
                    <span>{uploadedFiles['valid_id'].name}</span>
                  </div>
                )}
              </div>
              
              {/* Proof of Ownership */}
              <div className="client-blessing-requirement-item">
                <label>
                  <input 
                    type="checkbox" 
                    checked={uploadStatus['proof_of_ownership'] === 'Submitted'} 
                    readOnly 
                  /> Proof of Ownership
                </label>
                <div className="client-blessing-upload-controls">
                  <div className="client-blessing-upload-container">
                    <button 
                      className="client-blessing-upload-button" 
                      onClick={() => triggerFileUpload('proof_of_ownership')}
                    >
                      <AiOutlineUpload /> Upload
                    </button>
                    <input
                      type="file"
                      ref={el => fileInputRefs.current['proof_of_ownership'] = el}
                      style={{ display: 'none' }}
                      onChange={(e) => handleFileChange('proof_of_ownership', e)}
                      accept="image/*,.pdf"
                    />
                  </div>
                  {renderStatusSelector('proof_of_ownership')}
                </div>
                {uploadedFiles['proof_of_ownership'] && (
                  <div className="client-blessing-file-preview">
                    <span>{uploadedFiles['proof_of_ownership'].name}</span>
                  </div>
                )}
              </div>
              
              {/* Barangay Clearance */}
              <div className="client-blessing-requirement-item">
                <label>
                  <input 
                    type="checkbox" 
                    checked={uploadStatus['barangay_clearance'] === 'Submitted'} 
                    readOnly 
                  /> Barangay Clearance
                </label>
                <div className="client-blessing-upload-controls">
                  <div className="client-blessing-upload-container">
                    <button 
                      className="client-blessing-upload-button" 
                      onClick={() => triggerFileUpload('barangay_clearance')}
                    >
                      <AiOutlineUpload /> Upload
                    </button>
                    <input
                      type="file"
                      ref={el => fileInputRefs.current['barangay_clearance'] = el}
                      style={{ display: 'none' }}
                      onChange={(e) => handleFileChange('barangay_clearance', e)}
                      accept="image/*,.pdf"
                    />
                  </div>
                  {renderStatusSelector('barangay_clearance')}
                </div>
                {uploadedFiles['barangay_clearance'] && (
                  <div className="client-blessing-file-preview">
                    <span>{uploadedFiles['barangay_clearance'].name}</span>
                  </div>
                )}
              </div>
            </div>

            <h3 className="client-blessing-section-header">House Blessing Requirements</h3>
            <div className="client-blessing-info-list">
              <div className="client-blessing-info-item">
                <p>The house must be <strong>ready for occupancy</strong></p>
              </div>
              <div className="client-blessing-info-item">
                <p>All <strong>family members should be present</strong> if possible</p>
              </div>
              <div className="client-blessing-info-item">
                <p>Prepare basic blessing items</p>
              </div>
              <div className="client-blessing-info-item">
                <p>Some parishes ask that you <strong>belong to the parish community</strong> or register in the parish</p>
              </div>
            </div>
          </>
        );
      
      case "business":
        return (
          <>
            <h3 className="client-blessing-section-header">Documents Needed</h3>
            <div className="client-blessing-checkbox-list">
              {/* Business Permit / DTI Registration */}
              <div className="client-blessing-requirement-item">
                <label>
                  <input 
                    type="checkbox" 
                    checked={uploadStatus['business_permit'] === 'Submitted'} 
                    readOnly 
                  /> Business Permit / DTI Registration
                </label>
                <div className="client-blessing-upload-controls">
                  <div className="client-blessing-upload-container">
                    <button 
                      className="client-blessing-upload-button" 
                      onClick={() => triggerFileUpload('business_permit')}
                    >
                      <AiOutlineUpload /> Upload
                    </button>
                    <input
                      type="file"
                      ref={el => fileInputRefs.current['business_permit'] = el}
                      style={{ display: 'none' }}
                      onChange={(e) => handleFileChange('business_permit', e)}
                      accept="image/*,.pdf"
                    />
                  </div>
                  {renderStatusSelector('business_permit')}
                </div>
                {uploadedFiles['business_permit'] && (
                  <div className="client-blessing-file-preview">
                    <span>{uploadedFiles['business_permit'].name}</span>
                  </div>
                )}
              </div>
            </div>

            <h3 className="client-blessing-section-header">Business Blessing Requirements</h3>
            <div className="client-blessing-info-list">
              <div className="client-blessing-info-item">
                <p>Business must have the <strong>necessary permits</strong> (may be checked informally)</p>
              </div>
              <div className="client-blessing-info-item">
                <p>Owner or authorized representative must be present</p>
              </div>
              <div className="client-blessing-info-item">
                <p>Staff may be included in prayer or ceremony</p>
              </div>
            </div>
          </>
        );
      
      case "car":
        return (
          <>
            <h3 className="client-blessing-section-header">Documents Needed</h3>
            <div className="client-blessing-checkbox-list">
              {/* Vehicle OR/CR */}
              <div className="client-blessing-requirement-item">
                <label>
                  <input 
                    type="checkbox" 
                    checked={uploadStatus['vehicle_registration'] === 'Submitted'} 
                    readOnly 
                  /> Vehicle OR/CR (Official Receipt / Certificate of Registration) if required
                </label>
                <div className="client-blessing-upload-controls">
                  <div className="client-blessing-upload-container">
                    <button 
                      className="client-blessing-upload-button" 
                      onClick={() => triggerFileUpload('vehicle_registration')}
                    >
                      <AiOutlineUpload /> Upload
                    </button>
                    <input
                      type="file"
                      ref={el => fileInputRefs.current['vehicle_registration'] = el}
                      style={{ display: 'none' }}
                      onChange={(e) => handleFileChange('vehicle_registration', e)}
                      accept="image/*,.pdf"
                    />
                  </div>
                  {renderStatusSelector('vehicle_registration')}
                </div>
                {uploadedFiles['vehicle_registration'] && (
                  <div className="client-blessing-file-preview">
                    <span>{uploadedFiles['vehicle_registration'].name}</span>
                  </div>
                )}
              </div>
            </div>

            <h3 className="client-blessing-section-header">Car Blessing Requirements</h3>
            <div className="client-blessing-info-list">
              <div className="client-blessing-info-item">
                <p>Must bring the <strong>actual vehicle</strong> to the venue or church</p>
              </div>
              <div className="client-blessing-info-item">
                <p>The car should be clean and parked properly</p>
              </div>
            </div>
          </>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="client-blessing-container">
      {/* Header */}
      <div className="client-blessing-header">
        <div className="client-blessing-left-section">
          <button className="client-blessing-back-button" onClick={() => window.history.back()}>
            <AiOutlineArrowLeft className="client-blessing-back-icon" /> Back
          </button>
        </div>
      </div>
      <h1 className="client-blessing-title">Blessing Ceremony Application Form</h1>
      
      {/* Blessing Data Section */}
      <div className="client-blessing-data">
        <div className="client-blessing-row-date">
          <div className="client-blessing-field-date">
            <label>Preferred Date of Blessing Ceremony</label>
            <select>
      <option value="">Select Date</option>
      <option value="2025-04-30">April 30, 2025</option>
      <option value="2025-05-01">May 1, 2025</option>
      <option value="2025-05-02">May 2, 2025</option>
      {/* Add more date options as needed */}
    </select>
          </div>
          
          <div className="client-blessing-field-time">
            <label>Preferred Time of Blessing Ceremony</label>
            <select>
      <option value="">Select Time</option>
      <option value="9:00">9:00 AM</option>
      <option value="10:00">10:00 AM</option>
      <option value="11:00">11:00 AM</option>
      <option value="13:00">1:00 PM</option>
      <option value="14:00">2:00 PM</option>
      <option value="15:00">3:00 PM</option>
      {/* Add more time options as needed */}
    </select>
          </div>
        </div>

        <div className="client-blessing-field-date">
          <label>Name of the Priest</label>
          <select className="client-notp">
    <option value="">Select Priest</option>
    <option value="father-john">Father John</option>
    <option value="father-michael">Father Michael</option>
    <option value="father-thomas">Father Thomas</option>
    {/* Add more priest names as needed */}
  </select>
        </div>
        
        <div className="client-blessing-bypart">
          <h2 className="client-blessing-section-title">Personal Information</h2>
          <div className="client-blessing-row">
            <div className="client-blessing-field">
              <label>First Name</label>
              <input 
                type="text" 
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
              />
            </div>
            <div className="client-blessing-field">
              <label>Middle Name</label>
              <input 
                type="text" 
                name="middleName"
                value={formData.middleName}
                onChange={handleInputChange}
              />
            </div>
            <div className="client-blessing-field">
              <label>Last Name</label>
              <input 
                type="text" 
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="client-blessing-row">
            <div className="client-blessing-field-ga">
              <label>Gender</label>
              <select 
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="client-blessing-field-ga">
              <label>Age</label>
              <input 
                type="number" 
                name="age"
                value={formData.age}
                onChange={handleInputChange}
              />
            </div>
            <div className="client-blessing-field">
              <label>Date of Birth</label>
              <input 
                type="date" 
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="client-blessing-row">
            <div className="client-blessing-field">
              <label>Contact Number</label>
              <input 
                type="tel" 
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleInputChange}
              />
            </div>
            <div className="client-blessing-field">
              <label>Email Address</label>
              <input 
                type="email" 
                name="emailAddress"
                value={formData.emailAddress}
                onChange={handleInputChange}
              />
            </div>
          </div>
          
          {/* Address Fields */}
          <div className="client-blessing-row">
          <div className="client-blessing-field">
              <label>Barangay</label>
              <input 
                type="text" 
                name="barangay"
                value={formData.barangay}
                onChange={handleInputChange}
              />
            </div>
            <div className="client-blessing-field">
              <label>Street</label>
              <input 
                type="text" 
                name="street"
                value={formData.street}
                onChange={handleInputChange}
              />
            </div>
            <div className="client-blessing-field">
              <label>Municipality</label>
              <input 
                type="text" 
                name="municipality"
                value={formData.municipality}
                onChange={handleInputChange}
              />
            </div>
            <div className="client-blessing-field">
              <label>Province</label>
              <input 
                type="text" 
                name="province"
                value={formData.province}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* Blessing Type Selection */}
          <div className="client-blessing-row">
            <div className="client-blessing-field">
              <label>Blessing Type</label>
              <select 
                name="blessingType"
                value={formData.blessingType}
                onChange={handleInputChange}
              >
                <option value="house">House Blessing</option>
                <option value="business">Business Blessing</option>
                <option value="car">Car Blessing</option>
              </select>
            </div>
            <div className="client-blessing-field">
              <label>Location</label>
              <input 
                type="text" 
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="Address/place where blessing will occur"
              />
            </div>
          </div>

          <div className="client-blessing-row">
            <div className="client-blessing-field">
              <label>Purpose</label>
              <input 
                type="text" 
                name="purpose"
                value={formData.purpose}
                onChange={handleInputChange}
                placeholder="Brief description of the purpose for the blessing"
              />
            </div>
          </div>

          <div className="client-blessing-row">
            <div className="client-blessing-field">
              <label>Notes</label>
              <textarea 
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Additional information or special requests"
                className="client-blessing-textarea"
              ></textarea>
            </div>
          </div>
        </div>
        
        {/* Requirements section */}
        <div className="client-blessing-requirements-container">
          <h2 className="client-blessing-requirements-title">Requirements</h2>
          <div className="client-blessing-requirements-box">
            {renderRequirements()}
          </div>
        </div>

        <div className="client-blessing-button-container">
          <button className="client-blessing-submit-btn" onClick={handleSubmit}>Submit</button>
          <button className="client-blessing-cancel-btn">Cancel</button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="client-blessing-modal-overlay">
          <div className="client-blessing-modal">
            <h2>Submit Application</h2>
            <hr className="client-blessing-custom-hr" />
            <p>Are you sure you want to submit your {formData.blessingType.charAt(0).toUpperCase() + formData.blessingType.slice(1)} Blessing application?</p>
            <div className="client-blessing-modal-buttons">
              <button className="client-blessing-yes-btn" onClick={handleYes}>Yes</button>
              <button className="client-blessing-modal-no-btn" onClick={() => setShowModal(false)}>No</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientBlessing;