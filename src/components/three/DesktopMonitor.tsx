"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { AgentPhase } from "./AIAgentCore";

function RoundedPanel({
  args,
  position,
  color,
}: {
  args: [number, number, number];
  position?: [number, number, number];
  color: string;
}) {
  return (
    <mesh position={position}>
      <boxGeometry args={args} />
      <meshStandardMaterial
        color={color}
        metalness={0.7}
        roughness={0.35}
      />
    </mesh>
  );
}

function phaseAccent(phase: AgentPhase) {
  if (phase === "COMPLETED") return "#63f5a4";
  if (phase === "EXECUTING") return "#ffd166";
  if (phase === "VERIFYING") return "#7ddfff";
  return "#39d5f2";
}

export function DesktopMonitor({
  phase = "READY",
  hovered = false,
  demoProgress = 0,
}: {
  phase?: AgentPhase;
  hovered?: boolean;
  demoProgress?: number;
}) {
  const screenLight = useRef<THREE.PointLight>(null);
  const screenMat = useRef<THREE.MeshStandardMaterial>(null);
  const statusDot = useRef<THREE.MeshBasicMaterial>(null);
  const cursor = useRef<THREE.Mesh>(null);
  const group = useRef<THREE.Group>(null);
  const elapsed = useRef(0);

  const cursorPath = useMemo(
    () => [
      new THREE.Vector3(-0.55, 0.15, 0.07),
      new THREE.Vector3(-0.2, 0.05, 0.07),
      new THREE.Vector3(0.1, -0.12, 0.07),
      new THREE.Vector3(0.35, 0.02, 0.07),
      new THREE.Vector3(0.05, 0.18, 0.07),
    ],
    [],
  );

  useFrame((_, delta) => {
    elapsed.current += delta;
    const t = elapsed.current;
    const accent = phaseAccent(phase);

    if (screenLight.current) {
      screenLight.current.color.set(accent);
      screenLight.current.intensity =
        hovered || phase === "EXECUTING"
          ? 1.25 + Math.sin(t * 3) * 0.15
          : 0.8 + Math.sin(t * 1.5) * 0.06;
    }
    if (screenMat.current) {
      screenMat.current.emissive.set(accent);
      screenMat.current.emissiveIntensity = hovered ? 0.2 : 0.11;
    }
    if (statusDot.current) {
      statusDot.current.color.set(accent);
    }

    const p = demoProgress;
    if (cursor.current) {
      const max = cursorPath.length - 1;
      const idx = Math.min(max, Math.floor(p * max));
      const next = Math.min(max, idx + 1);
      const localT = p * max - idx;
      cursor.current.position.lerpVectors(
        cursorPath[idx],
        cursorPath[next],
        localT,
      );
      cursor.current.visible = p > 0.02;
    }

    if (group.current) {
      group.current.rotation.y = THREE.MathUtils.lerp(
        group.current.rotation.y,
        hovered ? 0.05 : 0,
        0.08,
      );
    }
  });

  return (
    <group ref={group} position={[0, 0.28, 0]}>
      <RoundedPanel
        args={[0.55, 0.08, 0.35]}
        position={[0, -1.05, 0.05]}
        color="#11171b"
      />
      <RoundedPanel
        args={[0.12, 0.55, 0.08]}
        position={[0, -0.75, 0.02]}
        color="#1c272d"
      />

      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[2.2, 1.42, 0.1]} />
        <meshStandardMaterial
          color={hovered ? "#16202c" : "#1c272d"}
          metalness={0.75}
          roughness={0.28}
        />
      </mesh>

      <mesh position={[0, 0.02, 0.055]}>
        <boxGeometry args={[2.0, 1.2, 0.02]} />
        <meshStandardMaterial color="#11171b" metalness={0.4} roughness={0.5} />
      </mesh>

      <mesh position={[0, 0.02, 0.065]}>
        <planeGeometry args={[1.92, 1.12]} />
        <meshStandardMaterial
          ref={screenMat}
          color="#0a1520"
          emissive="#39d5f2"
          emissiveIntensity={0.11}
          metalness={0.1}
          roughness={0.8}
        />
      </mesh>

      <mesh position={[0, 0.5, 0.07]}>
        <planeGeometry args={[1.88, 0.12]} />
        <meshBasicMaterial color="#0d1824" />
      </mesh>

      <mesh position={[0.82, 0.5, 0.075]}>
        <circleGeometry args={[0.03, 16]} />
        <meshBasicMaterial ref={statusDot} color="#39d5f2" />
      </mesh>

      <mesh position={[-0.32, 0.08, 0.07]}>
        <planeGeometry args={[1.1, 0.66]} />
        <meshBasicMaterial color="#122030" />
      </mesh>
      <mesh position={[0.5, -0.14, 0.07]}>
        <planeGeometry args={[0.64, 0.5]} />
        <meshBasicMaterial color="#152536" />
      </mesh>

      <mesh ref={cursor} position={cursorPath[0]} rotation={[0, 0, -0.4]} visible={false}>
        <coneGeometry args={[0.035, 0.09, 3]} />
        <meshStandardMaterial
          color="#39d5f2"
          emissive="#39d5f2"
          emissiveIntensity={0.8}
        />
      </mesh>

      <pointLight
        ref={screenLight}
        position={[0, 0, 0.55]}
        color="#39d5f2"
        intensity={0.85}
        distance={3.5}
        decay={2}
      />
    </group>
  );
}
