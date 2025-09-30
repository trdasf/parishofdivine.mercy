import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AiOutlineArrowLeft, AiOutlineDownload } from "react-icons/ai";
import jsPDF from 'jspdf';
import "./ClientMarriageCertificateView.css";

const ClientMarriageCertificateView = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { clientID, reqmarriageID } = location.state || {};
  
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Fetch marriage certificate request details
  useEffect(() => {
    if (reqmarriageID && clientID) {
      fetchMarriageRequestDetails();
    } else {
      setError("Missing request ID or client ID");
    }
  }, [reqmarriageID, clientID]);

  const fetchMarriageRequestDetails = async () => {
    setIsLoading(true);
    setError("");
    
    try {
      const url = `http://parishofdivinemercy.com/backend/get_marriage_request_details.php?reqmarriageID=${reqmarriageID}&clientID=${clientID}`;
        
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
      } else {
        throw new Error(result.message || 'Failed to fetch marriage certificate details');
      }
    } catch (error) {
      console.error('Error fetching marriage request details:', error);
      setError('Failed to load marriage certificate details');
    } finally {
      setIsLoading(false);
    }
  };

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
    if (data.purposeCivil) purposes.push('Civil Requirement');
    if (data.purposeChurch) purposes.push('Church Requirement (e.g., renewal, canonical processing)');
    if (data.purposePersonal) purposes.push('Personal Record');
    if (data.purposeOthers) purposes.push(`Others: ${data.othersText}`);
    return purposes.length > 0 ? purposes.join(', ') : 'Not specified';
  };

  // Get full names for display
  const getGroomFullName = () => {
    return `${data?.groomFirstName || ''} ${data?.groomMiddleName || ''} ${data?.groomLastName || ''}`.trim() || 'N/A';
  };

  const getBrideFullName = () => {
    return `${data?.brideFirstName || ''} ${data?.brideMiddleName || ''} ${data?.brideLastName || ''}`.trim() || 'N/A';
  };

  const getPurposeCheckboxes = () => {
    return {
      civil: data?.purposeCivil || false,
      church: data?.purposeChurch || false,
      personal: data?.purposePersonal || false,
      others: data?.purposeOthers ? data.othersText || '' : ''
    };
  };

  const downloadPDF = () => {
    // Compact horizontal format - similar to preview size
    const pageWidth = 500; // Compact width
    const pageHeight = 290; // Compact height for marriage form
    
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
    const headerText = "MARRIAGE CERTIFICATE REQUEST FORM";
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
    
    // Groom's Full Name
    doc.text("Groom's Full Name:", margin, currentY);
    const groomX = margin + doc.getTextWidth("Groom's Full Name: ");
    doc.line(groomX, currentY + 1, pageWidth - margin, currentY + 1);
    doc.text(getGroomFullName() || "", groomX + 2, currentY);
    currentY += fieldSpacing;
    
    // Bride's Full Name (Maiden Name)
    doc.text("Bride's Full Name (Maiden Name):", margin, currentY);
    const brideX = margin + doc.getTextWidth("Bride's Full Name (Maiden Name): ");
    doc.line(brideX, currentY + 1, pageWidth - margin, currentY + 1);
    doc.text(getBrideFullName() || "", brideX + 2, currentY);
    currentY += fieldSpacing;
    
    // Date of Marriage
    doc.text("•", margin + 5, currentY);
    doc.text("Date of Marriage:", margin + 15, currentY);
    const marriageDateX = margin + 15 + doc.getTextWidth("Date of Marriage: ");
    doc.line(marriageDateX, currentY + 1, margin + 120, currentY + 1);
    doc.text(formatDate(data?.dateOfMarriage) || "", marriageDateX + 2, currentY);
    currentY += fieldSpacing;
    
    // Place of Marriage
    doc.text("•", margin + 5, currentY);
    doc.text("Place of Marriage:", margin + 15, currentY);
    const placeX = margin + 15 + doc.getTextWidth("Place of Marriage: ");
    doc.line(placeX, currentY + 1, pageWidth - margin, currentY + 1);
    doc.text(data?.placeOfMarriage || "", placeX + 2, currentY);
    currentY += fieldSpacing;
    
    // Name of Officiating Priest
    doc.text("•", margin + 5, currentY);
    doc.text("Name of Officiating Priest (if known):", margin + 15, currentY);
    const priestX = margin + 15 + doc.getTextWidth("Name of Officiating Priest (if known): ");
    doc.line(priestX, currentY + 1, pageWidth - margin, currentY + 1);
    doc.text(data?.officiatingPriest || "", priestX + 2, currentY);
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
    
    // Civil Requirement checkbox
    doc.rect(margin + 5, currentY - 6, checkboxSize, checkboxSize, purposes.civil ? 'F' : 'S');
    if (purposes.civil) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6);
      doc.text("✓", margin + 7.5, currentY - 1);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
    }
    doc.text("Civil Requirement", margin + 20, currentY);
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
    doc.text("Church Requirement (e.g., renewal, canonical processing)", margin + 20, currentY);
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
    currentY += fieldSpacing;
    
    // Others field
    doc.text("Others:", margin, currentY);
    const othersX = margin + doc.getTextWidth("Others: ");
    doc.line(othersX, currentY + 1, pageWidth - margin, currentY + 1);
    if (purposes.others) {
      doc.text(purposes.others, othersX + 2, currentY);
    }
    
    // Save the PDF
    const fileName = `Marriage_Certificate_Request_Form_${data?.reqmarriageID || 'Unknown'}.pdf`;
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
    // Pass clientID when navigating back
    navigate("/client-request-marriage-certificate", { 
      state: { clientID: clientID } 
    });
  };

  if (isLoading) {
    return (
      <div className="cmcv-container">
        <div className="cmcv-loading">Loading marriage certificate details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="cmcv-container">
        <div className="cmcv-error">
          {error}
          <button onClick={fetchMarriageRequestDetails} className="cmcv-retry-btn">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="cmcv-container">
        <div className="cmcv-error">No data available</div>
      </div>
    );
  }

  return (
    <div className="cmcv-container">
      {/* Header */}
      <div className="cmcv-header">
        <div className="cmcv-left-section">
          <button className="cmcv-back-button" onClick={handleBack}>
            <AiOutlineArrowLeft className="cmcv-back-icon" /> Back
          </button>
        </div>
        <div className="cmcv-right-section">
          <div className="cmcv-date-field">
            <label>Request Date:</label>
            <span className="cmcv-date-display">{formatDate(data.requestDate)}</span>
          </div>
        </div>
      </div>
      
      <h1 className="cmcv-title">MARRIAGE CERTIFICATE REQUEST</h1>
      <div className="cmcv-request-info">
        <p>Request ID: #{data.reqmarriageID}</p>
      </div>
      
      <div className="cmcv-form-container">
        {/* Full Name of Groom Section */}
        <div className="cmcv-section">
          <h3 className="cmcv-section-title">FULL NAME OF GROOM</h3>
          <div className="cmcv-row">
            <div className="cmcv-field">
              <label>First Name</label>
              <div className="cmcv-display-value">{data.groomFirstName || 'N/A'}</div>
            </div>
            <div className="cmcv-field">
              <label>Middle Name</label>
              <div className="cmcv-display-value">{data.groomMiddleName || 'N/A'}</div>
            </div>
            <div className="cmcv-field">
              <label>Last Name</label>
              <div className="cmcv-display-value">{data.groomLastName || 'N/A'}</div>
            </div>
          </div>
        </div>

        {/* Full Name of Bride Section */}
        <div className="cmcv-section">
          <h3 className="cmcv-section-title">FULL NAME OF BRIDE (MAIDEN NAME)</h3>
          <div className="cmcv-row">
            <div className="cmcv-field">
              <label>First Name</label>
              <div className="cmcv-display-value">{data.brideFirstName || 'N/A'}</div>
            </div>
            <div className="cmcv-field">
              <label>Middle Name</label>
              <div className="cmcv-display-value">{data.brideMiddleName || 'N/A'}</div>
            </div>
            <div className="cmcv-field">
              <label>Last Name</label>
              <div className="cmcv-display-value">{data.brideLastName || 'N/A'}</div>
            </div>
          </div>
        </div>

        {/* Marriage Details Section */}
        <div className="cmcv-section">
          <div className="cmcv-row">
            <div className="cmcv-field cmcv-field-wide">
              <label>Place of Marriage</label>
              <div className="cmcv-display-value">{data.placeOfMarriage || 'N/A'}</div>
            </div>
          </div>
          <div className="cmcv-row">
            <div className="cmcv-field">
              <label>Date of Marriage</label>
              <div className="cmcv-display-value">{formatDate(data.dateOfMarriage)}</div>
            </div>
            <div className="cmcv-field">
              <label>Name of Officiating Priest (if known)</label>
              <div className="cmcv-display-value">{data.officiatingPriest || 'N/A'}</div>
            </div>
          </div>
        </div>

        {/* Purpose of Request Section */}
        <div className="cmcv-section">
          <h3 className="cmcv-section-title">PURPOSE OF REQUEST</h3>
          <div className="cmcv-purpose-display">
            <div className="cmcv-display-value">{getPurposes()}</div>
          </div>
        </div>

        {/* Download Button */}
        <div className="cmcv-button-container">
          <button className="cmcv-download-btn" onClick={showPreview}>
            <AiOutlineDownload className="cmcv-download-icon" />
            Preview & Download PDF Form
          </button>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreviewModal && (
        <div className="cmcv-modal-overlay" onClick={closePreview}>
          <div className="cmcv-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="cmcv-modal-header">
              <h2>PDF Form Preview</h2>
              <button className="cmcv-modal-close" onClick={closePreview}>×</button>
            </div>
            
            <div className="cmcv-form-preview">
              <div className="cmcv-preview-paper">
                {/* Form Header */}
                <div className="cmcv-preview-header">
                  <h1>MARRIAGE CERTIFICATE REQUEST FORM</h1>
                  <div className="cmcv-preview-line"></div>
                </div>
                
                {/* Date Field */}
                <div className="cmcv-preview-field">
                  <span className="cmcv-preview-label">Date:</span>
                  <span className="cmcv-preview-underline">{formatDate(data?.requestDate)}</span>
                </div>
                
                {/* Groom's Name Field */}
                <div className="cmcv-preview-field">
                  <span className="cmcv-preview-label">Groom's Full Name:</span>
                  <span className="cmcv-preview-underline-long">{getGroomFullName()}</span>
                </div>
                
                {/* Bride's Name Field */}
                <div className="cmcv-preview-field">
                  <span className="cmcv-preview-label">Bride's Full Name (Maiden Name):</span>
                  <span className="cmcv-preview-underline-long">{getBrideFullName()}</span>
                </div>
                
                {/* Marriage Details */}
                <div className="cmcv-preview-field">
                  <span className="cmcv-preview-bullet">•</span>
                  <span className="cmcv-preview-label">Date of Marriage:</span>
                  <span className="cmcv-preview-underline">{formatDate(data?.dateOfMarriage)}</span>
                </div>
                
                <div className="cmcv-preview-field">
                  <span className="cmcv-preview-bullet">•</span>
                  <span className="cmcv-preview-label">Place of Marriage:</span>
                  <span className="cmcv-preview-underline-long">{data?.placeOfMarriage || 'N/A'}</span>
                </div>
                
                <div className="cmcv-preview-field">
                  <span className="cmcv-preview-bullet">•</span>
                  <span className="cmcv-preview-label">Name of Officiating Priest (if known):</span>
                  <span className="cmcv-preview-underline-long">{data?.officiatingPriest || 'N/A'}</span>
                </div>
                
                {/* Purpose Section */}
                <div className="cmcv-preview-purpose">
                  <h3>Purpose of Request</h3>
                  
                  <div className="cmcv-preview-checkbox-group">
                    <div className="cmcv-preview-checkbox">
                      <span className={`cmcv-checkbox ${getPurposeCheckboxes().civil ? 'checked' : ''}`}>
                        {getPurposeCheckboxes().civil ? '✓' : ''}
                      </span>
                      <span>Civil Requirement</span>
                    </div>
                    
                    <div className="cmcv-preview-checkbox">
                      <span className={`cmcv-checkbox ${getPurposeCheckboxes().church ? 'checked' : ''}`}>
                        {getPurposeCheckboxes().church ? '✓' : ''}
                      </span>
                      <span>Church Requirement (e.g., renewal, canonical processing)</span>
                    </div>
                    
                    <div className="cmcv-preview-checkbox">
                      <span className={`cmcv-checkbox ${getPurposeCheckboxes().personal ? 'checked' : ''}`}>
                        {getPurposeCheckboxes().personal ? '✓' : ''}
                      </span>
                      <span>Personal Record</span>
                    </div>
                  </div>
                  
                  <div className="cmcv-preview-field">
                    <span className="cmcv-preview-label">Others:</span>
                    <span className="cmcv-preview-underline-long">{getPurposeCheckboxes().others}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="cmcv-modal-actions">
              <button className="cmcv-modal-cancel" onClick={closePreview}>
                Cancel
              </button>
              <button className="cmcv-modal-download" onClick={downloadPDF}>
                <AiOutlineDownload className="cmcv-download-icon" />
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientMarriageCertificateView;