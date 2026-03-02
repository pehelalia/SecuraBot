import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getLogs } from './logUtils';
import { calculateRiskLevel } from './riskUtils';

export default function ApprovePage() {
  const navigate = useNavigate();
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);

  useEffect(() => {
    // Get all 'sent' requests that haven't been approved/denied yet
    const logs = getLogs();
    const sent = logs.filter((log) => log.type === 'sent');
    const approved = logs
      .filter((log) => log.type === 'approved')
      .map((log) => log.requestId);
    const denied = logs
      .filter((log) => log.type === 'denied')
      .map((log) => log.requestId);

    // Show only pending requests (not yet approved/denied)
    const pending = sent.filter(
      (req) => !approved.includes(req.requestId) && !denied.includes(req.requestId)
    );

    setPendingRequests(pending);
  }, []);

  if (pendingRequests.length === 0) {
    return (
      <div className="container py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>Pending Approvals</h2>
          <Link to="/" className="btn btn-secondary">
            Back to Dashboard
          </Link>
        </div>
        <div className="alert alert-info">No pending requests to review.</div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Pending Approvals ({pendingRequests.length})</h2>
        <Link to="/" className="btn btn-secondary">
          Back to Dashboard
        </Link>
      </div>

      <div className="row">
        {pendingRequests.map((req) => {
          const risk = calculateRiskLevel(req);
          return (
            <div key={req.id} className="col-lg-6 mb-3">
              <div className="card">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <h6 className="card-title mb-1">{req.requestId}</h6>
                      <small className="text-muted">From: {req.actor}</small>
                    </div>
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
                  </div>

                  <p className="card-text mb-2">{req.message}</p>

                  <small className="text-muted">
                    {new Date(req.timestamp).toLocaleString()}
                  </small>

                  {req.anomalies && (
                    <div className="mt-2">
                      <small className="text-warning">
                        {req.anomalies.outsideBusinessHours && '🌙 Off-hours '}
                        {req.anomalies.frequencyAnomaly && '⚡ High frequency'}
                      </small>
                    </div>
                  )}

                  <button
                    className="btn btn-primary btn-sm mt-3"
                    onClick={() => navigate(`/request/${req.requestId}`)}
                  >
                    Review & Decide
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
