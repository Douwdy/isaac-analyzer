# Dead God Tracker

**v1.2.1** — A web-based save file analyzer for *The Binding of Isaac: Repentance+*.
Track your Dead God progress across all characters, completion marks, achievements, challenges, and collectibles — all processed locally in your browser.

![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
![Status: Active](https://img.shields.io/badge/Status-Active-brightgreen.svg)

**Live:** [douwdy.github.io/isaac-analyzer](https://douwdy.github.io/isaac-analyzer)

---

## Features

- **Dead God progress bar** — tracks your 641 achievements with per-DLC breakdown (Rebirth / Afterbirth / Afterbirth+ / Repentance)
- **Completion marks** — full grid for all 34 characters (normal + tainted), hard mode, all 11 marks
- **Achievements tab** — browse all 641 achievements, filter locked/unlocked, grouped by DLC
- **Challenges tab** — all 45 challenges with completion status
- **Collectibles tab** — see which items you've encountered (save file only)
- **Bosses tab** — boss defeat tracking
- **Steam profile support** — load data directly from a Steam ID (public profiles)
- **Local save file support** — drag & drop your `persistentgamedata` file
- **French / English UI** — toggle in the header
- **100% local** — no data ever leaves your browser

---

## Loading Your Save

### Option A — Steam profile

Enter your Steam ID or profile URL directly in the app. Your profile must be set to **public**.

### Option B — Local save file

Drag and drop (or click to browse) your save file onto the drop zone.

| OS | Path |
|----|------|
| Windows | `C:\Users\<you>\AppData\Roaming\The Binding of Isaac Repentance\` |
| macOS | `~/Library/Application Support/The Binding of Isaac Repentance/` |
| Linux | `~/.local/share/The Binding of Isaac Repentance/` |

Look for files named `persistentgamedata1`, `persistentgamedata2`, or `persistentgamedata3` (one per save slot).

---

## Running Locally

**Requirements:** Node.js 18+, npm

```bash
git clone https://github.com/douwdy/isaac-analyzer.git
cd isaac-analyzer
npm install
npm run dev        # http://localhost:3000
```

```bash
npm run build      # production build → dist/
npm run deploy     # deploy to GitHub Pages
```

---

## Stack

- **React 18** + **Vite 4**
- Single-file architecture (`src/App.jsx`)
- Custom binary parser for Isaac `.dat` save files (`src/parsers/IsaacSavefileParser_v2.js`)
- No external UI libraries

---

## Data Sources

Achievement names, unlock conditions, and completion mark mappings are sourced from the [Binding of Isaac wiki](https://bindingofisaacrebirth.wiki.gg/).

---

## Disclaimer

This project is not affiliated with Edmund McMillen or Nicalis.
*The Binding of Isaac* is a trademark of its respective owners.
