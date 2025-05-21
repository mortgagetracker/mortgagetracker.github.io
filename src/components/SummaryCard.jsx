// src/components/SummaryCard.jsx
import React from "react";
import * as Plot from "@observablehq/plot";
import { mean, extent } from "d3-array";

export default function SummaryCard({ rows, year, width = 200, height = 60 }) {
  // pick the key (pmms30 or pmms15)
  const key = year === 30 ? "rate30" : "rate15";
  const lastIndex = rows.length - 1;
  const diff1 = rows[lastIndex][key] - rows[lastIndex - 1][key];
  const diffY = rows[lastIndex][key] - rows[lastIndex - 52][key];
  const slice52 = rows.slice(-52);
  const range = extent(slice52, d => d[key]);
  const avg4 = mean(rows.slice(-4), d => d[key]);
  const avg52 = mean(slice52, d => d[key]);

  // inline sparkline
  const sparkRef = React.useRef();
  React.useEffect(() => {
    if (!sparkRef.current) return;
    sparkRef.current.innerHTML = "";
    sparkRef.current.appendChild(
      Plot.plot({
        width,
        height,
        axis: null,
        x: { inset: 10 },
        marks: [
          Plot.tickX(slice52, {
            x: key,
            stroke: key === "rate30" ? "steelblue" : "orange",
            insetTop: 5,
            insetBottom: 5,
          }),
          Plot.tickX([rows[lastIndex]], {
            x: key,
            stroke: key === "rate30" ? "steelblue" : "orange",
            strokeWidth: 2,
          }),
        ]
      })
    );
  }, [rows, key, width, height]);

  const formatPct = v =>
    (v / 100).toLocaleString("en-US", { style: "percent", minimumFractionDigits: 2 });

  return (
    <div className="card">
      <h2 style={{ color: key === "rate30" ? "steelblue" : "orange" }}>
        {year}-year fixed rate
      </h2>
      <h1>{formatPct(rows[lastIndex][key])}</h1>
      <table>
        <tbody>
          <tr>
            <td>1-week change</td>
            <td align="right">{formatPct(diff1)}</td>
            <td>{diff1 >= 0 ? "↑" : "↓"}</td>
          </tr>
          <tr>
            <td>1-year change</td>
            <td align="right">{formatPct(diffY)}</td>
            <td>{diffY >= 0 ? "↑" : "↓"}</td>
          </tr>
          <tr>
            <td>4-week avg</td>
            <td align="right">{formatPct(avg4)}</td>
          </tr>
          <tr>
            <td>52-week avg</td>
            <td align="right">{formatPct(avg52)}</td>
          </tr>
        </tbody>
      </table>
      <div ref={sparkRef} style={{ marginTop: 8 }} />
      <small>52-week range: {formatPct(range[0])}–{formatPct(range[1])}</small>
    </div>
  );
}