// scripts/generate-pmms.mjs
import fetch from "node-fetch";
import { csvParse } from "d3-dsv";
import { utcParse } from "d3-time-format";
import fs from "fs/promises";
import path from "path";

const PMMS_URL = "https://www.freddiemac.com/pmms/docs/PMMS_history.csv";
const parseDate = utcParse("%m/%d/%Y");

try {
  console.log("Fetching PMMS CSV…");
  const res = await fetch(PMMS_URL);
  if (!res.ok) throw new Error(res.statusText);
  const text = await res.text();
  const raw = csvParse(text);

  const data = raw.flatMap(r => {
    const d = parseDate(r.date);
    const v30 = parseFloat(r.pmms30);
    const v15 = parseFloat(r.pmms15);
    if (!d || isNaN(v30) || isNaN(v15)) return [];
    return { date: d.toISOString(), rate30: v30, rate15: v15 };
  });

  const outPath = path.resolve("pmms_snapshot.json");
  await fs.writeFile(outPath, JSON.stringify(data, null, 2), "utf8");
  console.log(`✅ Wrote ${data.length} entries to ${outPath}`);
} catch (err) {
  console.error(err);
  process.exit(1);
}