import { useParams, useNavigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getLogs, addLog, type LogEntry } from './logUtils';
import { calculateRiskLevel } from './riskUtils';

export default function RequestDetailPage() {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId') || '';
  const [request, setRequest] = useState<LogEntry | null>(null);
  const [risk, setRisk] = useState<{level:string;color:string;description:string} | null>(null);
  const [loading, setLoading] = useState(false);
  const [action, setAction] = useState<'approve' | 'deny' | null>(null);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    // Find the request in logs
    const logs = getLogs();
    const found = logs.find((log) => log.requestId === requestId && log.type === 'sent');
    setRequest(found || null);
    if (found) {
      setRisk(calculateRiskLevel(found));
    }
  }, [requestId]);

  function handleApprove() {
    if (!request) return;
    setLoading(true);
    setAction('approve');

    // Log the approval
    addLog({
      type: 'approved',
      requestId: request.requestId,
      actor: userId,
      message: feedback || 'Approved',
    });

    // Redirect after 2 seconds
    setTimeout(() => {
      navigate('/approve');
    }, 2000);
  }

  function handleDeny() {
    if (!request) return;
    setLoading(true);
    setAction('deny');

    // Log the denial
    addLog({
      type: 'denied',
      requestId: request.requestId,
      actor: userId,
      message: feedback || 'Denied',
    });

    // Redirect after 2 seconds
    setTimeout(() => {
      navigate('/approve');
    }, 2000);
  }

  if (!request) {
    return (
      <div className="container py-4">
        <div className="alert alert-warning">
          Request not found. <Link to="/approve">Back to approvals</Link>
        </div>
      </div>
    );
  }

  if (action) {
    return (
      <div className="container py-4">
        <div className={`alert ${action === 'approve' ? 'alert-success' : 'alert-danger'}`}>
          <h4 className="alert-heading">
            {action === 'approve' ? 'Request Approved!' : 'Request Denied!'}
          </h4>
          <p>The decision has been recorded. Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Request Details</h2>
        <Link to="/approve" className="btn btn-secondary">
          Back to Queue
        </Link>
      </div>

      <div className="row">
        <div className="col-lg-8">
          <div className="card mb-3">
            <div className="card-header">
              <h5 className="mb-0 text-white">{request.requestId}</h5>
            </div>
            <div className="card-body text-white">
              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="text-muted small">Requested By</label>
                  <p className="fw-bold">{request.actor}</p>
                </div>
                <div className="col-md-6">
                  <label className="text-muted small">Date Submitted</label>
                  <p className="fw-bold">{new Date(request.timestamp).toLocaleString()}</p>
                </div>
              </div>

              <div className="mb-3">
                <label className="text-muted small">Request Details</label>
                <p className="fw-bold">{request.message}</p>
              </div>

              {request.anomalies && (
                <div className="alert alert-warning">
                  <strong>Anomalies Detected:</strong>
                  <ul className="mb-0 mt-2">
                    {request.anomalies.outsideBusinessHours && (
                      <li>🌙 Request made outside business hours</li>
                    )}
                    {request.anomalies.frequencyAnomaly && (
                      <li>⚡ High frequency ({request.anomalies.requestCountLastHour} requests in last hour)</li>
                    )}
                  </ul>
                </div>
              )}

              {/* risk level badge */}
              {risk && (
                <div className="mb-3">
                  <label className="text-muted small">Risk Level</label>
                  <div>
                    <span
                      className="badge"
                      style={{ backgroundColor: risk.color, color: 'white' }}
                      title={risk.description}
                    >
                      {risk.level.charAt(0).toUpperCase() + risk.level.slice(1)}
                    </span>
                    <small className="ms-2 text-muted">{risk.description}</small>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Decision</h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label htmlFor="feedback" className="form-label">
                  Feedback / Notes
                </label>
                <textarea
                  id="feedback"
                  className="form-control"
                  rows={4}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Add optional notes for the requestor"
                  disabled={loading}
                />
              </div>

              <div className="d-flex gap-2">
                <button
                  className="btn btn-success"
                  onClick={handleApprove}
                  disabled={loading}
                >
                  {loading && action === 'approve' ? 'Processing...' : '✓ Approve'}
                </button>
                <button
                  className="btn btn-danger"
                  onClick={handleDeny}
                  disabled={loading}
                >
                  {loading && action === 'deny' ? 'Processing...' : '✗ Deny'}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card bg-light">
            <div className="card-body">
              <h6 className="card-title">Information</h6>
              <p className="small text-muted">
                Review the request details and any detected anomalies, then approve or deny the
                request. Your decision will be recorded in the audit log.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
