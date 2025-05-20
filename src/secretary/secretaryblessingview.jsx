import React, { useState, useRef, useEffect } from "react";
import { AiOutlineArrowLeft, AiOutlineEye, AiOutlineDownload } from "react-icons/ai"; 
import { useLocation, useNavigate } from "react-router-dom";
import "./SecretaryBlessingView.css";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Make sure these images exist in the specified paths
import pdmLogo from "../assets/pdmlogo.png";
import church2Img from "../assets/church2.jpg";

const SecretaryBlessingView = () => {
  // State for document viewing
  const [viewingDocument, setViewingDocument] = useState(null);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const certificateRef = useRef(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [blessingData, setBlessingData] = useState(null);
  const [error, setError] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  
  // State for schedule fields - separate from blessingData
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  const [selectedPriest, setSelectedPriest] = useState("");

  useEffect(() => {
    // Check if we have necessary state data (blessingID)
    const blessingID = location.state?.blessingID || location.state?.blessingData?.id;

    if (!blessingID) {
      setError("Missing blessing information. Please try again.");
      setLoading(false);
      return;
    }

    // Fetch the blessing details
    fetchBlessingDetails(blessingID);
  }, [location]);

  // Function to fetch the blessing details
  const fetchBlessingDetails = async (blessingID) => {
    try {
      setLoading(true);
      const response = await fetch(`https://parishofdivinemercy.com/backend/fetch_blessing_details.php?blessingID=${blessingID}`);
      const data = await response.json();
      
      if (data.success) {
        // Transform the data into the expected format
        const transformedData = transformBlessingData(data.data);
        setBlessingData(transformedData);
        
        // Initialize the schedule fields with default empty values first
        setAppointmentDate("");
        setAppointmentTime("");
        setSelectedPriest("");
        
        // If it's approved, fetch schedule details from approved_appointments table
        if (transformedData.status === "Approved") {
          fetchApprovedAppointmentDetails(blessingID);
        } else {
          // Only use these as initial values if not already approved
          setAppointmentDate(transformedData.date || "");
          setAppointmentTime(transformedData.time || "");
          setSelectedPriest(transformedData.priest || "");
        }
      } else {
        setError(data.message || "Failed to fetch blessing details");
      }
    } catch (error) {
      console.error("Error fetching blessing details:", error);
      setError("An error occurred while fetching the data");
    } finally {
      setLoading(false);
    }
  };
  
  // Function to fetch schedule details from approved_appointments
  const fetchApprovedAppointmentDetails = async (blessingID) => {
    try {
      console.log("Fetching appointment details for blessing ID:", blessingID);
      const response = await fetch(`https://parishofdivinemercy.com/backend/fetch_approved_appointment.php?sacramentID=${blessingID}&sacrament_type=blessing`);
      const data = await response.json();
      console.log("Appointment data response:", data);
      
      if (data.success && data.appointment) {
        // Update ONLY the schedule fields with data from approved_appointments
        console.log("Setting appointment values from DB:", {
          date: data.appointment.date,
          time: data.appointment.time,
          priest: data.appointment.priest
        });
        
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

  const transformBlessingData = (data) => {
    // Format the data from PHP API response to match the component's expected format
    const { blessing, address, type, requirements } = data;

    // Process requirements to create a usable structure
    const processedRequirements = {};
    
    if (Array.isArray(requirements)) {
      requirements.forEach(req => {
        const reqType = req.requirement_type;
        processedRequirements[reqType] = {
          submitted: req.status === 'Submitted',
          fileName: req.file_name || 'N/A',
          filePath: req.file_path || 'N/A',
          status: req.status || 'Not Submitted'
        };
      });
    }

    return {
      date: blessing.preferredDate || 'N/A',
      time: blessing.preferredTime || 'N/A',
      priest: blessing.priestName || 'N/A',
      status: blessing.status || 'Pending',
      blessingID: blessing.blessingID,
      firstName: blessing.firstName || 'N/A',
      middleName: blessing.middleName || 'N/A',
      lastName: blessing.lastName || 'N/A',
      contactNumber: blessing.contactNumber || 'N/A',
      emailAddress: blessing.emailAddress || 'N/A',
      placeOfBirth: blessing.placeOfBirth || 'N/A',
      address: {
        street: address?.street || 'N/A',
        barangay: address?.barangay || 'N/A',
        municipality: address?.municipality || 'N/A',
        province: address?.province || 'N/A',
        region: address?.region || 'N/A'
      },
      blessingType: type?.blessing_type || 'N/A',
      purpose: type?.purpose || 'N/A',
      notes: type?.note || 'N/A',
      requirements: processedRequirements,
      // Added certificate details
      certificate: {
        registerNumber: "1",
        pageNumber: "43",
        lineNumber: "22",
        dateIssued: new Date().toISOString().split('T')[0],
        purposeOf: "Reference"
      }
    };
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!blessingData || !blessingData.blessingID) {
      alert("No blessing data available to approve.");
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
      alert("Please enter the name of the priest for the blessing.");
      return;
    }
    
    // Debug log
    console.log("Submit values:", {
      appointmentDate,
      appointmentTime,
      selectedPriest
    });

    // Show confirmation modal instead of submitting immediately
    setShowConfirmModal(true);
  };

  // Function to proceed with approval after confirmation
  const handleConfirmApproval = async () => {
    setShowConfirmModal(false);
    
    try {
      // Log the values being sent to make sure they're what we expect
      console.log("Sending appointment data:", {
        sacramentID: blessingData.blessingID,
        sacrament_type: "blessing",
        date: appointmentDate,
        time: appointmentTime, 
        priest: selectedPriest
      });
      
      // Insert into approved_appointments table
      const appointmentResponse = await fetch("https://parishofdivinemercy.com/backend/save_approved_appointment.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sacramentID: blessingData.blessingID,
          sacrament_type: "blessing",
          date: appointmentDate,
          time: appointmentTime,
          priest: selectedPriest
        }),
      });
      
      const appointmentResult = await appointmentResponse.json();
      console.log("Appointment save result:", appointmentResult);
      
      if (!appointmentResult.success) {
        throw new Error(appointmentResult.message || "Failed to save appointment details");
      }
      
      // Then update the blessing status - ALSO sending date/time/priest values
      const response = await fetch("https://parishofdivinemercy.com/backend/update_blessing_status.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          blessingID: blessingData.blessingID,
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
        // Update local state to reflect changes
        setBlessingData({
          ...blessingData,
          status: "Approved",
          date: appointmentDate,
          time: appointmentTime,
          priest: selectedPriest
        });
        
        setSuccessMessage("Blessing application has been approved successfully! An email notification has been sent to the client.");
        setShowSuccessModal(true);
      } else {
        // Show error message from server or a default one
        const errorMessage = result.message || "Failed to approve blessing application";
        setSuccessMessage(errorMessage);
        setShowSuccessModal(true);
      }
    } catch (error) {
      console.error("Error approving blessing application:", error);
      setSuccessMessage("An error occurred while approving the blessing application: " + error.message);
      setShowSuccessModal(true);
    }
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
      const blessingTypeFormatted = blessingData.blessingType.charAt(0).toUpperCase() + blessingData.blessingType.slice(1);
      const fileName = `${blessingTypeFormatted}_Blessing_Certificate_${blessingData.firstName}_${blessingData.lastName}.pdf`;
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
    return <div className="secretary-blessing-view-value">{value || "N/A"}</div>;
  };

  // Function to get document URL based on environment and server configuration
  const getDocumentUrl = (fileName) => {
    // Determine base URL depending on environment
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    
    if (isLocalhost) {
      // For local development
      return `/uploads/blessing_requirements/${fileName}`;
    } else {
      // For production server - based on Hostinger file structure
      return `/uploads/blessing_requirements/${fileName}`;
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
      <div className="secretary-blessing-document-viewer-overlay">
        <div className="secretary-blessing-document-viewer-container">
          <div className="secretary-blessing-document-viewer-header">
            <h3>{displayName}</h3>
            <button 
              className="secretary-blessing-document-close-btn"
              onClick={() => setViewingDocument(null)}
            >
              ×
            </button>
          </div>
          <div className="secretary-blessing-document-viewer-content">
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
              <div className="secretary-blessing-document-placeholder">
                <p>Document preview not available for this file type.</p>
                <a 
                  href={documentUrl}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="secretary-blessing-document-download-link"
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
    if (!showCertificateModal || !blessingData) return null;
    
    // Format for certificate display
    const blessingTypeFormatted = blessingData.blessingType.charAt(0).toUpperCase() + blessingData.blessingType.slice(1);
    const fullName = `${blessingData.firstName || ''} ${blessingData.middleName || ''} ${blessingData.lastName || ''}`.trim();
    const address = `${blessingData.address.street || ''}, ${blessingData.address.barangay || ''}, ${blessingData.address.municipality || ''}, ${blessingData.address.province || ''}`.trim();

    return (
      <div className="secretary-blessing-document-viewer-overlay">
        <div className="secretary-blessing-certificate-modal-container">
          <div className="secretary-blessing-document-viewer-header">
            <h3>{blessingTypeFormatted} Blessing Certificate</h3>
            <button 
              className="secretary-blessing-document-close-btn"
              onClick={() => setShowCertificateModal(false)}
            >
              ×
            </button>
          </div>
          <div className="secretary-blessing-certificate-modal-content">
            <p>Would you like to download this certificate?</p>
            
            {/* Certificate Preview */}
            <div ref={certificateRef} className="blessing-certificate-preview">
              <div className="blessing-certificate-header">
                <div className="blessing-certificate-logos">
                  <div className="blessing-parish-logo-left">
                    <img 
                      src={church2Img} 
                      alt="Parish Logo Left" 
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/70x70?text=Church";
                      }}
                    />
                  </div>
                  <div className="blessing-parish-title">
                    <div className="blessing-diocese-title">DIOCESE OF DAET</div>
                    <div className="blessing-parish-name">PARISH OF THE DIVINE MERCY</div>
                    <div className="blessing-parish-address">Alawihao, Daet, Camarines Norte</div>
                  </div>
                  <div className="blessing-parish-logo-right">
                    <img 
                      src={pdmLogo} 
                      alt="Parish Logo Right" 
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/80x80?text=PDM";
                      }}
                    />
                  </div>
                </div>
                
                <h1 className="blessing-certificate-title">CERTIFICATE OF {blessingTypeFormatted.toUpperCase()} BLESSING</h1>
              </div>
              
              <div className="blessing-certificate-body">
                <div className="blessing-cert-intro">
                  This is to certify that the {blessingTypeFormatted.toLowerCase()} of
                </div>
                
                <div className="name-field blessing-cert-field">
                  <div className="blessing-cert-value">{fullName}</div>
                  <div className="blessing-cert-label">Name of Requester</div>
                </div>
                
                <div className="location-field">
                  <span className="blessing-cert-prefix">located at</span>
                  <div className="blessing-cert-value">{address}</div>
                </div>
                
                <div className="purpose-field">
                  <span className="blessing-cert-prefix">for the purpose of</span>
                  <div className="blessing-cert-value">{blessingData.purpose}</div>
                </div>
                
                <div className="blessing-date-field">
                  <span className="blessing-cert-prefix">was blessed on</span>
                  <div className="blessing-cert-value">{formatDate(appointmentDate)}</div>
                </div>
                
                <div className="blessing-time-field">
                  <span className="blessing-cert-prefix">at</span>
                  <div className="blessing-cert-value">{appointmentTime}</div>
                </div>
                
                <div className="priest-field">
                  <span className="blessing-cert-prefix">by</span>
                  <div className="blessing-cert-value">{selectedPriest}</div>
                  <div className="blessing-cert-label">Officiating Priest</div>
                </div>
                
                <div className="blessing-cert-message">
                  May God bless this {blessingTypeFormatted.toLowerCase()} and all who {blessingData.blessingType === 'house' ? 'dwell in it' : blessingData.blessingType === 'business' ? 'work in it' : 'use it'}.
                </div>
              </div>
              
              <div className="blessing-cert-footer">
                <div className="date-issued-field">
                  <span className="blessing-cert-prefix">Date Issued:</span>
                  <div className="blessing-cert-value">{formatDate(blessingData.certificate.dateIssued)}</div>
                </div>
                
                <div className="parish-seal">PARISH SEAL</div>
                
                <div className="signature-field">
                  <div className="signature-line">{selectedPriest}</div>
                  <div className="blessing-cert-label">Parish Priest / Officiating Priest</div>
                </div>
                
                <div className="register-field">
                  <span className="blessing-cert-prefix">Registry No.</span>
                  <div className="blessing-cert-value">{blessingData.certificate.registerNumber}</div>
                  <span className="blessing-cert-prefix">Page:</span>
                  <div className="blessing-cert-value">{blessingData.certificate.pageNumber}</div>
                  <span className="blessing-cert-prefix">Line:</span>
                  <div className="blessing-cert-value">{blessingData.certificate.lineNumber}</div>
                </div>
              </div>
            </div>
            
            <div className="secretary-blessing-certificate-modal-actions">
              <button 
                className="secretary-blessing-certificate-download-btn"
                onClick={downloadCertificateAsPDF}
                disabled={isDownloading}
              >
                {isDownloading ? 'Processing...' : <><AiOutlineDownload /> Download</>}
              </button>
              <button 
                className="secretary-blessing-certificate-cancel-btn"
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
      
      // If this was a successful approval, navigate back to the blessing list
      if (isSuccess) {
        navigate("/secretary-blessing");
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
            <p>Are you sure you want to approve this blessing appointment?</p>
            <p>Date: {appointmentDate}</p>
            <p>Time: {appointmentTime}</p>
            <p>Priest: {selectedPriest}</p>
            <p>This will send an email notification to the client.</p>
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

  // Function to render requirements based on blessing type
  const renderRequirements = () => {
    if (!blessingData) return null;
    
    switch(blessingData.blessingType) {
      case "house":
        return (
          <>
            <h3 className="secretary-blessing-view-section-header">Documents Required</h3>
            <div className="secretary-blessing-info-view-list">
              <div className="secretary-blessing-info-view-item">
                <p>Valid ID of the Requester</p>
              </div>
              <div className="secretary-blessing-info-view-item">
                <p>Proof of Ownership</p>
              </div>
              <div className="secretary-blessing-info-view-item">
                <p>Barangay Clearance</p>
              </div>
            </div>

            <h3 className="secretary-blessing-view-section-header">House Blessing Requirements</h3>
            <div className="secretary-blessing-info-view-list">
              <div className="secretary-blessing-info-view-item">
                <p>The house must be <strong>ready for occupancy</strong></p>
              </div>
              <div className="secretary-blessing-info-view-item">
                <p>All <strong>family members should be present</strong> if possible</p>
              </div>
              <div className="secretary-blessing-info-view-item">
                <p>Prepare basic blessing items</p>
              </div>
              <div className="secretary-blessing-info-view-item">
                <p>Some parishes ask that you <strong>belong to the parish community</strong> or register in the parish</p>
              </div>
            </div>
          </>
        );
      
      case "business":
        return (
          <>
            <h3 className="secretary-blessing-view-section-header">Documents Required</h3>
            <div className="secretary-blessing-info-view-list">
              <div className="secretary-blessing-info-view-item">
                <p>Valid ID of the Requester</p>
              </div>
              <div className="secretary-blessing-info-view-item">
                <p>Business Permit / DTI Registration</p>
              </div>
            </div>

            <h3 className="secretary-blessing-view-section-header">Business Blessing Requirements</h3>
            <div className="secretary-blessing-info-view-list">
              <div className="secretary-blessing-info-view-item">
                <p>Business must have the <strong>necessary permits</strong> (may be checked informally)</p>
              </div>
              <div className="secretary-blessing-info-view-item">
                <p>Owner or authorized representative must be present</p>
              </div>
              <div className="secretary-blessing-info-view-item">
                <p>Staff may be included in prayer or ceremony</p>
              </div>
            </div>
          </>
        );
      
      case "car":
        return (
          <>
            <h3 className="secretary-blessing-view-section-header">Documents Required</h3>
            <div className="secretary-blessing-info-view-list">
              <div className="secretary-blessing-info-view-item">
                <p>Valid ID of the Requester</p>
              </div>
              <div className="secretary-blessing-info-view-item">
                <p>Vehicle OR/CR (Official Receipt / Certificate of Registration)</p>
              </div>
            </div>

            <h3 className="secretary-blessing-view-section-header">Car Blessing Requirements</h3>
            <div className="secretary-blessing-info-view-list">
              <div className="secretary-blessing-info-view-item">
                <p>Must bring the <strong>actual vehicle</strong> to the venue or church</p>
              </div>
              <div className="secretary-blessing-info-view-item">
                <p>The car should be clean and parked properly</p>
              </div>
            </div>
          </>
        );
      
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="secretary-blessing-view-container">
        <div className="secretary-blessing-view-loading">Loading blessing details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="secretary-blessing-view-container">
        <div className="secretary-blessing-view-error">
          <p>{error}</p>
          <button onClick={() => navigate(-1)}>Back</button>
        </div>
      </div>
    );
  }

  if (!blessingData) {
    return (
      <div className="secretary-blessing-view-container">
        <div className="secretary-blessing-view-error">
          <h2>No blessing data available</h2>
          <p>Please go back and select a blessing to view.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="secretary-blessing-view-container">
      {/* Document Viewer Modal */}
      {renderDocumentViewer()}
      
      {/* Certificate Download Modal */}
      {renderCertificateModal()}
      
      {/* Success Modal */}
      {renderSuccessModal()}
      
      {/* Confirmation Modal */}
      {renderConfirmModal()}
      
      {/* Header */}
      <div className="secretary-blessing-view-header">
        <div className="secretary-blessing-view-left-section">
          <button className="secretary-blessing-view-back-button" onClick={() => navigate(-1)}>
            <AiOutlineArrowLeft className="secretary-blessing-view-back-icon" /> Back
          </button>
        </div>
      </div>
      <h1 className="secretary-blessing-view-title">Blessing Application Details</h1>
      
      {/* Blessing Data Section */}
      <div className="secretary-blessing-view-data">
        <div className="secretary-blessing-view-info-card">
        <h3 className="secretary-funeral-view-sub-title">Appointment Request Details</h3>
          <div className="secretary-blessing-view-row-date">
            <div className="secretary-blessing-view-field-date">
              <label>Date of Appointment:</label>
              {renderReadOnlyField(formatDate(blessingData.date))}
            </div>
            
            <div className="secretary-blessing-view-field-time">
              <label>Time of Appointment:</label>
              {renderReadOnlyField(blessingData.time)}
            </div>
          </div>
        </div>
        
        <div className="secretary-blessing-view-bypart">
          <h2 className="secretary-blessing-view-sub-title">Personal Information</h2>
          
          <div className="secretary-blessing-view-info-card">
            <div className="secretary-blessing-view-row">
              <div className="secretary-blessing-view-field">
                <label>First Name:</label>
                {renderReadOnlyField(blessingData.firstName)}
              </div>
              <div className="secretary-blessing-view-field">
                <label>Middle Name:</label>
                {renderReadOnlyField(blessingData.middleName)}
              </div>
              <div className="secretary-blessing-view-field">
                <label>Last Name:</label>
                {renderReadOnlyField(blessingData.lastName)}
              </div>
            </div>

            <div className="secretary-blessing-view-row">
              <div className="secretary-blessing-view-field">
                <label>Contact Number:</label>
                {renderReadOnlyField(blessingData.contactNumber)}
              </div>
              <div className="secretary-blessing-view-field">
                <label>Email Address:</label>
                {renderReadOnlyField(blessingData.emailAddress)}
              </div>
            </div>
          </div>

          <h2 className="secretary-blessing-view-sub-title">Blessing Details</h2>
          
          <div className="secretary-blessing-view-info-card">
            <label className="sub-mini-cc">Location</label>
            <div className="secretary-blessing-view-row">
            <div className="secretary-blessing-view-field">
                <label>Street:</label>
                {renderReadOnlyField(blessingData.address.street)}
              </div>
              <div className="secretary-blessing-view-field">
                <label>Barangay:</label>
                {renderReadOnlyField(blessingData.address.barangay)}
              </div>
              <div className="secretary-blessing-view-field">
                <label>Municipality:</label>
                {renderReadOnlyField(blessingData.address.municipality)}
              </div>
              <div className="secretary-blessing-view-field">
                <label>Province:</label>
                {renderReadOnlyField(blessingData.address.province)}
              </div>
            </div>

            <div className="secretary-blessing-view-row">
              <div className="secretary-blessing-view-field">
                <label>Blessing Type:</label>
                {renderReadOnlyField(blessingData.blessingType.charAt(0).toUpperCase() + blessingData.blessingType.slice(1) + " Blessing")}
              </div>
              <div className="secretary-blessing-view-field">
                <label>Purpose:</label>
                {renderReadOnlyField(blessingData.purpose)}
              </div>
            </div>

            <div className="secretary-blessing-view-row">
              <div className="secretary-blessing-view-field">
                <label>Notes:</label>
                {renderReadOnlyField(blessingData.notes || "No additional notes provided.")}
              </div>
            </div>
          </div>
        </div>
        
        {/* Requirements section */}
        <div className="secretary-blessing-requirements-view-container">
          <h2 className="secretary-blessing-requirements-view-title">Requirements</h2>
          <div className="secretary-blessing-requirements-view-box">
            {renderRequirements()}
          </div>
        </div>

        {/* Schedule Selection Section */}
        <div className="secretary-blessing-view-info-card">
          <h2 className="secretary-blessing-view-sub-title">Schedule Selection</h2>
          <div className="secretary-blessing-view-row">
            <div className="secretary-blessing-view-field">
              <label>Date of Blessing:</label>
              <input
                type="date"
                className="secretary-view-input"
                value={appointmentDate}
                onChange={(e) => {
                  console.log("Date changed to:", e.target.value);
                  setAppointmentDate(e.target.value);
                }}
                disabled={blessingData.status === "Approved"}
              />
            </div>
            <div className="secretary-blessing-view-field">
              <label>Time of Blessing:</label>
              <input
                type="time"
                className="secretary-view-input"
                value={appointmentTime}
                onChange={(e) => {
                  console.log("Time changed to:", e.target.value);
                  setAppointmentTime(e.target.value);
                }}
                disabled={blessingData.status === "Approved"}
              />
            </div>
          </div>
          <div className="secretary-blessing-view-row">
            <div className="secretary-blessing-view-field">
              <label>Name of the Priest:</label>
              {blessingData.status === "Approved" ? (
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
                  disabled={blessingData.status === "Approved"}
                />
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons Section */}
        <div className="secretary-blessing-action-buttons">
          {blessingData.status !== "Approved" && (
            <button 
              className="secretary-blessing-submit-button"
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

export default SecretaryBlessingView;