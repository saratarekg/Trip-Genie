import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie'; // Import the js-cookie library

function SellerList() {
  const [sellers, setSellers] = useState([]);

  useEffect(() => {
    async function fetchSellers() {
      try {
        const token = Cookies.get('jwt'); // Replace with your actual cookie name
          
          const response = await fetch('http://localhost:4000/admin/sellers', {
          headers: {
            Authorization: `Bearer ${token}`, // Attach the JWT token
          },
        });

        if (response.ok) {
          const data = await response.json();
          setSellers(data);
        } else {
          console.error('Error fetching sellers:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching sellers:', error);
      }
    }

    fetchSellers();
  }, []);

  return (
    <div>
      <h2>Seller List</h2>
      <ul>
        {sellers.map((seller) => (
          <li key={seller.id}>{seller.username}</li>
        ))}
      </ul>
    </div>
  );
}

export default SellerList;
