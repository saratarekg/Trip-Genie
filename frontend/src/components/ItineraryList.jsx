import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie'; // Import the js-cookie library

const ItineraryList = () => {
    const [itineraries, setItineraries] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchItineraries = async () => {
            try {
                const token = Cookies.get('jwt');
                const response = await axios.get('http://localhost:4000/tourist/itineraries', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                });
                const filteredItineraries = response.data.filter(itinerary => 
                    itinerary.availableDates.some(dateObj => new Date(dateObj.date) > new Date())
                );
                setItineraries(filteredItineraries);
            } catch (err) {
                setError(err.message);
            }
        };

        fetchItineraries();
    }, []);

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div>
            <h1> Upcoming Itineraries</h1>
            {itineraries.length === 0 ? (
                <p>No itineraries available.</p>
            ) : (
                <ul>
                    {itineraries.map(itinerary => (
                        <li key={itinerary._id}>
                            {itinerary.title && <h2>{itinerary.title}</h2>}
                            {itinerary.description && <p>{itinerary.description}</p>}
                            {itinerary.language && <p>Language: {itinerary.language}</p>}
                            {itinerary.price !== undefined && <p>Price: ${itinerary.price}</p>}
                            {itinerary.pickUpLocation && <p>Pick Up Location: {itinerary.pickUpLocation}</p>}
                            {itinerary.dropOffLocation && <p>Drop Off Location: {itinerary.dropOffLocation}</p>}
                            {itinerary.accessibility !== undefined && (
                                <p>Accessibility: {itinerary.accessibility ? 'Yes' : 'No'}</p>
                            )}
                            <h3>Available Dates:</h3>
                            <ul>
                                {itinerary.availableDates.map(dateObj => (
                                    <li key={dateObj._id}>
                                        {dateObj.date && (
                                            <p>Date: {new Date(dateObj.date).toLocaleDateString()}</p>
                                        )}
                                        <ul>
                                            {dateObj.times.map(time => (
                                                <li key={time._id}>
                                                    {time.startTime && <p>Start Time: {time.startTime}</p>}
                                                    {time.endTime && <p>End Time: {time.endTime}</p>}
                                                </li>
                                            ))}
                                        </ul>
                                    </li>
                                ))}
                            </ul>
                            <h3>Tour Guide:</h3>
                            {itinerary.tourGuide?.username && (
                                <p>Username: {itinerary.tourGuide.username}</p>
                            )}
                            {itinerary.tourGuide?.email && <p>Email: {itinerary.tourGuide.email}</p>}
                            {itinerary.tourGuide?.nationality && (
                                <p>Nationality: {itinerary.tourGuide.nationality}</p>
                            )}
                            {itinerary.tourGuide?.mobile && <p>Mobile: {itinerary.tourGuide.mobile}</p>}
                            {itinerary.tourGuide?.yearsOfExperience !== undefined && (
                                <p>Years of Experience: {itinerary.tourGuide.yearsOfExperience}</p>
                            )}
                            <h4>Previous Works:</h4>
                            <ul>
                                {itinerary.tourGuide?.previousWorks?.map(work => (
                                    <li key={work._id}>
                                        {work.title && <p>Title: {work.title}</p>}
                                        {work.company && <p>Company: {work.company}</p>}
                                        {work.duration && <p>Duration: {work.duration}</p>}
                                        {work.description && <p>Description: {work.description}</p>}
                                    </li>
                                ))}
                            </ul>
                            <br />
                                        <br />
                                        <br />
                        </li>
                        
                    ))}


                </ul>
            )}

            <br />
        </div>
    );
};

export default ItineraryList;
