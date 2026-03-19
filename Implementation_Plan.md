# Pomodoro Timer — Implementation Plan

## Project Overview

A fully client-side Pomodoro Timer web application built with vanilla HTML, CSS, and JavaScript. No frameworks or build tools required. Designed to be hosted as a static site on Netlify.

---

## What is the Pomodoro Technique?

The Pomodoro Technique is a time-management method developed by Francesco Cirillo in the late 1980s. It uses a timer to break work into focused intervals (traditionally 25 minutes), separated by short breaks. After every four pomodoros, a longer break is taken.

**Cycle:**
1. Work for 25 minutes (Pomodoro)
2. Short break for 5 minutes
3. Repeat steps 1–2 four times
4. Take a long break of 15 minutes
5. Repeat from step 1

---

## Tech Stack

| Layer      | Technology          | Reason                                      |
|------------|---------------------|---------------------------------------------|
| Markup     | HTML5               | Semantic, accessible structure              |
| Styling    | CSS3 (custom props) | Variables for theming, no dependencies      |
| Logic      | Vanilla JavaScript  | Lightweight, no build step required         |
| Fonts      | Google Fonts (Inter)| Clean modern typeface via CDN               |
| Hosting    | Netlify             | Free static hosting with custom domain      |

---

## File Structure

```
pomodoro-timer/
├── index.html            ← App shell, semantic HTML
├── style.css             ← All styles, CSS custom properties for theming
├── script.js             ← All timer logic, DOM manipulation, events
└── Implementation_Plan.md
```

---

## Feature List

### Core Timer
- **Pomodoro mode** — default 25-minute countdown
- **Short Break mode** — default 5-minute countdown
- **Long Break mode** — default 15-minute countdown
- **Start / Pause** — toggles the countdown
- **Reset** — restarts the current interval without changing mode
- **Skip** — ends the current interval and auto-advances to the next session

### Automatic Session Flow
- After a Pomodoro completes → auto-switch to Short Break
- After every 4th Pomodoro → auto-switch to Long Break
- After any break completes → auto-switch back to Pomodoro

### Visual Feedback
- **Circular progress ring** (SVG) shrinks as time runs out
- **Color theme** changes per mode (red / green / blue)
- **Session dots** fill as pomodoros are completed (max 4 in one cycle)
- **Colon blink** animation while timer is running

### Notifications
- **Toast messages** slide up at the bottom for each session transition
- **Web Audio API beep** plays on session completion (no external audio files needed)
- **Page title** updates with live countdown (visible in browser tab)

### Settings Panel
- Adjustable durations for all three modes (validated on apply)
- Settings persist for the current session

### Accessibility & UX
- ARIA roles/labels on tabs and controls
- Keyboard shortcuts: `Space` = start/pause, `R` = reset, `S` = skip
- Responsive layout — works on mobile (≥ 320px) and desktop

---

## Component Breakdown

### `index.html`
- `<header>` — logo and tagline
- `.mode-tabs` — three tab buttons (Pomodoro, Short Break, Long Break)
- `.timer-card` — SVG ring + digit display + session label
- `.controls` — reset, start/pause, skip buttons
- `.session-info` — dot indicators + completed count
- `.settings-panel` — collapsible settings form
- `#toast` — fixed notification element

### `style.css`
- CSS custom properties (`--accent`, `--color-bg`, etc.) power the theming
- `body[data-mode="..."]` selectors swap the accent colour per mode
- SVG `stroke-dasharray` / `stroke-dashoffset` animate the ring
- `@keyframes slideDown` for the settings panel, `blink` for the colon
- Mobile breakpoint at 400 px

### `script.js`
- **State object**: `currentMode`, `secondsLeft`, `totalSeconds`, `isRunning`, `completedCount`
- `startTimer()` / `pauseTimer()` — manage `setInterval`
- `resetTimer()` — clears interval and resets `secondsLeft`
- `skipSession()` → calls `onTimerComplete(skipped=true)`
- `onTimerComplete()` — increments count, decides next mode, fires toast + sound
- `switchMode(mode)` — updates DOM, resets timer, sets `data-mode` on body
- `applySettings()` — validates inputs, updates settings, re-initialises current mode
- `updateDisplay()` — renders `MM:SS` and `stroke-dashoffset`
- `playNotificationSound()` — creates a brief tone via Web Audio API

---

## Deployment on Netlify

### Option A — Drag-and-Drop (Quickest)
1. Go to [netlify.com](https://www.netlify.com) and log in.
2. From the dashboard, click **"Add new site" → "Deploy manually"**.
3. Drag the `pomodoro-timer/` folder into the upload zone.
4. Netlify generates a random subdomain (e.g., `happy-timer-abc123.netlify.app`).

### Option B — Git-based Continuous Deployment
1. Push the project folder to a GitHub (or GitLab) repository.
2. In Netlify: **"Add new site" → "Import an existing project"**.
3. Authorize Netlify to access the repo.
4. Build settings:
   - **Base directory**: *(leave blank or set to `pomodoro-timer/`)*
   - **Build command**: *(leave blank — no build step)*
   - **Publish directory**: `.` or `pomodoro-timer/`
5. Click **"Deploy site"**.

### Custom Domain Setup
1. In Netlify dashboard → **Site settings → Domain management → Add custom domain**.
2. Enter your domain (e.g., `pomodoro.yourdomain.com`).
3. In your domain registrar's DNS settings, add:
   - **CNAME record**: `www` → `<your-netlify-subdomain>.netlify.app`
   - **A record** (apex domain): `75.2.60.5` (Netlify's load balancer IP)
4. Wait for DNS propagation (up to 24 hours).
5. Netlify auto-provisions a free **SSL/TLS certificate** via Let's Encrypt.

---

## Future Enhancements (out of scope for v1)

- Local Storage persistence of completed sessions across page reloads
- Task list integration — attach a task name to each Pomodoro
- Statistics dashboard — daily/weekly completed pomodoros
- Custom notification sounds / browser Push API alerts
- Dark/light mode toggle independent of timer mode

---

## Summary

This project demonstrates a complete, dependency-free web application lifecycle:
- **Design** — dark UI with accent colour theming via CSS variables
- **Build** — three files, no bundler, immediately openable in a browser
- **Deploy** — drag-and-drop or CI/CD on Netlify with optional custom domain

---

## Live Deployment

**Hosted on Netlify:** https://glittering-meringue-6e5797.netlify.app
