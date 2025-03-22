import { NextRequest, NextResponse } from "next/server";
import { load } from "cheerio";

type TranscriptSegment = {
  text: string;
  start: number;
  duration: number;
};

// YouTube API response types
interface YouTubePlayerResponse {
  captions?: {
    playerCaptionsTracklistRenderer?: {
      captionTracks?: Array<{
        baseUrl: string;
        name?: {
          simpleText?: string;
        };
        languageCode?: string;
      }>;
    };
  };
}

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    const { videoUrl } = body;

    // Validate videoUrl
    if (!videoUrl || typeof videoUrl !== "string") {
      return NextResponse.json(
        { error: "Valid YouTube video URL is required" },
        { status: 400 }
      );
    }

    // Extract the video ID from the URL
    const videoId = extractVideoId(videoUrl);

    if (!videoId) {
      return NextResponse.json(
        { error: "Could not extract video ID from the provided URL" },
        { status: 400 }
      );
    }

    // Fetch transcript
    const transcript = await getYoutubeTranscript(videoId);

    // Return transcript data
    return NextResponse.json({ transcript });
  } catch (error) {
    console.error("Error fetching transcript:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch transcript",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

function extractVideoId(url: string): string | null {
  // Handle various YouTube URL formats
  const regexPatterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/]+)/,
    /youtube\.com\/embed\/([^/?]+)/,
    /youtube\.com\/v\/([^/?]+)/,
  ];

  for (const pattern of regexPatterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

async function getYoutubeTranscript(
  videoId: string
): Promise<TranscriptSegment[]> {
  try {
    // Step 1: Get the video page to extract the transcript data
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const response = await fetch(videoUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
        Referer: "https://www.youtube.com/",
        Origin: "https://www.youtube.com",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch video page: ${response.status}`);
    }

    const data = await response.text();

    // Step 2: Parse the page using cheerio
    const $ = load(data);
    // Step 3: Find the script tag containing the ytInitialPlayerResponse
    let playerResponse: YouTubePlayerResponse | null = null;

    $("script").each((_, script) => {
      const content = $(script).html() || "";
      if (content.includes("ytInitialPlayerResponse")) {
        // Extract the JSON data from the script
        const match = content.match(/ytInitialPlayerResponse\s*=\s*({.+?});/);
        if (match && match[1]) {
          try {
            playerResponse = JSON.parse(match[1]) as YouTubePlayerResponse;
          } catch {
            // Continue to next script tag if parsing fails
          }
        }
      }
    });

    if (!playerResponse) {
      throw new Error("Could not find player response data");
    }

    // Ensure TypeScript recognizes the correct type
    const typedResponse = playerResponse as YouTubePlayerResponse;

    // Step 4: Extract transcript data from the player response
    const transcriptData =
      typedResponse?.captions?.playerCaptionsTracklistRenderer
        ?.captionTracks?.[0];

    if (!transcriptData || !transcriptData.baseUrl) {
      throw new Error("No transcript available for this video");
    }

    // Step 5: Fetch the transcript XML
    const transcriptResponse = await fetch(transcriptData.baseUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
        Referer: videoUrl,
        Origin: "https://www.youtube.com",
      },
      cache: "no-store",
    });

    if (!transcriptResponse.ok) {
      throw new Error(
        `Failed to fetch transcript: ${transcriptResponse.status}`
      );
    }

    const transcriptXml = await transcriptResponse.text();

    // Step 6: Parse the XML to extract transcript segments
    const $xml = load(transcriptXml, { xmlMode: true });

    const segments: TranscriptSegment[] = [];

    $xml("text").each((_, element) => {
      const text = $xml(element).text();
      const start = parseFloat($xml(element).attr("start") || "0");
      const duration = parseFloat($xml(element).attr("dur") || "0");

      segments.push({
        text,
        start,
        duration,
      });
    });

    return segments;
  } catch (error) {
    console.error("Error in getYoutubeTranscript:", error);
    throw error;
  }
}
