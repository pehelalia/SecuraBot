/**
 * Simple audit log stored in localStorage under key `requestLogs`.
 *
 * Entries may originate from page interactions like request creation or
 * login failures.  The original LogsPage implementation hard-coded logic
 * for augmenting storage; this module centralizes helpers so other parts
 * of the application can record events consistently.
 */

export interface LogEntry {
  id: string;
  type: string; // e.g. 'sent','approved','denied','failed_login','lockout', etc.
  requestId?: string;
  actor?: string;
  timestamp: string;
  message?: string;
  anomalies?: {
    outsideBusinessHours: boolean;
    frequencyAnomaly: boolean;
    requestCountLastHour: number;
  };
}

function makeId() {
  return Math.random().toString(36).slice(2, 9);
}

const STORAGE_KEY = 'requestLogs';

export function getLogs(): LogEntry[] {
  const json = localStorage.getItem(STORAGE_KEY);
  return json ? JSON.parse(json) : [];
}

export function addLog(entry: Omit<Partial<LogEntry>, 'id' | 'timestamp'> & { type: string }) {
  const logs = getLogs();
  const newEntry: LogEntry = {
    id: makeId(),
    timestamp: new Date().toISOString(),
    ...entry,
  } as LogEntry;
  logs.unshift(newEntry);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
  return newEntry;
}
