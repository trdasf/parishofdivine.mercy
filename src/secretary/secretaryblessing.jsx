import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./secretaryblessing.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";

const SecretaryBlessing = () => {
  const navigate = useNavigate();
  const [filterType, setFilterType] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Sample data with different blessing types
  const blessingData = [
    {
      id: 201,
      firstName: "Maria",
      middleName: "Santos",
      lastName: "Garcia",
      date: "05/15/2025",
      time: "10:00 AM",
      blessingType: "house",
      status: "PENDING",
      createdAt: "04/10/2025",
      gender: "Female",
      age: "35",
      dateOfBirth: "1990-03-12",
      contactNumber: "09123456789",
      emailAddress: "maria.garcia@example.com",
      street: "123 Main St.",
      municipality: "Makati City",
      province: "Metro Manila",
      location: "456 New Home Street, Makati City",
      purpose: "New Home Blessing",
      notes: "Family would like to have the blessing before moving in.",
      priestName: "Fr. John Doe",
      certificate: {
        registerNumber: "1",
        pageNumber: "97",
        lineNumber: "6",
        dateIssued: "May 15, 2025",
        purposeOf: "Documentation"
      },
      requirements: {
        valid_id: {
          submitted: true,
          fileName: "ValidID_MariaGarcia.pdf"
        },
        proof_of_ownership: {
          submitted: true,
          fileName: "ProofOfOwnership_House.pdf"
        },
        barangay_clearance: {
          submitted: false,
          fileName: ""
        }
      }
    },
    {
      id: 202,
      firstName: "Carlos",
      middleName: "Reyes",
      lastName: "Mendoza",
      date: "05/20/2025",
      time: "2:00 PM",
      blessingType: "business",
      status: "APPROVED",
      createdAt: "04/15/2025",
      gender: "Male",
      age: "42",
      dateOfBirth: "1983-07-22",
      contactNumber: "09187654321",
      emailAddress: "carlos.mendoza@example.com",
      street: "567 Commerce Ave.",
      municipality: "Taguig City",
      province: "Metro Manila",
      location: "Unit 10-B, Sunrise Business Center, Taguig City",
      purpose: "Mendoza Computer Shop",
      notes: "Opening day is scheduled for May 25, 2025.",
      priestName: "Fr. Michael Santos",
      certificate: {
        registerNumber: "2",
        pageNumber: "98",
        lineNumber: "3",
        dateIssued: "May 20, 2025",
        purposeOf: "Business Documentation"
      },
      requirements: {
        valid_id: {
          submitted: true,
          fileName: "ValidID_CarlosMendoza.pdf"
        },
        business_permit: {
          submitted: true,
          fileName: "BusinessPermit_MendozaComputerShop.pdf"
        }
      }
    },
    {
      id: 203,
      firstName: "Aira",
      middleName: "Cruz",
      lastName: "Santos",
      date: "05/25/2025",
      time: "3:00 PM",
      blessingType: "car",
      status: "PENDING",
      createdAt: "04/20/2025",
      gender: "Female",
      age: "29",
      dateOfBirth: "1996-09-15",
      contactNumber: "09156789012",
      emailAddress: "aira.santos@example.com",
      street: "789 Sunset Drive",
      municipality: "Pasig City",
      province: "Metro Manila",
      location: "Divine Mercy Parish Parking Area",
      purpose: "Toyota Innova 2025 (ABC-1234)",
      notes: "First family vehicle, would like special prayers for safe travels.",
      priestName: "Fr. James Reyes",
      certificate: {
        registerNumber: "3",
        pageNumber: "99",
        lineNumber: "7",
        dateIssued: "May 25, 2025",
        purposeOf: "Vehicle Documentation"
      },
      requirements: {
        valid_id: {
          submitted: true,
          fileName: "ValidID_AiraSantos.pdf"
        },
        vehicle_registration: {
          submitted: true,
          fileName: "VehicleRegistration_ToyotaInnova.pdf"
        }
      }
    }
  ];

  // Filter data based on blessing type and search term
  const filteredData = blessingData.filter(blessing => {
    const matchesType = filterType === "" || blessing.blessingType === filterType;
    const matchesSearch = searchTerm === "" || 
      blessing.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blessing.lastName.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesType && matchesSearch;
  });

  const viewBlessingDetails = (blessing) => {
    navigate("/secretary-blessing-view", {
      state: { viewOnly: true, blessingData: blessing }
    });
  };

  return (
    <div className="blessing-container-sb">
      <h1 className="title-sb">BLESSING APPOINTMENTS</h1>
      <div className="blessing-actions-sb">
        <div className="search-bar-sb">
          <input 
            type="text" 
            placeholder="Search" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <FontAwesomeIcon icon={faSearch} className="search-icon-sb" />
        </div>

        <div className="filter-container-sb">
          <select 
            className="filter-select-sb"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="">All Blessing Types</option>
            <option value="house">House Blessing</option>
            <option value="business">Business Blessing</option>
            <option value="car">Car Blessing</option>
          </select>
        </div>
      </div>

      <table className="blessing-table-sb">
        <thead>
          <tr>
            <th>No.</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Blessing Type</th>
            <th>Date</th>
            <th>Time</th>
            <th>Status</th>
            <th>Created At</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((blessing) => (
            <tr key={blessing.id}>
              <td>{blessing.id}</td>
              <td>{blessing.firstName}</td>
              <td>{blessing.lastName}</td>
              <td>{blessing.blessingType.charAt(0).toUpperCase() + blessing.blessingType.slice(1)} Blessing</td>
              <td>{blessing.date}</td>
              <td>{blessing.time}</td>
              <td>{blessing.status}</td>
              <td>{blessing.createdAt}</td>
              <td>
                <button
                  className="sb-details"
                  onClick={() => viewBlessingDetails(blessing)}
                >
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SecretaryBlessing;