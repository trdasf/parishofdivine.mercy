import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faPlus, faTimes, faChevronDown } from "@fortawesome/free-solid-svg-icons";
import "./secretarydonation.css";

const SecretaryDonation = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [donations, setDonations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isViewing, setIsViewing] = useState(false);
  const [currentDonation, setCurrentDonation] = useState(null);
  const [filterPurpose, setFilterPurpose] = useState("All Purposes");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [error, setError] = useState(null);
  const [isConfirming, setIsConfirming] = useState(false);
  
  // Form state for dropdowns
  const [purposeOfDonation, setPurposeOfDonation] = useState("");
  const [customPurpose, setCustomPurpose] = useState("");
  const [intentionType, setIntentionType] = useState("");
  const [customIntention, setCustomIntention] = useState("");

  const purposeTypes = [
    "All Purposes",
    "Mass Intention",
    "Parish Development / Maintenance",
    "Charity Program (Feeding, Outreach, etc.)",
    "General Parish Fund",
    "Others"
  ];

  // Fetch donations from database
  useEffect(() => {
    const fetchDonations = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch('http://parishofdivinemercy.com/backend/sec_donations.php', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        
        if (result.success) {
          // Map the API data to match the component's expected structure
          const mappedDonations = result.data.map(donation => ({
            id: donation.donationID,
            fullName: donation.fullName,
            email: donation.email,
            amount: donation.amount, // Already formatted with ₱ from API
            referenceNo: donation.referenceNo,
            purpose: donation.purpose,
            dateOfDonation: donation.dateOfDonation,
            timeOfDonation: donation.timeOfDonation,
            contactNumber: donation.contactNumber,
            homeAddress: donation.homeAddress,
            gcashNumber: "09075707357", // Always use default GCash number
            massIntention: donation.massIntention,
            intentionType: donation.intentionType,
            status: donation.status // Use status directly from database
          }));
          
          setDonations(mappedDonations);
        } else {
          throw new Error(result.message || 'Failed to fetch donations');
        }
      } catch (error) {
        console.error('Error fetching donations:', error);
        setError(error.message);
        setDonations([]); // Set empty array on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchDonations();
  }, []);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handlePurposeFilter = (purpose) => {
    setFilterPurpose(purpose);
    setIsDropdownOpen(false);
  };

  const handleAddClick = () => {
    setIsViewing(false);
    setCurrentDonation(null);
    // Reset form state
    setPurposeOfDonation("");
    setCustomPurpose("");
    setIntentionType("");
    setCustomIntention("");
    setShowModal(true);
  };

  const handleViewClick = (donation) => {
    setIsViewing(true);
    setCurrentDonation(donation);
    // Set form state based on current donation
    setPurposeOfDonation(donation.purpose || "");
    setCustomPurpose("");
    setIntentionType(donation.intentionType || "");
    setCustomIntention("");
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentDonation(null);
    setIsViewing(false);
    // Reset form state
    setPurposeOfDonation("");
    setCustomPurpose("");
    setIntentionType("");
    setCustomIntention("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isViewing) {
      return; // Don't submit if just viewing
    }

    const formData = new FormData(e.target);
    const donationData = {
      dateOfDonation: formData.get('dateOfDonation'),
      timeOfDonation: formData.get('timeOfDonation'),
      fullName: formData.get('fullName'),
      contactNumber: formData.get('contactNumber'),
      email: formData.get('email'),
      homeAddress: formData.get('homeAddress'),
      donationAmount: formData.get('donationAmount'),
      referenceNumber: formData.get('referenceNumber'),
      gcashNumber: formData.get('gcashNumber') || '09075707357',
      massIntention: formData.get('massIntention'),
      purpose: purposeOfDonation === 'Others' ? customPurpose : purposeOfDonation,
      intentionType: intentionType === 'Others' ? customIntention : intentionType,
      clientID: null // Secretary can add without clientID
    };

    try {
      setIsLoading(true);
      
      const response = await fetch('http://parishofdivinemercy.com/backend/add_donation.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(donationData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        alert('Donation added successfully!');
        // Refresh the donations list
        window.location.reload();
      } else {
        throw new Error(result.message || 'Failed to add donation');
      }
    } catch (error) {
      console.error('Error adding donation:', error);
      alert(`Error adding donation: ${error.message}`);
    } finally {
      setIsLoading(false);
      handleCloseModal();
    }
  };

  const handleConfirmDonation = async () => {
    if (!currentDonation) {
      alert("No donation selected");
      return;
    }

    if (currentDonation.status === 'Confirmed') {
      alert("This donation is already confirmed!");
      return;
    }

    setIsConfirming(true);

    try {
      console.log("Confirming donation:", currentDonation.id);
      
      // First, update the donation status
      const statusResponse = await fetch('http://parishofdivinemercy.com/backend/update_donation_status.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          donationID: currentDonation.id,
          status: 'Confirmed'
        })
      });

      if (!statusResponse.ok) {
        throw new Error(`HTTP error! status: ${statusResponse.status}`);
      }

      const statusResult = await statusResponse.json();
      
      if (!statusResult.success) {
        throw new Error(statusResult.message || 'Failed to update donation status');
      }

      // Then send the confirmation email
      const emailResponse = await fetch('http://parishofdivinemercy.com/backend/donation_email.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          donationID: currentDonation.id
        })
      });

      if (!emailResponse.ok) {
        throw new Error(`HTTP error! status: ${emailResponse.status}`);
      }

      const emailResult = await emailResponse.json();
      
      if (emailResult.success) {
        // Update the local state to reflect the status change
        setDonations(prevDonations => 
          prevDonations.map(donation => 
            donation.id === currentDonation.id 
              ? { ...donation, status: 'Confirmed' }
              : donation
          )
        );
        
        // Update the current donation in the modal
        setCurrentDonation(prev => ({ ...prev, status: 'Confirmed' }));
        
        alert(`Success! Donation confirmed and ${emailResult.message}`);
        console.log("Donation confirmed and email sent successfully:", emailResult.message);
      } else {
        // Status was updated but email failed
        setDonations(prevDonations => 
          prevDonations.map(donation => 
            donation.id === currentDonation.id 
              ? { ...donation, status: 'Confirmed' }
              : donation
          )
        );
        
        // Update the current donation in the modal
        setCurrentDonation(prev => ({ ...prev, status: 'Confirmed' }));
        
        alert(`Donation confirmed but email failed: ${emailResult.message}`);
        console.error("Email send failed:", emailResult.message);
      }
    } catch (error) {
      console.error('Error confirming donation:', error);
      alert(`Error confirming donation: ${error.message}`);
    } finally {
      setIsConfirming(false);
    }
  };

  const handlePurposeChange = (e) => {
    const value = e.target.value;
    setPurposeOfDonation(value);
    if (value !== "Others") {
      setCustomPurpose("");
    }
  };

  const handleIntentionChange = (e) => {
    const value = e.target.value;
    setIntentionType(value);
    if (value !== "Others") {
      setCustomIntention("");
    }
  };

  // Filter donations based on search term and purpose
  const filteredDonations = donations.filter(donation => {
    const matchesSearch = !searchTerm.trim() || 
      donation.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      donation.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      donation.amount?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      donation.referenceNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      donation.purpose?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      donation.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      donation.id?.toString().includes(searchTerm);

    const matchesPurpose = filterPurpose === "All Purposes" || 
      donation.purpose === filterPurpose;

    return matchesSearch && matchesPurpose;
  });

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toISOString().split('T')[0];
    } catch (error) {
      return dateString;
    }
  };

  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'Confirmed':
        return 'status-confirmed';
      case 'Pending':
        return 'status-pending';
      default:
        return 'status-default';
    }
  };

  return (
    <div className="donation-container-sd">
      <div className="title-container-sd">
        <h1 className="title-sd">Donations</h1>
      </div>
      
      <div className="donation-actions-sd">
        <div className="search-bar-sd">
          <input 
            type="text" 
            placeholder="Search" 
            value={searchTerm} 
            onChange={handleSearch}
          />
          <FontAwesomeIcon icon={faSearch} className="search-icon-sd" />
        </div>

        <div className="right-actions-sd">
          <div className="filter-container-sd">
            <div className="filter-dropdown-sd">
              <button 
                className="filter-btn-sd" 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                {filterPurpose}
                <FontAwesomeIcon icon={faChevronDown} className={`dropdown-icon-sd ${isDropdownOpen ? 'rotate' : ''}`} />
              </button>
              {isDropdownOpen && (
                <div className="filter-dropdown-menu-sd">
                  {purposeTypes.map((purpose) => (
                    <div 
                      key={purpose}
                      className="filter-dropdown-item-sd"
                      onClick={() => handlePurposeFilter(purpose)}
                    >
                      {purpose}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="add-container-sd">
            <button className="add-btn-sd" onClick={handleAddClick}>
              <FontAwesomeIcon icon={faPlus} /> ADD
            </button>
          </div>
        </div>
      </div>

      <table className="donation-table-sd">
        <thead>
          <tr>
            <th>Full Name</th>
            <th>Email</th>
            <th>Amount</th>
            <th>Reference No.</th>
            <th>Purpose</th>
            <th>Date of Donation</th>
            <th>Time of Donation</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan="9" className="loading-sd">Loading donations...</td>
            </tr>
          ) : error ? (
            <tr>
              <td colSpan="9" className="loading-sd" style={{color: '#dc3545'}}>
                Error: {error}
              </td>
            </tr>
          ) : filteredDonations.length > 0 ? (
            filteredDonations.map((donation) => (
              <tr key={donation.id}>
                <td>{donation.fullName}</td>
                <td>{donation.email}</td>
                <td>{donation.amount}</td>
                <td>{donation.referenceNo}</td>
                <td>{donation.purpose}</td>
                <td>{formatDate(donation.dateOfDonation)}</td>
                <td>{donation.timeOfDonation}</td>
                <td>
                  <span className={`status-badge ${getStatusBadgeClass(donation.status)}`}>
                    {donation.status}
                  </span>
                </td>
                <td>
                  <button 
                    className="sd-view-btn" 
                    onClick={() => handleViewClick(donation)}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="9" className="no-results-sd">No donations found</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Donation Modal */}
      {showModal && (
        <div className="donation-modal-overlay-sd">
          <div className="donation-modal-sd">
            <div className="donation-modal-header-sd">
              <h2>{isViewing ? 'View Donation' : 'Donations Form'}</h2>
              <button className="close-modal-btn-sd" onClick={handleCloseModal}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="donation-form-sd">
              <div className="form-row-sd">
                <div className="form-group-sd">
                  <label>Date of Donation: *</label>
                  <input 
                    type="date" 
                    name="dateOfDonation"
                    required 
                    disabled={isViewing}
                    defaultValue={currentDonation?.dateOfDonation ? currentDonation.dateOfDonation.split('T')[0] : ''}
                  />
                </div>
                <div className="form-group-sd">
                  <label>Time of Donation: *</label>
                  <input 
                    type="time" 
                    name="timeOfDonation"
                    required 
                    disabled={isViewing}
                    defaultValue={currentDonation?.timeOfDonation ? currentDonation.timeOfDonation : ''}
                  />
                </div>
              </div>

              <div className="form-row-sd">
                <div className="form-group-sd">
                  <label>Full Name *</label>
                  <input 
                    type="text" 
                    name="fullName"
                    required 
                    disabled={isViewing}
                    defaultValue={currentDonation?.fullName || ''}
                  />
                </div>
                <div className="form-group-sd">
                  <label>Contact Number *</label>
                  <input 
                    type="tel" 
                    name="contactNumber"
                    required 
                    disabled={isViewing}
                    defaultValue={currentDonation?.contactNumber || ''}
                  />
                </div>
              </div>

              <div className="form-row-sd">
                <div className="form-group-sd">
                  <label>Email Address *</label>
                  <input 
                    type="email" 
                    name="email"
                    required 
                    disabled={isViewing}
                    defaultValue={currentDonation?.email || ''}
                  />
                </div>
                <div className="form-group-sd">
                  <label>Home Address *</label>
                  <input 
                    type="text" 
                    name="homeAddress"
                    required 
                    disabled={isViewing}
                    defaultValue={currentDonation?.homeAddress || ''}
                  />
                </div>
              </div>

              <div className="form-row-sd">
                <div className="form-group-sd">
                  <label>Donation Amount *</label>
                  <input 
                    type="number" 
                    name="donationAmount"
                    step="0.01"
                    required={!isViewing}
                    disabled={isViewing}
                    defaultValue={currentDonation?.amount ? currentDonation.amount.replace('₱', '').replace(',', '') : ''}
                  />
                </div>
                <div className="form-group-sd">
                  <label>Reference Number: *</label>
                  <input 
                    type="text" 
                    name="referenceNumber"
                    required 
                    disabled={isViewing}
                    defaultValue={currentDonation?.referenceNo || ''}
                  />
                </div>
              </div>

              <div className="form-row-sd">
                <div className="form-group-sd">
                  <label>Gcash Number:</label>
                  <div className="gcash-input-sd">
                    <span className="gcash-logo-sd">G</span>
                    <input 
                      type="text" 
                      name="gcashNumber"
                      placeholder="09075707357"
                      disabled={isViewing}
                      defaultValue={currentDonation?.gcashNumber || '09075707357'}
                    />
                  </div>
                </div>
                <div className="form-group-sd">
                  <label>Optional: Mass Intention:</label>
                  <input 
                    type="text" 
                    name="massIntention"
                    placeholder="Name of Person/s"
                    disabled={isViewing}
                    defaultValue={currentDonation?.massIntention || ''}
                  />
                </div>
              </div>

              <div className="form-row-sd">
                <div className="form-group-sd">
                  <label>Purpose of Donation: *</label>
                  {isViewing ? (
                    <input 
                      type="text" 
                      disabled={true}
                      value={currentDonation?.purpose || ''}
                      readOnly
                    />
                  ) : (
                    <>
                      <select 
                        value={purposeOfDonation}
                        onChange={handlePurposeChange}
                        required
                        disabled={isViewing}
                      >
                        <option value="">Select Purpose</option>
                        <option value="Mass Intention">Mass Intention</option>
                        <option value="Parish Development / Maintenance">Parish Development / Maintenance</option>
                        <option value="Charity Program (Feeding, Outreach, etc.)">Charity Program (Feeding, Outreach, etc.)</option>
                        <option value="General Parish Fund">General Parish Fund</option>
                        <option value="Others">Others</option>
                      </select>
                      {purposeOfDonation === "Others" && (
                        <input 
                          type="text" 
                          placeholder="Please specify..."
                          value={customPurpose}
                          onChange={(e) => setCustomPurpose(e.target.value)}
                          required
                          style={{marginTop: '10px'}}
                        />
                      )}
                    </>
                  )}
                </div>
                <div className="form-group-sd">
                  <label>Intention Type</label>
                  {isViewing ? (
                    <input 
                      type="text" 
                      disabled={true}
                      value={currentDonation?.intentionType || ''}
                      readOnly
                    />
                  ) : (
                    <>
                      <select 
                        value={intentionType}
                        onChange={handleIntentionChange}
                        disabled={isViewing}
                      >
                        <option value="">Select Intention Type</option>
                        <option value="Thanksgiving">Thanksgiving</option>
                        <option value="Healing/Recovery">Healing/Recovery</option>
                        <option value="For the Soul">For the Soul</option>
                        <option value="Others">Others</option>
                      </select>
                      {intentionType === "Others" && (
                        <input 
                          type="text" 
                          placeholder="Please specify..."
                          value={customIntention}
                          onChange={(e) => setCustomIntention(e.target.value)}
                          required
                          style={{marginTop: '10px'}}
                        />
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Status Display in View Mode */}
              {isViewing && (
                <div className="form-row-sd">
                  <div className="form-group-sd">
                    <label>Status:</label>
                    <div className={`status-display ${getStatusBadgeClass(currentDonation?.status)}`}>
                      {currentDonation?.status}
                    </div>
                  </div>
                </div>
              )}

              <div className="form-actions-sd">
                {isViewing ? (
                  <button 
                    type="button" 
                    className={`confirm-btn-sd ${currentDonation?.status === 'Confirmed' ? 'disabled' : ''}`}
                    onClick={handleConfirmDonation}
                    disabled={isConfirming || currentDonation?.status === 'Confirmed'}
                  >
                    {isConfirming ? 'Confirming...' : 
                     currentDonation?.status === 'Confirmed' ? 'Already Confirmed' : 'Confirm Donation'}
                  </button>
                ) : (
                  <>
                    <button type="submit" className="save-btn-sd">
                      Save
                    </button>
                    <button type="button" className="cancel-btn-sd" onClick={handleCloseModal}>
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SecretaryDonation;