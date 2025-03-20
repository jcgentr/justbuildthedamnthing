export type TranscriptSegment = {
  text: string;
  start: number;
  duration: number;
};

export type TranscriptResponse = {
  transcript: TranscriptSegment[];
  error?: string;
};
