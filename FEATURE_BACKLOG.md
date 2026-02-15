# FEATURE_BACKLOG.md

## Scope
This backlog tracks shippable game features for Space Blaster.
All items should remain compatible with running via direct `index.html` open (`file://`), with no server/build tooling.

## Status Legend
- `Backlog`: Not started.
- `Planned`: Selected for near-term implementation.
- `In Progress`: Actively being implemented.
- `Done`: Implemented and smoke tested.

## Priority Legend
- `P0`: Highest value / unblocker / polish gap.
- `P1`: Core feature expansion.
- `P2`: Nice-to-have additions.

## Backlog
| ID | Area | Feature | Priority | Effort | Status | Primary Files |
|---|---|---|---|---|---|---|
| GME-001 | Game | Pause flow cleanup | P0 | S | Done | `js/game/core.js`, `js/game/ui.js`, `index.html` |
| GME-002 | Game | Level progression system | P1 | M | Backlog | `js/game/core.js`, `js/game/enemies.js`, `js/game/ui.js` |
| PWR-001 | Powerups | Shield pickup | P1 | M | Backlog | `js/game/player.js`, `js/game/projectiles.js`, `js/game/enemies.js` |
| PWR-002 | Powerups | Big laser weapon mode | P1 | M | Backlog | `js/game/player.js`, `js/game/projectiles.js`, `js/core/constants.js` |
| PWR-003 | Powerups | Auto-gun pickup | P1 | S | Backlog | `js/game/player.js`, `js/game/core.js` |
| VFX-001 | Graphics | Ship propulsion thruster effect | P0 | S | Done | `js/game/player.js` |
| VFX-002 | Graphics | Foreground speed particles | P1 | S | Backlog | `js/game/stars.js`, `js/game/core.js` |
| AUD-001 | Audio | Audio mix cleanup | P0 | S | Backlog | `js/sound.js`, `index.html` |
| AUD-002 | Audio | UI click/confirm sounds | P0 | S | Backlog | `js/sound.js`, `js/game/ui.js`, `media/` |
| SYS-001 | Systems | High score persistence (localStorage) | P0 | S | Backlog | `js/game/core.js`, `js/game/ui.js` |
| ENM-001 | Enemies | New enemy behavior: dive bomber | P1 | M | Backlog | `js/game/enemies.js`, `js/core/constants.js` |
| UX-001 | UX | Settings panel (master/music/sfx volume) | P2 | M | Backlog | `index.html`, `js/sound.js`, `js/game/ui.js` |

## Acceptance Criteria
### GME-001 Pause flow cleanup
- Pressing browser blur/focus never duplicates loops or breaks state.
- Pause screen always renders when paused.
- Resume returns to exactly previous game state.

### GME-002 Level progression system
- Difficulty scales by level (spawn cadence, wave composition, or enemy type).
- Current level is visible in HUD.
- Level progression resets correctly on replay.

### PWR-001 Shield pickup
- Shield can absorb at least one incoming hit.
- Visual indicator shows active shield state.
- Shield expires on hit or timer, and cannot soft-lock state.

### PWR-002 Big laser weapon mode
- Temporary weapon mode widens projectile hit area or damage.
- Mode has clear start/end behavior and visual distinction.
- Reverts to standard weapon behavior cleanly.

### PWR-003 Auto-gun pickup
- Pickup enables rapid/continuous firing for a limited duration.
- Rate-of-fire boost respects existing shot cooldown logic.
- Auto-gun state resets correctly on death/replay.

### VFX-001 Ship propulsion thruster effect
- Player ship shows thrust effect while moving.
- Effect does not appear while idle.
- Effect has negligible impact on frame pacing.

### VFX-002 Foreground speed particles
- Additional moving particles create forward-motion feel.
- Particle density/speed scales subtly with gameplay speed.
- Particles reset/recycle without leaks.

### AUD-001 Audio mix cleanup
- Background music and SFX levels are balanced.
- No clipping or unexpectedly loud effects.
- Audio still works across replay cycles.

### AUD-002 UI click/confirm sounds
- Enter/Start/Replay buttons each produce a UI effect.
- UI effects do not interrupt gameplay SFX.
- Missing asset fallback does not crash gameplay.

### SYS-001 High score persistence (localStorage)
- Highest score persists across page refresh/reopen.
- HUD or game-over screen shows current run and best score.
- Handles absent/invalid localStorage values safely.

### ENM-001 New enemy behavior: dive bomber
- New enemy movement pattern is visibly distinct.
- Behavior integrates with spawn waves and shooting rules.
- Enemy can be defeated and scored without regression.

### UX-001 Settings panel (master/music/sfx volume)
- Player can adjust volume levels in-game.
- Settings persist for current session (optional persistence for later).
- Controls remain usable on replay and after pause/resume.

## Implementation Notes
### 2026-02-15
- `GME-001` completed.
- Pause/resume handlers are now instance-bound to avoid `this` context bugs.
- Main loop control is now explicit (`startLoop()` / `stopLoop()`) to avoid duplicate loops.
- Repeated blur/focus no longer corrupts `lastState`.
- Pause now always renders the pause screen immediately.
- `VFX-001` completed.
- Added a movement-driven thruster flame rendered behind the player ship.
- Thruster stays hidden while idle and uses a cheap pulse animation to avoid frame impact.
- Manual browser smoke test should still be run before release.

## Suggested Implementation Order (Remaining)
1. `AUD-001` Audio mix cleanup
2. `AUD-002` UI click/confirm sounds
3. `SYS-001` High score persistence
4. `PWR-001` Shield pickup
5. `PWR-003` Auto-gun pickup
6. `PWR-002` Big laser mode
7. `GME-002` Level progression
8. `ENM-001` Dive bomber enemy
9. `VFX-002` Foreground speed particles
10. `UX-001` Settings panel
