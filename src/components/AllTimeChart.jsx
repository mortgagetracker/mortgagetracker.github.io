// src/components/AllTimeChart.jsx
import React, { useEffect, useRef, useState } from "react";
import * as Plot from "@observablehq/plot";
import { brushX } from "d3-brush";
import { select } from "d3-selection";
import { scaleUtc } from "d3-scale";
import { extent } from "d3-array";

export default function AllTimeChart({ rows, height = 300 }) {
  const containerRef = useRef();
  const [range, setRange] = useState(null);

  useEffect(() => {
    if (!rows || !containerRef.current) return;

    // Dimensions & margins
    const width = containerRef.current.clientWidth;
    const marginLeft = 60;
    const marginRight = 20;
    const marginTop = 20;
    const marginBottom = 50;

    // Full time range
    const defaultStart = rows[0].date;
    const defaultEnd = rows[rows.length - 1].date;
    const [start, end] = range || [defaultStart, defaultEnd];

    // Prepare tidy data
    const tidy = rows.flatMap(d => [
      { date: d.date, rate: d.rate30, type: '30Y FRM' },
      { date: d.date, rate: d.rate15, type: '15Y FRM' }
    ]);

    // Scales
    const xScale = scaleUtc()
      .domain([defaultStart, defaultEnd])
      .range([marginLeft, width - marginRight]);
    const yDomain = extent(tidy, d => d.rate);

    // Clear container
    containerRef.current.innerHTML = '';

    // Plot
    const plot = Plot.plot({
      width,
      height,
      marginLeft,
      marginRight,
      marginTop,
      marginBottom,
      x: { type: 'time', domain: [start, end], label: 'Date' },
      y: { domain: yDomain, grid: true, label: 'Rate (%)' },
      color: { legend: true, domain: ['30Y FRM', '15Y FRM'] },
      marks: [
        Plot.ruleY([0]),
        Plot.lineY(tidy.filter(d => d.date >= start && d.date <= end), {
          x: 'date', y: 'rate', stroke: 'type', tip: true
        })
      ]
    });
    containerRef.current.appendChild(plot);

    // Brush
    const gBrush = select(containerRef.current).append('g');
    const brushBehavior = brushX()
      .extent([[marginLeft, 0], [width - marginRight, height]])
      .on('end', event => {
        if (!event.sourceEvent) return;
        const sel = event.selection;
        if (!sel) {
          setRange([defaultStart, defaultEnd]);
        } else {
          const [px0, px1] = sel;
          setRange([xScale.invert(px0), xScale.invert(px1)]);
        }
      });

    gBrush.call(brushBehavior);
    // Initial brush position
    const initSel = (range || [defaultStart, defaultEnd]).map(d => xScale(d));
    gBrush.call(brushBehavior.move, initSel);

  }, [rows, range]);

  if (!rows) return null;

  const defaultStart = rows[0].date;
  const defaultEnd = rows[rows.length - 1].date;
  const [startDate, endDate] = range || [defaultStart, defaultEnd];

  // Year extent for header
  const years = rows.map(d => d.date.getUTCFullYear());
  const [yearMin, yearMax] = extent(years);

  return (
    <div className="card">
      <h2>Rates over time ({yearMin}–{yearMax})</h2>
      <div ref={containerRef} style={{ width: '100%' }} />
    </div>
  );
}
