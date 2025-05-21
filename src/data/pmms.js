// src/data/pmms.js
import raw from "./pmms_snapshot.json";

export function loadPMMS() {
  return raw.map(d => ({
    date: new Date(d.date),
    rate30: d.rate30,
    rate15: d.rate15
  }));
}