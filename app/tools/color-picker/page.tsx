"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";

export default function ColorPicker() {
  const [color, setColor] = useState("#000000");
  const [hex, setHex] = useState("#000000");
  const [rgb, setRgb] = useState("rgb(0, 0, 0)");
  const [hsl, setHsl] = useState("hsl(0, 0%, 0%)");
  const [copied, setCopied] = useState<string | null>(null);
  const [disabledFormat, setDisabledFormat] = useState<string | null>(null);

  const updateColors = (newColor: string) => {
    setColor(newColor);
    setHex(newColor);

    // Convert hex to RGB
    const r = parseInt(newColor.slice(1, 3), 16);
    const g = parseInt(newColor.slice(3, 5), 16);
    const b = parseInt(newColor.slice(5, 7), 16);
    setRgb(`rgb(${r}, ${g}, ${b})`);

    // Convert RGB to HSL
    const r1 = r / 255;
    const g1 = g / 255;
    const b1 = b / 255;

    const max = Math.max(r1, g1, b1);
    const min = Math.min(r1, g1, b1);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r1:
          h = (g1 - b1) / d + (g1 < b1 ? 6 : 0);
          break;
        case g1:
          h = (b1 - r1) / d + 2;
          break;
        case b1:
          h = (r1 - g1) / d + 4;
          break;
      }

      h /= 6;
    }

    setHsl(
      `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(
        l * 100
      )}%)`
    );
  };

  const copyToClipboard = async (text: string, format: string) => {
    try {
      setDisabledFormat(format);
      await navigator.clipboard.writeText(text);
      setCopied(format);
      toast.success("Copied to clipboard");
      setTimeout(() => {
        setCopied(null);
        setDisabledFormat(null);
      }, 2000);
    } catch {
      toast.error("Failed to copy");
      setDisabledFormat(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold">Color Picker</h1>
        <p className="text-muted-foreground text-lg">
          Pick and convert colors between formats
        </p>
      </div>

      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <div
            className="w-20 h-20 rounded-lg border"
            style={{ backgroundColor: color }}
          />
          <Input
            type="color"
            value={color}
            onChange={(e) => updateColors(e.target.value)}
            className="w-32 h-12 cursor-pointer"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">HEX</label>
            <div className="flex gap-2">
              <Input value={hex} readOnly className="font-mono" />
              <Button
                variant="default"
                size="icon"
                onClick={() => copyToClipboard(hex, "hex")}
                className="cursor-pointer"
                disabled={disabledFormat === "hex"}
              >
                {copied === "hex" ? (
                  <Check className="h-4 w-4" data-testid="check-icon" />
                ) : (
                  <Copy className="h-4 w-4" data-testid="copy-icon" />
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">RGB</label>
            <div className="flex gap-2">
              <Input value={rgb} readOnly className="font-mono" />
              <Button
                variant="default"
                size="icon"
                onClick={() => copyToClipboard(rgb, "rgb")}
                className="cursor-pointer"
                disabled={disabledFormat === "rgb"}
              >
                {copied === "rgb" ? (
                  <Check className="h-4 w-4" data-testid="check-icon" />
                ) : (
                  <Copy className="h-4 w-4" data-testid="copy-icon" />
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">HSL</label>
            <div className="flex gap-2">
              <Input value={hsl} readOnly className="font-mono" />
              <Button
                variant="default"
                size="icon"
                onClick={() => copyToClipboard(hsl, "hsl")}
                className="cursor-pointer"
                disabled={disabledFormat === "hsl"}
              >
                {copied === "hsl" ? (
                  <Check className="h-4 w-4" data-testid="check-icon" />
                ) : (
                  <Copy className="h-4 w-4" data-testid="copy-icon" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
