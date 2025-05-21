import React, { useState, useRef } from 'react';
import MortgageForm from './MortgageForm';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import PaymentOverview from './PaymentOverview';
import PaymentSummary from './PaymentSummary';

function ProfileSettings({ mortgage, setMortgage, users, setUsers, payments, setPayments }) {
  const [editingMortgage, setEditingMortgage] = useState(false);
  const [newUser, setNewUser] = useState('');
  const exportRef = useRef(null);

  const handleAddUser = () => {
    if (newUser && !users.includes(newUser)) {
      setUsers(prev => [...prev, newUser]);
      setNewUser('');
    }
  };

    const handleExportPDF = async () => {
    const input = exportRef.current;
    if (!input) return;

    // Show it just before capture
    input.style.display = 'block';

    try {
        const canvas = await html2canvas(input, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: [canvas.width, canvas.height] });
        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
        pdf.save('Mortgage_Tracker_Export.pdf');
    } catch (err) {
        console.error('Export failed:', err);
    } finally {
        // Hide it again
        input.style.display = 'none';
    }
    };

  return (
    <div style={{ border: '1px solid #ccc', padding: '20px', marginBottom: '30px', position: 'relative' }}>
      <h2>⚙️ Settings</h2>

      {/* Mortgage Section */}
      {!mortgage.principal || editingMortgage ? (
        <MortgageForm
          setMortgage={(data) => {
            setMortgage(data);
            setEditingMortgage(false);
          }}
          initialData={mortgage}
        />
      ) : (
        <div>
          <h3>🏠 Mortgage Info</h3>
          <p><strong>Loan Amount:</strong> ${mortgage.principal}</p>
          <p><strong>Interest Rate:</strong> {mortgage.interest}%</p>
          <p><strong>Term:</strong> {mortgage.term} years</p>
          <p><strong>Start Date:</strong> {mortgage.start}</p>
          <button onClick={() => setEditingMortgage(true)}>Edit Mortgage</button>
        </div>
      )}

      <hr style={{ margin: '20px 0' }} />

      {/* Users Section */}
      <h3>👤 Users</h3>
      <ul>
        {users.map((u, i) => (
          <li key={i} style={{ marginBottom: '5px' }}>
            {u}
            <button
              onClick={() => setUsers(prev => prev.filter(name => name !== u))}
              style={{ marginLeft: '10px', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: '2px 8px' }}
            >Remove</button>
          </li>
        ))}
      </ul>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Add new user"
          value={newUser}
          onChange={(e) => setNewUser(e.target.value)}
        />
        <button onClick={handleAddUser}>Add User</button>
      </div>

      <hr style={{ margin: '20px 0' }} />

      {/* Export Section */}
      <h3>📁 Export Report</h3>
      <button
        onClick={handleExportPDF}
        style={{ marginTop: '10px', padding: '10px 16px', backgroundColor: '#2196f3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
      >📤 Export to PDF</button>

      {/* Off-screen export container */}
      <div
        ref={exportRef}
        className="light-mode-export"
        style={{ display: 'none' }}
      >
        {/* Include mortgage details in export */}
        <div style={{ marginBottom: '20px' }}>
          <h3>🏠 Mortgage Info</h3>
          <p><strong>Loan Amount:</strong> ${mortgage.principal}</p>
          <p><strong>Interest Rate:</strong> {mortgage.interest}%</p>
          <p><strong>Term:</strong> {mortgage.term} years</p>
          <p><strong>Start Date:</strong> {mortgage.start}</p>
        </div>

        <PaymentOverview
          payments={payments}
          setPayments={setPayments}
          mortgage={mortgage}
          users={users}
        />
        <PaymentSummary
          payments={payments}
          mortgage={mortgage}
        />
      </div>
    </div>
  );
}

export default ProfileSettings;
