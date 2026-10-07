"use client";

import React, { useRef, useState, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getCardBackTexture } from "./cardTextures";
import { mysticAudio } from "@/lib/audio/soundscape";
import { Html } from "@react-three/drei";
import { Sparkles, Scissors, ArrowRight } from "lucide-react";

interface DeckCut3DProps {
  onCutComplete: () => void;
}

export function DeckCut3D({ onCutComplete }: DeckCut3DProps) {
  const groupRef = useRef<THREE.Group>(null);
  const cardBackTexture = useMemo(() => getCardBackTexture(), []);

  // Split state: 'united' | 'splitting' | 'split' | 'rejoining' | 'completed'
  const [cutState, setCutState] = useState<"united" | "splitting" | "split" | "completed">("united");
  const [hovered, setHovered] = useState(false);

  // Materials with enhanced gold foil metallic sheen
  const goldEdgeMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#d4af37",
        metalness: 0.92,
        roughness: 0.15,
        emissive: new THREE.Color("#855e0c"),
        emissiveIntensity: 0.35,
      }),
    []
  );

  const backMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: cardBackTexture,
        roughness: 0.28,
        metalness: 0.18,
      }),
    [cardBackTexture]
  );

  const cardMaterials = useMemo(
    () => [goldEdgeMat, goldEdgeMat, goldEdgeMat, goldEdgeMat, backMat, backMat],
    [goldEdgeMat, backMat]
  );

  // Positions of Left (Top cut) and Right (Bottom cut) stacks
  const leftStackPos = useRef(new THREE.Vector3(0, 0, 0));
  const rightStackPos = useRef(new THREE.Vector3(0, 0, 0));
  const leftStackRot = useRef(new THREE.Euler(0, 0, 0));
  const rightStackRot = useRef(new THREE.Euler(0, 0, 0));

  // Stardust explosion particles on cut
  const particleCount = 70;
  const particleGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 3.5;
      positions[i + 1] = (Math.random() - 0.5) * 2.5;
      positions[i + 2] = (Math.random() - 0.5) * 2.0;
    }
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 0));
    return geo;
  }, []);

  const handleDeckClick = () => {
    if (cutState === "united") {
      setCutState("splitting");
      if (typeof window !== "undefined") {
        mysticAudio.playCardShuffle?.();
        setTimeout(() => mysticAudio.playCardFlip?.(), 300);
      }
      setTimeout(() => setCutState("split"), 500);
    } else if (cutState === "split") {
      setCutState("completed");
      if (typeof window !== "undefined") {
        mysticAudio.playCardShuffle?.();
      }
      setTimeout(() => onCutComplete(), 750);
    }
  };

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    // Target positions based on cut state
    let targetLeftX = 0;
    let targetLeftY = hovered && cutState === "united" ? 0.15 : 0;
    let targetLeftZ = 0;
    let targetLeftRotZ = 0;

    let targetRightX = 0;
    let targetRightY = 0;
    let targetRightZ = 0;
    let targetRightRotZ = 0;

    if (cutState === "splitting" || cutState === "split") {
      targetLeftX = -1.35;
      targetLeftY = 0.05 + Math.sin(time * 2) * 0.03;
      targetLeftRotZ = -0.06;

      targetRightX = 1.35;
      targetRightY = Math.cos(time * 2) * 0.03;
      targetRightRotZ = 0.06;
    } else if (cutState === "completed") {
      targetLeftX = 0;
      targetLeftY = 0;
      targetRightX = 0;
      targetRightY = 0;
    }

    // Spring damping for smooth card glide
    leftStackPos.current.x = THREE.MathUtils.damp(leftStackPos.current.x, targetLeftX, 6, delta);
    leftStackPos.current.y = THREE.MathUtils.damp(leftStackPos.current.y, targetLeftY, 6, delta);
    leftStackPos.current.z = THREE.MathUtils.damp(leftStackPos.current.z, targetLeftZ, 6, delta);
    leftStackRot.current.z = THREE.MathUtils.damp(leftStackRot.current.z, targetLeftRotZ, 6, delta);

    rightStackPos.current.x = THREE.MathUtils.damp(rightStackPos.current.x, targetRightX, 6, delta);
    rightStackPos.current.y = THREE.MathUtils.damp(rightStackPos.current.y, targetRightY, 6, delta);
    rightStackPos.current.z = THREE.MathUtils.damp(rightStackPos.current.z, targetRightZ, 6, delta);
    rightStackRot.current.z = THREE.MathUtils.damp(rightStackRot.current.z, targetRightRotZ, 6, delta);

    // Subtle breathing rotation of entire group
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(time * 0.5) * 0.08;
      groupRef.current.rotation.x = Math.cos(time * 0.4) * 0.04 - 0.2; // Slight tilt towards camera
    }

    // Dynamic metallic foil shimmer reacting to camera angle
    const shimmer = Math.sin(time * 2.5) * 0.5 + 0.5;
    goldEdgeMat.emissiveIntensity = 0.2 + shimmer * 0.35;
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Central warm sacred altar light */}
      <pointLight position={[0, 1.5, 2]} intensity={2.2} color="#ffe58f" distance={8} />
      <pointLight position={[0, -1, 1]} intensity={0.8} color="#c084fc" distance={6} />

      {/* Sparkles particle aura */}
      {(cutState === "splitting" || cutState === "split") && (
        <points geometry={particleGeo}>
          <pointsMaterial
            size={0.04}
            color="#ffd700"
            transparent
            opacity={0.8}
            blending={THREE.AdditiveBlending}
          />
        </points>
      )}

      {/* Left Stack (Top cut of the deck) */}
      <group
        position={[leftStackPos.current.x, leftStackPos.current.y, leftStackPos.current.z]}
        rotation={[leftStackRot.current.x, leftStackRot.current.y, leftStackRot.current.z]}
        onClick={handleDeckClick}
        onPointerOver={() => {
          setHovered(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = "auto";
        }}
      >
        {/* Render 14 stacked cards for visual thickness */}
        {Array.from({ length: 14 }).map((_, i) => (
          <mesh
            key={`left_${i}`}
            position={[0, 0, (i - 7) * 0.022]}
            rotation={[0, Math.PI, 0]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[1.2, 2.0, 0.018]} />
            {cardMaterials.map((mat, mi) => (
              <primitive key={mi} object={mat} attach={`material-${mi}`} />
            ))}
          </mesh>
        ))}

        {/* Glow halo on hover or cut */}
        {hovered && cutState === "united" && (
          <pointLight position={[0, 0, 0.4]} intensity={1.2} color="#ffd700" distance={3} />
        )}
      </group>

      {/* Right Stack (Bottom cut of the deck) */}
      <group
        position={[rightStackPos.current.x, rightStackPos.current.y, rightStackPos.current.z]}
        rotation={[rightStackRot.current.x, rightStackRot.current.y, rightStackRot.current.z]}
        onClick={handleDeckClick}
      >
        {/* Render 14 stacked cards for visual thickness */}
        {Array.from({ length: 14 }).map((_, i) => (
          <mesh
            key={`right_${i}`}
            position={[0, 0, (i - 7) * 0.022]}
            rotation={[0, Math.PI, 0]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[1.2, 2.0, 0.018]} />
            {cardMaterials.map((mat, mi) => (
              <primitive key={mi} object={mat} attach={`material-${mi}`} />
            ))}
          </mesh>
        ))}
      </group>

      {/* 3D Floating Interactive Badge */}
      <Html position={[0, -1.55, 0]} center pointerEvents="none">
        <div className="flex flex-col items-center select-none pointer-events-none drop-shadow-2xl">
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/90 backdrop-blur-md border border-amber-400/60 shadow-xl shadow-amber-500/20 text-xs font-mono-sacred text-amber-200 uppercase tracking-widest animate-pulse">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>
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
