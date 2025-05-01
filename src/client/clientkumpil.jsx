import React, { useState, useRef } from "react";
import { AiOutlineArrowLeft, AiOutlineUpload } from "react-icons/ai"; 
import "./ClientKumpil.css";

const ClientKumpil = () => {
  // State to track uploaded files and their status
  const [uploadedFiles, setUploadedFiles] = useState({});
  const [uploadStatus, setUploadStatus] = useState({});
  const [showModal, setShowModal] = useState(false);
  
  // Refs for file inputs
  const fileInputRefs = {};
  
  // Initialize refs for each requirement
  const requirementIds = [
    'baptism_cert', 'birth_cert', 'valid_ids',
    'received_sacraments', 'age_requirement', 'catechism_classes',
    'confession', 'confirmation_retreat'
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
        className={`client-kumpil-status-dropdown ${isSubmitted ? 'client-kumpil-status-submitted' : 'client-kumpil-status-not-submitted'}`}
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

  // Function to handle confirmation
  const handleYes = () => {
    setShowModal(false);
    // Add submission logic here
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
            <label>Date of Confirmation</label>
            <select>
      <option value="">Select Date</option>
      <option value="2025-04-30">April 30, 2025</option>
      <option value="2025-05-01">May 1, 2025</option>
      <option value="2025-05-02">May 2, 2025</option>
      {/* Add more date options as needed */}
    </select>
          </div>
          
          <div className="client-kumpil-field-time">
            <label>Time of Confirmation</label>
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

        <div className="client-kumpil-field-date">
          <label>Name of the Priest</label>
          <select className="client-notp">
    <option value="">Select Priest</option>
    <option value="father-john">Father John</option>
    <option value="father-michael">Father Michael</option>
    <option value="father-thomas">Father Thomas</option>
    {/* Add more priest names as needed */}
  </select>
        </div>
        
        <div className="client-kumpil-bypart">
          <h3 className="client-kumpil-sub-title">Personal Information</h3>
          <div className="client-kumpil-row">
            <div className="client-kumpil-field">
              <label>First Name</label>
              <input type="text" />
            </div>
            <div className="client-kumpil-field">
              <label>Middle Name</label>
              <input type="text" />
            </div>
            <div className="client-kumpil-field">
              <label>Last Name</label>
              <input type="text" />
            </div>
            <div className="client-kumpil-field-ga">
              <label>Gender</label>
              <input type="text" />
            </div>
            <div className="client-kumpil-field-ga">
              <label>Age</label>
              <input type="text" />
            </div>
          </div>
          <div className="client-kumpil-row">
            <div className="client-kumpil-field">
              <label>Date of Birth</label>
              <input type="text" />
            </div>
            <div className="client-kumpil-field">
              <label>Date of Baptism</label>
              <input type="text" />
            </div>
            <div className="client-kumpil-field">
              <label>Church of Baptism</label>
              <input type="text" />
            </div>
          <div className="client-kumpil-row">
            <div className="client-kumpil-field-pob">
              <label>Place of Birth</label>
              <input type="text" />
            </div>
          </div>
          </div>
          
          {/* Address Fields - Changed to three dropdowns */}
          <div className="client-kumpil-row client-kumpil-address-row">
          <div className="client-kumpil-field">
              <label>Barangay</label>
              <select className="client-kumpil-address-dropdown">
                <option value="">Select Barangay</option>
                <option value="Barangay">Barangay 1</option>
                <option value="Barangay">Barangay 2</option>
                <option value="Barangay">Barangay 3</option>
              </select>
            </div>
            <div className="client-kumpil-field">
              <label>Street</label>
              <select className="client-kumpil-address-dropdown">
                <option value="">Select Street</option>
                <option value="street1">Street 1</option>
                <option value="street2">Street 2</option>
                <option value="street3">Street 3</option>
              </select>
            </div>
            <div className="client-kumpil-field">
              <label>Municipality</label>
              <select className="client-kumpil-address-dropdown">
                <option value="">Select Municipality</option>
                <option value="municipality1">Municipality 1</option>
                <option value="municipality2">Municipality 2</option>
                <option value="municipality3">Municipality 3</option>
              </select>
            </div>
            <div className="client-kumpil-field">
              <label>Province</label>
              <select className="client-kumpil-address-dropdown">
                <option value="">Select Province</option>
                <option value="province1">Province 1</option>
                <option value="province2">Province 2</option>
                <option value="province3">Province 3</option>
              </select>
            </div>
          </div>
          
          {/* Father's Information */}
          <h3 className="client-kumpil-sub-title">Father's Information</h3>
          <div className="client-kumpil-row">
            <div className="client-kumpil-field">
              <label>Father's First Name</label>
              <input type="text" />
            </div>
            <div className="client-kumpil-field">
              <label>Father's Middle Name</label>
              <input type="text" />
            </div>
            <div className="client-kumpil-field">
              <label>Father's Last Name</label>
              <input type="text" />
            </div>
          </div>
          <div className="client-kumpil-row">
            <div className="client-kumpil-field-pob">
              <label>Father's Date of Birth</label>
              <input type="text" />
            </div>
            <div className="client-kumpil-field">
              <label>Father's Place of Birth</label>
              <input type="text" />
            </div>
          </div>
          <div className="client-kumpil-row">
            <div className="client-kumpil-field">
              <label>Father's Educational Attainment</label>
              <input type="text" />
            </div>
            <div className="client-kumpil-field">
              <label>Father's Occupation</label>
              <input type="text" />
            </div>
            <div className="client-kumpil-field">
              <label>Father's Contact Number</label>
              <input type="text" />
            </div>
          </div>
          
          {/* Mother's Information */}
          <h3 className="client-kumpil-sub-title">Mother's Information</h3>
          <div className="client-kumpil-row">
            <div className="client-kumpil-field">
              <label>Mother's First Name</label>
              <input type="text" />
            </div>
            <div className="client-kumpil-field">
              <label>Mother's Middle Name</label>
              <input type="text" />
            </div>
            <div className="client-kumpil-field">
              <label>Mother's Last Name</label>
              <input type="text" />
            </div>
          </div>
          <div className="client-kumpil-row">
            <div className="client-kumpil-field-pob">
              <label>Mother's Date of Birth</label>
              <input type="text" />
            </div>
            <div className="client-kumpil-field">
              <label>Mother's Place of Birth</label>
              <input type="text" />
            </div>
          </div>
          <div className="client-kumpil-row">
            <div className="client-kumpil-field">
              <label>Mother's Educational Attainment</label>
              <input type="text" />
            </div>
            <div className="client-kumpil-field">
              <label>Mother's Occupation</label>
              <input type="text" />
            </div>
            <div className="client-kumpil-field">
              <label>Mother's Contact Number</label>
              <input type="text" />
            </div>
          </div>
        </div>
        
        {/* Requirements section */}
        <div className="client-kumpil-requirements-container">
          <h2 className="client-kumpil-requirements-title">Requirements</h2>
          <div className="client-kumpil-requirements-box">
            <h3 className="client-kumpil-section-header">Documents Needed</h3>
            <div className="client-kumpil-checkbox-list">
              {/* Baptism Certificate */}
              <div className="client-kumpil-requirement-item">
                <label>
                  <input 
                    type="checkbox" 
                    checked={uploadStatus['baptism_cert'] === 'Submitted'} 
                    onChange={() => {}} 
                  /> Baptism Certificate (Proof of Catholic Baptism)
                </label>
                <div className="client-kumpil-upload-controls">
                  <div className="client-kumpil-upload-container">
                    <button 
                      className="client-kumpil-upload-button" 
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
                  <div className="client-kumpil-file-preview">
                    <span>{uploadedFiles['baptism_cert'].name}</span>
                  </div>
                )}
              </div>
              
              {/* Birth Certificate */}
              <div className="client-kumpil-requirement-item">
                <label>
                  <input 
                    type="checkbox" 
                    checked={uploadStatus['birth_cert'] === 'Submitted'} 
                    onChange={() => {}} 
                  /> Birth Certificate (PSA or Local Civil Registrar Copy)
                </label>
                <div className="client-kumpil-upload-controls">
                  <div className="client-kumpil-upload-container">
                    <button 
                      className="client-kumpil-upload-button" 
                      onClick={() => triggerFileUpload('birth_cert')}
                    >
                      <AiOutlineUpload /> Upload
                    </button>
                    <input
                      type="file"
                      ref={fileInputRefs['birth_cert']}
                      style={{ display: 'none' }}
                      onChange={(e) => handleFileChange('birth_cert', e)}
                      accept="image/*,.pdf"
                    />
                  </div>
                  {renderStatusSelector('birth_cert')}
                </div>
                {uploadedFiles['birth_cert'] && (
                  <div className="client-kumpil-file-preview">
                    <span>{uploadedFiles['birth_cert'].name}</span>
                  </div>
                )}
              </div>
              
              {/* Valid IDs */}
              <div className="client-kumpil-requirement-item">
                <label>
                  <input 
                    type="checkbox" 
                    checked={uploadStatus['valid_ids'] === 'Submitted'} 
                    onChange={() => {}} 
                  /> Valid IDs of Candidate, Parents, and Sponsor
                </label>
                <div className="client-kumpil-upload-controls">
                  <div className="client-kumpil-upload-container">
                    <button 
                      className="client-kumpil-upload-button" 
                      onClick={() => triggerFileUpload('valid_ids')}
                    >
                      <AiOutlineUpload /> Upload
                    </button>
                    <input
                      type="file"
                      ref={fileInputRefs['valid_ids']}
                      style={{ display: 'none' }}
                      onChange={(e) => handleFileChange('valid_ids', e)}
                      accept="image/*,.pdf"
                    />
                  </div>
                  {renderStatusSelector('valid_ids')}
                </div>
                {uploadedFiles['valid_ids'] && (
                  <div className="client-kumpil-file-preview">
                    <span>{uploadedFiles['valid_ids'].name}</span>
                  </div>
                )}
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

      {/* Confirmation Modal */}
      {showModal && (
        <div className="client-kumpil-modal-overlay">
          <div className="client-kumpil-modal">
            <h2>Submit Application</h2>
            <hr className="client-kumpil-custom-hr"/>
            <p>Are you sure you want to submit your Confirmation application?</p>
            <div className="client-kumpil-modal-buttons">
              <button className="client-kumpil-yes-btn" onClick={handleYes}>Yes</button>
              <button className="client-kumpil-modal-no-btn" onClick={() => setShowModal(false)}>No</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientKumpil;