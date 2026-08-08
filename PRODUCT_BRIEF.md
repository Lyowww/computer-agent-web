# PetAI Computer Agent — Full Product Brief

> Use this document as the source of truth when writing landing pages, marketing copy, pitch decks, or AI-generated designs. Prefer concrete product facts over generic “AI agent” language.

---

## 1. One-line pitch

**PetAI** lets you control any desktop computer with autonomous AI agents — from your phone or browser — with real-time screen vision, voice commands, and human-in-the-loop safety approvals.

---

## 2. Elevator pitch (short)

PetAI Computer Agent is a remote AI computer-control system. You install a lightweight desktop agent on a Mac, Windows, or Linux machine, link it to your account, then chat (or speak) natural-language instructions from a web dashboard. The AI sees the screen, plans safe mouse/keyboard/app actions, executes them on the real machine, and loops until the task is done — pausing for your approval when something is risky or unclear.

---

## 3. Elevator pitch (longer)

Most “computer use” demos stop at a lab sandbox. PetAI is built as a production-shaped stack: a chat dashboard on your phone, a NestJS backend that orchestrates tasks over WebSockets, a vision AI planner that returns structured actions (not shell scripts), and a secure Electron agent that only runs Zod-validated OS actions — never arbitrary code.

You say: *“Open Chrome and go to youtube.com.”*  
PetAI screenshots the desktop, decides whether Chrome is already open, launches it if needed, clicks the address bar, types the URL, presses Enter, verifies from a new screenshot, and reports back. If the AI needs clarification or the action looks consequential (delete, purchase, password change), it stops and asks you to approve.

Control plane features go beyond chat: live screenshots, front-camera stills, process lists, app launch, lock/unlock, notifications, and voice in → STT → task → optional TTS out — all from one responsive web UI optimized for phone control.

---

## 4. Brand

| Item | Value |
|------|--------|
| **Brand name** | PetAI |
| **Product name** | PetAI Computer Agent |
| **Tagline (current)** | Control Any Desktop Computer with Autonomous AI Agents |
| **Supporting line (current)** | Real-time screen capture, remote process control, voice commands, and human-in-the-loop AI safety approvals — from your phone or browser. |
| **Metadata title** | PetAI Computer Agent |
| **Metadata description** | Remote AI computer-control dashboard |
| **Author / org** | PETAI |
| **License (repos)** | MIT |
| **Stage** | Early access / waitlist + developer login |

### Brand voice for landing pages

- Confident, precise, operator-grade — not fluffy “magic AI.”
- Emphasize **vision + control + safety**, not sci-fi takeover.
- Prefer verbs: install, link, prompt, approve, verify.
- Avoid purple-glow generic AI aesthetics; current product UI leans **deep slate / cyan** (`#090d16` atmosphere, cyan accents), with display font **Fraunces** and body **DM Sans**.

---

## 5. What problem it solves

| Pain | How PetAI helps |
|------|------------------|
| You’re away from your desk but need the machine to do something | Chat or voice from phone; agent acts on the real desktop |
| Remote desktop tools only mirror UI — you still click everything | AI plans and executes multi-step workflows autonomously |
| AI agents that run shell/`eval` feel unsafe | Whitelisted actions only (click, type, hotkey, open app, wait…) |
| Blind automation with no oversight | Human-in-the-loop: `WAITING_FOR_USER` → Approve / Cancel |
| Fragmented tooling (RDP + chat + scripts) | One control plane: chat, screen, camera, processes, lock, voice |

---

## 6. Who it’s for

**Primary**
- Power users who want phone-to-desktop AI control
- Solo builders / founders who leave machines running and need remote tasking
- Developers building or evaluating computer-use agents

**Secondary**
- Small teams that need a supervised remote operator for repetitive desktop workflows
- People who want safer alternatives to “give the model a shell”

**Not (yet) positioned as**
- Fully unsupervised enterprise RPA with compliance certifications
- A consumer “set it and forget it” forever-agent without approvals

---

## 7. Core value propositions

