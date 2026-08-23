import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <Button variant="ghost" size="sm" onClick={handleCopy} className="h-8 px-2 text-xs">
      {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? "Copied" : "Copy"}
    </Button>
  );
}

export function CodeBlock({ code, language = "bash" }: { code: string; language?: string }) {
  return (
    <div className="relative rounded-lg bg-zinc-950 border border-zinc-800 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-900 border-b border-zinc-800">
        <span className="text-xs text-zinc-400 font-mono">{language}</span>
        <CopyButton text={code} />
      </div>
      <pre className="p-4 overflow-x-auto text-sm text-zinc-200 font-mono leading-relaxed whitespace-pre">
        {code}
      </pre>
    </div>
  );
}

export function Step({ number, title, children }: { number: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-sm font-bold text-primary">
        {number}
      </div>
      <div className="flex-1 space-y-3">
        <h3 className="font-semibold text-base">{title}</h3>
        <div className="text-sm text-muted-foreground space-y-2">{children}</div>
      </div>
    </div>
  );
}
