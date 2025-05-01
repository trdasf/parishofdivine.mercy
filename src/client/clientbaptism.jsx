import React, { useState, useRef } from "react";
import { AiOutlineArrowLeft, AiOutlineCheck, AiOutlineUpload } from "react-icons/ai"; 
import "./ClientBaptism.css";

const ClientBaptism = () => {
  // State to track uploaded files and their status
  const [uploadedFiles, setUploadedFiles] = useState({});
  const [uploadStatus, setUploadStatus] = useState({});
  const [showModal, setShowModal] = useState(false);
  
  // Refs for file inputs
  const fileInputRefs = {};
  
  // Initialize refs for each requirement
  const requirementIds = [
    'birth_cert', 'marriage_cert', 'valid_ids', 
    'parent_catholic', 'parent_willing', 'parent_seminar',
    'godparent_catholic', 'godparent_sacraments', 'godparent_age',
    'godparent_married', 'godparent_seminar', 'godparent_confirmation'
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
    // In a real app, you would use FormData and fetch/axios to upload to a server
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
        className={`client-status-dropdown ${isSubmitted ? 'client-status-submitted' : 'client-status-not-submitted'}`}
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
  const handleYes = () => {
    setShowModal(false);
  };

  return (
    <div className="client-baptism-container">
      {/* Header */}
      <div className="client-baptism-header">
        <div className="client-left-section">
          <button className="client-back-button" onClick={() => window.history.back()}>
            <AiOutlineArrowLeft className="client-back-icon" /> Back
          </button>
        </div>
      </div>
      <h1 className="client-title">Baptism Application</h1>
      {/* Baptismal Data Section */}
      <div className="client-baptismal-data">
      <div className="client-baptismal-row-date">
  <div className="client-baptismal-field-date">
    <label>Date of Baptism</label>
    <select>
      <option value="">Select Date</option>
      <option value="2025-04-30">April 30, 2025</option>
      <option value="2025-05-01">May 1, 2025</option>
      <option value="2025-05-02">May 2, 2025</option>
      {/* Add more date options as needed */}
    </select>
  </div>
  
  <div className="client-baptismal-field-time">
    <label>Time of Baptism</label>
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

<div className="client-baptismal-field-date">
  <label>Name of the Priest</label>
  <select className="client-notp">
    <option value="">Select Priest</option>
    <option value="father-john">Father John</option>
    <option value="father-michael">Father Michael</option>
    <option value="father-thomas">Father Thomas</option>
    {/* Add more priest names as needed */}
  </select>
</div>
        <div className="client-bypart">
          <h3 className="client-sub-title">Baptism Information</h3>
          <div className="client-baptismal-row">
            <div className="client-baptismal-field">
              <label>First Name of the Baptized</label>
              <input type="text" />
            </div>
            <div className="client-baptismal-field">
              <label>Middle Name of the Baptized</label>
              <input type="text" />
            </div>
            <div className="client-baptismal-field">
              <label>Last Name of the Baptized</label>
              <input type="text" />
            </div>
            <div className="client-baptismal-field-ga">
              <label>Gender</label>
              <input type="text" />
            </div>
            <div className="client-baptismal-field-ga">
              <label>Age</label>
              <input type="text" />
            </div>
          </div>
          <div className="client-baptismal-row">
            <div className="client-baptismal-field-pob">
              <label>Date of Birth</label>
              <input type="text" />
            </div>
            <div className="client-baptismal-field">
              <label>Place of Birth</label>
              <input type="text" />
            </div>
          </div>

          {/* Father's Information */}
          <h3 className="client-sub-title">Father Information</h3>
          <div className="client-baptismal-row">
            <div className="client-baptismal-field">
              <label>Father's First Name</label>
              <input type="text" />
            </div>
            <div className="client-baptismal-field">
              <label>Father's Middle Name</label>
              <input type="text" />
            </div>
            <div className="client-baptismal-field">
              <label>Father's Last Name</label>
              <input type="text" />
            </div>
          </div>
          <div className="client-baptismal-row">
            <div className="client-baptismal-field">
              <label>Father's Place of Birth</label>
              <input type="text" />
            </div>
            <div className="client-baptismal-field-fpob">
              <label>Father's Date of Birth</label>
              <input type="text" />
            </div>
          </div>

          <div className="client-baptismal-row">
            <div className="client-baptismal-field">
              <label>Father's Educational Attainment</label>
              <input type="text" />
            </div>
            <div className="client-baptismal-field">
              <label>Father's Occupation</label>
              <input type="text" />
            </div>
            <div className="client-baptismal-field">
              <label>Father's Contact Number</label>
              <input type="text" />
            </div>
          </div>
          <h3 className="client-sub-title">Mother Information</h3>
          {/* Mother's Information */}
          <div className="client-baptismal-row">
            <div className="client-baptismal-field">
              <label>Mother's First Name</label>
              <input type="text" />
            </div>
            <div className="client-baptismal-field">
              <label>Mother's Middle Name</label>
              <input type="text" />
            </div>
            <div className="client-baptismal-field">
              <label>Mother's Last Name</label>
              <input type="text" />
            </div>
          </div>

          <div className="client-baptismal-row">
            <div className="client-baptismal-field">
              <label>Mother's Place of Birth</label>
              <input type="text" />
            </div>
            <div className="client-baptismal-field-fpob">
              <label>Mother's Date of Birth</label>
              <input type="text" />
            </div>
          </div>

          <div className="client-baptismal-row">
            <div className="client-baptismal-field">
              <label>Mother's Educational Attainment</label>
              <input type="text" />
            </div>
            <div className="client-baptismal-field">
              <label>Mother's Occupation</label>
              <input type="text" />
            </div>
            <div className="client-baptismal-field">
              <label>Mother's Contact Number</label>
              <input type="text" />
            </div>
          </div>
          <h3 className="client-sub-title">Parents Marital Status</h3>
          <div className="client-baptismal-row-pms">
            <div className="client-marital-status">
              <label className="client-section-label">Select the parent's marital status by choosing one of the following options:</label>
              <div className="client-marital-options">
                <div className="client-pms-label">
                  <input type="checkbox" id="catholic" />
                  <label htmlFor="catholic">Catholic</label>
                </div>
                <div className="client-pms-label">
                  <input type="checkbox" id="civil" />
                  <label htmlFor="civil">Civil</label>
                </div>
                <div className="client-pms-label">
                  <input type="checkbox" id="living-together" />
                  <label htmlFor="living-together">Living Together</label>
                </div>
              </div>
            </div>

          
            <div className="client-years-married">
              <input type="text" className="client-short-input" />
              <label>Number of Years Married</label>
            </div>
          </div>
          
          {/* Address Fields - Changed to three dropdowns */}
          <div className="client-baptismal-row client-address-row">
          <div className="client-baptismal-field">
              <label>Barangay</label>
              <select className="client-address-dropdown">
                <option value="">Select Barangay</option>
                <option value="barangay1">Barangay 1</option>
                <option value="barangay2">Barangay 2</option>
                <option value="barangay3">Barangay 3</option>
              </select>
            </div>
            <div className="client-baptismal-field">
              <label>Street</label>
              <select className="client-address-dropdown">
                <option value="">Select Street</option>
                <option value="street1">Street 1</option>
                <option value="street2">Street 2</option>
                <option value="street3">Street 3</option>
              </select>
            </div>
            <div className="client-baptismal-field">
              <label>Municipality</label>
              <select className="client-address-dropdown">
                <option value="">Select Municipality</option>
                <option value="municipality1">Municipality 1</option>
                <option value="municipality2">Municipality 2</option>
                <option value="municipality3">Municipality 3</option>
              </select>
            </div>
            <div className="client-baptismal-field">
              <label>Province</label>
              <select className="client-address-dropdown">
                <option value="">Select Province</option>
                <option value="province1">Province 1</option>
                <option value="province2">Province 2</option>
                <option value="province3">Province 3</option>
              </select>
            </div>
          </div>
          
          <div className="client-bypart">
            <h3 className="client-sub-title">Godparents Information</h3>
            <div className="client-baptismal-row">
              <div className="client-baptismal-field">
                <label>God Father Name (Ninong)</label>
                <input type="text" />
              </div>
              <button className="client-add-button">Add</button>
            </div>

            <div className="client-baptismal-row">
              <div className="client-baptismal-field">
                <label>God Mother Name (Ninang)</label>
                <input type="text" />
              </div>
              <button className="client-add-button">Add</button>
            </div>
          </div>
        </div>
        <div className="client-requirements-container">
          <h2 className="client-requirements-title">Requirements</h2>

          <div className="client-requirements-box">
            <h3 className="client-section-header">Document Needed</h3>
            <div className="client-checkbox-list">
              {/* Updated requirement items with file upload and status dropdown */}
              <div className="client-requirement-item">
                <label>
                  <input 
                    type="checkbox" 
                    checked={uploadStatus['birth_cert'] === 'Submitted'} 
                    onChange={() => {}} 
                  /> Birth Certificate of the Child (PSA or local civil registrar copy)
                </label>
                <div className="client-upload-controls">
                  <div className="client-upload-container">
                    <button 
                      className="client-upload-button" 
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
                  <div className="client-file-preview">
                    <span>{uploadedFiles['birth_cert'].name}</span>
                  </div>
                )}
              </div>
              
              <div className="client-requirement-item">
                <label>
                  <input 
                    type="checkbox" 
                    checked={uploadStatus['marriage_cert'] === 'Submitted'} 
                    onChange={() => {}} 
                  /> Parents' Marriage Certificate (If married in the Church)
                </label>
                <div className="client-upload-controls">
                  <div className="client-upload-container">
                    <button 
                      className="client-upload-button" 
                      onClick={() => triggerFileUpload('marriage_cert')}
                    >
                      <AiOutlineUpload /> Upload
                    </button>
                    <input
                      type="file"
                      ref={fileInputRefs['marriage_cert']}
                      style={{ display: 'none' }}
                      onChange={(e) => handleFileChange('marriage_cert', e)}
                      accept="image/*,.pdf"
                    />
                  </div>
                  {renderStatusSelector('marriage_cert')}
                </div>
                {uploadedFiles['marriage_cert'] && (
                  <div className="client-file-preview">
                    <span>{uploadedFiles['marriage_cert'].name}</span>
                  </div>
                )}
              </div>
              
              <div className="client-requirement-item">
                <label>
                  <input 
                    type="checkbox" 
                    checked={uploadStatus['valid_ids'] === 'Submitted'} 
                    onChange={() => {}} 
                  /> Valid IDs of Parents and Godparents
                </label>
                <div className="client-upload-controls">
                  <div className="client-upload-container">
                    <button 
                      className="client-upload-button" 
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
                  <div className="client-file-preview">
                    <span>{uploadedFiles['valid_ids'].name}</span>
                  </div>
                )}
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
            </div>
          </div>
        </div>

        <div className="client-button-container">
          <button className="client-submit-btn" onClick={handleSubmit}>Submit</button>
          <button className="client-cancel-btn">Cancel</button>
        </div>
      </div>

      {/* Download Modal */}
      {showModal && (
        <div className="client-modal-overlay">
          <div className="client-modal">
            <h2>Submit Application</h2>
            <hr class="custom-hr-b"/>
            <p>Are you sure you want to submit your Baptism application?</p>
            <div className="client-modal-buttons">
              <button className="client-yes-btn" onClick={handleYes}>Yes</button>
              <button className="client-modal-no-btn" onClick={() => setShowModal(false)}>No</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientBaptism;