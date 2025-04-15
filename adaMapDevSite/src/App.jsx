import { useState, useRef, useEffect } from "react";
import "./App.css";
import { GoogleMap, InfoWindow, LoadScript, Marker, Polyline } from "@react-google-maps/api";
import UserRegularRouteComponent from "./navigation/UserRegularRoute";
import LiveElevationRouteComponent from "./navigation/LiveElevationRoute";
import LocationTracker from "./utils/LocationTracker";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars } from '@fortawesome/free-solid-svg-icons'
//import { faWheelchair } from '@fortawesome/free-solid-svg-icons'
import { faDoorClosed } from '@fortawesome/free-solid-svg-icons'
import { faMound } from '@fortawesome/free-solid-svg-icons'
import { faArrowRightToBracket } from '@fortawesome/free-solid-svg-icons'
import { faLocationArrow } from '@fortawesome/free-solid-svg-icons'
import { faPlus } from '@fortawesome/free-solid-svg-icons'
import { faMinus } from '@fortawesome/free-solid-svg-icons'
import { faClock } from '@fortawesome/free-solid-svg-icons'
import { faRuler } from '@fortawesome/free-solid-svg-icons'
import wheelchairIcon from "./assets/wheelchair_icon.png"
import { useNavigate } from "react-router-dom";
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { faRightFromBracket } from '@fortawesome/free-solid-svg-icons';


import BACKEND_URL from "./utils/url"

/* Properties of the map */
const libraries = ["places", "geometry"];
/* Centers around Kennesaw State */
const center = { lat: 34.0384731003286, lng: -84.58150433167211 };
const mapContainerStyle = { /* map size */
  width: "1000px",
  height: "600px"
};

