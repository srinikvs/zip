# Zip v1.0.2

Playadda number-path puzzle. Draw one orthogonal path from **1 → N**, visit every cell exactly once, and never cross a wall.

Play at `https://playadda.duckdns.org/zip/` after Jenkins deploy.
Vite `base` is **`/zip/`**.

## Playadda UX

1. Version ID (`v1.0.2`) on the how-to-play screen, the play HUD, and the win card.
2. How to play **before** play. Pick **Easy / Medium / Hard**, then **Start**.
3. **BEST** is the fastest completion time for each difficulty.
4. **← Games** returns to the Playadda portal. During an unfinished puzzle it asks **Save**, **Discard**, or **Stay**.
5. After a win, **Home** returns to the portal. **Easy / Medium / Hard** deal a new unused board from that pool.
6. A saved game offers **Continue** on the next visit.

`localStorage` key: `playadda-zip-v1`

## Play

- Touch or drag from cell **1**. Move up, down, left, or right.
- Numbered cells must be hit in order. Empty cells fill the path between them.
- Thick bars are walls. The path cannot cross them or itself.
- **Undo** removes the last step. **Clear** wipes the path.
- The timer starts with the puzzle. A win records BEST if you beat it.

Pool: 10 Easy (5×5), 10 Medium (6×6), 8 Hard (6×6 / 7×7). The next board is random from unused ids in that pool.

## Run locally

```bash
npm install
npm run dev      # http://localhost:5173/zip/
npm test
npm run build    # writes dist/
npm run preview  # http://localhost:4173/zip/
```

## Jenkins

```bash
npm install && npm run build
```

`npm run build` runs `tsc -b && vite build --base /zip/`.
Rsync **`dist/`** to the Playadda `/zip/` path.

## Stack

Vite 6 + vanilla TypeScript. No backend.

## License

Use and modify freely for personal or commercial projects.
