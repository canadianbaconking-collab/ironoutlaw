# PROMPT 01 — THE IRON OUTLAW — CORE ENGINE + PLAYABLE SKELETON (v0.1)
**Purpose:** Generate the first “real” playable build of The Iron Outlaw inside an existing gdx-liftoff LibGDX multi-platform project (Android + LWJGL3 desktop).  
**Target repo:** This repo already builds and runs `:lwjgl3:run` successfully.  
**Language:** **Java** in `core/src/main/java` (project currently generated in Java; do NOT introduce Kotlin yet unless explicitly instructed later).  
**Critical:** DO NOT modify Android or LWJGL3 launchers beyond what is necessary to instantiate the core game class. Keep platform glue minimal.

---

## 0) CANON (DRIFT GUARD) — READ THIS FIRST
You are implementing the game “The Iron Outlaw”, an arcade escalation destruction game.

**Primary fantasy:** escalating power fantasy (spectacle > mastery).  
**Tone:** grounded spectacle (serious presentation, exaggerated directional physics outcomes; not silly/parody).  
**Runs:** early ~3 min, later ~5 min.  
**Structure:** sequential district arenas, linear campaign progression.  
**Signature mechanics (future):** Nitro Jump, Vector Shear, Timber Collapse megastructures, finale mega dam breach.  
**Onboarding:** cold open into immediate control; toasts teach concepts in order without pausing gameplay.  
**Overworld:** stylized planet level select with oversized vehicle driving between districts.  
**World gen:** reference-driven plausibility (zoning logic), not random scatter.  
**Determinism:** fixed timestep + seedable generation. A deterministic contract exists in `config/simulation-contract.json`.

**NON-GOALS (explicit):**
- No streaming open world.
- No vehicle swapping system.
- No roguelite/permanent build trees.
- No multiplayer.
- No “real-world Killdozer reenactment”; only abstract folklore easter eggs later.

**IMPORTANT libGDX constraint:** If the main `Game` overrides `render()`, it must call `super.render()` or the current Screen will not render. Prefer not overriding render in the Game at all unless necessary. :contentReference[oaicite:1]{index=1}

---

## 1) CURRENT REPO CONTEXT (ASSUME)
- Root has `android/`, `core/`, `lwjgl3/`.
- `core` currently contains:
  - `com.frostedlogic.ironoutlaw.IronOutlawGame` (entrypoint used by launchers)
  - `com.frostedlogic.ironoutlaw.FirstScreen` (placeholder screen)
- A `GameRoot` class may exist (created earlier) to centralize routing. If it exists, use it. If not, create it.

**Goal:** Replace the placeholder experience with a minimal playable “Iron Outlaw v0.1” skeleton while keeping code architecture clean for future mega prompts.

---

## 2) DELIVERABLES (WHAT YOU MUST PRODUCE)
### A) A runnable “Phase 1” playable loop (Desktop and Android compatible)
- Launch → immediately into controllable gameplay (cold open).
- A controllable placeholder “vehicle” (simple box/capsule model) with:
  - acceleration
  - steering
  - brake/drag
  - a **Nitro** button (boost) and **Jump** button (impulse)
- A chase camera that feels like “Voxel Velocity style”:
  - behind vehicle
  - slightly above
  - smooth follow with damping
- Smashable objects (placeholder “buildings”) to run into:
  - spawned in simple arrangements
  - collisions increase score
  - objects react visually (at least disappear, optionally “break” into a few chunks)
- Toast tutorial system:
  - non-blocking, small overlay toasts
  - appears in a proper sequence based on time + triggers
- End-of-level flow:
  - run timer counts down (e.g. 60–90 seconds for v0.1 test)
  - show “Results” overlay with score
  - then drop player to a simple “Overworld” / “Level Select” stub screen

### B) Clean code architecture scaffolding (critical for future prompts)
Create these packages in `core/src/main/java/com/frostedlogic/ironoutlaw/`:
- `gameplay/` (run loop, routing, session)
- `vehicle/` (vehicle controller)
- `world/` (simple level/district generation)
- `destruction/` (simple smashable entity logic)
- `ui/` (toasts + HUD + results overlay)
- `audio/` (stubs only, no real music yet)

