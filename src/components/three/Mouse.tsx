"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export function Mouse({ active = false }: { active?: boolean }) {
  const ref = useRef<THREE.Group>(null);
  const elapsed = useRef(0);

  useFrame((_, delta) => {
    elapsed.current += delta;
    if (!ref.current) return;
    const t = elapsed.current;
    if (active) {
      ref.current.position.x = 1.05 + Math.sin(t * 1.6) * 0.035;
      ref.current.position.z = 0.62 + Math.cos(t * 1.2) * 0.03;
    } else {
      ref.current.position.x = THREE.MathUtils.lerp(ref.current.position.x, 1.05, 0.08);
      ref.current.position.z = THREE.MathUtils.lerp(ref.current.position.z, 0.62, 0.08);
    }
  });

  return (
    <group ref={ref} position={[1.05, -1.08, 0.62]} rotation={[-0.2, 0.12, 0]}>
      <mesh>
        <capsuleGeometry args={[0.07, 0.12, 6, 12]} />
        <meshStandardMaterial color="#16202c" metalness={0.55} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.01, -0.02]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.01, 0.01, 0.05, 8]} />
        <meshStandardMaterial
          color="#39d5f2"
          emissive="#39d5f2"
          emissiveIntensity={active ? 0.55 : 0.18}
        />
      </mesh>
    </group>
  );
}
