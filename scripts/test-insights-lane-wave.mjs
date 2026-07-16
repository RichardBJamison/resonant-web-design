/**
 * Virtual cursor simulation for Insights lane string wave.
 * Run: node scripts/test-insights-lane-wave.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const code = fs.readFileSync(path.join(__dirname, "../assets/js/insights-lane-wave.js"), "utf8");
const sandbox = {};
const InsightsLaneWave = new Function("globalThis", code + "\nreturn globalThis.InsightsLaneWave;")(sandbox);

function makeCards(n) {
  return Array.from({ length: n }, () => ({
    style: { setProperty() {} },
    classList: {
      _s: new Set(),
      toggle(name, on) {
        if (on) this._s.add(name);
        else this._s.delete(name);
      }
    },
    setAttribute() {},
    querySelector() {
      return { setAttribute() {} };
    }
  }));
}

function faces(wave) {
  return wave.getState().faces.map((f, i) => `${i + 1}:${f}`).join("  ");
}

function assert(cond, msg) {
  if (!cond) {
    console.error("FAIL:", msg);
    process.exitCode = 1;
  } else {
    console.log("OK  ", msg);
  }
}

console.log("=== L→R pass 1→2→3→4→5 ===\n");
const w = InsightsLaneWave.createWave(makeCards(5));

// Cross 1
w.onTravel(0);
console.log("on 1 right:", faces(w), w.getState().rotations);
assert(w.getState().faces[0] === "back", "card 1 flips right → back");
assert(w.getState().faces[2] === "back", "card 3 (+2 ahead) pulled same → back");

// Cross 2
w.onTravel(1);
console.log("on 2 right:", faces(w), w.getState().rotations);
assert(w.getState().faces[3] === "back", "cross 2 right → card 4 (+2) pulled same");

// Cross 3
w.onTravel(2);
console.log("on 3 right:", faces(w), w.getState().rotations);
assert(w.getState().faces[4] === "back", "cross 3 right → card 5 (+2) pulled same");

// Cross 4 — expect card 2 (-2) opposite tug
const before2 = w.getState().rotations[1];
w.onTravel(3);
console.log("on 4 right:", faces(w), w.getState().rotations);
assert(w.getState().rotations[1] === before2 + 180, "on 4 right → card 2 (-2) tugged opposite (+180)");

// Cross 5
w.onTravel(4);
console.log("on 5 right:", faces(w), w.getState().rotations);

console.log("\n=== R→L pass 5→4→3 ===\n");
w.onTravel(3);
console.log("on 4 left:", faces(w), w.getState().rotations);
w.onTravel(2);
console.log("on 3 left:", faces(w), w.getState().rotations);
assert(w.getState().lastDir === "left", "travel dir is left");

console.log("\n=== Leave settle ===\n");
const s = w.settleMajority();
console.log("wantBack", s.wantBack, "pending", s.pending);
console.log("final  ", faces(w));

if (!process.exitCode) console.log("\nAll string-wave checks passed.");