1. **Autonomous desktop execution** — Multi-step mouse, keyboard, and app orchestration without babysitting every click.
2. **Real-time vision** — Screenshots (and front-camera stills) over WebSocket so the agent sees what you see; near-live feedback in the dashboard.
3. **Human-in-the-loop safety** — Security-critical or unclear moves pause for Approve / Reject before irreversible work continues.
4. **System control plane** — Processes, lock/unlock, launch apps, notifications, screen/camera capture from web or mobile.
5. **Voice-native** — Mic → STT → task → AI reply → optional spoken TTS.
6. **Secure by architecture** — Separate device tokens, no arbitrary shell/JS execution, ephemeral screenshots, OS permission gates.

---

## 8. How it works (user journey)

```
1. Install PetAI Agent (Electron tray app) on macOS / Windows / Linux
2. Create account in the web dashboard → Devices → Add device
3. Copy one-time device token → paste into agent Settings (stored in OS keychain)
4. Agent connects over WebSocket (channel: desktop-agent)
5. From phone/browser: chat, voice, or quick actions
6. Backend starts a task → asks agent for screenshot → AI plans actions
7. Agent executes validated actions → new screenshot → loop
8. Task completes, fails, or waits for your approval
```

### Example task: “Open Chrome and go to youtube.com”

1. AI checks if Chrome is visible  
2. `OPEN_APP` if needed  
3. Wait + fresh screenshot  
4. Click address bar  
5. `TYPE_TEXT` (`youtube.com`)  
6. Enter via `HOTKEY` / `KEY_PRESS`  
7. Verify from screenshot → `DONE`

---

## 9. System architecture (full stack)

PetAI is **four cooperating repos**, not a single app:

```
┌─────────────────────┐         ┌──────────────────────────┐
│  computer-agent-web │  REST   │ computer-agent-backend   │
│  Next.js dashboard  │◄───────►│ NestJS orchestrator      │
│  (phone + browser)  │  WS     │ JWT + device tokens      │
└─────────────────────┘         │ PostgreSQL + Redis       │
                                └────────────┬─────────────┘
                                             │ HTTP /v1/plan
                                             ▼
                                ┌──────────────────────────┐
                                │  ai-computer-agent       │
                                │  Vision AI planner       │
                                │  (OpenRouter / Gemini)   │
                                └──────────────────────────┘
                                             ▲
                     WS actions / screenshots│
                                             │
                                ┌──────────────────────────┐
                                │ computer-desktop-agent   │
                                │ Electron + nut.js        │
                                │ Real mouse/keyboard/UI   │
                                └──────────────────────────┘

Shared contracts: @petai/computer-agent-shared (types, Zod, WS events, DTOs)
```

### Responsibility split (important for accurate copy)

| Component | Does | Does **not** |
|-----------|------|----------------|
| **Web** | UI, auth session, chat, voice capture, live status, screenshots viewer | Run AI models or move the mouse |
| **Backend** | Auth, devices, task lifecycle, WS relay, rate limits, call AI planner | Execute desktop actions itself |
| **AI brain** | Turn instruction + screenshot → structured next actions | Render UI or control OS |
| **Desktop agent** | Capture screen/camera, click/type/open apps, lock/unlock | Run arbitrary shell or accept raw code from the model |

---

## 10. Component deep-dives

### A. Web dashboard (`computer-agent-web`)

**Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind 4 · TanStack Query · Zustand · Zod · Socket.IO client · Vitest

**Routes / surfaces**

| Route | Purpose |
|-------|---------|
| `/` | Marketing landing + waitlist CTA |
| `/login` | Sign in / register |
| `/dashboard` | Connected devices overview, live screen/camera, lock controls |
| `/devices` | Register / revoke / regenerate device tokens |
| `/chat` | ChatGPT-style command UI + task progress + approvals |
| `/apps` | App-related device controls |
| `/processes` | Remote process inspection |
| `/settings` | Account + connection info |

**Product features in the UI**
- Device cards: name, OS, online/offline, last seen, active task
- Realtime WS events: `DEVICE_STATUS`, `SCREEN_RESULT`, `TASK_UPDATE`, `AI_RESPONSE`, `TASK_COMPLETED`, `TASK_FAILED`, `ERROR`, plus notify / processes / camera / lock flows
- Task progress phases: Thinking → Screenshot → Executing → Verifying → Completed / Failed (also waiting for user)
- Screenshot viewer: fit, zoom, timestamp, device name, fullscreen
- Voice capture → backend STT → text → task → optional TTS (“Speak replies”)
- Confirmation dialog when status is `WAITING_FOR_USER`
- Responsive layout optimized for **phone control**
- Waitlist modal (early access email capture)

