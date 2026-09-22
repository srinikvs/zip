import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { countSolutions, hasWall, idx, neighbors, startIndex } from "./engine.ts";
import { pickPuzzle, PUZZLES, puzzlesFor } from "./puzzles.ts";
import type { Puzzle } from "./types.ts";

function wallCount(puzzle: Puzzle): number {
  return puzzle.wallsRight.filter(Boolean).length + puzzle.wallsDown.filter(Boolean).length;
}

function clueCount(puzzle: Puzzle): number {
  return puzzle.clues.filter((n) => n > 0).length;
}

function branchy(puzzle: Puzzle): number {
  let n = 0;
  for (let i = 0; i < puzzle.size * puzzle.size; i++) if (neighbors(puzzle, i).length >= 3) n += 1;
  return n;
}

function rowSnake(size: number, reverse = false): number[] {
  const path: number[] = [];
  for (let r = 0; r < size; r++) {
    if (r % 2 === 0) for (let c = 0; c < size; c++) path.push(idx(r, c, size));
    else for (let c = size - 1; c >= 0; c--) path.push(idx(r, c, size));
  }
  return reverse ? path.reverse() : path;
}

function snakeClears(puzzle: Puzzle, cells: number[]): boolean {
  if (puzzle.clues[cells[0]] !== 1) return false;
  let last = 1;
  for (let i = 1; i < cells.length; i++) {
    if (hasWall(puzzle, cells[i - 1], cells[i])) return false;
    const clue = puzzle.clues[cells[i]];
    if (clue !== 0 && clue !== last + 1) return false;
    if (clue) last = clue;
  }
  return last === Math.max(...puzzle.clues);
}

describe("zip puzzles", () => {
  it("bundles a unique pool per difficulty", () => {
    assert.ok(puzzlesFor("easy").length >= 8);
    assert.ok(puzzlesFor("medium").length >= 8);
    assert.ok(puzzlesFor("hard").length >= 8);
    const ids = PUZZLES.map((p) => p.id);
    assert.equal(new Set(ids).size, ids.length);
  });

  it("every puzzle starts at 1 and is solvable", () => {
    for (const puzzle of PUZZLES) {
      assert.notEqual(startIndex(puzzle), -1, puzzle.id);
      assert.equal(puzzle.clues.length, puzzle.size * puzzle.size, puzzle.id);
      assert.equal(countSolutions(puzzle, 1), 1, `${puzzle.id} should have a solution`);
    }
  });

  it("Hard is open-branch, not a wall tunnel", () => {
    for (const puzzle of puzzlesFor("hard")) {
      assert.ok(wallCount(puzzle) <= 10, `${puzzle.id} too many walls`);
      assert.ok(clueCount(puzzle) >= 9, `${puzzle.id} too few numbers`);
      assert.ok(branchy(puzzle) >= 8, `${puzzle.id} too few branches`);
      assert.equal(snakeClears(puzzle, rowSnake(puzzle.size)), false, `${puzzle.id} row-snake`);
    }
    const avg = (diff: "easy" | "medium" | "hard") => {
      const pool = puzzlesFor(diff);
      return pool.reduce((sum, p) => sum + wallCount(p), 0) / pool.length;
    };
    assert.ok(avg("hard") < avg("medium"), "Hard should use fewer walls than Medium");
  });

  it("pickPuzzle skips recent ids until the pool wraps", () => {
    const first = pickPuzzle("easy");
    const second = pickPuzzle("easy", [first.id]);
    assert.notEqual(second.id, first.id);
  });
});
