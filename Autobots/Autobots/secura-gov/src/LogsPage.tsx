import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRole } from './roleUtils';
import type { LogEntry } from './logUtils';
import { getLogs, addLog } from './logUtils';
import { calculateRiskLevel } from './riskUtils';

// We keep the more specific type alias for the entries this page shows
// but logUtils supports arbitrary string types including 'failed_login'.

function makeId() {
  return Math.random().toString(36).slice(2, 9);
}

export default function LogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const navigate = useNavigate();
  const role = getRole();

  // create some automatic logs when managers/admins open this page
  useEffect(() => {
    const allowed = ['manager', 'security_admin', 'platform_admin'];
    if (!allowed.includes(role)) return;

    // for demo we add a few sample entries using addLog helper
    addLog({ type: 'sent', requestId: 'REQ-' + makeId().toUpperCase(), actor: 'system' });
    addLog({ type: 'approved', requestId: 'REQ-' + makeId().toUpperCase(), actor: 'manager' });
    addLog({ type: 'denied', requestId: 'REQ-' + makeId().toUpperCase(), actor: 'approver' });

    // reload into state
    setLogs(getLogs());
  }, [role]);

  useEffect(() => {
    // load logs (in case page opened again or after additions elsewhere)
    setLogs(getLogs());
  }, []);

  return (
    <div id="logs-report" className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Request Logs</h2>
        <div>
          <button className="btn btn-secondary me-2" onClick={() => {
            import('./pdfUtils').then(({ exportById }) => exportById('logs-report', 'logs.pdf')).catch(console.error);
          }}>
            Download PDF
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/') }>
            Return to Dashboard
          </button>
        </div>
      </div>
      <p className="text-muted">Audit trail of various events (requests, failed logins, etc.).</p>

      <div className="card">
        <div className="card-body">
          <table className="table table-sm table-striped">
            <thead>
              <tr>
                <th>Time</th>
                <th>Type</th>
                <th>Request ID</th>
                <th>Actor</th>
                <th>Message</th>
                <th>Risk Level</th>
                <th>Flags</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => {
                const risk = calculateRiskLevel(l);
                const anomalyFlags = l.anomalies ? [
                  l.anomalies.outsideBusinessHours && '🌙 Off-hours',
                  l.anomalies.frequencyAnomaly && '⚡ High frequency',
                ].filter(Boolean) : [];

                return (
                  <tr key={l.id}>
                    <td>{new Date(l.timestamp).toLocaleString()}</td>
                    <td className="text-capitalize">{l.type.replace(/_/g, ' ')}</td>
                    <td>
                      {l.requestId ? (
                        l.type === 'sent' ? (
                          <button
                            className="btn btn-link p-0"
                            style={{ textDecoration: 'none' }}
                            onClick={() => navigate(`/request/${l.requestId}`)}
                          >
                            {l.requestId}
                          </button>
                        ) : (
                          l.requestId
                        )
                      ) : (
                        '-'
                      )}
                    </td>
                    <td>{l.actor || 'system'}</td>
                    <td>{l.message || ''}</td>
                    <td>
                      <span
                        className="badge"
                        style={{
                          backgroundColor: risk.color,
                          color: 'white',
                        }}
                        title={risk.description}
                      >
                        {risk.level.charAt(0).toUpperCase() + risk.level.slice(1)}
                      </span>
                    </td>
                    <td>{anomalyFlags.length > 0 ? anomalyFlags.join(', ') : '-'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
