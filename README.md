<p align="center">
  <img src="frontend/src/assets/images/TGlogoBG.png" alt="Trip Genie Logo" width=1012>
</p>

[![Typing SVG](https://readme-typing-svg.herokuapp.com?font=Fira+Code&pause=1000&width=435&lines=Making+all+your+wishes+come+true!)](https://git.io/typing-svg)


A comprehensive travel and tourism platform that enables users to book flights, hotels, transportation, activities, and explore historical places while also providing a marketplace for travel-related products.





## Table of Contents
- [Motivation](#motivation)
- [Build Status](#build-status)
- [Code Examples](#code-examples)
- [Code Style](#code-style)
- [Screenshots](#screenshots)
- [Tech/Framework Used](#techframework-used)
- [Features](#features)
- [Installation](#installation)
- [API Reference](#api-reference)
- [Tests](#tests)
- [How to Use](#how-to-use)
- [Contribute](#contribute)
- [Contributors](#contributors)
- [Credits](#credits)
- [License](#license)


## Motivation

Trip Genie was created to revolutionize the travel planning experience by providing a one-stop solution for travelers. The platform bridges the gap between tourists, local guides, and businesses, making travel planning seamless and enriching.

## Build Status

- ✅ Development: Active
- 🚀 Current Version: 1.0.0
- 💻 Platform: Web Application

## Code Examples

### Frontend Example (React)

```jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ItineraryList() {
  const [itineraries, setItineraries] = useState([]);

  useEffect(() => {
    const fetchItineraries = async () => {
      try {
        const response = await axios.get('/tourist/itineraries');
        setItineraries(response.data);
      } catch (error) {
        console.error('Error fetching itineraries:', error);
      }
    };

    fetchItineraries();
  }, []);

  return (
    <div>
      <h2>Available Itineraries</h2>
      <ul>
        {itineraries.map((itinerary) => (
          <li key={itinerary._id}>{itinerary.name}</li>
        ))}
      </ul>
    </div>
  );
}

export default ItineraryList;
```

### Backend Example (Express.js)

```javascript
const express = require('express');
const router = express.Router();
const itineraryController = require('../controllers/itineraryController');

router.get('/itineraries', itineraryController.getAllItineraries);
router.get('/itineraries/:id', itineraryController.getItineraryById);
router.post('/itineraries', itineraryController.createItinerary);
router.put('/itineraries/:id', itineraryController.updateItinerary);
router.delete('/itineraries/:id', itineraryController.deleteItinerary);

module.exports = router;
```

## Code Style

The project follows modern web development practices and conventions:

- React with JavaScript
- Tailwind CSS for styling
- ESLint + Prettier for code formatting
- Component-based architecture
- Role-based access control

## Screenshots

<details>
<summary>Home Page</summary>
<p align="center">
  <img src="frontend/public/images/screenshot1.png" alt="Tourist Sign Up" width="90%" style="margin: 10px;">
</p>
</details>

<details>
<summary>View your Bookings</summary>
<p align="center">
  <img src="frontend/public/images/screenshot2.png" alt="Home Page" width="90%" style="margin: 10px;">
</p>
</details>

<details>
<summary>View available itineraries</summary>
<p align="center">
  <img src="frontend/public/images/screenshot3.png" alt="Itinerary Details" width="90%" style="margin: 10px;">
</p>
</details>

<details>
<summary>Purchase from our travel gift shop</summary>
<p align="center">
  <img src="frontend/public/images/screenshot4.png" alt="Filter Sidebar" width="90%" style="margin: 10px;">
</p>
</details>



<details>
<summary>Book a Hotel</summary>
    <p align="center">
  <img src="frontend/public/images/screenshot5.png" alt="Flights Home" width="90%" style="margin: 10px;">
</p>
<p align="center">
  <img src="frontend/public/images/screenshot7.png" alt="Payment Method" width="90%" style="margin: 10px;">
</p>

</details>

<details>
<summary>View your Profile</summary>
<p align="center">
  <img src="frontend/public/images/screenshot6.png" alt="Taxi Home" width="90%" style="margin: 10px;">
</p>
</details>


## Tech/Framework Used

### Built With
- React 18 with Vite
- JavaScript
- Tailwind CSS
- MongoDB
- Node.js
- Express.js

### Key Libraries
- js-cookie for authentication
- axios for API requests
- lucide-react for icons
- cloudinary for image storing and uploading
- stripe for payment handling

## Features

### For Tourists
- Book flights, hotels, and transportation
- Explore and book activities and itineraries
- Visit historical places
- Shop travel-related products
- Loyalty points system
- Personalized recommendations

### For Tour Guides
- Create and manage itineraries
- Track bookings and revenue
- Manage profile and credentials
- Receive ratings and reviews

### For Sellers
- Product management
- Order processing
- Inventory tracking
- Sales analytics

### For Advertisers
- Create and manage activities
- Set up transportation options
- Track bookings and revenue
- Manage advertising campaigns
- Access analytics and performance reports

### For Tourism Governors
- Manage historical places
- Create and manage tags
- Monitor tourism activities

### For Admins
- Manage user accounts
- Monitor and moderate content
- Generate sales reports
- Handle complaints and support tickets
- Create and manage promo codes
- Oversee overall platform operations

## Installation

1. Clone the repository:
```bash
git clone https://github.com/Advanced-computer-lab-2024/Trip-Genie.git
```

2. Install dependencies:
```bash
cd TripGenie
cd frontend
npm install
cd ..
cd backend
npm install 
```

3. Set up environment variables:
```
MONGODB_URI= ...
JWT_SECRET= ...
STRIPE_KEY= ...
STRIPE_PRIVATE_KEY = ...
CLOUDINARY_API_KEY = ...
CLOUDINARY_API_SECRET = ...
VITE_AMADEUS_API_SECRET = ...
VITE_STRIPE_PUBLISHABLE_KEY = ...
```

4. Run the development server:
```bash
cd Trip-Genie/frontend
npm run dev
cd ../backend
npm run dev 
```

## API Reference

External APIs used: 

https://developers.amadeus.com/self-service/category/flights

https://docs.stripe.com/api

https://developers.booking.com/metasearch/connect-api

Local APIs 
You can view all our APIs from the [routes](./backend/routes) folder in the backend.



## Tests

Run the test suite:

```bash
cd backend
npm run test
```

Here's an example of how to test the `GET /itinerary` endpoint:

```javascript
test('GET /itinerary', async () => {
    const response = await request(app).get('/itinerary');
    expect(response.statusCode).toBe(200);
    expect(response.body).toStrictEqual([]);
});
```

## How to Use

1. Sign up for an account based on your role (Tourist, Tour Guide, Seller, etc.)
2. Complete your profile and verify your account
3. Explore the platform features based on your role:
   - Tourists can browse and book activities
   - Tour Guides can create itineraries
   - Sellers can list products
   - Tourism Governors can manage historical places

## Contribute

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Contributors

<table>
<tr>
    <td align="center">
        <a href="https://github.com/Aby293">
            <img src="https://github.com/Aby293.png" width="100px;" alt="Abdelrahman Elaby"/><br />
            <sub><b>Abdelrahman Elaby</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/samalouty">
            <img src="https://github.com/samalouty.png" width="100px;" alt="Abdelrahman Elsamalouty"/><br />
            <sub><b>Abdelrahman Elsamalouty</b></sub>
        </a>
    </td>
   <td align="center">
        <a href="https://github.com/ahmedakls">
            <img src="https://github.com/ahmedakls.png" width="100px;" alt="Ahmed Alaa"/><br />
            <sub><b>Ahmed Alaa</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/Houba3">
            <img src="https://github.com/Houba3.png" width="100px;" alt="Ehab Medhat"/><br />
            <sub><b>Ehab Medhat</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/habibaelsonbaty">
            <img src="https://github.com/habibaelsonbaty.png" width="100px;" alt="Habiba Hesham"/><br />
            <sub><b>Habiba Hesham</b></sub>
        </a>
    </td>
  <tr>
    <td align="center">
        <a href="https://github.com/HazemMansour1">
            <img src="https://github.com/HazemMansour1.png" width="100px;" alt="Hazem Mansour"/><br />
            <sub><b>Hazem Mansour</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/jzein">
            <img src="https://github.com/jzein.png" width="100px;" alt="Jana Zein"/><br />
            <sub><b>Jana Zein</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/amyy847">
            <img src="https://github.com/amyy847.png" width="100px;" alt="Manuella Ehab"/><br />
            <sub><b>Manuella Ehab</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/Radwa-Ibrahim0">
            <img src="https://github.com/Radwa-Ibrahim0.png" width="100px;" alt="Radwa Ahmed"/><br />
            <sub><b>Radwa Ahmed</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/zeinafadel">
            <img src="https://github.com/zeinafadel.png" width="100px;" alt="Zeina Mohamed Fadel"/><br />
            <sub><b>Zeina Mohamed Fadel</b></sub>
        </a>
    </td>
</tr>
</table>


## Credits

- Design inspiration from modern travel platforms
- Icons from Lucide React
- UI Components from shadcn/ui
- Maps integration powered by Google Maps
- Payment powered by Stripe
- Hotels search and booking powered by Booking
- Flights search and booking powered by Amadeus 

## License

MIT License - see the [LICENSE.md](LICENSE.md) file for details

