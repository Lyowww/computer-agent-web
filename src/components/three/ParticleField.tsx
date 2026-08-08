"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const COUNT = 64;

function buildPositions() {
  const arr = new Float32Array(COUNT * 3);
  for (let i = 0; i < COUNT; i++) {
    const n = i + 1;
    arr[i * 3] = ((n * 37) % 100) / 12 - 4.1;
    arr[i * 3 + 1] = ((n * 53) % 100) / 20 - 2.4;
    arr[i * 3 + 2] = ((n * 71) % 100) / 14 - 3.4;
  }
  return arr;
}

const POSITIONS = buildPositions();

export function ParticleField({ intensity = 1 }: { intensity?: number }) {
  const ref = useRef<THREE.Points>(null);
  const elapsed = useRef(0);

  useFrame((_, delta) => {
    elapsed.current += delta;
    if (!ref.current) return;
    ref.current.rotation.y = elapsed.current * 0.015 * intensity;
    ref.current.rotation.x = Math.sin(elapsed.current * 0.07) * 0.03;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[POSITIONS, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.024}
        color="#39d5f2"
        transparent
        opacity={0.35 * intensity}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}
