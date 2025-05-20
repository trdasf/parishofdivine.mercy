import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash, faChurch, faArrowLeft, faUser, faLock } from "@fortawesome/free-solid-svg-icons";
import pdmLogo from "../assets/pdmlogo.png";
import "./login.css"; // We'll create a shared login styles file

const ParishLogin = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Check credentials
    if (username === "parish" && password === "password") {
      // Clear any error messages
      setError("");
      // Navigate to parish dashboard after successful login
      navigate("/parish-dashboard");
    } else {
      // Show error message for invalid credentials
      setError("Invalid username or password");
    }
  };

  return (
    <div className="login-page">
      <button className="back-button" onClick={() => navigate("/")}>
        <FontAwesomeIcon icon={faArrowLeft} /> Back to Home
      </button>
      
      <div className="login-container">
        <div className="login-header">
          <img src={pdmLogo} alt="Parish Logo" className="login-logo" />
          <h1>Parish Login</h1>
          <div className="role-icon-container">
            <FontAwesomeIcon icon={faChurch} className="role-page-icon" />
          </div>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-label">
            <label htmlFor="parish-username">Username</label>
            </div>
              <div className="form-group">
              <div className="input-field">
            <input
              type="text"
              id="parish-username"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
                <FontAwesomeIcon icon={faUser} className="input-icon" />
              </div>
                            </div>
              <div className="form-label">
            <label htmlFor="password">Password</label>
            <div className="password-field">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <FontAwesomeIcon icon={faLock} className="input-icon" />
              <FontAwesomeIcon
                icon={showPassword ? faEyeSlash : faEye}
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              />
            </div>
          </div>

          {error && (
            <div className="error-message" style={{ color: 'red', marginBottom: '10px' }}>
              {error}
            </div>
          )}

          <div className="form-actions-button">
            <button type="submit" className="login-submit-btn">LOGIN</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ParishLogin;