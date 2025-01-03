"use client";

import { useState } from 'react';
import axios from 'axios';

export default function Home() {
    const [formData, setFormData] = useState({
        date: '',
        time: '',
        guests: '',
        name: '',
        contact: ''
    });
    const [availableSlots, setAvailableSlots] = useState([]);
    const [bookingSummary, setBookingSummary] = useState(null);
    const [availabilityMessage, setAvailabilityMessage] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const checkAvailability = async () => {
        try {
            const response = await axios.post('http://localhost:5000/api/check-availability', {
                date: formData.date,
                time: formData.time,
            });
            if (response.data.slots.length > 0) {
                setAvailabilityMessage('Slot is available!');
                setAvailableSlots(response.data.slots);
            } else {
                setAvailabilityMessage('Slot is already booked or not available.');
                setAvailableSlots([]);
            }
        } catch (error) {
            console.error('Error checking availability:', error);
            setAvailabilityMessage('Error checking availability. Please try again.');
        }
    };

    const handleBooking = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/api/book-table', formData);
            setBookingSummary(response.data);
            setAvailabilityMessage('');
            setAvailableSlots([]);
        } catch (error) {
            console.error('Error booking table:', error);
            setAvailabilityMessage(error.response?.data?.error || 'Error booking table. Please try again.');
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">Restaurant Table Booking</h1>
                <form onSubmit={handleBooking} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Date</label>
                        <input
                            type="date"
                            name="date"
                            value={formData.date}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Time</label>
                        <input
                            type="time"
                            name="time"
                            value={formData.time}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Number of Guests</label>
                        <input
                            type="number"
                            name="guests"
                            value={formData.guests}
                            onChange={handleChange}
                            required
                            min="1"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Contact</label>
                        <input
                            type="text"
                            name="contact"
                            value={formData.contact}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                    </div>
                    <div className="flex space-x-2">
                        <button
                            type="button"
                            onClick={checkAvailability}
                            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Check Availability
                        </button>
                        <button
                            type="submit"
                            className="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                            Book Table
                        </button>
                    </div>
                </form>

                {availabilityMessage && (
                    <div className="mt-4 text-sm text-gray-800">
                        {availabilityMessage}
                    </div>
                )}

                {availableSlots.length > 0 && (
                    <div className="mt-4">
                        <h2 className="text-lg font-bold text-gray-800">Available Slots</h2>
                        <ul className="list-disc pl-5 mt-2 text-gray-700">
                            {availableSlots.map((slot, index) => (
                                <li key={index}>{slot}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {bookingSummary && (
                    <div className="mt-4 bg-green-100 p-4 rounded-md">
                        <h2 className="text-lg font-bold text-green-800">Booking Confirmation</h2>
                        <p className="text-gray-800">Thank you, {bookingSummary.name}!</p>
                        <p className="text-gray-800">Your reservation for {bookingSummary.guests} guests on {bookingSummary.date} at {bookingSummary.time} has been confirmed.</p>
                    </div>
                )}
            </div>
        </div>
    );
}