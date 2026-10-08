"use client";

import React, { useRef, useState, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Html } from "@react-three/drei";
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

const ROMAN_NUMERALS: Record<number, string> = {
  0: "0",
  1: "I",
  2: "II",
  3: "III",
  4: "IV",
  5: "V",
  6: "VI",
  7: "VII",
  8: "VIII",
  9: "IX",
  10: "X",
  11: "XI",
  12: "XII",
  13: "XIII",
  14: "XIV",
  15: "XV",
  16: "XVI",
  17: "XVII",
  18: "XVIII",
  19: "XIX",
  20: "XX",
  21: "XXI",
};

export function SpreadCardModel({
  cardData,
  positionCoordinates,
  isRevealed,
  onRevealClick,
  locale,
}: SpreadCardModelProps) {
  const [hovered, setHovered] = useState(false);
  const cardInfo = useMemo(() => getCardById(cardData.cardId), [cardData.cardId]);
  const cardBackTexture = useMemo(() => getCardBackTexture(), []);

  const cardFrontTexture = useMemo(() => {
    if (!cardInfo) return cardBackTexture;
    const displayName = getCardDisplayName(cardInfo, locale);

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

  // Materials: front, back, gold edges (matte linen finishes prevent blinding white glare)
  const materials = useMemo(() => {
    const goldEdgeMat = new THREE.MeshStandardMaterial({
      color: "#f5c542",
      emissive: "#d4af37",
      metalness: 0.90,
      roughness: 0.18,
    });

    const frontMat = new THREE.MeshStandardMaterial({
      map: cardFrontTexture,
      roughness: 0.45,
      metalness: 0.04,
    });

    const backMat = new THREE.MeshStandardMaterial({
      map: cardBackTexture,
      roughness: 0.58,
      metalness: 0.04,
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

    // Target Y-rotation: 0 for face-up, Math.PI for face-down
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
    const floatOffset = isRevealed ? Math.sin(time * 1.4 + cardData.positionIndex) * 0.025 : 0;
    const targetY = positionCoordinates.y + (isRevealed ? 0.04 : 0) + floatOffset + (hovered ? 0.10 : 0);
    outerGroupRef.current.position.y = THREE.MathUtils.damp(outerGroupRef.current.position.y, targetY, 4, delta);

    // Interactive cursor parallax tilt
    if (hovered) {
      outerGroupRef.current.rotation.x = THREE.MathUtils.damp(outerGroupRef.current.rotation.x, -state.pointer.y * 0.18, 6, delta);
      outerGroupRef.current.rotation.y = THREE.MathUtils.damp(outerGroupRef.current.rotation.y, state.pointer.x * 0.18, 6, delta);
    } else {
      outerGroupRef.current.rotation.x = THREE.MathUtils.damp(outerGroupRef.current.rotation.x, 0, 5, delta);
      outerGroupRef.current.rotation.y = THREE.MathUtils.damp(outerGroupRef.current.rotation.y, 0, 5, delta);
    }

    // Subtle scale spring on hover
    const targetScale = hovered ? 1.05 : 1.0;
    cardGroupRef.current.scale.setScalar(
      THREE.MathUtils.damp(cardGroupRef.current.scale.x, targetScale, 6, delta)
    );

    // Edge metallic foil shimmer
    const goldEdge = materials[0] as THREE.MeshStandardMaterial;
    goldEdge.metalness = 0.90;
    goldEdge.roughness = 0.18;
    const glowIntensity = isRevealed ? 0.75 : hovered ? 0.65 : 0.30;
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
        if (typeof document !== "undefined") document.body.style.cursor = "pointer";
        if (typeof window !== "undefined") mysticAudio.playButtonClick?.();
      }}
      onPointerOut={() => {
        setHovered(false);
        if (typeof document !== "undefined") document.body.style.cursor = "auto";
      }}
    >
      {/* Inner Rotatable Card Mesh Group */}
      <group ref={cardGroupRef} rotation={[0, Math.PI, 0]}>
        <mesh material={materials} castShadow receiveShadow>
          <boxGeometry args={[1.15, 1.95, 0.02]} />
        </mesh>

        {/* Soft, non-glaring golden aura */}
        <pointLight
          position={[0, 0, 0.45]}
          intensity={isRevealed ? 0.5 : 0.35}
          color="#fff4d0"
          distance={3.0}
        />
      </group>

      {/* Clean, elegant position title matching competitor (Screenshot 5) */}
      <Html position={[0, -1.22, 0]} center pointerEvents="none">
        <div className="flex flex-col items-center pointer-events-none select-none text-center whitespace-nowrap">
          <span className="font-serif-sacred text-xs sm:text-sm font-semibold text-amber-200 tracking-wide drop-shadow">
            {cardData.positionName || `Card ${cardData.positionIndex + 1}`}
          </span>
          {isRevealed && cardInfo && (
            <span className="font-sans text-[10.5px] text-amber-300/85 mt-0.5">
              {getCardDisplayName(cardInfo, locale)} {cardData.isReversed ? "· ↺" : ""}
            </span>
          )}
          {!isRevealed && (
            <span className="text-[9.5px] font-mono-sacred text-amber-400/70 mt-0.5 animate-pulse">
              ✦ Click to flip
            </span>
          )}
        </div>
      </Html>
    </group>
  );
}