**Auth model (web)**
1. `POST /api/auth/login` or `/register`  
2. Store `accessToken` in `sessionStorage`  
3. REST: `Authorization: Bearer <token>`  
4. Socket.IO `/ws` with `query.channel=web-client` + `auth.token`

---

### B. Backend (`computer-agent-backend`)

**Stack:** NestJS · Socket.IO · PostgreSQL · Prisma · Redis · JWT · Zod · Docker Compose

**Role:** Secure gateway and task orchestrator between web clients, desktop agents, and the AI planner.

**Key capabilities**
- JWT user authentication
- Secure device provisioning (one-time `deviceToken`; hashed at rest; never re-exposed casually to the browser after creation)
- Dual WebSocket channels: `web-client` and `desktop-agent`
- Task orchestration with full lifecycle
- Screenshot relay via ephemeral Redis buffer (not permanent Postgres storage by default)
- AI adapter: `POST {AI_SERVICE_URL}/v1/plan` with screenshot + history
- Action history for debugging
- Rate limiting, ownership checks, nonce replay protection, connection timeouts, Helmet

**Task lifecycle**

```
CREATED → RUNNING → WAITING_FOR_SCREEN → (AI) → WAITING_FOR_ACTION
  → … → COMPLETED | FAILED | CANCELLED
Also: WAITING_FOR_USER (needs clarification / approval)
```

**Hard security rule for marketing accuracy**  
The backend **never** executes computer actions and **never** accepts arbitrary shell/exec commands from clients or AI responses.

---

### C. AI brain (`ai-computer-agent` / `@petai/ai-computer-agent`)

**Stack:** Node.js 20+ · TypeScript · OpenAI-compatible provider abstraction · OpenRouter + Google Gemini · Zod · Vitest

**Role:** Vision planner / orchestrator. Input = user instruction + screenshot (+ task memory). Output = validated structured actions.

**Loop**
```
instruction → analyze screenshot → plan action(s)
→ desktop executes → new screenshot → analyze result
→ next action → until DONE / ASK_USER / FAILED
```

**Safety layer (sell this)**
- Out-of-bounds coordinate rejection
- Shell/script-like `TYPE_TEXT` blocked
- Blocked apps (e.g. Terminal)
- Dangerous hotkeys blocked
- Forbidden params (`command`, `script`, `eval`, …)
- Consequential instructions (delete, purchase, password change, shutdown…) → ask user
- Loop protection: max iterations, identical-action retries, invalid model output → fail/ask

**Providers:** OpenRouter (e.g. GPT-4o) or Gemini — interchangeable via `AiProvider` interface.

---

### D. Desktop agent (`computer-desktop-agent`)

**Stack:** Electron · TypeScript · `@nut-tree-fork/nut-js` · screenshot-desktop · keytar · Socket.IO · Zod · electron-builder (`.dmg` / `.exe` / `.AppImage`)

**Role:** Runs on the user’s machine as a system-tray app. Connects with the **device token** (not the website JWT). Executes only validated local OS actions.

**Supported actions**
| Action | Meaning |
|--------|---------|
| `SCREENSHOT` | Capture screen once (on request — never continuous stream by default) |
| `CLICK` / `DOUBLE_CLICK` | Click at coordinates |
| `MOVE_MOUSE` | Move cursor |
| `TYPE_TEXT` | Type text |
| `KEY_PRESS` / `HOTKEY` | Keys and chords |
| `OPEN_APP` | Launch allowlisted app |
| `WAIT` | Wait (capped) |
| `LOCK_SCREEN` / `UNLOCK_SCREEN` | Engage lock UI; optional Keychain-stored password to unlock |

**Tray experience:** Connected status · Take Screenshot · Pause Agent · Settings · Reconnect · Quit

**OS permissions (macOS):** Accessibility + Screen Recording (+ Camera if front-camera stills requested). Agent never bypasses OS permissions.

**Will never**
- Execute arbitrary shell
- Execute arbitrary JS from the backend
- Bypass OS auth without user-configured unlock password
- Store tokens/passwords in plaintext when keychain is available
- Log passwords, tokens, or screenshot image bytes

