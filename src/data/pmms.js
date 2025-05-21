// src/data/pmms.js

// URL of the live snapshot on GitHub Pages
const PMMS_URL = "https://mortgagetracker.github.io/pmms_snapshot.json";

export async function loadPMMS() {
  const res = await fetch(PMMS_URL);
  if (!res.ok) {
    console.error("Failed to fetch PMMS snapshot:", res.status, res.statusText);
    return [];
  }
  const raw = await res.json();
  return raw.map(d => ({
    date: new Date(d.date),
    rate30: d.rate30,
    rate15: d.rate15
  }));
}