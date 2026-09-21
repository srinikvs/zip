import { canStep, formatTime, isSolved, startIndex } from "./game/engine.ts";
import { leaveToPortal } from "./game/portal.ts";
import { nextPuzzle, puzzleById, puzzlesFor } from "./game/puzzles.ts";
import {
  clearProgress,
  lastPuzzleId,
  loadBestTimes,
  loadProgress,
  recordBestTime,
  rememberPuzzle,
  saveProgress,
} from "./game/storage.ts";
import type { BestTimes, Difficulty, Puzzle } from "./game/types.ts";
import { leaveCardHtml, playScreenHtml, startScreenHtml, winCardHtml } from "./ui.ts";
import "./styles.css";

type Screen = "howto" | "play";

const rootEl = document.querySelector<HTMLDivElement>("#app");
if (!rootEl) throw new Error("missing #app");
const root = rootEl;

let screen: Screen = "howto";
let difficulty: Difficulty = "easy";
let puzzle: Puzzle = puzzlesFor("easy")[0];
let path: number[] = [];
let elapsed = 0;
let won = false;
let beatBest = false;
let best: BestTimes = loadBestTimes();
let leaveOpen = false;
let startedAt: number | null = null;
let dragging = false;
let lastPointer = -1;

function queuedPuzzle(diff: Difficulty): Puzzle {
  const last = lastPuzzleId(diff);
  const saved = last ? puzzleById(last) : undefined;
  if (saved && saved.difficulty === diff) return saved;
  return puzzlesFor(diff)[0];
}

function advanceQueue(diff: Difficulty): Puzzle {
  const next = nextPuzzle(queuedPuzzle(diff));
  rememberPuzzle(diff, next.id);
  return next;
}

function pauseTimer(): void {
  if (startedAt === null) return;
  elapsed = Math.max(0, Math.floor((Date.now() - startedAt) / 1000));
  startedAt = null;
}

function resumeTimer(): void {
  if (won || startedAt !== null) return;
  startedAt = Date.now() - elapsed * 1000;
}

function snapshot() {
  const seconds = startedAt !== null ? Math.max(0, Math.floor((Date.now() - startedAt) / 1000)) : elapsed;
  return { puzzleId: puzzle.id, difficulty, path: path.slice(), elapsed: seconds };
}

function startFresh(diff: Difficulty): void {
  difficulty = diff;
  puzzle = queuedPuzzle(diff);
  rememberPuzzle(diff, puzzle.id);
  path = [];
  elapsed = 0;
  won = false;
  beatBest = false;
  leaveOpen = false;
  startedAt = Date.now();
  screen = "play";
  clearProgress();
  render();
}

function continueSaved(): void {
  const saved = loadProgress();
  if (!saved) return;
  const found = puzzleById(saved.puzzleId);
  if (!found) return;
  puzzle = found;
  difficulty = saved.difficulty;
  path = saved.path.slice();
  elapsed = saved.elapsed;
  won = false;
  beatBest = false;
  leaveOpen = false;
  startedAt = Date.now() - saved.elapsed * 1000;
  screen = "play";
  render();
}

function checkWin(): void {
  if (won || !isSolved(puzzle, path)) return;
  won = true;
  const seconds = startedAt ? Math.max(1, Math.floor((Date.now() - startedAt) / 1000)) : Math.max(1, elapsed);
  elapsed = seconds;
  startedAt = null;
  const prev = best[difficulty];
  best = recordBestTime(difficulty, seconds);
  beatBest = prev === null || seconds < prev;
  clearProgress();
  rememberPuzzle(difficulty, nextPuzzle(puzzle).id);
}

function tryAdd(cell: number): void {
  if (won) return;
  if (path.length === 0) {
    if (cell === startIndex(puzzle)) path = [cell];
    return;
  }
  if (path[path.length - 1] === cell) return;
  if (path.length >= 2 && path[path.length - 2] === cell) {
    path = path.slice(0, -1);
    return;
  }
  if (canStep(puzzle, path, cell)) {
    path = [...path, cell];
    checkWin();
  }
}

