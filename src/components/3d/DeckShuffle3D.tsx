"use client";

import React, { useRef, useMemo, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getCardBackTexture } from "./cardTextures";

interface DeckShuffle3DProps {
  isShuffling: boolean;
  onShuffleComplete?: () => void;
}

export function DeckShuffle3D({ isShuffling, onShuffleComplete }: DeckShuffle3DProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [elapsed, setElapsed] = useState(0);
  const cardBackTexture = useMemo(() => getCardBackTexture(), []);

  // Material with gold rim
  const cardMaterial = useMemo(() => {
    return [
      new THREE.MeshStandardMaterial({ color: "#d4af37", metalness: 0.8, roughness: 0.3 }), // edge right
      new THREE.MeshStandardMaterial({ color: "#d4af37", metalness: 0.8, roughness: 0.3 }), // edge left
      new THREE.MeshStandardMaterial({ color: "#d4af37", metalness: 0.8, roughness: 0.3 }), // edge top
      new THREE.MeshStandardMaterial({ color: "#d4af37", metalness: 0.8, roughness: 0.3 }), // edge bottom
      new THREE.MeshStandardMaterial({ map: cardBackTexture, roughness: 0.4 }), // front
      new THREE.MeshStandardMaterial({ map: cardBackTexture, roughness: 0.4 }), // back
    ];
  }, [cardBackTexture]);

  // Create 32 representative stacked cards for the visual deck
  const stackCards = useMemo(() => {
    return Array.from({ length: 32 }, (_, i) => ({
      id: i,
      baseY: i * 0.015,
      offsetAngle: (Math.random() - 0.5) * 0.04,
    }));
  }, []);

  useFrame((_, delta) => {
    if (!isShuffling) return;

    setElapsed((prev) => {
      const next = prev + delta;
      if (next >= 2.4 && prev < 2.4) {
        if (onShuffleComplete) onShuffleComplete();
      }
      return next;
    });

    if (groupRef.current) {
      // Gentle rhythmic wobble during shuffle
      groupRef.current.rotation.y = Math.sin(elapsed * 4) * 0.15;
    }
  });

  return (
    <group ref={groupRef} position={[0, -0.2, 0]}>
      {stackCards.map((card) => {
        // Calculate shuffle displacement
        let xOffset = 0;
        let zOffset = 0;
        let yOffset = card.baseY;
        let rotZ = card.offsetAngle;

        if (isShuffling && elapsed < 2.2) {
          const progress = elapsed / 2.2;
          const phase = Math.sin(progress * Math.PI * 2);
          const isLeftPile = card.id % 2 === 0;

          // Split apart then interleave
          if (progress < 0.4) {
            // Cut into left and right
            xOffset = (isLeftPile ? -1.2 : 1.2) * (progress / 0.4);
            rotZ = (isLeftPile ? -0.2 : 0.2) * (progress / 0.4);
          } else if (progress < 0.8) {
            // Riffle shuffle cascade
            const delay = (card.id / 32) * 0.3;
            const riffleProgress = Math.max(0, Math.min(1, (progress - 0.4 - delay) / 0.2));
            xOffset = (isLeftPile ? -1.2 : 1.2) * (1 - riffleProgress);
            yOffset = card.baseY + Math.sin(riffleProgress * Math.PI) * 0.5;
            rotZ = (isLeftPile ? -0.2 : 0.2) * (1 - riffleProgress);
          } else {
            // Snap back into solid squared deck with slight gold shine
            xOffset = 0;
            rotZ = card.offsetAngle;
          }
        }

        return (
          <mesh
            key={card.id}
            position={[xOffset, yOffset, zOffset]}
            rotation={[-Math.PI / 2, 0, rotZ]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[1.0, 1.7, 0.012]} />
            <primitive object={cardMaterial} attach="material" />
          </mesh>
        );
      })}

      {/* Altar velvet base shadow disc */}
      <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2.5, 32]} />
        <meshBasicMaterial color="#05030a" transparent opacity={0.6} />
      </mesh>
    </group>
  );
}
