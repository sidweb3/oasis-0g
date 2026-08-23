import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Terminal } from "lucide-react";
import { Link } from "react-router";

export function CTASection() {
  return (
    <section className="py-24 relative overflow-hidden border-t border-border">
      {/* Background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:40px_40px]" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/3 to-transparent" />

      <div className="container px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="border border-primary/20 bg-card p-12 md:p-16 relative overflow-hidden"
          >
            {/* Corner accents */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-primary" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-primary" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-primary" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-primary" />

            <div className="text-center">
              <div className="inline-flex items-center gap-2 font-mono-data text-xs text-primary mb-6 px-3 py-1 border border-primary/30 bg-primary/5 rounded-sm">
                <Terminal className="w-3 h-3" />
                READY TO DEPLOY
              </div>

              <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-6">
                START EARNING
                <br />
                <span className="text-primary">TODAY</span>
              </h2>

              <p className="text-muted-foreground mb-10 max-w-xl mx-auto leading-relaxed">
                Deposit USDC or POL, track your vault shares in real-time, and view complete transaction history on Polygon. No simulation — real on-chain yields.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/auth">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      size="lg"
                      className="h-12 px-10 text-sm font-bold tracking-widest uppercase rounded-sm hover:shadow-[0_0_30px_rgba(0,232,122,0.4)] transition-all duration-300"
                    >
                      Launch App
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </motion.div>
                </Link>
                <Link to="/vaults">
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-12 px-10 text-sm font-bold tracking-widest uppercase rounded-sm border-border hover:border-primary/50 hover:bg-primary/5"
                  >
                    View Vaults
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}