"use client";

import { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import {
  Loader2,
  ExternalLink,
  Copy,
  Check,
  Search,
  X,
  Play,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import React from "react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  TranscriptResponse,
  TranscriptSegment,
} from "@/types/youtube-transcript";

// Dynamically import ReactPlayer to avoid SSR issues
const ReactPlayer = dynamic(() => import("react-player/lazy"), {
  ssr: false,
  loading: () => (
    <div className="w-full aspect-video bg-muted animate-pulse rounded-md" />
  ),
});

// Define a type for the ReactPlayer instance
type ReactPlayerInstance = {
  seekTo: (seconds: number, type?: "seconds" | "fraction") => void;
};

export default function YouTubeTranscriptPage() {
  const [videoUrl, setVideoUrl] = useState("");
  const [transcript, setTranscript] = useState<TranscriptSegment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videoReady, setVideoReady] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [autoScroll, setAutoScroll] = useState(true);
  const playerRef = useRef<ReactPlayerInstance | null>(null);
  const transcriptContainerRef = useRef<HTMLDivElement>(null);
  const activeSegmentRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!videoUrl) {
      toast.error("Please enter a YouTube URL");
      return;
    }

    setLoading(true);
    setError(null);
    setTranscript([]);
    setVideoReady(false);

    try {
      const response = await fetch("/api/youtube-transcript", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ videoUrl }),
      });

      const data: TranscriptResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch transcript");
      }

      setTranscript(data.transcript);
      toast.success("Transcript loaded successfully");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred";
      console.log(errorMessage);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
      setVideoReady(true);
    }
  };

  const copyTranscriptToClipboard = async () => {
    try {
      // Create a temporary element to decode HTML entities
      const decodeHTML = (html: string): string => {
        const textArea = document.createElement("textarea");
        textArea.innerHTML = html;
        return textArea.value;
      };

      const fullText = transcript
        .map((item) => decodeHTML(item.text))
        .join(" ");

      await navigator.clipboard.writeText(fullText);
      setIsCopied(true);
      toast.success("Transcript copied to clipboard");
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy transcript:", error);
      toast.error("Failed to copy transcript");
    }
  };

  const filteredTranscript = transcript.filter((item) =>
    item.text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Highlight matching text in the search results
  const highlightText = (text: string, highlight: string) => {
    if (!highlight.trim()) return text;

    const regex = new RegExp(
      `(${highlight.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
      "gi"
    );
    return text.replace(regex, '<mark class="bg-yellow-200">$1</mark>');
  };

  const seekToTimestamp = (seconds: number) => {
    if (playerRef.current) {
      playerRef.current.seekTo(seconds, "seconds");
      toast.success(`Jumped to ${formatTime(seconds)}`);
    }
  };

  // Find the current active transcript segment based on video time
  const activeSegmentIndex = transcript.findIndex((item, index) => {
    const nextItem = transcript[index + 1];
    const segmentEnd = nextItem ? nextItem.start : item.start + item.duration;
    return currentTime >= item.start && currentTime < segmentEnd;
  });

  // Scroll active segment into view when it changes
  useEffect(() => {
    if (
      activeSegmentIndex !== -1 &&
      isPlaying &&
      transcriptContainerRef.current &&
      autoScroll
    ) {
      const activeElement = document.getElementById(
        `transcript-segment-${activeSegmentIndex}`
      );
      if (activeElement) {
        activeElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }
  }, [activeSegmentIndex, isPlaying, autoScroll]);

  const toggleAutoScroll = (value: boolean) => {
    setAutoScroll(value);

    // If enabling auto-scroll, immediately scroll to the active segment
    if (value && activeSegmentIndex !== -1) {
      const activeElement = document.getElementById(
        `transcript-segment-${activeSegmentIndex}`
      );
      if (activeElement) {
        activeElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="space-y-4">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">YouTube Transcript Extractor</h1>
          <p className="text-muted-foreground text-lg">
            Extract and view transcripts from YouTube videos
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Input
              type="text"
              placeholder="Enter YouTube URL (e.g., https://www.youtube.com/watch?v=dQw4w9WgXcQ)"
              value={videoUrl}
              onChange={(e) => {
                setVideoUrl(e.target.value);
                if (transcript.length > 0) {
                  setTranscript([]);
                  setSearchTerm("");
                  setError(null);
                }
              }}
              className="flex-1"
            />
            <Button type="submit" disabled={loading}>
              {loading ? (
                <span className="flex items-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading
                </span>
              ) : (
                "Extract Transcript"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {videoUrl && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="overflow-hidden">
            <CardHeader className="p-4">
              <CardTitle className="text-lg flex items-center">
                Video Player
                <a
                  href={videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 inline-flex items-center text-sm text-muted-foreground hover:text-primary"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="aspect-video w-full">
                <ReactPlayer
                  ref={playerRef}
                  url={videoUrl}
                  width="100%"
                  height="100%"
                  controls
                  playing={isPlaying}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onProgress={(state) => setCurrentTime(state.playedSeconds)}
                  onReady={() => setVideoReady(true)}
                  onError={(e) => {
                    console.error("Video player error:", e);
                    setError(
                      "Failed to load video. Please check the URL and try again."
                    );
                    setVideoReady(true);
                    toast.error("Failed to load video");
                  }}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="py-4 px-6 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-lg">Transcript</CardTitle>
              <div className="flex items-center gap-2">
                {transcript.length > 0 && (
                  <div className="flex items-center gap-2 mr-2">
                    <span className="text-xs text-muted-foreground">
                      Auto-scroll
                    </span>
                    <Switch
                      checked={autoScroll}
                      onCheckedChange={toggleAutoScroll}
                      aria-label="Toggle auto-scroll"
                      className="cursor-pointer"
                    />
                  </div>
                )}
                {transcript.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyTranscriptToClipboard}
                    disabled={isCopied}
                    className="flex items-center gap-2"
                  >
                    {isCopied ? (
                      <>
                        <Check className="h-4 w-4" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copy Text
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardHeader>
            {transcript.length > 0 && (
              <div className="px-6 py-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search transcript..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                  {searchTerm && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1 h-7 w-7 p-0"
                      onClick={() => setSearchTerm("")}
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Clear search</span>
                    </Button>
                  )}
                </div>
                {searchTerm && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {filteredTranscript.length} result(s) found
                  </p>
                )}
              </div>
            )}
            <CardContent className="p-0">
              <div
                className="max-h-[600px] overflow-y-auto"
                ref={transcriptContainerRef}
              >
                {loading ? (
                  <div className="flex justify-center items-center h-32">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : transcript.length > 0 ? (
                  <div className="space-y-0">
                    {(searchTerm ? filteredTranscript : transcript).map(
                      (item, index) => {
                        const isActive =
                          activeSegmentIndex === index && !searchTerm;

                        return (
                          <div
                            id={`transcript-segment-${index}`}
                            key={index}
                            className={`p-4 hover:bg-muted border-b last:border-0 transition-colors duration-150 cursor-pointer group ${
                              isActive
                                ? "bg-primary/10 border-l-4 border-l-primary"
                                : ""
                            }`}
                            onClick={() => seekToTimestamp(item.start)}
                            ref={isActive ? activeSegmentRef : null}
                          >
                            <div className="flex items-start">
                              <div className="flex-1">
                                <p
                                  className="mb-1"
                                  dangerouslySetInnerHTML={{
                                    __html: searchTerm
                                      ? highlightText(item.text, searchTerm)
                                      : item.text,
                                  }}
                                />
                                <p className="text-xs text-muted-foreground flex items-center">
                                  <Clock className="h-3 w-3 mr-1 inline" />
                                  {formatTime(item.start)} —{" "}
                                  {formatTime(item.start + item.duration)}
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 p-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  seekToTimestamp(item.start);
                                }}
                              >
                                <Play className="h-3.5 w-3.5" />
                                <span className="sr-only">
                                  Play from this point
                                </span>
                              </Button>
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                ) : videoReady && !loading ? (
                  <div className="text-center text-muted-foreground py-12 px-6">
                    {error ? (
                      <div className="text-destructive">
                        <p className="font-medium mb-2">Error:</p>
                        <p>{error}</p>
                        <Button
                          onClick={handleSubmit}
                          size="sm"
                          className="mt-4"
                          variant="outline"
                        >
                          Try Again
                        </Button>
                      </div>
                    ) : (
                      <>
                        <p className="mb-4">
                          Click &quot;Extract Transcript&quot; to load the
                          transcript.
                        </p>
                        <Button
                          onClick={handleSubmit}
                          size="sm"
                          className="mb-4"
                        >
                          Extract Transcript
                        </Button>
                        <p className="text-sm">
                          Note: Transcripts are only available for videos with
                          captions enabled.
                        </p>
                      </>
                    )}
                  </div>
                ) : null}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="bg-card">
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            This tool extracts the closed captions (transcript) from YouTube
            videos, allowing you to read along with the content.
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Paste any YouTube video URL in the input field above</li>
            <li>Click the &quot;Extract Transcript&quot; button</li>
            <li>View the video alongside its transcript</li>
          </ul>
          <p className="text-sm text-muted-foreground">
            Note: Transcripts will only be available for videos that have
            captions enabled by the creator.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper function to format time in MM:SS format
function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}
