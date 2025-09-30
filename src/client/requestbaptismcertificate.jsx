import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faPlus } from "@fortawesome/free-solid-svg-icons";
import "./requestbaptismcertificate.css";

const RequestBaptismCertificate = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { clientID } = location.state || {};
  
  console.log('Received clientID:', clientID);

  const [searchTerm, setSearchTerm] = useState("");
  const [certificates, setCertificates] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Memoized fetch function to avoid unnecessary re-renders
  const fetchCertificates = useCallback(async () => {
    if (!clientID) return;
    
    setIsLoading(true);
    setError("");
    
    try {
      const response = await fetch(`http://parishofdivinemercy.com/backend/get_baptism_requests.php?clientID=${clientID}`);
      const data = await response.json();
      
      if (data.success) {
        setCertificates(data.requests || []);
      } else {
        setError(data.message || "Failed to fetch certificates");
        setCertificates([]);
      }
    } catch (error) {
      console.error('Error fetching certificates:', error);
      setError("Error loading certificates");
      setCertificates([]);
    } finally {
      setIsLoading(false);
    }
  }, [clientID]);

  // Initial fetch when component mounts
  useEffect(() => {
    fetchCertificates();
  }, [fetchCertificates]);

  // Refetch data when window gets focus (user returns to tab/window)
  useEffect(() => {
    const handleFocus = () => {
      console.log('Window focused, refetching data...');
      fetchCertificates();
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('Tab became visible, refetching data...');
        fetchCertificates();
      }
    };

    // Add event listeners
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup function to remove event listeners
    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchCertificates]);

  // Also refetch when location changes (when navigating back to this page)
  useEffect(() => {
    fetchCertificates();
  }, [location.pathname, fetchCertificates]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleAddClick = () => {
    // Pass clientID when navigating to add new certificate
    navigate("/client-baptism-certificate", {
      state: { clientID }
    });
  };

  const handleViewClick = (certificate) => {
    // Pass both clientID and reqbaptismID when viewing
    navigate("/client-baptism-certificate-view", {
      state: { 
        clientID,
        reqbaptismID: certificate.reqbaptismID
      }
    });
    console.log("Viewing certificate:", certificate);
    console.log("Navigating with clientID:", clientID, "and reqbaptismID:", certificate.reqbaptismID);
  };

  // Filter certificates based on search term
  const filteredCertificates = certificates.filter(certificate => {
    if (!searchTerm.trim()) {
      return true;
    }

    const searchValue = searchTerm.toLowerCase().trim();
    
    return (
      certificate.first_name?.toLowerCase().includes(searchValue) ||
      certificate.last_name?.toLowerCase().includes(searchValue) ||
      certificate.middle_name?.toLowerCase().includes(searchValue) ||
      certificate.place_of_baptism?.toLowerCase().includes(searchValue) ||
      certificate.purpose?.toLowerCase().includes(searchValue) ||
      certificate.reqbaptismID?.toString().includes(searchValue) ||
      formatDate(certificate.date)?.toLowerCase().includes(searchValue)
    );
  });

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch (error) {
      return dateString;
    }
  };

  return (
    <div className="certificate-container-rbc">
      <div className="title-container-rbc">
        <h1 className="title-rbc">BAPTISM CERTIFICATE</h1>
      </div>
      
      <div className="certificate-actions-rbc">
        <div className="search-bar-rbc">
          <input 
            type="text" 
            placeholder="Search certificates..." 
            value={searchTerm} 
            onChange={handleSearch}
          />
          <FontAwesomeIcon icon={faSearch} className="search-icon-rbc" />
        </div>

        <div className="add-container-rbc">
          <button className="add-btn-rbc" onClick={handleAddClick}>
            <FontAwesomeIcon icon={faPlus} /> ADD
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message-rbc">
          {error}
          <button onClick={fetchCertificates} className="retry-btn-rbc">
            Retry
          </button>
        </div>
      )}

      <table className="certificate-table-rbc">
        <thead>
          <tr>
            <th>Request ID</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Place of Baptism</th>
            <th>Date Submitted</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan="6" className="loading-rbc">Loading certificates...</td>
            </tr>
          ) : filteredCertificates.length > 0 ? (
            filteredCertificates.map((certificate) => (
              <tr key={certificate.reqbaptismID}>
                <td>{certificate.reqbaptismID}</td>
                <td>{certificate.first_name}</td>
                <td>{certificate.last_name}</td>
                <td>{certificate.place_of_baptism}</td>
                <td>{formatDate(certificate.date)}</td>
                <td>
                  <button 
                    className="rbc-view-btn" 
                    onClick={() => handleViewClick(certificate)}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="no-results-rbc">
                {searchTerm ? "No certificates match your search" : "No certificate requests found"}
              </td>
              
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default RequestBaptismCertificate;