"use client";

import React, { useRef, useState, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getCardBackTexture } from "./cardTextures";
import { mysticAudio } from "@/lib/audio/soundscape";
import { Html } from "@react-three/drei";
import { Sparkles } from "lucide-react";

interface DeckCut3DProps {
  onCutComplete: () => void;
}

export function DeckCut3D({ onCutComplete }: DeckCut3DProps) {
  const groupRef = useRef<THREE.Group>(null);
  const cardBackTexture = useMemo(() => getCardBackTexture(), []);

  // Split state: 'united' | 'splitting' | 'split' | 'completed'
  const [cutState, setCutState] = useState<"united" | "splitting" | "split" | "completed">("united");
  const [hovered, setHovered] = useState(false);

  // Clean cursor on unmount
  useEffect(() => {
    return () => {
      if (typeof document !== "undefined") {
        document.body.style.cursor = "auto";
      }
    };
  }, []);

  // High-performance shared geometry for each half-deck cut
  const deckGeometry = useMemo(() => new THREE.BoxGeometry(1.2, 2.0, 0.18), []);

  // Gold edge foil material
  const goldEdgeMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#d4af37",
        metalness: 0.90,
        roughness: 0.20,
        emissive: new THREE.Color("#604005"),
        emissiveIntensity: 0.3,
      }),
    []
  );

  // Authentic card back material: high roughness & low metalness prevents washed-out white glare
  const backMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: cardBackTexture,
        roughness: 0.62,
        metalness: 0.04,
      }),
    [cardBackTexture]
  );

  // Box faces: [right, left, top, bottom, front, back]
  const cardMaterials = useMemo(
    () => [goldEdgeMat, goldEdgeMat, goldEdgeMat, goldEdgeMat, backMat, backMat],
    [goldEdgeMat, backMat]
  );

  // Position & rotation vectors for both stacks
  const leftStackPos = useRef(new THREE.Vector3(0, 0, 0.02));
  const rightStackPos = useRef(new THREE.Vector3(0, 0, 0));
  const leftStackRot = useRef(new THREE.Euler(0, 0, 0));
  const rightStackRot = useRef(new THREE.Euler(0, 0, 0));

  // Stardust explosion particles on cut
  const particleGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const count = 50;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 3.0;
      positions[i + 1] = (Math.random() - 0.5) * 2.2;
      positions[i + 2] = (Math.random() - 0.5) * 1.8;
    }
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geo;
  }, []);

  const handlePointerOver = () => {
    setHovered(true);
    if (typeof document !== "undefined") document.body.style.cursor = "pointer";
    if (typeof window !== "undefined") mysticAudio.playButtonClick?.();
  };

  const handlePointerOut = () => {
    setHovered(false);
    if (typeof document !== "undefined") document.body.style.cursor = "auto";
  };

  const handleDeckClick = () => {
    if (cutState === "united") {
      setCutState("splitting");
      if (typeof window !== "undefined") {
        mysticAudio.playCardShuffle?.();
        setTimeout(() => mysticAudio.playCardFlip?.(), 250);
      }
      setTimeout(() => setCutState("split"), 500);
    } else if (cutState === "split") {
      setCutState("completed");
      if (typeof window !== "undefined") {
        mysticAudio.playCardShuffle?.();
      }
      setTimeout(() => {
        if (typeof document !== "undefined") document.body.style.cursor = "auto";
        onCutComplete();
      }, 550);
    }
  };

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    // Target positions based on cut state
    let targetLeftX = 0;
    let targetLeftY = hovered && cutState === "united" ? 0.08 : 0;
    let targetLeftZ = cutState === "united" ? 0.02 : 0.08;
    let targetLeftRotZ = 0;

    let targetRightX = 0;
    let targetRightY = 0;
    let targetRightZ = 0;
    let targetRightRotZ = 0;

    if (cutState === "splitting" || cutState === "split") {
      const breath = cutState === "split" ? Math.sin(time * 1.4) * 0.015 : 0;
      targetLeftX = -1.35;
      targetLeftY = 0.04 + breath;
      targetLeftZ = 0.08;
      targetLeftRotZ = -0.05;

      targetRightX = 1.35;
      targetRightY = -breath;
      targetRightZ = 0;
      targetRightRotZ = 0.05;
    } else if (cutState === "completed") {
      targetLeftX = 0;
      targetLeftY = 0;
      targetLeftZ = 0.02;
      targetRightX = 0;
      targetRightY = 0;
      targetRightZ = 0;
    }

    // Silky smooth spring damping (Zero jitter, Zero z-fighting)
    leftStackPos.current.x = THREE.MathUtils.damp(leftStackPos.current.x, targetLeftX, 5.5, delta);
    leftStackPos.current.y = THREE.MathUtils.damp(leftStackPos.current.y, targetLeftY, 5.5, delta);
    leftStackPos.current.z = THREE.MathUtils.damp(leftStackPos.current.z, targetLeftZ, 5.5, delta);
    leftStackRot.current.z = THREE.MathUtils.damp(leftStackRot.current.z, targetLeftRotZ, 5.5, delta);

    rightStackPos.current.x = THREE.MathUtils.damp(rightStackPos.current.x, targetRightX, 5.5, delta);
    rightStackPos.current.y = THREE.MathUtils.damp(rightStackPos.current.y, targetRightY, 5.5, delta);
    rightStackPos.current.z = THREE.MathUtils.damp(rightStackPos.current.z, targetRightZ, 5.5, delta);
    rightStackRot.current.z = THREE.MathUtils.damp(rightStackRot.current.z, targetRightRotZ, 5.5, delta);

    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(time * 0.4) * 0.04;
      groupRef.current.rotation.x = Math.cos(time * 0.3) * 0.02 - 0.12;
    }

    // Subtle edge foil shimmer
    const shimmer = Math.sin(time * 2) * 0.5 + 0.5;
    goldEdgeMat.emissiveIntensity = 0.2 + shimmer * 0.25;
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Soft, non-glaring illumination so the purple & gold card back artwork remains rich and visible */}
      <directionalLight position={[0, 4, 5]} intensity={0.8} color="#fff6e8" />
      <pointLight position={[0, -2, 3]} intensity={0.5} color="#c084fc" distance={10} decay={2} />
      <pointLight position={[-3, 2, 3]} intensity={0.4} color="#fde047" distance={8} decay={2} />
      <pointLight position={[3, 2, 3]} intensity={0.4} color="#fde047" distance={8} decay={2} />

      {/* Sparkles particle aura */}
      {(cutState === "splitting" || cutState === "split") && (
        <points geometry={particleGeo}>
          <pointsMaterial
            size={0.035}
            color="#ffd700"
            transparent
            opacity={0.7}
            blending={THREE.AdditiveBlending}
          />
        </points>
      )}

      {/* Left Stack (Top cut of the deck) */}
      <mesh
        geometry={deckGeometry}
        material={cardMaterials}
        position={[leftStackPos.current.x, leftStackPos.current.y, leftStackPos.current.z]}
        rotation={[leftStackRot.current.x, Math.PI, leftStackRot.current.z]}
        onClick={handleDeckClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        castShadow
        receiveShadow
      />

      {/* Right Stack (Bottom cut of the deck) - Smoothly separates without Z-fighting */}
      {cutState !== "united" && (
        <mesh
          geometry={deckGeometry}
          material={cardMaterials}
          position={[rightStackPos.current.x, rightStackPos.current.y, rightStackPos.current.z]}
          rotation={[rightStackRot.current.x, Math.PI, rightStackRot.current.z]}
          onClick={handleDeckClick}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
          castShadow
          receiveShadow
        />
      )}

      {/* 3D Floating Interactive Badge */}
      <Html position={[0, -1.18, 0]} center pointerEvents="none">
        <div className="flex flex-col items-center select-none pointer-events-none drop-shadow-2xl whitespace-nowrap">
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/95 backdrop-blur-md border border-amber-400/70 shadow-2xl shadow-amber-500/30 text-xs font-mono-sacred text-amber-200 uppercase tracking-widest whitespace-nowrap animate-pulse">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="whitespace-nowrap">
              {cutState === "united"
                ? "Tap Deck to Cut the Cards"
                : cutState === "split"
                ? "Tap to Restack & Draw"
                : "Sealing Energetic Bond..."}
            </span>
          </div>
        </div>
      </Html>
    </group>
  );
}
