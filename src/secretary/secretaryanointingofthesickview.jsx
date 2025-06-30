import React, { useState, useRef, useEffect } from "react";
import { AiOutlineArrowLeft, AiOutlineEye, AiOutlineDownload } from "react-icons/ai";
import { useLocation, useNavigate } from "react-router-dom";
import "./SecretaryAnointingOfTheSickView.css";

const SecretaryAnointingOfTheSickView = () => {
  // State for status and document viewing
  const [status, setStatus] = useState("PENDING");
  const [viewingDocument, setViewingDocument] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [anointingData, setAnointingData] = useState(null);
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
    // Check if we have necessary state data (anointingID)
    const anointingID = location.state?.anointingID;
    const statusFromNav = location.state?.status;

    console.log("Component mounted, location state:", location.state);
    console.log("anointingID:", anointingID);
    console.log("statusFromNav:", statusFromNav);

    if (!anointingID) {
      setError("Missing anointing information. Please try again.");
      setLoading(false);
      return;
    }

    // Set initial status from navigation - this takes priority
    if (statusFromNav) {
      setStatus(statusFromNav);
    }

    // Fetch the anointing details
    fetchAnointingDetails(anointingID, statusFromNav);
  }, [location]);

  const fetchAnointingDetails = async (anointingID, statusFromNav) => {
    try {
      setLoading(true);
      console.log(`Fetching anointing details for ID: ${anointingID}, statusFromNav: ${statusFromNav}`);
      
      const response = await fetch(`${API_BASE_URL}/fetch_anointing_details.php?anointingID=${anointingID}`);
      const data = await response.json();
      
      console.log("Raw API response:", data);
      
      if (data.success) {
        // Transform the data into the expected format
        const transformedData = transformAnointingData(data.data);
        console.log("Transformed anointing data:", transformedData);
        
        setAnointingData(transformedData);
        
        // Use status from location.state if provided, otherwise use from API
        const currentStatus = statusFromNav || transformedData.status || "PENDING";
        setStatus(currentStatus);
        console.log("Setting status to:", currentStatus);
        
        // Initialize with empty values first
        setSelectedDate("");
        setSelectedTime("");
        setSelectedPriest("");
        
        // Always fetch from approved_appointments table first to get most up-to-date schedule
        const approved = await fetchApprovedAppointmentDetails(anointingID);
        
        // If not in approved_appointments or not approved status, use the dates from anointing_application
        if (!approved && currentStatus !== "Approved") {
          setSelectedDate(transformedData.date || "");
          setSelectedTime(transformedData.time || "");
          setSelectedPriest(transformedData.priest || "");
          console.log("Using data from anointing application:", {
            date: transformedData.date,
            time: transformedData.time,
            priest: transformedData.priest
          });
        }
      } else {
        setError(data.message || "Failed to fetch anointing details");
      }
    } catch (error) {
      console.error("Error fetching anointing details:", error);
      setError("An error occurred while fetching the data");
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch schedule details from approved_appointments
  const fetchApprovedAppointmentDetails = async (anointingID) => {
    try {
      console.log("Fetching approved appointment details for anointingID:", anointingID);
      const response = await fetch(`${API_BASE_URL}/fetch_approved_appointment.php?sacramentID=${anointingID}&sacrament_type=Anointing`);
      
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
  
  const transformAnointingData = (data) => {
    // Format the data from PHP API response to match the component's expected format
    const { 
      anointing = {}, 
      contact = {}, 
      locationInfo = {}, 
      additionalInfo = {}, 
      requirements = {} 
    } = data;
    
    // Log the structure to debug
    console.log("API Response Data:", data);
  
    return {
      date: anointing.dateOfAnointing,
      time: anointing.timeOfAnointing,
      priest: anointing.priestName,
      status: anointing.status,
      anointingID: anointing.anointingID,
      
      // Sick Person Information
      firstName: anointing.firstName,
      middleName: anointing.middleName,
      lastName: anointing.lastName,
      sex: anointing.sex,
      age: anointing.age,
      dateOfBirth: anointing.dateOfBirth,
      placeOfBirth: anointing.placeOfBirth,
      religion: anointing.religion,
      reasonForAnointing: anointing.reasonForAnointing,
      
      // Contact Person Information - using the 'contact' field from API
      contactFirstName: contact.contactFirstName || '',
      contactMiddleName: contact.contactMiddleName || '',
      contactLastName: contact.contactLastName || '',
      contactRelationship: contact.contactRelationship || '',
      contactPhone: contact.contactPhone || '',
      contactEmail: contact.contactEmail || '',
      
      // Location Information - using the 'locationInfo' field from API
      locationType: locationInfo.locationType || '',
      locationName: locationInfo.locationName || '',
      roomNumber: locationInfo.roomNumber || '',
      barangay: locationInfo.barangay || '',
      street: locationInfo.street || '',
      municipality: locationInfo.municipality || '',
      province: locationInfo.province || '',
      locationRegion: locationInfo.locationRegion || '',
      
      // Additional Information
      isCritical: additionalInfo.isCritical === 1,
      needsViaticum: additionalInfo.needsViaticum === 1,
      needsReconciliation: additionalInfo.needsReconciliation === 1, 
      additionalNotes: additionalInfo.additionalNotes || '',
      
      // Requirements
      requirements: {
        medical_cert: {
          submitted: requirements.medical_cert_status === 'Submitted',
          fileName: requirements.medical_cert ? requirements.medical_cert.split('/').pop() : 'N/A',
          status: requirements.medical_cert_status || 'Not Submitted'
        },
        valid_ids: {
          submitted: requirements.valid_ids_status === 'Submitted',
          fileName: requirements.valid_ids ? requirements.valid_ids.split('/').pop() : 'N/A',
          status: requirements.valid_ids_status || 'Not Submitted'
        }
      }
    };
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!anointingData || !anointingData.anointingID) {
      alert("No anointing data available to approve.");
      return;
    }
    
    // Validate required fields
    if (!selectedDate) {
      alert("Please select a date for the anointing.");
      return;
    }
    
    if (!selectedTime) {
      alert("Please select a time for the anointing.");
      return;
    }
    
    if (!selectedPriest) {
      alert("Please enter the name of the priest for the anointing.");
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
    console.log(`Approving anointing application with ID: ${anointingData.anointingID}`);
    
    // Step 1: First save the appointment data to approved_appointments table
    const appointmentResponse = await fetch(`${API_BASE_URL}/save_approved_appointment.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sacramentID: anointingData.anointingID,
        sacrament_type: "Anointing",
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
    
    // Step 2: Now update the anointing status
    const response = await fetch(`${API_BASE_URL}/update_anointing_status.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        anointingID: anointingData.anointingID,
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
      // ADD EMAIL SENDING HERE - AFTER SUCCESSFUL APPROVAL
      try {
        const emailResponse = await fetch(`${API_BASE_URL}/approved_anointing_email.php`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            anointingID: anointingData.anointingID,
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
      setAnointingData({
        ...anointingData,
        date: selectedDate,
        time: selectedTime,
        priest: selectedPriest,
        status: "Approved"
      });
      
      setSuccessMessage("Anointing application has been approved successfully! An email notification has been sent to the client.");
      setShowSuccessModal(true);
    } else {
      // Show error message from server or a default one
      const errorMessage = result.message || "Failed to approve anointing application";
      setSuccessMessage(errorMessage);
      setShowSuccessModal(true);
    }
  } catch (error) {
    console.error("Error approving anointing application:", error);
    setSuccessMessage("An error occurred while approving the anointing application: " + error.message);
    setShowSuccessModal(true);
  }
};
  // Handle cancel action
  const handleCancel = () => {
    // Reset the status to previous value or redirect
    navigate(-1);
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

  // Function to render read-only input field
  const renderReadOnlyField = (value) => {
    return <div className="secretary-anointing-view-value">{value || "N/A"}</div>;
  };

  // Function to render document status with view button
  const renderDocumentStatus = (isSubmitted, fileName, requirementType) => {
    return (
      <div className="secretary-anointing-document-status-container">
        <div className={`secretary-anointing-view-status ${isSubmitted ? 'secretary-anointing-view-submitted' : 'secretary-anointing-view-not-submitted'}`}>
          {isSubmitted ? `Submitted: ${fileName}` : "Not Submitted"}
        </div>
        {isSubmitted && (
          <button 
            className="secretary-anointing-view-document-btn"
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
      return `/uploads/anointing_requirements/${fileName}`;
    } else {
      // For production server - based on Hostinger file structure
      return `/uploads/anointing_requirements/${fileName}`;
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
      <div className="secretary-anointing-document-viewer-overlay">
        <div className="secretary-anointing-document-viewer-container">
          <div className="secretary-anointing-document-viewer-header">
            <h3>{displayName}</h3>
            <button 
              className="secretary-anointing-document-close-btn"
              onClick={() => setViewingDocument(null)}
            >
              ×
            </button>
          </div>
          <div className="secretary-anointing-document-viewer-content">
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
              <div className="secretary-anointing-document-placeholder">
                <p>Document preview not available for this file type.</p>
                <a 
                  href={documentUrl}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="secretary-anointing-document-download-link"
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

  // Success/Error Modal Component
  const renderSuccessModal = () => {
    if (!showSuccessModal) return null;

    // Determine if it's a success or error message
    const isSuccess = successMessage.includes("successfully");
    const modalType = isSuccess ? "success" : "error";

    // Handle OK button click
    const handleOkClick = () => {
      setShowSuccessModal(false);
      
      // If this was a successful approval, navigate back to the anointing list
      if (isSuccess) {
        navigate("/secretary-anointing-of-the-sick");
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
            <p>Are you sure you want to approve this anointing appointment?</p>
            <p>Date: {selectedDate}</p>
            <p>Time: {selectedTime}</p>
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

  if (loading) {
    return (
      <div className="secretary-anointing-view-container">
        <div className="secretary-anointing-view-loading">Loading anointing details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="secretary-anointing-view-container">
        <div className="secretary-anointing-view-error">
          <p>{error}</p>
          <button onClick={() => navigate(-1)}>Back</button>
        </div>
      </div>
    );
  }

  if (!anointingData) {
    return (
      <div className="secretary-anointing-view-container">
        <div className="secretary-anointing-view-error">
          <p>No anointing data found.</p>
          <button onClick={() => navigate(-1)}>Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="secretary-anointing-view-container">
      {/* Document Viewer Modal */}
      {renderDocumentViewer()}
      
      {/* Success Modal */}
      {renderSuccessModal()}
      
      {/* Confirmation Modal */}
      {renderConfirmModal()}
      
      {/* Header */}
      <div className="secretary-anointing-view-header">
        <div className="secretary-anointing-view-left-section">
          <button className="secretary-anointing-view-back-button" onClick={() => navigate(-1)}>
            <AiOutlineArrowLeft className="secretary-anointing-view-back-icon" /> Back
          </button>
        </div>
      </div>
      <h1 className="secretary-anointing-view-title">Anointing of the Sick Application Details</h1>
      
      {/* Anointing Data Section */}
      <div className="secretary-anointing-view-data">
          <div className="secretary-anointing-view-info-card">
      <h3 className="secretary-funeral-view-sub-title">Appointment Request Details</h3>
        <div className="secretary-anointing-view-row-date">
          <div className="secretary-anointing-view-field-date">
            <label>Date of Appointment:</label>
            {renderReadOnlyField(formatDate(anointingData.date))}
          </div>
          
          <div className="secretary-anointing-view-field-time">
            <label>Time of Appointment:</label>
            {renderReadOnlyField(anointingData.time)}
          </div>
        </div>
        </div>

        {/* Sick Person Information */}
        <div className="secretary-anointing-view-bypart">
          <h3 className="secretary-anointing-view-sub-title">Sick Person Information</h3>
          <div className="secretary-anointing-view-info-card">
            <div className="secretary-anointing-view-row">
              <div className="secretary-anointing-view-field">
                <label>First Name of the Sick Person:</label>
                {renderReadOnlyField(anointingData.firstName)}
              </div>
              <div className="secretary-anointing-view-field">
                <label>Middle Name:</label>
                {renderReadOnlyField(anointingData.middleName)}
              </div>
              <div className="secretary-anointing-view-field">
                <label>Last Name:</label>
                {renderReadOnlyField(anointingData.lastName)}
              </div>
            </div>
            <div className="secretary-anointing-view-row">
            <div className="secretary-anointing-view-field">
                <label>Date of Birth:</label>
                {renderReadOnlyField(formatDate(anointingData.dateOfBirth))}
              </div>
              <div className="secretary-anointing-view-field">
                <label>Age:</label>
                {renderReadOnlyField(anointingData.age)}
              </div>
              <div className="secretary-anointing-view-field">
                <label>Sex:</label>
                {renderReadOnlyField(anointingData.sex)}
              </div>
            </div>
            <div className="secretary-anointing-view-row">
              <div className="secretary-anointing-view-field">
                <label>Place of Birth:</label>
                {renderReadOnlyField(anointingData.placeOfBirth)}
              </div>
              <div className="secretary-anointing-view-field">
                <label>Religion:</label>
                {renderReadOnlyField(anointingData.religion)}
              </div>
            </div>
            <div className="secretary-anointing-view-row">
              <div className="secretary-anointing-view-field-wide">
                <label>Reason for Anointing (Medical Condition):</label>
                {renderReadOnlyField(anointingData.reasonForAnointing)}
              </div>
            </div>
          </div>
        </div>
        {/* Contact Person Information */}
        <div className="secretary-anointing-view-bypart">
          <h3 className="secretary-anointing-view-sub-title">Contact Person Information</h3>
          <div className="secretary-anointing-view-info-card">
            <div className="secretary-anointing-view-row">
              <div className="secretary-anointing-view-field">
                <label>Contact Person's First Name:</label>
                {renderReadOnlyField(anointingData.contactFirstName)}
              </div>
              <div className="secretary-anointing-view-field">
                <label>Middle Name:</label>
                {renderReadOnlyField(anointingData.contactMiddleName)}
              </div>
              <div className="secretary-anointing-view-field">
                <label>Last Name:</label>
                {renderReadOnlyField(anointingData.contactLastName)}
              </div>
            </div>
            <div className="secretary-anointing-view-row">
              <div className="secretary-anointing-view-field">
                <label>Relationship to Sick Person:</label>
                {renderReadOnlyField(anointingData.contactRelationship)}
              </div>
              <div className="secretary-anointing-view-field">
                <label>Phone Number:</label>
                {renderReadOnlyField(anointingData.contactPhone)}
              </div>
              <div className="secretary-anointing-view-field">
                <label>Email Address:</label>
                {renderReadOnlyField(anointingData.contactEmail)}
              </div>
            </div>
          </div>
        </div>
        {/* Location Information */}
        <div className="secretary-anointing-view-bypart">
          <h3 className="secretary-anointing-view-sub-title">Location Information</h3>
          <div className="secretary-anointing-view-info-card">
            <div className="secretary-anointing-view-row">
              <div className="secretary-anointing-view-field">
                <label>Location Type:</label>
                {renderReadOnlyField(anointingData.locationType)}
              </div>
              <div className="secretary-anointing-view-field">
                <label>Location Name:</label>
                {renderReadOnlyField(anointingData.locationName)}
              </div>
              <div className="secretary-anointing-view-field">
                <label>Room/Room Number:</label>
                {renderReadOnlyField(anointingData.roomNumber)}
              </div>
              </div>
              <div className="secretary-anointing-view-row">
            <div className="secretary-anointing-view-field">
                <label>Street:</label>
                {renderReadOnlyField(anointingData.street)}
              </div>
              <div className="secretary-anointing-view-field">
                <label>Barangay:</label>
                {renderReadOnlyField(anointingData.barangay)}
              </div>
              <div className="secretary-anointing-view-field">
                <label>Municipality:</label>
                {renderReadOnlyField(anointingData.municipality)}
              </div>
              </div>
              <div className="secretary-anointing-view-row">
              <div className="secretary-anointing-view-field">
                <label>Province:</label>
                {renderReadOnlyField(anointingData.province)}
              </div>
              <div className="secretary-anointing-view-field">
                <label>Region:</label>
                {renderReadOnlyField(anointingData.locationRegion)}
              </div>
            </div>
          </div>
        </div>
        {/* Additional Information */}
        <div className="secretary-anointing-view-bypart">
          <h3 className="secretary-anointing-view-sub-title">Additional Information</h3>
          <div className="secretary-anointing-view-info-card">
            <div className="secretary-anointing-view-row">
              <div className="secretary-anointing-checkbox-container">
                <span className={`secretary-anointing-view-checkbox ${anointingData.isCritical ? 'secretary-anointing-view-checked' : ''}`}></span>
                <label>Is the person in critical condition?</label>
              </div>
            </div>
            <div className="secretary-anointing-view-row">
              <div className="secretary-anointing-checkbox-container">
                <span className={`secretary-anointing-view-checkbox ${anointingData.needsViaticum ? 'secretary-anointing-view-checked' : ''}`}></span>
                <label>Needs Viaticum (Holy Communion)</label>
              </div>
            </div>
            <div className="secretary-anointing-view-row">
              <div className="secretary-anointing-checkbox-container">
                <span className={`secretary-anointing-view-checkbox ${anointingData.needsReconciliation ? 'secretary-anointing-view-checked' : ''}`}></span>
                <label>Needs Sacrament of Reconciliation (Confession)</label>
              </div>
            </div>
            <div className="secretary-anointing-view-row">
              <div className="secretary-anointing-view-field-wide">
                <label>Additional Notes or Special Requests:</label>
                {renderReadOnlyField(anointingData.additionalNotes)}
              </div>
            </div>
          </div>
        </div>
        {/* Requirements Section */}
        <div className="secretary-anointing-requirements-view-container">
          <h2 className="secretary-anointing-requirements-view-title">About Anointing of the Sick</h2>
          <div className="secretary-anointing-requirements-view-box">
            <h3 className="secretary-anointing-view-section-header">Documents Required</h3>
            <div className="secretary-anointing-info-view-list">
              <div className="secretary-anointing-info-view-item">
                <p>Medical Certificate or Doctor's note</p>
              </div>
              <div className="secretary-anointing-info-view-item">
                <p>Valid IDs of the sick person or the contact person</p>
              </div>
              <div className="secretary-anointing-info-view-item">
                <p>Certificate of Permission(if the candidate is not a resident of the parish)</p>
              </div>
            </div>
            <h3 className="secretary-anointing-view-section-header">About Anointing of the Sick</h3>
            <div className="secretary-anointing-info-view-list">
              <div className="secretary-anointing-info-view-item">
                <p>The Sacrament of Anointing of the Sick provides spiritual strength and comfort to those who are ill or facing serious medical conditions.</p>
              </div>
              <div className="secretary-anointing-info-view-item">
                <p>Viaticum is the Holy Communion given to a dying person as spiritual food for their journey to eternal life.</p>
              </div>
              <div className="secretary-anointing-info-view-item">
                <p>This sacrament can be received by any Catholic who is seriously ill, facing surgery, or weakened by old age.</p>
              </div>
            </div>

            <h3 className="secretary-anointing-view-section-header">Important Notes</h3>
            <div className="secretary-anointing-info-view-list">
              <div className="secretary-anointing-info-view-item">
                <p>For emergency cases, please call the parish emergency number directly instead of using this form.</p>
              </div>
              <div className="secretary-anointing-info-view-item">
                <p>A priest will visit the location provided to administer the sacrament.</p>
              </div>
              <div className="secretary-anointing-info-view-item">
                <p>Please ensure someone will be present to receive the priest and guide them to the sick person.</p>
              </div>
              <div className="secretary-anointing-info-view-item">
                <p>You will receive a confirmation email once your request has been processed.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Schedule Selection Section */}
        <div className="secretary-anointing-view-info-card">
          <h3 className="secretary-anointing-view-sub-title">Schedule Selection</h3>
          <div className="secretary-anointing-view-row">
            <div className="secretary-anointing-view-field">
              <label>Date of Anointing:</label>
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
            <div className="secretary-anointing-view-field">
              <label>Time of Anointing:</label>
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
          <div className="secretary-anointing-view-row">
            <div className="secretary-anointing-view-field">
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
              className="secretary-ano-submit-button"
              onClick={handleSubmit}
            >
              Approve
            </button>
          )}
          {status === "Approved" && (
            <div className="secretary-approved-status">
              <span className="secretary-approved-icon">✓</span>
              <span className="secretary-approved-text">This anointing request has been approved</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SecretaryAnointingOfTheSickView;