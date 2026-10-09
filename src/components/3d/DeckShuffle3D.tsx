"use client";

import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getCardBackTexture, getCardFrontTexture } from "./cardTextures";
import { allCards } from "@/lib/tarot/data";

interface DeckShuffle3DProps {
  isShuffling: boolean;
  onShuffleComplete?: () => void;
  isCollapsing?: boolean;
}

interface RibbonCardNode {
  id: number;
  layer: number; // 0 = inner, 1 = outer, 2 = crown
  baseAngle: number;
  radius: number;
  speed: number;
  baseY: number;
  showFront: boolean;
  cardIndex: number;
}

export function DeckShuffle3D({
  isShuffling,
  onShuffleComplete,
  isCollapsing = false,
}: DeckShuffle3DProps) {
  const groupRef = useRef<THREE.Group>(null);
  const cardBackTexture = useMemo(() => getCardBackTexture(), []);

  // Shared gold edge material with subtle metallic sheen
  const goldEdgeMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#d4af37",
        metalness: 0.9,
        roughness: 0.18,
      }),
    []
  );

  const backMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: cardBackTexture,
        roughness: 0.32,
        metalness: 0.1,
      }),
    [cardBackTexture]
  );

  // Generate 52 collision-free cards distributed across 3 stratified non-intersecting orbital tracks
  // Inner ring: 18 cards (radius 2.05)
  // Outer ring: 22 cards (radius 3.15)
  // Crown ring: 12 cards (radius 2.60, elevated Y +0.85)
  const ribbonCards = useMemo<RibbonCardNode[]>(() => {
    const nodes: RibbonCardNode[] = [];
    let idCounter = 0;

    // Layer 0: Inner ring (18 cards)
    const count0 = 18;
    for (let i = 0; i < count0; i++) {
      nodes.push({
        id: idCounter++,
        layer: 0,
        baseAngle: (i / count0) * Math.PI * 2,
        radius: 2.05,
        speed: 0.52,
        baseY: -0.15,
        showFront: i % 3 === 0,
        cardIndex: (idCounter * 3) % allCards.length,
      });
    }

    // Layer 1: Outer counter-rotating ring (22 cards)
    const count1 = 22;
    for (let i = 0; i < count1; i++) {
      nodes.push({
        id: idCounter++,
        layer: 1,
        baseAngle: (i / count1) * Math.PI * 2,
        radius: 3.15,
        speed: -0.38,
        baseY: 0.05,
        showFront: i % 2 === 0,
        cardIndex: (idCounter * 5) % allCards.length,
      });
    }

    // Layer 2: Elevated Crown ring (12 cards)
    const count2 = 12;
    for (let i = 0; i < count2; i++) {
      nodes.push({
        id: idCounter++,
        layer: 2,
        baseAngle: (i / count2) * Math.PI * 2,
        radius: 2.60,
        speed: 0.42,
        baseY: 0.82,
        showFront: i % 2 === 1,
        cardIndex: (idCounter * 7) % allCards.length,
      });
    }

    return nodes;
  }, []);

  // Golden celestial stardust particles orbiting around the vortex
  const particleGeo = useMemo(() => {
    const pCount = 140;
    const positions = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount; i++) {
      const angle = (i / pCount) * Math.PI * 2;
      const radius = 2.1 + (i % 5) * 0.28;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = (Math.sin(i * 1.5) - 0.2) * 1.2;
      positions[i * 3 + 2] = Math.sin(angle) * radius;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geo;
  }, []);

  // Smooth gentle levitation of the entire cosmic group
  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();
    const groupSpeed = isCollapsing ? 0.8 : 0.15;
    groupRef.current.rotation.y += delta * groupSpeed;
    groupRef.current.position.y = THREE.MathUtils.damp(
      groupRef.current.position.y,
      Math.sin(t * 0.7) * 0.05,
      2,
      delta
    );
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Central mystical pulsating core light */}
      <pointLight position={[0, 0, 0]} intensity={isCollapsing ? 4.5 : 3.0} color="#ffd875" distance={10} />
      <pointLight position={[0, 0.6, 0]} intensity={1.8} color="#c084fc" distance={8} />

      {/* Orbiting Stardust Particles */}
      <points geometry={particleGeo}>
        <pointsMaterial
          size={0.035}
          color="#ffd56b"
          transparent
          opacity={isCollapsing ? 0.25 : 0.75}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {ribbonCards.map((card) => (
        <RibbonCardMesh
          key={card.id}
          card={card}
          edgeMat={goldEdgeMat}
          backMat={backMat}
          isCollapsing={isCollapsing}
        />
      ))}
    </group>
  );
}

