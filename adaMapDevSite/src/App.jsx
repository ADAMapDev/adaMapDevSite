
import "./App.css";

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
        <div className="map-placeholder">Map will load here</div>

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
