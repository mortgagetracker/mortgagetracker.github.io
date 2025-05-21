// scripts/generate-pmms.cjs
const fetch = require("node-fetch");
const { csvParse } = require("d3-dsv");
const { utcParse } = require("d3-time-format");
const fs = require("fs").promises;
const path = require("path");

const PMMS_URL = "https://www.freddiemac.com/pmms/docs/PMMS_history.csv";
const parseDate = utcParse("%m/%d/%Y");

async function main() {
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

  // Write into the site root
  const outPath = path.resolve(__dirname, "../pmms_snapshot.json");
  await fs.writeFile(outPath, JSON.stringify(data, null, 2), "utf8");
  console.log(`✅ Wrote ${data.length} entries to ${outPath}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});