function RibbonCardMesh({
  card,
  edgeMat,
  backMat,
  isCollapsing,
}: {
  card: RibbonCardNode;
  edgeMat: THREE.Material;
  backMat: THREE.Material;
  isCollapsing: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  const frontMat = useMemo(() => {
    if (!card.showFront) return backMat;
    const tarotCard = allCards[card.cardIndex] || allCards[0];
    const tex = getCardFrontTexture(
      tarotCard.id,
      tarotCard.name.en,
      tarotCard.arcana,
      tarotCard.suit,
      tarotCard.keywords.upright,
      tarotCard.number !== undefined ? String(tarotCard.number) : undefined
    );
    return new THREE.MeshStandardMaterial({
      map: tex,
      roughness: 0.35,
      metalness: 0.1,
    });
  }, [card.showFront, card.cardIndex, backMat]);

  const materials = useMemo(
    () => [edgeMat, edgeMat, edgeMat, edgeMat, frontMat, backMat],
    [edgeMat, frontMat, backMat]
  );

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime();

    if (isCollapsing) {
      // Magnetic glide into central stacked deck at [0, -0.2, 0] without colliding
      const stackY = -0.2 + (card.id % 52) * 0.007;
      meshRef.current.position.x = THREE.MathUtils.damp(meshRef.current.position.x, 0, 7.5, delta);
      meshRef.current.position.y = THREE.MathUtils.damp(meshRef.current.position.y, stackY, 7.5, delta);
      meshRef.current.position.z = THREE.MathUtils.damp(meshRef.current.position.z, 0, 7.5, delta);

      meshRef.current.rotation.x = THREE.MathUtils.damp(meshRef.current.rotation.x, -Math.PI / 2, 7.5, delta);
      meshRef.current.rotation.y = THREE.MathUtils.damp(meshRef.current.rotation.y, 0, 7.5, delta);
      meshRef.current.rotation.z = THREE.MathUtils.damp(meshRef.current.rotation.z, (card.id % 7 - 3) * 0.012, 7.5, delta);

      meshRef.current.scale.setScalar(THREE.MathUtils.damp(meshRef.current.scale.x, 0.95, 5, delta));
      return;
    }

    // Synchronized collision-free orbital movement along the card's track
    const angle = card.baseAngle + time * card.speed;
    const undulation = Math.sin(angle * 2 + time * 1.2) * 0.12;

    const targetX = Math.cos(angle) * card.radius;
    const targetY = card.baseY + undulation;
    const targetZ = Math.sin(angle) * card.radius;

    // Smooth position damp
    meshRef.current.position.x = THREE.MathUtils.damp(meshRef.current.position.x, targetX, 6, delta);
    meshRef.current.position.y = THREE.MathUtils.damp(meshRef.current.position.y, targetY, 6, delta);
    meshRef.current.position.z = THREE.MathUtils.damp(meshRef.current.position.z, targetZ, 6, delta);

    // Tangential orientation aligned with flight path — completely eliminates surface-clipping intersections!
    // Facing outward slightly banked towards the center
    const targetRotY = -angle + Math.PI / 2;
    const targetRotX = 0.18 * Math.sin(angle + time); // gentle aerodynamic bank
    const targetRotZ = 0.08 * Math.cos(angle * 2 + time); // subtle float wave

    meshRef.current.rotation.x = THREE.MathUtils.damp(meshRef.current.rotation.x, targetRotX, 6, delta);
    meshRef.current.rotation.y = THREE.MathUtils.damp(meshRef.current.rotation.y, targetRotY, 6, delta);
    meshRef.current.rotation.z = THREE.MathUtils.damp(meshRef.current.rotation.z, targetRotZ, 6, delta);
  });

  return (
    <mesh ref={meshRef} material={materials} castShadow receiveShadow>
      <boxGeometry args={[0.50, 0.88, 0.01]} />
    </mesh>
  );
}
