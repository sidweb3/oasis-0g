import { motion } from "framer-motion";
import { Cpu, Database, Link2, Shield, Zap, Layers, Globe, Activity, Terminal, Server, Lock, CpuIcon } from "lucide-react";

const nodes = [
  { label: "0G COMPUTE", icon: Cpu, angle: 0, color: "#e5ff5d" },
  { label: "ETHEREUM", icon: Globe, angle: 30, color: "#627eea" },
  { label: "0G STORAGE", icon: Database, angle: 60, color: "#e5ff5d" },
  { label: "SOLANA", icon: Activity, angle: 90, color: "#14f195" },
  { label: "0G CHAIN", icon: Link2, angle: 120, color: "#e5ff5d" },
  { label: "ARBITRUM", icon: Server, angle: 150, color: "#28a0f0" },
  { label: "AGENTIC ID", icon: Shield, angle: 180, color: "#e5ff5d" },
  { label: "BASE", icon: Terminal, angle: 210, color: "#0052ff" },
  { label: "NATIVE VAULT", icon: Layers, angle: 240, color: "#e5ff5d" },
  { label: "OPTIMISM", icon: Lock, angle: 270, color: "#ff0420" },
  { label: "REBALANCE AI", icon: Zap, angle: 300, color: "#e5ff5d" },
  { label: "POLYGON", icon: CpuIcon, angle: 330, color: "#8247e5" },
];

interface ConstellationNetworkProps {
  active?: boolean;
}

export function ConstellationNetwork({ active = true }: ConstellationNetworkProps) {
  const radius = 200; // Expanded radius for 12 nodes
  const center = 260; // Center coordinate in 520x520 canvas

  return (
    <div className="relative w-full max-w-[520px] h-[520px] mx-auto flex items-center justify-center">
      
      {/* Radial Connector Lines & Glowing Data Light Pulses */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
        {nodes.map((node, i) => {
          const rad = (node.angle * Math.PI) / 180;
          const x2 = center + radius * Math.cos(rad);
          const y2 = center + radius * Math.sin(rad);

          return (
            <g key={i}>
              {/* Static Dashed Ray Line */}
              <motion.line
                x1={center}
                y1={center}
                x2={x2}
                y2={y2}
                stroke="#333333"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                initial={{ opacity: 0 }}
                animate={{ opacity: active ? 0.8 : 0.2 }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
              />

              {/* Streaming Glowing Light Pulse Traveling along Ray */}
              {active && (
                <motion.circle
                  r="3.5"
                  fill="#e5ff5d"
                  initial={{ cx: x2, cy: y2, opacity: 0.8 }}
                  animate={{
                    cx: [x2, center],
                    cy: [y2, center],
                    opacity: [0.9, 0.2],
                  }}
                  transition={{
                    duration: 2.2,
                    repeat: Infinity,
                    delay: (i * 0.18) % 1.5,
                    ease: "easeInOut",
                  }}
                  className="shadow-[0_0_10px_#e5ff5d]"
                />
              )}
            </g>
          );
        })}
      </svg>

      {/* Target docking slot for the persistent 3D Citrine Cube */}
      <div
        id="constellation-dock-target"
        className="relative z-10 w-[140px] h-[140px] rounded-full border border-[#2b2b2b] bg-[#1a1a1a]/60 flex items-center justify-center transition-all duration-300 shadow-[0_0_40px_rgba(229,255,93,0.15)]"
      >
        <div className="absolute inset-0 rounded-full border border-[#e5ff5d]/20 animate-ping pointer-events-none" />
        <span className="font-mono text-[9px] text-[#e5ff5d] uppercase tracking-[0.032em] font-bold opacity-60 text-center px-2">
          0G ENCLAVE CORE
        </span>
      </div>

      {/* 12 Orbiting Node Badges */}
      {nodes.map((node, i) => {
        const rad = (node.angle * Math.PI) / 180;
        const x = radius * Math.cos(rad);
        const y = radius * Math.sin(rad);

        return (
          <motion.div
            key={node.label}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: active ? 1 : 0.3, scale: active ? 1 : 0.8 }}
            transition={{ delay: 0.04 * i, duration: 0.4 }}
            className="absolute z-20 flex flex-col items-center gap-1 group"
            style={{
              transform: `translate(${x}px, ${y}px)`,
            }}
          >
            <div
              className="h-9 w-9 rounded-full bg-[#1c1c1c] border border-[#333333] flex items-center justify-center shadow-lg group-hover:border-[#e5ff5d] group-hover:scale-110 transition-all duration-300"
              style={{
                boxShadow: `0 0 15px ${node.color}15`,
              }}
            >
              <node.icon className="h-4 w-4 text-[#e5ff5d]" />
            </div>
            <span className="font-mono text-[8px] tracking-[0.032em] text-[#9c9c9c] uppercase font-bold bg-[#111111]/90 px-1.5 py-0.5 rounded border border-[#2b2b2b] group-hover:text-[#f9f9f9]">
              {node.label}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}
