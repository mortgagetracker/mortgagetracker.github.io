import React from 'react';

function generateAmortizationSchedule(principal, annualRate, termYears, payments) {
  const dailyRate = (annualRate / 100) / 365;

  let balance = principal;
  const schedule = [];
  let cumulativeInterest = 0;
  let cumulativePrincipal = 0;

  // Sort payments by date
  const sorted = [...payments].sort((a, b) => new Date(a.date) - new Date(b.date));

  // Group payments by date
  const grouped = sorted.reduce((acc, p) => {
    const key = new Date(p.date).toISOString().split('T')[0]; // YYYY-MM-DD
    if (!acc[key]) acc[key] = [];
    acc[key].push({ ...p }); // ✅ deep copy
    return acc;
  }, {});

  let lastDate = sorted.length > 0 ? new Date(sorted[0].date) : new Date();

  let monthCounter = 1;

  for (const [dateStr, group] of Object.entries(grouped)) {
    const currentDate = new Date(dateStr);
    const daysElapsed = Math.floor((currentDate - lastDate) / (1000 * 60 * 60 * 24));
    const interestAccrued = daysElapsed > 0 ? balance * dailyRate * daysElapsed : 0;

    const totalPaidThatDay = group.reduce((sum, p) => sum + parseFloat(p.amount), 0);

    for (const p of group) {
      const paymentAmount = parseFloat(p.amount);
      const payerShare = paymentAmount / totalPaidThatDay;

      const interestPortion = interestAccrued * payerShare;
      const principalPortion = Math.max(0, paymentAmount - interestPortion);

      balance -= principalPortion;
      cumulativeInterest += interestPortion;
      cumulativePrincipal += principalPortion;

      schedule.push({
        month: monthCounter++,
        payer: p.payer,
        date: p.date,
        payment: paymentAmount,
        interest: interestPortion,
        principal: principalPortion,
        remaining: balance > 0 ? balance : 0,
        cumulativeInterest,
        cumulativePrincipal,
      });
    }

    lastDate = currentDate;
  }

  return schedule;
}

function groupPaymentsByMonth(payments) {
  const byMonth = {};

  payments.forEach((p) => {
    const date = new Date(p.date);
    const year = date.getFullYear();
    const month = date.toLocaleString('default', { month: 'long' });
    const payer = p.payer;
    const amount = parseFloat(p.amount);

    if (!byMonth[year]) byMonth[year] = {};
    if (!byMonth[year][month]) byMonth[year][month] = {};
    byMonth[year][month][payer] = (byMonth[year][month][payer] || 0) + amount;
  });

  return byMonth;
}

function PaymentOverview({ payments, setPayments, mortgage, users }) {
    const allUsers = users;
  const validMortgage =
    !isNaN(parseFloat(mortgage?.principal)) &&
    !isNaN(parseFloat(mortgage?.interest)) &&
    !isNaN(parseFloat(mortgage?.term)) &&
    parseFloat(mortgage?.principal) > 0 &&
    parseFloat(mortgage?.term) > 0;

  const sortedPayments = [...payments].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  const schedule = validMortgage
    ? generateAmortizationSchedule(
        parseFloat(mortgage.principal),
        parseFloat(mortgage.interest),
        parseFloat(mortgage.term),
        sortedPayments
      )
    : [];

  const byMonth = groupPaymentsByMonth(payments);
  const allMonths = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div style={{ border: '1px solid #ccc', padding: '20px', marginBottom: '30px', position: 'relative' }}>
      <h2>📅 Monthly Payment Breakdown</h2>
      {schedule.length === 0 ? (
        <p>No payments yet or missing mortgage info.</p>
      ) : (
        <table className="equity-table">
        <thead>
        <tr>
            <th>Date</th>
            <th>Payer</th>
            <th>Total Paid</th>
            <th>→ Principal</th>
            <th>→ Interest</th>
            <th>Balance Left</th>
            <th>Total Principal</th>
            <th>Total Interest</th>
        </tr>
        </thead>
          <tbody>
            {schedule.map((entry, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid #ccc' }}>
                <td>{new Date(entry.date + "T12:00:00").toLocaleDateString()}</td>
                <td>{entry.payer}</td>
                <td>${entry.payment.toFixed(2)}</td>
                <td>${entry.principal.toFixed(2)}</td>
                <td>${entry.interest.toFixed(2)}</td>
                <td>${entry.remaining.toFixed(2)}</td>
                <td>${entry.cumulativePrincipal.toFixed(2)}</td>
                <td>${entry.cumulativeInterest.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h3 style={{ marginTop: '40px' }}>📆 Yearly Payment Calendar</h3>
      {Object.entries(byMonth).map(([year, months]) => (
        <div key={year}>
          <h4>{year}</h4>
          <table className="equity-table">
            <thead>
              <tr>
                <th>Month</th>
                {allUsers.map((u) => (
                  <th key={u}>{u}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allMonths.map((m) => (
                <tr key={m} style={{ borderBottom: '1px solid #eee' }}>
                  <td>{m}</td>
                  {allUsers.map((u) => (
                    <td key={u}>
                    {months[m]?.[u] ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span>${months[m][u].toFixed(2)}</span>
                        <button
                            onClick={() => {
                            // Filter out payments matching this month, user, and year
                            const updated = payments.filter(p => {
                                const date = new Date(p.date + "T12:00:00");
                                return !(
                                p.payer === u &&
                                date.getFullYear() === parseInt(year) &&
                                date.toLocaleString('default', { month: 'long' }) === m
                                );
                            });
                            setPayments(updated);
                            }}
                            style={{
                            background: 'none',
                            border: 'none',
                            color: '#f44336',
                            fontSize: '14px',
                            cursor: 'pointer',
                            marginLeft: '6px'
                            }}
                            title={`Remove ${u}'s payment in ${m} ${year}`}
                        >
                            🗑️
                        </button>
                        </div>
                    ) : '—'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}

export default PaymentOverview;