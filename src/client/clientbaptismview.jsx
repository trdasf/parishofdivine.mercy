import React from "react";
import { AiOutlineArrowLeft } from "react-icons/ai"; 
import "./ClientBaptismView.css";

const ClientBaptismView = () => {
  // Sample data (in a real app, this would come from props or API)
  const baptismData = {
    date: "May 15, 2025",
    time: "10:00 AM",
    priest: "Fr. John Smith",
    child: {
      firstName: "Maria",
      middleName: "Santos",
      lastName: "Cruz",
      gender: "Female",
      age: "1",
      dateOfBirth: "April 10, 2024",
      placeOfBirth: "St. Luke's Medical Center, Manila"
    },
    father: {
      firstName: "Roberto",
      middleName: "Garcia",
      lastName: "Cruz",
      placeOfBirth: "Quezon City",
      dateOfBirth: "June 5, 1990",
      education: "College Graduate",
      occupation: "Software Engineer",
      contact: "0917-123-4567"
    },
    mother: {
      firstName: "Elena",
      middleName: "Reyes",
      lastName: "Cruz",
      placeOfBirth: "Makati City",
      dateOfBirth: "August 12, 1992",
      education: "College Graduate",
      occupation: "Accountant",
      contact: "0918-765-4321"
    },
    maritalStatus: {
      type: "Catholic", // Catholic, Civil, or Living Together
      yearsMarried: "4"
    },
    address: {
      street: "123 Sampaguita St.",
      municipality: "Quezon City",
      province: "Metro Manila"
    },
    godParents: [
      {
        name: "Antonio Mendoza",
        sacraments: "Baptism, Confirmation",
        address: "456 Orchid St., Pasig City"
      },
      {
        name: "Maria Lourdes Santos",
        sacraments: "Baptism, Confirmation",
        address: "789 Rose St., Mandaluyong City"
      }
    ],
    requirements: {
      birthCert: {
        submitted: true,
        fileName: "BirthCertificate_MariaCruz.pdf"
      },
      marriageCert: {
        submitted: true,
        fileName: "MarriageCertificate_RobertoElena.pdf"
      },
      validIds: {
        submitted: true,
        fileName: "ValidIDs_AllParties.pdf"
      }
    }
  };

  // Function to render read-only input field
  const renderReadOnlyField = (value) => {
    return <div className="client-view-value">{value || "N/A"}</div>;
  };

  // Function to render document status
  const renderDocumentStatus = (isSubmitted, fileName) => {
    return (
      <div className={`client-view-status ${isSubmitted ? 'client-view-submitted' : 'client-view-not-submitted'}`}>
        {isSubmitted ? `Submitted: ${fileName}` : "Not Submitted"}
      </div>
    );
  };

  return (
    <div className="client-baptism-view-container">
      {/* Header */}
      <div className="client-baptism-view-header">
        <div className="client-view-left-section">
          <button className="client-view-back-button" onClick={() => window.history.back()}>
            <AiOutlineArrowLeft className="client-view-back-icon" /> Back
          </button>
        </div>
      </div>
      <h1 className="client-view-title">Baptism Application Details</h1>
      
      {/* Baptismal Data Section */}
      <div className="client-baptismal-view-data">
        <div className="client-baptismal-view-row-date">
          <div className="client-baptismal-view-field-date">
            <label>Date of Baptism:</label>
            {renderReadOnlyField(baptismData.date)}
          </div>
          
          <div className="client-baptismal-view-field-time">
            <label>Time of Baptism:</label>
            {renderReadOnlyField(baptismData.time)}
          </div>
        </div>

        <div className="client-baptismal-view-field-date">
          <label>Name of the Priest:</label>
          {renderReadOnlyField(baptismData.priest)}
        </div>
        
        <div className="client-view-bypart">
          <h3 className="client-view-sub-title">Baptism Information</h3>
          <div className="client-baptismal-view-info-card">
            <div className="client-baptismal-view-row">
              <div className="client-baptismal-view-field">
                <label>First Name of the Baptized:</label>
                {renderReadOnlyField(baptismData.child.firstName)}
              </div>
              <div className="client-baptismal-view-field">
                <label>Middle Name of the Baptized:</label>
                {renderReadOnlyField(baptismData.child.middleName)}
              </div>
              <div className="client-baptismal-view-field">
                <label>Last Name of the Baptized:</label>
                {renderReadOnlyField(baptismData.child.lastName)}
              </div>
              <div className="client-baptismal-view-field">
                <label>Gender:</label>
                {renderReadOnlyField(baptismData.child.gender)}
              </div>
            </div>
            
            <div className="client-baptismal-view-row">
              <div className="client-baptismal-view-field-ga">
                <label>Age:</label>
                {renderReadOnlyField(baptismData.child.age)}
              </div>
              <div className="client-baptismal-view-field-ga">
                <label>Date of Birth:</label>
                {renderReadOnlyField(baptismData.child.dateOfBirth)}
              </div>
              <div className="client-baptismal-view-field">
                <label>Place of Birth:</label>
                {renderReadOnlyField(baptismData.child.placeOfBirth)}
              </div>
            </div>
          </div>

          {/* Father's Information */}
          <h3 className="client-view-sub-title">Father Information</h3>
          <div className="client-baptismal-view-info-card">
            <div className="client-baptismal-view-row">
              <div className="client-baptismal-view-field">
                <label>Father's First Name:</label>
                {renderReadOnlyField(baptismData.father.firstName)}
              </div>
              <div className="client-baptismal-view-field">
                <label>Father's Middle Name:</label>
                {renderReadOnlyField(baptismData.father.middleName)}
              </div>
              <div className="client-baptismal-view-field">
                <label>Father's Last Name:</label>
                {renderReadOnlyField(baptismData.father.lastName)}
              </div>
            </div>
            
            <div className="client-baptismal-view-row">
              <div className="client-baptismal-view-field">
                <label>Father's Place of Birth:</label>
                {renderReadOnlyField(baptismData.father.placeOfBirth)}
              </div>
              <div className="client-baptismal-view-field-fpob">
                <label>Father's Date of Birth:</label>
                {renderReadOnlyField(baptismData.father.dateOfBirth)}
              </div>
            </div>

            <div className="client-baptismal-view-row">
              <div className="client-baptismal-view-field">
                <label>Father's Educational Attainment:</label>
                {renderReadOnlyField(baptismData.father.education)}
              </div>
              <div className="client-baptismal-view-field">
                <label>Father's Occupation:</label>
                {renderReadOnlyField(baptismData.father.occupation)}
              </div>
              <div className="client-baptismal-view-field">
                <label>Father's Contact Number:</label>
                {renderReadOnlyField(baptismData.father.contact)}
              </div>
            </div>
          </div>
          
          <h3 className="client-view-sub-title">Mother Information</h3>
          {/* Mother's Information */}
          <div className="client-baptismal-view-info-card">
            <div className="client-baptismal-view-row">
              <div className="client-baptismal-view-field">
                <label>Mother's First Name:</label>
                {renderReadOnlyField(baptismData.mother.firstName)}
              </div>
              <div className="client-baptismal-view-field">
                <label>Mother's Middle Name:</label>
                {renderReadOnlyField(baptismData.mother.middleName)}
              </div>
              <div className="client-baptismal-view-field">
                <label>Mother's Last Name:</label>
                {renderReadOnlyField(baptismData.mother.lastName)}
              </div>
            </div>

            <div className="client-baptismal-view-row">
              <div className="client-baptismal-view-field">
                <label>Mother's Place of Birth:</label>
                {renderReadOnlyField(baptismData.mother.placeOfBirth)}
              </div>
              <div className="client-baptismal-view-field-fpob">
                <label>Mother's Date of Birth:</label>
                {renderReadOnlyField(baptismData.mother.dateOfBirth)}
              </div>
            </div>

            <div className="client-baptismal-view-row">
              <div className="client-baptismal-view-field">
                <label>Mother's Educational Attainment:</label>
                {renderReadOnlyField(baptismData.mother.education)}
              </div>
              <div className="client-baptismal-view-field">
                <label>Mother's Occupation:</label>
                {renderReadOnlyField(baptismData.mother.occupation)}
              </div>
              <div className="client-baptismal-view-field">
                <label>Mother's Contact Number:</label>
                {renderReadOnlyField(baptismData.mother.contact)}
              </div>
            </div>
          </div>
          
          <h3 className="client-view-sub-title">Parents Marital Status</h3>
          <div className="client-baptismal-view-info-card">
            <div className="client-baptismal-view-row-pms">
              <div className="client-marital-view-status">
                <label className="client-view-section-label">Parents' marital status:</label>
                <div className="client-marital-view-options">
                  <div className="client-view-pms-label">
                    <span className={`client-view-checkbox ${baptismData.maritalStatus.type === 'Catholic' ? 'client-view-checked' : ''}`}></span>
                    <label>Catholic</label>
                  </div>
                  <div className="client-view-pms-label">
                    <span className={`client-view-checkbox ${baptismData.maritalStatus.type === 'Civil' ? 'client-view-checked' : ''}`}></span>
                    <label>Civil</label>
                  </div>
                  <div className="client-view-pms-label">
                    <span className={`client-view-checkbox ${baptismData.maritalStatus.type === 'Living Together' ? 'client-view-checked' : ''}`}></span>
                    <label>Living Together</label>
                  </div>
                </div>
              </div>

              <div className="client-years-view-married">
                <label>Number of Years Married: </label>
                <span className="client-view-years">{baptismData.maritalStatus.yearsMarried}</span>
              </div>
            </div>
          
            {/* Address Fields - As read-only displays */}
            <div className="client-baptismal-view-row client-address-view-row">
            <div className="client-baptismal-view-field">
                <label>Barangay:</label>
                {renderReadOnlyField(baptismData.address.barangay)}
              </div>
              <div className="client-baptismal-view-field">
                <label>Street:</label>
                {renderReadOnlyField(baptismData.address.street)}
              </div>
              <div className="client-baptismal-view-field">
                <label>Municipality:</label>
                {renderReadOnlyField(baptismData.address.municipality)}
              </div>
              <div className="client-baptismal-view-field">
                <label>Province:</label>
                {renderReadOnlyField(baptismData.address.province)}
              </div>
            </div>
          </div>
          
          <div className="client-view-bypart">
            <h3 className="client-view-sub-title">Godparents Information</h3>
            <div className="client-baptismal-view-info-card">
            {baptismData.godParents.map((godparent, index) => (
              <div key={index} className="client-godparent-item">
                <h4 className="client-baptismal-view-godparent-header">
                  {index === 0 ? "Godfather (Ninong)" : "Godmother (Ninang)"}
                </h4>
                <div className="client-baptismal-view-row">
                  <div className="client-baptismal-view-field">
                    <label>{index === 0 ? "Godfather's Name:" : "Godmother's Name:"}</label>
                    {renderReadOnlyField(godparent.name)}
                  </div>
                </div>
                {index < baptismData.godParents.length - 1 && <hr className="client-baptismal-view-godparent-divider" />}
              </div>
            ))}
          </div>
        </div>
        </div>
        
        <div className="client-requirements-view-container">
          <h2 className="client-requirements-view-title">Requirements</h2>
          <div className="client-requirements-view-box">
            <h3 className="client-view-section-header">Documents Status</h3>
            <div className="client-view-checkbox-list">
              {/* Birth Certificate */}
              <div className="client-requirement-view-item">
                <div className="client-view-requirement-name">
                  Birth Certificate of the Child (PSA or local civil registrar copy)
                </div>
                {renderDocumentStatus(
                  baptismData.requirements.birthCert.submitted, 
                  baptismData.requirements.birthCert.fileName
                )}
              </div>
              
              {/* Marriage Certificate */}
              <div className="client-requirement-view-item">
                <div className="client-view-requirement-name">
                  Parents' Marriage Certificate (If married in the Church)
                </div>
                {renderDocumentStatus(
                  baptismData.requirements.marriageCert.submitted, 
                  baptismData.requirements.marriageCert.fileName
                )}
              </div>
              
              {/* Valid IDs */}
              <div className="client-requirement-view-item">
                <div className="client-view-requirement-name">
                  Valid IDs of Parents and Godparents
                </div>
                {renderDocumentStatus(
                  baptismData.requirements.validIds.submitted, 
                  baptismData.requirements.validIds.fileName
                )}
              </div>
            </div>

            <h3 className="client-view-section-header">Requirements for Parent</h3>
            <div className="client-info-view-list">
              <div className="client-info-view-item">
                <p>At least one parent must be Catholic</p>
              </div>
              <div className="client-info-view-item">
                <p>Parents should be willing to raise the child in the Catholic faith</p>
              </div>
              <div className="client-info-view-item">
                <p>Must attend Pre-Baptismal Seminar (Required in most parishes)</p>
              </div>
            </div>

            <h3 className="client-view-section-header">Requirements for Godparents</h3>
            <div className="client-info-view-list">
              <div className="client-info-view-item">
                <p>Must be a practicing Catholic</p>
              </div>
              <div className="client-info-view-item">
                <p>Must have received the Sacraments of Baptism, Confirmation, and Holy Eucharist</p>
              </div>
              <div className="client-info-view-item">
                <p>Must be at least 16 years old</p>
              </div>
              <div className="client-info-view-item">
                <p>If married, must be married in the Catholic Church</p>
              </div>
              <div className="client-info-view-item">
                <p>Confirmation Certificate (Some parishes require this for proof of faith practice)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientBaptismView;