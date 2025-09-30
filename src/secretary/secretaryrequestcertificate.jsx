import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faChevronDown } from "@fortawesome/free-solid-svg-icons";
import "./secretaryrequestcertificate.css";

const SecretaryRequestCertificate = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [certificates, setCertificates] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filterSacrament, setFilterSacrament] = useState("All Sacraments");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [error, setError] = useState("");

  const sacramentTypes = [
    "All Sacraments",
    "Baptism",
    "Marriage", 
    "Communion",
    "Confirmation"
  ];

  // Fetch all certificate requests from database
  const fetchAllRequests = async () => {
    setIsLoading(true);
    setError("");
    
    try {
      const response = await fetch('http://parishofdivinemercy.com/backend/get_all_requests.php', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setCertificates(result.data || []);
        
        // Console log all the original IDs for debugging
        console.log('All certificate requests:', result.data);
        result.data.forEach(cert => {
          console.log(`${cert.sacramentType} - Original ID (${cert.originalType}): ${cert.originalID}, Display ID: ${cert.displayID}`);
        });
      } else {
        throw new Error(result.message || 'Failed to fetch certificate requests');
      }
    } catch (error) {
      console.error('Error fetching certificate requests:', error);
      setError(error.message || 'Failed to load certificate requests');
      setCertificates([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Load data when component mounts
  useEffect(() => {
    fetchAllRequests();
  }, []);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSacramentFilter = (sacrament) => {
    setFilterSacrament(sacrament);
    setIsDropdownOpen(false);
  };

  const handleViewClick = (certificate) => {
    console.log("Viewing certificate:", certificate);
    console.log(`Navigating to ${certificate.sacramentType} with ${certificate.originalType}: ${certificate.originalID}`);
    
    // Navigate based on sacrament type and pass the appropriate ID
    switch(certificate.sacramentType.toLowerCase()) {
      case 'baptism':
        navigate("/secretary-baptism-certificate-view", { 
          state: { 
            certificate,
            reqbaptismID: certificate.originalID 
          } 
        });
        break;
      case 'marriage':
        navigate("/secretary-marriage-certificate-view", { 
          state: { 
            certificate,
            reqmarriageID: certificate.originalID 
          } 
        });
        break;
      case 'communion':
        navigate("/secretary-communion-certificate-view", { 
          state: { 
            certificate,
            reqcommunionID: certificate.originalID 
          } 
        });
        break;
      case 'confirmation':
        navigate("/secretary-confirmation-certificate-view", { 
          state: { 
            certificate,
            reqconfirmationID: certificate.originalID 
          } 
        });
        break;
      default:
        console.log("Unknown sacrament type:", certificate.sacramentType);
    }
  };

  // Filter certificates based on search term and sacrament type
  const filteredCertificates = certificates.filter(certificate => {
    const matchesSearch = !searchTerm.trim() || 
      certificate.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      certificate.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      certificate.middleName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      certificate.sacramentType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      certificate.displayID?.toString().includes(searchTerm);

    const matchesSacrament = filterSacrament === "All Sacraments" || 
      certificate.sacramentType === filterSacrament;

    return matchesSearch && matchesSacrament;
  });

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toISOString().split('T')[0];
    } catch (error) {
      return dateString;
    }
  };

  return (
    <div className="certificate-container-src">
      <div className="title-container-src">
        <h1 className="title-src">Request Certificates</h1>
      </div>
      
      <div className="certificate-actions-src">
        <div className="search-bar-src">
          <input 
            type="text" 
            placeholder="Search" 
            value={searchTerm} 
            onChange={handleSearch}
          />
          <FontAwesomeIcon icon={faSearch} className="search-icon-src" />
        </div>

        <div className="filter-container-src">
          <div className="filter-dropdown-src">
            <button 
              className="filter-btn-src" 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              {filterSacrament}
              <FontAwesomeIcon icon={faChevronDown} className={`dropdown-icon-src ${isDropdownOpen ? 'rotate' : ''}`} />
            </button>
            {isDropdownOpen && (
              <div className="filter-dropdown-menu-src">
                {sacramentTypes.map((sacrament) => (
                  <div 
                    key={sacrament}
                    className="filter-dropdown-item-src"
                    onClick={() => handleSacramentFilter(sacrament)}
                  >
                    {sacrament}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="error-message-src">
          {error}
          <button onClick={fetchAllRequests} className="retry-btn-src">
            Retry
          </button>
        </div>
      )}

      <table className="certificate-table-src">
        <thead>
          <tr>
            <th>ID</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Sacrament Type</th>
            <th>Date</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan="6" className="loading-src">Loading certificates...</td>
            </tr>
          ) : filteredCertificates.length > 0 ? (
            filteredCertificates.map((certificate) => (
              <tr key={`${certificate.sacramentType}-${certificate.originalID}`}>
                <td>{certificate.displayID}</td>
                <td>{certificate.firstName}</td>
                <td>{certificate.lastName}</td>
                <td>{certificate.sacramentType}</td>
                <td>{formatDate(certificate.formattedDate)}</td>
                <td>
                  <button 
                    className="src-view-btn" 
                    onClick={() => handleViewClick(certificate)}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="no-results-src">
                {searchTerm || filterSacrament !== "All Sacraments" 
                  ? "No certificates match your search criteria" 
                  : "No certificate requests found"
                }
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default SecretaryRequestCertificate;