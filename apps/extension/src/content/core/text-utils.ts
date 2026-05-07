const whitespacePattern = /\s+/g;

export function normalizeText(value: string | null | undefined): string {
  return (value ?? '').replace(whitespacePattern, ' ').trim();
}

export function tokenizeText(value: string): string[] {
  return normalizeText(value)
    .toLowerCase()
    .split(/[^a-z0-9]+/g)
    .filter(Boolean);
}

export function uniqueText(values: string[]): string[] {
  return Array.from(new Set(values.map((value) => normalizeText(value)).filter(Boolean)));
}

export function fuzzyContains(source: string, candidates: string[]): boolean {
  const normalizedSource = normalizeText(source).toLowerCase();
  return candidates.some((candidate) => normalizedSource.includes(normalizeText(candidate).toLowerCase()));
}

export function scoreTextMatch(source: string, candidates: string[]): number {
  const sourceTokens = tokenizeText(source);
  if (sourceTokens.length === 0) {
    return 0;
  }

  let bestScore = 0;
  for (const candidate of candidates) {
    const candidateTokens = tokenizeText(candidate);
    if (candidateTokens.length === 0) {
      continue;
    }

    const overlap = candidateTokens.filter((token) => sourceTokens.includes(token)).length;
    const score = overlap / Math.max(sourceTokens.length, candidateTokens.length);
    if (score > bestScore) {
      bestScore = score;
    }
  }

  return bestScore;
}
