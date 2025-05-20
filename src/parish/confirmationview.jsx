import React, { useState, useRef, useEffect } from "react";
import { AiOutlineArrowLeft, AiOutlineEye, AiOutlineDownload } from "react-icons/ai"; 
import { useLocation, useNavigate } from "react-router-dom";
import "../secretary/secretaryconfirmationview.css";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import pdmLogo from "../assets/pdmlogo.png";
import church2Img from "../assets/church2.jpg";

const ConfirmationView = () => {
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
  const [confirmationData, setConfirmationData] = useState(null);
  const [error, setError] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Dedicated state variables for schedule selection
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedPriest, setSelectedPriest] = useState("");
  
  // API base URL for consistency
  const API_BASE_URL = "https://parishofdivinemercy.com/backend";

  useEffect(() => {
    // Check if we have necessary state data (confirmationID)
    const confirmationID = location.state?.confirmationID;
    const statusFromNav = location.state?.status;

    console.log("Component mounted, location state:", location.state);
    console.log("confirmationID:", confirmationID);
    console.log("statusFromNav:", statusFromNav);

    if (!confirmationID) {
      setError("Missing confirmation information. Please try again.");
      setLoading(false);
      return;
    }

    // Set initial status from navigation - this takes priority
    if (statusFromNav) {
      setStatus(statusFromNav);
    }

    // Fetch the confirmation details
    fetchConfirmationDetails(confirmationID, statusFromNav);
  }, [location]);

  const fetchConfirmationDetails = async (confirmationID, statusFromNav) => {
    try {
      setLoading(true);
      console.log(`Fetching confirmation details for ID: ${confirmationID}, statusFromNav: ${statusFromNav}`);
      
      const response = await fetch(`${API_BASE_URL}/fetch_confirmation_details.php?confirmationID=${confirmationID}`);
      const data = await response.json();
      
      console.log("API response data:", data);
      
      if (data.success) {
        // Transform the data into the expected format
        const transformedData = transformConfirmationData(data.data);
        console.log("Transformed confirmation data:", transformedData);
        
        setConfirmationData(transformedData);
        
        // Use status from location.state if provided, otherwise use from API
        const currentStatus = statusFromNav || transformedData.status || "PENDING";
        setStatus(currentStatus);
        console.log("Setting status to:", currentStatus);
        
        // Initialize with empty values first
        setSelectedDate("");
        setSelectedTime("");
        setSelectedPriest("");
        
        // Always fetch from approved_appointments table first to get most up-to-date schedule
        const approved = await fetchApprovedAppointmentDetails(confirmationID);
        
        // If not in approved_appointments or not approved status, use the dates from confirmation_application
        if (!approved && currentStatus !== "Approved") {
          setSelectedDate(transformedData.date || "");
          setSelectedTime(transformedData.time || "");
          setSelectedPriest(transformedData.priest || "");
          console.log("Using data from confirmation application:", {
            date: transformedData.date,
            time: transformedData.time,
            priest: transformedData.priest
          });
        }
      } else {
        setError(data.message || "Failed to fetch confirmation details");
      }
    } catch (error) {
      console.error("Error fetching confirmation details:", error);
      setError("An error occurred while fetching the data");
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch schedule details from approved_appointments
  const fetchApprovedAppointmentDetails = async (confirmationID) => {
    try {
      console.log("Fetching approved appointment details for confirmationID:", confirmationID);
      const response = await fetch(`${API_BASE_URL}/fetch_approved_appointment.php?sacramentID=${confirmationID}&sacrament_type=Confirmation`);
      
      if (!response.ok) {
        console.error("Error response:", response.status);
        return false;
      }
      
      const data = await response.json();
      console.log("Approved appointment data response:", data);
      
      if (data.success && data.appointment) {
        // Update ONLY the schedule fields with data from approved_appointments
        console.log("Setting appointment values from approved_appointments DB:", {
          date: data.appointment.date,
          time: data.appointment.time,
          priest: data.appointment.priest
        });
        
        setSelectedDate(data.appointment.date || "");
        setSelectedTime(data.appointment.time || "");
        setSelectedPriest(data.appointment.priest || "");
        
        return true; // Successfully found and set appointment data
      } else {
        console.log("No approved appointment schedule found or there was an error");
        return false;
      }
    } catch (error) {
      console.error("Error fetching approved appointment schedule:", error);
      return false;
    }
  };

  const transformConfirmationData = (data) => {
    // Format the data from PHP API response to match the component's expected format
    const { confirmation, address, father, mother, requirements } = data;
    
    // Debug logs
    console.log("Original API data:", data);
    console.log("Requirements data:", requirements);
    
    // Create the transformed data object
    const transformedData = {
      date: confirmation.date,
      time: confirmation.time,
      priest: confirmation.priest,
      status: confirmation.status,
      confirmationID: confirmation.confirmationID,
      candidate: {
        firstName: confirmation.first_name,
        middleName: confirmation.middle_name,
        lastName: confirmation.last_name,
        gender: confirmation.gender,
        age: confirmation.age,
        dateOfBirth: confirmation.dateOfBirth,
        dateOfBaptism: confirmation.dateOfBaptism,
        churchOfBaptism: confirmation.churchOfBaptism,
        placeOfBirth: confirmation.placeOfBirth || 'N/A'
      },
      father: {
        firstName: father?.first_name || 'N/A',
        middleName: father?.middle_name || 'N/A',
        lastName: father?.last_name || 'N/A',
        placeOfBirth: father?.placeOfBirth || 'N/A',
        dateOfBirth: father?.dateOfBirth || 'N/A',
        contact: father?.contact_number || 'N/A'
      },
      mother: {
        firstName: mother?.first_name || 'N/A',
        middleName: mother?.middle_name || 'N/A',
        lastName: mother?.last_name || 'N/A',
        placeOfBirth: mother?.placeOfBirth || 'N/A',
        dateOfBirth: mother?.dateOfBirth || 'N/A',
        contact: mother?.contact_number || 'N/A'
      },
      address: {
        street: address?.street || 'N/A',
        barangay: address?.barangay || 'N/A',
        municipality: address?.municipality || 'N/A',
        province: address?.province || 'N/A',
        region: address?.region || 'N/A'
      },
      sponsor: {
        name: "To be assigned", // This may need to be added to your database
        address: "N/A"
      },
      requirements: {
        baptismCert: {
          submitted: requirements?.baptism_cert_status === 'Submitted',
          fileName: requirements?.baptism_cert || 'N/A',
          status: requirements?.baptism_cert_status || 'Not Submitted'
        },
        birthCert: {
          submitted: requirements?.birth_cert_status === 'Submitted',
          fileName: requirements?.birth_cert || 'N/A',
          status: requirements?.birth_cert_status || 'Not Submitted'
        },
        validIds: {
          submitted: requirements?.valid_ids_status === 'Submitted',
          fileName: requirements?.valid_ids || 'N/A',
          status: requirements?.valid_ids_status || 'Not Submitted'
        }
      },
      // Added certificate details
      certificate: {
        registerNumber: "1",
        pageNumber: "97",
        lineNumber: "6",
        dateIssued: new Date().toISOString().split('T')[0],
        purposeOf: "Marriage"
      }
    };
    
    // Log the transformed requirements for debugging
    console.log("Transformed requirements:", transformedData.requirements);
    
    return transformedData;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!confirmationData || !confirmationData.confirmationID) {
      alert("No confirmation data available to approve.");
      return;
    }
    
    // Validate required fields
    if (!selectedDate) {
      alert("Please select a date for the confirmation.");
      return;
    }
    
    if (!selectedTime) {
      alert("Please select a time for the confirmation.");
      return;
    }
    
    if (!selectedPriest) {
      alert("Please enter the name of the priest for the confirmation.");
      return;
    }
    
    // Debug log
    console.log("Submit values:", {
      selectedDate,
      selectedTime,
      selectedPriest
    });

    // Show confirmation modal instead of submitting immediately
    setShowConfirmModal(true);
  };

  // Function to proceed with approval after confirmation
  const handleConfirmApproval = async () => {
    setShowConfirmModal(false);
    
    try {
      console.log(`Approving confirmation application with ID: ${confirmationData.confirmationID}`);
      
      // Step 1: First save the appointment data to approved_appointments table
      const appointmentResponse = await fetch(`${API_BASE_URL}/save_approved_appointment.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sacramentID: confirmationData.confirmationID,
          sacrament_type: "Confirmation",
          date: selectedDate,
          time: selectedTime,
          priest: selectedPriest
        }),
      });
      
      const appointmentResult = await appointmentResponse.json();
      console.log("Appointment save result:", appointmentResult);
      
      if (!appointmentResult.success) {
        throw new Error(appointmentResult.message || "Failed to save appointment details");
      }
      
      // Step 2: Now update the confirmation status
      const response = await fetch(`${API_BASE_URL}/update_confirmation_status.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          confirmationID: confirmationData.confirmationID,
          status: "Approved",
          date: selectedDate,
          time: selectedTime,
          priest: selectedPriest
        }),
      });

      // First check if the response is valid JSON
      let result;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        result = await response.json();
      } else {
        // If not JSON, get the text and show it as an error
        const text = await response.text();
        console.error("Non-JSON response:", text);
        throw new Error("Invalid response from server. Please check server logs.");
      }
      
      if (result.success) {
        setStatus("Approved");
        
        // Update local state with the selected values
        setConfirmationData({
          ...confirmationData,
          date: selectedDate,
          time: selectedTime,
          priest: selectedPriest,
          status: "Approved"
        });
        
        setSuccessMessage("Confirmation application has been approved successfully! An email notification has been sent to the client.");
        setShowSuccessModal(true);
      } else {
        // Show error message from server or a default one
        const errorMessage = result.message || "Failed to approve confirmation application";
        setSuccessMessage(errorMessage);
        setShowSuccessModal(true);
      }
    } catch (error) {
      console.error("Error approving confirmation application:", error);
      setSuccessMessage("An error occurred while approving the confirmation application: " + error.message);
      setShowSuccessModal(true);
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
  const renderDocumentStatus = (isSubmitted, fileName, requirementType) => {
    console.log(`Rendering document status for ${requirementType}:`, { isSubmitted, fileName });
    
    // Make sure we handle null or undefined values properly
    const fileNameDisplay = fileName && fileName !== 'N/A' ? fileName : 'No file';
    const displayStatus = isSubmitted ? `Submitted: ${fileNameDisplay}` : "Not Submitted";
    
    return (
      <div className="secretary-conf-document-status-container">
        <div className={`secretary-conf-view-status ${isSubmitted ? 'secretary-conf-view-submitted' : 'secretary-conf-view-not-submitted'}`}>
          {displayStatus}
        </div>
        {isSubmitted && fileName && fileName !== 'N/A' && (
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

  // Function to get document URL based on environment and server configuration
  const getDocumentUrl = (fileName) => {
    // Determine base URL depending on environment
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    
    if (isLocalhost) {
      // For local development
      return `/uploads/confirmation_requirements/${fileName}`;
    } else {
      // For production server - based on Hostinger file structure
      return `/uploads/confirmation_requirements/${fileName}`;
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
    
    // Get clean filename without full path
    const displayName = "Document Preview";

    return (
      <div className="secretary-conf-document-viewer-overlay">
        <div className="secretary-conf-document-viewer-container">
          <div className="secretary-conf-document-viewer-header">
            <h3>{displayName}</h3>
            <button 
              className="secretary-conf-document-close-btn"
              onClick={() => setViewingDocument(null)}
            >
              ×
            </button>
          </div>
          <div className="secretary-conf-document-viewer-content">
            {isImage && (
              <img 
                src={documentUrl} 
                alt={displayName}
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
                title={displayName}
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
              <div className="secretary-conf-document-placeholder">
                <p>Document preview not available for this file type.</p>
                <a 
                  href={documentUrl}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="secretary-conf-document-download-link"
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
    if (!showCertificateModal || !confirmationData) return null;

    // Extract month and day from confirmation date
    const { month, day } = extractMonthDayFromDate(selectedDate || confirmationData.date);
    const year = new Date(selectedDate || confirmationData.date).getFullYear();

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
                    <img src={church2Img} alt="Parish Logo Left" 
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/70x70?text=Church";
                      }}
                    />
                  </div>
                  <div className="parish-title">
                    <div className="diocese-title">DIOCESE OF DAET</div>
                    <div className="parish-name">PARISH OF THE DIVINE MERCY</div>
                    <div className="parish-address">Alawihao, Daet, 4600 Camarines Norte, Philippines</div>
                  </div>
                  <div className="confirmation-parish-logo-right">
                    <img src={pdmLogo} alt="Parish Logo Right" 
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/80x80?text=PDM";
                      }}
                    />
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
                  <div className="cert-value">{confirmationData.address.barangay}, {confirmationData.address.street}, {confirmationData.address.municipality}, {confirmationData.address.province}, {confirmationData.address.region}</div>
                  <div className="cert-label">(Residence)</div>
                </div>
                
                <div className="cert-field birth-place-field">
                  <div className="cert-value">{confirmationData.candidate.placeOfBirth}</div>
                  <div className="cert-label">(Place of Birth)</div>
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
                  <div className="cert-value">{selectedPriest || confirmationData.priest}</div>
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
                  <div className="cert-value signature-line">
                    {(selectedPriest || confirmationData.priest).toUpperCase().startsWith('REV') || 
                    (selectedPriest || confirmationData.priest).toUpperCase().startsWith('FR') 
                    ? (selectedPriest || confirmationData.priest).toUpperCase() 
                    : `REV. FR. ${(selectedPriest || confirmationData.priest).toUpperCase()}`}
                  </div>
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

  // Success/Error Modal Component
  const renderSuccessModal = () => {
    if (!showSuccessModal) return null;

    // Determine if it's a success or error message
    const isSuccess = successMessage.includes("successfully");
    const modalType = isSuccess ? "success" : "error";

    // Handle OK button click
    const handleOkClick = () => {
      setShowSuccessModal(false);
      
      // If this was a successful approval, navigate back to the confirmation list
      if (isSuccess) {
        navigate("/secretary-confirmation");
      }
    };

    return (
      <div className="secretary-conf-document-viewer-overlay">
        <div className={`secretary-conf-${modalType}-modal-container`}>
          <div className={`secretary-conf-${modalType}-header`}>
            <h3>{isSuccess ? "Success" : "Error"}</h3>
            <button 
              className="secretary-conf-document-close-btn"
              onClick={() => setShowSuccessModal(false)}
            >
              ×
            </button>
          </div>
          <div className={`secretary-conf-${modalType}-content`}>
            <div className={`secretary-conf-${modalType}-icon`}>
              {isSuccess ? "✓" : "!"}
            </div>
            <p>{successMessage}</p>
            <button 
              className={`secretary-conf-${modalType}-ok-btn`}
              onClick={handleOkClick}
            >
              OK
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Confirmation Modal Component
  const renderConfirmModal = () => {
    if (!showConfirmModal) return null;

    return (
      <div className="secretary-conf-document-viewer-overlay">
        <div className="secretary-conf-confirm-modal-container">
          <div className="secretary-conf-confirm-header">
            <h3>Confirm Approval</h3>
            <button 
              className="secretary-conf-document-close-btn"
              onClick={() => setShowConfirmModal(false)}
            >
              ×
            </button>
          </div>
          <div className="secretary-conf-confirm-content">
            <div className="secretary-conf-confirm-icon">?</div>
            <p>Are you sure you want to approve this confirmation appointment?</p>
            <p>Date: {selectedDate}</p>
            <p>Time: {selectedTime}</p>
            <p>Priest: {selectedPriest}</p>
            <p>This will send an email notification to the client.</p>
            <div className="secretary-conf-confirm-buttons">
              <button 
                className="secretary-conf-confirm-yes-btn"
                onClick={handleConfirmApproval}
              >
                Yes, Approve
              </button>
              <button 
                className="secretary-conf-confirm-no-btn"
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

  if (loading) {
    return (
      <div className="secretary-confirmation-view-container">
        <div className="secretary-confirmation-view-loading">Loading confirmation details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="secretary-confirmation-view-container">
        <div className="secretary-confirmation-view-error">
          <p>{error}</p>
          <button onClick={() => navigate(-1)}>Back</button>
        </div>
      </div>
    );
  }

  if (!confirmationData) {
    return (
      <div className="secretary-confirmation-view-container">
        <div className="secretary-confirmation-view-error">
          <p>No confirmation data found.</p>
          <button onClick={() => navigate(-1)}>Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="secretary-confirmation-view-container">
      {/* Document Viewer Modal */}
      {renderDocumentViewer()}
      
      {/* Certificate Download Modal */}
      {renderCertificateModal()}
      
      {/* Success Modal */}
      {renderSuccessModal()}
      
      {/* Confirmation Modal */}
      {renderConfirmModal()}
      
      {/* Header */}
      <div className="secretary-conf-view-header">
        <div className="secretary-conf-view-left-section">
          <button className="secretary-conf-view-back-button" onClick={() => navigate(-1)}>
            <AiOutlineArrowLeft className="secretary-conf-view-back-icon" /> Back
          </button>
        </div>
      </div>
      <h1 className="secretary-conf-view-title">Confirmation Application Details</h1>
      
      {/* Confirmation Data Section */}
      <div className="secretary-conf-view-data">
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
                <label>Date of Birth:</label>
                {renderReadOnlyField(formatDate(confirmationData.candidate.dateOfBirth))}
              </div>
            </div>
            
            <div className="secretary-conf-view-row">
              <div className="secretary-conf-view-field">
                <label>Age:</label>
                {renderReadOnlyField(confirmationData.candidate.age)}
              </div>
              <div className="secretary-conf-view-field">
                <label>Gender:</label>
                {renderReadOnlyField(confirmationData.candidate.gender)}
              </div>
                 <div className="secretary-conf-view-field">
                <label>Date of Baptism:</label>
                {renderReadOnlyField(formatDate(confirmationData.candidate.dateOfBaptism))}
              </div>
              <div className="secretary-conf-view-field">
                <label>Church of Baptism:</label>
                {renderReadOnlyField(confirmationData.candidate.churchOfBaptism)}
              </div>
            </div>
            
            <div className="secretary-conf-view-row">
              <div className="secretary-conf-view-field">
                <label>Place of Birth:</label>
                {renderReadOnlyField(confirmationData.candidate.placeOfBirth)}
              </div>
            </div>
            
            {/* Address Fields with section label */}
            <label className="sub-mini-cc">Home Address</label>
            <div className="secretary-conf-view-row">
            <div className="secretary-conf-view-field">
                <label>Street:</label>
                {renderReadOnlyField(confirmationData.address.street)}
              </div>
              <div className="secretary-conf-view-field">
                <label>Barangay:</label>
                {renderReadOnlyField(confirmationData.address.barangay)}
              </div>
              <div className="secretary-conf-view-field">
                <label>Municipality:</label>
                {renderReadOnlyField(confirmationData.address.municipality)}
              </div>
            </div>
            <div className="secretary-conf-view-row secretary-conf-address-view-row">
              <div className="secretary-conf-view-field">
                <label>Province:</label>
                {renderReadOnlyField(confirmationData.address.province)}
              </div>
              <div className="secretary-conf-view-field">
                <label>Region:</label>
                {renderReadOnlyField(confirmationData.address.region)}
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
            <div className="secretary-conf-view-field">
                <label>Father's Date of Birth:</label>
                {renderReadOnlyField(formatDate(confirmationData.father.dateOfBirth))}
              </div>
              <div className="secretary-conf-view-field">
                <label>Father's Place of Birth:</label>
                {renderReadOnlyField(confirmationData.father.placeOfBirth)}
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
              <div className="secretary-conf-view-field">
                <label>Mother's Date of Birth:</label>
                {renderReadOnlyField(formatDate(confirmationData.mother.dateOfBirth))}
              </div>
              <div className="secretary-conf-view-field">
                <label>Mother's Place of Birth:</label>
                {renderReadOnlyField(confirmationData.mother.placeOfBirth)}
              </div>
              <div className="secretary-conf-view-field">
                <label>Mother's Contact Number:</label>
                {renderReadOnlyField(confirmationData.mother.contact)}
              </div>
            </div>
          </div>
        </div>
        
        {/* Requirements Section */}
        <div className="secretary-conf-requirements-view-container">
          <h2 className="secretary-conf-requirements-view-title">Requirements</h2>
          <div className="secretary-conf-requirements-view-box">
            <h3 className="secretary-conf-view-section-header">Documents Required</h3>
            <div className="secretary-conf-info-view-list">
              <div className="secretary-conf-info-view-item">
                <p>Baptism Certificate (Proof of Catholic Baptism)</p>
              </div>
              <div className="secretary-conf-info-view-item">
                <p>Birth Certificate (PSA or Local Civil Registrar Copy)</p>
              </div>
              <div className="secretary-conf-info-view-item">
                <p>Valid IDs of Candidate, Parents, and Sponsor</p>
              </div>
              <div className="secretary-conf-info-view-item">
                <p>Certificate of Permission (If outside the Parish)</p>
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

        {/* Schedule Selection Container */}
        <div className="secretary-conf-view-info-card">
          <h3 className="secretary-conf-view-sub-title">Schedule Selection</h3>
          <div className="secretary-conf-view-row-date">
            <div className="secretary-conf-view-field-date">
              <label>Date of Confirmation:</label>
              <input 
                type="date" 
                className="secretary-view-input"
                value={selectedDate}
                onChange={(e) => {
                  console.log("Date changed to:", e.target.value);
                  setSelectedDate(e.target.value);
                }}
                disabled={status === "Approved"}
              />
            </div>
            
            <div className="secretary-conf-view-field-time">
              <label>Time of Confirmation:</label>
              <input 
                type="time" 
                className="secretary-view-input"
                value={selectedTime}
                onChange={(e) => {
                  console.log("Time changed to:", e.target.value);
                  setSelectedTime(e.target.value);
                }}
                disabled={status === "Approved"}
              />
            </div>
          </div>
          
          <div className="secretary-conf-view-field-date">
            <label>Name of the Priest:</label>
            {status === "Approved" ? (
              renderReadOnlyField(selectedPriest)
            ) : (
              <input 
                type="text" 
                className="secretary-view-input"
                value={selectedPriest}
                onChange={(e) => {
                  console.log("Priest changed to:", e.target.value);
                  setSelectedPriest(e.target.value);
                }}
                placeholder="Enter priest's name"
                disabled={status === "Approved"}
              />
            )}
          </div>
        </div>

        {/* Action Buttons Section */}
        <div className="secretary-action-buttons">
          {status !== "Approved" && (
            <button 
              className="secretary-submit-button"
              onClick={handleSubmit}
            >
              Approve
            </button>
          )}
          {status === "Approved" && (
            <div className="secretary-approved-status">
              <span className="secretary-approved-icon">✓</span>
              <span className="secretary-approved-text">This confirmation has been approved</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConfirmationView;