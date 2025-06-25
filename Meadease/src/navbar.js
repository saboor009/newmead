import React, { useState, useEffect } from 'react';
import './Navbar.css';
import { Link, useNavigate } from 'react-router-dom';
import userIcon from './icons/usericon.png'; // Path to user icon
import cross from './icons/cross.png'; 
import logo from './icons/logo.svg';
import {  useLogoutMutation} from './features/api/authApi';
import { useLogoutDoctorMutation } from './features/api/docAuthApi';
import { useSelector } from 'react-redux';

const Navbar = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);


  const {user:userData} = useSelector((state) => state.auth);
  const {doctor:doctorData} = useSelector((state) => state.docAuth);

  // Logout functionality for patient user
  const [logout ,{ data: logoutData, error: logoutError }] = useLogoutMutation();
  
  // Logout functionality for doctor
  const [logoutDoctor, { data: logoutDoctorData, error: logoutDoctorError }] = useLogoutDoctorMutation();

  // Handle logout responses
  useEffect(() => {
    if (logoutData) {

      navigate('/login'); // example redirect after logout
    }
    if (logoutError) {

      console.error('Logout Error:', logoutError);
    }
  }, [logoutData, logoutError, navigate]);

  useEffect(() => {
    if (logoutDoctorData) {
      navigate('/login'); // example redirect after logout
    }
    if (logoutDoctorError) {
      console.error('Logout Error:', logoutDoctorError);
    }
  }, [logoutDoctorData, logoutDoctorError, navigate]);
  // Menu toggling functions
  const toggleMenu = () => {
    setMobileMenuOpen(prev => !prev);
  };
  
  const closeMenu = () => {
    setMobileMenuOpen(false);
  };

  const handleUserLogout = async () => {
    await logout();
    

  };
  
  const handleDoctorLogout = async () => {
    await logoutDoctor();
    
  };

  // Determine which type of user is logged in and ensure we have data
  const isDoctorLoggedIn = !!( doctorData && doctorData.firstName);
  const isUserLoggedIn = !!(userData && userData.firstName);

  // Extract the name values if available
  const doctorName = isDoctorLoggedIn ? 
    `${doctorData.firstName} ${doctorData.lastName}` : '';
  
  const userName = isUserLoggedIn ? 
    `${userData.firstName} ${userData.lastName}` : '';

  const renderAuthContent = () => {
    if (isDoctorLoggedIn) {
      return (
        <div className="user-profile">
          <div className="user-name">{doctorName}</div>
          <div className="logout-btn" onClick={handleDoctorLogout}>LogoutDoctor</div>
        </div>
      );
    } else if (isUserLoggedIn) {
      return (
        <div className="user-profile">
          <div className="user-name">{userName}</div>
          <div className="logout-btn" onClick={handleUserLogout}>LogoutUser</div>
        </div>
      );
    } else {
      return (
        <Link to="/register" style={{ textDecoration: "none" }}>
          <div className="login">
            <img src={userIcon} alt="User Icon" className="usericon" />
            <div className="login-text">
              <span className="login-prompt">Login or Register</span>
              <span className="account-type">Patient Account</span>
            </div>
          </div>
        </Link>
      );
    }
  };

  return (
    <nav className="navbar">
      <div className="top-row">
        <div className="logo">
          <img src={logo} alt="Company Logo" />
        </div>
        <div className="header">
          {renderAuthContent()}
        </div>
      </div>

      <hr className="divider desktop-divider" />

      <div className="bottom-row">
        <ul className="nav-links">
          <li><Link to="/">Home</Link></li>
          
          <li><Link to="/doctordashboard">Dashboard</Link></li>
          <li><Link to="/appointments">Appointments</Link></li>
          <li><Link to="/FindDoctor">Find a Doctor</Link></li>
          <li><Link to="/talktoai">Talk to AI</Link></li>
          <li><Link to="/contactus">Contact Us</Link></li>
          <li><Link to="/aboutus">About Us</Link></li>
        </ul>
      </div>

      {/* Mobile Navigation */}
      <div style={{ width: '100%', display: 'flex', justifyContent: 'space-evenly' }}>
        <div className="mobile-nav">
          <div className="logo">
            <img src={logo} alt="Company Logo" />
          </div>
          <div className="hamburger" onClick={toggleMenu} style={{ fontSize: '24px', fontWeight: 'bold' }}>
            &#9776;
          </div>
        </div>

        <div className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
          <div className="mobile-menu-header">
            <div className="menu-logo">MEDEASE</div>
            <div className="close-btn-div">
              <img src={cross} alt="Close Menu" onClick={closeMenu} />
            </div>
          </div>
          <ul className="nav-links">
            <li>
              <div className="header">
                {renderAuthContent()}
              </div>
            </li>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/appointments">Appointments</Link></li>
            <li><Link to="/FindDoctor">Find a Doctor</Link></li>
            <li><Link to="/talktoai">Talk to AI</Link></li>
            <li><Link to="/contactus">Contact Us</Link></li>
            <li><Link to="/aboutus">About Us</Link></li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;