import React, { useState, useRef } from "react";
import { AiOutlineArrowLeft, AiOutlineEye, AiOutlineDownload } from "react-icons/ai"; 
import "./SecretaryConfirmationView.css";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const SecretaryConfirmationView = () => {
  // State for status and document viewing
  const [status, setStatus] = useState("PENDING");
  const [viewingDocument, setViewingDocument] = useState(null);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const certificateRef = useRef(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // Sample data (in a real app, this would come from props or API)
  const confirmationData = {
    date: "March 19, 2025",
    time: "10:00 AM",
    priest: "Fr. José Chito M. Estrella",
    candidate: {
      firstName: "Maria",
      middleName: "Cruz",
      lastName: "Garcia",
      gender: "Female",
      age: "14",
      dateOfBirth: "March 12, 2011",
      dateOfBaptism: "April 30, 2011",
      churchOfBaptism: "St. Mary's Parish Church",
      placeOfBirth: "Cebu City"
    },
    father: {
      firstName: "Roberto",
      middleName: "Dela",
      lastName: "Garcia",
      placeOfBirth: "Manila",
      dateOfBirth: "May 8, 1980",
      education: "College Graduate",
      occupation: "Engineer",
      contact: "09123456789"
    },
    mother: {
      firstName: "Angelica",
      middleName: "Santos",
      lastName: "Garcia",
      placeOfBirth: "Cebu City",
      dateOfBirth: "November 15, 1982",
      education: "College Graduate",
      occupation: "Teacher",
      contact: "09876543210"
    },
    address: {
      street: "Rizal Street",
      municipality: "Cebu City",
      province: "Cebu"
    },
    sponsor: {
      name: "Antonio Mendoza",
      address: "456 Orchid St., Pasig City"
    },
    requirements: {
      baptismCert: {
        submitted: true,
        fileName: "BaptismCertificate_MariaGarcia.pdf"
      },
      birthCert: {
        submitted: true,
        fileName: "BirthCertificate_MariaGarcia.pdf"
      },
      validIds: {
        submitted: true,
        fileName: "ValidIDs_AllParties.pdf"
      }
    },
    // Added certificate details
    certificate: {
      registerNumber: "1",
      pageNumber: "97",
      lineNumber: "6",
      dateIssued: "March 29, 2025",
      purposeOf: "Marriage"
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
      const fileName = `Confirmation_Certificate_${confirmationData.candidate.firstName}_${confirmationData.candidate.lastName}.pdf`;
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
    return <div className="secretary-conf-view-value">{value || "N/A"}</div>;
  };

  // Function to render document status with view button
  const renderDocumentStatus = (isSubmitted, fileName) => {
    return (
      <div className="secretary-conf-document-status-container">
        <div className={`secretary-conf-view-status ${isSubmitted ? 'secretary-conf-view-submitted' : 'secretary-conf-view-not-submitted'}`}>
          {isSubmitted ? `Submitted: ${fileName}` : "Not Submitted"}
        </div>
        {isSubmitted && (
          <button 
            className="secretary-conf-view-document-btn"
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
      <div className="secretary-conf-document-viewer-overlay">
        <div className="secretary-conf-document-viewer-container">
          <div className="secretary-conf-document-viewer-header">
            <h3>{viewingDocument}</h3>
            <button 
              className="secretary-conf-document-close-btn"
              onClick={() => setViewingDocument(null)}
            >
              ×
            </button>
          </div>
          <div className="secretary-conf-document-viewer-content">
            {/* In a real application, this would display the actual document */}
            <div className="secretary-conf-document-placeholder">
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

    // Extract month and day from confirmation date
    const { month, day } = extractMonthDayFromDate(confirmationData.date);
    const year = new Date(confirmationData.date).getFullYear();

    return (
      <div className="secretary-conf-document-viewer-overlay">
        <div className="secretary-conf-certificate-modal-container">
          <div className="secretary-conf-document-viewer-header">
            <h3>Confirmation Certificate</h3>
            <button 
              className="secretary-conf-document-close-btn"
              onClick={() => setShowCertificateModal(false)}
            >
              ×
            </button>
          </div>
          <div className="secretary-conf-certificate-modal-content">
            <p>Would you like to download this certificate?</p>
            
            {/* Certificate Preview based on the image */}
            <div ref={certificateRef} className="confirmation-certificate-preview">
              <div className="confirmation-certificate-header">
              <div className="confirmation-certificate-logos">
                  <div className="confirmation-parish-logo-left">
                  <img src="/src/assets/church2.jpg" alt="Parish Logo Left" />
                </div>
                <div className="parish-title">
                <div className="diocese-title">DIOCESE OF DAET</div>
                <div className="parish-name">PARISH OF THE DIVINE MERCY</div>
                <div className="parish-address">Alawihao, Daet, 4600 Camarines Norte, Philippines</div>
                </div>
                <div className="confirmation-parish-logo-right">
                  <img src="/src/assets/pdmlogo.png" alt="Parish Logo Right" />
                </div>
                </div>
                
                <h1 className="certificate-title">Certificate of Confirmation</h1>
                <p className="certificate-subtitle">This is to certify that</p>
              </div>
              
              <div className="confirmation-certificate-details">
                <div className="cert-field name-field">
                  <div className="cert-value">{confirmationData.candidate.firstName} {confirmationData.candidate.middleName} {confirmationData.candidate.lastName}</div>
                  <div className="cert-label">(Name of child)</div>
                </div>
                
                <div className="cert-row">
                  <div className="cert-field">
                    <div className="cert-value">{confirmationData.father.firstName} {confirmationData.father.middleName} {confirmationData.father.lastName}</div>
                    <div className="cert-label">(Father's Name)</div>
                  </div>
                  <div className="cert-field">
                    <div className="cert-text">and</div>
                  </div>
                  <div className="cert-field">
                    <div className="cert-value">{confirmationData.mother.firstName} {confirmationData.mother.middleName} {confirmationData.mother.lastName}</div>
                    <div className="cert-label">(Mother's Name)</div>
                  </div>
                </div>
                
                <div className="cert-field residence-field">
                  <div className="cert-value">{confirmationData.address.street}, {confirmationData.address.municipality}, {confirmationData.address.province}</div>
                  <div className="cert-label">(Residence)</div>
                </div>
                
                <div className="cert-field baptism-field">
                  <div className="cert-value">{confirmationData.candidate.churchOfBaptism}</div>
                  <div className="cert-label">(Was Baptized at)</div>
                </div>
                
                <div className="cert-field confirmation-date-field">
                  <div className="cert-prefix">Was Confirmed on the</div>
                  <div className="cert-value">{day}th</div>
                  <div className="cert-prefix">day of</div>
                  <div className="cert-value">{month}</div>
                  <div className="cert-prefix">in the year</div>
                  <div className="cert-value">{year}</div>
                </div>
                
                <div className="cert-field rites-field">
                  <div className="cert-value">According to the Rites of the Roman Catholic Church</div>
                </div>
                
                <div className="cert-field minister-field">
                  <div className="cert-prefix">by the Most Rev.</div>
                  <div className="cert-value">{confirmationData.priest}</div>
                </div>
                
                <div className="cert-field sponsor-field">
                  <div className="cert-prefix">the Sponsor is</div>
                  <div className="cert-value">{confirmationData.sponsor.name}</div>
                </div>
                
                <div className="cert-field register-field">
                  <div className="cert-prefix">as appears on Confirmation Register No.</div>
                  <div className="cert-value">{confirmationData.certificate.registerNumber}</div>
                  <div className="cert-prefix">Page</div>
                  <div className="cert-value">{confirmationData.certificate.pageNumber}</div>
                  <div className="cert-prefix">Line</div>
                  <div className="cert-value">{confirmationData.certificate.lineNumber}</div>
                </div>
                
                <div className="cert-field purpose-field">
                  <div className="cert-prefix">This certificate was given for the purpose of</div>
                  <div className="cert-value">{confirmationData.certificate.purposeOf}</div>
                </div>
                
                <div className="cert-field date-issued-field">
                  <div className="cert-prefix">Date Issued:</div>
                  <div className="cert-value">{formatDate(confirmationData.certificate.dateIssued)}</div>
                </div>
                
                <div className="cert-field signature-field">
                  <div className="cert-value parish-seal">Parish Seal</div>
                  <div className="cert-value signature-line">REV. FR. JOSÉ CHITO M. ESTRELLA</div>
                  <div className="cert-label">(Parish Priest)</div>
                </div>
              </div>
            </div>
            
            <div className="secretary-conf-certificate-modal-actions">
              <button 
                className="secretary-conf-certificate-download-btn"
                onClick={downloadCertificateAsPDF}
                disabled={isDownloading}
              >
                {isDownloading ? 'Processing...' : <><AiOutlineDownload /> Download</>}
              </button>
              <button 
                className="secretary-conf-certificate-cancel-btn"
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
    <div className="secretary-confirmation-view-container">
      {/* Document Viewer Modal */}
      {renderDocumentViewer()}
      
      {/* Certificate Download Modal */}
      {renderCertificateModal()}
      
      {/* Header */}
      <div className="secretary-conf-view-header">
        <div className="secretary-conf-view-left-section">
          <button className="secretary-conf-view-back-button" onClick={() => window.history.back()}>
            <AiOutlineArrowLeft className="secretary-conf-view-back-icon" /> Back
          </button>
        </div>
        <div className="secretary-conf-view-right-section">
          <div className="secretary-conf-view-status-selector">
            <label htmlFor="status-select">Status:</label>
            <select 
              id="status-select" 
              className="secretary-conf-status-dropdown"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="PENDING">PENDING</option>
              <option value="APPROVED">APPROVED</option>
              <option value="COMPLETED">COMPLETED</option>
            </select>
          </div>
          <button 
            className="secretary-conf-download-certificate-btn"
            onClick={handleDownloadCertificate}
          >
            <AiOutlineDownload /> Download Certificate
          </button>
        </div>
      </div>
      <h1 className="secretary-conf-view-title">Confirmation Application Details</h1>
      
      {/* Confirmation Data Section */}
      <div className="secretary-conf-view-data">
        <div className="secretary-conf-view-row-date">
          <div className="secretary-conf-view-field-date">
            <label>Date of Confirmation:</label>
            {renderReadOnlyField(formatDate(confirmationData.date))}
          </div>
          
          <div className="secretary-conf-view-field-time">
            <label>Time of Confirmation:</label>
            {renderReadOnlyField(confirmationData.time)}
          </div>
        </div>

        <div className="secretary-conf-view-field-date">
          <label>Name of the Priest:</label>
          {renderReadOnlyField(confirmationData.priest)}
        </div>
        
        <div className="secretary-conf-view-bypart">
          <h3 className="secretary-conf-view-sub-title">Personal Information</h3>
          <div className="secretary-conf-view-info-card">
            <div className="secretary-conf-view-row">
              <div className="secretary-conf-view-field">
                <label>First Name:</label>
                {renderReadOnlyField(confirmationData.candidate.firstName)}
              </div>
              <div className="secretary-conf-view-field">
                <label>Middle Name:</label>
                {renderReadOnlyField(confirmationData.candidate.middleName)}
              </div>
              <div className="secretary-conf-view-field">
                <label>Last Name:</label>
                {renderReadOnlyField(confirmationData.candidate.lastName)}
              </div>
              <div className="secretary-conf-view-field">
                <label>Gender:</label>
                {renderReadOnlyField(confirmationData.candidate.gender)}
              </div>
            </div>
            
            <div className="secretary-conf-view-row">
              <div className="secretary-conf-view-field-ga">
                <label>Age:</label>
                {renderReadOnlyField(confirmationData.candidate.age)}
              </div>
              <div className="secretary-conf-view-field-ga">
                <label>Date of Birth:</label>
                {renderReadOnlyField(formatDate(confirmationData.candidate.dateOfBirth))}
              </div>
              <div className="secretary-conf-view-field">
                <label>Place of Birth:</label>
                {renderReadOnlyField(confirmationData.candidate.placeOfBirth)}
              </div>
            </div>
            
            <div className="secretary-conf-view-row">
              <div className="secretary-conf-view-field">
                <label>Date of Baptism:</label>
                {renderReadOnlyField(formatDate(confirmationData.candidate.dateOfBaptism))}
              </div>
              <div className="secretary-conf-view-field">
                <label>Church of Baptism:</label>
                {renderReadOnlyField(confirmationData.candidate.churchOfBaptism)}
              </div>
            </div>
            
            {/* Address Fields */}
            <div className="secretary-conf-view-row secretary-conf-address-view-row">
            <div className="secretary-conf-view-field">
                <label>Barangay:</label>
                {renderReadOnlyField(confirmationData.address.barangay)}
              </div>
              <div className="secretary-conf-view-field">
                <label>Street:</label>
                {renderReadOnlyField(confirmationData.address.street)}
              </div>
              <div className="secretary-conf-view-field">
                <label>Municipality:</label>
                {renderReadOnlyField(confirmationData.address.municipality)}
              </div>
              <div className="secretary-conf-view-field">
                <label>Province:</label>
                {renderReadOnlyField(confirmationData.address.province)}
              </div>
            </div>
          </div>

          {/* Father's Information */}
          <h3 className="secretary-conf-view-sub-title">Father's Information</h3>
          <div className="secretary-conf-view-info-card">
            <div className="secretary-conf-view-row">
              <div className="secretary-conf-view-field">
                <label>Father's First Name:</label>
                {renderReadOnlyField(confirmationData.father.firstName)}
              </div>
              <div className="secretary-conf-view-field">
                <label>Father's Middle Name:</label>
                {renderReadOnlyField(confirmationData.father.middleName)}
              </div>
              <div className="secretary-conf-view-field">
                <label>Father's Last Name:</label>
                {renderReadOnlyField(confirmationData.father.lastName)}
              </div>
            </div>
            
            <div className="secretary-conf-view-row">
            <div className="secretary-conf-view-field-fpob">
                <label>Father's Date of Birth:</label>
                {renderReadOnlyField(formatDate(confirmationData.father.dateOfBirth))}
              </div>
              <div className="secretary-conf-view-field">
                <label>Father's Place of Birth:</label>
                {renderReadOnlyField(confirmationData.father.placeOfBirth)}
              </div>
            </div>

            <div className="secretary-conf-view-row">
              <div className="secretary-conf-view-field">
                <label>Father's Educational Attainment:</label>
                {renderReadOnlyField(confirmationData.father.education)}
              </div>
              <div className="secretary-conf-view-field">
                <label>Father's Occupation:</label>
                {renderReadOnlyField(confirmationData.father.occupation)}
              </div>
              <div className="secretary-conf-view-field">
                <label>Father's Contact Number:</label>
                {renderReadOnlyField(confirmationData.father.contact)}
              </div>
            </div>
          </div>
          
          <h3 className="secretary-conf-view-sub-title">Mother's Information</h3>
          {/* Mother's Information */}
          <div className="secretary-conf-view-info-card">
            <div className="secretary-conf-view-row">
              <div className="secretary-conf-view-field">
                <label>Mother's First Name:</label>
                {renderReadOnlyField(confirmationData.mother.firstName)}
              </div>
              <div className="secretary-conf-view-field">
                <label>Mother's Middle Name:</label>
                {renderReadOnlyField(confirmationData.mother.middleName)}
              </div>
              <div className="secretary-conf-view-field">
                <label>Mother's Last Name:</label>
                {renderReadOnlyField(confirmationData.mother.lastName)}
              </div>
            </div>

            <div className="secretary-conf-view-row">
            <div className="secretary-conf-view-field-fpob">
                <label>Mother's Date of Birth:</label>
                {renderReadOnlyField(formatDate(confirmationData.mother.dateOfBirth))}
              </div>
              <div className="secretary-conf-view-field">
                <label>Mother's Place of Birth:</label>
                {renderReadOnlyField(confirmationData.mother.placeOfBirth)}
              </div>
            </div>

            <div className="secretary-conf-view-row">
              <div className="secretary-conf-view-field">
                <label>Mother's Educational Attainment:</label>
                {renderReadOnlyField(confirmationData.mother.education)}
              </div>
              <div className="secretary-conf-view-field">
                <label>Mother's Occupation:</label>
                {renderReadOnlyField(confirmationData.mother.occupation)}
              </div>
              <div className="secretary-conf-view-field">
                <label>Mother's Contact Number:</label>
                {renderReadOnlyField(confirmationData.mother.contact)}
              </div>
            </div>
          </div>
        </div>
        
        <div className="secretary-conf-requirements-view-container">
          <h2 className="secretary-conf-requirements-view-title">Requirements</h2>
          <div className="secretary-conf-requirements-view-box">
            <h3 className="secretary-conf-view-section-header">Documents Status</h3>
            <div className="secretary-conf-view-checkbox-list">
              {/* Baptism Certificate */}
              <div className="secretary-conf-requirement-view-item">
                <div className="secretary-conf-view-requirement-name">
                  Baptism Certificate (Proof of Catholic Baptism)
                </div>
                {renderDocumentStatus(
                  confirmationData.requirements.baptismCert.submitted, 
                  confirmationData.requirements.baptismCert.fileName
                )}
              </div>
              
              {/* Birth Certificate */}
              <div className="secretary-conf-requirement-view-item">
                <div className="secretary-conf-view-requirement-name">
                  Birth Certificate (PSA or Local Civil Registrar Copy)
                </div>
                {renderDocumentStatus(
                  confirmationData.requirements.birthCert.submitted, 
                  confirmationData.requirements.birthCert.fileName
                )}
              </div>
              
              {/* Valid IDs */}
              <div className="secretary-conf-requirement-view-item">
                <div className="secretary-conf-view-requirement-name">
                  Valid IDs of Candidate, Parents, and Sponsor
                </div>
                {renderDocumentStatus(
                  confirmationData.requirements.validIds.submitted, 
                  confirmationData.requirements.validIds.fileName
                )}
              </div>
            </div>

            <h3 className="secretary-conf-view-section-header">Requirements for Candidate</h3>
            <div className="secretary-conf-info-view-list">
              <div className="secretary-conf-info-view-item">
                <p>Must have received the Sacraments of Baptism and Holy Eucharist</p>
              </div>
              <div className="secretary-conf-info-view-item">
                <p>Must be at least 12 years old (Age requirement may vary by parish)</p>
              </div>
              <div className="secretary-conf-info-view-item">
                <p>Must attend Catechism Classes or Confirmation Seminar</p>
              </div>
              <div className="secretary-conf-info-view-item">
                <p>Must receive the Sacrament of Confession before Confirmation</p>
              </div>
              <div className="secretary-conf-info-view-item">
                <p>Must attend a Confirmation Retreat (if required by parish)</p>
              </div>
            </div>

            <h3 className="secretary-conf-view-section-header">Requirements for Sponsor</h3>
            <div className="secretary-conf-info-view-list">
              <div className="secretary-conf-info-view-item">
                <p>Must be a practicing Catholic</p>
              </div>
              <div className="secretary-conf-info-view-item">
                <p>Must have received the Sacraments of Baptism, Confirmation, and Holy Eucharist</p>
              </div>
              <div className="secretary-conf-info-view-item">
                <p>Must be at least 16 years old</p>
              </div>
              <div className="secretary-conf-info-view-item">
                <p>If married, must be married in the Catholic Church</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons Section */}
        <div className="secretary-conf-action-buttons">
          <button 
            className="secretary-conf-submit-button"
            onClick={handleSubmit}
          >
            Submit
          </button>
          <button 
            className="secretary-conf-cancel-button"
            onClick={handleCancel}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default SecretaryConfirmationView;