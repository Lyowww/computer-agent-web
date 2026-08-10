"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Menu, X } from "lucide-react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import "./cube-landing.css";

const MOBILE_MQ = "(max-width: 56.25em)";

function Starfield({ reduced }: { reduced: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const target = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });
  const starsRef = useRef<
    { x: number; y: number; z: number; r: number; a: number }[]
  >([]);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.min(140, Math.floor((window.innerWidth * window.innerHeight) / 9000));
      starsRef.current = Array.from({ length: count }, () => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        z: 0.25 + Math.random() * 0.75,
        r: 0.5 + Math.random() * 1.6,
        a: 0.25 + Math.random() * 0.65,
      }));
    };

    const onPointer = (e: PointerEvent) => {
      const nx = (e.clientX / window.innerWidth - 0.5) * 2;
      const ny = (e.clientY / window.innerHeight - 0.5) * 2;
      target.current = { x: nx, y: ny };
    };

    const draw = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      current.current.x += (target.current.x - current.current.x) * 0.06;
      current.current.y += (target.current.y - current.current.y) * 0.06;
      const px = current.current.x * 28;
      const py = current.current.y * 20;

      ctx.clearRect(0, 0, w, h);
      for (const s of starsRef.current) {
        const x = s.x + px * s.z;
        const y = s.y + py * s.z;
        ctx.beginPath();
        ctx.fillStyle = `rgba(57, 213, 242, ${s.a})`;
        ctx.arc(x, y, s.r * s.z, 0, Math.PI * 2);
        ctx.fill();
        if (s.r > 1.2) {
          ctx.beginPath();
          ctx.fillStyle = `rgba(232, 238, 242, ${s.a * 0.45})`;
          ctx.arc(x, y, s.r * s.z * 0.35, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      if (!reduced) {
        rafRef.current = window.requestAnimationFrame(draw);
      }
    };

    resize();
    draw();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointer, { passive: true });
    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointer);
      if (rafRef.current != null) window.cancelAnimationFrame(rafRef.current);
    };
  }, [reduced]);

  return <canvas ref={canvasRef} className="cube-starfield" aria-hidden />;
}

const FACE_NAMES = [
  "ORIGIN",
  "OPERATE",
  "VISION",
  "ACTION",
  "SAFETY",
  "CONNECT",
] as const;

const FACE_META = [
  { face: "top", label: "TOP" },
  { face: "front", label: "FRONT" },
  { face: "right", label: "RIGHT" },
  { face: "back", label: "BACK" },
  { face: "left", label: "LEFT" },
  { face: "bottom", label: "BOTTOM" },
] as const;

/** Continuous walk around the cube — matches the CodePen rotation path. */
const ROTATIONS = [
  { x: 90, y: 0 },
  { x: 0, y: 0 },
  { x: 0, y: -90 },
  { x: 0, y: -180 },
  { x: 0, y: -270 },
  { x: -90, y: -270 },
] as const;

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function FaceShell({
  title,
  status,
  children,
}: {
  title: string;
  status: string;
  children: ReactNode;
}) {
  return (
    <div className="cube-face-inner">
      <div className="face-chrome">
        <span>{title}</span>
        <span className="face-status">
          <span className="face-dot" />
          {status}
        </span>
      </div>
      <div className="face-ui">{children}</div>
    </div>
  );
}

