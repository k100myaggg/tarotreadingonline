"use client";

import React, { useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useReadingStore } from "@/stores/useReadingStore";
import { getCardBackTexture } from "./cardTextures";

interface FloatingCardItemProps {
  index: number;
  basePosition: [number, number, number];
  baseRotation: [number, number, number];
  isSelected: boolean;
  onSelect: (index: number) => void;
}

function FloatingCardItem({
  index,
  basePosition,
  baseRotation,
  isSelected,
  onSelect,
}: FloatingCardItemProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const cardBackTexture = useMemo(() => getCardBackTexture(), []);

  // Material setup: glowing gold edges when hovered or selected
  const materials = useMemo(() => {
    const edgeColor = isSelected ? "#f9e295" : hovered ? "#f3e5ab" : "#d4af37";
    const emissiveColor = isSelected ? "#997d26" : hovered ? "#5c4914" : "#000000";

    const edgeMat = new THREE.MeshStandardMaterial({
      color: edgeColor,
      emissive: emissiveColor,
      metalness: 0.8,
      roughness: 0.2,
    });

    const faceMat = new THREE.MeshStandardMaterial({
      map: cardBackTexture,
      roughness: 0.35,
    });

    return [edgeMat, edgeMat, edgeMat, edgeMat, faceMat, faceMat];
  }, [cardBackTexture, hovered, isSelected]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime();

    // Gentle floating breathing motion
    const floatOffset = Math.sin(time * 1.5 + index * 0.2) * 0.08;

    let targetY = basePosition[1] + floatOffset;
    let targetZ = basePosition[2];

    if (isSelected) {
      targetY += 0.45;
      targetZ += 0.35;
    } else if (hovered) {
      targetY += 0.25;
      targetZ += 0.2;
    }

    // Smooth lerp toward target positions
    meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, targetY, 0.1);
    meshRef.current.position.z = THREE.MathUtils.lerp(meshRef.current.position.z, targetZ, 0.1);

    // Subtle tilt towards camera on hover
    if (hovered || isSelected) {
      meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, 0.05, 0.1);
    } else {
      meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, baseRotation[0], 0.1);
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={basePosition}
      rotation={baseRotation}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setHovered(false);
        document.body.style.cursor = "auto";
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(index);
      }}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[0.85, 1.45, 0.015]} />
      <primitive object={materials} attach="material" />
    </mesh>
  );
}

export function FloatingCardField() {
  const { userPickIndices, togglePickIndex } = useReadingStore();

  // Position 78 cards along a graceful 3-tier curved celestial amphitheater
  const cardLayouts = useMemo(() => {
    const total = 78;
    const rows = 3;
    const cardsPerRow = 26;
    const radius = 6.8;

    return Array.from({ length: total }, (_, i) => {
      const rowIndex = Math.floor(i / cardsPerRow); // 0, 1, 2
      const colIndex = i % cardsPerRow; // 0..25

      // Angle spanning ~140 degrees arc in front of user
      const angle = -1.2 + (colIndex / (cardsPerRow - 1)) * 2.4;

      const x = Math.sin(angle) * radius;
      const z = -Math.cos(angle) * radius + 5.5; // push arc into view
      const y = (rowIndex - 1) * 1.65; // row height separation

      // Face toward center arc
      const rotY = -angle;
      const rotX = 0;
      const rotZ = 0;

      return {
        index: i,
        position: [x, y, z] as [number, number, number],
        rotation: [rotX, rotY, rotZ] as [number, number, number],
      };
    });
  }, []);

  return (
    <group position={[0, 0, 0]}>
      {cardLayouts.map((card) => (
        <FloatingCardItem
          key={card.index}
          index={card.index}
          basePosition={card.position}
          baseRotation={card.rotation}
          isSelected={userPickIndices.includes(card.index)}
          onSelect={togglePickIndex}
        />
      ))}
    </group>
  );
}
