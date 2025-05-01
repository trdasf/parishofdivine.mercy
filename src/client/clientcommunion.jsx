import React, { useState, useRef } from "react";
import { AiOutlineArrowLeft, AiOutlineUpload } from "react-icons/ai"; 
import "./ClientCommunion.css";

const ClientCommunion = () => {
  // State to track uploaded files and their status
  const [uploadedFiles, setUploadedFiles] = useState({});
  const [uploadStatus, setUploadStatus] = useState({});
  const [showModal, setShowModal] = useState(false);
  
  // Refs for file inputs
  const fileInputRefs = {};
  
  // Initialize refs for each requirement
  const requirementIds = [
    'baptismal_cert', 'first_communion_cert', 'birth_cert'
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
        className={`client-communion-status-dropdown ${isSubmitted ? 'client-communion-status-submitted' : 'client-communion-status-not-submitted'}`}
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
      
      {/* Holy Communion Data Section */}
      <div className="client-communion-data">
        <div className="client-communion-row-date">
          <div className="client-communion-field-date">
            <label>Date of Holy Communion</label>
            <select>
      <option value="">Select Date</option>
      <option value="2025-04-30">April 30, 2025</option>
      <option value="2025-05-01">May 1, 2025</option>
      <option value="2025-05-02">May 2, 2025</option>
      {/* Add more date options as needed */}
    </select>
          </div>
          
          <div className="client-communion-field-time">
            <label>Time of Holy Communion</label>
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

        <div className="client-communion-field-date">
          <label>Name of the Priest</label>
          <select className="client-notp">
    <option value="">Select Priest</option>
    <option value="father-john">Father John</option>
    <option value="father-michael">Father Michael</option>
    <option value="father-thomas">Father Thomas</option>
    {/* Add more priest names as needed */}
  </select>
        </div>
        
        <div className="client-communion-bypart">
          <div className="client-communion-row">
            <div className="client-communion-field">
              <label>First Name</label>
              <input type="text" />
            </div>
            <div className="client-communion-field">
              <label>Middle Name</label>
              <input type="text" />
            </div>
            <div className="client-communion-field">
              <label>Last Name</label>
              <input type="text" />
            </div>
            <div className="client-communion-field-ga">
              <label>Gender</label>
              <input type="text" />
            </div>
            <div className="client-communion-field-ga">
              <label>Age</label>
              <input type="text" />
            </div>
          </div>

          <div className="client-communion-row">
            <div className="client-communion-field">
              <label>Date of Birth</label>
              <input type="text" />
            </div>
            <div className="client-communion-field">
              <label>Date of Baptism</label>
              <input type="text" />
            </div>
            <div className="client-communion-field-dob">
              <label>Church of Baptism</label>
              <input type="text" />
            </div>
          </div>
          
          <div className="client-communion-row client-communion-address-row">
            <div className="client-communion-field">
              <label>Place of Birth</label>
              <input type="text" />
            </div>
          </div>
          
          {/* Address Fields as dropdowns */}
          <div className="client-communion-row client-communion-address-row">
          <div className="client-communion-field">
              <label>Barangay</label>
              <select className="client-communion-address-dropdown">
                <option value="">Select Barangay</option>
                <option value="barangay1">Barangay 1</option>
                <option value="barangay2">Barangay 2</option>
                <option value="barangay3">Barangay 3</option>
              </select>
            </div>
            <div className="client-communion-field">
              <label>Street</label>
              <select className="client-communion-address-dropdown">
                <option value="">Select Street</option>
                <option value="street1">Street 1</option>
                <option value="street2">Street 2</option>
                <option value="street3">Street 3</option>
              </select>
            </div>
            <div className="client-communion-field">
              <label>Municipality</label>
              <select className="client-communion-address-dropdown">
                <option value="">Select Municipality</option>
                <option value="municipality1">Municipality 1</option>
                <option value="municipality2">Municipality 2</option>
                <option value="municipality3">Municipality 3</option>
              </select>
            </div>
            <div className="client-communion-field">
              <label>Province</label>
              <select className="client-communion-address-dropdown">
                <option value="">Select Province</option>
                <option value="province1">Province 1</option>
                <option value="province2">Province 2</option>
                <option value="province3">Province 3</option>
              </select>
            </div>
          </div>

          {/* Father's Information */}
          <h3 className="client-communion-sub-title">Father's Information</h3>
          <div className="client-communion-row">
            <div className="client-communion-field">
              <label>Father's First Name</label>
              <input type="text" />
            </div>
            <div className="client-communion-field">
              <label>Father's Middle Name</label>
              <input type="text" />
            </div>
            <div className="client-communion-field">
              <label>Father's Last Name</label>
              <input type="text" />
            </div>
          </div>
          
          <div className="client-communion-row">
            <div className="client-communion-field">
              <label>Father's Date of Birth</label>
              <input type="text" />
            </div>
            <div className="client-communion-field">
              <label>Father's Place of Birth</label>
              <input type="text" />
            </div>
          </div>
          
          <div className="client-communion-row">
            <div className="client-communion-field">
              <label>Father's Educational Attainment</label>
              <input type="text" />
            </div>
            <div className="client-communion-field">
              <label>Father's Occupation</label>
              <input type="text" />
            </div>
            <div className="client-communion-field">
              <label>Father's Contact Number</label>
              <input type="text" />
            </div>
          </div>
          
          {/* Mother's Information */}
          <h3 className="client-communion-sub-title">Mother's Information</h3>
          <div className="client-communion-row">
            <div className="client-communion-field">
              <label>Mother's First Name</label>
              <input type="text" />
            </div>
            <div className="client-communion-field">
              <label>Mother's Middle Name</label>
              <input type="text" />
            </div>
            <div className="client-communion-field">
              <label>Mother's Last Name</label>
              <input type="text" />
            </div>
          </div>
          
          <div className="client-communion-row">
            <div className="client-communion-field">
              <label>Mother's Date of Birth</label>
              <input type="text" />
            </div>
            <div className="client-communion-field">
              <label>Mother's Place of Birth</label>
              <input type="text" />
            </div>
          </div>

          <div className="client-communion-row">
            <div className="client-communion-field">
              <label>Mother's Educational Attainment</label>
              <input type="text" />
            </div>
            <div className="client-communion-field">
              <label>Mother's Occupation</label>
              <input type="text" />
            </div>
            <div className="client-communion-field">
              <label>Mother's Contact Number</label>
              <input type="text" />
            </div>
          </div>
        </div>
        
        {/* Requirements section */}
        <div className="client-communion-requirements-container">
          <h2 className="client-communion-requirements-title">Requirements</h2>
          <div className="client-communion-requirements-box">
            <h3 className="client-communion-section-header">Documents Needed</h3>
            <div className="client-communion-checkbox-list">
              {/* Baptismal Certificate */}
              <div className="client-communion-requirement-item">
                <label>
                  <input 
                    type="checkbox" 
                    checked={uploadStatus['baptismal_cert'] === 'Submitted'} 
                    onChange={() => {}} 
                  /> Baptismal Certificate (Proof of Catholic Baptism)
                </label>
                <div className="client-communion-upload-controls">
                  <div className="client-communion-upload-container">
                    <button 
                      className="client-communion-upload-button" 
                      onClick={() => triggerFileUpload('baptismal_cert')}
                    >
                      <AiOutlineUpload /> Upload
                    </button>
                    <input
                      type="file"
                      ref={fileInputRefs['baptismal_cert']}
                      style={{ display: 'none' }}
                      onChange={(e) => handleFileChange('baptismal_cert', e)}
                      accept="image/*,.pdf"
                    />
                  </div>
                  {renderStatusSelector('baptismal_cert')}
                </div>
                {uploadedFiles['baptismal_cert'] && (
                  <div className="client-communion-file-preview">
                    <span>{uploadedFiles['baptismal_cert'].name}</span>
                  </div>
                )}
              </div>
              
              {/* First Communion Certificate */}
              <div className="client-communion-requirement-item">
                <label>
                  <input 
                    type="checkbox" 
                    checked={uploadStatus['first_communion_cert'] === 'Submitted'} 
                    onChange={() => {}} 
                  /> First Communion Certificate (If applicable, for record purposes)
                </label>
                <div className="client-communion-upload-controls">
                  <div className="client-communion-upload-container">
                    <button 
                      className="client-communion-upload-button" 
                      onClick={() => triggerFileUpload('first_communion_cert')}
                    >
                      <AiOutlineUpload /> Upload
                    </button>
                    <input
                      type="file"
                      ref={fileInputRefs['first_communion_cert']}
                      style={{ display: 'none' }}
                      onChange={(e) => handleFileChange('first_communion_cert', e)}
                      accept="image/*,.pdf"
                    />
                  </div>
                  {renderStatusSelector('first_communion_cert')}
                </div>
                {uploadedFiles['first_communion_cert'] && (
                  <div className="client-communion-file-preview">
                    <span>{uploadedFiles['first_communion_cert'].name}</span>
                  </div>
                )}
              </div>
              
              {/* Birth Certificate */}
              <div className="client-communion-requirement-item">
                <label>
                  <input 
                    type="checkbox" 
                    checked={uploadStatus['birth_cert'] === 'Submitted'} 
                    onChange={() => {}} 
                  /> Birth Certificate (For age verification, required in some parishes)
                </label>
                <div className="client-communion-upload-controls">
                  <div className="client-communion-upload-container">
                    <button 
                      className="client-communion-upload-button" 
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
                  <div className="client-communion-file-preview">
                    <span>{uploadedFiles['birth_cert'].name}</span>
                  </div>
                )}
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

      {/* Confirmation Modal */}
      {showModal && (
        <div className="client-communion-modal-overlay">
          <div className="client-communion-modal">
            <h2>Submit Application</h2>
            <hr className="client-communion-custom-hr" />
            <p>Are you sure you want to submit your Holy Communion application?</p>
            <div className="client-communion-modal-buttons">
              <button className="client-communion-yes-btn" onClick={handleYes}>Yes</button>
              <button className="client-communion-modal-no-btn" onClick={() => setShowModal(false)}>No</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientCommunion;