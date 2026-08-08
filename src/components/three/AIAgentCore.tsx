"use client";

import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export type AgentPhase =
  | "READY"
  | "THINKING"
  | "SCREENSHOT"
  | "EXECUTING"
  | "VERIFYING"
  | "COMPLETED";

const phaseColor: Record<AgentPhase, string> = {
  READY: "#39d5f2",
  THINKING: "#7ddfff",
  SCREENSHOT: "#22c7e8",
  EXECUTING: "#ffd166",
  VERIFYING: "#7ddfff",
  COMPLETED: "#63f5a4",
};

export function AIAgentCore({
  phase = "READY",
  position = [0, 0, 0] as [number, number, number],
  scale = 1,
}: {
  phase?: AgentPhase;
  position?: [number, number, number];
  scale?: number;
}) {
  const group = useRef<THREE.Group>(null);
  const core = useRef<THREE.Mesh>(null);
  const ring = useRef<THREE.Mesh>(null);
  const wire = useRef<THREE.Mesh>(null);
  const light = useRef<THREE.PointLight>(null);
  const elapsed = useRef(0);
  const baseY = position[1];

  useEffect(() => {
    const color = phaseColor[phase];
    if (core.current) {
      const mat = core.current.material as THREE.MeshStandardMaterial;
      mat.color.set(color);
      mat.emissive.set(color);
    }
    if (wire.current) {
      (wire.current.material as THREE.MeshBasicMaterial).color.set(color);
    }
    if (light.current) light.current.color.set(color);
  }, [phase]);

  useFrame((_, delta) => {
    elapsed.current += delta;
    const t = elapsed.current;
    if (group.current) {
      group.current.position.y = baseY + Math.sin(t * 1.2) * 0.05;
      group.current.rotation.y = t * 0.3;
    }
    if (core.current) {
      const mat = core.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.55 + Math.sin(t * 2.4) * 0.12;
    }
    if (ring.current) {
      ring.current.rotation.z = t * 0.7;
      ring.current.rotation.x = Math.sin(t * 0.5) * 0.25;
    }
  });

  return (
    <group ref={group} position={position} scale={scale}>
      <mesh ref={core}>
        <icosahedronGeometry args={[0.2, 1]} />
        <meshStandardMaterial
          color={phaseColor[phase]}
          emissive={phaseColor[phase]}
          emissiveIntensity={0.6}
          metalness={0.35}
          roughness={0.25}
        />
      </mesh>
      <mesh ref={ring} scale={1.4}>
        <torusGeometry args={[0.26, 0.016, 12, 48]} />
        <meshStandardMaterial
          color="#7ddfff"
          emissive="#39d5f2"
          emissiveIntensity={0.35}
          metalness={0.6}
          roughness={0.3}
          transparent
          opacity={0.85}
        />
      </mesh>
      <mesh ref={wire} scale={1.75}>
        <icosahedronGeometry args={[0.2, 0]} />
        <meshBasicMaterial
          color={phaseColor[phase]}
          wireframe
          transparent
          opacity={0.18}
        />
      </mesh>
      <pointLight
        ref={light}
        color={phaseColor[phase]}
        intensity={1}
        distance={3}
        decay={2}
      />
    </group>
  );
}
