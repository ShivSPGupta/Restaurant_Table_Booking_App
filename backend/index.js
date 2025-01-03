const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

let reservations = [];

app.post('/api/check-availability', (req, res) => {
    const { date, time } = req.body;
    const isBooked = reservations.some(r => r.date === date && r.time === time);

    if (isBooked) {
        return res.json({ slots: [] });
    }

    res.json({ slots: ['Available'] });
});

app.post('/api/book-table', (req, res) => {
    const { date, time, guests, name, contact } = req.body;

    if (!date || !time || !guests || !name || !contact) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    const isBooked = reservations.some(r => r.date === date && r.time === time);
    if (isBooked) {
        return res.status(400).json({ error: 'This time slot is already booked.' });
    }

    const newReservation = { date, time, guests, name, contact };
    reservations.push(newReservation);

    res.json(newReservation);
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
