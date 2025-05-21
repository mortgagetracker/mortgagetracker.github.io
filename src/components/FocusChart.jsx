// src/components/FocusChart.jsx
import React, { useEffect, useRef, useState } from "react";
import * as Plot from "@observablehq/plot";
import { brushX } from "d3-brush";
import { select } from "d3-selection";
import { scaleUtc } from "d3-scale";
import { extent } from "d3-array";

export default function FocusChart({ rows, height = 300 }) {
  const containerRef = useRef();
  const [selectionRange, setSelectionRange] = useState(null);

  useEffect(() => {
    if (!rows || !containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const marginLeft = 60;
    const marginRight = 20;

    // default full range
    const defaultStart = rows[Math.max(0, rows.length - 52)].date;
    const defaultEnd = rows[rows.length - 1].date;
    // use selected range or default
    const [start, end] = selectionRange || [defaultStart, defaultEnd];

    // filter data
    const filtered = rows.filter(d => d.date >= start && d.date <= end);

    // x-scale for brush inversion
    const xScale = scaleUtc()
      .domain([defaultStart, defaultEnd])
      .range([marginLeft, width - marginRight]);

    // compute y-domain from filtered data
    const yExtent = extent(filtered.flatMap(d => [d.rate30, d.rate15]));

    // clear and render plot
    containerRef.current.innerHTML = '';
    const plot = Plot.plot({
      width,
      height,
      marginLeft,
      marginRight,
      marginTop: 20,
      marginBottom: 50,
      x: { type: "time", domain: [defaultStart, defaultEnd], label: "Date" },
      y: { domain: yExtent, grid: true, label: "Rate (%)" },
      marks: [
        Plot.ruleY([0]),
        Plot.lineY(filtered, { x: "date", y: "rate30", stroke: "steelblue", tip: true }),
        Plot.lineY(filtered, { x: "date", y: "rate15", stroke: "orange", tip: true })
      ]
    });
    containerRef.current.appendChild(plot);

    // brush setup
    const brushG = select(containerRef.current)
      .append("g")
      .attr("class", "brush");

    const brushBehavior = brushX()
      .extent([[marginLeft, 0], [width - marginRight, height]])
      .on("end", (event) => {
        // only respond to user events (ignore programmatic moves)
        if (!event.sourceEvent) return;
        const s = event.selection;
        if (!s) return;
        const [x0, x1] = s;
        const d0 = xScale.invert(x0);
        const d1 = xScale.invert(x1);
        setSelectionRange([d0, d1]);
      });

    brushG.call(brushBehavior);
    // initialize brush position (won't trigger .on because sourceEvent is null)
    const initSelection = selectionRange
      ? selectionRange.map(d => xScale(d))
      : [xScale(defaultStart), xScale(defaultEnd)];
    brushG.call(brushBehavior.move, initSelection);

  }, [rows]);

  // render
  if (!rows) return null;
  const defaultStart = rows[Math.max(0, rows.length - 52)].date;
  const defaultEnd = rows[rows.length - 1].date;
  const [startDate, endDate] = selectionRange || [defaultStart, defaultEnd];

  return (
    <div className="card">
      <h2>
        Rates from {startDate.toLocaleDateString()} to {endDate.toLocaleDateString()}
      </h2>
      <div ref={containerRef} style={{ width: '100%' }} />
    </div>
  );
}
