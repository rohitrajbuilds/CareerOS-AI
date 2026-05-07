import type { AiGenerationRequest, AiStreamEvent } from '@careeros/shared-types';
import { getRuntimeConfig } from '@careeros/shared-config';

function parseSseEvents(buffer: string): { events: AiStreamEvent[]; remainder: string } {
  const segments = buffer.split('\n\n');
  const remainder = segments.pop() ?? '';
  const events: AiStreamEvent[] = [];

  for (const segment of segments) {
    const lines = segment.split('\n');
    const dataLine = lines.find((line) => line.startsWith('data: '));
    if (!dataLine) {
      continue;
    }

    try {
      events.push(JSON.parse(dataLine.slice(6)) as AiStreamEvent);
    } catch {
      continue;
    }
  }

  return { events, remainder };
}

export async function streamAiResponse(
  request: AiGenerationRequest,
  handlers: {
    onEvent: (event: AiStreamEvent) => void;
    signal?: AbortSignal;
  },
): Promise<void> {
  const { apiBaseUrl } = getRuntimeConfig();
  const response = await fetch(`${apiBaseUrl}/ai/generate/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
    signal: handlers.signal,
  });

  if (!response.ok || !response.body) {
    throw new Error(`AI stream request failed: ${response.status} ${response.statusText}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const parsed = parseSseEvents(buffer);
      buffer = parsed.remainder;
      parsed.events.forEach(handlers.onEvent);
    }

    const finalChunk = decoder.decode();
    if (finalChunk) {
      buffer += finalChunk;
    }

    const parsed = parseSseEvents(`${buffer}\n\n`);
    parsed.events.forEach(handlers.onEvent);
  } finally {
    await reader.cancel().catch(() => undefined);
  }
}
