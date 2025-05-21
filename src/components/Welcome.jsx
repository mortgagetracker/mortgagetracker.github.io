import React from 'react';
import { Link } from 'react-router-dom';

function Welcome() {
  return (
    <div style={{ border: '1px solid #ccc', padding: '20px', marginBottom: '30px', position: 'relative' }}>
      <h2>Welcome 😊</h2>
      <p>
        Track your mortgage payments, understand how your money is split between principal and interest,
        and visualize your progress over time.
      </p>

      <h4>🔧 Features Included:</h4>
      <ul style={{ paddingLeft: '20px' }}>
        <li>🏡 Enter your mortgage details (amount, rate, term)</li>
        <li>👥 Add users to log who paid what</li>
        <li>➕ Record monthly payments</li>
        <li>📅 See a full calendar of payments by month/year</li>
        <li>📊 View detailed breakdowns (principal vs interest)</li>
        <li>🥧 Visualize contributions with pie charts</li>
        <li>📉 View current and historical fixed mortgage rates (30y & 15y) provided by <a href='https://www.freddiemac.com/pmms/about-pmms'>Freddie Mac's PMMS Data</a></li>
        <li>📁 Export a full PDF report for records or sharing</li>
        <li>🚀 Explore optional overpayment scenarios</li>
      </ul>
      <div style={{ marginTop: '40px' }}>
        <h4>📘 Mortgage Math Explained</h4>
        <p>
          Every time you log a payment, this app calculates how much goes toward interest (the cost of borrowing)
          and how much pays down the actual loan (principal). Here's how it all works:
        </p>

        <div style={{ marginTop: '20px' }}>
          <h4>1. 📐 Daily Interest Rate</h4>
          <code>dailyRate = (annualRate / 100) / 365</code>
          <p>
            🧠 <strong>What it means:</strong> Takes the annual interest rate and divides it by 365 to get a daily rate.<br />
            💡 <strong>Why it matters:</strong> Mortgage interest accrues daily, so this gives the cost of borrowing per day.
          </p>
        </div>

        <div style={{ marginTop: '20px' }}>
          <h4>2. 🕒 Days Elapsed</h4>
          <code>daysElapsed = Math.floor((currentDate - lastDate) / (1000 * 60 * 60 * 24))</code>
          <p>
            🧠 <strong>What it means:</strong> This gives the number of full days since the last payment, using timestamp math.<br />
            💡 <strong>Why it matters:</strong> The longer the wait between payments, the more interest builds up.
          </p>
        </div>

        <div style={{ marginTop: '20px' }}>
          <h4>3. 💸 Interest Accrued</h4>
          <code>interestAccrued = balance * dailyRate * daysElapsed</code>
          <p>
            🧠 <strong>What it means:</strong> Multiplies the loan balance by the daily rate and how many days have passed.<br />
            💡 <strong>Why it matters:</strong> This shows exactly how much interest has accumulated since the last payment.
          </p>
        </div>

        <div style={{ marginTop: '20px' }}>
          <h4>4. 🤝 Shared Interest Portion</h4>
          <code>interestPortion = interestAccrued * payerShare</code>
            <p>
                🧠 <strong>What it means:</strong> When more than one person contributes to a payment, the total interest is divided up
                based on how much each person paid that day.
            </p>
            <p>
                💬 <strong>Why this exists:</strong> Maybe a sibling, friend, or partner is helping you out. This app tracks how much each person contributed — even if they’re not officially on the loan.
            </p>
            <p>
                💡 <strong>Why it matters:</strong> By splitting the interest fairly before applying the rest of each person’s payment to principal, you get a transparent,
                accurate record of who’s actually building equity over time. If you ever sell the home, this lets you look back and say: “Here’s exactly what we each put in.”
            </p>
        </div>

        <div style={{ marginTop: '20px' }}>
          <h4>5. 🧾 Principal Portion</h4>
          <code>principalPortion = Math.max(0, paymentAmount - interestPortion)</code>
          <p>
            🧠 <strong>What it means:</strong> Whatever’s left after covering the interest goes toward paying off the principal.<br />
            💡 <strong>Why it matters:</strong> This is how you build equity — paying down the actual loan amount.
          </p>
        </div>

        <div style={{ marginTop: '20px' }}>
          <h4>6. 🧮 Updated Balance</h4>
          <code>newBalance = previousBalance - principalPortion</code>
          <p>
            🧠 <strong>What it means:</strong> After each payment, the principal portion is subtracted from the remaining balance.<br />
            💡 <strong>Why it matters:</strong> This keeps the loan up to date and sets the stage for the next interest calculation.
          </p>
        </div>
      </div>
    </div>
  );
}


export default Welcome;