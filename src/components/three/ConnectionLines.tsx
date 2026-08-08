"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import * as THREE from "three";

export function ConnectionLines({
  active = true,
  from = [1.55, 0.85, 0.45] as [number, number, number],
  to = [0.85, 0.35, 0.15] as [number, number, number],
}: {
  active?: boolean;
  from?: [number, number, number];
  to?: [number, number, number];
}) {
  const group = useRef<THREE.Group>(null);
  const elapsed = useRef(0);
  const points = useMemo(() => {
    const start = new THREE.Vector3(...from);
    const end = new THREE.Vector3(...to);
    const mid = start.clone().lerp(end, 0.5);
    mid.y += 0.35;
    mid.x += 0.15;
    return new THREE.QuadraticBezierCurve3(start, mid, end).getPoints(24);
  }, [from, to]);

  useFrame((_, delta) => {
    elapsed.current += delta;
    if (!group.current) return;
    const opacity = active
      ? 0.3 + Math.sin(elapsed.current * 2.2) * 0.15
      : 0.1;
    group.current.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (mesh.material && "opacity" in mesh.material) {
        (mesh.material as THREE.Material & { opacity: number }).opacity = opacity;
      }
    });
  });

  return (
    <group ref={group}>
      <Line
        points={points}
        color="#39d5f2"
        transparent
        opacity={0.35}
        lineWidth={1.25}
        depthWrite={false}
      />
    </group>
  );
}

export function ActionNode({
  position,
  labelColor = "#39d5f2",
  pulse = false,
}: {
  position: [number, number, number];
  labelColor?: string;
  pulse?: boolean;
}) {
  const ref = useRef<THREE.Mesh>(null);
  const elapsed = useRef(0);

  useFrame((_, delta) => {
    elapsed.current += delta;
    if (!ref.current) return;
    const s = pulse ? 1 + Math.sin(elapsed.current * 3) * 0.1 : 1;
    ref.current.scale.setScalar(s);
  });

  return (
    <mesh ref={ref} position={position}>
      <octahedronGeometry args={[0.07, 0]} />
      <meshStandardMaterial
        color={labelColor}
        emissive={labelColor}
        emissiveIntensity={0.5}
        metalness={0.4}
        roughness={0.3}
        transparent
        opacity={1}
      />
    </mesh>
  );
}
