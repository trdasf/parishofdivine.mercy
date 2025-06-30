import React, { useState, useRef, useEffect } from "react";
import { AiOutlineArrowLeft, AiOutlineEye, AiOutlineDownload } from "react-icons/ai"; 
import { useLocation, useNavigate } from "react-router-dom";
import "./SecretaryBaptismView.css";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Make sure these images exist in the specified paths
// If using relative paths, make sure they're correct relative to this component
import pdmLogo from "../assets/pdmlogo.png";
import church2Img from "../assets/church2.jpg";

const SecretaryBaptismView = () => {
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
  const [baptismData, setBaptismData] = useState(null);
  const [error, setError] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  
  // Changed from dropdown to direct input for priest
  const [selectedPriest, setSelectedPriest] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");

  useEffect(() => {
    // Check if we have necessary state data (baptismID)
    const baptismID = location.state?.baptismID;
    const statusFromNav = location.state?.status;

    if (!baptismID) {
      setError("Missing baptism information. Please try again.");
      setLoading(false);
      return;
    }

    // Set initial status from navigation
    if (statusFromNav) {
      setStatus(statusFromNav);
    }

    // Fetch the baptism details
    fetchBaptismDetails(baptismID);
  }, [location]);
  
  // Add a debug useEffect to monitor priest values
  useEffect(() => {
    console.log("Current priest values:", {
      selectedPriest,
      baptismDataPriest: baptismData?.priest
    });
  }, [selectedPriest, baptismData]);

  const fetchBaptismDetails = async (baptismID) => {
    try {
      setLoading(true);
      const response = await fetch(`https://parishofdivinemercy.com/backend/fetch_baptism_details.php?baptismID=${baptismID}`);
      const data = await response.json();
      
      if (data.success) {
        // Transform the data into the expected format
        const transformedData = transformBaptismData(data.data);
        setBaptismData(transformedData);
        setStatus(transformedData.status || status);
        
        // If it's approved, also fetch schedule details from approved_appointments table
        if (transformedData.status === "Approved") {
          fetchApprovedAppointmentDetails(baptismID);
        } else {
          // For non-approved status, use the dates from baptism_application
          setAppointmentDate(transformedData.date || "");
          setAppointmentTime(transformedData.time || "");
          setSelectedPriest(transformedData.priest || "");
        }
      } else {
        setError(data.message || "Failed to fetch baptism details");
      }
    } catch (error) {
      console.error("Error fetching baptism details:", error);
      setError("An error occurred while fetching the data");
    } finally {
      setLoading(false);
    }
  };
  
  // Function to fetch schedule details from approved_appointments
  const fetchApprovedAppointmentDetails = async (baptismID) => {
    try {
      const response = await fetch(`https://parishofdivinemercy.com/backend/fetch_approved_appointment.php?sacramentID=${baptismID}&sacrament_type=Baptism`);
      const data = await response.json();
      
      if (data.success && data.appointment) {
        // Update ONLY the schedule fields with data from approved_appointments
        setAppointmentDate(data.appointment.date || "");
        setAppointmentTime(data.appointment.time || "");
        setSelectedPriest(data.appointment.priest || "");
      } else {
        console.log("No approved appointment schedule found or there was an error");
      }
    } catch (error) {
      console.error("Error fetching approved appointment schedule:", error);
    }
  };

  const transformBaptismData = (data) => {
    // Format the data from PHP API response to match the component's expected format
    const { baptism, parents, marital, address, godFathers, godMothers, requirements, client } = data;

    return {
      date: baptism.dateOfBaptism,
      time: baptism.timeOfBaptism,
      priest: baptism.priestName,
      status: baptism.status,
      baptismID: baptism.baptismID,
      clientID: client?.clientID || null, // Make sure to get the clientID for later use
      child: {
        firstName: baptism.firstName,
        middleName: baptism.middleName,
        lastName: baptism.lastName,
        gender: baptism.sex,
        age: baptism.age,
        dateOfBirth: baptism.dateOfBirth,
        placeOfBirth: baptism.placeOfBirth,
        region: baptism.region || '' // Updated to match database field name
      },
      father: {
        firstName: parents?.fatherFirstName || 'N/A',
        middleName: parents?.fatherMiddleName || 'N/A',
        lastName: parents?.fatherLastName || 'N/A',
        placeOfBirth: parents?.fatherPlaceOfBirth || 'N/A',
        dateOfBirth: parents?.fatherDateOfBirth || 'N/A',
        education: parents?.fatherEducation || 'N/A',
        occupation: parents?.fatherOccupation || 'N/A',
        contact: parents?.fatherContact || 'N/A'
      },
      mother: {
        firstName: parents?.motherFirstName || 'N/A',
        middleName: parents?.motherMiddleName || 'N/A',
        lastName: parents?.motherLastName || 'N/A',
        placeOfBirth: parents?.motherPlaceOfBirth || 'N/A',
        dateOfBirth: parents?.motherDateOfBirth || 'N/A',
        education: parents?.motherEducation || 'N/A',
        occupation: parents?.motherOccupation || 'N/A',
        contact: parents?.motherContact || 'N/A'
      },
      maritalStatus: {
        type: marital?.maritalStatus || 'N/A',
        yearsMarried: marital?.yearsMarried || 'N/A'
      },
      address: {
        street: address?.street || 'N/A',
        barangay: address?.barangay || 'N/A',
        municipality: address?.municipality || 'N/A',
        province: address?.province || 'N/A',
        region: address?.region || 'N/A'
      },
      godParents: [
        // Format godparents from the API response
        ...godFathers.map(name => ({
          name,
          sacraments: "Baptism, Confirmation",
          address: "N/A"
        })),
        ...godMothers.map(name => ({
          name,
          sacraments: "Baptism, Confirmation",
          address: "N/A"
        }))
      ],
      requirements: {
        birthCert: {
          submitted: requirements?.birth_cert_status === 'Submitted',
          fileName: requirements?.birth_cert ? requirements.birth_cert.split('/').pop() : 'N/A',
          status: requirements?.birth_cert_status || 'Not Submitted'
        },
        marriageCert: {
          submitted: requirements?.marriage_cert_status === 'Submitted',
          fileName: requirements?.marriage_cert ? requirements.marriage_cert.split('/').pop() : 'N/A',
          status: requirements?.marriage_cert_status || 'Not Submitted'
        },
        validIds: {
          submitted: requirements?.valid_ids_status === 'Submitted',
          fileName: requirements?.valid_ids ? requirements.valid_ids.split('/').pop() : 'N/A',
          status: requirements?.valid_ids_status || 'Not Submitted'
        }
      },
      // Added certificate details
      certificate: {
        bookNumber: "1",
        pageNumber: "43",
        lineNumber: "22",
        dateIssued: new Date().toISOString().split('T')[0],
        purposeOf: "Reference"
      }
    };
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!baptismData || !baptismData.baptismID) {
      alert("No baptism data available to approve.");
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
      alert("Please enter the name of the priest for the baptism.");
      return;
    }

    // Show confirmation modal instead of submitting immediately
    setShowConfirmModal(true);
  };

  // Function to proceed with approval after confirmation
