"use client";

import React, { useMemo, useRef, useState, useCallback } from "react";
import { useFrame, useThree, ThreeEvent } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { useReadingStore } from "@/stores/useReadingStore";
import { getCardBackTexture } from "./cardTextures";
import { mysticAudio } from "@/lib/audio/soundscape";

// ─── Seeded pseudo-random for stable deterministic layout ───
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

interface FloatingCardItemProps {
  index: number;
  basePosition: THREE.Vector3;
  baseRotation: THREE.Euler;
  floatPhase: number;
  scale: number;
  isSelected: boolean;
  selectionOrder?: number;
  onSelect: (index: number) => void;
  edgeMat: THREE.MeshStandardMaterial;
  backMat: THREE.MeshStandardMaterial;
}

function FloatingCardItem({
  index,
  basePosition,
  baseRotation,
  floatPhase,
  scale,
  isSelected,
  selectionOrder,
  onSelect,
  edgeMat,
  backMat,
}: FloatingCardItemProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const glowIntensity = useRef(0);

  // Clone edge material so each card has its own reactive emissive glow
  const cardEdgeMat = useMemo(() => edgeMat.clone(), [edgeMat]);

  const materials = useMemo(
    () => [cardEdgeMat, cardEdgeMat, cardEdgeMat, cardEdgeMat, backMat, backMat],
    [cardEdgeMat, backMat]
  );

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime();

    // Gentle organic breathing: subtle Y oscillation
    const breatheY = Math.sin(time * 0.6 + floatPhase) * 0.012;
    const breatheZ = Math.sin(time * 0.4 + floatPhase * 1.3) * 0.006;

    let targetX = basePosition.x;
    let targetY = basePosition.y + breatheY;
    let targetZ = basePosition.z + breatheZ;

    let targetRotX = baseRotation.x;
    let targetRotY = baseRotation.y;
    let targetRotZ = baseRotation.z;

    let targetGlow = 0.02; // subtle ambient warmth
    let targetScale = scale;

    if (isSelected) {
      // Selected: card steps FORWARD into clear view (never shoots up into ceiling!)
      targetY += 0.12;
      targetZ += 1.35;
      targetRotX = 0;
      targetRotY = 0;
      targetRotZ = 0;
      targetGlow = hovered ? 1.3 : 0.95;
      targetScale = scale * (hovered ? 1.22 : 1.18);
    } else if (hovered) {
      // Hover: gentle lift, forward step, and interactive cursor tilt
      targetY += 0.08;
      targetZ += 0.55;
      targetRotX = baseRotation.x * 0.3 - state.pointer.y * 0.18;
      targetRotY = baseRotation.y * 0.4 + state.pointer.x * 0.18;
      targetGlow = 0.65;
      targetScale = scale * 1.08;
    }

    // Silky smooth damping
    const dampRate = isSelected ? 8 : hovered ? 7 : 4;
    meshRef.current.position.x = THREE.MathUtils.damp(meshRef.current.position.x, targetX, dampRate, delta);
    meshRef.current.position.y = THREE.MathUtils.damp(meshRef.current.position.y, targetY, dampRate, delta);
    meshRef.current.position.z = THREE.MathUtils.damp(meshRef.current.position.z, targetZ, dampRate, delta);

    meshRef.current.rotation.x = THREE.MathUtils.damp(meshRef.current.rotation.x, targetRotX, dampRate, delta);
    meshRef.current.rotation.y = THREE.MathUtils.damp(meshRef.current.rotation.y, targetRotY, dampRate, delta);
    meshRef.current.rotation.z = THREE.MathUtils.damp(meshRef.current.rotation.z, targetRotZ, dampRate, delta);

    // Scale spring
    const curScale = meshRef.current.scale.x;
    meshRef.current.scale.setScalar(THREE.MathUtils.damp(curScale, targetScale, 8, delta));

    // Dynamic metallic gold foil shimmer reacting to light and time
    cardEdgeMat.metalness = 0.94;
    cardEdgeMat.roughness = 0.14;
    glowIntensity.current = THREE.MathUtils.damp(glowIntensity.current, targetGlow, 6, delta);
    const g = glowIntensity.current;
    const shimmer = Math.sin(time * 2.8 + floatPhase) * 0.35 + 0.65;

    if (isSelected && hovered) {
      // Warm rose-gold cue for unselect
      cardEdgeMat.emissive.setRGB(0.95 * g * shimmer, 0.4 * g * shimmer, 0.3 * g * shimmer);
    } else {
      cardEdgeMat.emissive.setRGB(0.92 * g * shimmer, 0.72 * g * shimmer, 0.22 * g * shimmer);
    }
  });

  const handlePointerOver = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHovered(true);
    document.body.style.cursor = "pointer";
    if (typeof window !== "undefined") mysticAudio.playButtonClick?.();
  }, []);

  const handlePointerOut = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHovered(false);
    document.body.style.cursor = "auto";
  }, []);

  const handleClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation();
      onSelect(index);
    },
    [index, onSelect]
  );

  return (
    <group>
      <mesh
        ref={meshRef}
        position={[basePosition.x, basePosition.y, basePosition.z]}
        rotation={[baseRotation.x, baseRotation.y, baseRotation.z]}
        scale={[scale, scale, scale]}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={handleClick}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[0.55, 0.94, 0.01]} />
        {materials.map((mat, i) => (
          <primitive key={i} object={mat} attach={`material-${i}`} />
        ))}

        {/* Selection confirmation badge attached directly to upper face of the card */}
        {isSelected && selectionOrder && (
          <Html position={[0, 0.36, 0.04]} center pointerEvents="none">
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full font-mono-sacred text-[9px] font-extrabold tracking-wider shadow-xl whitespace-nowrap select-none border transition-all duration-150 ${
                hovered
                  ? "bg-gradient-to-r from-rose-300 via-rose-200 to-rose-300 border-rose-950/40 text-rose-950 shadow-rose-400/60 scale-105"
                  : "bg-gradient-to-r from-amber-300 via-amber-200 to-amber-300 border-amber-950/30 text-neutral-950 shadow-amber-400/70"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  hovered ? "bg-rose-950" : "bg-amber-950 animate-ping"
                }`}
              />
              <span>{hovered ? `DESELECT CARD ${selectionOrder}` : `CARD ${selectionOrder}`}</span>
              <span className="text-[8px] font-bold opacity-80">✕</span>
            </div>
          </Html>
        )}
      </mesh>
    </group>
  );
}

// ─── Main 3D Floating Cosmos Card Field ───
// Professional amphitheater fan arc calibrated for standard screens
export function FloatingCardField() {
  const { userPickIndices, togglePickIndex } = useReadingStore();
  const groupRef = useRef<THREE.Group>(null);
  const { pointer } = useThree();
  const cardBackTexture = useMemo(() => getCardBackTexture(), []);

  const masterEdgeMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#d4af37",
        metalness: 0.88,
        roughness: 0.18,
      }),
    []
  );

  const masterBackMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: cardBackTexture,
        roughness: 0.32,
        metalness: 0.1,
      }),
    [cardBackTexture]
  );

  // ─── Calibrated 3-row amphitheater fan arc layout ───
  // Compact vertical range (-0.7 to +0.7) and gentle horizontal span
  // so no card clips off-screen or shoots into the header!
  const cardLayouts = useMemo(() => {
    const total = 78;
    const rng = seededRandom(42);

    const rows = [
      // Front row (bottom): 26 cards
      {
        count: 26,
        radius: 6.0,
        yCenter: -0.70,
        zBase: 0.35,
        angleSpan: Math.PI * 0.54, // ~97 degrees
        scale: 0.84,
        tiltX: -0.09,
      },
      // Middle row: 26 cards
      {
        count: 26,
        radius: 6.4,
        yCenter: 0.0,
        zBase: -0.25,
        angleSpan: Math.PI * 0.50, // ~90 degrees
        scale: 0.76,
        tiltX: -0.06,
      },
      // Back row (top): 26 cards
      {
        count: 26,
        radius: 6.8,
        yCenter: 0.70,
        zBase: -0.85,
        angleSpan: Math.PI * 0.46, // ~83 degrees
        scale: 0.68,
        tiltX: -0.03,
      },
    ];

    const list: {
      index: number;
      position: THREE.Vector3;
      rotation: THREE.Euler;
      floatPhase: number;
      scale: number;
    }[] = [];

    let cardIdx = 0;

    for (const row of rows) {
      for (let i = 0; i < row.count && cardIdx < total; i++) {
        const t = row.count > 1 ? i / (row.count - 1) : 0.5;

        // Card angle along the fan arc (centered at 0)
        const angle = -row.angleSpan / 2 + t * row.angleSpan;

        // Position on arc: center cards closest, wings curve gently BACK into depth
        const x = Math.sin(angle) * row.radius;
        const z = (Math.cos(angle) - 1) * (row.radius * 0.35) + row.zBase;
        const y = row.yCenter;

        // Cards angle inward to face camera naturally
        const rotY = -angle * 0.55;

        // Subtle organic breathing phase
        const microY = (rng() - 0.5) * 0.02;
        const microRotZ = (rng() - 0.5) * 0.01;

        list.push({
          index: cardIdx,
          position: new THREE.Vector3(x, y + microY, z),
          rotation: new THREE.Euler(row.tiltX, rotY, microRotZ),
          floatPhase: rng() * Math.PI * 2,
          scale: row.scale,
        });

        cardIdx++;
      }
    }

    return list;
  }, []);

  // Subtle mouse parallax for depth
  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const time = state.clock.getElapsedTime();

    const targetRotY = pointer.x * 0.08;
    const targetRotX = -pointer.y * 0.04;

    groupRef.current.rotation.y = THREE.MathUtils.damp(
      groupRef.current.rotation.y,
      targetRotY,
      3,
      delta
    );
    groupRef.current.rotation.x = THREE.MathUtils.damp(
      groupRef.current.rotation.x,
      targetRotX,
      3,
      delta
    );
    // Subtle collective breathing
    groupRef.current.position.y = THREE.MathUtils.damp(
      groupRef.current.position.y,
      Math.sin(time * 0.3) * 0.015,
      3,
      delta
    );
  });

  return (
    <group ref={groupRef} position={[0, -0.05, 0]}>
      {/* Warm ambient celestial lighting */}
      <pointLight position={[0, 0, 4.5]} intensity={1.3} color="#d4af37" distance={18} decay={2} />
      <pointLight position={[0, 2, 2.5]} intensity={0.6} color="#a78bfa" distance={12} decay={2} />
      <pointLight position={[-4, 0, 2.5]} intensity={0.5} color="#ffd875" distance={12} decay={2} />
      <pointLight position={[4, 0, 2.5]} intensity={0.5} color="#ffd875" distance={12} decay={2} />
      <pointLight position={[0, -2, 3]} intensity={0.3} color="#ffc875" distance={10} decay={2} />

      {cardLayouts.map((card) => (
        <FloatingCardItem
          key={card.index}
          index={card.index}
          basePosition={card.position}
          baseRotation={card.rotation}
          floatPhase={card.floatPhase}
          scale={card.scale}
          isSelected={userPickIndices.includes(card.index)}
          selectionOrder={
            userPickIndices.indexOf(card.index) !== -1
              ? userPickIndices.indexOf(card.index) + 1
              : undefined
          }
          onSelect={togglePickIndex}
          edgeMat={masterEdgeMat}
          backMat={masterBackMat}
        />
      ))}
    </group>
  );
}
