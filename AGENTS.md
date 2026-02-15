# AGENTS.md

## Purpose
Guidance for coding agents working in this repository.

Primary goal: keep the game playable by opening `index.html` directly in a browser (`file://`), with no local server or build step.

## Project Shape
- Static web game with plain script files.
- Assets are local: `images/*.png`, `media/*.ogg`, `media/*.mp3`.
- No package manager, bundler, or test runner is configured.

## Hard Constraints
- Keep runtime compatible with direct `index.html` open.
- Do not introduce `import`/`export` modules unless you also add a fully compatible non-server loading strategy.
- Keep all asset paths relative (for example `images/foo.png`, `media/bar.ogg`).
- Preserve script dependency order in `index.html`.

## Script Load Order Contract
Current composition order in `index.html`:
1. `js/core/namespace.js`
2. `js/core/constants.js`
3. `js/keys.js`
4. `js/sound.js`
5. `js/game/core.js`
6. `js/game/ui.js`
7. `js/game/entity.js`
8. `js/game/player.js`
9. `js/game/projectiles.js`
10. `js/game/enemies.js`
11. `js/game/stars.js`
12. `js/main.js`

If adding a new game subsystem file, load it after `js/game/core.js` and before `js/main.js`.

## Architecture Contract
- Global namespace root: `window.SpaceBlaster`.
- Shared constants live in `js/core/constants.js` under `SpaceBlaster.constants`.
- `Game` class is defined in `js/game/core.js`.
- Subsystems extend `Game.prototype` via `Object.assign(...)` in separate files.
- `js/main.js` is the composition root and bootstraps `new window.SpaceBlaster.Game()`.

Preferred subsystem file pattern:
```js
'use strict'

;(function registerX(ns) {
  Object.assign(ns.Game.prototype, {
    // methods
  })
})(window.SpaceBlaster)
```

## Gameplay Parity Contract
Preserve update order in `Game.update()`:
1. spawn timer/waves
2. `updateStars()`
3. `playerControls()`
4. `updatePlayer()`
5. `updateEnemies()`
6. `updateProjectiles()`

Preserve draw order in `Game.draw()`:
1. clear/fill background
2. `drawStars()`
3. `drawProjectiles()`
4. `drawEnemies()`
5. `drawPlayer()`
6. `drawHUD()`

Do not reorder these unless the request explicitly asks for gameplay changes.

## UI and State Contracts
- Game states: `TITLE`, `MENU`, `PLAYING`, `PAUSED`, `GAME_OVER`.
- Buttons used by ID: `enterbutton`, `playbutton`, `replaybutton`.
- Background audio element ID: `bgAudio`.

Keep these IDs stable unless HTML and JS are updated together.

## Editing Guidelines
- Put shared enums/config in `js/core/constants.js`.
- Put keyboard/audio engine code in `js/keys.js` and `js/sound.js`.
- Put entity-independent mechanics in dedicated `js/game/*.js` subsystem files.
- Keep changes mechanical during refactors first; behavior tuning second.
- Keep existing style conventions per file (some files use semicolons, some do not).

## Manual Smoke Test (Required After Gameplay/Refactor Changes)
1. Open `index.html` directly in browser.
2. Click `Enter`, then `Start`.
3. Verify movement with arrow keys and WASD.
4. Verify shooting with Space.
5. Verify enemies spawn and fire.
6. Switch tab/window and return; verify pause/resume behavior.
7. Lose all lives; verify game over and `Play Again` flow.
8. Confirm images and sounds load (no broken asset paths).

## Known Repo Notes
- `FEATURE_BACKLOG.md` tracks gameplay ideas, priorities, and acceptance criteria.
- There is no automated CI/test suite, so manual verification is the release gate.
