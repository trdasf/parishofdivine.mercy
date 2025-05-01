import React, { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faPlus, faTimes, faUpload } from "@fortawesome/free-solid-svg-icons";
import "./secretaryusermanagement.css";

const SecretaryUserManagement = () => {
  const [showModal, setShowModal] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showCredentials, setShowCredentials] = useState(true);
  const fileInputRef = useRef(null);

  // Sample user data - in a real app, this would come from an API/database
  const [users, setUsers] = useState([
    {
      id: 101,
      firstName: "John",
      middleName: "",
      lastName: "Smith",
      profile: null, // Normally this would be an image URL
      gender: "male",
      dateOfBirth: "1990-05-15",
      contactNumber: "+63 912 345 6789",
      nationality: "Filipino",
      religion: "Catholic",
      email: "john.smith@example.com",
      street: "123 Main St",
      municipality: "Makati",
      province: "Metro Manila",
      position: "Youth Ministry", // Changed from Organizer to Youth Ministry
      membershipStatus: "active",
      joinedDate: "2024-01-15",
      username: "johnsmith",
      password: "password123" // In a real app, this would be hashed
    }
  ]);

  const toggleModal = (user = null) => {
    if (user) {
      setIsEditing(true);
      setCurrentUser(user);
      // Always show credentials regardless of position
      setShowCredentials(true);
      if (user.profile) {
        setPreviewImage(user.profile);
      } else {
        setPreviewImage(null);
      }
    } else {
      setIsEditing(false);
      setCurrentUser(null);
      setPreviewImage(null);
      setShowCredentials(true); // Always show credentials for new users
    }
    setShowModal(!showModal);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handlePositionChange = (e) => {
    // Always show credentials regardless of position
    setShowCredentials(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const position = formData.get('position');
    
    const userData = {
      id: isEditing ? currentUser.id : Date.now(), // Generate a new ID for new users
      firstName: formData.get('firstName'),
      middleName: formData.get('middleName'),
      lastName: formData.get('lastName'),
      profile: previewImage,
      gender: formData.get('gender'),
      dateOfBirth: formData.get('dateOfBirth'),
      contactNumber: formData.get('contactNumber'),
      nationality: formData.get('nationality'),
      religion: formData.get('religion'),
      email: formData.get('email'),
      street: formData.get('street'),
      municipality: formData.get('municipality'),
      province: formData.get('province'),
      position: position,
      membershipStatus: formData.get('membershipStatus'),
      joinedDate: formData.get('joinedDate'),
      username: formData.get('username'),
      password: formData.get('password')
    };

    if (isEditing) {
      // Update existing user
      const updatedUsers = users.map(user => 
        user.id === currentUser.id ? userData : user
      );
      setUsers(updatedUsers);
    } else {
      // Add new user
      setUsers([...users, userData]);
    }

    // Close modal and reset state
    toggleModal();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit', 
      year: 'numeric'
    });
  };

  return (
    <div className="user-container-sum">
      <h1 className="title-sum">USER MANAGEMENT</h1>
      <div className="user-actions-sum">
        <div className="search-bar-sum">
          <input type="text" placeholder="Search" />
          <FontAwesomeIcon icon={faSearch} className="search-icon-sum" />
        </div>

        <div className="filter-add-container-sum">
          <select className="filter-select-sum">
            <option value="">Position</option>
            <option value="youth-ministry">Youth Ministry</option>
            <option value="music-ministry">Music Ministry</option>
            <option value="outreach-ministry">Outreach Ministry</option>
          </select>

          <button className="add-btn-sum" onClick={() => toggleModal()}>
            <FontAwesomeIcon icon={faPlus} /> ADD
          </button>
        </div>
      </div>

      <table className="user-table-sum">
        <thead>
          <tr>
            <th>No.</th>
            <th>Profile</th>
            <th>Name</th>
            <th>Contact Number</th>
            <th>Organizer</th>
            <th>Joined Date</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>
                <div className="profile-placeholder-sum">
                  {user.profile ? (
                    <img src={user.profile} alt="Profile" />
                  ) : (
                    <span>{user.firstName.charAt(0)}</span>
                  )}
                </div>
              </td>
              <td>{`${user.firstName} ${user.lastName}`}</td>
              <td>{user.contactNumber}</td>
              <td>{user.position}</td>
              <td>{formatDate(user.joinedDate)}</td>
              <td>
                <button className="sum-details" onClick={() => toggleModal(user)}>Edit</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* User Registration/Edit Modal */}
      {showModal && (
        <div className="user-modal-overlay-sum">
          <div className="user-modal-sum">
            <div className="user-modal-header-sum">
              <h2>{isEditing ? 'Edit User' : 'Add New User'}</h2>
              <button className="close-modal-btn-sum" onClick={() => toggleModal()}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div>
              <hr className="custom-hr-sum"/>
            </div>
            <form onSubmit={handleSubmit} className="user-form-sum">
              <div className="profile-upload-sum">
                <div 
                  className="profile-image-container-sum" 
                  onClick={triggerFileInput}
                >
                  {previewImage ? (
                    <img src={previewImage} alt="Profile Preview" className="profile-preview-sum" />
                  ) : (
                    <div className="upload-placeholder-sum">
                      <FontAwesomeIcon icon={faUpload} />
                      <span>Upload Photo</span>
                    </div>
                  )}
                </div>
                <input 
                  type="file" 
                  accept="image/*" 
                  ref={fileInputRef} 
                  onChange={handleImageUpload} 
                  style={{ display: 'none' }} 
                />
              </div>

              <div className="form-row-sum">
                <div className="form-group-sum">
                  <label>First Name</label>
                  <input 
                    type="text" 
                    name="firstName" 
                    required 
                    defaultValue={currentUser?.firstName || ''}
                  />
                </div>
                <div className="form-group-sum">
                  <label>Middle Name</label>
                  <input 
                    type="text" 
                    name="middleName" 
                    defaultValue={currentUser?.middleName || ''}
                  />
                </div>
                <div className="form-group-sum">
                  <label>Last Name</label>
                  <input 
                    type="text" 
                    name="lastName" 
                    required 
                    defaultValue={currentUser?.lastName || ''}
                  />
                </div>
              </div>

              <div className="form-row-sum">
                <div className="form-group-sum">
                  <label>Gender</label>
                  <select 
                    name="gender" 
                    required 
                    defaultValue={currentUser?.gender || ''}
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="form-group-sum">
                  <label>Date of Birth</label>
                  <input 
                    type="date" 
                    name="dateOfBirth" 
                    required 
                    defaultValue={currentUser?.dateOfBirth || ''}
                  />
                </div>
                <div className="form-group-sum">
                  <label>Contact Number</label>
                  <input 
                    type="tel" 
                    name="contactNumber" 
                    required 
                    defaultValue={currentUser?.contactNumber || ''}
                  />
                </div>
              </div>

              <div className="form-row-sum">
                <div className="form-group-sum">
                  <label>Nationality</label>
                  <input 
                    type="text" 
                    name="nationality" 
                    required 
                    defaultValue={currentUser?.nationality || ''}
                  />
                </div>
                <div className="form-group-sum">
                  <label>Religion</label>
                  <input 
                    type="text" 
                    name="religion" 
                    required 
                    defaultValue={currentUser?.religion || ''}
                  />
                </div>
                <div className="form-group-sum">
                  <label>Email Address</label>
                  <input 
                    type="email" 
                    name="email" 
                    required 
                    defaultValue={currentUser?.email || ''}
                  />
                </div>
              </div>

              <div className="form-row-sum">
              <div className="form-group-sum">
                  <label>Barangay</label>
                  <input 
                    type="text" 
                    name="street" 
                    required 
                    defaultValue={currentUser?.street || ''}
                  />
                </div>
                <div className="form-group-sum">
                  <label>Street</label>
                  <input 
                    type="text" 
                    name="street" 
                    required 
                    defaultValue={currentUser?.street || ''}
                  />
                </div>
                <div className="form-group-sum">
                  <label>Municipality</label>
                  <input 
                    type="text" 
                    name="municipality" 
                    required 
                    defaultValue={currentUser?.municipality || ''}
                  />
                </div>
                <div className="form-group-sum">
                  <label>Province</label>
                  <input 
                    type="text" 
                    name="province" 
                    required 
                    defaultValue={currentUser?.province || ''}
                  />
                </div>
              </div>

              <div className="form-row-sum">
                <div className="form-group-sum">
                  <label>Organizer</label>
                  <select 
                    name="position" 
                    required 
                    defaultValue={currentUser?.position || ''}
                    onChange={handlePositionChange}
                  >
                    <option value="">Select Position</option>
                    <option value="Youth Ministry">Youth Ministry</option>
                    <option value="Music Ministry">Music Ministry</option>
                    <option value="Outreach Ministry">Outreach Ministry</option>
                  </select>
                </div>
                <div className="form-group-sum">
                  <label>Membership Status</label>
                  <select 
                    name="membershipStatus" 
                    required 
                    defaultValue={currentUser?.membershipStatus || ''}
                  >
                    <option value="">Select Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
                <div className="form-group-sum">
                  <label>Joined Date</label>
                  <input 
                    type="date" 
                    name="joinedDate" 
                    required 
                    defaultValue={currentUser?.joinedDate || ''}
                  />
                </div>
              </div>

              {/* Always show credentials section regardless of position */}
              <div className="form-row-sum">
                <div className="form-group-sum">
                  <label>Username</label>
                  <input 
                    type="text" 
                    name="username" 
                    required
                    defaultValue={currentUser?.username || ''}
                  />
                </div>
                <div className="form-group-sum">
                  <label>Password</label>
                  <input 
                    type="password" 
                    name="password" 
                    required
                    defaultValue={currentUser?.password || ''}
                  />
                </div>
                <div className="form-group-sum">
                  <label>Confirm Password</label>
                  <input 
                    type="password" 
                    name="confirmPassword" 
                    required
                    defaultValue={currentUser?.password || ''}
                  />
                </div>
              </div>

              <div className="form-actions-sum">
                <button type="submit" className="submit-btn-sum">
                  {isEditing ? 'Update' : 'Save'}
                </button>
                <button type="button" className="cancel-btn-sum" onClick={() => toggleModal()}>
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

export default SecretaryUserManagement;