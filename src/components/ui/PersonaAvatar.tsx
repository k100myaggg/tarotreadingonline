"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Eye, Flower2, Swords } from "lucide-react";

interface PersonaAvatarProps {
  personaId: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  active?: boolean;
}

const SIZE_MAP = {
  xs: {
    dim: 24,
    css: "w-6 h-6",
  },
  sm: {
    dim: 36,
    css: "w-9 h-9",
  },
  md: {
    dim: 48,
    css: "w-12 h-12",
  },
  lg: {
    dim: 68,
    css: "w-16 h-16 sm:w-20 sm:h-20",
  },
  xl: {
    dim: 96,
    css: "w-24 h-24",
  },
};

const PERSONA_IMAGE_MAP: Record<string, string> = {
  sage: "/personas/sage.jpg",
  empath: "/personas/empath.jpg",
  strategist: "/personas/strategist.jpg",
};

export function PersonaAvatar({
  personaId,
  size = "md",
  className = "",
  active = false,
}: PersonaAvatarProps) {
  const [hasError, setHasError] = useState(false);
  const sizeConfig = SIZE_MAP[size] || SIZE_MAP.md;
  const imageSrc = PERSONA_IMAGE_MAP[personaId] || "/personas/sage.jpg";

  return (
    <div
      className={`relative rounded-full overflow-hidden shrink-0 border transition-all duration-300 shadow-xl bg-black ${sizeConfig.css} ${
        active
          ? "border-amber-300 ring-2 ring-amber-400/80 shadow-[0_0_15px_rgba(251,191,36,0.45)] scale-105"
          : "border-amber-500/40 hover:border-amber-400/80 shadow-black/80"
      } ${className}`}
    >
      {!hasError ? (
        <Image
          src={imageSrc}
          alt={`${personaId} avatar`}
          width={sizeConfig.dim}
          height={sizeConfig.dim}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          onError={() => setHasError(true)}
          priority={size === "lg"}
          unoptimized
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-amber-950/80 via-black to-neutral-950 flex items-center justify-center text-amber-300 p-2">
          {personaId === "sage" ? (
            <Eye className="w-full h-full drop-shadow" />
          ) : personaId === "empath" ? (
            <Flower2 className="w-full h-full drop-shadow" />
          ) : (
            <Swords className="w-full h-full drop-shadow" />
          )}
        </div>
      )}
    </div>
  );
}
