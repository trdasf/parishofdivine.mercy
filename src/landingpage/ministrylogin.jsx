import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash, faHandsHelping, faArrowLeft, faUser, faLock} from "@fortawesome/free-solid-svg-icons";
import pdmLogo from "../assets/pdmlogo.png";
import "./login.css"; // Shared login styles

const MinistryLogin = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData({
      ...formData,
      [id === "ministry-email" ? "email" : id]: value
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      const response = await fetch("https://parishofdivinemercy.com/backend/ministry_login.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Store user data in localStorage for persistence across page refreshes
        localStorage.setItem("ministry_user", JSON.stringify(data.user));
        
        // Also pass the user data via location state for direct access in components
        console.log("User logged in successfully:", data.user);
        navigate("/ministry-dashboard", { 
          state: { 
            userData: data.user,
            userID: data.user.userID
          } 
        });
      } else {
        setError(data.message || "Login failed. Please check your credentials.");
      }
    } catch (error) {
      setError("An error occurred. Please try again later.");
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page ministry-theme">
      <button className="back-button" onClick={() => navigate("/")}>
        <FontAwesomeIcon icon={faArrowLeft} /> Back to Home
      </button>
      
      <div className="login-container">
        <div className="login-header">
          <img src={pdmLogo} alt="Parish Logo" className="login-logo" />
          <h1>Ministry Login</h1>
          <div className="role-icon-container">
            <FontAwesomeIcon icon={faHandsHelping} className="role-page-icon" />
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-label">
            <label htmlFor="ministry-email">Email</label>
             </div>
              <div className="form-group">
              <div className="input-field">
            <input
              type="email"
              id="ministry-email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleInputChange}
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
                value={formData.password}
                onChange={handleInputChange}
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
          <div className="form-actions-button">
            <button 
              type="submit" 
              className="login-submit-btn"
              disabled={loading}
            >
              {loading ? "LOGGING IN..." : "LOGIN"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MinistryLogin;