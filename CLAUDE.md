# [Name]: working on it

[One line: what the game is.] TypeScript, Vite, and WebGPU through
[artshape-render](https://github.com/onion2k/artshape-render), with the
physics from [artshape-physics](https://github.com/onion2k/artshape-physics).
The README says what the game is and how it is put together; this file says
how to change it without breaking it. The house rules in `~/.claude/CLAUDE.md`
apply too, and this file is what they say a project's must be.

Everything in square brackets is the template's, to be replaced in the first
hour of a new game. The rest already holds.

## Commands

    npm run dev            the game at http://localhost:5180
    npm run check:quick    formatting, types, lint, unit tests (the pre-commit hook; ~10 s)
    npm run check          all of it: check:quick, fuzz, determinism, leaks, pace gate, bench, smoke (~15 s)
    npm test               unit tests (Vitest, test/)
    npm run fuzz           the game played at random, rules checked (scripts/fuzz.ts)
    npm run fuzz -- --seed N           one failing seed again, with what led up to it
    npm run determinism    the same seed played twice, hashed, to catch chance not from the seed
    npm run leaks          an hour of play, watching what must stay bounded (10 min of it in check)
    npm run pace           the game played by the autopilot: minutes to bank ten balls, seed by seed
    npm run pace:check     that figure held to scripts/pace-baseline.json
    npm run bench          a frame's cost held to scripts/bench-baseline.json
    npm run smoke          the game in headless Chromium on the real GPU (Playwright, smoke/)
    npm run look           the scenes held to the pictures in smoke/screens
    npm run look:update    the pictures written again, after a change meant to alter them

`--update` on `pace:check` or `bench` writes a new baseline, and `npm run
look:update` writes the pictures again. Only do that when a change is meant
to move the figures or alter the picture, and say so in the commit. Look at
every picture you write.

## How the code is laid out

- `src/game.ts` is the game without the picture: everything that happens in
  the arena, a step at a time. It tells what happened through `GameEvents`,
  and knows nothing of the renderer or the page.
- `src/main.ts` is the page. It turns those events into words on the screen
  and draws the frame. There is no game logic here; if a change needs some,
  it goes in `game.ts` or a module of its own.
- `src/debug.ts` is `window.game`, the test API. `src/invariants.ts` lists
  the rules that must always hold. `src/autopilot.ts` plays the game by
  itself, for the gates.
- Content (the floor, the hole, the balls) lives in `arena.ts`. The save
  lives in `progress.ts`. Chance comes from `random.ts`, handed in.
- `src/physics.ts` is the game's side of artshape-physics, and nothing else
  imports the package directly. A change the physics needs goes in that
  repo, with a version bump here.

## Model features

What to copy the shape of, when building something new:

- **In the arena:** the ball and the hole. The ball is a body kind in
  `arena.ts`, drawn by `scene.ts`, banked by `game.ts`, counted by
  `invariants.ts`, read by `debug.ts`, and pictured in `smoke/look.spec.ts`.
  [Replace with the game's own first two or three features once it has them.]
- **Tools:** the fuzzer (`scripts/fuzzer.ts`) and the pace gate
  (`scripts/pace.ts`). Each has unit tests of its own working parts.
- **Test helpers:** `newGame(seed)` in `test/helpers.ts` for a game in memory
  with a note of every event, and `memoryStore` in `src/progress.ts` for a
  save that is not the player's.
- **Gate tolerances:** the pace gate allows a fifth either way on the median
  of four seeds; the bench a fifth and 0.05 ms; the leak watch holds every
  size under a ceiling and the heap to not still climbing. A swing on four
  seeds is checked on more before it is believed:
  `npm run fuzz -- --seeds 1-24`, and the pace gate's `CHECK.seeds` widened
  by hand.

## Rules for the code

- **No tight coupling.** A module takes what it needs as arguments or
  options. It does not import game state, and lower modules do not import
  content. `main.ts` is the only place that wires everything together.
- **Chance is handed in.** `Game` takes a `random`; nothing in `src/` calls
  `Math.random` itself. The tests, the fuzzer and the gates all seed it.
- **Match the style.** Comments are full sentences in the house voice, saying
  why and not what. Keep names plain. Prettier decides the formatting.
- **Nothing is kept for ever.** A list, map or cache that is added to has to
  be emptied somewhere, and the size it can reach named in `scripts/leaks.ts`.
- **Every kind of thing is handled everywhere.** A new body kind, event, save
  field or scene has to work in every path it can reach. See the checklist.
- **Save compatibility.** Old saves must still load. A new save field needs a
  default in `progress.ts`, and a save in the new shape added to
  `test/saves/`, which keeps one of every shape the game has ever written.
  The corpus test fails until the new one is there.

## Definition of done

The house's nine points, in `~/.claude/CLAUDE.md`. Here, they mean: unit
tests in `test/`, a stage in `smoke/progress.spec.ts`, an action in
`scripts/fuzzer.ts` and a rule in `src/invariants.ts`, a size in
`scripts/leaks.ts` for anything kept, `measureFrame` through the API in the
scenes touched, and a picture in `smoke/look.spec.ts`. `npm run check`
green, and `npm run fuzz -- --seeds 1-24` clean.

## Edge-case checklist

For anything new in the arena, check what it does:

- **the hole:** pushed down it
- **the sled:** shoved by it, driven over, pinned against the rock
- **save:** saved, reloaded, and loaded from an old save without the field
- **rock:** against the wall and in the corners; never left in rock
- **scale:** many at once, at capacity (`BODY_CAPACITY`)
- **phone:** narrow screen
- [the game's own: its rooms, its machines, its tools, whatever else a new
  thing can meet]

## Verifying in a browser

- **Use headless Playwright** (the `smoke/` setup, `start()` in
  `smoke/game.ts`) for anything that has to be seen or measured. The in-app
  Browser pane pauses its frames when hidden, and its screenshots go stale.
- **Control time.** Pause the game with `game.pause()`, set the scene with
  the API, `seed(n)`, then `step(frames)`, rather than waiting on timeouts.
- **Keep the player's save safe.** Never write over it in a browser the
  player uses. A test save goes in through `start(page, { save })`, in a
  fresh Playwright context.

## Commits

Commit only when asked. Commit messages follow the house's: a sentence
summary in the house voice, and a body saying what changed and why. Use two
commits when a refactor and a feature land together. The pre-commit hook runs
`check:quick`.
