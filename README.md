# Linear × Interfere Clone

> A high-fidelity, high-velocity developer platform website that merges the architectural layout, motion polish, and interactive mechanics of [interfere.com](https://interfere.com/) with the design language, copy, and brand assets of [linear.app](https://linear.app/).

Built with **pure, standard web technologies (HTML5, CSS3, JavaScript ES6+)** — completely free of TSX, TypeScript, or node_modules build overhead. Can be run by opening `index.html` directly in any web browser or served via GitHub Pages.

---

## ✨ Features

- **Interfere Layout Architecture & Motion**:
  - Sticky glassmorphic navigation header with backdrop blur and responsive mobile drawer.
  - Hero display typography with radial ambient illumination and gradient text fills.
  - Interactive browser application window chrome (macOS traffic lights, breadcrumb navigation, live multiplayer status indicator).
  - Infinite client logo wall marquee featuring OpenAI, Vercel, Ramp, Cash App, Scale AI, Cursor, Retool, Substack, Raycast, and Brex.
  - 3-column Bento grid ("Purpose-built", "Powered by agents", "Designed for speed").
  - Deep feature split sections with interactive widgets.
  - Security & enterprise grid ("Secure by design. Safe by default.") with SOC 2, SAML SSO, and data residency credentials.
  - The Latest / Changelog cards.
  - Call to action banner with ambient spotlighting.
  - Multi-column footer with live 99.99% system status indicator and theme toggle.

- **Linear Brand Identity & Assets**:
  - Authentic Linear SVG logo mark and geometry.
  - Signature Linear dark palette (`#08090a`, `#0e1015`, `#141721`) with `#5e6ad2` purple/indigo accents.
  - Authentic issue statuses (Backlog, Todo, In Progress, Done) and priorities (Urgent, High, Medium, Low).
  - Real Linear customer feedback copy, GitHub pull request tracking, and AI Agent activity logs.

- **Interactive Capabilities**:
  - **Universal Command Menu (`⌘K` / `Ctrl+K`)**: Instant fuzzy search across actions, navigation, theme toggling, sound effects, and repository links. Full keyboard support (`↑`, `↓`, `Enter`, `Esc`).
  - **Interactive Kanban Board**: Click any issue card to inspect its details, cycle, labels, PR status, and autonomous agent logs in the right-hand drawer.
  - **Status Cycling**: Click the status icon on any issue card to advance its state (`Todo` → `In Progress` → `Done`).
  - **Instant Issue Creator Modal (`C` Shortcut)**: Press `C` to open the quick issue composer and dynamically append new issues to the live board with sound feedback.
  - **Interactive Slack Intake Simulation**: Click `@Linear create issue and assign to me` in the Slack widget to watch a conversation convert into a prioritized engineering ticket in real time.
  - **Linear Agent Console**: Click prompt triggers (`Rank top 3 permissions requests`, `Review mobile triage & PRs`, `Draft offline engine PRD`) to stream simulated agent reasoning output.
  - **Tactile Web Audio Synthesizer**: Subtle clicks and blips for keyboard shortcuts and menu actions.
  - **Interactive Mouse Cursor Glow**: Radial specular highlight that tracks cursor movement across glass cards.
  - **Dark / Light Theme Toggle**: Seamless transition with local storage persistence.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `⌘K` or `Ctrl+K` | Open Universal Command Palette |
| `C` | Create New Issue Modal |
| `?` | Show Command Palette & Shortcuts |
| `Esc` | Close any active modal or menu |
| `↑` / `↓` | Navigate Command Menu items |
| `Enter` | Execute selected command |

---

## 📁 Project Structure

```
linear-interfere/
├── index.html            # Semantic HTML5 layout and component hierarchy
├── css/
│   ├── main.css          # Design tokens, color variables, typography, reset
│   └── components.css    # Header, hero mockup, cards, modals, footer styles
├── js/
│   ├── data.js           # Initial issue data, customers, and command registry
│   ├── command-menu.js   # Command palette search, keyboard navigation, and execution
│   └── app.js            # Board state, modal handlers, Slack demo, and Web Audio
└── README.md             # Documentation and usage guide
```

---

## 🚀 Running Locally

No dependencies or build steps required. Simply clone and open:

```bash
git clone https://github.com/ragazabrian/linear-interfere.git
cd linear-interfere
open index.html
```

Or serve with any static web server:
```bash
python3 -m http.server 8080
# Visit http://localhost:8080
```
