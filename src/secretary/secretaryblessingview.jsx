import React, { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { AiOutlineArrowLeft, AiOutlineEye, AiOutlineDownload } from "react-icons/ai"; 
import "./SecretaryBlessingView.css";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const SecretaryBlessingView = () => {
  const location = useLocation();
  const blessingData = location.state?.blessingData || {};
  
  // State for status and document viewing
  const [status, setStatus] = useState(blessingData.status || "PENDING");
  const [viewingDocument, setViewingDocument] = useState(null);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const certificateRef = useRef(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // Update status when blessingData changes
  useEffect(() => {
    if (blessingData.status) {
      setStatus(blessingData.status);
    }
  }, [blessingData]);

  // Handle form submission
  const handleSubmit = () => {
    // Here you would typically send an API request to update the status
    alert(`Application status has been changed to: ${status}`);
  };

  // Handle cancel action
  const handleCancel = () => {
    // Reset the status to previous value or redirect
    setStatus(blessingData.status || "PENDING");
    alert("Action cancelled");
  };

  // Function to handle download certificate
  const handleDownloadCertificate = () => {
    setShowCertificateModal(true);
  };

  // Function to format date for better display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString; // Return original string if formatting fails
    }
  };

  // Extract month and day from date
  const extractMonthDayFromDate = (dateString) => {
    if (!dateString) return { month: "N/A", day: "N/A" };
    
    try {
      const date = new Date(dateString);
      const month = date.toLocaleDateString('en-US', { month: 'long' });
      const day = date.getDate();
      return { month, day };
    } catch (error) {
      console.error("Error extracting month and day:", error);
      return { month: "N/A", day: "N/A" };
    }
  };

  // Function to download the certificate as PDF
  const downloadCertificateAsPDF = async () => {
    if (!certificateRef.current) return;
    
    setIsDownloading(true);
    
    try {
      // First ensure all images are loaded
      const images = certificateRef.current.querySelectorAll('img');
      await Promise.all([...images].map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise(resolve => {
          img.onload = resolve;
          img.onerror = resolve;
        });
      }));
      
      // Generate a canvas from the certificate element
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2, // Higher scale for better quality
        logging: false,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      
      // Calculate PDF dimensions based on the canvas aspect ratio
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // Add the image to the PDF
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      
      // Save the PDF
      const fileName = `${blessingData.blessingType.charAt(0).toUpperCase() + blessingData.blessingType.slice(1)}_Blessing_Certificate_${blessingData.firstName}_${blessingData.lastName}.pdf`;
      pdf.save(fileName);
      
      setShowCertificateModal(false);
      alert(`Certificate downloaded successfully!`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Error generating PDF. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  // Function to render read-only input field
  const renderReadOnlyField = (value) => {
    return <div className="secretary-blessing-view-value">{value || "N/A"}</div>;
  };

  // Function to render document status with view button
  const renderDocumentStatus = (isSubmitted, fileName) => {
    return (
      <div className="secretary-blessing-document-status-container">
        <div className={`secretary-blessing-view-status ${isSubmitted ? 'secretary-blessing-view-submitted' : 'secretary-blessing-view-not-submitted'}`}>
          {isSubmitted ? `Submitted: ${fileName}` : "Not Submitted"}
        </div>
        {isSubmitted && fileName && (
          <button 
            className="secretary-blessing-view-document-btn"
            onClick={() => setViewingDocument(fileName)}
          >
            <AiOutlineEye /> View
          </button>
        )}
      </div>
    );
  };

  // Document viewer modal
  const renderDocumentViewer = () => {
    if (!viewingDocument) return null;

    return (
      <div className="secretary-blessing-document-viewer-overlay">
        <div className="secretary-blessing-document-viewer-container">
          <div className="secretary-blessing-document-viewer-header">
            <h3>{viewingDocument}</h3>
            <button 
              className="secretary-blessing-document-close-btn"
              onClick={() => setViewingDocument(null)}
            >
              ×
            </button>
          </div>
          <div className="secretary-blessing-document-viewer-content">
            {/* In a real application, this would display the actual document */}
            <div className="secretary-blessing-document-placeholder">
              <p>Document preview would be displayed here.</p>
              <p>Filename: {viewingDocument}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Function to render requirements based on blessing type
  const renderRequirements = () => {
    const requirementsList = [];
    const requirements = blessingData.requirements || {};
    
    // Always show valid ID requirement
    if (requirements.valid_id) {
      requirementsList.push(
        <div key="validId" className="secretary-blessing-requirement-view-item">
          <div className="secretary-blessing-view-requirement-name">
            Valid ID of the Requester
          </div>
          {renderDocumentStatus(
            requirements.valid_id.submitted, 
            requirements.valid_id.fileName
          )}
        </div>
      );
    }
    
    switch(blessingData.blessingType) {
      case "house":
        if (requirements.proof_of_ownership) {
          requirementsList.push(
            <div key="proofOfOwnership" className="secretary-blessing-requirement-view-item">
              <div className="secretary-blessing-view-requirement-name">
                Proof of Ownership
              </div>
              {renderDocumentStatus(
                requirements.proof_of_ownership.submitted, 
                requirements.proof_of_ownership.fileName
              )}
            </div>
          );
        }
        if (requirements.barangay_clearance) {
          requirementsList.push(
            <div key="barangayClearance" className="secretary-blessing-requirement-view-item">
              <div className="secretary-blessing-view-requirement-name">
                Barangay Clearance
              </div>
              {renderDocumentStatus(
                requirements.barangay_clearance.submitted, 
                requirements.barangay_clearance.fileName
              )}
            </div>
          );
        }
        break;
      
      case "business":
        if (requirements.business_permit) {
          requirementsList.push(
            <div key="businessPermit" className="secretary-blessing-requirement-view-item">
              <div className="secretary-blessing-view-requirement-name">
                Business Permit / DTI Registration
              </div>
              {renderDocumentStatus(
                requirements.business_permit.submitted, 
                requirements.business_permit.fileName
              )}
            </div>
          );
        }
        break;
      
      case "car":
        if (requirements.vehicle_registration) {
          requirementsList.push(
            <div key="vehicleRegistration" className="secretary-blessing-requirement-view-item">
              <div className="secretary-blessing-view-requirement-name">
                Vehicle OR/CR (Official Receipt / Certificate of Registration)
              </div>
              {renderDocumentStatus(
                requirements.vehicle_registration.submitted, 
                requirements.vehicle_registration.fileName
              )}
            </div>
          );
        }
        break;
      
      default:
        break;
    }
    
    return requirementsList;
  };

  // Function to render blessing info based on blessing type
  const renderBlessingInfo = () => {
    switch(blessingData.blessingType) {
      case "house":
        return (
          <div className="secretary-blessing-info-view-list">
            <div className="secretary-blessing-info-view-item">
              <p>The house must be <strong>ready for occupancy</strong></p>
            </div>
            <div className="secretary-blessing-info-view-item">
              <p>All <strong>family members should be present</strong> if possible</p>
            </div>
            <div className="secretary-blessing-info-view-item">
              <p>Prepare basic blessing items</p>
            </div>
            <div className="secretary-blessing-info-view-item">
              <p>Some parishes ask that you <strong>belong to the parish community</strong> or register in the parish</p>
            </div>
          </div>
        );
      
      case "business":
        return (
          <div className="secretary-blessing-info-view-list">
            <div className="secretary-blessing-info-view-item">
              <p>Business must have the <strong>necessary permits</strong> (may be checked informally)</p>
            </div>
            <div className="secretary-blessing-info-view-item">
              <p>Owner or authorized representative must be present</p>
            </div>
            <div className="secretary-blessing-info-view-item">
              <p>Staff may be included in prayer or ceremony</p>
            </div>
          </div>
        );
      
      case "car":
        return (
          <div className="secretary-blessing-info-view-list">
            <div className="secretary-blessing-info-view-item">
              <p>Must bring the <strong>actual vehicle</strong> to the venue or church</p>
            </div>
            <div className="secretary-blessing-info-view-item">
              <p>The car should be clean and parked properly</p>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  // Certificate template based on blessing type
  const renderCertificateTemplate = () => {
    // Extract month and day from blessing date
    const dateStr = blessingData.date || blessingData.preferredDate;
    const { month, day } = extractMonthDayFromDate(dateStr);
    const year = new Date(dateStr).getFullYear();
    const formattedDate = formatDate(dateStr);
    const timeStr = blessingData.time || blessingData.preferredTime;

    const commonHeader = (
      <div className="blessing-certificate-header">
        <div className="blessing-certificate-logos">
          <div className="blessing-parish-logo-left">
            <img src="/src/assets/church2.jpg" alt="Parish Logo Left" />
          </div>
          <div className="parish-title">
            <div className="diocese-title">DIOCESE OF DAET</div>
            <div className="parish-name">PARISH OF THE DIVINE MERCY</div>
            <div className="parish-address">Alawihao, Daet, 4600 Camarines Norte, Philippines</div>
          </div>
          <div className="blessing-parish-logo-right">
            <img src="/src/assets/pdmlogo.png" alt="Parish Logo Right" />
          </div>
        </div>
      </div>
    );

    const commonFooter = (
      <div className="blessing-cert-footer">
        <div className="blessing-cert-field signature-field">
          <div className="blessing-cert-value parish-seal">Parish Seal</div>
          <div className="blessing-cert-value signature-line">{blessingData.priestName?.toUpperCase()}</div>
          <div className="blessing-cert-label">(Parish Priest)</div>
        </div>
        <div className="blessing-cert-field date-issued-field">
          <div className="blessing-cert-prefix">Date Issued:</div>
          <div className="blessing-cert-value">
            {blessingData.certificate?.dateIssued ? formatDate(blessingData.certificate.dateIssued) : formattedDate}
          </div>
        </div>
      </div>
    );

    switch(blessingData.blessingType) {
      case "house":
        return (
          <div className="blessing-certificate-content">
            {commonHeader}
            <h1 className="blessing-certificate-title">House Blessing Certificate</h1>
            
            <div className="blessing-certificate-body">
              <p className="blessing-cert-intro">This is to certify that the house of</p>
              
              <div className="blessing-cert-field name-field">
                <div className="blessing-cert-value">{blessingData.firstName} {blessingData.middleName} {blessingData.lastName}</div>
                <div className="blessing-cert-label">(Name of Owner/Requester)</div>
              </div>
              
              <div className="blessing-cert-field location-field">
                <div className="blessing-cert-prefix">Located at</div>
                <div className="blessing-cert-value">{blessingData.location}</div>
                <div className="blessing-cert-label">(Complete Address)</div>
              </div>
              
              <div className="blessing-cert-field blessing-date-field">
                <div className="blessing-cert-prefix">Was blessed on</div>
                <div className="blessing-cert-value">{formattedDate}</div>
              </div>
              
              <div className="blessing-cert-field blessing-time-field">
                <div className="blessing-cert-prefix">at</div>
                <div className="blessing-cert-value">{timeStr}</div>
              </div>
              
              <div className="blessing-cert-field purpose-field">
                <div className="blessing-cert-prefix">For the purpose of</div>
                <div className="blessing-cert-value">{blessingData.purpose}</div>
              </div>
              
              <div className="blessing-cert-field priest-field">
                <div className="blessing-cert-prefix">The blessing was officiated by</div>
                <div className="blessing-cert-value">{blessingData.priestName}</div>
                <div className="blessing-cert-label">(Name of Priest)</div>
              </div>
              
              <div className="blessing-cert-message">
                <p>May God bless this home and all who dwell in it with peace, joy, and prosperity.</p>
              </div>
            </div>
            
            {commonFooter}
          </div>
        );
      
      case "business":
        return (
          <div className="blessing-certificate-content">
            {commonHeader}
            <h1 className="blessing-certificate-title">Business Blessing Certificate</h1>
            
            <div className="blessing-certificate-body">
              <p className="blessing-cert-intro">This is to certify that the business establishment</p>
              
              <div className="blessing-cert-field business-name-field">
                <div className="blessing-cert-value">{blessingData.purpose}</div>
                <div className="blessing-cert-label">(Name of Business)</div>
              </div>
              
              <div className="blessing-cert-field owner-field">
                <div className="blessing-cert-prefix">Owned by</div>
                <div className="blessing-cert-value">{blessingData.firstName} {blessingData.middleName} {blessingData.lastName}</div>
                <div className="blessing-cert-label">(Name of Owner/Requester)</div>
              </div>
              
              <div className="blessing-cert-field location-field">
                <div className="blessing-cert-prefix">Located at</div>
                <div className="blessing-cert-value">{blessingData.location}</div>
                <div className="blessing-cert-label">(Complete Address)</div>
              </div>
              
              <div className="blessing-cert-field blessing-date-field">
                <div className="blessing-cert-prefix">Was blessed on</div>
                <div className="blessing-cert-value">{formattedDate}</div>
              </div>
              
              <div className="blessing-cert-field blessing-time-field">
                <div className="blessing-cert-prefix">at</div>
                <div className="blessing-cert-value">{timeStr}</div>
              </div>
              
              <div className="blessing-cert-field priest-field">
                <div className="blessing-cert-prefix">The blessing was officiated by</div>
                <div className="blessing-cert-value">{blessingData.priestName}</div>
                <div className="blessing-cert-label">(Name of Priest)</div>
              </div>
              
              <div className="blessing-cert-message">
                <p>May this business prosper under God's guidance and serve the community with integrity and compassion.</p>
              </div>
            </div>
            
            {commonFooter}
          </div>
        );
      
      case "car":
        return (
          <div className="blessing-certificate-content">
            {commonHeader}
            <h1 className="blessing-certificate-title">Vehicle Blessing Certificate</h1>
            
            <div className="blessing-certificate-body">
              <p className="blessing-cert-intro">This is to certify that the vehicle of</p>
              
              <div className="blessing-cert-field name-field">
                <div className="blessing-cert-value">{blessingData.firstName} {blessingData.middleName} {blessingData.lastName}</div>
                <div className="blessing-cert-label">(Name of Owner/Requester)</div>
              </div>
              
              <div className="blessing-cert-field vehicle-details-field">
                <div className="blessing-cert-prefix">Vehicle details</div>
                <div className="blessing-cert-value">{blessingData.purpose}</div>
                <div className="blessing-cert-label">(Make, Model, Plate Number)</div>
              </div>
              
              <div className="blessing-cert-field blessing-date-field">
                <div className="blessing-cert-prefix">Was blessed on</div>
                <div className="blessing-cert-value">{formattedDate}</div>
              </div>
              
              <div className="blessing-cert-field blessing-time-field">
                <div className="blessing-cert-prefix">at</div>
                <div className="blessing-cert-value">{timeStr}</div>
              </div>
              
              <div className="blessing-cert-field blessing-location-field">
                <div className="blessing-cert-prefix">at</div>
                <div className="blessing-cert-value">{blessingData.location}</div>
                <div className="blessing-cert-label">(Blessing Location)</div>
              </div>
              
              <div className="blessing-cert-field priest-field">
                <div className="blessing-cert-prefix">The blessing was officiated by</div>
                <div className="blessing-cert-value">{blessingData.priestName}</div>
                <div className="blessing-cert-label">(Name of Priest)</div>
              </div>
              
              <div className="blessing-cert-message">
                <p>May this vehicle bring its passengers safely to their destinations, and may St. Christopher, patron saint of travelers, watch over all who journey in it.</p>
              </div>
            </div>
            
            {commonFooter}
          </div>
        );
      
      default:
        return (
          <div className="blessing-certificate-content">
            <p>Invalid blessing type.</p>
          </div>
        );
    }
  };

  // Certificate download confirmation modal
  const renderCertificateModal = () => {
    if (!showCertificateModal) return null;

    return (
      <div className="secretary-blessing-document-viewer-overlay">
        <div className="secretary-blessing-certificate-modal-container">
          <div className="secretary-blessing-document-viewer-header">
            <h3>{blessingData.blessingType?.charAt(0).toUpperCase() + blessingData.blessingType?.slice(1)} Blessing Certificate</h3>
            <button 
              className="secretary-blessing-document-close-btn"
              onClick={() => setShowCertificateModal(false)}
            >
              ×
            </button>
          </div>
          <div className="secretary-blessing-certificate-modal-content">
            <p>Would you like to download this certificate?</p>
            
            {/* Certificate Preview */}
            <div ref={certificateRef} className="blessing-certificate-preview">
              {renderCertificateTemplate()}
            </div>
            
            <div className="secretary-blessing-certificate-modal-actions">
              <button 
                className="secretary-blessing-certificate-download-btn"
                onClick={downloadCertificateAsPDF}
                disabled={isDownloading}
              >
                {isDownloading ? 'Processing...' : <><AiOutlineDownload /> Download</>}
              </button>
              <button 
                className="secretary-blessing-certificate-cancel-btn"
                onClick={() => setShowCertificateModal(false)}
                disabled={isDownloading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // If no blessing data is available, show an error message
  if (!blessingData || Object.keys(blessingData).length === 0) {
    return (
      <div className="secretary-blessing-view-container">
        <div className="secretary-blessing-view-header">
          <div className="secretary-blessing-view-left-section">
            <button className="secretary-blessing-view-back-button" onClick={() => window.history.back()}>
              <AiOutlineArrowLeft className="secretary-blessing-view-back-icon" /> Back
            </button>
          </div>
        </div>
        <div className="secretary-blessing-view-error">
          <h2>No blessing data available</h2>
          <p>Please go back and select a blessing to view.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="secretary-blessing-view-container">
      {/* Document Viewer Modal */}
      {renderDocumentViewer()}
      
      {/* Certificate Download Modal */}
      {renderCertificateModal()}
      
      {/* Header */}
      <div className="secretary-blessing-view-header">
        <div className="secretary-blessing-view-left-section">
          <button className="secretary-blessing-view-back-button" onClick={() => window.history.back()}>
            <AiOutlineArrowLeft className="secretary-blessing-view-back-icon" /> Back
          </button>
        </div>
        <div className="secretary-blessing-view-right-section">
          <div className="secretary-blessing-view-status-selector">
            <label htmlFor="status-select">Status:</label>
            <select 
              id="status-select" 
              className="secretary-blessing-status-dropdown"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="PENDING">PENDING</option>
              <option value="APPROVED">APPROVED</option>
              <option value="COMPLETED">COMPLETED</option>
            </select>
          </div>
          <button 
            className="secretary-blessing-download-certificate-btn"
            onClick={handleDownloadCertificate}
          >
            <AiOutlineDownload /> Download Certificate
          </button>
        </div>
      </div>
      <h1 className="secretary-blessing-view-title">Blessing Ceremony Application Details</h1>
      
      {/* Blessing Data Section */}
      <div className="secretary-blessing-view-data">
        <div className="secretary-blessing-view-info-card">
          <div className="secretary-blessing-view-row-date">
            <div className="secretary-blessing-view-field-date">
              <label>Preferred Date of Blessing Ceremony:</label>
              {renderReadOnlyField(formatDate(blessingData.date || blessingData.preferredDate))}
            </div>
            
            <div className="secretary-blessing-view-field-time">
              <label>Preferred Time of Blessing Ceremony:</label>
              {renderReadOnlyField(blessingData.time || blessingData.preferredTime)}
            </div>
          </div>

          <div className="secretary-blessing-view-field-date">
            <label>Name of the Priest:</label>
            {renderReadOnlyField(blessingData.priestName)}
          </div>
        </div>
        
        <div className="secretary-blessing-view-bypart">
          <h2 className="secretary-blessing-view-sub-title">Personal Information</h2>
          
          <div className="secretary-blessing-view-info-card">
            <div className="secretary-blessing-view-row">
              <div className="secretary-blessing-view-field">
                <label>First Name:</label>
                {renderReadOnlyField(blessingData.firstName)}
              </div>
              <div className="secretary-blessing-view-field">
                <label>Middle Name:</label>
                {renderReadOnlyField(blessingData.middleName)}
              </div>
              <div className="secretary-blessing-view-field">
                <label>Last Name:</label>
                {renderReadOnlyField(blessingData.lastName)}
              </div>
            </div>

            <div className="secretary-blessing-view-row">
              <div className="secretary-blessing-view-field">
                <label>Gender:</label>
                {renderReadOnlyField(blessingData.gender)}
              </div>
              <div className="secretary-blessing-view-field">
                <label>Age:</label>
                {renderReadOnlyField(blessingData.age)}
              </div>
              <div className="secretary-blessing-view-field">
                <label>Date of Birth:</label>
                {renderReadOnlyField(formatDate(blessingData.dateOfBirth))}
              </div>
            </div>

            <div className="secretary-blessing-view-row">
              <div className="secretary-blessing-view-field">
                <label>Contact Number:</label>
                {renderReadOnlyField(blessingData.contactNumber)}
              </div>
              <div className="secretary-blessing-view-field">
                <label>Email Address:</label>
                {renderReadOnlyField(blessingData.emailAddress)}
              </div>
            </div>
            
            <div className="secretary-blessing-view-row secretary-blessing-address-view-row">
            <div className="secretary-blessing-view-field">
                <label>Barangay:</label>
                {renderReadOnlyField(blessingData.barangay)}
              </div>
              <div className="secretary-blessing-view-field">
                <label>Street:</label>
                {renderReadOnlyField(blessingData.street)}
              </div>
              <div className="secretary-blessing-view-field">
                <label>Municipality:</label>
                {renderReadOnlyField(blessingData.municipality)}
              </div>
              <div className="secretary-blessing-view-field">
                <label>Province:</label>
                {renderReadOnlyField(blessingData.province)}
              </div>
            </div>
          </div>

          <h2 className="secretary-blessing-view-sub-title">Blessing Details</h2>
          
          <div className="secretary-blessing-view-info-card">
            <div className="secretary-blessing-view-row">
              <div className="secretary-blessing-view-field">
                <label>Blessing Type:</label>
                {renderReadOnlyField(blessingData.blessingType?.charAt(0).toUpperCase() + blessingData.blessingType?.slice(1) + " Blessing")}
              </div>
              <div className="secretary-blessing-view-field">
                <label>Location:</label>
                {renderReadOnlyField(blessingData.location)}
              </div>
            </div>

            <div className="secretary-blessing-view-row">
              <div className="secretary-blessing-view-field">
                <label>Purpose:</label>
                {renderReadOnlyField(blessingData.purpose)}
              </div>
            </div>

            <div className="secretary-blessing-view-row">
              <div className="secretary-blessing-view-field">
                <label>Notes:</label>
                {renderReadOnlyField(blessingData.notes || "No additional notes provided.")}
              </div>
            </div>
          </div>
        </div>
        
        {/* Requirements section */}
        <div className="secretary-blessing-requirements-view-container">
          <h2 className="secretary-blessing-requirements-view-title">Requirements</h2>
          <div className="secretary-blessing-requirements-view-box">
            <h3 className="secretary-blessing-view-section-header">Documents Status</h3>
            <div className="secretary-blessing-view-checkbox-list">
              {renderRequirements()}
            </div>

            <h3 className="secretary-blessing-view-section-header">
              {blessingData.blessingType?.charAt(0).toUpperCase() + blessingData.blessingType?.slice(1)} Blessing Requirements
            </h3>
            {renderBlessingInfo()}
          </div>
        </div>

        {/* Action Buttons Section */}
        <div className="secretary-blessing-action-buttons">
          <button 
            className="secretary-blessing-submit-button"
            onClick={handleSubmit}
          >
            Submit
          </button>
          <button 
            className="secretary-blessing-cancel-button"
            onClick={handleCancel}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default SecretaryBlessingView;