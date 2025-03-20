import { Code, FileJson, FileText, FileCode, Palette } from "lucide-react";

export const TOOLS = [
  {
    name: "JSON Formatter",
    href: "/tools/json-formatter",
    description: "Format and validate JSON data",
    icon: FileJson,
  },
  {
    name: "Base64 Encoder",
    href: "/tools/base64",
    description: "Encode and decode Base64 strings",
    icon: FileCode,
  },
  {
    name: "URL Encoder",
    href: "/tools/url-encoder",
    description: "Encode and decode URL parameters",
    icon: Code,
  },
  {
    name: "Color Picker",
    href: "/tools/color-picker",
    description: "Pick and convert colors between formats",
    icon: Palette,
  },
  {
    name: "Markdown Editor",
    href: "/tools/markdown",
    description: "Edit and preview Markdown content",
    icon: FileText,
  },
];
