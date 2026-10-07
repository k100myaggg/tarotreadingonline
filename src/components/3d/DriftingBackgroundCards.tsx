"use client";

import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getCardBackTexture, getCardFrontTexture } from "./cardTextures";
import { allCards } from "@/lib/tarot/data";

interface DriftingCardData {
  id: number;
  basePos: THREE.Vector3;
  baseRot: THREE.Euler;
  speed: number;
  rotSpeed: THREE.Vector3;
  scale: number;
  showFront: boolean;
  cardIndex: number;
}

export function DriftingBackgroundCards() {
  const groupRef = useRef<THREE.Group>(null);
  const cardBackTexture = useMemo(() => getCardBackTexture(), []);

  // Pre-generate 28 drifting cards scattered across the periphery and deep z-space
  const driftingCards = useMemo<DriftingCardData[]>(() => {
    const list: DriftingCardData[] = [];
    // Select an assortment of prominent cards
    const sampleIndices = [0, 1, 2, 6, 10, 13, 16, 17, 18, 19, 21, 22, 35, 45, 55, 60, 68, 77];

    for (let i = 0; i < 24; i++) {
      // Distribute in a wide spherical halo avoiding the direct center where the question box sits
      const angle = (i / 24) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
      const radius = 5.5 + Math.random() * 6.5; // push outward away from center query card
      const x = Math.cos(angle) * radius;
      const y = (Math.random() - 0.5) * 6.5;
      const z = -2.5 - Math.random() * 7.5; // mostly in the midground and deep background

      const rotX = (Math.random() - 0.5) * 0.8;
      const rotY = (Math.random() - 0.5) * 0.8;
      const rotZ = (Math.random() - 0.5) * 0.8;

      list.push({
        id: i,
        basePos: new THREE.Vector3(x, y, z),
        baseRot: new THREE.Euler(rotX, rotY, rotZ),
        speed: 0.3 + Math.random() * 0.5,
        rotSpeed: new THREE.Vector3(
          (Math.random() - 0.5) * 0.15,
          (Math.random() - 0.5) * 0.2,
          (Math.random() - 0.5) * 0.1
        ),
        scale: 0.75 + Math.random() * 0.3,
        showFront: i % 3 === 0, // 1 in 3 cards show their face, rest show sacred card back
        cardIndex: sampleIndices[i % sampleIndices.length],
      });
    }

    return list;
  }, []);

  // Material caches
  const edgeMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#d4af37",
        metalness: 0.8,
        roughness: 0.25,
      }),
    []
  );

  const backMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: cardBackTexture,
        roughness: 0.35,
        metalness: 0.1,
      }),
    [cardBackTexture]
  );

  // Group rotation and drifting motion
  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const time = state.clock.getElapsedTime();

    // Gentle cosmos rotation
    groupRef.current.rotation.y = time * 0.02;

    // Subtle breathing wobble
    groupRef.current.position.y = Math.sin(time * 0.2) * 0.1;
  });

  return (
    <group ref={groupRef}>
      {driftingCards.map((item) => (
        <DriftingCardItem
          key={item.id}
          data={item}
          edgeMat={edgeMaterial}
          backMat={backMaterial}
        />
      ))}
    </group>
  );
}

function DriftingCardItem({
  data,
  edgeMat,
  backMat,
}: {
  data: DriftingCardData;
  edgeMat: THREE.Material;
  backMat: THREE.Material;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  const frontMat = useMemo(() => {
    if (!data.showFront) return backMat;
    const card = allCards[data.cardIndex] || allCards[0];
    const tex = getCardFrontTexture(
      card.id,
      card.name.en,
      card.arcana,
      card.suit,
      card.keywords.upright,
      card.number !== undefined ? String(card.number) : undefined
    );
    return new THREE.MeshStandardMaterial({
      map: tex,
      roughness: 0.35,
      metalness: 0.1,
    });
  }, [data.showFront, data.cardIndex, backMat]);

  // Order: +X, -X, +Y, -Y, +Z (front), -Z (back)
  const materials = useMemo(
    () => [edgeMat, edgeMat, edgeMat, edgeMat, frontMat, backMat],
    [edgeMat, frontMat, backMat]
  );

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime() * data.speed;

    // Organic drift
    meshRef.current.position.y = data.basePos.y + Math.sin(t + data.id) * 0.3;
    meshRef.current.position.x = data.basePos.x + Math.cos(t * 0.7 + data.id) * 0.2;
    meshRef.current.position.z = data.basePos.z + Math.sin(t * 0.5 + data.id) * 0.25;

    // Gentle tumbling rotation
    meshRef.current.rotation.x = data.baseRot.x + Math.sin(t * 0.6) * 0.15;
    meshRef.current.rotation.y = data.baseRot.y + Math.cos(t * 0.5) * 0.2;
    meshRef.current.rotation.z = data.baseRot.z + Math.sin(t * 0.4) * 0.1;
  });

  return (
    <mesh
      ref={meshRef}
      position={[data.basePos.x, data.basePos.y, data.basePos.z]}
      rotation={[data.baseRot.x, data.baseRot.y, data.baseRot.z]}
      scale={[data.scale, data.scale, data.scale]}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[0.9, 1.5, 0.015]} />
      {materials.map((mat, i) => (
        <primitive key={i} object={mat} attach={`material-${i}`} />
      ))}
    </mesh>
  );
}
