import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faEye, 
  faEyeSlash, 
  faMapMarkerAlt, 
  faArrowLeft, 
  faUser, 
  faPhone, 
  faEnvelope, 
  faLock,
  faTimes
} from "@fortawesome/free-solid-svg-icons";
import pdmLogo from "../assets/pdmlogo.png";
import "./login.css";

const ClientLogin = () => {
  const navigate = useNavigate();
  const [isLoginView, setIsLoginView] = useState(true);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Loading state
  const [isLoading, setIsLoading] = useState(false);
  
  // Error and success messages
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Forgot password modal state
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  
  // Form data states
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  
  const [signupData, setSignupData] = useState({
    first_name: '',
    last_name: '',
    contact_number: '',
    email: '',
    password: '',
    confirm_password: ''
  });

  // Forgot password form data
  const [forgotPasswordData, setForgotPasswordData] = useState({
    email: '',
    new_password: '',
    confirm_new_password: ''
  });
  
  // Handle login submission
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
    
    try {
      const response = await fetch('http://parishofdivinemercy.com/backend/client_login.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: loginData.email,
          password: loginData.password
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Store user data in localStorage
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Navigate to dashboard and pass clientID through location state
        navigate("/client-dashboard", { 
          state: { 
            clientID: data.user.clientID,
            user: data.user 
          } 
        });
      } else {
        setErrorMessage(data.message || 'Invalid email or password.');
      }
    } catch (error) {
      console.error('Error:', error);
      setErrorMessage('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle signup submission
  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
    
    if (signupData.password !== signupData.confirm_password) {
      setErrorMessage('Passwords do not match.');
      setIsLoading(false);
      return;
    }

    // Validate password requirements
    const password = signupData.password;
    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      setIsLoading(false);
      return;
    }

    if (!/[A-Z]/.test(password)) {
      setErrorMessage('Password must contain at least one uppercase letter.');
      setIsLoading(false);
      return;
    }

    if (!/[0-9]/.test(password)) {
      setErrorMessage('Password must contain at least one number.');
      setIsLoading(false);
      return;
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      setErrorMessage('Password must contain at least one special character (!@#$%^&*()_+-=[]{}|;\':",./<>?).');
      setIsLoading(false);
      return;
    }
    
    try {
      const response = await fetch('http://parishofdivinemercy.com/backend/client_registration.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          first_name: signupData.first_name,
          last_name: signupData.last_name,
          contact_number: signupData.contact_number,
          email: signupData.email,
          password: signupData.password
        })
      });
      
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        const data = await response.json();
        
        if (data.success) {
          // Show success message and switch to login view
          setSuccessMessage('Registration successful! You can now login with your account.');
          setTimeout(() => {
            setIsLoginView(true);
            setSuccessMessage('');
            // Clear signup form
            setSignupData({
              first_name: '',
              last_name: '',
              contact_number: '',
              email: '',
              password: '',
              confirm_password: ''
            });
          }, 2000);
        } else {
          setErrorMessage(data.message || 'Registration failed. Please try again.');
        }
      } else {
        const text = await response.text();
        console.error('Non-JSON response:', text);
        setErrorMessage('Server error. Please try again later.');
      }
    } catch (error) {
      console.error('Error:', error);
      setErrorMessage('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle forgot password submission
  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setIsResettingPassword(true);
    setErrorMessage('');
    setSuccessMessage('');

    // Validate passwords match
    if (forgotPasswordData.new_password !== forgotPasswordData.confirm_new_password) {
      setErrorMessage('New passwords do not match.');
      setIsResettingPassword(false);
      return;
    }

    // Validate password requirements
    const password = forgotPasswordData.new_password;
    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      setIsResettingPassword(false);
      return;
    }

    if (!/[A-Z]/.test(password)) {
      setErrorMessage('Password must contain at least one uppercase letter.');
      setIsResettingPassword(false);
      return;
    }

    if (!/[0-9]/.test(password)) {
      setErrorMessage('Password must contain at least one number.');
      setIsResettingPassword(false);
      return;
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      setErrorMessage('Password must contain at least one special character (!@#$%^&*()_+-=[]{}|;\':",./<>?).');
      setIsResettingPassword(false);
      return;
    }

    try {
      const response = await fetch('http://parishofdivinemercy.com/backend/client_forgot_password.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: forgotPasswordData.email,
          new_password: forgotPasswordData.new_password
        })
      });

      const data = await response.json();

      if (data.success) {
        setSuccessMessage('Password has been successfully reset! You can now login with your new password.');
        // Clear the form
        setForgotPasswordData({
          email: '',
          new_password: '',
          confirm_new_password: ''
        });
        // Close modal after 2 seconds
        setTimeout(() => {
          setShowForgotPasswordModal(false);
          setSuccessMessage('');
        }, 2000);
      } else {
        setErrorMessage(data.message || 'Failed to reset password. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      setErrorMessage('Network error. Please check your connection and try again.');
    } finally {
      setIsResettingPassword(false);
    }
  };

  // Handle login input changes
  const handleLoginChange = (e) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value
    });
    // Clear messages when user starts typing
    if (errorMessage) setErrorMessage('');
    if (successMessage) setSuccessMessage('');
  };
  
  // Handle signup input changes
  const handleSignupChange = (e) => {
    setSignupData({
      ...signupData,
      [e.target.name]: e.target.value
    });
    // Clear messages when user starts typing
    if (errorMessage) setErrorMessage('');
    if (successMessage) setSuccessMessage('');
  };

  // Handle forgot password input changes
  const handleForgotPasswordChange = (e) => {
    setForgotPasswordData({
      ...forgotPasswordData,
      [e.target.name]: e.target.value
    });
    // Clear messages when user starts typing
    if (errorMessage) setErrorMessage('');
    if (successMessage) setSuccessMessage('');
  };

  return (
    <div className="login-page client-theme">
      <button className="back-button" onClick={() => navigate("/")}>
        <FontAwesomeIcon icon={faArrowLeft} /> Back to Home
      </button>
      
      <div className="login-container-client">
        <div className="login-header">
          <img src={pdmLogo} alt="Parish Logo" className="login-logo" />
          <h1>{isLoginView ? "Client Login" : "Client Registration"}</h1>
          <div className="role-icon-container">
            <FontAwesomeIcon icon={faUser} className="role-page-icon" />
          </div>
        </div>
        
        {/* Error message display */}
        {errorMessage && (
          <div className="error-message">
            {errorMessage}
          </div>
        )}

        {/* Success message display */}
        {successMessage && (
          <div className="success-message">
            {successMessage}
          </div>
        )}
        
        {isLoginView ? (
          <form className="login-form" onSubmit={handleLoginSubmit}>
            <div className="form-label">
              <label htmlFor="email">Email</label>
              </div>
              <div className="form-group">
              <div className="input-field">
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Enter your email"
                  value={loginData.email}
                  onChange={handleLoginChange}
                  required
                  disabled={isLoading}
                />
                <FontAwesomeIcon icon={faEnvelope} className="input-icon" />
              </div>
                            </div>
              <div className="form-label">
              <label htmlFor="login-password">Password</label>
              <div className="password-field">
                <input
                  type={showLoginPassword ? "text" : "password"}
                  id="login-password"
                  name="password"
                  placeholder="Enter your password"
                  value={loginData.password}
                  onChange={handleLoginChange}
                  required
                  disabled={isLoading}
                />
                <FontAwesomeIcon icon={faLock} className="input-icon" />
                <FontAwesomeIcon
                  icon={showLoginPassword ? faEyeSlash : faEye}
                  className="password-toggle"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                />
              </div>
            </div>

            <div className="form-actions">
              <a href="#" className="forgot-password" onClick={(e) => {
                e.preventDefault();
                setShowForgotPasswordModal(true);
                setErrorMessage('');
                setSuccessMessage('');
              }}>
                Forgot Password?
              </a>
            </div>
            <div className="client-form-actions-button">
              <button 
                type="submit" 
                className="login-submit-btn"
                disabled={isLoading}
              >
                {isLoading ? 'LOGGING IN...' : 'LOGIN'}
              </button>
            </div>
            
            <div className="form-switch">
              <p>Don't have an account? <button type="button" onClick={() => {
                setIsLoginView(false);
                setErrorMessage('');
                setSuccessMessage('');
              }}>Sign Up</button></p>
            </div>
          </form>
        ) : (
          // Signup Form (keeping the same structure as original)
          <form className="signup-form" onSubmit={handleSignupSubmit}>
            <div className="form-row">
              <div className="form-group">
              <div className="form-label">
                <label htmlFor="first-name">First Name</label>
                <div className="input-field">
                  <input
                    type="text"
                    id="first-name"
                    name="first_name"
                    placeholder="Enter your first name"
                    value={signupData.first_name}
                    onChange={handleSignupChange}
                    required
                    disabled={isLoading}
                  />
                  <FontAwesomeIcon icon={faUser} className="input-icon" />
                </div>
              </div>
              </div>
              <div className="form-group">
              
              <div className="form-label">
                <label htmlFor="last-name">Last Name</label>
                <div className="input-field">
                  <input
                    type="text"
                    id="last-name"
                    name="last_name"
                    placeholder="Enter your last name"
                    value={signupData.last_name}
                    onChange={handleSignupChange}
                    required
                    disabled={isLoading}
                  />
                  <FontAwesomeIcon icon={faUser} className="input-icon" />
                </div>
              </div>
            </div>
              </div>
              <div className="form-group">
              <div className="form-label">
                <label htmlFor="contact-number">Contact Number</label>
                <div className="input-field">
                  <input
                    type="tel"
                    id="contact-number"
                    name="contact_number"
                    placeholder="Enter your contact number"
                    value={signupData.contact_number}
                    onChange={handleSignupChange}
                    required
                    disabled={isLoading}
                  />
                  <FontAwesomeIcon icon={faPhone} className="input-icon" />
                </div>
                </div>
              <div className="form-group">
              <div className="form-label">
                <label htmlFor="signup-email">Email</label>
                <div className="input-field">
                  <input
                    type="email"
                    id="signup-email"
                    name="email"
                    placeholder="Enter your email"
                    value={signupData.email}
                    onChange={handleSignupChange}
                    required
                    disabled={isLoading}
                  />
                  <FontAwesomeIcon icon={faEnvelope} className="input-icon" />
                </div>
              </div>
            </div>
                  </div>
              <div className="form-group">
              <div className="sign-up-form-label">
                <label htmlFor="signup-password">Password</label>
                <div className="password-field">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="signup-password"
                    name="password"
                    placeholder="Enter your password"
                    value={signupData.password}
                    onChange={handleSignupChange}
                    required
                    disabled={isLoading}
                    minLength="8"
                  />
                  <FontAwesomeIcon
                    icon={showPassword ? faEyeSlash : faEye}
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  />
                </div>
              </div>
              <div className="form-group">
              <div className="form-label">
                <label htmlFor="confirm-password">Confirm</label>
                <div className="password-field">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirm-password"
                    name="confirm_password"
                    placeholder="Confirm your password"
                    value={signupData.confirm_password}
                    onChange={handleSignupChange}
                    required
                    disabled={isLoading}
                  />
                  <FontAwesomeIcon
                    icon={showConfirmPassword ? faEyeSlash : faEye}
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  />
                </div>
              </div>
              </div>
            </div>
            <div className="password-requirements">
                  <small>Password must contain:</small>
                  <ul>
                    <li>At least 8 characters</li>
                    <li>One uppercase letter</li>
                    <li>One number</li>
                    <li>One special character (!@#$%^&*...)</li>
                  </ul>
                </div>
            <div className="client-form-actions-button">
              <button 
                type="submit" 
                className="signup-submit-btn"
                disabled={isLoading}
              >
                {isLoading ? 'CREATING ACCOUNT...' : 'SIGN UP'}
              </button>
            </div>
            
            <div className="form-switch">
              <p>Already have an account? <button type="button" onClick={() => {
                setIsLoginView(true);
                setErrorMessage('');
                setSuccessMessage('');
              }}>Login</button></p>
            </div>
          </form>
        )}
      </div>

      {/* Forgot Password Modal */}
      {showForgotPasswordModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h2>Reset Password</h2>
              <button 
                className="modal-close" 
                onClick={() => {
                  setShowForgotPasswordModal(false);
                  setForgotPasswordData({
                    email: '',
                    new_password: '',
                    confirm_new_password: ''
                  });
                  setErrorMessage('');
                  setSuccessMessage('');
                }}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            
            {/* Error message display in modal */}
            {errorMessage && (
              <div className="error-message">
                {errorMessage}
              </div>
            )}

            {/* Success message display in modal */}
            {successMessage && (
              <div className="success-message">
                {successMessage}
              </div>
            )}
            
            <form className="reset-password-form" onSubmit={handleForgotPasswordSubmit}>
              <div className="form-label">
                <label htmlFor="reset-email">Email</label>
                </div>
                    <div className="form-group">
                <div className="input-field">
                  <input
                    type="email"
                    id="reset-email"
                    name="email"
                    placeholder="Enter your registered email"
                    value={forgotPasswordData.email}
                    onChange={handleForgotPasswordChange}
                    required
                    disabled={isResettingPassword}
                  />
                  <FontAwesomeIcon icon={faEnvelope} className="input-icon" />
                </div>
              </div>
              
              <div className="form-label">
                <label htmlFor="new-password">New Password</label>
                <div className="password-field">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    id="new-password"
                    name="new_password"
                    placeholder="Enter new password (8+ chars, uppercase, number, special char)"
                    value={forgotPasswordData.new_password}
                    onChange={handleForgotPasswordChange}
                    required
                    disabled={isResettingPassword}
                    minLength="8"
                  />
                  <FontAwesomeIcon icon={faLock} className="input-icon" />
                  <FontAwesomeIcon
                    icon={showNewPassword ? faEyeSlash : faEye}
                    className="password-toggle"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  />
                </div>
              </div>
              
              <div className="form-label">
                <label htmlFor="confirm-new-password">Confirm New Password</label>
                <div className="password-field">
                  <input
                    type={showConfirmNewPassword ? "text" : "password"}
                    id="confirm-new-password"
                    name="confirm_new_password"
                    placeholder="Confirm new password"
                    value={forgotPasswordData.confirm_new_password}
                    onChange={handleForgotPasswordChange}
                    required
                    disabled={isResettingPassword}
                    minLength="8"
                  />
                  <FontAwesomeIcon icon={faLock} className="input-icon" />
                  <FontAwesomeIcon
                    icon={showConfirmNewPassword ? faEyeSlash : faEye}
                    className="password-toggle"
                    onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                  />
                </div>
              </div>
               <div className="password-requirements">
                  <small>Password must contain:</small>
                  <ul>
                    <li>At least 8 characters</li>
                    <li>One uppercase letter</li>
                    <li>One number</li>
                    <li>One special character (!@#$%^&*...)</li>
                  </ul>
                </div>   
              <div className="form-actions-button">
                <button 
                  type="submit" 
                  className="reset-password-btn"
                  disabled={isResettingPassword}
                >
                  {isResettingPassword ? 'RESETTING PASSWORD...' : 'RESET PASSWORD'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientLogin;