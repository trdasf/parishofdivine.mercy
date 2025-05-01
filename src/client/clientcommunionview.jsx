import React from "react";
import { AiOutlineArrowLeft } from "react-icons/ai"; 
import "./ClientCommunionView.css";

const ClientCommunionView = () => {
  // Sample data for view mode
  const communionData = {
    date: "June 15, 2025",
    time: "9:00 AM",
    priestName: "Fr. Michael Rodriguez",
    childInfo: {
      firstName: "Maria",
      middleName: "Elena",
      lastName: "Santos",
      gender: "Female",
      age: "8",
      dateOfBirth: "March 10, 2017",
      dateOfBaptism: "April 15, 2017",
      churchOfBaptism: "St. Peter's Parish",
      placeOfBirth: "Manila City Hospital",
      address: {
        barangay: "barangay 1",
        street: "123 Maple Street",
        municipality: "Quezon City",
        province: "Metro Manila"
      }
    },
    fatherInfo: {
      firstName: "Juan",
      middleName: "Carlos",
      lastName: "Santos",
      dateOfBirth: "May 5, 1985",
      placeOfBirth: "Cebu City",
      education: "Bachelor's Degree",
      occupation: "Engineer",
      contactNumber: "0917-123-4567"
    },
    motherInfo: {
      firstName: "Ana",
      middleName: "Marie",
      lastName: "Reyes",
      dateOfBirth: "September 12, 1987",
      placeOfBirth: "Makati City",
      education: "Master's Degree",
      occupation: "Teacher",
      contactNumber: "0918-765-4321"
    },
    requirements: {
      baptismalCert: "Submitted",
      firstCommunionCert: "Not Submitted",
      birthCert: "Submitted"
    }
  };

  // Render view-only status
  const renderStatus = (status) => {
    const isSubmitted = status === "Submitted";
    
    return (
      <div className={`client-communion-view-status ${isSubmitted ? 'client-communion-view-submitted' : 'client-communion-view-not-submitted'}`}>
        {status}
      </div>
    );
  };

  return (
    <div className="client-communion-view-container">
      {/* Header */}
      <div className="client-communion-view-header">
        <div className="client-view-left-section">
          <button className="client-view-back-button" onClick={() => window.history.back()}>
            <AiOutlineArrowLeft className="client-view-back-icon" /> Back
          </button>
        </div>
      </div>
      <h1 className="client-view-title">Holy Communion Application Details</h1>
      
      {/* Holy Communion Data Section */}
      <div className="client-communion-view-data">
        <div className="client-communion-view-info-card">
          <div className="client-communion-view-row-date">
            <div className="client-communion-view-field-date">
              <label>Date of Holy Communion:</label>
              <div className="client-view-value">{communionData.date}</div>
            </div>
            
            <div className="client-communion-view-field-time">
              <label>Time of Holy Communion:</label>
              <div className="client-view-value">{communionData.time}</div>
            </div>
          </div>

          <div className="client-communion-view-field-date">
            <label>Name of the Priest:</label>
            <div className="client-view-value">{communionData.priestName}</div>
          </div>
        </div>
        
        <div className="client-view-bypart">
          <h3 className="client-view-sub-title">Child's Information</h3>
          <div className="client-communion-view-info-card">
            <div className="client-communion-view-row">
              <div className="client-communion-view-field">
                <label>First Name</label>
                <div className="client-view-value">{communionData.childInfo.firstName}</div>
              </div>
              <div className="client-communion-view-field">
                <label>Middle Name</label>
                <div className="client-view-value">{communionData.childInfo.middleName}</div>
              </div>
              <div className="client-communion-view-field">
                <label>Last Name</label>
                <div className="client-view-value">{communionData.childInfo.lastName}</div>
              </div>
              <div className="client-communion-view-field">
                <label>Gender</label>
                <div className="client-view-value">{communionData.childInfo.gender}</div>
              </div>
            </div>

            <div className="client-communion-view-row">
            <div className="client-communion-view-field-ga">
                <label>Age</label>
                <div className="client-view-value">{communionData.childInfo.age}</div>
              </div>
              <div className="client-communion-view-field">
                <label>Date of Birth</label>
                <div className="client-view-value">{communionData.childInfo.dateOfBirth}</div>
              </div>
              <div className="client-communion-view-field">
                <label>Date of Baptism</label>
                <div className="client-view-value">{communionData.childInfo.dateOfBaptism}</div>
              </div>
            </div>
            
            <div className="client-communion-view-row">
            <div className="client-communion-view-field">
                <label>Church of Baptism</label>
                <div className="client-view-value">{communionData.childInfo.churchOfBaptism}</div>
              </div>
              <div className="client-communion-view-field">
                <label>Place of Birth</label>
                <div className="client-view-value">{communionData.childInfo.placeOfBirth}</div>
              </div>
            </div>
            
            <div className="client-communion-view-row">
            <div className="client-communion-view-field">
                <label>Barangay</label>
                <div className="client-view-value">{communionData.childInfo.address.barangay}</div>
              </div>
              <div className="client-communion-view-field">
                <label>Street</label>
                <div className="client-view-value">{communionData.childInfo.address.street}</div>
              </div>
              <div className="client-communion-view-field">
                <label>Municipality</label>
                <div className="client-view-value">{communionData.childInfo.address.municipality}</div>
              </div>
              <div className="client-communion-view-field">
                <label>Province</label>
                <div className="client-view-value">{communionData.childInfo.address.province}</div>
              </div>
            </div>
          </div>

          {/* Father's Information */}
          <h3 className="client-view-sub-title">Father's Information</h3>
          <div className="client-communion-view-info-card">
            <div className="client-communion-view-row">
              <div className="client-communion-view-field">
                <label>Father's First Name</label>
                <div className="client-view-value">{communionData.fatherInfo.firstName}</div>
              </div>
              <div className="client-communion-view-field">
                <label>Father's Middle Name</label>
                <div className="client-view-value">{communionData.fatherInfo.middleName}</div>
              </div>
              <div className="client-communion-view-field">
                <label>Father's Last Name</label>
                <div className="client-view-value">{communionData.fatherInfo.lastName}</div>
              </div>
            </div>
            
            <div className="client-communion-view-row">
              <div className="client-communion-view-field">
                <label>Father's Date of Birth</label>
                <div className="client-view-value">{communionData.fatherInfo.dateOfBirth}</div>
              </div>
              <div className="client-communion-view-field">
                <label>Father's Place of Birth</label>
                <div className="client-view-value">{communionData.fatherInfo.placeOfBirth}</div>
              </div>
            </div>
            
            <div className="client-communion-view-row">
              <div className="client-communion-view-field">
                <label>Father's Educational Attainment</label>
                <div className="client-view-value">{communionData.fatherInfo.education}</div>
              </div>
              <div className="client-communion-view-field">
                <label>Father's Occupation</label>
                <div className="client-view-value">{communionData.fatherInfo.occupation}</div>
              </div>
              <div className="client-communion-view-field">
                <label>Father's Contact Number</label>
                <div className="client-view-value">{communionData.fatherInfo.contactNumber}</div>
              </div>
            </div>
          </div>
          
          {/* Mother's Information */}
          <h3 className="client-view-sub-title">Mother's Information</h3>
          <div className="client-communion-view-info-card">
            <div className="client-communion-view-row">
              <div className="client-communion-view-field">
                <label>Mother's First Name</label>
                <div className="client-view-value">{communionData.motherInfo.firstName}</div>
              </div>
              <div className="client-communion-view-field">
                <label>Mother's Middle Name</label>
                <div className="client-view-value">{communionData.motherInfo.middleName}</div>
              </div>
              <div className="client-communion-view-field">
                <label>Mother's Last Name</label>
                <div className="client-view-value">{communionData.motherInfo.lastName}</div>
              </div>
            </div>
            
            <div className="client-communion-view-row">
              <div className="client-communion-view-field">
                <label>Mother's Date of Birth</label>
                <div className="client-view-value">{communionData.motherInfo.dateOfBirth}</div>
              </div>
              <div className="client-communion-view-field">
                <label>Mother's Place of Birth</label>
                <div className="client-view-value">{communionData.motherInfo.placeOfBirth}</div>
              </div>
            </div>
            
            <div className="client-communion-view-row">
              <div className="client-communion-view-field">
                <label>Mother's Educational Attainment</label>
                <div className="client-view-value">{communionData.motherInfo.education}</div>
              </div>
              <div className="client-communion-view-field">
                <label>Mother's Occupation</label>
                <div className="client-view-value">{communionData.motherInfo.occupation}</div>
              </div>
              <div className="client-communion-view-field">
                <label>Mother's Contact Number</label>
                <div className="client-view-value">{communionData.motherInfo.contactNumber}</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Requirements section */}
        <div className="client-requirements-view-container">
          <h2 className="client-requirements-view-title">Requirements</h2>
          <div className="client-requirements-view-box">
            <h3 className="client-view-section-header">Documents Status</h3>
            <div className="client-view-checkbox-list">
              {/* Baptismal Certificate */}
              <div className="client-requirement-view-item">
                <div className="client-view-req-label">
                  <span className="client-view-requirement-name">Baptismal Certificate (Proof of Catholic Baptism)</span>
                </div>
                {renderStatus(communionData.requirements.baptismalCert)}
              </div>
              
              {/* First Communion Certificate */}
              <div className="client-requirement-view-item">
                <div className="client-view-req-label">
                  <span className="client-view-requirement-name">First Communion Certificate (If applicable, for record purposes)</span>
                </div>
                {renderStatus(communionData.requirements.firstCommunionCert)}
              </div>
              
              {/* Birth Certificate */}
              <div className="client-requirement-view-item">
                <div className="client-view-req-label">
                  <span className="client-view-requirement-name">Birth Certificate (For age verification, required in some parishes)</span>
                </div>
                {renderStatus(communionData.requirements.birthCert)}
              </div>
            </div>

            <h3 className="client-view-section-header">Requirements for Candidate</h3>
            <div className="client-info-view-list">
              <div className="client-info-view-item">
                <p>Must be a baptized Catholic</p>
              </div>
              <div className="client-info-view-item">
                <p>Must have reached the age of reason (usually around 7 years old)</p>
              </div>
              <div className="client-info-view-item">
                <p>Must have received the Sacrament of Reconciliation (Confession) before First Communion</p>
              </div>
              <div className="client-info-view-item">
                <p>Must attend a First Communion Catechesis or Religious Instruction Program</p>
              </div>
              <div className="client-info-view-item">
                <p>Must understand the significance of the Holy Eucharist and believe in the real presence of Christ in the sacrament</p>
              </div>
              <div className="client-info-view-item">
                <p>Must attend a First Communion Retreat (if required by the parish)</p>
              </div>
            </div>

            <h3 className="client-view-section-header">Parish Requirements</h3>
            <div className="client-info-view-list">
              <div className="client-info-view-item">
                <p>Must be registered in the parish where First Communion will be received</p>
              </div>
              <div className="client-info-view-item">
                <p>Must attend the required preparation classes and rehearsals</p>
              </div>
              <div className="client-info-view-item">
                <p>Must participate in a First Communion Retreat (if required by the parish)</p>
              </div>
            </div>

            <h3 className="client-view-section-header">Dress Code (If Specified by Parish)</h3>
            <div className="client-info-view-list">
              <div className="client-info-view-item">
                <p>Boys: White polo or barong, black pants, and formal shoes</p>
              </div>
              <div className="client-info-view-item">
                <p>Girls: White dress with sleeves (modest), white veil (optional), and formal shoes</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientCommunionView;