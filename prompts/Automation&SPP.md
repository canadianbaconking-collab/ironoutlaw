# 🤖 Automation & Self-Playtesting Policy (Future)

## Codex Self-Playtesting Goal
When tooling allows, we will use Codex’s self-play / automated playtesting capability to:
- Launch the desktop build (LWJGL3)
- Execute scripted input sequences and basic smoke “runs”
- Detect crashes, softlocks, missing transitions, and regressions
- Auto-propose fixes with minimal diffs

## Scope
- This is not required for v0.1 scaffolding.
- This becomes mandatory starting at “Playable District v0.2+” when loops and transitions stabilize.

## Determinism Requirement
Self-play scripts must be deterministic:
- fixed timestep
- seeded world generation
- recorded input scripts
- golden outputs (score/time/position) with tolerances
