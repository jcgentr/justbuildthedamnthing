"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Copy, Check } from "lucide-react";

export default function JsonFormatter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [isCopied, setIsCopied] = useState(false);

  // Reset copy state after timeout
  useEffect(() => {
    if (isCopied) {
      const timeout = setTimeout(() => {
        setIsCopied(false);
      }, 2000);

      return () => clearTimeout(timeout);
    }
  }, [isCopied]);

  const formatJSON = () => {
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed, null, 2));
      setError("");
    } catch {
      setError("Invalid JSON");
      setOutput("");
      toast.error("Invalid JSON format");
    }
  };

  const minifyJSON = () => {
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed));
      setError("");
    } catch {
      setError("Invalid JSON");
      setOutput("");
      toast.error("Invalid JSON format");
    }
  };

  const copyToClipboard = () => {
    if (!output) {
      toast.error("Nothing to copy");
      return;
    }

    navigator.clipboard
      .writeText(output)
      .then(() => {
        setIsCopied(true);
        toast.success("Copied to clipboard");
      })
      .catch(() => toast.error("Failed to copy"));
  };

  const clearAll = () => {
    setInput("");
    setOutput("");
    setError("");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold">JSON Formatter</h1>
        <p className="text-muted-foreground text-lg">
          Format and validate your JSON data
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap gap-4">
          <Button
            onClick={formatJSON}
            variant="default"
            className="cursor-pointer px-6"
          >
            Format
          </Button>
          <Button
            onClick={minifyJSON}
            variant="default"
            className="cursor-pointer px-6"
          >
            Minify
          </Button>
          <Button
            onClick={clearAll}
            variant="outline"
            className="cursor-pointer px-6"
          >
            Clear
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center h-8">
              <label className="text-sm font-medium">Input</label>
            </div>
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste your JSON here..."
              className="h-[400px] font-mono"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center h-8">
              <label className="text-sm font-medium">Output</label>
              <div>
                {output && (
                  <Button
                    onClick={copyToClipboard}
                    variant={isCopied ? "outline" : "ghost"}
                    className="cursor-pointer w-full"
                    disabled={isCopied}
                  >
                    {isCopied ? (
                      <>
                        <Check className="h-4 w-4 mr-1 flex-shrink-0" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-1 flex-shrink-0" />
                        Copy
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
            <Textarea
              value={output}
              readOnly
              className="h-[400px] font-mono bg-muted"
              aria-label="Output"
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
