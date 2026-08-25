import React, { useEffect, useState } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

export interface WaypointBounds {
  heroX: number;
  heroY: number;
  zeroGX: number;
  zeroGY: number;
  constellationX: number;
  constellationY: number;
  showcaseX: number;
  showcaseY: number;
  reversalX: number;
  reversalY: number;
  reversalRightX: number;
  reversalRightY: number;
}

interface PersistentCitrineCubeProps {
  heroRef: React.RefObject<HTMLElement | null>;
  zeroGRef: React.RefObject<HTMLElement | null>;
  constellationRef: React.RefObject<HTMLElement | null>;
  showcaseRef: React.RefObject<HTMLElement | null>;
  reversalRef: React.RefObject<HTMLElement | null>;
  onWaypointChange?: (waypointIndex: number) => void;
}

export function PersistentCitrineCube({
  heroRef,
  zeroGRef,
  constellationRef,
  showcaseRef,
  reversalRef,
  onWaypointChange,
}: PersistentCitrineCubeProps) {
  const { scrollY } = useScroll();
  const [reducedMotion, setReducedMotion] = useState(false);
  const [activeWaypoint, setActiveWaypoint] = useState(0);

  const [bounds, setBounds] = useState<WaypointBounds>({
    heroX: 0,
    heroY: 160,
    zeroGX: 0,
    zeroGY: 800,
    constellationX: 0,
    constellationY: 1500,
    showcaseX: 0,
    showcaseY: 2200,
    reversalX: 0,
    reversalY: 3000,
    reversalRightX: 0,
    reversalRightY: 3000,
  });

  const recalculateBounds = () => {
    if (typeof window === "undefined") return;

    const scrollYCurrent = window.scrollY;

    // 1. Hero Waypoint
    let heroX = window.innerWidth / 2 - 70;
    let heroY = 180;
    if (heroRef.current) {
      const rect = heroRef.current.getBoundingClientRect();
      heroX = rect.left + rect.width / 2 - 70;
      heroY = rect.top + scrollYCurrent + 140;
    }

    // 2. 0G Primitives Socket Waypoint
    let zeroGX = window.innerWidth / 2 - 60;
    let zeroGY = window.innerHeight * 1.2;
    if (zeroGRef.current) {
      const rect = zeroGRef.current.getBoundingClientRect();
      zeroGX = rect.left + rect.width / 2 - 60;
      zeroGY = rect.top + scrollYCurrent + rect.height / 2 - 60;
    }

    // 3. Constellation Enclave Waypoint
    let constellationX = window.innerWidth * 0.7 - 50;
    let constellationY = window.innerHeight * 2.2;
    if (constellationRef.current) {
      const rect = constellationRef.current.getBoundingClientRect();
      constellationX = rect.left + rect.width * 0.7 - 50;
      constellationY = rect.top + scrollYCurrent + rect.height / 2 - 50;
    }

    // 4. Strategy Token Card Waypoint
    let showcaseX = window.innerWidth * 0.25 - 60;
    let showcaseY = window.innerHeight * 3.2;
    if (showcaseRef.current) {
      const rect = showcaseRef.current.getBoundingClientRect();
      showcaseX = rect.left + rect.width * 0.25 - 60;
      showcaseY = rect.top + scrollYCurrent + rect.height / 2 - 60;
    }

    // 5. Reversal Band Waypoint
    let reversalX = 100;
    let reversalY = window.innerHeight * 4.2;
    let reversalRightX = window.innerWidth - 220;
    let reversalRightY = window.innerHeight * 4.2;

    if (reversalRef.current) {
      const rect = reversalRef.current.getBoundingClientRect();
      reversalX = rect.left + 80;
      reversalY = rect.top + scrollYCurrent + rect.height / 2 - 75;
      reversalRightX = rect.right - 220;
      reversalRightY = rect.top + scrollYCurrent + rect.height / 2 - 50;
    }

    setBounds({
      heroX,
      heroY,
      zeroGX,
      zeroGY,
      constellationX,
      constellationY,
      showcaseX,
      showcaseY,
      reversalX,
      reversalY,
      reversalRightX,
      reversalRightY,
    });
  };

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mediaQuery.matches);

    recalculateBounds();
    window.addEventListener("resize", recalculateBounds);
    window.addEventListener("scroll", recalculateBounds, { passive: true });

    return () => {
      window.removeEventListener("resize", recalculateBounds);
      window.removeEventListener("scroll", recalculateBounds);
    };
  }, [heroRef, zeroGRef, constellationRef, showcaseRef, reversalRef]);

  // Interpolate position across the 5 waypoints
  const waypointRange = [
    bounds.heroY - 100,
    bounds.zeroGY - 100,
    bounds.constellationY - 100,
    bounds.showcaseY - 100,
    bounds.reversalY - 100,
  ];

  const rawX = useTransform(
    scrollY,
    waypointRange,
    [bounds.heroX, bounds.zeroGX, bounds.constellationX, bounds.showcaseX, bounds.reversalX]
  );

  const rawY = useTransform(
    scrollY,
    waypointRange,
    [bounds.heroY, bounds.zeroGY, bounds.constellationY, bounds.showcaseY, bounds.reversalY]
  );

  const rawScale = useTransform(
    scrollY,
    waypointRange,
    [1, 0.85, 0.75, 0.85, 1.1]
  );

  const rawTilt = useTransform(
    scrollY,
    waypointRange,
    [0, 45, 15, -20, -8]
  );

  const springConfig = { damping: 26, stiffness: 170 };
  const smoothX = useSpring(rawX, springConfig);
  const smoothY = useSpring(rawY, springConfig);
  const smoothScale = useSpring(rawScale, springConfig);
  const smoothTilt = useSpring(rawTilt, springConfig);

  // Active waypoint detector to inform sections when the cube locks into place
  useEffect(() => {
    const unsubscribe = scrollY.on("change", (latest) => {
      let currentWaypoint = 0;
      const threshold = 350;

      if (Math.abs(latest + 300 - bounds.heroY) < threshold) currentWaypoint = 0;
      else if (Math.abs(latest + 300 - bounds.zeroGY) < threshold) currentWaypoint = 1;
      else if (Math.abs(latest + 300 - bounds.constellationY) < threshold) currentWaypoint = 2;
      else if (Math.abs(latest + 300 - bounds.showcaseY) < threshold) currentWaypoint = 3;
      else if (Math.abs(latest + 300 - bounds.reversalY) < threshold) currentWaypoint = 4;

      if (currentWaypoint !== activeWaypoint) {
        setActiveWaypoint(currentWaypoint);
        if (onWaypointChange) onWaypointChange(currentWaypoint);
      }
    });
    return () => unsubscribe();
  }, [scrollY, bounds, activeWaypoint, onWaypointChange]);

  const rightCubeOpacity = useTransform(
    scrollY,
    [bounds.reversalY - 300, bounds.reversalY - 50, bounds.reversalY + 400],
    [0, 1, 0]
  );

  if (reducedMotion) {
    return (
      <div className="fixed top-36 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
        <CSS3DPuzzleCube size={140} docked={true} />
      </div>
    );
  }

  return (
    <>
      {/* Primary Persistent Scroll-Linked 3D Citrine Signal Core Cube */}
      <motion.div
        className="fixed top-0 left-0 z-30 pointer-events-none"
        style={{
          x: smoothX,
          y: useTransform(smoothY, (v) => v - scrollY.get()),
          scale: smoothScale,
          rotateZ: smoothTilt,
        }}
      >
        <CSS3DPuzzleCube size={140} docked={activeWaypoint > 0} />
      </motion.div>

      {/* Reversal Section Secondary Right Cube Instance */}
      <motion.div
        className="fixed top-0 left-0 z-30 pointer-events-none"
        style={{
          x: bounds.reversalRightX,
          y: useTransform(scrollY, (latest) => bounds.reversalRightY - latest),
          scale: 0.8,
          rotateZ: 14,
          opacity: rightCubeOpacity,
        }}
      >
        <CSS3DPuzzleCube size={100} docked={true} />
      </motion.div>
    </>
  );
}

