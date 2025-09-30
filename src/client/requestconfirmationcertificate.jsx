import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faPlus } from "@fortawesome/free-solid-svg-icons";
import "./requestcommunioncertificate.css";

const RequestConfirmationCertificate = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { clientID } = location.state || {};
  
  const [searchTerm, setSearchTerm] = useState("");
  const [certificates, setCertificates] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch confirmation certificate requests from the database
  const fetchConfirmationRequests = async () => {
    if (!clientID) {
      console.error("Client ID is required");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`http://parishofdivinemercy.com/backend/get_confirmation_requests.php?clientID=${clientID}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setCertificates(result.data || []);
      } else {
        console.error('Failed to fetch confirmation requests:', result.message);
        setCertificates([]);
      }
    } catch (error) {
      console.error('Error fetching confirmation requests:', error);
      setCertificates([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Load data when component mounts
  useEffect(() => {
    if (clientID) {
      fetchConfirmationRequests();
    }
  }, [clientID]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleAddClick = () => {
    // Navigate to confirmation certificate form and pass clientID
    navigate("/client-confirmation-certificate", { 
      state: { clientID: clientID } 
    });
  };

  const handleViewClick = (certificate) => {
    // Navigate to view page and pass both clientID and reqconfirmationID
    navigate("/client-confirmation-certificate-view", { 
      state: { 
        clientID: clientID,
        reqconfirmationID: certificate.reqconfirmationID
      } 
    });
    console.log("Viewing certificate:", certificate);
  };

  // Filter certificates based on search term
  const filteredCertificates = certificates.filter(certificate => {
    if (!searchTerm.trim()) {
      return true;
    }

    const searchValue = searchTerm.toLowerCase().trim();
    
    return (
      certificate.firstName?.toLowerCase().includes(searchValue) ||
      certificate.lastName?.toLowerCase().includes(searchValue) ||
      certificate.date?.toLowerCase().includes(searchValue) ||
      certificate.reqconfirmationID?.toString().includes(searchValue)
    );
  });

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toISOString().split('T')[0];
    } catch (error) {
      return dateString;
    }
  };

  return (
    <div className="certificate-container-rcc">
      <div className="title-container-rcc">
        <h1 className="title-rcc">CONFIRMATION CERTIFICATE</h1>
      </div>
      
      <div className="certificate-actions-rcc">
        <div className="search-bar-rcc">
          <input 
            type="text" 
            placeholder="Search" 
            value={searchTerm} 
            onChange={handleSearch}
          />
          <FontAwesomeIcon icon={faSearch} className="search-icon-rcc" />
        </div>

        <div className="add-container-rcc">
          <button className="add-btn-rcc" onClick={handleAddClick}>
            <FontAwesomeIcon icon={faPlus} /> ADD
          </button>
        </div>
      </div>

      <table className="certificate-table-rcc">
        <thead>
          <tr>
            <th>ID</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Date</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan="5" className="loading-rcc">Loading certificates...</td>
            </tr>
          ) : filteredCertificates.length > 0 ? (
            filteredCertificates.map((certificate) => (
              <tr key={certificate.reqconfirmationID}>
                <td>{certificate.reqconfirmationID}</td>
                <td>{certificate.firstName}</td>
                <td>{certificate.lastName}</td>
                <td>{formatDate(certificate.date)}</td>
                <td>
                  <button 
                    className="rcc-view-btn" 
                    onClick={() => handleViewClick(certificate)}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="no-results-rcc">No certificates found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default RequestConfirmationCertificate;