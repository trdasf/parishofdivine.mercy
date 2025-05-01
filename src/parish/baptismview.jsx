import React, { useState, useRef } from "react";
import { AiOutlineArrowLeft, AiOutlineEye, AiOutlineDownload } from "react-icons/ai"; 
import { useNavigate } from "react-router-dom";
import "./BaptismView.css";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const BaptismView = () => {
  // Navigation hook
  const navigate = useNavigate();
  
  // State for status and document viewing
  const [viewingDocument, setViewingDocument] = useState(null);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const certificateRef = useRef(null);
  const [isDownloading, setIsDownloading] = useState(false);

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
    },
    // Added certificate details
    certificate: {
      bookNumber: "1",
      pageNumber: "43",
      lineNumber: "22",
      dateIssued: "June 03, 2024",
      purposeOf: "Reference"
    },
    status: "PENDING" // Display only
  };

  // Handle back button to navigate to previous page
  const handleBackClick = () => {
    // Use browser history to go back to the previous page
    navigate(-1);
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
      const fileName = `Baptism_Certificate_${baptismData.child.firstName}_${baptismData.child.lastName}.pdf`;
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
    return <div className="baptism-view-value">{value || "N/A"}</div>;
  };

  // Function to render document status with view button
  const renderDocumentStatus = (isSubmitted, fileName) => {
    return (
      <div className="baptism-document-status-container">
        <div className={`baptism-view-status ${isSubmitted ? 'baptism-view-submitted' : 'baptism-view-not-submitted'}`}>
          {isSubmitted ? `Submitted: ${fileName}` : "Not Submitted"}
        </div>
        {isSubmitted && (
          <button 
            className="baptism-view-document-btn"
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
      <div className="baptism-document-viewer-overlay">
        <div className="baptism-document-viewer-container">
          <div className="baptism-document-viewer-header">
            <h3>{viewingDocument}</h3>
            <button 
              className="baptism-document-close-btn"
              onClick={() => setViewingDocument(null)}
            >
              ×
            </button>
          </div>
          <div className="baptism-document-viewer-content">
            {/* In a real application, this would display the actual document */}
            <div className="baptism-document-placeholder">
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

    return (
      <div className="baptism-document-viewer-overlay">
        <div className="baptism-certificate-modal-container">
          <div className="baptism-document-viewer-header">
            <h3>Baptism Certificate</h3>
            <button 
              className="baptism-document-close-btn"
              onClick={() => setShowCertificateModal(false)}
            >
              ×
            </button>
          </div>
          <div className="baptism-certificate-modal-content">
            <p>Would you like to download this certificate?</p>
            
            {/* Certificate Preview based on the image */}
            <div ref={certificateRef} className="baptism-certificate-preview">
              <div className="certificate-header">
                <div className="certificate-logos">
                  <div className="parish-logo-left">
                  <img src="/src/assets/church2.jpg" alt="Parish Logo Left" />
                </div>
                <div className="parish-title">
                  <div className="diocese-title">DIOCESE OF DAET</div>
                  <div className="parish-name">PARISH OF THE DIVINE MERCY</div>
                  <div className="parish-address">Alawihao, Daet, Camarines Norte</div>
                </div>
                <div className="parish-logo-right">
                  <img src="/src/assets/pdmlogo.png" alt="Parish Logo Right" />
                </div>
                </div>
                
                <h1 className="certificate-title">CERTIFICATE OF BAPTISM</h1>
              </div>
              
              <div className="certificate-details">
                <div className="certificate-row">
                  <div className="certificate-label">NAME</div>
                  <div className="certificate-value">{baptismData.child.firstName} {baptismData.child.middleName} {baptismData.child.lastName}</div>
                </div>
                <div className="certificate-row">
                  <div className="certificate-label">DATE OF BIRTH</div>
                  <div className="certificate-value">{formatDate(baptismData.child.dateOfBirth)}</div>
                </div>
                <div className="certificate-row">
                  <div className="certificate-label">PLACE OF BIRTH</div>
                  <div className="certificate-value">{baptismData.child.placeOfBirth}</div>
                </div>
                <div className="certificate-row">
                  <div className="certificate-label">LEGITIMACY</div>
                  <div className="certificate-value">{baptismData.maritalStatus.type === 'Catholic' ? 'Legitimate' : 'Natural'}</div>
                </div>
                <div className="certificate-row">
                  <div className="certificate-label">FATHER</div>
                  <div className="certificate-value">{baptismData.father.firstName} {baptismData.father.middleName} {baptismData.father.lastName}</div>
                </div>
                <div className="certificate-row">
                  <div className="certificate-label">PLACE OF BIRTH</div>
                  <div className="certificate-value">{baptismData.father.placeOfBirth}</div>
                </div>
                <div className="certificate-row">
                  <div className="certificate-label">MOTHER</div>
                  <div className="certificate-value">{baptismData.mother.firstName} {baptismData.mother.middleName} {baptismData.mother.lastName}</div>
                </div>
                <div className="certificate-row">
                  <div className="certificate-label">PLACE OF BIRTH</div>
                  <div className="certificate-value">{baptismData.mother.placeOfBirth}</div>
                </div>
                <div className="certificate-row">
                  <div className="certificate-label">DATE OF BAPTISM</div>
                  <div className="certificate-value">{formatDate(baptismData.date)}</div>
                </div>
                <div className="certificate-row">
                  <div className="certificate-label">RESIDENCE</div>
                  <div className="certificate-value">{baptismData.address.street}, {baptismData.address.municipality}, {baptismData.address.province}</div>
                </div>
                <div className="certificate-row">
                  <div className="certificate-label">MINISTER</div>
                  <div className="certificate-value">{baptismData.priest}</div>
                </div>
                <div className="certificate-row">
                  <div className="certificate-label">GODFATHER</div>
                  <div className="certificate-value">{baptismData.godParents[0].name}</div>
                </div>
                <div className="certificate-row">
                  <div className="certificate-label">RESIDENCE</div>
                  <div className="certificate-value">{baptismData.godParents[0].address}</div>
                </div>
                <div className="certificate-row">
                  <div className="certificate-label">GODMOTHER</div>
                  <div className="certificate-value">{baptismData.godParents[1].name}</div>
                </div>
                <div className="certificate-row">
                  <div className="certificate-label">RESIDENCE</div>
                  <div className="certificate-value">{baptismData.godParents[1].address}</div>
                </div>
              </div>
              
              <div className="certificate-footer">
                <div className="certificate-reference">
                  <div className="reference-row">
                    <span className="reference-label">Book Number</span>
                    <span className="reference-value">{baptismData.certificate.bookNumber}</span>
                  </div>
                  <div className="reference-row">
                    <span className="reference-label">Page and Line Number</span>
                    <span className="reference-value">{baptismData.certificate.pageNumber}/{baptismData.certificate.lineNumber}</span>
                  </div>
                  <div className="reference-row">
                    <span className="reference-label">Date Issued</span>
                    <span className="reference-value">{formatDate(baptismData.certificate.dateIssued)}</span>
                  </div>
                  <div className="reference-row">
                    <span className="reference-label">For the purpose of</span>
                    <span className="reference-value">{baptismData.certificate.purposeOf}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="baptism-certificate-modal-actions">
              <button 
                className="baptism-certificate-download-btn"
                onClick={downloadCertificateAsPDF}
                disabled={isDownloading}
              >
                {isDownloading ? 'Processing...' : <><AiOutlineDownload /> Download</>}
              </button>
              <button 
                className="baptism-certificate-cancel-btn"
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
    <div className="baptism-view-container">
      {/* Document Viewer Modal */}
      {renderDocumentViewer()}
      
      {/* Certificate Download Modal */}
      {renderCertificateModal()}
      
      {/* Header */}
      <div className="baptism-view-header">
        <div className="baptism-view-left-section">
          <button className="baptism-view-back-button" onClick={handleBackClick}>
            <AiOutlineArrowLeft className="baptism-view-back-icon" /> Back
          </button>
        </div>
        <div className="baptism-view-right-section">
          <div className="baptism-view-status-display">
            Status: <span className="baptism-status-label">{baptismData.status}</span>
          </div>
          <button 
            className="baptism-download-certificate-btn"
            onClick={handleDownloadCertificate}
          >
            <AiOutlineDownload /> Download Certificate
          </button>
        </div>
      </div>
      <h1 className="baptism-view-title">Baptism Application Details</h1>
      
      {/* Baptismal Data Section */}
      <div className="baptism-view-data">
        <div className="baptism-view-row-date">
          <div className="baptism-view-field-date">
            <label>Date of Baptism:</label>
            {renderReadOnlyField(formatDate(baptismData.date))}
          </div>
          
          <div className="baptism-view-field-time">
            <label>Time of Baptism:</label>
            {renderReadOnlyField(baptismData.time)}
          </div>
        </div>

        <div className="baptism-view-field-date">
          <label>Name of the Priest:</label>
          {renderReadOnlyField(baptismData.priest)}
        </div>
        
        <div className="baptism-view-bypart">
          <h3 className="baptism-view-sub-title">Baptism Information</h3>
          <div className="baptism-view-info-card">
            <div className="baptism-view-row">
              <div className="baptism-view-field">
                <label>First Name of the Baptized:</label>
                {renderReadOnlyField(baptismData.child.firstName)}
              </div>
              <div className="baptism-view-field">
                <label>Middle Name of the Baptized:</label>
                {renderReadOnlyField(baptismData.child.middleName)}
              </div>
              <div className="baptism-view-field">
                <label>Last Name of the Baptized:</label>
                {renderReadOnlyField(baptismData.child.lastName)}
              </div>
              <div className="baptism-view-field">
                <label>Gender:</label>
                {renderReadOnlyField(baptismData.child.gender)}
              </div>
            </div>
            
            <div className="baptism-view-row">
              <div className="baptism-view-field-ga">
                <label>Age:</label>
                {renderReadOnlyField(baptismData.child.age)}
              </div>
              <div className="baptism-view-field-ga">
                <label>Date of Birth:</label>
                {renderReadOnlyField(formatDate(baptismData.child.dateOfBirth))}
              </div>
              <div className="baptism-view-field">
                <label>Place of Birth:</label>
                {renderReadOnlyField(baptismData.child.placeOfBirth)}
              </div>
            </div>
          </div>

          {/* Father's Information */}
          <h3 className="baptism-view-sub-title">Father Information</h3>
          <div className="baptism-view-info-card">
            <div className="baptism-view-row">
              <div className="baptism-view-field">
                <label>Father's First Name:</label>
                {renderReadOnlyField(baptismData.father.firstName)}
              </div>
              <div className="baptism-view-field">
                <label>Father's Middle Name:</label>
                {renderReadOnlyField(baptismData.father.middleName)}
              </div>
              <div className="baptism-view-field">
                <label>Father's Last Name:</label>
                {renderReadOnlyField(baptismData.father.lastName)}
              </div>
            </div>
            
            <div className="baptism-view-row">
              <div className="baptism-view-field-fpob">
                <label>Father's Date of Birth:</label>
                {renderReadOnlyField(formatDate(baptismData.father.dateOfBirth))}
              </div>
              <div className="baptism-view-field">
                <label>Father's Place of Birth:</label>
                {renderReadOnlyField(baptismData.father.placeOfBirth)}
              </div>
            </div>

            <div className="baptism-view-row">
              <div className="baptism-view-field">
                <label>Father's Educational Attainment:</label>
                {renderReadOnlyField(baptismData.father.education)}
              </div>
              <div className="baptism-view-field">
                <label>Father's Occupation:</label>
                {renderReadOnlyField(baptismData.father.occupation)}
              </div>
              <div className="baptism-view-field">
                <label>Father's Contact Number:</label>
                {renderReadOnlyField(baptismData.father.contact)}
              </div>
            </div>
          </div>
          
          <h3 className="baptism-view-sub-title">Mother Information</h3>
          {/* Mother's Information */}
          <div className="baptism-view-info-card">
            <div className="baptism-view-row">
              <div className="baptism-view-field">
                <label>Mother's First Name:</label>
                {renderReadOnlyField(baptismData.mother.firstName)}
              </div>
              <div className="baptism-view-field">
                <label>Mother's Middle Name:</label>
                {renderReadOnlyField(baptismData.mother.middleName)}
              </div>
              <div className="baptism-view-field">
                <label>Mother's Last Name:</label>
                {renderReadOnlyField(baptismData.mother.lastName)}
              </div>
            </div>

            <div className="baptism-view-row">
              <div className="baptism-view-field-fpob">
                <label>Mother's Date of Birth:</label>
                {renderReadOnlyField(formatDate(baptismData.mother.dateOfBirth))}
              </div>
              <div className="baptism-view-field">
                <label>Mother's Place of Birth:</label>
                {renderReadOnlyField(baptismData.mother.placeOfBirth)}
              </div>
            </div>

            <div className="baptism-view-row">
              <div className="baptism-view-field">
                <label>Mother's Educational Attainment:</label>
                {renderReadOnlyField(baptismData.mother.education)}
              </div>
              <div className="baptism-view-field">
                <label>Mother's Occupation:</label>
                {renderReadOnlyField(baptismData.mother.occupation)}
              </div>
              <div className="baptism-view-field">
                <label>Mother's Contact Number:</label>
                {renderReadOnlyField(baptismData.mother.contact)}
              </div>
            </div>
          </div>
          
          <h3 className="baptism-view-sub-title">Parents Marital Status</h3>
          <div className="baptism-view-info-card">
            <div className="baptism-view-row-pms">
              <div className="baptism-marital-view-status">
                <label className="baptism-view-section-label">Parents' marital status:</label>
                <div className="baptism-marital-view-options">
                  <div className="baptism-view-pms-label">
                    <span className={`baptism-view-checkbox ${baptismData.maritalStatus.type === 'Catholic' ? 'baptism-view-checked' : ''}`}></span>
                    <label>Catholic</label>
                  </div>
                  <div className="baptism-view-pms-label">
                    <span className={`baptism-view-checkbox ${baptismData.maritalStatus.type === 'Civil' ? 'baptism-view-checked' : ''}`}></span>
                    <label>Civil</label>
                  </div>
                  <div className="baptism-view-pms-label">
                    <span className={`baptism-view-checkbox ${baptismData.maritalStatus.type === 'Living Together' ? 'baptism-view-checked' : ''}`}></span>
                    <label>Living Together</label>
                  </div>
                </div>
              </div>

              <div className="baptism-years-view-married">
                <label>Number of Years Married: </label>
                <span className="baptism-view-years">{baptismData.maritalStatus.yearsMarried}</span>
              </div>
            </div>
          
            {/* Address Fields - As read-only displays */}
            <div className="baptism-view-row baptism-address-view-row">
            <div className="baptism-view-field">
                <label>Barangay:</label>
                {renderReadOnlyField(baptismData.address.barangay)}
              </div>
              <div className="baptism-view-field">
                <label>Street:</label>
                {renderReadOnlyField(baptismData.address.street)}
              </div>
              <div className="baptism-view-field">
                <label>Municipality:</label>
                {renderReadOnlyField(baptismData.address.municipality)}
              </div>
              <div className="baptism-view-field">
                <label>Province:</label>
                {renderReadOnlyField(baptismData.address.province)}
              </div>
            </div>
          </div>
          
          <div className="baptism-view-bypart">
            <h3 className="baptism-view-sub-title">Godparents Information</h3>
            <div className="baptism-view-info-card">
              {baptismData.godParents.map((godparent, index) => (
                <div key={index} className="baptism-godparent-item">
                  <h4 className="baptism-view-godparent-header">
                    {index === 0 ? "Godfather (Ninong)" : "Godmother (Ninang)"}
                  </h4>
                  <div className="baptism-view-row">
                    <div className="baptism-view-field">
                      <label>{index === 0 ? "Godfather's Name:" : "Godmother's Name:"}</label>
                      {renderReadOnlyField(godparent.name)}
                    </div>
                  </div>
                  {index < baptismData.godParents.length - 1 && <hr className="baptism-view-godparent-divider" />}
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="baptism-requirements-view-container">
          <h2 className="baptism-requirements-view-title">Requirements</h2>
          <div className="baptism-requirements-view-box">
            <h3 className="baptism-view-section-header">Documents Status</h3>
            <div className="baptism-view-checkbox-list">
              {/* Birth Certificate */}
              <div className="baptism-requirement-view-item">
                <div className="baptism-view-requirement-name">
                  Birth Certificate of the Child (PSA or local civil registrar copy)
                </div>
                {renderDocumentStatus(
                  baptismData.requirements.birthCert.submitted, 
                  baptismData.requirements.birthCert.fileName
                )}
              </div>
              
              {/* Marriage Certificate */}
              <div className="baptism-requirement-view-item">
                <div className="baptism-view-requirement-name">
                  Parents' Marriage Certificate (If married in the Church)
                </div>
                {renderDocumentStatus(
                  baptismData.requirements.marriageCert.submitted, 
                  baptismData.requirements.marriageCert.fileName
                )}
              </div>
              
              {/* Valid IDs */}
              <div className="baptism-requirement-view-item">
                <div className="baptism-view-requirement-name">
                  Valid IDs of Parents and Godparents
                </div>
                {renderDocumentStatus(
                  baptismData.requirements.validIds.submitted, 
                  baptismData.requirements.validIds.fileName
                )}
              </div>
            </div>

            <h3 className="baptism-view-section-header">Requirements for Parent</h3>
            <div className="baptism-info-view-list">
              <div className="baptism-info-view-item">
                <p>At least one parent must be Catholic</p>
              </div>
              <div className="baptism-info-view-item">
                <p>Parents should be willing to raise the child in the Catholic faith</p>
              </div>
              <div className="baptism-info-view-item">
                <p>Must attend Pre-Baptismal Seminar (Required in most parishes)</p>
              </div>
            </div>

            <h3 className="baptism-view-section-header">Requirements for Godparents</h3>
            <div className="baptism-info-view-list">
              <div className="baptism-info-view-item">
                <p>Must be a practicing Catholic</p>
              </div>
              <div className="baptism-info-view-item">
                <p>Must have received the Sacraments of Baptism, Confirmation, and Holy Eucharist</p>
              </div>
              <div className="baptism-info-view-item">
                <p>Must be at least 16 years old</p>
              </div>
              <div className="baptism-info-view-item">
                <p>If married, must be married in the Catholic Church</p>
              </div>
              <div className="baptism-info-view-item">
                <p>Confirmation Certificate (Some parishes require this for proof of faith practice)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BaptismView;