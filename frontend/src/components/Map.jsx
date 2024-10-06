// src/components/Map.js
import React from 'react';
import PropTypes from 'prop-types';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const Map = ({ position, height, width }) => {
  const [latitude, longitude] = position;

  // Function to open Google Maps in a new tab
  const openGoogleMaps = () => {
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    window.open(googleMapsUrl, '_blank');
  };

  return (
    <MapContainer center={position} zoom={13} style={{ height, width }}>
      <TileLayer
        attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={position}>
        <Popup>
          <button onClick={openGoogleMaps}>Open in Google Maps</button>
        </Popup>
      </Marker>
    </MapContainer>
  );
};

Map.propTypes = {
  position: PropTypes.arrayOf(PropTypes.number).isRequired,
  height: PropTypes.string.isRequired,
  width: PropTypes.string.isRequired,
};

export default Map;
