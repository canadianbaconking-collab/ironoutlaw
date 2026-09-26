# The Iron Outlaw

**Clear the path. Save the city.**

The Iron Outlaw is a browser based demolition driving game. Race ahead of an evacuation line, break through barricades, bring down landmarks, and turn the wreckage into new routes. The campaign runs through 12 districts and ends at the Mega Dam.

**[Play the current build](https://the-iron-outlaw.canadianbaconking.chatgpt.site/)** · The hosted build currently has restricted access.

## The game

- **12 campaign districts:** from the Breaker Yard through malls, rail yards, a stadium, a megatower, and the dam.
- **Destruction changes the route:** toppled structures can open crossings and approaches needed for extraction.
- **Different impact requirements:** some targets call for speed, a hydraulic jump, a particular direction, or a power pickup.
- **Progression and replays:** six chassis classes, best scores, timed results, and medals across the campaign.
- **Browser saves:** unlocked districts and settings are stored in this browser. Use **Settings → Erase Save** to start over.

Start with **Deploy** or choose an unlocked district on the **Campaign Map**. Follow the current objective at the top of the playfield, destroy the marked targets, then drive to the extraction marker. The next district unlocks when the current one is cleared. **Replays** lets you revisit completed districts.

### Controls

| Action | Keyboard | Gamepad | Touch |
| --- | --- | --- | --- |
| Accelerate / brake or reverse | `W` / `S` or ↑ / ↓ | Left stick up / down | Enable **Auto-Drive** for Breaker Yard; later districts accelerate automatically and provide **Brake** |
| Steer | `A` / `D` or ← / → | Left stick left / right | ◀ / ▶ |
| Hydraulic jump | `Space` | B / second face button | **Jump** |
| Nitro | `Shift` | A / first face button | **Nitro** |
| Pause / resume | `Esc` | Use the on-screen pause button | On-screen pause button |

The pause menu offers **Resume** and **Return to Map**. The opening Breaker Yard run begins with a short mission briefing. Settings include camera shake, reduced flash, and auto-drive.

## Campaign route

| Region | Districts | Chassis class |
| --- | --- | --- |
| Rust County | Breaker Yard, Split Grid, Timberline Mill | Yardbreaker |
| Commerce Belt | Freight Row, Dead Mall, Concrete Stack | Roadhammer |
| Metro Fringe | The Interchange, Glass Mile, Terminal Zero | Blockbuster |
| Civic Works | Iron Bowl | Colossus |
| Vertical City | Skyhook | Towerkiller |
| Waterworks | Mega Dam | Dam-Breaker |

## Run locally

This repository uses [Next.js](https://nextjs.org/) and [Vinext](https://github.com/cloudflare/vinext) for the Sites build. The project scripts require **Node.js 22.13 or newer** and a **Linux shell** with `bash`, `flock`, `curl`, `sha256sum`, and GNU `timeout`. On Windows, use WSL for these commands.

```bash
git clone https://github.com/canadianbaconking-collab/ironoutlaw.git
cd ironoutlaw
npm run install:ci
npm run dev
```

Open the local address printed by the development server. To check a production build, run `npm test`; this builds the app, validates the deployable artifact, and runs the project tests. `npm run lint` runs ESLint.

The main game flow is in [`app/IronOutlawGame.tsx`](app/IronOutlawGame.tsx). District definitions and objectives are in [`app/campaignLevels.ts`](app/campaignLevels.ts); the opening district and later campaign districts are rendered by [`app/GoldDistrict.tsx`](app/GoldDistrict.tsx) and [`app/CampaignDistrict.tsx`](app/CampaignDistrict.tsx). Art assets are under [`public/art/`](public/art/).

## Playtest status

An assisted browser playtest reached the completion screen in all 12 districts, including the Mega Dam finale. Automated checks found a valid impact approach for all 63 authored objectives, and the production build and 11 tests passed. The assisted run does **not** establish that every full route can be driven continuously by a player without assistance; longer manual driving sessions remain useful feedback.

## Credits

Game direction: Richard + Codex. See the in-game **Credits** screen for the campaign's design foundation.
