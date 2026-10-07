"use client";

import React, { useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { DrawnCardData, Locale } from "@/types/tarot";
import { getCardById, getCardDisplayName } from "@/lib/tarot/data";
import { getCardBackTexture, getCardFrontTexture } from "./cardTextures";
import { mysticAudio } from "@/lib/audio/soundscape";

interface SpreadCardModelProps {
  cardData: DrawnCardData;
  positionCoordinates: { x: number; y: number; z: number };
  isRevealed: boolean;
  onRevealClick: () => void;
  locale: Locale;
}

// Roman numeral lookup for Major Arcana
const ROMAN_NUMERALS = [
  "0", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX",
  "X", "XI", "XII", "XIII", "XIV", "XV", "XVI", "XVII", "XVIII", "XIX",
  "XX", "XXI",
];

export function SpreadCardModel({
  cardData,
  positionCoordinates,
  isRevealed,
  onRevealClick,
  locale,
}: SpreadCardModelProps) {
  const meshRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const cardInfo = useMemo(() => getCardById(cardData.cardId), [cardData.cardId]);
  const cardBackTexture = useMemo(() => getCardBackTexture(), []);

  const cardFrontTexture = useMemo(() => {
    if (!cardInfo) return cardBackTexture;
    const displayName = getCardDisplayName(cardInfo, locale);

    // Determine numeral
    let numeral: string | undefined;
    if (cardInfo.arcana === "major" && cardInfo.number !== undefined) {
      numeral = ROMAN_NUMERALS[cardInfo.number] || String(cardInfo.number);
    }

    return getCardFrontTexture(
      cardInfo.id,
      displayName,
      cardInfo.arcana,
      cardInfo.suit,
      cardInfo.keywords.upright,
      numeral
    );
  }, [cardInfo, cardBackTexture, locale]);

  // Materials: front, back, gold edges
  const materials = useMemo(() => {
    const goldEdgeMat = new THREE.MeshStandardMaterial({
      color: "#f5c542",
      emissive: "#d4af37",
      metalness: 0.92,
      roughness: 0.16,
    });

    const frontMat = new THREE.MeshStandardMaterial({
      map: cardFrontTexture,
      roughness: 0.25,
      metalness: 0.08,
    });

    const backMat = new THREE.MeshStandardMaterial({
      map: cardBackTexture,
      roughness: 0.25,
      metalness: 0.12,
    });

    // Box order: right, left, top, bottom, front (+Z), back (-Z)
    return [goldEdgeMat, goldEdgeMat, goldEdgeMat, goldEdgeMat, frontMat, backMat];
  }, [cardFrontTexture, cardBackTexture]);

  const outerGroupRef = useRef<THREE.Group>(null);
  const cardGroupRef = useRef<THREE.Group>(null);
  const flipProgress = useRef(isRevealed ? 1 : 0);

  useFrame((state, delta) => {
    if (!cardGroupRef.current || !outerGroupRef.current) return;

    // Smoothly progress flip state
    const targetFlip = isRevealed ? 1 : 0;
    flipProgress.current = THREE.MathUtils.damp(flipProgress.current, targetFlip, 4.5, delta);

    // Target Y-rotation: 0 for face-up (front faces camera), Math.PI for face-down
    const targetRotY = THREE.MathUtils.lerp(Math.PI, 0, flipProgress.current);

    // If card is reversed, rotate 180 deg around Z axis smoothly
    const targetRotZ = cardData.isReversed ? THREE.MathUtils.lerp(0, Math.PI, flipProgress.current) : 0;

    cardGroupRef.current.rotation.y = targetRotY;
    cardGroupRef.current.rotation.z = targetRotZ;

    // Parabolic arc lift during flipping: card lifts towards camera as it turns
    const arcLift = Math.sin(flipProgress.current * Math.PI) * 0.45;
    cardGroupRef.current.position.z = arcLift;

    // Floating breathing elevation when revealed
    const time = state.clock.getElapsedTime();
    const floatOffset = isRevealed ? Math.sin(time * 1.4 + cardData.positionIndex) * 0.03 : 0;
    const targetY = positionCoordinates.y + (isRevealed ? 0.05 : 0) + floatOffset + (hovered ? 0.12 : 0);
    outerGroupRef.current.position.y = THREE.MathUtils.damp(outerGroupRef.current.position.y, targetY, 4, delta);

    // Interactive cursor parallax tilt
    if (hovered) {
      outerGroupRef.current.rotation.x = THREE.MathUtils.damp(outerGroupRef.current.rotation.x, -state.pointer.y * 0.22, 6, delta);
      outerGroupRef.current.rotation.y = THREE.MathUtils.damp(outerGroupRef.current.rotation.y, state.pointer.x * 0.22, 6, delta);
    } else {
      outerGroupRef.current.rotation.x = THREE.MathUtils.damp(outerGroupRef.current.rotation.x, 0, 5, delta);
      outerGroupRef.current.rotation.y = THREE.MathUtils.damp(outerGroupRef.current.rotation.y, 0, 5, delta);
    }

    // Subtle scale spring on hover
    const targetScale = hovered ? 1.05 : 1.0;
    cardGroupRef.current.scale.setScalar(
      THREE.MathUtils.damp(cardGroupRef.current.scale.x, targetScale, 6, delta)
    );

    // Edge metallic foil shimmer: high contrast baseline glow so cards pop out against black space
    const goldEdge = materials[0] as THREE.MeshStandardMaterial;
    goldEdge.metalness = 0.94;
    goldEdge.roughness = 0.14;
    const glowIntensity = isRevealed ? 0.85 : hovered ? 0.7 : 0.35;
    const shimmer = Math.sin(time * 3 + cardData.positionIndex) * 0.25 + 0.75;
    goldEdge.emissive.setRGB(0.95 * glowIntensity * shimmer, 0.76 * glowIntensity * shimmer, 0.24 * glowIntensity * shimmer);
  });

  return (
    <group
      ref={outerGroupRef}
      position={[positionCoordinates.x, positionCoordinates.y, positionCoordinates.z]}
      onClick={(e) => {
        e.stopPropagation();
        onRevealClick();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = "pointer";
        if (typeof window !== "undefined") mysticAudio.playButtonClick?.();
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = "auto";
      }}
    >
      {/* Inner Rotatable Card Mesh Group */}
      <group ref={cardGroupRef} rotation={[0, Math.PI, 0]}>
        <mesh material={materials} castShadow receiveShadow>
          <boxGeometry args={[1.15, 1.95, 0.02]} />
        </mesh>

        {/* Dedicated Golden Aura Illuminating both face-down and face-up states */}
        <pointLight
          position={[0, 0, 0.45]}
          intensity={isRevealed ? 1.2 : 0.85}
          color={isRevealed ? "#ffe885" : "#fef08a"}
          distance={3.8}
        />
      </group>

      {/* Floating Sacred Position, Card Name & Orientation Badge */}
      <Html position={[0, -1.25, 0]} center pointerEvents="none">
        <div className="flex flex-col items-center pointer-events-none whitespace-nowrap select-none drop-shadow-lg gap-1">
          {/* Position Name */}
          <span className="font-mono-sacred text-[10px] px-2.5 py-0.5 rounded-full bg-black/90 backdrop-blur-md border border-amber-400/50 text-amber-300 uppercase tracking-wider shadow-lg">
            {cardData.positionName || `Position ${cardData.positionIndex + 1}`}
          </span>

          {/* Official Card Name (Always clearly shown when revealed, e.g. "Four of Cups", "Temperance") */}
          {isRevealed && cardInfo && (
            <span className="font-serif-sacred text-[11px] font-bold px-3 py-0.5 rounded-full bg-gradient-to-r from-amber-950/90 via-black/90 to-amber-950/90 border border-amber-400/70 text-amber-100 uppercase tracking-wide shadow-xl drop-shadow">
              ✦ {getCardDisplayName(cardInfo, locale)} ✦
            </span>
          )}

          {/* Orientation Badge */}
          {isRevealed && (
            <span
              className={`font-mono-sacred text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest ${
                cardData.isReversed
                  ? "bg-purple-950/90 border border-purple-400/60 text-purple-200"
                  : "bg-amber-950/90 border border-amber-400/60 text-amber-200"
              }`}
            >
              {cardData.isReversed ? "Reversed ↺" : "Upright ↑"}
            </span>
          )}
          {!isRevealed && (
            <span className="text-[9px] font-mono-sacred text-amber-400 mt-0.5 animate-pulse flex items-center gap-1">
              <span>✦</span> Click to flip
            </span>
          )}
        </div>
      </Html>
    </group>
  );
}
