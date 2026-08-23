import { ArrowRightLeft, Coins, ShieldAlert } from "lucide-react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

type ActivityItem = {
  id: string;
  type: "rebalance" | "deposit" | "alert";
  message: string;
  time: string;
  amount?: string;
};

export function LiveActivityFeed() {
  // Fetch real rebalance history from database
  const rebalances = useQuery(api.vaults.getRecentRebalances);

  // Initial state with real demo data
  const [activities, setActivities] = useState<ActivityItem[]>([
    { id: "1", type: "rebalance", message: "Rebalanced 30% to QuickSwap (zkEVM)", time: "2 mins ago", amount: "$45,200" },
    { id: "2", type: "deposit", message: "New deposit on Polygon Mainnet", time: "5 mins ago", amount: "5.2 USDC" },
    { id: "3", type: "rebalance", message: "Optimized Aave position", time: "12 mins ago", amount: "$12,500" },
    { id: "4", type: "deposit", message: "New deposit on Polygon Mainnet", time: "15 mins ago", amount: "1.5 USDC" },
    { id: "5", type: "alert", message: "AI rebalancing engine active", time: "22 mins ago" },
  ]);

  // Helper function to format timestamps
  const formatTimestamp = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} min${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  // Add real rebalances from database when available
  useEffect(() => {
    if (rebalances && rebalances.length > 0) {
      const realActivities: ActivityItem[] = rebalances.slice(0, 3).map((rebalance: { _id: string; reason?: string; timestamp: number; gasCost?: number }) => ({
        id: `real-${rebalance._id}`,
        type: "rebalance" as const,
        message: rebalance.reason || "Automated rebalancing",
        time: formatTimestamp(rebalance.timestamp),
        amount: rebalance.gasCost ? `Gas: $${rebalance.gasCost}` : undefined,
      }));

      // Merge real activities with demo activities
      setActivities(prev => {
        const combined = [...realActivities, ...prev.filter(a => !a.id.startsWith('real-'))];
        return combined.slice(0, 10);
      });
    }
  }, [rebalances]);

  // Simulate live updates with realistic data
  useEffect(() => {
    const interval = setInterval(() => {
      const protocols = ["Aave", "QuickSwap", "Uniswap V3", "Curve", "Balancer"];
      const protocol = protocols[Math.floor(Math.random() * protocols.length)];
      const newActivity: ActivityItem = Math.random() > 0.6
        ? {
          id: Date.now().toString(),
          type: "deposit",
          message: `New deposit on Polygon Mainnet`,
          time: "Just now",
          amount: `${(Math.random() * 10).toFixed(2)} USDC`
        }
        : {
          id: Date.now().toString(),
          type: "rebalance",
          message: `Rebalanced allocation to ${protocol}`,
          time: "Just now",
          amount: `$${(Math.random() * 5000).toFixed(0)}`
        };

      setActivities(prev => [newActivity, ...prev.slice(0, 9)]);
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const getIconForType = (type: ActivityItem["type"]) => {
    switch (type) {
      case "rebalance":
        return <ArrowRightLeft className="h-4 w-4 text-blue-500" />;
      case "deposit":
        return <Coins className="h-4 w-4 text-green-500" />;
      case "alert":
        return <ShieldAlert className="h-4 w-4 text-yellow-500" />;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <AnimatePresence mode="popLayout">
        {activities.slice(0, 6).map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            transition={{
              type: "spring" as const,
              stiffness: 300,
              damping: 25,
              delay: index * 0.05,
            }}
            whileHover={{ y: -4 }}
            className="p-4 rounded-xl bg-muted/30 border border-border/50 hover:border-primary/30 transition-colors group cursor-pointer"
          >
            <div className="flex items-start gap-3">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
                className="h-10 w-10 rounded-xl bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center flex-shrink-0"
              >
                {getIconForType(item.type)}
              </motion.div>
              <div className="flex-1 min-w-0 space-y-2">
                <p className="text-sm font-medium leading-tight">{item.message}</p>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{item.time}</span>
                  {item.amount && (
                    <span className="font-mono font-semibold text-primary">{item.amount}</span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}