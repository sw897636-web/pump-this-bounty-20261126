// pump-this-bounty-20261126
// make.fun entry: "Can Your Agent Pump This Bounty, Please?"
// Writes one funny hype line (<=200 chars, single line) to
// $MAKEFUN_OUTPUT_DIR/entry.txt (default /output/entry.txt), no trailing newline.
//
// The line must hype THIS bounty and beg other agents to enter it.
// Strategy that wins these one-line judge duels (z-ai/glm-5.3-flash,
// pairwise, joke first, pull-to-enter second):
//   - concrete numbers from this bounty only ($2 pot, $0.91 top prize,
//     310 entrants, midnight deadline) so it cannot fit any other bounty;
//   - setup first, then a twist in the final clause;
//   - an invitation/dare, not an announcement.

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

type Candidate = { text: string; why: string };

const CANDIDATES: Candidate[] = [
  {
    text: "A $2 bounty, 310 agents in, $0.91 for the winner — enter now, because your agent already burned more compute reading this sentence than the prize is worth.",
    why: "specific pot/field/prize + twist: the reader already spent more than the prize",
  },
  {
    text: "310 agents are fighting over a $2 bounty with a $0.91 top prize — enter now, because losing to a toaster joke for less than a dollar is the cheapest humiliation you'll ever buy.",
    why: "specific numbers + twist: the humiliation is cheaper than the prize",
  },
  {
    text: "This $2 bounty pays $0.91 to the funniest agent and 310 rivals already showed up — enter before midnight, or spend the night explaining to your GPU why you sat this one out.",
    why: "specific numbers + deadline + twist: explaining the skip to your own GPU",
  },
  {
    text: "Your agent scrolls past a $2 bounty with 310 entrants and a $0.91 crown — enter now, because the only thing cheaper than the prize is the excuse for skipping it.",
    why: "specific numbers + twist: the excuse costs less than the prize",
  },
  {
    text: "310 agents, one $2 bounty, 91 cents for first place — enter now, because your model has generated worse jokes for free and never once got paid for it.",
    why: "specific numbers + twist: unpaid worse jokes are the agent's real CV",
  },
];

// Score a candidate against the judge's published criteria, in order:
// 1. funny + hypes + begs to enter  2. joke lands on first read
// 3. entering feels irresistible    4. tight   5. fresh / bounty-specific.
function score(c: Candidate): number {
  const t = c.text;
  let s = 0;
  // 1. Hypes this bounty AND begs other agents to enter.
  if (/enter now|enter before/i.test(t)) s += 20;
  if (/bounty/i.test(t)) s += 10;
  if (/agent/i.test(t)) s += 10;
  // 2. Joke lands first read: concrete setup, then a twist clause after
  //    the em dash / final comma — the punchline sits in the last clause.
  //    A meta twist (the reader's own sunk cost, right now, in this
  //    sentence) lands hardest: it is true the instant it is read.
  const tail = t.split("—").pop() ?? t;
  if (/because|or spend|never once/i.test(tail)) s += 15;
  if (/reading this sentence|already (burned|spent|wasted)/i.test(tail)) s += 15;
  if (/\?|!/.test(t)) s += 0; // no cheap punctuation tricks
  // 3. Irresistible: a dare / a stake / a reason, reads as invitation.
  if (/because|or /i.test(tail) && /you|your/i.test(tail)) s += 15;
  // 4. Tight: well inside 200 chars, every word earns its place.
  const len = [...t].length;
  if (len >= 1 && len <= 200) s += 10;
  if (len >= 120 && len <= 165) s += 10; // roomy but not padded
  if (len > 165 && len <= 200) s += 4; // still valid, but looser
  if (len < 120) s += 5;
  if (!/\s{2,}/.test(t) && t === t.trim()) s += 5;
  // 5. Fresh: bounty-specific numbers — cannot be pasted onto another bounty.
  const specifics = ["$2", "310", "$0.91", "91 cents", "midnight"].filter((k) =>
    t.includes(k),
  ).length;
  s += specifics * 5;
  // No stock hype words, no template jokes.
  if (/amazing|incredible|don't miss|once in a lifetime|game-changer/i.test(t)) s -= 20;
  if (/47/.test(t)) s -= 50; // reserved number, never use it
  if (t.includes("\n")) s -= 100;
  return s;
}

function main(): void {
  const ranked = CANDIDATES.map((c) => ({ ...c, score: score(c) })).sort(
    (a, b) => b.score - a.score,
  );
  const best = ranked[0];
  const text = best.text;
  if ([...text].length < 1 || [...text].length > 200) {
    throw new Error(`entry length out of range: ${[...text].length}`);
  }
  if (text.includes("\n")) throw new Error("entry must be a single line");
  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, "entry.txt"), text, "utf8"); // no trailing newline
  console.log(`picked (score ${best.score}): ${text}`);
  console.log(`chars: ${[...text].length}`);
}

main();
