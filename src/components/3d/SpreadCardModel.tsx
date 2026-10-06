"use client";

import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { DrawnCardData, Locale } from "@/types/tarot";
import { getCardById, getCardDisplayName } from "@/lib/tarot/data";
import { getCardBackTexture, getCardFrontTexture } from "./cardTextures";

interface SpreadCardModelProps {
  cardData: DrawnCardData;
  positionCoordinates: { x: number; y: number; z: number };
  isRevealed: boolean;
  onRevealClick: () => void;
  locale: Locale;
}

export function SpreadCardModel({
  cardData,
  positionCoordinates,
  isRevealed,
  onRevealClick,
  locale,
}: SpreadCardModelProps) {
  const meshRef = useRef<THREE.Group>(null);
  const cardInfo = useMemo(() => getCardById(cardData.cardId), [cardData.cardId]);
  const cardBackTexture = useMemo(() => getCardBackTexture(), []);

  const cardFrontTexture = useMemo(() => {
    if (!cardInfo) return cardBackTexture;
    const displayName = getCardDisplayName(cardInfo, locale);
    return getCardFrontTexture(
      displayName,
      cardInfo.arcana,
      cardInfo.suit,
      cardInfo.keywords.upright
    );
  }, [cardInfo, cardBackTexture, locale]);

  // Materials: front, back, gold edges
  const materials = useMemo(() => {
    const goldEdgeMat = new THREE.MeshStandardMaterial({
      color: "#d4af37",
      metalness: 0.85,
      roughness: 0.25,
    });

    const frontMat = new THREE.MeshStandardMaterial({
      map: cardFrontTexture,
      roughness: 0.35,
    });

    const backMat = new THREE.MeshStandardMaterial({
      map: cardBackTexture,
      roughness: 0.35,
    });

    // Box order: right, left, top, bottom, front (+Z), back (-Z)
    return [goldEdgeMat, goldEdgeMat, goldEdgeMat, goldEdgeMat, frontMat, backMat];
  }, [cardFrontTexture, cardBackTexture]);

  useFrame((_, delta) => {
    if (!meshRef.current) return;

    // Target Y-rotation: 0 for face-down (showing back), Math.PI for face-up (showing front)
    // Front face is +Z in Three.js BoxGeometry; if default faces +Z, back face is -Z.
    // If not revealed, rotation Y is Math.PI (back faces camera). If revealed, rotation Y is 0.
    const targetRotY = isRevealed ? 0 : Math.PI;

    // If card is reversed, rotate 180 deg around Z axis
    const targetRotZ = isRevealed && cardData.isReversed ? Math.PI : 0;

    meshRef.current.rotation.y = THREE.MathUtils.damp(meshRef.current.rotation.y, targetRotY, 5, delta);
    meshRef.current.rotation.z = THREE.MathUtils.damp(meshRef.current.rotation.z, targetRotZ, 5, delta);

    // Slight hovering elevation when revealed
    const targetY = positionCoordinates.y + (isRevealed ? 0.08 : 0);
    meshRef.current.position.y = THREE.MathUtils.damp(meshRef.current.position.y, targetY, 4, delta);
  });

  return (
    <group
      ref={meshRef}
      position={[positionCoordinates.x, positionCoordinates.y, positionCoordinates.z]}
      rotation={[0, Math.PI, 0]}
      onClick={(e) => {
        e.stopPropagation();
        onRevealClick();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "auto";
      }}
    >
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.15, 1.95, 0.02]} />
        <primitive object={materials} attach="material" />
      </mesh>

      {/* Gold halo aura upon reveal */}
      {isRevealed && (
        <pointLight position={[0, 0, 0.4]} intensity={0.6} color="#f9e295" distance={3} />
      )}
    </group>
  );
}
