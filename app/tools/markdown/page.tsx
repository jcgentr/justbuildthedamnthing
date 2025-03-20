"use client";

import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";

export default function MarkdownEditor() {
  const [markdown, setMarkdown] = useState(`# Welcome to the Markdown Editor

This is a live preview of your Markdown.

## Features

- **Bold** and *italic* text
- [Links](https://justbuildthings.com)
- Lists:
  1. Ordered
  2. Unordered

\`\`\`
Code blocks
\`\`\`

> Blockquotes

Enjoy writing!`);
  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(markdown);
      setIsCopied(true);
      toast.success("Markdown copied to clipboard");
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error: unknown) {
      console.error("Failed to copy markdown:", error);
      toast.error("Failed to copy markdown");
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="space-y-4">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">Markdown Editor</h1>
          <p className="text-muted-foreground text-lg">
            Edit and preview Markdown content in real-time
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4 flex flex-col">
          <div className="flex items-center justify-between h-9">
            <label className="text-sm font-medium">Editor</label>
            <span className="text-xs text-muted-foreground">
              {markdown.length} characters
            </span>
          </div>
          <Textarea
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            placeholder="Write your markdown here..."
            className="h-[600px] font-mono text-sm resize-none flex-1"
          />
        </div>

        <div className="space-y-4 flex flex-col">
          <div className="flex items-center justify-between h-9">
            <label className="text-sm font-medium">Preview</label>
            <Button
              variant="outline"
              size="sm"
              onClick={copyToClipboard}
              disabled={isCopied}
              className="flex items-center gap-2 transition-all duration-200 cursor-pointer"
            >
              {isCopied ? (
                <>
                  <Check className="h-4 w-4" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy Markdown
                </>
              )}
            </Button>
          </div>
          <div className="h-[600px] p-6 rounded-lg border bg-card overflow-auto flex-1">
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <ReactMarkdown
                components={{
                  h1: ({ children }) => (
                    <h1 className="text-4xl font-bold mb-4">{children}</h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-3xl font-semibold mb-3">{children}</h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-2xl font-semibold mb-2">{children}</h3>
                  ),
                  p: ({ children }) => (
                    <p className="mb-4 leading-relaxed">{children}</p>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc pl-6 mb-4">{children}</ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal pl-6 mb-4">{children}</ol>
                  ),
                  li: ({ children }) => <li className="mb-1">{children}</li>,
                  code: ({ children }) => (
                    <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">
                      {children}
                    </code>
                  ),
                  pre: ({ children }) => (
                    <pre className="bg-muted p-4 rounded-lg mb-4 overflow-x-auto">
                      {children}
                    </pre>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-muted pl-4 italic mb-4">
                      {children}
                    </blockquote>
                  ),
                }}
              >
                {markdown}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
