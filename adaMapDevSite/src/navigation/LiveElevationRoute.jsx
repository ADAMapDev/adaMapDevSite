import {useState, useEffect, useRef} from "react"
import {GoogleMap, Polyline, LoadScript, Marker} from "@react-google-maps/api"

const BACKEND_URL = "http://localhost:5000";

/*
*
* THIS IS USED TO FIND LOWEST ELEVATION OF MULTIPLE ROUTES USING
*                       LIVE TRACKING
*
*/

// eslint-disable-next-line react/prop-types
const LiveElevationRouteComponent = ({ destination }) => {
  const [apiKey, setApiKey] = useState(null);
  const [directions, setDirections] = useState(null);
  const [elevationChanges, setElevationChanges] = useState([]);
  const [steps, setSteps] = useState([]);
  const mapRef = useRef(null);
  const [duration, setDuration] = useState("");
  const [distance, setDistance] = useState("");
  const [userLocation, setUserLocation] = useState(null);
  


  const handleMapLoad = (map) => {
    console.log("Map loaded");
    mapRef.current = map;
  }

  // Retrieve the api key from the backend
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
  }, [])

  useEffect(() => {
    // Check if origin and destination are valid
    // Call the Backend to retrieve the routes based on the origin and destination
    if (userLocation && destination) {
      // eslint-disable-next-line react/prop-types
      fetch(`${BACKEND_URL}/get-route-elevation?origin_lat=${userLocation.lat}&origin_lng=${userLocation.lng}&destination_lat=${destination.lat}&destination_lng=${destination.lng}`)
        .then((response) => response.json())
        .then((data) => {
          
          /*
          * GETS ARRAY of Routes from BACKEND
          * DECODES and Stores data about the Route
          */
            const routesWithElevation = data.map((route) => {
              // Debuging
              console.log(route)
              const decodedPath = window.google.maps.geometry.encoding.decodePath(route.polyline);
              // Debugging
              console.log(route.routes[0].legs);
              const routeSteps = route.routes[0].legs.flatMap((leg) => {
                return leg.steps.map((step) => ({
                  // Properties of the route
                  instruction: step.html_instructions,
                  distance: step.distance,
                  start_location: step.start_location,
                  elevation: null
                }))
              })
              /*
              * Elevation Retrieval Section
              */
              return Promise.all(
                routeSteps.map((step) =>
                  fetch(`${BACKEND_URL}/get-elevation?lat=${step.start_location.latLng.latitude}&lng=${step.start_location.latLng.longitude}`)
                    .then((response) => response.json())
                    .then((elevationData) => {
                      console.log(elevationData)
                      return {
                        ...step,
                        elevation: elevationData.elevation
                      }
                    })
                    .catch((error) => {
                      console.error("Error fetching elevation:", error);
                      return {...step, elevation: 0};
                    })
                )
              ).then((stepsWithElevation) => {
                // This has all the details on the route 
                console.log(stepsWithElevation);
                const elevationChanges = stepsWithElevation.map((step, index, arr) => 
                  index > 0 ? (step.elevation - arr[index - 1].elevation).toFixed(2) : 0
                );

                // This is returning undefined array of legnth steps
                console.log(elevationChanges, "We changing")
                return {
                  polyline: decodedPath,
                  steps: stepsWithElevation,
                  elevationChanges,
                  duration: route.duration,
                  distance: (route.distance * 3.28084).toFixed(2)   // Converts distance to miles
                };
              });
            });
            console.log(routesWithElevation, "ROUTES ELEV");

            // This determines what the best route is by the elevation
            Promise.all(routesWithElevation).then((allRoutes) => {
              console.log(allRoutes);
              const bestRoute = allRoutes.reduce((lowest, route) => {
                // Calculates the total difference between for the elevation
                const totalElevationChange = route.elevationChanges.reduce((sum, change) => sum + Math.abs(change), 0);
                return totalElevationChange < (lowest.elevationChanges.reduce((sum, change) => sum + Math.abs(change), 0)) ? route : lowest;
              }, allRoutes[0]);
              
              // Set the directions for the best route
              setDirections(bestRoute.polyline)
              setSteps(bestRoute.steps);
              setElevationChanges(bestRoute.elevationChanges);
              setDuration(bestRoute.duration);
              setDistance(bestRoute.distance);
            });
          
        })
        .catch((error) => console.error("Error fetching route", error));
      }

  },[destination, userLocation]);

  // Get the location of the user 
  useEffect(() => {
    if ("geolocation" in navigator) {
      const watchPos = navigator.geolocation.watchPosition((position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude});

        // HERE WILL BE CHECKING IF GOING OFF ROUTE
        },
        (error) => console.log("Error getting location", error),
        { enableHighAccuracy: true, maximumAge: 1000, timeout: 5000}
      );

      return () => navigator.geolocation.clearWatch(watchPos);
    }
    else {
      console.error("Geolocation is not supported by browser");
    }
  },[directions])

  // Zoom mechanic for the map to automatically zoom
  // Making sure we have the directions set and the map set
  useEffect(() => {
    if (directions && mapRef.current) {
      const bounds = new window.google.maps.LatLngBounds();
      directions.forEach(point => bounds.extend(point));
      mapRef.current.fitBounds(bounds);
    }
  }, [directions]);

  // Function to strip away html attributes from Google Maps API
  const stripHTML = (html) => {
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.textContent || ""
  }

  if (!apiKey) {
    return <h1>Loading Map...</h1>
  }
 
  /*
  Developer Note: With this current implementation, the backend gets hit twice
                  with the same lat and lng request since the map isnt loaded in.

                  This issue should be fixed when we change this implementation 
                  to have the user select their route once the map is already loaded in
  */


  return (
    <LoadScript googleMapsApiKey={apiKey} libraries={["geometry"]}>
      <GoogleMap
        onLoad={handleMapLoad}
        /*
        *
        *  Need to update center for KSU
        * 
        */
        // center={{ lat: 34.028487707942915, lng: -84.61515130111765}}
        zoom={12}
        mapContainerStyle={{ width: "600px", height: "600px"}}
        >
          {directions && 
          <Polyline 
              path={directions}
              options={{ 
                strokeColor: "green", 
                strokeWeight: 4, 
                strokeOpacity : 0.6}}/>}

          {userLocation && directions && (
            <Marker
              position={userLocation}
              icon={{
                url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png", 
                scaledSize: new window.google.maps.Size(40, 40) 
              }}
              />
          )}
        </GoogleMap>
        <ul>
          <div>{`Duration is: ${(parseInt(duration, 10) / 60).toFixed(1)} minutes`}</div>
          <div>{`Total Distance is: ${distance}ft`}</div>
          {steps.map((step, index) => (
            <li key={index}>
              {stripHTML(step.instruction)} in {`${step.distance.toFixed(1)}ft`}
              {step.elevation !== null && ` (Elevation: ${step.elevation.toFixed(2)}m)`} 
              {index > 0 && ` (Change: ${elevationChanges[index]}m)`}
              
            </li>
          ))}
        </ul>
    </LoadScript>
  )

  
}


export default LiveElevationRouteComponent;