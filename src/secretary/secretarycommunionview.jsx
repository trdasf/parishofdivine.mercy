import React, { useState, useRef, useEffect } from "react";
import { AiOutlineArrowLeft, AiOutlineEye, AiOutlineDownload } from "react-icons/ai"; 
import { useLocation, useNavigate } from "react-router-dom";
import "./SecretaryCommunionView.css";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Import images (make sure these paths are correct)
import pdmLogo from "../assets/pdmlogo.png";
import church2Img from "../assets/church2.jpg";

const SecretaryCommunionView = () => {
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
  const [communionData, setCommunionData] = useState(null);
  const [error, setError] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  
  // Dedicated state variables for schedule selection
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedPriest, setSelectedPriest] = useState("");
  
  // API base URL for consistency
  const API_BASE_URL = "https://parishofdivinemercy.com/backend";

  // Function to convert 24-hour time to 12-hour format with AM/PM
  const formatTime = (timeString) => {
    if (!timeString) return "N/A";
    
    try {
      // Handle time strings that might have seconds
      const timeParts = timeString.split(':');
      let hours = parseInt(timeParts[0]);
      const minutes = timeParts[1];
      
      // Determine AM or PM
      const period = hours >= 12 ? 'PM' : 'AM';
      
      // Convert to 12-hour format
      if (hours === 0) {
        hours = 12; // Midnight case
      } else if (hours > 12) {
        hours = hours - 12;
      }
      
      return `${hours}:${minutes} ${period}`;
    } catch (error) {
      console.error("Error formatting time:", error);
      return timeString; // Return original string if formatting fails
    }
  };

  useEffect(() => {
    // Check if we have necessary state data (communionID)
    const communionID = location.state?.communionID;
    const statusFromNav = location.state?.status;

    console.log("Component mounted, location state:", location.state);
    console.log("communionID:", communionID);
    console.log("statusFromNav:", statusFromNav);

    if (!communionID) {
      setError("Missing communion information. Please try again.");
      setLoading(false);
      return;
    }

    // Set initial status from navigation - this takes priority
    if (statusFromNav) {
      setStatus(statusFromNav);
    }

    // Fetch the communion details
    fetchCommunionDetails(communionID, statusFromNav);
  }, [location]);

  const fetchCommunionDetails = async (communionID, statusFromNav) => {
    try {
      setLoading(true);
      console.log(`Fetching communion details for ID: ${communionID}, statusFromNav: ${statusFromNav}`);
      
      const response = await fetch(`${API_BASE_URL}/fetch_communion_details.php?communionID=${communionID}`);
      console.log("Response status:", response.status);
      
      const data = await response.json();
      console.log("API response data:", data);
      
      if (data.success) {
        // Transform the data into the expected format
        const transformedData = transformCommunionData(data.data);
        console.log("Transformed data:", transformedData);
        
        setCommunionData(transformedData);
        
        // Use status from location.state if provided, otherwise use from API
        const currentStatus = statusFromNav || transformedData.status || "PENDING";
        setStatus(currentStatus);
        console.log("Setting status to:", currentStatus);
        
        // Initialize with empty values first
        setSelectedDate("");
        setSelectedTime("");
        setSelectedPriest("");
        
        // Always fetch from approved_appointments table first to get most up-to-date schedule
        const approved = await fetchApprovedAppointmentDetails(communionID);
        
        // If not in approved_appointments or not approved status, use the dates from communion_application
        if (!approved && currentStatus !== "Approved") {
          setSelectedDate(transformedData.date || "");
          setSelectedTime(transformedData.time || "");
          setSelectedPriest(transformedData.priest || "");
          console.log("Using data from communion application:", {
            date: transformedData.date,
            time: transformedData.time,
            priest: transformedData.priest
          });
        }
      } else {
        console.error("Error from API:", data.message);
        setError(data.message || "Failed to fetch communion details");
      }
    } catch (error) {
      console.error("Error fetching communion details:", error);
      setError("An error occurred while fetching the data: " + error.message);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchApprovedAppointmentDetails = async (communionID) => {
    try {
      console.log("Fetching approved appointment details for communionID:", communionID);
      const response = await fetch(`${API_BASE_URL}/fetch_approved_appointment.php?sacramentID=${communionID}&sacrament_type=Communion`);
      
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

  const transformCommunionData = (data) => {
    // Format the data from PHP API response to match the component's expected format
    const { communion, address, father, mother, requirements } = data;
    
    console.log("Raw communion data:", communion);
    console.log("Raw address data:", address);
    console.log("Raw father data:", father);
    console.log("Raw mother data:", mother);
    console.log("Raw requirements data:", requirements);

    return {
      date: communion.date || '',
      time: communion.time || '',
      priest: communion.priest || '',
      communionID: communion.communionID,
      child: {
        firstName: communion.first_name || '',
        middleName: communion.middle_name || '',
        lastName: communion.last_name || '',
        age: communion.age || '',
        dateOfBirth: communion.dateOfBirth || '',
        gender: communion.gender || '',
        dateOfBaptism: communion.dateOfBaptism || '',
        churchOfBaptism: communion.churchOfBaptism || '',
        placeOfBirth: communion.placeOfBirth || '',
        address: {
          street: address?.street || '',
          barangay: address?.barangay || '',
          municipality: address?.municipality || '',
          province: address?.province || '',
          region: address?.region || ''
        }
      },
      father: {
        firstName: father?.first_name || '',
        middleName: father?.middle_name || '',
        lastName: father?.last_name || '',
        dateOfBirth: father?.dateOfBirth || '',
        placeOfBirth: father?.placeOfBirth || '',
        contact: father?.contact_number || ''
      },
      mother: {
        firstName: mother?.first_name || '',
        middleName: mother?.middle_name || '',
        lastName: mother?.last_name || '',
        dateOfBirth: mother?.dateOfBirth || '',
        placeOfBirth: mother?.placeOfBirth || '',
        contact: mother?.contact_number || ''
      },
      requirements: {
        baptismCert: {
          submitted: requirements?.baptism_cert_status === 'Submitted',
          fileName: requirements?.baptism_cert || '',
          status: requirements?.baptism_cert_status || 'Not Submitted'
        },
        firstCommunionCert: {
          submitted: requirements?.first_communion_cert_status === 'Submitted',
          fileName: requirements?.first_communion_cert || '',
          status: requirements?.first_communion_cert_status || 'Not Submitted'
        },
        birthCert: {
          submitted: requirements?.birth_cert_status === 'Submitted',
          fileName: requirements?.birth_cert || '',
          status: requirements?.birth_cert_status || 'Not Submitted'
        }
      },
      // Added certificate details
      certificate: {
        registerNumber: "24",
        pageNumber: "103",
        lineNumber: "8",
        dateIssued: new Date().toISOString().split('T')[0],
        purposeOf: "School Records"
      }
    };
  };

 // Handle form submission
const handleSubmit = async () => {
  if (!communionData || !communionData.communionID) {
    alert("No communion data available to approve.");
    return;
  }
  
  // Validate required fields
  if (!selectedDate) {
    alert("Please select a date for the communion.");
    return;
  }
  
  if (!selectedTime) {
    alert("Please select a time for the communion.");
    return;
  }
  
  if (!selectedPriest) {
    alert("Please enter the name of the priest for the communion.");
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
// Function to proceed with approval after confirmation
const handleConfirmApproval = async () => {
  setShowConfirmModal(false);
  
  try {
    console.log(`Approving communion application with ID: ${communionData.communionID}`);
    
    // Step 1: First save the appointment data to approved_appointments table
    const appointmentData = {
      sacramentID: communionData.communionID,
      sacrament_type: "Communion",
      date: selectedDate,
      time: selectedTime,
      priest: selectedPriest,
      clientID: communionData.clientID // Include clientID if available
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
    console.log("Appointment save result:", appointmentResult);
    
    if (!appointmentResult.success) {
      throw new Error(appointmentResult.message || "Failed to save appointment details");
    }
    
    console.log("Appointment saved successfully:", appointmentResult);
    
    // Step 2: Now update the communion status
    const updateData = {
      communionID: communionData.communionID,
      status: "Approved",
      date: selectedDate,
      time: selectedTime,
      priest: selectedPriest,
      // Include child/parent details for notification
      childName: `${communionData.child.firstName} ${communionData.child.lastName}`,
      parentEmail: communionData.father.email || communionData.mother.email,
      parentName: `${communionData.father.firstName} ${communionData.father.lastName}` ||
                  `${communionData.mother.firstName} ${communionData.mother.lastName}`
    };
    
    console.log("Updating communion status with data:", updateData);
    
    const response = await fetch(`${API_BASE_URL}/update_communion_status.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updateData),
    });

    // First check if the response is valid JSON
    let result;
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
      result = await response.json();
      console.log("API response:", result);
    } else {
      // If not JSON, get the text and show it as an error
      const text = await response.text();
      console.error("Non-JSON response:", text);
      throw new Error("Invalid response from server. Please check server logs.");
    }
    
    if (result.success) {
      // ADD EMAIL SENDING HERE - AFTER SUCCESSFUL APPROVAL
      try {
        const emailResponse = await fetch(`${API_BASE_URL}/approved_communion_email.php`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            communionID: communionData.communionID,
            date: selectedDate,
            time: selectedTime,
            priest: selectedPriest
          }),
        });

        const emailResult = await emailResponse.json();
        
        if (emailResult.success) {
          console.log("Email sent successfully:", emailResult.message);
        } else {
          console.warn("Email sending failed:", emailResult.message);
          // Don't throw error here - approval was successful, email is just a bonus
        }
      } catch (emailError) {
        console.error("Error sending email:", emailError);
        // Don't throw error here - approval was successful, email is just a bonus
      }
      // END EMAIL SENDING
      
      setStatus("Approved");
      
      // Update local state with the selected values
      setCommunionData({
        ...communionData,
        date: selectedDate,
        time: selectedTime,
        priest: selectedPriest,
        status: "Approved"
      });
      
      // Create success message - always mention email since we attempt to send it
      let message = "Communion application has been approved successfully! An email notification has been sent to the client.";
      
      setSuccessMessage(message);
      setShowSuccessModal(true);
    } else {
      // Show error message from server or a default one
      const errorMessage = result.message || "Failed to approve communion application";
      setSuccessMessage(errorMessage);
      setShowSuccessModal(true);
    }
  } catch (error) {
    console.error("Error approving communion application:", error);
    setSuccessMessage("An error occurred while approving the communion application: " + error.message);
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
      const fileName = `First_Communion_Certificate_${communionData.child.firstName}_${communionData.child.lastName}.pdf`;
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
    
    // Special case for first communion certificate that's marked as "Not Required"
    if (requirementType === 'firstCommunionCert') {
      // Check if the certificate is marked as "Not Required"
      if (communionData?.requirements?.firstCommunionCert?.status === 'Not Required') {
        return (
          <div className="secretary-conf-document-status-container">
            <div className="secretary-conf-view-status secretary-conf-view-not-required">
              Not Required
            </div>
          </div>
        );
      }
    }
    
    // Make sure we handle null or undefined values properly
    const fileNameDisplay = fileName && fileName !== 'N/A' && fileName !== '' ? fileName : 'No file';
    const displayStatus = isSubmitted ? `Submitted: ${fileNameDisplay}` : "Not Submitted";
    
    return (
      <div className="secretary-conf-document-status-container">
        <div className={`secretary-conf-view-status ${isSubmitted ? 'secretary-conf-view-submitted' : 'secretary-conf-view-not-submitted'}`}>
          {displayStatus}
        </div>
        {isSubmitted && fileName && fileName !== 'N/A' && fileName !== '' && (
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
    if (!fileName) return '';
    console.log(`Getting URL for document: ${fileName}`);
    
    // Determine base URL depending on environment
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    
    if (isLocalhost) {
      // For local development
      return `/uploads/communion_requirements/${fileName}`;
    } else {
      // For production server - based on Hostinger file structure
      return `/uploads/communion_requirements/${fileName}`;
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
    if (!showCertificateModal || !communionData) return null;

    // Extract month and day from communion date
    const { month, day } = extractMonthDayFromDate(selectedDate || communionData.date);
    const year = new Date(selectedDate || communionData.date).getFullYear();

    return (
      <div className="secretary-conf-document-viewer-overlay">
        <div className="secretary-conf-certificate-modal-container">
          <div className="secretary-conf-document-viewer-header">
            <h3>First Holy Communion Certificate</h3>
            <button 
              className="secretary-conf-document-close-btn"
              onClick={() => setShowCertificateModal(false)}
            >
              ×
            </button>
          </div>
          <div className="secretary-conf-certificate-modal-content">
            <p>Would you like to download this certificate?</p>
            
            {/* Certificate Preview based on the confirmation certificate style */}
            <div ref={certificateRef} className="confirmation-certificate-preview">
              <div className="confirmation-certificate-header">
                <div className="confirmation-certificate-logos">
                  <div className="confirmation-parish-logo-left">
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
                    <div className="parish-address">Alawihao, Daet, 4600 Camarines Norte, Philippines</div>
                  </div>
                  <div className="confirmation-parish-logo-right">
                    <img 
                      src={pdmLogo} 
                      alt="Parish Logo Right" 
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/80x80?text=PDM";
                      }}
                    />
                  </div>
                </div>
                
                <h1 className="certificate-title">Certificate of First Holy Communion</h1>
                <p className="certificate-subtitle">This is to certify that</p>
              </div>
              
              <div className="confirmation-certificate-details">
                <div className="cert-field name-field">
                  <div className="cert-value">{communionData.child.firstName} {communionData.child.middleName} {communionData.child.lastName}</div>
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
                  <div className="cert-value">
                    {communionData.child.address.barangay}, {communionData.child.address.street}, {communionData.child.address.municipality}, {communionData.child.address.province}, {communionData.child.address.region}
                  </div>
                  <div className="cert-label">(Residence)</div>
                </div>
                
                <div className="cert-field birthplace-field">
                  <div className="cert-value">
                    {typeof communionData.child.placeOfBirth === 'string' 
                      ? communionData.child.placeOfBirth 
                      : `${communionData.child.placeOfBirth.municipality}, ${communionData.child.placeOfBirth.province}, ${communionData.child.placeOfBirth.region}`}
                  </div>
                  <div className="cert-label">(Place of Birth)</div>
                </div>
                
                <div className="cert-field baptism-field">
                  <div className="cert-value">{communionData.child.churchOfBaptism}</div>
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
                  <div className="cert-value">{selectedPriest || communionData.priest}</div>
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
                  <div className="cert-value signature-line">
                    {(selectedPriest || communionData.priest).toUpperCase().startsWith('REV') || 
                    (selectedPriest || communionData.priest).toUpperCase().startsWith('FR') 
                    ? (selectedPriest || communionData.priest).toUpperCase() 
                    : `REV. FR. ${(selectedPriest || communionData.priest).toUpperCase()}`}
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
      
      // If this was a successful approval, navigate to the appointments page
      if (isSuccess) {
        navigate("/secretary-appointment");
      }
    };

    return (
      <div className="secretary-document-viewer-overlay">
        <div className={`secretary-${modalType}-modal-container`}>
          <div className={`secretary-${modalType}-header`}>
            <h3>{isSuccess ? "Success" : "Error"}</h3>
            <button 
              className="secretary-document-close-btn"
              onClick={handleOkClick}
            >
              ×
            </button>
          </div>
          <div className={`secretary-${modalType}-content`}>
            <div className={`secretary-${modalType}-icon`}>
              {isSuccess ? "✓" : "!"}
            </div>
            <p>{successMessage}</p>
            <button 
              className={`secretary-${modalType}-ok-btn`}
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
            <p>Are you sure you want to approve this Holy Communion appointment?</p>
            <p>Date: {selectedDate}</p>
            <p>Time: {formatTime(selectedTime)}</p>
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

  // Debug information - visible element to confirm rendering
  const renderDebugInfo = () => {
    return (
      <div style={{ display: process.env.NODE_ENV === 'development' ? 'block' : 'none', padding: "10px", background: "#f0f0f0", margin: "10px 0", borderRadius: "4px", fontSize: "12px" }}>
        <strong>Debug Info:</strong><br />
        communionID: {location.state?.communionID || "Not set"}<br />
        status: {status}<br />
        loading: {loading.toString()}<br />
        error: {error || "None"}<br />
        data loaded: {communionData ? "Yes" : "No"}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="secretary-confirmation-view-container">
        {renderDebugInfo()}
        <div className="secretary-confirmation-view-loading">Loading communion details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="secretary-confirmation-view-container">
        {renderDebugInfo()}
        <div className="secretary-confirmation-view-error">
          <p>{error}</p>
          <button onClick={() => navigate(-1)}>Back</button>
        </div>
      </div>
    );
  }

  if (!communionData) {
    return (
      <div className="secretary-confirmation-view-container">
        {renderDebugInfo()}
        <div className="secretary-confirmation-view-error">
          <p>No communion data found.</p>
          <button onClick={() => navigate(-1)}>Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="secretary-confirmation-view-container">
      {renderDebugInfo()}
      
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
        <div className="secretary-conf-view-right-section">
          {status === "Approved" && (
            <button 
              className="secretary-conf-download-certificate-btn"
              onClick={handleDownloadCertificate}
            >
              <AiOutlineDownload /> Download Certificate
            </button>
          )}
        </div>
      </div>
      <h1 className="secretary-conf-view-title">Holy Communion Application Details</h1>
      
      {/* Communion Data Section */}
      <div className="secretary-conf-view-data">
        <div className="secretary-conf-view-info-card">
        <h3 className="secretary-funeral-view-sub-title">Appointment Request Details</h3>
          <div className="secretary-conf-view-row-date">
            <div className="secretary-conf-view-field-date">
              <label>Date of Appointment:</label>
              {renderReadOnlyField(formatDate(communionData.date))}
            </div>
            
            <div className="secretary-conf-view-field-time">
              <label>Time of Appointment:</label>
              {renderReadOnlyField(formatTime(communionData.time))}
            </div>
          </div>
        </div>
        
        <div className="secretary-conf-view-bypart">
          <h3 className="secretary-conf-view-sub-title">Child's Information</h3>
          <div className="secretary-conf-view-info-card">
            <div className="secretary-conf-view-row">
              <div className="secretary-conf-view-field">
                <label>First Name:</label>
                {renderReadOnlyField(communionData.child.firstName)}
              </div>
              <div className="secretary-conf-view-field">
                <label>Middle Name:</label>
                {renderReadOnlyField(communionData.child.middleName)}
              </div>
              <div className="secretary-conf-view-field">
                <label>Last Name:</label>
                {renderReadOnlyField(communionData.child.lastName)}
              </div>
              <div className="secretary-conf-view-field">
                <label>Date of Birth:</label>
                {renderReadOnlyField(formatDate(communionData.child.dateOfBirth))}
              </div>
            </div>

            <div className="secretary-conf-view-row">
              <div className="secretary-conf-view-field">
                <label>Age:</label>
                {renderReadOnlyField(communionData.child.age)}
              </div>
              <div className="secretary-conf-view-field">
                <label>Gender:</label>
                {renderReadOnlyField(communionData.child.gender)}
              </div>
              <div className="secretary-conf-view-field">
                <label>Date of Baptism:</label>
                {renderReadOnlyField(formatDate(communionData.child.dateOfBaptism))}
              </div>
              <div className="secretary-conf-view-field">
                <label>Church of Baptism:</label>
                {renderReadOnlyField(communionData.child.churchOfBaptism)}
              </div>
            </div>

            <div className="secretary-conf-view-row">
              <div className="secretary-conf-view-field">
                <label>Place of Birth:</label>
                {renderReadOnlyField(communionData.child.placeOfBirth)}
              </div>
            </div>

            <label className="sub-mini-cc">Home Address</label>
            <div className="secretary-conf-view-row secretary-conf-address-view-row">
              <div className="secretary-conf-view-field">
                <label>Street:</label>
                {renderReadOnlyField(communionData.child.address.street)}
              </div>
              <div className="secretary-conf-view-field">
                <label>Barangay:</label>
                {renderReadOnlyField(communionData.child.address.barangay)}
              </div>
              <div className="secretary-conf-view-field">
                <label>Municipality:</label>
                {renderReadOnlyField(communionData.child.address.municipality)}
              </div>
              </div>
              <div className="secretary-conf-view-row">
              <div className="secretary-conf-view-field">
                <label>Province:</label>
                {renderReadOnlyField(communionData.child.address.province)}
              </div>
              <div className="secretary-conf-view-field">
                <label>Region:</label>
                {renderReadOnlyField(communionData.child.address.region)}
              </div>
            </div>
          </div>

          {/* Father's Information */}
          <h3 className="secretary-conf-view-sub-title">Father's Information</h3>
          <div className="secretary-conf-view-info-card">
            <div className="secretary-conf-view-row">
              <div className="secretary-conf-view-field">
                <label>Father's First Name:</label>
                {renderReadOnlyField(communionData.father.firstName)}
              </div>
              <div className="secretary-conf-view-field">
                <label>Father's Middle Name:</label>
                {renderReadOnlyField(communionData.father.middleName)}
              </div>
              <div className="secretary-conf-view-field">
                <label>Father's Last Name:</label>
                {renderReadOnlyField(communionData.father.lastName)}
              </div>
            </div>
            
            <div className="secretary-conf-view-row">
              <div className="secretary-conf-view-field">
                <label>Father's Date of Birth:</label>
                {renderReadOnlyField(formatDate(communionData.father.dateOfBirth))}
              </div>
              <div className="secretary-conf-view-field">
                <label>Father's Contact Number:</label>
                {renderReadOnlyField(communionData.father.contact)}
              </div>
              <div className="secretary-conf-view-field">
                <label>Father's Place of Birth:</label>
                {renderReadOnlyField(communionData.father.placeOfBirth)}
              </div>
            </div>
          </div>
          
          {/* Mother's Information */}
          <h3 className="secretary-conf-view-sub-title">Mother's Information</h3>
          <div className="secretary-conf-view-info-card">
            <div className="secretary-conf-view-row">
              <div className="secretary-conf-view-field">
                <label>Mother's First Name:</label>
                {renderReadOnlyField(communionData.mother.firstName)}
              </div>
              <div className="secretary-conf-view-field">
                <label>Mother's Middle Name:</label>
                {renderReadOnlyField(communionData.mother.middleName)}
              </div>
              <div className="secretary-conf-view-field">
                <label>Mother's Last Name:</label>
                {renderReadOnlyField(communionData.mother.lastName)}
              </div>
            </div>
            
            <div className="secretary-conf-view-row">
              <div className="secretary-conf-view-field">
                <label>Mother's Date of Birth:</label>
                {renderReadOnlyField(formatDate(communionData.mother.dateOfBirth))}
              </div>
              <div className="secretary-conf-view-field">
                <label>Mother's Contact Number:</label>
                {renderReadOnlyField(communionData.mother.contact)}
              </div>
              <div className="secretary-conf-view-field">
                <label>Mother's Place of Birth:</label>
                {renderReadOnlyField(communionData.mother.placeOfBirth)}
              </div>
            </div>
          </div>
        </div>
        
        {/* Requirements section */}
        <div className="secretary-conf-requirements-view-container">
          <h2 className="secretary-conf-requirements-view-title">Requirements</h2>
          <div className="secretary-conf-requirements-view-box">
            <h3 className="secretary-conf-view-section-header">Documents Required</h3>
            <div className="secretary-conf-info-view-list">
              <div className="secretary-conf-info-view-item">
                <p>Certificate of Baptism(Proof of Catholic Baptism)</p>
              </div>
              <div className="secretary-conf-info-view-item">
                <p>First Communion Certificate(If Applicable, for record purposes)</p>
              </div>
              <div className="secretary-conf-info-view-item">
                <p>Birth Certificate(For verification purposes)</p>
              </div>
              <div className="secretary-conf-info-view-item">
                <p>Certificate of Permission(If outside the Parish)</p>
              </div>
            </div>

            <h3 className="secretary-conf-view-section-header">Requirements for Candidate</h3>
            <div className="secretary-conf-info-view-list">
              <div className="secretary-conf-info-view-item">
                <p>Must be a baptized Catholic</p>
              </div>
              <div className="secretary-conf-info-view-item">
                <p>Must have reached the age of reason (usually around 7 years old)</p>
              </div>
              <div className="secretary-conf-info-view-item">
                <p>Must have received the Sacrament of Reconciliation (Confession) before First Communion</p>
              </div>
              <div className="secretary-conf-info-view-item">
                <p>Must attend a First Communion Catechesis or Religious Instruction Program</p>
              </div>
              <div className="secretary-conf-info-view-item">
                <p>Must understand the significance of the Holy Eucharist and believe in the real presence of Christ in the sacrament</p>
              </div>
              <div className="secretary-conf-info-view-item">
                <p>Must attend a First Communion Retreat (if required by the parish)</p>
              </div>
            </div>

            <h3 className="secretary-conf-view-section-header">Parish Requirements</h3>
            <div className="secretary-conf-info-view-list">
              <div className="secretary-conf-info-view-item">
                <p>Must be registered in the parish where First Communion will be received</p>
              </div>
              <div className="secretary-conf-info-view-item">
                <p>Must attend the required preparation classes and rehearsals</p>
              </div>
              <div className="secretary-conf-info-view-item">
                <p>Must participate in a First Communion Retreat (if required by the parish)</p>
              </div>
            </div>

            <h3 className="secretary-conf-view-section-header">Dress Code (If Specified by Parish)</h3>
            <div className="secretary-conf-info-view-list">
              <div className="secretary-conf-info-view-item">
                <p>Boys: White polo or barong, black pants, and formal shoes</p>
              </div>
              <div className="secretary-conf-info-view-item">
                <p>Girls: White dress with sleeves (modest), white veil (optional), and formal shoes</p>
              </div>
            </div>
          </div>
        </div>

        {/* Schedule Selection Section */}
        <div className="secretary-conf-view-info-card">
          <h2 className="secretary-conf-view-sub-title">Schedule Selection</h2>
          <div className="secretary-conf-view-row">
            <div className="secretary-conf-view-field">
              <label>Date of Holy Communion:</label>
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
            <div className="secretary-conf-view-field">
              <label>Time of Holy Communion:</label>
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
          <div className="secretary-conf-view-row">
            <div className="secretary-conf-view-field">
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
        </div>
        
        {/* Action Buttons Section */}
        <div className="secretary-action-buttons">
          {status !== "Approved" && (
            <button 
              className="secretary-comm-submit-button"
              onClick={handleSubmit}
            >
              Approve
            </button>
          )}
          {status === "Approved" && (
            <div className="secretary-approved-status">
              <span className="secretary-approved-icon">✓</span>
              <span className="secretary-approved-text">This communion has been approved</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SecretaryCommunionView;