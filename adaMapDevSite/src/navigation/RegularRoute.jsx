import {useState, useEffect, useRef} from "react"
import {GoogleMap, Polyline, LoadScript} from "@react-google-maps/api"
import BACKEND_URL from "./utils/url"


// const BACKEND_URL = "http://localhost:5000";
// const BACKEND_URL = "https://3391-168-28-186-189.ngrok-free.app"
/*
*
* THIS IS USED TO FIND REGULAR ROUTE
*
*/

// eslint-disable-next-line react/prop-types
const RegularRouteComponent = ({origin, destination}) => {
  const [apiKey, setApiKey] = useState(null);
  const [directions, setDirections] = useState(null);
  const [steps, setSteps] = useState([]);
  const mapRef = useRef(null);
  const [duration, setDuration] = useState("");
  const [distance, setDistance] = useState("");
  

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
    if (origin && destination) {
      // eslint-disable-next-line react/prop-types
      fetch(`${BACKEND_URL}/get-route?origin_lat=${origin.lat}&origin_lng=${origin.lng}&destination_lat=${destination.lat}&destination_lng=${destination.lng}`)
        .then((response) => response.json())
        .then((data) => {
          
          /*
          * *****************************************
          * GETS ARRAY of Routes from BACKEND
          * DECODES and Stores data about the Route
          * *****************************************
          */
          const decodedPath = window.google.maps.geometry.encoding.decodePath(data.polyline);
            
          /*
          * Sets the attributes for the 1 route
          */
          setDirections(decodedPath);
          setDuration(data.duration);
          setDistance((data.distance * 3.28084).toFixed(2));
          setSteps(data.steps);

        })
        .catch((error) => console.error("Error fetching route", error));
      }

  },[origin, destination]);


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

        </GoogleMap>
        <ul>
          <div>{`Duration is: ${(parseInt(duration, 10) / 60).toFixed(1)} minutes`}</div>
          <div>{`Total Distance is: ${distance}ft`}</div>
          {steps.map((step, index) => (
            <li key={index}>
              {stripHTML(step.html_instructions)} in {`${step.distance.toFixed(1)}ft`}
              
              
            </li>
          ))}
        </ul>
    </LoadScript>
  )

  
}


export default RegularRouteComponent