"use client";

export function Keyboard() {
  return (
    <group position={[0, -1.12, 0.5]} rotation={[-0.32, 0, 0]}>
      <mesh>
        <boxGeometry args={[1.45, 0.055, 0.5]} />
        <meshStandardMaterial color="#1c272d" metalness={0.65} roughness={0.35} />
      </mesh>
      {Array.from({ length: 4 }).map((_, row) =>
        Array.from({ length: 11 }).map((_, col) => (
          <mesh
            key={`${row}-${col}`}
            position={[-0.58 + col * 0.11, 0.035, -0.16 + row * 0.09]}
          >
            <boxGeometry args={[0.085, 0.018, 0.065]} />
            <meshStandardMaterial
              color={row === 1 && col === 5 ? "#1a3344" : "#11171b"}
              metalness={0.4}
              roughness={0.45}
              emissive={row === 1 && col === 5 ? "#39d5f2" : "#000000"}
              emissiveIntensity={row === 1 && col === 5 ? 0.3 : 0}
            />
          </mesh>
        )),
      )}
    </group>
  );
}
