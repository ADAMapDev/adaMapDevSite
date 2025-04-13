import { useEffect } from "react";

// eslint-disable-next-line react/prop-types
const LocationTracker = ({ onLocationUpdate, setFetchLocation }) => {

  const fetchLocation = () => {
    if (!navigator.geolocation) {
      console.error("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        onLocationUpdate({ lat: latitude, lng: longitude }); // Pass updated location
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            alert("User denied the request for Geolocation");
            break;
          case error.POSITION_UNAVAILABLE:
            alert("Location information is unavailable");
            break;
          case error.TIMEOUT:
            alert("The request to get user location timed out")
            break;
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Auto-fetch location when component mounts
  useEffect(() => {
    setFetchLocation(() => fetchLocation)
  }, []);

  return null;
};

export default LocationTracker;
