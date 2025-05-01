import React, { useState, useRef } from "react";
import { AiOutlineArrowLeft, AiOutlineEye, AiOutlineDownload } from "react-icons/ai"; 
import "./SecretaryFuneralMassView.css";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const SecretaryFuneralMassView = () => {
  // State for status and document viewing
  const [status, setStatus] = useState("PENDING");
  const [viewingDocument, setViewingDocument] = useState(null);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const certificateRef = useRef(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // Sample data (in a real app, this would come from props or API)
  const funeralData = {
    date: "April 24, 2025",
    time: "9:00 AM",
    priest: "Fr. José Chito M. Estrella",
    deceased: {
      firstName: "Antonio",
      middleName: "Santos",
      lastName: "Reyes",
      gender: "Male",
      age: "78",
      dateOfBirth: "June 15, 1946",
      dateOfDeath: "April 22, 2025",
      causeOfDeath: "Natural Causes",
      wakeLocation: "Santo Funeral Homes, Daet",
      burialLocation: "Divine Mercy Cemetery, Daet"
    },
    requester: {
      firstName: "Maria",
      middleName: "Reyes",
      lastName: "Santos",
      relationship: "Daughter",
      contact: "09123456789",
      email: "maria.santos@email.com"
    },
    address: {
      street: "Rizal Street",
      municipality: "Daet",
      province: "Camarines Norte"
    },
    requirements: {
      deathCertificate: {
        submitted: true,
        fileName: "DeathCertificate_AntonioReyes.pdf"
      },
      parishClearance: {
        submitted: true,
        fileName: "ParishClearance_AntonioReyes.pdf"
      },
      burialPermit: {
        submitted: true,
        fileName: "BurialPermit_AntonioReyes.pdf"
      },
      baptismCert: {
        submitted: false,
        fileName: ""
      },
      confirmationCert: {
        submitted: false,
        fileName: ""
      }
    },
    // Added certificate details
    certificate: {
      registerNumber: "453",
      pageNumber: "78",
      lineNumber: "12",
      dateIssued: "April 25, 2025"
    }
  };

  // Handle form submission
  const handleSubmit = () => {
    // Here you would typically send an API request to update the status
    alert(`Application status has been changed to: ${status}`);
  };

  // Handle cancel action
  const handleCancel = () => {
    // Reset the status to previous value or redirect
    setStatus("PENDING");
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
      const fileName = `Funeral_Certificate_${funeralData.deceased.firstName}_${funeralData.deceased.lastName}.pdf`;
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
    return <div className="secretary-funeral-view-value">{value || "N/A"}</div>;
  };

  // Function to render document status with view button
  const renderDocumentStatus = (isSubmitted, fileName) => {
    return (
      <div className="secretary-funeral-document-status-container">
        <div className={`secretary-funeral-view-status ${isSubmitted ? 'secretary-funeral-view-submitted' : 'secretary-funeral-view-not-submitted'}`}>
          {isSubmitted ? `Submitted: ${fileName}` : "Not Submitted"}
        </div>
        {isSubmitted && (
          <button 
            className="secretary-funeral-view-document-btn"
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
      <div className="secretary-funeral-document-viewer-overlay">
        <div className="secretary-funeral-document-viewer-container">
          <div className="secretary-funeral-document-viewer-header">
            <h3>{viewingDocument}</h3>
            <button 
              className="secretary-funeral-document-close-btn"
              onClick={() => setViewingDocument(null)}
            >
              ×
            </button>
          </div>
          <div className="secretary-funeral-document-viewer-content">
            {/* In a real application, this would display the actual document */}
            <div className="secretary-funeral-document-placeholder">
              <p>Document preview would be displayed here.</p>
              <p>Filename: {viewingDocument}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Certificate download confirmation modal
  const renderCertificateModal = () => {
    if (!showCertificateModal) return null;

    // Extract relevant dates for the certificate
    const { month: funeralMonth, day: funeralDay } = extractMonthDayFromDate(funeralData.date);
    const funeralYear = new Date(funeralData.date).getFullYear();
    const issuedDate = formatDate(funeralData.certificate.dateIssued);

    return (
      <div className="secretary-funeral-document-viewer-overlay">
        <div className="secretary-funeral-certificate-modal-container">
          <div className="secretary-funeral-document-viewer-header">
            <h3>Funeral Mass Certificate</h3>
            <button 
              className="secretary-funeral-document-close-btn"
              onClick={() => setShowCertificateModal(false)}
            >
              ×
            </button>
          </div>
          <div className="secretary-funeral-certificate-modal-content">
            <p>Would you like to download this certificate?</p>
            
            {/* Certificate Preview */}
            <div ref={certificateRef} className="funeral-certificate-preview">
              <div className="funeral-certificate-header">
                <div className="funeral-certificate-logos">
                  <div className="funeral-parish-logo-left">
                    <img src="/src/assets/church2.jpg" alt="Parish Logo Left" />
                  </div>
                  <div className="parish-title">
                    <div className="diocese-title">DIOCESE OF DAET</div>
                    <div className="parish-name">PARISH OF THE DIVINE MERCY</div>
                    <div className="parish-address">Alawihao, Daet, 4600 Camarines Norte, Philippines</div>
                  </div>
                  <div className="funeral-parish-logo-right">
                    <img src="/src/assets/pdmlogo.png" alt="Parish Logo Right" />
                  </div>
                </div>
                
                <h1 className="certificate-title">Certificate of Funeral Mass</h1>
                <p className="certificate-subtitle">This is to certify that</p>
              </div>
              
              <div className="funeral-certificate-details">
                <div className="cert-field name-field">
                  <div className="cert-value">{funeralData.deceased.firstName} {funeralData.deceased.middleName} {funeralData.deceased.lastName}</div>
                  <div className="cert-label">(Name of Deceased)</div>
                </div>
                
                <div className="cert-field date-birth-death-field">
                  <div className="cert-value">
                    Born on {formatDate(funeralData.deceased.dateOfBirth)} and
                    died on {formatDate(funeralData.deceased.dateOfDeath)}
                  </div>
                </div>
                
                <div className="cert-field residence-field">
                  <div className="cert-value">{funeralData.address.street}, {funeralData.address.municipality}, {funeralData.address.province}</div>
                  <div className="cert-label">(Residence)</div>
                </div>
                
                <div className="cert-field funeral-date-field">
                  <div className="cert-prefix">Received a Funeral Mass on the</div>
                  <div className="cert-value">{funeralDay}th</div>
                  <div className="cert-prefix">day of</div>
                  <div className="cert-value">{funeralMonth}</div>
                  <div className="cert-prefix">in the year</div>
                  <div className="cert-value">{funeralYear}</div>
                </div>
                
                <div className="cert-field rites-field">
                  <div className="cert-value">According to the Rites of the Roman Catholic Church</div>
                </div>
                
                <div className="cert-field minister-field">
                  <div className="cert-prefix">by</div>
                  <div className="cert-value">{funeralData.priest}</div>
                </div>
                
                <div className="cert-field burial-field">
                  <div className="cert-prefix">with burial at</div>
                  <div className="cert-value">{funeralData.deceased.burialLocation}</div>
                </div>
                
                <div className="cert-field register-field">
                  <div className="cert-prefix">as appears on Funeral Register No.</div>
                  <div className="cert-value">{funeralData.certificate.registerNumber}</div>
                  <div className="cert-prefix">Page</div>
                  <div className="cert-value">{funeralData.certificate.pageNumber}</div>
                  <div className="cert-prefix">Line</div>
                  <div className="cert-value">{funeralData.certificate.lineNumber}</div>
                </div>
                
                <div className="cert-field requester-field">
                  <div className="cert-prefix">Requested by:</div>
                  <div className="cert-value">{funeralData.requester.firstName} {funeralData.requester.middleName} {funeralData.requester.lastName}</div>
                  <div className="cert-label">(Relationship: {funeralData.requester.relationship})</div>
                </div>
                
                <div className="cert-field date-issued-field">
                  <div className="cert-prefix">Date Issued:</div>
                  <div className="cert-value">{issuedDate}</div>
                </div>
                
                <div className="cert-field signature-field">
                  <div className="cert-value parish-seal">Parish Seal</div>
                  <div className="cert-value signature-line">REV. FR. JOSÉ CHITO M. ESTRELLA</div>
                  <div className="cert-label">(Parish Priest)</div>
                </div>
              </div>
            </div>
            
            <div className="secretary-funeral-certificate-modal-actions">
              <button 
                className="secretary-funeral-certificate-download-btn"
                onClick={downloadCertificateAsPDF}
                disabled={isDownloading}
              >
                {isDownloading ? 'Processing...' : <><AiOutlineDownload /> Download</>}
              </button>
              <button 
                className="secretary-funeral-certificate-cancel-btn"
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

  return (
    <div className="secretary-funeral-view-container">
      {/* Document Viewer Modal */}
      {renderDocumentViewer()}
      
      {/* Certificate Download Modal */}
      {renderCertificateModal()}
      
      {/* Header */}
      <div className="secretary-funeral-view-header">
        <div className="secretary-funeral-view-left-section">
          <button className="secretary-funeral-view-back-button" onClick={() => window.history.back()}>
            <AiOutlineArrowLeft className="secretary-funeral-view-back-icon" /> Back
          </button>
        </div>
        <div className="secretary-funeral-view-right-section">
          <div className="secretary-funeral-view-status-selector">
            <label htmlFor="status-select">Status:</label>
            <select 
              id="status-select" 
              className="secretary-funeral-status-dropdown"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="PENDING">PENDING</option>
              <option value="APPROVED">APPROVED</option>
              <option value="COMPLETED">COMPLETED</option>
            </select>
          </div>
          <button 
            className="secretary-funeral-download-certificate-btn"
            onClick={handleDownloadCertificate}
          >
            <AiOutlineDownload /> Download Certificate
          </button>
        </div>
      </div>
      <h1 className="secretary-funeral-view-title">Funeral Mass Application Details</h1>
      
      {/* Funeral Mass Data Section */}
      <div className="secretary-funeral-view-data">
        <div className="secretary-funeral-view-row-date">
          <div className="secretary-funeral-view-field-date">
            <label>Date of Funeral Mass:</label>
            {renderReadOnlyField(formatDate(funeralData.date))}
          </div>
          
          <div className="secretary-funeral-view-field-time">
            <label>Time of Funeral Mass:</label>
            {renderReadOnlyField(funeralData.time)}
          </div>
        </div>

        <div className="secretary-funeral-view-field-date">
          <label>Name of the Priest:</label>
          {renderReadOnlyField(funeralData.priest)}
        </div>
        
        <div className="secretary-funeral-view-bypart">
          <h3 className="secretary-funeral-view-sub-title">Deceased Information</h3>
          <div className="secretary-funeral-view-info-card">
            <div className="funeral-view-row">
              <div className="funeral-view-field">
                <label>First Name:</label>
                {renderReadOnlyField(funeralData.deceased.firstName)}
              </div>
              <div className="funeral-view-field">
                <label>Middle Name:</label>
                {renderReadOnlyField(funeralData.deceased.middleName)}
              </div>
              <div className="funeral-view-field">
                <label>Last Name:</label>
                {renderReadOnlyField(funeralData.deceased.lastName)}
              </div>
              <div className="funeral-view-field">
                <label>Gender:</label>
                {renderReadOnlyField(funeralData.deceased.gender)}
              </div>
            </div>
            
            <div className="funeral-view-row">
            <div className="funeral-view-field">
                <label>Age:</label>
                {renderReadOnlyField(funeralData.deceased.age)}
              </div>
              <div className="funeral-view-field">
                <label>Date of Birth:</label>
                {renderReadOnlyField(formatDate(funeralData.deceased.dateOfBirth))}
              </div>
              <div className="funeral-view-field">
                <label>Date of Death:</label>
                {renderReadOnlyField(formatDate(funeralData.deceased.dateOfDeath))}
              </div>
            </div>
            
            <div className="funeral-view-row">
              <div className="funeral-view-field">
                <label>Cause of Death:</label>
                {renderReadOnlyField(funeralData.deceased.causeOfDeath)}
              </div>
            </div>
            
            <div className="funeral-view-row">
              <div className="funeral-view-field">
                <label>Wake Location:</label>
                {renderReadOnlyField(funeralData.deceased.wakeLocation)}
              </div>
            </div>
            
            <div className="funeral-view-row">
              <div className="funeral-view-field">
                <label>Burial Location:</label>
                {renderReadOnlyField(funeralData.deceased.burialLocation)}
              </div>
            </div>
          </div>

          {/* Requester's Information */}
          <h3 className="secretary-funeral-view-sub-title">Requester Information</h3>
          <div className="secretary-funeral-view-info-card">
            <div className="funeral-view-row">
              <div className="funeral-view-field">
                <label>First Name:</label>
                {renderReadOnlyField(funeralData.requester.firstName)}
              </div>
              <div className="funeral-view-field">
                <label>Middle Name:</label>
                {renderReadOnlyField(funeralData.requester.middleName)}
              </div>
              <div className="funeral-view-field">
                <label>Last Name:</label>
                {renderReadOnlyField(funeralData.requester.lastName)}
              </div>
            </div>
            
            <div className="funeral-view-row">
              <div className="funeral-view-field">
                <label>Relationship to the Deceased:</label>
                {renderReadOnlyField(funeralData.requester.relationship)}
              </div>
              <div className="funeral-view-field">
                <label>Contact Number:</label>
                {renderReadOnlyField(funeralData.requester.contact)}
              </div>
              <div className="funeral-view-field">
                <label>Email Address:</label>
                {renderReadOnlyField(funeralData.requester.email)}
              </div>
            </div>
          </div>
          
          {/* Address Information */}
          <h3 className="secretary-funeral-view-sub-title">Address</h3>
          <div className="secretary-funeral-view-info-card">
            <div className="funeral-view-row secretary-funeral-address-view-row">
            <div className="funeral-view-field">
                <label>Barangay:</label>
                {renderReadOnlyField(funeralData.address.barangay)}
              </div>
              <div className="funeral-view-field">
                <label>Street:</label>
                {renderReadOnlyField(funeralData.address.street)}
              </div>
              <div className="funeral-view-field">
                <label>Municipality:</label>
                {renderReadOnlyField(funeralData.address.municipality)}
              </div>
              <div className="funeral-view-field">
                <label>Province:</label>
                {renderReadOnlyField(funeralData.address.province)}
              </div>
            </div>
          </div>
        </div>
        
        <div className="secretary-funeral-requirements-view-container">
          <h2 className="secretary-funeral-requirements-view-title">Requirements</h2>
          <div className="secretary-funeral-requirements-view-box">
            <h3 className="secretary-funeral-view-section-header">Documents Status</h3>
            <div className="secretary-funeral-view-checkbox-list">
              {/* Death Certificate */}
              <div className="secretary-funeral-requirement-view-item">
                <div className="secretary-funeral-view-requirement-name">
                  Death Certificate
                </div>
                {renderDocumentStatus(
                  funeralData.requirements.deathCertificate.submitted, 
                  funeralData.requirements.deathCertificate.fileName
                )}
              </div>
              
              {/* Parish Clearance */}
              <div className="secretary-funeral-requirement-view-item">
                <div className="secretary-funeral-view-requirement-name">
                  Parish Clearance (if from another parish)
                </div>
                {renderDocumentStatus(
                  funeralData.requirements.parishClearance.submitted, 
                  funeralData.requirements.parishClearance.fileName
                )}
              </div>
              
              {/* Burial Permit */}
              <div className="secretary-funeral-requirement-view-item">
                <div className="secretary-funeral-view-requirement-name">
                  Permit to Bury
                </div>
                {renderDocumentStatus(
                  funeralData.requirements.burialPermit.submitted, 
                  funeralData.requirements.burialPermit.fileName
                )}
              </div>
              
              {/* Baptism Certificate */}
              <div className="secretary-funeral-requirement-view-item">
                <div className="secretary-funeral-view-requirement-name">
                  Certificate of Baptism
                </div>
                {renderDocumentStatus(
                  funeralData.requirements.baptismCert.submitted, 
                  funeralData.requirements.baptismCert.fileName
                )}
              </div>
              
              {/* Confirmation Certificate */}
              <div className="secretary-funeral-requirement-view-item">
                <div className="secretary-funeral-view-requirement-name">
                  Certificate of Confirmation
                </div>
                {renderDocumentStatus(
                  funeralData.requirements.confirmationCert.submitted, 
                  funeralData.requirements.confirmationCert.fileName
                )}
              </div>
            </div>

            <h3 className="secretary-funeral-view-section-header">Funeral Setup Requirements</h3>
            <div className="secretary-funeral-info-view-list">
              <div className="secretary-funeral-info-view-item">
                <p>Photos/memorial table allowed with limitations (not on the altar)</p>
              </div>
              <div className="secretary-funeral-info-view-item">
                <p>Eulogies may be given before/after the Mass or at the cemetery</p>
              </div>
              <div className="secretary-funeral-info-view-item">
                <p>Family and guests should wear respectful and modest attire</p>
              </div>
              <div className="secretary-funeral-info-view-item">
                <p>No loud music, applause, or improper conduct during the Mass</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons Section */}
        <div className="secretary-funeral-action-buttons">
          <button 
            className="secretary-funeral-submit-button"
            onClick={handleSubmit}
          >
            Submit
          </button>
          <button 
            className="secretary-funeral-cancel-button"
            onClick={handleCancel}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default SecretaryFuneralMassView;