### C) Deterministic simulation scaffolding
Implement a fixed timestep update loop inside the Screen (NOT inside platform launcher):
- fixed dt = 1/60
- accumulate real delta
- cap accumulator to avoid spiral-of-death (e.g. max 0.25s)
- consume ticks deterministically
- render every frame

Do NOT rely on variable-step for simulation.
(Interpolation can be stubbed; deterministic tick is the priority.)

### D) Minimal asset policy
- Use simple shapes / placeholder textures (generated Pixmap is ok)
- Avoid adding heavy binary assets now
- No external downloads
- Keep assets optional and light

### E) Tests (minimal but real)
Add at least 2 deterministic tests (JUnit) in `core`:
1) Given seed X, generated level spawns the same number of smashables with same positions.
2) Given a fixed input script for N ticks, vehicle ends at deterministic position within a small epsilon.

If the project currently lacks JUnit setup, add the minimal Gradle/JUnit configuration in `core/build.gradle` ONLY.

---

## 3) SYSTEM RESPONSIBILITIES

### 3.1 Game routing
Preferred architecture:
- `IronOutlawGame` should stay a thin identity class.
- `GameRoot extends Game` owns screen routing.
- Screens:
  - `BootScreen` (very short; can immediately route to DistrictRunScreen)
  - `DistrictRunScreen` (the playable run)
  - `ResultsScreen` (summary)
  - `OverworldScreen` (planet stub + level buttons)

Use libGDX Screen lifecycle correctly (create/show/render/hide/dispose). :contentReference[oaicite:2]{index=2}

### 3.2 District run
- Contains:
  - `RunConfig` (durationSeconds, seed, difficultyTier)
  - `RunState` (timeRemaining, score, combo maybe stub)
  - `InputState` (steer, throttle, nitro, jump)
- End condition:
  - timeRemaining <= 0 → transition to ResultsScreen

### 3.3 World generation (v0.1)
- Use a deterministic seed.
- Generate a simple road-ish corridor and place smashables in clusters aligned to implied road edges.
- DO NOT do random scatter.
- Implement a tiny “zoning” concept:
  - Residential: small blocks near start
  - Commercial: slightly larger blocks later in run (for v0.1, just bigger boxes)

### 3.4 Smashables / destruction (v0.1)
- Start simple:
  - Each smashable has `health` and `mass`.
  - On collision above threshold, decrement health.
  - When health <= 0: mark destroyed → remove from world; spawn 3–8 debris cubes (optional).
- Score increases when damage dealt and when destroyed.

### 3.5 UI / Toasts
- HUD shows:
  - time remaining
  - score
  - small nitro meter (can be a simple cooldown bar)
- Toasts:
  - Appear bottom-center or top-center
  - Sequence (v0.1):
    1) “SMASH TO MOVE”
    2) “SPEED = POWER”
    3) “AIR BREAKS HARDER”
    4) “CHAIN THE DAMAGE”
  - Trigger logic:
    - #1 after 1.5s
    - #2 after score > small threshold OR after 8s
    - #3 after player jumps once OR after 20s
    - #4 after player destroys 3 smashables OR after 35s

### 3.6 Audio (stub)
- Provide `AudioBus` class with methods (no real assets yet):
  - `playImpact(float intensity)`
  - `playExplosion(float size)`
  - `setEngineRpm(float rpm)`
- Implement methods as no-ops or simple generated tone later; for now, keep as stubs.

---

## 4) PERFORMANCE BUDGETS (V0.1)
- Max smashables per district: 200
- Max debris live at once: 400 (if you implement debris)
- Avoid per-frame allocations
- Use pooled objects where reasonable (but keep it simple)

---

