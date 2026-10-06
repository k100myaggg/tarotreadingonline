"use client";

import React, { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { StarfieldNebula } from "./StarfieldNebula";
import { DeckShuffle3D } from "./DeckShuffle3D";
import { FloatingCardField } from "./FloatingCardField";
import { SpreadCardModel } from "./SpreadCardModel";
import { useReadingStore } from "@/stores/useReadingStore";
import { getSpreadById } from "@/lib/tarot/data";
import { Locale } from "@/types/tarot";

interface TarotCanvasProps {
  locale: Locale;
  onShuffleFinished?: () => void;
}

function SceneContent({ locale, onShuffleFinished }: TarotCanvasProps) {
  const { step, spreadId, drawnCards, revealedIndices, revealCard } = useReadingStore();
  const currentSpread = getSpreadById(spreadId);

  return (
    <>
      <StarfieldNebula />

      {/* Shuffling Step */}
      {step === "shuffling" && (
        <DeckShuffle3D isShuffling={true} onShuffleComplete={onShuffleFinished} />
      )}

      {/* Card Picking Step */}
      {step === "picking" && <FloatingCardField />}

      {/* Revealing / Reading / Complete Spread Layout */}
      {(step === "revealing" || step === "streaming" || step === "complete") && currentSpread && (
        <group position={[0, 0, 0]}>
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

export function TarotCanvas({ locale, onShuffleFinished }: TarotCanvasProps) {
  const [hasWebGL, setHasWebGL] = useState<boolean | null>(null);
  const { step } = useReadingStore();

  useEffect(() => {
    // Check WebGL availability
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      setHasWebGL(Boolean(gl));
    } catch {
      setHasWebGL(false);
    }
  }, []);

  if (hasWebGL === false) {
    return null; // Fallback will be rendered by parent
  }

  // Determine optimal camera distance based on step
  const cameraZ = step === "picking" ? 4.2 : step === "shuffling" ? 3.5 : 5.8;

  return (
    <div className="w-full h-full min-h-[480px] md:min-h-[580px] relative rounded-2xl overflow-hidden border border-amber-500/20 shadow-2xl shadow-purple-950/40">
      <Canvas
        camera={{ position: [0, 0, cameraZ], fov: 50 }}
        gl={{
          antialias: true,
          powerPreference: "high-performance",
          alpha: true,
        }}
        dpr={[1, 2]}
      >
        <Suspense fallback={null}>
          <SceneContent locale={locale} onShuffleFinished={onShuffleFinished} />
        </Suspense>
      </Canvas>
    </div>
  );
}
