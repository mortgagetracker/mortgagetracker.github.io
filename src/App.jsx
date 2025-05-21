// src/App.jsx
import React, { useState, useEffect } from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';
import PaymentForm from './components/PaymentForm';
import PaymentOverview from './components/PaymentOverview';
import PaymentSummary from './components/PaymentSummary';
import ProfileSettings from './components/ProfileSettings';
import Welcome from './components/Welcome';
import SummaryCard from './components/SummaryCard';
import FocusChart from './components/FocusChart';
import AllTimeChart from "./components/AllTimeChart";
import { loadPMMS } from './data/pmms';  // now async
import './App.css';

function App() {
  const [mortgage, setMortgage] = useState(() => {
    const saved = localStorage.getItem('mortgage');
    return saved ? JSON.parse(saved) : {};
  });

  const [payments, setPayments] = useState(() => {
    const saved = localStorage.getItem('payments');
    return saved ? JSON.parse(saved) : [];
  });

  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem('users');
    return saved ? JSON.parse(saved) : ['Reese'];
  });

  // pmmsData starts null (loading), becomes [] on error or actual array
  const [pmmsData, setPmmsData] = useState(null);

  const navStyle = ({ isActive }) => ({
    textDecoration: 'none',
    padding: '6px 12px',
    borderRadius: '5px',
    color: isActive ? '#fff' : '#333',
    backgroundColor: isActive ? '#333' : '#eee'
  });

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });

  // Persist theme and other state
  useEffect(() => { document.body.className = theme; }, [theme]);
  useEffect(() => { localStorage.setItem('mortgage', JSON.stringify(mortgage)); }, [mortgage]);
  useEffect(() => { localStorage.setItem('payments', JSON.stringify(payments)); }, [payments]);
  useEffect(() => { localStorage.setItem('users', JSON.stringify(users)); }, [users]);

  // **NEW**: fetch PMMS snapshot from GitHub Pages at runtime
  useEffect(() => {
    loadPMMS()
      .then(data => setPmmsData(data))
      .catch(err => {
        console.error('Error loading PMMS snapshot:', err);
        setPmmsData([]);  // show “No data available”
      });
  }, []);

  return (
    <div
      className={theme}
      style={{
        padding: '20px',
        maxWidth: '100%',
        margin: '0 auto',
        backgroundColor: theme === 'dark' ? '#555252' : '#fff',
        color: theme === 'dark' ? '#fff' : '#000',
        minHeight: '100vh',
        transition: 'background-color 0.3s ease, color 0.3s ease'
      }}
    >
      <h1>🏡 Mortgage Tracker</h1>
      <nav style={{ marginBottom: '20px', display: 'flex', gap: '12px' }}>
        <NavLink to="/" style={navStyle}>Home</NavLink>
        <NavLink to="/payments" style={navStyle}>Payments</NavLink>
        <NavLink to="/overview" style={navStyle}>Overview</NavLink>
        <NavLink to="/rates" style={navStyle}>Rates</NavLink>
        <NavLink to="/settings" style={navStyle}>Settings</NavLink>
        <button
          onClick={() => setTheme(prev => (prev === 'light' ? 'dark' : 'light'))}
          style={{
            marginLeft: 'auto',
            padding: '6px 12px',
            borderRadius: '5px',
            backgroundColor: theme === 'dark' ? '#333' : '#eee',
            color: theme === 'dark' ? '#fff' : '#333',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          {theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
        </button>
      </nav>

      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route
          path="/payments"
          element={
            <>
              <PaymentForm setPayments={setPayments} users={users} />
              <PaymentOverview
                payments={payments}
                setPayments={setPayments}
                mortgage={mortgage}
                users={users}
              />
            </>
          }
        />
        <Route
          path="/overview"
          element={<PaymentSummary payments={payments} mortgage={mortgage} />}
        />
        <Route
          path="/rates"
          element={
            pmmsData === null ? (
              <p>Loading mortgage rates…</p>
            ) : pmmsData.length === 0 ? (
              <p>No rate data available.</p>
            ) : (
              <>
                <div style={{ border: '1px solid #ccc', padding: '20px', marginBottom: '30px' }}>
                  <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
                    <SummaryCard rows={pmmsData} year={30} />
                    <SummaryCard rows={pmmsData} year={15} />
                  </div>
                  <FocusChart rows={pmmsData} />
                </div>
                <div style={{ border: '1px solid #ccc', padding: '20px' }}>
                  <AllTimeChart rows={pmmsData} />
                </div>
              </>
            )
          }
        />
        <Route
          path="/settings"
          element={
            <ProfileSettings
              mortgage={mortgage}
              setMortgage={setMortgage}
              users={users}
              setUsers={setUsers}
              payments={payments}
              setPayments={setPayments}
            />
          }
        />
      </Routes>
    </div>
  );
}

export default App;