function TextCard({
  align = "left",
  tag,
  title,
  body,
  stats,
  actions,
  titleAs = "h2",
}: {
  align?: "left" | "right" | "center";
  tag: string;
  title: ReactNode;
  body: string;
  stats?: { num: string; label: string }[];
  actions?: ReactNode;
  titleAs?: "h1" | "h2";
}) {
  const TitleTag = titleAs;
  return (
    <article
      className={`text-card${align === "right" ? " right" : ""}${align === "center" ? " center" : ""}`}
    >
      <div className="text-card-glow" aria-hidden />
      <div className="text-card-rail" aria-hidden />
      <div className="text-card-frame" aria-hidden>
        <span className="tc-corner tc-tl" />
        <span className="tc-corner tc-tr" />
        <span className="tc-corner tc-bl" />
        <span className="tc-corner tc-br" />
      </div>
      <div className="text-card-body">
        <p className="cube-tag cube-reveal" data-reveal>
          <span className="cube-tag-dot" aria-hidden />
          {tag}
        </p>
        <TitleTag className="cube-reveal" data-reveal>
          {title}
        </TitleTag>
        <p className="body-text cube-reveal" data-reveal>
          {body}
        </p>
        {stats ? (
          <div className="stat-row cube-reveal" data-reveal>
            {stats.map((s, i) => (
              <div key={`${s.num}-${s.label}-${i}`} className="stat">
                <div className="stat-num">{s.num}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        ) : null}
        {actions ? (
          <div className="cta-row cube-reveal" data-reveal>
            {actions}
          </div>
        ) : null}
      </div>
    </article>
  );
}

function FaceOrigin() {
  return (
    <FaceShell title="PetAI Agent" status="Online">
      <div className="face-panel face-panel--origin">
        <div className="face-hero-line">
          <span className="face-kicker">Device bridge</span>
          <strong>MacBook Pro</strong>
        </div>
        <div className="face-chips">
          <span className="face-chip face-chip--live">Live</span>
          <span className="face-chip">WebSocket</span>
          <span className="face-chip">Secure</span>
        </div>
        <ul className="face-list">
          <li>
            <span className="ok">●</span>
            <div>
              <strong>macOS connected</strong>
              <em>agent v1.4 · latency 42ms</em>
            </div>
          </li>
          <li>
            <span className="ok">●</span>
            <div>
              <strong>Screen capture</strong>
              <em>on request · not streaming</em>
            </div>
          </li>
          <li>
            <span className="ok">●</span>
            <div>
              <strong>Input control</strong>
              <em>mouse · keyboard · apps</em>
            </div>
          </li>
        </ul>
        <div className="face-meter">
          <div className="face-meter-label">
            <span>Session health</span>
            <span>98%</span>
          </div>
          <div className="face-bar">
            <i />
          </div>
        </div>
        <div className="face-grid face-grid--3">
          <div className="face-tile">
            <b>macOS</b>
            <span>Ready</span>
          </div>
          <div className="face-tile">
            <b>Windows</b>
            <span>Ready</span>
          </div>
          <div className="face-tile">
            <b>Linux</b>
            <span>Ready</span>
          </div>
        </div>
      </div>
    </FaceShell>
  );
}

function FaceOperate() {
  return (
    <FaceShell title="Device control" status="Executing">
      <div className="face-panel face-panel--operate">
        <div className="face-hero-line">
          <span className="face-kicker">Live task</span>
          <strong>Open YouTube in Chrome</strong>
        </div>
        <ol className="face-steps">
          <li className="done">
            <span>01</span>
            <div>
              <strong>Open Chrome</strong>
              <em>App launched</em>
            </div>
          </li>
          <li className="done">
            <span>02</span>
            <div>
              <strong>Focus address bar</strong>
              <em>Click · x412 y88</em>
            </div>
          </li>
          <li className="active">
            <span>03</span>
            <div>
              <strong>
                Type <span className="ok">youtube.com</span>
              </strong>
              <em>Typing…</em>
            </div>
          </li>
          <li>
            <span>04</span>
            <div>
              <strong>Press Enter</strong>
              <em>Pending</em>
            </div>
          </li>
          <li>
            <span>05</span>
            <div>
              <strong>Verify result</strong>
              <em>Screenshot check</em>
            </div>
          </li>
        </ol>
      </div>
    </FaceShell>
  );
}

function FaceVision() {
  return (
    <FaceShell title="Vision layer" status="Scan">
      <div className="face-panel face-panel--vision">
        <div className="face-hero-line">
          <span className="face-kicker">Screenshot</span>
          <strong>1920 × 1080 · quality 80</strong>
        </div>
        <div className="face-screen">
          <div className="face-screen-bar">
            <i />
            <i />
            <i />
            <span>Chrome — New Tab</span>
          </div>
          <div className="face-screen-body">
            <div className="face-box face-box--a">Chrome</div>
            <div className="face-box face-box--b">Address bar</div>
            <div className="face-box face-box--c">Search field</div>
            <div className="face-screen-grid" />
          </div>
        </div>
        <div className="face-meta-row">
          <span>3 elements</span>
          <span>CV · planner</span>
          <span>REQ capture</span>
        </div>
      </div>
    </FaceShell>
  );
}

function FaceAction() {
  return (
    <FaceShell title="Action protocol" status="Plan">
      <div className="face-panel face-panel--action">
        <div className="face-hero-line">
          <span className="face-kicker">Zod-validated</span>
          <strong>Whitelisted device actions</strong>
        </div>
        <ul className="face-protocol">
          <li>
            <code>OPEN_APP</code>
            <span>Chrome</span>
          </li>
          <li>
            <code>CLICK</code>
            <span>{"{x:412, y:88}"}</span>
          </li>
          <li>
            <code>TYPE_TEXT</code>
            <span>youtube.com</span>
          </li>
          <li>
            <code>HOTKEY</code>
            <span>meta + l</span>
          </li>
          <li>
            <code>WAIT</code>
            <span>800ms</span>
          </li>
          <li>
            <code>SCREENSHOT</code>
            <span>verify UI</span>
          </li>
        </ul>
        <div className="face-banner">
          <span className="ok">✓</span> No shell · No eval · No arbitrary code
        </div>
      </div>
    </FaceShell>
  );
}

function FaceSafety() {
  return (
    <FaceShell title="Approval gate" status="Paused">
      <div className="face-panel face-panel--safety">
        <div className="face-alert">
          <span className="face-kicker">Human in the loop</span>
          <strong>Action requires approval</strong>
          <p>
            Purchase item · external consequences detected. PetAI paused before
            continuing.
          </p>
        </div>
        <div className="face-risk">
          <div>
            <em>Risk</em>
            <strong>High</strong>
          </div>
          <div>
            <em>Type</em>
            <strong>Payment</strong>
          </div>
          <div>
            <em>Device</em>
            <strong>Mac</strong>
          </div>
        </div>
        <div className="face-approve">
          <button type="button">Cancel</button>
          <button type="button" className="primary">
            Approve
          </button>
        </div>
      </div>
    </FaceShell>
  );
}

function FaceConnect() {
  return (
    <FaceShell title="Device link" status="Ready">
      <div className="face-panel face-panel--connect">
        <div className="face-hero-line">
          <span className="face-kicker">Get started</span>
          <strong>Link your computer in 3 steps</strong>
        </div>
        <ol className="face-connect-steps">
          <li>
            <span>01</span>
            <div>
              <strong>Install agent</strong>
              <em>Lightweight native runtime</em>
            </div>
          </li>
          <li>
            <span>02</span>
            <div>
              <strong>Paste device token</strong>
              <em>One-time secure pairing</em>
            </div>
          </li>
          <li>
            <span>03</span>
            <div>
              <strong>Prompt from phone</strong>
              <em>Agent sees, acts, verifies</em>
            </div>
          </li>
        </ol>
        <div className="face-grid face-grid--3">
          <div className="face-tile">
            <b>macOS</b>
            <span>Supported</span>
          </div>
          <div className="face-tile">
            <b>Windows</b>
            <span>Supported</span>
          </div>
          <div className="face-tile">
            <b>Linux</b>
            <span>Supported</span>
          </div>
        </div>
      </div>
    </FaceShell>
  );
}

const FACE_VIEWS = [
  FaceOrigin,
  FaceOperate,
  FaceVision,
  FaceAction,
  FaceSafety,
  FaceConnect,
] as const;

const FEATURES = [
  {
    icon: "01",
    title: "Remote desktop control",
    body: "Drive mouse, keyboard, and apps on your real computer from your phone — not a sandbox.",
    chips: ["Mouse", "Keyboard", "Apps"],
  },
  {
    icon: "02",
    title: "On-demand vision",
    body: "Screenshots only when needed. The planner finds UI targets before every action.",
    chips: ["REQ capture", "CV", "Locate"],
  },
  {
    icon: "03",
    title: "Whitelisted actions",
    body: "Zod-validated desktop primitives only. No shell, no eval, no arbitrary code paths.",
    chips: ["OPEN_APP", "CLICK", "TYPE"],
  },
  {
    icon: "04",
    title: "Human-in-the-loop",
    body: "Purchases, deletes, and credential changes pause until you approve on your phone.",
    chips: ["HITL", "Pause", "You decide"],
  },
  {
    icon: "05",
    title: "Cross-platform agent",
    body: "One lightweight runtime for macOS, Windows, and Linux with native permissions.",
    chips: ["macOS", "Windows", "Linux"],
  },
  {
    icon: "06",
    title: "Secure device link",
    body: "One-time tokens, encrypted transport, and session health you can see live.",
    chips: ["Token", "WebSocket", "Keychain"],
  },
] as const;

const USE_CASES = [
  {
    label: "Away from desk",
    title: "Finish work remotely",
    prompt: "Download the invoice from my email and save it to Desktop.",
    result: "Mail → PDF → Desktop",
  },
  {
    label: "Before a meeting",
    title: "Prep in one prompt",
    prompt: "Open Notion, Chrome with the deck, and Slack.",
    result: "Notion · Chrome · Slack",
  },
  {
    label: "Quick lock",
    title: "Secure the machine",
    prompt: "Lock my computer.",
    result: "Screen locked",
  },
  {
    label: "Remote status",
    title: "See what's open",
    prompt: "Show me what's currently on my computer.",
    result: "Requested screenshot",
  },
] as const;

const FLOW = [
  {
    n: "01",
    title: "Install the agent",
    body: "Lightweight native runtime with OS permission prompts — tray-ready in minutes.",
  },
  {
    n: "02",
    title: "Link your device",
    body: "Create a device, paste the one-time token, and store credentials in the OS keychain.",
  },
  {
    n: "03",
    title: "Prompt from anywhere",
    body: "Chat from your phone. PetAI sees, plans, acts, verifies — and asks when it matters.",
  },
] as const;

export function CubeLanding({
  onWaitlist,
}: {
  onWaitlist: () => void;
}) {
  const reduced = usePrefersReducedMotion();
  const cubeRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const pctRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLDivElement>(null);
  const captionNumRef = useRef<HTMLDivElement>(null);
  const captionNameRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);
  const [activeFace, setActiveFace] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const rafRef = useRef<number | null>(null);
  const lastFaceRef = useRef(-1);
  const isMobileRef = useRef(false);

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_MQ);
    const sync = () => {
      isMobileRef.current = mq.matches;
      setIsMobile(mq.matches);
      if (mq.matches && cubeRef.current) {
        cubeRef.current.style.transform = "";
      }
    };
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const applyScroll = useCallback(() => {
    const scrollEl = scrollRef.current;
    const cubeTravel = scrollEl
      ? Math.max(1, scrollEl.offsetHeight - window.innerHeight)
      : Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const progress = Math.min(1, Math.max(0, window.scrollY / cubeTravel));
    const faceProgress = progress * (FACE_NAMES.length - 1);
    const i0 = Math.min(
      FACE_NAMES.length - 2,
      Math.max(0, Math.floor(faceProgress)),
    );
    const i1 = Math.min(FACE_NAMES.length - 1, i0 + 1);
    const t = faceProgress - i0;
    const r0 = ROTATIONS[i0];
    const r1 = ROTATIONS[i1];
    const x = lerp(r0.x, r1.x, t);
    const y = lerp(r0.y, r1.y, t);

    // Desktop: scroll-driven cube. Mobile: CSS orbit (always multi-face).
    if (!reduced && cubeRef.current && !isMobileRef.current) {
      cubeRef.current.style.transform = `rotateX(${x}deg) rotateY(${y}deg)`;
    }

    const pastCube = window.scrollY > cubeTravel + window.innerHeight * 0.12;
    const scene = cubeRef.current?.parentElement;
    if (scene) {
      scene.style.opacity = pastCube ? "0" : "1";
      scene.style.visibility = pastCube ? "hidden" : "visible";
    }
    document.querySelectorAll<HTMLElement>(
      ".cube-hud, .cube-caption, .cube-strip:not(.cube-strip--mobile), .mobile-face-dock",
    ).forEach((el) => {
      el.style.opacity = pastCube ? "0" : "1";
      el.style.pointerEvents = pastCube ? "none" : "";
    });

    const pct = Math.round(progress * 100);
    if (fillRef.current) fillRef.current.style.width = `${pct}%`;
    if (pctRef.current) {
      pctRef.current.textContent = `${String(pct).padStart(3, "0")}%`;
    }

    const faceIndex = Math.min(
      FACE_NAMES.length - 1,
      Math.round(faceProgress),
    );
    if (faceIndex !== lastFaceRef.current) {
      lastFaceRef.current = faceIndex;
      setActiveFace(faceIndex);
      const name = FACE_NAMES[faceIndex];
      if (nameRef.current) nameRef.current.textContent = name;
      if (captionNumRef.current) {
        captionNumRef.current.textContent = `0${faceIndex + 1} / 06`;
      }
      if (captionNameRef.current) {
        captionNameRef.current.textContent = name;
      }
    }
  }, [reduced]);

  useEffect(() => {
    const onScroll = () => {
      if (rafRef.current != null) return;
      rafRef.current = window.requestAnimationFrame(() => {
        applyScroll();
        rafRef.current = null;
      });
    };
    applyScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (rafRef.current != null) window.cancelAnimationFrame(rafRef.current);
    };
  }, [applyScroll]);

  useEffect(() => {
    const nodes = document.querySelectorAll<HTMLElement>("[data-reveal]");
    if (reduced) {
      nodes.forEach((n) => n.classList.add("is-visible"));
      return;
    }

    nodes.forEach((n) => {
      const rect = n.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.85 && rect.bottom > 0) {
        n.classList.add("is-visible");
      }
    });

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
          }
        });
      },
      { threshold: 0.28, rootMargin: "0px 0px -6% 0px" },
    );
    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, [reduced]);

  const jumpTo = (index: number) => {
    const el = sectionRefs.current[index];
    if (!el) return;
    el.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  };

  return (
    <div className={`cube-landing${isMobile ? " cube-landing--mobile" : ""}`}>
      <Starfield reduced={reduced} />

      <div className="cube-topnav">
        <a href="#s0" className="cube-brand">
          PETAI
        </a>
      </div>

      <div className="cube-top-actions" aria-label="Sections">
        <a className="cube-nav-link" href="#s1">
          Product
        </a>
        <a className="cube-nav-link" href="#s2">
          Vision
        </a>
        <a className="cube-nav-link" href="#s4">
          Safety
        </a>
        <a className="cube-nav-link" href="#features">
          Features
        </a>
        <a className="cube-nav-link" href="#s5">
          Access
        </a>
      </div>

      <div className="cube-top-cta">
        <Link href="/login/" className="cube-btn cube-btn-ghost cube-btn-login-desktop">
          Login
        </Link>
        <button
          type="button"
          className="cube-btn cube-btn-access"
          onClick={onWaitlist}
        >
          Early Access
        </button>
        <button
          type="button"
          className="cube-burger"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {menuOpen ? (
        <div className="cube-mobile-menu" role="dialog" aria-label="Menu">
          <button
            type="button"
            className="cube-mobile-menu-backdrop"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
          />
          <div className="cube-mobile-menu-panel">
            <p className="cube-mobile-menu-title">Menu</p>
            <nav className="cube-mobile-menu-nav">
              {(
                [
                  ["#s0", "Home"],
                  ["#s1", "Product"],
                  ["#s2", "Vision"],
                  ["#s4", "Safety"],
                  ["#features", "Features"],
                  ["#s5", "Access"],
                ] as const
              ).map(([href, label]) => (
                <a
                  key={href}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                >
                  {label}
                </a>
              ))}
            </nav>
            <div className="cube-mobile-menu-actions">
              <Link
                href="/login/"
                className="cube-btn cube-btn-ghost"
                onClick={() => setMenuOpen(false)}
              >
                Login
              </Link>
              <button
                type="button"
                className="cube-btn"
                onClick={() => {
                  setMenuOpen(false);
                  onWaitlist();
                }}
              >
                Early Access
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="cube-hud" aria-hidden>
        <div id="hud_pct" ref={pctRef}>
          000%
        </div>
        <div className="progress-bar">
          <div className="progress-fill" ref={fillRef} />
        </div>
        <div className="scene-label" ref={nameRef}>
          ORIGIN
        </div>
      </div>

      <nav className="cube-strip" aria-label="Faces">
        {FACE_NAMES.map((name, i) => (
          <button
            key={name}
            type="button"
            className={`cube-dot${activeFace === i ? " active" : ""}`}
            aria-label={`Go to ${name}`}
            aria-current={activeFace === i ? "true" : undefined}
            onClick={() => jumpTo(i)}
          />
        ))}
      </nav>

      <div className="mobile-face-dock">
        <div className="mobile-face-dock-inner">
          <span className="mobile-face-dock-num" aria-hidden>
            {String(activeFace + 1).padStart(2, "0")}
            <em>/06</em>
          </span>
          <div className="mobile-face-dock-mid">
            <span className="mobile-face-dock-name" aria-hidden>
              {FACE_NAMES[activeFace]}
            </span>
            <nav className="cube-strip cube-strip--mobile" aria-label="Faces mobile">
              {FACE_NAMES.map((name, i) => (
                <button
                  key={`m-${name}`}
                  type="button"
                  className={`cube-dot${activeFace === i ? " active" : ""}`}
                  aria-label={`Go to ${name}`}
                  aria-current={activeFace === i ? "true" : undefined}
                  onClick={() => jumpTo(i)}
                />
              ))}
            </nav>
          </div>
          <span className="mobile-face-dock-hint" aria-hidden>
            Scroll
          </span>
        </div>
      </div>

      <div className="cube-caption" aria-hidden>
        <div className="cube-caption-num" ref={captionNumRef}>
          01 / 06
        </div>
        <div className="cube-caption-name" ref={captionNameRef}>
          ORIGIN
        </div>
      </div>

      <div className="cube-scene" aria-hidden>
        <div
          className={`cube${isMobile && !reduced ? " cube--orbit" : ""}`}
          ref={cubeRef}
        >
          {FACE_META.map((meta, i) => {
            const FaceView = FACE_VIEWS[i];
            return (
              <div
                key={meta.face}
                className="cube-face"
                data-face={meta.face}
                data-i={i}
              >
                <span className="cube-face-ph">{FACE_NAMES[i]}</span>
                <FaceView />
              </div>
            );
          })}
        </div>
      </div>

      <div className="cube-scroll" ref={scrollRef}>
        <section
          id="s0"
          className="cube-section"
          ref={(el) => {
            sectionRefs.current[0] = el;
          }}
        >
          <TextCard
            titleAs="h1"
            tag="PetAI Agent"
            title={
              <>
                Control any
                <br />
                <span className="title-accent">device</span>
              </>
            }
            body="Your computer. Your phone. An agent that can see, act, verify, and ask when it matters."
            stats={[
              { num: "3", label: "Platforms" },
              { num: "HITL", label: "Safety" },
            ]}
            actions={
              <>
                <button type="button" className="cube-btn" onClick={onWaitlist}>
                  Get Early Access
                </button>
                <Link href="/login/" className="cube-btn cube-btn-ghost">
                  Developer Login
                </Link>
              </>
            }
          />
        </section>

        <section
          id="s1"
          className="cube-section"
          data-align="right"
          ref={(el) => {
            sectionRefs.current[1] = el;
          }}
        >
          <TextCard
            align="right"
            tag="Operate"
            title={
              <>
                AI that
                <br />
                <span className="title-accent">operates</span>
              </>
            }
            body="Not just answers — structured mouse, keyboard, and app actions on the real desktop. Watch it open Chrome, type a URL, and verify the result."
            stats={[
              { num: "CLICK", label: "Pointer" },
              { num: "TYPE", label: "Keyboard" },
            ]}
          />
        </section>

        <section
          id="s2"
          className="cube-section"
          ref={(el) => {
            sectionRefs.current[2] = el;
          }}
        >
          <TextCard
            tag="Vision"
            title={
              <>
                It sees what
                <br />
                your computer
                <br />
                <span className="title-accent">sees</span>
              </>
            }
            body="Screenshots are requested when needed — not a continuous stream — then the vision planner locates UI elements before acting."
            stats={[
              { num: "REQ", label: "Capture" },
              { num: "CV", label: "Detect" },
            ]}
          />
        </section>

        <section
          id="s3"
          className="cube-section"
          data-align="right"
          ref={(el) => {
            sectionRefs.current[3] = el;
          }}
        >
          <TextCard
            align="right"
            tag="Execution"
            title={
              <>
                Give the
                <br />
                <span className="title-accent">outcome</span>.
                <br />
                Keep the clicks.
              </>
            }
            body="PROMPT → VISION → PLAN → ACTION → SCREENSHOT → VERIFY. The agent returns Zod-validated desktop actions — never shell or eval."
            stats={[
              { num: "✓", label: "Whitelisted" },
              { num: "✕", label: "No shell" },
            ]}
          />
        </section>

        <section
          id="s4"
          className="cube-section"
          ref={(el) => {
            sectionRefs.current[4] = el;
          }}
        >
          <TextCard
            tag="Safety"
            title={
              <>
                Powerful enough
                <br />
                to ask
                <br />
                <span className="title-accent">first</span>
              </>
            }
            body="When an action looks consequential — purchases, deletes, credential changes — PetAI pauses and waits for your approval."
            stats={[
              { num: "PAUSE", label: "Gate" },
              { num: "YOU", label: "Decide" },
            ]}
          />
        </section>

        <section
          id="s5"
          className="cube-section"
          data-align="center"
          ref={(el) => {
            sectionRefs.current[5] = el;
          }}
        >
          <TextCard
            align="center"
            tag="Get started"
            title={
              <>
                Your computer
                <br />
                is already
                <br />
                <span className="title-accent">there</span>
              </>
            }
            body="Install the lightweight agent on macOS, Windows, or Linux. Link a device token. Prompt from your phone."
            actions={
              <>
                <button type="button" className="cube-btn" onClick={onWaitlist}>
                  Get Early Access
                </button>
                <Link href="/login/" className="cube-btn cube-btn-ghost">
                  Developer Login
                </Link>
              </>
            }
          />
        </section>
      </div>

      <div className="cube-beyond" id="features">
        <div className="cube-beyond-inner">
          <header className="cube-beyond-head">
            <p className="cube-beyond-kicker">
              <span className="cube-tag-dot" aria-hidden />
              New capabilities
            </p>
            <h2>
              Built for real desktops.
              <br />
              <span className="title-accent">Not demos.</span>
            </h2>
            <p>
              Every feature is designed around seeing the UI, acting with
              structure, and pausing when consequences matter.
            </p>
          </header>

          <div className="feature-grid">
            {FEATURES.map((f) => (
              <article key={f.title} className="feature-card">
                <div className="feature-icon" aria-hidden>
                  {f.icon}
                </div>
                <h3>{f.title}</h3>
                <p>{f.body}</p>
                <div className="feature-chip-row">
                  {f.chips.map((c) => (
                    <span key={c}>{c}</span>
                  ))}
                </div>
              </article>
            ))}
          </div>

          <section className="usecase-band" aria-labelledby="usecases-title">
            <header className="cube-beyond-head">
              <p className="cube-beyond-kicker">
                <span className="cube-tag-dot" aria-hidden />
                Use cases
              </p>
              <h2 id="usecases-title">
                Real work.
                <br />
                <span className="title-accent">Real desktop.</span>
              </h2>
              <p>
                Prompt from your phone. PetAI operates the machine that is
                already on your desk.
              </p>
            </header>
            <div className="usecase-grid">
              {USE_CASES.map((u) => (
                <article key={u.title} className="usecase-card">
                  <span className="uc-label">{u.label}</span>
                  <h3>{u.title}</h3>
                  <p className="usecase-prompt">{u.prompt}</p>
                  <span className="usecase-result">{u.result}</span>
                </article>
              ))}
            </div>
          </section>

          <section className="flow-band" aria-labelledby="flow-title">
            <header className="cube-beyond-head">
              <p className="cube-beyond-kicker">
                <span className="cube-tag-dot" aria-hidden />
                How it works
              </p>
              <h2 id="flow-title">
                Install. Link.
                <br />
                <span className="title-accent">Prompt.</span>
              </h2>
              <p>Three steps from zero to a living device bridge.</p>
            </header>
            <div className="flow-steps">
              {FLOW.map((step) => (
                <article key={step.n} className="flow-step">
                  <div className="flow-n">{step.n}</div>
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>
                </article>
              ))}
            </div>
          </section>

          <div className="final-cta-band">
            <h2>
              Your computer is already
              <br />
              <span className="title-accent">there</span>
            </h2>
            <p>
              Join early access and be first to link a device when slots open.
            </p>
            <div className="cta-row">
              <button type="button" className="cube-btn" onClick={onWaitlist}>
                Get Early Access
              </button>
              <Link href="/login/" className="cube-btn cube-btn-ghost">
                Developer Login
              </Link>
            </div>
            <div className="platform-row" aria-label="Supported platforms">
              <span>macOS</span>
              <span>Windows</span>
              <span>Linux</span>
            </div>
          </div>
        </div>
      </div>

      <footer className="cube-footer">
        <span>© 2026 PETAI · Device control for humans</span>
        <span>
          <Link href="/login/">Login</Link>
          {" · "}
          macOS · Windows · Linux
        </span>
      </footer>
    </div>
  );
}
