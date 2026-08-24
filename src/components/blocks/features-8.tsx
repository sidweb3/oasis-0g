import { Card, CardContent } from "@/components/ui/card";
import { Shield, Users, Cpu, Database, Zap } from "lucide-react";

export function Features() {
  return (
    <section className="bg-transparent py-16 md:py-24 border-t border-border/40 relative overflow-hidden">
      <div className="mx-auto max-w-3xl lg:max-w-6xl px-6">
        <div className="text-center space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-xs font-mono tracking-wider uppercase">
            <Cpu className="w-3.5 h-3.5" /> 0G Primitive Powered
          </div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-foreground/50 bg-clip-text text-transparent">
            Built for Verifiable AI Capital Management
          </h2>
          <p className="text-muted-foreground text-sm md:text-base max-w-2xl mx-auto">
            Every allocation decision is backed by cryptographic TEE proofs on 0G Compute, permanently logged to 0G Storage, and tokenized on-chain.
          </p>
        </div>

        <div className="relative">
          <div className="relative z-10 grid grid-cols-6 gap-4">
            {/* Card 1: 100% Verifiable */}
            <Card className="relative col-span-full flex overflow-hidden lg:col-span-2 border-cyan-500/20 bg-card/60 backdrop-blur">
              <CardContent className="relative m-auto size-fit pt-6 text-center">
                <div className="relative flex h-24 w-56 items-center justify-center">
                  <svg className="text-cyan-500/20 absolute inset-0 size-full" viewBox="0 0 254 104" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M112.891 97.7022C140.366 97.0802 171.004 94.6715 201.087 87.5116C210.43 85.2881 219.615 82.6412 228.284 78.2473C232.198 76.3179 235.905 73.9942 239.348 71.3124C241.85 69.2557 243.954 66.7571 245.555 63.9408C249.34 57.3235 248.281 50.5341 242.498 45.6109C239.033 42.7237 235.228 40.2703 231.169 38.3054C219.443 32.7209 207.141 28.4382 194.482 25.534C184.013 23.1927 173.358 21.7755 162.64 21.2989C161.376 21.3512 160.113 21.181 158.908 20.796C158.034 20.399 156.857 19.1682 156.962 18.4535C157.115 17.8927 157.381 17.3689 157.743 16.9139C158.104 16.4588 158.555 16.0821 159.067 15.8066C160.14 15.4683 161.274 15.3733 162.389 15.5286C179.805 15.3566 196.626 18.8373 212.998 24.462C220.978 27.2494 228.798 30.4747 236.423 34.1232C240.476 36.1159 244.202 38.7131 247.474 41.8258C254.342 48.2578 255.745 56.9397 251.841 65.4892C249.793 69.8582 246.736 73.6777 242.921 76.6327C236.224 82.0192 228.522 85.4602 220.502 88.2924C205.017 93.7847 188.964 96.9081 172.738 99.2109C153.442 101.949 133.993 103.478 114.506 103.79C91.1468 104.161 67.9334 102.97 45.1169 97.5831C36.0094 95.5616 27.2626 92.1655 19.1771 87.5116C13.839 84.5746 9.1557 80.5802 5.41318 75.7725C-0.54238 67.7259 -1.13794 59.1763 3.25594 50.2827C5.82447 45.3918 9.29572 41.0315 13.4863 37.4319C24.2989 27.5721 37.0438 20.9681 50.5431 15.7272C68.1451 8.8849 86.4883 5.1395 105.175 2.83669C129.045 0.0992292 153.151 0.134761 177.013 2.94256C197.672 5.23215 218.04 9.01724 237.588 16.3889C240.089 17.3418 242.498 18.5197 244.933 19.6446C246.627 20.4387 247.725 21.6695 246.997 23.615C246.455 25.1105 244.814 25.5605 242.63 24.5811C230.322 18.9961 217.233 16.1904 204.117 13.4376C188.761 10.3438 173.2 8.36665 157.558 7.52174C129.914 5.70776 102.154 8.06792 75.2124 14.5228C60.6177 17.8788 46.5758 23.2977 33.5102 30.6161C26.6595 34.3329 20.4123 39.0673 14.9818 44.658C12.9433 46.8071 11.1336 49.1622 9.58207 51.6855C4.87056 59.5336 5.61172 67.2494 11.9246 73.7608C15.2064 77.0494 18.8775 79.925 22.8564 82.3236C31.6176 87.7101 41.3848 90.5291 51.3902 92.5804C70.6068 96.5773 90.0219 97.7419 112.891 97.7022Z"
                      fill="currentColor"
                    />
                  </svg>
                  <span className="mx-auto block w-fit text-5xl font-black text-cyan-400 font-mono tracking-tight">100%</span>
                </div>
                <h3 className="mt-4 text-xl font-bold text-foreground">Verifiable Inference</h3>
                <p className="text-xs text-muted-foreground mt-2">Every inference call produces a cryptographic TEE worker signature on 0G Compute.</p>
              </CardContent>
            </Card>

            {/* Card 2: Secure by Default */}
            <Card className="relative col-span-full overflow-hidden sm:col-span-3 lg:col-span-2 border-cyan-500/20 bg-card/60 backdrop-blur">
              <CardContent className="pt-6">
                <div className="relative mx-auto flex aspect-square size-28 rounded-full border border-cyan-500/30 overflow-hidden shadow-lg shadow-cyan-500/10">
                  <img src="/bento-security.jpg" alt="TEE Hardware Security" className="size-full object-cover" />
                </div>
                <div className="relative z-10 mt-6 space-y-2 text-center">
                  <h3 className="text-lg font-bold text-foreground">Secure by Default</h3>
                  <p className="text-xs text-muted-foreground">TEE hardware security guarantees prompt execution integrity without trusting centralized servers.</p>
                </div>
              </CardContent>
            </Card>

            {/* Card 3: Real-Time 0G Storage */}
            <Card className="relative col-span-full overflow-hidden sm:col-span-3 lg:col-span-2 border-cyan-500/20 bg-card/60 backdrop-blur">
              <CardContent className="pt-6">
                <div className="relative mx-auto flex aspect-square size-28 rounded-full border border-indigo-500/30 overflow-hidden shadow-lg shadow-indigo-500/10">
                  <img src="/bento-storage.jpg" alt="0G Storage Audit Trail" className="size-full object-cover" />
                </div>
                <div className="relative z-10 mt-6 space-y-2 text-center">
                  <h3 className="text-lg font-bold text-foreground">0G Storage Audit Trail</h3>
                  <p className="text-xs text-muted-foreground">Decisions and reasoning payloads are permanently stored on decentralized 0G Storage nodes.</p>
                </div>
              </CardContent>
            </Card>

            {/* Card 4: Strategy Token Ownership */}
            <Card className="relative col-span-full overflow-hidden lg:col-span-3 border-cyan-500/20 bg-card/60 backdrop-blur">
              <CardContent className="grid pt-6 sm:grid-cols-2 gap-4">
                <div className="relative z-10 flex flex-col justify-between space-y-6">
                  <div className="relative flex aspect-square size-12 rounded-xl border border-cyan-500/30 overflow-hidden shadow-md">
                    <img src="/bento-agentic.jpg" alt="Strategy Agentic ID" className="size-full object-cover" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-foreground">Strategy Agentic ID</h3>
                    <p className="text-xs text-muted-foreground">ERC-721 tokenizing AI strategy identity. Decision history is permanently bound to token ownership.</p>
                  </div>
                </div>
                <div className="rounded-xl border border-border/50 bg-background/50 p-4 space-y-2 font-mono text-xs text-muted-foreground">
                  <div className="flex items-center justify-between text-cyan-400 font-bold border-b border-border/40 pb-2">
                    <span>Agentic Token #0</span>
                    <span>ACTIVE</span>
                  </div>
                  <div className="space-y-1 text-[11px]">
                    <p><span className="text-muted">Standard:</span> ERC-7857 Pattern</p>
                    <p><span className="text-muted">Chain:</span> 0G Aristotle (16661)</p>
                    <p><span className="text-muted">Decisions:</span> Immutable On-Chain</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Card 5: Portable Track Record */}
            <Card className="relative col-span-full overflow-hidden lg:col-span-3 border-cyan-500/20 bg-card/60 backdrop-blur">
              <CardContent className="grid h-full pt-6 sm:grid-cols-2 gap-4">
                <div className="relative z-10 flex flex-col justify-between space-y-6">
                  <div className="flex items-center -space-x-2">
                    <img className="size-10 rounded-full border-2 border-background object-cover shadow-sm" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80" alt="Auditor Avatar" />
                    <img className="size-10 rounded-full border-2 border-background object-cover shadow-sm" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80" alt="Creator Avatar" />
                    <img className="size-10 rounded-full border-2 border-background object-cover shadow-sm" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80" alt="Operator Avatar" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-foreground">Portable AI Identity</h3>
                    <p className="text-xs text-muted-foreground">Transferring the strategy NFT carries its complete verified historical record to the new owner without reset.</p>
                  </div>
                </div>
                <div className="flex flex-col justify-center space-y-3 rounded-xl border border-border/50 bg-background/50 p-4 text-xs font-mono">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Strategy Creator</span>
                    <span className="text-cyan-400">0xb5aD...1f20</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">On-Chain Audit</span>
                    <span className="text-green-400">Verified ✓</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Track Record</span>
                    <span className="text-indigo-400">Preserved</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
