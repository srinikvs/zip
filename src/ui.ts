import { formatTime, idx, rc } from "./game/engine.ts";
import { DIFFICULTIES, type BestTimes, type Difficulty, type Puzzle, type SavedProgress } from "./game/types.ts";
import { GAME_TITLE, GAME_VERSION } from "./game/version.ts";

const HOW_TO = [
  "Start on 1. Draw one orthogonal path through every cell exactly once.",
  "Hit numbered cells in order: 1 → 2 → … → N. Empty cells fill the gaps.",
  "Thick walls block the path. The line cannot cross itself.",
  "Drag from 1, or slide onto a neighbor of the tip. Undo the last step or clear the path. Beat your BEST time.",
];

export function gamesBack(): string {
  return `<button type="button" class="games-back" data-action="games">← Games</button>`;
}

function modeChips(difficulty: Difficulty, action: "select" | "play"): string {
  return `<div class="modes" role="group" aria-label="Difficulty">${DIFFICULTIES.map((value) => {
    const on = action === "select" && difficulty === value ? " chip-on" : "";
    const extra = action === "play" ? ` data-action="play"` : "";
    return `<button type="button" class="chip${on}" data-diff="${value}"${extra}>${value}</button>`;
  }).join("")}</div>`;
}

export function startScreenHtml(best: BestTimes, difficulty: Difficulty, saved: SavedProgress | null): string {
  return `<div class="start-screen" data-testid="start-screen">
      <header class="start-top">${gamesBack()}<div class="brand"><p class="kicker">Playadda</p><h1>${GAME_TITLE}</h1><span class="ver-badge" data-testid="version">v${GAME_VERSION}</span></div></header>
      <p class="start-tag">Connect 1 → N in one path. Fill every cell. Never cross a wall.</p>
      <div class="best-row">
        <div class="best-chip" data-testid="best-easy"><span class="stat-label">BEST Easy</span><span class="stat-value">${formatTime(best.easy)}</span></div>
        <div class="best-chip" data-testid="best-medium"><span class="stat-label">BEST Medium</span><span class="stat-value">${formatTime(best.medium)}</span></div>
        <div class="best-chip" data-testid="best-hard"><span class="stat-label">BEST Hard</span><span class="stat-value">${formatTime(best.hard)}</span></div>
      </div>
      <section class="start-card" data-testid="start-panel">
        <div class="card-head"><p class="eyebrow">How to play</p><span class="ver-badge ink" data-testid="howto-version">v${GAME_VERSION}</span></div>
        <h2>Draw the only path that fits</h2>
        <ol class="howto-list" data-testid="howto">${HOW_TO.map((step, i) => `<li><span class="howto-n">${i + 1}</span><span>${step}</span></li>`).join("")}</ol>
        ${modeChips(difficulty, "select")}
        ${saved ? `<button type="button" class="cta start-go" data-action="continue" data-testid="continue">Continue ${saved.difficulty} · ${formatTime(saved.elapsed)}</button>` : ""}
        <button type="button" class="cta start-go${saved ? " ghost" : ""}" data-action="start" data-testid="start">${saved ? "Start fresh" : "Start"}</button>
        <p class="start-version">Playadda · v${GAME_VERSION}</p>
      </section>
    </div>`;
}

export function boardHtml(puzzle: Puzzle, path: number[]): string {
  const { size } = puzzle;
  const onPath = new Set(path);
  const head = path.length ? path[path.length - 1] : -1;
  const cells: string[] = [];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const i = idx(r, c, size);
      const clue = puzzle.clues[i];
      const wallR = c < size - 1 && puzzle.wallsRight[i];
      const wallD = r < size - 1 && puzzle.wallsDown[i];
      const classes = ["cell", onPath.has(i) ? "cell-path" : "", i === head ? "cell-head" : "", clue === 1 ? "cell-start" : "", wallR ? "wall-r" : "", wallD ? "wall-d" : ""].filter(Boolean).join(" ");
      cells.push(`<button type="button" class="${classes}" data-cell="${i}" style="grid-row:${r + 1};grid-column:${c + 1}">${clue ? `<span class="clue">${clue}</span>` : ""}</button>`);
    }
  }
  const lines: string[] = [];
  for (let s = 0; s < path.length - 1; s++) {
    const a = rc(path[s], size);
    const b = rc(path[s + 1], size);
    const top = Math.min(a.r, b.r);
    const left = Math.min(a.c, b.c);
    lines.push(`<span class="seg ${a.r === b.r ? "seg-h" : "seg-v"}" style="--r:${top};--c:${left};--n:${size}"></span>`);
  }
  return `<div class="paper-wrap"><div class="board" data-testid="board" style="--n:${size}" role="grid" aria-label="Zip board">${cells.join("")}<div class="path-layer" aria-hidden="true">${lines.join("")}</div></div></div>`;
}

export function playScreenHtml(puzzle: Puzzle, path: number[], best: number | null, elapsed: number, won: boolean, beatBest: boolean, _difficulty?: Difficulty): string {
  void _difficulty;
  return `<div class="play-screen" data-testid="play-screen">
      <header class="topbar">${gamesBack()}<div class="brand compact"><p class="kicker">Playadda</p><h1>${GAME_TITLE}</h1><span class="ver-badge" data-testid="version">v${GAME_VERSION}</span></div>
        <button type="button" class="icon-btn" data-action="help" aria-label="How to play">?</button></header>
      <div class="hud" data-testid="hud">
        <div class="best-chip${beatBest && won ? " is-hot" : ""}" data-testid="best"><span class="stat-label">BEST</span><span class="stat-value">${formatTime(best)}</span></div>
        <div class="best-chip" data-testid="time"><span class="stat-label">TIME</span><span class="stat-value" data-time-value>${formatTime(elapsed)}</span></div>
      </div>
      ${boardHtml(puzzle, path)}
      <div class="toolbar">
        <button type="button" class="tool" data-action="undo" ${path.length === 0 || won ? "disabled" : ""}>Undo</button>
        <button type="button" class="tool" data-action="clear" ${path.length === 0 || won ? "disabled" : ""}>Clear</button>
        <div class="tool ghost-stat">${path.length}/${puzzle.size * puzzle.size}</div>
      </div>
    </div>`;
}

export function winCardHtml(elapsed: number, beatBest: boolean, won: boolean): string {
  if (!won) return "";
  return `<div class="win-screen" data-testid="win"><div class="win-card"><p class="kicker">Solved</p><h2>${beatBest ? "New best time" : "Path complete"}</h2><p class="win-time">${formatTime(elapsed)}</p><p class="win-sub">Playadda Zip · v${GAME_VERSION}</p><button type="button" class="cta" data-action="home" data-testid="win-home">Home</button>${modeChips("easy", "play")}</div></div>`;
}

export function leaveCardHtml(open: boolean): string {
  if (!open) return "";
  return `<div class="leave-screen" data-testid="leave"><div class="leave-card"><p class="kicker">Leave game</p><h2>Save this path?</h2><p class="leave-copy">Keep your line and timer, discard them, or stay.</p><button type="button" class="cta" data-action="save">Save</button><button type="button" class="cta ghost danger" data-action="discard">Discard</button><button type="button" class="cta ghost" data-action="stay">Stay</button></div></div>`;
}