---

### E. Shared protocol (`computer-agent-shared`)

Shared TypeScript types, Zod schemas, WebSocket event names, action definitions, REST/AI DTOs, task & device status enums. Keeps web / backend / agent / AI brain speaking one protocol.

---

## 11. Feature inventory (for landing sections)

### Chat & autonomy
- Natural-language tasking (ChatGPT-style UI)
- Multi-step autonomous loops with iteration caps
- Live task progress UI
- Cancel running tasks
- AI responses with planned action lists
- Ask-user / approval flow

### Vision & media
- On-demand screen capture with quality control
- Screenshot viewer (zoom, fullscreen, metadata)
- Front-camera still capture (dashboard media tab)
- Ephemeral screenshot handling (privacy-friendly default)

### Voice
- Microphone recording in browser
- Speech-to-text via backend
- Optional text-to-speech for AI replies (“Speak replies”)

### Device & system control
- Multi-device dashboard (online count, running tasks)
- Register / revoke / regenerate device tokens
- Process listing
- App controls / open apps
- Lock & unlock machine
- Desktop notifications from dashboard
- Pause agent locally from tray

### Safety & trust
- Human-in-the-loop approvals
- Whitelisted actions only
- Separate user JWT vs device token
- One-time token provisioning + keychain storage
- Rate limits & ownership checks
- No continuous screen streaming by default (capture on request)

---

## 12. Differentiation (vs common alternatives)

| Alternative | PetAI difference |
|-------------|------------------|
| Classic remote desktop (RDP / AnyDesk) | You still drive every click; PetAI *operates* the machine with AI |
| Browser-only computer-use demos | Real installed agent on Mac/Win/Linux with OS permissions |
| Shell-based AI agents | Structured UI actions only — no free-form exec |
| Unsupervised RPA bots | Explicit pause for user on risky / unclear steps |
| Single-repo prototypes | Split architecture: UI ≠ brain ≠ executor ≠ gateway |

---

## 13. Suggested landing-page narrative

### Hero
- **Brand first:** PetAI (hero-level typographic signal)
- **Headline:** Control Any Desktop Computer with Autonomous AI Agents  
  *(or variants below)*
- **Subcopy:** Real-time screen capture, remote process control, voice commands, and human-in-the-loop AI safety approvals — from your phone or browser.
- **CTAs:** Get Early Access / Join Waitlist · Developer Login

### Feature pillars (4)
1. Autonomous Execution  
2. Real-time Stream & Vision  
3. Human-in-the-Loop  
4. System Controls  

### How it works (3 steps)
1. Install PetAI Agent  
2. Link your device token  
3. Prompt or quick-act  

### Proof / trust section ideas
- Whitelisted actions diagram (click · type · hotkey · open app — not shell)
- “Approve before irreversible” mock of confirmation dialog
- Architecture sketch: Phone → Cloud → Desktop
- Platforms: macOS · Windows · Linux
- Privacy: screenshots on request, ephemeral buffer

### Closing CTA
- Early access waitlist
- Secondary: existing operators sign in

---

## 14. Headline / copy alternatives

**Headlines**
- Control any desktop with an AI that can see and act
- Your computer. Your phone. An agent that clicks for you.
- Remote computer use — with a kill switch and a conscience
- Chat to your desktop. Watch it work. Approve when it matters.
- Vision-driven desktop agents you can supervise from anywhere

**Supporting sentences**
- Install a tray agent once. Then run multi-step desktop workflows from a chat box on your phone.
- PetAI doesn’t give the model a shell. It gives it eyes, a mouse, and a human approval gate.
- Screenshots in. Structured actions out. Real OS work done safely in between.
- Built as a full stack: dashboard, orchestrator, vision planner, and secure Electron executor.

**CTA labels**
- Get Early Access
- Join Waitlist
- Install the Agent
- Open Dashboard
- Developer Sign In

**Social proof style lines (aspirational — only use if true later)**
- Early access opening soon
- Built for operators who leave machines running
- Designed for phone-first remote control

---

## 15. Use-case scenarios (story fuel)