// Function to proceed with approval after confirmation
const handleConfirmApproval = async () => {
  setShowConfirmModal(false);
  
  try {
    // Insert into approved_appointments table (removed clientID)
    const appointmentResponse = await fetch("https://parishofdivinemercy.com/backend/save_approved_appointment.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sacramentID: baptismData.baptismID,
        sacrament_type: "Baptism",
        date: appointmentDate,
        time: appointmentTime,
        priest: selectedPriest
      }),
    });
    
    const appointmentResult = await appointmentResponse.json();
    
    if (!appointmentResult.success) {
      throw new Error(appointmentResult.message || "Failed to save appointment details");
    }
    
    // Then update the baptism status
    const response = await fetch("https://parishofdivinemercy.com/backend/update_baptism_status.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        baptismID: baptismData.baptismID,
        status: "Approved",
        date: appointmentDate,
        time: appointmentTime,
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
      // ADD EMAIL SENDING HERE - AFTER SUCCESSFUL APPROVAL
      try {
        const emailResponse = await fetch("https://parishofdivinemercy.com/backend/approved_baptism_email.php", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            baptismID: baptismData.baptismID
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
      setSuccessMessage("Baptism application has been approved successfully! An email notification has been sent to the client.");
      setShowSuccessModal(true);
      
      // Update the baptismData to reflect the changes
      setBaptismData({
        ...baptismData,
        date: appointmentDate,
        time: appointmentTime,
        priest: selectedPriest
      });
    } else {
      // Show error message from server or a default one
      const errorMessage = result.message || "Failed to approve baptism application";
      setSuccessMessage(errorMessage);
      setShowSuccessModal(true);
    }
  } catch (error) {
    console.error("Error approving baptism application:", error);
    setSuccessMessage("An error occurred while approving the baptism application: " + error.message);
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
    return <div className="secretary-view-value">{value || "N/A"}</div>;
  };

  // Function to render document status with view button
  const renderDocumentStatus = (isSubmitted, fileName, requirementType) => {
    // Special case for marriage certificate that's marked as "Not Required"
    if (requirementType === 'marriageCert') {
      // Check if the marriage certificate is marked as "Not Required"
      if (baptismData?.requirements?.marriageCert?.status === 'Not Required') {
        return (
          <div className="secretary-document-status-container">
            <div className="secretary-view-status secretary-view-not-required">
              Not Required
            </div>
          </div>
        );
      }
    }
    
    return (
      <div className="secretary-document-status-container">
        <div className={`secretary-view-status ${isSubmitted ? 'secretary-view-submitted' : 'secretary-view-not-submitted'}`}>
          {isSubmitted ? `Submitted: ${fileName}` : "Not Submitted"}
        </div>
        {isSubmitted && (
          <button 
            className="secretary-view-document-btn"
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
      return `/backend/uploads/baptism_requirements/${fileName}`;
    } else {
      // For production server - based on Hostinger file structure
      return `/backend/uploads/baptism_requirements/${fileName}`;
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
      <div className="secretary-document-viewer-overlay">
        <div className="secretary-document-viewer-container">
          <div className="secretary-document-viewer-header">
            <h3>{displayName}</h3>
          </div>
          <div className="secretary-document-viewer-content">
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
              <div className="secretary-document-placeholder">
                <p>Document preview not available for this file type.</p>
                <a 
                  href={documentUrl}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="secretary-document-download-link"
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
    if (!showCertificateModal || !baptismData) return null;

    return (
      <div className="secretary-document-viewer-overlay">
        <div className="secretary-certificate-modal-container">
          <div className="secretary-document-viewer-header">
            <h3>Baptism Certificate</h3>
            <button 
              className="secretary-document-close-btn"
              onClick={() => setShowCertificateModal(false)}
            >
              ×
            </button>
          </div>
          <div className="secretary-certificate-modal-content">
            <p>Would you like to download this certificate?</p>
            
            {/* Certificate Preview based on the image */}
            <div ref={certificateRef} className="baptism-certificate-preview">
              <div className="certificate-header-bap">
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
              </div>
              <h1 className="certificate-title">CERTIFICATE OF BAPTISM</h1>
              
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
                  <div className="certificate-value">{baptismData.maritalStatus.type === 'Married' ? 'Legitimate' : 'Natural'}</div>
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
                  <div className="certificate-value">{formatDate(appointmentDate || baptismData.date)}</div>
                </div>
                <div className="certificate-row">
                  <div className="certificate-label">RESIDENCE</div>
                  <div className="certificate-value">{baptismData.address.street}, {baptismData.address.barangay}, {baptismData.address.municipality}, {baptismData.address.province}</div>
                </div>
                <div className="certificate-row">
                  <div className="certificate-label">MINISTER</div>
                  <div className="certificate-value">{selectedPriest || baptismData.priest || "N/A"}</div>
                </div>
                {baptismData.godParents.length > 0 && (
                  <>
                    <div className="certificate-row">
                      <div className="certificate-label">GODFATHER</div>
                      <div className="certificate-value">{baptismData.godParents[0]?.name || "N/A"}</div>
                    </div>
                  </>
                )}
                {baptismData.godParents.length > 1 && (
                  <>
                    <div className="certificate-row">
                      <div className="certificate-label">GODMOTHER</div>
                      <div className="certificate-value">{baptismData.godParents[1]?.name || "N/A"}</div>
                    </div>
                  </>
                )}
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
            
            <div className="secretary-certificate-modal-actions">
              <button 
                className="secretary-certificate-download-btn"
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
      
      // If this was a successful approval, navigate back to the baptism list
      if (isSuccess) {
        navigate("/secretary-baptism");
      }
    };

    return (
      <div className="secretary-document-viewer-overlay">
        <div className={`secretary-${modalType}-modal-container`}>
          <div className={`secretary-${modalType}-header`}>
            <h3>{isSuccess ? "Success" : "Error"}</h3>
            <button 
              className="secretary-document-close-btn"
              onClick={() => setShowSuccessModal(false)}
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
            <p>Are you sure you want to approve this baptism appointment?</p>
            <p>Date: {appointmentDate}</p>
            <p>Time: {appointmentTime}</p>
            <p>Priest: {selectedPriest}</p>
            
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

  if (loading) {
    return (
      <div className="secretary-baptism-view-container">
        <div className="secretary-baptism-view-loading">Loading baptism details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="secretary-baptism-view-container">
        <div className="secretary-baptism-view-error">
          <p>{error}</p>
          <button onClick={() => navigate(-1)}>Back</button>
        </div>
      </div>
    );
  }

  if (!baptismData) {
    return (
      <div className="secretary-baptism-view-container">
        <div className="secretary-baptism-view-error">
          <p>No baptism data found.</p>
          <button onClick={() => navigate(-1)}>Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="secretary-baptism-view-container">
      {/* Document Viewer Modal */}
      {renderDocumentViewer()}
      
      {/* Certificate Download Modal */}
      {renderCertificateModal()}
      
      {/* Success Modal */}
      {renderSuccessModal()}
      
      {/* Confirmation Modal */}
      {renderConfirmModal()}
      
      {/* Header */}
      <div className="secretary-baptism-view-header">
        <div className="secretary-view-left-section">
          <button className="secretary-view-back-button" onClick={() => navigate(-1)}>
            <AiOutlineArrowLeft className="secretary-view-back-icon" /> Back
          </button>
        </div>
        <div className="secretary-view-right-section">
          {status === "Approved" && (
            <button 
              className="secretary-download-certificate-btn"
              onClick={handleDownloadCertificate}
            >
              <AiOutlineDownload /> Download Certificate
            </button>
          )}
        </div>
      </div>
      <h1 className="secretary-view-title">Baptism Application Details</h1>
      
      {/* Baptismal Data Section */}
      <div className="secretary-baptismal-view-data">
      <div className="secretary-anointing-view-info-card">
      <h3 className="secretary-funeral-view-sub-title">Appointment Request Details</h3>
        <div className="secretary-baptismal-view-row-date">
          <div className="secretary-baptismal-view-field-date">
            <label>Date of Appointment:</label>
            {renderReadOnlyField(formatDate(baptismData.date))}
          </div>
          
          <div className="secretary-baptismal-view-field-time">
            <label>Time of Appointment:</label>
            {renderReadOnlyField(baptismData.time)}
          </div>
        </div>
        </div>

        <div className="secretary-view-bypart">
          <h3 className="secretary-view-sub-title">Baptism Information</h3>
          <div className="secretary-baptismal-view-info-card">
            <div className="secretary-baptismal-view-row">
              <div className="secretary-baptismal-view-field">
                <label>First Name of the Baptized:</label>
                {renderReadOnlyField(baptismData.child.firstName)}
              </div>
              <div className="secretary-baptismal-view-field">
                <label>Middle Name of the Baptized:</label>
                {renderReadOnlyField(baptismData.child.middleName)}
              </div>
              <div className="secretary-baptismal-view-field">
                <label>Last Name of the Baptized:</label>
                {renderReadOnlyField(baptismData.child.lastName)}
              </div>
            </div>
            
            <div className="secretary-baptismal-view-row">
              <div className="secretary-baptismal-view-field">
                <label>Date of Birth:</label>
                {renderReadOnlyField(formatDate(baptismData.child.dateOfBirth))}
              </div>
              <div className="secretary-baptismal-view-field">
                <label>Age:</label>
                {renderReadOnlyField(baptismData.child.age)}
              </div>
              <div className="secretary-baptismal-view-field">
                <label>Gender:</label>
                {renderReadOnlyField(baptismData.child.gender)}
              </div>
            </div>
            
            <div className="secretary-baptismal-view-row">
              <div className="secretary-baptismal-view-field">
                <label>Place of Birth:</label>
                {renderReadOnlyField(baptismData.child.placeOfBirth)}
              </div>
              <div className="secretary-baptismal-view-field">
                <label>Region of Birth:</label>
                {renderReadOnlyField(baptismData.child.region)}
              </div>
            </div>
          </div>

          {/* Father's Information */}
          <h3 className="secretary-view-sub-title">Father Information</h3>
          <div className="secretary-baptismal-view-info-card">
            <div className="secretary-baptismal-view-row">
              <div className="secretary-baptismal-view-field">
                <label>Father's First Name:</label>
                {renderReadOnlyField(baptismData.father.firstName)}
              </div>
              <div className="secretary-baptismal-view-field">
                <label>Father's Middle Name:</label>
                {renderReadOnlyField(baptismData.father.middleName)}
              </div>
              <div className="secretary-baptismal-view-field">
                <label>Father's Last Name:</label>
                {renderReadOnlyField(baptismData.father.lastName)}
              </div>
            </div>
            
            <div className="secretary-baptismal-view-row">
              <div className="secretary-baptismal-view-field">
                <label>Father's Date of Birth:</label>
                {renderReadOnlyField(formatDate(baptismData.father.dateOfBirth))}
              </div>
              <div className="secretary-baptismal-view-field">
                <label>Father's Contact Number:</label>
                {renderReadOnlyField(baptismData.father.contact)}
              </div>
              <div className="secretary-baptismal-view-field">
                <label>Father's Place of Birth:</label>
                {renderReadOnlyField(baptismData.father.placeOfBirth)}
              </div>
            </div>
          </div>
          
          <h3 className="secretary-view-sub-title">Mother Information</h3>
          {/* Mother's Information */}
          <div className="secretary-baptismal-view-info-card">
            <div className="secretary-baptismal-view-row">
              <div className="secretary-baptismal-view-field">
                <label>Mother's First Name:</label>
                {renderReadOnlyField(baptismData.mother.firstName)}
              </div>
              <div className="secretary-baptismal-view-field">
                <label>Mother's Middle Name:</label>
                {renderReadOnlyField(baptismData.mother.middleName)}
              </div>
              <div className="secretary-baptismal-view-field">
                <label>Mother's Last Name:</label>
                {renderReadOnlyField(baptismData.mother.lastName)}
              </div>
            </div>

            <div className="secretary-baptismal-view-row">
              <div className="secretary-baptismal-view-field">
                <label>Mother's Date of Birth:</label>
                {renderReadOnlyField(formatDate(baptismData.mother.dateOfBirth))}
              </div>
              <div className="secretary-baptismal-view-field">
                <label>Mother's Contact Number:</label>
                {renderReadOnlyField(baptismData.mother.contact)}
              </div>
              <div className="secretary-baptismal-view-field">
                <label>Mother's Place of Birth:</label>
                {renderReadOnlyField(baptismData.mother.placeOfBirth)}
              </div>
            </div>
          </div>
          
          <h3 className="secretary-view-sub-title">Parents Marital Status</h3>
          <div className="secretary-baptismal-view-info-card">
            <div className="secretary-baptismal-view-row-pms">
              <div className="secretary-marital-view-status">
                <label className="secretary-view-section-label">Parents' marital status:</label>
                <div className="secretary-marital-view-options">
                  <div className={`secretary-view-pms-label ${baptismData.maritalStatus.type === 'Married' ? 'secretary-view-selected-status' : ''}`}>
                    <span className={`secretary-view-checkbox ${baptismData.maritalStatus.type === 'Married' ? 'secretary-view-checked' : ''}`}></span>
                    <label>Married</label>
                  </div>
                  <div className={`secretary-view-pms-label ${baptismData.maritalStatus.type === 'Civil' ? 'secretary-view-selected-status' : ''}`}>
                    <span className={`secretary-view-checkbox ${baptismData.maritalStatus.type === 'Civil' ? 'secretary-view-checked' : ''}`}></span>
                    <label>Civil</label>
                  </div>
                  <div className={`secretary-view-pms-label ${baptismData.maritalStatus.type === 'Living Together' ? 'secretary-view-selected-status' : ''}`}>
                    <span className={`secretary-view-checkbox ${baptismData.maritalStatus.type === 'Living Together' ? 'secretary-view-checked' : ''}`}></span>
                    <label>Living Together</label>
                  </div>
                </div>
              </div>

              <div className="secretary-years-view-married">
                <label>Number of Years Married: </label>
                <span className="secretary-view-years">{baptismData.maritalStatus.yearsMarried}</span>
              </div>
            </div>
          
            {/* Address Fields - As read-only displays */}
            <div className="secretary-baptismal-view-row secretary-address-view-row">
              <div className="secretary-baptismal-view-field">
                <label>Street:</label>
                {renderReadOnlyField(baptismData.address.street)}
              </div>
              <div className="secretary-baptismal-view-field">
                <label>Barangay:</label>
                {renderReadOnlyField(baptismData.address.barangay)}
              </div>
              <div className="secretary-baptismal-view-field">
                <label>Municipality:</label>
                {renderReadOnlyField(baptismData.address.municipality)}
              </div>
            </div>
          
            <div className="secretary-baptismal-view-row secretary-address-view-row">
              <div className="secretary-baptismal-view-field">
                <label>Province:</label>
                {renderReadOnlyField(baptismData.address.province)}
              </div>
              <div className="secretary-baptismal-view-field">
                <label>Region:</label>
                {renderReadOnlyField(baptismData.address.region)}
              </div>
            </div>
          </div>
          
          <div className="secretary-view-bypart">
            <h3 className="secretary-view-sub-title">Godparents Information</h3>
            <div className="secretary-baptismal-view-info-card">
              {baptismData.godParents.map((godparent, index) => (
                <div key={index} className="secretary-godparent-item">
                  <h4 className="secretary-baptismal-view-godparent-header">
                    {index === 0 ? "Godfather (Ninong)" : "Godmother (Ninang)"}
                  </h4>
                  <div className="secretary-baptismal-view-row">
                    <div className="secretary-baptismal-view-field">
                      <label>{index === 0 ? "Godfather's Name:" : "Godmother's Name:"}</label>
                      {renderReadOnlyField(godparent.name)}
                    </div>
                  </div>
                  {index < baptismData.godParents.length - 1 && <hr className="secretary-baptismal-view-godparent-divider" />}
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="secretary-requirements-view-container">
          <h2 className="secretary-requirements-view-title">Requirements</h2>
          <div className="secretary-requirements-view-box">
            <h3 className="secretary-view-section-header">Documents Required</h3>
            <div className="secretary-info-view-list">
              <div className="secretary-info-view-item">
                <p>Birth Certificate of the Child (PSA or local civil registrar copy)</p>
              </div>
              <div className="secretary-info-view-item">
                <p>Parents' Marriage Certificate (If married in the Church)</p>
              </div>
              <div className="secretary-info-view-item">
                <p>Valid IDs of Parents and Godparents</p>
              </div>
              <div className="secretary-info-view-item">
                <p>Certificate of Permission(If outside the Parish)</p>
              </div>
            </div>

            <h3 className="secretary-view-section-header">Requirements for Parent</h3>
            <div className="secretary-info-view-list">
              <div className="secretary-info-view-item">
                <p>At least one parent must be Catholic</p>
              </div>
              <div className="secretary-info-view-item">
                <p>Parents should be willing to raise the child in the Catholic faith</p>
              </div>
              <div className="secretary-info-view-item">
                <p>Must attend Pre-Baptismal Seminar (Required in most parishes)</p>
              </div>
            </div>

            <h3 className="secretary-view-section-header">Requirements for Godparents</h3>
            <div className="secretary-info-view-list">
              <div className="secretary-info-view-item">
                <p>Must be a practicing Catholic</p>
              </div>
              <div className="secretary-info-view-item">
                <p>Must have received the Sacraments of Baptism, Confirmation, and Holy Eucharist</p>
              </div>
              <div className="secretary-info-view-item">
                <p>Must be at least 16 years old</p>
              </div>
              <div className="secretary-info-view-item">
                <p>If married, must be married in the Catholic Church</p>
              </div>
              <div className="secretary-info-view-item">
                <p>Confirmation Certificate (Some parishes require this for proof of faith practice)</p>
              </div>
              <div className="secretary-info-view-item">
                <p>Certificate of Permission (if outside the Parish)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Schedule Selection Container - Moved below requirements */}
        <div className="secretary-baptismal-view-info-card">
          <h3 className="secretary-view-sub-title">Schedule Selection</h3>
          <div className="secretary-baptismal-view-row-date">
            <div className="secretary-baptismal-view-field-date">
              <label>Date of Baptism:</label>
              <input 
                type="date" 
                className="secretary-view-input"
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
                disabled={status === "Approved"}
              />
            </div>
            
            <div className="secretary-baptismal-view-field-time">
              <label>Time of Baptism:</label>
              <input 
                type="time" 
                className="secretary-view-input"
                value={appointmentTime}
                onChange={(e) => setAppointmentTime(e.target.value)}
                disabled={status === "Approved"}
              />
            </div>
          </div>
          
          <div className="secretary-baptismal-view-field-date">
            <label>Name of the Priest:</label>
            {status === "Approved" ? (
              renderReadOnlyField(selectedPriest || baptismData.priest || "N/A")
            ) : (
              <input 
                type="text" 
                className="secretary-view-input"
                value={selectedPriest}
                onChange={(e) => setSelectedPriest(e.target.value)}
                placeholder="Enter the name of the priest"
                disabled={status === "Approved"}
              />
            )}
          </div>
        </div>

        {/* Action Buttons Section */}
        <div className="secretary-action-buttons">
          {status !== "Approved" && (
            <button 
              className="secretary-bap-submit-button"
              onClick={handleSubmit}
            >
              Approve
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SecretaryBaptismView;