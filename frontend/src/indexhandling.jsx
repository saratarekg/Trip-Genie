// indexhandling.jsx
import React, { useEffect } from 'react';

const IndexHandling = () => {
  useEffect(() => {
    // JavaScript logic for handling the cluster and loading the CSS
    const userCluster = localStorage.getItem("cluster");

    if (userCluster) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      if (userCluster === "4-0") {
        link.href = "/src/accIndex.css";  // Example for cluster 0-0
      } else if (userCluster === "1-1") {
        link.href = "/src/accIndex.css";  // Example for cluster 1-1
      } else {
        link.href = "/src/index.css"; // Default CSS file
      }
      document.head.appendChild(link);
    }
  }, []);  // Empty dependency array ensures this runs only once when the component is mounted

  return null;  // This component does not render anything to the DOM
};

export default IndexHandling;
