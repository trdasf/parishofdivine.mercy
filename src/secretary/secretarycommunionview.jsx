import React, { useState, useRef } from "react";
import { AiOutlineArrowLeft, AiOutlineEye, AiOutlineDownload } from "react-icons/ai"; 
import "./SecretaryCommunionView.css";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const SecretaryCommunionView = () => {
  // State for status and document viewing
  const [status, setStatus] = useState("PENDING");
  const [viewingDocument, setViewingDocument] = useState(null);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const certificateRef = useRef(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // Sample data (in a real app, this would come from props or API)
  const communionData = {
    date: "June 15, 2025",
    time: "9:00 AM",
    priest: "Fr. Michael Rodriguez",
    candidate: {
      firstName: "Maria",
      middleName: "Elena",
      lastName: "Santos",
      gender: "Female",
      age: "8",
      dateOfBirth: "March 10, 2017",
      dateOfBaptism: "April 15, 2017",
      churchOfBaptism: "St. Peter's Parish",
      placeOfBirth: "Manila City Hospital"
    },
    father: {
      firstName: "Juan",
      middleName: "Carlos",
      lastName: "Santos",
      dateOfBirth: "May 5, 1985",
      placeOfBirth: "Cebu City",
      education: "Bachelor's Degree",
      occupation: "Engineer",
      contact: "0917-123-4567"
    },
    mother: {
      firstName: "Ana",
      middleName: "Marie",
      lastName: "Reyes",
      dateOfBirth: "September 12, 1987",
      placeOfBirth: "Makati City",
      education: "Master's Degree",
      occupation: "Teacher",
      contact: "0918-765-4321"
    },
    address: {
      street: "123 Maple Street",
      municipality: "Quezon City",
      province: "Metro Manila"
    },
    requirements: {
      baptismCert: {
        submitted: true,
        fileName: "BaptismCertificate_MariaSantos.pdf"
      },
      firstCommunionCert: {
        submitted: false,
        fileName: ""
      },
      birthCert: {
        submitted: true,
        fileName: "BirthCertificate_MariaSantos.pdf"
      }
    },
    // Added certificate details
    certificate: {
      registerNumber: "24",
      pageNumber: "103",
      lineNumber: "8",
      dateIssued: "June 20, 2025",
      purposeOf: "School Records"
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
      const fileName = `First_Communion_Certificate_${communionData.candidate.firstName}_${communionData.candidate.lastName}.pdf`;
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
    return <div className="secretary-comm-view-value">{value || "N/A"}</div>;
  };

  // Function to render document status with view button
  const renderDocumentStatus = (isSubmitted, fileName) => {
    return (
      <div className="secretary-comm-document-status-container">
        <div className={`secretary-comm-view-status ${isSubmitted ? 'secretary-comm-view-submitted' : 'secretary-comm-view-not-submitted'}`}>
          {isSubmitted ? `Submitted: ${fileName}` : "Not Submitted"}
        </div>
        {isSubmitted && (
          <button 
            className="secretary-comm-view-document-btn"
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
      <div className="secretary-comm-document-viewer-overlay">
        <div className="secretary-comm-document-viewer-container">
          <div className="secretary-comm-document-viewer-header">
            <h3>{viewingDocument}</h3>
            <button 
              className="secretary-comm-document-close-btn"
              onClick={() => setViewingDocument(null)}
            >
              ×
            </button>
          </div>
          <div className="secretary-comm-document-viewer-content">
            {/* In a real application, this would display the actual document */}
            <div className="secretary-comm-document-placeholder">
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

    // Extract month and day from communion date
    const { month, day } = extractMonthDayFromDate(communionData.date);
    const year = new Date(communionData.date).getFullYear();

    return (
      <div className="secretary-comm-document-viewer-overlay">
        <div className="secretary-comm-certificate-modal-container">
          <div className="secretary-comm-document-viewer-header">
            <h3>First Holy Communion Certificate</h3>
            <button 
              className="secretary-comm-document-close-btn"
              onClick={() => setShowCertificateModal(false)}
            >
              ×
            </button>
          </div>
          <div className="secretary-comm-certificate-modal-content">
            <p>Would you like to download this certificate?</p>
            
            {/* Certificate Preview based on the confirmation certificate style */}
            <div ref={certificateRef} className="communion-certificate-preview">
              <div className="communion-certificate-header">
                <div className="communion-certificate-logos">
                  <div className="communion-parish-logo-left">
                    <img src="/src/assets/church2.jpg" alt="Parish Logo Left" />
                  </div>
                  <div className="parish-title">
                    <div className="diocese-title">DIOCESE OF DAET</div>
                    <div className="parish-name">PARISH OF THE DIVINE MERCY</div>
                    <div className="parish-address">Alawihao, Daet, 4600 Camarines Norte, Philippines</div>
                  </div>
                  <div className="communion-parish-logo-right">
                    <img src="/src/assets/pdmlogo.png" alt="Parish Logo Right" />
                  </div>
                </div>
                
                <h1 className="certificate-title">Certificate of First Holy Communion</h1>
                <p className="certificate-subtitle">This is to certify that</p>
              </div>
              
              <div className="communion-certificate-details">
                <div className="cert-field name-field">
                  <div className="cert-value">{communionData.candidate.firstName} {communionData.candidate.middleName} {communionData.candidate.lastName}</div>
                  <div className="cert-label">(Name of child)</div>
                </div>
                
                <div className="cert-row">
                  <div className="cert-field">
                    <div className="cert-value">{communionData.father.firstName} {communionData.father.middleName} {communionData.father.lastName}</div>
                    <div className="cert-label">(Father's Name)</div>
                  </div>
                  <div className="cert-field">
                    <div className="cert-text">and</div>
                  </div>
                  <div className="cert-field">
                    <div className="cert-value">{communionData.mother.firstName} {communionData.mother.middleName} {communionData.mother.lastName}</div>
                    <div className="cert-label">(Mother's Name)</div>
                  </div>
                </div>
                
                <div className="cert-field residence-field">
                  <div className="cert-value">{communionData.address.street}, {communionData.address.municipality}, {communionData.address.province}</div>
                  <div className="cert-label">(Residence)</div>
                </div>
                
                <div className="cert-field baptism-field">
                  <div className="cert-value">{communionData.candidate.churchOfBaptism}</div>
                  <div className="cert-label">(Was Baptized at)</div>
                </div>
                
                <div className="cert-field communion-date-field">
                  <div className="cert-prefix">Received First Holy Communion on the</div>
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
                  <div className="cert-prefix">by</div>
                  <div className="cert-value">{communionData.priest}</div>
                </div>
                
                <div className="cert-field register-field">
                  <div className="cert-prefix">as appears on First Communion Register No.</div>
                  <div className="cert-value">{communionData.certificate.registerNumber}</div>
                  <div className="cert-prefix">Page</div>
                  <div className="cert-value">{communionData.certificate.pageNumber}</div>
                  <div className="cert-prefix">Line</div>
                  <div className="cert-value">{communionData.certificate.lineNumber}</div>
                </div>
                
                <div className="cert-field purpose-field">
                  <div className="cert-prefix">This certificate was given for the purpose of</div>
                  <div className="cert-value">{communionData.certificate.purposeOf}</div>
                </div>
                
                <div className="cert-field date-issued-field">
                  <div className="cert-prefix">Date Issued:</div>
                  <div className="cert-value">{formatDate(communionData.certificate.dateIssued)}</div>
                </div>
                
                <div className="cert-field signature-field">
                  <div className="cert-value parish-seal">Parish Seal</div>
                  <div className="cert-value signature-line">REV. FR. MICHAEL RODRIGUEZ</div>
                  <div className="cert-label">(Parish Priest)</div>
                </div>
              </div>
            </div>
            
            <div className="secretary-comm-certificate-modal-actions">
              <button 
                className="secretary-comm-certificate-download-btn"
                onClick={downloadCertificateAsPDF}
                disabled={isDownloading}
              >
                {isDownloading ? 'Processing...' : <><AiOutlineDownload /> Download</>}
              </button>
              <button 
                className="secretary-comm-certificate-cancel-btn"
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
    <div className="secretary-communion-view-container">
      {/* Document Viewer Modal */}
      {renderDocumentViewer()}
      
      {/* Certificate Download Modal */}
      {renderCertificateModal()}
      
      {/* Header */}
      <div className="secretary-comm-view-header">
        <div className="secretary-comm-view-left-section">
          <button className="secretary-comm-view-back-button" onClick={() => window.history.back()}>
            <AiOutlineArrowLeft className="secretary-comm-view-back-icon" /> Back
          </button>
        </div>
        <div className="secretary-comm-view-right-section">
          <div className="secretary-comm-view-status-selector">
            <label htmlFor="status-select">Status:</label>
            <select 
              id="status-select" 
              className="secretary-comm-status-dropdown"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="PENDING">PENDING</option>
              <option value="APPROVED">APPROVED</option>
              <option value="COMPLETED">COMPLETED</option>
            </select>
          </div>
          <button 
            className="secretary-comm-download-certificate-btn"
            onClick={handleDownloadCertificate}
          >
            <AiOutlineDownload /> Download Certificate
          </button>
        </div>
      </div>
      <h1 className="secretary-comm-view-title">First Holy Communion Application Details</h1>
      
      {/* Communion Data Section */}
      <div className="secretary-comm-view-data">
        <div className="secretary-comm-view-row-date">
          <div className="secretary-comm-view-field-date">
            <label>Date of Holy Communion:</label>
            {renderReadOnlyField(formatDate(communionData.date))}
          </div>
          
          <div className="secretary-comm-view-field-time">
            <label>Time of Holy Communion:</label>
            {renderReadOnlyField(communionData.time)}
          </div>
        </div>

        <div className="secretary-comm-view-field-date">
          <label>Name of the Priest:</label>
          {renderReadOnlyField(communionData.priest)}
        </div>
        
        <div className="secretary-comm-view-bypart">
          <h3 className="secretary-comm-view-sub-title">Child's Information</h3>
          <div className="secretary-comm-view-info-card">
            <div className="secretary-comm-view-row">
              <div className="secretary-comm-view-field">
                <label>First Name:</label>
                {renderReadOnlyField(communionData.candidate.firstName)}
              </div>
              <div className="secretary-comm-view-field">
                <label>Middle Name:</label>
                {renderReadOnlyField(communionData.candidate.middleName)}
              </div>
              <div className="secretary-comm-view-field">
                <label>Last Name:</label>
                {renderReadOnlyField(communionData.candidate.lastName)}
              </div>
              <div className="secretary-comm-view-field">
                <label>Gender:</label>
                {renderReadOnlyField(communionData.candidate.gender)}
              </div>
            </div>
            
            <div className="secretary-comm-view-row">
              <div className="secretary-comm-view-field-ga">
                <label>Age:</label>
                {renderReadOnlyField(communionData.candidate.age)}
              </div>
              <div className="secretary-comm-view-field-ga">
                <label>Date of Birth:</label>
                {renderReadOnlyField(formatDate(communionData.candidate.dateOfBirth))}
              </div>
              <div className="secretary-comm-view-field">
                <label>Place of Birth:</label>
                {renderReadOnlyField(communionData.candidate.placeOfBirth)}
              </div>
            </div>
            
            <div className="secretary-comm-view-row">
              <div className="secretary-comm-view-field">
                <label>Date of Baptism:</label>
                {renderReadOnlyField(formatDate(communionData.candidate.dateOfBaptism))}
              </div>
              <div className="secretary-comm-view-field">
                <label>Church of Baptism:</label>
                {renderReadOnlyField(communionData.candidate.churchOfBaptism)}
              </div>
            </div>
            
            {/* Address Fields */}
            <div className="secretary-comm-view-row secretary-comm-address-view-row">
            <div className="secretary-comm-view-field">
                <label>Barangay:</label>
                {renderReadOnlyField(communionData.address.barangay)}
              </div>
              <div className="secretary-comm-view-field">
                <label>Street:</label>
                {renderReadOnlyField(communionData.address.street)}
              </div>
              <div className="secretary-comm-view-field">
                <label>Municipality:</label>
                {renderReadOnlyField(communionData.address.municipality)}
              </div>
              <div className="secretary-comm-view-field">
                <label>Province:</label>
                {renderReadOnlyField(communionData.address.province)}
              </div>
            </div>
          </div>

          {/* Father's Information */}
          <h3 className="secretary-comm-view-sub-title">Father's Information</h3>
          <div className="secretary-comm-view-info-card">
            <div className="secretary-comm-view-row">
              <div className="secretary-comm-view-field">
                <label>Father's First Name:</label>
                {renderReadOnlyField(communionData.father.firstName)}
              </div>
              <div className="secretary-comm-view-field">
                <label>Father's Middle Name:</label>
                {renderReadOnlyField(communionData.father.middleName)}
              </div>
              <div className="secretary-comm-view-field">
                <label>Father's Last Name:</label>
                {renderReadOnlyField(communionData.father.lastName)}
              </div>
            </div>
            
            <div className="secretary-comm-view-row">
            <div className="secretary-comm-view-field-fpob">
                <label>Father's Date of Birth:</label>
                {renderReadOnlyField(formatDate(communionData.father.dateOfBirth))}
              </div>
              <div className="secretary-comm-view-field">
                <label>Father's Place of Birth:</label>
                {renderReadOnlyField(communionData.father.placeOfBirth)}
              </div>
            </div>

            <div className="secretary-comm-view-row">
              <div className="secretary-comm-view-field">
                <label>Father's Educational Attainment:</label>
                {renderReadOnlyField(communionData.father.education)}
              </div>
              <div className="secretary-comm-view-field">
                <label>Father's Occupation:</label>
                {renderReadOnlyField(communionData.father.occupation)}
              </div>
              <div className="secretary-comm-view-field">
                <label>Father's Contact Number:</label>
                {renderReadOnlyField(communionData.father.contact)}
              </div>
            </div>
          </div>
          
          <h3 className="secretary-comm-view-sub-title">Mother's Information</h3>
          {/* Mother's Information */}
          <div className="secretary-comm-view-info-card">
            <div className="secretary-comm-view-row">
              <div className="secretary-comm-view-field">
                <label>Mother's First Name:</label>
                {renderReadOnlyField(communionData.mother.firstName)}
              </div>
              <div className="secretary-comm-view-field">
                <label>Mother's Middle Name:</label>
                {renderReadOnlyField(communionData.mother.middleName)}
              </div>
              <div className="secretary-comm-view-field">
                <label>Mother's Last Name:</label>
                {renderReadOnlyField(communionData.mother.lastName)}
              </div>
            </div>

            <div className="secretary-comm-view-row">
            <div className="secretary-comm-view-field-fpob">
                <label>Mother's Date of Birth:</label>
                {renderReadOnlyField(formatDate(communionData.mother.dateOfBirth))}
              </div>
              <div className="secretary-comm-view-field">
                <label>Mother's Place of Birth:</label>
                {renderReadOnlyField(communionData.mother.placeOfBirth)}
              </div>
            </div>

            <div className="secretary-comm-view-row">
              <div className="secretary-comm-view-field">
                <label>Mother's Educational Attainment:</label>
                {renderReadOnlyField(communionData.mother.education)}
              </div>
              <div className="secretary-comm-view-field">
                <label>Mother's Occupation:</label>
                {renderReadOnlyField(communionData.mother.occupation)}
              </div>
              <div className="secretary-comm-view-field">
                <label>Mother's Contact Number:</label>
                {renderReadOnlyField(communionData.mother.contact)}
              </div>
            </div>
          </div>
        </div>
        
        <div className="secretary-comm-requirements-view-container">
          <h2 className="secretary-comm-requirements-view-title">Requirements</h2>
          <div className="secretary-comm-requirements-view-box">
            <h3 className="secretary-comm-view-section-header">Documents Status</h3>
            <div className="secretary-comm-view-checkbox-list">
              {/* Baptism Certificate */}
              <div className="secretary-comm-requirement-view-item">
                <div className="secretary-comm-view-requirement-name">
                  Baptism Certificate (Proof of Catholic Baptism)
                </div>
                {renderDocumentStatus(
                  communionData.requirements.baptismCert.submitted, 
                  communionData.requirements.baptismCert.fileName
                )}
              </div>
              
              {/* First Communion Certificate */}
              <div className="secretary-comm-requirement-view-item">
                <div className="secretary-comm-view-requirement-name">
                  First Communion Certificate (If applicable, for record purposes)
                </div>
                {renderDocumentStatus(
                  communionData.requirements.firstCommunionCert.submitted, 
                  communionData.requirements.firstCommunionCert.fileName
                )}
              </div>
              
              {/* Birth Certificate */}
              <div className="secretary-comm-requirement-view-item">
                <div className="secretary-comm-view-requirement-name">
                  Birth Certificate (For age verification, required in some parishes)
                </div>
                {renderDocumentStatus(
                  communionData.requirements.birthCert.submitted, 
                  communionData.requirements.birthCert.fileName
                )}
              </div>
            </div>

            <h3 className="secretary-comm-view-section-header">Requirements for Candidate</h3>
            <div className="secretary-comm-info-view-list">
              <div className="secretary-comm-info-view-item">
                <p>Must be a baptized Catholic</p>
              </div>
              <div className="secretary-comm-info-view-item">
                <p>Must have reached the age of reason (usually around 7 years old)</p>
              </div>
              <div className="secretary-comm-info-view-item">
                <p>Must have received the Sacrament of Reconciliation (Confession) before First Communion</p>
              </div>
              <div className="secretary-comm-info-view-item">
                <p>Must attend a First Communion Catechesis or Religious Instruction Program</p>
              </div>
              <div className="secretary-comm-info-view-item">
                <p>Must understand the significance of the Holy Eucharist and believe in the real presence of Christ in the sacrament</p>
              </div>
              <div className="secretary-comm-info-view-item">
                <p>Must attend a First Communion Retreat (if required by the parish)</p>
              </div>
            </div>

            <h3 className="secretary-comm-view-section-header">Parish Requirements</h3>
            <div className="secretary-comm-info-view-list">
              <div className="secretary-comm-info-view-item">
                <p>Must be registered in the parish where First Communion will be received</p>
              </div>
              <div className="secretary-comm-info-view-item">
                <p>Must attend the required preparation classes and rehearsals</p>
              </div>
              <div className="secretary-comm-info-view-item">
                <p>Must participate in a First Communion Retreat (if required by the parish)</p>
              </div>
            </div>

            <h3 className="secretary-comm-view-section-header">Dress Code (If Specified by Parish)</h3>
            <div className="secretary-comm-info-view-list">
              <div className="secretary-comm-info-view-item">
                <p>Boys: White polo or barong, black pants, and formal shoes</p>
              </div>
              <div className="secretary-comm-info-view-item">
                <p>Girls: White dress with sleeves (modest), white veil (optional), and formal shoes</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons Section */}
        <div className="secretary-comm-action-buttons">
          <button 
            className="secretary-comm-submit-button"
            onClick={handleSubmit}
          >
            Submit
          </button>
          <button 
            className="secretary-comm-cancel-button"
            onClick={handleCancel}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default SecretaryCommunionView;