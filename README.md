# artshape-game-template

The starting point for a game on [artshape-render](https://github.com/onion2k/artshape-render)
and [artshape-physics](https://github.com/onion2k/artshape-physics): a stub
game with every check a finished one has, all green on the first commit.

Taken from [Pushminer](https://github.com/onion2k/miner) in September 2026,
which grew its harness one gate at a time as bugs found the gaps. A new game
should not have to: adding to a gate is a habit, while creating one halfway
through is a feature nobody schedules. So every gate is here at the size of
one thing, ready to be added to.

## The stub game

A sled on a square floor walled in by rock, a dozen balls, and a hole in the
middle. Drive with **W A S D** or the arrows and shove a ball into the hole
to bank it; another drops to take its place. Drag to orbit the camera, wheel
to zoom. The bank is saved in the browser.

That is enough to exercise everything below, and nothing more. It is meant
to be replaced.

## What is here

Five decisions made in the first commit, because each is cheap on day one
and dear to retrofit:

- **The game runs without the page.** `src/game.ts` knows nothing of the
  renderer or the DOM, so it is stepped headless in Vitest and in every
  script. `src/main.ts` presents it.
- **Chance comes from one seeded source.** `Game` is handed a `random` and
  never touches `Math.random`. The same seed gives the same game, which is
  what the fuzzer's replays, the determinism check and every baseline rest
  on.
- **Time is stepped.** A fixed step, and `pause()` and `step(n)` on the
  test API, so no test waits on a clock.
- **A test API on `window.game`**, typed, that the smoke tests compile
  against. Everything a test needs to set a scene and read it back.
- **A file of always-true rules**, `src/invariants.ts`, checked by the
  fuzzer after everything it does.

And every gate at n=1:

    npm run check:quick    formatting, types, lint, unit tests (the pre-commit hook)
    npm run fuzz           a monkey plays it, and the rules are checked
    npm run determinism    the same seed played twice, hashed
    npm run leaks          a long game, watching what must stay bounded
    npm run pace:check     how it plays, held to a baseline both ways
    npm run bench          what a frame costs, held to a baseline
    npm run smoke          the real thing in headless Chromium on the GPU
    npm run look           what it looks like, held to a picture
    npm run check          all of it

One fuzzer action, one invariant, one watched size, one bench scenario, one
pace figure, one saved shape in `test/saves/`, one picture, one stage in the
play-through. Each is a model for the next.

## Starting a game from it

1. Copy the repo, and give it a name: `package.json`, `index.html`'s title,
   the storage key in `src/progress.ts`, the ports in `vite.config.ts`,
   `playwright.config.ts` and `.claude/launch.json`.
2. `npm install`, which also points git at the pre-commit hook.
3. `npm run bench -- --update` and `npm run pace:check -- --update` for
   baselines from this machine, and `npm run look:update` for its picture.
   Look at the picture.
4. `npm run check`. Green is the first commit.
5. Fill in the square brackets in `CLAUDE.md`: what the game is, and its
   edge-case checklist in its own terms. The house rules in
   `~/.claude/CLAUDE.md` say what the rest of that file must carry.
6. Replace the stub, one feature at a time, through `/feature`. The first
   thing to replace is `arena.ts`; the last is the sled.

## Layout

    src/game.ts        the game without the picture
    src/main.ts        the page: events into words, the frame drawn
    src/debug.ts       window.game, the test API
    src/invariants.ts  what must always hold
    src/autopilot.ts   the game played by itself, for the gates
    src/arena.ts       content: the floor, the hole, the balls
    src/progress.ts    the save, and where it is kept
    src/physics.ts     the game's side of artshape-physics
    src/scene.ts       the arena as it is drawn
    src/sled.ts        the player's machine
    scripts/           the gates, each with its baseline beside it
    test/              unit tests, and a corpus of every save shape
    smoke/             Playwright: boots, drives, plays through, looks right
