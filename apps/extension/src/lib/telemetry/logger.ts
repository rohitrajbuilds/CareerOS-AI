export function logInfo(message: string, context?: Record<string, unknown>): void {
  console.info(`[CareerOS AI] ${message}`, context ?? {});
}

export function logWarn(message: string, context?: Record<string, unknown>): void {
  console.warn(`[CareerOS AI] ${message}`, context ?? {});
}

export function logError(message: string, context?: Record<string, unknown>): void {
  console.error(`[CareerOS AI] ${message}`, context ?? {});
}
