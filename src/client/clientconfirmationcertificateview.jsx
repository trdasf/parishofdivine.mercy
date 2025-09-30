import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AiOutlineArrowLeft, AiOutlineDownload } from "react-icons/ai";
import jsPDF from 'jspdf';
import "./ClientConfirmationCertificateView.css";

const ClientConfirmationCertificateView = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { clientID, reqconfirmationID } = location.state || {};

  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Fetch confirmation request details
  const fetchConfirmationDetails = async () => {
    if (!clientID || !reqconfirmationID) {
      setError("Client ID and Request ID are required");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`http://parishofdivinemercy.com/backend/get_confirmation_request_details.php?clientID=${clientID}&reqconfirmationID=${reqconfirmationID}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setData(result.data);
      } else {
        throw new Error(result.message || 'Failed to fetch confirmation request details');
      }
    } catch (error) {
      console.error('Error fetching confirmation details:', error);
      setError(error.message || 'Failed to load confirmation certificate details');
    } finally {
      setIsLoading(false);
    }
  };

  // Load data when component mounts
  useEffect(() => {
    fetchConfirmationDetails();
  }, [clientID, reqconfirmationID]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getPurposes = () => {
    if (!data) return 'Not specified';
    
    const purposes = [];
    if (data.purposeMarriage) purposes.push('Marriage Preparation');
    if (data.purposeSchool) purposes.push('School Requirement');
    if (data.purposeChurch) purposes.push('Church Requirement');
    if (data.purposePersonal) purposes.push('Personal Record');
    if (data.purposeOthers) purposes.push(`Others: ${data.othersText}`);
    return purposes.length > 0 ? purposes.join(', ') : 'Not specified';
  };

  // Get full names for display
  const getFullName = () => {
    return `${data?.firstName || ''} ${data?.middleName || ''} ${data?.lastName || ''}`.trim() || 'N/A';
  };

  const getFatherFullName = () => {
    return `${data?.fatherFirstName || ''} ${data?.fatherMiddleName || ''} ${data?.fatherLastName || ''}`.trim() || 'N/A';
  };

  const getMotherFullName = () => {
    return `${data?.motherFirstName || ''} ${data?.motherMiddleName || ''} ${data?.motherLastName || ''}`.trim() || 'N/A';
  };

  const getPurposeCheckboxes = () => {
    return {
      marriage: data?.purposeMarriage || false,
      school: data?.purposeSchool || false,
      church: data?.purposeChurch || false,
      personal: data?.purposePersonal || false,
      others: data?.purposeOthers ? data.othersText : ''
    };
  };

  const downloadPDF = () => {
    // Compact horizontal format - similar to preview size
    const pageWidth = 500; // Compact width
    const pageHeight = 300; // Compact height
    
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'pt',
      format: [pageWidth, pageHeight]
    });
    
    // Set margins
    const margin = 25;
    const contentWidth = pageWidth - (margin * 2);
    
    // Set font
    doc.setFont("helvetica");
    
    // Header
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    const headerText = "CONFIRMATION CERTIFICATE REQUEST FORM";
    const headerWidth = doc.getTextWidth(headerText);
    const headerX = (pageWidth - headerWidth) / 2;
    doc.text(headerText, headerX, 30);
    
    // Header line
    doc.setLineWidth(0.5);
    doc.setDrawColor(179, 112, 31); // Orange color
    doc.line(margin, 40, pageWidth - margin, 40);
    
    // Reset font for content
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setDrawColor(0, 0, 0); // Black color for lines
    
    let currentY = 60;
    const lineHeight = 30;
    const fieldSpacing = 20;
    
    // Date field
    doc.text("Date:", margin, currentY);
    const dateX = margin + doc.getTextWidth("Date: ");
    doc.line(dateX, currentY + 1, margin + 100, currentY + 1);
    doc.text(formatDate(data?.requestDate) || "", dateX + 2, currentY);
    currentY += fieldSpacing;
    
    // Full Name of Confirmation
    doc.text("Full Name of Confirmation:", margin, currentY);
    const nameX = margin + doc.getTextWidth("Full Name of Confirmation: ");
    doc.line(nameX, currentY + 1, pageWidth - margin, currentY + 1);
    doc.text(getFullName() || "", nameX + 2, currentY);
    currentY += fieldSpacing;
    
    // Father's Full Name
    doc.text("•", margin + 5, currentY);
    doc.text("Father's Full Name:", margin + 15, currentY);
    const fatherX = margin + 15 + doc.getTextWidth("Father's Full Name: ");
    doc.line(fatherX, currentY + 1, pageWidth - margin, currentY + 1);
    doc.text(getFatherFullName() || "", fatherX + 2, currentY);
    currentY += fieldSpacing;
    
    // Mother's Full Name
    doc.text("•", margin + 5, currentY);
    doc.text("Mother's Full Name:", margin + 15, currentY);
    const motherX = margin + 15 + doc.getTextWidth("Mother's Full Name: ");
    doc.line(motherX, currentY + 1, pageWidth - margin, currentY + 1);
    doc.text(getMotherFullName() || "", motherX + 2, currentY);
    currentY += fieldSpacing;
    
    // Date of Confirmation
    doc.text("•", margin + 5, currentY);
    doc.text("Date of Confirmation:", margin + 15, currentY);
    const confirmationDateX = margin + 15 + doc.getTextWidth("Date of Confirmation: ");
    doc.line(confirmationDateX, currentY + 1, margin + 120, currentY + 1);
    doc.text(formatDate(data?.dateOfConfirmation) || "", confirmationDateX + 2, currentY);
    currentY += fieldSpacing;
    
    // Place of Confirmation
    doc.text("•", margin + 5, currentY);
    doc.text("Place of Confirmation (Parish/Church):", margin + 15, currentY);
    const placeX = margin + 15 + doc.getTextWidth("Place of Confirmation (Parish/Church): ");
    doc.line(placeX, currentY + 1, pageWidth - margin, currentY + 1);
    doc.text(data?.placeOfConfirmation || "", placeX + 2, currentY);
    currentY += fieldSpacing;
    
    // Name of Priest
    doc.text("•", margin + 5, currentY);
    doc.text("Name of Priest/Minister (if known):", margin + 15, currentY);
    const priestX = margin + 15 + doc.getTextWidth("Name of Priest/Minister (if known): ");
    doc.line(priestX, currentY + 1, pageWidth - margin, currentY + 1);
    doc.text(data?.priestName || "", priestX + 2, currentY);
    currentY += fieldSpacing + 5;
    
    // Purpose of Request section
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("Purpose of Request", margin, currentY);
    currentY += 12;
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    
    const purposes = getPurposeCheckboxes();
    const checkboxSize = 8;
    
    // Marriage Preparation checkbox
    doc.rect(margin + 5, currentY - 6, checkboxSize, checkboxSize, purposes.marriage ? 'F' : 'S');
    if (purposes.marriage) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6);
      doc.text("✓", margin + 7.5, currentY - 1);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
    }
    doc.text("Marriage Preparation", margin + 20, currentY);
    currentY += 12;
    
    // School Requirement checkbox
    doc.rect(margin + 5, currentY - 6, checkboxSize, checkboxSize, purposes.school ? 'F' : 'S');
    if (purposes.school) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6);
      doc.text("✓", margin + 7.5, currentY - 1);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
    }
    doc.text("School Requirement", margin + 20, currentY);
    currentY += 12;
    
    // Church Requirement checkbox
    doc.rect(margin + 5, currentY - 6, checkboxSize, checkboxSize, purposes.church ? 'F' : 'S');
    if (purposes.church) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6);
      doc.text("✓", margin + 7.5, currentY - 1);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
    }
    doc.text("Church Requirement", margin + 20, currentY);
    currentY += 12;
    
    // Personal Record checkbox
    doc.rect(margin + 5, currentY - 6, checkboxSize, checkboxSize, purposes.personal ? 'F' : 'S');
    if (purposes.personal) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6);
      doc.text("✓", margin + 7.5, currentY - 1);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
    }
    doc.text("Personal Record", margin + 20, currentY);
    currentY += 16;
    
    // Others field
    doc.text("Others:", margin, currentY);
    const othersX = margin + doc.getTextWidth("Others: ");
    doc.line(othersX, currentY + 1, pageWidth - margin, currentY + 1);
    if (purposes.others) {
      doc.text(purposes.others, othersX + 2, currentY);
    }
    
    // Save the PDF
    const fileName = `Confirmation_Certificate_Request_Form_${data?.reqconfirmationID || 'Unknown'}.pdf`;
    doc.save(fileName);
    
    // Close modal after download
    setShowPreviewModal(false);
  };

  const showPreview = () => {
    setShowPreviewModal(true);
  };

  const closePreview = () => {
    setShowPreviewModal(false);
  };

  const handleBack = () => {
    navigate("/client-request-confirmation-certificate", { 
      state: { clientID: clientID } 
    });
    console.log('Navigate back');
  };

  // Show error if no IDs provided
  if (!clientID || !reqconfirmationID) {
    return (
      <div className="cconfv-container">
        <div className="cconfv-header">
          <div className="cconfv-left-section">
            <button className="cconfv-back-button" onClick={() => navigate(-1)}>
              <AiOutlineArrowLeft className="cconfv-back-icon" /> Back
            </button>
          </div>
        </div>
        <h1 className="cconfv-title">ERROR</h1>
        <div className="cconfv-form-container">
          <div className="cconfv-error-message">
            <p>Error: Client ID and Request ID are required to view this confirmation certificate request.</p>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="cconfv-container">
        <div className="cconfv-header">
          <div className="cconfv-left-section">
            <button className="cconfv-back-button" onClick={handleBack}>
              <AiOutlineArrowLeft className="cconfv-back-icon" /> Back
            </button>
          </div>
        </div>
        <h1 className="cconfv-title">CONFIRMATION CERTIFICATE REQUEST</h1>
        <div className="cconfv-form-container">
          <div className="cconfv-loading">
            <p>Loading confirmation certificate details...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="cconfv-container">
        <div className="cconfv-header">
          <div className="cconfv-left-section">
            <button className="cconfv-back-button" onClick={handleBack}>
              <AiOutlineArrowLeft className="cconfv-back-icon" /> Back
            </button>
          </div>
        </div>
        <h1 className="cconfv-title">ERROR</h1>
        <div className="cconfv-form-container">
          <div className="cconfv-error-message">
            <p>Error: {error}</p>
            <button onClick={fetchConfirmationDetails} className="cconfv-retry-btn">
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show data if loaded successfully
  return (
    <div className="cconfv-container">
      {/* Header */}
      <div className="cconfv-header">
        <div className="cconfv-left-section">
          <button className="cconfv-back-button" onClick={handleBack}>
            <AiOutlineArrowLeft className="cconfv-back-icon" /> Back
          </button>
        </div>
        <div className="cconfv-right-section">
          <div className="cconfv-date-field">
            <label>Request Date:</label>
            <span className="cconfv-date-display">{formatDate(data?.requestDate)}</span>
          </div>
        </div>
      </div>
      
      <h1 className="cconfv-title">CONFIRMATION CERTIFICATE REQUEST</h1>
      
      <div className="cconfv-form-container">
        {/* Personal Information Section */}
        <div className="cconfv-section">
          <h3 className="cconfv-section-title">PERSONAL INFORMATION</h3>
          <div className="cconfv-row">
            <div className="cconfv-field">
              <label>First Name</label>
              <div className="cconfv-display-value">{data?.firstName || 'N/A'}</div>
            </div>
            <div className="cconfv-field">
              <label>Middle Name</label>
              <div className="cconfv-display-value">{data?.middleName || 'N/A'}</div>
            </div>
            <div className="cconfv-field">
              <label>Last Name</label>
              <div className="cconfv-display-value">{data?.lastName || 'N/A'}</div>
            </div>
          </div>
        </div>

        {/* Father Information Section */}
        <div className="cconfv-section">
          <h3 className="cconfv-section-title">Father Information</h3>
          <div className="cconfv-row">
            <div className="cconfv-field">
              <label>Father's First Name</label>
              <div className="cconfv-display-value">{data?.fatherFirstName || 'N/A'}</div>
            </div>
            <div className="cconfv-field">
              <label>Father's Middle Name</label>
              <div className="cconfv-display-value">{data?.fatherMiddleName || 'N/A'}</div>
            </div>
            <div className="cconfv-field">
              <label>Father's Last Name</label>
              <div className="cconfv-display-value">{data?.fatherLastName || 'N/A'}</div>
            </div>
          </div>
        </div>

        {/* Mother Information Section */}
        <div className="cconfv-section">
          <h3 className="cconfv-section-title">Mother Information</h3>
          <div className="cconfv-row">
            <div className="cconfv-field">
              <label>Mother's First Name</label>
              <div className="cconfv-display-value">{data?.motherFirstName || 'N/A'}</div>
            </div>
            <div className="cconfv-field">
              <label>Mother's Middle Name</label>
              <div className="cconfv-display-value">{data?.motherMiddleName || 'N/A'}</div>
            </div>
            <div className="cconfv-field">
              <label>Mother's Last Name</label>
              <div className="cconfv-display-value">{data?.motherLastName || 'N/A'}</div>
            </div>
          </div>
        </div>

        {/* Confirmation Details Section */}
        <div className="cconfv-section">
          <div className="cconfv-row">
            <div className="cconfv-field cconfv-field-wide">
              <label>Place of Confirmation (Parish/Church)</label>
              <div className="cconfv-display-value">{data?.placeOfConfirmation || 'N/A'}</div>
            </div>
          </div>
          <div className="cconfv-row">
            <div className="cconfv-field">
              <label>Date of Confirmation</label>
              <div className="cconfv-display-value">{formatDate(data?.dateOfConfirmation)}</div>
            </div>
            <div className="cconfv-field">
              <label>Name of Priest/Minister (if known)</label>
              <div className="cconfv-display-value">{data?.priestName || 'N/A'}</div>
            </div>
          </div>
        </div>

        {/* Purpose of Request Section */}
        <div className="cconfv-section">
          <h3 className="cconfv-section-title">PURPOSE OF REQUEST</h3>
          <div className="cconfv-purpose-display">
            <div className="cconfv-display-value">{getPurposes()}</div>
          </div>
        </div>

        {/* Download Button */}
        <div className="cconfv-button-container">
          <button className="cconfv-download-btn" onClick={showPreview}>
            <AiOutlineDownload className="cconfv-download-icon" />
            Preview & Download PDF Form
          </button>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreviewModal && (
        <div className="cconfv-modal-overlay" onClick={closePreview}>
          <div className="cconfv-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="cconfv-modal-header">
              <h2>PDF Form Preview</h2>
              <button className="cconfv-modal-close" onClick={closePreview}>×</button>
            </div>
            
            <div className="cconfv-form-preview">
              <div className="cconfv-preview-paper">
                {/* Form Header */}
                <div className="cconfv-preview-header">
                  <h1>CONFIRMATION CERTIFICATE REQUEST FORM</h1>
                  <div className="cconfv-preview-line"></div>
                </div>
                
                {/* Date Field */}
                <div className="cconfv-preview-field">
                  <span className="cconfv-preview-label">Date:</span>
                  <span className="cconfv-preview-underline">{formatDate(data?.requestDate)}</span>
                </div>
                
                {/* Full Name Field */}
                <div className="cconfv-preview-field">
                  <span className="cconfv-preview-label">Full Name of Confirmation:</span>
                  <span className="cconfv-preview-underline-long">{getFullName()}</span>
                </div>
                
                {/* Parent Information */}
                <div className="cconfv-preview-field">
                  <span className="cconfv-preview-bullet">•</span>
                  <span className="cconfv-preview-label">Father's Full Name:</span>
                  <span className="cconfv-preview-underline-long">{getFatherFullName()}</span>
                </div>
                
                <div className="cconfv-preview-field">
                  <span className="cconfv-preview-bullet">•</span>
                  <span className="cconfv-preview-label">Mother's Full Name:</span>
                  <span className="cconfv-preview-underline-long">{getMotherFullName()}</span>
                </div>
                
                {/* Confirmation Details */}
                <div className="cconfv-preview-field">
                  <span className="cconfv-preview-bullet">•</span>
                  <span className="cconfv-preview-label">Date of Confirmation:</span>
                  <span className="cconfv-preview-underline">{formatDate(data?.dateOfConfirmation)}</span>
                </div>
                
                <div className="cconfv-preview-field">
                  <span className="cconfv-preview-bullet">•</span>
                  <span className="cconfv-preview-label">Place of Confirmation (Parish/Church):</span>
                  <span className="cconfv-preview-underline-long">{data?.placeOfConfirmation || 'N/A'}</span>
                </div>
                
                <div className="cconfv-preview-field">
                  <span className="cconfv-preview-bullet">•</span>
                  <span className="cconfv-preview-label">Name of Priest/Minister (if known):</span>
                  <span className="cconfv-preview-underline-long">{data?.priestName || 'N/A'}</span>
                </div>
                
                {/* Purpose Section */}
                <div className="cconfv-preview-purpose">
                  <h3>Purpose of Request</h3>
                  
                  <div className="cconfv-preview-checkbox-group">
                    <div className="cconfv-preview-checkbox">
                      <span className={`cconfv-checkbox ${getPurposeCheckboxes().marriage ? 'checked' : ''}`}>
                        {getPurposeCheckboxes().marriage ? '✓' : ''}
                      </span>
                      <span>Marriage Preparation</span>
                    </div>
                    
                    <div className="cconfv-preview-checkbox">
                      <span className={`cconfv-checkbox ${getPurposeCheckboxes().school ? 'checked' : ''}`}>
                        {getPurposeCheckboxes().school ? '✓' : ''}
                      </span>
                      <span>School Requirement</span>
                    </div>
                    
                    <div className="cconfv-preview-checkbox">
                      <span className={`cconfv-checkbox ${getPurposeCheckboxes().church ? 'checked' : ''}`}>
                        {getPurposeCheckboxes().church ? '✓' : ''}
                      </span>
                      <span>Church Requirement</span>
                    </div>
                    
                    <div className="cconfv-preview-checkbox">
                      <span className={`cconfv-checkbox ${getPurposeCheckboxes().personal ? 'checked' : ''}`}>
                        {getPurposeCheckboxes().personal ? '✓' : ''}
                      </span>
                      <span>Personal Record</span>
                    </div>
                  </div>
                  
                  <div className="cconfv-preview-field">
                    <span className="cconfv-preview-label">Others:</span>
                    <span className="cconfv-preview-underline-long">{getPurposeCheckboxes().others}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="cconfv-modal-actions">
              <button className="cconfv-modal-cancel" onClick={closePreview}>
                Cancel
              </button>
              <button className="cconfv-modal-download" onClick={downloadPDF}>
                <AiOutlineDownload className="cconfv-download-icon" />
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientConfirmationCertificateView;