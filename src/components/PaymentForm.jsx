import React, { useState } from 'react';

function PaymentForm({ setPayments, users }) {
  const [date, setDate] = useState(
    () => new Date().toISOString().split('T')[0]
  );
  const [amounts, setAmounts] = useState(() => {
    const init = {};
    users.forEach((user) => (init[user] = ''));
    return init;
  });

  const handleChange = (user, value) => {
    setAmounts((prev) => ({ ...prev, [user]: value.trim() }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log('Raw amounts:', amounts);

    const cleanedPayments = users
      .map((user) => {
        const raw = amounts[user];
        const amt = Number(raw);
        console.log(`User: ${user}, Raw: "${raw}", Parsed:`, amt);
        return !isNaN(amt) && amt > 0
          ? { payer: user, amount: amt, date }
          : null;
      })
      .filter(Boolean);

    if (cleanedPayments.length === 0) {
      alert('Please enter at least one valid payment amount.');
      return;
    }

    console.log('Submitting payments:', cleanedPayments);

    // Batch-append all new payments in one state update:
    setPayments((prev) => [...prev, ...cleanedPayments]);

    // reset the form:
    setAmounts(users.reduce((acc, u) => ({ ...acc, [u]: '' }), {}));
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: '30px' }}>
      <h3>➕ Add Payments</h3>

      <label>
        Payment Date: <br />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          style={{ marginBottom: '12px' }}
        />
      </label>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          marginTop: '10px',
        }}
      >
        {users.map((user) => (
          <label key={user}>
            {user}'s Payment: <br />
            <input
              type="number"
              value={amounts[user] ?? ''}
              placeholder="$0.00"
              onChange={(e) => handleChange(user, e.target.value)}
              style={{ width: '100%' }}
            />
          </label>
        ))}
      </div>

      <button
        type="submit"
        style={{
          marginTop: '16px',
          padding: '8px 14px',
          fontSize: '16px',
          borderRadius: '4px',
          backgroundColor: '#4caf50',
          color: '#fff',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        Add Payments
      </button>
    </form>
  );
}

export default PaymentForm;