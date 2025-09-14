import React, { useState, useEffect } from "react";
import { AiOutlineArrowLeft } from "react-icons/ai"; 
import { useLocation, useNavigate } from "react-router-dom";
import "./ClientBaptismView.css";

const ClientBaptismView = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [baptismData, setBaptismData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if we have necessary state data (baptismID and clientID)
    const baptismID = location.state?.baptismID;
    const clientID = location.state?.clientID;

    if (!baptismID || !clientID) {
      setError("Missing baptism information. Please try again.");
      setLoading(false);
      return;
    }

    // Fetch the baptism details
    fetchBaptismDetails(baptismID);
  }, [location]);

  // Helper function to format date to "December 23, 2025" format
  const formatDate = (dateString) => {
    if (!dateString || dateString === 'N/A') return 'N/A';
    
    try {
      const date = new Date(dateString);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return dateString; // Return original if invalid date
      }
      
      // Format to "Month Day, Year"
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString; // Return original if formatting fails
    }
  };

  // Helper function to convert 24-hour time to 12-hour AM/PM format
  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    
    try {
      // Handle different time formats
      let time = timeString;
      
      // If time includes seconds (HH:MM:SS), remove them
      if (time.includes(':') && time.split(':').length === 3) {
        time = time.substring(0, 5); // Keep only HH:MM
      }
      
      // Split the time into hours and minutes
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours, 10);
      const min = minutes || '00';
      
      // Convert to 12-hour format
      if (hour === 0) {
        return `12:${min} AM`;
      } else if (hour < 12) {
        return `${hour}:${min} AM`;
      } else if (hour === 12) {
        return `12:${min} PM`;
      } else {
        return `${hour - 12}:${min} PM`;
      }
    } catch (error) {
      console.error('Error formatting time:', error);
      return timeString; // Return original if formatting fails
    }
  };

  const fetchBaptismDetails = async (baptismID) => {
    try {
      const response = await fetch(`https://parishofdivinemercy.com/backend/fetch_baptism_details.php?baptismID=${baptismID}`);
      const data = await response.json();
      
      if (data.success) {
        // Transform the data into the expected format
        const transformedData = transformBaptismData(data.data);
        setBaptismData(transformedData);
      } else {
        setError(data.message || "Failed to fetch baptism details");
      }
    } catch (error) {
      console.error("Error fetching baptism details:", error);
      setError("An error occurred while fetching the data");
    } finally {
      setLoading(false);
    }
  };

  const transformBaptismData = (data) => {
    // Format the data from PHP API response to match the component's expected format
    const { baptism, parents, marital, address, godFathers, godMothers } = data;

    return {
      date: formatDate(baptism.dateOfBaptism), // Apply date formatting here
      time: formatTime(baptism.timeOfBaptism), // Apply time formatting here
      status: baptism.status,
      createdAt: baptism.created_at ? formatDate(baptism.created_at) : 'N/A',
      child: {
        firstName: baptism.firstName,
        middleName: baptism.middleName,
        lastName: baptism.lastName,
        gender: baptism.sex,
        age: baptism.age,
        dateOfBirth: formatDate(baptism.dateOfBirth), // Apply date formatting here
        placeOfBirth: baptism.placeOfBirth,
        regionOfBirth: baptism.region || 'N/A'
      },
      father: {
        firstName: parents?.fatherFirstName || 'N/A',
        middleName: parents?.fatherMiddleName || 'N/A',
        lastName: parents?.fatherLastName || 'N/A',
        placeOfBirth: parents?.fatherPlaceOfBirth || 'N/A',
        dateOfBirth: formatDate(parents?.fatherDateOfBirth) || 'N/A', // Apply date formatting here
        contact: parents?.fatherContact || 'N/A'
      },
      mother: {
        firstName: parents?.motherFirstName || 'N/A',
        middleName: parents?.motherMiddleName || 'N/A',
        lastName: parents?.motherLastName || 'N/A',
        placeOfBirth: parents?.motherPlaceOfBirth || 'N/A',
        dateOfBirth: formatDate(parents?.motherDateOfBirth) || 'N/A', // Apply date formatting here
        contact: parents?.motherContact || 'N/A'
      },
      maritalStatus: {
        type: marital?.maritalStatus || 'N/A',
        yearsMarried: marital?.yearsMarried || 'N/A'
      },
      address: {
        street: address?.street || 'N/A',
        barangay: address?.barangay || 'N/A',
        municipality: address?.municipality || 'N/A',
        province: address?.province || 'N/A',
        region: address?.region || 'N/A'
      },
      godParents: [
        // Format godparents from the API response
        ...godFathers.map(name => ({
          name,
          type: 'godfather'
        })),
        ...godMothers.map(name => ({
          name,
          type: 'godmother'
        }))
      ]
    };
  };

  // Function to render read-only input field
  const renderReadOnlyField = (value) => {
    return <div className="client-view-value">{value || "N/A"}</div>;
  };

  if (loading) {
    return (
      <div className="client-baptism-view-container">
        <div className="client-baptism-view-loading">Loading baptism details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="client-baptism-view-container">
        <div className="client-baptism-view-error">
          <p>{error}</p>
          <button onClick={() => navigate('/client-appointment')}>Back to Appointments</button>
        </div>
      </div>
    );
  }

  if (!baptismData) {
    return (
      <div className="client-baptism-view-container">
        <div className="client-baptism-view-error">
          <p>No baptism data found.</p>
          <button onClick={() => navigate('/client-appointment')}>Back to Appointments</button>
        </div>
      </div>
    );
  }

  return (
    <div className="client-baptism-view-container">
      {/* Header */}
      <div className="client-baptism-view-header">
        <div className="client-view-left-section">
          <button className="client-view-back-button" onClick={() => navigate('/client-appointment')}>
            <AiOutlineArrowLeft className="client-view-back-icon" /> Back
          </button>
        </div>
      </div>
      <h1 className="client-view-title">Baptism Application Details</h1>
      
      {/* Baptismal Data Section */}
      <div className="client-baptismal-view-data">
        <div className="client-baptismal-view-row-date">
          <div className="client-baptismal-view-field-date">
            <label>Date of Appointment:</label>
            {renderReadOnlyField(baptismData.date)}
          </div>
          
          <div className="client-baptismal-view-field-time">
            <label>Time of Appointment:</label>
            {renderReadOnlyField(baptismData.time)}
          </div>
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
            </div>
            
            <div className="client-baptismal-view-row">
            <div className="client-baptismal-view-field">
                <label>Date of Birth:</label>
                {renderReadOnlyField(baptismData.child.dateOfBirth)}
              </div>
              <div className="client-baptismal-view-field">
                <label>Age:</label>
                {renderReadOnlyField(baptismData.child.age)}
              </div>
               <div className="client-baptismal-view-field">
                <label>Gender:</label>
                {renderReadOnlyField(baptismData.child.gender)}
              </div>
            </div>
            
            <div className="client-baptismal-view-row">
            <div className="client-baptismal-view-field">
                <label>Place of Birth:</label>
                {renderReadOnlyField(baptismData.child.placeOfBirth)}
              </div>
               <div className="client-baptismal-view-field">
                <label>Region of Birth:</label>
                {renderReadOnlyField(baptismData.child.regionOfBirth)}
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
                <label>Father's Date of Birth:</label>
                {renderReadOnlyField(baptismData.father.dateOfBirth)}
              </div>
              <div className="client-baptismal-view-field">
                <label>Father's Contact Number:</label>
                {renderReadOnlyField(baptismData.father.contact)}
              </div>
              <div className="client-baptismal-view-field">
                <label>Father's Place of Birth:</label>
                {renderReadOnlyField(baptismData.father.placeOfBirth)}
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
            <div className="client-baptismal-view-field-fpob">
                <label>Mother's Date of Birth:</label>
                {renderReadOnlyField(baptismData.mother.dateOfBirth)}
              </div>
              <div className="client-baptismal-view-field">
                <label>Mother's Contact Number:</label>
                {renderReadOnlyField(baptismData.mother.contact)}
              </div>
              <div className="client-baptismal-view-field">
                <label>Mother's Place of Birth:</label>
                {renderReadOnlyField(baptismData.mother.placeOfBirth)}
              </div>
            </div>
          </div>
          
          <h3 className="client-view-sub-title">Parents Marital Status</h3>
          <div className="client-baptismal-view-info-card">
            <div className="client-baptismal-view-row-pms">
              <div className="client-marital-view-status">
                <label className="client-view-section-label">Parents' marital status:</label>
                <div className="client-marital-view-options">
                  <div className={`client-view-pms-label ${baptismData.maritalStatus.type === 'Married' ? 'client-view-selected-status' : ''}`}>
                    <span className={`client-view-checkbox ${baptismData.maritalStatus.type === 'Married' ? 'client-view-checked' : ''}`}></span>
                    <label>Married</label>
                  </div>
                  <div className={`client-view-pms-label ${baptismData.maritalStatus.type === 'Civil' ? 'client-view-selected-status' : ''}`}>
                    <span className={`client-view-checkbox ${baptismData.maritalStatus.type === 'Civil' ? 'client-view-checked' : ''}`}></span>
                    <label>Civil</label>
                  </div>
                  <div className={`client-view-pms-label ${baptismData.maritalStatus.type === 'Living Together' ? 'client-view-selected-status' : ''}`}>
                    <span className={`client-view-checkbox ${baptismData.maritalStatus.type === 'Living Together' ? 'client-view-checked' : ''}`}></span>
                    <label>Living Together</label>
                  </div>
                  <div className={`client-view-pms-label ${baptismData.maritalStatus.type === 'Single' ? 'client-view-selected-status' : ''}`}>
                    <span className={`client-view-checkbox ${baptismData.maritalStatus.type === 'Single' ? 'client-view-checked' : ''}`}></span>
                    <label>Single</label>
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
                <label>Street:</label>
                {renderReadOnlyField(baptismData.address.street)}
              </div>
              <div className="client-baptismal-view-field">
                <label>Barangay:</label>
                {renderReadOnlyField(baptismData.address.barangay)}
              </div>
              <div className="client-baptismal-view-field">
                <label>Municipality:</label>
                {renderReadOnlyField(baptismData.address.municipality)}
              </div>
            </div>
            <div className="client-baptismal-view-row client-address-view-row">
              <div className="client-baptismal-view-field">
                <label>Province:</label>
                {renderReadOnlyField(baptismData.address.province)}
              </div>
              <div className="client-baptismal-view-field">
                <label>Region:</label>
                {renderReadOnlyField(baptismData.address.region)}
              </div>
            </div>
          </div>
          
          <div className="client-view-bypart">
            <h3 className="client-view-sub-title">Godparents Information</h3>
            <div className="client-baptismal-view-info-card">
            {baptismData.godParents.map((godparent, index) => (
              <div key={index} className="client-godparent-item">
                <h4 className="client-baptismal-view-godparent-header">
                  {godparent.type === 'godfather' ? "Godfather (Ninong)" : "Godmother (Ninang)"}
                </h4>
                <div className="client-baptismal-view-row">
                  <div className="client-baptismal-view-field">
                    <label>{godparent.type === 'godfather' ? "Godfather's Name:" : "Godmother's Name:"}</label>
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

          <h3 className="client-view-section-header">Documents Required</h3>
            <div className="client-info-view-list">
              <div className="client-info-view-item">
                <p>Birth Certificate of the Child (PSA or local civil registrar copy)</p>
              </div>
              <div className="client-info-view-item">
                <p>Parents' Marriage Certificate (If married in the Church)</p>
              </div>
              <div className="client-info-view-item">
                <p>Valid IDs of Parents and Godparents</p>
              </div>
              <div className="client-info-view-item">
                <p>Certificate of Permission(If outside the Parish)</p>
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
              <div className="client-info-view-item">
                <p>Certificate of Permission (if outside the Parish)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default ClientBaptismView;