import { useState, useRef, useEffect } from "react";
import "./App.css";
import { GoogleMap, InfoWindow, LoadScript, Marker, Polyline } from "@react-google-maps/api";
import UserRegularRouteComponent from "./navigation/UserRegularRoute";
import LiveElevationRouteComponent from "./navigation/LiveElevationRoute";
import LocationTracker from "./utils/LocationTracker";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faWheelchair } from '@fortawesome/free-solid-svg-icons'
import { faDoorClosed } from '@fortawesome/free-solid-svg-icons'
import { faMound } from '@fortawesome/free-solid-svg-icons'
import { faArrowRightToBracket } from '@fortawesome/free-solid-svg-icons'
import { faLocationArrow } from '@fortawesome/free-solid-svg-icons'
import { faPlus } from '@fortawesome/free-solid-svg-icons'
import { faMinus } from '@fortawesome/free-solid-svg-icons'
import wheelchairIcon from "./assets/wheelchair_icon.png"

/* Properties of the map */
const libraries = ["places", "geometry"];
/* Centers around Kennesaw State */
const center = { lat: 34.0384731003286, lng: -84.58150433167211 };
const mapContainerStyle = {
  width: "1400px",
  height: "800px"
};

function App() {
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
  const [accessibleDoors, setAccessibleDoors] = useState([]);
  const [accessibleDoorEnabled, setAccessibleDoorEnabled] = useState(false);

  const BACKEND_URL = "http://localhost:5000";

  /* Retrieve API key for map */ 
  useEffect(() => {

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

    const getAccessibleDoors = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/accessible-doors`);
        const data = await response.json();
        setAccessibleDoors(data);
      } catch (error) {
        console.error("Error fetching accessible doors", error)
      }
    }
    getAccessibleDoors();
  }, []);
  

  // const accessibleDoors = [
  //   {id: 1, name: 'Burruss Building', lat: 34.03916307618097, lng: -84.58182548615811 },
  //   {id: 2, name: 'Technology Services', lat: 34.04324444304241, lng: -84.58511178527453 },
  //   {id: 4, name: 'Jolley Lodge', lat: 34.041975382594565, lng: -84.58503997779815 },
  //   {id: 5, name: 'Bailey Performance Center', lat: 34.04104538235975, lng: -84.58388467029071 },
  //   {id: 6, name: 'Zuckerman Museum', lat: 34.041127569948884,lng: -84.58332319433181 },
  //   {id: 7, name: 'Wellstar College of Health and Human Services', lat: 34.04126007515278, lng: -84.5823230947359 },
  //   {id: 8, name: 'Wellstar College of Health and Human Services', lat: 34.04040804794117, lng: -84.58227837728104 },
  //   {id: 9, name: 'Wellstar College of Health and Human Services', lat: 34.04049249904415, lng: -84.58162052602621 },
  //   {id: 10, name: 'Central Parking Deck', lat: 34.04091628989932, lng: -84.58155510939581 },
  //   {id: 11, name: 'Visual Arts', lat: 34.04014013820758, lng: -84.58495900426912 },
  //   {id: 12, name: 'Wilson Annex', lat: 34.040382041842314, lng: -84.58407716154898 },
  //   {id: 13, name: 'Wilson Building', lat: 34.04021534710124, lng: -84.5831444233547 },
  //   {id: 14, name: 'Music Building', lat: 34.040181974276315, lng: -84.58287930990906 },
  //   {id: 15, name: 'The Commons', lat: 34.040112254887596, lng: -84.5822049725835 },
  //   {id: 16, name: 'Burruss Building', lat: 34.03916307618097, lng: -84.58182548615811 },
  //   {id: 17, name: 'Burruss Building', lat: 34.039334634541554, lng: -84.58151844214942 },
  //   {id: 18, name: 'Bagwell Education Building', lat: 34.0396379119677, lng: -84.58087532494412 },
  //   {id: 19, name: 'Bagwell Education Building', lat: 34.039037425081695, lng: -84.5809418434928 },
  //   {id: 20, name: 'Kennesaw Hall', lat: 34.03889684364226, lng: -84.580944525696 },
  //   {id: 21, name: 'Kennesaw Hall', lat: 34.037958423913985, lng: -84.5807963755791 },
  //   {id: 22, name: 'Kennesaw Hall', lat: 34.03813234820042, lng: -84.58038669152127 },
  //   {id: 23, name: 'Convocation Center', lat: 34.03739857647659, lng: -84.5804216302843 },
  //   {id: 24, name: 'Siegel Student Recreation & Activities Center', lat: 34.03685306796862, lng: -84.58134592872163 },
  //   {id: 25, name: 'Siegel Student Recreation & Activities Center', lat: 34.03685051220012, lng: -84.58239021303122 },
  //   {id: 26, name: 'Siegel Student Recreation & Activities Center', lat: 34.03752287232788, lng: -84.58220111729591 },
  //   {id: 27, name: 'East Parking Deck', lat: 34.0366216129326, lng: -84.58115296368257 },
  //   {id: 28, name: 'University Bookstore', lat: 34.03785497707045, lng: -84.5831169079928 },
  //   {id: 29, name: 'Sturgis Library', lat: 34.03817439372666, lng: -84.58373969823 },
  //   {id: 30, name: 'Pilcher Building', lat: 34.038288000488095, lng: -84.58447613924874 },
  //   {id: 31, name: 'Pilcher Building', lat: 34.03806406828368, lng: -84.58431721837084 },
  //   {id: 32, name: 'Technology Annex', lat: 34.03786021162154, lng: -84.58464920626845 },
  //   {id: 33, name: 'Mathematics and Statistics', lat: 34.03772185089651, lng: -84.58383582638564 },
  //   {id: 34, name: 'Public Safety', lat: 34.03779644824888, lng: -84.58507185459054 },
  //   {id: 35, name: 'Office of Institutional Research', lat: 34.03693417640655, lng: -84.58675097542397 },
  //   {id: 36, name: 'Institute for Cybersecurity Workforce Development', lat: 34.0366027572148, lng: -84.58695333977656 },
  //   {id: 37, name: 'Catholic Center at KSU', lat: 34.03634308250317, lng: -84.5868852037043 },
  //   {id: 38, name: 'Science Building', lat: 34.036176140973545, lng: -84.5838534655383 },
  //   {id: 39, name: 'Clendenin Building', lat: 34.035990222567854, lng: -84.5832859278377 },
  //   {id: 40, name: 'Science Laboratory', lat: 34.0358330372012, lng: -84.58378799464447 },
  //   {id: 41, name: 'Town Point Office of Undergraduate Admissions', lat: 34.030192038882014, lng: -84.5812208966054 },
  //   {id: 42, name: 'Town Point Office of Undergraduate Admissions', lat: 34.02995662532501, lng: -84.581545605683 },
  //   {id: 43, name: 'Student Athlete Success Services', lat: 34.02971179412259, lng: -84.58461356049521 },
  //   {id: 44, name: 'Owls Nest', lat: 34.029991983405665, lng: -84.57001181566912 },
  //   {id: 45, name: 'KSU Center', lat: 34.03153703386949, lng: -84.57355444798323 },
  //   {id: 46, name: 'KSU Center', lat: 34.031628424526644, lng: -84.57475627461659 },
  //   {id: 47, name: 'KSU Center', lat: 34.030627036521274, lng: -84.5748219887467 },
  //   {id: 48, name: 'KSU Center', lat: 34.03052548858506, lng: -84.57358939259085 },
  //   {id: 49, name: 'Public Safety', lat: 34.027141980291134, lng: -84.56971263811648 },
  //   {id: 50,  name: 'Carmichael Student Center', lat: 34.038533480073355, lng: -84.5831447839737 },
  //   {id: 51,  name: 'Carmichael Student Center', lat: 34.038660170620055, lng: -84.58283364772798 },
  //   {id: 52, name: 'Academic Learning Center', lat: 34.03931806936354, lng: -84.58317697048189 },
  //   {id: 53, name: 'Academic Learning Center', lat: 34.03978259614599, lng: -84.58298921585084 },
  //   {id: 54, name: 'English Building', lat: 34.03942475516541, lng: -84.58414524793626,  },
  //   {id: 55, name: 'English Building', lat: 34.03910025210137, lng: -84.5841532945633 },
  //   {id: 56, name: 'English Building', lat: 34.03979815441523, lng: -84.58402454853059 },
  //   {id: 57, name: 'University Hall', lat: 34.038938000103784, lng: -84.58437055349351 },
  //   {id: 58, name: 'Willingham Hall', lat: 34.038973562212, lng: -84.58483189344408  },
  //   {id: 59, name: 'Social Sciences', lat: 34.03870240076022, lng: -84.58521813154222 },
  // ];

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


  /* Renders the route based on what the user has selected in the button */
  const renderRouteComponent = () => {
    switch (routeType) {
      // case "wheelchair":
      //   return (
      //     <LiveWheelchairRouteComponent></LiveWheelchairRouteComponent>
      //   );

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
  if (!apiKey) return <div>Fetching Key</div>


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
          <button onClick={() => setRouteType("regular")}>
            <span></span>Reset Options</button>
          <button onClick={() => setRouteType("wheelchair")}>
            <span><FontAwesomeIcon icon={faWheelchair}/></span>Wheelchair Accessible</button>
          <button onClick={() => setAccessibleDoorEnabled(prev => !prev)}>
            <span><FontAwesomeIcon icon={faDoorClosed}/></span>{accessibleDoorEnabled ? "Accessible Door: On": "Accessible Door: Off"}</button>
          <button onClick={() => setRouteType("lowElevation")}>
            <span><FontAwesomeIcon icon={faMound}/></span>Low Elevation Change</button>
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
                    </div>
                  </InfoWindow>
                )}

                {/* Call the respective route to display*/}
                {showRoute && renderRouteComponent()}
              {console.log("Rendering polyline with directions:", directions)}
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
      <p><FontAwesomeIcon icon={faClock} style={{color: "#575757",}} />{`Duration: ${(parseInt(duration, 10) / 60).toFixed(1)} minutes`}</p>
      <p><FontAwesomeIcon icon={faRuler} style={{ color: "#FFB900" }} /> {`Distance: ${distance} ft`}</p>
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
          <div className="action-buttons">
            <button onClick={openLoginModal}><FontAwesomeIcon icon={faArrowRightToBracket} style={{color: "#000000",}}/>Login</button>
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
