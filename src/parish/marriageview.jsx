import React, { useState, useRef } from "react";
import { AiOutlineArrowLeft, AiOutlineEye, AiOutlineDownload } from "react-icons/ai"; 
import "./MarriageView.css";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const MarriageView = () => {
  // State for status and document viewing
  const [viewingDocument, setViewingDocument] = useState(null);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [currentCertificatePage, setCurrentCertificatePage] = useState(1);
  const certificateRef = useRef(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // Sample data (in a real app, this would come from props or API)
  const marriageData = {
    date: "May 15, 2025",
    time: "2:00 PM",
    priest: "Fr. José Chito M. Estrella",
    groom: {
      firstName: "Juan",
      middleName: "Dela",
      lastName: "Cruz",
      age: "28",
      dateOfBirth: "June 12, 1997",
      placeOfBirth: "Manila City",
      dateOfBaptism: "August 30, 1997",
      churchOfBaptism: "San Agustin Church",
      address: {
        street: "Rizal Street",
        municipality: "Manila City",
        province: "Metro Manila"
      }
    },
    bride: {
      firstName: "Maria",
      middleName: "Santos",
      lastName: "Reyes",
      age: "26",
      dateOfBirth: "April 15, 1999",
      placeOfBirth: "Quezon City",
      dateOfBaptism: "June 20, 1999",
      churchOfBaptism: "Quiapo Church",
      address: {
        street: "Mabini Avenue",
        municipality: "Quezon City",
        province: "Metro Manila"
      }
    },
    witnesses: [
      {
        firstName: "Pedro",
        middleName: "Garcia",
        lastName: "Santos",
        gender: "Male",
        age: "35",
        dateOfBirth: "March 3, 1990",
        contact: "09123456789",
        address: {
          street: "Quezon Boulevard",
          municipality: "Manila City",
          province: "Metro Manila"
        }
      },
      {
        firstName: "Ana",
        middleName: "Lopez",
        lastName: "Tan",
        gender: "Female",
        age: "32",
        dateOfBirth: "September 10, 1993",
        contact: "09876543210",
        address: {
          street: "Recto Avenue",
          municipality: "Manila City",
          province: "Metro Manila"
        }
      }
    ],
    requirements: {
      baptismalCert: {
        submitted: true,
        fileName: "BaptismalCertificates_CoupleNames.pdf"
      },
      confirmationCert: {
        submitted: true,
        fileName: "ConfirmationCertificates_CoupleNames.pdf"
      },
      birthCert: {
        submitted: true,
        fileName: "BirthCertificates_CoupleNames.pdf"
      },
      marriageLicense: {
        submitted: true,
        fileName: "MarriageLicense_CoupleNames.pdf"
      },
      cenomar: {
        submitted: true,
        fileName: "CENOMAR_CoupleNames.pdf"
      },
      // Add these entries to the requirements object in marriageData

publicationBanns: {
  submitted: true,
  fileName: "PublicationOfBanns_CoupleNames.pdf"
},
permitFromParish: {
  submitted: false,
  fileName: "ParishPermit_CoupleNames.pdf"
},
preCana: {
  submitted: true,
  fileName: "PreCanaSeminar_CoupleNames.pdf"
},
sponsorsList: {
  submitted: true,
  fileName: "SponsorsList_CoupleNames.pdf"
},
weddingPractice: {
  submitted: false,
  fileName: "WeddingPracticeConfirmation.pdf"
},
canonicalInterview: {
  submitted: true,
  fileName: "CanonicalInterview_CoupleNames.pdf"
}
    },
    // Certificate details
    certificate: {
      registerNumber: "2025-0123",
      pageNumber: "45",
      lineNumber: "12",
      dateIssued: "May 20, 2025",
      registry: {
        province: "Camarines Norte",
        city: "Daet",
        registryNo: "2025-M-0123",
      },
      solemnizer: {
        name: "Fr. José Chito M. Estrella",
        position: "Parish Priest",
        address: "Parish of the Divine Mercy, Alawihao, Daet, Camarines Norte"
      }
    }
  };

  // Function to handle download certificate
  const handleDownloadCertificate = () => {
    setShowCertificateModal(true);
    setCurrentCertificatePage(1);
  };

  // Function to switch certificate pages
  const handleSwitchPage = (pageNumber) => {
    setCurrentCertificatePage(pageNumber);
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
      
      // Create a new PDF document
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // For first page
      setCurrentCertificatePage(1);
      await new Promise(resolve => setTimeout(resolve, 100)); // Small delay for page to render

      let canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });
      
      let imgData = canvas.toDataURL('image/png');
      
      // Calculate PDF dimensions based on the canvas aspect ratio
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Add the first page
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      
      // For second page
      setCurrentCertificatePage(2);
      await new Promise(resolve => setTimeout(resolve, 100)); // Small delay for page to render
      
      canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });
      
      imgData = canvas.toDataURL('image/png');
      
      // Add new page and add the second certificate page
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      
      // Save the PDF
      const fileName = `Marriage_Certificate_${marriageData.groom.lastName}_${marriageData.bride.lastName}.pdf`;
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
    return <div className="marriage-view-value">{value || "N/A"}</div>;
  };

  // Function to render document status with view button
  const renderDocumentStatus = (isSubmitted, fileName) => {
    return (
      <div className="marriage-document-status-container">
        <div className={`marriage-view-status ${isSubmitted ? 'marriage-view-submitted' : 'marriage-view-not-submitted'}`}>
          {isSubmitted ? `Submitted: ${fileName}` : "Not Submitted"}
        </div>
        {isSubmitted && (
          <button 
            className="marriage-view-document-btn"
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
      <div className="marriage-document-viewer-overlay">
        <div className="marriage-document-viewer-container">
          <div className="marriage-document-viewer-header">
            <h3>{viewingDocument}</h3>
            <button 
              className="marriage-document-close-btn"
              onClick={() => setViewingDocument(null)}
            >
              ×
            </button>
          </div>
          <div className="marriage-document-viewer-content">
            {/* In a real application, this would display the actual document */}
            <div className="marriage-document-placeholder">
              <p>Document preview would be displayed here.</p>
              <p>Filename: {viewingDocument}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Certificate download modal
  const renderCertificateModal = () => {
    if (!showCertificateModal) return null;

    // Extract month and day from marriage date
    const { month, day } = extractMonthDayFromDate(marriageData.date);
    const year = new Date(marriageData.date).getFullYear();

    return (
      <div className="marriage-document-viewer-overlay">
        <div className="marriage-certificate-modal-container">
          <div className="marriage-document-viewer-header">
            <h3>Marriage Certificate</h3>
            <button 
              className="marriage-document-close-btn"
              onClick={() => setShowCertificateModal(false)}
            >
              ×
            </button>
          </div>
          <div className="marriage-certificate-modal-content">
            <div className="marriage-certificate-page-tabs">
              <button 
                className={`marriage-certificate-page-tab ${currentCertificatePage === 1 ? 'active' : ''}`}
                onClick={() => handleSwitchPage(1)}
              >
                Page 1
              </button>
              <button 
                className={`marriage-certificate-page-tab ${currentCertificatePage === 2 ? 'active' : ''}`}
                onClick={() => handleSwitchPage(2)}
              >
                Page 2
              </button>
            </div>
            
            {/* Certificate Preview */}
            <div ref={certificateRef} className="marriage-certificate-preview">
              {currentCertificatePage === 1 ? (
                <div className="marriage-certificate-page-1">
                  <div className="marriage-certificate-header">
                  <div className="marriage-certificate-logos">
                  <div className="marriage-parish-logo-left">
                  <img src="/src/assets/church2.jpg" alt="Parish Logo Left" />
                </div>
                    <div className="marriage-certificate-title-section">
                      <div className="republic-title">REPUBLIC OF THE PHILIPPINES</div>
                      <div className="office-title">OFFICE OF THE CIVIL REGISTRAR GENERAL</div>
                      <div className="certificate-title">CERTIFICATE OF MARRIAGE</div>
                    </div>
                <div className="marriage-parish-logo-right">
                  <img src="/src/assets/pdmlogo.png" alt="Parish Logo Right" />
                </div>
                </div>
                    <div className="marriage-certificate-registry-info">
                      <div className="registry-fields">
                        <div className="registry-field">
                          <span className="registry-label">Registry No.: </span>
                          <span className="registry-value">{marriageData.certificate.registry.registryNo}</span>
                        </div>
                        <div className="registry-field">
                          <span className="registry-label">Province: </span>
                          <span className="registry-value">{marriageData.certificate.registry.province}</span>
                        </div>
                        <div className="registry-field">
                          <span className="registry-label">City/Municipality: </span>
                          <span className="registry-value">{marriageData.certificate.registry.city}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="marriage-certificate-main-content">
                    <div className="marriage-certificate-section husband-wife-section">
                      <div className="husband-section">
                        <div className="section-title">HUSBAND</div>
                        <div className="person-fields">
                          <div className="person-field">
                            <span className="field-label">1. Name of Contracting Party</span>
                            <div className="name-parts">
                              <div className="name-part">
                                <span className="name-value">{marriageData.groom.firstName}</span>
                                <span className="name-label">(First)</span>
                              </div>
                              <div className="name-part">
                                <span className="name-value">{marriageData.groom.middleName}</span>
                                <span className="name-label">(Middle)</span>
                              </div>
                              <div className="name-part">
                                <span className="name-value">{marriageData.groom.lastName}</span>
                                <span className="name-label">(Last)</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="person-field">
                            <span className="field-label">2. Date of Birth</span>
                            <div className="date-parts">
                              <div className="date-part">
                                <span className="date-value">{new Date(marriageData.groom.dateOfBirth).getDate()}</span>
                                <span className="date-label">(Day)</span>
                              </div>
                              <div className="date-part">
                                <span className="date-value">{new Date(marriageData.groom.dateOfBirth).getMonth() + 1}</span>
                                <span className="date-label">(Month)</span>
                              </div>
                              <div className="date-part">
                                <span className="date-value">{new Date(marriageData.groom.dateOfBirth).getFullYear()}</span>
                                <span className="date-label">(Year)</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="person-field">
                            <span className="field-label">3. Place of Birth</span>
                            <span className="field-value">{marriageData.groom.placeOfBirth}</span>
                          </div>
                          
                          <div className="person-field">
                            <span className="field-label">4. Citizenship</span>
                            <span className="field-value">Filipino</span>
                          </div>
                          
                          <div className="person-field">
                            <span className="field-label">5. Residence</span>
                            <span className="field-value">{`${marriageData.groom.address.street}, ${marriageData.groom.address.municipality}, ${marriageData.groom.address.province}`}</span>
                          </div>
                          
                          <div className="person-field">
                            <span className="field-label">6. Religion/Religious Sect</span>
                            <span className="field-value">Roman Catholic</span>
                          </div>
                          
                          <div className="person-field">
                            <span className="field-label">7. Civil Status</span>
                            <span className="field-value">Single</span>
                          </div>
                          
                          <div className="person-field">
                            <span className="field-label">8. Name of Father</span>
                            <div className="name-parts">
                              <div className="name-part">
                                <span className="name-value"></span>
                                <span className="name-label">(First)</span>
                              </div>
                              <div className="name-part">
                                <span className="name-value"></span>
                                <span className="name-label">(Middle)</span>
                              </div>
                              <div className="name-part">
                                <span className="name-value"></span>
                                <span className="name-label">(Last)</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="person-field">
                            <span className="field-label">9. Citizenship</span>
                            <span className="field-value">Filipino</span>
                          </div>
                          
                          <div className="person-field">
                            <span className="field-label">10. Mother's Maiden Name</span>
                            <div className="name-parts">
                              <div className="name-part">
                                <span className="name-value"></span>
                                <span className="name-label">(First)</span>
                              </div>
                              <div className="name-part">
                                <span className="name-value"></span>
                                <span className="name-label">(Middle)</span>
                              </div>
                              <div className="name-part">
                                <span className="name-value"></span>
                                <span className="name-label">(Last)</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="person-field">
                            <span className="field-label">11. Citizenship</span>
                            <span className="field-value">Filipino</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="wife-section">
                        <div className="section-title">WIFE</div>
                        <div className="person-fields">
                          <div className="person-field">
                            <span className="field-label">1. Name of Contracting Party</span>
                            <div className="name-parts">
                              <div className="name-part">
                                <span className="name-value">{marriageData.bride.firstName}</span>
                                <span className="name-label">(First)</span>
                              </div>
                              <div className="name-part">
                                <span className="name-value">{marriageData.bride.middleName}</span>
                                <span className="name-label">(Middle)</span>
                              </div>
                              <div className="name-part">
                                <span className="name-value">{marriageData.bride.lastName}</span>
                                <span className="name-label">(Last)</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="person-field">
                            <span className="field-label">2. Date of Birth</span>
                            <div className="date-parts">
                              <div className="date-part">
                                <span className="date-value">{new Date(marriageData.bride.dateOfBirth).getDate()}</span>
                                <span className="date-label">(Day)</span>
                              </div>
                              <div className="date-part">
                                <span className="date-value">{new Date(marriageData.bride.dateOfBirth).getMonth() + 1}</span>
                                <span className="date-label">(Month)</span>
                              </div>
                              <div className="date-part">
                                <span className="date-value">{new Date(marriageData.bride.dateOfBirth).getFullYear()}</span>
                                <span className="date-label">(Year)</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="person-field">
                            <span className="field-label">3. Place of Birth</span>
                            <span className="field-value">{marriageData.bride.placeOfBirth}</span>
                          </div>
                          
                          <div className="person-field">
                            <span className="field-label">4. Citizenship</span>
                            <span className="field-value">Filipino</span>
                          </div>
                          
                          <div className="person-field">
                            <span className="field-label">5. Residence</span>
                            <span className="field-value">{`${marriageData.bride.address.street}, ${marriageData.bride.address.municipality}, ${marriageData.bride.address.province}`}</span>
                          </div>
                          
                          <div className="person-field">
                            <span className="field-label">6. Religion/Religious Sect</span>
                            <span className="field-value">Roman Catholic</span>
                          </div>
                          
                          <div className="person-field">
                            <span className="field-label">7. Civil Status</span>
                            <span className="field-value">Single</span>
                          </div>
                          
                          <div className="person-field">
                            <span className="field-label">8. Name of Father</span>
                            <div className="name-parts">
                              <div className="name-part">
                                <span className="name-value"></span>
                                <span className="name-label">(First)</span>
                              </div>
                              <div className="name-part">
                                <span className="name-value"></span>
                                <span className="name-label">(Middle)</span>
                              </div>
                              <div className="name-part">
                                <span className="name-value"></span>
                                <span className="name-label">(Last)</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="person-field">
                            <span className="field-label">9. Citizenship</span>
                            <span className="field-value">Filipino</span>
                          </div>
                          
                          <div className="person-field">
                            <span className="field-label">10. Mother's Maiden Name</span>
                            <div className="name-parts">
                              <div className="name-part">
                                <span className="name-value"></span>
                                <span className="name-label">(First)</span>
                              </div>
                              <div className="name-part">
                                <span className="name-value"></span>
                                <span className="name-label">(Middle)</span>
                              </div>
                              <div className="name-part">
                                <span className="name-value"></span>
                                <span className="name-label">(Last)</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="person-field">
                            <span className="field-label">11. Citizenship</span>
                            <span className="field-value">Filipino</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="marriage-certificate-section marriage-details-section">
                      <div className="marriage-field">
                        <span className="field-label">12. Place of Marriage</span>
                        <span className="field-value">Parish of the Divine Mercy, Alawihao, Daet, Camarines Norte</span>
                      </div>
                      
                      <div className="marriage-field">
                        <span className="field-label">13. Date of Marriage</span>
                        <div className="date-parts">
                          <div className="date-part">
                            <span className="date-value">{day}</span>
                            <span className="date-label">(Day)</span>
                          </div>
                          <div className="date-part">
                            <span className="date-value">{new Date(marriageData.date).getMonth() + 1}</span>
                            <span className="date-label">(Month)</span>
                          </div>
                          <div className="date-part">
                            <span className="date-value">{year}</span>
                            <span className="date-label">(Year)</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="marriage-certificate-page-2">
                  <div className="marriage-certificate-header">
                    <div className="marriage-certificate-title-section">
                      <div className="certificate-page-title">CERTIFICATE OF MARRIAGE</div>
                    </div>
                  </div>
                  
                  <div className="marriage-certificate-main-content">
                    <div className="marriage-certificate-section certification-section">
                      <div className="certification-header">
                        <h3>I CERTIFY THAT THE ABOVE-NAMED PARTIES</h3>
                      </div>
                      
                      <div className="certification-statement">
                        <p>
                          This is to certify that <strong>{marriageData.groom.firstName} {marriageData.groom.middleName} {marriageData.groom.lastName}</strong> and <strong>{marriageData.bride.firstName} {marriageData.bride.middleName} {marriageData.bride.lastName}</strong>, both of legal age, were united in the Holy Sacrament of Matrimony on the <strong>{day}th</strong> day of <strong>{month}</strong> in the year <strong>{year}</strong>, at the Parish of the Divine Mercy, Alawihao, Daet, Camarines Norte, Philippines, according to the rites of the Roman Catholic Church.
                        </p>
                        <p>
                          The marriage was solemnized by <strong>{marriageData.certificate.solemnizer.name}</strong>, {marriageData.certificate.solemnizer.position}, in the presence of witnesses <strong>{marriageData.witnesses[0].firstName} {marriageData.witnesses[0].middleName} {marriageData.witnesses[0].lastName}</strong> and <strong>{marriageData.witnesses[1].firstName} {marriageData.witnesses[1].middleName} {marriageData.witnesses[1].lastName}</strong>.
                        </p>
                      </div>
                      
                      <div className="certification-signatures">
                        <div className="signature-section">
                          <div className="signature-placeholder">
                            <p>Signature of Husband</p>
                            <div className="signature-line"></div>
                            <p>{marriageData.groom.firstName} {marriageData.groom.middleName} {marriageData.groom.lastName}</p>
                          </div>
                          
                          <div className="signature-placeholder">
                            <p>Signature of Wife</p>
                            <div className="signature-line"></div>
                            <p>{marriageData.bride.firstName} {marriageData.bride.middleName} {marriageData.bride.lastName}</p>
                          </div>
                        </div>
                        
                        <div className="witness-signatures">
                          <div className="signature-placeholder">
                            <p>Witness</p>
                            <div className="signature-line"></div>
                            <p>{marriageData.witnesses[0].firstName} {marriageData.witnesses[0].middleName} {marriageData.witnesses[0].lastName}</p>
                          </div>
                          
                          <div className="signature-placeholder">
                            <p>Witness</p>
                            <div className="signature-line"></div>
                            <p>{marriageData.witnesses[1].firstName} {marriageData.witnesses[1].middleName} {marriageData.witnesses[1].lastName}</p>
                          </div>
                        </div>
                        
                        <div className="solemnizer-signature">
                          <div className="signature-placeholder">
                            <p>Solemnizing Officer</p>
                            <div className="signature-line"></div>
                            <p>{marriageData.certificate.solemnizer.name}</p>
                            <p>{marriageData.certificate.solemnizer.position}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="certification-footer">
                        <div className="registry-details">
                          <p><strong>Registry No:</strong> {marriageData.certificate.registry.registryNo}</p>
                          <p><strong>Date Issued:</strong> {formatDate(marriageData.certificate.dateIssued)}</p>
                        </div>
                        
                        <div className="parish-seal">
                          <p>Parish Seal</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="marriage-certificate-modal-actions">
              <button 
                className="marriage-certificate-download-btn"
                onClick={downloadCertificateAsPDF}
                disabled={isDownloading}
              >
                {isDownloading ? 'Processing...' : <><AiOutlineDownload /> Download</>}
              </button>
              <button 
                className="marriage-certificate-cancel-btn"
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
    <div className="marriage-view-container">
      {/* Document Viewer Modal */}
      {renderDocumentViewer()}
      
      {/* Certificate Download Modal */}
      {renderCertificateModal()}
      
      {/* Header */}
      <div className="marriage-view-header">
        <div className="marriage-view-left-section">
          <button className="marriage-view-back-button" onClick={() => window.history.back()}>
            <AiOutlineArrowLeft className="marriage-view-back-icon" /> Back
          </button>
        </div>
        <div className="marriage-view-right-section">
          <button 
            className="marriage-download-certificate-btn"
            onClick={handleDownloadCertificate}
          >
            <AiOutlineDownload /> Download Certificate
          </button>
        </div>
      </div>
      <h1 className="marriage-view-title">Holy Matrimony Application Details</h1>
      
      {/* Marriage Data Section */}
      <div className="marriage-view-data">
        <div className="marriage-view-row-date">
          <div className="marriage-view-field-date">
            <label>Date of Holy Matrimony:</label>
            {renderReadOnlyField(formatDate(marriageData.date))}
          </div>
          
          <div className="marriage-view-field-time">
            <label>Time of Holy Matrimony:</label>
            {renderReadOnlyField(marriageData.time)}
          </div>
        </div>

        <div className="marriage-view-field-date">
          <label>Name of the Priest:</label>
          {renderReadOnlyField(marriageData.priest)}
        </div>
        
        <div className="marriage-view-bypart">
          <h3 className="marriage-view-sub-title">Groom Information</h3>
          <div className="marriage-view-info-card">
            <div className="marriage-view-row">
              <div className="marriage-view-field">
                <label>First Name:</label>
                {renderReadOnlyField(marriageData.groom.firstName)}
              </div>
              <div className="marriage-view-field">
                <label>Middle Name:</label>
                {renderReadOnlyField(marriageData.groom.middleName)}
              </div>
              <div className="marriage-view-field">
                <label>Last Name:</label>
                {renderReadOnlyField(marriageData.groom.lastName)}
              </div>
              <div className="marriage-view-field">
                <label>Age:</label>
                {renderReadOnlyField(marriageData.groom.age)}
              </div>
            </div>
            
            <div className="marriage-view-row">
              <div className="marriage-view-field">
                <label>Date of Birth:</label>
                {renderReadOnlyField(formatDate(marriageData.groom.dateOfBirth))}
              </div>
              <div className="marriage-view-field">
                <label>Place of Birth:</label>
                {renderReadOnlyField(marriageData.groom.placeOfBirth)}
              </div>
            </div>
            
            <div className="marriage-view-row">
              <div className="marriage-view-field">
                <label>Date of Baptism:</label>
                {renderReadOnlyField(formatDate(marriageData.groom.dateOfBaptism))}
              </div>
              <div className="marriage-view-field">
                <label>Church of Baptism:</label>
                {renderReadOnlyField(marriageData.groom.churchOfBaptism)}
              </div>
            </div>
            
            {/* Address Fields */}
            <div className="marriage-view-row marriage-address-view-row">
            <div className="marriage-view-field">
                <label>Barangay:</label>
                {renderReadOnlyField(marriageData.groom.address.barangay)}
              </div>
              <div className="marriage-view-field">
                <label>Street:</label>
                {renderReadOnlyField(marriageData.groom.address.street)}
              </div>
              <div className="marriage-view-field">
                <label>Municipality:</label>
                {renderReadOnlyField(marriageData.groom.address.municipality)}
              </div>
              <div className="marriage-view-field">
                <label>Province:</label>
                {renderReadOnlyField(marriageData.groom.address.province)}
              </div>
            </div>
          </div>

          {/* Bride's Information */}
          <h3 className="marriage-view-sub-title">Bride Information</h3>
          <div className="marriage-view-info-card">
            <div className="marriage-view-row">
              <div className="marriage-view-field">
                <label>First Name:</label>
                {renderReadOnlyField(marriageData.bride.firstName)}
              </div>
              <div className="marriage-view-field">
                <label>Middle Name:</label>
                {renderReadOnlyField(marriageData.bride.middleName)}
              </div>
              <div className="marriage-view-field">
                <label>Last Name:</label>
                {renderReadOnlyField(marriageData.bride.lastName)}
              </div>
              <div className="marriage-view-field">
                <label>Age:</label>
                {renderReadOnlyField(marriageData.bride.age)}
              </div>
            </div>
            
            <div className="marriage-view-row">
              <div className="marriage-view-field">
                <label>Date of Birth:</label>
                {renderReadOnlyField(formatDate(marriageData.bride.dateOfBirth))}
              </div>
              <div className="marriage-view-field">
                <label>Place of Birth:</label>
                {renderReadOnlyField(marriageData.bride.placeOfBirth)}
              </div>
            </div>
            
            <div className="marriage-view-row">
              <div className="marriage-view-field">
                <label>Date of Baptism:</label>
                {renderReadOnlyField(formatDate(marriageData.bride.dateOfBaptism))}
              </div>
              <div className="marriage-view-field">
                <label>Church of Baptism:</label>
                {renderReadOnlyField(marriageData.bride.churchOfBaptism)}
              </div>
            </div>
            
            {/* Address Fields */}
            <div className="marriage-view-row marriage-address-view-row">
            <div className="marriage-view-field">
                <label>Barangay:</label>
                {renderReadOnlyField(marriageData.bride.address.barangay)}
              </div>
              <div className="marriage-view-field">
                <label>Street:</label>
                {renderReadOnlyField(marriageData.bride.address.street)}
              </div>
              <div className="marriage-view-field">
                <label>Municipality:</label>
                {renderReadOnlyField(marriageData.bride.address.municipality)}
              </div>
              <div className="marriage-view-field">
                <label>Province:</label>
                {renderReadOnlyField(marriageData.bride.address.province)}
              </div>
            </div>
          </div>
          
          <h3 className="marriage-view-sub-title">Witness Information</h3>
          {/* First Witness Information */}
          <div className="marriage-view-info-card">
            <h4 className="marriage-view-witness-title">First Witness</h4>
            <div className="marriage-view-row">
              <div className="marriage-view-field">
                <label>First Name:</label>
                {renderReadOnlyField(marriageData.witnesses[0].firstName)}
              </div>
              <div className="marriage-view-field">
                <label>Middle Name:</label>
                {renderReadOnlyField(marriageData.witnesses[0].middleName)}
              </div>
              <div className="marriage-view-field">
                <label>Last Name:</label>
                {renderReadOnlyField(marriageData.witnesses[0].lastName)}
              </div>
            </div>
            
            <div className="marriage-view-row">
              <div className="marriage-view-field">
                <label>Gender:</label>
                {renderReadOnlyField(marriageData.witnesses[0].gender)}
              </div>
              <div className="marriage-view-field">
                <label>Age:</label>
                {renderReadOnlyField(marriageData.witnesses[0].age)}
              </div>
              <div className="marriage-view-field">
                <label>Date of Birth:</label>
                {renderReadOnlyField(formatDate(marriageData.witnesses[0].dateOfBirth))}
              </div>
              <div className="marriage-view-field">
                <label>Contact Number:</label>
                {renderReadOnlyField(marriageData.witnesses[0].contact)}
              </div>
            </div>
            
            {/* Address Fields */}
            <div className="marriage-view-row marriage-address-view-row">
            <div className="marriage-view-field">
                <label>Barangay:</label>
                {renderReadOnlyField(marriageData.witnesses[0].address.barangay)}
              </div>
              <div className="marriage-view-field">
                <label>Street:</label>
                {renderReadOnlyField(marriageData.witnesses[0].address.street)}
              </div>
              <div className="marriage-view-field">
                <label>Municipality:</label>
                {renderReadOnlyField(marriageData.witnesses[0].address.municipality)}
              </div>
              <div className="marriage-view-field">
                <label>Province:</label>
                {renderReadOnlyField(marriageData.witnesses[0].address.province)}
              </div>
            </div>
          </div>
          
          {/* Second Witness Information */}
          <div className="marriage-view-info-card">
            <h4 className="marriage-view-witness-title">Second Witness</h4>
            <div className="marriage-view-row">
              <div className="marriage-view-field">
                <label>First Name:</label>
                {renderReadOnlyField(marriageData.witnesses[1].firstName)}
              </div>
              <div className="marriage-view-field">
                <label>Middle Name:</label>
                {renderReadOnlyField(marriageData.witnesses[1].middleName)}
              </div>
              <div className="marriage-view-field">
                <label>Last Name:</label>
                {renderReadOnlyField(marriageData.witnesses[1].lastName)}
              </div>
            </div>
            
            <div className="marriage-view-row">
              <div className="marriage-view-field">
                <label>Gender:</label>
                {renderReadOnlyField(marriageData.witnesses[1].gender)}
              </div>
              <div className="marriage-view-field">
                <label>Age:</label>
                {renderReadOnlyField(marriageData.witnesses[1].age)}
              </div>
              <div className="marriage-view-field">
                <label>Date of Birth:</label>
                {renderReadOnlyField(formatDate(marriageData.witnesses[1].dateOfBirth))}
              </div>
              <div className="marriage-view-field">
                <label>Contact Number:</label>
                {renderReadOnlyField(marriageData.witnesses[1].contact)}
              </div>
            </div>
            
            {/* Address Fields */}
            <div className="marriage-view-row marriage-address-view-row">
            <div className="marriage-view-field">
                <label>Barangay:</label>
                {renderReadOnlyField(marriageData.witnesses[1].address.barangay)}
              </div>
              <div className="marriage-view-field">
                <label>Street:</label>
                {renderReadOnlyField(marriageData.witnesses[1].address.street)}
              </div>
              <div className="marriage-view-field">
                <label>Municipality:</label>
                {renderReadOnlyField(marriageData.witnesses[1].address.municipality)}
              </div>
              <div className="marriage-view-field">
                <label>Province:</label>
                {renderReadOnlyField(marriageData.witnesses[1].address.province)}
              </div>
            </div>
          </div>
        </div>
        
        <div className="marriage-requirements-view-container">
          <h2 className="marriage-requirements-view-title">Requirements</h2>
          <div className="marriage-requirements-view-box">
            <h3 className="marriage-view-section-header">Documents Status</h3>
            <div className="marriage-view-checkbox-list">
              {/* Baptismal Certificate */}
              <div className="marriage-requirement-view-item">
                <div className="marriage-view-requirement-name">
                  Baptismal Certificate (Recent copy, issued within 6 months)
                </div>
                {renderDocumentStatus(
                  marriageData.requirements.baptismalCert.submitted, 
                  marriageData.requirements.baptismalCert.fileName
                )}
              </div>
              
              {/* Confirmation Certificate */}
              <div className="marriage-requirement-view-item">
                <div className="marriage-view-requirement-name">
                  Confirmation Certificate (Proof of receiving the Sacrament of Confirmation)
                </div>
                {renderDocumentStatus(
                  marriageData.requirements.confirmationCert.submitted, 
                  marriageData.requirements.confirmationCert.fileName
                )}
              </div>
              
              {/* Birth Certificate */}
              <div className="marriage-requirement-view-item">
                <div className="marriage-view-requirement-name">
                  Birth Certificate (For age verification and legal purposes)
                </div>
                {renderDocumentStatus(
                  marriageData.requirements.birthCert.submitted, 
                  marriageData.requirements.birthCert.fileName
                )}
              </div>
              
              {/* Marriage License */}
              <div className="marriage-requirement-view-item">
                <div className="marriage-view-requirement-name">
                  Marriage License (Issued by the civil registry)
                </div>
                {renderDocumentStatus(
                  marriageData.requirements.marriageLicense.submitted, 
                  marriageData.requirements.marriageLicense.fileName
                )}
              </div>
              
              {/* CENOMAR */}
              <div className="marriage-requirement-view-item">
                <div className="marriage-view-requirement-name">
                  Certificate of No Marriage (CENOMAR, issued by PSA)
                </div>
                {renderDocumentStatus(
                  marriageData.requirements.cenomar.submitted, 
                  marriageData.requirements.cenomar.fileName
                )}
              </div>
              // Add this inside the marriage-view-checkbox-list div, after the CENOMAR entry

{/* Publication of Banns */}
<div className="marriage-requirement-view-item">
  <div className="marriage-view-requirement-name">
    Publication of Banns (Announcements made in the parish for three consecutive Sundays)
  </div>
  {renderDocumentStatus(
    marriageData.requirements.publicationBanns?.submitted || false, 
    marriageData.requirements.publicationBanns?.fileName || "PublicationOfBanns.pdf"
  )}
</div>

{/* Permit from Proper Parish */}
<div className="marriage-requirement-view-item">
  <div className="marriage-view-requirement-name">
    Permit from Proper Parish (If wedding is held outside couple's parish)
  </div>
  {renderDocumentStatus(
    marriageData.requirements.permitFromParish?.submitted || false, 
    marriageData.requirements.permitFromParish?.fileName || "ParishPermit.pdf"
  )}
</div>

{/* Pre-Cana Seminar */}
<div className="marriage-requirement-view-item">
  <div className="marriage-view-requirement-name">
    Pre-Cana Seminar (Marriage Preparation Program certificate)
  </div>
  {renderDocumentStatus(
    marriageData.requirements.preCana?.submitted || false, 
    marriageData.requirements.preCana?.fileName || "PreCanaSeminar.pdf"
  )}
</div>

{/* List of Sponsors */}
<div className="marriage-requirement-view-item">
  <div className="marriage-view-requirement-name">
    Complete List of Sponsors (Ninong & Ninang)
  </div>
  {renderDocumentStatus(
    marriageData.requirements.sponsorsList?.submitted || false, 
    marriageData.requirements.sponsorsList?.fileName || "SponsorsList.pdf"
  )}
</div>

{/* Wedding Practice */}
<div className="marriage-requirement-view-item">
  <div className="marriage-view-requirement-name">
    Practice (1 day before the marriage)
  </div>
  {renderDocumentStatus(
    marriageData.requirements.weddingPractice?.submitted || false, 
    marriageData.requirements.weddingPractice?.fileName || "WeddingPracticeConfirmation.pdf"
  )}
</div>

{/* Canonical Interview */}
<div className="marriage-requirement-view-item">
  <div className="marriage-view-requirement-name">
    Canonical Interview/Examination (Required interview with parish priest)
  </div>
  {renderDocumentStatus(
    marriageData.requirements.canonicalInterview?.submitted || false, 
    marriageData.requirements.canonicalInterview?.fileName || "CanonicalInterview.pdf"
  )}
</div>
            </div>

            <h3 className="marriage-view-section-header">Requirements for the Couple</h3>
            <div className="marriage-info-view-list">
              <div className="marriage-info-view-item">
                <p>Must be a baptized Catholic (at least one of the partners)</p>
              </div>
              <div className="marriage-info-view-item">
                <p>Must have received the Sacrament of Confirmation</p>
              </div>
              <div className="marriage-info-view-item">
                <p>Must undergo a Pre-Cana Seminar or Marriage Preparation Program</p>
              </div>
              <div className="marriage-info-view-item">
                <p>Must be of legal age (as required by civil law)</p>
              </div>
              <div className="marriage-info-view-item">
                <p>Must provide proof of freedom to marry (e.g., no previous valid marriage in the Church)</p>
              </div>
            </div>

            <h3 className="marriage-view-section-header">Parish Requirements</h3>
            <div className="marriage-info-view-list">
              <div className="marriage-info-view-item">
                <p>Must schedule an interview with the parish priest</p>
              </div>
              <div className="marriage-info-view-item">
                <p>Must submit all required documents at least 3 months before the wedding</p>
              </div>
              <div className="marriage-info-view-item">
                <p>Must attend marriage banns (announcements made in the parish for three consecutive Sundays)</p>
              </div>
              <div className="marriage-info-view-item">
                <p>Must choose sponsors (Ninong & Ninang) who are practicing Catholics</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarriageView;