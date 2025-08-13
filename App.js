import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import EventsList from './pages/EventsList';
import Login from './pages/Login';
import Signup from './pages/signup';
import CreateEvent from './pages/CreateEvent';
import Navbar from './components/Navbar';


function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [role, setRole] = useState(localStorage.getItem('role'));

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setToken(null);
    setRole(null);
  };

  return (
    <Router>
        {/* Dark Bootstrap Navbar */}
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-3">
          <Link className="navbar-brand" to="/">Community App</Link>

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav me-auto">
              <li className="nav-item">
                <Link className="nav-link" to="/">Events</Link>
              </li>
              {role === 'organizer' && (
                <li className="nav-item">
                  <Link className="nav-link" to="/create">Create Event</Link>
                </li>
              )}
            </ul>

            <ul className="navbar-nav">
              {!token && (
                <>
                  <li className="nav-item">
                    <Link className="nav-link" to="/signup">Signup</Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/login">Login</Link>
                  </li>
                </>
              )}
              {token && (
                <li className="nav-item">
                  <button
                    className="btn btn-outline-light"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </li>
              )}
            </ul>
          </div>
        </nav>

        {/* Routes */}
        <div className="container mt-4">
          <Routes>
            <Route path="/" element={<EventsList />} />
            <Route path="/login" element={<Login setToken={setToken} setRole={setRole} />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/create" element={<CreateEvent />} />
          </Routes>
        </div>
      </Router>
  );
}

export default App;
