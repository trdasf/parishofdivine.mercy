import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AiOutlineArrowLeft, AiOutlineDownload } from "react-icons/ai";
import jsPDF from 'jspdf';
import "./ClientCommunionCertificateView.css";

const ClientCommunionCertificateView = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { clientID, reqcommunionID } = location.state || {};

  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Fetch communion request details
  const fetchCommunionDetails = async () => {
    if (!clientID || !reqcommunionID) {
      setError("Client ID and Request ID are required");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`http://parishofdivinemercy.com/backend/get_communion_request_details.php?clientID=${clientID}&reqcommunionID=${reqcommunionID}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setData(result.data);
      } else {
        throw new Error(result.message || 'Failed to fetch communion request details');
      }
    } catch (error) {
      console.error('Error fetching communion details:', error);
      setError(error.message || 'Failed to load communion certificate details');
    } finally {
      setIsLoading(false);
    }
  };

  // Load data when component mounts
  useEffect(() => {
    fetchCommunionDetails();
  }, [clientID, reqcommunionID]);

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
    if (data.purposeSchool) purposes.push('School Requirement');
    if (data.purposeConfirmation) purposes.push('Confirmation Preparation');
    if (data.purposeMarriage) purposes.push('Marriage Preparation');
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
      school: data?.purposeSchool || false,
      confirmation: data?.purposeConfirmation || false,
      marriage: data?.purposeMarriage || false,
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
    const headerText = "FIRST HOLY COMMUNION CERTIFICATE REQUEST FORM";
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
    
    // Full Name of Communion
    doc.text("Full Name of Communion:", margin, currentY);
    const nameX = margin + doc.getTextWidth("Full Name of Communion: ");
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
    
    // Date of Communion
    doc.text("•", margin + 5, currentY);
    doc.text("Date of First Holy Communion:", margin + 15, currentY);
    const communionDateX = margin + 15 + doc.getTextWidth("Date of First Holy Communion: ");
    doc.line(communionDateX, currentY + 1, margin + 140, currentY + 1);
    doc.text(formatDate(data?.dateOfCommunion) || "", communionDateX + 2, currentY);
    currentY += fieldSpacing;
    
    // Place of Communion
    doc.text("•", margin + 5, currentY);
    doc.text("Place of Communion (Parish/Church):", margin + 15, currentY);
    const placeX = margin + 15 + doc.getTextWidth("Place of Communion (Parish/Church): ");
    doc.line(placeX, currentY + 1, pageWidth - margin, currentY + 1);
    doc.text(data?.placeOfCommunion || "", placeX + 2, currentY);
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
    
    // Confirmation Preparation checkbox
    doc.rect(margin + 5, currentY - 6, checkboxSize, checkboxSize, purposes.confirmation ? 'F' : 'S');
    if (purposes.confirmation) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6);
      doc.text("✓", margin + 7.5, currentY - 1);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
    }
    doc.text("Confirmation Preparation", margin + 20, currentY);
    currentY += 12;
    
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
    const fileName = `Communion_Certificate_Request_Form_${data?.reqcommunionID || 'Unknown'}.pdf`;
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
    navigate("/client-request-communion-certificate", { 
      state: { clientID: clientID } 
    });
    console.log('Navigate back');
  };

  // Show error if no IDs provided
  if (!clientID || !reqcommunionID) {
    return (
      <div className="cccv-container">
        <div className="cccv-header">
          <div className="cccv-left-section">
            <button className="cccv-back-button" onClick={() => navigate(-1)}>
              <AiOutlineArrowLeft className="cccv-back-icon" /> Back
            </button>
          </div>
        </div>
        <h1 className="cccv-title">ERROR</h1>
        <div className="cccv-form-container">
          <div className="cccv-error-message">
            <p>Error: Client ID and Request ID are required to view this communion certificate request.</p>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="cccv-container">
        <div className="cccv-header">
          <div className="cccv-left-section">
            <button className="cccv-back-button" onClick={handleBack}>
              <AiOutlineArrowLeft className="cccv-back-icon" /> Back
            </button>
          </div>
        </div>
        <h1 className="cccv-title">FIRST HOLY COMMUNION CERTIFICATE REQUEST</h1>
        <div className="cccv-form-container">
          <div className="cccv-loading">
            <p>Loading communion certificate details...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="cccv-container">
        <div className="cccv-header">
          <div className="cccv-left-section">
            <button className="cccv-back-button" onClick={handleBack}>
              <AiOutlineArrowLeft className="cccv-back-icon" /> Back
            </button>
          </div>
        </div>
        <h1 className="cccv-title">ERROR</h1>
        <div className="cccv-form-container">
          <div className="cccv-error-message">
            <p>Error: {error}</p>
            <button onClick={fetchCommunionDetails} className="cccv-retry-btn">
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show data if loaded successfully
  return (
    <div className="cccv-container">
      {/* Header */}
      <div className="cccv-header">
        <div className="cccv-left-section">
          <button className="cccv-back-button" onClick={handleBack}>
            <AiOutlineArrowLeft className="cccv-back-icon" /> Back
          </button>
        </div>
        <div className="cccv-right-section">
          <div className="cccv-date-field">
            <label>Request Date:</label>
            <span className="cccv-date-display">{formatDate(data?.requestDate)}</span>
          </div>
        </div>
      </div>
      
      <h1 className="cccv-title">FIRST HOLY COMMUNION CERTIFICATE REQUEST</h1>
      
      <div className="cccv-form-container">
        {/* Personal Information Section */}
        <div className="cccv-section">
          <h3 className="cccv-section-title">PERSONAL INFORMATION</h3>
          <div className="cccv-row">
            <div className="cccv-field">
              <label>First Name</label>
              <div className="cccv-display-value">{data?.firstName || 'N/A'}</div>
            </div>
            <div className="cccv-field">
              <label>Middle Name</label>
              <div className="cccv-display-value">{data?.middleName || 'N/A'}</div>
            </div>
            <div className="cccv-field">
              <label>Last Name</label>
              <div className="cccv-display-value">{data?.lastName || 'N/A'}</div>
            </div>
          </div>
        </div>

        {/* Father Information Section */}
        <div className="cccv-section">
          <h3 className="cccv-section-title">Father Information</h3>
          <div className="cccv-row">
            <div className="cccv-field">
              <label>Father's First Name</label>
              <div className="cccv-display-value">{data?.fatherFirstName || 'N/A'}</div>
            </div>
            <div className="cccv-field">
              <label>Father's Middle Name</label>
              <div className="cccv-display-value">{data?.fatherMiddleName || 'N/A'}</div>
            </div>
            <div className="cccv-field">
              <label>Father's Last Name</label>
              <div className="cccv-display-value">{data?.fatherLastName || 'N/A'}</div>
            </div>
          </div>
        </div>

        {/* Mother Information Section */}
        <div className="cccv-section">
          <h3 className="cccv-section-title">Mother Information</h3>
          <div className="cccv-row">
            <div className="cccv-field">
              <label>Mother's First Name</label>
              <div className="cccv-display-value">{data?.motherFirstName || 'N/A'}</div>
            </div>
            <div className="cccv-field">
              <label>Mother's Middle Name</label>
              <div className="cccv-display-value">{data?.motherMiddleName || 'N/A'}</div>
            </div>
            <div className="cccv-field">
              <label>Mother's Last Name</label>
              <div className="cccv-display-value">{data?.motherLastName || 'N/A'}</div>
            </div>
          </div>
        </div>

        {/* Communion Details Section */}
        <div className="cccv-section">
          <div className="cccv-row">
            <div className="cccv-field cccv-field-wide">
              <label>Place of Communion (Parish/Church)</label>
              <div className="cccv-display-value">{data?.placeOfCommunion || 'N/A'}</div>
            </div>
          </div>
          <div className="cccv-row">
            <div className="cccv-field">
              <label>Date of First Holy Communion</label>
              <div className="cccv-display-value">{formatDate(data?.dateOfCommunion)}</div>
            </div>
            <div className="cccv-field">
              <label>Name of Priest/ Minister (if known)</label>
              <div className="cccv-display-value">{data?.priestName || 'N/A'}</div>
            </div>
          </div>
        </div>

        {/* Purpose of Request Section */}
        <div className="cccv-section">
          <h3 className="cccv-section-title">PURPOSE OF REQUEST</h3>
          <div className="cccv-purpose-display">
            <div className="cccv-display-value">{getPurposes()}</div>
          </div>
        </div>

        {/* Download Button */}
        <div className="cccv-button-container">
          <button className="cccv-download-btn" onClick={showPreview}>
            <AiOutlineDownload className="cccv-download-icon" />
            Preview & Download PDF Form
          </button>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreviewModal && (
        <div className="cccv-modal-overlay" onClick={closePreview}>
          <div className="cccv-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="cccv-modal-header">
              <h2>PDF Form Preview</h2>
              <button className="cccv-modal-close" onClick={closePreview}>×</button>
            </div>
            
            <div className="cccv-form-preview">
              <div className="cccv-preview-paper">
                {/* Form Header */}
                <div className="cccv-preview-header">
                  <h1>FIRST HOLY COMMUNION CERTIFICATE REQUEST FORM</h1>
                  <div className="cccv-preview-line"></div>
                </div>
                
                {/* Date Field */}
                <div className="cccv-preview-field">
                  <span className="cccv-preview-label">Date:</span>
                  <span className="cccv-preview-underline">{formatDate(data?.requestDate)}</span>
                </div>
                
                {/* Full Name Field */}
                <div className="cccv-preview-field">
                  <span className="cccv-preview-label">Full Name of Communion:</span>
                  <span className="cccv-preview-underline-long">{getFullName()}</span>
                </div>
                
                {/* Parent Information */}
                <div className="cccv-preview-field">
                  <span className="cccv-preview-bullet">•</span>
                  <span className="cccv-preview-label">Father's Full Name:</span>
                  <span className="cccv-preview-underline-long">{getFatherFullName()}</span>
                </div>
                
                <div className="cccv-preview-field">
                  <span className="cccv-preview-bullet">•</span>
                  <span className="cccv-preview-label">Mother's Full Name:</span>
                  <span className="cccv-preview-underline-long">{getMotherFullName()}</span>
                </div>
                
                {/* Communion Details */}
                <div className="cccv-preview-field">
                  <span className="cccv-preview-bullet">•</span>
                  <span className="cccv-preview-label">Date of First Holy Communion:</span>
                  <span className="cccv-preview-underline">{formatDate(data?.dateOfCommunion)}</span>
                </div>
                
                <div className="cccv-preview-field">
                  <span className="cccv-preview-bullet">•</span>
                  <span className="cccv-preview-label">Place of Communion (Parish/Church):</span>
                  <span className="cccv-preview-underline-long">{data?.placeOfCommunion || 'N/A'}</span>
                </div>
                
                <div className="cccv-preview-field">
                  <span className="cccv-preview-bullet">•</span>
                  <span className="cccv-preview-label">Name of Priest/Minister (if known):</span>
                  <span className="cccv-preview-underline-long">{data?.priestName || 'N/A'}</span>
                </div>
                
                {/* Purpose Section */}
                <div className="cccv-preview-purpose">
                  <h3>Purpose of Request</h3>
                  
                  <div className="cccv-preview-checkbox-group">
                    <div className="cccv-preview-checkbox">
                      <span className={`cccv-checkbox ${getPurposeCheckboxes().school ? 'checked' : ''}`}>
                        {getPurposeCheckboxes().school ? '✓' : ''}
                      </span>
                      <span>School Requirement</span>
                    </div>
                    
                    <div className="cccv-preview-checkbox">
                      <span className={`cccv-checkbox ${getPurposeCheckboxes().confirmation ? 'checked' : ''}`}>
                        {getPurposeCheckboxes().confirmation ? '✓' : ''}
                      </span>
                      <span>Confirmation Preparation</span>
                    </div>
                    
                    <div className="cccv-preview-checkbox">
                      <span className={`cccv-checkbox ${getPurposeCheckboxes().marriage ? 'checked' : ''}`}>
                        {getPurposeCheckboxes().marriage ? '✓' : ''}
                      </span>
                      <span>Marriage Preparation</span>
                    </div>
                    
                    <div className="cccv-preview-checkbox">
                      <span className={`cccv-checkbox ${getPurposeCheckboxes().personal ? 'checked' : ''}`}>
                        {getPurposeCheckboxes().personal ? '✓' : ''}
                      </span>
                      <span>Personal Record</span>
                    </div>
                  </div>
                  
                  <div className="cccv-preview-field">
                    <span className="cccv-preview-label">Others:</span>
                    <span className="cccv-preview-underline-long">{getPurposeCheckboxes().others}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="cccv-modal-actions">
              <button className="cccv-modal-cancel" onClick={closePreview}>
                Cancel
              </button>
              <button className="cccv-modal-download" onClick={downloadPDF}>
                <AiOutlineDownload className="cccv-download-icon" />
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientCommunionCertificateView;