"use client";

import React, { useMemo, useRef, useState, useCallback, useEffect } from "react";
import { useFrame, useThree, ThreeEvent } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { useReadingStore } from "@/stores/useReadingStore";
import { getCardBackTexture } from "./cardTextures";
import { mysticAudio } from "@/lib/audio/soundscape";

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
  mountTime: number;
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
  mountTime,
}: FloatingCardItemProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const glowIntensity = useRef(0.25);
  const isDealt = useRef(false);

  // Clone edge material so each card has its own reactive emissive glow
  const cardEdgeMat = useMemo(() => edgeMat.clone(), [edgeMat]);

  const materials = useMemo(
    () => [cardEdgeMat, cardEdgeMat, cardEdgeMat, cardEdgeMat, backMat, backMat],
    [cardEdgeMat, backMat]
  );

  // Staggered deal delay: rapid cascade dealing across the 2 rows (~1.0s total)
  const dealDelay = 0.05 + index * 0.012;
  const dealDuration = 0.35;

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime();
    const elapsedSinceMount = time - mountTime;

    // ─── Phase 1: Sequential Realistic Card Dealing Cascade ───
    if (elapsedSinceMount < dealDelay) {
      // Waiting in deck stack at center
      const stackZ = 0.25 + (78 - index) * 0.002;
      meshRef.current.position.set(0, -0.3, stackZ);
      meshRef.current.rotation.set(-0.15, 0, (index % 5 - 2) * 0.008);
      meshRef.current.scale.setScalar(scale * 0.85);
      return;
    }

    if (elapsedSinceMount < dealDelay + dealDuration) {
      // Actively dealing: flies smoothly from center deck into row position
      const p = (elapsedSinceMount - dealDelay) / dealDuration;
      const ease = 1 - Math.pow(1 - p, 3);
      const arcLift = Math.sin(p * Math.PI) * 0.35;

      meshRef.current.position.x = THREE.MathUtils.lerp(0, basePosition.x, ease);
      meshRef.current.position.y = THREE.MathUtils.lerp(-0.3, basePosition.y, ease) + arcLift;
      meshRef.current.position.z = THREE.MathUtils.lerp(0.25, basePosition.z, ease);

      meshRef.current.rotation.x = THREE.MathUtils.lerp(-0.15, baseRotation.x, ease);
      meshRef.current.rotation.y = THREE.MathUtils.lerp(0, baseRotation.y, ease);
      meshRef.current.rotation.z = THREE.MathUtils.lerp(0.04, baseRotation.z, ease);

      meshRef.current.scale.setScalar(THREE.MathUtils.lerp(scale * 0.85, scale, ease));
      isDealt.current = true;
      return;
    }

    // ─── Phase 2: Interactive Settled State (Selection & Hover) ───
    let targetX = basePosition.x;
    let targetY = basePosition.y;
    let targetZ = basePosition.z;

    let targetRotX = baseRotation.x;
    let targetRotY = baseRotation.y;
    let targetRotZ = baseRotation.z;

    let targetGlow = 0.28;
    let targetScale = scale;

    if (isSelected) {
      // Selected: card steps FORWARD into clear view
      targetY += 0.14;
      targetZ += 1.25;
      targetRotX = 0;
      targetRotY = 0;
      targetRotZ = 0;
      targetGlow = hovered ? 1.4 : 1.1;
      targetScale = scale * (hovered ? 1.20 : 1.15);
    } else if (hovered) {
      // Hover: gentle lift, forward step, and interactive cursor tilt
      targetY += 0.08;
      targetZ += 0.55;
      targetRotX = baseRotation.x - state.pointer.y * 0.12;
      targetRotY = state.pointer.x * 0.12;
      targetGlow = 0.85;
      targetScale = scale * 1.10;
    }

    const dampRate = isSelected ? 8 : hovered ? 7 : 4.5;
    meshRef.current.position.x = THREE.MathUtils.damp(meshRef.current.position.x, targetX, dampRate, delta);
    meshRef.current.position.y = THREE.MathUtils.damp(meshRef.current.position.y, targetY, dampRate, delta);
    meshRef.current.position.z = THREE.MathUtils.damp(meshRef.current.position.z, targetZ, dampRate, delta);

    meshRef.current.rotation.x = THREE.MathUtils.damp(meshRef.current.rotation.x, targetRotX, dampRate, delta);
    meshRef.current.rotation.y = THREE.MathUtils.damp(meshRef.current.rotation.y, targetRotY, dampRate, delta);
    meshRef.current.rotation.z = THREE.MathUtils.damp(meshRef.current.rotation.z, targetRotZ, dampRate, delta);

    const curScale = meshRef.current.scale.x;
    meshRef.current.scale.setScalar(THREE.MathUtils.damp(curScale, targetScale, 8, delta));

    cardEdgeMat.metalness = 0.90;
    cardEdgeMat.roughness = 0.18;
    glowIntensity.current = THREE.MathUtils.damp(glowIntensity.current, targetGlow, 6, delta);
    const g = glowIntensity.current;
    const shimmer = Math.sin(time * 2.8 + floatPhase) * 0.25 + 0.75;

    if (isSelected && hovered) {
      cardEdgeMat.emissive.setRGB(0.95 * g * shimmer, 0.4 * g * shimmer, 0.3 * g * shimmer);
    } else {
      cardEdgeMat.emissive.setRGB(0.95 * g * shimmer, 0.76 * g * shimmer, 0.24 * g * shimmer);
    }
  });

  const handlePointerOver = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHovered(true);
    if (typeof document !== "undefined") document.body.style.cursor = "pointer";
    if (typeof window !== "undefined") mysticAudio.playButtonClick?.();
  }, []);

  const handlePointerOut = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHovered(false);
    if (typeof document !== "undefined") document.body.style.cursor = "auto";
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
        material={materials}
        position={[0, -0.3, 0.25]}
        rotation={[-0.15, 0, 0]}
        scale={[scale * 0.85, scale * 0.85, scale * 0.85]}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={handleClick}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[0.55, 0.94, 0.012]} />

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

