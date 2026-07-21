import fs from "fs";
import os from "os";

const s = fs.readFileSync(`${os.tmpdir()}/decap-cms.js`, "utf8");
const start = s.indexOf('locale:"cs"');
const chunk = s.slice(start, start + 35000);

const patterns = [
  "addLabel",
  "addTitle",
  "remove",
  "delete",
  "loginWithGitHub",
  "content",
  "media",
  "publish",
  "draft",
  "addEntry",
  "searchAll",
];

for (const p of patterns) {
  const re = new RegExp(`${p}:"([^"]*)"`);
  const m = chunk.match(re);
  if (m) console.log(`${p}: ${m[1]}`);
}
