"use client";

import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export function StarfieldNebula() {
  const starsRef = useRef<THREE.Points>(null);
  const dustRef = useRef<THREE.Points>(null);

  // ─── 1,600 celestial stars in a spherical shell ───
  const [starPositions, starColors, starSizes] = useMemo(() => {
    const count = 1600;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    const goldColor = new THREE.Color("#d4af37");
    const purpleColor = new THREE.Color("#8b5cf6");
    const deepPurple = new THREE.Color("#4c1d95");
    const whiteColor = new THREE.Color("#f0f0ff");
    const blueColor = new THREE.Color("#60a5fa");

    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const radius = 15 + Math.random() * 30;

      pos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = radius * Math.cos(phi);

      // Color distribution: 50% white, 20% blue, 15% purple, 10% deep purple, 5% gold
      const r = Math.random();
      const c = r < 0.5 ? whiteColor : r < 0.7 ? blueColor : r < 0.85 ? purpleColor : r < 0.95 ? deepPurple : goldColor;
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;

      sizes[i] = 0.06 + Math.random() * 0.14;
    }

    return [pos, col, sizes];
  }, []);

  // ─── Cosmic dust particles (subtle motes closer to camera) ───
  const [dustPositions, dustColors] = useMemo(() => {
    const count = 300;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);

    const dustGold = new THREE.Color("#d4af37");
    const dustPurple = new THREE.Color("#7c3aed");

    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 12;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 16;

      const c = Math.random() < 0.6 ? dustGold : dustPurple;
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }

    return [pos, col];
  }, []);

  useFrame((_, delta) => {
    if (starsRef.current) {
      starsRef.current.rotation.y += delta * 0.015;
      starsRef.current.rotation.x += delta * 0.005;
    }
    if (dustRef.current) {
      dustRef.current.rotation.y -= delta * 0.008;
      dustRef.current.rotation.z += delta * 0.003;
    }
  });

  return (
    <group>
      {/* Main starfield */}
      <points ref={starsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[starPositions, 3]} />
          <bufferAttribute attach="attributes-color" args={[starColors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.12}
          vertexColors
          transparent
          opacity={0.85}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          sizeAttenuation
        />
      </points>

      {/* Floating cosmic dust motes */}
      <points ref={dustRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[dustPositions, 3]} />
          <bufferAttribute attach="attributes-color" args={[dustColors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.04}
          vertexColors
          transparent
          opacity={0.35}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          sizeAttenuation
        />
      </points>

      {/* ─── Scene Lighting ─── */}
      {/* Warm ambient */}
      <ambientLight intensity={0.35} color="#f5ecd7" />

      {/* Key light: warm gold from above-front */}
      <pointLight position={[0, 6, 12]} intensity={1.8} color="#f9e295" distance={35} decay={2} />

      {/* Fill light: cool purple from below-back */}
      <pointLight position={[0, -4, -8]} intensity={0.8} color="#8b5cf6" distance={30} decay={2} />

      {/* Rim light: subtle purple from sides */}
      <pointLight position={[-8, 2, 0]} intensity={0.4} color="#7c3aed" distance={20} decay={2} />
      <pointLight position={[8, 2, 0]} intensity={0.4} color="#6d28d9" distance={20} decay={2} />
    </group>
  );
}
