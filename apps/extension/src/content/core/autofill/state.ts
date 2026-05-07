import type { UndoSnapshot } from './types';

let undoStack: UndoSnapshot[] = [];

export function pushUndoSnapshot(snapshot: UndoSnapshot): void {
  undoStack.push(snapshot);
}

export function clearUndoStack(): void {
  undoStack = [];
}

export function getUndoStack(): UndoSnapshot[] {
  return [...undoStack];
}
