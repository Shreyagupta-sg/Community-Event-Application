import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import API from '../utils/api';
import { useNavigate } from 'react-router-dom';

export default function CreateEvent() {
  const [form, setForm] = useState({
    title: '',
    description: '',
    date: '',
    address: '',
    lat: '',
    lng: '',
    maxVolunteers: ''
  });

  const navigate = useNavigate();
  const role  = localStorage.getItem('role');
  const token = localStorage.getItem('token');

  // Guard: only organizers can access
  useEffect(() => {
    if (!token) {
      toast.error('Please log in to create events.');
      navigate('/login');
    } else if (role !== 'organizer') {
      toast.error('Only organizers can create events.');
      navigate('/');
    }
  }, [token, role, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic client-side validation
    const lat = parseFloat(form.lat);
    const lng = parseFloat(form.lng);
    const maxVols = parseInt(form.maxVolunteers, 10);

    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      return toast.error('Latitude/Longitude must be numbers.');
    }
    if (Number.isNaN(maxVols) || maxVols <= 0) {
      return toast.error('Max Volunteers must be a positive number.');
    }
    if (!form.title.trim() || !form.description.trim() || !form.address.trim()) {
      return toast.error('Please fill all required fields.');
    }

    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        date: form.date, // datetime-local string is fine; backend stores as Date
        location: { address: form.address.trim(), lat, lng },
        maxVolunteers: maxVols
      };

      await API.post('/events', payload);
      toast.success('Event created successfully!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Event creation failed');
    }
  };

  return (
    <div className="container py-4" style={{ maxWidth: 720 }}>
      <div className="card shadow-sm">
        <div className="card-body">
          <h3 className="mb-3">Create New Event</h3>

          <form onSubmit={handleSubmit} className="row g-3">
            <div className="col-12">
              <label className="form-label">Title</label>
              <input
                name="title"
                className="form-control"
                placeholder="e.g., Park Cleanup"
                value={form.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-12">
              <label className="form-label">Description</label>
              <textarea
                name="description"
                className="form-control"
                placeholder="Describe the event, tasks, and who it’s for"
                rows={3}
                value={form.description}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">Date & Time</label>
              <input
                type="datetime-local"
                name="date"
                className="form-control"
                value={form.date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">Max Volunteers</label>
              <input
                type="number"
                name="maxVolunteers"
                className="form-control"
                placeholder="e.g., 20"
                value={form.maxVolunteers}
                onChange={handleChange}
                min="1"
                required
              />
            </div>

            <div className="col-12">
              <label className="form-label">Address</label>
              <input
                name="address"
                className="form-control"
                placeholder="123 Main St, City"
                value={form.address}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">Latitude</label>
              <input
                name="lat"
                className="form-control"
                placeholder="e.g., 40.785091"
                value={form.lat}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">Longitude</label>
              <input
                name="lng"
                className="form-control"
                placeholder="-73.968285"
                value={form.lng}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-12 d-flex justify-content-end">
              <button type="submit" className="btn btn-primary">
                Create Event
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}
