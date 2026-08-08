"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
import { DesktopMonitor } from "./DesktopMonitor";
import { Keyboard } from "./Keyboard";
import { Mouse } from "./Mouse";
import { AIAgentCore, type AgentPhase } from "./AIAgentCore";
import { ActionNode, ConnectionLines } from "./ConnectionLines";
import { ParticleField } from "./ParticleField";

const BG = "#11171b";

function ResponsiveCamera() {
  const { size } = useThree();
  const mobile = size.width < 640;
  return (
    <PerspectiveCamera
      makeDefault
      position={[0, 0.35, mobile ? 5.2 : 4.6]}
      fov={mobile ? 48 : 40}
      near={0.2}
      far={60}
    />
  );
}

function ParallaxRig({
  scrollProgress,
  mouse,
  reducedMotion,
  children,
}: {
  scrollProgress: number;
  mouse: { x: number; y: number };
  reducedMotion: boolean;
  children: React.ReactNode;
}) {
  const group = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!group.current) return;

    // Keep motion gentle so the workstation never clips out of the frustum.
    const parallaxX = reducedMotion
      ? 0
      : THREE.MathUtils.clamp(mouse.x, -1, 1) * 0.08;
    const parallaxY = reducedMotion
      ? 0
      : THREE.MathUtils.clamp(mouse.y, -1, 1) * 0.04;
    const reveal = THREE.MathUtils.clamp(scrollProgress, 0, 1);

    group.current.rotation.y = THREE.MathUtils.lerp(
      group.current.rotation.y,
      parallaxX,
      0.08,
    );
    group.current.rotation.x = THREE.MathUtils.lerp(
      group.current.rotation.x,
      -parallaxY * 0.35,
      0.08,
    );
    group.current.position.y = THREE.MathUtils.lerp(
      group.current.position.y,
      -reveal * 0.08,
      0.08,
    );
    group.current.position.z = THREE.MathUtils.lerp(
      group.current.position.z,
      reveal * 0.12,
      0.08,
    );
    const s = THREE.MathUtils.lerp(
      group.current.scale.x,
      1 - reveal * 0.06,
      0.08,
    );
    group.current.scale.setScalar(s);
  });

  return (
    <group ref={group} position={[0, -0.05, 0]}>
      {children}
    </group>
  );
}

function RevealNode({
  progress,
  threshold,
  children,
  position,
  minScale = 0.82,
}: {
  progress: number;
  threshold: number;
  children: React.ReactNode;
  position: [number, number, number];
  minScale?: number;
}) {
  const group = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!group.current) return;
    const t = THREE.MathUtils.smoothstep(
      (progress - threshold) / 0.2,
      0,
      1,
    );
    const target = minScale + t * (1 - minScale);
    const s = THREE.MathUtils.lerp(group.current.scale.x, target, 0.12);
    group.current.scale.setScalar(s);
    group.current.visible = s > 0.05;
  });

  return (
    <group ref={group} position={position} scale={minScale}>
      {children}
    </group>
  );
}

