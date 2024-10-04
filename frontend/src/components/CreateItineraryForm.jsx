import React from 'react';
import { useState,useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie'


const ItineraryForm = () => {
  const [activities, setActivities] = useState([])
  const [error, setError] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    timeline: '',
    language: '',
    price: '',
    availableDates: [{ date: '', times: [{ startTime: '', endTime: '' }] }],
    activities: [''],
    accessibility: false,
    pickUpLocation: '',
    dropOffLocation: '',
    rating: '',
  });
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const token = Cookies.get('jwt')
        let role = Cookies.get('role')
        if (role === undefined) 
          role = 'guest'
        const api = `http://localhost:4000/${role}/activity`
        const response = await axios.get(api, {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        })
        setActivities(response.data) 
      } catch (err) {
        setError(err.message)
      }
    }
  
    fetchActivities()
  }, [])



  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleDateChange = (index, e) => {
    const { name, value } = e.target;
    const updatedDates = [...formData.availableDates];
    updatedDates[index][name] = value;
    setFormData({ ...formData, availableDates: updatedDates });
  };

  const handleTimeChange = (dateIndex, timeIndex, e) => {
    const { name, value } = e.target;
    const updatedDates = [...formData.availableDates];
    updatedDates[dateIndex].times[timeIndex][name] = value;
    setFormData({ ...formData, availableDates: updatedDates });
  };

  const addDateField = () => {
    setFormData({
      ...formData,
      availableDates: [...formData.availableDates, { date: '', times: [{ startTime: '', endTime: '' }] }],
    });
  };

  const removeDateField = (index) => {
    if (formData.availableDates.length > 1) {
      const updatedDates = [...formData.availableDates];
      updatedDates.splice(index, 1);
      setFormData({ ...formData, availableDates: updatedDates });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form data submitted:', formData);
    // Add your form submission logic here
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        className="bg-white p-6 rounded-xl shadow-md w-full max-w-md mt-20 mb-20"
        onSubmit={handleSubmit}
      >
        <h2 className="text-xl font-semibold mb-4 text-center">Create Itinerary</h2>

        <div className="mb-4">
          <label className="block text-gray-700" htmlFor="title">
            Title
          </label>
          <input
            type="text"
            name="title"
            id="title"
            className="border border-gray-300 rounded-xl p-2 w-full"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700" htmlFor="timeline">
            Timeline
          </label>
          <input
            type="text"
            name="timeline"
            id="timeline"
            className="border border-gray-300 rounded-xl p-2 w-full"
            value={formData.timeline}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700" htmlFor="language">
            Language
          </label>
          <input
            type="text"
            name="language"
            id="language"
            className="border border-gray-300 rounded-xl p-2 w-full"
            value={formData.language}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700" htmlFor="price">
            Price
          </label>
          <input
            type="number"
            name="price"
            id="price"
            className="border border-gray-300 rounded-xl p-2 w-full"
            value={formData.price}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700" htmlFor="pickUpLocation">
            Pick-Up Location
          </label>
          <input
            type="text"
            name="pickUpLocation"
            id="pickUpLocation"
            className="border border-gray-300 rounded-xl p-2 w-full"
            value={formData.pickUpLocation}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700" htmlFor="dropOffLocation">
            Drop-Off Location
          </label>
          <input
            type="text"
            name="dropOffLocation"
            id="dropOffLocation"
            className="border border-gray-300 rounded-xl p-2 w-full"
            value={formData.dropOffLocation}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700" htmlFor="Activity">
            Activities
          </label>
          <select
            name="Activity"
            id="Activity"
            className="border border-gray-300 rounded-xl p-2 w-full"
            //value={formData.Activity[0]} // Select the first activity by default
            onChange={(e) => setFormData({ ...formData, Activity: [e.target.value] })}
            required
          >
            <option value="">Select an activity</option>
            {activities.map((activity) => (
              <option key={activity._id} value={activity._id}>
                {activity.name} {/* Assuming each activity has a 'name' field */}
              </option>
            ))}
          </select>
        </div>

        {formData.availableDates.map((date, index) => (
          <div key={index} className="mb-4">
            <label className="block text-gray-700">
              Available Date {index + 1}
            </label>
            <input
              type="date"
              name="date"
              className="border border-gray-300 rounded-xl p-2 w-full"
              value={date.date}
              onChange={(e) => handleDateChange(index, e)}
              required
            />
            {date.times.map((time, timeIndex) => (
              <div key={timeIndex} className="flex justify-between">
                <input
                  type="time"
                  name="startTime"
                  className="border border-gray-300 rounded-xl p-2 mt-2"
                  value={time.startTime}
                  onChange={(e) => handleTimeChange(index, timeIndex, e)}
                  required
                />
                <input
                  type="time"
                  name="endTime"
                  className="border border-gray-300 rounded-xl p-2 mt-2"
                  value={time.endTime}
                  onChange={(e) => handleTimeChange(index, timeIndex, e)}
                  required
                />
              </div>
            ))}
            {index > 0 && (
              <button
                type="button"
                className="bg-red-500 text-white font-semibold py-1 px-3 rounded-xl mt-2 hover:bg-red-600 transition duration-200"
                onClick={() => removeDateField(index)}
              >
                Remove Date
              </button>
            )}
          </div>
        ))}

        <button
          type="button"
          className="bg-gray-500 text-white font-semibold py-2 px-4 rounded-xl w-full mt-2 hover:bg-gray-600"
          onClick={addDateField}
        >
          Add Another Date
        </button>

        <div className="mb-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              name="accessibility"
              className="mr-2"
              checked={formData.accessibility}
              onChange={(e) => setFormData({ ...formData, accessibility: e.target.checked })}
            />
            Is it accesible for people with disabilities.
          </label>
        </div>

        <button
          type="submit"
          className="bg-orange-500 text-white font-semibold py-2 px-4 rounded-xl w-full hover:bg-orange-600 transition duration-200"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default ItineraryForm;
