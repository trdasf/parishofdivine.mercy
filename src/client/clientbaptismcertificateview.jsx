import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AiOutlineArrowLeft, AiOutlineDownload } from "react-icons/ai";
import jsPDF from 'jspdf';
import "./ClientBaptismCertificateView.css";

const ClientBaptismCertificateView = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get parameters from location state or URL params
  const { clientID, reqbaptismID } = location.state || {};
  
  // State management
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Fetch baptism request details
  useEffect(() => {
    const fetchBaptismData = async () => {
      // Validate required parameters
      if (!clientID || !reqbaptismID) {
        setError("Missing required parameters (clientID or reqbaptismID)");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Make API call to fetch baptism request details
        const response = await fetch(
          `http://parishofdivinemercy.com/backend/get_baptism_request_details.php?requestID=${reqbaptismID}&clientID=${clientID}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            }
          }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || `HTTP error! status: ${response.status}`);
        }

        if (result.success && result.request) {
          // Map API response to component data structure
          const mappedData = {
            requestDate: result.request.date,
            firstName: result.request.first_name,
            middleName: result.request.middle_name,
            lastName: result.request.last_name,
            fatherFirstName: result.request.father_fname,
            fatherMiddleName: result.request.father_mname,
            fatherLastName: result.request.father_lname,
            motherFirstName: result.request.mother_fname,
            motherMiddleName: result.request.mother_mname,
            motherLastName: result.request.mother_lname,
            placeOfBaptism: result.request.place_of_baptism,
            dateOfBaptism: result.request.date_of_baptism,
            priestName: result.request.name_of_priest,
            purpose: result.request.purpose,
            reqbaptismID: result.request.reqbaptismID,
            clientID: result.request.clientID,
            createdAt: result.request.created_at,
            updatedAt: result.request.updated_at
          };
          setData(mappedData);
        } else {
          throw new Error(result.message || "Failed to retrieve baptism request details");
        }
      } catch (err) {
        console.error('Error fetching baptism data:', err);
        setError(err.message || "An error occurred while fetching data");
      } finally {
        setLoading(false);
      }
    };

    fetchBaptismData();
  }, [clientID, reqbaptismID]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getPurposes = () => {
    if (!data || !data.purpose) return 'Not specified';
    
    // Parse the purpose string (it might be comma-separated or a single value)
    const purposes = data.purpose.split(',').map(p => p.trim()).filter(p => p);
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
    const purposes = data?.purpose ? data.purpose.toLowerCase() : '';
    return {
      marriage: purposes.includes('marriage'),
      communion: purposes.includes('communion') || purposes.includes('confirmation'),
      school: purposes.includes('school'),
      others: purposes && !purposes.includes('marriage') && !purposes.includes('communion') && !purposes.includes('confirmation') && !purposes.includes('school') ? getPurposes() : ''
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
    const headerText = "BAPTISM REQUEST FORM";
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
    
    // Full Name of Baptism
    doc.text("Full Name of Baptism:", margin, currentY);
    const nameX = margin + doc.getTextWidth("Full Name of Baptism: ");
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
    
    // Date of Baptism
    doc.text("•", margin + 5, currentY);
    doc.text("Date of Baptism:", margin + 15, currentY);
    const baptismDateX = margin + 15 + doc.getTextWidth("Date of Baptism: ");
    doc.line(baptismDateX, currentY + 1, margin + 120, currentY + 1);
    doc.text(formatDate(data?.dateOfBaptism) || "", baptismDateX + 2, currentY);
    currentY += fieldSpacing;
    
    // Place of Baptism
    doc.text("•", margin + 5, currentY);
    doc.text("Place of Baptism (Parish/Church):", margin + 15, currentY);
    const placeX = margin + 15 + doc.getTextWidth("Place of Baptism (Parish/Church): ");
    doc.line(placeX, currentY + 1, pageWidth - margin, currentY + 1);
    doc.text(data?.placeOfBaptism || "", placeX + 2, currentY);
    currentY += fieldSpacing;
    
    // Name of Priest
    doc.text("•", margin + 5, currentY);
    doc.text("Name of Priest (if known):", margin + 15, currentY);
    const priestX = margin + 15 + doc.getTextWidth("Name of Priest (if known): ");
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
    
    // First Communion/Confirmation checkbox
    doc.rect(margin + 5, currentY - 6, checkboxSize, checkboxSize, purposes.communion ? 'F' : 'S');
    if (purposes.communion) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6);
      doc.text("✓", margin + 7.5, currentY - 1);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
    }
    doc.text("First Communion / Confirmation", margin + 20, currentY);
    currentY += 12;
    
    // School Requirements checkbox
    doc.rect(margin + 5, currentY - 6, checkboxSize, checkboxSize, purposes.school ? 'F' : 'S');
    if (purposes.school) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6);
      doc.text("✓", margin + 7.5, currentY - 1);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
    }
    doc.text("School Requirements", margin + 20, currentY);
    currentY += fieldSpacing;
    
    // Others field
    doc.text("Others:", margin, currentY);
    const othersX = margin + doc.getTextWidth("Others: ");
    doc.line(othersX, currentY + 1, pageWidth - margin, currentY + 1);
    if (purposes.others) {
      doc.text(purposes.others, othersX + 2, currentY);
    }
    
    // Save the PDF
    const fileName = `Baptism_Request_Form_${data?.reqbaptismID || 'Unknown'}.pdf`;
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
    navigate("/client-request-baptism-certificate", {
      state: { clientID }
    });
    console.log('Navigate back with clientID:', clientID);
  };

  // Loading state
  if (loading) {
    return (
      <div className="cbcv-container">
        <div className="cbcv-header">
          <div className="cbcv-left-section">
            <button className="cbcv-back-button" onClick={handleBack}>
              <AiOutlineArrowLeft className="cbcv-back-icon" /> Back
            </button>
          </div>
        </div>
        <div className="cbcv-loading">
          <div className="cbcv-loading-spinner">
            <div className="cbcv-spinner"></div>
          </div>
          <p>Loading baptism certificate request details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="cbcv-container">
        <div className="cbcv-header">
          <div className="cbcv-left-section">
            <button className="cbcv-back-button" onClick={handleBack}>
              <AiOutlineArrowLeft className="cbcv-back-icon" /> Back
            </button>
          </div>
        </div>
        <div className="cbcv-error">
          <h2>Error</h2>
          <p>{error}</p>
          <button className="cbcv-retry-btn" onClick={() => window.location.reload()}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Main content (when data is loaded)
  return (
    <div className="cbcv-container">
      {/* Header */}
      <div className="cbcv-header">
        <div className="cbcv-left-section">
          <button className="cbcv-back-button" onClick={handleBack}>
            <AiOutlineArrowLeft className="cbcv-back-icon" /> Back
          </button>
        </div>
        <div className="cbcv-right-section">
          <div className="cbcv-date-field">
            <label>Request Date:</label>
            <span className="cbcv-date-display">{formatDate(data?.requestDate)}</span>
          </div>
        </div>
      </div>
      
      <h1 className="cbcv-title">BAPTISM CERTIFICATE REQUEST</h1>
   
      
      <div className="cbcv-form-container">
        {/* Full Name of Baptism Section */}
        <div className="cbcv-section">
          <h3 className="cbcv-section-title">FULL NAME OF BAPTISM</h3>
          <div className="cbcv-row">
            <div className="cbcv-field">
              <label>First Name</label>
              <div className="cbcv-display-value">{data?.firstName || 'N/A'}</div>
            </div>
            <div className="cbcv-field">
              <label>Middle Name</label>
              <div className="cbcv-display-value">{data?.middleName || 'N/A'}</div>
            </div>
            <div className="cbcv-field">
              <label>Last Name</label>
              <div className="cbcv-display-value">{data?.lastName || 'N/A'}</div>
            </div>
          </div>
        </div>

        {/* Father Information Section */}
        <div className="cbcv-section">
          <h3 className="cbcv-section-title">Father Information</h3>
          <div className="cbcv-row">
            <div className="cbcv-field">
              <label>Father's First Name</label>
              <div className="cbcv-display-value">{data?.fatherFirstName || 'N/A'}</div>
            </div>
            <div className="cbcv-field">
              <label>Father's Middle Name</label>
              <div className="cbcv-display-value">{data?.fatherMiddleName || 'N/A'}</div>
            </div>
            <div className="cbcv-field">
              <label>Father's Last Name</label>
              <div className="cbcv-display-value">{data?.fatherLastName || 'N/A'}</div>
            </div>
          </div>
        </div>

        {/* Mother Information Section */}
        <div className="cbcv-section">
          <h3 className="cbcv-section-title">Mother Information</h3>
          <div className="cbcv-row">
            <div className="cbcv-field">
              <label>Mother's First Name</label>
              <div className="cbcv-display-value">{data?.motherFirstName || 'N/A'}</div>
            </div>
            <div className="cbcv-field">
              <label>Mother's Middle Name</label>
              <div className="cbcv-display-value">{data?.motherMiddleName || 'N/A'}</div>
            </div>
            <div className="cbcv-field">
              <label>Mother's Last Name</label>
              <div className="cbcv-display-value">{data?.motherLastName || 'N/A'}</div>
            </div>
          </div>
        </div>

        {/* Baptism Details Section */}
        <div className="cbcv-section">
          <div className="cbcv-row">
            <div className="cbcv-field cbcv-field-wide">
              <label>Place of Baptism (Parish/Church)</label>
              <div className="cbcv-display-value">{data?.placeOfBaptism || 'N/A'}</div>
            </div>
          </div>
          <div className="cbcv-row">
            <div className="cbcv-field">
              <label>Date of Baptism</label>
              <div className="cbcv-display-value">{formatDate(data?.dateOfBaptism)}</div>
            </div>
            <div className="cbcv-field">
              <label>Name of Priest (if known)</label>
              <div className="cbcv-display-value">{data?.priestName || 'N/A'}</div>
            </div>
          </div>
        </div>

        {/* Purpose of Request Section */}
        <div className="cbcv-section">
          <h3 className="cbcv-section-title">PURPOSE OF REQUEST</h3>
          <div className="cbcv-purpose-display">
            <div className="cbcv-display-value">{getPurposes()}</div>
          </div>
        </div>

        {/* Download Button */}
        <div className="cbcv-button-container">
          <button className="cbcv-download-btn" onClick={showPreview}>
            <AiOutlineDownload className="cbcv-download-icon" />
            Preview & Download PDF Form
          </button>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreviewModal && (
        <div className="cbcv-modal-overlay" onClick={closePreview}>
          <div className="cbcv-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="cbcv-modal-header">
              <h2>PDF Form Preview</h2>
              <button className="cbcv-modal-close" onClick={closePreview}>×</button>
            </div>
            
            <div className="cbcv-form-preview">
              <div className="cbcv-preview-paper">
                {/* Form Header */}
                <div className="cbcv-preview-header">
                  <h1>BAPTISM REQUEST FORM</h1>
                  <div className="cbcv-preview-line"></div>
                </div>
                
                {/* Date Field */}
                <div className="cbcv-preview-field">
                  <span className="cbcv-preview-label">Date:</span>
                  <span className="cbcv-preview-underline">{formatDate(data?.requestDate)}</span>
                </div>
                
                {/* Full Name Field */}
                <div className="cbcv-preview-field">
                  <span className="cbcv-preview-label">Full Name of Baptism:</span>
                  <span className="cbcv-preview-underline-long">{getFullName()}</span>
                </div>
                
                {/* Parent Information */}
                <div className="cbcv-preview-field">
                  <span className="cbcv-preview-bullet">•</span>
                  <span className="cbcv-preview-label">Father's Full Name:</span>
                  <span className="cbcv-preview-underline-long">{getFatherFullName()}</span>
                </div>
                
                <div className="cbcv-preview-field">
                  <span className="cbcv-preview-bullet">•</span>
                  <span className="cbcv-preview-label">Mother's Full Name:</span>
                  <span className="cbcv-preview-underline-long">{getMotherFullName()}</span>
                </div>
                
                {/* Baptism Details */}
                <div className="cbcv-preview-field">
                  <span className="cbcv-preview-bullet">•</span>
                  <span className="cbcv-preview-label">Date of Baptism:</span>
                  <span className="cbcv-preview-underline">{formatDate(data?.dateOfBaptism)}</span>
                </div>
                
                <div className="cbcv-preview-field">
                  <span className="cbcv-preview-bullet">•</span>
                  <span className="cbcv-preview-label">Place of Baptism (Parish/Church):</span>
                  <span className="cbcv-preview-underline-long">{data?.placeOfBaptism || 'N/A'}</span>
                </div>
                
                <div className="cbcv-preview-field">
                  <span className="cbcv-preview-bullet">•</span>
                  <span className="cbcv-preview-label">Name of Priest (if known):</span>
                  <span className="cbcv-preview-underline-long">{data?.priestName || 'N/A'}</span>
                </div>
                
                {/* Purpose Section */}
                <div className="cbcv-preview-purpose">
                  <h3>Purpose of Request</h3>
                  
                  <div className="cbcv-preview-checkbox-group">
                    <div className="cbcv-preview-checkbox">
                      <span className={`cbcv-checkbox ${getPurposeCheckboxes().marriage ? 'checked' : ''}`}>
                        {getPurposeCheckboxes().marriage ? '✓' : ''}
                      </span>
                      <span>Marriage Preparation</span>
                    </div>
                    
                    <div className="cbcv-preview-checkbox">
                      <span className={`cbcv-checkbox ${getPurposeCheckboxes().communion ? 'checked' : ''}`}>
                        {getPurposeCheckboxes().communion ? '✓' : ''}
                      </span>
                      <span>First Communion / Confirmation</span>
                    </div>
                    
                    <div className="cbcv-preview-checkbox">
                      <span className={`cbcv-checkbox ${getPurposeCheckboxes().school ? 'checked' : ''}`}>
                        {getPurposeCheckboxes().school ? '✓' : ''}
                      </span>
                      <span>School Requirements</span>
                    </div>
                  </div>
                  
                  <div className="cbcv-preview-field">
                    <span className="cbcv-preview-label">Others:</span>
                    <span className="cbcv-preview-underline-long">{getPurposeCheckboxes().others}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="cbcv-modal-actions">
              <button className="cbcv-modal-cancel" onClick={closePreview}>
                Cancel
              </button>
              <button className="cbcv-modal-download" onClick={downloadPDF}>
                <AiOutlineDownload className="cbcv-download-icon" />
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientBaptismCertificateView;