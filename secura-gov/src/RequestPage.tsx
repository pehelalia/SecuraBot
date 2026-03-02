import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { checkAnomalies, formatAnomalyWarnings } from './anomalyUtils';
import { addLog } from './logUtils';

function makeId() {
  return Math.random().toString(36).slice(2, 9);
}

export default function RequestPage() {
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId') || '';
  const [resource, setResource] = useState('');
  const [reason, setReason] = useState('');
  const [accessLevel, setAccessLevel] = useState('read');
  const [submitted, setSubmitted] = useState(false);
  const [anomalies, setAnomalies] = useState<ReturnType<typeof checkAnomalies> | null>(null);
  const [acknowledged, setAcknowledged] = useState(false);
  const [loading, setLoading] = useState(false);

  const resources = [
    'Production Database',
    'Admin Dashboard',
    'Git Repository',
    'CI/CD Pipeline',
    'Email Service',
    'HR System',
    'Production Server',
  ];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    // Check for anomalies
    const checks = checkAnomalies(userId);
    setAnomalies(checks);

    // If anomalies found, show warning and wait for acknowledgment
    if (checks.outsideBusinessHours || checks.frequencyAnomaly) {
      setLoading(false);
      return; // Don't submit yet, let user acknowledge
    }

    // No anomalies, proceed
    submitRequest(checks);
  }

  function submitRequest(checks: ReturnType<typeof checkAnomalies>) {
    const requestId = 'REQ-' + makeId().toUpperCase();
    
    addLog({
      type: 'sent',
      requestId,
      actor: userId,
      message: `${accessLevel} access to ${resource}`,
      anomalies: checks.outsideBusinessHours || checks.frequencyAnomaly ? checks : undefined,
    });

    setSubmitted(true);
    setLoading(false);
    setResource('');
    setReason('');
    setAccessLevel('read');
    setAnomalies(null);
    setAcknowledged(false);

    // Redirect after 3 seconds
    setTimeout(() => {
      navigate('/');
    }, 3000);
  }

  if (submitted) {
    return (
      <div className="container py-4">
        <div className="alert alert-success" role="alert">
          <h4 className="alert-heading">Request Submitted!</h4>
          <p>Your request has been submitted and will be reviewed by approvers.</p>
          <small>Redirecting to dashboard...</small>
        </div>
      </div>
    );
  }

  const warnings = anomalies ? formatAnomalyWarnings(anomalies) : [];

  return (
    <div className="container py-4">
      <h2 className="mb-4">New Resource Access Request</h2>

      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-lg-8">
            <div className="card">
              <div className="card-body">
                <div className="mb-3">
                  <label htmlFor="resource" className="form-label">
                    Resource
                  </label>
                  <select
                    id="resource"
                    className="form-select"
                    value={resource}
                    onChange={(e) => setResource(e.target.value)}
                    required
                  >
                    <option value="">-- Select a resource --</option>
                    {resources.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label htmlFor="accessLevel" className="form-label">
                    Access Level
                  </label>
                  <select
                    id="accessLevel"
                    className="form-select"
                    value={accessLevel}
                    onChange={(e) => setAccessLevel(e.target.value)}
                  >
                    <option value="read">Read Only</option>
                    <option value="write">Write</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label htmlFor="reason" className="form-label">
                    Business Reason
                  </label>
                  <textarea
                    id="reason"
                    className="form-control"
                    rows={4}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Explain why you need access to this resource"
                    required
                  />
                </div>

                {/* Anomaly warnings */}
                {warnings.length > 0 && (
                  <div className="mb-3">
                    <div className="alert alert-warning">
                      <strong>Anomaly Detection Flags:</strong>
                      <ul className="mb-0 mt-2">
                        {warnings.map((w, i) => (
                          <li key={i}>{w}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="acknowledge"
                        checked={acknowledged}
                        onChange={(e) => setAcknowledged(e.target.checked)}
                      />
                      <label className="form-check-label" htmlFor="acknowledge">
                        I acknowledge these anomalies and wish to proceed
                      </label>
                    </div>
                  </div>
                )}

                <div className="d-flex gap-2">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading || (warnings.length > 0 && !acknowledged)}
                  >
                    {loading ? 'Submitting...' : 'Submit Request'}
                  </button>
                  <Link to="/" className="btn btn-secondary">
                    Cancel
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="card bg-light">
              <div className="card-body">
                <h6 className="card-title">Information</h6>
                <p className="small text-muted">
                  Requests are subject to approval by authorized administrators. All requests are logged and
                  monitored for security purposes.
                </p>
                <hr />
                <h6 className="card-title">Anomaly Detection</h6>
                <p className="small text-muted">
                  The system automatically checks for unusual patterns:
                </p>
                <ul className="small text-muted ps-3">
                  <li>Requests outside business hours</li>
                  <li>High request frequency (5+ in 1 hour)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
