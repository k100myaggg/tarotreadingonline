"use client";

import React, { useRef, useMemo, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getCardBackTexture, getCardFrontTexture } from "./cardTextures";
import { allCards } from "@/lib/tarot/data";

interface DeckShuffle3DProps {
  isShuffling: boolean;
  onShuffleComplete?: () => void;
  isCollapsing?: boolean;
}

interface VortexCardNode {
  id: number;
  // Spherical coordinates
  theta: number; // azimuth
  phi: number;   // polar
  radius: number;
  orbitSpeed: number;
  tumbleSpeedX: number;
  tumbleSpeedY: number;
  tumbleSpeedZ: number;
  initialRot: THREE.Euler;
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

  // Generate 52 vortex tumbling cards distributed on a Golden Spiral Torus for ultra-smooth fluid flow
  const vortexCards = useMemo<VortexCardNode[]>(() => {
    const total = 52;
    const nodes: VortexCardNode[] = [];
    const phiRatio = (1 + Math.sqrt(5)) / 2;

    for (let i = 0; i < total; i++) {
      const y = 1 - (i / (total - 1)) * 2;
      const theta = (2 * Math.PI * i) / phiRatio;
      const sphereRadius = 1.7 + (i % 5) * 0.18;

      nodes.push({
        id: i,
        theta,
        phi: Math.acos(y),
        radius: sphereRadius,
        orbitSpeed: 0.5 + (i % 3) * 0.15,
        tumbleSpeedX: 0.4 + (i % 7) * 0.08,
        tumbleSpeedY: 0.35 + (i % 5) * 0.09,
        tumbleSpeedZ: 0.28 + (i % 6) * 0.07,
        initialRot: new THREE.Euler(
          (i * 0.6) % (Math.PI * 2),
          (i * 1.1) % (Math.PI * 2),
          (i * 0.8) % (Math.PI * 2)
        ),
        showFront: i % 2 === 0,
        cardIndex: i % allCards.length,
      });
    }

    return nodes;
  }, []);

  // Golden Celestial Stardust Particles around the vortex
  const particleGeo = useMemo(() => {
    const pCount = 120;
    const positions = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount; i++) {
      const angle = (i / pCount) * Math.PI * 2;
      const radius = 2.0 + Math.sin(i * 4) * 0.8;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 1.8;
      positions[i * 3 + 2] = Math.sin(angle) * radius;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geo;
  }, []);

  // Whole vortex slow rotation and levitation
  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();
    const rotSpeed = isCollapsing ? 1.2 : 0.28;
    groupRef.current.rotation.y += delta * rotSpeed;
    groupRef.current.rotation.x = THREE.MathUtils.damp(
      groupRef.current.rotation.x,
      Math.sin(t * 0.3) * 0.08,
      2,
      delta
    );
    groupRef.current.position.y = THREE.MathUtils.damp(
      groupRef.current.position.y,
      Math.sin(t * 0.6) * 0.06,
      2,
      delta
    );
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Central mystical pulsing core light */}
      <pointLight position={[0, 0, 0]} intensity={isCollapsing ? 4.5 : 2.8} color="#ffd875" distance={10} />
      <pointLight position={[0, 0.5, 0]} intensity={1.5} color="#c084fc" distance={8} />

      {/* Orbiting Stardust Particles */}
      <points geometry={particleGeo}>
        <pointsMaterial
          size={0.035}
          color="#ffd56b"
          transparent
          opacity={isCollapsing ? 0.3 : 0.75}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {vortexCards.map((card) => (
        <VortexCardMesh
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

function VortexCardMesh({
  card,
  edgeMat,
  backMat,
  isCollapsing,
}: {
  card: VortexCardNode;
  edgeMat: THREE.Material;
  backMat: THREE.Material;
  isCollapsing: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const currentPos = useRef(new THREE.Vector3());
  const currentRot = useRef(new THREE.Euler());

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
      // Butter-smooth magnetic snap into central stacked deck at [0, -0.2, 0]
      const stackY = -0.2 + (card.id % 24) * 0.009;
      meshRef.current.position.x = THREE.MathUtils.damp(meshRef.current.position.x, 0, 7, delta);
      meshRef.current.position.y = THREE.MathUtils.damp(meshRef.current.position.y, stackY, 7, delta);
      meshRef.current.position.z = THREE.MathUtils.damp(meshRef.current.position.z, 0, 7, delta);

      meshRef.current.rotation.x = THREE.MathUtils.damp(meshRef.current.rotation.x, -Math.PI / 2, 7, delta);
      meshRef.current.rotation.y = THREE.MathUtils.damp(meshRef.current.rotation.y, 0, 7, delta);
      meshRef.current.rotation.z = THREE.MathUtils.damp(meshRef.current.rotation.z, (card.id % 7 - 3) * 0.015, 7, delta);

      // Subtle scale compression
      meshRef.current.scale.setScalar(THREE.MathUtils.damp(meshRef.current.scale.x, 0.95, 5, delta));
      return;
    }

    // Dynamic fluid orbital swirl: golden ratio angles modulated by harmonic time
    const angle = card.theta + time * card.orbitSpeed * 0.45;
    const r = card.radius + Math.sin(time * 1.1 + card.id * 0.3) * 0.18;

    const targetX = r * Math.sin(card.phi) * Math.cos(angle);
    const targetY = r * Math.cos(card.phi) + Math.sin(time * 0.9 + card.id * 0.4) * 0.15;
    const targetZ = r * Math.sin(card.phi) * Math.sin(angle);

    // Silky position damp
    meshRef.current.position.x = THREE.MathUtils.damp(meshRef.current.position.x, targetX, 5, delta);
    meshRef.current.position.y = THREE.MathUtils.damp(meshRef.current.position.y, targetY, 5, delta);
    meshRef.current.position.z = THREE.MathUtils.damp(meshRef.current.position.z, targetZ, 5, delta);

    // Natural graceful tumbling
    const rotSpeedFactor = 0.5;
    meshRef.current.rotation.x += delta * card.tumbleSpeedX * rotSpeedFactor;
    meshRef.current.rotation.y += delta * card.tumbleSpeedY * rotSpeedFactor;
    meshRef.current.rotation.z += delta * card.tumbleSpeedZ * rotSpeedFactor;
  });

  return (
    <mesh ref={meshRef} castShadow receiveShadow>
      <boxGeometry args={[0.55, 0.94, 0.01]} />
      {materials.map((mat, i) => (
        <primitive key={i} object={mat} attach={`material-${i}`} />
      ))}
    </mesh>
  );
}
