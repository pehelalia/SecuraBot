/**
 * Risk assessment for audit log entries.
 */

import type { LogEntry } from './logUtils';

export type RiskLevel = 'low' | 'moderate' | 'high';

export interface RiskAssessment {
  level: RiskLevel;
  color: string;
  description: string;
}

export function calculateRiskLevel(log: LogEntry): RiskAssessment {
  // High risk events
  if (log.type === 'failed_login' || log.type === 'lockout') {
    return {
      level: 'high',
      color: '#dc3545', // red
      description: 'Security event',
    };
  }

  // Assess request-based risk
  if (log.type === 'sent') {
    const anomalies = log.anomalies;

    // No anomalies = low risk
    if (!anomalies || (!anomalies.outsideBusinessHours && !anomalies.frequencyAnomaly)) {
      return {
        level: 'low',
        color: '#28a745', // green
        description: 'Normal request',
      };
    }

    // Both anomalies = high risk
    if (anomalies.outsideBusinessHours && anomalies.frequencyAnomaly) {
      return {
        level: 'high',
        color: '#dc3545', // red
        description: 'Multiple anomalies detected',
      };
    }

    // One anomaly = moderate risk
    return {
      level: 'moderate',
      color: '#fd7e14', // orange
      description: 'Anomaly detected',
    };
  }

  // Other log types (approved, denied, etc.) = low risk
  return {
    level: 'low',
    color: '#28a745', // green
    description: 'Standard event',
  };
}
