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
  const eventRef = useRef(null);
  const sermonsRef = useRef(null);
  const contactusRef = useRef(null);

  // State for modals, active section, and slider
  const [activeSection, setActiveSection] = useState("home");
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Event images array
  const eventImages = [
    { src: event1, title: "Sunday Mass", date: "Every Sunday", time: "8:00 AM" },
    { src: event2, title: "Wedding Ceremony", date: "MAR 15", time: "10:00 AM" },
    { src: event3, title: "Baptism", date: "APR 03", time: "9:00 AM" },
    { src: event4, title: "Confirmation", date: "APR 20", time: "3:00 PM" },
    { src: event5, title: "Parish Festival", date: "MAY 10", time: "All Day" }
  ];

  // Function to scroll smoothly
  const scrollToSection = (ref, section) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth" });
      setActiveSection(section);
    }
  };

  // Function to handle role selection
  const handleRoleSelect = (role) => {
    setIsRoleModalOpen(false);
    // Navigate to the appropriate login page based on role
    navigate(`/${role}-login`);
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
    <div className={`home-container ${isRoleModalOpen ? "modal-active" : ""}`}>
      <header className="header">
        <div className="logo">
          <img src={pdmLogo} alt="Parish Logo" className="home-logo" />
          <span>PARISH OF THE DIVINE MERCY</span>
        </div>
        <nav className="nav">
          <button className={activeSection === "home" ? "active" : ""} onClick={() => scrollToSection(homeRef, "home")}>
            Home
          </button>
          <button className={activeSection === "events" ? "active" : ""} onClick={() => scrollToSection(eventRef, "events")}>
            About
          </button>
          <button className={activeSection === "contactus" ? "active" : ""} onClick={() => scrollToSection(contactusRef, "contactus")}>
            Contact Us
          </button>
        </nav>
        <button className="login-btn" onClick={() => setIsRoleModalOpen(true)}>
          LOGIN
        </button>
      </header>

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
          <button className="read-more">Read More</button>
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

      {/* Updated Events Section with Image Slider */}
      <section className="events-section" ref={eventRef}>
        <h2>About</h2>
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
      <hr className="separator"/>

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