function Workstation({
  phase,
  hovered,
  demoProgress,
  scrollProgress,
  onHover,
  onClick,
}: {
  phase: AgentPhase;
  hovered: boolean;
  demoProgress: number;
  scrollProgress: number;
  onHover: (v: boolean) => void;
  onClick: () => void;
}) {
  return (
    <group
      onPointerOver={(e) => {
        e.stopPropagation();
        onHover(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        onHover(false);
        document.body.style.cursor = "auto";
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      <DesktopMonitor
        phase={phase}
        hovered={hovered}
        demoProgress={demoProgress}
      />
      <Keyboard />
      <Mouse active={phase === "EXECUTING" || phase === "VERIFYING"} />

      <RevealNode
        progress={Math.max(0.55, scrollProgress)}
        threshold={0}
        position={[1.55, 0.75, 0.45]}
        minScale={0.92}
      >
        <AIAgentCore phase={phase} position={[0, 0, 0]} />
      </RevealNode>

      <ConnectionLines
        active={phase !== "READY" || scrollProgress > 0.12}
        from={[1.55, 0.85, 0.45]}
        to={[0.85, 0.35, 0.15]}
      />

      <RevealNode
        progress={Math.max(scrollProgress, demoProgress)}
        threshold={0.08}
        position={[-1.35, 0.7, 0.35]}
        minScale={0.55}
      >
        <ActionNode position={[0, 0, 0]} pulse={phase === "THINKING"} />
      </RevealNode>
      <RevealNode
        progress={Math.max(scrollProgress, demoProgress)}
        threshold={0.18}
        position={[-1.15, 0.15, 0.55]}
        minScale={0.55}
      >
        <ActionNode
          position={[0, 0, 0]}
          labelColor="#7ddfff"
          pulse={phase === "SCREENSHOT"}
        />
      </RevealNode>
      <RevealNode
        progress={Math.max(scrollProgress, demoProgress)}
        threshold={0.32}
        position={[1.35, -0.05, 0.4]}
        minScale={0.55}
      >
        <ActionNode
          position={[0, 0, 0]}
          labelColor="#ffd166"
          pulse={phase === "EXECUTING"}
        />
      </RevealNode>
      <RevealNode
        progress={Math.max(scrollProgress, demoProgress)}
        threshold={0.48}
        position={[1.45, 0.45, -0.15]}
        minScale={0.55}
      >
        <ActionNode
          position={[0, 0, 0]}
          labelColor="#63f5a4"
          pulse={phase === "COMPLETED"}
        />
      </RevealNode>

      <ParticleField intensity={hovered ? 1.05 : 0.75} />
      <ContactShadows
        position={[0, -1.22, 0]}
        opacity={0.35}
        scale={7}
        blur={2.8}
        far={2.8}
        frames={1}
      />
    </group>
  );
}

export interface PetAIWorldProps {
  phase: AgentPhase;
  demoProgress: number;
  scrollProgress?: number;
  reducedMotion?: boolean;
  onDemoRequest?: () => void;
  className?: string;
  compact?: boolean;
}

export function PetAIWorld({
  phase,
  demoProgress,
  scrollProgress = 0,
  reducedMotion = false,
  onDemoRequest,
  className,
  compact = false,
}: PetAIWorldProps) {
  const [hovered, setHovered] = useState(false);
  const mouseRef = useRef({ x: 0, y: 0 });
  const [mouseState, setMouseState] = useState({ x: 0, y: 0 });
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (reducedMotion) return;
    const onMove = (e: MouseEvent) => {
      mouseRef.current = {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1,
      };
      if (rafRef.current != null) return;
      rafRef.current = window.requestAnimationFrame(() => {
        setMouseState({ ...mouseRef.current });
        rafRef.current = null;
      });
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      if (rafRef.current != null) window.cancelAnimationFrame(rafRef.current);
    };
  }, [reducedMotion]);

  return (
    <div
      className={className}
      style={{ background: BG, borderRadius: compact ? 16 : undefined }}
    >
      <Canvas
        dpr={[1, 1.35]}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: "high-performance",
          stencil: false,
        }}
        style={{ background: BG, width: "100%", height: "100%" }}
        frameloop="always"
        onCreated={({ gl }) => {
          gl.setClearColor(new THREE.Color(BG), 1);
          gl.domElement.style.background = BG;
        }}
      >
        <ResponsiveCamera />
        <color attach="background" args={[BG]} />
        <ambientLight intensity={0.55} />
        <directionalLight
          position={[3.5, 5.5, 2.5]}
          intensity={1.05}
          color="#e8f7ff"
        />
        <directionalLight
          position={[-2.5, 1.8, -1.5]}
          intensity={0.4}
          color="#39d5f2"
        />
        <hemisphereLight
          color="#cfefff"
          groundColor="#11171b"
          intensity={0.35}
        />
        <Suspense fallback={null}>
          <ParallaxRig
            scrollProgress={compact ? 0 : scrollProgress}
            mouse={mouseState}
            reducedMotion={reducedMotion || compact}
          >
            <group scale={compact ? 0.72 : 0.92}>
              <Workstation
                phase={phase}
                hovered={hovered}
                demoProgress={demoProgress}
                scrollProgress={compact ? 1 : scrollProgress}
                onHover={setHovered}
                onClick={() => onDemoRequest?.()}
              />
            </group>
          </ParallaxRig>
        </Suspense>
      </Canvas>
    </div>
  );
}
