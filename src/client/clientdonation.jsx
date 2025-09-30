import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faPlus, faTimes } from "@fortawesome/free-solid-svg-icons";
import "./clientdonation.css";

const ClientDonation = () => {
  const location = useLocation();
  const { clientID } = location.state || {};
  
  const [searchTerm, setSearchTerm] = useState("");
  const [donations, setDonations] = useState([]);
  const [isLoadingTable, setIsLoadingTable] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isViewing, setIsViewing] = useState(false);
  const [currentDonation, setCurrentDonation] = useState(null);
  
  // Modal states for confirmation, success, error, and loading
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    dateOfDonation: '',
    timeOfDonation: '',
    fullName: '',
    contactNumber: '',
    email: '',
    homeAddress: '',
    donationAmount: '',
    referenceNumber: '',
    massIntention: '',
    purpose: '',
    customPurpose: '',
    intention: '',
    customIntention: ''
  });
  
  // Form validation errors
  const [formErrors, setFormErrors] = useState({});

  // Fixed GCash number for donations
  const PARISH_GCASH_NUMBER = "09075707357";

  // Fetch donations from database
  const fetchDonations = async () => {
    if (!clientID) {
      console.error("Client ID is required");
      return;
    }

    setIsLoadingTable(true);

    try {
      const response = await fetch(`http://parishofdivinemercy.com/backend/get_donations.php?clientID=${clientID}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setDonations(result.data || []);
      } else {
        console.error('Failed to fetch donations:', result.message);
        setDonations([]);
      }
    } catch (error) {
      console.error('Error fetching donations:', error);
      setDonations([]);
    } finally {
      setIsLoadingTable(false);
    }
  };

  // Load data when component mounts
  useEffect(() => {
    if (clientID) {
      fetchDonations();
    }
  }, [clientID]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleAddClick = () => {
    setIsViewing(false);
    setCurrentDonation(null);
    resetForm();
    setShowModal(true);
  };

  const handleViewClick = (donation) => {
    setIsViewing(true);
    setCurrentDonation(donation);
    // Set form data based on current donation for viewing
    setFormData({
      dateOfDonation: donation.dateOfDonation || '',
      timeOfDonation: donation.timeOfDonation || '',
      fullName: donation.fullName || '',
      contactNumber: donation.contactNumber || '',
      email: donation.email || '',
      homeAddress: donation.homeAddress || '',
      donationAmount: donation.donationAmount ? donation.donationAmount.toString() : '',
      referenceNumber: donation.referenceNumber || '',
      massIntention: donation.massIntention || '',
      purpose: donation.purpose || '',
      customPurpose: '',
      intention: donation.intention || '',
      customIntention: ''
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentDonation(null);
    setIsViewing(false);
    resetForm();
    setFormErrors({});
  };

  const resetForm = () => {
    setFormData({
      dateOfDonation: '',
      timeOfDonation: '',
      fullName: '',
      contactNumber: '',
      email: '',
      homeAddress: '',
      donationAmount: '',
      referenceNumber: '',
      massIntention: '',
      purpose: '',
      customPurpose: '',
      intention: '',
      customIntention: ''
    });
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    // Required fields validation
    const requiredFields = [
      'dateOfDonation', 'timeOfDonation', 'fullName', 'contactNumber', 
      'email', 'homeAddress', 'donationAmount', 'referenceNumber', 'purpose'
    ];
    
    requiredFields.forEach(field => {
      if (!formData[field] || formData[field].trim() === '') {
        errors[field] = 'This field is required';
      }
    });

    // Email validation
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    // Donation amount validation
    if (formData.donationAmount && (isNaN(formData.donationAmount) || parseFloat(formData.donationAmount) <= 0)) {
      errors.donationAmount = 'Please enter a valid donation amount';
    }

    // Custom purpose validation
    if (formData.purpose === 'Others' && (!formData.customPurpose || formData.customPurpose.trim() === '')) {
      errors.customPurpose = 'Please specify the custom purpose';
    }

    // Custom intention validation
    if (formData.intention === 'Others' && (!formData.customIntention || formData.customIntention.trim() === '')) {
      errors.customIntention = 'Please specify the custom intention';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const submitToDatabase = async () => {
    try {
      const response = await fetch('http://parishofdivinemercy.com/backend/donations.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientID: clientID,
          dateOfDonation: formData.dateOfDonation,
          timeOfDonation: formData.timeOfDonation,
          fullName: formData.fullName,
          contactNumber: formData.contactNumber,
          email: formData.email,
          homeAddress: formData.homeAddress,
          donationAmount: parseFloat(formData.donationAmount),
          referenceNumber: formData.referenceNumber,
          massIntention: formData.massIntention,
          purpose: formData.purpose,
          customPurpose: formData.customPurpose,
          intention: formData.intention,
          customIntention: formData.customIntention
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        return { success: true, data: result };
      } else {
        throw new Error(result.message || 'Failed to submit donation');
      }
    } catch (error) {
      console.error('Database submission error:', error);
      throw error;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Show confirmation modal instead of directly submitting
    setShowConfirmModal(true);
  };

  // Handle confirmation modal "Yes" button
  const handleConfirmSubmit = async () => {
    setShowConfirmModal(false);
    setIsLoading(true);
    
    try {
      await submitToDatabase();
      setIsLoading(false);
      setShowSuccessModal(true);
      
      setTimeout(() => {
        setShowSuccessModal(false);
        handleCloseModal();
        // Refresh the donations list
        fetchDonations();
      }, 2000);
      
    } catch (error) {
      setIsLoading(false);
      setErrorMessage(error.message || 'An error occurred while submitting the donation');
      setShowErrorModal(true);
    }
  };

  // Filter donations based on search term
  const filteredDonations = donations.filter(donation => {
    if (!searchTerm.trim()) {
      return true;
    }

    const searchValue = searchTerm.toLowerCase().trim();
    
    return (
      donation.name?.toLowerCase().includes(searchValue) ||
      donation.amount?.toLowerCase().includes(searchValue) ||
      donation.date?.toLowerCase().includes(searchValue) ||
      donation.purpose?.toLowerCase().includes(searchValue) ||
      donation.gcashRef?.toLowerCase().includes(searchValue) ||
      donation.id?.toString().includes(searchValue)
    );
  });

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toISOString().split('T')[0];
    } catch (error) {
      return dateString;
    }
  };

  // Show error message if no clientID
  if (!clientID) {
    return (
      <div className="donation-container-cd">
        <div className="title-container-cd">
          <h1 className="title-cd">DONATION</h1>
        </div>
        <div style={{ padding: '20px', textAlign: 'center', color: '#e74c3c' }}>
          <p>Error: Client ID is required to view donations.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="donation-container-cd">
      <div className="title-container-cd">
        <h1 className="title-cd">DONATION</h1>
      </div>
      
      <div className="donation-actions-cd">
        <div className="search-bar-cd">
          <input 
            type="text" 
            placeholder="Search" 
            value={searchTerm} 
            onChange={handleSearch}
          />
          <FontAwesomeIcon icon={faSearch} className="search-icon-cd" />
        </div>

        <div className="add-container-cd">
          <button className="add-btn-cd" onClick={handleAddClick}>
            <FontAwesomeIcon icon={faPlus} /> ADD
          </button>
        </div>
      </div>

      <table className="donation-table-cd">
        <thead>
          <tr>
            <th>No.</th>
            <th>Name</th>
            <th>Amount</th>
            <th>Date</th>
            <th>Purpose</th>
            <th>Gcash Ref.</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {isLoadingTable ? (
            <tr>
              <td colSpan="7" className="loading-cd">Loading donations...</td>
            </tr>
          ) : filteredDonations.length > 0 ? (
            filteredDonations.map((donation) => (
              <tr key={donation.id}>
                <td>{donation.id}</td>
                <td>{donation.name}</td>
                <td>{donation.amount}</td>
                <td>{formatDate(donation.date)}</td>
                <td>{donation.purpose}</td>
                <td>{donation.gcashRef}</td>
                <td>
                  <button 
                    className="cd-view-btn" 
                    onClick={() => handleViewClick(donation)}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="no-results-cd">No donations found</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Donation Modal */}
      {showModal && (
        <div className="donation-modal-overlay-cd">
          <div className="donation-modal-cd">
            <div className="donation-modal-header-cd">
              <h2>{isViewing ? 'View Donation' : 'Donations Form'}</h2>
              <button className="close-modal-btn-cd" onClick={handleCloseModal}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="donation-form-cd">
              <div className="form-row-cd">
                <div className="form-group-cd">
                  <label>Date of Donation: *</label>
                  <input 
                    type="date" 
                    value={formData.dateOfDonation}
                    onChange={(e) => handleInputChange('dateOfDonation', e.target.value)}
                    disabled={isViewing}
                    className={formErrors.dateOfDonation ? 'error' : ''}
                  />
                  {formErrors.dateOfDonation && <span className="error-text">{formErrors.dateOfDonation}</span>}
                </div>
                <div className="form-group-cd">
                  <label>Time of Donation: *</label>
                  <input 
                    type="time" 
                    value={formData.timeOfDonation}
                    onChange={(e) => handleInputChange('timeOfDonation', e.target.value)}
                    disabled={isViewing}
                    className={formErrors.timeOfDonation ? 'error' : ''}
                  />
                  {formErrors.timeOfDonation && <span className="error-text">{formErrors.timeOfDonation}</span>}
                </div>
              </div>

              <div className="form-row-cd">
                <div className="form-group-cd">
                  <label>Full Name *</label>
                  <input 
                    type="text" 
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    disabled={isViewing}
                    className={formErrors.fullName ? 'error' : ''}
                  />
                  {formErrors.fullName && <span className="error-text">{formErrors.fullName}</span>}
                </div>
                <div className="form-group-cd">
                  <label>Contact Number *</label>
                  <input 
                    type="tel" 
                    value={formData.contactNumber}
                    onChange={(e) => handleInputChange('contactNumber', e.target.value)}
                    disabled={isViewing}
                    className={formErrors.contactNumber ? 'error' : ''}
                  />
                  {formErrors.contactNumber && <span className="error-text">{formErrors.contactNumber}</span>}
                </div>
              </div>

              <div className="form-row-cd">
                <div className="form-group-cd">
                  <label>Email Address *</label>
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    disabled={isViewing}
                    className={formErrors.email ? 'error' : ''}
                  />
                  {formErrors.email && <span className="error-text">{formErrors.email}</span>}
                </div>
                <div className="form-group-cd">
                  <label>Home Address *</label>
                  <input 
                    type="text" 
                    value={formData.homeAddress}
                    onChange={(e) => handleInputChange('homeAddress', e.target.value)}
                    disabled={isViewing}
                    className={formErrors.homeAddress ? 'error' : ''}
                  />
                  {formErrors.homeAddress && <span className="error-text">{formErrors.homeAddress}</span>}
                </div>
              </div>

              <div className="form-row-cd">
                <div className="form-group-cd">
                  <label>Donation Amount *</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={formData.donationAmount}
                    onChange={(e) => handleInputChange('donationAmount', e.target.value)}
                    disabled={isViewing}
                    className={formErrors.donationAmount ? 'error' : ''}
                  />
                  {formErrors.donationAmount && <span className="error-text">{formErrors.donationAmount}</span>}
                </div>
                <div className="form-group-cd">
                  <label>Reference Number: *</label>
                  <input 
                    type="text" 
                    value={formData.referenceNumber}
                    onChange={(e) => handleInputChange('referenceNumber', e.target.value)}
                    disabled={isViewing}
                    className={formErrors.referenceNumber ? 'error' : ''}
                  />
                  {formErrors.referenceNumber && <span className="error-text">{formErrors.referenceNumber}</span>}
                </div>
              </div>

              <div className="form-row-cd">
                <div className="form-group-cd">
                  <label>Parish GCash Number:</label>
                  <div className="gcash-input-cd">
                    <span className="gcash-logo-cd">G</span>
                    <input 
                      type="text" 
                      value={PARISH_GCASH_NUMBER}
                      disabled={true}
                      readOnly
                      style={{ backgroundColor: '#f5f5f5', color: '#666' }}
                    />
                  </div>
                  <small style={{ color: '#666', fontSize: '12px' }}>
                    Send your donation to this GCash number
                  </small>
                </div>
                <div className="form-group-cd">
                  <label>Optional: Mass Intention:</label>
                  <input 
                    type="text" 
                    placeholder="Name of Person/s"
                    value={formData.massIntention}
                    onChange={(e) => handleInputChange('massIntention', e.target.value)}
                    disabled={isViewing}
                  />
                </div>
              </div>

              <div className="form-row-cd">
                <div className="form-group-cd">
                  <label>Purpose of Donation: *</label>
                  <select 
                    value={formData.purpose}
                    onChange={(e) => handleInputChange('purpose', e.target.value)}
                    disabled={isViewing}
                    className={formErrors.purpose ? 'error' : ''}
                  >
                    <option value="">Select Purpose</option>
                    <option value="Mass Intention">Mass Intention</option>
                    <option value="Parish Development / Maintenance">Parish Development / Maintenance</option>
                    <option value="Charity Program (Feeding, Outreach, etc.)">Charity Program (Feeding, Outreach, etc.)</option>
                    <option value="General Parish Fund">General Parish Fund</option>
                    <option value="Others">Others</option>
                  </select>
                  {formErrors.purpose && <span className="error-text">{formErrors.purpose}</span>}
                  {formData.purpose === "Others" && !isViewing && (
                    <>
                      <input 
                        type="text" 
                        placeholder="Please specify..."
                        value={formData.customPurpose}
                        onChange={(e) => handleInputChange('customPurpose', e.target.value)}
                        style={{marginTop: '10px'}}
                        className={formErrors.customPurpose ? 'error' : ''}
                      />
                      {formErrors.customPurpose && <span className="error-text">{formErrors.customPurpose}</span>}
                    </>
                  )}
                </div>
                <div className="form-group-cd">
                  <label>Intention Type</label>
                  <select 
                    value={formData.intention}
                    onChange={(e) => handleInputChange('intention', e.target.value)}
                    disabled={isViewing}
                  >
                    <option value="">Select Intention Type</option>
                    <option value="Thanksgiving">Thanksgiving</option>
                    <option value="Healing/Recovery">Healing/Recovery</option>
                    <option value="For the Soul">For the Soul</option>
                    <option value="Others">Others</option>
                  </select>
                  {formData.intention === "Others" && !isViewing && (
                    <>
                      <input 
                        type="text" 
                        placeholder="Please specify..."
                        value={formData.customIntention}
                        onChange={(e) => handleInputChange('customIntention', e.target.value)}
                        style={{marginTop: '10px'}}
                        className={formErrors.customIntention ? 'error' : ''}
                      />
                      {formErrors.customIntention && <span className="error-text">{formErrors.customIntention}</span>}
                    </>
                  )}
                </div>
              </div>

              {!isViewing && (
                <div className="form-actions-cd">
                  <button type="submit" className="save-btn-cd">
                    Save
                  </button>
                  <button type="button" className="cancel-btn-cd" onClick={handleCloseModal}>
                    Cancel
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="donation-modal-overlay-cd">
          <div className="donation-confirm-modal-cd">
            <h2>Submit Donation</h2>
            <hr className="donation-custom-hr-cd"/>
            <p>Are you sure you want to submit your donation?</p>
            <div className="donation-modal-buttons-cd">
              <button className="donation-yes-btn-cd" onClick={handleConfirmSubmit}>Yes</button>
              <button className="donation-no-btn-cd" onClick={() => setShowConfirmModal(false)}>No</button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="donation-modal-overlay-cd">
          <div className="donation-confirm-modal-cd">
            <h2>Success</h2>
            <hr className="donation-custom-hr-cd"/>
            <p>Your donation has been submitted successfully!</p>
            <div className="donation-modal-buttons-cd">
              <button className="donation-yes-btn-cd" onClick={() => setShowSuccessModal(false)}>OK</button>
            </div>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <div className="donation-modal-overlay-cd">
          <div className="donation-confirm-modal-cd">
            <h2>Error</h2>
            <hr className="donation-custom-hr-cd"/>
            <p>{errorMessage}</p>
            <div className="donation-modal-buttons-cd">
              <button className="donation-no-btn-cd" onClick={() => setShowErrorModal(false)}>OK</button>
            </div>
          </div>
        </div>
      )}

      {/* Loading Modal */}
      {isLoading && (
        <div className="donation-modal-overlay-cd">
          <div className="donation-confirm-modal-cd">
            <h2>Processing Donation</h2>
            <hr className="donation-custom-hr-cd"/>
            <p>Please wait while we submit your donation...</p>
            <div className="donation-loading-spinner-cd">
              <div className="donation-spinner-cd"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientDonation;