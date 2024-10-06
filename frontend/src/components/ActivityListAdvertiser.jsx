import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

const ActivityList = () => {
    const [activities, setActivities] = useState([]);

    useEffect(() => {
        const fetchActivities = async () => {
            try {
                const token = Cookies.get('jwt'); // Replace with your actual token
                const response = await axios.get('http://localhost:4000/advertiser/my-activities', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setActivities(response.data);
            } catch (error) {
                console.error('Error fetching activities:', error);
            }
        };
        

        fetchActivities();
    }, []);


    const upcomingActivities = activities
    return (
        <div>
            <h1>Created Activities</h1>
            <ul>
                {upcomingActivities.map(activity => (
                    <li key={activity._id}>
                        <h2>{activity.name}</h2>
                        <p>Location: {activity.location.address}</p>
                        <p>Duration: {activity.duration} hours</p>
                        <p>Price: ${activity.price}</p>
                        <p>Range: {activity.range}</p>
                        <p>Special Discount: {activity.specialDiscount}%</p>
                        <p>Rating: {activity.rating}%</p>

                        {/* Display Category Names */}
                        <p>Category: {activity.category.map(cat => cat.name).join(', ')}</p>

                        {/* Display Tag Types */}
                        <p>Tags: {activity.tags.map(tag => tag.type).join(', ')}</p>

                        {/* Conditionally Render Advertiser Username
                        {activity.advertiser && activity.advertiser.username && (
                            <p>Advertiser: {activity.advertiser.username}</p>
                        )} */}

                        <p>Booking Open: {activity.isBookingOpen ? 'Yes' : 'No'}</p>
                        <p>Start Time: {new Date(activity.timeline.start).toLocaleString()}</p>
                        <p>End Time: {new Date(activity.timeline.end).toLocaleString()}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ActivityList;
