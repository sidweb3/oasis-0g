import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download as DownloadIcon, Code } from "lucide-react";

export default function DownloadPage() {
  const handleDownload = () => {
    window.location.href = "/";
  };

  return (
    <>
      <Navbar />
      <div className="container max-w-3xl py-12 space-y-8 text-center">
        <div className="space-y-4">
          <h1 className="text-3xl font-black tracking-tight">Download Oasis Codebase</h1>
          <p className="text-muted-foreground">
            Get the full source code for Oasis: 0G Chain contracts, 0G Compute AI relayer, and React dashboard.
          </p>
        </div>

        <Card className="border-border max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-lg">Oasis Vault Core</CardTitle>
            <CardDescription>Full repository package (0G Aristotle ready)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full bg-cyan-600 hover:bg-cyan-500 text-white" onClick={handleDownload}>
              <DownloadIcon className="h-4 w-4 mr-2" /> Download Archive
            </Button>
            <p className="text-xs text-muted-foreground">
              Includes contracts/, relayer/, scripts/deploy-0g.cjs, and frontend src/
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}