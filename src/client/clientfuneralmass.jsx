import React, { useState, useRef } from "react";
import { AiOutlineArrowLeft, AiOutlineUpload } from "react-icons/ai"; 
import "./ClientFuneralMass.css";

const ClientFuneralMass = () => {
  // State to track uploaded files and their status
  const [uploadedFiles, setUploadedFiles] = useState({});
  const [uploadStatus, setUploadStatus] = useState({});
  const [showModal, setShowModal] = useState(false);
  
  // Refs for file inputs
  const fileInputRefs = {};
  
  // Initialize refs for each requirement
  const requirementIds = [
    'death_certificate', 'parish_clearance', 'burial_permit', 'baptism_cert', 'confirmation_cert'
  ];
  
  requirementIds.forEach(id => {
    fileInputRefs[id] = useRef(null);
  });

  // Function to trigger file input click
  const triggerFileUpload = (requirementId) => {
    if (fileInputRefs[requirementId] && fileInputRefs[requirementId].current) {
      fileInputRefs[requirementId].current.click();
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
        className={`client-funeral-status-dropdown ${isSubmitted ? 'client-funeral-status-submitted' : 'client-funeral-status-not-submitted'}`}
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
    // Additional functionality can be added here
  };

  return (
    <div className="client-funeral-container">
      {/* Header */}
      <div className="client-funeral-header">
        <div className="client-funeral-left-section">
          <button className="client-funeral-back-button" onClick={() => window.history.back()}>
            <AiOutlineArrowLeft className="client-funeral-back-icon" /> Back
          </button>
        </div>
      </div>
      <h1 className="client-funeral-title">Funeral Mass Application Form</h1>
      
      {/* Funeral Mass Data Section */}
      <div className="client-funeral-data">
        <div className="client-funeral-row-date">
          <div className="client-funeral-field-date">
            <label>Date of Funeral Mass</label>
            <select>
      <option value="">Select Date</option>
      <option value="2025-04-30">April 30, 2025</option>
      <option value="2025-05-01">May 1, 2025</option>
      <option value="2025-05-02">May 2, 2025</option>
      {/* Add more date options as needed */}
    </select>
          </div>
          
          <div className="client-funeral-field-time">
            <label>Time of Funeral Mass</label>
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

        <div className="client-funeral-field-date">
          <label>Name of the Priest</label>
          <select className="client-notp">
    <option value="">Select Priest</option>
    <option value="father-john">Father John</option>
    <option value="father-michael">Father Michael</option>
    <option value="father-thomas">Father Thomas</option>
    {/* Add more priest names as needed */}
  </select>
        </div>
        
        {/* Deceased Information */}
        <div className="client-funeral-bypart">
          <h3 className="client-funeral-sub-title">Deceased Information</h3>
          <div className="client-funeral-row">
            <div className="client-funeral-field">
              <label>First Name</label>
              <input type="text" />
            </div>
            <div className="client-funeral-field">
              <label>Middle Name</label>
              <input type="text" />
            </div>
            <div className="client-funeral-field">
              <label>Last Name</label>
              <input type="text" />
            </div>
            <div className="client-funeral-field-ga">
              <label>Gender</label>
              <input type="text" />
            </div>
            <div className="client-funeral-field-ga">
              <label>Age</label>
              <input type="text" />
            </div>
          </div>

          <div className="client-funeral-row">
            <div className="client-funeral-field">
              <label>Date of Birth</label>
              <input type="text" />
            </div>
            <div className="client-funeral-field">
              <label>Date of Death</label>
              <input type="text" />
            </div>
          </div>
          
          <div className="client-funeral-row">
            <div className="client-funeral-field">
              <label>Cause of Death</label>
              <input type="text" />
            </div>
          </div>
          
          <div className="client-funeral-row">
            <div className="client-funeral-field">
              <label>Wake Location</label>
              <input type="text" />
            </div>
          </div>
          
          <div className="client-funeral-row">
            <div className="client-funeral-field">
              <label>Burial Location</label>
              <input type="text" />
            </div>
          </div>
          
          {/* Requester Information */}
          <h3 className="client-funeral-sub-title">Requester Information</h3>
          <div className="client-funeral-row">
            <div className="client-funeral-field">
              <label>First Name</label>
              <input type="text" />
            </div>
            <div className="client-funeral-field">
              <label>Middle Name</label>
              <input type="text" />
            </div>
            <div className="client-funeral-field">
              <label>Last Name</label>
              <input type="text" />
            </div>
          </div>
          
          <div className="client-funeral-row">
            <div className="client-funeral-field">
              <label>Relationship to the Deceased</label>
              <input type="text" />
            </div>
            <div className="client-funeral-field">
              <label>Contact Number</label>
              <input type="text" />
            </div>
            <div className="client-funeral-field">
              <label>Email Address</label>
              <input type="text" />
            </div>
          </div>
          
          {/* Address Fields as dropdowns */}
          <h3 className="client-funeral-sub-title">Address</h3>
          <div className="client-funeral-row client-funeral-address-row">
          <div className="client-funeral-field">
              <label>Barangay</label>
              <select className="client-funeral-address-dropdown">
                <option value="">Select Barangay</option>
                <option value="Barangay1">Barangay 1</option>
                <option value="Barangay2">Barangay 2</option>
                <option value="Barangay3">Barangay 3</option>
              </select>
            </div>
            <div className="client-funeral-field">
              <label>Street</label>
              <select className="client-funeral-address-dropdown">
                <option value="">Select Street</option>
                <option value="street1">Street 1</option>
                <option value="street2">Street 2</option>
                <option value="street3">Street 3</option>
              </select>
            </div>
            <div className="client-funeral-field">
              <label>Municipality</label>
              <select className="client-funeral-address-dropdown">
                <option value="">Select Municipality</option>
                <option value="municipality1">Municipality 1</option>
                <option value="municipality2">Municipality 2</option>
                <option value="municipality3">Municipality 3</option>
              </select>
            </div>
            <div className="client-funeral-field">
              <label>Province</label>
              <select className="client-funeral-address-dropdown">
                <option value="">Select Province</option>
                <option value="province1">Province 1</option>
                <option value="province2">Province 2</option>
                <option value="province3">Province 3</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Requirements section */}
        <div className="client-funeral-requirements-container">
          <h2 className="client-funeral-requirements-title">Requirements</h2>
          <div className="client-funeral-requirements-box">
            <h3 className="client-funeral-section-header">Documents Needed</h3>
            <div className="client-funeral-checkbox-list">
              {/* Death Certificate */}
              <div className="client-funeral-requirement-item">
                <label>
                  <input 
                    type="checkbox" 
                    checked={uploadStatus['death_certificate'] === 'Submitted'} 
                    onChange={() => {}} 
                  /> Death Certificate
                </label>
                <div className="client-funeral-upload-controls">
                  <div className="client-funeral-upload-container">
                    <button 
                      className="client-funeral-upload-button" 
                      onClick={() => triggerFileUpload('death_certificate')}
                    >
                      <AiOutlineUpload /> Upload
                    </button>
                    <input
                      type="file"
                      ref={fileInputRefs['death_certificate']}
                      style={{ display: 'none' }}
                      onChange={(e) => handleFileChange('death_certificate', e)}
                      accept="image/*,.pdf"
                    />
                  </div>
                  {renderStatusSelector('death_certificate')}
                </div>
                {uploadedFiles['death_certificate'] && (
                  <div className="client-funeral-file-preview">
                    <span>{uploadedFiles['death_certificate'].name}</span>
                  </div>
                )}
              </div>
              
              {/* Parish Clearance */}
              <div className="client-funeral-requirement-item">
                <label>
                  <input 
                    type="checkbox" 
                    checked={uploadStatus['parish_clearance'] === 'Submitted'} 
                    onChange={() => {}} 
                  /> Parish Clearance (if from another parish)
                </label>
                <div className="client-funeral-upload-controls">
                  <div className="client-funeral-upload-container">
                    <button 
                      className="client-funeral-upload-button" 
                      onClick={() => triggerFileUpload('parish_clearance')}
                    >
                      <AiOutlineUpload /> Upload
                    </button>
                    <input
                      type="file"
                      ref={fileInputRefs['parish_clearance']}
                      style={{ display: 'none' }}
                      onChange={(e) => handleFileChange('parish_clearance', e)}
                      accept="image/*,.pdf"
                    />
                  </div>
                  {renderStatusSelector('parish_clearance')}
                </div>
                {uploadedFiles['parish_clearance'] && (
                  <div className="client-funeral-file-preview">
                    <span>{uploadedFiles['parish_clearance'].name}</span>
                  </div>
                )}
              </div>
              
              {/* Burial Permit */}
              <div className="client-funeral-requirement-item">
                <label>
                  <input 
                    type="checkbox" 
                    checked={uploadStatus['burial_permit'] === 'Submitted'} 
                    onChange={() => {}} 
                  /> Permit to Bury
                </label>
                <div className="client-funeral-upload-controls">
                  <div className="client-funeral-upload-container">
                    <button 
                      className="client-funeral-upload-button" 
                      onClick={() => triggerFileUpload('burial_permit')}
                    >
                      <AiOutlineUpload /> Upload
                    </button>
                    <input
                      type="file"
                      ref={fileInputRefs['burial_permit']}
                      style={{ display: 'none' }}
                      onChange={(e) => handleFileChange('burial_permit', e)}
                      accept="image/*,.pdf"
                    />
                  </div>
                  {renderStatusSelector('burial_permit')}
                </div>
                {uploadedFiles['burial_permit'] && (
                  <div className="client-funeral-file-preview">
                    <span>{uploadedFiles['burial_permit'].name}</span>
                  </div>
                )}
              </div>
              
              {/* Baptism Certificate */}
              <div className="client-funeral-requirement-item">
                <label>
                  <input 
                    type="checkbox" 
                    checked={uploadStatus['baptism_cert'] === 'Submitted'} 
                    onChange={() => {}} 
                  /> Certificate of Baptism
                </label>
                <div className="client-funeral-upload-controls">
                  <div className="client-funeral-upload-container">
                    <button 
                      className="client-funeral-upload-button" 
                      onClick={() => triggerFileUpload('baptism_cert')}
                    >
                      <AiOutlineUpload /> Upload
                    </button>
                    <input
                      type="file"
                      ref={fileInputRefs['baptism_cert']}
                      style={{ display: 'none' }}
                      onChange={(e) => handleFileChange('baptism_cert', e)}
                      accept="image/*,.pdf"
                    />
                  </div>
                  {renderStatusSelector('baptism_cert')}
                </div>
                {uploadedFiles['baptism_cert'] && (
                  <div className="client-funeral-file-preview">
                    <span>{uploadedFiles['baptism_cert'].name}</span>
                  </div>
                )}
              </div>
              
              {/* Confirmation Certificate */}
              <div className="client-funeral-requirement-item">
                <label>
                  <input 
                    type="checkbox" 
                    checked={uploadStatus['confirmation_cert'] === 'Submitted'} 
                    onChange={() => {}} 
                  /> Certificate of Confirmation
                </label>
                <div className="client-funeral-upload-controls">
                  <div className="client-funeral-upload-container">
                    <button 
                      className="client-funeral-upload-button" 
                      onClick={() => triggerFileUpload('confirmation_cert')}
                    >
                      <AiOutlineUpload /> Upload
                    </button>
                    <input
                      type="file"
                      ref={fileInputRefs['confirmation_cert']}
                      style={{ display: 'none' }}
                      onChange={(e) => handleFileChange('confirmation_cert', e)}
                      accept="image/*,.pdf"
                    />
                  </div>
                  {renderStatusSelector('confirmation_cert')}
                </div>
                {uploadedFiles['confirmation_cert'] && (
                  <div className="client-funeral-file-preview">
                    <span>{uploadedFiles['confirmation_cert'].name}</span>
                  </div>
                )}
              </div>
            </div>

            <h3 className="client-funeral-section-header">Funeral Setup Requirements</h3>
            <div className="client-funeral-info-list">
              <div className="client-funeral-info-item">
                <p>Photos/memorial table allowed with limitations (not on the altar)</p>
              </div>
              <div className="client-funeral-info-item">
                <p>Eulogies may be given before/after the Mass or at the cemetery</p>
              </div>
              <div className="client-funeral-info-item">
                <p>Family and guests should wear respectful and modest attire</p>
              </div>
              <div className="client-funeral-info-item">
                <p>No loud music, applause, or improper conduct during the Mass</p>
              </div>
            </div>
          </div>
        </div>

        <div className="client-funeral-button-container">
          <button className="client-funeral-submit-btn" onClick={handleSubmit}>Submit</button>
          <button className="client-funeral-cancel-btn">Cancel</button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="client-funeral-modal-overlay">
          <div className="client-funeral-modal">
            <h2>Submit Application</h2>
            <hr className="client-funeral-custom-hr" />
            <p>Are you sure you want to submit your Funeral Mass application?</p>
            <div className="client-funeral-modal-buttons">
              <button className="client-funeral-yes-btn" onClick={handleYes}>Yes</button>
              <button className="client-funeral-modal-no-btn" onClick={() => setShowModal(false)}>No</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientFuneralMass;