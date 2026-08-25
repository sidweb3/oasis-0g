import { motion } from "framer-motion";

interface CitrineCubeProps {
  size?: number;
  glow?: boolean;
  className?: string;
}

export function CitrineCube({ size = 64, glow = true, className = "" }: CitrineCubeProps) {
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className={`relative inline-block ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Outer aura glow */}
      {glow && (
        <div
          className="absolute inset-0 rounded-full blur-2xl pointer-events-none"
          style={{
            background: "rgba(229, 255, 93, 0.25)",
            transform: "scale(1.4)",
          }}
        />
      )}

      {/* 3D Cube Image */}
      <img
        src="/citrine_cube_3d.jpg"
        alt="Citrine Cube"
        className="w-full h-full object-contain relative z-10 rounded-lg drop-shadow-[0_0_20px_rgba(229,255,93,0.3)]"
      />
    </motion.div>
  );
}
