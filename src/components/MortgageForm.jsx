import React, { useState, useEffect } from 'react';

function MortgageForm({ setMortgage, initialData = {} }) {
  const [form, setForm] = useState({
    principal: '',
    interest: '',
    term: '',
    start: ''
  });

  useEffect(() => {
    setForm(initialData);
  }, [initialData]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setMortgage(form);
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>🏠 {initialData?.principal ? 'Edit' : 'Enter'} Mortgage Info</h2>
      <input name="principal" placeholder="Loan Amount" type="number" onChange={handleChange} value={form.principal || ''} /><br /><br />
      <input name="interest" placeholder="Interest %" type="number" step="0.01" onChange={handleChange} value={form.interest || ''} /><br /><br />
      <input name="term" placeholder="Loan Term (Years)" type="number" onChange={handleChange} value={form.term || ''} /><br /><br />
      <input name="start" placeholder="Start Date" type="date" onChange={handleChange} value={form.start || ''} /><br /><br />
      <button type="submit">Save Mortgage</button>
    </form>
  );
}

export default MortgageForm;