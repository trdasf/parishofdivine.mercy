import React from "react";
import { AiOutlineArrowLeft } from "react-icons/ai"; 
import "./ClientMarriageView.css";

const ClientMarriageView = ({ marriageData }) => {
  // Sample data structure if no data is passed
  const defaultData = {
    // Basic info
    date: "June 15, 2025",
    time: "3:00 PM",
    priest: "Fr. John Santos",
    
    // Groom info
    groom: {
      firstName: "Juan",
      middleName: "Reyes",
      lastName: "Garcia",
      age: "32",
      birthDate: "April 12, 1993",
      baptismDate: "May 10, 1993",
      baptismChurch: "St. Peter Parish",
      birthPlace: "Manila",
      address: {
        barangay: "barangay",
        street: "Rizal Street",
        municipality: "Makati City",
        province: "Metro Manila"
      }
    },
    
    // Bride info
    bride: {
      firstName: "Maria",
      middleName: "Santos",
      lastName: "Reyes",
      age: "30",
      birthDate: "June 23, 1995",
      baptismDate: "July 15, 1995",
      baptismChurch: "Holy Trinity Church",
      birthPlace: "Quezon City",
      address: {
        barangay: "barangay",
        street: "Mabini Avenue",
        municipality: "Quezon City",
        province: "Metro Manila"
      }
    },
    
    // Witnesses
    witnesses: [
      {
        firstName: "Pedro",
        middleName: "Lim",
        lastName: "Santos",
        gender: "Male",
        age: "35",
        birthDate: "March 8, 1990",
        contactNumber: "09123456789",
        address: {
          barangay: "barangay",
          street: "Bonifacio Street",
          municipality: "Pasig City",
          province: "Metro Manila"
        }
      },
      {
        firstName: "Ana",
        middleName: "Cruz",
        lastName: "Mendoza",
        gender: "Female",
        age: "33",
        birthDate: "November 12, 1992",
        contactNumber: "09987654321",
        address: {
          barangay: "barangay",
          street: "Legaspi Street",
          municipality: "Makati City",
          province: "Metro Manila"
        }
      }
    ],
    
    // Requirements status
    requirements: {
      baptismalCert: "Submitted",
      confirmationCert: "Submitted",
      birthCert: "Submitted",
      marriageLicense: "Submitted",
      cenomar: "Submitted",
      bannsPublication: "Submitted",
      parishPermit: "Submitted",
      preCana: "Submitted",
      sponsorsList: "Submitted",
      practiceSchedule: "Submitted",
      canonicalInterview: "Submitted"
    }
  };

  // Use provided data or default data
  const data = marriageData || defaultData;

  // Function to render a status badge
  const renderStatusBadge = (status) => {
    const isSubmitted = status === "Submitted";
    return (
      <div className={`client-marriage-view-status-badge ${isSubmitted ? 'client-marriage-view-status-submitted' : 'client-marriage-view-status-not-submitted'}`}>
        {status}
      </div>
    );
  };

  return (
    <div className="client-marriage-view-container">
      {/* Header */}
      <div className="client-marriage-view-header">
        <div className="client-marriage-view-left-section">
          <button className="client-marriage-view-back-button" onClick={() => window.history.back()}>
            <AiOutlineArrowLeft className="client-marriage-view-back-icon" /> Back
          </button>
        </div>
      </div>
      <h1 className="client-marriage-view-title">Marriage Application Details</h1>
      
      {/* Matrimony Data Section */}
      <div className="client-marriage-view-data">
        <div className="client-marriage-view-row-date">
          <div className="client-marriage-view-field-date">
            <label>Date of Holy Matrimony:</label>
            <div className="client-marriage-view-value">{data.date}</div>
          </div>
          
          <div className="client-marriage-view-field-time">
            <label>Time of Holy Matrimony:</label>
            <div className="client-marriage-view-value">{data.time}</div>
          </div>
        </div>

        <div className="client-marriage-view-field-date">
          <label>Name of the Priest:</label>
          <div className="client-marriage-view-value">{data.priest}</div>
        </div>
        
        <div className="client-marriage-view-bypart">
          <h3 className="client-marriage-view-sub-title">Groom Information</h3>
          <div className="client-marriage-view-info-card">
            <div className="client-marriage-view-row">
              <div className="client-marriage-view-field">
                <label>First Name:</label>
                <div className="client-marriage-view-value">{data.groom.firstName}</div>
              </div>
              <div className="client-marriage-view-field">
                <label>Middle Name:</label>
                <div className="client-marriage-view-value">{data.groom.middleName}</div>
              </div>
              <div className="client-marriage-view-field">
                <label>Last Name:</label>
                <div className="client-marriage-view-value">{data.groom.lastName}</div>
              </div>
              <div className="client-marriage-view-field-ga">
                <label>Age:</label>
                <div className="client-marriage-view-value">{data.groom.age}</div>
              </div>
            </div>

            <div className="client-marriage-view-row">
              <div className="client-marriage-view-field">
                <label>Date of Birth:</label>
                <div className="client-marriage-view-value">{data.groom.birthDate}</div>
              </div>
              <div className="client-marriage-view-field">
                <label>Date of Baptism:</label>
                <div className="client-marriage-view-value">{data.groom.baptismDate}</div>
              </div>
              <div className="client-marriage-view-field-dob">
                <label>Church of Baptism:</label>
                <div className="client-marriage-view-value">{data.groom.baptismChurch}</div>
              </div>
              <div className="client-marriage-view-field-dob">
                <label>Place of Birth:</label>
                <div className="client-marriage-view-value">{data.groom.birthPlace}</div>
              </div>
            </div>
            
            <div className="client-marriage-view-row client-marriage-view-address-row">
            <div className="client-marriage-view-field">
                <label>Barangay:</label>
                <div className="client-marriage-view-value">{data.groom.address.barangay}</div>
              </div>
              <div className="client-marriage-view-field">
                <label>Street:</label>
                <div className="client-marriage-view-value">{data.groom.address.street}</div>
              </div>
              <div className="client-marriage-view-field">
                <label>Municipality:</label>
                <div className="client-marriage-view-value">{data.groom.address.municipality}</div>
              </div>
              <div className="client-marriage-view-field">
                <label>Province:</label>
                <div className="client-marriage-view-value">{data.groom.address.province}</div>
              </div>
            </div>
          </div>

          <h3 className="client-marriage-view-sub-title">Bride Information</h3>
          <div className="client-marriage-view-info-card">
            <div className="client-marriage-view-row">
              <div className="client-marriage-view-field">
                <label>First Name:</label>
                <div className="client-marriage-view-value">{data.bride.firstName}</div>
              </div>
              <div className="client-marriage-view-field">
                <label>Middle Name:</label>
                <div className="client-marriage-view-value">{data.bride.middleName}</div>
              </div>
              <div className="client-marriage-view-field">
                <label>Last Name:</label>
                <div className="client-marriage-view-value">{data.bride.lastName}</div>
              </div>
              <div className="client-marriage-view-field">
                <label>Age:</label>
                <div className="client-marriage-view-value">{data.bride.age}</div>
              </div>
            </div>

            <div className="client-marriage-view-row">
              <div className="client-marriage-view-field">
                <label>Date of Birth:</label>
                <div className="client-marriage-view-value">{data.bride.birthDate}</div>
              </div>
              <div className="client-marriage-view-field">
                <label>Date of Baptism:</label>
                <div className="client-marriage-view-value">{data.bride.baptismDate}</div>
              </div>
              <div className="client-marriage-view-field-dob">
                <label>Church of Baptism:</label>
                <div className="client-marriage-view-value">{data.bride.baptismChurch}</div>
              </div>
              <div className="client-marriage-view-field-dob">
                <label>Place of Birth:</label>
                <div className="client-marriage-view-value">{data.bride.birthPlace}</div>
              </div>
            </div>
          
            <div className="client-marriage-view-row client-marriage-view-address-row">
            <div className="client-marriage-view-field">
                <label>Barangay:</label>
                <div className="client-marriage-view-value">{data.bride.address.barangay}</div>
              </div>
              <div className="client-marriage-view-field">
                <label>Street:</label>
                <div className="client-marriage-view-value">{data.bride.address.street}</div>
              </div>
              <div className="client-marriage-view-field">
                <label>Municipality:</label>
                <div className="client-marriage-view-value">{data.bride.address.municipality}</div>
              </div>
              <div className="client-marriage-view-field">
                <label>Province:</label>
                <div className="client-marriage-view-value">{data.bride.address.province}</div>
              </div>
            </div>
          </div>

          <h3 className="client-marriage-view-sub-title">Witness Information</h3>
          <div className="client-marriage-view-info-card">
            {data.witnesses.map((witness, index) => (
              <div key={index}>
                <h4 className="client-marriage-view-witness-header">Witness {index + 1}</h4>
                <div className="client-marriage-view-row">
                  <div className="client-marriage-view-field">
                    <label>First Name:</label>
                    <div className="client-marriage-view-value">{witness.firstName}</div>
                  </div>
                  <div className="client-marriage-view-field">
                    <label>Middle Name:</label>
                    <div className="client-marriage-view-value">{witness.middleName}</div>
                  </div>
                  <div className="client-marriage-view-field">
                    <label>Last Name:</label>
                    <div className="client-marriage-view-value">{witness.lastName}</div>
                  </div>
                </div>
                
                <div className="client-marriage-view-row">
                <div className="client-marriage-view-field-ga">
                    <label>Gender:</label>
                    <div className="client-marriage-view-value">{witness.gender}</div>
                  </div>
                  <div className="client-marriage-view-field-ga">
                    <label>Age:</label>
                    <div className="client-marriage-view-value">{witness.age}</div>
                  </div>
                  <div className="client-marriage-view-field-pob">
                    <label>Date of Birth:</label>
                    <div className="client-marriage-view-value">{witness.birthDate}</div>
                  </div>
                  <div className="client-marriage-view-field-pob">
                    <label>Contact Number:</label>
                    <div className="client-marriage-view-value">{witness.contactNumber}</div>
                  </div>
                  </div>
                
                <div className="client-marriage-view-row">
                <div className="client-marriage-view-field">
                    <label>Barangay:</label>
                    <div className="client-marriage-view-value">{witness.address.barangay}</div>
                  </div>
                  <div className="client-marriage-view-field">
                    <label>Street:</label>
                    <div className="client-marriage-view-value">{witness.address.street}</div>
                  </div>
                  <div className="client-marriage-view-field">
                    <label>Municipality:</label>
                    <div className="client-marriage-view-value">{witness.address.municipality}</div>
                  </div>
                  <div className="client-marriage-view-field">
                    <label>Province:</label>
                    <div className="client-marriage-view-value">{witness.address.province}</div>
                  </div>
                </div>
                {index < data.witnesses.length - 1 && <hr className="client-marriage-view-witness-divider" />}
              </div>
            ))}
          </div>
        </div>
        
        {/* Requirements section */}
        <div className="client-marriage-view-requirements-container">
          <h2 className="client-marriage-view-requirements-title">Requirements</h2>
          <div className="client-marriage-view-requirements-box">
            <h3 className="client-marriage-view-section-header">Documents Status</h3>
            <div className="client-marriage-view-requirements-list">
              {/* Baptismal Certificate */}
              <div className="client-marriage-view-requirement-item">
                <div className="client-marriage-view-requirement-name">
                  Baptismal Certificate (Recent copy, issued within 6 months)
                </div>
                {renderStatusBadge(data.requirements.baptismalCert)}
              </div>
              
              {/* Confirmation Certificate */}
              <div className="client-marriage-view-requirement-item">
                <div className="client-marriage-view-requirement-name">
                  Confirmation Certificate (Proof of receiving the Sacrament of Confirmation)
                </div>
                {renderStatusBadge(data.requirements.confirmationCert)}
              </div>
              
              {/* Birth Certificate */}
              <div className="client-marriage-view-requirement-item">
                <div className="client-marriage-view-requirement-name">
                  Birth Certificate (For age verification and legal purposes)
                </div>
                {renderStatusBadge(data.requirements.birthCert)}
              </div>
              
              {/* Marriage License */}
              <div className="client-marriage-view-requirement-item">
                <div className="client-marriage-view-requirement-name">
                  Marriage License (Issued by the civil registry)
                </div>
                {renderStatusBadge(data.requirements.marriageLicense)}
              </div>
              
              {/* CENOMAR */}
              <div className="client-marriage-view-requirement-item">
                <div className="client-marriage-view-requirement-name">
                  Certificate of No Marriage (CENOMAR, issued by PSA)
                </div>
                {renderStatusBadge(data.requirements.cenomar)}
              </div>
              
              {/* Publication of Banns */}
              <div className="client-marriage-view-requirement-item">
                <div className="client-marriage-view-requirement-name">
                  Publication of Banns (Announcements made in the parish)
                </div>
                {renderStatusBadge(data.requirements.bannsPublication)}
              </div>
              
              {/* Permit from Proper Parish */}
              <div className="client-marriage-view-requirement-item">
                <div className="client-marriage-view-requirement-name">
                  Permit from Proper Parish (If wedding is held outside couple's parish)
                </div>
                {renderStatusBadge(data.requirements.parishPermit)}
              </div>
              
              {/* Pre-Cana Seminar */}
              <div className="client-marriage-view-requirement-item">
                <div className="client-marriage-view-requirement-name">
                  Pre-Cana Seminar Certificate (Marriage preparation program)
                </div>
                {renderStatusBadge(data.requirements.preCana)}
              </div>
              
              {/* Complete List of Sponsors */}
              <div className="client-marriage-view-requirement-item">
                <div className="client-marriage-view-requirement-name">
                  Complete List of Sponsors (Ninong & Ninang)
                </div>
                {renderStatusBadge(data.requirements.sponsorsList)}
              </div>
              
              {/* Practice Schedule */}
              <div className="client-marriage-view-requirement-item">
                <div className="client-marriage-view-requirement-name">
                  Practice Schedule (1 day before the marriage)
                </div>
                {renderStatusBadge(data.requirements.practiceSchedule)}
              </div>
              
              {/* Canonical Interview/Examination */}
              <div className="client-marriage-view-requirement-item">
                <div className="client-marriage-view-requirement-name">
                  Canonical Interview/Examination Record
                </div>
                {renderStatusBadge(data.requirements.canonicalInterview)}
              </div>
            </div>

            <h3 className="client-marriage-view-section-header">Requirements for the Couple</h3>
            <div className="client-marriage-view-info-list">
              <div className="client-marriage-view-info-item">
                <p>Must be a baptized Catholic (at least one of the partners)</p>
              </div>
              <div className="client-marriage-view-info-item">
                <p>Must have received the Sacrament of Confirmation</p>
              </div>
              <div className="client-marriage-view-info-item">
                <p>Must undergo a Pre-Cana Seminar or Marriage Preparation Program</p>
              </div>
              <div className="client-marriage-view-info-item">
                <p>Must be of legal age (as required by civil law)</p>
              </div>
              <div className="client-marriage-view-info-item">
                <p>Must provide proof of freedom to marry (e.g., no previous valid marriage in the Church)</p>
              </div>
            </div>

            <h3 className="client-marriage-view-section-header">Parish Requirements</h3>
            <div className="client-marriage-view-info-list">
              <div className="client-marriage-view-info-item">
                <p>Must schedule an interview with the parish priest</p>
              </div>
              <div className="client-marriage-view-info-item">
                <p>Must submit all required documents at least 3 months before the wedding</p>
              </div>
              <div className="client-marriage-view-info-item">
                <p>Must attend marriage banns (announcements made in the parish for three consecutive Sundays)</p>
              </div>
              <div className="client-marriage-view-info-item">
                <p>Must choose sponsors (Ninong & Ninang) who are practicing Catholics</p>
              </div>
              <div className="client-marriage-view-info-item">
                <p>Must attend rehearsal/practice (1 day before the marriage)</p>
              </div>
              <div className="client-marriage-view-info-item">
                <p>Must complete canonical interview/examination</p>
              </div>
            </div>

            <h3 className="client-marriage-view-section-header">Dress Code (If Specified by Parish)</h3>
            <div className="client-marriage-view-info-list">
              <div className="client-marriage-view-info-item">
                <p>Groom: Formal attire (barong or suit)</p>
              </div>
              <div className="client-marriage-view-info-item">
                <p>Bride: Modest wedding gown (with sleeves or shawl for Church ceremony)</p>
              </div>
              <div className="client-marriage-view-info-item">
                <p>Sponsors: Formal attire, respectful and modest</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientMarriageView;