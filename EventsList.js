import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import API from '../utils/api';

export default function EventsList() {
  // data & ui state
  const [events, setEvents]   = useState([]);
  const [loading, setLoading] = useState(true);

  // filters & paging
  const [q, setQ]       = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo]     = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ totalPages: 1, total: 0 });

  // auth context
  const token  = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const params = {
        q,
        page,
        limit: 6,
        ...(from ? { from } : {}),
        ...(to   ? { to }   : {}),
      };
      const res = await API.get('/events', { params });
      const { events = [], totalPages = 1, total = 0 } = res.data || {};
      setEvents(events);
      setMeta({ totalPages, total });
    } catch (err) {
      console.error(err);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const toggleRSVP = async (id) => {
    try {
      await toast.promise(
        API.post(`/events/${id}/rsvp`),
        { loading: 'Updating RSVP…', success: 'RSVP updated!', error: 'RSVP failed' }
      );
      fetchEvents();
    } catch {}
  };

  useEffect(() => {
    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, from, to, page]);

  if (loading) return <div className="container py-5"><p>Loading events...</p></div>;

  return (
    <div className="container py-4">
      <h2 className="mb-4 text-center">Upcoming Events</h2>

      {/* Filters */}
      <form className="row g-3 align-items-end mb-4">
        <div className="col-sm-4">
          <label className="form-label">Search</label>
          <input
            className="form-control"
            placeholder="Search events..."
            value={q}
            onChange={(e) => { setPage(1); setQ(e.target.value); }}
            aria-label="Search events"
          />
        </div>
        <div className="col-sm-3">
          <label className="form-label">From</label>
          <input
            type="date"
            className="form-control"
            value={from || ''}
            onChange={(e) => { setPage(1); setFrom(e.target.value); }}
            aria-label="From date"
          />
        </div>
        <div className="col-sm-3">
          <label className="form-label">To</label>
          <input
            type="date"
            className="form-control"
            value={to || ''}
            onChange={(e) => { setPage(1); setTo(e.target.value); }}
            aria-label="To date"
            min={from || undefined}
          />
        </div>
      </form>

      {events.length === 0 && <p className="text-center text-muted">No events found.</p>}

      {/* Event cards */}
      <div className="row row-cols-1 row-cols-md-2 g-3">
        {events.map((event) => {
          const isJoined = Array.isArray(event.volunteers) &&
            event.volunteers.some(v => (typeof v === 'string' ? v : v?._id) === userId);

          return (
            <div className="col" key={event._id}>
              <div className="card h-100 shadow-sm">
                <div className="card-body d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-start mb-1">
                    <h5 className="card-title mb-0">{event.title}</h5>
                    {isJoined && <span className="badge bg-success">Joined</span>}
                  </div>

                  {event.description && <p className="card-text">{event.description}</p>}
                  <p className="mb-1"><strong>Date:</strong> {new Date(event.date).toLocaleString()}</p>
                  <p className="mb-1"><strong>Location:</strong> {event.location?.address || '—'}</p>
                  <p className="mb-3">
                    <strong>Volunteers:</strong> {event.volunteers?.length || 0}
                    {event.maxVolunteers ? ` / ${event.maxVolunteers}` : ''}
                  </p>

                  {token && (
                    <div className="mt-auto">
                      <button
                        className={`btn ${isJoined ? 'btn-outline-secondary' : 'btn-primary'} w-100`}
                        onClick={() => toggleRSVP(event._id)}
                      >
                        {isJoined ? 'Cancel RSVP' : 'RSVP'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      <nav className="d-flex justify-content-center mt-4" aria-label="Event pagination">
        <ul className="pagination mb-0">
          <li className={`page-item ${page <= 1 ? 'disabled' : ''}`}>
            <button className="page-link" onClick={() => setPage(p => Math.max(1, p - 1))}>
              Prev
            </button>
          </li>
          <li className="page-item disabled">
            <span className="page-link">Page {page} / {meta.totalPages}</span>
          </li>
          <li className={`page-item ${page >= meta.totalPages ? 'disabled' : ''}`}>
            <button className="page-link" onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}>
              Next
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}
