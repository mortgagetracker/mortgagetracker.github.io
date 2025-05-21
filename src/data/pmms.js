// src/data/pmms.js
export async function loadPMMS() {
  const res = await fetch(
    "https://mortgagetracker.github.io/pmms_snapshot.json"
  );
  const raw = await res.json();
  return raw.map(d => ({
    date: new Date(d.date),
    rate30: d.rate30,
    rate15: d.rate15
  }));
}