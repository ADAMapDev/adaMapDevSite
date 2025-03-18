/* eslint-disable react/prop-types */
import { useEffect, useRef} from "react"

const BACKEND_URL = "http://localhost:5000";

/*
*
* THIS IS USED TO FIND REGULAR ROUTE WITH LIVE TRACKING
*
*/

const UserRegularRouteComponent = ({destination, onDirectionsUpdate, userLocation}) => {
  const lastPositionRef = useRef(null);
  

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
      fetch(`${BACKEND_URL}/get-route?origin_lat=${userLocation.lat}&origin_lng=${userLocation.lng}&destination_lat=${destination.lat}&destination_lng=${destination.lng}`)
        .then((response) => response.json())
        .then((data) => {
          console.log("TESTING DUP", data)
          
          /*
          * *****************************************
          * GETS ARRAY of Routes from BACKEND
          * DECODES and Stores data about the Route
          * *****************************************
          */
          const decodedPath = window.google.maps.geometry.encoding.decodePath(data.polyline);
          const distance = data.distance.toFixed(2)
        onDirectionsUpdate(decodedPath, data.duration, distance, data.steps, []);

        })
        .catch((error) => console.error("Error fetching route", error));
      }

  },[destination, userLocation]);

  return null;

}

export default UserRegularRouteComponent