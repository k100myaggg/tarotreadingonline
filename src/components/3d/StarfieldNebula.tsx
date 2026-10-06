"use client";

import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export function StarfieldNebula() {
  const pointsRef = useRef<THREE.Points>(null);

  // Generate 1,200 celestial stars in a spherical shell
  const [positions, colors] = useMemo(() => {
    const count = 1200;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);

    const goldColor = new THREE.Color("#d4af37");
    const purpleColor = new THREE.Color("#8b5cf6");
    const whiteColor = new THREE.Color("#f8fafc");

    for (let i = 0; i < count; i++) {
      // Spherical distribution
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const radius = 18 + Math.random() * 25;

      pos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = radius * Math.cos(phi);

      // Color variation: 60% white, 25% purple, 15% gold
      const choice = Math.random();
      const c = choice < 0.6 ? whiteColor : choice < 0.85 ? purpleColor : goldColor;
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }

    return [pos, col];
  }, []);

  useFrame((_, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.02;
      pointsRef.current.rotation.x += delta * 0.008;
    }
  });

  return (
    <group>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[colors, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.12}
          vertexColors
          transparent
          opacity={0.8}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      {/* Atmospheric center fog ambient glow */}
      <ambientLight intensity={0.4} />
      <pointLight position={[0, 5, 10]} intensity={1.5} color="#f9e295" distance={30} />
      <pointLight position={[0, -5, -10]} intensity={0.8} color="#8b5cf6" distance={30} />
    </group>
  );
}
