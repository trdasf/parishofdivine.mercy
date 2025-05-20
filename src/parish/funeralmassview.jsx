import React, { useState, useRef, useEffect } from "react";
import { AiOutlineArrowLeft, AiOutlineEye, AiOutlineDownload } from "react-icons/ai"; 
import { useLocation, useNavigate } from "react-router-dom";
import "../secretary/SecretaryFuneralMassView.css";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import pdmLogo from "../assets/pdmlogo.png";
import church2Img from "../assets/church2.jpg";

const FuneralMassView = () => {
  // State for status and document viewing
  const [status, setStatus] = useState("PENDING");
  const [viewingDocument, setViewingDocument] = useState(null);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const certificateRef = useRef(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [funeralData, setFuneralData] = useState(null);
  const [approvedData, setApprovedData] = useState(null);
  const [error, setError] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  // State for schedule selection
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedPriest, setSelectedPriest] = useState("");
  
  // API base URL that can be easily changed
  const API_BASE_URL = "https://parishofdivinemercy.com/backend";

  useEffect(() => {
    // Check if we have necessary state data (funeralID)
    const funeralID = location.state?.funeralID;
    const statusFromNav = location.state?.status;

    if (!funeralID) {
      setError("Missing funeral information. Please try again.");
      setLoading(false);
      return;
    }

    // Set initial status from navigation
    if (statusFromNav) {
      setStatus(statusFromNav);
    }

    // Fetch the funeral details
    fetchFuneralDetails(funeralID);
    
    // If status is approved, also fetch approved appointment details
    if (statusFromNav === "Approved") {
      fetchApprovedDetails(funeralID);
    }
  }, [location]);

  /**
   * Fetches funeral application details from the server
   * @param {string} funeralID - The ID of the funeral application to fetch
   */
  const fetchFuneralDetails = async (funeralID) => {
    try {
      setLoading(true);
      const url = `${API_BASE_URL}/fetch_funeral_details.php?funeralID=${funeralID}`;
      
      const response = await fetch(url);
      
      // Check if response is OK
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Transform the data into the expected format
        const transformedData = transformFuneralData(data.data);
        setFuneralData(transformedData);
        setStatus(transformedData.status || status);
        
        // If the status is approved, fetch the approved details from approved_appointment table
        if (transformedData.status === "Approved") {
          fetchApprovedDetails(funeralID);
        } else {
          // For pending applications, start with empty fields for schedule selection
          setSelectedDate("");
          setSelectedTime("");
          setSelectedPriest("");
        }
        
        console.log("Funeral data loaded successfully:", transformedData);
      } else {
        setError(data.message || "Failed to fetch funeral details");
        console.error("API error:", data.message);
      }
    } catch (error) {
      console.error("Error fetching funeral details:", error);
      setError("An error occurred while fetching the data: " + error.message);
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Fetches approved appointment details for a funeral
   * @param {string} funeralID - The ID of the funeral to fetch approved details for
   */
  const fetchApprovedDetails = async (funeralID) => {
    try {
      // This should be a new API endpoint to fetch from approved_appointment table
      const url = `${API_BASE_URL}/fetch_approved_appointment.php?sacramentID=${funeralID}&sacrament_type=Funeral`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        console.error(`Error fetching approved details: ${response.status}`);
        return; // Don't throw an error, just continue
      }
      
      const data = await response.json();
      
      if (data.success && data.appointment) {
        setApprovedData(data.appointment);
        
        // Set these values for the certificate
        setSelectedDate(data.appointment.date || "");
        setSelectedTime(data.appointment.time || "");
        setSelectedPriest(data.appointment.priest || "");
        
        console.log("Approved funeral data loaded:", data.appointment);
      } else {
        console.warn("No approved appointment data found");
      }
    } catch (error) {
      console.error("Error fetching approved details:", error);
      // Don't set an error state, just log it
    }
  };

  /**
   * Transforms the raw funeral data from the API into the expected format
   * @param {Object} data - The raw funeral data from the API
   * @returns {Object} - The transformed funeral data
   */
  const transformFuneralData = (data) => {
    // Format the data from PHP API response to match the component's expected format
    const { funeral, deceased, requester, address, requirements } = data;
    
    // Create a transformed data structure
    return {
      date: funeral.dateOfFuneralMass,
      time: funeral.timeOfFuneralMass,
      priest: funeral.priestName,
      status: funeral.status,
      funeralID: funeral.funeralID,
      clientID: funeral.clientID || null, // Include clientID for notifications
      
      deceased: {
        firstName: deceased.first_name || 'N/A',
        middleName: deceased.middle_name || 'N/A',
        lastName: deceased.last_name || 'N/A',
        gender: deceased.sex || 'N/A',
        age: deceased.age || 'N/A',
        dateOfBirth: deceased.dateOfBirth || 'N/A',
        dateOfDeath: deceased.dateOfDeath || 'N/A',
        causeOfDeath: deceased.causeOfDeath || 'N/A',
        wakeLocation: deceased.wake_location || 'N/A',
        burialLocation: deceased.burial_location || 'N/A'
      },
      
      requester: {
        firstName: requester.first_name || 'N/A',
        middleName: requester.middle_name || 'N/A',
        lastName: requester.last_name || 'N/A',
        relationship: requester.relationship || 'N/A',
        contact: requester.contact_number || 'N/A',
        email: requester.email || 'N/A'
      },
      
      address: {
        street: address.street || 'N/A',
        barangay: address.barangay || 'N/A',
        municipality: address.municipality || 'N/A',
        province: address.province || 'N/A',
        region: address.region || 'N/A'
      },
      
      requirements: {
        deathCertificate: {
          submitted: requirements?.death_certificate_status === 'Submitted',
          fileName: requirements?.death_certificate ? requirements.death_certificate.split('/').pop() : 'N/A'
        },
        parishClearance: {
          submitted: requirements?.parish_clearance_status === 'Submitted',
          fileName: requirements?.parish_clearance ? requirements.parish_clearance.split('/').pop() : 'N/A'
        },
        permitToBury: {
          submitted: requirements?.permit_to_bury_status === 'Submitted',
          fileName: requirements?.permit_to_bury ? requirements.permit_to_bury.split('/').pop() : 'N/A'
        },
        certificateBaptism: {
          submitted: requirements?.certificate_baptism_status === 'Submitted',
          fileName: requirements?.certificate_baptism ? requirements.certificate_baptism.split('/').pop() : 'N/A'
        },
        certificateConfirmation: {
          submitted: requirements?.certificate_confirmation_status === 'Submitted',
          fileName: requirements?.certificate_confirmation ? requirements.certificate_confirmation.split('/').pop() : 'N/A'
        }
      },
      
      // Certificate details
      certificate: {
        dateIssued: new Date().toISOString().split('T')[0],
        certificateNumber: `FM-${funeral.funeralID}-${new Date().getFullYear()}`
      }
    };
  };

  /**
   * Handles the initial approval action when the Approve button is clicked
   * Shows a confirmation modal with the appointment details
   */
  const handleApprove = async () => {
    if (!funeralData || !funeralData.funeralID) {
      alert("No funeral data available to approve.");
      return;
    }
    
    // Validate required fields
    if (!selectedDate) {
      alert("Please select a date for the funeral mass.");
      return;
    }
    
    if (!selectedTime) {
      alert("Please select a time for the funeral mass.");
      return;
    }
    
    if (!selectedPriest) {
      alert("Please enter the name of the priest for the funeral mass.");
      return;
    }

    // Show the confirmation modal instead of proceeding directly
    setShowConfirmModal(true);
  };

  /**
   * Handles the confirmation of the approval process
   * Saves appointment details, updates status, and sends notification email
   */
  const handleConfirmApproval = async () => {
    setShowConfirmModal(false);
    
    try {
      // Step 1: First save the appointment data to approved_appointments table
      // Using the selected date/time from the schedule selection section
      const appointmentData = {
        sacramentID: funeralData.funeralID,
        sacrament_type: "Funeral",
        date: selectedDate, // This is the date selected in the Schedule Selection section
        time: selectedTime, // This is the time selected in the Schedule Selection section
        priest: selectedPriest // This is the priest entered in the Schedule Selection section
      };
      
      console.log("Saving appointment data:", appointmentData);
      
      const appointmentResponse = await fetch(`${API_BASE_URL}/save_approved_appointment.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(appointmentData),
      });
      
      if (!appointmentResponse.ok) {
        throw new Error(`Server responded with status: ${appointmentResponse.status}`);
      }
      
      const appointmentResult = await appointmentResponse.json();
      
      if (!appointmentResult.success) {
        throw new Error(appointmentResult.message || "Failed to save appointment details");
      }
      
      console.log("Appointment saved successfully:", appointmentResult);
      
      // Step 2: Now update the funeral status
      const response = await fetch(`${API_BASE_URL}/update_funeral_status.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          funeralID: funeralData.funeralID,
          status: "Approved",
          date: selectedDate,
          time: selectedTime,
          priest: selectedPriest,
          requesterEmail: funeralData.requester.email,
          requesterName: `${funeralData.requester.firstName} ${funeralData.requester.lastName}`,
          deceasedName: `${funeralData.deceased.firstName} ${funeralData.deceased.lastName}`,
          relationship: funeralData.requester.relationship
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        setStatus("Approved");
        
        // Update approvedData state with the newly approved details
        setApprovedData({
          date: selectedDate,
          time: selectedTime,
          priest: selectedPriest
        });
        
        // Show success message for a short time
        setSuccessMessage("Funeral mass application has been approved successfully!");
        setShowSuccessModal(true);
        
        // After a short delay, navigate to the appointments page
        setTimeout(() => {
          setShowSuccessModal(false);
          navigate("/secretary-appointment"); // Navigate to secretary-appointment page
        }, 1500);  // 1.5 second delay to show the success message
        
      } else {
        alert("Failed to approve funeral mass application: " + result.message);
      }
    } catch (error) {
      console.error("Error approving funeral mass application:", error);
      alert("An error occurred while approving the funeral mass application: " + error.message);
    }
  };

  // Handle cancel action
  const handleCancel = () => {
    // Reset the status to previous value or redirect
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
      const fileName = `Funeral_Certificate_${funeralData.deceased.firstName}_${funeralData.deceased.lastName}.pdf`;
      pdf.save(fileName);
      
      // Record certificate download
      try {
        await fetch(`${API_BASE_URL}/log_certificate_download.php`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sacramentID: funeralData.funeralID,
            sacrament_type: "Funeral",
            filename: fileName,
            downloadedBy: "Secretary" // Could be dynamic if user info is available
          }),
        });
      } catch (logError) {
        console.error("Error logging certificate download:", logError);
        // Non-critical error, don't interrupt the flow
      }
      
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

  // Function to get document URL based on environment and server configuration
  const getDocumentUrl = (fileName) => {
    // Determine base URL depending on environment
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    
    if (isLocalhost) {
      // For local development
      return `/backend/uploads/funeral_requirements/${fileName}`;
    } else {
      // For production server - based on Hostinger file structure
      return `/backend/uploads/funeral_requirements/${fileName}`;
    }
  };

  // Document viewer modal
  const renderDocumentViewer = () => {
    if (!viewingDocument) return null;

    // Determine file type by extension
    const fileExtension = viewingDocument.split('.').pop().toLowerCase();
    const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension);
    const isPdf = fileExtension === 'pdf';
    
    // Get document URL using the utility function
    const documentUrl = getDocumentUrl(viewingDocument);

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
            {isImage && (
              <img 
                src={documentUrl} 
                alt={viewingDocument}
                style={{ maxWidth: '100%', maxHeight: '70vh' }}
                onError={(e) => {
                  console.error(`Failed to load image: ${documentUrl}`);
                  e.target.src = 'https://via.placeholder.com/500x300?text=Image+Not+Found';
                  e.target.alt = 'Document not found';
                }}
              />
            )}
            {isPdf && (
              <iframe
                src={`${documentUrl}#toolbar=0`}
                title={viewingDocument}
                width="100%"
                height="600px"
                style={{ border: 'none' }}
                onError={(e) => {
                  console.error(`Failed to load PDF: ${documentUrl}`);
                  e.target.src = 'about:blank';
                }}
              />
            )}
            {!isImage && !isPdf && (
              <div className="secretary-funeral-document-placeholder">
                <p>Document preview not available for this file type.</p>
                <p>Filename: {viewingDocument}</p>
                <a 
                  href={documentUrl}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="secretary-funeral-document-download-link"
                >
                  Download to view
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Certificate download confirmation modal
  const renderCertificateModal = () => {
    if (!showCertificateModal || !funeralData) return null;

    // Use approvedData for the certificate if available, otherwise fall back to funeralData
    const funeralDate = approvedData ? approvedData.date : funeralData.date;
    const funeralTime = approvedData ? approvedData.time : funeralData.time;
    const funeralPriest = approvedData ? approvedData.priest : funeralData.priest;

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
            
            {/* Certificate Preview based on the image */}
            <div ref={certificateRef} className="funeral-certificate-preview">
              <div className="certificate-header">
                <div className="certificate-logos">
                  <div className="parish-logo-left">
                    {/* Use onError to provide a fallback if the image doesn't load */}
                    <img 
                      src={church2Img} 
                      alt="Parish Logo Left" 
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/70x70?text=Church";
                      }}
                    />
                  </div>
                  <div className="parish-title">
                    <div className="diocese-title">DIOCESE OF DAET</div>
                    <div className="parish-name">PARISH OF THE DIVINE MERCY</div>
                    <div className="parish-address">Alawihao, Daet, Camarines Norte</div>
                  </div>
                  <div className="parish-logo-right">
                    {/* Use onError to provide a fallback if the image doesn't load */}
                    <img 
                      src={pdmLogo} 
                      alt="Parish Logo Right" 
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/80x80?text=PDM";
                      }}
                    />
                  </div>
                </div>
                
                <h1 className="certificate-title">CERTIFICATE OF FUNERAL MASS</h1>
              </div>
              
              <div className="certificate-details">
                <div className="certificate-row">
                  <div className="certificate-label">NAME OF DECEASED</div>
                  <div className="certificate-value">{funeralData.deceased.firstName} {funeralData.deceased.middleName} {funeralData.deceased.lastName}</div>
                </div>
                <div className="certificate-row">
                  <div className="certificate-label">DATE OF BIRTH</div>
                  <div className="certificate-value">{formatDate(funeralData.deceased.dateOfBirth)}</div>
                </div>
                <div className="certificate-row">
                  <div className="certificate-label">DATE OF DEATH</div>
                  <div className="certificate-value">{formatDate(funeralData.deceased.dateOfDeath)}</div>
                </div>
                <div className="certificate-row">
                  <div className="certificate-label">AGE</div>
                  <div className="certificate-value">{funeralData.deceased.age} years old</div>
                </div>
                <div className="certificate-row">
                  <div className="certificate-label">CAUSE OF DEATH</div>
                  <div className="certificate-value">{funeralData.deceased.causeOfDeath}</div>
                </div>
                <div className="certificate-row">
                  <div className="certificate-label">WAKE LOCATION</div>
                  <div className="certificate-value">{funeralData.deceased.wakeLocation}</div>
                </div>
                <div className="certificate-row">
                  <div className="certificate-label">BURIAL LOCATION</div>
                  <div className="certificate-value">{funeralData.deceased.burialLocation}</div>
                </div>
                <div className="certificate-row">
                  <div className="certificate-label">DATE OF FUNERAL MASS</div>
                  <div className="certificate-value">{formatDate(funeralDate)}</div>
                </div>
                <div className="certificate-row">
                  <div className="certificate-label">TIME OF FUNERAL MASS</div>
                  <div className="certificate-value">{funeralTime}</div>
                </div>
                <div className="certificate-row">
                  <div className="certificate-label">OFFICIATING PRIEST</div>
                  <div className="certificate-value">{funeralPriest}</div>
                </div>
                <div className="certificate-row">
                  <div className="certificate-label">REQUESTED BY</div>
                  <div className="certificate-value">{funeralData.requester.firstName} {funeralData.requester.middleName} {funeralData.requester.lastName} ({funeralData.requester.relationship})</div>
                </div>
              </div>
              
              <div className="certificate-footer">
                <div className="certificate-reference">
                  <div className="reference-row">
                    <span className="reference-label">Register Number</span>
                    <span className="reference-value">{funeralData.certificate.certificateNumber}</span>
                  </div>
                  <div className="reference-row">
                    <span className="reference-label">Date Issued</span>
                    <span className="reference-value">{formatDate(funeralData.certificate.dateIssued)}</span>
                  </div>
                </div>
                
                <div className="certificate-priest-signature">
                  <div className="signature-line"></div>
                  <p>{funeralPriest}</p>
                  <p>Parish Priest</p>
                </div>
                
                <div className="certificate-parish-seal">
                  <p>Parish Seal</p>
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

  // Confirmation Modal
  const renderConfirmModal = () => {
    if (!showConfirmModal) return null;
    
    return (
      <div className="secretary-funeral-document-viewer-overlay">
        <div className="secretary-funeral-confirm-modal-container">
          <div className="secretary-funeral-confirm-header">
            <h3>Confirm Approval</h3>
            <button 
              className="secretary-funeral-document-close-btn"
              onClick={() => setShowConfirmModal(false)}
            >
              ×
            </button>
          </div>
          <div className="secretary-funeral-confirm-content">
            <div className="secretary-funeral-confirm-icon">?</div>
            <h2>Are you sure?</h2>
            <p>Are you sure you want to approve this funeral mass appointment?</p>
            <p>Date: {selectedDate}</p>
            <p>Time: {selectedTime}</p>
            <p>Priest: {selectedPriest}</p>
            <p>This will send an email notification to the requester.</p>
            <div className="secretary-funeral-confirm-buttons">
              <button 
                className="secretary-funeral-confirm-yes-button"
                onClick={handleConfirmApproval}
              >
                Yes, Approve
              </button>
              <button 
                className="secretary-funeral-confirm-no-button"
                onClick={() => setShowConfirmModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Success Modal
  const renderSuccessModal = () => {
    if (!showSuccessModal) return null;
    
    return (
      <div className="secretary-funeral-document-viewer-overlay">
        <div className="secretary-funeral-success-modal-container">
          <div className="secretary-funeral-success-header">
            <h3>Success</h3>
            <button 
              className="secretary-funeral-document-close-btn"
              onClick={() => {
                setShowSuccessModal(false);
                navigate("/secretary-appointment"); // Changed navigation destination
              }}
            >
              ×
            </button>
          </div>
          <div className="secretary-funeral-success-content">
            <div className="secretary-funeral-success-icon">✓</div>
            <h2>Success!</h2>
            <p>{successMessage}</p>
            <p>An email notification has been sent to the client.</p>
            <button 
              className="secretary-funeral-success-button"
              onClick={() => {
                setShowSuccessModal(false);
                navigate("/secretary-appointment"); // Changed navigation destination
              }}
            >
              Back to Appointments
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="secretary-funeral-view-container">
        <div className="secretary-funeral-view-loading">Loading funeral details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="secretary-funeral-view-container">
        <div className="secretary-funeral-view-error">
          <p>{error}</p>
          <button onClick={() => navigate(-1)}>Back</button>
        </div>
      </div>
    );
  }

  if (!funeralData) {
    return (
      <div className="secretary-funeral-view-container">
        <div className="secretary-funeral-view-error">
          <p>No funeral data found.</p>
          <button onClick={() => navigate(-1)}>Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="secretary-funeral-view-container">
      {/* Document Viewer Modal */}
      {renderDocumentViewer()}
      
      {/* Certificate Download Modal */}
      {showCertificateModal && funeralData && renderCertificateModal()}
      
      {/* Confirmation Modal */}
      {renderConfirmModal()}
      
      {/* Success Modal */}
      {renderSuccessModal()}
      
      {/* Header */}
      <div className="secretary-funeral-view-header">
        <div className="secretary-funeral-view-left-section">
          <button className="secretary-funeral-view-back-button" onClick={() => navigate(-1)}>
            <AiOutlineArrowLeft className="secretary-funeral-view-back-icon" /> Back
          </button>
        </div>
      </div>
      <h1 className="secretary-funeral-view-title">Funeral Mass Application Details</h1>
      
      {/* Funeral Mass Data Section */}
      <div className="secretary-funeral-view-data">
        {/* Original Appointment Details - Always show these */}
        <div className="secretary-funeral-view-info-card">
          <h3 className="secretary-funeral-view-sub-title">Appointment Request Details</h3>
          <div className="secretary-funeral-view-row-date">
            <div className="secretary-funeral-view-field-date">
              <label>Date of Appointment Request:</label>
              {renderReadOnlyField(formatDate(funeralData.date))}
            </div>
            <div className="secretary-funeral-view-field-time">
              <label>Time of Appointment Request:</label>
              {renderReadOnlyField(funeralData.time)}
            </div>
          </div>
        </div>
        
        {/* Show approved funeral details if status is Approved */}
        {status === "Approved" && approvedData && (
          <div className="secretary-funeral-view-info-card approved-details">
            <h3 className="secretary-funeral-view-sub-title">Approved Funeral Mass Details</h3>
            <div className="secretary-funeral-view-row-date">
              <div className="secretary-funeral-view-field-date">
                <label>Date of Funeral Mass:</label>
                {renderReadOnlyField(formatDate(approvedData.date))}
              </div>
              <div className="secretary-funeral-view-field-time">
                <label>Time of Funeral Mass:</label>
                {renderReadOnlyField(approvedData.time)}
              </div>
            </div>
            <div className="secretary-funeral-view-field-date">
              <label>Officiating Priest:</label>
              {renderReadOnlyField(approvedData.priest)}
            </div>
          </div>
        )}
        
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
                <label>Date of Birth:</label>
                {renderReadOnlyField(formatDate(funeralData.deceased.dateOfBirth))}
              </div>
            </div>
            
            <div className="funeral-view-row">
              <div className="funeral-view-field">
                <label>Age:</label>
                {renderReadOnlyField(funeralData.deceased.age)}
              </div>
              <div className="funeral-view-field">
                <label>Gender:</label>
                {renderReadOnlyField(funeralData.deceased.gender)}
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
                <label>Street:</label>
                {renderReadOnlyField(funeralData.address.street)}
              </div>
              <div className="funeral-view-field">
                <label>Barangay:</label>
                {renderReadOnlyField(funeralData.address.barangay)}
              </div>
              <div className="funeral-view-field">
                <label>Municipality:</label>
                {renderReadOnlyField(funeralData.address.municipality)}
              </div>
            </div>
            <div className="funeral-view-row secretary-funeral-address-view-row">
              <div className="funeral-view-field">
                <label>Province:</label>
                {renderReadOnlyField(funeralData.address.province)}
              </div>
              <div className="funeral-view-field">
                <label>Region:</label>
                {renderReadOnlyField(funeralData.address.region)}
              </div>
            </div>
          </div>
        </div>
        
        {/* Requirements section */}
        <div className="secretary-funeral-requirements-view-container">
          <h2 className="secretary-funeral-requirements-view-title">Requirements</h2>
          <div className="secretary-funeral-requirements-view-box">
            <h3 className="secretary-funeral-view-section-header">Documents Needed</h3>
            <div className="secretary-funeral-view-info-list">
              <div className="secretary-funeral-info-view-item">
                <p>Certificate of Death</p>
              </div>
              <div className="secretary-funeral-info-view-item">
                <p>Parish Clearance</p>
              </div>
              <div className="secretary-funeral-info-view-item">
                <p>Permit to Bury</p>
              </div>
              <div className="secretary-funeral-info-view-item">
                <p>Certificate of Permission(if outside the Parish)</p>
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

        {/* Schedule Selection Section - Only show if not approved yet */}
        {status !== "Approved" && (
          <div className="secretary-funeral-view-info-card">
            <h2 className="secretary-funeral-view-sub-title">Schedule Selection</h2>
            <div className="secretary-funeral-view-row-date">
              <div className="secretary-funeral-view-field-date">
                <label>Select Date for Funeral Mass:</label>
                <input
                  type="date"
                  className="secretary-view-input"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  required
                />
              </div>
              <div className="secretary-funeral-view-field-time">
                <label>Select Time for Funeral Mass:</label>
                <input
                  type="time"
                  className="secretary-view-input"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="secretary-funeral-view-field-date">
              <label>Officiating Priest:</label>
              <input
                type="text"
                className="secretary-view-input"
                value={selectedPriest}
                onChange={(e) => setSelectedPriest(e.target.value)}
                placeholder="Enter priest's name"
                required
              />
            </div>
          </div>
        )}
        
        {/* Action Buttons Section - Only show if not approved yet */}
        {status !== "Approved" && (
          <div className="secretary-funeral-action-buttons">
            <button 
              className="secretary-funeral-submit-button"
              onClick={handleApprove}
            >
              Approve
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FuneralMassView;