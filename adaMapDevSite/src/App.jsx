import { useState, useRef, useEffect } from "react";
import "./App.css";
import { GoogleMap, LoadScript, Marker, Polyline } from "@react-google-maps/api";
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


const libraries = ["places", "geometry"];
const center = { lat: 34.0384731003286, lng: -84.58150433167211 };
const mapContainerStyle = {
  width: "600px",
  height: "600px"
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


  const apiKey = "AIzaSyCEDX3d0qqPwYLybn_-67LCUq6k26CvYZ0";

  /* Retrieve API key for map */ 
  // useEffect(() => {
  //   const getApiKey = async () => {
  //     try {
  //       const response = await fetch(`${BACKEND_URL}/get-api-key`);
  //       const data = await response.json()
  //       setApiKey(data.apiKey)
  //     } catch (error) {
  //       console.error("Error fetching key:, ", error);
  //     }
  //   };
  //   getApiKey();
  // }, []);
  


  // const locations = [
  //   "Wellstar College of Health and Human",
  //   "Silhwell Theater at Kennesaw State",
  //   "The Commons",
  //   "West Parking Deck",
  //   "Music Building",
  //   "Bagwell College of Education",
  //   "Carmichael Student Center",
  //   "Kennesaw Hall",
  //   "Dr. Betty L. Siegel Student Recreation",
  //   "Sturgis Library",
  //   "Mathematics and Statistics",
  //   "Burruss Building",
  //   "Convocation Center"
  // ];

  /* Testing Locations */ 
  const locations = [
    { name: "Wellstar College of Health and Human", lat: 34.038, lng: -84.615},
    { name: "Stillwell Theater", lat: 34.034, lng: -84.608},
    { name: "The Commons", lat: 34.037, lng: -84.610},
    { name: "Testing House", lat: 34.003144766497456, lng: -84.57567354414421},
    { name: "Middle of nowhere", lat: 34.00066396294443, lng: -84.85132638295222},
    { name: "Publix", lat: 34.0295784043314, lng: -84.77891916590933}
  ]




  {/* What the side buttons will do */}

  const login = () => {
    alert("pops up a login page");
  };

  // const zoomIn = () => {
  //   alert("this will zoom in on the map");
  // };

  // const zoomOut = () => {
  //   alert("this will zoom out on the map");
  // };

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

  const handleLocationClick = (location) => {
    setSearchQuery(location.name);
    setShowDropdown(false);
    /* Update this later to query the coordinates from the database */ 
    setDestination({lat: location.lat, lng: location.lng})
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
  }

  /* Handles the updating of the attributes of the route for the components */
  const handleDirectionsUpdate = (decodedPath, duration, distance, steps, elevationChanges) => {
    setDirections(decodedPath || []);
    setSteps(steps || "");
    setDuration(duration || "");
    setDistance(distance || "");
    setElevationChanges(elevationChanges || []);
  }

  /* Renders the route based on what the user has selected in the button */
  const renderRouteComponent = () => {
    switch (routeType) {
      // case "wheelchair":
      //   return (
      //     <LiveWheelchairRouteComponent></LiveWheelchairRouteComponent>
      //   );

      // case "accessibleDoor":
      //   return (
      //     <LiveAccessibleDoorRouteComponent></LiveAccessibleDoorRouteComponent>
      //   ); 
      case "lowElevation":
        return (
          <LiveElevationRouteComponent
            destination={destination}
            onDirectionsUpdate={handleDirectionsUpdate}
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
                {locations.map((location, index) => (
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
          <button onClick={() => setRouteType("accessibleDoor")}>
            <span><FontAwesomeIcon icon={faDoorClosed}/></span>Accessible Door</button>
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
                coordinates into the parameters */}
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
                      scaledSize: { width: 40, height: 40}
                    }}
                  />
                )}
                {/* Call the respective route to display*/}
                {showRoute && renderRouteComponent()}
              {console.log("Rendering polyline with directions:", directions)}
              {directions && 
                <Polyline 
                  path={directions}
                  options={{
                    strokeColor: "red",
                    strokeWeight: 4,
                    strokeOpacity: 0.8
                  }}/>}
              </GoogleMap>
            </LoadScript>
          </div>
          
          {/* Display the route information */}
          <div className="directions-info">
            {directions && (
              <>
                <div>{`Duration: ${(parseInt(duration, 10) / 60).toFixed(1)} minutes`}</div>
                <div>{`Distance: ${distance} ft`}</div>
              </>
            )}
            {/* Routes with no elevation */}
            {routeType !== "lowElevation" && (
               steps && steps.map((step, index) => (
                  <li key={index}>{`${step.html_instructions} in ${(step.distance).toFixed(1)}ft`}</li>
                ))
              )}
            {/* Routes with elevation */}
            {routeType === "lowElevation" && (
              steps && steps.map((step, index) => (
                <li key={index}>
                  {`${step.instruction} in ${(step.distance).toFixed(1)}`}
                  {step.elevation !== undefined ? ` (Elevation: ${step.elevation.toFixed(2)})`: ""}
                  {index > 0 && elevationChanges[index] !== undefined ? ` (Change: ${elevationChanges[index]}m)` : ""}
                </li>
              ))
            )}
            <ul>
              
            </ul>
          </div>
          {/* Accessibility Features */}    
          {/* Action Buttons */}
          <div className="action-buttons">
            <button onClick={login}><FontAwesomeIcon icon={faArrowRightToBracket}/></button>
            <button onClick={handleZoomIn}><FontAwesomeIcon icon={faPlus}/></button>
            <button onClick={handleZoomOut}><FontAwesomeIcon icon={faMinus}/></button>
            <button onClick={fetchLocation}><FontAwesomeIcon icon={faLocationArrow}/></button>
            <button onClick={handleShowRoute}>Show Route</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
