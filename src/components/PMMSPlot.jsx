// src/components/PMMSPlot.jsx
import React, { useEffect, useRef, useState } from "react";
import * as Plot from "@observablehq/plot";
import { csvParse } from "d3-dsv";
import { utcParse, timeFormat } from "d3-time-format";

const PMMS_URL = "/pmms/PMMS_history.csv"; // via your Vite proxy
const parseDate = utcParse("%m/%d/%Y");
const formatYear = timeFormat("%Y");

export default function PMMSPlot() {
  const [data, setData] = useState(null);
  const ref = useRef();

  useEffect(() => {
    fetch(PMMS_URL)
      .then((r) => r.text())
      .then((text) => {
        const raw = csvParse(text);
        return raw.flatMap((r) => {
          const d = parseDate(r.date);
          const v30 = parseFloat(r.pmms30);
          const v15 = parseFloat(r.pmms15);
          if (!d || isNaN(v30) || isNaN(v15)) return [];
          return { date: d, rate30: v30, rate15: v15 };
        });
      })
      .then(setData)
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!data || !ref.current) return;
    // clear
    ref.current.innerHTML = "";

    const plot = Plot.plot({
      marginLeft: 60,
      marginBottom: 50,
      x: {
        type: "time",              // explicit time scale
        label: "Year",
        tickFormat: formatYear    // e.g. "1971", "1972", no commas
      },
      y: {
        label: "Rate (%)"
      },
      marks: [
        // main lines
        Plot.line(data, {
          x: "date",
          y: "rate30",
          stroke: "steelblue"
        }),
        Plot.line(data, {
          x: "date",
          y: "rate15",
          stroke: "orange"
        }),
        // invisible dots for hover-tooltips (30yr)
        Plot.dot(data, {
          x: "date",
          y: "rate30",
          r: 6,
          fill: "transparent",
          stroke: "transparent",
          title: (d) => `30-yr: ${d.rate30.toFixed(2)}%`
        }),
        // invisible dots for hover-tooltips (15yr)
        Plot.dot(data, {
          x: "date",
          y: "rate15",
          r: 6,
          fill: "transparent",
          stroke: "transparent",
          title: (d) => `15-yr: ${d.rate15.toFixed(2)}%`
        })
      ]
    });

    ref.current.appendChild(plot);
  }, [data]);

  return (
    <div>
      {!data ? <p>Loading PMMS…</p> : <div ref={ref} />}
    </div>
  );
}