function App() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [highContrast] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [sideNavOpen, setSideNavOpen] = useState(false); // State for side nav
  const searchBarRef = useRef(null);
  const mapRef = useRef(null);
  const [directions, setDirections] = useState(null);
  const [steps, setSteps] = useState([]);
  const [duration, setDuration] = useState("");
  const [distance, setDistance] = useState("");
  const [destination, setDestination] = useState(null);
  const [showRoute, setShowRoute] = useState(false)
  const [routeType, setRouteType] = useState("regular");
  const [elevationChanges, setElevationChanges] = useState([])
  const [userLocation, setUserLocation] = useState(null);
  const [fetchLocation, setFetchLocation] = useState(() => () => {});
  const [zoomLevel, setZoomLevel] = useState(14);
  const [accessibleDoorLocations,setAccessibleDoorLocations] = useState([]);
  const [selectedDoor, setSelectedDoor] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [polylineSegments, setPolylineSegments] = useState([]);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isCreateAccountModalOpen, setIsCreateAccountModalOpen] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [accessibleDoors, setAccessibleDoors] = useState([]);
  const [accessibleDoorEnabled, setAccessibleDoorEnabled] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [doorImagePath, setDoorImagePath] = useState(null);
  const [lowElevationEnabled, setLowElevationEnabled] = useState(false);


  const getAccessibleDoors = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/accessible-doors`);
      const data = await response.json();
      setAccessibleDoors(data);
    } catch (error) {
      console.error("Error fetching accessible doors", error)
    }
  }

  /* Retrieve API key for map */ 
  useEffect(() => {
    setLoading(true);
    const getApiKey = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/get-api-key`);
        const data = await response.json()
        setApiKey(data.apiKey)
      } catch (error) {
        console.error("Error fetching key:, ", error);
      }
    };
    getApiKey();

    const getLocations = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/buildings`);
        const data = await response.json()
        setLocations(data)
      } catch (error) {
        console.error("Error fetching locations", error)
      }
    }
    getLocations();

    getAccessibleDoors();
    setLoading(false);
  }, []);

  useEffect(() => {
    if (selectedDoor) {
      const fetchImage = async () => {
        const data = await fetchDoorImage(selectedDoor.id);
        if (data.image_path) {
          setDoorImagePath(`${BACKEND_URL}/${data.image_path}?t=${Date.now()}`);
        }
      };
      fetchImage();
    }
  }, [selectedDoor]);

  const filteredLocations = locations.filter((location) =>
    location.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  {/* What the side buttons will do */}
  const openLoginModal = () => {
    setIsLoginModalOpen(true);
  };

  const closeLoginModal = () => {
    setIsLoginModalOpen(false);
  }

  const openCreateAccountModal = () => {
    setIsLoginModalOpen(false);
    setIsCreateAccountModalOpen(true);
  }

  const closeCreateAccountModal = () => {
    setIsCreateAccountModalOpen(false)
  }

  /* Zooms in on the map with a boundary of  */ 
  const handleZoomIn = () => {
    setZoomLevel((prevZoom) => Math.min(prevZoom + 1, 21));
  }

  /* Zooms out the map with a boundary of 3 */
  const handleZoomOut = () => {
    setZoomLevel((prevZoom) => Math.max(prevZoom - 1, 3));
  }

  {/* Handling clicking effects like clicking outside of the search bar */}
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setShowDropdown(true);
  };

  const getStrokeColor = (elevationChange) => {
    const num = parseFloat(elevationChange); 
  
    if (num < 0) {
      // Teal Color
      const magnitude = Math.min(Math.abs(num), 1.5);
      const green = Math.round(200 - magnitude * 30);
      const blue = Math.round(180 - magnitude * 10);
      return `rgb(0, ${green}, ${blue})`;
    }
    else if (num <= 0.5) {
      // Light Green to Dark Green
      const intensity = Math.max(120, Math.round(120 - (num / 0.5) * 60));
      return `rgb(0, ${intensity}, 0)`;
    } else if (num <= 1.5) {
      // Light Yellow to Dark Yellow
      const intensity = Math.max(155, Math.round(255 - ((num - 0.5) / 1) * 100));
      return `rgb(${intensity}, ${intensity}, 0)`;
    } else {
      // Light Red to Dark Red (capped at 155 so it never turns black)
      const intensity = Math.max(155, Math.round(255 - ((num - 1.5) / 2) * 100));
      return `rgb(${intensity}, 0, 0)`;
    }
  };

  const handleLocationClick = (location) => {
    setSearchQuery(location.name);
    setShowDropdown(false);
    /* Update this later to query the lat from the database */ 
    setDestination({lat: location.lat, lng: location.lng})
    console.log(destination)
    setAccessibleDoorLocations([]);
    setDirections([]);
    setPolylineSegments([]);

    /* Find the accessible doors for the destination */ 
    const relatedDoors = accessibleDoors.filter(
      (door) => door.name === location.name
    );
    relatedDoors[0].id;
    setAccessibleDoorLocations(relatedDoors);
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

  /* Shows the route when the destination is valid (MIGHT NEED CHANGING) */
  const handleShowRoute = () => {
    if (destination) {
      setShowRoute(true)
    }
    onRouteDataFetched();
  }

  /* Handles the updating of the attributes of the route for the components */
  const handleDirectionsUpdate = (decodedPath, duration, distance, steps, elevationChanges) => {
    setDirections([])
    setPolylineSegments([]);
    setDirections(decodedPath || []);
    setSteps(steps || "");
    setDuration(duration || "");
    setDistance(distance || "");
    setElevationChanges(elevationChanges || []);
  }


  const onRouteDataFetched = () => {

    const latLngBounds = new window.google.maps.LatLngBounds();

    latLngBounds.extend(new window.google.maps.LatLng(userLocation.lat, userLocation.lng));
    latLngBounds.extend(new window.google.maps.LatLng(destination.lat, destination.lng));

    if (mapRef.current) {
      mapRef.current.fitBounds(latLngBounds);
    }
  }

  /* Method to get the door image based on the door id */
  const fetchDoorImage = async (doorId) => {
    try {
      const response = await fetch(`${BACKEND_URL}/get-image/${doorId}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching door", error);
    }
  }


  /* Renders the route based on what the user has selected in the button */
  const renderRouteComponent = () => {
    switch (routeType) {
      case "lowElevation":
        return (
          <LiveElevationRouteComponent
            destination={destination}
            onDirectionsUpdate={handleDirectionsUpdate}
            onPolylineUpdate={setPolylineSegments}
            userLocation={userLocation}
          />
        ); 
        default:
          return (
            <UserRegularRouteComponent
              destination={destination}
              onDirectionsUpdate={handleDirectionsUpdate}
              userLocation={userLocation}
            />
          );
    }
  }

  /* Either throws error loading maps or is in process of loading */
   if (loading || !apiKey) return (
    <div className="loading-container">
      <div className="spinner" />
      <p>Loading accessible routes...</p>
    </div>
  )


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
          <button className="close-btn" onClick={toggleSideNav}>&times;</button>
          <div className="sidenav-footer">
            <h4>Quick Links</h4>
          <a href="https://www.kennesaw.edu/docs/kennesaw-map.pdf" target="_blank" rel="noopener noreferrer">Kennesaw State University Kennesaw Campus</a>
          <a href="https://www.kennesaw.edu/docs/marietta-map.pdf" target="_blank" rel="noopener noreferrer">Kennesaw State University Marietta Campus</a>
          </div>
        </div>

      {/* Main content */}
      <div
        id="main"
        className={sideNavOpen ? "shifted" : ""}>
        {/* Hamburger Icon aka 3 line menu bars */}
        <button onClick={toggleSideNav} className={`open-nav-btn ${sideNavOpen ? "hidden" : ""}`}>
          <FontAwesomeIcon icon={faBars} />
        </button>

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
                    {location.name}
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
          <button onClick={() => {
                  setLowElevationEnabled(false);
                  setAccessibleDoorEnabled(false);
                  setRouteType("regular");
            }}
          >
            <span></span>Reset Options</button>
          {/*<button onClick={() => setRouteType("wheelchair")}>
            <span><FontAwesomeIcon icon={faWheelchair}/></span>Wheelchair Accessible</button>*/}
          <button onClick={() => setAccessibleDoorEnabled(prev => !prev)}>
            <span><FontAwesomeIcon icon={faDoorClosed}/></span>{accessibleDoorEnabled ? "Accessible Door: On": "Accessible Door: Off"}</button>
          <button onClick={() => {
                  setLowElevationEnabled(prev => {
                    const newVal = !prev;
                    setRouteType(newVal ? "lowElevation" : "regular");
                    return newVal;
                  });
                }}
            >
            <span><FontAwesomeIcon icon={faMound}/></span>{lowElevationEnabled ? "Low Elevation Change: On": "Low Elevation Change: Off"}</button>
        </div>
        <LocationTracker
          onLocationUpdate={setUserLocation}
          setFetchLocation={setFetchLocation}
        />
          {/* Map Container */}
          <div className="map-container">
            <div className="map-placeholder"> 
            {/* Placed the map function here for now
                Testing it out by manually adding the 
                lat into the parameters */}
            <LoadScript googleMapsApiKey={apiKey} libraries={libraries}>
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                zoom={zoomLevel}
                center={center}
                onLoad={(mapInstace) => (mapRef.current = mapInstace)}
              >
                {/* Display User's Location */}
                {userLocation && (
                  <Marker
                    position={userLocation}
                    icon={{
                      url: "https://maps.google.com/mapfiles/kml/shapes/man.png",
                      scaledSize: { width: 40, height: 40}
                    }}
                  />
                )}
                {destination && (
                  
                  <Marker
                    position={destination}
                    icon={{
                      url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
                      scaledSize: { width: 40, height: 40 }
                    }}
                  />
                )}

                {/* Markers for Accessible Entrances */}
                {accessibleDoorEnabled && accessibleDoorLocations.map((door) => (
                  <Marker
                    key={door.id}
                    // key={index}
                    position={{ lat: door.lat, lng: door.lng}}
                    icon={{
                      url: wheelchairIcon,
                      scaledSize: new window.google.maps.Size(20, 20), 
                    }} 
                    
                    onClick={() => setSelectedDoor(door)}
                  />
                ))}
                {selectedDoor && (
                  <InfoWindow
                    position={{ lat: selectedDoor.lat, lng: selectedDoor.lng}}
                    onCloseClick={() => setSelectedDoor(null)}
                    
                  >
                    <div>
                      <h3>Accessible Door</h3>
                      <p>Building: {selectedDoor.name}</p>

                      {selectedDoor.image_path && (
                        <img
                            src={doorImagePath} 
                            alt="Accessible Door" 
                            style={{ width: '50%', borderRadius: '8px' }}
                        />
                      )}

                      {/* <button onClick={() => setShowUploadForm(!showUploadForm)} style={{marginTop: '10px'}}>
                        {showUploadForm ? "Cancel Upload" : "Upload Image"}
                      </button> */}
                      
                      {showUploadForm && (
                        <form
                          onSubmit={async (e) => {
                            e.preventDefault();
                            const formData = new FormData();

                            if (selectedDoor.id) {
                              formData.append("door_id", selectedDoor.id);
                            } else {
                              console.error("Selected door ID is missing");
                            }
                            formData.append("image", uploadFile);
                            

                            try {
                              const response = await fetch(`${BACKEND_URL}/upload-door-image`, {
                                method: "POST",
                                body: formData,
                              });
                  
                              const data = await response.json();
                              console.log("Upload successful:", data);
                  
                              // You could refetch door data or force an update here
                              setShowUploadForm(false);
                              setSelectedDoor(null); 
                            } catch (err) {
                              console.error("Upload failed:", err);
                            }
                          }}
                          style={{ marginTop: '10px' }}
                        >
                          <input type="file" onChange={(e) => setUploadFile(e.target.files[0])} required />
                          <button type="submit">Submit</button>
                        </form>
                      )}

                    </div>
                  </InfoWindow>
                )}

                {/* Call the respective route to display*/}
                {showRoute && renderRouteComponent()}
              {/* {console.log("Rendering polyline with directions:", directions)} */}
              {directions && routeType !== "lowElevation" &&
                <Polyline 
                  path={directions}
                  options={{
                    strokeColor: "blue",
                    strokeWeight: 4,
                    strokeOpacity: 0.8
                  }}/>}
              {directions && routeType === "lowElevation" && 
                directions.map((segment, index) => (
                  <Polyline
                    key={index}
                    path={segment.polyline}
                    options={{
                      // geodesic: true,
                      strokeColor: segment.color,
                      strokeWeight: 4,
                      strokeOpacity: 0.8   
                    }}
                  />
                ))
              }
              </GoogleMap>
            </LoadScript>
          </div>
          
          <div className="directions-info">
            {/* Route Duration & Distance */}
            {directions && (
              <div className="route-summary">
                <h2>Route Information</h2>
                <p><FontAwesomeIcon icon={faClock} style={{color: "#575757",}} />{` Duration: ${(parseInt(duration, 10) / 60).toFixed(1)} minutes`}</p>
                <p><FontAwesomeIcon icon={faRuler} style={{ color: "#FFB900" }} /> {` Distance: ${distance} ft`}</p>
              </div>
            )}

            <div className="instructions-scrollbox">
              <ol className="instruction-list">
                {steps && steps.map((step, index) => (
                  <li key={index} className={`instruction-card ${routeType === "lowElevation" ? "elevation" : ""}`}>
                    <div className="instruction-header">
                      <div className="step-number">{index + 1}</div>
                      <div className="instruction-text" dangerouslySetInnerHTML={{ __html: step.html_instructions }} />
                    </div>

              <div className="instruction-detail">
                Distance: <span>{(step.distance).toFixed(1)} ft</span>
              </div>
                    {routeType === "lowElevation" && (
                      <>
                        <div className="instruction-detail">
                          Elevation: <span>{step.elevation !== undefined ? `${step.elevation.toFixed(2)}m` : "N/A"}</span>
                        </div>
                        {elevationChanges[index] !== undefined && (
                          <div className={`instruction-detail change ${elevationChanges[index] > 0 ? "up" : "down"}`}>
                            Change: <span
                              className="elevation-badge"
                              style={{
                                backgroundColor: getStrokeColor(elevationChanges[index])
                              }}
                            >{elevationChanges[index]}m</span>
                          </div>
                        )}
                      </>
                    )}
                  </li>
                ))}
              </ol>
            </div>
          </div>
 
          {/* Accessibility Features */}    
          {/* Action Buttons */}
          <div className="account-controls">
            {!isLoggedIn ? (
              <button onClick={openLoginModal} className="account-button">
                <FontAwesomeIcon icon={faArrowRightToBracket} /> Login
              </button>
            ) : (
              <>
                <button onClick={() => navigate("/account")} className="account-button">
                  <FontAwesomeIcon icon={faUser} /> My Account
                </button>
                <button onClick={() => {
                  setIsLoggedIn(false);
                  localStorage.removeItem("loggedIn");
                }} className="account-button logout">
                  <FontAwesomeIcon icon={faRightFromBracket} /> Logout
                </button>
              </>
            )}
          </div>
          <div className="action-buttons">
            {/* <button onClick={openLoginModal}><FontAwesomeIcon icon={faArrowRightToBracket} style={{color: "#000000",}}/>Login</button> */}
            <button onClick={handleZoomIn}><FontAwesomeIcon icon={faPlus} style={{color: "#000000",}}/>Zoom In</button>
            <button onClick={handleZoomOut}><FontAwesomeIcon icon={faMinus} style={{color: "#000000",}}/>Zoom Out</button>
            <button onClick={fetchLocation}><FontAwesomeIcon icon={faLocationArrow} style={{color: "#000000",}}/>Location</button>
            <button onClick={handleShowRoute}>Show Route</button>
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
            <form onSubmit={(e) => {
              e.preventDefault();
              setIsLoggedIn(true);
              localStorage.setItem("loggedIn", "true");
              setIsLoginModalOpen(false);
            }}>
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

            <p>-OR-</p>
            
              <a href="#" onClick={openCreateAccountModal}>
                <button className="create-acc-btn">
                  Create Account
                </button>
              </a>
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
