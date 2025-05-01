import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faPlus, faTimes, faCalendarAlt } from "@fortawesome/free-solid-svg-icons";
import "./secretaryschedule.css";

const SecretarySchedule = () => {
  const [showModal, setShowModal] = useState(false);
  const [showParishModal, setShowParishModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentSchedule, setCurrentSchedule] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [parishFilter, setParishFilter] = useState("");
  const [sacramentTypeFilter, setSacramentTypeFilter] = useState("");
  const [newParishName, setNewParishName] = useState("");
  
  // Sample schedule data - in a real app, this would come from an API/database
  const [schedules, setSchedules] = useState([
    {
      id: 2001,
      sacramentType: "Communion",
      parishName: "St. Joseph Parish",
      date: "2025-05-05",
      time: "08:00",
      createdAt: "2025-04-20T08:30:00",
      scheduleCode: "SCH-2025-0001"
    },
    {
      id: 2002,
      sacramentType: "Marriage",
      parishName: "Holy Family Church",
      date: "2025-05-10",
      time: "14:00",
      createdAt: "2025-04-22T14:45:00",
      scheduleCode: "SCH-2025-0002"
    }
  ]);

  // Parish list
  const [parishes, setParishes] = useState([
    "St. Joseph Parish",
    "Holy Family Church",
    "Sacred Heart Parish",
    "Our Lady of Peace",
    "Christ the King Cathedral"
  ]);

  // Sacrament Types list
  const sacramentTypes = [
    "Baptism",
    "Marriage",
    "Funeral Mass",
    "Confirmation",
    "Communion",
    "Blessing"
  ];

  const toggleModal = (schedule = null) => {
    if (schedule) {
      setIsEditing(true);
      setCurrentSchedule(schedule);
    } else {
      setIsEditing(false);
      setCurrentSchedule(null);
    }
    setShowModal(!showModal);
  };

  const toggleParishModal = () => {
    setShowParishModal(!showParishModal);
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle parish filter change
  const handleParishFilterChange = (e) => {
    setParishFilter(e.target.value);
  };

  // Handle sacrament type filter change
  const handleSacramentTypeFilterChange = (e) => {
    setSacramentTypeFilter(e.target.value);
  };

  // Handle new parish name change
  const handleNewParishChange = (e) => {
    setNewParishName(e.target.value);
  };

  // Add new parish
  const handleAddParish = (e) => {
    e.preventDefault();
    if (newParishName.trim() && !parishes.includes(newParishName.trim())) {
      setParishes([...parishes, newParishName.trim()]);
      setNewParishName("");
      toggleParishModal();
    }
  };

  // Filter schedules based on search term and filters
  const filteredSchedules = schedules.filter(schedule => {
    const sacramentTypeMatch = schedule.sacramentType.toLowerCase().includes(searchTerm.toLowerCase());
    const parishNameMatch = schedule.parishName.toLowerCase().includes(searchTerm.toLowerCase());
    const scheduleCodeMatch = schedule.scheduleCode.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSearch = searchTerm === "" || sacramentTypeMatch || parishNameMatch || scheduleCodeMatch;
    
    const matchesParish = parishFilter === "" || schedule.parishName === parishFilter;
    const matchesSacramentType = sacramentTypeFilter === "" || schedule.sacramentType === sacramentTypeFilter;
    
    return matchesSearch && matchesParish && matchesSacramentType;
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    // Generate schedule code for new schedules
    let scheduleCode = formData.get('scheduleCode');
    if (!isEditing) {
      const currentDate = new Date();
      const year = currentDate.getFullYear();
      const count = schedules.length + 1;
      scheduleCode = `SCH-${year}-${String(count).padStart(4, '0')}`;
    }

    const scheduleData = {
      id: isEditing ? currentSchedule.id : Date.now(),
      sacramentType: formData.get('sacramentType'),
      parishName: formData.get('parishName'),
      date: formData.get('date'),
      time: formData.get('time'),
      createdAt: isEditing ? currentSchedule.createdAt : new Date().toISOString(),
      scheduleCode: scheduleCode
    };

    if (isEditing) {
      // Update existing schedule
      const updatedSchedules = schedules.map(schedule => 
        schedule.id === currentSchedule.id ? scheduleData : schedule
      );
      setSchedules(updatedSchedules);
    } else {
      // Add new schedule
      setSchedules([...schedules, scheduleData]);
    }

    // Close modal
    toggleModal();
  };

  const formatDateTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return date.toLocaleString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const time = new Date();
    time.setHours(parseInt(hours));
    time.setMinutes(parseInt(minutes));
    
    return time.toLocaleString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="schedule-container-ssc">
      <div className="title-container-ssc">
        <h1 className="title-ssc">SCHEDULE MANAGEMENT</h1>
      </div>
      
      <div className="schedule-actions-ssc">
        <div className="search-bar-ssc">
          <input 
            type="text" 
            placeholder="Search by sacrament type, parish or schedule code" 
            value={searchTerm} 
            onChange={handleSearchChange}
          />
          <FontAwesomeIcon icon={faSearch} className="search-icon-ssc" />
        </div>

        <div className="filter-add-container-ssc">
          <select 
            className="filter-select-ssc"
            value={parishFilter}
            onChange={handleParishFilterChange}
          >
            <option value="">All Parishes</option>
            {parishes.map((parish, index) => (
              <option key={index} value={parish}>{parish}</option>
            ))}
          </select>

          <select 
            className="filter-select-ssc"
            value={sacramentTypeFilter}
            onChange={handleSacramentTypeFilterChange}
          >
            <option value="">All Sacrament Types</option>
            {sacramentTypes.map((type, index) => (
              <option key={index} value={type}>{type}</option>
            ))}
          </select>

          <button className="add-btn-ssc" onClick={toggleParishModal}>
            <FontAwesomeIcon icon={faPlus} /> ADD PARISH
          </button>

          <button className="add-btn-ssc" onClick={() => toggleModal()}>
            <FontAwesomeIcon icon={faPlus} /> ADD
          </button>
        </div>
      </div>

      <table className="schedule-table-ssc">
        <thead>
          <tr>
            <th>Schedule Code</th>
            <th>Sacrament Type</th>
            <th>Parish Name</th>
            <th>Date</th>
            <th>Time</th>
            <th>Created At</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredSchedules.length > 0 ? (
            filteredSchedules.map(schedule => (
              <tr key={schedule.id}>
                <td>{schedule.scheduleCode}</td>
                <td>{schedule.sacramentType}</td>
                <td>{schedule.parishName}</td>
                <td>{formatDate(schedule.date)}</td>
                <td>{formatTime(schedule.time)}</td>
                <td>{formatDateTime(schedule.createdAt)}</td>
                <td>
                  <button className="ssc-details" onClick={() => toggleModal(schedule)}>
                    Edit
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="no-results-ssc">No schedules found</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Schedule Modal */}
      {showModal && (
        <div className="schedule-modal-overlay-ssc">
          <div className="schedule-modal-ssc">
            <div className="schedule-modal-header-ssc">
              <h2>{isEditing ? 'Edit Schedule' : 'Add New Schedule'}</h2>
              <button className="close-modal-btn-ssc" onClick={() => toggleModal()}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div>
              <hr className="custom-hr-ssc"/>
            </div>
            <form onSubmit={handleSubmit} className="schedule-form-ssc">
              {isEditing && (
                <div className="form-row-ssc">
                  <div className="form-group-ssc">
                    <label>Schedule Code</label>
                    <input 
                      type="text" 
                      name="scheduleCode"
                      defaultValue={currentSchedule?.scheduleCode || ''}
                      readOnly
                    />
                  </div>
                  <div className="form-group-ssc">
                    <label>Created At</label>
                    <input 
                      type="text" 
                      defaultValue={currentSchedule ? formatDateTime(currentSchedule.createdAt) : ''}
                      readOnly
                    />
                  </div>
                </div>
              )}

              <div className="form-row-ssc">
                <div className="form-group-ssc">
                  <label>Sacrament Type</label>
                  <select 
                    name="sacramentType" 
                    required 
                    defaultValue={currentSchedule?.sacramentType || ''}
                  >
                    <option value="">Select Sacrament Type</option>
                    {sacramentTypes.map((type, index) => (
                      <option key={index} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row-ssc">
                <div className="form-group-ssc">
                  <label>Parish Name</label>
                  <select 
                    name="parishName" 
                    required 
                    defaultValue={currentSchedule?.parishName || ''}
                  >
                    <option value="">Select Parish</option>
                    {parishes.map((parish, index) => (
                      <option key={index} value={parish}>{parish}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row-ssc">
                <div className="form-group-ssc">
                  <label>Date</label>
                  <input 
                    type="date" 
                    name="date" 
                    required 
                    defaultValue={currentSchedule?.date || ''}
                  />
                </div>
              </div>

              <div className="form-row-ssc">
                <div className="form-group-ssc">
                  <label>Time</label>
                  <input 
                    type="time" 
                    name="time" 
                    required 
                    defaultValue={currentSchedule?.time || ''}
                  />
                </div>
              </div>

              <div className="form-actions-ssc">
                <button type="submit" className="submit-btn-ssc">
                  {isEditing ? 'Update' : 'Save'}
                </button>
                <button type="button" className="cancel-btn-ssc" onClick={() => toggleModal()}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Parish Modal */}
      {showParishModal && (
        <div className="schedule-modal-overlay-ssc">
          <div className="schedule-modal-ssc" style={{ maxWidth: '500px' }}>
            <div className="schedule-modal-header-ssc">
              <h2>Add New Parish</h2>
              <button className="close-modal-btn-ssc" onClick={toggleParishModal}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div>
              <hr className="custom-hr-ssc"/>
            </div>
            <form onSubmit={handleAddParish} className="schedule-form-ssc">
              <div className="form-row-ssc">
                <div className="form-group-ssc">
                  <label>Parish Name</label>
                  <input 
                    type="text" 
                    value={newParishName}
                    onChange={handleNewParishChange}
                    required 
                    placeholder="Enter parish name"
                  />
                </div>
              </div>

              <div className="form-actions-ssc">
                <button type="submit" className="submit-btn-ssc">
                  Add Parish
                </button>
                <button type="button" className="cancel-btn-ssc" onClick={toggleParishModal}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SecretarySchedule;