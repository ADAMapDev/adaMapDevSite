import React, { useState, useRef, useEffect } from "react";
import "./App.css";
import WalkingRouteMap from "./WalkingRouteMap";

//import ReactDOM from 'react-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faWheelchair } from '@fortawesome/free-solid-svg-icons'
import { faDoorClosed } from '@fortawesome/free-solid-svg-icons'
import { faMound } from '@fortawesome/free-solid-svg-icons'
import { faArrowRightToBracket } from '@fortawesome/free-solid-svg-icons'
import { faLocationArrow } from '@fortawesome/free-solid-svg-icons'
import { faPlus } from '@fortawesome/free-solid-svg-icons'
import { faMinus } from '@fortawesome/free-solid-svg-icons'


function App() {
  const [highContrast] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [sideNavOpen, setSideNavOpen] = useState(false); // State for side nav
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

  const login = () => {
    alert("pops up a login page");
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
        className={`overlay ${sideNavOpen ? "open" : ""}`}
        onClick={toggleSideNav}>
      </div>
      <div
        id="mySidenav"
        className={`sidenav ${sideNavOpen ? "open" : ""}`}>
        <button className="closebtn" onClick={toggleSideNav}>&times;</button>
        <a href="#">thing 1</a>
        <a href="#">thing 2</a>
        <a href="#">thing 3</a>
        <a href="#">thing 4</a>
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
            <span><FontAwesomeIcon icon={faWheelchair}/></span>Wheelchair Accessible</button>
          <button>
            <span><FontAwesomeIcon icon={faDoorClosed} /></span>Accessible Door</button>
          <button>
            <span><FontAwesomeIcon icon={faMound} /></span>Low Elevation Change</button>
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
            <button onClick={login}><FontAwesomeIcon icon={faArrowRightToBracket} /></button>
            <button onClick={zoomIn}><FontAwesomeIcon icon={faPlus} /></button>
            <button onClick={zoomOut}><FontAwesomeIcon icon={faMinus} /></button>
            <button onClick={currentLocation}><FontAwesomeIcon icon={faLocationArrow} /></button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
