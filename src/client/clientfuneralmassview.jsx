import React from "react";
import { AiOutlineArrowLeft } from "react-icons/ai"; 
import "./ClientFuneralMassView.css";

const ClientFuneralMassView = () => {
  // Mock data for view-only mode
  const funeralData = {
    date: "May 15, 2025",
    time: "10:00 AM",
    priest: "Fr. Michael Santos",
    deceased: {
      firstName: "John",
      middleName: "Robert",
      lastName: "Smith",
      gender: "Male",
      age: "78",
      dateOfBirth: "March 12, 1947",
      dateOfDeath: "May 10, 2025",
      causeOfDeath: "Natural Causes",
      wakeLocation: "Smith Family Residence, 123 Main Street",
      burialLocation: "Holy Cross Cemetery"
    },
    requester: {
      firstName: "Mary",
      middleName: "Anne",
      lastName: "Smith",
      relationship: "Daughter",
      contactNumber: "555-123-4567",
      email: "mary.smith@email.com"
    },
    address: {
      barangay: "barangay",
      street: "123 Main Street",
      municipality: "San Juan",
      province: "Metro Manila"
    },
    requirements: {
      death_certificate: "Submitted",
      parish_clearance: "Not Submitted",
      burial_permit: "Submitted",
      baptism_cert: "Submitted",
      confirmation_cert: "Not Submitted"
    }
  };

  return (
    <div className="client-funeral-view-container">
      {/* Header */}
      <div className="client-funeral-view-header">
        <div className="client-funeral-view-left-section">
          <button className="client-funeral-view-back-button" onClick={() => window.history.back()}>
            <AiOutlineArrowLeft className="client-funeral-view-back-icon" /> Back
          </button>
        </div>
      </div>
      <h1 className="client-funeral-view-title">Funeral Mass Application Details</h1>
      
      {/* Funeral Mass Data Section */}
      <div className="client-funeral-view-data">
        <div className="client-funeral-view-info-card">
          <div className="client-funeral-view-row-date">
            <div className="client-funeral-view-field-date">
              <label>Date of Funeral Mass:</label>
              <div className="client-funeral-view-value">{funeralData.date}</div>
            </div>
            
            <div className="client-funeral-view-field-time">
              <label>Time of Funeral Mass:</label>
              <div className="client-funeral-view-value">{funeralData.time}</div>
            </div>
          </div>

          <div className="client-funeral-view-field-date">
            <label>Name of the Priest:</label>
            <div className="client-funeral-view-value">{funeralData.priest}</div>
          </div>
        </div>
        
        {/* Deceased Information */}
        <div className="client-funeral-view-bypart">
          <h3 className="client-funeral-view-sub-title">Deceased Information</h3>
          <div className="client-funeral-view-info-card">
            <div className="client-funeral-view-row">
              <div className="client-funeral-view-field">
                <label>First Name</label>
                <div className="client-funeral-view-value">{funeralData.deceased.firstName}</div>
              </div>
              <div className="client-funeral-view-field">
                <label>Middle Name</label>
                <div className="client-funeral-view-value">{funeralData.deceased.middleName}</div>
              </div>
              <div className="client-funeral-view-field">
                <label>Last Name</label>
                <div className="client-funeral-view-value">{funeralData.deceased.lastName}</div>
              </div>
              <div className="client-funeral-view-field">
                <label>Gender</label>
                <div className="client-funeral-view-value">{funeralData.deceased.gender}</div>
              </div>
            </div>

            <div className="client-funeral-view-row">
              <div className="client-funeral-view-field-ga">
                <label>Age</label>
                <div className="client-funeral-view-value">{funeralData.deceased.age}</div>
              </div>
              <div className="client-funeral-view-field">
                <label>Date of Birth</label>
                <div className="client-funeral-view-value">{funeralData.deceased.dateOfBirth}</div>
              </div>
              <div className="client-funeral-view-field">
                <label>Date of Death</label>
                <div className="client-funeral-view-value">{funeralData.deceased.dateOfDeath}</div>
              </div>
            </div>
            
            <div className="client-funeral-view-row">
              <div className="client-funeral-view-field">
                <label>Cause of Death</label>
                <div className="client-funeral-view-value">{funeralData.deceased.causeOfDeath}</div>
              </div>
            </div>
            
            <div className="client-funeral-view-row">
              <div className="client-funeral-view-field">
                <label>Wake Location</label>
                <div className="client-funeral-view-value">{funeralData.deceased.wakeLocation}</div>
              </div>
            </div>
            
            <div className="client-funeral-view-row">
              <div className="client-funeral-view-field">
                <label>Burial Location</label>
                <div className="client-funeral-view-value">{funeralData.deceased.burialLocation}</div>
              </div>
            </div>
          </div>
          
          {/* Requester Information */}
          <h3 className="client-funeral-view-sub-title">Requester Information</h3>
          <div className="client-funeral-view-info-card">
            <div className="client-funeral-view-row">
              <div className="client-funeral-view-field">
                <label>First Name</label>
                <div className="client-funeral-view-value">{funeralData.requester.firstName}</div>
              </div>
              <div className="client-funeral-view-field">
                <label>Middle Name</label>
                <div className="client-funeral-view-value">{funeralData.requester.middleName}</div>
              </div>
              <div className="client-funeral-view-field">
                <label>Last Name</label>
                <div className="client-funeral-view-value">{funeralData.requester.lastName}</div>
              </div>
            </div>
            
            <div className="client-funeral-view-row">
              <div className="client-funeral-view-field">
                <label>Relationship to the Deceased</label>
                <div className="client-funeral-view-value">{funeralData.requester.relationship}</div>
              </div>
              <div className="client-funeral-view-field">
                <label>Contact Number</label>
                <div className="client-funeral-view-value">{funeralData.requester.contactNumber}</div>
              </div>
              <div className="client-funeral-view-field">
                <label>Email Address</label>
                <div className="client-funeral-view-value">{funeralData.requester.email}</div>
              </div>
            </div>
          </div>
          
          {/* Address Information */}
          <h3 className="client-funeral-view-sub-title">Address</h3>
          <div className="client-funeral-view-info-card">
            <div className="client-funeral-view-row client-funeral-view-address-row">
            <div className="client-funeral-view-field">
                <label>Barangay</label>
                <div className="client-funeral-view-value">{funeralData.address.barangay}</div>
              </div>
              <div className="client-funeral-view-field">
                <label>Street</label>
                <div className="client-funeral-view-value">{funeralData.address.street}</div>
              </div>
              <div className="client-funeral-view-field">
                <label>Municipality</label>
                <div className="client-funeral-view-value">{funeralData.address.municipality}</div>
              </div>
              <div className="client-funeral-view-field">
                <label>Province</label>
                <div className="client-funeral-view-value">{funeralData.address.province}</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Requirements section */}
        <div className="client-funeral-view-requirements-container">
          <h2 className="client-funeral-view-requirements-title">Requirements</h2>
          <div className="client-funeral-view-requirements-box">
            <h3 className="client-funeral-view-section-header">Documents Needed</h3>
            <div className="client-funeral-view-requirements-list">
              {/* Death Certificate */}
              <div className="client-funeral-view-requirement-item">
                <div className="client-funeral-view-requirement-name">
                  Death Certificate
                </div>
                <div className={`client-funeral-view-status-badge ${
                  funeralData.requirements.death_certificate === 'Submitted' 
                    ? 'client-funeral-view-status-submitted' 
                    : 'client-funeral-view-status-not-submitted'
                }`}>
                  {funeralData.requirements.death_certificate}
                </div>
              </div>
              
              {/* Parish Clearance */}
              <div className="client-funeral-view-requirement-item">
                <div className="client-funeral-view-requirement-name">
                  Parish Clearance (if from another parish)
                </div>
                <div className={`client-funeral-view-status-badge ${
                  funeralData.requirements.parish_clearance === 'Submitted' 
                    ? 'client-funeral-view-status-submitted' 
                    : 'client-funeral-view-status-not-submitted'
                }`}>
                  {funeralData.requirements.parish_clearance}
                </div>
              </div>
              
              {/* Burial Permit */}
              <div className="client-funeral-view-requirement-item">
                <div className="client-funeral-view-requirement-name">
                  Permit to Bury
                </div>
                <div className={`client-funeral-view-status-badge ${
                  funeralData.requirements.burial_permit === 'Submitted' 
                    ? 'client-funeral-view-status-submitted' 
                    : 'client-funeral-view-status-not-submitted'
                }`}>
                  {funeralData.requirements.burial_permit}
                </div>
              </div>
              
              {/* Baptism Certificate */}
              <div className="client-funeral-view-requirement-item">
                <div className="client-funeral-view-requirement-name">
                  Certificate of Baptism
                </div>
                <div className={`client-funeral-view-status-badge ${
                  funeralData.requirements.baptism_cert === 'Submitted' 
                    ? 'client-funeral-view-status-submitted' 
                    : 'client-funeral-view-status-not-submitted'
                }`}>
                  {funeralData.requirements.baptism_cert}
                </div>
              </div>
              
              {/* Confirmation Certificate */}
              <div className="client-funeral-view-requirement-item">
                <div className="client-funeral-view-requirement-name">
                  Certificate of Confirmation
                </div>
                <div className={`client-funeral-view-status-badge ${
                  funeralData.requirements.confirmation_cert === 'Submitted' 
                    ? 'client-funeral-view-status-submitted' 
                    : 'client-funeral-view-status-not-submitted'
                }`}>
                  {funeralData.requirements.confirmation_cert}
                </div>
              </div>
            </div>

            <h3 className="client-funeral-view-section-header">Funeral Setup Requirements</h3>
            <div className="client-funeral-view-info-list">
              <div className="client-funeral-view-info-item">
                <p>Photos/memorial table allowed with limitations (not on the altar)</p>
              </div>
              <div className="client-funeral-view-info-item">
                <p>Eulogies may be given before/after the Mass or at the cemetery</p>
              </div>
              <div className="client-funeral-view-info-item">
                <p>Family and guests should wear respectful and modest attire</p>
              </div>
              <div className="client-funeral-view-info-item">
                <p>No loud music, applause, or improper conduct during the Mass</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientFuneralMassView;