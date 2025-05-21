import React, { useState } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

// amortization formula: P = principal, r = annual rate % (e.g. 4.5), yrs = years
function calculateMonthlyPayment(P, annualRate, yrs) {
  const r = annualRate / 100 / 12;
  const n = yrs * 12;
  return r === 0 ? P / n : (P * r) / (1 - Math.pow(1 + r, -n));
}

// generate an example amortization schedule with payments on the 1st of each month
function generateExampleSchedule(P, annualRate, yrs, startDate) {
  const dailyRate = annualRate / 100 / 365;
  const paymentAmt = calculateMonthlyPayment(P, annualRate, yrs);

  const schedule = [];
  let balance = P;
  const start = new Date(startDate + 'T12:00:00');
  
  // i = 1 → first payment on the 1st of the month AFTER the start
  for (let i = 1; i <= yrs * 12; i++) {
    // month = (start.month + i)
    const currentDate = new Date(
      start.getFullYear(),
      start.getMonth() + i,
      1,
      12
    );
  
    const daysElapsed = Math.floor(
      (currentDate - (i === 1 ? start : schedule[i - 2].dateObj)) 
      / (1000 * 60 * 60 * 24)
    );
    const interestAccrued = balance * dailyRate * daysElapsed;
    const principalPortion = paymentAmt - interestAccrued;
    balance -= principalPortion;

    schedule.push({
      date: currentDate.toISOString().split('T')[0],
      dateObj: currentDate,            // keep for next loop
      payment: paymentAmt,
      principal: principalPortion,
      interest: interestAccrued,
      remaining: Math.max(0, balance),
    });
  }

  // strip out dateObj before returning
  return schedule.map(({ dateObj, ...rest }) => rest);
}

export default function PaymentSummary({ payments, mortgage }) {
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [exampleSchedule, setExampleSchedule] = useState([]);

  // pie chart data
  const totals = payments.reduce((acc, { payer, amount }) => {
    acc[payer] = (acc[payer] || 0) + parseFloat(amount);
    return acc;
  }, {});
  const totalPaid = Object.values(totals).reduce((s, x) => s + x, 0);
  const chartData = {
    labels: Object.keys(totals),
    datasets: [{ data: Object.values(totals), backgroundColor: ['#4caf50','#2196f3','#ff9800','#e91e63'], borderWidth: 1 }]
  };

  // parse & validate mortgage
  const P = parseFloat(mortgage?.principal);
  const rate = parseFloat(mortgage?.interest);
  const termYears = parseFloat(mortgage?.term);
  const startDate = mortgage?.start;
  const hasMortgage = !isNaN(P) && P > 0 && !isNaN(rate) && rate >= 0 && !isNaN(termYears) && termYears > 0 && startDate;

  // handle click on term row
  const handleTermClick = (yrs) => {
    setSelectedTerm(yrs);
    if (hasMortgage) {
      setExampleSchedule(generateExampleSchedule(P, rate, yrs, startDate));
    }
  };

  // define term options
  const earlyOptions = [25,20,15,10,5].filter(y => y < termYears);
  const scenarioTerms = hasMortgage ? [termYears, ...earlyOptions] : [];

  return (
    <div style={{ border: '1px solid #ccc', padding: '20px', marginBottom: '30px', position: 'relative' }}>
      <h2>📊 Payment Summary</h2>
      <div style={{ width: '400px', margin: '0 auto' }}>
        <Pie data={chartData} />
        </div>
      <ul>
        {Object.entries(totals).map(([payer, amt]) => {
          const pct = ((amt / totalPaid)*100).toFixed(1);
          return <li key={payer}>{payer}: ${amt.toFixed(2)} ({pct}%)</li>;
        })}
      </ul>

      {!hasMortgage ? (
        <p style={{ marginTop: '20px', color: '#666' }}>
          Enter a valid mortgage (principal, interest, term, and start date) to see overpayment scenarios.
        </p>
      ) : (
        <>
        <hr style={{ margin: '20px 0' }} />
          <div style={{ marginTop: '40px' }}>
            <h3>💡 Overpayment Scenarios</h3>
            <table className="equity-table">
              <thead>
                <tr>
                  <th>Term (years)</th>
                  <th>Monthly Payment</th>
                  <th>Extra vs Standard</th>
                </tr>
              </thead>
              <tbody>
                {scenarioTerms.map((yrs) => {
                  const payment = calculateMonthlyPayment(P, rate, yrs);
                  const standard = calculateMonthlyPayment(P, rate, termYears);
                  const extra = yrs === termYears ? 0 : payment - standard;
                  return (
                    <tr key={yrs} onClick={() => handleTermClick(yrs)} style={{ cursor:'pointer' }}>
                      <td>{yrs}</td>
                      <td>${payment.toFixed(2)}</td>
                      <td>{yrs===termYears?'-':`+$${extra.toFixed(2)}`}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {exampleSchedule.length > 0 && (
            <div style={{ marginTop: '30px' }}>
              <h3>📅 Example Schedule for {selectedTerm}-Year Term</h3>
              <table className="equity-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Payment</th>
                    <th>Principal</th>
                    <th>Interest</th>
                    <th>Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {exampleSchedule.map((e, i) => (
                    <tr key={i}>
                      <td>{new Date(e.date).toLocaleDateString()}</td>
                      <td>${e.payment.toFixed(2)}</td>
                      <td>${e.principal.toFixed(2)}</td>
                      <td>${e.interest.toFixed(2)}</td>
                      <td>${e.remaining.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
