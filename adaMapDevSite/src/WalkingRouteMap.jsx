import {useState, useEffect} from "react"
import {GoogleMap, Polyline, LoadScript} from "@react-google-maps/api"

const BACKEND_URL = "http://localhost:5000";

// eslint-disable-next-line react/prop-types
const RouteMap = ({origin, destination}) => {
  const [apiKey, setApiKey] = useState(null);
  const [directions, setDirections] = useState(null);

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
      .then((response) => {
        return response.json()
      })
      .then((data) => {
        console.log("Polyline from backend:", data.polyline);
        console.log("Decoded Path,", window.google.maps.geometry.encoding.decodePath(data.polyline))
        if (data.polyline) {        
          const decodedPath = window.google.maps.geometry.encoding.decodePath(data.polyline);
          setDirections(decodedPath);
        }
      })
      .catch((error) => console.error("Error fetching route:", error))
    }
    
  },[origin, destination]);

  if (!apiKey) {
    return <h1>Loading Map...</h1>
  }
  
  return (
    <LoadScript googleMapsApiKey={apiKey} libraries={["geometry"]}>
      <GoogleMap
        center={{ lat: 34.028487707942915, lng: -84.61515130111765}}
        zoom={12}
        mapContainerStyle={{ width: "100%", height: "500px"}}
        >
          {directions && <Polyline 
                        path={directions}
                        options={{ strokeColor: "00FF00", strokeWeight: 4, strokeOpacity : 0.8}}/>}
        </GoogleMap>
    </LoadScript>
  )

  
}


export default RouteMap