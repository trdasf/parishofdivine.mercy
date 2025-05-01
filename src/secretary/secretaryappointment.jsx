import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./secretaryappointment.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";

const SecretaryAppointment = () => {
  const navigate = useNavigate();
  const [selectedAppointments, setSelectedAppointments] = useState([]);

  // Sample appointment data - in a real app, this would come from an API/database
  const sampleAppointments = [
    {
      id: 101,
      firstName: "Kimi",
      lastName: "Rot",
      sacramentType: "Baptism",
      date: "03/02/2025",
      time: "9:00 AM",
      status: "Pending",
      createdAt: "02/28/2025"
    },
    {
      id: 102,
      firstName: "Maria",
      lastName: "Santos",
      sacramentType: "Marriage",
      date: "03/15/2025",
      time: "2:00 PM",
      status: "Approved",
      createdAt: "03/01/2025"
    },
    {
      id: 103,
      firstName: "Juan",
      lastName: "Cruz",
      sacramentType: "Confirmation",
      date: "03/20/2025",
      time: "10:30 AM",
      status: "Pending",
      createdAt: "03/05/2025"
    }
  ];

  // View appointment details
  const viewAppointmentDetails = (appointmentData) => {
    // Navigate to appropriate form with appointment data
    switch(appointmentData.sacramentType) {
      case "Baptism":
        navigate("/secretary-baptism-view", { state: { appointmentData } });
        break;
      case "Marriage":
        navigate("/secretary-marriage-view", { state: { appointmentData } });
        break;
      case "Funeral Mass":
        navigate("/secretary-funeral-mass-view", { state: { appointmentData } });
        break;
      case "Blessing":
        navigate("/secretary-blessing-view", { state: { appointmentData } });
        break;
      case "Confirmation":
        navigate("/secretary-confirmation-view", { state: { appointmentData } });
        break;
      case "Communion":
        navigate("/secretary-communion-view", { state: { appointmentData } });
        break;
      default:
        console.log(`Unknown sacrament: ${appointmentData.sacramentType}`);
    }
  };

  // Handle selection of appointments
  const handleSelectAppointment = (id) => {
    if (selectedAppointments.includes(id)) {
      setSelectedAppointments(selectedAppointments.filter(appId => appId !== id));
    } else {
      setSelectedAppointments([...selectedAppointments, id]);
    }
  };

  return (
    <div className="appointment-container-sa">
      <h1 className="title-sa">APPOINTMENT MANAGEMENT</h1>
      <div className="appointment-actions-sa">
        <div className="search-bar-sa">
          <input type="text" placeholder="Search appointments" />
          <FontAwesomeIcon icon={faSearch} className="search-icon-sa" />
        </div>

        <div className="filter-actions-container-sa">
          <select className="filter-select-sa">
            <option value="">Sacrament Type</option>
            <option value="baptism">Baptism</option>
            <option value="marriage">Marriage</option>
            <option value="funeral">Funeral Mass</option>
            <option value="confirmation">Confirmation</option>
            <option value="communion">Communion</option>
            <option value="blessing">Blessing</option>
          </select>

          <select className="filter-select-sa">
            <option value="">Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      <div className="table-container-sa">
        <table className="appointment-table-sa">
          <thead>
            <tr>
              <th>ID</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Sacrament Type</th>
              <th>Date</th>
              <th>Time</th>
              <th>Status</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sampleAppointments.map((appointment) => (
              <tr key={appointment.id}>

                <td>{appointment.id}</td>
                <td>{appointment.firstName}</td>
                <td>{appointment.lastName}</td>
                <td>{appointment.sacramentType}</td>
                <td>{appointment.date}</td>
                <td>{appointment.time}</td>
                <td className={`status-${appointment.status.toLowerCase()}`}>
                  {appointment.status}
                </td>
                <td>{appointment.createdAt}</td>
                <td className="actions-cell-sa">
                  <button
                    className="view-btn-sa"
                    onClick={() => viewAppointmentDetails(appointment)}
                    title="View Details"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </div>
  );
};

export default SecretaryAppointment;