import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faPlus } from "@fortawesome/free-solid-svg-icons";
import "./requestmarriagecertificate.css";

const RequestMarriageCertificate = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { clientID } = location.state || {};
  
  const [searchTerm, setSearchTerm] = useState("");
  const [certificates, setCertificates] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch marriage certificate requests from database
  useEffect(() => {
    fetchMarriageRequests();
  }, [clientID]);

  const fetchMarriageRequests = async () => {
    if (!clientID) {
      setError('No client ID provided');
      return;
    }

    setIsLoading(true);
    setError("");
    
    try {
      const url = `http://parishofdivinemercy.com/backend/get_marriage_requests.php?clientID=${clientID}`;
        
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const result = await response.json();
      
      if (result.success) {
        setCertificates(result.data || []);
      } else {
        throw new Error(result.message || 'Failed to fetch marriage certificate requests');
      }
    } catch (error) {
      console.error('Error fetching marriage requests:', error);
      setError('Failed to load marriage certificate requests');
      setCertificates([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleAddClick = () => {
    // Pass clientID when navigating to add new marriage certificate
    navigate("/client-marriage-certificate", { 
      state: { clientID: clientID } 
    });
  };

  const handleViewClick = (certificate) => {
    // Pass both clientID and reqmarriageID when viewing certificate
    navigate("/client-marriage-certificate-view", { 
      state: { 
        clientID: certificate.clientID,
        reqmarriageID: certificate.reqmarriageID 
      } 
    });
  };

  // Filter certificates based on search term
  const filteredCertificates = certificates.filter(certificate => {
    if (!searchTerm.trim()) {
      return true;
    }

    const searchValue = searchTerm.toLowerCase().trim();
    
    return (
      certificate.groomFullName?.toLowerCase().includes(searchValue) ||
      certificate.brideFullName?.toLowerCase().includes(searchValue) ||
      certificate.firstName?.toLowerCase().includes(searchValue) ||
      certificate.lastName?.toLowerCase().includes(searchValue) ||
      certificate.placeOfMarriage?.toLowerCase().includes(searchValue) ||
      certificate.purpose?.toLowerCase().includes(searchValue) ||
      certificate.date?.toLowerCase().includes(searchValue) ||
      certificate.time?.toLowerCase().includes(searchValue) ||
      certificate.reqmarriageID?.toString().includes(searchValue)
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
    <div className="certificate-container-rmc">
      <div className="title-container-rmc">
        <h1 className="title-rmc">MARRIAGE CERTIFICATE</h1>
        {clientID && (
          <p className="client-info-rmc">Client ID: {clientID}</p>
        )}
      </div>
      
      <div className="certificate-actions-rmc">
        <div className="search-bar-rmc">
          <input 
            type="text" 
            placeholder="Search by names, place, purpose, or ID" 
            value={searchTerm} 
            onChange={handleSearch}
          />
          <FontAwesomeIcon icon={faSearch} className="search-icon-rmc" />
        </div>

        <div className="add-container-rmc">
          <button className="add-btn-rmc" onClick={handleAddClick}>
            <FontAwesomeIcon icon={faPlus} /> ADD
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message-rmc">
          {error}
          <button onClick={fetchMarriageRequests} className="retry-btn-rmc">
            Try Again
          </button>
        </div>
      )}

      <table className="certificate-table-rmc">
        <thead>
          <tr>
            <th>Request ID</th>
            <th>Groom Name</th>
            <th>Bride Name</th>
            <th>Place of Marriage</th>
            <th>Date Requested</th>
            <th>Time</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan="7" className="loading-rmc">Loading certificates...</td>
            </tr>
          ) : filteredCertificates.length > 0 ? (
            filteredCertificates.map((certificate) => (
              <tr key={certificate.reqmarriageID}>
                <td>{certificate.reqmarriageID}</td>
                <td>{certificate.groomFullName}</td>
                <td>{certificate.brideFullName}</td>
                <td>{certificate.placeOfMarriage}</td>
                <td>{formatDate(certificate.date)}</td>
                <td>{certificate.time}</td>
                <td>
                  <button 
                    className="rmc-view-btn" 
                    onClick={() => handleViewClick(certificate)}
                    title={`View marriage certificate request #${certificate.reqmarriageID}`}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="no-results-rmc">
                {searchTerm ? 'No certificates match your search' : 'No marriage certificate requests found'}
              </td>
            </tr>
          )}
        </tbody>
      </table>
      
      {!isLoading && filteredCertificates.length > 0 && (
        <div className="results-info-rmc">
          Showing {filteredCertificates.length} of {certificates.length} certificate requests
        </div>
      )}
    </div>
  );
};

export default RequestMarriageCertificate;