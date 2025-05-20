import React, { useState, useRef, useEffect } from "react";
import { AiOutlineArrowLeft, AiOutlineEye, AiOutlineDownload } from "react-icons/ai"; 
import { useLocation, useNavigate } from "react-router-dom";
import "./SecretaryMarriageView.css";
import "./success-modal.css";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import pdmLogo from "../assets/pdmlogo.png";
import church2Img from "../assets/church2.jpg";

const SecretaryMarriageView = () => {
  // State for status and document viewing
  const [status, setStatus] = useState("PENDING");
  const [viewingDocument, setViewingDocument] = useState(null);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [currentCertificatePage, setCurrentCertificatePage] = useState(1);
  const certificateRef = useRef(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [marriageData, setMarriageData] = useState(null);
  const [error, setError] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  // State for modals
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // State for schedule fields
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  const [selectedPriest, setSelectedPriest] = useState("");
  
  // API base URL that can be easily changed
  const API_BASE_URL = "https://parishofdivinemercy.com/backend";

  useEffect(() => {
    // Check if we have necessary state data (marriageID)
    const marriageID = location.state?.marriageID;
    const statusFromNav = location.state?.status;

    if (!marriageID) {
      setError("Missing marriage information. Please try again.");
      setLoading(false);
      return;
    }

    // Set initial status from navigation
    if (statusFromNav) {
      setStatus(statusFromNav);
    }

    // Fetch the marriage details
    fetchMarriageDetails(marriageID);
  }, [location]);

  /**
   * Fetches marriage application details from the server
   * @param {string} marriageID - The ID of the marriage application to fetch
   */
  const fetchMarriageDetails = async (marriageID) => {
    try {
      setLoading(true);
      const url = `${API_BASE_URL}/fetch_marriage_details.php?marriageID=${marriageID}`;
      
      const response = await fetch(url);
      
      // Check if response is OK
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Transform the data into the expected format
        const transformedData = transformMarriageData(data.data);
        
        setMarriageData(transformedData);
        setStatus(transformedData.status || status);
        
        // Initialize schedule fields from fetched data
        setAppointmentDate(transformedData.date || "");
        setAppointmentTime(transformedData.time || "");
        setSelectedPriest(transformedData.priest || "");

        // If it's approved, also fetch schedule details from approved_appointments table
        if (transformedData.status === "Approved") {
          fetchApprovedAppointmentDetails(marriageID);
        }
        
        console.log("Marriage data loaded successfully:", transformedData);
      } else {
        setError(data.message || "Failed to fetch marriage details");
        console.error("API error:", data.message);
      }
    } catch (error) {
      console.error("Error fetching marriage details:", error);
      setError("An error occurred while fetching the data: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetches approved appointment details for the marriage application
   * @param {string} marriageID - The ID of the marriage application
   */
  const fetchApprovedAppointmentDetails = async (marriageID) => {
    try {
      const url = `${API_BASE_URL}/fetch_approved_appointment.php?sacramentID=${marriageID}&sacrament_type=Marriage`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.appointment) {
        // Update ONLY the schedule fields with data from approved_appointments
        setAppointmentDate(data.appointment.date || "");
        setAppointmentTime(data.appointment.time || "");
        setSelectedPriest(data.appointment.priest || "");
        console.log("Approved appointment details loaded:", data.appointment);
      } else {
        console.log("No approved appointment schedule found or there was an error");
      }
    } catch (error) {
      console.error("Error fetching approved appointment schedule:", error);
    }
  };

  /**
   * Transforms the raw marriage data from the API into the expected format
   * @param {Object} data - The raw marriage data from the API
   * @returns {Object} - The transformed marriage data
   */
  const transformMarriageData = (data) => {
    // Check if necessary data exists
    if (!data || !data.marriage) {
      console.error("Invalid data structure received from API", data);
      throw new Error("Invalid data structure received from API");
    }
    
    // Get all data objects from the API response
    const { marriage, groomAddress, brideAddress, firstWitness, secondWitness, requirements } = data;
    
    // Create a fallback/sample data if requirements is missing
    const req = requirements || {};
    
    const transformedData = {
      date: marriage.date || '',
      time: marriage.time || '',
      priest: marriage.priest || '',
      status: marriage.status || 'PENDING',
      marriageID: marriage.marriageID,
      clientID: marriage.clientID || null, // Make sure to capture client ID for notifications
      groom: {
        firstName: marriage.groom_first_name || '',
        middleName: marriage.groom_middle_name || '',
        lastName: marriage.groom_last_name || '',
        age: marriage.groom_age || '',
        dateOfBirth: marriage.groom_dateOfBirth || '',
        placeOfBirth: marriage.groom_placeOfBirth || '',
        dateOfBaptism: marriage.groom_dateOfBaptism || '',
        churchOfBaptism: marriage.groom_churchOfBaptism || '',
        email: marriage.groom_email || '', // Include email for notifications
        address: {
          street: groomAddress?.street || '',
          barangay: groomAddress?.barangay || '',
          municipality: groomAddress?.municipality || '',
          province: groomAddress?.province || ''
        }
      },
      bride: {
        firstName: marriage.bride_first_name || '',
        middleName: marriage.bride_middle_name || '',
        lastName: marriage.bride_last_name || '',
        age: marriage.bride_age || '',
        dateOfBirth: marriage.bride_dateOfBirth || '',
        placeOfBirth: marriage.bride_placeOfBirth || '',
        dateOfBaptism: marriage.bride_dateOfBaptism || '',
        churchOfBaptism: marriage.bride_churchOfBaptism || '',
        email: marriage.bride_email || '', // Include email for notifications
        address: {
          street: brideAddress?.street || '',
          barangay: brideAddress?.barangay || '',
          municipality: brideAddress?.municipality || '',
          province: brideAddress?.province || ''
        }
      },
      witnesses: [
        {
          firstName: firstWitness?.first_name || '',
          middleName: firstWitness?.middle_name || '',
          lastName: firstWitness?.last_name || '',
          gender: firstWitness?.gender || '',
          age: firstWitness?.age || '',
          dateOfBirth: firstWitness?.dateOfBirth || '',
          contact: firstWitness?.contact_number || '',
          address: {
            street: firstWitness?.street || '',
            barangay: firstWitness?.barangay || '',
            municipality: firstWitness?.municipality || '',
            province: firstWitness?.province || ''
          }
        },
        {
          firstName: secondWitness?.first_name || '',
          middleName: secondWitness?.middle_name || '',
          lastName: secondWitness?.last_name || '',
          gender: secondWitness?.gender || '',
          age: secondWitness?.age || '',
          dateOfBirth: secondWitness?.dateOfBirth || '',
          contact: secondWitness?.contact_number || '',
          address: {
            street: secondWitness?.street || '',
            barangay: secondWitness?.barangay || '',
            municipality: secondWitness?.municipality || '',
            province: secondWitness?.province || ''
          }
        }
      ],
      requirements: {
        baptismalCert: {
          submitted: req.baptism_cert_status === 'Submitted',
          fileName: req.baptism_cert ? req.baptism_cert.split('/').pop() : 'N/A'
        },
        confirmationCert: {
          submitted: req.confirmation_cert_status === 'Submitted',
          fileName: req.confirmation_cert ? req.confirmation_cert.split('/').pop() : 'N/A'
        },
        birthCert: {
          submitted: req.birth_cert_status === 'Submitted',
          fileName: req.birth_cert ? req.birth_cert.split('/').pop() : 'N/A'
        },
        marriageLicense: {
          submitted: req.marriage_license_status === 'Submitted',
          fileName: req.marriage_license ? req.marriage_license.split('/').pop() : 'N/A'
        },
        cenomar: {
          submitted: req.cenomar_status === 'Submitted',
          fileName: req.cenomar ? req.cenomar.split('/').pop() : 'N/A'
        },
        publicationBanns: {
          submitted: req.publication_banns_status === 'Submitted',
          fileName: req.publication_banns ? req.publication_banns.split('/').pop() : 'N/A'
        },
        permitFromParish: {
          submitted: req.parish_permit_status === 'Submitted',
          fileName: req.parish_permit ? req.parish_permit.split('/').pop() : 'N/A'
        },
        preCana: {
          submitted: req.pre_cana_status === 'Submitted',
          fileName: req.pre_cana ? req.pre_cana.split('/').pop() : 'N/A'
        },
        sponsorsList: {
          submitted: req.sponsors_list_status === 'Submitted',
          fileName: req.sponsors_list ? req.sponsors_list.split('/').pop() : 'N/A'
        },
        canonicalInterview: {
          submitted: req.canonical_interview_status === 'Submitted',
          fileName: req.canonical_interview ? req.canonical_interview.split('/').pop() : 'N/A'
        }
      },
      // Certificate details
      certificate: {
        registerNumber: "2025-0123",
        pageNumber: "45",
        lineNumber: "12",
        dateIssued: new Date().toISOString().split('T')[0],
        registry: {
          province: "Camarines Norte",
          city: "Daet",
          registryNo: "2025-M-0123",
        },
        solemnizer: {
          name: marriage.priest || "Fr. José Chito M. Estrella",
          position: "Parish Priest",
          address: "Parish of the Divine Mercy, Alawihao, Daet, Camarines Norte"
        }
      }
    };
    
    return transformedData;
  };

  /**
   * Handles the initial approval action when the Approve button is clicked
   * Shows a confirmation modal with the appointment details
   */
  const handleApprove = async () => {
    if (!marriageData || !marriageData.marriageID) {
      alert("No marriage data available to approve.");
      return;
    }

    // Validate required fields
    if (!appointmentDate) {
      alert("Please select a date for the appointment.");
      return;
    }
    
    if (!appointmentTime) {
      alert("Please select a time for the appointment.");
      return;
    }
    
    if (!selectedPriest) {
      alert("Please enter the name of the priest for the ceremony.");
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
      // 1. Save to approved_appointments table
      const appointmentData = {
        sacramentID: marriageData.marriageID,
        sacrament_type: "Marriage",
        date: appointmentDate,
        time: appointmentTime,
        priest: selectedPriest,
        clientID: marriageData.clientID // Include clientID if available
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
      
      // 2. Update the marriage application status
      const updateData = {
        marriageID: marriageData.marriageID,
        status: "Approved",
        date: appointmentDate,
        time: appointmentTime,
        priest: selectedPriest,
        // Include email details for notification
        groomEmail: marriageData.groom?.email,
        brideEmail: marriageData.bride?.email,
        groomName: `${marriageData.groom?.firstName} ${marriageData.groom?.lastName}`,
        brideName: `${marriageData.bride?.firstName} ${marriageData.bride?.lastName}`,
        clientID: marriageData.clientID
      };
      
      console.log("Updating marriage status with data:", updateData);
      
      const response = await fetch(`${API_BASE_URL}/update_marriage_status.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      const result = await response.json();
      
      console.log("Status update response:", result);
      
      if (result.success) {
        // Update local state to reflect changes
        setStatus("Approved");
        setSuccessMessage(result.message || "Marriage application has been approved successfully! An email notification has been sent to the client.");
        setShowSuccessModal(true);
        
        // Update the marriageData to reflect the changes
        setMarriageData({
          ...marriageData,
          date: appointmentDate,
          time: appointmentTime,
          priest: selectedPriest,
          status: "Approved"
        });
      } else {
        const errorMessage = result.message || "Failed to approve marriage application";
        setSuccessMessage(errorMessage);
        setShowSuccessModal(true);
      }
    } catch (error) {
      console.error("Error approving marriage application:", error);
      setSuccessMessage("An error occurred while approving the marriage application: " + error.message);
      setShowSuccessModal(true);
    }
  };

  // Handle date, time and priest changes
  const handleDateChange = (value) => {
    setAppointmentDate(value);
  };

  const handleTimeChange = (value) => {
    setAppointmentTime(value);
  };

  const handlePriestChange = (value) => {
    setSelectedPriest(value);
  };

  // Handle cancel action
  const handleCancel = () => {
    navigate(-1);
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
    if (!certificateRef.current) {
      return;
    }
    
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
      await new Promise(resolve => setTimeout(resolve, 500)); // Delay for page to render

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
      await new Promise(resolve => setTimeout(resolve, 500)); // Delay for page to render
      
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
      
      // Record certificate download
      try {
        await fetch(`${API_BASE_URL}/log_certificate_download.php`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sacramentID: marriageData.marriageID,
            sacrament_type: "Marriage",
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
    return <div className="secretary-marriage-view-value">{value || "N/A"}</div>;
  };

  // Function to render document status with view button
  const renderDocumentStatus = (isSubmitted, fileName) => {
    return (
      <div className="secretary-marriage-document-status-container">
        <div className={`secretary-marriage-view-status ${isSubmitted ? 'secretary-marriage-view-submitted' : 'secretary-marriage-view-not-submitted'}`}>
          {isSubmitted ? `Submitted: ${fileName}` : "Not Submitted"}
        </div>
        {isSubmitted && (
          <button 
            className="secretary-marriage-view-document-btn"
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
      return `/uploads/marriage_requirements/${fileName}`;
    } else {
      // For production server - based on Hostinger file structure
      return `/uploads/marriage_requirements/${fileName}`;
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
      <div className="secretary-marriage-document-viewer-overlay">
        <div className="secretary-marriage-document-viewer-container">
          <div className="secretary-marriage-document-viewer-header">
            <h3>{viewingDocument}</h3>
            <button 
              className="secretary-marriage-document-close-btn"
              onClick={() => setViewingDocument(null)}
            >
              ×
            </button>
          </div>
          <div className="secretary-marriage-document-viewer-content">
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
              <div className="secretary-marriage-document-placeholder">
                <p>Document preview not available for this file type.</p>
                <p>Filename: {viewingDocument}</p>
                <a 
                  href={documentUrl}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="secretary-marriage-document-download-link"
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

  // Confirmation Modal
  const renderConfirmModal = () => {
    if (!showConfirmModal) return null;
    
    return (
 <div className="secretary-document-viewer-overlay">
        <div className="secretary-confirm-modal-container">
          <div className="secretary-confirm-header">
            <h3>Confirm Approval</h3>
            <button 
              className="secretary-document-close-btn"
              onClick={() => setShowConfirmModal(false)}
            >
              ×
            </button>
          </div>
          <div className="secretary-confirm-content">
            <div className="secretary-confirm-icon">?</div>
            <p>Are you sure you want to approve this marriage appointment?</p>
            <p>Date: {appointmentDate}</p>
            <p>Time: {appointmentTime}</p>
            <p>Priest: {selectedPriest}</p>
            <p>An email notification will be sent to the client.</p>
            <div className="secretary-confirm-buttons">
              <button 
                className="secretary-confirm-yes-btn"
                onClick={handleConfirmApproval}
              >
                Yes, Approve
              </button>
              <button 
                className="secretary-confirm-no-btn"
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
    
    // Determine if it's a success or error message
    const isSuccess = !successMessage.includes("error") && !successMessage.includes("failed");
    
    return (
      <div className="secretary-document-viewer-overlay">
        <div className="secretary-document-modal-container">
          <div className="secretary-document-header">
          <h3>{isSuccess ? "Success!" : "Error"}</h3>
          </div>
          <div className="secretary-document-content">
            <div className={isSuccess ? "secretary-success-icon" : "secretary-error-icon"}>
              {isSuccess ? "✓" : "!"}
            </div>
            <p>{successMessage}</p>
            <button 
              className="secretary-confirm-yes-btn"
              onClick={() => {
                setShowSuccessModal(false);
                if (isSuccess) {
                  navigate("/secretary-marriage");
                }
              }}
            >
              {isSuccess ? "Back to Marriage List" : "Close"}
            </button>
          </div>
        </div>
      </div>
    );
  };
  if (loading) {
    return (
      <div className="secretary-marriage-view-container">
        <div className="secretary-marriage-view-loading">Loading marriage details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="secretary-marriage-view-container">
        <div className="secretary-marriage-view-error">
          <p>{error}</p>
          <button onClick={() => navigate(-1)}>Back</button>
        </div>
      </div>
    );
  }

  if (!marriageData) {
    return (
      <div className="secretary-marriage-view-container">
        <div className="secretary-marriage-view-error">
          <p>No marriage data found.</p>
          <button onClick={() => navigate(-1)}>Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="secretary-marriage-view-container">
      {/* Document Viewer Modal */}
      {renderDocumentViewer()}
      
      {/* Certificate Download Modal - Direct Implementation */}
      {showCertificateModal && marriageData && (() => {
        // Extract month and day from marriage date
        const { month, day } = extractMonthDayFromDate(appointmentDate || marriageData.date);
        const year = new Date(appointmentDate || marriageData.date).getFullYear();
        
        return (
          <div className="secretary-marriage-document-viewer-overlay">
            <div className="secretary-marriage-certificate-modal-container">
              <div className="secretary-marriage-document-viewer-header">
                <h3>Marriage Certificate</h3>
                <button 
                  className="secretary-marriage-document-close-btn"
                  onClick={() => setShowCertificateModal(false)}
                >
                  ×
                </button>
              </div>
              <div className="secretary-marriage-certificate-modal-content">
                <div className="secretary-marriage-certificate-page-tabs">
                  <button 
                    className={`secretary-marriage-certificate-page-tab ${currentCertificatePage === 1 ? 'active' : ''}`}
                    onClick={() => handleSwitchPage(1)}
                  >
                    Page 1
                  </button>
                  <button 
                    className={`secretary-marriage-certificate-page-tab ${currentCertificatePage === 2 ? 'active' : ''}`}
                    onClick={() => handleSwitchPage(2)}
                  >
                    Page 2
                  </button>
                </div>
                
                {/* Certificate Preview */}
                <div ref={certificateRef} className="marriage-certificate-preview">
                  {currentCertificatePage === 1 ? (
                    <div key="page-1" className="marriage-certificate-page-1">
                      <div className="marriage-certificate-header">
                        <div className="marriage-certificate-logos">
                          <div className="marriage-parish-logo-left">
                            <img 
                              src={church2Img} 
                              alt="Parish Logo Left" 
                              onError={(e) => {
                                console.error("Failed to load church image");
                                e.target.src = "https://via.placeholder.com/70x70?text=Church";
                              }}
                            />
                          </div>
                          <div className="marriage-certificate-title-section">
                            <div className="republic-title">REPUBLIC OF THE PHILIPPINES</div>
                            <div className="office-title">OFFICE OF THE CIVIL REGISTRAR GENERAL</div>
                            <div className="certificate-title">CERTIFICATE OF MARRIAGE</div>
                            <div className="certificate-id">Marriage ID: {marriageData.marriageID}</div>
                          </div>
                          <div className="marriage-parish-logo-right">
                            <img 
                              src={pdmLogo} 
                              alt="Parish Logo Right" 
                              onError={(e) => {
                                console.error("Failed to load PDM logo");
                                e.target.src = "https://via.placeholder.com/80x80?text=PDM";
                              }}
                            />
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
                                    <span className="date-value">{new Date(marriageData.groom.dateOfBirth).getDate() || "-"}</span>
                                    <span className="date-label">(Day)</span>
                                  </div>
                                  <div className="date-part">
                                    <span className="date-value">{new Date(marriageData.groom.dateOfBirth).getMonth() + 1 || "-"}</span>
                                    <span className="date-label">(Month)</span>
                                  </div>
                                  <div className="date-part">
                                    <span className="date-value">{new Date(marriageData.groom.dateOfBirth).getFullYear() || "-"}</span>
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
                                    <span className="date-value">{new Date(marriageData.bride.dateOfBirth).getDate() || "-"}</span>
                                    <span className="date-label">(Day)</span>
                                  </div>
                                  <div className="date-part">
                                    <span className="date-value">{new Date(marriageData.bride.dateOfBirth).getMonth() + 1 || "-"}</span>
                                    <span className="date-label">(Month)</span>
                                  </div>
                                  <div className="date-part">
                                    <span className="date-value">{new Date(marriageData.bride.dateOfBirth).getFullYear() || "-"}</span>
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
                                <span className="date-value">{month}</span>
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
                    <div key="page-2" className="marriage-certificate-page-2">
                      <div className="marriage-certificate-header">
                        <div className="marriage-certificate-title-section">
                          <div className="certificate-page-title">CERTIFICATE OF MARRIAGE</div>
                          <div className="certificate-id">Marriage ID: {marriageData.marriageID}</div>
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
                              The marriage was solemnized by <strong>{selectedPriest || marriageData.certificate.solemnizer.name}</strong>, {marriageData.certificate.solemnizer.position}, in the presence of witnesses <strong>{marriageData.witnesses[0].firstName} {marriageData.witnesses[0].middleName} {marriageData.witnesses[0].lastName}</strong> and <strong>{marriageData.witnesses[1].firstName} {marriageData.witnesses[1].middleName} {marriageData.witnesses[1].lastName}</strong>.
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
                                <p>{selectedPriest || marriageData.certificate.solemnizer.name}</p>
                                <p>{marriageData.certificate.solemnizer.position}</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="certification-footer">
                            <div className="registry-details">
                              <p><strong>Registry No:</strong> {marriageData.certificate.registry.registryNo}</p>
                              <p><strong>Date Issued:</strong> {formatDate(marriageData.certificate.dateIssued)}</p>
                              <p><strong>Marriage ID:</strong> {marriageData.marriageID}</p>
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
                
                <div className="secretary-marriage-certificate-modal-actions">
                  <button 
                    className="secretary-marriage-certificate-download-btn"
                    onClick={downloadCertificateAsPDF}
                    disabled={isDownloading}
                  >
                    {isDownloading ? 'Processing...' : <><AiOutlineDownload /> Download</>}
                  </button>
                  <button 
                    className="secretary-marriage-certificate-cancel-btn"
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
      })()}
      
      {/* Confirmation Modal */}
      {renderConfirmModal()}
      
      {/* Success Modal */}
      {renderSuccessModal()}
      
      {/* Header */}
      <div className="secretary-marriage-view-header">
        <div className="secretary-marriage-view-left-section">
          <button className="secretary-marriage-view-back-button" onClick={() => navigate(-1)}>
            <AiOutlineArrowLeft className="secretary-marriage-view-back-icon" /> Back
          </button>
        </div>
        <div className="secretary-marriage-view-right-section">
          {status === "Approved" && (
            <button 
              className="secretary-marriage-download-certificate-btn"
              onClick={handleDownloadCertificate}
            >
              <AiOutlineDownload /> Download Certificate
            </button>
          )}
        </div>
      </div>
      <h1 className="secretary-marriage-view-title">Holy Matrimony Application Details</h1>
      
      {/* Marriage Data Section */}
      <div className="secretary-marriage-view-data">
        <div className="secretary-marriage-view-row-date">
          <div className="secretary-marriage-view-field-date">
            <label>Date of Appointment:</label>
            {renderReadOnlyField(formatDate(marriageData.date))}
          </div>
          
          <div className="secretary-marriage-view-field-time">
            <label>Time of Appointment:</label>
            {renderReadOnlyField(marriageData.time)}
          </div>
        </div>
        
        <div className="secretary-marriage-view-bypart">
          <h3 className="secretary-marriage-view-sub-title">Groom Information</h3>
          <div className="secretary-marriage-view-info-card">
            <div className="secretary-marriage-view-row">
              <div className="secretary-marriage-view-field">
                <label>First Name:</label>
                {renderReadOnlyField(marriageData.groom.firstName)}
              </div>
              <div className="secretary-marriage-view-field">
                <label>Middle Name:</label>
                {renderReadOnlyField(marriageData.groom.middleName)}
              </div>
              <div className="secretary-marriage-view-field">
                <label>Last Name:</label>
                {renderReadOnlyField(marriageData.groom.lastName)}
              </div>
              <div className="secretary-marriage-view-field">
                <label>Age:</label>
                {renderReadOnlyField(marriageData.groom.age)}
              </div>
            </div>
            
            <div className="secretary-marriage-view-row">
              <div className="secretary-marriage-view-field">
                <label>Date of Birth:</label>
                {renderReadOnlyField(formatDate(marriageData.groom.dateOfBirth))}
              </div>
               <div className="client-marriage-view-field">
                <label>Date of Baptism:</label>
                <div className="client-marriage-view-value">{marriageData.groom.dateOfBaptism}</div>
              </div>
              <div className="client-marriage-view-field-dob">
                <label>Church of Baptism:</label>
                <div className="client-marriage-view-value">{marriageData.groom.churchOfBaptism}</div>
              </div>
            </div>
            <label className="mini-view">Place of Birth</label>
            
            <div className="secretary-marriage-view-row">
              <div className="secretary-marriage-view-field">
                <label>Place of Birth:</label>
                <div className="secretary-marriage-view-value">{marriageData.groom.placeOfBirth}</div>
              </div>
            </div>
            
            {/* Address Fields */}
            <label className="mini-view">Home Address</label>
            <div className="secretary-marriage-view-row secretary-marriage-address-view-row">
            <div className="secretary-marriage-view-field">
                <label>Street:</label>
                {renderReadOnlyField(marriageData.groom.address.street)}
              </div>
              <div className="secretary-marriage-view-field">
                <label>Barangay:</label>
                {renderReadOnlyField(marriageData.groom.address.barangay)}
              </div>
              <div className="secretary-marriage-view-field">
                <label>Municipality:</label>
                {renderReadOnlyField(marriageData.groom.address.municipality)}
              </div>
            </div>
            <div className="secretary-marriage-view-row secretary-marriage-address-view-row">
              <div className="secretary-marriage-view-field">
                <label>Province:</label>
                {renderReadOnlyField(marriageData.groom.address.province)}
              </div>
            </div>
          </div>

          {/* Bride's Information */}
          <h3 className="secretary-marriage-view-sub-title">Bride Information</h3>
          <div className="secretary-marriage-view-info-card">
            <div className="secretary-marriage-view-row">
              <div className="secretary-marriage-view-field">
                <label>First Name:</label>
                {renderReadOnlyField(marriageData.bride.firstName)}
              </div>
              <div className="secretary-marriage-view-field">
                <label>Middle Name:</label>
                {renderReadOnlyField(marriageData.bride.middleName)}
              </div>
              <div className="secretary-marriage-view-field">
                <label>Last Name:</label>
                {renderReadOnlyField(marriageData.bride.lastName)}
              </div>
              <div className="secretary-marriage-view-field">
                <label>Date of Birth:</label>
                {renderReadOnlyField(formatDate(marriageData.bride.dateOfBirth))}
              </div>
            </div>
            
            <div className="secretary-marriage-view-row">
            <div className="secretary-marriage-view-field">
                <label>Age:</label>
                {renderReadOnlyField(marriageData.bride.age)}
              </div>
              <div className="secretary-marriage-view-field">
                <label>Date of Baptism:</label>
                {renderReadOnlyField(formatDate(marriageData.bride.dateOfBaptism))}
              </div>
              <div className="secretary-marriage-view-field">
                <label>Church of Baptism:</label>
                {renderReadOnlyField(marriageData.bride.churchOfBaptism)}
              </div>
            </div>
            <div className="secretary-marriage-view-row">
              <div className="secretary-marriage-view-field">
                <label>Place of Birth:</label>
                {renderReadOnlyField(marriageData.bride.placeOfBirth)}
              </div>
            </div>
            
            {/* Address Fields */}
            <label className="mini-view">Home Address</label>
            <div className="secretary-marriage-view-row secretary-marriage-address-view-row">
              <div className="secretary-marriage-view-field">
                <label>Barangay:</label>
                {renderReadOnlyField(marriageData.bride.address.barangay)}
              </div>
              <div className="secretary-marriage-view-field">
                <label>Street:</label>
                {renderReadOnlyField(marriageData.bride.address.street)}
              </div>
              <div className="secretary-marriage-view-field">
                <label>Municipality:</label>
                {renderReadOnlyField(marriageData.bride.address.municipality)}
              </div>
            </div>
            <div className="secretary-marriage-view-row secretary-marriage-address-view-row">
              <div className="secretary-marriage-view-field">
                <label>Province:</label>
                {renderReadOnlyField(marriageData.bride.address.province)}
              </div>
            </div>
          </div>

          <h3 className="secretary-marriage-view-sub-title">Witness Information</h3>
          {/* First Witness Information */}
          <div className="secretary-marriage-view-info-card">
            <h4 className="secretary-marriage-view-witness-title">First Witness</h4>
            <div className="secretary-marriage-view-row">
              <div className="secretary-marriage-view-field">
                <label>First Name:</label>
                {renderReadOnlyField(marriageData.witnesses[0].firstName)}
              </div>
              <div className="secretary-marriage-view-field">
                <label>Middle Name:</label>
                {renderReadOnlyField(marriageData.witnesses[0].middleName)}
              </div>
              <div className="secretary-marriage-view-field">
                <label>Last Name:</label>
                {renderReadOnlyField(marriageData.witnesses[0].lastName)}
              </div>
              <div className="secretary-marriage-view-field">
                <label>Date of Birth:</label>
                {renderReadOnlyField(formatDate(marriageData.witnesses[0].dateOfBirth))}
              </div>
            </div>
            
            <div className="secretary-marriage-view-row">
              <div className="secretary-marriage-view-field">
                <label>Age:</label>
                {renderReadOnlyField(marriageData.witnesses[0].age)}
              </div>
              <div className="secretary-marriage-view-field">
                <label>Gender:</label>
                {renderReadOnlyField(marriageData.witnesses[0].gender)}
              </div>
              <div className="secretary-marriage-view-field">
                <label>Contact Number:</label>
                {renderReadOnlyField(marriageData.witnesses[0].contact)}
              </div>
            </div>
            
            {/* Address Fields */}
            <div className="secretary-marriage-view-row secretary-marriage-address-view-row">
            <div className="secretary-marriage-view-field">
                <label>Street:</label>
                {renderReadOnlyField(marriageData.witnesses[0].address.street)}
              </div>
            <div className="secretary-marriage-view-field">
                <label>Barangay:</label>
                {renderReadOnlyField(marriageData.witnesses[0].address.barangay)}
              </div>
              <div className="secretary-marriage-view-field">
                <label>Municipality:</label>
                {renderReadOnlyField(marriageData.witnesses[0].address.municipality)}
              </div>
              <div className="secretary-marriage-view-field">
                <label>Province:</label>
                {renderReadOnlyField(marriageData.witnesses[0].address.province)}
              </div>
            </div>
          </div>
          
          {/* Second Witness Information */}
          <div className="secretary-marriage-view-info-card">
            <h4 className="secretary-marriage-view-witness-title">Second Witness</h4>
            <div className="secretary-marriage-view-row">
              <div className="secretary-marriage-view-field">
                <label>First Name:</label>
                {renderReadOnlyField(marriageData.witnesses[1].firstName)}
              </div>
              <div className="secretary-marriage-view-field">
                <label>Middle Name:</label>
                {renderReadOnlyField(marriageData.witnesses[1].middleName)}
              </div>
              <div className="secretary-marriage-view-field">
                <label>Last Name:</label>
                {renderReadOnlyField(marriageData.witnesses[1].lastName)}
              </div>
              <div className="secretary-marriage-view-field">
                <label>Date of Birth:</label>
                {renderReadOnlyField(formatDate(marriageData.witnesses[1].dateOfBirth))}
              </div>
            </div>
            
            <div className="secretary-marriage-view-row">
              <div className="secretary-marriage-view-field">
                <label>Age:</label>
                {renderReadOnlyField(marriageData.witnesses[1].age)}
              </div>
              <div className="secretary-marriage-view-field">
                <label>Gender:</label>
                {renderReadOnlyField(marriageData.witnesses[1].gender)}
              </div>
              <div className="secretary-marriage-view-field">
                <label>Contact Number:</label>
                {renderReadOnlyField(marriageData.witnesses[1].contact)}
              </div>
            </div>
            
            {/* Address Fields */}
            <div className="secretary-marriage-view-row secretary-marriage-address-view-row">
            <div className="secretary-marriage-view-field">
                <label>Street:</label>
                {renderReadOnlyField(marriageData.witnesses[1].address.street)}
              </div>
            <div className="secretary-marriage-view-field">
                <label>Barangay:</label>
                {renderReadOnlyField(marriageData.witnesses[1].address.barangay)}
              </div>
              <div className="secretary-marriage-view-field">
                <label>Municipality:</label>
                {renderReadOnlyField(marriageData.witnesses[1].address.municipality)}
              </div>
              <div className="secretary-marriage-view-field">
                <label>Province:</label>
                {renderReadOnlyField(marriageData.witnesses[1].address.province)}
              </div>
            </div>
          </div>
        </div>
        
        {/* Requirements Section */}
        <div className="secretary-marriage-requirements-view-container">
          <h2 className="secretary-marriage-requirements-view-title">Requirements</h2>
          <div className="secretary-marriage-requirements-view-box">
            <h3 className="secretary-marriage-view-section-header">Documents Required(All documents must be submitted to the Parish Office)</h3>
            <div className="secretary-marriage-view-checkbox-list">
              <div className="secretary-marriage-requirement-view-item">
                <div className="secretary-marriage-view-requirement-name">
                  Marriage License (Issued by the civil registry)
                </div>
              </div>
              
              <div className="secretary-marriage-requirement-view-item">
                <div className="secretary-marriage-view-requirement-name">
                  Certificate of No Marriage (CENOMAR, issued by PSA)
                </div>
              </div>

              <div className="secretary-marriage-requirement-view-item">
                <div className="secretary-marriage-view-requirement-name">
                  Publication of Banns (Announcements made in the parish for three consecutive Sundays)
                </div>
              </div>

              <div className="secretary-marriage-requirement-view-item">
                <div className="secretary-marriage-view-requirement-name">
                  Permit from Proper Parish (If wedding is held outside couple's parish)
                </div>
              </div>

              <div className="secretary-marriage-requirement-view-item">
                <div className="secretary-marriage-view-requirement-name">
                  Pre-Cana Seminar (Marriage Preparation Program certificate)
                </div>
              </div>

              <div className="secretary-marriage-requirement-view-item">
                <div className="secretary-marriage-view-requirement-name">
                  Complete List of Sponsors (Ninong & Ninang)
                </div>
              </div>

              <div className="secretary-marriage-requirement-view-item">
                <div className="secretary-marriage-view-requirement-name">
                  Canonical Interview/Examination (Required interview with parish priest)
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Schedule Selection Section */}
        <div className="secretary-marriage-view-info-card">
          <h2 className="secretary-marriage-view-sub-title">Schedule Selection</h2>
          <div className="secretary-marriage-view-row">
            <div className="secretary-marriage-view-field">
              <label>Date of Holy Matrimony:</label>
              <input
                type="date"
                className="secretary-view-input"
                value={appointmentDate}
                onChange={(e) => handleDateChange(e.target.value)}
                disabled={status === "Approved"}
              />
            </div>
            <div className="secretary-marriage-view-field">
              <label>Time of Holy Matrimony:</label>
              <input
                type="time"
                className="secretary-view-input"
                value={appointmentTime}
                onChange={(e) => handleTimeChange(e.target.value)}
                disabled={status === "Approved"}
              />
            </div>
          </div>
          <div className="secretary-marriage-view-row">
            <div className="secretary-marriage-view-field">
              <label>Name of the Priest:</label>
              <input
                type="text"
                className="secretary-view-input"
                value={selectedPriest}
                onChange={(e) => handlePriestChange(e.target.value)}
                placeholder="Enter priest's name"
                disabled={status === "Approved"}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons Section */}
        <div className="secretary-marriage-action-buttons">
          {status !== "Approved" && (
            <button 
              className="secretary-marriage-submit-button"
              onClick={handleApprove}
            >
              Approve
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SecretaryMarriageView;