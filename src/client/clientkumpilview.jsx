import React from "react";
import { AiOutlineArrowLeft } from "react-icons/ai"; 
import "./ClientKumpilView.css";

const ClientKumpilView = ({ confirmationData = {} }) => {
  // Sample data structure if no props are passed
  const data = confirmationData.data || {
    date_of_confirmation: "June 15, 2025",
    time_of_confirmation: "10:00 AM",
    priest_name: "Fr. Miguel Santos",
    first_name: "Maria",
    middle_name: "Cruz",
    last_name: "Garcia",
    gender: "Female",
    age: "14",
    date_of_birth: "March 12, 2011",
    date_of_baptism: "April 30, 2011",
    church_of_baptism: "St. Mary's Parish Church",
    place_of_birth: "Cebu City",
    address: {
      barangay: "barangay",
      street: "Rizal Street",
      municipality: "Cebu City",
      province: "Cebu"
    },
    father: {
      first_name: "Roberto",
      middle_name: "Dela",
      last_name: "Garcia",
      dob: "May 8, 1980",
      pob: "Manila",
      education: "College Graduate",
      occupation: "Engineer",
      contact: "09123456789"
    },
    mother: {
      first_name: "Angelica",
      middle_name: "Santos",
      last_name: "Garcia",
      dob: "November 15, 1982",
      pob: "Cebu City",
      education: "College Graduate",
      occupation: "Teacher",
      contact: "09876543210"
    }
  };

  // Requirements status
  const requirements = confirmationData.requirements || {
    baptism_cert: "Submitted",
    birth_cert: "Submitted",
    valid_ids: "Submitted",
    received_sacraments: true,
    age_requirement: true,
    catechism_classes: true,
    confession: true,
    confirmation_retreat: true
  };

  // Function to get appropriate status class
  const getStatusClass = (status) => {
    return status === "Submitted" 
      ? "client-view-submitted" 
      : "client-view-not-submitted";
  };

  // Function to render a checkbox based on status
  const renderCheckbox = (isChecked) => {
    return (
      <div className={`client-view-checkbox ${isChecked ? 'client-view-checked' : ''}`}>
      </div>
    );
  };

  // Function to render document status
  const renderDocumentStatus = (status) => {
    return (
      <div className={`client-view-status ${getStatusClass(status)}`}>
        {status || "Not Submitted"}
      </div>
    );
  };

  return (
    <div className="client-kumpil-view-container">
      {/* Header */}
      <div className="client-kumpil-view-header">
        <div className="client-view-left-section">
          <button className="client-view-back-button" onClick={() => window.history.back()}>
            <AiOutlineArrowLeft className="client-view-back-icon" /> Back
          </button>
        </div>
      </div>
      <h1 className="client-view-title">Confirmation Application Details</h1>
      
      {/* Confirmation Data Section */}
      <div className="client-kumpil-view-data">
        <div className="client-kumpil-view-info-card">
          <div className="client-kumpil-view-row-date">
            <div className="client-kumpil-view-field-date">
              <label>Date of Confirmation:</label>
              <div className="client-view-value">{data.date_of_confirmation}</div>
            </div>
            
            <div className="client-kumpil-view-field-time">
              <label>Time of Confirmation:</label>
              <div className="client-view-value">{data.time_of_confirmation}</div>
            </div>
          </div>

          <div className="client-kumpil-view-field-date">
            <label>Name of the Priest:</label>
            <div className="client-view-value">{data.priest_name}</div>
          </div>
        </div>
        
        <div className="client-view-bypart">
          <h3 className="client-view-sub-title">Personal Information</h3>
          <div className="client-kumpil-view-info-card">
            <div className="client-kumpil-view-row">
              <div className="client-kumpil-view-field">
                <label>First Name</label>
                <div className="client-view-value">{data.first_name}</div>
              </div>
              <div className="client-kumpil-view-field">
                <label>Middle Name</label>
                <div className="client-view-value">{data.middle_name}</div>
              </div>
              <div className="client-kumpil-view-field">
                <label>Last Name</label>
                <div className="client-view-value">{data.last_name}</div>
              </div>
              <div className="client-kumpil-view-field-ga">
                <label>Gender</label>
                <div className="client-view-value">{data.gender}</div>
              </div>
            </div>
            <div className="client-kumpil-view-row">
            <div className="client-kumpil-view-field-ga">
                <label>Age</label>
                <div className="client-view-value">{data.age}</div>
              </div>
              <div className="client-kumpil-view-field">
                <label>Date of Birth</label>
                <div className="client-view-value">{data.date_of_birth}</div>
              </div>
              <div className="client-kumpil-view-field">
                <label>Date of Baptism</label>
                <div className="client-view-value">{data.date_of_baptism}</div>
              </div>
            </div>
            <div className="client-kumpil-view-row">
            <div className="client-kumpil-view-field">
                <label>Church of Baptism</label>
                <div className="client-view-value">{data.church_of_baptism}</div>
              </div>
              <div className="client-kumpil-view-field">
                <label>Place of Birth</label>
                <div className="client-view-value">{data.place_of_birth}</div>
              </div>
            </div>
            
            {/* Address Fields */}
            <div className="client-kumpil-view-row">
            <div className="client-kumpil-view-field">
                <label>Barangay</label>
                <div className="client-view-value">{data.address.barangay}</div>
              </div>
              <div className="client-kumpil-view-field">
                <label>Street</label>
                <div className="client-view-value">{data.address.street}</div>
              </div>
              <div className="client-kumpil-view-field">
                <label>Municipality</label>
                <div className="client-view-value">{data.address.municipality}</div>
              </div>
              <div className="client-kumpil-view-field">
                <label>Province</label>
                <div className="client-view-value">{data.address.province}</div>
              </div>
            </div>
          </div>
          
          {/* Father's Information */}
          <h3 className="client-view-sub-title">Father's Information</h3>
          <div className="client-kumpil-view-info-card">
            <div className="client-kumpil-view-row">
              <div className="client-kumpil-view-field">
                <label>First Name</label>
                <div className="client-view-value">{data.father.first_name}</div>
              </div>
              <div className="client-kumpil-view-field">
                <label>Middle Name</label>
                <div className="client-view-value">{data.father.middle_name}</div>
              </div>
              <div className="client-kumpil-view-field">
                <label>Last Name</label>
                <div className="client-view-value">{data.father.last_name}</div>
              </div>
            </div>
            <div className="client-kumpil-view-row">
              <div className="client-kumpil-view-field-pob">
                <label>Date of Birth</label>
                <div className="client-view-value">{data.father.dob}</div>
              </div>
              <div className="client-kumpil-view-field">
                <label>Place of Birth</label>
                <div className="client-view-value">{data.father.pob}</div>
              </div>
            </div>
            <div className="client-kumpil-view-row">
              <div className="client-kumpil-view-field">
                <label>Educational Attainment</label>
                <div className="client-view-value">{data.father.education}</div>
              </div>
              <div className="client-kumpil-view-field">
                <label>Occupation</label>
                <div className="client-view-value">{data.father.occupation}</div>
              </div>
              <div className="client-kumpil-view-field">
                <label>Contact Number</label>
                <div className="client-view-value">{data.father.contact}</div>
              </div>
            </div>
          </div>
          
          {/* Mother's Information */}
          <h3 className="client-view-sub-title">Mother's Information</h3>
          <div className="client-kumpil-view-info-card">
            <div className="client-kumpil-view-row">
              <div className="client-kumpil-view-field">
                <label>First Name</label>
                <div className="client-view-value">{data.mother.first_name}</div>
              </div>
              <div className="client-kumpil-view-field">
                <label>Middle Name</label>
                <div className="client-view-value">{data.mother.middle_name}</div>
              </div>
              <div className="client-kumpil-view-field">
                <label>Last Name</label>
                <div className="client-view-value">{data.mother.last_name}</div>
              </div>
            </div>
            <div className="client-kumpil-view-row">
              <div className="client-kumpil-view-field-pob">
                <label>Date of Birth</label>
                <div className="client-view-value">{data.mother.dob}</div>
              </div>
              <div className="client-kumpil-view-field">
                <label>Place of Birth</label>
                <div className="client-view-value">{data.mother.pob}</div>
              </div>
            </div>
            <div className="client-kumpil-view-row">
              <div className="client-kumpil-view-field">
                <label>Educational Attainment</label>
                <div className="client-view-value">{data.mother.education}</div>
              </div>
              <div className="client-kumpil-view-field">
                <label>Occupation</label>
                <div className="client-view-value">{data.mother.occupation}</div>
              </div>
              <div className="client-kumpil-view-field">
                <label>Contact Number</label>
                <div className="client-view-value">{data.mother.contact}</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Requirements section - Updated to match ClientBaptismView.jsx */}
        <div className="client-requirements-view-container">
          <h2 className="client-requirements-view-title">Requirements</h2>
          <div className="client-requirements-view-box">
            <h3 className="client-view-section-header">Documents Status</h3>
            <div className="client-view-checkbox-list">
              {/* Baptism Certificate */}
              <div className="client-requirement-view-item">
                <div className="client-view-requirement-name">
                  Baptism Certificate (Proof of Catholic Baptism)
                </div>
                {renderDocumentStatus(requirements.baptism_cert)}
              </div>
              
              {/* Birth Certificate */}
              <div className="client-requirement-view-item">
                <div className="client-view-requirement-name">
                  Birth Certificate (PSA or Local Civil Registrar Copy)
                </div>
                {renderDocumentStatus(requirements.birth_cert)}
              </div>
              
              {/* Valid IDs */}
              <div className="client-requirement-view-item">
                <div className="client-view-requirement-name">
                  Valid IDs of Candidate, Parents, and Sponsor
                </div>
                {renderDocumentStatus(requirements.valid_ids)}
              </div>
            </div>

            <h3 className="client-view-section-header">Requirements for Candidate</h3>
            <div className="client-info-view-list">
              <div className="client-info-view-item">
                <div className="client-view-req-label">
                  <p>Must have received the Sacraments of Baptism and Holy Eucharist</p>
                </div>
              </div>
              <div className="client-info-view-item">
                <div className="client-view-req-label">
                  <p>Must be at least 12 years old (Age requirement may vary by parish)</p>
                </div>
              </div>
              <div className="client-info-view-item">
                <div className="client-view-req-label">
                  <p>Must attend Catechism Classes or Confirmation Seminar</p>
                </div>
              </div>
              <div className="client-info-view-item">
                <div className="client-view-req-label">
                  <p>Must receive the Sacrament of Confession before Confirmation</p>
                </div>
              </div>
              <div className="client-info-view-item">
                <div className="client-view-req-label">
                  <p>Must attend a Confirmation Retreat (if required by parish)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientKumpilView;