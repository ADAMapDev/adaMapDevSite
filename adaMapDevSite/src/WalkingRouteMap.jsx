import {useState, useEffect, useRef} from "react"
import {GoogleMap, Polyline, LoadScript} from "@react-google-maps/api"

const BACKEND_URL = "http://localhost:5000";

// eslint-disable-next-line react/prop-types
const RouteMap = ({origin, destination}) => {
  const [apiKey, setApiKey] = useState(null);
  const [directions, setDirections] = useState(null);
  const [elevationChanges, setElevationChanges] = useState([]);
  const [steps, setSteps] = useState([]);
  const mapRef = useRef(null);


  const handleMapLoad = (map) => {
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
      .then((response) => {
        return response.json()
      })
      .then((data) => {
        console.log("Polyline from backend:", data.polyline);
        if (window.google && window.google.maps && window.google.maps.geometry && data.polyline) {        
          const decodedPath = window.google.maps.geometry.encoding.decodePath(data.polyline);
          setDirections(decodedPath);
          
          // Getting the route details and saving it as steps
          if (data.routes && data.routes.length > 0) {
            const route = data.routes[0];
            const routeSteps = route.legs.flatMap((leg) => 
            leg.steps.map((step) => ({
              instruction: step.html_instructions,
              distance: step.distance.text,
              start_location: step.start_location,
              elevation: null
              }))
            );
            setSteps(routeSteps);
            console.log("Steps are ", routeSteps)

            // Calculating the elevation for the steps
            // routeSteps.forEach((step, index) => {
            //   fetch(`${BACKEND_URL}/get-elevation?lat=${step.start_location.lat}&lng=${step.start_location.lng}`)
            //     .then((response) => response.json())
            //     .then((elevationData) => {
            //       const updatedSteps = [...routeSteps];
            //       updatedSteps[index].elevation = elevationData.elevation;

            //       const elevationChange = elevationData.elevation - updatedSteps[index - 1].elevation;
            //       updatedSteps[index].elevationChange = elevationChange.toFixed(2);
                  
            //       // updatedSteps[index].elevation = elevationData.elevation
            //       setSteps(updatedSteps);
            //     });
            // })
          console.log(routeSteps);
           Promise.all(
            routeSteps.map((step) => {
              console.log(step.start_location.lat);
              console.log(step.start_location.lng);

              return fetch(`${BACKEND_URL}/get-elevation?lat=${step.start_location.lat}&lng=${step.start_location.lng}`)
                .then((response) => response.json())
                .then((elevationData) => {
                  console.log(elevationData);
                  return {...step, elevation: elevationData.elevation};
                })
                .catch((error) => {
                  console.error("Error fetching elevation:", error);
                  return {...step, elevation: 0};
                })
            })
           ).then((stepsWithElevation) => {
              setSteps(stepsWithElevation);
              console.log("Updated steps", stepsWithElevation)

              const updatedsteps = stepsWithElevation.map((step, index, arr) => 
                 index > 0 ? (step.elevation - arr[index - 1].elevation).toFixed(2) : 0
              );

              setElevationChanges(updatedsteps)
           })
          //  ).then((stepsWithElevation) => {
          //     console.log("Steps with elevation:", stepsWithElevation);
              
          //   const updatedSteps = stepsWithElevation.map((step, index, arr) => {
          //   const elevationChange = step.elevation - arr[index - 1].elevation
          //   return {...step, elevationChange: elevationChange.toFixed(2)}
          //  });
           
          //  setSteps(updatedSteps);
          //  // End of if
          // });
        }
      }
      })
      .catch((error) => console.error("Error fetching route:", error))
    }
    
  },[origin, destination]);

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
        // center={{ lat: 34.028487707942915, lng: -84.61515130111765}}
        zoom={12}
        mapContainerStyle={{ width: "600px", height: "600px"}}
        >
          {directions && <Polyline 
                        path={directions}
                        options={{ strokeColor: "green", strokeWeight: 4, strokeOpacity : 0.6}}/>}
        </GoogleMap>
        <ul>
          {steps.map((step, index) => (
            <li key={index}>
              {stripHTML(step.instruction)} in {step.distance}
              {step.elevation !== null && ` (Elevation: ${step.elevation.toFixed(2)}m)`} 
              {index > 0 && ` (Change: ${elevationChanges[index]}m)`}
            </li>
          ))}
        </ul>
    </LoadScript>
  )

  
}


export default RouteMap