## 5) FILES TO CREATE / MODIFY (STRICT)
### Create (core):
- `com.frostedlogic.ironoutlaw.gameplay.GameRoot`
- `com.frostedlogic.ironoutlaw.gameplay.BootScreen`
- `com.frostedlogic.ironoutlaw.gameplay.DistrictRunScreen`
- `com.frostedlogic.ironoutlaw.gameplay.ResultsScreen`
- `com.frostedlogic.ironoutlaw.gameplay.OverworldScreen`
- `com.frostedlogic.ironoutlaw.gameplay.RunConfig`
- `com.frostedlogic.ironoutlaw.gameplay.RunState`
- `com.frostedlogic.ironoutlaw.gameplay.FixedStepLoop` (helper)
- `com.frostedlogic.ironoutlaw.vehicle.VehicleController`
- `com.frostedlogic.ironoutlaw.vehicle.VehicleModel` (state + params)
- `com.frostedlogic.ironoutlaw.world.DistrictGenerator`
- `com.frostedlogic.ironoutlaw.world.DistrictLayout`
- `com.frostedlogic.ironoutlaw.destruction.Smashable`
- `com.frostedlogic.ironoutlaw.destruction.DestructionSystem`
- `com.frostedlogic.ironoutlaw.ui.HudRenderer`
- `com.frostedlogic.ironoutlaw.ui.ToastQueue`
- `com.frostedlogic.ironoutlaw.ui.ResultsRenderer`
- `com.frostedlogic.ironoutlaw.audio.AudioBus`

### Modify:
- `com.frostedlogic.ironoutlaw.IronOutlawGame` → become thin identity class extending/using `GameRoot`
- Update/remove the placeholder `FirstScreen` only if needed; otherwise leave but stop using it.

### Gradle:
- Add JUnit to `core/build.gradle` if missing.

**Do NOT:**
- Change `android/` launcher code except to instantiate the right class if needed.
- Change `lwjgl3/` launcher code except to instantiate the right class if needed.

---

## 6) IMPLEMENTATION DETAIL REQUIREMENTS
### Rendering
Use simple LibGDX 3D rendering:
- `ModelBatch`
- `Environment` with basic lighting
- A simple `Model` for vehicle (box)
- Simple models for smashables (boxes of varying sizes)

Clear screen correctly (color + depth). :contentReference[oaicite:3]{index=3}

### Input
Desktop:
- WASD/arrow steer
- Space = jump
- Shift = nitro

Android:
- On-screen UI buttons for nitro/jump (simple rectangles)
- Touch left side for steering or use two buttons (L/R)
Keep it minimal and functional.

### Determinism
- Use `MathUtils.random` ONLY with a set seed, or use your own `RandomXS128` seeded instance.
- Ensure the generator uses ONLY that seeded RNG.
- Fixed timestep update ensures determinism across different frame rates.

---

## 7) TESTS (MANDATORY)
Add tests in `core/src/test/java/...`:

### Test 1: District generation determinism
- Generate layout with seed 12345 twice
- Assert same smashable count
- Assert positions match exactly (or within epsilon)

### Test 2: Vehicle integration determinism
- Create a vehicle, apply a scripted input (throttle=1 for 120 ticks, steer=0.2 for 60 ticks, jump at tick 30, nitro ticks 70–90)
- Simulate with fixed dt
- Assert final position is expected within epsilon

---

## 8) OUTPUT FORMAT (WHAT YOU RETURN)
When you finish, output:

1) A short summary of what you built.
2) A file list of what you added/modified.
3) Exact commands to run:
   - desktop: `.\gradlew lwjgl3:run`
   - tests: `.\gradlew core:test`
4) Any known limitations.

---

## 9) SELF-CHECK BEFORE FINAL OUTPUT (MANDATORY)
Before returning:
- Confirm game launches into DistrictRunScreen with immediate control (no menus first).
- Confirm toast sequence appears.
- Confirm score increases on collisions.
- Confirm timer ends and results show.
- Confirm OverworldScreen stub appears after results.
- Confirm `core:test` passes deterministically.
- Confirm no platform-specific code leaked into core beyond input handling abstractions.

END.