1. **Away from desk** — “Download the invoice from my email and save it to Desktop.”  
2. **Prep before a meeting** — “Open Notion, Chrome with the deck, and Slack.”  
3. **Quick lock** — Lock the machine from your phone when you walk away.  
4. **Voice hands-free** — Speak a task while looking at another screen; optional spoken reply.  
5. **Supervised automation** — Agent proposes a purchase-related flow → you Approve / Cancel.  
6. **Status check** — Pull a screenshot or camera still to confirm what’s on the machine.  
7. **Process hygiene** — Inspect running processes remotely and act from chat/quick tools.

---

## 16. Technical keywords (for SEO / AI prompts)

`computer use agent`, `remote AI desktop control`, `vision agent`, `desktop automation`, `human-in-the-loop AI`, `Electron agent`, `Socket.IO remote control`, `screen capture agent`, `voice to desktop actions`, `secure computer-use`, `PetAI`, `phone to PC AI`, `macOS Windows Linux agent`

---

## 17. Design direction notes (for AI landing generators)

**Do**
- One strong first-viewport composition: brand + one headline + one support line + CTA group + one dominant visual idea
- Atmosphere: deep navy/slate gradients, subtle grid, cyan accent energy (matches current product)
- Expressive typography (Fraunces-like display + clean geometric body)
- Show the product: chat + live screen + tray agent — real visual anchors
- Motion: status pulse, progress phases, subtle screen refresh — presence, not noise

**Don’t**
- Generic purple-on-white AI SaaS look
- Flat white dashboard-in-a-hero with floating badges everywhere
- Overclaim continuous 60fps screen streaming if product is on-request capture
- Promise arbitrary code execution or unsupervised dangerous actions
- Drown hero in stats strips, feature pill clusters, or multi-card walls

---

## 18. Honest constraints (keep landing credible)

- Screenshots are **requested**, not a always-on video stream (marketing can say “near real-time vision / live feedback,” not “Netflix your desktop”).
- Desktop agent requires OS permission grants (Accessibility / Screen Recording).
- Unlock uses a **user-configured** password in Keychain — it does not crack login.
- AI can ask the user when stuck or when the instruction is consequential.
- Early access / waitlist positioning; developer login exists for operators.
- Web app talks to backend; it does not embed the model or automation runtime.

---

## 19. Repo map (for engineers reading this brief)

| Repo | Package / name | Role |
|------|----------------|------|
| `computer-agent-web` | `computer-agent-web` | Next.js dashboard + landing |
| `computer-agent-backend` | `computer-agent-backend` | NestJS API + WS gateway |
| `computer-desktop-agent` | `computer-desktop-agent` | Electron executor |
| `ai-computer-agent` | `@petai/ai-computer-agent` | Vision AI planner |
| `computer-agent-shared` | `@petai/computer-agent-shared` | Shared protocol contracts |

---

## 20. Paste-ready prompt for another AI

Copy below when generating a landing page:

```
You are designing a marketing landing page for PetAI Computer Agent.

Product: PetAI lets people control any Mac/Windows/Linux desktop with autonomous AI agents from phone or browser. A lightweight Electron tray agent captures the screen on request, a vision AI plans structured mouse/keyboard/app actions (never arbitrary shell), a NestJS backend orchestrates tasks over WebSockets, and a Next.js dashboard provides chat, voice (STT/TTS), live screenshots/camera stills, process/app/lock controls, and human-in-the-loop Approve/Cancel when the agent needs confirmation.

Brand: PetAI. Tone: precise, operator-grade, trustworthy. Visual: deep slate/navy atmosphere, cyan accents, expressive display typography — not generic purple AI SaaS.

Hero must lead with the brand name PetAI, then one headline, one short supporting sentence, and CTAs: “Get Early Access” + “Developer Login”.

Key pillars: Autonomous Execution · Real-time Vision · Human-in-the-Loop · System Controls.

How it works: 1) Install agent 2) Link device token 3) Prompt or quick-act.

Do not overclaim continuous video streaming, code execution, or unsupervised dangerous actions. Emphasize whitelisted actions + approval gates + phone-first remote control.

Use this brief’s feature inventory and use cases for section content.
```

---

*Generated from the PetAI Computer Agent codebase (web, backend, desktop agent, AI planner, shared protocol). Update this brief when product positioning or capabilities change.*
