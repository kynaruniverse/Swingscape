import { WordStore } from "./wordStore";
import { generatePair, Difficulty } from "./pairGenerator";
import * as fs from "fs";

const raw = JSON.parse(
  fs.readFileSync("/home/claude/niche-game/app/src/data/niche_wordlist.json", "utf-8")
);
const store = new WordStore(raw);

console.log(`Loaded ${store.size} words\n`);

const difficulties: Difficulty[] = ["easy", "medium", "hard"];

for (const difficulty of difficulties) {
  console.log(`--- ${difficulty.toUpperCase()} ---`);
  for (let i = 0; i < 5; i++) {
    const pair = generatePair(store, difficulty);
    if (!pair) {
      console.log("  FAILED to generate pair");
      continue;
    }
    console.log(
      `  ${pair.wordA} -> ${pair.wordB}  ` +
        `(gap: ${pair.gapSize} words, best possible: "${pair.bestPossible?.word}" ` +
        `[${pair.bestPossible?.tier}, score ${pair.bestPossible?.rarity_score}])`
    );
  }
  console.log();
}