function undo(): void {
  if (!won && path.length) path = path.slice(0, -1);
}

function clearPath(): void {
  if (!won) path = [];
}

function cellFromPoint(x: number, y: number): number {
  const hit = document.elementFromPoint(x, y)?.closest<HTMLElement>("[data-cell]");
  const value = hit ? Number(hit.dataset.cell) : NaN;
  return Number.isInteger(value) ? value : -1;
}

function onPointerDown(event: PointerEvent): void {
  if (won || leaveOpen || screen !== "play") return;
  const cell = cellFromPoint(event.clientX, event.clientY);
  if (cell < 0) return;
  dragging = true;
  lastPointer = cell;
  tryAdd(cell);
  render();
}

function onPointerMove(event: PointerEvent): void {
  if (!dragging || won) return;
  const cell = cellFromPoint(event.clientX, event.clientY);
  if (cell < 0 || cell === lastPointer) return;
  lastPointer = cell;
  tryAdd(cell);
  render();
}

function onPointerUp(): void {
  dragging = false;
  lastPointer = -1;
}

function requestLeave(): void {
  if (screen === "play" && !won) {
    pauseTimer();
    leaveOpen = true;
    render();
    return;
  }
  leaveToPortal();
}

function stay(): void {
  leaveOpen = false;
  if (screen === "play" && !won) resumeTimer();
  render();
}

setInterval(() => {
  if (screen !== "play" || won || leaveOpen || startedAt === null) return;
  elapsed = Math.floor((Date.now() - startedAt) / 1000);
  const timeEl = document.querySelector("[data-time-value]");
  if (timeEl) timeEl.textContent = formatTime(elapsed);
}, 250);

window.addEventListener("keydown", (event) => {
  if (leaveOpen && event.key === "Escape") {
    event.preventDefault();
    stay();
    return;
  }
  if (screen !== "play" || won) return;
  if ((event.key === "z" && (event.metaKey || event.ctrlKey)) || event.key === "Backspace") {
    event.preventDefault();
    undo();
    render();
  }
});

function onClick(event: Event): void {
  const t = (event.target as HTMLElement).closest<HTMLElement>("[data-action], [data-diff], [data-cell]");
  if (!t) return;
  const action = t.dataset.action;
  const diff = t.dataset.diff as Difficulty | undefined;
  if (diff) {
    difficulty = diff;
    render();
    return;
  }
  if (t.dataset.cell) return;
  switch (action) {
    case "start":
      startFresh(difficulty);
      break;
    case "new":
      puzzle = advanceQueue(difficulty);
      render();
      break;
    case "continue":
      continueSaved();
      break;
    case "undo":
      undo();
      render();
      break;
    case "clear":
      clearPath();
      render();
      break;
    case "help":
    case "howto":
      if (screen === "play" && !won) {
        pauseTimer();
        saveProgress(snapshot());
      }
      screen = "howto";
      leaveOpen = false;
      render();
      break;
    case "games":
      requestLeave();
      break;
    case "save":
      saveProgress(snapshot());
      leaveToPortal();
      break;
    case "discard":
      clearProgress();
      leaveToPortal();
      break;
    case "stay":
      stay();
      break;
  }
}

function render(): void {
  root.innerHTML = `<div class="app" data-testid="app">${
    screen === "howto"
      ? startScreenHtml(best, difficulty, loadProgress())
      : playScreenHtml(puzzle, path, best[difficulty], elapsed, won, beatBest)
  }${winCardHtml(elapsed, beatBest, won)}${leaveCardHtml(leaveOpen)}</div>`;
}

root.addEventListener("click", onClick);
root.addEventListener("pointerdown", onPointerDown);
window.addEventListener("pointermove", onPointerMove);
window.addEventListener("pointerup", onPointerUp);
window.addEventListener("pointercancel", onPointerUp);
render();
