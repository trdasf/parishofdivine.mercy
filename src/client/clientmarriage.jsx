import React, { useState, useRef } from "react";
import { AiOutlineArrowLeft, AiOutlineUpload } from "react-icons/ai"; 
import "./ClientMarriage.css";

const ClientMarriage = () => {
  // State to track uploaded files and their status
  const [uploadedFiles, setUploadedFiles] = useState({});
  const [uploadStatus, setUploadStatus] = useState({});
  const [showModal, setShowModal] = useState(false);
  
  // Refs for file inputs
  const fileInputRefs = {};
  
  // Initialize refs for each requirement
  const requirementIds = [
    'baptismal_cert', 'confirmation_cert', 'birth_cert', 
    'marriage_license', 'cenomar', 'publication_banns',
    'parish_permit', 'pre_cana', 'sponsors_list', 
    'practice_day', 'canonical_interview'
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
        className={`client-marriage-status-dropdown ${isSubmitted ? 'client-marriage-status-submitted' : 'client-marriage-status-not-submitted'}`}
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

  // Function to handle download
  const handleYes = () => {
    setShowModal(false);
  };

  return (
    <div className="client-marriage-container">
      {/* Header */}
      <div className="client-marriage-header">
        <div className="client-marriage-left-section">
          <button className="client-marriage-back-button" onClick={() => window.history.back()}>
            <AiOutlineArrowLeft className="client-marriage-back-icon" /> Back
          </button>
        </div>
      </div>
      <h1 className="client-marriage-title">Marriage Application Form</h1>
      
      {/* Matrimony Data Section */}
      <div className="client-marriage-data">
        <div className="client-marriage-row-date">
          <div className="client-marriage-field-date">
            <label>Date of Holy Matrimony</label>
            <select>
      <option value="">Select Date</option>
      <option value="2025-04-30">April 30, 2025</option>
      <option value="2025-05-01">May 1, 2025</option>
      <option value="2025-05-02">May 2, 2025</option>
      {/* Add more date options as needed */}
    </select>
          </div>
          
          <div className="client-marriage-field-time">
            <label>Time of Holy Matrimony</label>
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

        <div className="client-marriage-field-date">
          <label>Name of the Priest</label>
          <select className="client-notp">
    <option value="">Select Priest</option>
    <option value="father-john">Father John</option>
    <option value="father-michael">Father Michael</option>
    <option value="father-thomas">Father Thomas</option>
    {/* Add more priest names as needed */}
  </select>
        </div>
        
        <div className="client-marriage-bypart">
          <h3 className="client-marriage-sub-title">Groom Information</h3>
          <div className="client-marriage-row">
            <div className="client-marriage-field">
              <label>First Name of the Groom</label>
              <input type="text" />
            </div>
            <div className="client-marriage-field">
              <label>Middle Name of the Groom</label>
              <input type="text" />
            </div>
            <div className="client-marriage-field">
              <label>Last Name of the Groom</label>
              <input type="text" />
            </div>
            <div className="client-marriage-field-ga">
              <label>Age</label>
              <input type="text" />
            </div>
          </div>

          <div className="client-marriage-row">
            <div className="client-marriage-field">
              <label>Date of Birth</label>
              <input type="text" />
            </div>
            <div className="client-marriage-field">
              <label>Date of Baptism</label>
              <input type="text" />
            </div>
            <div className="client-marriage-field-dob">
              <label>Church of Baptism</label>
              <input type="text" />
            </div>
            <div className="client-marriage-field-dob">
              <label>Place of Birth</label>
              <input type="text" />
            </div>
          </div>
          
          
          {/* Address Fields as dropdowns */}
          <div className="client-marriage-row client-marriage-address-row">
          <div className="client-marriage-field">
              <label>Barangay</label>
              <select className="client-marriage-address-dropdown">
                <option value="">Select Barangay</option>
                <option value="Barangay">Barangay 1</option>
                <option value="Barangay">Barangay 2</option>
                <option value="Barangay">Barangay 3</option>
              </select>
            </div>
            <div className="client-marriage-field">
              <label>Street</label>
              <select className="client-marriage-address-dropdown">
                <option value="">Select Street</option>
                <option value="street1">Street 1</option>
                <option value="street2">Street 2</option>
                <option value="street3">Street 3</option>
              </select>
            </div>
            <div className="client-marriage-field">
              <label>Municipality</label>
              <select className="client-marriage-address-dropdown">
                <option value="">Select Municipality</option>
                <option value="municipality1">Municipality 1</option>
                <option value="municipality2">Municipality 2</option>
                <option value="municipality3">Municipality 3</option>
              </select>
            </div>
            <div className="client-marriage-field">
              <label>Province</label>
              <select className="client-marriage-address-dropdown">
                <option value="">Select Province</option>
                <option value="province1">Province 1</option>
                <option value="province2">Province 2</option>
                <option value="province3">Province 3</option>
              </select>
            </div>
          </div>

          <h3 className="client-marriage-sub-title">Bride Information</h3>
          <div className="client-marriage-row">
            <div className="client-marriage-field">
              <label>First Name of the Bride</label>
              <input type="text" />
            </div>
            <div className="client-marriage-field">
              <label>Middle Name of the Bride</label>
              <input type="text" />
            </div>
            <div className="client-marriage-field">
              <label>Last Name of the Bride</label>
              <input type="text" />
            </div>
            <div className="client-marriage-field-ga">
              <label>Age</label>
              <input type="text" />
            </div>
          </div>

          <div className="client-marriage-row">
            <div className="client-marriage-field">
              <label>Date of Birth</label>
              <input type="text" />
            </div>
            <div className="client-marriage-field">
              <label>Date of Baptism</label>
              <input type="text" />
            </div>
            <div className="client-marriage-field-dob">
              <label>Church of Baptism</label>
              <input type="text" />
            </div>
            <div className="client-marriage-field-dob">
              <label>Place of Birth</label>
              <input type="text" />
            </div>
          </div>
        
          
          {/* Address Fields as dropdowns */}
          <div className="client-marriage-row client-marriage-address-row">
          <div className="client-marriage-field">
              <label>Barangay</label>
              <select className="client-marriage-address-dropdown">
                <option value="">Select Barangay</option>
                <option value="Barangay">Barangay 1</option>
                <option value="Barangay">Barangay 2</option>
                <option value="Barangay">Barangay 3</option>
              </select>
            </div>
            <div className="client-marriage-field">
              <label>Street</label>
              <select className="client-marriage-address-dropdown">
                <option value="">Select Street</option>
                <option value="street1">Street 1</option>
                <option value="street2">Street 2</option>
                <option value="street3">Street 3</option>
              </select>
            </div>
            <div className="client-marriage-field">
              <label>Municipality</label>
              <select className="client-marriage-address-dropdown">
                <option value="">Select Municipality</option>
                <option value="municipality1">Municipality 1</option>
                <option value="municipality2">Municipality 2</option>
                <option value="municipality3">Municipality 3</option>
              </select>
            </div>
            <div className="client-marriage-field">
              <label>Province</label>
              <select className="client-marriage-address-dropdown">
                <option value="">Select Province</option>
                <option value="province1">Province 1</option>
                <option value="province2">Province 2</option>
                <option value="province3">Province 3</option>
              </select>
            </div>
          </div>

          <h3 className="client-marriage-sub-title">Witness Information</h3>
          <div className="client-marriage-row">
            <div className="client-marriage-field">
              <label>First Witness First Name</label>
              <input type="text" />
            </div>
            <div className="client-marriage-field">
              <label>First Witness Middle Name</label>
              <input type="text" />
            </div>
            <div className="client-marriage-field">
              <label>First Witness Last Name</label>
              <input type="text" />
            </div>
            <div className="client-marriage-field-ga">
              <label>Gender</label>
              <input type="text" />
            </div>
            <div className="client-marriage-field-ga">
              <label>Age</label>
              <input type="text" />
            </div>
          </div>
          
          <div className="client-marriage-row">
            <div className="client-marriage-field">
              <label>First Witness Date of Birth</label>
              <input type="text" />
            </div>
            <div className="client-marriage-field">
              <label>First Witness Contact Number</label>
              <input type="text" />
            </div>
            </div>
          
          <div className="client-marriage-row">
            <div className="client-marriage-field">
              <label>Barangay</label>
              <select className="client-marriage-address-dropdown">
                <option value="">Select Barangay</option>
                <option value="Barangay">Barangay 1</option>
                <option value="Barangay">Barangay 2</option>
                <option value="Barangay">Barangay 3</option>
              </select>
            </div>
            <div className="client-marriage-field">
              <label>Street</label>
              <select className="client-marriage-address-dropdown">
                <option value="">Select Street</option>
                <option value="street1">Street 1</option>
                <option value="street2">Street 2</option>
                <option value="street3">Street 3</option>
              </select>
            </div>
            <div className="client-marriage-field">
              <label>Municipality</label>
              <select className="client-marriage-address-dropdown">
                <option value="">Select Municipality</option>
                <option value="municipality1">Municipality 1</option>
                <option value="municipality2">Municipality 2</option>
                <option value="municipality3">Municipality 3</option>
              </select>
            </div>
            <div className="client-marriage-field">
              <label>Province</label>
              <select className="client-marriage-address-dropdown">
                <option value="">Select Province</option>
                <option value="province1">Province 1</option>
                <option value="province2">Province 2</option>
                <option value="province3">Province 3</option>
              </select>
            </div>
          </div>
          
          <div className="client-marriage-row">
            <div className="client-marriage-field">
              <label>Second Witness First Name</label>
              <input type="text" />
            </div>
            <div className="client-marriage-field">
              <label>Second Witness Middle Name</label>
              <input type="text" />
            </div>
            <div className="client-marriage-field">
              <label>Second Witness Last Name</label>
              <input type="text" />
            </div>
            <div className="client-marriage-field-ga">
              <label>Gender</label>
              <input type="text" />
            </div>
            <div className="client-marriage-field-ga">
              <label>Age</label>
              <input type="text" />
            </div>
          </div>
          
          <div className="client-marriage-row">
            <div className="client-marriage-field">
              <label>Second Witness Date of Birth</label>
              <input type="text" />
            </div>
            <div className="client-marriage-field">
              <label>Second Witness Contact Number</label>
              <input type="text" />
            </div>
            </div>
          
          <div className="client-marriage-row">
            <div className="client-marriage-field">
              <label>Barangay</label>
              <select className="client-marriage-address-dropdown">
                <option value="">Select Barangay</option>
                <option value="Barangay">Barangay 1</option>
                <option value="Barangay">Barangay 2</option>
                <option value="Barangay">Barangay 3</option>
              </select>
            </div>
            <div className="client-marriage-field">
              <label>Street</label>
              <select className="client-marriage-address-dropdown">
                <option value="">Select Street</option>
                <option value="street1">Street 1</option>
                <option value="street2">Street 2</option>
                <option value="street3">Street 3</option>
              </select>
            </div>
            <div className="client-marriage-field">
              <label>Municipality</label>
              <select className="client-marriage-address-dropdown">
                <option value="">Select Municipality</option>
                <option value="municipality1">Municipality 1</option>
                <option value="municipality2">Municipality 2</option>
                <option value="municipality3">Municipality 3</option>
              </select>
            </div>
            <div className="client-marriage-field">
              <label>Province</label>
              <select className="client-marriage-address-dropdown">
                <option value="">Select Province</option>
                <option value="province1">Province 1</option>
                <option value="province2">Province 2</option>
                <option value="province3">Province 3</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Requirements section */}
        <div className="client-marriage-requirements-container">
          <h2 className="client-marriage-requirements-title">Requirements</h2>
          <div className="client-marriage-requirements-box">
            <h3 className="client-marriage-section-header">Documents Needed</h3>
            <div className="client-marriage-checkbox-list">
            <div className="client-marriage-requirement-item">
  <label>
    <input 
      type="checkbox" 
      checked={uploadStatus['publication_banns'] === 'Submitted'} 
      onChange={() => {}} 
    /> Publication of Banns (Announcements made in the parish for three consecutive Sundays)
  </label>
  <div className="client-marriage-upload-controls">
    <div className="client-marriage-upload-container">
      <button 
        className="client-marriage-upload-button" 
        onClick={() => triggerFileUpload('publication_banns')}
      >
        <AiOutlineUpload /> Upload
      </button>
      <input
        type="file"
        ref={fileInputRefs['publication_banns']}
        style={{ display: 'none' }}
        onChange={(e) => handleFileChange('publication_banns', e)}
        accept="image/*,.pdf"
      />
    </div>
    {renderStatusSelector('publication_banns')}
  </div>
  {uploadedFiles['publication_banns'] && (
    <div className="client-marriage-file-preview">
      <span>{uploadedFiles['publication_banns'].name}</span>
    </div>
  )}
</div>

{/* Permit from Proper Parish */}
<div className="client-marriage-requirement-item">
  <label>
    <input 
      type="checkbox" 
      checked={uploadStatus['parish_permit'] === 'Submitted'} 
      onChange={() => {}} 
    /> Permit from Proper Parish
  </label>
  <div className="client-marriage-upload-controls">
    <div className="client-marriage-upload-container">
      <button 
        className="client-marriage-upload-button" 
        onClick={() => triggerFileUpload('parish_permit')}
      >
        <AiOutlineUpload /> Upload
      </button>
      <input
        type="file"
        ref={fileInputRefs['parish_permit']}
        style={{ display: 'none' }}
        onChange={(e) => handleFileChange('parish_permit', e)}
        accept="image/*,.pdf"
      />
    </div>
    {renderStatusSelector('parish_permit')}
  </div>
  {uploadedFiles['parish_permit'] && (
    <div className="client-marriage-file-preview">
      <span>{uploadedFiles['parish_permit'].name}</span>
    </div>
  )}
</div>

{/* Pre-Cana Seminar */}
<div className="client-marriage-requirement-item">
  <label>
    <input 
      type="checkbox" 
      checked={uploadStatus['pre_cana'] === 'Submitted'} 
      onChange={() => {}} 
    /> Pre-Cana Seminar Certificate
  </label>
  <div className="client-marriage-upload-controls">
    <div className="client-marriage-upload-container">
      <button 
        className="client-marriage-upload-button" 
        onClick={() => triggerFileUpload('pre_cana')}
      >
        <AiOutlineUpload /> Upload
      </button>
      <input
        type="file"
        ref={fileInputRefs['pre_cana']}
        style={{ display: 'none' }}
        onChange={(e) => handleFileChange('pre_cana', e)}
        accept="image/*,.pdf"
      />
    </div>
    {renderStatusSelector('pre_cana')}
  </div>
  {uploadedFiles['pre_cana'] && (
    <div className="client-marriage-file-preview">
      <span>{uploadedFiles['pre_cana'].name}</span>
    </div>
  )}
</div>

{/* Complete list of Sponsors */}
<div className="client-marriage-requirement-item">
  <label>
    <input 
      type="checkbox" 
      checked={uploadStatus['sponsors_list'] === 'Submitted'} 
      onChange={() => {}} 
    /> Complete List of Sponsors
  </label>
  <div className="client-marriage-upload-controls">
    <div className="client-marriage-upload-container">
      <button 
        className="client-marriage-upload-button" 
        onClick={() => triggerFileUpload('sponsors_list')}
      >
        <AiOutlineUpload /> Upload
      </button>
      <input
        type="file"
        ref={fileInputRefs['sponsors_list']}
        style={{ display: 'none' }}
        onChange={(e) => handleFileChange('sponsors_list', e)}
        accept="image/*,.pdf"
      />
    </div>
    {renderStatusSelector('sponsors_list')}
  </div>
  {uploadedFiles['sponsors_list'] && (
    <div className="client-marriage-file-preview">
      <span>{uploadedFiles['sponsors_list'].name}</span>
    </div>
  )}
</div>

{/* Practice (1 day before the marriage) */}
<div className="client-marriage-requirement-item">
  <label>
    <input 
      type="checkbox" 
      checked={uploadStatus['practice_day'] === 'Submitted'} 
      onChange={() => {}} 
    /> Practice (1 day before the marriage)
  </label>
  <div className="client-marriage-upload-controls">
    <div className="client-marriage-upload-container">
      <button 
        className="client-marriage-upload-button" 
        onClick={() => triggerFileUpload('practice_day')}
      >
        <AiOutlineUpload /> Upload
      </button>
      <input
        type="file"
        ref={fileInputRefs['practice_day']}
        style={{ display: 'none' }}
        onChange={(e) => handleFileChange('practice_day', e)}
        accept="image/*,.pdf"
      />
    </div>
    {renderStatusSelector('practice_day')}
  </div>
  {uploadedFiles['practice_day'] && (
    <div className="client-marriage-file-preview">
      <span>{uploadedFiles['practice_day'].name}</span>
    </div>
  )}
</div>

{/* Canonical Interview/Examination */}
<div className="client-marriage-requirement-item">
  <label>
    <input 
      type="checkbox" 
      checked={uploadStatus['canonical_interview'] === 'Submitted'} 
      onChange={() => {}} 
    /> Canonical Interview/Examination
  </label>
  <div className="client-marriage-upload-controls">
    <div className="client-marriage-upload-container">
      <button 
        className="client-marriage-upload-button" 
        onClick={() => triggerFileUpload('canonical_interview')}
      >
        <AiOutlineUpload /> Upload
      </button>
      <input
        type="file"
        ref={fileInputRefs['canonical_interview']}
        style={{ display: 'none' }}
        onChange={(e) => handleFileChange('canonical_interview', e)}
        accept="image/*,.pdf"
      />
    </div>
    {renderStatusSelector('canonical_interview')}
  </div>
  {uploadedFiles['canonical_interview'] && (
    <div className="client-marriage-file-preview">
      <span>{uploadedFiles['canonical_interview'].name}</span>
    </div>
  )}
</div>
            </div>

            <h3 className="client-marriage-section-header">Requirements for the Couple</h3>
            <div className="client-marriage-info-list">
              <div className="client-marriage-info-item">
                <p>Must be a baptized Catholic (at least one of the partners)</p>
              </div>
              <div className="client-marriage-info-item">
                <p>Must have received the Sacrament of Confirmation</p>
              </div>
              <div className="client-marriage-info-item">
                <p>Must undergo a Pre-Cana Seminar or Marriage Preparation Program</p>
              </div>
              <div className="client-marriage-info-item">
                <p>Must be of legal age (as required by civil law)</p>
              </div>
              <div className="client-marriage-info-item">
                <p>Must provide proof of freedom to marry (e.g., no previous valid marriage in the Church)</p>
              </div>
            </div>

            <h3 className="client-marriage-section-header">Parish Requirements</h3>
            <div className="client-marriage-info-list">
              <div className="client-marriage-info-item">
                <p>Must schedule an interview with the parish priest</p>
              </div>
              <div className="client-marriage-info-item">
                <p>Must submit all required documents at least 3 months before the wedding</p>
              </div>
              <div className="client-marriage-info-item">
                <p>Must attend marriage banns (announcements made in the parish for three consecutive Sundays)</p>
              </div>
              <div className="client-marriage-info-item">
                <p>Must choose sponsors (Ninong & Ninang) who are practicing Catholics</p>
              </div>
            </div>

            <h3 className="client-marriage-section-header">Dress Code (If Specified by Parish)</h3>
            <div className="client-marriage-info-list">
              <div className="client-marriage-info-item">
                <p>Groom: Formal attire (barong or suit)</p>
              </div>
              <div className="client-marriage-info-item">
                <p>Bride: Modest wedding gown (with sleeves or shawl for Church ceremony)</p>
              </div>
              <div className="client-marriage-info-item">
                <p>Sponsors: Formal attire, respectful and modest</p>
              </div>
            </div>
          </div>
        </div>

        <div className="client-marriage-button-container">
          <button className="client-marriage-submit-btn" onClick={handleSubmit}>Submit</button>
          <button className="client-marriage-cancel-btn">Cancel</button>
        </div>
      </div>

      {/* Download Modal */}
      {showModal && (
        <div className="client-marriage-modal-overlay">
          <div className="client-marriage-modal">
            <h2>Submit Application</h2>
            <hr class="custom-hr-b"/>
            <p>Are you sure you want to submit your Holy Matrimony application?</p>
            <div className="client-marriage-modal-buttons">
              <button className="client-marriage-yes-btn" onClick={handleYes}>Yes</button>
              <button className="client-marriage-modal-no-btn" onClick={() => setShowModal(false)}>No</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientMarriage;