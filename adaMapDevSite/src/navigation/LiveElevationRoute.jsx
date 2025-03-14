import { useEffect, useRef} from "react"

const BACKEND_URL = "http://localhost:5000";

/*
*
* THIS IS USED TO FIND LOWEST ELEVATION OF MULTIPLE ROUTES USING
*                       LIVE TRACKING
*   
* NEED TO CHANGE THIS TO ONLY RUN ONCE AND UPDATE WITH DIRECTIONS
*
*
* User sets location -> find best route -> update this polyline? ->
* 
*
*/

// eslint-disable-next-line react/prop-types
const LiveElevationRouteComponent = ({ destination, onDirectionsUpdate, userLocation}) => {
  const lastPositionRef = useRef(null);
  

  // Get the location of the user 


  // Used to calculate the distance between two different locations
  const haversineDistance = (coord1, coord2) => {
    const R = 6371e3; // Earth radius in meters
    const toRad = (deg) => (deg * Math.PI) / 180;
  
    const dLat = toRad(coord2.latitude - coord1.latitude);
    const dLon = toRad(coord2.longitude - coord1.longitude);
    const lat1 = toRad(coord1.latitude);
    const lat2 = toRad(coord2.latitude);
  
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in meters
  };


  useEffect(() => {
    if (lastPositionRef.current) {
      const distanceMoved = haversineDistance(lastPositionRef.current, userLocation);
      if (distanceMoved < 20) return;
    }
    lastPositionRef.current = userLocation;

    onDirectionsUpdate(null, null, null, [], []);


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
              
              console.log(bestRoute.elevationChanges)
              // Set the directions for the best route
              onDirectionsUpdate(bestRoute.polyline, bestRoute.duration, bestRoute.distance, bestRoute.steps, bestRoute.elevationChanges);
            });
          
        })
        .catch((error) => console.error("Error fetching route", error));
      }

  },[destination, userLocation]);

  return null;
  // return (
  //   <LoadScript googleMapsApiKey={apiKey} libraries={["geometry"]}>
  //     <GoogleMap
  //       onLoad={handleMapLoad}
  //       /*
  //       *
  //       *  Need to update center for KSU
  //       * 
  //       */
  //       // center={{ lat: 34.028487707942915, lng: -84.61515130111765}}
  //       zoom={12}
  //       mapContainerStyle={{ width: "600px", height: "600px"}}
  //       >
  //         {directions && 
  //         <Polyline 
  //             path={directions}
  //             options={{ 
  //               strokeColor: "green", 
  //               strokeWeight: 4, 
  //               strokeOpacity : 0.6}}/>}

  //         {userLocation && directions && (
  //           <Marker
  //             position={userLocation}
  //             icon={{
  //               url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png", 
  //               scaledSize: new window.google.maps.Size(40, 40) 
  //             }}
  //             />
  //         )}
  //       </GoogleMap>
  //       <ul>
  //         <div>{`Duration is: ${(parseInt(duration, 10) / 60).toFixed(1)} minutes`}</div>
  //         <div>{`Total Distance is: ${distance}ft`}</div>
  //         {steps.map((step, index) => (
  //           <li key={index}>
  //             {stripHTML(step.instruction)} in {`${step.distance.toFixed(1)}ft`}
  //             {step.elevation !== null && ` (Elevation: ${step.elevation.toFixed(2)}m)`} 
  //             {index > 0 && ` (Change: ${elevationChanges[index]}m)`}
              
  //           </li>
  //         ))}
  //       </ul>
  //   </LoadScript>
  // )

  
}


export default LiveElevationRouteComponent;