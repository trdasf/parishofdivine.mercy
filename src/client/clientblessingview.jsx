import React from "react";
import { AiOutlineArrowLeft } from "react-icons/ai";
import "./ClientBlessingView.css";

const ClientBlessingView = ({ blessingData = {} }) => {
  // Default data for demonstration if none is provided
  const data = {
    preferredDate: "2025-05-15",
    preferredTime: "10:00",
    priestName: "Fr. John Doe",
    firstName: "Maria",
    middleName: "Santos",
    lastName: "Garcia",
    gender: "Female",
    age: "35",
    dateOfBirth: "1990-03-12",
    contactNumber: "09123456789",
    emailAddress: "maria.garcia@example.com",
    barangay: "barangay",
    street: "123 Main St.",
    municipality: "Makati City",
    province: "Metro Manila",
    blessingType: "house",
    location: "456 New Home Street, Makati City",
    purpose: "New Home Blessing",
    notes: "Family would like to have the blessing before moving in.",
    ...blessingData
  };

  // Define requirements statuses
  const requirementsStatus = {
    valid_id: "Submitted",
    proof_of_ownership: "Submitted",
    barangay_clearance: "Not Submitted",
    business_permit: "Submitted",
    vehicle_registration: "Not Submitted"
  };

  // Function to render requirements based on blessing type
  const renderRequirements = () => {
    // Create requirements based on blessing type
    switch(data.blessingType) {
      case "house":
        return (
          <>
            <h3 className="client-blessing-view-section-header">Documents Needed</h3>
            <div className="client-blessing-view-requirements-list">
              {/* Valid ID */}
              <div className="client-blessing-view-requirement-item">
                <div className="client-blessing-view-requirement-name">
                  Valid ID of the Requester
                </div>
                <div className={`client-blessing-view-status-badge client-blessing-view-status-${requirementsStatus.valid_id === 'Submitted' ? 'submitted' : 'not-submitted'}`}>
                  {requirementsStatus.valid_id}
                </div>
              </div>
              
              {/* Proof of Ownership */}
              <div className="client-blessing-view-requirement-item">
                <div className="client-blessing-view-requirement-name">
                  Proof of Ownership
                </div>
                <div className={`client-blessing-view-status-badge client-blessing-view-status-${requirementsStatus.proof_of_ownership === 'Submitted' ? 'submitted' : 'not-submitted'}`}>
                  {requirementsStatus.proof_of_ownership}
                </div>
              </div>
              
              {/* Barangay Clearance */}
              <div className="client-blessing-view-requirement-item">
                <div className="client-blessing-view-requirement-name">
                  Barangay Clearance
                </div>
                <div className={`client-blessing-view-status-badge client-blessing-view-status-${requirementsStatus.barangay_clearance === 'Submitted' ? 'submitted' : 'not-submitted'}`}>
                  {requirementsStatus.barangay_clearance}
                </div>
              </div>
            </div>

            <h3 className="client-blessing-view-section-header">House Blessing Requirements</h3>
            <div className="client-blessing-view-info-list">
              <div className="client-blessing-view-info-item">
                <p>The house must be <strong>ready for occupancy</strong></p>
              </div>
              <div className="client-blessing-view-info-item">
                <p>All <strong>family members should be present</strong> if possible</p>
              </div>
              <div className="client-blessing-view-info-item">
                <p>Prepare basic blessing items</p>
              </div>
              <div className="client-blessing-view-info-item">
                <p>Some parishes ask that you <strong>belong to the parish community</strong> or register in the parish</p>
              </div>
            </div>
          </>
        );
      
      case "business":
        return (
          <>
            <h3 className="client-blessing-view-section-header">Documents Needed</h3>
            <div className="client-blessing-view-requirements-list">
              {/* Business Permit / DTI Registration */}
              <div className="client-blessing-view-requirement-item">
                <div className="client-blessing-view-requirement-name">
                  Business Permit / DTI Registration
                </div>
                <div className={`client-blessing-view-status-badge client-blessing-view-status-${requirementsStatus.business_permit === 'Submitted' ? 'submitted' : 'not-submitted'}`}>
                  {requirementsStatus.business_permit}
                </div>
              </div>
            </div>

            <h3 className="client-blessing-view-section-header">Business Blessing Requirements</h3>
            <div className="client-blessing-view-info-list">
              <div className="client-blessing-view-info-item">
                <p>Business must have the <strong>necessary permits</strong> (may be checked informally)</p>
              </div>
              <div className="client-blessing-view-info-item">
                <p>Owner or authorized representative must be present</p>
              </div>
              <div className="client-blessing-view-info-item">
                <p>Staff may be included in prayer or ceremony</p>
              </div>
            </div>
          </>
        );
      
      case "car":
        return (
          <>
            <h3 className="client-blessing-view-section-header">Documents Needed</h3>
            <div className="client-blessing-view-requirements-list">
              {/* Vehicle OR/CR */}
              <div className="client-blessing-view-requirement-item">
                <div className="client-blessing-view-requirement-name">
                  Vehicle OR/CR (Official Receipt / Certificate of Registration) if required
                </div>
                <div className={`client-blessing-view-status-badge client-blessing-view-status-${requirementsStatus.vehicle_registration === 'Submitted' ? 'submitted' : 'not-submitted'}`}>
                  {requirementsStatus.vehicle_registration}
                </div>
              </div>
            </div>

            <h3 className="client-blessing-view-section-header">Car Blessing Requirements</h3>
            <div className="client-blessing-view-info-list">
              <div className="client-blessing-view-info-item">
                <p>Must bring the <strong>actual vehicle</strong> to the venue or church</p>
              </div>
              <div className="client-blessing-view-info-item">
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
    <div className="client-blessing-view-container">
      {/* Header */}
      <div className="client-blessing-view-header">
        <div className="client-blessing-view-left-section">
          <button className="client-blessing-view-back-button" onClick={() => window.history.back()}>
            <AiOutlineArrowLeft className="client-blessing-view-back-icon" /> Back
          </button>
        </div>
      </div>
      <h1 className="client-blessing-view-title">Blessing Ceremony Application Details</h1>
      
      {/* Blessing Data Section */}
      <div className="client-blessing-view-data">
        <div className="client-blessing-view-info-card">
          <div className="client-blessing-view-row-date">
            <div className="client-blessing-view-field-date">
              <label>Preferred Date of Blessing Ceremony:</label>
              <div className="client-blessing-view-value">{data.preferredDate}</div>
            </div>
            
            <div className="client-blessing-view-field-time">
              <label>Preferred Time of Blessing Ceremony:</label>
              <div className="client-blessing-view-value">{data.preferredTime}</div>
            </div>
          </div>

          <div className="client-blessing-view-field-date">
            <label>Name of the Priest:</label>
            <div className="client-blessing-view-value">{data.priestName}</div>
          </div>
        </div>
        
        <div className="client-blessing-view-bypart">
          <h2 className="client-blessing-view-sub-title">Personal Information</h2>
          
          <div className="client-blessing-view-info-card">
            <div className="client-blessing-view-row">
              <div className="client-blessing-view-field">
                <label>First Name</label>
                <div className="client-blessing-view-value">{data.firstName}</div>
              </div>
              <div className="client-blessing-view-field">
                <label>Middle Name</label>
                <div className="client-blessing-view-value">{data.middleName}</div>
              </div>
              <div className="client-blessing-view-field">
                <label>Last Name</label>
                <div className="client-blessing-view-value">{data.lastName}</div>
              </div>
            </div>

            <div className="client-blessing-view-row">
              <div className="client-blessing-view-field">
                <label>Gender</label>
                <div className="client-blessing-view-value">{data.gender}</div>
              </div>
              <div className="client-blessing-view-field">
                <label>Age</label>
                <div className="client-blessing-view-value">{data.age}</div>
              </div>
              <div className="client-blessing-view-field">
                <label>Date of Birth</label>
                <div className="client-blessing-view-value">{data.dateOfBirth}</div>
              </div>
            </div>

            <div className="client-blessing-view-row">
              <div className="client-blessing-view-field">
                <label>Contact Number</label>
                <div className="client-blessing-view-value">{data.contactNumber}</div>
              </div>
              <div className="client-blessing-view-field">
                <label>Email Address</label>
                <div className="client-blessing-view-value">{data.emailAddress}</div>
              </div>
            </div>
            
            <div className="client-blessing-view-row client-blessing-view-address-row">
            <div className="client-blessing-view-field">
                <label>Barangay</label>
                <div className="client-blessing-view-value">{data.barangay}</div>
              </div>
              <div className="client-blessing-view-field">
                <label>Street</label>
                <div className="client-blessing-view-value">{data.street}</div>
              </div>
              <div className="client-blessing-view-field">
                <label>Municipality</label>
                <div className="client-blessing-view-value">{data.municipality}</div>
              </div>
              <div className="client-blessing-view-field">
                <label>Province</label>
                <div className="client-blessing-view-value">{data.province}</div>
              </div>
            </div>
          </div>

          <h2 className="client-blessing-view-sub-title">Blessing Details</h2>
          
          <div className="client-blessing-view-info-card">
            <div className="client-blessing-view-row">
              <div className="client-blessing-view-field">
                <label>Blessing Type</label>
                <div className="client-blessing-view-value">
                  {data.blessingType.charAt(0).toUpperCase() + data.blessingType.slice(1)} Blessing
                </div>
              </div>
              <div className="client-blessing-view-field">
                <label>Location</label>
                <div className="client-blessing-view-value">{data.location}</div>
              </div>
            </div>

            <div className="client-blessing-view-row">
              <div className="client-blessing-view-field">
                <label>Purpose</label>
                <div className="client-blessing-view-value">{data.purpose}</div>
              </div>
            </div>

            <div className="client-blessing-view-row">
              <div className="client-blessing-view-field">
                <label>Notes</label>
                <div className="client-blessing-view-value">{data.notes || "No additional notes provided."}</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Requirements section */}
        <div className="client-blessing-view-requirements-container">
          <h2 className="client-blessing-view-requirements-title">Requirements</h2>
          <div className="client-blessing-view-requirements-box">
            {renderRequirements()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientBlessingView;