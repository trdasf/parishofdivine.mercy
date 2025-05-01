import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./homepage.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash, faChurch, faMapMarkerAlt, faPhone, faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { faFacebook } from "@fortawesome/free-brands-svg-icons";

const HomePage = () => {
  const navigate = useNavigate();
  const homeRef = useRef(null);
  const eventRef = useRef(null);
  const sermonsRef = useRef(null);
  const contactusRef = useRef(null);

  // State for modal and active section
  const [activeSection, setActiveSection] = useState("home");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState("login"); // "login" or "signup"

    // Password visibility state
    const [showLoginPassword, setShowLoginPassword] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Function to open/close modal
  const openModal = (type) => {
    setModalType(type);
    setIsModalOpen(true);
  };
  const closeModal = () => setIsModalOpen(false);

  // Function to scroll smoothly
  const scrollToSection = (ref, section) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth" });
      setActiveSection(section);
    }
  };

  // Detect visible section on scroll
  useEffect(() => {
    const handleScroll = () => {
      const sections = [
        { name: "home", ref: homeRef },
        { name: "events", ref: eventRef },
        { name: "sermons", ref: sermonsRef },
        { name: "contactus", ref: contactusRef },
      ];

      let foundSection = "home";

      for (let section of sections) {
        if (section.ref.current) {
          const rect = section.ref.current.getBoundingClientRect();
          if (rect.top <= 150 && rect.bottom >= 150) {
            foundSection = section.name;
            break;
          }
        }
      }
      setActiveSection(foundSection);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className={`home-container ${isModalOpen ? "modal-active" : ""}`}>
      <header className="header">
        <div className="logo">
          <img src="/src/assets/pdmlogo.png" alt="Parish Logo" className="home-logo" />
          <span>PARISH OF THE DIVINE MERCY</span>
        </div>
        <nav className="nav">
          <button className={activeSection === "home" ? "active" : ""} onClick={() => scrollToSection(homeRef, "home")}>
            Home
          </button>
          <button className={activeSection === "events" ? "active" : ""} onClick={() => scrollToSection(eventRef, "events")}>
            Events
          </button>
          <button className={activeSection === "intention" ? "active" : ""} onClick={() => scrollToSection(sermonsRef, "intention")}>
            Intention
          </button>
          <button className={activeSection === "contactus" ? "active" : ""} onClick={() => scrollToSection(contactusRef, "contactus")}>
            Contact Us
          </button>
        </nav>
        <button className="login-btn" onClick={() => openModal("login")}>
          LOGIN
        </button>
      </header>

      {isModalOpen && (
        <div className="login-card">
          <div className="login-content">
            <img src="/src/assets/pdmlogo.png" alt="Parish Logo" className="parish-logo-login" />
            <h2>{modalType === "login" ? "LOGIN" : "SIGN UP"}</h2>

            {modalType === "login" && (
              <>
                <div className="login-input-group">
                  <label>Email</label>
                  <input type="email" placeholder="Enter Your Email here" />
                </div>

                <div className="login-input-group">
                  <label>Password</label>
                  <div className="password-container">
                    <input
                      type={showLoginPassword ? "text" : "password"}
                      placeholder="Enter Your Password here"
                    />
                    <FontAwesomeIcon
                      icon={showLoginPassword ? faEyeSlash : faEye}
                      className="eye-icon"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                    />
                  </div>
                </div>

                <button className="login-button" onClick={() => navigate("/parish-appointment")} >Login</button>
                <p className="switch-modal">
                  Don't have an account?{" "}
                  <span onClick={() => openModal("signup")}>Sign Up</span>
                </p>
              </>
            )}
           {modalType === "signup" && (
  <>
    <div className="sign-up-form">
      {/* First Name & Last Name Side by Side */}
      <div className="sign-up-row">
        <div className="sign-up-input-group">
          <label>First Name</label>
          <input type="text" placeholder="Enter Your First Name" />
        </div>

        <div className="sign-up-input-group">
          <label>Last Name</label>
          <input type="text" placeholder="Enter Your Last Name" />
        </div>
      </div>

      <div className="sign-up-column">
        <div className="sign-up-input-group">
          <label>Contact Number</label>
          <input type="text" placeholder="Enter Your Contact Number" />
        </div>
        <div className="sign-up-input-group">
          <label>Username</label>
          <input type="text" placeholder="Enter Your Username" />
        </div>
      </div>
     <div className="sign-up-row">
                    <div className="sign-up-input-group">
                      <label>Password</label>
                      <div className="password-container-pass">
                        <input
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter Your Password"
                        />
                        <FontAwesomeIcon
                          icon={showPassword ? faEyeSlash : faEye}
                          className="eye-icon-sign-up"
                          onClick={() => setShowPassword(!showPassword)}
                        />
                      </div>
                    </div>

                    <div className="sign-up-input-group">
                      <label>Confirm Password</label>
                      <div className="password-container-pass">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm Your Password"
                        />
                        <FontAwesomeIcon
                          icon={showConfirmPassword ? faEyeSlash : faEye}
                          className="eye-icon-sign-up"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        />
                      </div>
                    </div>
                  </div>
                </div>

    <button className="login-button" onClick={() => navigate("/community-profile")}>Sign Up</button>
    <p className="switch-modal">
      Already have an account?{" "}
      <span onClick={() => openModal("login")}>Login</span>
    </p>
  </>
)}

<button className="close-modal" onClick={closeModal}>X</button>

          </div>
        </div>
      )}

      <main className="content" ref={homeRef}>
        <div className="text-section">
          <h1>
            WELCOME TO <br />
            <span>Parish of the Divine Mercy</span>
          </h1>
          <p>
            We’re happy to have you here. Parish of the Divine Mercy is a place where you can grow in faith, 
            find hope, and connect with a loving community. Join us for Sunday Worship. Everyone is welcome!
          </p>
          <button className="read-more">Read More</button>
        </div>
        <div className="image-section">
          <div className="main-image">
            <img src="/src/assets/church3.jpg" alt="Church Celebration" />
          </div>
          <div className="sub-images">
            <img src="/src/assets/church1.jpg" alt="Church Front" />
            <img src="/src/assets/church2.jpg" alt="Divine Mercy Image" />
          </div>
        </div>
      </main>

      <section className="events-section" ref={eventRef}>
        <h2>Upcoming Events</h2>
        <div className="events-container">
  {Array(4).fill(0).map((_, index) => (
    <div className="event-card" key={index}>
      <div className="event-date-hp">
        <span>MAR</span>
        <span>09</span>
      </div>
      <div className="event-details">
        <h3>Wedding</h3>
      </div>
      <div className="event-time">
        <span>10:00 AM - 12:00 PM</span>
      </div>
    </div>
  ))}
</div>

        <button className="read-more2">View More</button>
      </section>
      <hr className="separator"/>

      <section className="sermons-section" ref={sermonsRef}>
        <h2>Intention</h2>
        <div className="sermons-container">
          {Array(3).fill(0).map((_, index) => (
            <div className="sermon-card" key={index}>
              <div className="sermon-image">
                <img src="/src/assets/church3.jpg" alt="Sermon" />
              </div>
              <div className="sermon-details">
                <h3>PILGRIM VISIT OF THE GOLDEN JUBILEE CROSS OF THE DIOCESE OF DAET</h3>
                <button className="watch-now">Watch Now</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="footer-section" ref={contactusRef}>
        <div className="footer-circle">
          <img src="/src/assets/pdmlogo.png" alt="Parish Logo" className="footer-logo"/>
        </div> 

        <div className="footer-container">
          <div className="footer-map">
            <img src="/src/assets/map.png" alt="Map Location" className="map-image"/>
          </div>

          <div className="footer-info">
            <p><FontAwesomeIcon icon={faMapMarkerAlt} /> Daet, Philippines</p>
            <p><FontAwesomeIcon icon={faPhone} /> 0947-893-6393</p>
            <p><FontAwesomeIcon icon={faEnvelope} /> parishofthedivinemercy.com</p>
            <p><FontAwesomeIcon icon={faFacebook} /> Parish of the Divine Mercy - Alawihao, DCN</p>
          </div>

          <div className="footer-contact">
            <h2>Contact Us</h2>
            <p>Have questions or need prayer? Contact us—we're here to help and welcome you with open arms!</p>
            <form className="contact-form">
              <input type="text" placeholder="Name" required />
              <input type="email" placeholder="Email" required />
              <textarea placeholder="Message" required></textarea>
              <button type="submit">SEND</button>
            </form>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2025 Parish of the Divine Mercy. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
