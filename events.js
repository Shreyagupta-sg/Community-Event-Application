// routes/events.js
const express = require('express');
const router  = express.Router();
const jwt = require('jsonwebtoken');
const Event   = require('../models/Event');

// GET /api/events — return all events, sorted by date
router.get('/', async (req, res) => {
  try {
    const {
      q,                 // search query
      from,              // start date
      to,                // end date
      page = 1,          // current page
      limit = 10         // events per page
    } = req.query;

    const query = {};

    // Text search in title or description
    if (q) {
      query.$or = [
        { title:       { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ];
    }

    // Date filter
    if (from || to) {
      query.date = {};
      if (from) query.date.$gte = new Date(from);
      if (to)   query.date.$lte = new Date(to);
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [events, total] = await Promise.all([
      Event.find(query).sort({ date: 1 }).skip(skip).limit(Number(limit)),
      Event.countDocuments(query)
    ]);

    res.json({
      events,
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit))
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching events' });
  }
});


// POST /api/events — create a new event


// POST /api/events — create a new event
router.post('/', async (req, res) => {
  // 1. Check for token
  const header = req.header('Authorization') || '';
  console.log('RAW Authorization header:', header);

  const token = header.split(' ')[1];
  console.log('Parsed token:', token);

  if (!token) return res.status(401).json({ message: 'Unauthorized – no token' });

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded JWT payload:', payload);
    if (payload.role !== 'organizer') {
      console.log('Forbidden: not an organizer');
      throw new Error('Not organizer');
    }
  } catch (err) {
    console.error('Auth error:', err.message);
    return res.status(403).json({ message: 'Forbidden' });
  }

  // 2. Get event data from request body
  const { title, description, date, location, maxVolunteers } = req.body;

  // Basic validation
  if (!title || !description || !date || !location?.address) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    // 3. Create and save event
    const newEvent = new Event({
      title,
      description,
      date,
      location,
      maxVolunteers,
      volunteers: []
    });

    await newEvent.save();

    console.log('Event saved:', newEvent);

    // 4. Send success response
    res.status(201).json({
      message: 'Event created successfully',
      event: newEvent
    });
  } catch (err) {
    console.error('Error saving event:', err);
    res.status(500).json({ message: 'Server error creating event' });
  }
});

//const jwt = require('jsonwebtoken');

// POST /api/events/:id/rsvp
router.post('/:id/rsvp', async (req, res) => {
  // 1. Grab the token from the Authorization header
  const auth = req.header('Authorization') || '';
  const token = auth.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  // 2. Verify it and pull out the user ID
  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  const userId = payload.id;
  const eventId = req.params.id;

  try {
    // 3. Fetch the event
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    // 4. Toggle RSVP: if already signed up, remove them; otherwise add them
    const idx = event.volunteers.findIndex(v => v.toString() === userId);
    if (idx > -1) {
      event.volunteers.splice(idx, 1);
    } else {
      event.volunteers.push(userId);
    }

    // 5. Save and return the updated event
    await event.save();
    res.json(event);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
