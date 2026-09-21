import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { countSolutions, startIndex } from "./engine.ts";
import { PUZZLES } from "./puzzles.ts";

describe("zip puzzles", () => {
  it("bundles 8–12 handcrafted boards", () => {
    assert.ok(PUZZLES.length >= 8 && PUZZLES.length <= 12);
    assert.ok(PUZZLES.some((p) => p.difficulty === "easy"));
    assert.ok(PUZZLES.some((p) => p.difficulty === "medium"));
  });

  it("every puzzle starts at 1 and is solvable", () => {
    for (const puzzle of PUZZLES) {
      assert.notEqual(startIndex(puzzle), -1, puzzle.id);
      const n = countSolutions(puzzle, 1);
      assert.equal(n, 1, `${puzzle.id} should have a solution`);
    }
  });
});