// ── 6-Faced Real 3D CSS Citrine Puzzle-Lock Cube Component ───────────────────

function CSS3DPuzzleCube({ size = 140, docked = false }: { size?: number; docked?: boolean }) {
  const half = size / 2;

  return (
    <div
      className="cube-scene relative group"
      style={{
        width: size,
        height: size,
        perspective: "900px",
      }}
    >
      {/* Outer Pulse Glow Ring when Docked */}
      <div
        className={`absolute inset-0 rounded-full blur-3xl pointer-events-none transition-all duration-700 ${
          docked ? "opacity-100 scale-150" : "opacity-60 scale-125"
        }`}
        style={{
          background: "rgba(229, 255, 93, 0.35)",
        }}
      />

      {/* Corner Holographic Locking Nodes */}
      {docked && (
        <div className="absolute -inset-4 border border-dashed border-[#e5ff5d]/40 rounded-xl animate-spin-slow pointer-events-none">
          <div className="absolute -top-1 -left-1 w-2.5 h-2.5 bg-[#e5ff5d] rounded-full shadow-[0_0_10px_#e5ff5d]" />
          <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-[#e5ff5d] rounded-full shadow-[0_0_10px_#e5ff5d]" />
        </div>
      )}

      {/* 3D Spinning Cube Container */}
      <div
        className="cube animate-cube-spin w-full h-full relative"
        style={{
          transformStyle: "preserve-3d",
        }}
      >
        {/* Face 1: Front */}
        <div
          className="cube-face absolute inset-0 border border-[#e5ff5d]/70 bg-gradient-to-br from-[#e5ff5d]/45 via-[#e5ff5d]/20 to-[#111111]/90 backdrop-blur-md shadow-[inset_0_0_25px_rgba(229,255,93,0.35)] flex items-center justify-center"
          style={{
            transform: `rotateY(0deg) translateZ(${half}px)`,
          }}
        >
          <div className="w-6 h-6 border border-[#e5ff5d]/80 rounded-sm bg-[#e5ff5d]/20 animate-pulse" />
        </div>

        {/* Face 2: Back */}
        <div
          className="cube-face absolute inset-0 border border-[#e5ff5d]/70 bg-gradient-to-br from-[#e5ff5d]/40 via-[#e5ff5d]/15 to-[#111111]/90 backdrop-blur-md shadow-[inset_0_0_25px_rgba(229,255,93,0.35)] flex items-center justify-center"
          style={{
            transform: `rotateY(180deg) translateZ(${half}px)`,
          }}
        >
          <div className="font-mono text-[9px] text-[#e5ff5d] font-bold tracking-widest">0G</div>
        </div>

        {/* Face 3: Left */}
        <div
          className="cube-face absolute inset-0 border border-[#e5ff5d]/70 bg-gradient-to-br from-[#e5ff5d]/50 via-[#e5ff5d]/25 to-[#111111]/90 backdrop-blur-md shadow-[inset_0_0_25px_rgba(229,255,93,0.35)] flex items-center justify-center"
          style={{
            transform: `rotateY(-90deg) translateZ(${half}px)`,
          }}
        >
          <div className="w-5 h-5 rounded-full border border-[#e5ff5d]" />
        </div>

        {/* Face 4: Right */}
        <div
          className="cube-face absolute inset-0 border border-[#e5ff5d]/70 bg-gradient-to-br from-[#e5ff5d]/35 via-[#e5ff5d]/10 to-[#111111]/90 backdrop-blur-md shadow-[inset_0_0_25px_rgba(229,255,93,0.35)]"
          style={{
            transform: `rotateY(90deg) translateZ(${half}px)`,
          }}
        />

        {/* Face 5: Top */}
        <div
          className="cube-face absolute inset-0 border border-[#e5ff5d]/90 bg-gradient-to-br from-[#e5ff5d]/65 via-[#e5ff5d]/35 to-[#111111]/80 backdrop-blur-md shadow-[inset_0_0_30px_rgba(229,255,93,0.45)]"
          style={{
            transform: `rotateX(90deg) translateZ(${half}px)`,
          }}
        />

        {/* Face 6: Bottom */}
        <div
          className="cube-face absolute inset-0 border border-[#e5ff5d]/60 bg-gradient-to-br from-[#e5ff5d]/30 via-[#e5ff5d]/10 to-[#111111]/95 backdrop-blur-md shadow-[inset_0_0_20px_rgba(229,255,93,0.25)]"
          style={{
            transform: `rotateX(-90deg) translateZ(${half}px)`,
          }}
        />
      </div>
    </div>
  );
}
