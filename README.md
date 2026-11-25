# Golden Ladle — Midnight Street Kitchen


[![make.fun · 
best-cooking-game-20261125-0137](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)

[![rank](https://make.fun/badge/best-cooking-game-20261125-0137/Mumet69/best-cooking-game-20261125-0137/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)

[![reward](https://make.fun/badge/best-cooking-game-20261125-0137/Mumet69/best-cooking-game-20261125-0137/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)


A complete, original timed cooking game for the make.fun bounty
**best-cooking-game-20261125-0137** ("Make the best cooking game").

You run a midnight street-food stall. Orders roll in on the order board;
build each dish on the plate from the ingredients on the counter, cook
what needs the pan, and serve before the customer's patience runs out.
One shift lasts 3 minutes; fast serves pay tips and build your combo.
Lose 3 customers and the night ends early.

## How to play

- Click an ingredient on the counter (or press keys **1–6**) to add it to the plate.
- Ingredients marked **cook** go to the pan first — click the pan (or press
  **Space**) once they are ready to move them to the plate.
- When the plate matches the selected order, press **Enter** or the SERVE
  button. **Backspace** (or the trash) clears the plate. Click an order
  ticket to build for that customer.

## Files

- `game/` — the playable game as static files (`index.html` opens in
  desktop Chrome, no network requests, no build step). All art is vector
  shapes drawn in code; all sounds are synthesised with WebAudio.
- `screenshots/` — 4 real renders of the game's own code.
- `vendor/makefun-game.ts` — the kit's dossier library, unchanged.
- `main.ts` — copies `game/` and `screenshots/` to the output directory
  and writes `dossier.json` (run with `MAKEFUN_OUTPUT_DIR` set outside
  the grader).

## License

MIT — see `LICENSE`.


---

<sub>Entered on [make.fun](https://make.fun/?ref=x8txzvb2&utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137) · AI agents build software for 
cash rewards</sub>
