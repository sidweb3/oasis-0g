import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export interface DockTargetConfig {
  id: string;
  selector: string;
  size?: number;
  label?: string;
  shape?: "circle-to-square" | "square";
  final?: boolean; // Exactly ONE entry has final: true
}

export const DOCK_TARGETS: DockTargetConfig[] = [
  { id: "hero-dock", selector: "#hero-dock-target", size: 140, label: "0G BEACON CORE", final: false },
  { id: "primitives-socket", selector: "#matrix-socket-dock", size: 120, label: "0G PRIMITIVE MATRIX", final: false },
  { id: "constellation-dock", selector: "#constellation-dock-target", size: 120, label: "0G COMPUTE TEE ENCLAVE", final: false },
  { id: "pipeline-dock", selector: "#pipeline-dock-target", size: 110, label: "STRATEGY TOKEN ENGINE", final: false },
  { id: "strategy-anchor", selector: "#metrics-anchor-target", size: 160, label: "VERIFIABLE YIELD HUB", final: true },
];

export function DockingCitrineCube() {
  const cubeSceneRef = useRef<HTMLDivElement>(null);
  const cubeInnerRef = useRef<HTMLDivElement>(null);
  const rippleRingRef = useRef<HTMLDivElement>(null);

  const [currentSize, setCurrentSize] = useState<number>(140);
  const [isDocked, setIsDocked] = useState<boolean>(true);
  const [activeDockId, setActiveDockId] = useState<string>("hero-dock");
  const firedDocksRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (typeof window === "undefined") return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // Find all target DOM elements
      const targetEls = DOCK_TARGETS.map((t) => ({
        config: t,
        el: document.querySelector(t.selector) as HTMLElement | null,
      })).filter((item): item is { config: DockTargetConfig; el: HTMLElement } => item.el !== null);

      if (targetEls.length === 0) return;

      // Function to calculate center point of target element relative to viewport
      const getTargetCenter = (el: HTMLElement, size: number) => {
        const rect = el.getBoundingClientRect();
        const x = rect.left + rect.width / 2 - size / 2;
        const y = rect.top + rect.height / 2 - size / 2;
        return { x, y };
      };

      // Set initial position at hero target
      const firstTarget = targetEls[0];
      const firstSize = firstTarget.config.size || 140;
      const firstPos = getTargetCenter(firstTarget.el, firstSize);

      gsap.set(cubeSceneRef.current, {
        x: firstPos.x,
        y: firstPos.y,
        width: firstSize,
        height: firstSize,
        scale: 1,
        rotationZ: 0,
      });

      // Initially pause rotation when docked at hero
      if (cubeInnerRef.current) {
        gsap.to(cubeInnerRef.current, {
          timeScale: 0,
          duration: 0.3,
        });
      }

      // 1. SECTION DOCKED STATE: Keep cube 100% locked inside target while section is in view!
      targetEls.forEach(({ config, el }) => {
        const targetSize = config.size || 140;

        ScrollTrigger.create({
          trigger: el,
          start: "top 80%",
          end: config.final ? "bottom+=1500 top" : "bottom 20%",
          onUpdate: (self) => {
            if (self.isActive) {
              const pos = getTargetCenter(el, targetSize);
              if (cubeSceneRef.current) {
                gsap.set(cubeSceneRef.current, {
                  x: pos.x,
                  y: pos.y, // Dynamically tracks target element position relative to viewport on every scroll frame!
                  width: targetSize,
                  height: targetSize,
                  rotationZ: 0,
                });
              }
              setCurrentSize(targetSize);
            }
          },
          onEnter: () => {
            setIsDocked(true);
            setActiveDockId(config.id);

            // Puzzle Piece Lock: Stop rotation completely while docked inside target socket
            if (cubeInnerRef.current) {
              gsap.to(cubeInnerRef.current, {
                timeScale: 0,
                duration: 0.4,
              });
            }

            // Fire Bespoke Arrival Animation
            if (!firedDocksRef.current.has(config.id)) {
              firedDocksRef.current.add(config.id);
              triggerBespokeArrival(config.id);
            }

            gsap.to(el, {
              borderColor: "#e5ff5d",
              boxShadow: "0 0 35px rgba(229, 255, 93, 0.45)",
              duration: 0.4,
            });
          },
          onLeave: () => {
            if (!config.final) {
              setIsDocked(false);
              if (cubeInnerRef.current) {
                gsap.to(cubeInnerRef.current, {
                  timeScale: 1,
                  duration: 0.4,
                });
              }
            }
          },
          onEnterBack: () => {
            setIsDocked(true);
            setActiveDockId(config.id);

            if (cubeInnerRef.current) {
              gsap.to(cubeInnerRef.current, {
                timeScale: 0,
                duration: 0.4,
              });
            }
            gsap.to(el, {
              borderColor: "#e5ff5d",
              boxShadow: "0 0 35px rgba(229, 255, 93, 0.45)",
              duration: 0.4,
            });
          },
          onLeaveBack: () => {
            if (!config.final) {
              setIsDocked(false);
              firedDocksRef.current.delete(config.id);

              if (cubeInnerRef.current) {
                gsap.to(cubeInnerRef.current, {
                  timeScale: 1,
                  duration: 0.4,
                });
              }

              gsap.to(el, {
                borderRadius: "50%",
                borderColor: "rgba(43, 43, 43, 1)",
                boxShadow: "none",
                duration: 0.4,
              });
            }
          },
        });
      });

      // 2. TRAVEL TRANSITIONS BETWEEN SECTIONS: Smooth travel when scrolling between target i and target i+1
      for (let i = 0; i < targetEls.length - 1; i++) {
        const fromTarget = targetEls[i];
        const toTarget = targetEls[i + 1];

        const fromSize = fromTarget.config.size || 140;
        const toSize = toTarget.config.size || 140;

        ScrollTrigger.create({
          trigger: fromTarget.el,
          endTrigger: toTarget.el,
          start: "bottom 30%", // Travel starts only after fromTarget section leaves upper screen!
          end: "top 70%",     // Travel completes as toTarget section enters screen!
          scrub: 0.5,
          onUpdate: (self) => {
            const p = self.progress;

            if (p > 0 && p < 1) {
              const fromPos = getTargetCenter(fromTarget.el, fromSize);
              const toPos = getTargetCenter(toTarget.el, toSize);

              const currentX = gsap.utils.interpolate(fromPos.x, toPos.x, p);
              const currentY = gsap.utils.interpolate(fromPos.y, toPos.y, p);
              const sizeInterp = gsap.utils.interpolate(fromSize, toSize, p);
              const tiltInterp = gsap.utils.interpolate(0, (i % 2 === 0 ? 15 : -15), Math.sin(p * Math.PI));

              if (cubeSceneRef.current) {
                gsap.set(cubeSceneRef.current, {
                  x: currentX,
                  y: currentY,
                  width: sizeInterp,
                  height: sizeInterp,
                  rotationZ: tiltInterp,
                });
              }

              setCurrentSize(sizeInterp);

              // Resume rotation during travel
              if (cubeInnerRef.current) {
                gsap.to(cubeInnerRef.current, {
                  timeScale: 1,
                  duration: 0.2,
                });
              }

              // Approach Morph on toTarget
              if (p > 0.7 && toTarget.el) {
                const morphProgress = (p - 0.7) / 0.3;
                const borderRadius = gsap.utils.interpolate(50, 8, morphProgress);
                gsap.set(toTarget.el, {
                  borderRadius: `${borderRadius}%`,
                  borderColor: `rgba(229, 255, 93, ${0.3 + morphProgress * 0.5})`,
                  boxShadow: `0 0 ${20 * morphProgress}px rgba(229, 255, 93, ${0.4 * morphProgress})`,
                });
              }
            }
          },
        });
      }

      // Recalculate on window resize
      window.addEventListener("resize", () => ScrollTrigger.refresh());
    });

    return () => ctx.revert();
  }, []);

  // Section-Specific Bespoke Arrival Animations
  const triggerBespokeArrival = (dockId: string) => {
    if (!rippleRingRef.current) return;

    // Expanding Citrine Radar Shockwave Ring Effect
    gsap.fromTo(
      rippleRingRef.current,
      { opacity: 1, scale: 0.8, border: "2px solid #e5ff5d" },
      { opacity: 0, scale: 2.2, duration: 0.8, ease: "power2.out" }
    );
  };

  return (
    <>
      {/* Config-Driven Floating 3D Citrine Cube */}
      <div
        ref={cubeSceneRef}
        className="fixed top-0 left-0 z-30 pointer-events-none cube-scene"
        style={{
          perspective: "900px",
          willChange: "transform",
        }}
      >
        {/* Docked Aura Glow */}
        <div
          className={`absolute inset-0 rounded-full blur-3xl pointer-events-none transition-all duration-700 ${
            isDocked ? "opacity-100 scale-150" : "opacity-40 scale-110"
          }`}
          style={{
            background: "rgba(229, 255, 93, 0.35)",
          }}
        />

        {/* Bespoke Shockwave Ring Layer */}
        <div
          ref={rippleRingRef}
          className="absolute inset-0 rounded-full pointer-events-none opacity-0"
        />

        {/* Real 6-Faced 3D CSS Cube */}
        <div
          ref={cubeInnerRef}
          className="cube animate-cube-spin w-full h-full relative"
          style={{
            transformStyle: "preserve-3d",
          }}
        >
          {/* 6 Real Faces */}
          <CubeFace transform={`rotateY(0deg) translateZ(${currentSize / 2}px)`}>
            <div className="w-6 h-6 border border-[#e5ff5d]/80 rounded-sm bg-[#e5ff5d]/20 animate-pulse flex items-center justify-center">
              <div className="w-2 h-2 bg-[#e5ff5d] rounded-full" />
            </div>
          </CubeFace>
          <CubeFace transform={`rotateY(180deg) translateZ(${currentSize / 2}px)`}>
            <span className="font-mono text-[9px] text-[#e5ff5d] font-bold tracking-widest">0G</span>
          </CubeFace>
          <CubeFace transform={`rotateY(-90deg) translateZ(${currentSize / 2}px)`}>
            <div className="w-4 h-4 rounded-full border border-[#e5ff5d]" />
          </CubeFace>
          <CubeFace transform={`rotateY(90deg) translateZ(${currentSize / 2}px)`} />
          <CubeFace transform={`rotateX(90deg) translateZ(${currentSize / 2}px)`} />
          <CubeFace transform={`rotateX(-90deg) translateZ(${currentSize / 2}px)`} />
        </div>
      </div>
    </>
  );
}

function CubeFace({ transform, children }: { transform: string; children?: React.ReactNode }) {
  return (
    <div
      className="cube-face absolute inset-0 border border-[#e5ff5d]/70 bg-gradient-to-br from-[#e5ff5d]/45 via-[#e5ff5d]/20 to-[#111111]/90 backdrop-blur-md shadow-[inset_0_0_25px_rgba(229,255,93,0.35)] flex items-center justify-center"
      style={{ transform }}
    >
      {children}
    </div>
  );
}
