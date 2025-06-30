import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./homepage.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faEye, 
  faEyeSlash, 
  faChurch,         // For Parish
  faUserTie,        // For Secretary
  faHandsHelping,   // For Ministry
  faUser,           // For Client
  faMapMarkerAlt, 
  faPhone, 
  faEnvelope,
  faChevronLeft,    // For slider navigation
  faChevronRight    // For slider navigation
} from "@fortawesome/free-solid-svg-icons";
import { faFacebook } from "@fortawesome/free-brands-svg-icons";

// Import images
import pdmLogo from "../assets/pdmlogo.png";
import church1 from "../assets/church1.jpg";
import church2 from "../assets/church2.jpg";
import church3 from "../assets/church3.jpg";
import mapImg from "../assets/map.png";
// Assuming these are your event images - you'll need to replace with actual imports
import event1 from "../assets/church1.jpg"; // Replace with actual event images
import event2 from "../assets/church2.jpg"; // Replace with actual event images
import event3 from "../assets/church3.jpg"; // Replace with actual event images
import event4 from "../assets/church1.jpg"; // Replace with actual event images
import event5 from "../assets/church2.jpg"; // Replace with actual event images

const HomePage = () => {
  const navigate = useNavigate();
  const homeRef = useRef(null);
  const aboutRef = useRef(null);
  const eventRef = useRef(null);
  const contactusRef = useRef(null);

  // State for modals, active section, slider, and mobile menu
  const [activeSection, setActiveSection] = useState("home");
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Event images array
  const eventImages = [
    { src: event1, title: "Sunday Mass", date: "Every Sunday", time: "8:00 AM" },
    { src: event2, title: "Wedding Ceremony"},
    { src: event3, title: "Baptism"},
    { src: event4, title: "Confirmation"},
    { src: event5, title: "Parish Festival" }
  ];

  // Function to toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Function to close mobile menu
  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Function to scroll smoothly and close mobile menu
  const scrollToSection = (ref, section) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth" });
      setActiveSection(section);
      closeMobileMenu(); // Close mobile menu when navigating
    }
  };

  // Close mobile menu when clicking overlay
  const handleOverlayClick = () => {
    closeMobileMenu();
  };

  // Function to handle role selection
  const handleRoleSelect = (role) => {
    setIsRoleModalOpen(false);
    closeMobileMenu();
    // Navigate to the appropriate login page based on role
    navigate(`/${role}-login`);
  };

  // Open login modal and close mobile menu
  const handleLoginClick = () => {
    setIsRoleModalOpen(true);
    closeMobileMenu();
  };

  // Function to navigate to the next slide
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === eventImages.length - 1 ? 0 : prev + 1));
  };

  // Function to navigate to the previous slide
  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? eventImages.length - 1 : prev - 1));
  };

  // Function to directly jump to a slide
  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  // Detect visible section on scroll
  useEffect(() => {
    const handleScroll = () => {
      const sections = [
        { name: "home", ref: homeRef },
        { name: "about", ref: aboutRef },
        { name: "events", ref: eventRef },
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

  // Close mobile menu when window is resized to desktop size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768 && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isMobileMenuOpen]);

  return (
    <div className={`home-container ${isRoleModalOpen ? "modal-active" : ""} ${isMobileMenuOpen ? "menu-open" : ""}`}>
      <header className="header">
        <div className="logo">
          <img src={pdmLogo} alt="Parish Logo" className="home-logo" />
          <span>PARISH OF THE DIVINE MERCY</span>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="nav">
          <button className={activeSection === "home" ? "active" : ""} onClick={() => scrollToSection(homeRef, "home")}>
            Home
          </button>
          <button className={activeSection === "about" ? "active" : ""} onClick={() => scrollToSection(aboutRef, "about")}>
            About
          </button>
          <button className={activeSection === "events" ? "active" : ""} onClick={() => scrollToSection(eventRef, "events")}>
            Events
          </button>
          <button className={activeSection === "contactus" ? "active" : ""} onClick={() => scrollToSection(contactusRef, "contactus")}>
            Contact Us
          </button>
        </nav>
        
        {/* Desktop Login Button */}
        <button className="login-btn" onClick={() => setIsRoleModalOpen(true)}>
          LOGIN
        </button>

        {/* Hamburger Menu Button */}
        <div className={`hamburger ${isMobileMenuOpen ? "active" : ""}`} onClick={toggleMobileMenu}>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </header>

      {/* Mobile Navigation Overlay */}
      <div className={`nav-overlay ${isMobileMenuOpen ? "active" : ""}`} onClick={handleOverlayClick}></div>

      {/* Mobile Navigation Menu */}
      <div className={`nav-mobile ${isMobileMenuOpen ? "active" : ""}`}>
        <div className="nav-mobile-header">
          <div className="nav-mobile-logo">
            <img src={pdmLogo} alt="Parish Logo" />
            <span>PDM</span>
          </div>
          <button className="close-nav" onClick={closeMobileMenu}>
            ✕
          </button>
        </div>
        
        <div className="nav-mobile-menu">
          <button 
            className={activeSection === "home" ? "active" : ""} 
            onClick={() => scrollToSection(homeRef, "home")}
          >
            Home
          </button>
          <button 
            className={activeSection === "about" ? "active" : ""} 
            onClick={() => scrollToSection(aboutRef, "about")}
          >
            About
          </button>
          <button 
            className={activeSection === "events" ? "active" : ""} 
            onClick={() => scrollToSection(eventRef, "events")}
          >
            Events
          </button>
          <button 
            className={activeSection === "contactus" ? "active" : ""} 
            onClick={() => scrollToSection(contactusRef, "contactus")}
          >
            Contact Us
          </button>
        </div>
        
        <button className="nav-mobile-login" onClick={handleLoginClick}>
          LOGIN
        </button>
      </div>

      {/* Role Selection Modal */}
      {isRoleModalOpen && (
        <div className="login-card">
          <div className="login-content role-modal">
            <img src={pdmLogo} alt="Parish Logo" className="parish-logo-login" />
            <h2>SELECT YOUR ROLE</h2>
            
            <div className="role-buttons">
              <button onClick={() => handleRoleSelect("parish")} className="role-button">
                <FontAwesomeIcon icon={faChurch} className="role-icon" />
                <span>Parish</span>
              </button>
              
              <button onClick={() => handleRoleSelect("secretary")} className="role-button">
                <FontAwesomeIcon icon={faUserTie} className="role-icon" />
                <span>Secretary</span>
              </button>
              
              <button onClick={() => handleRoleSelect("ministry")} className="role-button">
                <FontAwesomeIcon icon={faHandsHelping} className="role-icon" />
                <span>Ministry</span>
              </button>
              
              <button onClick={() => handleRoleSelect("client")} className="role-button">
                <FontAwesomeIcon icon={faUser} className="role-icon" />
                <span>Client</span>
              </button>
            </div>
            
            <button className="close-modal" onClick={() => setIsRoleModalOpen(false)}>X</button>
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
            We're happy to have you here. Parish of the Divine Mercy is a place where you can grow in faith, 
            find hope, and connect with a loving community. Join us for Sunday Worship. Everyone is welcome!
          </p>
        </div>
        <div className="image-section">
          <div className="main-image">
            <img src={church3} alt="Church Celebration" />
          </div>
          <div className="sub-images">
            <img src={church1} alt="Church Front" />
            <img src={church2} alt="Divine Mercy Image" />
          </div>
        </div>
      </main>

      {/* About Section */}
      <section className="about-section" ref={aboutRef}>
      <h2>About Us</h2>
        <div className="about-container">
          <div className="about-image">
            <img src={church1} alt="Divine Mercy Church" />
          </div>
          <div className="about-content">
            <p>
              Divine Mercy Church in Alawihao, Daet, Camarines Norte, was established in 2009 and belongs to the Diocese of Daet under the Roman Catholic Archdiocese of Caceres. Its architectural features include a central entrance flanked by windows and a pediment with glass windows depicting the titular, with a bell tower located on the gospel side. The church celebrates the feast of Divine Mercy every April 15.
            </p>
          </div>
        </div>
      </section>

      {/* Events Section with Slider */}
      <section className="events-section" ref={eventRef}>
        <h2>Events</h2>
        <div className="slider-container">
          <button className="slider-nav prev" onClick={prevSlide}>
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>
          
          <div className="slider-wrapper">
            {eventImages.map((image, index) => (
              <div 
                className={`slide ${index === currentSlide ? 'active' : ''}`} 
                key={index}
                style={{ transform: `translateX(${100 * (index - currentSlide)}%)` }}
              >
                <div className="slide-image">
                  <img src={image.src} alt={`Event ${index + 1}`} />
                </div>
                <div className="slide-content">
                  <h3>{image.title}</h3>
                  <div className="slide-date">{image.date}</div>
                  <div className="slide-time">{image.time}</div>
                </div>
              </div>
            ))}
          </div>
          
          <button className="slider-nav next" onClick={nextSlide}>
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
        </div>
        
        <div className="slider-indicators">
          {eventImages.map((_, index) => (
            <button 
              key={index} 
              className={`indicator ${index === currentSlide ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
            />
          ))}
        </div>
      </section>

      <footer className="footer-section" ref={contactusRef}>
        <div className="footer-circle">
          <img src={pdmLogo} alt="Parish Logo" className="footer-logo"/>
        </div> 

        <div className="footer-container">
          <div className="footer-map">
            <img src={mapImg} alt="Map Location" className="map-image"/>
          </div>

          <div className="footer-info">
            <p><FontAwesomeIcon icon={faMapMarkerAlt} /> Daet, Philippines</p>
            <p><FontAwesomeIcon icon={faPhone} /> 0947-893-6393</p>
            <p><FontAwesomeIcon icon={faEnvelope} /> parishofthedivinemercy.com</p>
            <p><FontAwesomeIcon icon={faFacebook} /> Parish of the Divine Mercy - Alawihao, DCN</p>
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