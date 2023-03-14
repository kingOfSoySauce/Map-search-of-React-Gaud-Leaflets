import React, { useEffect, useState } from "react";
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import MapSearch from "./MapSearch";
import "./App.css";

function App() {
  const [map, setMap] = useState();
  useEffect(() => {
    if (map) return;
    const m = L.map("leaflet", {
      minZoom: 3,
      maxZoom: 14,
      center: [31.142267, 121.808682], //中心点的纬、经度
      zoom: 13,
      zoomControl: false,
      attributionControl: false,
    });
    setMap(m);

    L.tileLayer(
      "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw",
      {
        id: "mapbox/streets-v11", // map样式
      }
    ).addTo(m);
  }, []);
  return (
    <div className="App">
      <MapSearch map={map}></MapSearch>
      <div id="leaflet" className="map"></div>
    </div>
  );
}

export default App;