export function FloatingCardField() {
  const { userPickIndices, togglePickIndex } = useReadingStore();
  const groupRef = useRef<THREE.Group>(null);
  const { pointer, viewport, size } = useThree();
  const cardBackTexture = useMemo(() => getCardBackTexture(), []);
  const [mountTime, setMountTime] = useState(0);

  // Clean cursor on unmount
  useEffect(() => {
    return () => {
      if (typeof document !== "undefined") {
        document.body.style.cursor = "auto";
      }
    };
  }, []);

  // Play realistic card dealing riffle audio ("khad-khad-khad") on deal start
  useEffect(() => {
    if (typeof window !== "undefined") {
      mysticAudio.playCardDealCascade();
    }
  }, []);

  const masterEdgeMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#f5c542",
        emissive: "#d4af37",
        metalness: 0.90,
        roughness: 0.16,
      }),
    []
  );

  // Softened roughness & lowered metalness to eliminate white wash-out glare
  const masterBackMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: cardBackTexture,
        roughness: 0.58,
        metalness: 0.05,
      }),
    [cardBackTexture]
  );

  // ─── Pristine 2-Row Fanned Ribbon Spread (Zero jitter, razor-sharp alignment & larger on desktop) ───
  const cardLayouts = useMemo(() => {
    const total = 78;
    const isDesktop = size.width >= 1024;
    const isTablet = size.width >= 640 && size.width < 1024;

    // Responsive desktop scaling: significantly larger on desktop as requested
    const scale = isDesktop ? 0.94 : isTablet ? 0.82 : 0.70;

    // Span width: proportioned cleanly to span comfortably across the screen
    const maxSpan = isDesktop ? 10.2 : isTablet ? 8.6 : 7.0;
    const spanWidth = Math.min(maxSpan, Math.max(6.0, viewport.width * 0.92));

    const rows = [
      // Top row: 39 cards (index 0 to 38)
      {
        count: 39,
        spanWidth,
        yCenter: isDesktop ? 0.60 : 0.50,
        zBase: -0.06,
        scale,
        tiltX: -0.06,
      },
      // Bottom row: 39 cards (index 39 to 77)
      {
        count: 39,
        spanWidth,
        yCenter: isDesktop ? -0.56 : -0.46,
        zBase: 0.06,
        scale,
        tiltX: -0.06,
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

        // Perfectly uniform, linear horizontal fanning
        const x = -row.spanWidth / 2 + t * row.spanWidth;

        // Monotonic Z-stacking from left to right:
        // Each card cleanly overlaps the one to its left. Zero z-fighting, zero clashing!
        const z = row.zBase + (i - (row.count - 1) / 2) * 0.0028;

        // Perfectly level horizontal baseline: zero microY, zero crooked tilt!
        const y = row.yCenter;

        list.push({
          index: cardIdx,
          position: new THREE.Vector3(x, y, z),
          rotation: new THREE.Euler(row.tiltX, 0, 0),
          floatPhase: (cardIdx / total) * Math.PI * 2,
          scale: row.scale,
        });

        cardIdx++;
      }
    }

    return list;
  }, [viewport.width, size.width]);

  // Set mount time on initial frame
  useFrame((state, delta) => {
    if (mountTime === 0) {
      setMountTime(state.clock.getElapsedTime());
    }

    if (!groupRef.current) return;
    const time = state.clock.getElapsedTime();

    const targetRotY = pointer.x * 0.06;
    const targetRotX = -pointer.y * 0.03;

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
      Math.sin(time * 0.3) * 0.012,
      3,
      delta
    );
  });

  return (
    <group ref={groupRef} position={[0, -0.02, 0]}>
      {/* Balanced, diffuse scene illumination preserving rich purple & gold colors without white glares */}
      <directionalLight position={[0, 4, 6]} intensity={0.85} color="#fff8e7" />
      <pointLight position={[0, 0, 4.0]} intensity={0.7} color="#fef08a" distance={18} decay={1.8} />
      <pointLight position={[-4, 0, 3.2]} intensity={0.4} color="#e9d5ff" distance={12} decay={2} />
      <pointLight position={[4, 0, 3.2]} intensity={0.4} color="#e9d5ff" distance={12} decay={2} />

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
          mountTime={mountTime}
        />
      ))}
    </group>
  );
}
