"use client";

import React, { Suspense, useEffect, useState } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { OrbitControls } from "@react-three/drei";
import { StarfieldNebula } from "./StarfieldNebula";
import { DriftingBackgroundCards } from "./DriftingBackgroundCards";
import { DeckShuffle3D } from "./DeckShuffle3D";
import { DeckCut3D } from "./DeckCut3D";
import { FloatingCardField } from "./FloatingCardField";
import { SpreadCardModel } from "./SpreadCardModel";
import { useReadingStore } from "@/stores/useReadingStore";
import { getSpreadById } from "@/lib/tarot/data";
import { Locale } from "@/types/tarot";

interface TarotCanvasProps {
  locale: Locale;
  onShuffleFinished?: () => void;
  isCollapsing?: boolean;
  className?: string;
}

function CameraController({ step }: { step: string }) {
  const { camera } = useThree();

  useFrame((_, delta) => {
    // Cinematic camera positions calibrated for full-screen immersion
    let targetZ = 6.0;
    let targetY = 0;
    let targetFov = 50;

    if (step === "question") {
      targetZ = 6.4;
      targetY = 0.1;
    } else if (step === "shuffling") {
      targetZ = 4.8;
      targetY = 0.15;
    } else if (step === "cutting") {
      targetZ = 4.5;
      targetY = 0.22;
    } else if (step === "picking") {
      // Wider centered view calibrated for the compact 3-row amphitheater
      targetZ = 7.2;
      targetY = 0.0;
    } else if (step === "revealing" || step === "streaming") {
      // Direct focused altar view: cards perfectly centered and unobstructed
      targetZ = 5.6;
      targetY = 0.0;
    } else {
      // step === "complete": cards centered in the hero altar banner at top
      targetZ = 5.4;
      targetY = -0.05;
    }

    camera.position.z = THREE.MathUtils.damp(camera.position.z, targetZ, 2.5, delta);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, targetY, 2.5, delta);
  });

  return null;
}

function SceneContent({
  locale,
  onShuffleFinished,
  isCollapsing,
}: {
  locale: Locale;
  onShuffleFinished?: () => void;
  isCollapsing?: boolean;
}) {
  const { step, spreadId, drawnCards, revealedIndices, revealCard } = useReadingStore();
  const currentSpread = getSpreadById(spreadId);

  return (
    <>
      <StarfieldNebula />

      {/* Step 1: Question Form — Drifting Cosmic Cards in deep space behind UI */}
      {step === "question" && <DriftingBackgroundCards />}

      {/* Step 2: Shuffling — 3D Spherical Card Vortex */}
      {step === "shuffling" && (
        <DeckShuffle3D
          isShuffling={true}
          onShuffleComplete={onShuffleFinished}
          isCollapsing={isCollapsing}
        />
      )}

      {/* Step 2.5: Interactive 3D Deck Cutting Ritual */}
      {step === "cutting" && (
        <DeckCut3D onCutComplete={() => useReadingStore.getState().setStep("picking")} />
      )}

      {/* Step 3: Intuitive Picking — Full-screen Panoramic Floating Card Cosmos */}
      {step === "picking" && <FloatingCardField />}

      {/* Step 4 & 5: Spread Altar Layout */}
      {(step === "revealing" || step === "streaming" || step === "complete") && currentSpread && (
        <group position={[0, -0.35, 0]}>
          {drawnCards.map((drawnCard, idx) => {
            const posConfig = currentSpread.positions[idx] || {
              coordinates: { x: (idx - 1) * 2.5, y: 0, z: 0 },
            };
            const isRevealed = revealedIndices.includes(idx);

            return (
              <SpreadCardModel
                key={drawnCard.cardId + "_" + idx}
                cardData={drawnCard}
                positionCoordinates={posConfig.coordinates}
                isRevealed={isRevealed}
                onRevealClick={() => revealCard(idx)}
                locale={locale}
              />
            );
          })}
        </group>
      )}
    </>
  );
}

export function TarotCanvas({
  locale,
  onShuffleFinished,
  isCollapsing = false,
  className = "w-full h-full",
}: TarotCanvasProps) {
  const [hasWebGL, setHasWebGL] = useState<boolean | null>(null);
  const { step } = useReadingStore();

  useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      setHasWebGL(Boolean(gl));
    } catch {
      setHasWebGL(false);
    }
  }, []);

  if (hasWebGL === false) {
    return null;
  }

  return (
    <div className={`relative ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 6.2], fov: 50 }}
        gl={{
          antialias: true,
          powerPreference: "high-performance",
          alpha: true,
        }}
        dpr={[1, 2]}
      >
        <CameraController step={step} />
        <Suspense fallback={null}>
          <SceneContent
            locale={locale}
            onShuffleFinished={onShuffleFinished}
            isCollapsing={isCollapsing}
          />
        </Suspense>

        {/* Subtle camera control during free viewing */}
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          maxPolarAngle={Math.PI / 2 + 0.25}
          minPolarAngle={Math.PI / 2 - 0.25}
          maxAzimuthAngle={0.3}
          minAzimuthAngle={-0.3}
          rotateSpeed={0.25}
        />
      </Canvas>
    </div>
  );
}
