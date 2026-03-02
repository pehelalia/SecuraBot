/**
 * Anomaly detection for resource access requests.
 *
 * Checks:
 * - Requests outside business hours (9 AM - 5 PM, weekdays only)
 * - 5+ requests from same user in a 1-hour window
 */

import { getLogs } from './logUtils';

const BUSINESS_HOUR_START = 9; // 9 AM
const BUSINESS_HOUR_END = 17; // 5 PM

/**
 * Check if a time is within business hours (Mon-Fri, 9 AM - 5 PM)
 */
export function isOutsideBusinessHours(date: Date = new Date()): boolean {
  const day = date.getDay(); // 0=Sunday, 6=Saturday
  const hour = date.getHours();

  // Not a weekday (Sat/Sun)
  if (day === 0 || day === 6) return true;

  // Outside business hours
  if (hour < BUSINESS_HOUR_START || hour >= BUSINESS_HOUR_END) return true;

  return false;
}

/**
 * Count requests by a given user/actor in the past hour
 */
export function getRequestCountInLastHour(actor: string): number {
  const logs = getLogs();
  const oneHourAgo = Date.now() - 1000 * 60 * 60;

  return logs.filter((log) => {
    const logTime = new Date(log.timestamp).getTime();
    return (
      log.actor === actor &&
      log.type === 'sent' &&
      logTime > oneHourAgo
    );
  }).length;
}

export interface AnomalyCheck {
  outsideBusinessHours: boolean;
  frequencyAnomaly: boolean;
  requestCountLastHour: number;
}

/**
 * Perform anomaly checks on a potential request
 */
export function checkAnomalies(actor: string): AnomalyCheck {
  return {
    outsideBusinessHours: isOutsideBusinessHours(),
    frequencyAnomaly: getRequestCountInLastHour(actor) >= 5,
    requestCountLastHour: getRequestCountInLastHour(actor),
  };
}

/**
 * Format anomaly warnings for display
 */
export function formatAnomalyWarnings(anomalies: AnomalyCheck): string[] {
  const warnings: string[] = [];

  if (anomalies.outsideBusinessHours) {
    warnings.push('⚠️ Request made outside business hours (9 AM - 5 PM, weekdays only)');
  }

  if (anomalies.frequencyAnomaly) {
    warnings.push(`⚠️ High request frequency: ${anomalies.requestCountLastHour} requests in the last hour`);
  }

  return warnings;
}
