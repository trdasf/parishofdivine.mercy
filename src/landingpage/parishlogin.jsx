import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash, faChurch, faArrowLeft, faEnvelope, faLock } from "@fortawesome/free-solid-svg-icons";
import pdmLogo from "../assets/pdmlogo.png";
import "./login.css"; // We'll create a shared login styles file

const API_URL = "http://parishofdivinemercy.com/backend";

const ParishLogin = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    try {
      // Make API call to authenticate user
      const response = await fetch(`${API_URL}/parish_login.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password
        })
      });

      const data = await response.json();
      
      if (data.success) {
        // Reset attempt count on successful login
        setAttemptCount(0);
        
        // Store user data in localStorage for session management
        localStorage.setItem('parishUser', JSON.stringify({
          userID: data.user.userID,
          firstName: data.user.firstName,
          middleName: data.user.middleName,
          lastName: data.user.lastName,
          email: data.user.email,
          position: data.user.position,
          membershipStatus: data.user.membershipStatus,
          loginTime: new Date().toISOString()
        }));
        
        // Navigate to parish dashboard after successful login
        navigate("/parish-dashboard");
      } else {
        // Increment attempt count
        setAttemptCount(prev => prev + 1);
        
        // Handle different error types with more specific messages
        switch (data.error) {
          case "invalid_credentials":
            if (attemptCount >= 2) {
              setError("Multiple failed attempts detected. Please double-check your email and password. If you continue to have issues, contact your administrator.");
            } else {
              setError("Invalid email or password. Please check your credentials and try again.");
            }
            break;
          case "access_denied":
            setError("Access denied. Only Parish organizers can access this system. Please contact your administrator if you believe this is an error.");
            break;
          case "account_inactive":
            setError("Your account is currently inactive. Please contact your administrator to reactivate your account.");
            break;
          case "invalid_email_format":
            setError("Please enter a valid email address format (e.g., name@domain.com).");
            break;
          case "missing_credentials":
            setError("Please enter both email and password to continue.");
            break;
          case "server_error":
            setError("Server error occurred. Please try again in a few moments or contact technical support.");
            break;
          default:
            setError(data.message || "Login failed. Please verify your credentials and try again.");
            break;
        }
      }
    } catch (err) {
      console.error("Login error:", err);
      setAttemptCount(prev => prev + 1);
      
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        setError("Network connection error. Please check your internet connection and try again.");
      } else if (err.name === 'SyntaxError') {
        setError("Server response error. Please try again later or contact technical support.");
      } else {
        setError("An unexpected error occurred. Please try again later.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle password visibility toggle
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Clear error when user starts typing
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (error) {
      setError("");
      setAttemptCount(0); // Reset attempt count when user starts fresh
    }
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (error) {
      setError("");
      setAttemptCount(0); // Reset attempt count when user starts fresh
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
            <label htmlFor="parish-email">Email Address</label>
          </div>
          <div className="form-group">
            <div className="input-field">
              <input
                type="email"
                id="parish-email"
                placeholder="Enter your email address"
                value={email}
                onChange={handleEmailChange}
                required
                disabled={isLoading}
                autoComplete="email"
              />
              <FontAwesomeIcon icon={faEnvelope} className="input-icon" />
            </div>
          </div>
          
          <div className="form-label">
            <label htmlFor="password">Password</label>
          </div>
          <div className="form-group">
            <div className="password-field">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                placeholder="Enter your password"
                value={password}
                onChange={handlePasswordChange}
                required
                disabled={isLoading}
                autoComplete="current-password"
                className={showPassword ? "password-visible" : ""}
              />
              <FontAwesomeIcon icon={faLock} className="input-icon" />
              <FontAwesomeIcon
                icon={showPassword ? faEyeSlash : faEye}
                className={`password-toggle ${showPassword ? 'password-shown' : 'password-hidden'}`}
                onClick={togglePasswordVisibility}
                title={showPassword ? "Hide password" : "Show password"}
              />
            </div>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="form-actions-button">
            <button 
              type="submit" 
              className="login-submit-btn"
              disabled={isLoading || !email.trim() || !password}
            >
              {isLoading ? 'LOGGING IN...' : 'LOGIN'}
            </button>
          </div>
        </form>

        {/* Additional info or help text */}
        <div className="login-footer">
          <p>Only Parish organizers with active accounts can access this system.</p>
        </div>
      </div>
    </div>
  );
};

export default ParishLogin;