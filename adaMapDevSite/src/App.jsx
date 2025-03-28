import React, { useState, useRef, useEffect } from "react";
import "./App.css";

function App() {
  const [highContrast] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [sideNavOpen, setSideNavOpen] = useState(false); 
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isCreateAccountModalOpen, setIsCreateAccountModalOpen] = useState(false);
  const searchBarRef = useRef(null);

  const locations = [
    "Wellstar College of Health and Human",
    "Silhwell Theater at Kennesaw State",
    "The Commons",
    "West Parking Deck",
    "Music Building",
    "Bagwell College of Education",
    "Carmichael Student Center",
    "Kennesaw Hall",
    "Dr. Betty L. Siegel Student Recreation",
  ];

  const filteredLocations = locations.filter((location) =>
    location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  {/* What the side buttons will do */}
  const openLoginModal = () => {
    setIsLoginModalOpen(true);
  };

  const closeLoginModal = () => {
    setIsLoginModalOpen(false);
  };

  const openCreateAccountModal = () => {
    setIsLoginModalOpen(false); // Close Login modal
    setIsCreateAccountModalOpen(true); // Open Create Account modal
  };

  const closeCreateAccountModal = () => {
    setIsCreateAccountModalOpen(false);
  };


  const zoomIn = () => {
    alert("this will zoom in on the map");
  };

  const zoomOut = () => {
    alert("this will zoom out on the map");
  };

  const currentLocation = () => {
    alert("pings the current location on the map");
  };

  {/* Handling clicking effects like clicking outside of the search bar */}
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setShowDropdown(true);
  };

  const handleLocationClick = (location) => {
    setSearchQuery(location);
    setShowDropdown(false);
  };

  const handleClickOutside = (event) => {
    if (searchBarRef.current && !searchBarRef.current.contains(event.target)) {
      setShowDropdown(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleSideNav = () => {
    setSideNavOpen(!sideNavOpen);
  };

  {/* Side navigation bar */}
  return (

    
    <div className={`app ${highContrast ? "high-contrast" : ""}`}>
      <div
          className={`sidebar-indicator ${sideNavOpen ? "hidden" : ""}`}
          onClick={toggleSideNav}
        ></div>
        <div
          className={`overlay ${sideNavOpen ? "open" : ""}`}
          onClick={toggleSideNav}
        ></div>
        <div
          id="mySidenav"
          className={`sidenav ${sideNavOpen ? "open" : ""}`}
        >
          <button className="closebtn" onClick={toggleSideNav}>&times;</button>
          <div className="sidebar-footer">
            <h4>Quick Links</h4>
          <a href="https://www.kennesaw.edu/docs/kennesaw-map.pdf" target="_blank" rel="noopener noreferrer">Kennesaw State University - Kennesaw Campus</a>
          <a href="https://www.kennesaw.edu/docs/marietta-map.pdf" target="_blank" rel="noopener noreferrer">Kennesaw State University - Marietta Campus</a>
          </div>
        </div>

      {/* Main content */}
      <div
        id="main"
        className={sideNavOpen ? "shifted" : ""}>
        <span onClick={toggleSideNav} className="open-nav">&#9776;</span>

      {/* Search bar for address */}
      <div className={`app ${highContrast ? 'high-contrast' : ''}`}>
        <div className="container">
          <div className="search-bar" ref={searchBarRef}>
            <input
              type="text"
              placeholder="Search for a place or an address"
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => setShowDropdown(true)}
            />
            {showDropdown && (
              <div className="dropdown">
                {filteredLocations.map((location, index) => (
                  <div
                    key={index}
                    className="dropdown-item"
                    onClick={() => handleLocationClick(location)}>
                    {location}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Accessibility Options */}
      <div className="accessibility-options">
        <p>Accessibility Options</p>
        <button>
          <span>♿</span>Wheelchair Accessible</button>
        <button>
          <span>🚪</span>Accessible Door</button>
        <button>
          <span>📉</span>Low Elevation Change</button>
      </div>

        {/* Map Container */}
        <div className="map-container">
        <div className="map-placeholder"> 
          {/* Placed the map function here for now
            Testing it out by manually adding the 
            coordinates into the parameters */}
          {/* <WalkingRouteMap
            origin={{ lat: 34.03887, lng: -84.58559 }}
            destination={{ lat: 34.04008, lng: -84.58220 }}/> */}
        </div>
          {/* Accessibility Features */}    
          {/* Action Buttons */}
          <div className="action-buttons">
            {/* <button onClick={openLoginModal}>↩</button> */}

            <button onClick={openLoginModal}>
              <p className="button-text">
                <span className="button-icon">↩ </span>
                <span className="button-text">Login</span>
                <span className="button-text"></span>
              </p>
            </button>

            <button onClick={zoomIn}>
              <p className="button-text">
                <span className="button-icon">+ </span>
                <span className="button-text">Zoom In</span>
              </p>
              {/*<p>+ <span className="action-buttons-text">Zoom In</span></p> */}
            </button>

            {/*
            <button onClick={zoomIn}>
              <p className="zoom-in-text">
                <span className="zoom-in-text">+ </span>
                <span className="zoom-in-text">Zoom In</span>
              </p>
              {/*<p>+ <span className="action-buttons-text">Zoom In</span></p>
            </button> */}
            <button onClick={zoomOut}>
              <p className="button-text">
                <span className="button-icon">- </span>
                <span className="button-text">Zoom Out</span>
              </p>
              {/*<p>+ <span className="action-buttons-text">Zoom In</span></p> */}
            </button>
            <button onClick={currentLocation}>
              <p className="button-text">
                <span className="button-icon">▶ </span>
                <span className="button-text">Current Location</span>
              </p>
              {/*<p>+ <span className="action-buttons-text">Zoom In</span></p> */}
            </button>

          </div>
        </div>
      </div>

 {/* Login Modal */}
 {isLoginModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <button className="close-btn" onClick={closeLoginModal}>
              &times;
            </button>
            <h2>Login</h2>
            <form>
              <div className="form-group">
                <label>Username</label>
                <input type="text" placeholder="Enter your username" />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input type="password" placeholder="Enter your password" />
              </div>
              <button type="submit" className="submit-btn">
                Login
              </button>
            </form>
            <p>
              <a href="#" onClick={openCreateAccountModal}>
                Create Account
              </a>
            </p>
          </div>
        </div>
      )}

      {/* Create Account Modal */}
      {isCreateAccountModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <button className="close-btn" onClick={closeCreateAccountModal}>
              &times;
            </button>
            <h2>Create Account</h2>
            <form>
              <div className="form-group">
                <label>Username</label>
                <input type="text" placeholder="Enter your username" />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" placeholder="Enter your email" />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input type="password" placeholder="Enter your password" />
              </div>
              <button type="submit" className="submit-btn">
                Create Account
              </button>
            </form>
            <button
              className="back-btn"
              onClick={() => {
                setIsCreateAccountModalOpen(false);
                setIsLoginModalOpen(true);
              }}
            >
              Back to Login
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
export default App;
