
import "./App.css";
// import WalkingRouteMap from "./WalkingRouteMap";
import RegularRouteComponent from "./navigation/RegularRoute";

function App() {

  return (
    <div className="App">
      {/* Sidebar */}
      <div className="sidebar">
        <input
          type="text"
          placeholder="Search for a place or an address"
          style={{
            padding: "10px",
            border: "1px solid #ccc",
            borderRadius: "5px",
          }}
        />
        <button><span>♿</span> Wheelchair Accessible</button>
        <button><span>🚪</span> Accessible Door</button>
        <button><span>📉</span> Low Elevation Change</button>
      </div>

      {/* Map Container */}
      <div className="map-container">
        <div className="map-placeholder"> 
          {/* Placed the map function here for now
              Testing it out by manually adding the 
              coordinates into the parameters */}
          <RegularRouteComponent
            origin={{ lat: 34.03887, lng: -84.58559 }}
            destination={{ lat: 34.04008, lng: -84.58220 }}/></div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <button title="Login">↩</button>
          <button title="Zoom In">+</button>
          <button title="Zoom Out">-</button>
          <button title="Current Location">▶</button>
        </div>
        
      </div>
    </div>
  );
}

export default App;
