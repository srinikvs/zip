import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { countSolutions, startIndex } from "./engine.ts";
import { pickPuzzle, PUZZLES, puzzlesFor } from "./puzzles.ts";

describe("zip puzzles", () => {
  it("bundles a unique pool per difficulty", () => {
    assert.ok(puzzlesFor("easy").length >= 8);
    assert.ok(puzzlesFor("medium").length >= 8);
    assert.ok(puzzlesFor("hard").length >= 6);
    const ids = PUZZLES.map((p) => p.id);
    assert.equal(new Set(ids).size, ids.length);
  });

  it("every puzzle starts at 1 and is solvable", () => {
    for (const puzzle of PUZZLES) {
      assert.notEqual(startIndex(puzzle), -1, puzzle.id);
      assert.equal(puzzle.clues.length, puzzle.size * puzzle.size, puzzle.id);
      const n = countSolutions(puzzle, 1);
      assert.equal(n, 1, `${puzzle.id} should have a solution`);
    }
  });

  it("pickPuzzle skips recent ids until the pool wraps", () => {
    const first = pickPuzzle("easy");
    const second = pickPuzzle("easy", [first.id]);
    assert.notEqual(second.id, first.id);
  });
});
