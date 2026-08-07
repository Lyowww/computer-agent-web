# PetAI Computer Agent — Web Dashboard

Next.js frontend for the remote AI computer-control system. This app talks to the NestJS backend over REST and Socket.IO. It does **not** run desktop automation or AI model logic.

## Stack

- Next.js (App Router) + React + TypeScript
- Tailwind CSS
- TanStack React Query
- Zod
- Socket.IO client
- Web Audio / MediaRecorder (voice)
- Vitest + Testing Library

## Pages

| Route | Purpose |
|-------|---------|
| `/login` | Sign in / register |
| `/dashboard` | Connected devices overview |
| `/devices` | Register / revoke devices |
| `/chat` | ChatGPT-style command UI |
| `/settings` | Account + connection info |

## Features

- Device cards with name, OS, online/offline, last seen, active task
- Realtime WebSocket events: `DEVICE_STATUS`, `SCREEN_RESULT`, `TASK_UPDATE`, `AI_RESPONSE`, `TASK_COMPLETED`, `TASK_FAILED`, `ERROR`
- Task progress UI (Thinking → Screenshot → Executing → Verifying → Completed/Failed)
- Screenshot viewer with fit, zoom, timestamp, device name, fullscreen
- Voice capture → backend STT → text → task → optional TTS playback
- Confirmation dialog when task status is `WAITING_FOR_USER`
- Responsive layout optimized for phone control

## Setup

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) if you run the web app on an alternate port (backend defaults to `3000`):

```bash
npm run dev -- -p 3001
```

### Environment

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_WS_URL=http://localhost:3000/ws
```

Only public backend URLs belong in the frontend. Never put AI API keys, JWT secrets, or device tokens in source.

## Auth

1. `POST /api/auth/login` or `/api/auth/register`
2. Store returned `accessToken` in `sessionStorage`
3. Send `Authorization: Bearer <token>` on REST calls
4. Connect Socket.IO to `/ws` with `query.channel=web-client` and `auth.token`

## Chat / tasks

- Send commands with Socket.IO `USER_MESSAGE` (`content`, `deviceId`, optional `taskId`)
- Cancel with `POST /api/tasks/:id/cancel`
- Request screenshots with `CAPTURE_SCREEN`
- When `TASK_UPDATE` has `status: WAITING_FOR_USER`, the UI shows Approve / Cancel

## Voice pipeline

```
Microphone → MediaRecorder → POST /api/voice/stt → text
→ USER_MESSAGE / task → AI_RESPONSE → optional POST /api/voice/tts → browser audio
```

STT/TTS are backend-owned. Enable “Speak replies” in Chat to request TTS.

## Scripts

```bash
npm run dev       # development server
npm run build     # production build
npm run start     # start production server
npm run lint      # ESLint
npm test          # Vitest unit/UI tests
```

## Project structure

```
src/
  app/                 # routes
  components/          # UI (chat, devices, screenshot, voice, layout)
  lib/api/             # REST clients (separated from UI)
  lib/ws/              # Socket.IO client
  lib/voice/           # microphone + playback helpers
  lib/validators/      # Zod schemas
  providers/           # React Query + WS wiring
  stores/              # auth + chat client state
  __tests__/           # Vitest suites
```

## Security notes

- No hardcoded secrets
- Device tokens shown once at creation (copy into the desktop agent)
- Session JWT cleared on logout / 401
- Dangerous actions surface an explicit confirmation dialog

## Demo account (backend seed)

If the backend seed is enabled: `demo@example.com` / `password123`
